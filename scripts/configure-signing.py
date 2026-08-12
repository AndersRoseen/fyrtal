"""Kopplar in uppladdningsnyckeln i det prebuildade Android-projektet.

Expo-mallen signerar release med debug-nyckeln, vilket duger for egen
testning men inte for Play. Skriptet korsatt en riktig `release`-signingConfig
som laser losenorden ur gradle-properties, och pekar release-buildTypen pa
den.

Kors i CI efter `expo prebuild`, mot den genererade (gitignorerade) mappen –
aldrig mot nagot som checkas in. Nycklar och losenord kommer fran miljon och
skrivs aldrig till loggen.

    python3 scripts/configure-signing.py android/app/build.gradle
"""
import re
import sys

SIGNING_CONFIG = """
        release {
            storeFile file(System.getenv("ANDROID_KEYSTORE_PATH") ?: "upload.keystore")
            storePassword System.getenv("ANDROID_KEYSTORE_PASSWORD")
            keyAlias System.getenv("ANDROID_KEY_ALIAS")
            keyPassword System.getenv("ANDROID_KEY_PASSWORD")
        }
"""


def patch(source: str) -> str:
    if "ANDROID_KEYSTORE_PASSWORD" in source:
        raise SystemExit("build.gradle ar redan patchad")

    # 1. Lagg till en release-signingConfig sist i signingConfigs-blocket.
    start = brace_after(source, "signingConfigs", "hittade inget signingConfigs-block")
    end = find_block_end(source, start)
    source = source[:end] + SIGNING_CONFIG + source[end:]

    # 2. Peka release-buildTypen pa den nya konfigurationen. Bara den – debug
    #    ska fortsatta signeras med debug-nyckeln.
    #
    # Soket maste begransas till buildTypes-blocket: steg 1 lade just in en
    # `release {` i signingConfigs, och den ligger tidigare i filen.
    types_start = brace_after(source, "buildTypes", "hittade inget buildTypes-block")
    types_end = find_block_end(source, types_start)
    release = re.search(r"\n\s*release \{", source[types_start:types_end])
    if release is None:
        raise SystemExit("hittade ingen release-buildType")
    release_start = types_start + release.start()
    release_end = find_block_end(source, source.index("{", release_start))
    block = source[release_start:release_end]
    if "signingConfigs.debug" not in block:
        raise SystemExit("release-blocket signerar inte med debug-nyckeln langre")
    patched = block.replace("signingConfigs.debug", "signingConfigs.release")
    return source[:release_start] + patched + source[release_end:]


def brace_after(source: str, keyword: str, error: str) -> int:
    """Index for `{` som oppnar blocket efter `keyword`."""
    match = re.search(rf"\n\s*{keyword} \{{", source)
    if match is None:
        raise SystemExit(error)
    return source.index("{", match.start())


def find_block_end(source: str, brace_index: int) -> int:
    """Index for raden fore blockets avslutande klammer."""
    depth = 0
    for i in range(brace_index, len(source)):
        if source[i] == "{":
            depth += 1
        elif source[i] == "}":
            depth -= 1
            if depth == 0:
                return source.rfind("\n", 0, i)
    raise SystemExit("obalanserade klammrar i build.gradle")


def main() -> None:
    if len(sys.argv) != 2:
        raise SystemExit(__doc__)
    path = sys.argv[1]
    with open(path, encoding="utf8") as handle:
        source = handle.read()
    # Berakna fore skrivning: `open(..., "w")` tommer filen direkt, sa ett
    # fel har hade lamnat build.gradle tomt.
    patched = patch(source)
    with open(path, "w", encoding="utf8") as handle:
        handle.write(patched)
    print(f"Signering inkopplad i {path}")


if __name__ == "__main__":
    main()
