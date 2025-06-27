import { useState, useEffect, useCallback } from 'react';
import { AudioEngine } from '@/lib/audio-engine';

export function useAudioContext() {
  const [audioEngine] = useState(() => new AudioEngine());
  const [isInitialized, setIsInitialized] = useState(false);
  const [isActive, setIsActive] = useState(false);

  const initialize = useCallback(async () => {
    try {
      await audioEngine.initialize();
      setIsInitialized(true);
      setIsActive(true);
    } catch (error) {
      console.error('Failed to initialize audio context:', error);
    }
  }, [audioEngine]);

  useEffect(() => {
    const handleUserGesture = () => {
      if (!isInitialized) {
        initialize();
      }
    };

    // Initialize on first user interaction
    document.addEventListener('click', handleUserGesture, { once: true });
    document.addEventListener('keydown', handleUserGesture, { once: true });

    return () => {
      document.removeEventListener('click', handleUserGesture);
      document.removeEventListener('keydown', handleUserGesture);
    };
  }, [initialize, isInitialized]);

  const playNote = useCallback((note: string, frequency: number, envelope: any) => {
    if (isInitialized) {
      audioEngine.playNote(note, frequency, envelope);
    }
  }, [audioEngine, isInitialized]);

  const stopNote = useCallback((note: string) => {
    audioEngine.stopNote(note);
  }, [audioEngine]);

  const updateWaveform = useCallback((points: { x: number; y: number }[]) => {
    audioEngine.updateWaveform(points);
  }, [audioEngine]);

  const setMasterVolume = useCallback((volume: number) => {
    audioEngine.setMasterVolume(volume);
  }, [audioEngine]);

  const setFilter = useCallback((cutoff: number, resonance: number, type: string) => {
    audioEngine.setFilter(cutoff, resonance, type);
  }, [audioEngine]);

  const setEffects = useCallback((effects: { reverb: number; delay: number; distortion: number; chorus: number }) => {
    audioEngine.setEffects(effects);
  }, [audioEngine]);

  return {
    audioEngine,
    isInitialized,
    isActive,
    initialize,
    playNote,
    stopNote,
    updateWaveform,
    setMasterVolume,
    setFilter,
    setEffects
  };
}
