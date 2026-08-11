/**
 * Typsnittsladdning (plan.md §9).
 *
 * Snitten bundlas som assets, så det sker utan nätanrop. Splash-skärmen
 * hålls kvar tills de är på plats – annars hinner appen rita en bildruta
 * med systemfonten och hoppa till.
 *
 * Importera alltid från vikt-undersökvägen (`.../700Bold`) och aldrig från
 * paketets rot: roten re-exporterar samtliga vikter, och Metro buntar då in
 * varenda TTF – 1,9 MB i stället för de fyra vi använder.
 */
import { Fraunces_400Regular } from '@expo-google-fonts/fraunces/400Regular';
import { Fraunces_600SemiBold } from '@expo-google-fonts/fraunces/600SemiBold';
import { SpaceGrotesk_500Medium } from '@expo-google-fonts/space-grotesk/500Medium';
import { SpaceGrotesk_700Bold } from '@expo-google-fonts/space-grotesk/700Bold';
import { useFonts } from 'expo-font';
import * as SplashScreen from 'expo-splash-screen';
import { useCallback, useEffect } from 'react';

void SplashScreen.preventAutoHideAsync();

export function useAppFonts(): {
  ready: boolean;
  onLayoutReady: () => void;
} {
  const [loaded, error] = useFonts({
    SpaceGrotesk_500Medium,
    SpaceGrotesk_700Bold,
    Fraunces_400Regular,
    Fraunces_600SemiBold,
  });

  // Ett fel ska inte låsa appen bakom splash – hellre systemfont än vit skärm.
  const ready = loaded || error !== null;

  useEffect(() => {
    if (error !== null) {
      console.warn('Typsnitten kunde inte laddas, faller tillbaka på systemfont', error);
    }
  }, [error]);

  const onLayoutReady = useCallback(() => {
    if (ready) {
      void SplashScreen.hideAsync();
    }
  }, [ready]);

  return { ready, onLayoutReady };
}
