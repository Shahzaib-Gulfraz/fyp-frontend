// app/(main)/shop/staff.tsx
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  Alert,
  TextInput,
  FlatList,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { StatusBar } from "expo-status-bar";
import { useRouter } from "expo-router";
import {
  ArrowLeft,
  UserPlus,
  Search,
  MoreVertical,
  Shield,
  Edit3,
  Trash2,
  Mail,
  User,
  Check,
  X,
} from "lucide-react-native";
import React, { useState } from "react";
import { useTheme } from "../../../src/context/ThemeContext";

const staffRoles = [
  { id: "owner", label: "Owner", permissions: ["All Permissions"], color: "#00BCD4" },
  { id: "admin", label: "Administrator", permissions: ["Manage Products", "Manage Orders", "Manage Staff"], color: "#4CAF50" },
  { id: "manager", label: "Manager", permissions: ["Manage Products", "Manage Orders"], color: "#FF9800" },
  { id: "staff", label: "Staff", permissions: ["View Products", "Process Orders"], color: "#9E9E9E" },
];

const initialStaffMembers = [
  {
    id: "1",
    name: "You",
    email: "owner@shop.com",
    role: "owner",
    status: "active",
    joinDate: "2024-01-15",
  },
  {
    id: "2",
    name: "Sarah Manager",
    email: "sarah@shop.com",
    role: "manager",
    status: "active",
    joinDate: "2024-02-20",
  },
  {
    id: "3",
    name: "Mike Assistant",
    email: "mike@shop.com",
    role: "staff",
    status: "pending",
    joinDate: "2024-03-10",
  },
];

