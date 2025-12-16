import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { GROUPS } from "@/data/groupConfig";
import { GroupConfig } from "@/types/boss";

interface GroupSelectorProps {
  onSelectGroup: (groupConfig: GroupConfig) => void;
}

export const GroupSelector = ({ onSelectGroup }: GroupSelectorProps) => {
  const allGroups = Object.entries(GROUPS);

  const renderGroupSection = (title: string, groups: [string, GroupConfig][], sectionClass: string) => (
    <div className={`space-y-4 ${sectionClass}`}>
      <h2 className="text-2xl font-bold text-center mb-6">{title}</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {groups.map(([key, group]) => (
          <Card key={key} className="boss-row-hover border-2 hover:border-groups-${group.colorVar}">
            <CardContent className="p-0">
              <Button
                variant="ghost"
                className="w-full h-full p-6 flex flex-col items-center space-y-3 text-lg font-semibold hover:bg-transparent"
                onClick={() => onSelectGroup(group)}
                style={{
                  '--group-color': `hsl(var(--${group.colorVar}))`,
                } as React.CSSProperties}
              >
                <span className="text-4xl">{group.icon}</span>
                <span 
                  className="text-xl font-bold"
                  style={{ color: 'var(--group-color)' }}
                >
                  {group.name}
                </span>
              </Button>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-background to-muted/20 p-6">
      <div className="max-w-6xl mx-auto">
        {/* 主標題 */}
        <div className="text-center mb-12">
          <h1 className="text-5xl font-bold mb-4 bg-gradient-to-r from-primary to-primary/70 bg-clip-text text-transparent">
            ⚔️ AION2 Boss追蹤器
          </h1>
          <p className="text-xl text-muted-foreground">
            選擇你的伺服器開始追蹤Boss重生時間
          </p>
        </div>

        <div className="space-y-16">
          {/* 布里特拉伺服器 */}
          {renderGroupSection("⚔️ 布里特拉伺服器", allGroups, "")}
        </div>

        {/* 使用說明 */}
        <Card className="mt-16 border-2 border-dashed">
          <CardContent className="p-8">
            <h3 className="text-2xl font-bold mb-4 text-center">📋 使用說明</h3>
            <div className="grid md:grid-cols-2 gap-6 text-muted-foreground">
              <div>
                <h4 className="font-semibold text-foreground mb-2">基本操作：</h4>
                <ul className="space-y-1 text-sm">
                  <li>• 點擊群組按鈕進入Boss追蹤器</li>
                  <li>• 點擊Boss表格行快速更新擊殺時間</li>
                  <li>• 支援即時倒數計時功能</li>
                  <li>• 顯示台灣時區正確時間</li>
                </ul>
              </div>
              <div>
                <h4 className="font-semibold text-foreground mb-2">功能特色：</h4>
                <ul className="space-y-1 text-sm">
                  <li>• 響應式設計適配所有裝置</li>
                  <li>• 每個群組獨立數據儲存</li>
                  <li>• 個性化主題色彩設計</li>
                  <li>• 直覺式操作介面</li>
                </ul>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};