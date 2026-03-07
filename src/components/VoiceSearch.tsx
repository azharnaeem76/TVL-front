'use client';

import { useState, useRef, useCallback, useEffect } from 'react';

interface VoiceSearchProps {
  onResult: (text: string) => void;
  className?: string;
}

export default function VoiceSearch({ onResult, className = '' }: VoiceSearchProps) {
  const [listening, setListening] = useState(false);
  const [supported, setSupported] = useState(false);
  const recognitionRef = useRef<any>(null);

  useEffect(() => {
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    setSupported(!!SpeechRecognition);
  }, []);

  const startListening = useCallback(() => {
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (!SpeechRecognition) return;

    const recognition = new SpeechRecognition();
    recognition.lang = 'en-US';
    recognition.interimResults = false;
    recognition.continuous = false;

    recognition.onresult = (event: any) => {
      const transcript = event.results[0][0].transcript;
      onResult(transcript);
      setListening(false);
    };

    recognition.onerror = () => setListening(false);
    recognition.onend = () => setListening(false);

    recognitionRef.current = recognition;
    recognition.start();
    setListening(true);
  }, [onResult]);

  const stopListening = useCallback(() => {
    recognitionRef.current?.stop();
    setListening(false);
  }, []);

  if (!supported) return null;

  return (
    <button
      type="button"
      onClick={listening ? stopListening : startListening}
      className={`relative flex items-center justify-center transition-all duration-300 ${className} ${
        listening
          ? 'text-brass-400 bg-brass-400/10 border-brass-400/30'
          : 'text-gray-500 hover:text-brass-300 hover:bg-white/[0.04]'
      } w-12 h-12 rounded-xl border border-white/[0.1]`}
      title={listening ? 'Stop recording' : 'Voice search'}
    >
      {listening ? (
        <>
          {/* Pulsing ring */}
          <div className="absolute inset-0 rounded-xl border-2 border-brass-400/30 animate-ping" />
          <div className="voice-bars">
            <span /><span /><span /><span /><span />
          </div>
        </>
      ) : (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5}
            d="M12 18.75a6 6 0 006-6v-1.5m-6 7.5a6 6 0 01-6-6v-1.5m6 7.5v3.75m-3.75 0h7.5M12 15.75a3 3 0 01-3-3V4.5a3 3 0 116 0v8.25a3 3 0 01-3 3z" />
        </svg>
      )}
    </button>
  );
}
