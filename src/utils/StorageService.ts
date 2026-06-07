export interface PlayerProgress {
  currentLevel: number;
  unlockedLevels: number;
  badges: string[];
  musicVolume: number;
  sfxVolume: number;
}

const STORAGE_KEY = 'el_misterio_del_agujero_negro_progress';

const DEFAULT_PROGRESS: PlayerProgress = {
  currentLevel: 1,
  unlockedLevels: 1,
  badges: [],
  musicVolume: 0.5,
  sfxVolume: 0.8
};

export class StorageService {
  private static progress: PlayerProgress | null = null;

  private static load(): PlayerProgress {
    if (this.progress) return this.progress;

    try {
      const data = localStorage.getItem(STORAGE_KEY);
      if (data) {
        this.progress = { ...DEFAULT_PROGRESS, ...JSON.parse(data) };
      } else {
        this.progress = { ...DEFAULT_PROGRESS };
        this.save();
      }
    } catch (e) {
      console.error('Error loading progress from LocalStorage:', e);
      this.progress = { ...DEFAULT_PROGRESS };
    }

    return this.progress!;
  }

  public static save(): void {
    if (!this.progress) return;
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(this.progress));
    } catch (e) {
      console.error('Error saving progress to LocalStorage:', e);
    }
  }

  public static getVolumeSettings(): { music: number; sfx: number } {
    const p = this.load();
    return { music: p.musicVolume, sfx: p.sfxVolume };
  }

  public static setVolumeSettings(music: number, sfx: number): void {
    const p = this.load();
    p.musicVolume = music;
    p.sfxVolume = sfx;
    this.save();
  }

  public static getCurrentLevel(): number {
    return this.load().currentLevel;
  }

  public static setCurrentLevel(level: number): void {
    const p = this.load();
    p.currentLevel = level;
    if (level > p.unlockedLevels) {
      p.unlockedLevels = level;
    }
    this.save();
  }

  public static getUnlockedLevels(): number {
    return this.load().unlockedLevels;
  }

  public static getBadges(): string[] {
    return this.load().badges;
  }

  public static unlockBadge(badgeId: string): boolean {
    const p = this.load();
    if (!p.badges.includes(badgeId)) {
      p.badges.push(badgeId);
      this.save();
      return true; // Newly unlocked
    }
    return false; // Already unlocked
  }

  public static resetProgress(): void {
    this.progress = { ...DEFAULT_PROGRESS };
    this.save();
  }
}
