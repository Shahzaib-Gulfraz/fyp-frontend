import React, { useState } from "react";
import { ScrollView, StyleSheet, Alert, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { StatusBar } from "expo-status-bar";

import { useTheme } from "@/src/context/ThemeContext";
import { StaffHeader } from "./components/StaffHeader";
import { SearchBar } from "./components/SearchBar";
import { QuickStats } from "./components/QuickStats";
import { RolesOverview } from "./components/RolesOverview";
import { StaffList } from "./components/StaffList";
import { AddStaffModal } from "./components/AddStaffModal";
import { RolePermissionsModal } from "./components/RolePermissionsModal";
import type { AppThemeColors } from "@/src/theme/appTheme";

interface StaffMember {
  id: string;
  name: string;
  email: string;
  role: string;
  status: "active" | "pending";
  joinDate: string;
}

interface StaffRole {
  id: string;
  label: string;
  permissions: string[];
  color: string;
}

// ----------------------
// Sample Roles & Staff
// ----------------------
const staffRoles: StaffRole[] = [
  { id: "owner", label: "Owner", permissions: ["All Permissions"], color: "#00BCD4" },
  { id: "admin", label: "Administrator", permissions: ["Manage Products", "Manage Orders", "Manage Staff"], color: "#4CAF50" },
  { id: "manager", label: "Manager", permissions: ["Manage Products", "Manage Orders"], color: "#FF9800" },
  { id: "staff", label: "Staff", permissions: ["View Products", "Process Orders"], color: "#9E9E9E" },
];

const initialStaffMembers: StaffMember[] = [
  { id: "1", name: "You", email: "owner@shop.com", role: "owner", status: "active", joinDate: "2024-01-15" },
  { id: "2", name: "Sarah Manager", email: "sarah@shop.com", role: "manager", status: "active", joinDate: "2024-02-20" },
  { id: "3", name: "Mike Assistant", email: "mike@shop.com", role: "staff", status: "pending", joinDate: "2024-03-10" },
];

// ----------------------
// Main Screen Component
// ----------------------
export default function ManageStaffScreen() {
  const { theme, isDark } = useTheme();
  const colors = theme.colors as AppThemeColors;
  const styles = getStyles(colors);

  const [searchQuery, setSearchQuery] = useState("");
  const [staffMembers, setStaffMembers] = useState<StaffMember[]>(initialStaffMembers);
  const [showAddForm, setShowAddForm] = useState(false);
  const [showRolePermissions, setShowRolePermissions] = useState(false);

  const [newStaff, setNewStaff] = useState({
    name: "",
    email: "",
    role: "staff",
  });

  // ----------------------
  // Add Staff
  // ----------------------
  const handleAddStaff = () => {
    if (!newStaff.name.trim() || !newStaff.email.trim()) {
      Alert.alert("Error", "Please fill in all fields");
      return;
    }

    if (!newStaff.email.includes("@")) {
      Alert.alert("Error", "Please enter a valid email");
      return;
    }

    const newMember: StaffMember = {
      id: Date.now().toString(),
      name: newStaff.name,
      email: newStaff.email,
      role: newStaff.role,
      status: "pending",
      joinDate: new Date().toISOString().split("T")[0],
    };

    setStaffMembers([...staffMembers, newMember]);
    setNewStaff({ name: "", email: "", role: "staff" });
    setShowAddForm(false);

    Alert.alert("Success", "Invitation sent to staff member");
  };

  // ----------------------
  // Remove Staff
  // ----------------------
  const handleRemoveStaff = (staffId: string, staffName: string) => {
    Alert.alert(
      "Remove Staff",
      `Are you sure you want to remove ${staffName}?`,
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Remove",
          style: "destructive",
          onPress: () => setStaffMembers(staffMembers.filter(member => member.id !== staffId)),
        },
      ]
    );
  };

  // ----------------------
  // Update Staff Role
  // ----------------------
  const handleUpdateRole = (staffId: string, staffName: string) => {
    Alert.alert(
      "Change Role",
      `Select new role for ${staffName}`,
      staffRoles
        .filter(role => role.id !== "owner")
        .map((role): import("react-native").AlertButton => ({
          text: role.label,
          onPress: () =>
            setStaffMembers(staffMembers.map(member =>
              member.id === staffId ? { ...member, role: role.id } : member
            )),
          style: "default",
        }))
        .concat([{ text: "Cancel", style: "cancel" } as import("react-native").AlertButton])
    );
  };

  // ----------------------
  // Filtered Staff List
  // ----------------------
  const filteredStaff = staffMembers.filter(
    member =>
      member.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      member.email.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // ----------------------
  // Render
  // ----------------------
  return (
    <SafeAreaView style={styles.container}>
      <StatusBar style={isDark ? "light" : "dark"} />

      <StaffHeader onAddPress={() => setShowAddForm(true)} />

      <ScrollView
        style={styles.scrollView}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        <SearchBar value={searchQuery} onChangeText={setSearchQuery} />

        <QuickStats
          totalStaff={staffMembers.length}
          activeStaff={staffMembers.filter(m => m.status === "active").length}
          pendingStaff={staffMembers.filter(m => m.status === "pending").length}
        />

        <RolesOverview
          staffMembers={staffMembers}
          onRolePress={() => setShowRolePermissions(true)}
        />

        <StaffList
          staffMembers={filteredStaff}
          onUpdateRole={handleUpdateRole}
          onRemoveStaff={handleRemoveStaff}
        />
      </ScrollView>

      <AddStaffModal
        showAddForm={showAddForm}
        onClose={() => setShowAddForm(false)}
        newStaff={newStaff}
        setNewStaff={setNewStaff}
        onAddStaff={handleAddStaff}
      />

      <RolePermissionsModal
        showRolePermissions={showRolePermissions}
        onClose={() => setShowRolePermissions(false)}
      />
    </SafeAreaView>
  );
}

// ----------------------
// Styles
// ----------------------
const getStyles = (colors: AppThemeColors) =>
  StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: colors.background,
    },
    scrollView: {
      flex: 1,
    },
    scrollContent: {
      paddingBottom: 40,
    },
  });
