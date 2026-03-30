import { createContext, useContext } from "react";
import useAudio from "../hooks/useAudio";

const AudioContext = createContext<any>(null);

export const AudioProvider = ({ children }: any) => {
  const audio = useAudio();

  return (
    <AudioContext.Provider value={audio}>
      {children}
    </AudioContext.Provider>
  );
};

export const useAudioContext = () => useContext(AudioContext);