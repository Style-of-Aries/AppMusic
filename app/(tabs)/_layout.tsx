import { Tabs } from "expo-router";

export default function TabLayout() {
  return (
    <Tabs screenOptions={{ tabBarStyle: { backgroundColor: "#ffffff" } }}>
      <Tabs.Screen  name="index" options={{ title: "Home" }} />
    </Tabs>
  );
}