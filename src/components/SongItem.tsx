import { View, Text, Image, TouchableOpacity } from "react-native";
import { router } from "expo-router";

export default function SongItem({ song, onPress }: any) {
  return (
    <TouchableOpacity
      onPress={() => {
        onPress(song);
        router.push({
          pathname: "/player",
          params: { song: JSON.stringify(song) },
        });
      }}
      style={{ flexDirection: "row", padding: 12, alignItems: "center" }}
    >
      <Image
        source={{ uri: song.image }}
        style={{ width: 60, height: 60, borderRadius: 8 }}
      />

      <View style={{ marginLeft: 12 }}>
        <Text style={{ color: "white" }}>{song.name}</Text>
        <Text style={{ color: "gray" }}>{song.artist}</Text>
      </View>
    </TouchableOpacity>
  );
}
