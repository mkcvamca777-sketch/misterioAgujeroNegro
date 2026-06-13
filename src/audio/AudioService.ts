import { Howl } from 'howler';
import { StorageService } from '../utils/StorageService';

export class AudioService {
  private static music: Howl | null = null;
  private static sounds: Record<string, Howl> = {};
  private static musicVolume: number = 0.5;
  private static sfxVolume: number = 0.8;
  private static isMuted: boolean = false;
  private static synthCtx: AudioContext | null = null;
  private static blackHoleOsc: OscillatorNode | null = null;
  private static blackHoleGain: GainNode | null = null;

  public static initialize(): void {
    const { music, sfx } = StorageService.getVolumeSettings();
    this.musicVolume = music;
    this.sfxVolume = sfx;

    // Preload background music
    this.music = new Howl({
      src: ['assets/audio/music_ambient.mp3'],
      loop: true,
      html5: true, // Use HTML5 Audio for large files
      volume: this.musicVolume,
      onloaderror: () => {
        console.warn('Could not load ambient music file. Synthesizer fallback active.');
      }
    });

    // Preload SFX
    const sfxList = {
      click: 'assets/audio/sfx_click.mp3',
      correct: 'assets/audio/sfx_correct.mp3',
      incorrect: 'assets/audio/sfx_incorrect.mp3',
      achievement: 'assets/audio/sfx_achievement.mp3'
    };

    for (const [key, path] of Object.entries(sfxList)) {
      this.sounds[key] = new Howl({
        src: [path],
        volume: this.sfxVolume,
        onloaderror: () => {
          console.warn(`Could not load sound effect: ${key}. Synthesizer fallback active.`);
        }
      });
    }
  }

  // Fallback sound synthesizer using Web Audio API
  private static playSynthSound(type: 'click' | 'correct' | 'incorrect' | 'achievement'): void {
    try {
      if (!this.synthCtx) {
        this.synthCtx = new (window.AudioContext || (window as any).webkitAudioContext)();
      }
      
      const ctx = this.synthCtx;
      if (ctx.state === 'suspended') {
        ctx.resume();
      }

      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.connect(gain);
      gain.connect(ctx.destination);

      const now = ctx.currentTime;
      gain.gain.setValueAtTime(0, now);

      if (type === 'click') {
        osc.type = 'sine';
        osc.frequency.setValueAtTime(400, now);
        osc.frequency.exponentialRampToValueAtTime(150, now + 0.1);
        gain.gain.linearRampToValueAtTime(this.sfxVolume * 0.3, now);
        gain.gain.linearRampToValueAtTime(0, now + 0.1);
        osc.start(now);
        osc.stop(now + 0.1);
      } else if (type === 'correct') {
        osc.type = 'triangle';
        osc.frequency.setValueAtTime(523.25, now); // C5
        osc.frequency.setValueAtTime(659.25, now + 0.08); // E5
        osc.frequency.setValueAtTime(783.99, now + 0.16); // G5
        gain.gain.linearRampToValueAtTime(this.sfxVolume * 0.4, now);
        gain.gain.linearRampToValueAtTime(this.sfxVolume * 0.4, now + 0.2);
        gain.gain.linearRampToValueAtTime(0, now + 0.35);
        osc.start(now);
        osc.stop(now + 0.35);
      } else if (type === 'incorrect') {
        osc.type = 'sawtooth';
        osc.frequency.setValueAtTime(220, now); // A3
        osc.frequency.linearRampToValueAtTime(110, now + 0.25); // A2
        gain.gain.linearRampToValueAtTime(this.sfxVolume * 0.4, now);
        gain.gain.linearRampToValueAtTime(0, now + 0.3);
        osc.start(now);
        osc.stop(now + 0.3);
      } else if (type === 'achievement') {
        osc.type = 'sine';
        osc.frequency.setValueAtTime(392.00, now); // G4
        osc.frequency.setValueAtTime(523.25, now + 0.1); // C5
        osc.frequency.setValueAtTime(659.25, now + 0.2); // E5
        osc.frequency.setValueAtTime(783.99, now + 0.3); // G5
        osc.frequency.setValueAtTime(1046.50, now + 0.4); // C6
        gain.gain.linearRampToValueAtTime(this.sfxVolume * 0.5, now);
        gain.gain.linearRampToValueAtTime(this.sfxVolume * 0.5, now + 0.5);
        gain.gain.linearRampToValueAtTime(0, now + 0.75);
        osc.start(now);
        osc.stop(now + 0.75);
      }
    } catch (e) {
      console.error('Synthesizer sound failed', e);
    }
  }

