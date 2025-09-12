import { useState } from 'react';
import { GroupSelector } from "@/components/GroupSelector";
import { BossTracker } from "@/components/BossTracker";
import { GroupConfig } from "@/types/boss";

const Index = () => {
  const [selectedGroup, setSelectedGroup] = useState<GroupConfig | null>(null);

  const handleSelectGroup = (groupConfig: GroupConfig) => {
    setSelectedGroup(groupConfig);
  };

  const handleBack = () => {
    setSelectedGroup(null);
  };

  if (selectedGroup) {
    return <BossTracker groupConfig={selectedGroup} onBack={handleBack} />;
  }

  return <GroupSelector onSelectGroup={handleSelectGroup} />;
};

export default Index;
