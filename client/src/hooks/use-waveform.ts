import { useState, useCallback } from 'react';
import { WaveformPoint, smoothWaveform, normalizeWaveform, analyzeWaveform } from '@/lib/waveform-utils';

export function useWaveform() {
  const [points, setPoints] = useState<WaveformPoint[]>([]);
  const [isDrawing, setIsDrawing] = useState(false);
  const [analysis, setAnalysis] = useState({
    harmonicRichness: 0,
    complexity: 'Low' as 'Low' | 'Medium' | 'High',
    fundamentalFreq: 0
  });

  const startDrawing = useCallback(() => {
    setIsDrawing(true);
  }, []);

  const stopDrawing = useCallback(() => {
    setIsDrawing(false);
    if (points.length > 0) {
      const smoothed = smoothWaveform(points);
      const normalized = normalizeWaveform(smoothed);
      setPoints(normalized);
      setAnalysis(analyzeWaveform(normalized));
    }
  }, [points]);

  const addPoint = useCallback((point: WaveformPoint) => {
    if (isDrawing) {
      setPoints(prev => [...prev, point]);
    }
  }, [isDrawing]);

  const clearWaveform = useCallback(() => {
    setPoints([]);
    setAnalysis({
      harmonicRichness: 0,
      complexity: 'Low',
      fundamentalFreq: 0
    });
  }, []);

  const setWaveformPoints = useCallback((newPoints: WaveformPoint[]) => {
    setPoints(newPoints);
    setAnalysis(analyzeWaveform(newPoints));
  }, []);

  return {
    points,
    isDrawing,
    analysis,
    startDrawing,
    stopDrawing,
    addPoint,
    clearWaveform,
    setWaveformPoints
  };
}
