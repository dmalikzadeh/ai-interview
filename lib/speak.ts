let speakingRef = { current: false };
export const getSpeakingRef = () => speakingRef;
import * as SpeechSDK from "microsoft-cognitiveservices-speech-sdk";

declare global {
  interface Window {
    currentInterviewAudio?: HTMLAudioElement | null;
  }
}

const speechConfig = SpeechSDK.SpeechConfig.fromSubscription(
  process.env.NEXT_PUBLIC_AZURE_TTS_KEY!,
  process.env.NEXT_PUBLIC_AZURE_TTS_REGION!
);
speechConfig.speechSynthesisVoiceName = "en-US-Ava:DragonHDLatestNeural";
speechConfig.speechSynthesisOutputFormat =
  SpeechSDK.SpeechSynthesisOutputFormat.Audio16Khz32KBitRateMonoMp3;

let analyser: AnalyserNode | null = null;
let dataArray: Uint8Array | null = null;

export function getCurrentVolume(): number {
  if (!analyser || !dataArray) return 0;
  analyser.getByteFrequencyData(dataArray);
  const sum = dataArray.reduce((a, b) => a + b, 0);
  return sum / dataArray.length / 255;
}

let currentAudio: HTMLAudioElement | null = null;
let audioContext: AudioContext | null = null;

export function pauseSpeech() {
  if (currentAudio && !currentAudio.paused) {
    currentAudio.pause();
  }
}

export function resumeSpeech() {
  if (currentAudio && currentAudio.paused) {
    currentAudio.play();
  }
}

export function stopSpeech() {
  if (currentAudio) {
    currentAudio.pause();
    currentAudio.currentTime = 0;
    currentAudio = null;
  }
  if (window.currentInterviewAudio) {
    window.currentInterviewAudio.pause();
    window.currentInterviewAudio.currentTime = 0;
    window.currentInterviewAudio = null;
  }
}

export async function speakText(
  rawText: string,
  onStart?: () => void,
  onEnd?: () => void,
): Promise<void> {
  return new Promise((resolve, reject) => {
    const ssml = `
      <speak version="1.0" xmlns="http://www.w3.org/2001/10/synthesis"
             xmlns:mstts="https://www.w3.org/2001/mstts" xml:lang="en-US">
        <voice name="en-US-Ava:DragonHDLatestNeural">
          <mstts:express-as style="chat" styledegree="1">
            <prosody rate="15%">
              ${rawText}
            </prosody>
          </mstts:express-as>
        </voice>
      </speak>`;

    const pullStream = SpeechSDK.AudioOutputStream.createPullStream();
    const audioConfig = SpeechSDK.AudioConfig.fromStreamOutput(pullStream);
    const synthesizer = new SpeechSDK.SpeechSynthesizer(
      speechConfig,
      audioConfig
    );

    synthesizer.speakSsmlAsync(
      ssml,
      async (result) => {
        synthesizer.close();

        const audioData = result.audioData;
        const audioBlob = new Blob([audioData], { type: "audio/mpeg" });
        const audioUrl = URL.createObjectURL(audioBlob);
        const audio = new Audio(audioUrl);

        audio.onplay = () => {
          onStart?.();
          speakingRef.current = true;
        };

        if (window.currentInterviewAudio) {
          window.currentInterviewAudio.pause();
          window.currentInterviewAudio.currentTime = 0;
        }

        currentAudio = audio;
        window.currentInterviewAudio = audio;

        // Re-use one AudioContext (browsers limit how many can exist).
        if (!audioContext || audioContext.state === "closed") {
          audioContext = new AudioContext();
        }
        const ctx = audioContext;
        const source = ctx.createMediaElementSource(audio);

        analyser = ctx.createAnalyser();
        analyser.fftSize = 256;
        dataArray = new Uint8Array(analyser.frequencyBinCount);

        source.connect(analyser);
        analyser.connect(ctx.destination);

        await audio.play();

        audio.onended = () => {
          speakingRef.current = false;
          try {
            source.disconnect();
          } catch {}
          try {
            analyser?.disconnect();
          } catch {}
          if (window.currentInterviewAudio === audio) {
            window.currentInterviewAudio = null;
          }
          currentAudio = null;
          onEnd?.();
          resolve();
        };
      },
      (err) => {
        synthesizer.close();
        currentAudio = null;
        speakingRef.current = false;
        onEnd?.();
        reject(err);
      }
    );
  });
}
