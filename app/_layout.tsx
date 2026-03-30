import { Stack } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { AudioProvider } from "../src/context/AudioContext";

export default function RootLayout() {
  return (
    <AudioProvider>
      <Stack>
        <Stack.Screen name="(tabs)" options={{ headerShown: false }} />

        <Stack.Screen
          name="player"
          options={{
            headerShown: false,
            animation: "slide_from_bottom",
            animationTypeForReplace: "pop", // 👈 BACK mượt
            presentation: "card",
            animationDuration: 300,
          }}
        />
      </Stack>

      <StatusBar style="light" />
    </AudioProvider>
  );
}