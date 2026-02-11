import { DarkTheme, ThemeProvider } from '@react-navigation/native';
import { StytchClient, StytchProvider } from '@stytch/react-native';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import 'react-native-reanimated';

export const unstable_settings = {
  anchor: '(tabs)',
};

const stytch = new StytchClient('doesnt-matter-only-checking-compilation');

export default function RootLayout() {
  return (
    <ThemeProvider value={DarkTheme}>
      <StytchProvider stytch={stytch}>
        <Stack>
          <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
        </Stack>
        <StatusBar style="auto" />
      </StytchProvider>
    </ThemeProvider>
  );
}
