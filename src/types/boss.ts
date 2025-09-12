export interface Boss {
  name: string;
  respawnMinutes: number;
  lastKilled: string | null;
}

export interface BossData {
  [bossName: string]: Boss;
}

export interface GroupConfig {
  name: string;
  icon: string;
  colorVar: string;
  filePrefix: string;
}

export enum BossStatus {
  ALIVE = 'alive',
  DEAD = 'dead', 
  RESPAWNING = 'respawning'
}

export interface BossWithStatus extends Boss {
  status: BossStatus;
  timeUntilRespawn?: number; // 剩餘秒數
  formattedRespawnTime?: string; // 格式化的重生時間
}