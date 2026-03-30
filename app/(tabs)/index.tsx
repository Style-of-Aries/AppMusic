import { useEffect, useState } from "react";
import { View, FlatList, ActivityIndicator } from "react-native";
import { useAudioContext } from "../../src/context/AudioContext";

import { getSongs } from "../../api/songApi";
import SongItem from "../../src/components/SongItem";
import MiniPlayer from "../../src/components/MiniPlayer";

export default function HomeScreen() {
  const [songs, setSongs] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const {
    playSong,
    toggle,
    currentSong,
    isPlaying,
    setList,
    playNext,
    playPrev,
  } = useAudioContext();

  useEffect(() => {
    getSongs().then((data) => {
      setSongs(data);
      setList(data); // 👈 QUAN TRỌNG
      // console.log("🎧 PLAYLIST:", data);
      setLoading(false);
    });
  }, []);

  if (loading) {
    return (
      <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
        <ActivityIndicator />
      </View>
    );
  }

  return (
    <View style={{ flex: 1, backgroundColor: "#121212" }}>
      <FlatList
        data={songs}
        keyExtractor={(item) => item.id.toString()}
        contentContainerStyle={{
          paddingBottom: currentSong ? 90 : 16,
        }}
        renderItem={({ item, index }) => (
          <SongItem song={item} onPress={() => playSong(item, index)} />
        )}
      />

      <MiniPlayer
        song={currentSong}
        isPlaying={isPlaying}
        onToggle={toggle}
        onNext={playNext}
        onPrev={playPrev}
      />
    </View>
  );
}
