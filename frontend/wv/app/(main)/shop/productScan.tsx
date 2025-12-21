import React, { useState } from "react";
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  Alert,
  TextInput,
  Image,
  Dimensions,
  FlatList,
  Modal,
  Switch,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { StatusBar } from "expo-status-bar";
import { useRouter } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import {
  useFonts,
  Inter_400Regular,
  Inter_500Medium,
  Inter_600SemiBold,
  Inter_700Bold,
} from "@expo-google-fonts/inter";
import * as ImagePicker from "expo-image-picker";
import * as DocumentPicker from "expo-document-picker";
import { LinearGradient } from "expo-linear-gradient";

const { width } = Dimensions.get("window");

type Product = {
  id: string;
  name: string;
  category: string;
  price: number;
  status: "draft" | "published" | "archived";
  views: number;
  scans: number;
  lastUpdated: string;
  modelType: "3d" | "ar" | "none";
  hasTexture: boolean;
};

type ScanStep = {
  id: number;
  title: string;
  description: string;
  icon: string;
  status: "pending" | "current" | "completed";
};

type UploadedFile = {
  id: string;
  name: string;
  type: "model" | "texture" | "image";
  size: string;
  status: "uploading" | "completed" | "error";
};

const categories = [
  "T-Shirts",
  "Jeans",
  "Jackets",
  "Dresses",
  "Shoes",
  "Accessories",
  "Activewear",
  "Formal",
  "Casual",
];

const modelFormats = [
  { id: "glb", name: "GLB", supported: true },
  { id: "gltf", name: "GLTF", supported: true },
  { id: "fbx", name: "FBX", supported: true },
  { id: "obj", name: "OBJ", supported: true },
  { id: "usdz", name: "USDZ", supported: false },
];

const textureTypes = [
  { id: "albedo", name: "Albedo/Color" },
  { id: "normal", name: "Normal Map" },
  { id: "roughness", name: "Roughness" },
  { id: "metallic", name: "Metallic" },
  { id: "ao", name: "Ambient Occlusion" },
];