export default function ManageStaffScreen() {
  const { theme, isDark } = useTheme();
  const styles = getStyles(theme.colors);
  
  const router = useRouter();
  const [searchQuery, setSearchQuery] = useState("");
  const [staffMembers, setStaffMembers] = useState(initialStaffMembers);
  const [showAddForm, setShowAddForm] = useState(false);
  const [showRolePermissions, setShowRolePermissions] = useState(false);
  
  const [newStaff, setNewStaff] = useState({
    name: "",
    email: "",
    role: "staff",
  });

  const handleAddStaff = () => {
    if (!newStaff.name.trim() || !newStaff.email.trim()) {
      Alert.alert("Error", "Please fill in all fields");
      return;
    }

    if (!newStaff.email.includes('@')) {
      Alert.alert("Error", "Please enter a valid email");
      return;
    }

    const newMember = {
      id: Date.now().toString(),
      name: newStaff.name,
      email: newStaff.email,
      role: newStaff.role,
      status: "pending",
      joinDate: new Date().toISOString().split('T')[0],
    };

    setStaffMembers([...staffMembers, newMember]);
    setNewStaff({ name: "", email: "", role: "staff" });
    setShowAddForm(false);
    
    Alert.alert("Success", "Invitation sent to staff member");
  };

  const handleRemoveStaff = (staffId: string, staffName: string) => {
    Alert.alert(
      "Remove Staff",
      `Are you sure you want to remove ${staffName}?`,
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Remove",
          style: "destructive",
          onPress: () => {
            setStaffMembers(staffMembers.filter(member => member.id !== staffId));
          }
        }
      ]
    );
  };

  const handleUpdateRole = (staffId: string, newRole: string) => {
    setStaffMembers(staffMembers.map(member =>
      member.id === staffId ? { ...member, role: newRole } : member
    ));
  };

  const getRoleInfo = (roleId: string) => {
    return staffRoles.find(role => role.id === roleId) || staffRoles[0];
  };

  const renderStaffMember = ({ item }: { item: any }) => {
    const roleInfo = getRoleInfo(item.role);
    const isPending = item.status === "pending";
    
    return (
      <View style={styles.staffCard}>
        <View style={styles.staffInfo}>
          <View style={[styles.avatar, { backgroundColor: roleInfo.color + '20' }]}>
            <User size={20} color={roleInfo.color} />
          </View>
          
          <View style={styles.staffDetails}>
            <View style={styles.staffHeader}>
              <Text style={styles.staffName}>{item.name}</Text>
              {item.id === "1" && (
                <View style={styles.ownerBadge}>
                  <Shield size={12} color="#00BCD4" />
                </View>
              )}
            </View>
            
            <Text style={styles.staffEmail}>{item.email}</Text>
            
            <View style={styles.staffMeta}>
              <View style={[styles.roleBadge, { backgroundColor: roleInfo.color + '20' }]}>
                <Text style={[styles.roleText, { color: roleInfo.color }]}>
                  {roleInfo.label}
                </Text>
              </View>
              
              {isPending && (
                <View style={styles.pendingBadge}>
                  <Text style={styles.pendingText}>Pending</Text>
                </View>
              )}
              
              <Text style={styles.joinDate}>Joined {item.joinDate}</Text>
            </View>
          </View>
        </View>
        
        <View style={styles.staffActions}>
          {item.id !== "1" && (
            <>
              <TouchableOpacity
                style={styles.actionButton}
                onPress={() => Alert.alert(
                  "Change Role",
                  `Select new role for ${item.name}`,
                  staffRoles
                    .filter(role => role.id !== "owner")
                    .map(role => ({
                      text: role.label,
                      onPress: () => handleUpdateRole(item.id, role.id)
                    }))
                    .concat([{ text: "Cancel", style: "cancel" }])
                )}
              >
                <Edit3 size={18} color="#666" />
              </TouchableOpacity>
              
              <TouchableOpacity
                style={styles.actionButton}
                onPress={() => handleRemoveStaff(item.id, item.name)}
              >
                <Trash2 size={18} color="#FF6B6B" />
              </TouchableOpacity>
            </>
          )}
        </View>
      </View>
    );
  };

  const renderRoleCard = ({ item }: { item: any }) => (
    <TouchableOpacity
      style={styles.roleCard}
      onPress={() => setShowRolePermissions(true)}
    >
      <View style={[styles.roleIcon, { backgroundColor: item.color + '20' }]}>
        <Shield size={20} color={item.color} />
      </View>
      
      <View style={styles.roleContent}>
        <Text style={styles.roleTitle}>{item.label}</Text>
        <Text style={styles.roleSubtitle}>
          {item.permissions.length} permissions
        </Text>
      </View>
      
      <View style={styles.roleStats}>
        <Text style={styles.roleCount}>
          {staffMembers.filter(m => m.role === item.id).length} members
        </Text>
      </View>
    </TouchableOpacity>
  );

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar style={isDark ? "light" : "dark"} />
      
      {/* Header */}
      <View style={styles.header}>
        <View style={styles.headerContent}>
          <TouchableOpacity
            style={styles.backButton}
            onPress={() => router.back()}
          >
            <ArrowLeft size={24} color={theme.colors.text} />
          </TouchableOpacity>
          
          <Text style={styles.headerTitle}>Manage Staff</Text>
          
          <TouchableOpacity
            style={styles.addButton}
            onPress={() => setShowAddForm(true)}
          >
            <UserPlus size={20} color="#FFFFFF" />
          </TouchableOpacity>
        </View>
      </View>

      <ScrollView
        style={styles.scrollView}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        {/* Search Bar */}
        <View style={styles.searchContainer}>
          <Search size={20} color="#999" />
          <TextInput
            style={styles.searchInput}
            placeholder="Search staff members..."
            placeholderTextColor="#999"
            value={searchQuery}
            onChangeText={setSearchQuery}
          />
        </View>

        {/* Quick Stats */}
        <View style={styles.statsContainer}>
          <View style={styles.statCard}>
            <Text style={styles.statNumber}>{staffMembers.length}</Text>
            <Text style={styles.statLabel}>Total Staff</Text>
          </View>
          <View style={styles.statCard}>
            <Text style={styles.statNumber}>
              {staffMembers.filter(m => m.status === "active").length}
            </Text>
            <Text style={styles.statLabel}>Active</Text>
          </View>
          <View style={styles.statCard}>
            <Text style={styles.statNumber}>
              {staffMembers.filter(m => m.status === "pending").length}
            </Text>
            <Text style={styles.statLabel}>Pending</Text>
          </View>
        </View>

        {/* Roles Overview */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Roles & Permissions</Text>
          <FlatList
            data={staffRoles}
            renderItem={renderRoleCard}
            keyExtractor={(item) => item.id}
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.rolesList}
          />
        </View>

        {/* Staff Members */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Staff Members</Text>
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
      </ScrollView>

      {/* Add Staff Modal */}
      {showAddForm && (
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Add Staff Member</Text>
              <TouchableOpacity
                style={styles.modalClose}
                onPress={() => setShowAddForm(false)}
              >
                <X size={24} color="#666" />
              </TouchableOpacity>
            </View>
            
            <View style={styles.formGroup}>
              <Text style={styles.formLabel}>Full Name</Text>
              <TextInput
                style={styles.input}
                value={newStaff.name}
                onChangeText={(text) => setNewStaff({...newStaff, name: text})}
                placeholder="Enter staff name"
                placeholderTextColor="#999"
              />
            </View>
            
            <View style={styles.formGroup}>
              <Text style={styles.formLabel}>Email Address</Text>
              <TextInput
                style={styles.input}
                value={newStaff.email}
                onChangeText={(text) => setNewStaff({...newStaff, email: text})}
                placeholder="staff@email.com"
                placeholderTextColor="#999"
                keyboardType="email-address"
                autoCapitalize="none"
              />
            </View>
            
            <View style={styles.formGroup}>
              <Text style={styles.formLabel}>Role</Text>
              <View style={styles.roleOptions}>
                {staffRoles
                  .filter(role => role.id !== "owner")
                  .map((role) => (
                    <TouchableOpacity
                      key={role.id}
                      style={[
                        styles.roleOption,
                        newStaff.role === role.id && styles.roleOptionSelected
                      ]}
                      onPress={() => setNewStaff({...newStaff, role: role.id})}
                    >
                      <View style={[
                        styles.roleOptionIcon,
                        { backgroundColor: role.color + '20' }
                      ]}>
                        <Shield size={16} color={role.color} />
                      </View>
                      <Text style={[
                        styles.roleOptionText,
                        newStaff.role === role.id && styles.roleOptionTextSelected
                      ]}>
                        {role.label}
                      </Text>
                      {newStaff.role === role.id && (
                        <Check size={16} color={role.color} />
                      )}
                    </TouchableOpacity>
                  ))}
              </View>
            </View>
            
            <View style={styles.modalActions}>
              <TouchableOpacity
                style={styles.cancelButton}
                onPress={() => setShowAddForm(false)}
              >
                <Text style={styles.cancelButtonText}>Cancel</Text>
              </TouchableOpacity>
              
              <TouchableOpacity
                style={styles.submitButton}
                onPress={handleAddStaff}
              >
                <UserPlus size={18} color="#FFFFFF" />
                <Text style={styles.submitButtonText}>Send Invitation</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      )}

      {/* Role Permissions Modal */}
      {showRolePermissions && (
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Role Permissions</Text>
              <TouchableOpacity
                style={styles.modalClose}
                onPress={() => setShowRolePermissions(false)}
              >
                <X size={24} color="#666" />
              </TouchableOpacity>
            </View>
            
            <ScrollView style={styles.permissionsList}>
              {staffRoles.map((role) => (
                <View key={role.id} style={styles.permissionRole}>
                  <View style={styles.permissionRoleHeader}>
                    <View style={[
                      styles.permissionRoleIcon,
                      { backgroundColor: role.color + '20' }
                    ]}>
                      <Shield size={16} color={role.color} />
                    </View>
                    <Text style={styles.permissionRoleTitle}>{role.label}</Text>
                  </View>
                  
                  <View style={styles.permissions}>
                    {role.permissions.map((permission, index) => (
                      <View key={index} style={styles.permissionItem}>
                        <Check size={16} color="#4CAF50" />
                        <Text style={styles.permissionText}>{permission}</Text>
                      </View>
                    ))}
                  </View>
                </View>
              ))}
            </ScrollView>
          </View>
        </View>
      )}
    </SafeAreaView>
  );
}

