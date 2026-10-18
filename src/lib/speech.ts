// Shared Speech Recognition Helper
// Strictly single-instance, safe against React StrictMode double-mount,
// prevents duplicate 3x transcription, and provides kind, accessible error handling.

export interface SpeechCallbacks {
  onInterim?: (interimText: string) => void;
  onFinal?: (finalText: string) => void;
  onError?: (friendlyMessage: string, errorCode: string) => void;
  onStateChange?: (isListening: boolean) => void;
}

let activeRecognizer: any = null;
let activeSessionId: string | null = null;
let isListeningState = false;
let lastFinalResultIndex = -1;

export function isSpeechSupported(): boolean {
  if (typeof window === 'undefined') return false;
  return Boolean(
    (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition
  );
}

export function stopListening(): void {
  if (activeRecognizer) {
    try {
      // Remove all handlers so no leftover events fire after stopping
      activeRecognizer.onstart = null;
      activeRecognizer.onresult = null;
      activeRecognizer.onerror = null;
      activeRecognizer.onend = null;
      activeRecognizer.abort();
    } catch (e) {
      // Ignore abort errors
    }
    activeRecognizer = null;
  }
  isListeningState = false;
  activeSessionId = null;
  lastFinalResultIndex = -1;
}

export function startListening(
  sessionId: string,
  callbacks: SpeechCallbacks,
  continuous = false
): boolean {
  if (!isSpeechSupported()) {
    callbacks.onError?.(
      "Speech recognition isn't supported in this browser. Try typing, or use Chrome for voice.",
      'not-supported'
    );
    return false;
  }

  // Stop any currently running instance first
  stopListening();

  try {
    const SpeechClass =
      (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    const recognizer = new SpeechClass();

    recognizer.continuous = continuous;
    recognizer.interimResults = true;
    recognizer.lang = 'en-US';
    recognizer.maxAlternatives = 1;

    activeSessionId = sessionId;
    lastFinalResultIndex = -1;

    recognizer.onstart = () => {
      isListeningState = true;
      callbacks.onStateChange?.(true);
    };

    recognizer.onresult = (event: any) => {
      if (activeSessionId !== sessionId) return;

      let interim = '';

      // Only iterate new results, append each FINAL result exactly once
      for (let i = event.resultIndex; i < event.results.length; i++) {
        const result = event.results[i];
        if (result.isFinal) {
          if (i > lastFinalResultIndex) {
            lastFinalResultIndex = i;
            const transcript = result[0]?.transcript?.trim();
            if (transcript) {
              callbacks.onFinal?.(transcript);
            }
          }
        } else {
          // Replace, never concatenate interim text
          interim = result[0]?.transcript || '';
        }
      }

      callbacks.onInterim?.(interim);
    };

    recognizer.onerror = (event: any) => {
      if (activeSessionId !== sessionId) return;

      const code = event.error;
      if (code === 'aborted') {
        // Cleanly aborted, no need to show error
        return;
      }

      let message = 'Speech recognition paused. Try typing, or tap the mic to try again.';
      if (code === 'not-allowed' || code === 'service-not-allowed') {
        message =
          'Microphone access was blocked. You can type instead, or allow microphone access in browser settings.';
      } else if (code === 'no-speech') {
        message = 'No speech heard. Try speaking a bit louder or closer to the mic.';
      }

      callbacks.onError?.(message, code);
    };

    recognizer.onend = () => {
      if (activeSessionId === sessionId) {
        isListeningState = false;
        callbacks.onStateChange?.(false);
        callbacks.onInterim?.('');
      }
    };

    activeRecognizer = recognizer;
    recognizer.start();
    return true;
  } catch (err: any) {
    // Catch 'already started' or permission errors
    console.warn('Speech recognition start failed:', err);
    if (err?.name !== 'InvalidStateError') {
      callbacks.onError?.(
        'Could not start microphone. Try typing, or tap the mic to try again.',
        'start-failed'
      );
    }
    stopListening();
    return false;
  }
}

export function isCurrentlyListening(): boolean {
  return isListeningState;
}
