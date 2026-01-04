// src/components/shop/UploadExistingModel.tsx
import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Alert } from 'react-native';
import { Card } from 'react-native-paper';
import { Upload, File, AlertCircle } from 'lucide-react-native';
import * as DocumentPicker from 'expo-document-picker';
import { useTheme } from '@/src/context/ThemeContext';
import { appTheme } from '@/src/theme/appTheme';

interface UploadedFile {
  id: string;
  name: string;
  size: string;
  type: 'glb' | 'obj' | 'fbx';
  date: string;
}

const UploadExistingModel: React.FC = () => {
  const { colors } = useTheme();
  const { spacing, radius, fonts } = appTheme.tokens;
  const [uploadedFiles, setUploadedFiles] = useState<UploadedFile[]>([]);
  const [isUploading, setIsUploading] = useState(false);

  const handleFilePick = async () => {
    try {
      const result = await DocumentPicker.getDocumentAsync({
        type: ['model/gltf-binary', 'model/obj', 'model/fbx'],
        copyToCacheDirectory: true,
      });

      if (result.canceled) return;

      const file = result.assets[0];
      const fileSize = (file.size! / (1024 * 1024)).toFixed(2);
      const fileType = file.name?.endsWith('.glb') ? 'glb' : 
                      file.name?.endsWith('.obj') ? 'obj' : 'fbx';

      const newFile: UploadedFile = {
        id: Date.now().toString(),
        name: file.name || '3D Model',
        size: `${fileSize} MB`,
        type: fileType,
        date: new Date().toLocaleDateString(),
      };

      setUploadedFiles(prev => [...prev, newFile]);
      
      Alert.alert(
        'File Uploaded',
        `${file.name} has been uploaded successfully.`,
        [{ text: 'OK' }]
      );
    } catch (error) {
      Alert.alert('Error', 'Failed to upload file. Please try again.');
    }
  };

  const removeFile = (id: string) => {
    setUploadedFiles(prev => prev.filter(file => file.id !== id));
  };

  const getFileIconColor = (type: string) => {
    switch (type) {
      case 'glb': return '#2196F3';
      case 'obj': return '#4CAF50';
      case 'fbx': return '#FF9800';
      default: return colors.textSecondary;
    }
  };

  return (
    <Card style={[
      styles.container,
      { 
        backgroundColor: colors.surface,
        borderRadius: radius.lg,
        margin: spacing.md,
      }
    ]}>
      <Card.Content>
        <Text style={[
          styles.title,
          { 
            color: colors.text,
            fontFamily: fonts.semiBold,
            fontSize: 18,
            marginBottom: spacing.sm,
          }
        ]}>
          Upload 3D Models
        </Text>

        <Text style={[
          styles.subtitle,
          { 
            color: colors.textSecondary,
            fontFamily: fonts.regular,
            fontSize: 14,
            marginBottom: spacing.md,
            lineHeight: 20,
          }
        ]}>
          Upload existing 3D models in .glb, .obj, or .fbx format
        </Text>

        <TouchableOpacity
          onPress={handleFilePick}
          style={[
            styles.uploadButton,
            { 
              backgroundColor: colors.primary + '08',
              borderColor: colors.primary,
              borderRadius: radius.lg,
              borderWidth: 2,
              borderStyle: 'dashed',
            }
          ]}
          activeOpacity={0.8}
        >
          <Upload size={32} color={colors.primary} />
          <Text style={[
            styles.uploadButtonText,
            { 
              color: colors.primary,
              fontFamily: fonts.semiBold,
              fontSize: 16,
              marginTop: spacing.sm,
            }
          ]}>
            Select 3D Model File
          </Text>
          <Text style={[
            styles.uploadButtonSubtext,
            { 
              color: colors.textTertiary,
              fontFamily: fonts.regular,
              fontSize: 12,
              marginTop: spacing.xs,
            }
          ]}>
            Supports .glb, .obj, .fbx • Max 50MB
          </Text>
        </TouchableOpacity>

        {/* File Requirements */}
        <View style={[
          styles.infoBox,
          { 
            backgroundColor: colors.surface + '80',
            borderColor: colors.border,
            borderRadius: radius.md,
            marginTop: spacing.md,
          }
        ]}>
          <AlertCircle size={16} color={colors.textTertiary} />
          <Text style={[
            styles.infoText,
            { 
              color: colors.textSecondary,
              fontFamily: fonts.regular,
              fontSize: 12,
              marginLeft: spacing.sm,
              flex: 1,
            }
          ]}>
            For best results: Use optimized models under 10K polygons, single UV set
          </Text>
        </View>

        {/* Uploaded Files List */}
        {uploadedFiles.length > 0 && (
          <View style={[styles.filesSection, { marginTop: spacing.lg }]}>
            <Text style={[
              styles.sectionTitle,
              { 
                color: colors.text,
                fontFamily: fonts.medium,
                fontSize: 16,
                marginBottom: spacing.sm,
              }
            ]}>
              Uploaded Files ({uploadedFiles.length})
            </Text>

            {uploadedFiles.map(file => (
              <View
                key={file.id}
                style={[
                  styles.fileItem,
                  { 
                    backgroundColor: colors.background,
                    borderColor: colors.border,
                    borderRadius: radius.md,
                  }
                ]}
              >
                <View style={styles.fileInfo}>
                  <View style={[
                    styles.fileIconContainer,
                    { backgroundColor: getFileIconColor(file.type) + '20' }
                  ]}>
                    <File size={20} color={getFileIconColor(file.type)} />
                  </View>
                  <View style={styles.fileDetails}>
                    <Text style={[
                      styles.fileName,
                      { 
                        color: colors.text,
                        fontFamily: fonts.medium,
                        fontSize: 14,
                      }
                    ]}>
                      {file.name}
                    </Text>
                    <Text style={[
                      styles.fileMeta,
                      { 
                        color: colors.textTertiary,
                        fontFamily: fonts.regular,
                        fontSize: 11,
                      }
                    ]}>
                      {file.type.toUpperCase()} • {file.size} • {file.date}
                    </Text>
                  </View>
                </View>
                <TouchableOpacity
                  onPress={() => removeFile(file.id)}
                  style={[
                    styles.removeButton,
                    { backgroundColor: colors.error + '15' }
                  ]}
                >
                  <Text style={[
                    styles.removeButtonText,
                    { 
                      color: colors.error,
                      fontFamily: fonts.medium,
                      fontSize: 12,
                    }
                  ]}>
                    Remove
                  </Text>
                </TouchableOpacity>
              </View>
            ))}
          </View>
        )}
      </Card.Content>
    </Card>
  );
};

const styles = StyleSheet.create({
  container: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  title: {
    fontSize: 18,
    fontWeight: '600',
  },
  subtitle: {
    fontSize: 14,
  },
  uploadButton: {
    alignItems: 'center',
    justifyContent: 'center',
    padding: 32,
  },
  uploadButtonText: {
    fontSize: 16,
    fontWeight: '600',
  },
  uploadButtonSubtext: {
    fontSize: 12,
  },
  infoBox: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    padding: 12,
    borderWidth: 1,
  },
  infoText: {
    fontSize: 12,
    flex: 1,
  },
  filesSection: {
    marginTop: 20,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '500',
  },
  fileItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 12,
    marginBottom: 8,
    borderWidth: 1,
  },
  fileInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  fileIconContainer: {
    width: 40,
    height: 40,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  fileDetails: {
    flex: 1,
  },
  fileName: {
    fontSize: 14,
    fontWeight: '500',
  },
  fileMeta: {
    fontSize: 11,
    marginTop: 2,
  },
  removeButton: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 6,
  },
  removeButtonText: {
    fontSize: 12,
    fontWeight: '500',
  },
});

export default UploadExistingModel;