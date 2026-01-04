import React from 'react';
import { View, Image, ScrollView, StyleSheet, Dimensions } from 'react-native';
import { useTheme } from '@/src/context/ThemeContext';
import { Chip } from 'react-native-paper';
import { User, Sparkles, Sun, Cloud, Home } from 'lucide-react-native';
import Animated, { FadeIn } from 'react-native-reanimated';
import { ViewMode, FilterItem } from '../types';
import { appTheme } from '@/src/theme/appTheme';
import { Text } from 'react-native';

interface PreviewSectionProps {
  imageUri: string;
  mode: ViewMode;
  filters: FilterItem[];
  currentFilter: string | null;
  onFilterSelect: (filterId: string) => void;
}

const { width: screenWidth } = Dimensions.get('window');

const PreviewSection: React.FC<PreviewSectionProps> = ({
  imageUri,
  mode,
  filters,
  currentFilter,
  onFilterSelect,
}) => {
  const { colors } = useTheme();
  const { spacing, radius, fonts } = appTheme.tokens;

  const getFilterIcon = (iconName: string) => {
    switch (iconName) {
      case 'sparkles': return <Sparkles size={14} />;
      case 'sun': return <Sun size={14} />;
      case 'cloud': return <Cloud size={14} />;
      case 'home': return <Home size={14} />;
      default: return <Sparkles size={14} />;
    }
  };

  // Helper function to determine if a filter should be active
  const isFilterActive = (filterId: string) => {
    const isNoneFilter = filterId === 'none';
    
    // In AR mode: "none" is active when no filter is selected OR when "none" is explicitly selected
    if (mode === 'ar') {
      if (isNoneFilter) {
        return currentFilter === null || currentFilter === 'none';
      }
      return currentFilter === filterId && currentFilter !== 'none';
    }
    
    // In 3D mode: only show as active if explicitly selected (3D mode might not show filters at all)
    return currentFilter === filterId;
  };

  return (
    <Animated.View
      entering={FadeIn.duration(600)}
      style={[
        styles.previewContainer, 
        { 
          borderColor: colors.border,
          backgroundColor: colors.surface,
          borderRadius: radius.lg,
          marginHorizontal: spacing.lg,
          marginBottom: spacing.lg,
          shadowColor: '#000',
          shadowOffset: { width: 0, height: 2 },
          shadowOpacity: 0.1,
          shadowRadius: 6,
          elevation: 3,
        }
      ]}
    >
      <View style={[
        styles.header,
        { 
          borderBottomColor: colors.border,
          borderBottomWidth: StyleSheet.hairlineWidth,
          paddingHorizontal: spacing.md,
          paddingVertical: spacing.sm,
          backgroundColor: colors.card,
        }
      ]}>
        <View style={styles.headerContent}>
          <View style={[
            styles.modeIndicator,
            { 
              backgroundColor: colors.primary + '15',
              borderRadius: radius.sm,
              paddingHorizontal: spacing.sm,
              paddingVertical: 4
            }
          ]}>
            <Text style={[
              styles.modeText,
              { 
                color: colors.primary,
                fontFamily: fonts.medium,
                fontSize: 12,
                letterSpacing: 0.5,
                lineHeight: 16,
              }
            ]}>
              {mode === 'ar' ? 'AR Preview' : '3D Preview'}
            </Text>
          </View>
        </View>
      </View>
      
      <View style={[
        styles.previewArea, 
        { 
          padding: spacing.md,
          backgroundColor: colors.card,
        }
      ]}>
        <View style={[
          styles.avatarWithClothing, 
          { 
            backgroundColor: colors.background,
            borderRadius: radius.md,
            shadowColor: '#000',
            shadowOffset: { width: 0, height: 2 },
            shadowOpacity: 0.1,
            shadowRadius: 4,
            elevation: 2,
          }
        ]}>
          <View style={[
            styles.avatarSilhouette, 
            { 
              borderColor: colors.primary + '20',
              borderWidth: StyleSheet.hairlineWidth,
              borderRadius: radius.full,
              backgroundColor: colors.background + '80',
            }
          ]}>
            <User size={120} color={colors.primary + '30'} />
          </View>
          
          <Image
            source={{ uri: imageUri }}
            style={[
              styles.clothingOverlay,
              { 
                borderRadius: radius.full,
                borderColor: colors.border,
                borderWidth: 1,
              }
            ]}
            resizeMode="contain"
          />
          
          <View style={[
            styles.gradientOverlay,
            { 
              borderRadius: radius.full,
              borderWidth: 2,
              borderColor: colors.primary + '20',
              backgroundColor: colors.primary + '05',
            }
          ]} />
        </View>

        {mode === 'ar' && filters.length > 0 && (
          <View style={[
            styles.filtersContainer,
            { 
              backgroundColor: colors.surface,
              borderRadius: radius.md,
              paddingHorizontal: spacing.sm,
              paddingVertical: spacing.sm,
              marginTop: spacing.sm,
            }
          ]}>
            <Text style={[
              styles.filtersTitle,
              { 
                color: colors.textTertiary,
                fontFamily: fonts.medium,
                fontSize: 13,
                marginBottom: spacing.xs,
                textAlign: 'center',
                letterSpacing: 0.3,
              }
            ]}>
              ENVIRONMENT FILTERS
            </Text>
            
            <ScrollView 
              horizontal 
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={[
                styles.filtersScrollContent,
                { paddingHorizontal: 2, paddingVertical: 4 }
              ]}
            >
              {filters.map(filter => {
                const isActive = isFilterActive(filter.id);
                
                return (
                  <Chip
                    key={filter.id}
                    selected={isActive}
                    onPress={() => onFilterSelect(filter.id)}
                    style={[
                      styles.filterChip,
                      { 
                        backgroundColor: isActive 
                          ? colors.primary 
                          : colors.surface,
                        borderColor: isActive 
                          ? colors.primary 
                          : colors.border,
                        borderRadius: radius.full,
                        marginRight: spacing.xs,
                        borderWidth: StyleSheet.hairlineWidth,
                        height: 32,
                        minHeight: 32,
                      }
                    ]}
                    textStyle={[
                      styles.filterText,
                      { 
                        color: isActive 
                          ? colors.background 
                          : colors.textSecondary,
                        fontFamily: isActive 
                          ? fonts.medium 
                          : fonts.regular,
                        fontSize: 11,
                        marginHorizontal: 6,
                        lineHeight: 16,
                      }
                    ]}
                    icon={() => {
                      const icon = getFilterIcon(filter.icon);
                      return React.cloneElement(icon, {
                        size: 12,
                        color: isActive 
                          ? colors.background 
                          : colors.textSecondary
                      });
                    }}
                    mode={isActive ? "flat" : "outlined"}
                  >
                    {filter.name}
                  </Chip>
                );
              })}
            </ScrollView>
          </View>
        )}
        
        {mode === '3d' && (
          <View style={[
            styles.controlsHint,
            { 
              backgroundColor: colors.surface,
              paddingHorizontal: spacing.md,
              paddingVertical: spacing.xs,
              borderRadius: radius.full,
              marginTop: spacing.md,
              borderWidth: StyleSheet.hairlineWidth,
              borderColor: colors.border,
            }
          ]}>
            <Text style={[
              styles.hintText,
              { 
                color: colors.textTertiary,
                fontFamily: fonts.regular,
                fontSize: 11,
                textAlign: 'center',
                letterSpacing: 0.3,
              }
            ]}>
              Drag to rotate • Pinch to zoom
            </Text>
          </View>
        )}
      </View>
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  previewContainer: {
    borderWidth: StyleSheet.hairlineWidth,
    overflow: 'hidden',
  },
  header: {
    borderBottomWidth: StyleSheet.hairlineWidth,
  },
  headerContent: {
    flexDirection: 'row',
    justifyContent: 'center',
  },
  modeIndicator: {
    alignSelf: 'flex-start',
  },
  modeText: {
    fontSize: 12,
    letterSpacing: 0.5,
  },
  previewArea: {
    alignItems: 'center',
  },
  avatarWithClothing: {
    width: screenWidth - 80,
    height: 320,
    justifyContent: 'center',
    alignItems: 'center',
    position: 'relative',
    marginBottom: 0,
  },
  avatarSilhouette: {
    width: 240,
    height: 240,
    justifyContent: 'center',
    alignItems: 'center',
    position: 'relative',
  },
  clothingOverlay: {
    position: 'absolute',
    width: '85%',
    height: '85%',
    zIndex: 2,
  },
  gradientOverlay: {
    position: 'absolute',
    width: 250,
    height: 250,
    zIndex: 1,
  },
  filtersContainer: {
    width: '100%',
    marginTop: 0,
  },
  filtersTitle: {
    fontSize: 13,
    textAlign: 'center',
  },
  filtersScrollContent: {
    paddingHorizontal: 4,
    paddingVertical: 8,
  },
  filterChip: {
    height: 32,
    borderWidth: StyleSheet.hairlineWidth,
  },
  filterText: {
    fontSize: 11,
    marginHorizontal: 4,
  },
  controlsHint: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    marginTop: 12,
  },
  hintText: {
    fontSize: 11,
    textAlign: 'center',
  },
});

export default PreviewSection;