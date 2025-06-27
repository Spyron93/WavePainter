import { useState, useEffect, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Slider } from '@/components/ui/slider';
import { Play, Pause, Square, RotateCcw } from 'lucide-react';
import { getFrequency } from '@/lib/waveform-utils';

interface StepSequencerProps {
  onNoteOn: (note: string, frequency: number) => void;
  onNoteOff: (note: string) => void;
  envelope: any;
  octave: number;
}

const sequencerNotes = ['C', 'D', 'E', 'F', 'G', 'A', 'B', 'C'];

export function StepSequencer({ onNoteOn, onNoteOff, envelope, octave }: StepSequencerProps) {
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentStep, setCurrentStep] = useState(0);
  const [tempo, setTempo] = useState(120);
  const [pattern, setPattern] = useState<boolean[][]>(
    Array(8).fill(null).map(() => Array(16).fill(false))
  );
  const [activeNotes, setActiveNotes] = useState<string[]>([]);

  const toggleStep = (trackIndex: number, stepIndex: number) => {
    setPattern(prev => {
      const newPattern = [...prev];
      newPattern[trackIndex] = [...newPattern[trackIndex]];
      newPattern[trackIndex][stepIndex] = !newPattern[trackIndex][stepIndex];
      return newPattern;
    });
  };

  const clearPattern = () => {
    setPattern(Array(8).fill(null).map(() => Array(16).fill(false)));
  };

  const generateRandomPattern = () => {
    setPattern(prev => 
      prev.map(track => 
        track.map(() => Math.random() > 0.7)
      )
    );
  };

  const playStep = useCallback(() => {
    if (!isPlaying) return;

    // Stop previous notes
    activeNotes.forEach(note => onNoteOff(note));

    const newActiveNotes: string[] = [];

    // Check each track for the current step
    pattern.forEach((track, trackIndex) => {
      if (track[currentStep]) {
        const note = sequencerNotes[trackIndex];
        const noteWithOctave = `${note}${octave + Math.floor(trackIndex / 4)}`;
        const frequency = getFrequency(note, octave + Math.floor(trackIndex / 4));
        
        onNoteOn(noteWithOctave, frequency);
        newActiveNotes.push(noteWithOctave);
      }
    });

    setActiveNotes(newActiveNotes);
    setCurrentStep(prev => (prev + 1) % 16);
  }, [isPlaying, currentStep, pattern, octave, onNoteOn, onNoteOff, activeNotes]);

  useEffect(() => {
    if (!isPlaying) return;

    const interval = setInterval(playStep, (60 / tempo / 4) * 1000); // 16th notes
    return () => clearInterval(interval);
  }, [playStep, tempo, isPlaying]);

  const togglePlayback = () => {
    if (isPlaying) {
      // Stop all notes
      activeNotes.forEach(note => onNoteOff(note));
      setActiveNotes([]);
    }
    setIsPlaying(!isPlaying);
    setCurrentStep(0);
  };

  return (
    <Card className="bg-[var(--synth-panel)] border-[var(--synth-gray)]">
      <CardHeader>
        <CardTitle className="text-lg font-semibold flex items-center text-white">
          <Square className="mr-2 text-[var(--synth-green)]" size={20} />
          Step Sequencer
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <Button
              onClick={togglePlayback}
              className={`${isPlaying ? 'bg-red-600 hover:bg-red-700' : 'bg-[var(--synth-accent)] hover:bg-blue-500'} transition-colors text-white`}
            >
              {isPlaying ? <Pause className="w-4 h-4 mr-2" /> : <Play className="w-4 h-4 mr-2" />}
              {isPlaying ? 'Stop' : 'Start'}
            </Button>
            
            <Button
              onClick={clearPattern}
              variant="outline"
              size="sm"
              className="bg-[var(--synth-gray)] hover:bg-red-600 transition-colors border-[var(--synth-gray)]"
            >
              <RotateCcw className="w-4 h-4 mr-1" />
              Clear
            </Button>
            
            <Button
              onClick={generateRandomPattern}
              variant="outline"
              size="sm"
              className="bg-[var(--synth-gray)] hover:bg-[var(--synth-accent)] transition-colors border-[var(--synth-gray)]"
            >
              Random
            </Button>
          </div>

          <div className="space-y-1">
            <label className="text-xs font-medium text-gray-300">Tempo: {tempo} BPM</label>
            <Slider
              value={[tempo]}
              onValueChange={([value]) => setTempo(value)}
              min={80}
              max={180}
              step={1}
              className="w-32"
            />
          </div>
        </div>

        {/* Step indicators */}
        <div className="flex justify-center space-x-1 mb-4">
          {Array.from({ length: 16 }, (_, i) => (
            <div
              key={i}
              className={`w-3 h-3 rounded-full transition-colors ${
                i === currentStep && isPlaying
                  ? 'bg-[var(--synth-accent)] ring-2 ring-[var(--synth-accent)] ring-opacity-50'
                  : i % 4 === 0
                  ? 'bg-[var(--synth-green)]'
                  : 'bg-[var(--synth-gray)]'
              }`}
            />
          ))}
        </div>

        {/* Pattern grid */}
        <div className="space-y-1">
          {pattern.map((track, trackIndex) => (
            <div key={trackIndex} className="flex items-center space-x-1">
              <div className="w-8 text-xs text-gray-400 font-medium">
                {sequencerNotes[trackIndex]}
                {octave + Math.floor(trackIndex / 4)}
              </div>
              <div className="flex space-x-1">
                {track.map((isActive, stepIndex) => (
                  <button
                    key={stepIndex}
                    onClick={() => toggleStep(trackIndex, stepIndex)}
                    className={`w-6 h-6 rounded transition-all ${
                      isActive
                        ? 'bg-[var(--synth-accent)] shadow-lg'
                        : 'bg-[var(--synth-gray)] hover:bg-[var(--synth-accent)] hover:opacity-50'
                    } ${
                      stepIndex === currentStep && isPlaying
                        ? 'ring-2 ring-white ring-opacity-50'
                        : ''
                    }`}
                  />
                ))}
              </div>
            </div>
          ))}
        </div>

        <div className="text-xs text-gray-500 text-center mt-4">
          Click the squares to create patterns • White dots mark beat positions
        </div>
      </CardContent>
    </Card>
  );
}