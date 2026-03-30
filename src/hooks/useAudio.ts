import { useState, useEffect, useRef } from "react";
import { Audio } from "expo-av";

export default function useAudio() {
  const [sound, setSound] = useState<any>(null);
  const [currentSong, setCurrentSong] = useState<any>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [playlist, setPlaylist] = useState<any[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);

  const [position, setPosition] = useState(0);
  const [duration, setDuration] = useState(0);

  const [isRepeat, setIsRepeat] = useState(false);
  const [isShuffle, setIsShuffle] = useState(false);

  // 👉 FIX stale state
  const currentIndexRef = useRef(0);

  useEffect(() => {
    currentIndexRef.current = currentIndex;
  }, [currentIndex]);

  // 👉 set playlist
  const setList = (list: any[]) => {
    setPlaylist(list);
  };

  // 🔥 random index
  const getRandomIndex = () => {
    if (playlist.length === 0) return 0;
    let random;
    do {
      random = Math.floor(Math.random() * playlist.length);
    } while (random === currentIndexRef.current && playlist.length > 1);

    return random;
  };

  // 🔥 PLAY SONG
  const playSong = async (song: any, index: number) => {
    try {
      if (sound) {
        await sound.unloadAsync();
      }

      const { sound: newSound } = await Audio.Sound.createAsync(
        { uri: song.fileSong },
        { shouldPlay: true },
      );

      newSound.setOnPlaybackStatusUpdate((status: any) => {
        if (!status.isLoaded) return;

        setPosition(status.positionMillis || 0);
        setDuration(status.durationMillis || 0);

        // 👉 AUTO NEXT + REPEAT + SHUFFLE
        if (status.didJustFinish) {
          // 🔁 Repeat
          if (isRepeat) {
            newSound.replayAsync();
            return;
          }

          // 🔀 Shuffle
          if (isShuffle) {
            const randomIndex = getRandomIndex();
            playSong(playlist[randomIndex], randomIndex);
            return;
          }

          // ▶️ Next
          if (playlist.length > 0) {
            const nextIndex = (currentIndexRef.current + 1) % playlist.length;
            playSong(playlist[nextIndex], nextIndex);
          }
        }
      });
      console.log(
        "Bài hát:" + song.name + " - " + currentIndexRef.current + "và" + playlist.length,
      );
      console.log("lặp lại: " + isRepeat);
      setSound(newSound);
      setCurrentSong(song);
      setCurrentIndex(index);
      setIsPlaying(true);
    } catch (err) {
      console.log("Play error:", err);
    }
  };

  // 🔥 NEXT
  const playNext = async () => {
    if (playlist.length === 0) return;

    // 🔁 Repeat
    if (isRepeat) {
      if (sound) {
        await sound.replayAsync();
      }
      return;
    }

    // 🔀 Shuffle
    if (isShuffle) {
      const randomIndex = getRandomIndex();
      playSong(playlist[randomIndex], randomIndex);
      return;
    }

    // ▶️ Next bình thường
    const nextIndex = (currentIndexRef.current + 1) % playlist.length;
    playSong(playlist[nextIndex], nextIndex);
  };

  // 🔥 PREV
  const playPrev = async () => {
    if (playlist.length === 0) return;

    if (isRepeat) {
      if (sound) {
        await sound.replayAsync();
      }
      return;
    }

    if (isShuffle) {
      const randomIndex = getRandomIndex();
      playSong(playlist[randomIndex], randomIndex);
      return;
    }

    const prevIndex =
      (currentIndexRef.current - 1 + playlist.length) % playlist.length;

    playSong(playlist[prevIndex], prevIndex);
  };

  // 🔥 PLAY / PAUSE
  const toggle = async () => {
    if (!sound) return;

    if (isPlaying) {
      await sound.pauseAsync();
      setIsPlaying(false);
    } else {
      await sound.playAsync();
      setIsPlaying(true);
    }
  };

  // 🔥 SEEK
  const seekTo = async (value: number) => {
    if (!sound) return;
    await sound.setPositionAsync(value);
  };

  
  // 🔥 CLEANUP
  useEffect(() => {
    return () => {
      if (sound) {
        sound.unloadAsync();
      }
    };
  }, [sound]);

  return {
    sound,
    playSong,
    playNext,
    playPrev,
    toggle,
    seekTo,
    position,
    duration,
    setList,
    currentSong,
    isPlaying,
    isRepeat,
    setIsRepeat,
    isShuffle,
    setIsShuffle,
    currentIndex,
    setCurrentIndex,
    playlist,
  };
}
