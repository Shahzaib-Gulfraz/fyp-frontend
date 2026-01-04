import React, { useState, useEffect, useCallback } from 'react';
import {
    View,
    Text,
    ScrollView,
    TouchableOpacity,
    StyleSheet,
    TextInput,
    Alert,
    ActivityIndicator,
    Image,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';
import { LinearGradient } from 'expo-linear-gradient';

export default function UserProfileScreen() {
    const router = useRouter();
    const [isLoading, setIsLoading] = useState(true);
    const [isUpdating, setIsUpdating] = useState(false);
    const [isChangingPassword, setIsChangingPassword] = useState(false);
    const [isUploadingImage, setIsUploadingImage] = useState(false);

    // User data
    const [userData, setUserData] = useState<any>(null);
    const [profileImageUri, setProfileImageUri] = useState<string | null>(null);

    // Edit mode
    const [isEditing, setIsEditing] = useState(false);
    const [editData, setEditData] = useState({
        fullName: '',
        username: '',
        phone: '',
        bio: '',
        location: '',
    });

    // Password change
    const [showPasswordModal, setShowPasswordModal] = useState(false);
    const [passwordData, setPasswordData] = useState({
        currentPassword: '',
        newPassword: '',
        confirmPassword: '',
    });

    const loadUserProfile = useCallback(async () => {
        try {
            const { authService } = await import('../../src/api');

            // Check if user is authenticated
            const isAuth = await authService.isAuthenticated();
            if (!isAuth) {
                Alert.alert('Not Authenticated', 'Please login to view your profile');
                router.replace('/(auth)/login');
                return;
            }

            const response = await authService.getProfile();

            setUserData(response.user);
            setEditData({
                fullName: response.user.fullName || '',
                username: response.user.username || '',
                phone: response.user.phone || '',
                bio: response.user.bio || '',
                location: response.user.location || '',
            });

            if (response.user.profileImage) {
                setProfileImageUri(response.user.profileImage);
            }
        } catch (error: any) {
            console.error('Error loading profile:', error);
            console.log('Error details:', JSON.stringify(error, null, 2));

            // If unauthorized, redirect to login
            if (error.response?.status === 401 || error.message?.includes('Not authorized')) {
                Alert.alert('Session Expired', 'Please login again');
                router.replace('/(auth)/login');
            } else {
                Alert.alert('Error', 'Failed to load profile. Check console for details.');
            }
        } finally {
            setIsLoading(false);
        }
    }, [router]);

    useEffect(() => {
        loadUserProfile();
    }, [loadUserProfile]);

    const handleUpdateProfile = async () => {
        setIsUpdating(true);
        try {
            const { authService } = await import('../../src/api');

            await authService.updateProfile(editData);

            Alert.alert('Success', 'Profile updated successfully');
            setIsEditing(false);
            await loadUserProfile();
        } catch (error: any) {
            Alert.alert('Error', error.message || 'Failed to update profile');
        } finally {
            setIsUpdating(false);
        }
    };

    const handleChangePassword = async () => {
        if (passwordData.newPassword !== passwordData.confirmPassword) {
            Alert.alert('Error', 'New passwords do not match');
            return;
        }

        if (passwordData.newPassword.length < 8) {
            Alert.alert('Error', 'Password must be at least 8 characters');
            return;
        }

        setIsChangingPassword(true);
        try {
            const { authService } = await import('../../src/api');

            await authService.changePassword(
                passwordData.currentPassword,
                passwordData.newPassword
            );

            Alert.alert('Success', 'Password changed successfully');
            setShowPasswordModal(false);
            setPasswordData({
                currentPassword: '',
                newPassword: '',
                confirmPassword: '',
            });
        } catch (error: any) {
            Alert.alert('Error', error.message || 'Failed to change password');
        } finally {
            setIsChangingPassword(false);
        }
    };

    const handlePickImage = async () => {
        const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
        if (status !== 'granted') {
            Alert.alert('Permission needed', 'Please allow access to your photos');
            return;
        }

        const result = await ImagePicker.launchImageLibraryAsync({
            mediaTypes: ImagePicker.MediaTypeOptions.Images,
            allowsEditing: true,
            aspect: [1, 1],
            quality: 0.8,
        });

        if (!result.canceled && result.assets[0]) {
            await handleUploadImage(result.assets[0].uri);
        }
    };

    const handleUploadImage = async (uri: string) => {
        setIsUploadingImage(true);
        try {
            const { authService } = await import('../../src/api');

            const response = await authService.uploadAvatar(uri);

            setProfileImageUri(response.profileImage);
            Alert.alert('Success', 'Profile image uploaded successfully');
            await loadUserProfile();
        } catch (error: any) {
            Alert.alert('Error', error.message || 'Failed to upload image');
        } finally {
            setIsUploadingImage(false);
        }
    };

    const handleLogout = async () => {
        Alert.alert(
            'Logout',
            'Are you sure you want to logout?',
            [
                { text: 'Cancel', style: 'cancel' },
                {
                    text: 'Logout',
                    style: 'destructive',
                    onPress: async () => {
                        try {
                            console.log('Logging out...');
                            const { authService } = await import('../../src/api');
                            await authService.logout();
                            console.log('Logged out');

                            // Use replace to prevent going back
                            router.replace('/(auth)/login');
                        } catch (error) {
                            console.error('Logout error:', error);
                            // Still navigate to login even if there's an error
                            router.replace('/(auth)/login');
                        }
                    },
                },
            ]
        );
    };

    if (isLoading) {
        return (
            <View style={styles.loadingContainer}>
                <ActivityIndicator size="large" color="#000" />
                <Text style={styles.loadingText}>Loading Profile...</Text>
            </View>
        );
    }

    if (!userData) {
        return (
            <View style={styles.loadingContainer}>
                <Ionicons name="person-circle-outline" size={60} color="#999" />
                <Text style={styles.loadingText}>No profile data</Text>
            </View>
        );
    }

    return (
        <SafeAreaView style={styles.container}>
            {/* Header */}
            <View style={styles.header}>
                <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
                    <Ionicons name="arrow-back" size={24} color="#1A1A1A" />
                </TouchableOpacity>
                <Text style={styles.headerTitle}>Profile</Text>
                <TouchableOpacity
                    onPress={() => setIsEditing(!isEditing)}
                    style={styles.editButton}
                >
                    <Ionicons
                        name={isEditing ? 'close' : 'create-outline'}
                        size={24}
                        color="#1A1A1A"
                    />
                </TouchableOpacity>
            </View>

            <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
                {/* Avatar Section */}
                <View style={styles.avatarSection}>
                    <TouchableOpacity onPress={handlePickImage} style={styles.avatarContainer}>
                        {profileImageUri ? (
                            <Image source={{ uri: profileImageUri }} style={styles.avatar} />
                        ) : (
                            <View style={styles.avatarPlaceholder}>
                                <Ionicons name="person" size={50} color="#999" />
                            </View>
                        )}
                        {isUploadingImage && (
                            <View style={styles.avatarOverlay}>
                                <ActivityIndicator color="#fff" />
                            </View>
                        )}
                        <View style={styles.cameraIcon}>
                            <Ionicons name="camera" size={20} color="#fff" />
                        </View>
                    </TouchableOpacity>
                    <Text style={styles.userName}>{userData.fullName}</Text>
                    <Text style={styles.userEmail}>{userData.email}</Text>
                    <View style={styles.roleBadge}>
                        <Text style={styles.roleText}>
                            {userData.role === 'shop_owner' ? 'Shop Owner' : 'User'}
                        </Text>
                    </View>
                </View>

                {/* Profile Form */}
                <View style={styles.formSection}>
                    <View style={styles.formGroup}>
                        <Text style={styles.label}>Full Name</Text>
                        <TextInput
                            style={[styles.input, !isEditing && styles.inputDisabled]}
                            value={isEditing ? editData.fullName : userData.fullName}
                            onChangeText={(text) => setEditData({ ...editData, fullName: text })}
                            editable={isEditing}
                            placeholder="Enter your full name"
                        />
                    </View>

                    <View style={styles.formGroup}>
                        <Text style={styles.label}>Username</Text>
                        <TextInput
                            style={[styles.input, !isEditing && styles.inputDisabled]}
                            value={isEditing ? editData.username : userData.username}
                            onChangeText={(text) => setEditData({ ...editData, username: text })}
                            editable={isEditing}
                            placeholder="Enter your username"
                        />
                    </View>

                    <View style={styles.formGroup}>
                        <Text style={styles.label}>Bio</Text>
                        <TextInput
                            style={[styles.textArea, !isEditing && styles.inputDisabled]}
                            value={isEditing ? editData.bio : userData.bio || ''}
                            onChangeText={(text) => setEditData({ ...editData, bio: text })}
                            editable={isEditing}
                            placeholder="Tell us about yourself"
                            multiline
                            numberOfLines={3}
                            textAlignVertical="top"
                        />
                    </View>

                    <View style={styles.formGroup}>
                        <Text style={styles.label}>Location</Text>
                        <TextInput
                            style={[styles.input, !isEditing && styles.inputDisabled]}
                            value={isEditing ? editData.location : userData.location || ''}
                            onChangeText={(text) => setEditData({ ...editData, location: text })}
                            editable={isEditing}
                            placeholder="Where are you based?"
                        />
                    </View>

                    <View style={styles.formGroup}>
                        <Text style={styles.label}>Email</Text>
                        <TextInput
                            style={[styles.input, styles.inputDisabled]}
                            value={userData.email}
                            editable={false}
                        />
                        <Text style={styles.helperText}>Email cannot be changed</Text>
                    </View>

                    <View style={styles.formGroup}>
                        <Text style={styles.label}>Phone</Text>
                        <TextInput
                            style={[styles.input, !isEditing && styles.inputDisabled]}
                            value={isEditing ? editData.phone : userData.phone || ''}
                            onChangeText={(text) => setEditData({ ...editData, phone: text })}
                            editable={isEditing}
                            placeholder="Enter your phone number"
                            keyboardType="phone-pad"
                        />
                    </View>

                    {isEditing && (
                        <TouchableOpacity
                            style={styles.saveButton}
                            onPress={handleUpdateProfile}
                            disabled={isUpdating}
                        >
                            <LinearGradient
                                colors={['#000000', '#333333']}
                                style={styles.saveButtonGradient}
                            >
                                {isUpdating ? (
                                    <ActivityIndicator color="#fff" />
                                ) : (
                                    <Text style={styles.saveButtonText}>Save Changes</Text>
                                )}
                            </LinearGradient>
                        </TouchableOpacity>
                    )}
                </View>

                {/* Actions */}
                <View style={styles.actionsSection}>
                    <TouchableOpacity
                        style={styles.actionButton}
                        onPress={() => setShowPasswordModal(true)}
                    >
                        <Ionicons name="lock-closed-outline" size={24} color="#666" />
                        <Text style={styles.actionText}>Change Password</Text>
                        <Ionicons name="chevron-forward" size={20} color="#999" />
                    </TouchableOpacity>

                    <TouchableOpacity style={styles.actionButton} onPress={handleLogout}>
                        <Ionicons name="log-out-outline" size={24} color="#FF3B30" />
                        <Text style={[styles.actionText, { color: '#FF3B30' }]}>Logout</Text>
                        <Ionicons name="chevron-forward" size={20} color="#FF3B30" />
                    </TouchableOpacity>
                </View>

                {/* Password Change Modal */}
                {showPasswordModal && (
                    <View style={styles.modalOverlay}>
                        <View style={styles.modalContent}>
                            <View style={styles.modalHeader}>
                                <Text style={styles.modalTitle}>Change Password</Text>
                                <TouchableOpacity onPress={() => setShowPasswordModal(false)}>
                                    <Ionicons name="close" size={24} color="#666" />
                                </TouchableOpacity>
                            </View>

                            <View style={styles.formGroup}>
                                <Text style={styles.label}>Current Password</Text>
                                <TextInput
                                    style={styles.input}
                                    value={passwordData.currentPassword}
                                    onChangeText={(text) =>
                                        setPasswordData({ ...passwordData, currentPassword: text })
                                    }
                                    secureTextEntry
                                    placeholder="Enter current password"
                                />
                            </View>

                            <View style={styles.formGroup}>
                                <Text style={styles.label}>New Password</Text>
                                <TextInput
                                    style={styles.input}
                                    value={passwordData.newPassword}
                                    onChangeText={(text) =>
                                        setPasswordData({ ...passwordData, newPassword: text })
                                    }
                                    secureTextEntry
                                    placeholder="Enter new password"
                                />
                            </View>

                            <View style={styles.formGroup}>
                                <Text style={styles.label}>Confirm New Password</Text>
                                <TextInput
                                    style={styles.input}
                                    value={passwordData.confirmPassword}
                                    onChangeText={(text) =>
                                        setPasswordData({ ...passwordData, confirmPassword: text })
                                    }
                                    secureTextEntry
                                    placeholder="Confirm new password"
                                />
                            </View>

                            <TouchableOpacity
                                style={styles.saveButton}
                                onPress={handleChangePassword}
                                disabled={isChangingPassword}
                            >
                                <LinearGradient
                                    colors={['#000000', '#333333']}
                                    style={styles.saveButtonGradient}
                                >
                                    {isChangingPassword ? (
                                        <ActivityIndicator color="#fff" />
                                    ) : (
                                        <Text style={styles.saveButtonText}>Change Password</Text>
                                    )}
                                </LinearGradient>
                            </TouchableOpacity>
                        </View>
                    </View>
                )}
            </ScrollView>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#fff',
    },
    loadingContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: '#fff',
    },
    loadingText: {
        marginTop: 12,
        fontSize: 16,
        color: '#666',
    },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingHorizontal: 20,
        paddingVertical: 16,
        borderBottomWidth: 1,
        borderBottomColor: '#F0F0F0',
    },
    backButton: {
        padding: 8,
    },
    headerTitle: {
        fontSize: 18,
        fontWeight: '600',
        color: '#1A1A1A',
    },
    editButton: {
        padding: 8,
    },
    scrollView: {
        flex: 1,
    },
    avatarSection: {
        alignItems: 'center',
        paddingVertical: 32,
        borderBottomWidth: 1,
        borderBottomColor: '#F0F0F0',
    },
    avatarContainer: {
        position: 'relative',
        marginBottom: 16,
    },
    avatar: {
        width: 120,
        height: 120,
        borderRadius: 60,
    },
    avatarPlaceholder: {
        width: 120,
        height: 120,
        borderRadius: 60,
        backgroundColor: '#F0F0F0',
        justifyContent: 'center',
        alignItems: 'center',
    },
    avatarOverlay: {
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        borderRadius: 60,
        backgroundColor: 'rgba(0,0,0,0.5)',
        justifyContent: 'center',
        alignItems: 'center',
    },
    cameraIcon: {
        position: 'absolute',
        bottom: 0,
        right: 0,
        width: 40,
        height: 40,
        borderRadius: 20,
        backgroundColor: '#000',
        justifyContent: 'center',
        alignItems: 'center',
        borderWidth: 3,
        borderColor: '#fff',
    },
    userName: {
        fontSize: 24,
        fontWeight: '700',
        color: '#1A1A1A',
        marginBottom: 4,
    },
    userEmail: {
        fontSize: 14,
        color: '#666',
        marginBottom: 12,
    },
    roleBadge: {
        paddingHorizontal: 16,
        paddingVertical: 6,
        backgroundColor: '#F0F0F0',
        borderRadius: 20,
    },
    roleText: {
        fontSize: 12,
        fontWeight: '600',
        color: '#666',
    },
    formSection: {
        padding: 20,
    },
    formGroup: {
        marginBottom: 20,
    },
    label: {
        fontSize: 14,
        fontWeight: '600',
        color: '#1A1A1A',
        marginBottom: 8,
    },
    input: {
        backgroundColor: '#F8F9FA',
        borderRadius: 12,
        paddingHorizontal: 16,
        paddingVertical: 14,
        fontSize: 16,
        color: '#1A1A1A',
        borderWidth: 1,
        borderColor: '#E0E0E0',
    },
    textArea: {
        backgroundColor: '#F8F9FA',
        borderRadius: 12,
        paddingHorizontal: 16,
        paddingVertical: 14,
        fontSize: 16,
        color: '#1A1A1A',
        borderWidth: 1,
        borderColor: '#E0E0E0',
        minHeight: 100,
    },
    inputDisabled: {
        backgroundColor: '#F5F5F5',
        color: '#999',
    },
    helperText: {
        fontSize: 12,
        color: '#666',
        marginTop: 4,
    },
    saveButton: {
        borderRadius: 12,
        overflow: 'hidden',
        marginTop: 8,
    },
    saveButtonGradient: {
        paddingVertical: 16,
        alignItems: 'center',
        justifyContent: 'center',
    },
    saveButtonText: {
        color: '#fff',
        fontSize: 16,
        fontWeight: '600',
    },
    actionsSection: {
        padding: 20,
        borderTopWidth: 1,
        borderTopColor: '#F0F0F0',
    },
    actionButton: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingVertical: 16,
        borderBottomWidth: 1,
        borderBottomColor: '#F0F0F0',
    },
    actionText: {
        flex: 1,
        fontSize: 16,
        color: '#1A1A1A',
        marginLeft: 12,
    },
    modalOverlay: {
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        backgroundColor: 'rgba(0,0,0,0.5)',
        justifyContent: 'center',
        alignItems: 'center',
        padding: 20,
    },
    modalContent: {
        backgroundColor: '#fff',
        borderRadius: 16,
        padding: 24,
        width: '100%',
        maxWidth: 400,
    },
    modalHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 24,
    },
    modalTitle: {
        fontSize: 20,
        fontWeight: '700',
        color: '#1A1A1A',
    },
});
