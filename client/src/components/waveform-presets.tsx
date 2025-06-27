import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Zap } from 'lucide-react';
import { WaveformPoint } from '@/lib/waveform-utils';

interface WaveformPresetsProps {
  onLoadPreset: (points: WaveformPoint[]) => void;
}

const presets = {
  sine: {
    name: 'Sine Wave',
    description: 'Pure, smooth sine wave',
    generate: (): WaveformPoint[] => {
      const points: WaveformPoint[] = [];
      for (let i = 0; i <= 100; i += 2) {
        const y = 50 + 40 * Math.sin((i / 100) * 2 * Math.PI);
        points.push({ x: i, y });
      }
      return points;
    }
  },
  square: {
    name: 'Square Wave',
    description: 'Sharp, digital square wave',
    generate: (): WaveformPoint[] => {
      const points: WaveformPoint[] = [];
      for (let i = 0; i <= 100; i += 1) {
        const y = i < 50 ? 20 : 80;
        points.push({ x: i, y });
      }
      return points;
    }
  },
  sawtooth: {
    name: 'Sawtooth Wave',
    description: 'Rising sawtooth wave',
    generate: (): WaveformPoint[] => {
      const points: WaveformPoint[] = [];
      for (let i = 0; i <= 100; i += 2) {
        const y = 20 + (i / 100) * 60;
        points.push({ x: i, y });
      }
      return points;
    }
  },
  triangle: {
    name: 'Triangle Wave',
    description: 'Symmetric triangle wave',
    generate: (): WaveformPoint[] => {
      const points: WaveformPoint[] = [];
      for (let i = 0; i <= 100; i += 2) {
        const y = i <= 50 
          ? 20 + (i / 50) * 60 
          : 80 - ((i - 50) / 50) * 60;
        points.push({ x: i, y });
      }
      return points;
    }
  },
  noise: {
    name: 'Random Noise',
    description: 'Random waveform',
    generate: (): WaveformPoint[] => {
      const points: WaveformPoint[] = [];
      for (let i = 0; i <= 100; i += 3) {
        const y = 20 + Math.random() * 60;
        points.push({ x: i, y });
      }
      return points;
    }
  },
  pulse: {
    name: 'Pulse Wave',
    description: 'Narrow pulse wave',
    generate: (): WaveformPoint[] => {
      const points: WaveformPoint[] = [];
      for (let i = 0; i <= 100; i += 1) {
        const y = i < 25 ? 80 : 20;
        points.push({ x: i, y });
      }
      return points;
    }
  },
  complex: {
    name: 'Complex Wave',
    description: 'Multi-harmonic complex wave',
    generate: (): WaveformPoint[] => {
      const points: WaveformPoint[] = [];
      for (let i = 0; i <= 100; i += 2) {
        const fundamental = Math.sin((i / 100) * 2 * Math.PI);
        const harmonic2 = 0.5 * Math.sin((i / 100) * 4 * Math.PI);
        const harmonic3 = 0.3 * Math.sin((i / 100) * 6 * Math.PI);
        const y = 50 + 25 * (fundamental + harmonic2 + harmonic3);
        points.push({ x: i, y: Math.max(10, Math.min(90, y)) });
      }
      return points;
    }
  },
  bass: {
    name: 'Bass Wave',
    description: 'Deep bass-focused wave',
    generate: (): WaveformPoint[] => {
      const points: WaveformPoint[] = [];
      for (let i = 0; i <= 100; i += 2) {
        const base = Math.sin((i / 100) * 2 * Math.PI);
        const sub = 0.7 * Math.sin((i / 100) * Math.PI);
        const y = 50 + 30 * (base + sub);
        points.push({ x: i, y: Math.max(10, Math.min(90, y)) });
      }
      return points;
    }
  }
};

export function WaveformPresets({ onLoadPreset }: WaveformPresetsProps) {
  return (
    <Card className="bg-[var(--synth-panel)] border-[var(--synth-gray)]">
      <CardHeader>
        <CardTitle className="text-lg font-semibold flex items-center text-white">
          <Zap className="mr-2 text-yellow-500" size={20} />
          Waveform Presets
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          {Object.entries(presets).map(([key, preset]) => (
            <Button
              key={key}
              onClick={() => onLoadPreset(preset.generate())}
              variant="outline"
              className="bg-[var(--synth-dark)] hover:bg-[var(--synth-accent)] transition-colors border-[var(--synth-gray)] text-gray-300 hover:text-white p-3 h-auto flex flex-col items-start"
            >
              <div className="font-medium text-sm">{preset.name}</div>
              <div className="text-xs text-gray-500 mt-1 text-left">{preset.description}</div>
            </Button>
          ))}
        </div>
        <div className="text-xs text-gray-500 text-center mt-4">
          Click any preset to load it into the waveform canvas
        </div>
      </CardContent>
    </Card>
  );
}