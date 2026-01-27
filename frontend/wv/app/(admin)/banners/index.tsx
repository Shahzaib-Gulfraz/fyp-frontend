import React, { useState, useEffect } from 'react';
import { View, StyleSheet, ScrollView, RefreshControl, Alert, Image, Platform } from 'react-native';
import { Text, FAB, Card, Button, IconButton, Switch, Chip, ActivityIndicator } from 'react-native-paper';
import { useRouter } from 'expo-router';
import { bannerService } from '@/src/api';
import { useTheme } from '@/src/context/ThemeContext';
import BannerFormModal from './components/BannerFormModal';

const AdminBannersScreen = () => {
    const { colors } = useTheme();
    const router = useRouter();
    const [banners, setBanners] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);

    // Modal State
    const [modalVisible, setModalVisible] = useState(false);
    const [editingBanner, setEditingBanner] = useState<any | null>(null);

    const fetchBanners = async () => {
        try {
            const data = await bannerService.getAllBannersAdmin();
            if (data && data.banners) {
                setBanners(data.banners);
            }
        } catch (error) {
            console.error('Error fetching banners:', error);
            Alert.alert('Error', 'Failed to load banners');
        } finally {
            setLoading(false);
            setRefreshing(false);
        }
    };

    useEffect(() => {
        fetchBanners();
    }, []);

    const onRefresh = () => {
        setRefreshing(true);
        fetchBanners();
    };

    const handleDelete = (id: string) => {
        if (Platform.OS === 'web') {
            const confirmed = window.confirm('Delete Banner\n\nAre you sure? This cannot be undone.');
            if (confirmed) {
                deleteBanner(id);
            }
        } else {
            Alert.alert(
                'Delete Banner',
                'Are you sure? This cannot be undone.',
                [
                    { text: 'Cancel', style: 'cancel' },
                    {
                        text: 'Delete',
                        style: 'destructive',
                        onPress: () => deleteBanner(id)
                    }
                ]
            );
        }
    };

    const deleteBanner = async (id: string) => {
        try {
            await bannerService.deleteBanner(id);
            fetchBanners();
            if (Platform.OS !== 'web') {
                Alert.alert('Success', 'Banner deleted');
            } else {
                window.alert('Banner deleted');
            }
        } catch (error) {
            console.error(error);
            if (Platform.OS !== 'web') {
                Alert.alert('Error', 'Failed to delete banner');
            } else {
                window.alert('Failed to delete banner');
            }
        }
    };

    const handleToggleActive = async (banner: any) => {
        try {
            await bannerService.updateBanner(banner._id, { isActive: !banner.isActive });
            fetchBanners(); // Refresh to show update
        } catch (error) {
            Alert.alert('Error', 'Failed to update status');
        }
    };

    const handleEdit = (banner: any) => {
        setEditingBanner(banner);
        setModalVisible(true);
    };

    const handleAdd = () => {
        setEditingBanner(null);
        setModalVisible(true);
    };

    if (loading && !refreshing) {
        return (
            <View style={[styles.center, { backgroundColor: colors.background }]}>
                <ActivityIndicator size="large" color={colors.primary} />
            </View>
        );
    }

    return (
        <View style={[styles.container, { backgroundColor: colors.background }]}>
            <View style={[styles.header, { backgroundColor: colors.surface }]}>
                <IconButton
                    icon="arrow-left"
                    size={24}
                    onPress={() => router.back()}
                    iconColor={colors.text}
                />
                <Text style={[styles.title, { color: colors.text }]}>Featured Banners</Text>
            </View>

            <ScrollView
                contentContainerStyle={styles.listContent}
                refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
            >
                {banners.map((banner) => (
                    <Card key={banner._id} style={[styles.card, { backgroundColor: colors.surface }]}>
                        <Card.Content>
                            <View style={styles.cardHeader}>
                                <Text style={[styles.cardTitle, { color: colors.text }]}>{banner.title}</Text>
                                <Switch value={banner.isActive} onValueChange={() => handleToggleActive(banner)} />
                            </View>

                            {banner.imageUrl ? (
                                <Image source={{ uri: banner.imageUrl }} style={styles.bannerImage} resizeMode="cover" />
                            ) : null}

                            <Text style={{ color: colors.text, marginTop: 5 }}>Subtitle: {banner.subtitle || '-'}</Text>
                            <Text style={{ color: colors.text }}>Link: {banner.link}</Text>
                            <View style={[styles.row, { marginTop: 10 }]}>
                                <Chip style={{ marginRight: 10 }}>Order: {banner.order}</Chip>
                                <Chip>{banner.ctaText}</Chip>
                            </View>

                        </Card.Content>
                        <Card.Actions>
                            <Button onPress={() => handleEdit(banner)}>Edit</Button>
                            <Button textColor={colors.error} onPress={() => handleDelete(banner._id)}>Delete</Button>
                        </Card.Actions>
                    </Card>
                ))}
                {banners.length === 0 && (
                    <Text style={{ textAlign: 'center', marginTop: 40, color: colors.text + '80' }}>No banners found. Create one!</Text>
                )}
            </ScrollView>

            <FAB
                style={[styles.fab, { backgroundColor: colors.primary }]}
                icon="plus"
                color="white"
                onPress={handleAdd}
                label="New Banner"
            />

            <BannerFormModal
                visible={modalVisible}
                onDismiss={() => setModalVisible(false)}
                onSubmit={() => { setModalVisible(false); fetchBanners(); }}
                banner={editingBanner}
            />
        </View>
    );
};

const styles = StyleSheet.create({
    container: { flex: 1 },
    center: { flex: 1, justifyContent: 'center', alignItems: 'center' },
    header: {
        marginTop: 20,
        flexDirection: 'row',
        alignItems: 'center',
        paddingVertical: 8,
        paddingHorizontal: 4,
        elevation: 4,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
        zIndex: 1,
    },
    title: { fontSize: 20, fontWeight: 'bold' },
    listContent: { padding: 20, paddingBottom: 80 },
    card: { marginBottom: 15, elevation: 2 },
    cardHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 },
    cardTitle: { fontSize: 18, fontWeight: 'bold', flex: 1 },
    bannerImage: { width: '100%', height: 120, borderRadius: 8, marginVertical: 10 },
    row: { flexDirection: 'row', alignItems: 'center' },
    fab: { position: 'absolute', margin: 16, right: 0, bottom: 0 },
});

export default AdminBannersScreen;
