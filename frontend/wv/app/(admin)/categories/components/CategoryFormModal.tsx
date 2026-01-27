import React, { useState, useEffect } from 'react';
import { View, StyleSheet, ScrollView, Modal, TouchableOpacity, Alert } from 'react-native';
import { Text, TextInput, Button, IconButton, Switch, SegmentedButtons, HelperText } from 'react-native-paper';
import { useTheme } from '@/src/context/ThemeContext';
import { productService } from '@/src/api/productService';
import EmojiPickerModal from './EmojiPickerModal';

interface Attribute {
    key: string;
    label: string;
    type: 'text' | 'number' | 'select' | 'boolean' | 'multiselect';
    required: boolean;
    options?: string[]; // For select/multiselect
}

interface CategoryFormModalProps {
    visible: boolean;
    onDismiss: () => void;
    onSubmit: () => void;
    category: any | null; // If null, create mode
}

const CategoryFormModal: React.FC<CategoryFormModalProps> = ({ visible, onDismiss, onSubmit, category }) => {
    const { colors, tokens } = useTheme();
    const spacing = tokens?.spacing || { xs: 4, sm: 8, md: 16, lg: 24 };
    const radius = tokens?.radius || { xs: 4, sm: 8, md: 16 };

    // Basic Info
    const [name, setName] = useState('');
    const [icon, setIcon] = useState('📦');
    const [description, setDescription] = useState('');
    const [type, setType] = useState('other');
    const [isTryOnEnabled, setIsTryOnEnabled] = useState(false);

    // Attributes
    const [attributes, setAttributes] = useState<Attribute[]>([]);

    // Attribute Builder State
    const [showAttrBuilder, setShowAttrBuilder] = useState(false);
    const [newAttrLabel, setNewAttrLabel] = useState('');
    const [newAttrType, setNewAttrType] = useState<'text' | 'select' | 'boolean'>('text');
    const [newAttrOptions, setNewAttrOptions] = useState('');
    const [newAttrRequired, setNewAttrRequired] = useState(false);

    // Emoji Picker State
    const [showEmojiPicker, setShowEmojiPicker] = useState(false);

    useEffect(() => {
        if (category) {
            setName(category.name);
            setIcon(category.icon || '📦');
            setDescription(category.description || '');
            setType(category.type || 'other');
            setIsTryOnEnabled(category.isTryOnEnabled || false);
            setAttributes(category.attributes || []);
        } else {
            // Reset for create mode
            setName('');
            setIcon('📦');
            setDescription('');
            setType('clothing'); // Default
            setIsTryOnEnabled(false);
            setAttributes([]);
        }
    }, [category, visible]);

    const handleSave = async () => {
        if (!name) {
            Alert.alert('Error', 'Name is required');
            return;
        }

        const categoryData = {
            name,
            icon,
            description,
            type,
            attributes,
            isTryOnEnabled
        };

        try {
            if (category) {
                await (productService as any).updateCategory(category._id, categoryData);
                Alert.alert('Success', 'Category updated');
            } else {
                await (productService as any).createCategory(categoryData);
                Alert.alert('Success', 'Category created');
            }
            onSubmit();
        } catch (error: any) {
            console.error('Save category error:', error);
            Alert.alert('Error', error.response?.data?.message || 'Failed to save category');
        }
    };

    const addAttribute = () => {
        if (!newAttrLabel) {
            Alert.alert('Error', 'Attribute label is required');
            return;
        }

        const key = newAttrLabel.toLowerCase().replace(/\s+/g, '_');

        // Check duplicate key
        if (attributes.some(a => a.key === key)) {
            Alert.alert('Error', 'Attribute with this name already exists');
            return;
        }

        const newAttribute: Attribute = {
            key,
            label: newAttrLabel,
            type: newAttrType === 'select' ? 'select' : newAttrType, // Map nicely
            required: newAttrRequired,
            options: newAttrType === 'select' ? newAttrOptions.split(',').map(s => s.trim()).filter(Boolean) : undefined
        };

        setAttributes([...attributes, newAttribute]);
        // Reset builder
        setNewAttrLabel('');
        setNewAttrOptions('');
        setNewAttrRequired(false);
        setShowAttrBuilder(false);
    };

    const removeAttribute = (index: number) => {
        const newAttrs = [...attributes];
        newAttrs.splice(index, 1);
        setAttributes(newAttrs);
    };

    const typeOptions = [
        { value: 'clothing', label: 'Clothing' },
        { value: 'footwear', label: 'Footwear' },
        { value: 'accessory', label: 'Accessory' },
        { value: 'other', label: 'Other' },
    ];

    return (
        <Modal visible={visible} animationType="slide" onRequestClose={onDismiss}>
            <View style={[styles.container, { backgroundColor: colors.background }]}>
                <View style={styles.header}>
                    <IconButton icon="close" onPress={onDismiss} />
                    <Text style={[styles.title, { color: colors.text }]}>
                        {category ? 'Edit Category' : 'New Category'}
                    </Text>
                    <Button mode="contained" onPress={handleSave}>Save</Button>
                </View>

                <ScrollView contentContainerStyle={styles.content}>
                    {/* Basic Info Section */}
                    <Text style={[styles.sectionTitle, { color: colors.primary }]}>Basic Info</Text>

                    <TextInput
                        label="Category Name"
                        value={name}
                        onChangeText={setName}
                        style={styles.input}
                        mode="outlined"
                    />

                    <View style={[styles.row, { alignItems: 'flex-start' }]}>
                        <View style={{ alignItems: 'center', marginRight: 15 }}>
                            <TouchableOpacity
                                onPress={() => setShowEmojiPicker(true)}
                                style={[styles.iconPreview, { borderColor: colors.primary }]}
                            >
                                <Text style={{ fontSize: 32 }}>{icon || '📦'}</Text>
                                <View style={[styles.editBadge, { backgroundColor: colors.primary }]}>
                                    <IconButton icon="pencil" iconColor="white" size={12} style={{ margin: 0 }} />
                                </View>
                            </TouchableOpacity>
                        </View>

                        <TextInput
                            label="Description"
                            value={description}
                            onChangeText={setDescription}
                            style={[styles.input, { flex: 1 }]}
                            mode="outlined"
                            multiline
                            numberOfLines={3}
                        />
                    </View>

                    <Text style={{ marginTop: 10, color: colors.text }}>Category Type</Text>
                    <SegmentedButtons
                        value={type}
                        onValueChange={setType}
                        buttons={typeOptions}
                        style={{ marginTop: 5, marginBottom: 10 }}
                    />

                    <View style={[styles.row, { justifyContent: 'space-between', marginBottom: 20 }]}>
                        <Text style={{ fontSize: 16, color: colors.text }}>Enable Virtual Try-On?</Text>
                        <Switch value={isTryOnEnabled} onValueChange={setIsTryOnEnabled} />
                    </View>

                    {/* Dynamic Attributes Section */}
                    <View style={[styles.divider, { backgroundColor: colors.border }]} />
                    <View style={styles.rowBetween}>
                        <Text style={[styles.sectionTitle, { color: colors.primary }]}>Attributes ({attributes.length})</Text>
                        <Button mode="text" icon="plus" onPress={() => setShowAttrBuilder(!showAttrBuilder)}>
                            {showAttrBuilder ? 'Cancel' : 'Add Attribute'}
                        </Button>
                    </View>
                    <HelperText type="info">Define specific fields for products in this category (e.g., Size, Material).</HelperText>

                    {/* Attribute Builder Form */}
                    {showAttrBuilder && (
                        <View style={[styles.builderBox, { backgroundColor: colors.surface, borderColor: colors.primary }]}>
                            <Text style={{ fontWeight: 'bold', marginBottom: 10, color: colors.text }}>New Attribute</Text>
                            <TextInput
                                label="Label (e.g. Material)"
                                value={newAttrLabel}
                                onChangeText={setNewAttrLabel}
                                mode="outlined"
                                style={styles.input}
                            />

                            <Text style={{ color: colors.text, marginTop: 5 }}>Input Type</Text>
                            <SegmentedButtons
                                value={newAttrType}
                                onValueChange={(val) => setNewAttrType(val as any)}
                                buttons={[
                                    { value: 'text', label: 'Text' },
                                    { value: 'select', label: 'Select' },
                                    { value: 'boolean', label: 'Switch' },
                                ]}
                                style={{ marginVertical: 8 }}
                            />

                            {newAttrType === 'select' && (
                                <TextInput
                                    label="Options (comma separated)"
                                    placeholder="e.g. Cotton, Wool, Silk"
                                    value={newAttrOptions}
                                    onChangeText={setNewAttrOptions}
                                    mode="outlined"
                                    style={styles.input}
                                />
                            )}

                            <View style={styles.row}>
                                <Text style={{ color: colors.text }}>Required Field?</Text>
                                <Switch value={newAttrRequired} onValueChange={setNewAttrRequired} />
                            </View>

                            <Button mode="contained" onPress={addAttribute} style={{ marginTop: 10 }}>
                                Add Attribute
                            </Button>
                        </View>
                    )}

                    {/* Attributes List */}
                    {attributes.map((attr, index) => (
                        <View key={index} style={[styles.attributeItem, { backgroundColor: colors.surface }]}>
                            <View style={{ flex: 1 }}>
                                <Text style={{ fontWeight: 'bold', color: colors.text }}>{attr.label} <Text style={{ color: colors.text + '80' }}>({attr.type})</Text></Text>
                                <Text style={{ fontSize: 12, color: colors.text + '80' }}>Key: {attr.key} {attr.required ? '• Required' : ''}</Text>
                                {attr.options && (
                                    <Text style={{ fontSize: 12, color: colors.text + '60' }}>Options: {attr.options.join(', ')}</Text>
                                )}
                            </View>
                            <IconButton icon="delete" iconColor={colors.error} onPress={() => removeAttribute(index)} />
                        </View>
                    ))}

                    <View style={{ height: 50 }} />
                </ScrollView>
            </View>

            <EmojiPickerModal
                visible={showEmojiPicker}
                onDismiss={() => setShowEmojiPicker(false)}
                onSelect={(emoji) => {
                    setIcon(emoji);
                    setShowEmojiPicker(false);
                }}
            />
        </Modal >
    );
};

const styles = StyleSheet.create({
    container: { flex: 1 },
    header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', padding: 10, elevation: 2 },
    title: { fontSize: 18, fontWeight: 'bold' },
    content: { padding: 20 },
    sectionTitle: { fontSize: 18, fontWeight: 'bold', marginBottom: 10 },
    input: { marginBottom: 15, backgroundColor: 'transparent' },
    row: { flexDirection: 'row', alignItems: 'center' },
    rowBetween: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
    divider: { height: 1, marginVertical: 20 },
    builderBox: { padding: 15, borderRadius: 8, borderWidth: 1, marginBottom: 20 },
    attributeItem: { flexDirection: 'row', alignItems: 'center', padding: 10, borderRadius: 8, marginBottom: 8, elevation: 1 },
    iconPreview: {
        width: 60,
        height: 60,
        borderRadius: 30, // Circle
        borderWidth: 2,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: 'rgba(0,0,0,0.03)',
        marginBottom: 5,
    },
    editBadge: {
        position: 'absolute',
        bottom: -5,
        right: -5,
        width: 24,
        height: 24,
        borderRadius: 12,
        justifyContent: 'center',
        alignItems: 'center',
        elevation: 2,
    }
});

export default CategoryFormModal;
