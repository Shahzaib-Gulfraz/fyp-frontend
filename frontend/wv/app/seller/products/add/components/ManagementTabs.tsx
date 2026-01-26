// src/components/shop/Tabs.tsx
import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { ArrowLeft } from 'lucide-react-native';
import { useTheme } from '@/src/context/ThemeContext';
import { appTheme } from '@/src/theme/appTheme';

interface TabItem {
  id: 'upload' | 'catalog' | 'manage';
  label: string;
  icon: React.FC<{ size: number; color: string }>;
}

interface TabsProps {
  title: string;
  subtitle?: string;
  showBack?: boolean;
  onBackPress?: () => void;
  rightAction?: React.ReactNode;
  tabs?: TabItem[];
  activeTab?: 'upload' | 'catalog' | 'manage';
  onTabChange?: (tab: 'upload' | 'catalog' | 'manage') => void;
}

const Tabs: React.FC<TabsProps> = ({
  title,
  subtitle,
  showBack,
  onBackPress,
  rightAction,
  tabs = [],
  activeTab,
  onTabChange,
}) => {
  const { colors } = useTheme();
  const { spacing, radius, fonts } = appTheme.tokens;

  return (
    <View>
      {/* Header */}
      <View style={[styles.header, { paddingHorizontal: spacing.md }]}>
        <View style={styles.headerLeft}>
          {showBack && (
            <TouchableOpacity onPress={onBackPress} style={styles.backButton}>
              <ArrowLeft size={20} color={colors.text} />
            </TouchableOpacity>
          )}
          <View>
            <Text style={[styles.title, { color: colors.text, fontFamily: fonts.semiBold }]}>
              {title}
            </Text>
            {subtitle && (
              <Text style={[styles.subtitle, { color: colors.textSecondary, fontFamily: fonts.medium }]}>
                {subtitle}
              </Text>
            )}
          </View>
        </View>
        {rightAction && <View>{rightAction}</View>}
      </View>

      {/* Tab Bar */}
      <View style={[styles.tabContainer, { backgroundColor: colors.surface, borderBottomColor: colors.border }]}>
        {tabs.map(tab => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;

          return (
            <TouchableOpacity
              key={tab.id}
              onPress={() => onTabChange?.(tab.id)}
              style={[styles.tab, isActive && { borderBottomColor: colors.primary, borderBottomWidth: 2 }]}
            >
              <View style={[styles.iconWrapper, { backgroundColor: isActive ? colors.primary + '15' : 'transparent', borderRadius: radius.full }]}>
                <Icon size={20} color={isActive ? colors.primary : colors.textSecondary} />
              </View>
              <Text style={[styles.tabText, { color: isActive ? colors.primary : colors.textSecondary, fontFamily: isActive ? fonts.semiBold : fonts.medium }]}>
                {tab.label}
              </Text>
            </TouchableOpacity>
          );
        })}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 20,
    paddingTop: 8,
    paddingBottom: 16,
    borderBottomWidth: 0,
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  backButton: {
    marginRight: 16,
    padding: 4,
  },
  title: {
    fontSize: 22,
    fontWeight: '700',
    letterSpacing: 0.3,
  },
  subtitle: {
    fontSize: 13,
    marginTop: 2,
    opacity: 0.7,
  },
  tabContainer: {
    flexDirection: 'row',
    borderBottomWidth: 1,
    marginTop: 8,
  },
  tab: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: 14,
  },
  iconWrapper: {
    width: 40,
    height: 40,
    alignItems: 'center',
    justifyContent: 'center',
  },
  tabText: {
    fontSize: 13,
    marginTop: 6,
    fontWeight: '600',
  },
});

export default Tabs;
