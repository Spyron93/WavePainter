import { useCallback, useEffect, useState } from 'react';
import { getFrequency } from '@/lib/waveform-utils';

interface VirtualKeyboardProps {
  onNoteOn: (note: string, frequency: number) => void;
  onNoteOff: (note: string) => void;
  octave: number;
  onOctaveChange: (octave: number) => void;
  volume: number;
  onVolumeChange: (volume: number) => void;
}

const whiteKeys = ['C', 'D', 'E', 'F', 'G', 'A', 'B'];
const blackKeys = ['C#', 'D#', '', 'F#', 'G#', 'A#', ''];

const keyboardMap: { [key: string]: string } = {
  'a': 'C',
  'w': 'C#',
  's': 'D',
  'e': 'D#',
  'd': 'E',
  'f': 'F',
  't': 'F#',
  'g': 'G',
  'y': 'G#',
  'h': 'A',
  'u': 'A#',
  'j': 'B',
  'k': 'C', // Next octave
};

export function VirtualKeyboard({
  onNoteOn,
  onNoteOff,
  octave,
  onOctaveChange,
  volume,
  onVolumeChange
}: VirtualKeyboardProps) {
  const [activeNotes, setActiveNotes] = useState<Set<string>>(new Set());
  const [pressedKeys, setPressedKeys] = useState<Set<string>>(new Set());

  const playNote = useCallback((note: string) => {
    const noteKey = `${note}${octave}`;
    const frequency = getFrequency(note, octave);
    setActiveNotes(prev => new Set(prev).add(noteKey));
    onNoteOn(noteKey, frequency);
  }, [octave, onNoteOn]);

  const stopNote = useCallback((note: string) => {
    const noteKey = `${note}${octave}`;
    setActiveNotes(prev => {
      const newSet = new Set(prev);
      newSet.delete(noteKey);
      return newSet;
    });
    onNoteOff(noteKey);
  }, [octave, onNoteOff]);

  // Computer keyboard support
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.repeat) return;
      
      const key = event.key.toLowerCase();
      const note = keyboardMap[key];
      
      if (note && !pressedKeys.has(key)) {
        setPressedKeys(prev => new Set(prev).add(key));
        playNote(note);
      }
    };

    const handleKeyUp = (event: KeyboardEvent) => {
      const key = event.key.toLowerCase();
      const note = keyboardMap[key];
      
      if (note && pressedKeys.has(key)) {
        setPressedKeys(prev => {
          const newSet = new Set(prev);
          newSet.delete(key);
          return newSet;
        });
        stopNote(note);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);

    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
    };
  }, [playNote, stopNote, pressedKeys]);

  const handleMouseDown = useCallback((note: string) => {
    playNote(note);
  }, [playNote]);

  const handleMouseUp = useCallback((note: string) => {
    stopNote(note);
  }, [stopNote]);

  const handleMouseLeave = useCallback((note: string) => {
    stopNote(note);
  }, [stopNote]);

  return (
    <div className="bg-[var(--synth-panel)] rounded-2xl p-8">
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold mb-2">Virtual Keyboard</h2>
          <p className="text-gray-400">Play your custom waveform using the keyboard below or your computer keys.</p>
        </div>
        <div className="flex items-center space-x-4">
          <div className="flex items-center space-x-2">
            <label className="text-sm font-medium text-gray-300">Octave</label>
            <select
              value={octave}
              onChange={(e) => onOctaveChange(parseInt(e.target.value))}
              className="bg-[var(--synth-dark)] border border-[var(--synth-gray)] rounded-lg p-2 text-sm text-white"
            >
              <option value={3}>3</option>
              <option value={4}>4</option>
              <option value={5}>5</option>
            </select>
          </div>
          <div className="flex items-center space-x-2">
            <label className="text-sm font-medium text-gray-300">Volume</label>
            <input
              type="range"
              min="0"
              max="100"
              value={volume}
              onChange={(e) => onVolumeChange(parseInt(e.target.value))}
              className="synth-slider"
            />
          </div>
        </div>
      </div>

      <div className="relative bg-[var(--synth-dark)] rounded-xl p-6 overflow-x-auto">
        <div className="flex relative min-w-max">
          {/* White Keys */}
          {whiteKeys.map((note, index) => {
            const noteKey = `${note}${octave}`;
            const isActive = activeNotes.has(noteKey);
            
            return (
              <button
                key={`white-${note}-${index}`}
                className={`piano-key bg-[var(--synth-light)] hover:bg-gray-200 border-2 border-[var(--synth-gray)] w-12 h-40 rounded-b-lg mr-1 relative z-10 ${
                  isActive ? 'bg-[var(--synth-accent)] text-white' : 'text-[var(--synth-dark)]'
                }`}
                onMouseDown={() => handleMouseDown(note)}
                onMouseUp={() => handleMouseUp(note)}
                onMouseLeave={() => handleMouseLeave(note)}
                onTouchStart={() => handleMouseDown(note)}
                onTouchEnd={() => handleMouseUp(note)}
              >
                <span className="absolute bottom-2 left-1/2 transform -translate-x-1/2 text-xs font-medium">
                  {note}
                </span>
              </button>
            );
          })}
        </div>

        {/* Black Keys */}
        <div className="absolute top-6 left-6 flex">
          {blackKeys.map((note, index) => {
            if (!note) {
              return <div key={`spacer-${index}`} className="w-12 mr-1" />;
            }
            
            const noteKey = `${note}${octave}`;
            const isActive = activeNotes.has(noteKey);
            
            return (
              <button
                key={`black-${note}-${index}`}
                className={`piano-key black bg-[var(--synth-dark)] hover:bg-[var(--synth-gray)] border border-[var(--synth-gray)] w-8 h-24 rounded-b-lg mr-5 relative z-20 ${
                  isActive ? 'bg-[var(--synth-accent)]' : ''
                }`}
                style={{ marginLeft: index === 0 ? '32px' : '0' }}
                onMouseDown={() => handleMouseDown(note)}
                onMouseUp={() => handleMouseUp(note)}
                onMouseLeave={() => handleMouseLeave(note)}
                onTouchStart={() => handleMouseDown(note)}
                onTouchEnd={() => handleMouseUp(note)}
              />
            );
          })}
        </div>

        <div className="mt-4 text-center text-sm text-gray-500">
          <p>Use computer keys: A S D F G H J K L for white keys, W E T Y U for black keys</p>
        </div>
      </div>
    </div>
  );
}
