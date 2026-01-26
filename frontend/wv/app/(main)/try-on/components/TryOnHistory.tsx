import React from 'react';
import { View, Text, Image, StyleSheet, TouchableOpacity } from 'react-native';
import { useTheme } from '@/src/context/ThemeContext';
import { Chip } from 'react-native-paper';
import { RotateCw, ChevronRight, Calendar, Tag, Camera } from 'lucide-react-native';
import { TryOnHistoryItem } from '../types';
import { appTheme } from '@/src/theme/appTheme';

interface TryOnHistoryProps {
  items: TryOnHistoryItem[];
  onTryAgain: (item: TryOnHistoryItem) => void;
  onItemPress?: (item: TryOnHistoryItem) => void;
}

const TryOnHistory: React.FC<TryOnHistoryProps> = ({
  items,
  onTryAgain,
  onItemPress
}) => {
  const { colors } = useTheme();
  const { spacing, radius, fonts } = appTheme.tokens;

  // Don't render if no items
  if (!items || items.length === 0) {
    return null;
  }

  const getGradientBackground = () => {
    return {
      backgroundColor: colors.background,
      borderTopWidth: 1,
      borderTopColor: colors.divider,
    };
  };

  return (
    <View
      style={[
        styles.container,
        getGradientBackground(),
        { paddingBottom: spacing.xl }
      ]}
    >
      <View style={[styles.header, { paddingHorizontal: spacing.lg }]}>
        <Text style={[
          styles.title,
          {
            color: colors.text,
            fontFamily: fonts.semiBold,
          }
        ]}>
          Recent Try-Ons
        </Text>
        <Text style={[
          styles.subtitle,
          {
            color: colors.textSecondary,
            fontFamily: fonts.regular,
          }
        ]}>
          {items.length} items
        </Text>
      </View>

      <View style={[styles.list, { paddingHorizontal: spacing.lg }]}>
        {items.map((item, index) => (
          <Animated.View
            key={item.id}
            entering={FadeIn.duration(400).delay(index * 100)}
          >
            <TouchableOpacity
              activeOpacity={0.7}
              onPress={() => onItemPress?.(item)}
              style={[
                styles.card,
                {
                  backgroundColor: colors.card,
                  borderRadius: radius.lg,
                  borderColor: colors.divider,
                  marginBottom: spacing.md,
                },
                index === 0 && { marginTop: spacing.sm },
                index === items.length - 1 && { marginBottom: 0 }
              ]}
            >
              <View style={styles.cardContent}>
                <View style={styles.imageWrapper}>
                  <Image
                    source={{ uri: item.image }}
                    style={[
                      styles.image,
                      { borderRadius: radius.sm }
                    ]}
                    resizeMode="cover"
                  />
                  <View style={[
                    styles.imageOverlay,
                    { backgroundColor: colors.primary + '10' }
                  ]} />
                </View>

                <View style={styles.details}>
                  <View style={styles.nameRow}>
                    <Text style={[
                      styles.name,
                      {
                        color: colors.text,
                        fontFamily: fonts.semiBold,
                      }
                    ]}>
                      {item.name}
                    </Text>
                    {onItemPress && (
                      <ChevronRight
                        size={16}
                        color={colors.textSecondary}
                        style={styles.chevron}
                      />
                    )}
                  </View>

                  <View style={styles.metaRow}>
                    <View style={styles.metaItem}>
                      <Tag size={12} color={colors.textSecondary} />
                      <Text style={[
                        styles.brand,
                        {
                          color: colors.textSecondary,
                          fontFamily: fonts.medium,
                        }
                      ]}>
                        {item.brand}
                      </Text>
                    </View>

                    <View style={styles.metaItem}>
                      <Calendar size={12} color={colors.textSecondary} />
                      <Text style={[
                        styles.date,
                        {
                          color: colors.textSecondary,
                          fontFamily: fonts.regular,
                        }
                      ]}>
                        {item.date}
                      </Text>
                    </View>
                  </View>

                  <View style={styles.priceRow}>
                    <Text style={[
                      styles.price,
                      {
                        color: colors.text,
                        fontFamily: fonts.bold,
                      }
                    ]}>
                      {item.price}
                    </Text>

                    <TouchableOpacity
                      onPress={() => onTryAgain(item)}
                      style={[
                        styles.tryAgainButton,
                        {
                          backgroundColor: colors.primary + '10',
                          borderColor: colors.primary,
                          borderRadius: radius.full,
                        }
                      ]}
                    >
                      <Camera
                        size={14}
                        color={colors.primary}
                        style={styles.tryAgainIcon}
                      />
                      <Text style={[
                        styles.tryAgainText,
                        {
                          color: colors.primary,
                          fontFamily: fonts.medium,
                        }
                      ]}>
                        Post
                      </Text>
                    </TouchableOpacity>
                  </View>
                </View>
              </View>
            </TouchableOpacity>
          </View>
        ))}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    // Removed flex: 1 to prevent empty space
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(0,0,0,0.05)',
  },
  title: {
    fontSize: 20,
    fontWeight: '700',
  },
  subtitle: {
    fontSize: 14,
  },
  list: {
    paddingTop: 12,
  },
  card: {
    borderWidth: 1,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.08,
    shadowRadius: 4,
    elevation: 3,
  },
  cardContent: {
    flexDirection: 'row',
    padding: 12,
  },
  imageWrapper: {
    position: 'relative',
  },
  image: {
    width: 70,
    height: 70,
    marginRight: 12,
  },
  imageOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    borderRadius: 6,
  },
  details: {
    flex: 1,
    justifyContent: 'space-between',
  },
  nameRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 6,
  },
  name: {
    fontSize: 15,
    flex: 1,
    marginRight: 8,
  },
  chevron: {
    marginLeft: 'auto',
  },
  metaRow: {
    flexDirection: 'row',
    marginBottom: 10,
  },
  metaItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginRight: 16,
  },
  brand: {
    fontSize: 13,
    marginLeft: 4,
  },
  date: {
    fontSize: 12,
    marginLeft: 4,
  },
  priceRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  price: {
    fontSize: 17,
  },
  tryAgainButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderWidth: 1,
  },
  tryAgainIcon: {
    marginRight: 6,
  },
  tryAgainText: {
    fontSize: 13,
    fontWeight: '600',
  },
});

export default TryOnHistory;