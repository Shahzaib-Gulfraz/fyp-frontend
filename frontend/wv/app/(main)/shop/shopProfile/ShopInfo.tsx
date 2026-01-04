import React from 'react';
import { View, StyleSheet, ScrollView } from 'react-native';
import { Card, Text, IconButton } from 'react-native-paper';
import { Ionicons } from '@expo/vector-icons';
import { useTheme, AppTokensType, ThemeColors } from '@/src/context/ThemeContext';

interface ShopInfoProps {
  shop: {
    name: string;
    description: string;
    contact: {
      email: string;
      phone: string;
      address: string;
      website?: string;
    };
    hours: Record<string, string>;
    social: {
      instagram?: string;
      facebook?: string;
      twitter?: string;
    };
    stats: {
      products: number | { total: number; published: number; draft: number };
      followers: number;
      following: number;
      rating: number;
    };
  };
}

const ShopInfo: React.FC<ShopInfoProps> = ({ shop }) => {
  const { colors, tokens } = useTheme();
  const styles = makeStyles(colors, tokens);

  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      {/* Description Card */}
      <Card style={styles.card}>
        <Card.Content>
          <View style={styles.cardHeader}>
            <Text style={styles.cardTitle}>About Shop</Text>
          </View>
          <Text style={styles.description}>{shop.description}</Text>
        </Card.Content>
      </Card>

      {/* Contact Information */}
      <Card style={styles.card}>
        <Card.Content>
          <View style={styles.cardHeader}>
            <Text style={styles.cardTitle}>Contact Information</Text>
          </View>

          <View style={styles.contactItem}>
            <Ionicons name="mail-outline" size={20} color={colors.primary} />
            <Text style={styles.contactText}>{shop.contact.email}</Text>
          </View>

          <View style={styles.contactItem}>
            <Ionicons name="call-outline" size={20} color={colors.primary} />
            <Text style={styles.contactText}>{shop.contact.phone}</Text>
          </View>

          <View style={styles.contactItem}>
            <Ionicons name="location-outline" size={20} color={colors.primary} />
            <Text style={styles.contactText}>{shop.contact.address}</Text>
          </View>

          {shop.contact.website && (
            <View style={styles.contactItem}>
              <Ionicons name="globe-outline" size={20} color={colors.primary} />
              <Text style={styles.contactText}>{shop.contact.website}</Text>
            </View>
          )}
        </Card.Content>
      </Card>

      {/* Business Hours */}
      <Card style={styles.card}>
        <Card.Content>
          <View style={styles.cardHeader}>
            <Text style={styles.cardTitle}>Business Hours</Text>
          </View>

          {Object.entries(shop.hours).map(([day, hours]) => (
            <View key={day} style={styles.hoursRow}>
              <Text style={styles.hoursDay}>{day}</Text>
              <Text style={styles.hoursTime}>{hours}</Text>
            </View>
          ))}
        </Card.Content>
      </Card>

      {/* Social Media */}
      <Card style={styles.card}>
        <Card.Content>
          <View style={styles.cardHeader}>
            <Text style={styles.cardTitle}>Follow Us</Text>
          </View>

          <View style={styles.socialContainer}>
            {shop.social.instagram && (
              <IconButton icon="instagram" iconColor="#E4405F" size={24} onPress={() => {}} />
            )}
            {shop.social.facebook && (
              <IconButton icon="facebook" iconColor="#1877F2" size={24} onPress={() => {}} />
            )}
            {shop.social.twitter && (
              <IconButton icon="twitter" iconColor="#1DA1F2" size={24} onPress={() => {}} />
            )}
          </View>
        </Card.Content>
      </Card>

      {/* Statistics */}
      <Card style={styles.card}>
        <Card.Content>
          <View style={styles.cardHeader}>
            <Text style={styles.cardTitle}>Shop Statistics</Text>
          </View>

          <View style={styles.statsGrid}>
            <View style={styles.statItem}>
              <Text style={styles.statValue}>
                {typeof shop.stats.products === 'number' ? shop.stats.products : shop.stats.products.total}
              </Text>
              <Text style={styles.statLabel}>Products</Text>
            </View>

            <View style={styles.statItem}>
              <Text style={styles.statValue}>{shop.stats.followers}</Text>
              <Text style={styles.statLabel}>Followers</Text>
            </View>

            <View style={styles.statItem}>
              <Text style={styles.statValue}>{shop.stats.following}</Text>
              <Text style={styles.statLabel}>Following</Text>
            </View>

            <View style={styles.statItem}>
              <View style={styles.ratingContainer}>
                <Ionicons name="star" size={16} color="#FFD700" />
                <Text style={styles.statValue}>{shop.stats.rating.toFixed(1)}</Text>
              </View>
              <Text style={styles.statLabel}>Rating</Text>
            </View>
          </View>
        </Card.Content>
      </Card>
    </ScrollView>
  );
};

const makeStyles = (colors: ThemeColors, tokens: AppTokensType) =>
  StyleSheet.create({
    container: {
      flex: 1,
    },
    card: {
      marginHorizontal: tokens.spacing.md,
      marginTop: tokens.spacing.sm,
      marginBottom: tokens.spacing.xs,
      backgroundColor: colors.surface,
    },
    cardHeader: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      marginBottom: tokens.spacing.md,
    },
    cardTitle: {
      fontSize: 18,
      fontWeight: '700',
      color: colors.text,
    },
    description: {
      fontSize: 14,
      lineHeight: 20,
      color: colors.textSecondary,
    },
    contactItem: {
      flexDirection: 'row',
      alignItems: 'center',
      marginBottom: tokens.spacing.sm,
    },
    contactText: {
      marginLeft: tokens.spacing.sm,
      fontSize: 14,
      color: colors.textSecondary,
      flex: 1,
    },
    hoursRow: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      paddingVertical: tokens.spacing.sm,
      borderBottomWidth: 1,
      borderBottomColor: colors.divider,
    },
    hoursDay: {
      fontSize: 14,
      color: colors.text,
    },
    hoursTime: {
      fontSize: 14,
      color: colors.textSecondary,
      fontWeight: '500',
    },
    socialContainer: {
      flexDirection: 'row',
      justifyContent: 'center',
      paddingVertical: tokens.spacing.sm,
    },
    statsGrid: {
      flexDirection: 'row',
      flexWrap: 'wrap',
      justifyContent: 'space-between',
    },
    statItem: {
      alignItems: 'center',
      width: '48%',
      marginBottom: tokens.spacing.md,
    },
    statValue: {
      fontSize: 24,
      fontWeight: '700',
      color: colors.text,
      marginBottom: 4,
    },
    statLabel: {
      fontSize: 12,
      color: colors.textSecondary,
    },
    ratingContainer: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 4,
    },
  });

export default ShopInfo;