  public static playBlackHoleHum(): void {
    if (this.isMuted) return;
    try {
      if (!this.synthCtx) {
        this.synthCtx = new (window.AudioContext || (window as any).webkitAudioContext)();
      }
      
      const ctx = this.synthCtx;
      if (ctx.state === 'suspended') {
        ctx.resume();
      }
      
      if (this.blackHoleOsc) return; // Already playing

      this.blackHoleOsc = ctx.createOscillator();
      this.blackHoleGain = ctx.createGain();
      
      // Deep bass hum (around 50 Hz)
      this.blackHoleOsc.type = 'sine';
      this.blackHoleOsc.frequency.setValueAtTime(50, ctx.currentTime);
      
      this.blackHoleGain.gain.setValueAtTime(0, ctx.currentTime);
      // Fade in over 2 seconds
      this.blackHoleGain.gain.linearRampToValueAtTime(this.sfxVolume * 0.6, ctx.currentTime + 2);
      
      this.blackHoleOsc.connect(this.blackHoleGain);
      this.blackHoleGain.connect(ctx.destination);
      
      this.blackHoleOsc.start();
    } catch (e) {
      console.error('Black hole hum failed', e);
    }
  }

  public static stopBlackHoleHum(): void {
    if (this.blackHoleOsc && this.blackHoleGain && this.synthCtx) {
      const ctx = this.synthCtx;
      // Fade out over 1 second
      this.blackHoleGain.gain.linearRampToValueAtTime(0, ctx.currentTime + 1);
      
      try {
        this.blackHoleOsc.stop(ctx.currentTime + 1);
      } catch (e) {
        // Ignore if already stopped
      }
      
      this.blackHoleOsc = null;
      this.blackHoleGain = null;
    }
  }

  public static playMusic(): void {
    if (this.isMuted) return;
    if (this.music) {
      if (!this.music.playing()) {
        this.music.play();
      }
    }
  }

  public static stopMusic(): void {
    if (this.music) {
      this.music.stop();
    }
  }

  public static playSFX(key: 'click' | 'correct' | 'incorrect' | 'achievement'): void {
    if (this.isMuted) return;
    const sound = this.sounds[key];
    if (sound && sound.state() === 'loaded') {
      sound.play();
    } else {
      // Fallback synthesizer
      this.playSynthSound(key);
    }
  }

  public static setMusicVolume(volume: number): void {
    this.musicVolume = volume;
    if (this.music) {
      this.music.volume(volume);
    }
    StorageService.setVolumeSettings(this.musicVolume, this.sfxVolume);
  }

  public static setSFXVolume(volume: number): void {
    this.sfxVolume = volume;
    for (const sound of Object.values(this.sounds)) {
      sound.volume(volume);
    }
    StorageService.setVolumeSettings(this.musicVolume, this.sfxVolume);
  }

  public static getMusicVolume(): number {
    return this.musicVolume;
  }

  public static getSFXVolume(): number {
    return this.sfxVolume;
  }

  public static toggleMute(): boolean {
    this.isMuted = !this.isMuted;
    if (this.isMuted) {
      if (this.music) this.music.pause();
    } else {
      if (this.music) this.music.play();
    }
    return this.isMuted;
  }
}
