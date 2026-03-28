import { DarkTheme, DefaultTheme, ThemeProvider } from '@react-navigation/native';
import { useFonts } from 'expo-font';
import { Stack, useRouter } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';
import { useEffect, useRef } from 'react';

import { useTheme } from '../src/styles/theme';
import { useDatabase } from '../src/hooks/useDatabase';

export { ErrorBoundary } from 'expo-router';

export const unstable_settings = {
  initialRouteName: '(tabs)',
};

SplashScreen.preventAutoHideAsync();

function setupNotifications() {
  try {
    const Notifications = require('expo-notifications');
    Notifications.setNotificationHandler({
      handleNotification: async () => ({
        shouldShowBanner: true,
        shouldShowList: true,
        shouldPlaySound: true,
        shouldSetBadge: false,
      }),
    });
    return Notifications;
  } catch {
    return null;
  }
}

const Notifications = setupNotifications();

export default function RootLayout() {
  const [loaded, error] = useFonts({
    SpaceMono: require('../assets/fonts/SpaceMono-Regular.ttf'),
  });
  const { isReady: dbReady } = useDatabase();
  const { colors, isDark } = useTheme();
  const router = useRouter();
  const notificationResponseListener = useRef<{ remove: () => void } | null>(null);

  useEffect(() => {
    if (error) throw error;
  }, [error]);

  useEffect(() => {
    if (loaded && dbReady) {
      SplashScreen.hideAsync();
    }
  }, [loaded, dbReady]);

  useEffect(() => {
    // Notifications and background fetch only work in dev builds, not Expo Go
    try {
      const { requestNotificationPermissions } = require('../src/services/notifications');
      requestNotificationPermissions().catch(() => {});
    } catch {}

    try {
      const { registerBackgroundFetch } = require('../src/services/background');
      registerBackgroundFetch().catch(() => {});
    } catch {}

    if (Notifications) {
      try {
        notificationResponseListener.current =
          Notifications.addNotificationResponseReceivedListener(
            (response: { notification: { request: { content: { data: Record<string, string> } } } }) => {
              const data = response.notification.request.content.data;
              if (data?.parcelReference) {
                router.push(`/parcel/${data.parcelReference}`);
              }
            }
          );
      } catch {}
    }

    return () => {
      notificationResponseListener.current?.remove();
    };
  }, [router]);

  if (!loaded || !dbReady) {
    return null;
  }

  return (
    <ThemeProvider value={isDark ? DarkTheme : DefaultTheme}>
      <Stack
        screenOptions={{
          headerStyle: { backgroundColor: colors.background },
          headerTintColor: colors.textPrimary,
          contentStyle: { backgroundColor: colors.background },
        }}
      >
        <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
        <Stack.Screen
          name="parcel/[id]"
          options={{
            title: 'Pakkesporing',
            headerBackTitle: 'Tilbake',
          }}
        />
      </Stack>
    </ThemeProvider>
  );
}
