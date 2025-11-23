import * as SpeechSDK from "microsoft-cognitiveservices-speech-sdk";

export async function startTranscription(
  onPartial: (text: string) => void,
  onFinal: (text: string) => void,
  onError: (err: unknown) => void
) {
  await navigator.mediaDevices.getUserMedia({ audio: true });

  const speechConfig = SpeechSDK.SpeechConfig.fromSubscription(
    process.env.NEXT_PUBLIC_AZURE_STT_KEY!,
    process.env.NEXT_PUBLIC_AZURE_STT_REGION!
  );

  speechConfig.speechRecognitionLanguage = "en-GB";
  speechConfig.setProperty(
    SpeechSDK.PropertyId.SpeechServiceResponse_PostProcessingOption,
    "TrueText"
  );
  speechConfig.setProperty(
    SpeechSDK.PropertyId.SpeechServiceConnection_EndSilenceTimeoutMs,
    "2000"
  );

  const audioConfig = SpeechSDK.AudioConfig.fromDefaultMicrophoneInput();
  const recognizer = new SpeechSDK.SpeechRecognizer(speechConfig, audioConfig);

  let active = true;
  let finalBuffer = "";
  let debounceTimer: NodeJS.Timeout | null = null;

  recognizer.recognizing = (_s, e) => {
    if (!active) return;
    onPartial(e.result.text);
  };

  recognizer.recognized = (_s, e) => {
    if (!active) return;

    if (e.result.reason === SpeechSDK.ResultReason.RecognizedSpeech) {
      const text = e.result.text.trim();
      if (text) {
        finalBuffer += (finalBuffer ? " " : "") + text;

        // Reset timer every time new text comes in
        if (debounceTimer) clearTimeout(debounceTimer);
        debounceTimer = setTimeout(() => {
          onFinal(finalBuffer.trim());
          finalBuffer = "";
        }, 2000);
      }
    }
  };

  recognizer.canceled = (_s, e) => {
    console.error("Transcription canceled:", e);
    onError(e.errorDetails);
    recognizer.stopContinuousRecognitionAsync();
  };

  recognizer.startContinuousRecognitionAsync();

  return () => {
    active = false;
    if (debounceTimer) clearTimeout(debounceTimer);
    recognizer.stopContinuousRecognitionAsync(() => recognizer.close());
  };
}