const getStyles = (colors: any) =>
  StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: colors.background,
    },
    header: {
      backgroundColor: colors.surface,
      borderBottomWidth: 1,
      borderBottomColor: colors.border,
      paddingHorizontal: 20,
      paddingVertical: 15,
    },
    headerContent: {
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "space-between",
    },
    backButton: {
      width: 40,
      height: 40,
      borderRadius: 20,
      backgroundColor: "#F8F9FA",
      justifyContent: "center",
      alignItems: "center",
      borderWidth: 1,
      borderColor: "#F0F0F0",
    },
    headerTitle: {
      fontSize: 18,
      fontWeight: "700",
      color: colors.text,
    },
    addButton: {
      width: 40,
      height: 40,
      borderRadius: 20,
      backgroundColor: "#00BCD4",
      justifyContent: "center",
      alignItems: "center",
    },
    scrollView: {
      flex: 1,
    },
    scrollContent: {
      paddingBottom: 40,
    },
    searchContainer: {
      flexDirection: "row",
      alignItems: "center",
      backgroundColor: colors.surface,
      borderWidth: 1,
      borderColor: colors.border,
      borderRadius: 12,
      paddingHorizontal: 16,
      marginHorizontal: 20,
      marginTop: 20,
      marginBottom: 16,
    },
    searchInput: {
      flex: 1,
      fontSize: 16,
      color: colors.text,
      paddingVertical: 14,
      marginLeft: 12,
    },
    statsContainer: {
      flexDirection: "row",
      justifyContent: "space-between",
      paddingHorizontal: 20,
      marginBottom: 24,
    },
    statCard: {
      flex: 1,
      backgroundColor: colors.surface,
      borderWidth: 1,
      borderColor: colors.border,
      borderRadius: 12,
      padding: 16,
      alignItems: "center",
      marginHorizontal: 6,
    },
    statNumber: {
      fontSize: 24,
      fontWeight: "700",
      color: colors.text,
      marginBottom: 4,
    },
    statLabel: {
      fontSize: 12,
      color: "#666",
    },
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
      fontWeight: "700",
      color: colors.text,
    },
    sectionSubtitle: {
      fontSize: 14,
      color: "#666",
    },
    rolesList: {
      paddingHorizontal: 20,
      gap: 12,
    },
    roleCard: {
      width: 200,
      backgroundColor: colors.surface,
      borderWidth: 1,
      borderColor: colors.border,
      borderRadius: 16,
      padding: 16,
    },
    roleIcon: {
      width: 40,
      height: 40,
      borderRadius: 20,
      justifyContent: "center",
      alignItems: "center",
      marginBottom: 12,
    },
    roleContent: {
      marginBottom: 12,
    },
    roleTitle: {
      fontSize: 16,
      fontWeight: "700",
      color: colors.text,
      marginBottom: 4,
    },
    roleSubtitle: {
      fontSize: 12,
      color: "#666",
    },
    roleStats: {},
    roleCount: {
      fontSize: 12,
      color: "#666",
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
      fontWeight: "600",
      color: colors.text,
      marginRight: 6,
    },
    ownerBadge: {
      backgroundColor: "#E0F7FA",
      borderRadius: 10,
      padding: 2,
    },
    staffEmail: {
      fontSize: 14,
      color: "#666",
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
    },
    roleText: {
      fontSize: 11,
      fontWeight: "600",
    },
    pendingBadge: {
      backgroundColor: "#FFF3E0",
      paddingHorizontal: 8,
      paddingVertical: 4,
      borderRadius: 12,
    },
    pendingText: {
      fontSize: 11,
      color: "#FF9800",
      fontWeight: "600",
    },
    joinDate: {
      fontSize: 11,
      color: "#999",
    },
    staffActions: {
      flexDirection: "row",
      gap: 8,
    },
    actionButton: {
      width: 36,
      height: 36,
      borderRadius: 18,
      backgroundColor: "#F8F9FA",
      justifyContent: "center",
      alignItems: "center",
      borderWidth: 1,
      borderColor: "#F0F0F0",
    },
    modalOverlay: {
      position: "absolute",
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      backgroundColor: "rgba(0, 0, 0, 0.5)",
      justifyContent: "center",
      alignItems: "center",
      padding: 20,
    },
    modalContent: {
      width: "100%",
      maxWidth: 400,
      backgroundColor: colors.background,
      borderRadius: 20,
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
      fontWeight: "700",
      color: colors.text,
    },
    modalClose: {
      padding: 4,
    },
    formGroup: {
      marginBottom: 20,
    },
    formLabel: {
      fontSize: 14,
      fontWeight: "600",
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
      color: colors.text,
    },
    roleOptions: {
      gap: 8,
    },
    roleOption: {
      flexDirection: "row",
      alignItems: "center",
      backgroundColor: colors.surface,
      borderWidth: 1,
      borderColor: colors.border,
      borderRadius: 12,
      paddingHorizontal: 16,
      paddingVertical: 14,
      gap: 12,
    },
    roleOptionSelected: {
      borderColor: "#00BCD4",
      backgroundColor: "#E0F7FA",
    },
    roleOptionIcon: {
      width: 32,
      height: 32,
      borderRadius: 16,
      justifyContent: "center",
      alignItems: "center",
    },
    roleOptionText: {
      flex: 1,
      fontSize: 14,
      color: colors.text,
    },
    roleOptionTextSelected: {
      color: "#00BCD4",
      fontWeight: "600",
    },
    modalActions: {
      flexDirection: "row",
      gap: 12,
      marginTop: 8,
    },
    cancelButton: {
      flex: 1,
      backgroundColor: colors.surface,
      borderWidth: 1,
      borderColor: colors.border,
      borderRadius: 12,
      paddingVertical: 16,
      alignItems: "center",
    },
    cancelButtonText: {
      fontSize: 16,
      fontWeight: "600",
      color: colors.text,
    },
    submitButton: {
      flex: 2,
      backgroundColor: "#00BCD4",
      borderRadius: 12,
      paddingVertical: 16,
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "center",
      gap: 8,
    },
    submitButtonText: {
      fontSize: 16,
      fontWeight: "600",
      color: "#FFFFFF",
    },
    permissionsList: {
      maxHeight: 400,
    },
    permissionRole: {
      marginBottom: 24,
    },
    permissionRoleHeader: {
      flexDirection: "row",
      alignItems: "center",
      marginBottom: 12,
    },
    permissionRoleIcon: {
      width: 32,
      height: 32,
      borderRadius: 16,
      justifyContent: "center",
      alignItems: "center",
      marginRight: 12,
    },
    permissionRoleTitle: {
      fontSize: 16,
      fontWeight: "700",
      color: colors.text,
    },
    permissions: {
      gap: 8,
    },
    permissionItem: {
      flexDirection: "row",
      alignItems: "center",
      gap: 12,
      paddingLeft: 8,
    },
    permissionText: {
      fontSize: 14,
      color: colors.text,
    },
  });