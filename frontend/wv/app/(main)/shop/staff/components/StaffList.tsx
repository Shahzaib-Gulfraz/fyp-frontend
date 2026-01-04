// StaffList.tsx
import React from "react";
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
} from "react-native";
import { User, Trash2 } from "lucide-react-native";

import { useTheme } from "@/src/context/ThemeContext";
import type { AppThemeColors } from "@/src/theme/appTheme";

interface StaffMember {
  id: string;
  name: string;
  email: string;
  role: string;
  status?: "active" | "pending";
  joinDate?: string;
}

interface StaffListProps {
  staffMembers: StaffMember[];
  onRemoveStaff: (staffId: string, staffName: string) => void;
}

export const StaffList: React.FC<StaffListProps> = ({
  staffMembers,
  onRemoveStaff,
}) => {
  const { theme } = useTheme();
  const colors = theme.colors as AppThemeColors;
  const styles = getStyles(colors);

  const renderStaffMember = ({ item }: { item: StaffMember }) => {
    const isPending = item.status === "pending";

    return (
      <View style={styles.staffCard}>
        <View style={styles.staffInfo}>
          {/* Avatar */}
          <View style={styles.avatar}>
            <User size={20} color={colors.primary} />
          </View>

          {/* Info */}
          <View style={styles.staffDetails}>
            <View style={styles.staffHeader}>
              <Text style={styles.staffName}>{item.name}</Text>
            </View>

            <Text style={styles.staffEmail}>{item.email}</Text>

            <View style={styles.staffMeta}>
              <View style={styles.roleBadge}>
                <Text style={styles.roleText}>Staff</Text>
              </View>

              {isPending && (
                <View style={styles.pendingBadge}>
                  <Text style={styles.pendingText}>Pending</Text>
                </View>
              )}

              {item.joinDate && (
                <Text style={styles.joinDate}>
                  Joined {item.joinDate}
                </Text>
              )}
            </View>
          </View>
        </View>

        {/* Actions */}
        {item.id !== "1" && (
          <View style={styles.staffActions}>
            <TouchableOpacity
              style={styles.actionButton}
              onPress={() =>
                onRemoveStaff(item.id, item.name)
              }
              hitSlop={10}
            >
              <Trash2 size={18} color={colors.error} />
            </TouchableOpacity>
          </View>
        )}
      </View>
    );
  };

  return (
    <View style={styles.section}>
      <View style={styles.sectionHeader}>
        <Text style={styles.sectionTitle}>
          Staff Members
        </Text>
        <Text style={styles.sectionSubtitle}>
          {staffMembers.length} people
        </Text>
      </View>

      <FlatList
        data={staffMembers}
        renderItem={renderStaffMember}
        keyExtractor={(item) => item.id}
        scrollEnabled={false}
        contentContainerStyle={styles.staffList}
      />
    </View>
  );
};

/* ===================== STYLES ===================== */

const getStyles = (colors: AppThemeColors) =>
  StyleSheet.create({
    section: {
      marginBottom: 24,
    },

    sectionHeader: {
      flexDirection: "row",
      justifyContent: "space-between",
      alignItems: "center",
      paddingHorizontal: 20,
      marginBottom: 16,
    },

    sectionTitle: {
      fontSize: 18,
      fontFamily: "Inter_700Bold",
      color: colors.text,
    },

    sectionSubtitle: {
      fontSize: 14,
      fontFamily: "Inter_400Regular",
      color: colors.textSecondary,
    },

    staffList: {
      paddingHorizontal: 20,
      gap: 12,
    },

    staffCard: {
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "space-between",
      backgroundColor: colors.surface,
      borderWidth: 1,
      borderColor: colors.border,
      borderRadius: 16,
      padding: 16,
      marginBottom: 12,
    },

    staffInfo: {
      flexDirection: "row",
      alignItems: "center",
      flex: 1,
    },

    avatar: {
      width: 48,
      height: 48,
      borderRadius: 24,
      backgroundColor: `${colors.primary}20`,
      justifyContent: "center",
      alignItems: "center",
      marginRight: 12,
    },

    staffDetails: {
      flex: 1,
    },

    staffHeader: {
      flexDirection: "row",
      alignItems: "center",
      marginBottom: 4,
    },

    staffName: {
      fontSize: 16,
      fontFamily: "Inter_600SemiBold",
      color: colors.text,
      marginRight: 6,
    },

    staffEmail: {
      fontSize: 14,
      fontFamily: "Inter_400Regular",
      color: colors.textSecondary,
      marginBottom: 8,
    },

    staffMeta: {
      flexDirection: "row",
      alignItems: "center",
      flexWrap: "wrap",
      gap: 8,
    },

    roleBadge: {
      paddingHorizontal: 8,
      paddingVertical: 4,
      borderRadius: 12,
      backgroundColor: `${colors.primary}20`,
    },

    roleText: {
      fontSize: 11,
      fontFamily: "Inter_600SemiBold",
      color: colors.primary,
    },

    pendingBadge: {
      backgroundColor: colors.warning + "20",
      paddingHorizontal: 8,
      paddingVertical: 4,
      borderRadius: 12,
    },

    pendingText: {
      fontSize: 11,
      fontFamily: "Inter_600SemiBold",
      color: colors.warning,
    },

    joinDate: {
      fontSize: 11,
      fontFamily: "Inter_400Regular",
      color: colors.textTertiary,
    },

    staffActions: {
      flexDirection: "row",
      marginLeft: 12,
    },

    actionButton: {
      width: 36,
      height: 36,
      borderRadius: 18,
      backgroundColor: colors.surfaceVariant,
      borderWidth: 1,
      borderColor: colors.border,
      justifyContent: "center",
      alignItems: "center",
    },
  });
