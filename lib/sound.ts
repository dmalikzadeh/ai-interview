export function playSound(src: string, volume: number = 1) {
  const audio = new Audio(src);
  audio.volume = volume;
  audio.play().catch((e) => {
    console.warn("Audio playback failed:", e);
  });
}