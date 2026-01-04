import React from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  TextInput,
} from "react-native";
import { X, Shield, Check, UserPlus } from "lucide-react-native";

import { useTheme } from "@/src/context/ThemeContext";
import type { AppThemeColors } from "@/src/theme/appTheme";

interface AddStaffModalProps {
  showAddForm: boolean;
  onClose: () => void;
  newStaff: {
    name: string;
    email: string;
    role: "staff";
  };
  setNewStaff: (staff: any) => void;
  onAddStaff: () => void;
}

export const AddStaffModal: React.FC<AddStaffModalProps> = ({
  showAddForm,
  onClose,
  newStaff,
  setNewStaff,
  onAddStaff,
}) => {
  const { theme } = useTheme();
  const colors = theme.colors as AppThemeColors;
  const styles = getStyles(colors);

  if (!showAddForm) return null;

  return (
    <View style={styles.modalOverlay}>
      <View style={styles.modalContent}>
        {/* Header */}
        <View style={styles.modalHeader}>
          <Text style={styles.modalTitle}>Add Staff Member</Text>

          <TouchableOpacity onPress={onClose} style={styles.modalClose}>
            <X size={22} color={colors.textSecondary} />
          </TouchableOpacity>
        </View>

        {/* Name */}
        <View style={styles.formGroup}>
          <Text style={styles.formLabel}>Full Name</Text>
          <TextInput
            style={styles.input}
            value={newStaff.name}
            onChangeText={(text) =>
              setNewStaff({ ...newStaff, name: text })
            }
            placeholder="Enter staff name"
            placeholderTextColor={colors.textTertiary}
          />
        </View>

        {/* Email */}
        <View style={styles.formGroup}>
          <Text style={styles.formLabel}>Email Address</Text>
          <TextInput
            style={styles.input}
            value={newStaff.email}
            onChangeText={(text) =>
              setNewStaff({ ...newStaff, email: text })
            }
            placeholder="staff@email.com"
            placeholderTextColor={colors.textTertiary}
            keyboardType="email-address"
            autoCapitalize="none"
          />
        </View>

        {/* Role */}
        <View style={styles.formGroup}>
          <Text style={styles.formLabel}>Role</Text>

          <TouchableOpacity
            style={[
              styles.roleOption,
              newStaff.role === "staff" && {
                borderColor: colors.primary,
              },
            ]}
            onPress={() =>
              setNewStaff({ ...newStaff, role: "staff" })
            }
          >
            <View style={styles.roleIcon}>
              <Shield size={16} color={colors.primary} />
            </View>

            <Text style={styles.roleText}>Staff</Text>

            {newStaff.role === "staff" && (
              <Check size={16} color={colors.primary} />
            )}
          </TouchableOpacity>
        </View>

        {/* Actions */}
        <View style={styles.actions}>
          <TouchableOpacity
            style={styles.cancelButton}
            onPress={onClose}
          >
            <Text style={styles.cancelText}>Cancel</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[
              styles.submitButton,
              { backgroundColor: colors.primary },
            ]}
            onPress={onAddStaff}
          >
            <UserPlus size={18} color={colors.onPrimary} />
            <Text
              style={[
                styles.submitText,
                { color: colors.onPrimary },
              ]}
            >
              Send Invitation
            </Text>
          </TouchableOpacity>
        </View>
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
    },

    modalHeader: {
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "space-between",
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

    formGroup: {
      marginBottom: 18,
    },

    formLabel: {
      fontSize: 14,
      fontFamily: "Inter_600SemiBold",
      color: colors.text,
      marginBottom: 8,
    },

    input: {
      backgroundColor: colors.surface,
      borderWidth: 1,
      borderColor: colors.border,
      borderRadius: 12,
      paddingHorizontal: 16,
      paddingVertical: 14,
      fontSize: 16,
      fontFamily: "Inter_400Regular",
      color: colors.text,
    },

    roleOption: {
      flexDirection: "row",
      alignItems: "center",
      padding: 14,
      borderRadius: 12,
      backgroundColor: colors.surface,
      borderWidth: 1,
      borderColor: colors.border,
      gap: 12,
    },

    roleIcon: {
      width: 32,
      height: 32,
      borderRadius: 16,
      backgroundColor: `${colors.primary}20`,
      justifyContent: "center",
      alignItems: "center",
    },

    roleText: {
      flex: 1,
      fontSize: 14,
      fontFamily: "Inter_600SemiBold",
      color: colors.text,
    },

    actions: {
      flexDirection: "row",
      gap: 12,
      marginTop: 10,
    },

    cancelButton: {
      flex: 1,
      paddingVertical: 14,
      borderRadius: 12,
      backgroundColor: colors.surface,
      borderWidth: 1,
      borderColor: colors.border,
      alignItems: "center",
    },

    cancelText: {
      fontSize: 16,
      fontFamily: "Inter_600SemiBold",
      color: colors.textSecondary,
    },

    submitButton: {
      flex: 2,
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "center",
      paddingVertical: 14,
      borderRadius: 12,
      gap: 8,
    },

    submitText: {
      fontSize: 16,
      fontFamily: "Inter_600SemiBold",
    },
  });
