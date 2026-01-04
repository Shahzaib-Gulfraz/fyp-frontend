export type SettingType = 'navigation' | 'switch' | 'action' | 'info';

export interface SettingItem {
  id: string;
  title: string;
  description: string;
  icon: React.ReactNode;
  type: SettingType;
  route?: string;
  value?: boolean;
  color?: string;
}

export interface SettingsSection {
  title: string;
  icon: React.ReactNode;
  items: SettingItem[];
}