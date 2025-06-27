export class AudioEngine {
  private audioContext: AudioContext | null = null;
  private masterGain: GainNode | null = null;
  private activeOscillators: Map<string, { oscillator: OscillatorNode; gain: GainNode; filter?: BiquadFilterNode }> = new Map();
  private waveformData: Float32Array = new Float32Array(1024);
  private customWave: PeriodicWave | null = null;
  private filterNode: BiquadFilterNode | null = null;
  private reverbNode: ConvolverNode | null = null;
  private delayNode: DelayNode | null = null;
  private distortionNode: WaveShaperNode | null = null;

  constructor() {
    this.initializeWaveform();
  }

  async initialize(): Promise<void> {
    if (this.audioContext) return;
    
    this.audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
    this.masterGain = this.audioContext.createGain();
    this.masterGain.gain.value = 0.3;
    
    // Create effect nodes
    this.filterNode = this.audioContext.createBiquadFilter();
    this.filterNode.type = 'lowpass';
    this.filterNode.frequency.value = 2000;
    this.filterNode.Q.value = 1;
    
    this.delayNode = this.audioContext.createDelay();
    this.delayNode.delayTime.value = 0.3;
    
    this.distortionNode = this.audioContext.createWaveShaper();
    this.distortionNode.curve = this.makeDistortionCurve(0);
    this.distortionNode.oversample = '4x';
    
    // Create reverb impulse response
    this.reverbNode = this.audioContext.createConvolver();
    this.reverbNode.buffer = this.createReverbImpulse();
    
    // Create wet/dry mixer for effects
    const dryGain = this.audioContext.createGain();
    const wetGain = this.audioContext.createGain();
    const effectsGain = this.audioContext.createGain();
    
    // Connect dry signal directly to master
    this.filterNode.connect(dryGain);
    dryGain.connect(this.masterGain);
    
    // Connect wet signal through effects
    this.filterNode.connect(this.delayNode);
    this.delayNode.connect(this.distortionNode);
    this.distortionNode.connect(this.reverbNode);
    this.reverbNode.connect(wetGain);
    wetGain.connect(effectsGain);
    effectsGain.connect(this.masterGain);
    
    // Store references for effect mixing
    (this as any).dryGain = dryGain;
    (this as any).wetGain = wetGain;
    (this as any).effectsGain = effectsGain;
    
    this.masterGain.connect(this.audioContext.destination);
    
    // Resume context if suspended (required for some browsers)
    if (this.audioContext.state === 'suspended') {
      await this.audioContext.resume();
    }
  }

  private initializeWaveform(): void {
    // Initialize with a simple sine wave
    for (let i = 0; i < this.waveformData.length; i++) {
      this.waveformData[i] = Math.sin((2 * Math.PI * i) / this.waveformData.length);
    }
  }

  updateWaveform(points: { x: number; y: number }[]): void {
    if (points.length === 0) return;

    // Sort points by x coordinate
    const sortedPoints = points.slice().sort((a, b) => a.x - b.x);

    // Clear the waveform data
    this.waveformData.fill(0);

    // Interpolate points to fill the waveform data
    for (let i = 0; i < this.waveformData.length; i++) {
      const x = (i / this.waveformData.length) * 100; // Convert to percentage
      
      // Find the closest points for interpolation
      let closestPoint1 = sortedPoints[0];
      let closestPoint2 = sortedPoints[sortedPoints.length - 1];
      
      for (let j = 0; j < sortedPoints.length - 1; j++) {
        if (sortedPoints[j].x <= x && sortedPoints[j + 1].x >= x) {
          closestPoint1 = sortedPoints[j];
          closestPoint2 = sortedPoints[j + 1];
          break;
        }
      }

      // Linear interpolation
      if (closestPoint1.x === closestPoint2.x) {
        this.waveformData[i] = (closestPoint1.y - 50) / 50; // Normalize to -1 to 1
      } else {
        const t = (x - closestPoint1.x) / (closestPoint2.x - closestPoint1.x);
        const interpolatedY = closestPoint1.y + t * (closestPoint2.y - closestPoint1.y);
        this.waveformData[i] = (interpolatedY - 50) / 50; // Normalize to -1 to 1
      }
    }

    // Create custom periodic wave using proper frequency domain representation
    if (this.audioContext) {
      const harmonics = 32; // Number of harmonics to use
      const real = new Float32Array(harmonics);
      const imag = new Float32Array(harmonics);
      
      // Set DC component
      real[0] = 0;
      imag[0] = 0;
      
      // Convert waveform to frequency domain using DFT with better harmonic representation
      for (let h = 1; h < harmonics; h++) {
        let realSum = 0;
        let imagSum = 0;
        
        for (let i = 0; i < this.waveformData.length; i++) {
          const angle = (2 * Math.PI * h * i) / this.waveformData.length;
          realSum += this.waveformData[i] * Math.cos(angle);
          imagSum += this.waveformData[i] * Math.sin(angle);
        }
        
        // Amplify harmonic content for more noticeable differences
        const magnitude = Math.sqrt(realSum * realSum + imagSum * imagSum);
        const amplification = Math.pow(1.5, h < 8 ? 1 : 0.5); // Boost lower harmonics more
        
        real[h] = (realSum / this.waveformData.length) * amplification;
        imag[h] = (imagSum / this.waveformData.length) * amplification;
      }

      this.customWave = this.audioContext.createPeriodicWave(real, imag);
      console.log('Custom waveform updated with', points.length, 'points');
    }
  }

  playNote(note: string, frequency: number, envelope: { attack: number; decay: number; sustain: number; release: number }): void {
    if (!this.audioContext || !this.masterGain || !this.filterNode) return;

    // Stop existing note if playing
    this.stopNote(note);

    const oscillator = this.audioContext.createOscillator();
    const gainNode = this.audioContext.createGain();

    // Use custom waveform if available, otherwise use sawtooth
    if (this.customWave) {
      oscillator.setPeriodicWave(this.customWave);
    } else {
      oscillator.type = 'sawtooth';
    }

    oscillator.frequency.value = frequency;
    
    // Connect nodes through the effect chain
    oscillator.connect(gainNode);
    gainNode.connect(this.filterNode);

    // ADSR Envelope
    const now = this.audioContext.currentTime;
    const attackTime = envelope.attack / 1000;
    const decayTime = envelope.decay / 1000;
    const sustainLevel = envelope.sustain / 100;

    gainNode.gain.setValueAtTime(0, now);
    gainNode.gain.linearRampToValueAtTime(1, now + attackTime);
    gainNode.gain.linearRampToValueAtTime(sustainLevel, now + attackTime + decayTime);

    oscillator.start(now);

    this.activeOscillators.set(note, { oscillator, gain: gainNode });
  }

  stopNote(note: string): void {
    const activeNote = this.activeOscillators.get(note);
    if (!activeNote || !this.audioContext) return;

    const { oscillator, gain } = activeNote;
    const now = this.audioContext.currentTime;
    const releaseTime = 0.1; // Default release time

    // Release envelope
    gain.gain.cancelScheduledValues(now);
    gain.gain.setValueAtTime(gain.gain.value, now);
    gain.gain.linearRampToValueAtTime(0, now + releaseTime);

    oscillator.stop(now + releaseTime);
    this.activeOscillators.delete(note);
  }

  stopAllNotes(): void {
    this.activeOscillators.forEach((_, note) => {
      this.stopNote(note);
    });
  }

  setMasterVolume(volume: number): void {
    if (this.masterGain) {
      this.masterGain.gain.value = volume / 100;
    }
  }

  getAudioContext(): AudioContext | null {
    return this.audioContext;
  }

  private makeDistortionCurve(amount: number): Float32Array {
    const samples = 44100;
    const curve = new Float32Array(samples);
    const deg = Math.PI / 180;
    
    for (let i = 0; i < samples; i++) {
      const x = (i * 2) / samples - 1;
      curve[i] = ((3 + amount) * x * 20 * deg) / (Math.PI + amount * Math.abs(x));
    }
    
    return curve;
  }

  private createReverbImpulse(): AudioBuffer {
    if (!this.audioContext) throw new Error('AudioContext not initialized');
    
    const length = this.audioContext.sampleRate * 2; // 2 seconds
    const impulse = this.audioContext.createBuffer(2, length, this.audioContext.sampleRate);
    
    for (let channel = 0; channel < 2; channel++) {
      const channelData = impulse.getChannelData(channel);
      for (let i = 0; i < length; i++) {
        channelData[i] = (Math.random() * 2 - 1) * Math.pow(1 - i / length, 2);
      }
    }
    
    return impulse;
  }

  setFilter(cutoff: number, resonance: number, type: string): void {
    if (this.filterNode) {
      this.filterNode.frequency.value = cutoff;
      this.filterNode.Q.value = resonance;
      this.filterNode.type = type as BiquadFilterType;
    }
  }

  setEffects(effects: { reverb: number; delay: number; distortion: number; chorus: number }): void {
    if (!this.audioContext) return;

    const dryGain = (this as any).dryGain;
    const wetGain = (this as any).wetGain;
    const effectsGain = (this as any).effectsGain;

    if (dryGain && wetGain && effectsGain) {
      // Mix wet/dry signals based on effect levels
      const reverbAmount = effects.reverb / 100;
      const delayAmount = effects.delay / 100;
      const totalWet = Math.max(reverbAmount, delayAmount, effects.distortion / 100);
      
      dryGain.gain.value = 1 - totalWet * 0.7; // Keep some dry signal
      wetGain.gain.value = totalWet * 0.8;
      effectsGain.gain.value = 1;
    }

    // Update delay
    if (this.delayNode) {
      this.delayNode.delayTime.value = (effects.delay / 100) * 0.3; // Max 0.3s delay
    }

    // Update distortion
    if (this.distortionNode) {
      this.distortionNode.curve = this.makeDistortionCurve(effects.distortion * 50);
    }

    console.log('Effects updated:', effects);
  }
}
