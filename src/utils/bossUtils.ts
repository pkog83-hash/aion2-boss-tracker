import { Boss, BossWithStatus, BossStatus } from '../types/boss';

export const formatTime = (date: Date): string => {
  return date.toLocaleString('zh-TW', {
    timeZone: 'Asia/Taipei',
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
    hour12: false
  });
};

export const getTaiwanTime = (): Date => {
  return new Date();
};

export const calculateBossStatus = (boss: Boss): BossWithStatus => {
  const now = getTaiwanTime();
  
  if (!boss.lastKilled) {
    return {
      ...boss,
      status: BossStatus.ALIVE,
    };
  }

  const lastKilledTime = new Date(boss.lastKilled);
  const respawnTime = new Date(lastKilledTime.getTime() + boss.respawnMinutes * 60 * 1000);
  const timeDiff = respawnTime.getTime() - now.getTime();

  if (timeDiff <= 0) {
    return {
      ...boss,
      status: BossStatus.ALIVE,
    };
  }

  return {
    ...boss,
    status: BossStatus.RESPAWNING,
    timeUntilRespawn: Math.floor(timeDiff / 1000),
    formattedRespawnTime: formatTime(respawnTime),
  };
};

export const formatCountdown = (seconds: number): string => {
  if (seconds <= 0) return '00:00:00';
  
  const hours = Math.floor(seconds / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);
  const secs = seconds % 60;
  
  return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
};

export const getBossStatusColor = (status: BossStatus): string => {
  switch (status) {
    case BossStatus.ALIVE:
      return 'text-boss-alive';
    case BossStatus.DEAD:
      return 'text-boss-dead';
    case BossStatus.RESPAWNING:
      return 'text-boss-respawning';
    default:
      return 'text-muted-foreground';
  }
};

export const getBossStatusText = (status: BossStatus): string => {
  switch (status) {
    case BossStatus.ALIVE:
      return '存活';
    case BossStatus.DEAD:
      return '死亡';
    case BossStatus.RESPAWNING:
      return '重生中';
    default:
      return '未知';
  }
};