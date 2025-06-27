import { useState, useEffect, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Slider } from '@/components/ui/slider';
import { Play, Pause, RotateCw } from 'lucide-react';
import { getFrequency } from '@/lib/waveform-utils';

interface ArpeggiatorProps {
  onNoteOn: (note: string, frequency: number) => void;
  onNoteOff: (note: string) => void;
  envelope: any;
  octave: number;
}

const arpeggioPatterns = {
  up: [0, 1, 2, 3],
  down: [3, 2, 1, 0],
  upDown: [0, 1, 2, 3, 2, 1],
  random: [0, 2, 1, 3],
  chord: [0, 1, 2, 3] // All at once
};

const scales = {
  major: [0, 2, 4, 5, 7, 9, 11],
  minor: [0, 2, 3, 5, 7, 8, 10],
  pentatonic: [0, 2, 4, 7, 9],
  blues: [0, 3, 5, 6, 7, 10],
  dorian: [0, 2, 3, 5, 7, 9, 10]
};

export function Arpeggiator({ onNoteOn, onNoteOff, envelope, octave }: ArpeggiatorProps) {
  const [isPlaying, setIsPlaying] = useState(false);
  const [pattern, setPattern] = useState<keyof typeof arpeggioPatterns>('up');
  const [scale, setScale] = useState<keyof typeof scales>('major');
  const [rootNote, setRootNote] = useState('C');
  const [tempo, setTempo] = useState(120);
  const [currentStep, setCurrentStep] = useState(0);
  const [activeNotes, setActiveNotes] = useState<string[]>([]);

  const notes = ['C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B'];

  const generateArpeggioNotes = useCallback(() => {
    const rootIndex = notes.indexOf(rootNote);
    const scaleIntervals = scales[scale];
    const patternSteps = arpeggioPatterns[pattern];
    
    return patternSteps.map(step => {
      const scaleIndex = step % scaleIntervals.length;
      const octaveOffset = Math.floor(step / scaleIntervals.length);
      const noteIndex = (rootIndex + scaleIntervals[scaleIndex]) % 12;
      const noteOctave = octave + octaveOffset;
      return `${notes[noteIndex]}${noteOctave}`;
    });
  }, [rootNote, scale, pattern, octave]);

  const playStep = useCallback(() => {
    if (!isPlaying) return;

    // Stop previous notes
    activeNotes.forEach(note => onNoteOff(note));

    const arpeggioNotes = generateArpeggioNotes();
    const currentNote = arpeggioNotes[currentStep % arpeggioNotes.length];
    
    if (pattern === 'chord') {
      // Play all notes together for chord pattern
      const chordNotes = arpeggioNotes.slice(0, 4);
      chordNotes.forEach(note => {
        const frequency = getFrequency(note.slice(0, -1), parseInt(note.slice(-1)));
        onNoteOn(note, frequency);
      });
      setActiveNotes(chordNotes);
    } else {
      // Play single note for arpeggio patterns
      const frequency = getFrequency(currentNote.slice(0, -1), parseInt(currentNote.slice(-1)));
      onNoteOn(currentNote, frequency);
      setActiveNotes([currentNote]);
    }

    setCurrentStep(prev => (prev + 1) % arpeggioNotes.length);
  }, [isPlaying, currentStep, generateArpeggioNotes, pattern, onNoteOn, onNoteOff, activeNotes]);

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
          <RotateCw className="mr-2 text-[var(--synth-accent)]" size={20} />
          Arpeggiator
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex items-center justify-between">
          <Button
            onClick={togglePlayback}
            className={`${isPlaying ? 'bg-red-600 hover:bg-red-700' : 'bg-[var(--synth-accent)] hover:bg-blue-500'} transition-colors text-white`}
          >
            {isPlaying ? <Pause className="w-4 h-4 mr-2" /> : <Play className="w-4 h-4 mr-2" />}
            {isPlaying ? 'Stop' : 'Start'}
          </Button>
          
          <div className="flex items-center space-x-2">
            {Array.from({ length: 8 }, (_, i) => (
              <div
                key={i}
                className={`w-2 h-2 rounded-full transition-colors ${
                  i === currentStep % 8 && isPlaying
                    ? 'bg-[var(--synth-accent)]'
                    : 'bg-[var(--synth-gray)]'
                }`}
              />
            ))}
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <label className="text-sm font-medium text-gray-300">Root Note</label>
            <Select value={rootNote} onValueChange={setRootNote}>
              <SelectTrigger className="bg-[var(--synth-dark)] border-[var(--synth-gray)] text-white">
                <SelectValue />
              </SelectTrigger>
              <SelectContent className="bg-[var(--synth-dark)] border-[var(--synth-gray)]">
                {notes.map(note => (
                  <SelectItem key={note} value={note}>{note}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium text-gray-300">Scale</label>
            <Select value={scale} onValueChange={(value) => setScale(value as keyof typeof scales)}>
              <SelectTrigger className="bg-[var(--synth-dark)] border-[var(--synth-gray)] text-white">
                <SelectValue />
              </SelectTrigger>
              <SelectContent className="bg-[var(--synth-dark)] border-[var(--synth-gray)]">
                <SelectItem value="major">Major</SelectItem>
                <SelectItem value="minor">Minor</SelectItem>
                <SelectItem value="pentatonic">Pentatonic</SelectItem>
                <SelectItem value="blues">Blues</SelectItem>
                <SelectItem value="dorian">Dorian</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        <div className="space-y-2">
          <label className="text-sm font-medium text-gray-300">Pattern</label>
          <Select value={pattern} onValueChange={(value) => setPattern(value as keyof typeof arpeggioPatterns)}>
            <SelectTrigger className="bg-[var(--synth-dark)] border-[var(--synth-gray)] text-white">
              <SelectValue />
            </SelectTrigger>
            <SelectContent className="bg-[var(--synth-dark)] border-[var(--synth-gray)]">
              <SelectItem value="up">Up</SelectItem>
              <SelectItem value="down">Down</SelectItem>
              <SelectItem value="upDown">Up & Down</SelectItem>
              <SelectItem value="random">Random</SelectItem>
              <SelectItem value="chord">Chord</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <label className="text-sm font-medium text-gray-300">Tempo: {tempo} BPM</label>
          <Slider
            value={[tempo]}
            onValueChange={([value]) => setTempo(value)}
            min={60}
            max={200}
            step={1}
            className="w-full"
          />
        </div>
      </CardContent>
    </Card>
  );
}