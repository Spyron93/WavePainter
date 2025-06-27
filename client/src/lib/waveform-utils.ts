export interface WaveformPoint {
  x: number;
  y: number;
}

export const noteFrequencies: { [key: string]: number } = {
  'C3': 130.81,
  'C#3': 138.59,
  'D3': 146.83,
  'D#3': 155.56,
  'E3': 164.81,
  'F3': 174.61,
  'F#3': 185.00,
  'G3': 196.00,
  'G#3': 207.65,
  'A3': 220.00,
  'A#3': 233.08,
  'B3': 246.94,
  'C4': 261.63,
  'C#4': 277.18,
  'D4': 293.66,
  'D#4': 311.13,
  'E4': 329.63,
  'F4': 349.23,
  'F#4': 369.99,
  'G4': 392.00,
  'G#4': 415.30,
  'A4': 440.00,
  'A#4': 466.16,
  'B4': 493.88,
  'C5': 523.25,
  'C#5': 554.37,
  'D5': 587.33,
  'D#5': 622.25,
  'E5': 659.25,
  'F5': 698.46,
  'F#5': 739.99,
  'G5': 783.99,
  'G#5': 830.61,
  'A5': 880.00,
  'A#5': 932.33,
  'B5': 987.77,
};

export function getFrequency(note: string, octave: number = 4): number {
  const baseNote = note.replace(/\d/, '');
  const noteKey = `${baseNote}${octave}`;
  return noteFrequencies[noteKey] || 440;
}

export function smoothWaveform(points: WaveformPoint[]): WaveformPoint[] {
  if (points.length < 3) return points;

  const smoothed: WaveformPoint[] = [];
  smoothed.push(points[0]);

  for (let i = 1; i < points.length - 1; i++) {
    const prev = points[i - 1];
    const curr = points[i];
    const next = points[i + 1];

    const smoothedY = (prev.y + curr.y + next.y) / 3;
    smoothed.push({ x: curr.x, y: smoothedY });
  }

  smoothed.push(points[points.length - 1]);
  return smoothed;
}

export function normalizeWaveform(points: WaveformPoint[]): WaveformPoint[] {
  if (points.length === 0) return points;

  const minY = Math.min(...points.map(p => p.y));
  const maxY = Math.max(...points.map(p => p.y));
  const range = maxY - minY;

  if (range === 0) return points;

  return points.map(point => ({
    x: point.x,
    y: ((point.y - minY) / range) * 100
  }));
}

export function analyzeWaveform(points: WaveformPoint[]): {
  harmonicRichness: number;
  complexity: 'Low' | 'Medium' | 'High';
  fundamentalFreq: number;
} {
  if (points.length === 0) {
    return { harmonicRichness: 0, complexity: 'Low', fundamentalFreq: 0 };
  }

  // Calculate variance as a measure of complexity
  const mean = points.reduce((sum, p) => sum + p.y, 0) / points.length;
  const variance = points.reduce((sum, p) => sum + Math.pow(p.y - mean, 2), 0) / points.length;
  
  // Simple harmonic analysis
  let zeroCrossings = 0;
  for (let i = 1; i < points.length; i++) {
    if ((points[i].y - 50) * (points[i - 1].y - 50) < 0) {
      zeroCrossings++;
    }
  }

  const harmonicRichness = Math.min(100, (variance / 100) * 50 + (zeroCrossings / points.length) * 50);
  
  let complexity: 'Low' | 'Medium' | 'High' = 'Low';
  if (harmonicRichness > 70) complexity = 'High';
  else if (harmonicRichness > 30) complexity = 'Medium';

  const fundamentalFreq = zeroCrossings / 2; // Rough estimate

  return {
    harmonicRichness: Math.round(harmonicRichness),
    complexity,
    fundamentalFreq
  };
}
