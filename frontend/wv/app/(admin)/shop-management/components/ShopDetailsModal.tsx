import React from 'react';
import { View, StyleSheet, ScrollView, Modal } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Text, IconButton, Divider } from 'react-native-paper';
import { Image } from 'expo-image';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '@/src/context/ThemeContext';

interface ShopDetailsModalProps {
    visible: boolean;
    onDismiss: () => void;
    shop: any | null;
}

const ShopDetailsModal: React.FC<ShopDetailsModalProps> = ({ visible, onDismiss, shop }) => {
    const { colors } = useTheme();

    // Safe date formatting
    const formatDate = (dateString: string) => {
        try {
            return dateString ? new Date(dateString).toLocaleDateString() : 'N/A';
        } catch (e) {
            return 'Invalid Date';
        }
    };

    return (
        <Modal 
            visible={visible} 
            animationType="slide" 
            onRequestClose={onDismiss}
            transparent={true}
            statusBarTranslucent={true}
        >
            <View style={[styles.modalContainer, { backgroundColor: colors.background }]}>
                <SafeAreaView style={styles.safeArea}>
                    {shop ? (
                        <>
                            {/* Header */}
                            <View style={styles.header}>
                                <IconButton icon="close" onPress={onDismiss} />
                                <Text style={[styles.title, { color: colors.text }]}>Shop Details</Text>
                                <View style={{ width: 40 }} />
                            </View>

                            <ScrollView contentContainerStyle={styles.content}>
                                {/* Header Profile Section */}
                                <View style={styles.profileSection}>
                                    <Image
                                        source={shop.logo?.url || 'https://placehold.co/100'}
                                        style={styles.logo}
                                    />
                                    <Image
                                        source={shop.seller?.profileImage?.url || 'https://placehold.co/100'}
                                        style={styles.sellerAvatar}
                                    />
                                    <Text style={[styles.shopName, { color: colors.text }]}>{shop.shopName}</Text>
                                    <View style={[
                                        styles.statusBadge,
                                        { backgroundColor: shop.isVerified ? '#E8F5E9' : '#FFF3E0' }
                                    ]}>
                                        <Text style={[
                                            styles.statusText,
                                            { color: shop.isVerified ? '#2E7D32' : '#EF6C00' }
                                        ]}>
                                            {shop.isVerified ? 'Verified' : 'Pending Verification'}
                                        </Text>
                                    </View>
                                </View>

                                <Divider style={styles.divider} />

                                {/* Shop Information */}
                                <SectionTitle title="Shop Information" color={colors.primary} />
                                <DetailRow icon="briefcase" label="Category" value={shop.category} color={colors.text} />
                                <DetailRow icon="document-text" label="Description" value={shop.description || 'No description provided'} color={colors.text} />
                                <DetailRow icon="location" label="City" value={shop.city} color={colors.text} />
                                <DetailRow icon="map" label="Address" value={shop.address} color={colors.text} />

                                <Divider style={styles.divider} />

                                {/* Contact Information */}
                                <SectionTitle title="Contact Information" color={colors.primary} />
                                <DetailRow icon="mail" label="Email" value={shop.email} color={colors.text} />
                                <DetailRow icon="call" label="Phone" value={shop.phone} color={colors.text} />
                                
                                <Divider style={styles.divider} />

                                {/* Seller Information */}
                                <SectionTitle title="Seller Details" color={colors.primary} />
                                <DetailRow icon="person" label="Name" value={shop.seller?.fullName || 'N/A'} color={colors.text} />
                                <DetailRow icon="mail-open" label="Seller Email" value={shop.seller?.email || 'N/A'} color={colors.text} />
                                
                                <Divider style={styles.divider} />
                                
                                <SectionTitle title="System Information" color={colors.primary} />
                                <DetailRow icon="time" label="Created At" value={formatDate(shop.createdAt)} color={colors.text} />
                                <DetailRow icon="information-circle" label="Status" value={shop.isActive ? 'Active' : 'Blocked'} color={colors.text} />

                                <View style={{ height: 40 }} />
                            </ScrollView>
                        </>
                    ) : (
                        <View style={styles.loadingContainer}>
                            <Text>Loading details...</Text>
                        </View>
                    )}
                </SafeAreaView>
            </View>
        </Modal>
    );
};

const SectionTitle = ({ title, color }: { title: string, color: string }) => (
    <Text style={[styles.sectionTitle, { color }]}>{title}</Text>
);

const DetailRow = ({ icon, label, value, color }: { icon: any, label: string, value: string, color: string }) => (
    <View style={styles.detailRow}>
        <View style={styles.iconContainer}>
            <Ionicons name={icon} size={20} color="#666" />
        </View>
        <View style={styles.detailContent}>
            <Text style={styles.detailLabel}>{label}</Text>
            <Text style={[styles.detailValue, { color }]}>{value}</Text>
        </View>
    </View>
);

const styles = StyleSheet.create({
    modalContainer: {
        flex: 1,
    },
    safeArea: {
        flex: 1,
    },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: 10,
        elevation: 2,
        backgroundColor: '#fff', 
    },
    title: {
        fontSize: 18,
        fontWeight: 'bold',
    },
    content: {
        padding: 20,
    },
    profileSection: {
        alignItems: 'center',
        marginBottom: 20,
    },
    logo: {
        width: 100,
        height: 100,
        borderRadius: 12,
        backgroundColor: '#f0f0f0',
        marginBottom: -30,
    },
    sellerAvatar: {
        width: 60,
        height: 60,
        borderRadius: 30,
        borderWidth: 3,
        borderColor: '#fff',
        marginBottom: 10,
    },
    shopName: {
        fontSize: 22,
        fontWeight: 'bold',
        marginBottom: 5,
    },
    statusBadge: {
        paddingHorizontal: 12,
        paddingVertical: 5,
        borderRadius: 15,
        marginTop: 5,
    },
    statusText: {
        fontSize: 12,
        fontWeight: '600',
    },
    divider: {
        marginVertical: 15,
    },
    sectionTitle: {
        fontSize: 18,
        fontWeight: '600',
        marginBottom: 15,
    },
    detailRow: {
        flexDirection: 'row',
        marginBottom: 15,
        alignItems: 'flex-start',
    },
    iconContainer: {
        width: 30,
        alignItems: 'center',
        marginRight: 10,
        marginTop: 2,
    },
    detailContent: {
        flex: 1,
    },
    detailLabel: {
        fontSize: 12,
        color: '#888',
        marginBottom: 2,
    },
    detailValue: {
        fontSize: 15,
    },
    loadingContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
});

export default ShopDetailsModal;
