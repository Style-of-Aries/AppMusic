import { View, Text, Image, TouchableOpacity } from "react-native";
import { router } from "expo-router";
import { Ionicons } from "@expo/vector-icons";

export default function MiniPlayer({
  song,
  isPlaying,
  onToggle,
  onNext,
  onPrev
}: any) {
  if (!song) return null;

  return (
    <TouchableOpacity
      activeOpacity={0.9}
      onPress={() => router.push("/player")}
      style={{
        position: "absolute",
        bottom: 0,
        width: "100%",
        backgroundColor: "#1e1e1e",
        flexDirection: "row",
        alignItems: "center",
        padding: 10
      }}
    >
      {/* IMAGE */}
      <Image
        source={{ uri: song.image }}
        style={{ width: 50, height: 50, borderRadius: 6 }}
      />

      {/* INFO */}
      <View style={{ flex: 1, marginLeft: 10 }}>
        <Text style={{ color: "white" }}>{song.name}</Text>
        <Text style={{ color: "gray" }}>{song.artist}</Text>
      </View>

      {/* CONTROLS */}
      <View style={{ flexDirection: "row", alignItems: "center", gap: 15 }}>
        
        {/* PREV */}
        <TouchableOpacity
          onPress={(e) => {
            e.stopPropagation();
            onPrev();
          }}
        >
          <Ionicons name="play-skip-back" size={22} color="white" />
        </TouchableOpacity>

        {/* PLAY / PAUSE */}
        <TouchableOpacity
          onPress={(e) => {
            e.stopPropagation();
            onToggle();
          }}
        >
          <Ionicons
            name={isPlaying ? "pause" : "play"}
            size={26}
            color="white"
          />
        </TouchableOpacity>

        {/* NEXT */}
        <TouchableOpacity
          onPress={(e) => {
            e.stopPropagation();
            onNext();
          }}
        >
          <Ionicons name="play-skip-forward" size={22} color="white" />
        </TouchableOpacity>

      </View>
    </TouchableOpacity>
  );
}