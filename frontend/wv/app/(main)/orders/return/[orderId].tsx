import React, { useState, useEffect } from 'react';
import {
    View,
    Text,
    StyleSheet,
    ScrollView,
    TouchableOpacity,
    TextInput,
    ActivityIndicator,
    Alert,
    Image,
} from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '@/src/context/ThemeContext';
import { Picker } from '@react-native-picker/picker';
import orderService from '@/src/api/orderService';
import returnService from '@/src/api/returnService';

const RETURN_REASONS = [
    { label: 'Select a reason', value: '' },
    { label: 'Defective/Damaged', value: 'defective' },
    { label: 'Wrong Item Received', value: 'wrong_item' },
    { label: 'Not as Described', value: 'not_as_described' },
    { label: 'Changed Mind', value: 'changed_mind' },
    { label: 'Other', value: 'other' },
];

export default function ReturnRequestScreen() {
    const router = useRouter();
    const { colors } = useTheme();
    const { orderId } = useLocalSearchParams();
    const [order, setOrder] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const [submitting, setSubmitting] = useState(false);
    const [selectedItems, setSelectedItems] = useState<Set<string>>(new Set());
    const [reason, setReason] = useState('');
    const [detailedReason, setDetailedReason] = useState('');

    useEffect(() => {
        loadOrder();
    }, [orderId]);

    const loadOrder = async () => {
        try {
            setLoading(true);
            const response = await orderService.getOrder(orderId as string);
            setOrder(response.order);
        } catch (error) {
            console.error('Load order error:', error);
            Alert.alert('Error', 'Failed to load order details');
        } finally {
            setLoading(false);
        }
    };

    const toggleItemSelection = (productId: string) => {
        const newSelected = new Set(selectedItems);
        if (newSelected.has(productId)) {
            newSelected.delete(productId);
        } else {
            newSelected.add(productId);
        }
        setSelectedItems(newSelected);
    };

    const handleSubmit = async () => {
        try {
            if (selectedItems.size === 0) {
                Alert.alert('Error', 'Please select at least one item to return');
                return;
            }

            if (!reason) {
                Alert.alert('Error', 'Please select a return reason');
                return;
            }

            if (!detailedReason.trim()) {
                Alert.alert('Error', 'Please provide a detailed explanation');
                return;
            }

            setSubmitting(true);

            const returnItems = order.items
                .filter((item: any) => selectedItems.has(item.productId))
                .map((item: any) => ({
                    productId: item.productId,
                    name: item.name,
                    quantity: item.quantity,
                    price: item.price,
                    thumbnail: item.thumbnail,
                    selectedOptions: item.selectedOptions,
                    reason: detailedReason
                }));

            await returnService.createReturn({
                orderId,
                items: returnItems,
                reason,
                detailedReason,
            });

            Alert.alert('Success', 'Return request submitted successfully', [
                {
                    text: 'OK',
                    onPress: () => router.back()
                }
            ]);
        } catch (error: any) {
            console.error('Submit return error:', error);
            Alert.alert('Error', error.response?.data?.message || 'Failed to submit return request');
        } finally {
            setSubmitting(false);
        }
    };

    if (loading) {
        return (
            <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
                <View style={styles.loadingContainer}>
                    <ActivityIndicator size="large" color={colors.primary} />
                </View>
            </SafeAreaView>
        );
    }

    if (!order) {
        return (
            <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
                <View style={styles.errorContainer}>
                    <Text style={[styles.errorText, { color: colors.text }]}>Order not found</Text>
                </View>
            </SafeAreaView>
        );
    }

    return (
        <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]} edges={['top']}>
            {/* Header */}
            <View style={[styles.header, { backgroundColor: colors.background, borderBottomColor: colors.border }]}>
                <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
                    <Ionicons name="arrow-back" size={24} color={colors.text} />
                </TouchableOpacity>
                <Text style={[styles.headerTitle, { color: colors.text }]}>Request Return</Text>
                <View style={{ width: 40 }} />
            </View>

            <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
                <View style={[styles.infoCard, { backgroundColor: colors.surface, borderColor: colors.border }]}>
                    <Ionicons name="information-circle-outline" size={24} color={colors.primary} />
                    <View style={{ flex: 1 }}>
                        <Text style={[styles.infoTitle, { color: colors.text }]}>Return Policy</Text>
                        <Text style={[styles.infoText, { color: colors.text + '80' }]}>
                            Returns accepted within 14 days of delivery. Select items, provide reason, and submit request.
                        </Text>
                    </View>
                </View>

                <Text style={[styles.sectionTitle, { color: colors.text }]}>Select Items to Return</Text>
                {order.items.map((item: any, index: number) => (
                    <TouchableOpacity
                        key={index}
                        style={[styles.itemCard, { backgroundColor: colors.surface, borderColor: selectedItems.has(item.productId) ? colors.primary : colors.border }]}
                        onPress={() => toggleItemSelection(item.productId)}
                    >
                        <View style={styles.checkbox}>
                            {selectedItems.has(item.productId) && (
                                <Ionicons name="checkmark" size={18} color={colors.primary} />
                            )}
                        </View>
                        {item.thumbnail && (
                            <Image 
                                source={{ uri: typeof item.thumbnail === 'string' ? item.thumbnail : 'https://via.placeholder.com/80' }} 
                                style={styles.itemImage} 
                            />
                        )}
                        <View style={styles.itemInfo}>
                            <Text style={[styles.itemName, { color: colors.text }]} numberOfLines={2}>
                                {item.name}
                            </Text>
                            <Text style={[styles.itemPrice, { color: colors.text + '80' }]}>
                                Qty: {item.quantity} • Rs. {item.price * item.quantity}
                            </Text>
                        </View>
                    </TouchableOpacity>
                ))}

                <Text style={[styles.sectionTitle, { color: colors.text }]}>Return Reason</Text>
                <View style={[styles.pickerContainer, { backgroundColor: colors.surface, borderColor: colors.border }]}>
                    <Picker
                        selectedValue={reason}
                        onValueChange={(value) => setReason(value)}
                        style={[styles.picker, { color: colors.text }]}
                    >
                        {RETURN_REASONS.map((r) => (
                            <Picker.Item key={r.value} label={r.label} value={r.value} />
                        ))}
                    </Picker>
                </View>

                <Text style={[styles.sectionTitle, { color: colors.text }]}>Detailed Explanation</Text>
                <TextInput
                    style={[styles.textArea, { backgroundColor: colors.surface, borderColor: colors.border, color: colors.text }]}
                    placeholder="Please explain why you want to return these items..."
                    placeholderTextColor={colors.text + '60'}
                    multiline
                    numberOfLines={6}
                    value={detailedReason}
                    onChangeText={setDetailedReason}
                />
            </ScrollView>

            {/* Submit Button */}
            <View style={[styles.footer, { backgroundColor: colors.background, borderTopColor: colors.border }]}>
                <TouchableOpacity
                    style={[styles.submitButton, { backgroundColor: colors.primary }]}
                    onPress={handleSubmit}
                    disabled={submitting}
                >
                    {submitting ? (
                        <ActivityIndicator color="#fff" />
                    ) : (
                        <>
                            <Ionicons name="send-outline" size={20} color="#fff" />
                            <Text style={styles.submitButtonText}>Submit Return Request</Text>
                        </>
                    )}
                </TouchableOpacity>
            </View>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    loadingContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    errorContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    errorText: {
        fontSize: 16,
    },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingHorizontal: 16,
        paddingVertical: 12,
        borderBottomWidth: 1,
    },
    backButton: {
        width: 40,
        height: 40,
        justifyContent: 'center',
        alignItems: 'center',
    },
    headerTitle: {
        fontSize: 20,
        fontWeight: 'bold',
    },
    content: {
        flex: 1,
        padding: 16,
    },
    infoCard: {
        flexDirection: 'row',
        padding: 16,
        borderRadius: 12,
        borderWidth: 1,
        marginBottom: 24,
        gap: 12,
    },
    infoTitle: {
        fontSize: 16,
        fontWeight: '600',
        marginBottom: 4,
    },
    infoText: {
        fontSize: 13,
        lineHeight: 18,
    },
    sectionTitle: {
        fontSize: 16,
        fontWeight: '600',
        marginBottom: 12,
        marginTop: 8,
    },
    itemCard: {
        flexDirection: 'row',
        padding: 12,
        borderRadius: 12,
        borderWidth: 2,
        marginBottom: 12,
        alignItems: 'center',
    },
    checkbox: {
        width: 24,
        height: 24,
        borderRadius: 6,
        borderWidth: 2,
        borderColor: '#ccc',
        marginRight: 12,
        justifyContent: 'center',
        alignItems: 'center',
    },
    itemImage: {
        width: 60,
        height: 60,
        borderRadius: 8,
        marginRight: 12,
    },
    itemInfo: {
        flex: 1,
    },
    itemName: {
        fontSize: 14,
        fontWeight: '600',
        marginBottom: 4,
    },
    itemPrice: {
        fontSize: 12,
    },
    pickerContainer: {
        borderRadius: 12,
        borderWidth: 1,
        marginBottom: 16,
        overflow: 'hidden',
    },
    picker: {
        height: 50,
    },
    textArea: {
        borderWidth: 1,
        borderRadius: 12,
        padding: 12,
        minHeight: 120,
        textAlignVertical: 'top',
        marginBottom: 16,
    },
    footer: {
        padding: 16,
        borderTopWidth: 1,
    },
    submitButton: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        paddingVertical: 14,
        borderRadius: 12,
        gap: 8,
    },
    submitButtonText: {
        color: '#fff',
        fontSize: 16,
        fontWeight: '600',
    },
});
