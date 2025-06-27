import { useState } from 'react';
import { Slider } from '@/components/ui/slider';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Sliders, Filter, Sparkles } from 'lucide-react';

interface ControlPanelProps {
  envelope: {
    attack: number;
    decay: number;
    sustain: number;
    release: number;
  };
  onEnvelopeChange: (envelope: any) => void;
  filter: {
    cutoff: number;
    resonance: number;
    type: string;
  };
  onFilterChange: (filter: any) => void;
  effects: {
    reverb: number;
    delay: number;
    distortion: number;
    chorus: number;
  };
  onEffectsChange: (effects: any) => void;
}

export function ControlPanel({
  envelope,
  onEnvelopeChange,
  filter,
  onFilterChange,
  effects,
  onEffectsChange
}: ControlPanelProps) {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
      {/* Envelope Controls */}
      <Card className="bg-[var(--synth-panel)] border-[var(--synth-gray)]">
        <CardHeader>
          <CardTitle className="text-lg font-semibold flex items-center text-white">
            <Sliders className="mr-2 text-[var(--synth-accent)]" size={20} />
            Envelope
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="space-y-2">
            <label className="text-sm font-medium text-gray-300">Attack: {envelope.attack}ms</label>
            <Slider
              value={[envelope.attack]}
              onValueChange={([value]) => onEnvelopeChange({ ...envelope, attack: value })}
              max={2000}
              step={10}
              className="w-full"
            />
          </div>
          <div className="space-y-2">
            <label className="text-sm font-medium text-gray-300">Decay: {envelope.decay}ms</label>
            <Slider
              value={[envelope.decay]}
              onValueChange={([value]) => onEnvelopeChange({ ...envelope, decay: value })}
              max={2000}
              step={10}
              className="w-full"
            />
          </div>
          <div className="space-y-2">
            <label className="text-sm font-medium text-gray-300">Sustain: {envelope.sustain}%</label>
            <Slider
              value={[envelope.sustain]}
              onValueChange={([value]) => onEnvelopeChange({ ...envelope, sustain: value })}
              max={100}
              step={1}
              className="w-full"
            />
          </div>
          <div className="space-y-2">
            <label className="text-sm font-medium text-gray-300">Release: {envelope.release}ms</label>
            <Slider
              value={[envelope.release]}
              onValueChange={([value]) => onEnvelopeChange({ ...envelope, release: value })}
              max={3000}
              step={10}
              className="w-full"
            />
          </div>
        </CardContent>
      </Card>

      {/* Filter Controls */}
      <Card className="bg-[var(--synth-panel)] border-[var(--synth-gray)]">
        <CardHeader>
          <CardTitle className="text-lg font-semibold flex items-center text-white">
            <Filter className="mr-2 text-[var(--synth-green)]" size={20} />
            Filter
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="space-y-2">
            <label className="text-sm font-medium text-gray-300">Cutoff: {filter.cutoff}Hz</label>
            <Slider
              value={[filter.cutoff]}
              onValueChange={([value]) => onFilterChange({ ...filter, cutoff: value })}
              min={20}
              max={20000}
              step={10}
              className="w-full"
            />
          </div>
          <div className="space-y-2">
            <label className="text-sm font-medium text-gray-300">Resonance: {filter.resonance}</label>
            <Slider
              value={[filter.resonance]}
              onValueChange={([value]) => onFilterChange({ ...filter, resonance: value })}
              min={0}
              max={30}
              step={0.1}
              className="w-full"
            />
          </div>
          <div className="space-y-2">
            <label className="text-sm font-medium text-gray-300">Filter Type</label>
            <Select value={filter.type} onValueChange={(value) => onFilterChange({ ...filter, type: value })}>
              <SelectTrigger className="bg-[var(--synth-dark)] border-[var(--synth-gray)] text-white">
                <SelectValue />
              </SelectTrigger>
              <SelectContent className="bg-[var(--synth-dark)] border-[var(--synth-gray)]">
                <SelectItem value="lowpass">Low Pass</SelectItem>
                <SelectItem value="highpass">High Pass</SelectItem>
                <SelectItem value="bandpass">Band Pass</SelectItem>
                <SelectItem value="notch">Notch</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Effects */}
      <Card className="bg-[var(--synth-panel)] border-[var(--synth-gray)]">
        <CardHeader>
          <CardTitle className="text-lg font-semibold flex items-center text-white">
            <Sparkles className="mr-2 text-purple-400" size={20} />
            Effects
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <label className="text-sm font-medium text-gray-300">Reverb: {effects.reverb}%</label>
            <Slider
              value={[effects.reverb]}
              onValueChange={([value]) => onEffectsChange({ ...effects, reverb: value })}
              max={100}
              step={1}
              className="w-full"
            />
          </div>
          <div className="space-y-2">
            <label className="text-sm font-medium text-gray-300">Delay: {effects.delay}%</label>
            <Slider
              value={[effects.delay]}
              onValueChange={([value]) => onEffectsChange({ ...effects, delay: value })}
              max={100}
              step={1}
              className="w-full"
            />
          </div>
          <div className="space-y-2">
            <label className="text-sm font-medium text-gray-300">Distortion: {effects.distortion}%</label>
            <Slider
              value={[effects.distortion]}
              onValueChange={([value]) => onEffectsChange({ ...effects, distortion: value })}
              max={100}
              step={1}
              className="w-full"
            />
          </div>
          <div className="space-y-2">
            <label className="text-sm font-medium text-gray-300">Chorus: {effects.chorus}%</label>
            <Slider
              value={[effects.chorus]}
              onValueChange={([value]) => onEffectsChange({ ...effects, chorus: value })}
              max={100}
              step={1}
              className="w-full"
            />
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
