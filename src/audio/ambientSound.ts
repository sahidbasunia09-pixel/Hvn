/**
 * High-end procedural romantic ambient soundscape using Web Audio API.
 * Synthesizes soft, warm acoustic sine/rhodes-style harmony pads in Db Major / F minor,
 * creating an ethereal, cinematic, deeply romantic atmosphere without external assets.
 */

class AmbientSoundEngine {
  private ctx: AudioContext | null = null;
  private isPlaying: boolean = false;
  private masterGain: GainNode | null = null;
  private timerId: number | null = null;

  // Romantic celestial progression: Dbmaj9 -> Bbm9 -> Gbmaj7 -> Abadd9
  private chords = [
    [138.59, 207.65, 261.63, 311.13, 415.30], // Db maj9
    [116.54, 174.61, 233.08, 277.18, 349.23], // Bbm9
    [92.50, 146.83, 185.00, 233.08, 277.18],  // Gb maj7
    [103.83, 155.56, 207.65, 261.63, 311.13], // Ab add9
  ];

  private currentChordIdx = 0;

  public init() {
    if (!this.ctx) {
      const AudioCtx = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      this.ctx = new AudioCtx();
    }
  }

  public async start() {
    this.init();
    if (!this.ctx) return;

    if (this.ctx.state === 'suspended') {
      await this.ctx.resume();
    }

    if (this.isPlaying) return;
    this.isPlaying = true;

    // Create Master Gain with gentle soft clipper
    this.masterGain = this.ctx.createGain();
    this.masterGain.gain.setValueAtTime(0.001, this.ctx.currentTime);
    this.masterGain.gain.exponentialRampToValueAtTime(0.25, this.ctx.currentTime + 3);
    this.masterGain.connect(this.ctx.destination);

    this.playNextPadChord();
  }

  public stop() {
    if (!this.isPlaying || !this.ctx || !this.masterGain) return;
    this.isPlaying = false;

    if (this.timerId !== null) {
      window.clearTimeout(this.timerId);
      this.timerId = null;
    }

    const now = this.ctx.currentTime;
    this.masterGain.gain.setValueAtTime(this.masterGain.gain.value, now);
    this.masterGain.gain.exponentialRampToValueAtTime(0.0001, now + 1.5);

    setTimeout(() => {
      if (!this.isPlaying && this.masterGain) {
        try {
          this.masterGain.disconnect();
        } catch {
          // ignore
        }
      }
    }, 1600);
  }

  public toggle(): boolean {
    if (this.isPlaying) {
      this.stop();
      return false;
    } else {
      this.start();
      return true;
    }
  }

  public getIsPlaying(): boolean {
    return this.isPlaying;
  }

  private playNextPadChord() {
    if (!this.isPlaying || !this.ctx || !this.masterGain) return;

    const chord = this.chords[this.currentChordIdx];
    this.currentChordIdx = (this.currentChordIdx + 1) % this.chords.length;

    const chordDuration = 5.8; // seconds per chord
    const now = this.ctx.currentTime;

    // Convolve / shimmer filter
    const filter = this.ctx.createBiquadFilter();
    filter.type = 'lowpass';
    filter.frequency.setValueAtTime(650, now);
    filter.frequency.exponentialRampToValueAtTime(1100, now + chordDuration * 0.4);
    filter.frequency.exponentialRampToValueAtTime(550, now + chordDuration);
    filter.connect(this.masterGain);

    chord.forEach((freq, i) => {
      if (!this.ctx) return;
      const osc = this.ctx.createOscillator();
      const oscGain = this.ctx.createGain();

      // Sine + warm triangle overtone for organic warmth
      osc.type = i % 2 === 0 ? 'sine' : 'triangle';
      osc.frequency.setValueAtTime(freq, now);

      // Gentle detune for lush chorus depth
      osc.detune.setValueAtTime((Math.random() - 0.5) * 8, now);

      // ADSR Envelope
      const attack = 1.8 + i * 0.2;
      const release = 2.4;
      const peakVolume = 0.045 / (1 + i * 0.25);

      oscGain.gain.setValueAtTime(0.0001, now);
      oscGain.gain.exponentialRampToValueAtTime(peakVolume, now + attack);
      oscGain.gain.setValueAtTime(peakVolume, now + chordDuration - release);
      oscGain.gain.exponentialRampToValueAtTime(0.0001, now + chordDuration + 0.5);

      osc.connect(oscGain);
      oscGain.connect(filter);

      osc.start(now);
      osc.stop(now + chordDuration + 1);
    });

    // Subtle twinkling high note (like a star twinkle)
    if (Math.random() > 0.3) {
      const bellFreq = chord[Math.floor(Math.random() * chord.length)] * 2;
      const bellOsc = this.ctx.createOscillator();
      const bellGain = this.ctx.createGain();

      bellOsc.type = 'sine';
      bellOsc.frequency.setValueAtTime(bellFreq, now + 1.2);

      bellGain.gain.setValueAtTime(0.0001, now + 1.2);
      bellGain.gain.exponentialRampToValueAtTime(0.02, now + 1.3);
      bellGain.gain.exponentialRampToValueAtTime(0.0001, now + 3.8);

      bellOsc.connect(bellGain);
      bellGain.connect(filter);
      bellOsc.start(now + 1.2);
      bellOsc.stop(now + 4.0);
    }

    this.timerId = window.setTimeout(() => {
      this.playNextPadChord();
    }, (chordDuration - 1.2) * 1000);
  }
}

export const ambientSound = new AmbientSoundEngine();
