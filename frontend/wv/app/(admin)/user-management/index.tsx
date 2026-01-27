import React, { useState, useEffect } from 'react';
import {
    View,
    Text,
    StyleSheet,
    FlatList,
    TouchableOpacity,
    ActivityIndicator,
    Alert,
    RefreshControl,
    TextInput,
    Modal,
    ScrollView
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { adminService } from '@/src/api';
import { Image } from 'expo-image';
import Toast from 'react-native-toast-message';

export default function UserManagement() {
    const router = useRouter();
    const [users, setUsers] = useState<any[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [isRefreshing, setIsRefreshing] = useState(false);
    const [searchQuery, setSearchQuery] = useState('');
    const [statusFilter, setStatusFilter] = useState<'all' | 'active' | 'blocked'>('all');
    
    // Modal State
    const [modalVisible, setModalVisible] = useState(false);
    const [selectedUser, setSelectedUser] = useState<any>(null);

    const fetchUsers = async () => {
        try {
            const params: any = {};
            if (statusFilter === 'active') params.isActive = 'true';
            if (statusFilter === 'blocked') params.isActive = 'false';
            if (searchQuery) params.search = searchQuery;

            const data = await adminService.getUsers(params);
            setUsers(data.users);
        } catch (error) {
            console.error('Error fetching users:', error);
            Toast.show({
                type: 'error',
                text1: 'Error',
                text2: 'Failed to load users'
            });
        } finally {
            setIsLoading(false);
            setIsRefreshing(false);
        }
    };

    useEffect(() => {
        fetchUsers();
    }, [statusFilter, searchQuery]);

    const handleUpdateStatus = async (userId: string, isActive: boolean) => {
        try {
            await adminService.updateUserStatus(userId, { isActive });
            Toast.show({
                type: 'success',
                text1: 'Success',
                text2: `User ${isActive ? 'unblocked' : 'blocked'} successfully`
            });
            fetchUsers();
            if (modalVisible && selectedUser?._id === userId) {
                const updatedUser = { ...selectedUser, isActive };
                setSelectedUser(updatedUser);
            }
        } catch (error: any) {
            Toast.show({
                type: 'error',
                text1: 'Error',
                text2: error.message || 'Failed to update user status'
            });
        }
    };

    const confirmStatusChange = (user: any) => {
        const action = user.isActive ? 'block' : 'unblock';
        Alert.alert(
            `${action.charAt(0).toUpperCase() + action.slice(1)} User`,
            `Are you sure you want to ${action} "${user.username}"?`,
            [
                { text: 'Cancel', style: 'cancel' },
                {
                    text: action.toUpperCase(),
                    style: user.isActive ? 'destructive' : 'default',
                    onPress: () => handleUpdateStatus(user._id, !user.isActive)
                }
            ]
        );
    };

    const renderUserItem = ({ item }: { item: any }) => (
        <View style={styles.userCard}>
            <Image
                source={item.profileImage?.url || 'https://placehold.co/100@3x.png?text=User'}
                style={styles.userImage}
            />
            <View style={styles.userInfo}>
                <View style={styles.infoTop}>
                    <Text style={styles.userName} numberOfLines={1}>{item.username}</Text>
                    <View style={[
                        styles.statusBadge,
                        { backgroundColor: item.isActive ? '#E8F5E9' : '#FFEBEE' }
                    ]}>
                        <Text style={[
                            styles.statusText,
                            { color: item.isActive ? '#2E7D32' : '#C62828' }
                        ]}>
                            {item.isActive ? 'Active' : 'Blocked'}
                        </Text>
                    </View>
                </View>

                <Text style={styles.userEmail} numberOfLines={1}>{item.email}</Text>
                <Text style={styles.dateText}>Joined: {new Date(item.createdAt).toLocaleDateString()}</Text>

                <View style={styles.cardActions}>
                    <TouchableOpacity
                        style={[
                            styles.actionButton,
                            item.isActive ? styles.blockButton : styles.unblockButton
                        ]}
                        onPress={() => confirmStatusChange(item)}
                    >
                        <Ionicons
                            name={item.isActive ? "ban-outline" : "checkmark-circle-outline"}
                            size={16}
                            color="#fff"
                        />
                        <Text style={styles.actionButtonText}>
                            {item.isActive ? 'Block' : 'Unblock'}
                        </Text>
                    </TouchableOpacity>
                    
                    <TouchableOpacity
                        style={[styles.iconButton, styles.eyeButton]}
                        onPress={() => {
                            setSelectedUser(item);
                            setModalVisible(true);
                        }}
                    >
                        <Ionicons name="eye-outline" size={20} color="#000" />
                    </TouchableOpacity>
                </View>
            </View>
        </View>
    );

    return (
        <SafeAreaView style={styles.container}>
            <View style={styles.header}>
                <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
                    <Ionicons name="arrow-back" size={24} color="#333" />
                </TouchableOpacity>
                <Text style={styles.title}>User Management</Text>
            </View>

            <View style={styles.searchContainer}>
                <Ionicons name="search" size={20} color="#999" />
                <TextInput
                    style={styles.searchInput}
                    placeholder="Search users..."
                    value={searchQuery}
                    onChangeText={setSearchQuery}
                />
            </View>

            <View style={styles.filterContainer}>
                {(['all', 'active', 'blocked'] as const).map((s) => (
                    <TouchableOpacity
                        key={s}
                        style={[styles.filterTab, statusFilter === s && styles.activeFilterTab]}
                        onPress={() => setStatusFilter(s)}
                    >
                        <Text style={[styles.filterTabText, statusFilter === s && styles.activeFilterTabText]}>
                            {s.charAt(0).toUpperCase() + s.slice(1)}
                        </Text>
                    </TouchableOpacity>
                ))}
            </View>

            {isLoading && !isRefreshing ? (
                <View style={styles.loadingContainer}>
                    <ActivityIndicator size="large" color="#000" />
                </View>
            ) : (
                <FlatList
                    data={users}
                    renderItem={renderUserItem}
                    keyExtractor={(item) => item._id}
                    contentContainerStyle={styles.listContent}
                    refreshControl={
                        <RefreshControl refreshing={isRefreshing} onRefresh={() => {
                            setIsRefreshing(true);
                            fetchUsers();
                        }} />
                    }
                    ListEmptyComponent={
                        <View style={styles.emptyContainer}>
                            <Ionicons name="people-outline" size={64} color="#DDD" />
                            <Text style={styles.emptyText}>No users found</Text>
                        </View>
                    }
                />
            )}

            {/* User Details Modal */}
            <Modal
                animationType="slide"
                transparent={true}
                visible={modalVisible}
                onRequestClose={() => setModalVisible(false)}
            >
                <View style={styles.modalOverlay}>
                    <View style={styles.modalContent}>
                        <View style={styles.modalHeader}>
                            <Text style={styles.modalTitle}>User Details</Text>
                            <TouchableOpacity onPress={() => setModalVisible(false)}>
                                <Ionicons name="close" size={24} color="#000" />
                            </TouchableOpacity>
                        </View>
                        
                        <ScrollView style={styles.modalScroll}>
                            <View style={styles.modalProfileHeader}>
                                <Image
                                    source={selectedUser?.profileImage?.url || 'https://placehold.co/150'}
                                    style={styles.modalProfileImage}
                                />
                                <Text style={styles.modalUserName}>{selectedUser?.username}</Text>
                                <Text style={styles.modalUserEmail}>{selectedUser?.email}</Text>
                                <View style={[
                                    styles.statusBadge, 
                                    { backgroundColor: selectedUser?.isActive ? '#E8F5E9' : '#FFEBEE', marginTop: 10 }
                                ]}>
                                    <Text style={[
                                        styles.statusText, 
                                        { color: selectedUser?.isActive ? '#2E7D32' : '#C62828' }
                                    ]}>
                                        {selectedUser?.isActive ? 'Active' : 'Blocked'}
                                    </Text>
                                </View>
                            </View>

                            <View style={styles.detailSection}>
                                <View style={styles.detailRow}>
                                    <Ionicons name="calendar-outline" size={20} color="#666" />
                                    <Text style={styles.detailLabel}>Joined:</Text>
                                    <Text style={styles.detailValue}>
                                        {selectedUser ? new Date(selectedUser.createdAt).toLocaleDateString() : ''}
                                    </Text>
                                </View>
                                <View style={styles.detailRow}>
                                    <Ionicons name="mail-outline" size={20} color="#666" />
                                    <Text style={styles.detailLabel}>Email:</Text>
                                    <Text style={styles.detailValue}>{selectedUser?.email}</Text>
                                </View>
                                {selectedUser?.phone && (
                                     <View style={styles.detailRow}>
                                        <Ionicons name="call-outline" size={20} color="#666" />
                                        <Text style={styles.detailLabel}>Phone:</Text>
                                        <Text style={styles.detailValue}>{selectedUser.phone}</Text>
                                    </View>
                                )}
                            </View>
                        </ScrollView>
                        
                        <View style={styles.modalFooter}>
                             <TouchableOpacity
                                style={[
                                    styles.modalButton, 
                                    selectedUser?.isActive ? styles.blockButton : styles.unblockButton
                                ]}
                                onPress={() => confirmStatusChange(selectedUser)}
                            >
                                <Ionicons 
                                    name={selectedUser?.isActive ? "ban-outline" : "checkmark-circle-outline"} 
                                    size={20} 
                                    color="#fff" 
                                />
                                <Text style={styles.actionButtonText}>
                                    {selectedUser?.isActive ? 'Block User' : 'Unblock User'}
                                </Text>
                            </TouchableOpacity>
                        </View>
                    </View>
                </View>
            </Modal>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#F8F9FA',
    },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        padding: 20,
        backgroundColor: '#fff',
        borderBottomWidth: 1,
        borderBottomColor: '#F0F0F0',
    },
    backButton: {
        marginRight: 15,
    },
    title: {
        fontSize: 20,
        fontWeight: '700',
        color: '#1A1A1A',
    },
    searchContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#fff',
        marginHorizontal: 20,
        marginTop: 15,
        paddingHorizontal: 15,
        borderRadius: 12,
        height: 50,
        borderWidth: 1,
        borderColor: '#E0E0E0',
    },
    searchInput: {
        flex: 1,
        marginLeft: 10,
        fontSize: 16,
    },
    filterContainer: {
        flexDirection: 'row',
        padding: 20,
        gap: 10,
    },
    filterTab: {
        flex: 1,
        paddingVertical: 10,
        borderRadius: 10,
        backgroundColor: '#fff',
        alignItems: 'center',
        borderWidth: 1,
        borderColor: '#E0E0E0',
    },
    activeFilterTab: {
        backgroundColor: '#000',
        borderColor: '#000',
    },
    filterTabText: {
        fontSize: 14,
        fontWeight: '500',
        color: '#666',
    },
    activeFilterTabText: {
        color: '#fff',
    },
    loadingContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    listContent: {
        paddingHorizontal: 20,
        paddingBottom: 20,
    },
    userCard: {
        flexDirection: 'row',
        backgroundColor: '#fff',
        borderRadius: 16,
        padding: 12,
        marginBottom: 15,
        elevation: 2,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.05,
        shadowRadius: 5,
    },
    userImage: {
        width: 80,
        height: 80,
        borderRadius: 40,
        backgroundColor: '#F0F0F0',
    },
    userInfo: {
        flex: 1,
        marginLeft: 15,
        justifyContent: 'center',
    },
    infoTop: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
    },
    userName: {
        flex: 1,
        fontSize: 16,
        fontWeight: '600',
        color: '#1A1A1A',
        marginRight: 10,
    },
    userEmail: {
        fontSize: 13,
        color: '#666',
        marginTop: 4,
    },
    dateText: {
        fontSize: 12,
        color: '#999',
        marginTop: 4,
    },
    statusBadge: {
        paddingHorizontal: 8,
        paddingVertical: 3,
        borderRadius: 6,
    },
    statusText: {
        fontSize: 10,
        fontWeight: '700',
    },
    cardActions: {
        flexDirection: 'row',
        alignItems: 'center',
        marginTop: 12,
        gap: 10,
    },
    actionButton: {
        flex: 1,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        paddingVertical: 8,
        borderRadius: 8,
        gap: 6,
    },
    actionButtonText: {
        color: '#fff',
        fontSize: 13,
        fontWeight: '600',
    },
    blockButton: {
        backgroundColor: '#FF3B30',
    },
    unblockButton: {
        backgroundColor: '#4CAF50',
    },
    iconButton: {
        width: 36,
        height: 36,
        borderRadius: 8,
        justifyContent: 'center',
        alignItems: 'center',
    },
    eyeButton: {
        backgroundColor: '#E3F2FD',
    },
    emptyContainer: {
        alignItems: 'center',
        marginTop: 50,
    },
    emptyText: {
        marginTop: 15,
        fontSize: 16,
        color: '#999',
    },
    // Modal Styles
    modalOverlay: {
        flex: 1,
        backgroundColor: 'rgba(0,0,0,0.5)',
        justifyContent: 'center', 
        alignItems: 'center',
        padding: 20,
    },
    modalContent: {
        width: '100%',
        maxHeight: '80%',
        backgroundColor: '#fff',
        borderRadius: 20,
        overflow: 'hidden',
    },
    modalHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        padding: 15,
        borderBottomWidth: 1,
        borderBottomColor: '#F0F0F0',
    },
    modalTitle: {
        fontSize: 18,
        fontWeight: '700',
        color: '#1A1A1A',
    },
    modalScroll: {
        padding: 0,
    },
    modalProfileHeader: {
        alignItems: 'center',
        padding: 30,
        backgroundColor: '#FAFAFA',
        borderBottomWidth: 1,
        borderBottomColor: '#F0F0F0',
    },
    modalProfileImage: {
        width: 120,
        height: 120,
        borderRadius: 60,
        marginBottom: 15,
        backgroundColor: '#E0E0E0',
    },
    modalUserName: {
        fontSize: 22,
        fontWeight: '700',
        color: '#1A1A1A',
        marginBottom: 5,
    },
    modalUserEmail: {
        fontSize: 16,
        color: '#666',
    },
    detailSection: {
        padding: 20,
    },
    detailRow: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 15,
        paddingBottom: 15,
        borderBottomWidth: 1,
        borderBottomColor: '#F5F5F5',
    },
    detailLabel: {
        fontSize: 16,
        fontWeight: '600',
        color: '#555',
        width: 100,
        marginLeft: 15,
    },
    detailValue: {
        flex: 1,
        fontSize: 16,
        color: '#1A1A1A',
    },
    modalFooter: {
        padding: 15,
        borderTopWidth: 1,
        borderTopColor: '#F0F0F0',
    },
    modalButton: {
        flexDirection: 'row',
        paddingVertical: 14,
        borderRadius: 12,
        alignItems: 'center',
        justifyContent: 'center',
        gap: 10,
    },
});
