// src/components/shop/Upload3DSection.tsx
import React, { useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Image, ScrollView } from 'react-native';
import { Card } from 'react-native-paper';
import { Camera, Sparkles, Upload, X, RotateCw } from 'lucide-react-native';
import * as ImagePicker from 'expo-image-picker';
import { useTheme } from '@/src/context/ThemeContext';
import { appTheme } from '@/src/theme/appTheme';

const Upload3DSection: React.FC = () => {
  const { colors } = useTheme();
  const { spacing, radius, fonts } = appTheme.tokens;
  const [uploadedImages, setUploadedImages] = useState<string[]>([]);
  const [isGenerating, setIsGenerating] = useState(false);

  const pickImages = async () => {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsMultipleSelection: true,
      quality: 0.8,
    });

    if (!result.canceled) {
      const newImages = result.assets.map(asset => asset.uri);
      setUploadedImages(prev => [...prev, ...newImages]);
    }
  };

  const takePhoto = async () => {
    const result = await ImagePicker.launchCameraAsync({ quality: 0.8 });
    if (!result.canceled) setUploadedImages(prev => [...prev, result.assets[0].uri]);
  };

  const removeImage = (index: number) => {
    setUploadedImages(prev => prev.filter((_, i) => i !== index));
  };

  const generate3DModel = async () => {
    setIsGenerating(true);
    setTimeout(() => setIsGenerating(false), 3000); // simulate API call
  };

  return (
    <Card style={[styles.card, { backgroundColor: colors.surface, borderRadius: radius.lg, margin: spacing.md }]}>
      <Card.Content>
        {/* Header */}
        <View style={styles.header}>
          <Sparkles size={24} color={colors.primary} />
          <Text style={[styles.title, { color: colors.text, fontFamily: fonts.bold, marginLeft: spacing.sm }]}>
            AI 3D Model Generator
          </Text>
        </View>

        {/* Uploaded Images */}
        {uploadedImages.length > 0 && (
          <View style={{ marginTop: spacing.lg }}>
            <Text style={[styles.sectionTitle, { color: colors.text, fontFamily: fonts.medium, marginBottom: spacing.sm }]}>
              Uploaded Photos ({uploadedImages.length}/8)
            </Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false}>
              <View style={styles.imagesGrid}>
                {uploadedImages.map((uri, index) => (
                  <View key={index} style={styles.imageContainer}>
                    <Image source={{ uri }} style={[styles.image, { borderRadius: radius.md }]} />
                    <TouchableOpacity
                      onPress={() => removeImage(index)}
                      style={[styles.removeImageButton, { backgroundColor: colors.error, borderRadius: radius.full }]}
                    >
                      <X size={14} color={colors.background} />
                    </TouchableOpacity>
                    <Text style={[styles.imageLabel, { color: colors.textTertiary, fontFamily: fonts.regular }]}>
                      Angle {index + 1}
                    </Text>
                  </View>
                ))}

                {uploadedImages.length < 8 && (
                  <TouchableOpacity
                    onPress={pickImages}
                    style={[styles.addImageButton, { borderRadius: radius.md, borderColor: colors.border }]}
                  >
                    <Upload size={20} color={colors.textSecondary} />
                    <Text style={[styles.addImageText, { color: colors.textTertiary, fontFamily: fonts.regular }]}>
                      Add More
                    </Text>
                  </TouchableOpacity>
                )}
              </View>
            </ScrollView>
          </View>
        )}

        {/* Action Buttons */}
        <View style={[styles.buttonsContainer, { marginTop: spacing.lg }]}>
          {uploadedImages.length === 0 ? (
            <>
              <TouchableOpacity
                onPress={pickImages}
                style={[styles.primaryButton, { backgroundColor: colors.primary, borderRadius: radius.lg, flex: 1, marginRight: spacing.sm }]}
                activeOpacity={0.9}
              >
                <Upload size={20} color={colors.background} />
                <Text style={[styles.primaryButtonText, { color: colors.background, fontFamily: fonts.semiBold, marginLeft: spacing.sm }]}>
                  Upload Photos
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                onPress={takePhoto}
                style={[styles.secondaryButton, { backgroundColor: colors.surface, borderColor: colors.border, borderRadius: radius.lg, padding: spacing.md }]}
                activeOpacity={0.8}
              >
                <Camera size={20} color={colors.text} />
              </TouchableOpacity>
            </>
          ) : (
            <TouchableOpacity
              onPress={generate3DModel}
              disabled={isGenerating}
              style={[styles.generateButton, { backgroundColor: colors.primary, borderRadius: radius.lg, opacity: isGenerating ? 0.7 : 1 }]}
              activeOpacity={0.9}
            >
              {isGenerating ? (
                <>
                  <RotateCw size={20} color={colors.background} style={{ marginRight: spacing.sm }} />
                  <Text style={[styles.generateButtonText, { color: colors.background, fontFamily: fonts.semiBold }]}>
                    Generating...
                  </Text>
                </>
              ) : (
                <>
                  <Sparkles size={20} color={colors.background} />
                  <Text style={[styles.generateButtonText, { color: colors.background, fontFamily: fonts.semiBold, marginLeft: spacing.sm }]}>
                    Generate 3D Model
                  </Text>
                </>
              )}
            </TouchableOpacity>
          )}
        </View>
      </Card.Content>
    </Card>
  );
};

const styles = StyleSheet.create({
  card: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  header: { flexDirection: 'row', alignItems: 'center' },
  title: { fontSize: 20 },
  sectionTitle: { fontSize: 16, fontWeight: '500' },
  imagesGrid: { flexDirection: 'row', alignItems: 'center' },
  imageContainer: { marginRight: 12, alignItems: 'center' },
  image: { width: 80, height: 80 },
  removeImageButton: { position: 'absolute', top: -8, right: -8, width: 24, height: 24, alignItems: 'center', justifyContent: 'center' },
  imageLabel: { fontSize: 10, marginTop: 4 },
  addImageButton: { width: 80, height: 80, alignItems: 'center', justifyContent: 'center', borderWidth: 1, borderStyle: 'dashed', marginRight: 12 },
  addImageText: { fontSize: 11, marginTop: 4 },
  buttonsContainer: { flexDirection: 'row', alignItems: 'center' },
  primaryButton: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', paddingVertical: 16, paddingHorizontal: 20 },
  primaryButtonText: { fontSize: 16, fontWeight: '600' },
  secondaryButton: { padding: 16, borderWidth: 1 },
  generateButton: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', paddingVertical: 16, paddingHorizontal: 20 },
  generateButtonText: { fontSize: 16, fontWeight: '600' },
});

export default Upload3DSection;
