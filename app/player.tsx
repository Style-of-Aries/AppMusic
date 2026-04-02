import { Ionicons } from "@expo/vector-icons";
import Slider from "@react-native-community/slider";
import { useEffect, useRef } from "react";
import {
  Animated,
  BackHandler,
  Dimensions,
  Easing,
  PanResponder,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
  ImageBackground,
} from "react-native";
import { BlurView } from "expo-blur";
import { useAudioContext } from "../src/context/AudioContext";
// import { Image } from "react-native";
import { useRouter } from "expo-router";

export default function PlayerScreen() {
  const {
    playlist,
    currentSong,
    isPlaying,
    toggle,
    playNext,
    playPrev,
    position,
    duration,
    seekTo,
    isRepeat,
    setIsRepeat,
    isShuffle,
    setIsShuffle,
    currentIndex,
  } = useAudioContext();

  const router = useRouter();
  const index = currentIndex ?? 0;
  const songs = playlist || [];

  const nextSong = songs[index + 1] || currentSong;
  const prevSong = songs[index - 1] || currentSong;
  // 🎬 animation mở / đóng
  const scaleAnim = useRef(new Animated.Value(1)).current;
  const translateY = useRef(new Animated.Value(600)).current;
  const opacity = useRef(new Animated.Value(0)).current;

  const screenHeight = Dimensions.get("window").height;

  const swipeY = useRef(new Animated.Value(0)).current;
  const scale = swipeY.interpolate({
    inputRange: [-screenHeight, 0, screenHeight],
    outputRange: [0.9, 1, 0.9],
  });

  const fade = swipeY.interpolate({
    inputRange: [-screenHeight, 0, screenHeight],
    outputRange: [0.3, 1, 0.3],
  });
  // 🎵 xoay ảnh
  const rotateAnim = useRef(new Animated.Value(0)).current;

  const panResponder = useRef(
    PanResponder.create({
      onMoveShouldSetPanResponder: (_, gestureState) => {
        const isVertical =
          Math.abs(gestureState.dy) > Math.abs(gestureState.dx);

        return isVertical && Math.abs(gestureState.dy) > 20;
      },

      onPanResponderMove: (_, gestureState) => {
        swipeY.setValue(gestureState.dy * 0.8);
      },

      onPanResponderRelease: async (_, gestureState) => {
        if (gestureState.dy < -120) {
          // 🔼 vuốt lên → next
          Animated.timing(swipeY, {
            toValue: -screenHeight,
            duration: 220,
            easing: Easing.out(Easing.ease),
            useNativeDriver: true,
          }).start(() => {
            // 👉 reset UI ngay
            swipeY.setValue(0);
            playNext();
          });
        } else if (gestureState.dy > 120) {
          // 🔽 vuốt xuống → prev
          Animated.timing(swipeY, {
            toValue: screenHeight,
            duration: 250,
            useNativeDriver: true,
          }).start(async () => {
            swipeY.setValue(0);
            playPrev();
          });
        } else {
          // ❌ không đủ lực → bật lại
          Animated.spring(swipeY, {
            toValue: 0,
            useNativeDriver: true,
          }).start();
        }
      },
    }),
  ).current;
  // 👉 animation mở
  useEffect(() => {
    Animated.parallel([
      Animated.timing(translateY, {
        toValue: 0,
        duration: 350,
        useNativeDriver: true,
      }),
      Animated.timing(opacity, {
        toValue: 1,
        duration: 350,
        useNativeDriver: true,
      }),
    ]).start();
  }, []);

  // 👉 animation đóng
  const handleClose = () => {
    Animated.parallel([
      Animated.timing(translateY, {
        toValue: 600,
        duration: 250,
        useNativeDriver: true,
      }),
      Animated.timing(opacity, {
        toValue: 0,
        duration: 250,
        useNativeDriver: true,
      }),
    ]).start(() => {
      if (router.canGoBack()) {
        router.back();
        return;
      }

      router.replace("/");
    });
  };

  // 👉 bắt nút BACK
  useEffect(() => {
    const backHandler = BackHandler.addEventListener(
      "hardwareBackPress",
      () => {
        handleClose();
        return true;
      },
    );

    return () => backHandler.remove();
  }, []);

  // 👉 xoay ảnh
  useEffect(() => {
    if (isPlaying) {
      Animated.loop(
        Animated.timing(rotateAnim, {
          toValue: 1,
          duration: 8000,
          easing: Easing.linear,
          useNativeDriver: true,
        }),
      ).start();
    } else {
      rotateAnim.stopAnimation();
    }
  }, [isPlaying]);

  const rotate = rotateAnim.interpolate({
    inputRange: [0, 1],
    outputRange: ["0deg", "360deg"],
  });

  if (!currentSong) return null;

  const format = (m: number) => {
    const s = Math.floor(m / 1000);
    return `${Math.floor(s / 60)}:${s % 60 < 10 ? "0" : ""}${s % 60}`;
  };

  return (
    <View style={{ flex: 1 }}>
      {/* 👉 Background ảnh */}
      <ImageBackground
        source={{ uri: currentSong.image }}
        style={{ flex: 1 }}
        blurRadius={3}
        resizeMode="cover"
      >
        {/* 👉 Blur overlay */}
        <BlurView
          intensity={45}
          tint="dark"
          style={{
            ...StyleSheet.absoluteFillObject,
          }}
        />
        <View style={{ flex: 1, overflow: "hidden" }}>
          {/* 👉 NEXT SCREEN */}
          {/* 👉 CURRENT SCREEN */}
          <Animated.View
            style={{
              backgroundColor: "rgba(0,0,0,0.95)",
              position: "absolute",
              width: "100%",
              height: "100%",
              justifyContent: "center",
              alignItems: "center",
              opacity: swipeY.interpolate({
                inputRange: [-screenHeight, 0],
                outputRange: [1, 0.3],
              }),
              transform: [
                {
                  translateY: swipeY.interpolate({
                    inputRange: [-screenHeight, 0],
                    outputRange: [0, screenHeight],
                  }),
                },
              ],
            }}
          >
            <Animated.Image
              source={{ uri: nextSong.image }}
              style={styles.image}
            />
            <Text style={styles.name}>{nextSong.name}</Text>
            <Text style={styles.artist}>{nextSong.artist}</Text>
            <Slider
              style={{ width: "90%" }}
              minimumValue={0}
              maximumValue={duration}
              value={position}
              onSlidingComplete={seekTo}
            />

            <View style={styles.time}>
              <Text style={{ color: "white" }}>{format(position)}</Text>
              <Text style={{ color: "white" }}>{format(duration)}</Text>
            </View>

            <View style={styles.controls}>
              <TouchableOpacity onPress={() => setIsShuffle(!isShuffle)}>
                <Ionicons
                  name="shuffle"
                  size={28}
                  color={isShuffle ? "green" : "white"}
                />
              </TouchableOpacity>

              <TouchableOpacity onPress={playPrev}>
                <Ionicons name="play-skip-back" size={32} color="white" />
              </TouchableOpacity>

              <TouchableOpacity onPress={toggle}>
                <Ionicons
                  name={isPlaying ? "pause" : "play"}
                  size={45}
                  color="white"
                />
              </TouchableOpacity>

              <TouchableOpacity onPress={playNext}>
                <Ionicons name="play-skip-forward" size={32} color="white" />
              </TouchableOpacity>

              <TouchableOpacity onPress={() => setIsRepeat(!isRepeat)}>
                <Ionicons
                  name="repeat"
                  size={28}
                  color={isRepeat ? "green" : "white"}
                />
              </TouchableOpacity>
            </View>
          </Animated.View>
          {/* 👉 PREV SCREEN */}
          {/* 👉 CURRENT SCREEN */}
          <Animated.View
            style={{
              backgroundColor: "rgba(0,0,0,0.95)",
              position: "absolute",
              width: "100%",
              height: "100%",
              justifyContent: "center",
              alignItems: "center",
              opacity: swipeY.interpolate({
                inputRange: [0, screenHeight],
                outputRange: [0.3, 1],
              }),
              transform: [
                {
                  translateY: swipeY.interpolate({
                    inputRange: [0, screenHeight],
                    outputRange: [-screenHeight, 0],
                  }),
                },
              ],
            }}
          >
            <Animated.Image
              source={{ uri: prevSong.image }}
              style={styles.image}
            />
            <Text style={styles.name}>{prevSong.name}</Text>
            <Text style={styles.artist}>{prevSong.artist}</Text>
            <Slider
              style={{ width: "90%" }}
              minimumValue={0}
              maximumValue={duration}
              value={position}
              onSlidingComplete={seekTo}
            />

            <View style={styles.time}>
              <Text style={{ color: "white" }}>{format(position)}</Text>
              <Text style={{ color: "white" }}>{format(duration)}</Text>
            </View>

            <View style={styles.controls}>
              <TouchableOpacity onPress={() => setIsShuffle(!isShuffle)}>
                <Ionicons
                  name="shuffle"
                  size={28}
                  color={isShuffle ? "green" : "white"}
                />
              </TouchableOpacity>

              <TouchableOpacity onPress={playPrev}>
                <Ionicons name="play-skip-back" size={32} color="white" />
              </TouchableOpacity>

              <TouchableOpacity onPress={toggle}>
                <Ionicons
                  name={isPlaying ? "pause" : "play"}
                  size={45}
                  color="white"
                />
              </TouchableOpacity>

              <TouchableOpacity onPress={playNext}>
                <Ionicons name="play-skip-forward" size={32} color="white" />
              </TouchableOpacity>

              <TouchableOpacity onPress={() => setIsRepeat(!isRepeat)}>
                <Ionicons
                  name="repeat"
                  size={28}
                  color={isRepeat ? "green" : "white"}
                />
              </TouchableOpacity>
            </View>
          </Animated.View>

          {/* 👉 CURRENT SCREEN */}
          <Animated.View
            {...panResponder.panHandlers}
            style={[
              styles.container,
              {
                opacity: fade,
                transform: [{ translateY }, { translateY: swipeY }, { scale }],
              },
            ]}
          >
            {/* UI cũ của bạn giữ nguyên */}
            <Text style={styles.title}>Đang phát</Text>
            <View style={{ alignItems: "center" }}>
              <Animated.Image
                source={{ uri: currentSong.image }}
                style={[styles.image, { transform: [{ rotate }] }]}
              />

              <Text style={styles.name}>{currentSong.name}</Text>
              <Text style={styles.artist}>{currentSong.artist}</Text>
            </View>
            <View style={{ width: "100%", alignItems: "center" }}>
              <Slider
                style={{ width: "90%" }}
                minimumValue={0}
                maximumValue={duration}
                value={position}
                onSlidingComplete={seekTo}
              />

              <View style={styles.time}>
                <Text style={{ color: "white" }}>{format(position)}</Text>
                <Text style={{ color: "white" }}>{format(duration)}</Text>
              </View>

              <View style={styles.controls}>
                <TouchableOpacity onPress={() => setIsShuffle(!isShuffle)}>
                  <Ionicons
                    name="shuffle"
                    size={28}
                    color={isShuffle ? "green" : "white"}
                  />
                </TouchableOpacity>

                <TouchableOpacity onPress={playPrev}>
                  <Ionicons name="play-skip-back" size={32} color="white" />
                </TouchableOpacity>

                <TouchableOpacity onPress={toggle}>
                  <Ionicons
                    name={isPlaying ? "pause" : "play"}
                    size={45}
                    color="white"
                  />
                </TouchableOpacity>

                <TouchableOpacity onPress={playNext}>
                  <Ionicons name="play-skip-forward" size={32} color="white" />
                </TouchableOpacity>

                <TouchableOpacity onPress={() => setIsRepeat(!isRepeat)}>
                  <Ionicons
                    name="repeat"
                    size={28}
                    color={isRepeat ? "green" : "white"}
                  />
                </TouchableOpacity>
              </View>
            </View>
          </Animated.View>
        </View>
      </ImageBackground>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "transparent",
    alignItems: "center",
    justifyContent: "space-between",
    paddingVertical: 110,
  },
  title: { color: "white", marginBottom: 20 },
  image: {
    width: 250,
    height: 250,
    borderRadius: 999,

    // 👇 thêm cái này là đẹp hẳn
    borderWidth: 3,
    borderColor: "rgba(255,255,255,0.1)",

    shadowColor: "#000",
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.6,
    shadowRadius: 20,
    elevation: 20,
  },
  name: {
    color: "white",
    fontSize: 22,
    marginTop: 20,
    fontWeight: "bold",
  },

  artist: {
    color: "rgba(255,255,255,0.7)",
    marginTop: 5,
  },
  time: { flexDirection: "row", justifyContent: "space-between", width: "90%" },
  controls: {
    flexDirection: "row",
    marginTop: 30,
    gap: 40,
    alignItems: "center",
    justifyContent: "center",
  },
  btn: { fontSize: 30, color: "white" },
  play: { fontSize: 40, color: "white" },
});
