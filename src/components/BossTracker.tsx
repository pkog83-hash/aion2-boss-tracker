import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { ArrowLeft, RefreshCw, Clock, Zap } from "lucide-react";
import { GroupConfig, BossData, BossWithStatus } from "@/types/boss";
import { defaultBossData } from "@/data/bossData";
import { calculateBossStatus, formatTime, getTaiwanTime, formatCountdown, getBossStatusColor, getBossStatusText } from "@/utils/bossUtils";
import { useToast } from "@/hooks/use-toast";

interface BossTrackerProps {
  groupConfig: GroupConfig;
  onBack: () => void;
}

export const BossTracker = ({ groupConfig, onBack }: BossTrackerProps) => {
  const [bossData, setBossData] = useState<BossData>(defaultBossData);
  const [bossesWithStatus, setBossesWithStatus] = useState<BossWithStatus[]>([]);
  const [selectedBoss, setSelectedBoss] = useState<string | null>(null);
  const [customTime, setCustomTime] = useState<string>('');
  const [currentTime, setCurrentTime] = useState<string>('');
  const { toast } = useToast();

  // 從localStorage載入數據
  useEffect(() => {
    const savedData = localStorage.getItem(`boss-data-${groupConfig.filePrefix}`);
    if (savedData) {
      try {
        const parsed = JSON.parse(savedData);
        setBossData(parsed);
      } catch (error) {
        console.error('載入Boss數據失敗:', error);
      }
    }
  }, [groupConfig.filePrefix]);

  // 儲存數據到localStorage
  const saveBossData = (data: BossData) => {
    localStorage.setItem(`boss-data-${groupConfig.filePrefix}`, JSON.stringify(data));
    setBossData(data);
  };

  // 更新Boss狀態和倒數計時
  useEffect(() => {
    const updateBossStatus = () => {
      const updated = Object.values(bossData).map(calculateBossStatus);
      setBossesWithStatus(updated);
      setCurrentTime(formatTime(getTaiwanTime()));
    };

    updateBossStatus();
    const interval = setInterval(updateBossStatus, 1000);
    return () => clearInterval(interval);
  }, [bossData]);

  // 記錄現在時間
  const recordCurrentTime = (bossName: string) => {
    const now = getTaiwanTime().toISOString();
    const newData = {
      ...bossData,
      [bossName]: {
        ...bossData[bossName],
        lastKilled: now,
      },
    };
    saveBossData(newData);
    setSelectedBoss(null);
    toast({
      title: "✅ 更新成功",
      description: `已記錄 ${bossName} 的擊殺時間`,
    });
  };

  // 手動輸入時間
  const recordCustomTime = (bossName: string) => {
    if (!customTime) return;
    
    try {
      let inputDate: Date;
      
      // 支援多種時間格式
      if (customTime.includes('T') || customTime.includes(' ')) {
        inputDate = new Date(customTime);
      } else if (customTime.match(/^\d{1,2}:\d{2}$/)) {
        // HH:MM 格式，使用今天的日期
        const today = getTaiwanTime();
        const [hours, minutes] = customTime.split(':').map(Number);
        inputDate = new Date(today.getFullYear(), today.getMonth(), today.getDate(), hours, minutes);
      } else {
        throw new Error('不支援的時間格式');
      }

      if (isNaN(inputDate.getTime())) {
        throw new Error('無效的時間');
      }

      const newData = {
        ...bossData,
        [bossName]: {
          ...bossData[bossName],
          lastKilled: inputDate.toISOString(),
        },
      };
      saveBossData(newData);
      setSelectedBoss(null);
      setCustomTime('');
      toast({
        title: "✅ 更新成功",
        description: `已記錄 ${bossName} 的擊殺時間`,
      });
    } catch (error) {
      toast({
        title: "❌ 時間格式錯誤",
        description: "請使用 HH:MM 或完整日期時間格式",
        variant: "destructive",
      });
    }
  };

  // 清除Boss記錄
  const clearBossRecord = (bossName: string) => {
    const newData = {
      ...bossData,
      [bossName]: {
        ...bossData[bossName],
        lastKilled: null,
      },
    };
    saveBossData(newData);
    setSelectedBoss(null);
    toast({
      title: "🗑️ 記錄已清除",
      description: `已清除 ${bossName} 的記錄`,
    });
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-background to-muted/20 p-4">
      <div className="max-w-7xl mx-auto">
        {/* 標題欄 */}
        <Card className="mb-6" style={{
          background: `linear-gradient(135deg, hsl(var(--${groupConfig.colorVar})) / 0.1, hsl(var(--${groupConfig.colorVar})) / 0.05)`,
          borderColor: `hsl(var(--${groupConfig.colorVar})) / 0.3`,
        }}>
          <CardHeader className="pb-4">
            <div className="flex items-center justify-between">
              <Button variant="ghost" onClick={onBack} className="flex items-center gap-2">
                <ArrowLeft className="h-4 w-4" />
                返回群組選擇
              </Button>
              <div className="text-center flex-1">
                <CardTitle className="text-3xl font-bold flex items-center justify-center gap-3">
                  <span className="text-4xl">{groupConfig.icon}</span>
                  <span style={{ color: `hsl(var(--${groupConfig.colorVar}))` }}>
                    {groupConfig.name} Boss追蹤器
                  </span>
                </CardTitle>
              </div>
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Clock className="h-4 w-4" />
                {currentTime}
              </div>
            </div>
          </CardHeader>
        </Card>

        {/* Boss表格 */}
        <Card>
          <CardContent className="p-0">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="text-center">Boss名稱</TableHead>
                  <TableHead className="text-center">重生時間</TableHead>
                  <TableHead className="text-center">狀態</TableHead>
                  <TableHead className="text-center">上次擊殺</TableHead>
                  <TableHead className="text-center">倒數計時</TableHead>
                  <TableHead className="text-center">操作</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {bossesWithStatus.map((boss) => (
                  <TableRow 
                    key={boss.name} 
                    className="boss-row-hover cursor-pointer"
                    onClick={() => setSelectedBoss(selectedBoss === boss.name ? null : boss.name)}
                  >
                    <TableCell className="font-semibold text-center">{boss.name}</TableCell>
                    <TableCell className="text-center">
                      {Math.floor(boss.respawnMinutes / 60)}h {boss.respawnMinutes % 60}m
                    </TableCell>
                    <TableCell className="text-center">
                      <span className={`font-semibold ${getBossStatusColor(boss.status)}`}>
                        {getBossStatusText(boss.status)}
                      </span>
                    </TableCell>
                    <TableCell className="text-center text-sm">
                      {boss.lastKilled ? formatTime(new Date(boss.lastKilled)) : '未記錄'}
                    </TableCell>
                    <TableCell className="text-center">
                      {boss.timeUntilRespawn && boss.timeUntilRespawn > 0 ? (
                        <span className="font-mono text-boss-respawning animate-countdown">
                          {formatCountdown(boss.timeUntilRespawn)}
                        </span>
                      ) : (
                        <span className="text-boss-alive font-semibold">可擊殺</span>
                      )}
                    </TableCell>
                    <TableCell className="text-center">
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={(e) => {
                          e.stopPropagation();
                          recordCurrentTime(boss.name);
                        }}
                        className="mr-2"
                      >
                        <Zap className="h-3 w-3 mr-1" />
                        記錄
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>

        {/* 快速操作面板 */}
        {selectedBoss && (
          <Card className="mt-6 border-2 border-dashed">
            <CardHeader>
              <CardTitle className="text-center">
                📝 {selectedBoss} - 快速操作
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex flex-col md:flex-row gap-4 items-center justify-center">
                <Button onClick={() => recordCurrentTime(selectedBoss)} className="flex items-center gap-2">
                  <Clock className="h-4 w-4" />
                  記錄現在時間
                </Button>
                
                <div className="flex items-center gap-2">
                  <Input
                    placeholder="輸入時間 (例: 14:30)"
                    value={customTime}
                    onChange={(e) => setCustomTime(e.target.value)}
                    className="w-40"
                  />
                  <Button 
                    onClick={() => recordCustomTime(selectedBoss)}
                    disabled={!customTime}
                  >
                    手動記錄
                  </Button>
                </div>
                
                <Button 
                  variant="destructive" 
                  onClick={() => clearBossRecord(selectedBoss)}
                >
                  清除記錄
                </Button>
                
                <Button variant="ghost" onClick={() => setSelectedBoss(null)}>
                  取消
                </Button>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
};