import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { WaveformCanvas } from '@/components/waveform-canvas';
import { VirtualKeyboard } from '@/components/virtual-keyboard';
import { ControlPanel } from '@/components/control-panel';
import { Arpeggiator } from '@/components/arpeggiator';
import { StepSequencer } from '@/components/step-sequencer';
import { WaveformPresets } from '@/components/waveform-presets';
import { useAudioContext } from '@/hooks/use-audio-context';
import { useWaveform } from '@/hooks/use-waveform';
import { Save, Play, Volume2 } from 'lucide-react';

export default function Synthesizer() {
  const {
    isInitialized,
    isActive,
    initialize,
    playNote,
    stopNote,
    updateWaveform,
    setMasterVolume,
    setFilter,
    setEffects
  } = useAudioContext();

  const {
    points,
    isDrawing,
    analysis,
    startDrawing,
    stopDrawing,
    addPoint,
    clearWaveform,
    setWaveformPoints
  } = useWaveform();

  const [octave, setOctave] = useState(4);
  const [volume, setVolume] = useState(75);
  const [envelope, setEnvelope] = useState({
    attack: 100,
    decay: 300,
    sustain: 70,
    release: 500
  });
  const [filterSettings, setFilterSettings] = useState({
    cutoff: 2000,
    resonance: 1,
    type: 'lowpass'
  });
  const [effectsSettings, setEffectsSettings] = useState({
    reverb: 25,
    delay: 15,
    distortion: 0,
    chorus: 20
  });

  // Initialize audio on component mount
  useEffect(() => {
    if (!isInitialized) {
      initialize();
    }
  }, [isInitialized, initialize]);

  // Update master volume
  useEffect(() => {
    setMasterVolume(volume);
  }, [volume, setMasterVolume]);

  // Update waveform in audio engine when points change
  useEffect(() => {
    if (points.length > 0) {
      updateWaveform(points);
    }
  }, [points, updateWaveform]);

  // Update filter settings
  useEffect(() => {
    if (isInitialized) {
      setFilter(filterSettings.cutoff, filterSettings.resonance, filterSettings.type);
    }
  }, [filterSettings, setFilter, isInitialized]);

  // Update effects settings
  useEffect(() => {
    if (isInitialized) {
      setEffects(effectsSettings);
    }
  }, [effectsSettings, setEffects, isInitialized]);

  const handleNoteOn = (note: string, frequency: number) => {
    if (isInitialized) {
      playNote(note, frequency, envelope);
    }
  };

  const handleNoteOff = (note: string) => {
    stopNote(note);
  };

  const handleWaveformUpdate = (newPoints: any[]) => {
    updateWaveform(newPoints);
  };

  return (
    <div className="min-h-screen bg-[var(--synth-dark)] text-[var(--synth-light)]">
      {/* Header */}
      <header className="bg-[var(--synth-panel)] border-b border-[var(--synth-gray)] px-6 py-4">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="w-8 h-8 bg-gradient-to-br from-[var(--synth-accent)] to-[var(--synth-green)] rounded-lg flex items-center justify-center">
              <span className="text-white text-sm">🎵</span>
            </div>
            <h1 className="text-xl font-bold bg-gradient-to-r from-[var(--synth-accent)] to-[var(--synth-green)] bg-clip-text text-transparent">
              WaveForm Synthesizer
            </h1>
          </div>
          <div className="flex items-center space-x-4">
            <Button 
              variant="outline" 
              className="bg-[var(--synth-gray)] hover:bg-[var(--synth-accent)] transition-colors border-[var(--synth-gray)]"
            >
              <Save className="mr-2 w-4 h-4" />
              Save Preset
            </Button>
            <Button className="bg-[var(--synth-accent)] hover:bg-blue-500 transition-colors text-[var(--synth-dark)]">
              <Play className="mr-2 w-4 h-4" />
              Record
            </Button>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto p-6 space-y-8">
        {/* Audio Status Warning */}
        {!isInitialized && (
          <Card className="bg-yellow-900/20 border-yellow-700">
            <CardContent className="pt-6">
              <div className="flex items-center space-x-2">
                <Volume2 className="w-5 h-5 text-yellow-500" />
                <p className="text-yellow-200">
                  Click anywhere or press a key to initialize audio. Web Audio API requires user interaction.
                </p>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Waveform Drawing Section */}
        <section className="bg-[var(--synth-panel)] rounded-2xl p-8 glow-effect">
          <div className="mb-6">
            <h2 className="text-2xl font-bold mb-2">Draw Your Waveform</h2>
            <p className="text-gray-400">Click and drag to create custom waveforms. Your drawing will be converted to audio in real-time.</p>
          </div>
          
          <WaveformCanvas
            points={points}
            isDrawing={isDrawing}
            onStartDrawing={startDrawing}
            onStopDrawing={stopDrawing}
            onAddPoint={addPoint}
            onClearWaveform={clearWaveform}
            onUpdateWaveform={handleWaveformUpdate}
          />

          {/* Waveform Presets */}
          <WaveformPresets
            onLoadPreset={(presetPoints) => {
              setWaveformPoints(presetPoints);
              updateWaveform(presetPoints);
            }}
          />

          {/* Waveform Analysis Display */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
            <Card className="bg-[var(--synth-dark)] border-[var(--synth-gray)]">
              <CardContent className="p-4">
                <h4 className="text-sm font-medium text-gray-400 mb-2">Frequency Spectrum</h4>
                <div className="flex items-end space-x-1 h-16">
                  {Array.from({ length: 8 }, (_, i) => (
                    <div
                      key={i}
                      className="bg-[var(--synth-accent)] w-2 rounded-t"
                      style={{
                        height: `${Math.max(8, (analysis.harmonicRichness / 100) * 64 * Math.random())}px`,
                        opacity: 0.8 - i * 0.1
                      }}
                    />
                  ))}
                </div>
              </CardContent>
            </Card>
            <Card className="bg-[var(--synth-dark)] border-[var(--synth-gray)]">
              <CardContent className="p-4">
                <h4 className="text-sm font-medium text-gray-400 mb-2">Harmonic Content</h4>
                <div className="text-2xl font-bold text-[var(--synth-green)]">{analysis.harmonicRichness}%</div>
                <p className="text-xs text-gray-500">
                  {analysis.harmonicRichness > 70 ? 'Rich harmonics detected' : 
                   analysis.harmonicRichness > 30 ? 'Moderate harmonic content' : 'Simple waveform'}
                </p>
              </CardContent>
            </Card>
            <Card className="bg-[var(--synth-dark)] border-[var(--synth-gray)]">
              <CardContent className="p-4">
                <h4 className="text-sm font-medium text-gray-400 mb-2">Wave Complexity</h4>
                <div className="text-2xl font-bold text-[var(--synth-accent)]">{analysis.complexity}</div>
                <p className="text-xs text-gray-500">
                  {analysis.complexity === 'High' ? 'Complex waveform structure' :
                   analysis.complexity === 'Medium' ? 'Suitable for melodic content' :
                   'Simple harmonic structure'}
                </p>
              </CardContent>
            </Card>
          </div>
        </section>

        {/* Control Panels */}
        <ControlPanel
          envelope={envelope}
          onEnvelopeChange={setEnvelope}
          filter={filterSettings}
          onFilterChange={setFilterSettings}
          effects={effectsSettings}
          onEffectsChange={setEffectsSettings}
        />

        {/* Virtual Keyboard */}
        <VirtualKeyboard
          onNoteOn={handleNoteOn}
          onNoteOff={handleNoteOff}
          octave={octave}
          onOctaveChange={setOctave}
          volume={volume}
          onVolumeChange={setVolume}
        />

        {/* Sequencer and Arpeggiator Section */}
        <section className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <Arpeggiator
            onNoteOn={handleNoteOn}
            onNoteOff={handleNoteOff}
            envelope={envelope}
            octave={octave}
          />
          <StepSequencer
            onNoteOn={handleNoteOn}
            onNoteOff={handleNoteOff}
            envelope={envelope}
            octave={octave}
          />
        </section>

        {/* Status Panel */}
        <section className="bg-[var(--synth-panel)] rounded-xl p-6">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            <div className="text-center">
              <div className="text-2xl font-bold text-[var(--synth-accent)]">
                <Volume2 className="w-8 h-8 mx-auto" />
              </div>
              <p className="text-sm text-gray-400 font-medium">
                {isActive ? 'Audio Active' : 'Audio Inactive'}
              </p>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-[var(--synth-green)]">44.1kHz</div>
              <p className="text-sm text-gray-400 font-medium">Sample Rate</p>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-purple-400">128</div>
              <p className="text-sm text-gray-400 font-medium">Buffer Size</p>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-yellow-400">2.9ms</div>
              <p className="text-sm text-gray-400 font-medium">Latency</p>
            </div>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="bg-[var(--synth-panel)] border-t border-[var(--synth-gray)] mt-12 py-6">
        <div className="max-w-7xl mx-auto px-6 text-center text-gray-400">
          <p className="text-sm">WaveForm Synthesizer - Create, Draw, Play | Web Audio API Powered</p>
        </div>
      </footer>
    </div>
  );
}
