"""Genererar Fyrtals ikonassets ur samma palett som appen."""
import os

from PIL import Image, ImageDraw, ImageFont

PAPER = (247, 244, 238, 255)
INK = (28, 26, 23, 255)
LEVELS = [
    (227, 206, 150, 255),  # sand
    (169, 191, 162, 255),  # salvia
    (138, 164, 190, 255),  # dimbla
    (142, 119, 150, 255),  # plommon
]

SS = 4  # supersampling, PIL antialiasar inte former

NM = "/home/user/fyrtal/node_modules/@expo-google-fonts"
FRAUNCES = f"{NM}/fraunces/600SemiBold/Fraunces_600SemiBold.ttf"
GROTESK = f"{NM}/space-grotesk/500Medium/SpaceGrotesk_500Medium.ttf"


def grid(size, extent, bg, colors, radius_ratio=0.28, gap_ratio=0.055):
    """2x2-rutnat centrerat pa en kvadratisk duk.

    `extent` = rutnatets bredd som andel av duken.
    """
    canvas = size * SS
    img = Image.new("RGBA", (canvas, canvas), bg)
    draw = ImageDraw.Draw(img)

    total = canvas * extent
    gap = total * gap_ratio
    tile = (total - gap) / 2
    radius = tile * radius_ratio
    left = (canvas - total) / 2
    top = (canvas - total) / 2

    for index, color in enumerate(colors):
        row, col = divmod(index, 2)
        x0 = left + col * (tile + gap)
        y0 = top + row * (tile + gap)
        draw.rounded_rectangle(
            [x0, y0, x0 + tile, y0 + tile], radius=radius, fill=color
        )

    return img.resize((size, size), Image.LANCZOS)


def save(img, path):
    img.save(path)
    print(f"{path}  {img.size[0]}x{img.size[1]}")


OUT = "/home/user/fyrtal/assets"

# Huvudikon: rutnatet pa papper, generost men inte trangt.
save(grid(1024, 0.66, PAPER, LEVELS), f"{OUT}/icon.png")

# Adaptiv ikon: innehallet maste rymmas i den inre sakerhetszonen (~66%),
# annars beskars det av systemets mask. Darav mindre extent.
save(grid(1024, 0.46, (0, 0, 0, 0), LEVELS), f"{OUT}/android-icon-foreground.png")
save(grid(1024, 0.0, PAPER, []), f"{OUT}/android-icon-background.png")

# Monokrom ikon: Android tematiserar via alfakanalen, formen ska vara solid.
save(grid(1024, 0.46, (0, 0, 0, 0), [INK] * 4), f"{OUT}/android-icon-monochrome.png")

# Splash: transparent, appen ritar bakgrunden.
save(grid(1024, 0.68, (0, 0, 0, 0), LEVELS), f"{OUT}/splash-icon.png")

save(grid(196, 0.68, PAPER, LEVELS), f"{OUT}/favicon.png")

# --- Butiksgrafik (store/graphics) -----------------------------------------
# Play kraver en 512x512-ikon och en feature graphic pa exakt 1024x500.
STORE = "/home/user/fyrtal/store/graphics"
os.makedirs(STORE, exist_ok=True)

# Play-ikonen far inte ha alfa, darfor papper som botten.
save(grid(512, 0.66, PAPER, LEVELS).convert("RGB"), f"{STORE}/play-icon-512.png")


def feature_graphic(path, size=(1024, 500)):
    """Rutnat till vanster, ordmarke till hoger. Samma palett som appen."""
    w, h = size
    img = Image.new("RGB", (w * SS, h * SS), PAPER[:3])
    draw = ImageDraw.Draw(img)

    # Rutnatet
    total = h * SS * 0.56
    gap = total * 0.055
    tile = (total - gap) / 2
    radius = tile * 0.28
    left = w * SS * 0.11
    top = (h * SS - total) / 2
    for index, color in enumerate(LEVELS):
        row, col = divmod(index, 2)
        x0 = left + col * (tile + gap)
        y0 = top + row * (tile + gap)
        draw.rounded_rectangle([x0, y0, x0 + tile, y0 + tile], radius=radius, fill=color)

    # Ordmarket i samma snitt som appen anvander
    serif = ImageFont.truetype(FRAUNCES, int(112 * SS))
    sans = ImageFont.truetype(GROTESK, int(34 * SS))
    text_x = left + total + w * SS * 0.09
    draw.text((text_x, h * SS * 0.45), "Fyrtal", font=serif, fill=INK[:3], anchor="ls")
    draw.text(
        (text_x, h * SS * 0.63),
        "Hitta alla grupper om fyra",
        font=sans,
        fill=(107, 100, 89),
        anchor="ls",
    )

    img = img.resize(size, Image.LANCZOS)
    save(img, path)


feature_graphic(f"{STORE}/feature-graphic-1024x500.png")
