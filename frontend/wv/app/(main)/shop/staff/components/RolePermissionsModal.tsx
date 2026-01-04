// RolePermissionsModal.tsx
import React from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
} from "react-native";
import { X, Shield, Check } from "lucide-react-native";

import { useTheme } from "@/src/context/ThemeContext";
import type { AppThemeColors } from "@/src/theme/appTheme";

interface RolePermissionsModalProps {
  showRolePermissions: boolean;
  onClose: () => void;
}

export const RolePermissionsModal: React.FC<RolePermissionsModalProps> = ({
  showRolePermissions,
  onClose,
}) => {
  const { theme } = useTheme();
  const colors = theme.colors as AppThemeColors;
  const styles = getStyles(colors);

  if (!showRolePermissions) return null;

  const staffPermissions = [
    "View dashboard",
    "Manage assigned tasks",
    "Update task status",
    "View team schedule",
    "Access basic reports",
    "View assigned projects",
  ];

  return (
    <View style={styles.modalOverlay}>
      <View style={styles.modalContent}>
        {/* Header */}
        <View style={styles.modalHeader}>
          <Text style={styles.modalTitle}>Staff Permissions</Text>

          <TouchableOpacity
            style={styles.modalClose}
            onPress={onClose}
          >
            <X size={22} color={colors.textSecondary} />
          </TouchableOpacity>
        </View>

        {/* Permissions */}
        <ScrollView
          style={styles.permissionsList}
          showsVerticalScrollIndicator={false}
        >
          <View style={styles.permissionRole}>
            <View style={styles.permissionRoleHeader}>
              <View style={styles.permissionRoleIcon}>
                <Shield size={16} color={colors.primary} />
              </View>
              <Text style={styles.permissionRoleTitle}>
                Staff Role
              </Text>
            </View>

            <View style={styles.permissions}>
              {staffPermissions.map((permission, index) => (
                <View key={index} style={styles.permissionItem}>
                  <Check size={16} color={colors.success} />
                  <Text style={styles.permissionText}>
                    {permission}
                  </Text>
                </View>
              ))}
            </View>
          </View>
        </ScrollView>
      </View>
    </View>
  );
};

/* ===================== STYLES ===================== */

const getStyles = (colors: AppThemeColors) =>
  StyleSheet.create({
    modalOverlay: {
      position: "absolute",
      inset: 0,
      backgroundColor: "rgba(0,0,0,0.5)",
      justifyContent: "center",
      alignItems: "center",
      padding: 20,
      zIndex: 1000,
    },

    modalContent: {
      width: "100%",
      maxWidth: 420,
      backgroundColor: colors.background,
      borderRadius: 22,
      padding: 24,
      maxHeight: "80%",
    },

    modalHeader: {
      flexDirection: "row",
      justifyContent: "space-between",
      alignItems: "center",
      marginBottom: 24,
    },

    modalTitle: {
      fontSize: 20,
      fontFamily: "Inter_700Bold",
      color: colors.text,
    },

    modalClose: {
      padding: 6,
    },

    permissionsList: {
      marginBottom: 4,
    },

    permissionRole: {
      marginBottom: 16,
    },

    permissionRoleHeader: {
      flexDirection: "row",
      alignItems: "center",
      marginBottom: 14,
    },

    permissionRoleIcon: {
      width: 32,
      height: 32,
      borderRadius: 16,
      backgroundColor: `${colors.primary}20`,
      justifyContent: "center",
      alignItems: "center",
      marginRight: 10,
    },

    permissionRoleTitle: {
      fontSize: 16,
      fontFamily: "Inter_700Bold",
      color: colors.text,
    },

    permissions: {
      paddingLeft: 42,
      gap: 12,
    },

    permissionItem: {
      flexDirection: "row",
      alignItems: "center",
      gap: 10,
    },

    permissionText: {
      fontSize: 14,
      fontFamily: "Inter_400Regular",
      color: colors.textSecondary,
    },
  });