export default function ProductCatalogScreen() {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<"scan" | "upload" | "catalog">("scan");
  const [isScanning, setIsScanning] = useState(false);
  const [scanProgress, setScanProgress] = useState(0);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [isUploading, setIsUploading] = useState(false);
  const [scanSteps, setScanSteps] = useState<ScanStep[]>([
    { id: 1, title: "Position Product", description: "Place product on flat surface", icon: "cube-outline", status: "current" },
    { id: 2, title: "Capture Angles", description: "Take photos from all sides", icon: "camera-outline", status: "pending" },
    { id: 3, title: "AI Processing", description: "Generating 3D model", icon: "color-wand-outline", status: "pending" },
    { id: 4, title: "Texture Mapping", description: "Applying surface details", icon: "brush-outline", status: "pending" },
    { id: 5, title: "Quality Check", description: "Verifying model accuracy", icon: "checkmark-circle-outline", status: "pending" },
  ]);
  
  const [uploadedFiles, setUploadedFiles] = useState<UploadedFile[]>([]);
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [selectedFormat, setSelectedFormat] = useState("glb");
  
  const [productData, setProductData] = useState({
    name: "",
    description: "",
    category: "",
    price: "",
    sku: "",
    brand: "",
    tags: [] as string[],
    sizeChart: "",
    materials: "",
    careInstructions: "",
    arPreview: true,
    tryOnEnabled: true,
  });
  
  const [tagInput, setTagInput] = useState("");
  
  const [products, setProducts] = useState<Product[]>([
    {
      id: "1",
      name: "Premium Denim Jacket",
      category: "Jackets",
      price: 89.99,
      status: "published",
      views: 1245,
      scans: 567,
      lastUpdated: "2024-01-15",
      modelType: "3d",
      hasTexture: true,
    },
    {
      id: "2",
      name: "Silk Evening Dress",
      category: "Dresses",
      price: 149.99,
      status: "published",
      views: 987,
      scans: 321,
      lastUpdated: "2024-01-14",
      modelType: "ar",
      hasTexture: true,
    },
    {
      id: "3",
      name: "Leather Running Shoes",
      category: "Shoes",
      price: 119.99,
      status: "draft",
      views: 0,
      scans: 0,
      lastUpdated: "2024-01-13",
      modelType: "3d",
      hasTexture: false,
    },
    {
      id: "4",
      name: "Wool Winter Coat",
      category: "Jackets",
      price: 199.99,
      status: "archived",
      views: 456,
      scans: 123,
      lastUpdated: "2024-01-10",
      modelType: "none",
      hasTexture: false,
    },
  ]);
  
  const [showMetadataModal, setShowMetadataModal] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  
  const [fontsLoaded] = useFonts({
    Inter_400Regular,
    Inter_500Medium,
    Inter_600SemiBold,
    Inter_700Bold,
  });

  // 1.5.3.1 Guide Product Scanning Process
  const startProductScan = () => {
    setIsScanning(true);
    setScanProgress(0);
    
    // Simulate scanning process
    const interval = setInterval(() => {
      setScanProgress(prev => {
        const newProgress = prev + 10;
        
        // Update steps as progress increases
        if (newProgress >= 20 && newProgress < 40) {
          updateScanStep(2, "current");
        } else if (newProgress >= 40 && newProgress < 60) {
          updateScanStep(3, "current");
        } else if (newProgress >= 60 && newProgress < 80) {
          updateScanStep(4, "current");
        } else if (newProgress >= 80 && newProgress < 100) {
          updateScanStep(5, "current");
        } else if (newProgress >= 100) {
          updateScanStep(5, "completed");
          setIsScanning(false);
          clearInterval(interval);
          Alert.alert(
            "Scan Complete!",
            "Product has been successfully scanned and 3D model is ready for upload.",
            [{ text: "OK" }]
          );
        }
        
        return newProgress > 100 ? 100 : newProgress;
      });
    }, 500);
  };

  const updateScanStep = (stepId: number, status: "pending" | "current" | "completed") => {
    setScanSteps(prev => prev.map(step => {
      if (step.id === stepId) return { ...step, status };
      if (status === "current" && step.status === "current") return { ...step, status: "completed" };
      return step;
    }));
  };

  // 1.5.3.2 Upload 3D models & Texture
  const pickModelFile = async () => {
    try {
      const result = await DocumentPicker.getDocumentAsync({
        type: ['*/*'],
        copyToCacheDirectory: true,
      });

      if (!result.canceled && result.assets[0]) {
        const file = result.assets[0];
        const newFile: UploadedFile = {
          id: Date.now().toString(),
          name: file.name,
          type: "model",
          size: `${(file.size / 1024 / 1024).toFixed(2)} MB`,
          status: "uploading",
        };

        setUploadedFiles(prev => [...prev, newFile]);
        setShowUploadModal(false);

        // Simulate upload process
        simulateFileUpload(newFile.id);
      }
    } catch (error) {
      Alert.alert("Error", "Failed to pick file");
    }
  };

  const pickTextureFiles = async () => {
    try {
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsMultipleSelection: true,
        quality: 0.8,
      });

      if (!result.canceled) {
        const newFiles: UploadedFile[] = result.assets.map((asset, index) => ({
          id: `${Date.now()}-${index}`,
          name: `texture_${index + 1}.jpg`,
          type: "texture",
          size: "2-5 MB",
          status: "uploading",
        }));

        setUploadedFiles(prev => [...prev, ...newFiles]);
        setShowUploadModal(false);

        // Simulate upload process for each file
        newFiles.forEach(file => simulateFileUpload(file.id));
      }
    } catch (error) {
      Alert.alert("Error", "Failed to pick texture files");
    }
  };

  const simulateFileUpload = (fileId: string) => {
    setIsUploading(true);
    setUploadProgress(0);

    const interval = setInterval(() => {
      setUploadProgress(prev => {
        const newProgress = prev + 5;
        
        if (newProgress >= 100) {
          clearInterval(interval);
          setIsUploading(false);
          
          // Update file status
          setUploadedFiles(prev => prev.map(file => 
            file.id === fileId ? { ...file, status: "completed" } : file
          ));
          
          return 100;
        }
        return newProgress;
      });
    }, 100);
  };

  // 1.5.3.3 Annotate Metadata
  const handleMetadataSubmit = () => {
    if (!productData.name.trim() || !productData.category || !productData.price) {
      Alert.alert("Missing Information", "Please fill in all required fields");
      return;
    }

    const newProduct: Product = {
      id: Date.now().toString(),
      name: productData.name,
      category: productData.category,
      price: parseFloat(productData.price),
      status: "draft",
      views: 0,
      scans: 0,
      lastUpdated: new Date().toISOString().split('T')[0],
      modelType: uploadedFiles.some(f => f.type === "model") ? "3d" : "none",
      hasTexture: uploadedFiles.some(f => f.type === "texture"),
    };

    setProducts(prev => [newProduct, ...prev]);
    
    // Reset form
    setProductData({
      name: "",
      description: "",
      category: "",
      price: "",
      sku: "",
      brand: "",
      tags: [],
      sizeChart: "",
      materials: "",
      careInstructions: "",
      arPreview: true,
      tryOnEnabled: true,
    });
    setUploadedFiles([]);

    Alert.alert("Success", "Product has been added to catalog");
  };

  const addTag = () => {
    if (tagInput.trim() && !productData.tags.includes(tagInput.trim())) {
      setProductData(prev => ({
        ...prev,
        tags: [...prev.tags, tagInput.trim()]
      }));
      setTagInput("");
    }
  };

  const removeTag = (tagToRemove: string) => {
    setProductData(prev => ({
      ...prev,
      tags: prev.tags.filter(tag => tag !== tagToRemove)
    }));
  };

  // 1.5.3.4 Manage Catalog
  const handleProductAction = (product: Product, action: "edit" | "delete" | "publish" | "archive") => {
    switch (action) {
      case "edit":
        setSelectedProduct(product);
        setShowMetadataModal(true);
        break;
      case "delete":
        Alert.alert(
          "Delete Product",
          `Are you sure you want to delete "${product.name}"?`,
          [
            { text: "Cancel", style: "cancel" },
            {
              text: "Delete",
              style: "destructive",
              onPress: () => {
                setProducts(prev => prev.filter(p => p.id !== product.id));
              }
            }
          ]
        );
        break;
      case "publish":
        setProducts(prev => prev.map(p => 
          p.id === product.id ? { ...p, status: "published" } : p
        ));
        break;
      case "archive":
        setProducts(prev => prev.map(p => 
          p.id === product.id ? { ...p, status: "archived" } : p
        ));
        break;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "published": return "#10B981";
      case "draft": return "#F59E0B";
      case "archived": return "#6B7280";
      default: return "#6B7280";
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case "published": return "Published";
      case "draft": return "Draft";
      case "archived": return "Archived";
      default: return status;
    }
  };

  const renderScanningSection = () => (
    <View style={styles.section}>
      <View style={styles.sectionHeader}>
        <Text style={styles.sectionTitle}>3D Product Scanning</Text>
        <Text style={styles.sectionSubtitle}>Capture physical products and convert to 3D models</Text>
      </View>

      <View style={styles.scanPreview}>
        <LinearGradient
          colors={["#667eea", "#764ba2"]}
          style={styles.scanPreviewGradient}
        >
          <View style={styles.scanPreviewContent}>
            {isScanning ? (
              <>
                <Ionicons name="scan-outline" size={60} color="#FFFFFF" />
                <Text style={styles.scanningText}>Scanning in Progress...</Text>
                <View style={styles.progressBar}>
                  <View 
                    style={[
                      styles.progressFill, 
                      { width: `${scanProgress}%` }
                    ]} 
                  />
                </View>
                <Text style={styles.progressText}>{scanProgress}%</Text>
              </>
            ) : (
              <>
                <Ionicons name="cube-outline" size={60} color="#FFFFFF" />
                <Text style={styles.scanPreviewTitle}>Ready to Scan</Text>
                <Text style={styles.scanPreviewDesc}>
                  Place product in well-lit area and follow instructions
                </Text>
              </>
            )}
          </View>
        </LinearGradient>
      </View>

      {/* Scan Steps */}
      <View style={styles.stepsContainer}>
        {scanSteps.map((step) => (
          <View key={step.id} style={styles.stepItem}>
            <View style={[
              styles.stepIcon,
              step.status === "completed" && styles.stepIconCompleted,
              step.status === "current" && styles.stepIconCurrent,
            ]}>
              <Ionicons 
                name={step.icon as any} 
                size={20} 
                color={
                  step.status === "completed" ? "#FFFFFF" :
                  step.status === "current" ? "#7B61FF" : "#999999"
                } 
              />
            </View>
            <View style={styles.stepInfo}>
              <Text style={styles.stepTitle}>{step.title}</Text>
              <Text style={styles.stepDesc}>{step.description}</Text>
            </View>
            {step.status === "completed" && (
              <Ionicons name="checkmark-circle" size={24} color="#10B981" />
            )}
            {step.status === "current" && (
              <View style={styles.currentPulse} />
            )}
          </View>
        ))}
      </View>

      <TouchableOpacity
        style={[styles.scanButton, isScanning && styles.scanButtonDisabled]}
        onPress={startProductScan}
        disabled={isScanning}
      >
        <LinearGradient
          colors={["#7B61FF", "#667eea"]}
          style={styles.scanButtonGradient}
        >
          {isScanning ? (
            <>
              <Ionicons name="refresh-outline" size={20} color="#FFFFFF" />
              <Text style={styles.scanButtonText}>Scanning...</Text>
            </>
          ) : (
            <>
              <Ionicons name="scan-outline" size={20} color="#FFFFFF" />
              <Text style={styles.scanButtonText}>Start Product Scan</Text>
            </>
          )}
        </LinearGradient>
      </TouchableOpacity>
    </View>
  );

  const renderUploadSection = () => (
    <View style={styles.section}>
      <View style={styles.sectionHeader}>
        <Text style={styles.sectionTitle}>Upload 3D Models & Textures</Text>
        <Text style={styles.sectionSubtitle}>Upload existing 3D models or texture files</Text>
      </View>

      {/* Supported Formats */}
      <View style={styles.formatsCard}>
        <Text style={styles.formatsTitle}>Supported Formats</Text>
        <View style={styles.formatsGrid}>
          {modelFormats.map((format) => (
            <View key={format.id} style={styles.formatItem}>
              <View style={[
                styles.formatIcon,
                format.supported ? styles.formatSupported : styles.formatUnsupported
              ]}>
                <Ionicons 
                  name={format.supported ? "checkmark-circle" : "close-circle"} 
                  size={20} 
                  color={format.supported ? "#10B981" : "#EF4444"} 
                />
              </View>
              <Text style={styles.formatName}>{format.name}</Text>
            </View>
          ))}
        </View>
      </View>

      {/* Upload Actions */}
      <View style={styles.uploadActions}>
        <TouchableOpacity 
          style={styles.uploadButton}
          onPress={pickModelFile}
        >
          <Ionicons name="cube-outline" size={24} color="#7B61FF" />
          <Text style={styles.uploadButtonText}>Upload 3D Model</Text>
          <Text style={styles.uploadButtonSubtext}>GLB, GLTF, FBX, OBJ</Text>
        </TouchableOpacity>

        <TouchableOpacity 
          style={styles.uploadButton}
          onPress={pickTextureFiles}
        >
          <Ionicons name="image-outline" size={24} color="#7B61FF" />
          <Text style={styles.uploadButtonText}>Upload Textures</Text>
          <Text style={styles.uploadButtonSubtext}>PNG, JPG, TIFF</Text>
        </TouchableOpacity>
      </View>

      {/* Upload Progress */}
      {isUploading && (
        <View style={styles.uploadProgressCard}>
          <Text style={styles.uploadProgressTitle}>Uploading Files...</Text>
          <View style={styles.progressBar}>
            <View 
              style={[
                styles.progressFill, 
                { width: `${uploadProgress}%`, backgroundColor: "#7B61FF" }
              ]} 
            />
          </View>
          <Text style={styles.uploadProgressText}>{uploadProgress}%</Text>
        </View>
      )}

      {/* Uploaded Files */}
      {uploadedFiles.length > 0 && (
        <View style={styles.uploadedFilesCard}>
          <Text style={styles.uploadedFilesTitle}>Uploaded Files ({uploadedFiles.length})</Text>
          {uploadedFiles.map((file) => (
            <View key={file.id} style={styles.fileItem}>
              <Ionicons 
                name={file.type === "model" ? "cube-outline" : "image-outline"} 
                size={24} 
                color="#666666" 
              />
              <View style={styles.fileInfo}>
                <Text style={styles.fileName}>{file.name}</Text>
                <Text style={styles.fileSize}>{file.size}</Text>
              </View>
              <View style={[
                styles.fileStatus,
                file.status === "completed" && styles.fileStatusCompleted,
                file.status === "error" && styles.fileStatusError,
              ]}>
                <Ionicons 
                  name={
                    file.status === "completed" ? "checkmark-circle" :
                    file.status === "error" ? "close-circle" : "time-outline"
                  } 
                  size={16} 
                  color="#FFFFFF" 
                />
              </View>
            </View>
          ))}
        </View>
      )}
    </View>
  );

  const renderMetadataSection = () => (
    <View style={styles.section}>
      <View style={styles.sectionHeader}>
        <Text style={styles.sectionTitle}>Product Metadata</Text>
        <Text style={styles.sectionSubtitle}>Add detailed information about your product</Text>
      </View>

      <View style={styles.metadataForm}>
        {/* Basic Information */}
        <View style={styles.formGroup}>
          <Text style={styles.formLabel}>Product Name *</Text>
          <TextInput
            style={styles.input}
            value={productData.name}
            onChangeText={(text) => setProductData(prev => ({ ...prev, name: text }))}
            placeholder="Enter product name"
            placeholderTextColor="#999999"
          />
        </View>

        <View style={styles.formGroup}>
          <Text style={styles.formLabel}>Description</Text>
          <TextInput
            style={[styles.input, styles.textArea]}
            value={productData.description}
            onChangeText={(text) => setProductData(prev => ({ ...prev, description: text }))}
            placeholder="Describe your product..."
            placeholderTextColor="#999999"
            multiline
            numberOfLines={3}
            textAlignVertical="top"
          />
        </View>

        <View style={styles.rowInputs}>
          <View style={[styles.formGroup, { flex: 1, marginRight: 12 }]}>
            <Text style={styles.formLabel}>Category *</Text>
            <View style={styles.categoryDropdown}>
              <TextInput
                style={[styles.input, { flex: 1 }]}
                value={productData.category}
                onChangeText={(text) => setProductData(prev => ({ ...prev, category: text }))}
                placeholder="Select category"
                placeholderTextColor="#999999"
              />
              <Ionicons name="chevron-down" size={20} color="#666666" />
            </View>
            <ScrollView horizontal style={styles.categoryTags}>
              {categories.map((category) => (
                <TouchableOpacity
                  key={category}
                  style={[
                    styles.categoryTag,
                    productData.category === category && styles.categoryTagSelected
                  ]}
                  onPress={() => setProductData(prev => ({ ...prev, category }))}
                >
                  <Text style={[
                    styles.categoryTagText,
                    productData.category === category && styles.categoryTagTextSelected
                  ]}>
                    {category}
                  </Text>
                </TouchableOpacity>
              ))}
            </ScrollView>
          </View>

          <View style={[styles.formGroup, { flex: 1 }]}>
            <Text style={styles.formLabel}>Price ($) *</Text>
            <TextInput
              style={styles.input}
              value={productData.price}
              onChangeText={(text) => setProductData(prev => ({ ...prev, price: text }))}
              placeholder="0.00"
              placeholderTextColor="#999999"
              keyboardType="decimal-pad"
            />
          </View>
        </View>

        {/* Additional Details */}
        <View style={styles.rowInputs}>
          <View style={[styles.formGroup, { flex: 1, marginRight: 12 }]}>
            <Text style={styles.formLabel}>SKU</Text>
            <TextInput
              style={styles.input}
              value={productData.sku}
              onChangeText={(text) => setProductData(prev => ({ ...prev, sku: text }))}
              placeholder="Product SKU"
              placeholderTextColor="#999999"
            />
          </View>

          <View style={[styles.formGroup, { flex: 1 }]}>
            <Text style={styles.formLabel}>Brand</Text>
            <TextInput
              style={styles.input}
              value={productData.brand}
              onChangeText={(text) => setProductData(prev => ({ ...prev, brand: text }))}
              placeholder="Brand name"
              placeholderTextColor="#999999"
            />
          </View>
        </View>

        {/* Tags */}
        <View style={styles.formGroup}>
          <Text style={styles.formLabel}>Tags</Text>
          <View style={styles.tagInputContainer}>
            <TextInput
              style={[styles.input, { flex: 1 }]}
              value={tagInput}
              onChangeText={setTagInput}
              placeholder="Add tags (press Enter)"
              placeholderTextColor="#999999"
              onSubmitEditing={addTag}
            />
            <TouchableOpacity style={styles.addTagButton} onPress={addTag}>
              <Ionicons name="add" size={20} color="#FFFFFF" />
            </TouchableOpacity>
          </View>
          {productData.tags.length > 0 && (
            <View style={styles.tagsContainer}>
              {productData.tags.map((tag) => (
                <View key={tag} style={styles.tagItem}>
                  <Text style={styles.tagText}>{tag}</Text>
                  <TouchableOpacity onPress={() => removeTag(tag)}>
                    <Ionicons name="close" size={16} color="#666666" />
                  </TouchableOpacity>
                </View>
              ))}
            </View>
          )}
        </View>

        {/* 3D/AR Features */}
        <View style={styles.featuresCard}>
          <Text style={styles.featuresTitle}>3D/AR Features</Text>
          <View style={styles.featureToggle}>
            <View style={styles.featureInfo}>
              <Ionicons name="cube-outline" size={20} color="#666666" />
              <View style={styles.featureTexts}>
                <Text style={styles.featureTitle}>AR Preview</Text>
                <Text style={styles.featureDesc}>Allow AR try-on in app</Text>
              </View>
            </View>
            <Switch
              value={productData.arPreview}
              onValueChange={(value) => setProductData(prev => ({ ...prev, arPreview: value }))}
              trackColor={{ false: "#E5E7EB", true: "#A78BFA" }}
              thumbColor={productData.arPreview ? "#7B61FF" : "#9CA3AF"}
            />
          </View>
          <View style={styles.featureToggle}>
            <View style={styles.featureInfo}>
              <Ionicons name="shirt-outline" size={20} color="#666666" />
              <View style={styles.featureTexts}>
                <Text style={styles.featureTitle}>Virtual Try-On</Text>
                <Text style={styles.featureDesc}>Enable on avatar</Text>
              </View>
            </View>
            <Switch
              value={productData.tryOnEnabled}
              onValueChange={(value) => setProductData(prev => ({ ...prev, tryOnEnabled: value }))}
              trackColor={{ false: "#E5E7EB", true: "#A78BFA" }}
              thumbColor={productData.tryOnEnabled ? "#7B61FF" : "#9CA3AF"}
            />
          </View>
        </View>

        <TouchableOpacity
          style={styles.submitButton}
          onPress={handleMetadataSubmit}
        >
          <LinearGradient
            colors={["#7B61FF", "#667eea"]}
            style={styles.submitButtonGradient}
          >
            <Ionicons name="save-outline" size={20} color="#FFFFFF" />
            <Text style={styles.submitButtonText}>Save to Catalog</Text>
          </LinearGradient>
        </TouchableOpacity>
      </View>
    </View>
  );

  const renderCatalogSection = () => (
    <View style={styles.section}>
      <View style={styles.sectionHeader}>
        <View>
          <Text style={styles.sectionTitle}>Product Catalog</Text>
          <Text style={styles.sectionSubtitle}>Manage your 3D product library</Text>
        </View>
        <View style={styles.catalogStats}>
          <View style={styles.statItem}>
            <Text style={styles.statValue}>{products.length}</Text>
            <Text style={styles.statLabel}>Total</Text>
          </View>
          <View style={styles.statItem}>
            <Text style={[styles.statValue, { color: "#10B981" }]}>
              {products.filter(p => p.status === "published").length}
            </Text>
            <Text style={styles.statLabel}>Published</Text>
          </View>
          <View style={styles.statItem}>
            <Text style={[styles.statValue, { color: "#F59E0B" }]}>
              {products.filter(p => p.modelType === "3d" || p.modelType === "ar").length}
            </Text>
            <Text style={styles.statLabel}>3D Models</Text>
          </View>
        </View>
      </View>

      {/* Filters */}
      <View style={styles.filterBar}>
        <TouchableOpacity style={styles.filterButton}>
          <Ionicons name="filter-outline" size={16} color="#666666" />
          <Text style={styles.filterText}>All Products</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.filterButton}>
          <Text style={styles.filterText}>Published</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.filterButton}>
          <Text style={styles.filterText}>Drafts</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.filterButton}>
          <Text style={styles.filterText}>3D Ready</Text>
        </TouchableOpacity>
      </View>

      {/* Product List */}
      <FlatList
        data={products}
        keyExtractor={(item) => item.id}
        scrollEnabled={false}
        renderItem={({ item }) => (
          <View style={styles.productCard}>
            <View style={styles.productHeader}>
              <View style={styles.productInfo}>
                <Text style={styles.productName}>{item.name}</Text>
                <View style={styles.productMeta}>
                  <Text style={styles.productCategory}>{item.category}</Text>
                  <Text style={styles.productPrice}>${item.price.toFixed(2)}</Text>
                </View>
              </View>
              <View style={[styles.statusBadge, { backgroundColor: `${getStatusColor(item.status)}20` }]}>
                <Text style={[styles.statusText, { color: getStatusColor(item.status) }]}>
                  {getStatusText(item.status)}
                </Text>
              </View>
            </View>

            <View style={styles.productStats}>
              <View style={styles.statBox}>
                <Ionicons name="eye-outline" size={16} color="#666666" />
                <Text style={styles.statBoxValue}>{item.views}</Text>
                <Text style={styles.statBoxLabel}>Views</Text>
              </View>
              <View style={styles.statBox}>
                <Ionicons name="scan-outline" size={16} color="#666666" />
                <Text style={styles.statBoxValue}>{item.scans}</Text>
                <Text style={styles.statBoxLabel}>Scans</Text>
              </View>
              <View style={styles.statBox}>
                <Ionicons 
                  name={item.modelType === "3d" ? "cube" : item.modelType === "ar" ? "qr-code" : "cube-outline"} 
                  size={16} 
                  color="#666666" 
                />
                <Text style={styles.statBoxValue}>
                  {item.modelType === "3d" ? "3D" : item.modelType === "ar" ? "AR" : "None"}
                </Text>
                <Text style={styles.statBoxLabel}>Model</Text>
              </View>
              <View style={styles.statBox}>
                <Ionicons 
                  name={item.hasTexture ? "image" : "image-outline"} 
                  size={16} 
                  color="#666666" 
                />
                <Text style={styles.statBoxValue}>{item.hasTexture ? "Yes" : "No"}</Text>
                <Text style={styles.statBoxLabel}>Textures</Text>
              </View>
            </View>

            <View style={styles.productActions}>
              <TouchableOpacity 
                style={styles.actionButton}
                onPress={() => handleProductAction(item, "edit")}
              >
                <Ionicons name="pencil-outline" size={16} color="#666666" />
                <Text style={styles.actionText}>Edit</Text>
              </TouchableOpacity>
              
              {item.status === "draft" && (
                <TouchableOpacity 
                  style={[styles.actionButton, styles.publishButton]}
                  onPress={() => handleProductAction(item, "publish")}
                >
                  <Ionicons name="cloud-upload-outline" size={16} color="#10B981" />
                  <Text style={[styles.actionText, { color: "#10B981" }]}>Publish</Text>
                </TouchableOpacity>
              )}
              
              {item.status === "published" && (
                <TouchableOpacity 
                  style={[styles.actionButton, styles.archiveButton]}
                  onPress={() => handleProductAction(item, "archive")}
                >
                  <Ionicons name="archive-outline" size={16} color="#6B7280" />
                  <Text style={[styles.actionText, { color: "#6B7280" }]}>Archive</Text>
                </TouchableOpacity>
              )}
              
              <TouchableOpacity 
                style={[styles.actionButton, styles.deleteButton]}
                onPress={() => handleProductAction(item, "delete")}
              >
                <Ionicons name="trash-outline" size={16} color="#EF4444" />
                <Text style={[styles.actionText, { color: "#EF4444" }]}>Delete</Text>
              </TouchableOpacity>
            </View>
          </View>
        )}
      />
    </View>
  );

  if (!fontsLoaded) {
    return (
      <View style={styles.loadingContainer}>
        <Ionicons name="cube" size={40} color="#000000" />
        <Text style={styles.loadingText}>Loading Catalog...</Text>
      </View>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar style="dark" />

      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => router.back()}
        >
          <Ionicons name="arrow-back" size={24} color="#1A1A1A" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Product Catalog</Text>
        <TouchableOpacity style={styles.helpButton}>
          <Ionicons name="help-circle-outline" size={24} color="#1A1A1A" />
        </TouchableOpacity>
      </View>

      {/* Tabs */}
      <View style={styles.tabBar}>
        <TouchableOpacity
          style={[styles.tab, activeTab === "scan" && styles.activeTab]}
          onPress={() => setActiveTab("scan")}
        >
          <Ionicons 
            name="scan-outline" 
            size={20} 
            color={activeTab === "scan" ? "#7B61FF" : "#666666"} 
          />
          <Text style={[
            styles.tabText,
            activeTab === "scan" && styles.activeTabText
          ]}>
            Scan
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.tab, activeTab === "upload" && styles.activeTab]}
          onPress={() => setActiveTab("upload")}
        >
          <Ionicons 
            name="cloud-upload-outline" 
            size={20} 
            color={activeTab === "upload" ? "#7B61FF" : "#666666"} 
          />
          <Text style={[
            styles.tabText,
            activeTab === "upload" && styles.activeTabText
          ]}>
            Upload
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.tab, activeTab === "catalog" && styles.activeTab]}
          onPress={() => setActiveTab("catalog")}
        >
          <Ionicons 
            name="grid-outline" 
            size={20} 
            color={activeTab === "catalog" ? "#7B61FF" : "#666666"} 
          />
          <Text style={[
            styles.tabText,
            activeTab === "catalog" && styles.activeTabText
          ]}>
            Catalog
          </Text>
        </TouchableOpacity>
      </View>

      {/* Content */}
      <ScrollView
        style={styles.scrollView}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        {activeTab === "scan" && renderScanningSection()}
        {activeTab === "upload" && renderUploadSection()}
        {activeTab === "catalog" && renderCatalogSection()}
        
        {/* Always show metadata section for completeness */}
        {activeTab !== "catalog" && renderMetadataSection()}
      </ScrollView>

      {/* Upload Modal */}
      <Modal
        visible={showUploadModal}
        transparent
        animationType="slide"
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Upload Files</Text>
              <TouchableOpacity onPress={() => setShowUploadModal(false)}>
                <Ionicons name="close" size={24} color="#666666" />
              </TouchableOpacity>
            </View>
            
            <View style={styles.modalBody}>
              <Text style={styles.modalSubtitle}>Select file format:</Text>
              <View style={styles.formatOptions}>
                {modelFormats.map((format) => (
                  <TouchableOpacity
                    key={format.id}
                    style={[
                      styles.formatOption,
                      selectedFormat === format.id && styles.formatOptionSelected
                    ]}
                    onPress={() => setSelectedFormat(format.id)}
                    disabled={!format.supported}
                  >
                    <Text style={[
                      styles.formatOptionText,
                      selectedFormat === format.id && styles.formatOptionTextSelected,
                      !format.supported && styles.formatOptionDisabled
                    ]}>
                      {format.name}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
              
              <TouchableOpacity style={styles.uploadModalButton} onPress={pickModelFile}>
                <Ionicons name="folder-open-outline" size={20} color="#FFFFFF" />
                <Text style={styles.uploadModalButtonText}>Select Files</Text>
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
    backgroundColor: "#FFFFFF",
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#FFFFFF",
  },
  loadingText: {
    marginTop: 12,
    fontSize: 16,
    color: "#666666",
    fontFamily: "Inter_500Medium",
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 24,
    paddingTop: 16,
    paddingBottom: 20,
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "#F8F9FA",
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#E0E0E0",
  },
  headerTitle: {
    fontSize: 20,
    fontFamily: "Inter_700Bold",
    color: "#1A1A1A",
  },
  helpButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "#F8F9FA",
    justifyContent: "center",
    alignItems: "center",
  },
  tabBar: {
    flexDirection: "row",
    paddingHorizontal: 24,
    paddingBottom: 12,
    borderBottomWidth: 1,
    borderBottomColor: "#F0F0F0",
  },
  tab: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 12,
    gap: 8,
  },
  activeTab: {
    borderBottomWidth: 2,
    borderBottomColor: "#7B61FF",
  },
  tabText: {
    fontSize: 14,
    fontFamily: "Inter_600SemiBold",
    color: "#666666",
  },
  activeTabText: {
    color: "#7B61FF",
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: 40,
  },
  section: {
    paddingHorizontal: 24,
    marginTop: 24,
  },
  sectionHeader: {
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: 22,
    fontFamily: "Inter_700Bold",
    color: "#1A1A1A",
    marginBottom: 4,
  },
  sectionSubtitle: {
    fontSize: 14,
    fontFamily: "Inter_400Regular",
    color: "#666666",
  },
  scanPreview: {
    borderRadius: 20,
    overflow: "hidden",
    marginBottom: 24,
    elevation: 4,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
  },
  scanPreviewGradient: {
    padding: 30,
  },
  scanPreviewContent: {
    alignItems: "center",
  },
  scanningText: {
    fontSize: 16,
    fontFamily: "Inter_600SemiBold",
    color: "#FFFFFF",
    marginTop: 16,
    marginBottom: 20,
  },
  scanPreviewTitle: {
    fontSize: 20,
    fontFamily: "Inter_700Bold",
    color: "#FFFFFF",
    marginTop: 16,
    marginBottom: 8,
  },
  scanPreviewDesc: {
    fontSize: 14,
    fontFamily: "Inter_400Regular",
    color: "rgba(255, 255, 255, 0.9)",
    textAlign: "center",
  },
  progressBar: {
    width: "100%",
    height: 8,
    backgroundColor: "rgba(255, 255, 255, 0.2)",
    borderRadius: 4,
    overflow: "hidden",
  },
  progressFill: {
    height: "100%",
    backgroundColor: "#FFFFFF",
    borderRadius: 4,
  },
  progressText: {
    fontSize: 14,
    fontFamily: "Inter_600SemiBold",
    color: "#FFFFFF",
    marginTop: 8,
  },
  stepsContainer: {
    marginBottom: 24,
  },
  stepItem: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 16,
    position: "relative",
  },
  stepIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "#F8F9FA",
    justifyContent: "center",
    alignItems: "center",
    marginRight: 12,
  },
  stepIconCompleted: {
    backgroundColor: "#10B981",
  },
  stepIconCurrent: {
    backgroundColor: "#F5F5FF",
    borderWidth: 2,
    borderColor: "#7B61FF",
  },
  stepInfo: {
    flex: 1,
  },
  stepTitle: {
    fontSize: 16,
    fontFamily: "Inter_600SemiBold",
    color: "#1A1A1A",
    marginBottom: 2,
  },
  stepDesc: {
    fontSize: 13,
    fontFamily: "Inter_400Regular",
    color: "#666666",
  },
  currentPulse: {
    position: "absolute",
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: "#7B61FF",
    opacity: 0.2,
    left: -2,
  },
  scanButton: {
    borderRadius: 16,
    overflow: "hidden",
  },
  scanButtonDisabled: {
    opacity: 0.7,
  },
  scanButtonGradient: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 18,
    paddingHorizontal: 24,
    gap: 12,
  },
  scanButtonText: {
    fontSize: 16,
    fontFamily: "Inter_600SemiBold",
    color: "#FFFFFF",
  },
  formatsCard: {
    backgroundColor: "#F8F9FA",
    borderRadius: 16,
    padding: 20,
    marginBottom: 20,
  },
  formatsTitle: {
    fontSize: 16,
    fontFamily: "Inter_600SemiBold",
    color: "#1A1A1A",
    marginBottom: 16,
  },
  formatsGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 12,
  },
  formatItem: {
    alignItems: "center",
    width: (width - 96) / 3,
  },
  formatIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: "#FFFFFF",
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 8,
    borderWidth: 1,
    borderColor: "#E0E0E0",
  },
  formatSupported: {
    borderColor: "#10B981",
  },
  formatUnsupported: {
    borderColor: "#EF4444",
  },
  formatName: {
    fontSize: 12,
    fontFamily: "Inter_500Medium",
    color: "#666666",
    textAlign: "center",
  },
  uploadActions: {
    flexDirection: "row",
    gap: 12,
    marginBottom: 20,
  },
  uploadButton: {
    flex: 1,
    backgroundColor: "#F8F9FA",
    borderWidth: 2,
    borderColor: "#E0E0E0",
    borderStyle: "dashed",
    borderRadius: 16,
    padding: 24,
    alignItems: "center",
  },
  uploadButtonText: {
    fontSize: 16,
    fontFamily: "Inter_600SemiBold",
    color: "#1A1A1A",
    marginTop: 12,
    marginBottom: 4,
  },
  uploadButtonSubtext: {
    fontSize: 12,
    fontFamily: "Inter_400Regular",
    color: "#666666",
  },
  uploadProgressCard: {
    backgroundColor: "#F8F9FA",
    borderRadius: 16,
    padding: 20,
    marginBottom: 20,
  },
  uploadProgressTitle: {
    fontSize: 16,
    fontFamily: "Inter_600SemiBold",
    color: "#1A1A1A",
    marginBottom: 12,
  },
  uploadProgressText: {
    fontSize: 14,
    fontFamily: "Inter_500Medium",
    color: "#7B61FF",
    marginTop: 8,
    textAlign: "center",
  },
  uploadedFilesCard: {
    backgroundColor: "#F8F9FA",
    borderRadius: 16,
    padding: 20,
  },
  uploadedFilesTitle: {
    fontSize: 16,
    fontFamily: "Inter_600SemiBold",
    color: "#1A1A1A",
    marginBottom: 16,
  },
  fileItem: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: "#E0E0E0",
  },
  fileInfo: {
    flex: 1,
    marginLeft: 12,
  },
  fileName: {
    fontSize: 14,
    fontFamily: "Inter_500Medium",
    color: "#1A1A1A",
    marginBottom: 2,
  },
  fileSize: {
    fontSize: 12,
    fontFamily: "Inter_400Regular",
    color: "#666666",
  },
  fileStatus: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: "#F59E0B",
    justifyContent: "center",
    alignItems: "center",
  },
  fileStatusCompleted: {
    backgroundColor: "#10B981",
  },
  fileStatusError: {
    backgroundColor: "#EF4444",
  },
  metadataForm: {
    marginTop: 8,
  },
  formGroup: {
    marginBottom: 20,
  },
  formLabel: {
    fontSize: 14,
    fontFamily: "Inter_600SemiBold",
    color: "#1A1A1A",
    marginBottom: 8,
  },
  input: {
    backgroundColor: "#F8F9FA",
    borderWidth: 1,
    borderColor: "#E0E0E0",
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 14,
    fontSize: 16,
    fontFamily: "Inter_400Regular",
    color: "#1A1A1A",
  },
  textArea: {
    minHeight: 100,
    textAlignVertical: "top",
  },
  rowInputs: {
    flexDirection: "row",
  },
  categoryDropdown: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#F8F9FA",
    borderWidth: 1,
    borderColor: "#E0E0E0",
    borderRadius: 12,
    paddingHorizontal: 16,
  },
  categoryTags: {
    flexDirection: "row",
    marginTop: 8,
  },
  categoryTag: {
    backgroundColor: "#F8F9FA",
    borderWidth: 1,
    borderColor: "#E0E0E0",
    borderRadius: 20,
    paddingHorizontal: 12,
    paddingVertical: 6,
    marginRight: 8,
  },
  categoryTagSelected: {
    backgroundColor: "#7B61FF",
    borderColor: "#7B61FF",
  },
  categoryTagText: {
    fontSize: 12,
    fontFamily: "Inter_500Medium",
    color: "#666666",
  },
  categoryTagTextSelected: {
    color: "#FFFFFF",
  },
  tagInputContainer: {
    flexDirection: "row",
    alignItems: "center",
  },
  addTagButton: {
    width: 40,
    height: 40,
    borderRadius: 12,
    backgroundColor: "#7B61FF",
    justifyContent: "center",
    alignItems: "center",
    marginLeft: 8,
  },
  tagsContainer: {
    flexDirection: "row",
    flexWrap: "wrap",
    marginTop: 8,
    gap: 8,
  },
  tagItem: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#F5F5FF",
    borderRadius: 16,
    paddingHorizontal: 12,
    paddingVertical: 6,
    gap: 6,
  },
  tagText: {
    fontSize: 12,
    fontFamily: "Inter_500Medium",
    color: "#7B61FF",
  },
  featuresCard: {
    backgroundColor: "#F8F9FA",
    borderRadius: 16,
    padding: 20,
    marginBottom: 24,
  },
  featuresTitle: {
    fontSize: 16,
    fontFamily: "Inter_600SemiBold",
    color: "#1A1A1A",
    marginBottom: 16,
  },
  featureToggle: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 16,
  },
  featureInfo: {
    flexDirection: "row",
    alignItems: "center",
    flex: 1,
  },
  featureTexts: {
    marginLeft: 12,
  },
  featureTitle: {
    fontSize: 14,
    fontFamily: "Inter_600SemiBold",
    color: "#1A1A1A",
    marginBottom: 2,
  },
  featureDesc: {
    fontSize: 12,
    fontFamily: "Inter_400Regular",
    color: "#666666",
  },
  submitButton: {
    borderRadius: 16,
    overflow: "hidden",
  },
  submitButtonGradient: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 18,
    paddingHorizontal: 24,
    gap: 12,
  },
  submitButtonText: {
    fontSize: 16,
    fontFamily: "Inter_600SemiBold",
    color: "#FFFFFF",
  },
  catalogStats: {
    flexDirection: "row",
    gap: 20,
    marginTop: 16,
  },
  statItem: {
    alignItems: "center",
  },
  statValue: {
    fontSize: 20,
    fontFamily: "Inter_700Bold",
    color: "#1A1A1A",
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 12,
    fontFamily: "Inter_400Regular",
    color: "#666666",
  },
  filterBar: {
    flexDirection: "row",
    gap: 8,
    marginBottom: 20,
  },
  filterButton: {
    backgroundColor: "#F8F9FA",
    borderRadius: 20,
    paddingHorizontal: 16,
    paddingVertical: 8,
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },
  filterText: {
    fontSize: 12,
    fontFamily: "Inter_500Medium",
    color: "#666666",
  },
  productCard: {
    backgroundColor: "#F8F9FA",
    borderRadius: 16,
    padding: 20,
    marginBottom: 16,
  },
  productHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginBottom: 16,
  },
  productInfo: {
    flex: 1,
  },
  productName: {
    fontSize: 18,
    fontFamily: "Inter_700Bold",
    color: "#1A1A1A",
    marginBottom: 8,
  },
  productMeta: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  productCategory: {
    fontSize: 14,
    fontFamily: "Inter_500Medium",
    color: "#666666",
  },
  productPrice: {
    fontSize: 16,
    fontFamily: "Inter_600SemiBold",
    color: "#7B61FF",
  },
  statusBadge: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
  },
  statusText: {
    fontSize: 12,
    fontFamily: "Inter_600SemiBold",
  },
  productStats: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 16,
    paddingVertical: 16,
    borderTopWidth: 1,
    borderBottomWidth: 1,
    borderColor: "#E0E0E0",
  },
  statBox: {
    alignItems: "center",
  },
  statBoxValue: {
    fontSize: 16,
    fontFamily: "Inter_700Bold",
    color: "#1A1A1A",
    marginTop: 4,
    marginBottom: 2,
  },
  statBoxLabel: {
    fontSize: 11,
    fontFamily: "Inter_400Regular",
    color: "#666666",
  },
  productActions: {
    flexDirection: "row",
    justifyContent: "flex-end",
    gap: 12,
  },
  actionButton: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#FFFFFF",
    borderWidth: 1,
    borderColor: "#E0E0E0",
    borderRadius: 12,
    paddingHorizontal: 12,
    paddingVertical: 8,
    gap: 6,
  },
  publishButton: {
    borderColor: "#10B981",
  },
  archiveButton: {
    borderColor: "#6B7280",
  },
  deleteButton: {
    borderColor: "#EF4444",
  },
  actionText: {
    fontSize: 12,
    fontFamily: "Inter_500Medium",
    color: "#666666",
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    justifyContent: "flex-end",
  },
  modalContent: {
    backgroundColor: "#FFFFFF",
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    paddingTop: 24,
  },
  modalHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 24,
    paddingBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: "#F0F0F0",
  },
  modalTitle: {
    fontSize: 20,
    fontFamily: "Inter_700Bold",
    color: "#1A1A1A",
  },
  modalBody: {
    padding: 24,
  },
  modalSubtitle: {
    fontSize: 16,
    fontFamily: "Inter_600SemiBold",
    color: "#1A1A1A",
    marginBottom: 16,
  },
  formatOptions: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
    marginBottom: 24,
  },
  formatOption: {
    backgroundColor: "#F8F9FA",
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  formatOptionSelected: {
    backgroundColor: "#7B61FF",
  },
  formatOptionText: {
    fontSize: 14,
    fontFamily: "Inter_500Medium",
    color: "#666666",
  },
  formatOptionTextSelected: {
    color: "#FFFFFF",
  },
  formatOptionDisabled: {
    color: "#999999",
    opacity: 0.5,
  },
  uploadModalButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#7B61FF",
    borderRadius: 12,
    paddingVertical: 16,
    gap: 12,
  },
  uploadModalButtonText: {
    fontSize: 16,
    fontFamily: "Inter_600SemiBold",
    color: "#FFFFFF",
  },
});