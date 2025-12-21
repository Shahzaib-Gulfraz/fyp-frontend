import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  Dimensions,
  Alert,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { StatusBar } from "expo-status-bar";
import {
  Scan,
  Save,
  Sliders,
  RotateCw,
  Camera,
  User,
  Ruler,
  Scale,
  Zap,
  ChevronRight,
  Maximize2,
  Minimize2,
  Check,
  RefreshCw,
} from "lucide-react-native";
import { useState } from "react";
import { LinearGradient } from "expo-linear-gradient";
import Animated, {
  FadeIn,
  SlideInRight,
  SlideInDown,
} from "react-native-reanimated";
import { useTheme } from "../../../src/context/ThemeContext";

const { width } = Dimensions.get("window");

export default function AvatarScreen() {
  const { theme, isDark } = useTheme();
  const [hasAvatar, setHasAvatar] = useState(false);
  const [isScanning, setIsScanning] = useState(false);
  const [selectedPose, setSelectedPose] = useState("standing");
  const [is3DView, setIs3DView] = useState(true);
  const [measurements, setMeasurements] = useState({
    height: 175,
    chest: 95,
    waist: 80,
    hips: 100,
    shoulder: 45,
    inseam: 82,
  });
  const [avatarQuality, setAvatarQuality] = useState("premium"); // basic, standard, premium

  const handleScanBody = () => {
    Alert.alert(
      "3D Body Scan",
      "Stand 2 meters away from camera in well-lit area. Wear fitted clothing for best results.",
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Start Scan",
          onPress: () => {
            setIsScanning(true);
            setTimeout(() => {
              setIsScanning(false);
              setHasAvatar(true);
              Alert.alert("Scan Complete", "Your 3D avatar has been created!");
            }, 3000);
          },
        },
      ]
    );
  };

  const handleSaveAvatar = () => {
    Alert.alert("Success", "Your avatar has been saved to your profile!");
  };

  const handleReset = () => {
    Alert.alert(
      "Reset Avatar",
      "Are you sure you want to reset all measurements?",
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Reset",
          style: "destructive",
          onPress: () => {
            setMeasurements({
              height: 175,
              chest: 95,
              waist: 80,
              hips: 100,
              shoulder: 45,
              inseam: 82,
            });
          },
        },
      ]
    );
  };

  const updateMeasurement = (key: string, value: number) => {
    setMeasurements(prev => ({
      ...prev,
      [key]: Math.max(0, value),
    }));
  };

  const poses = [
    { id: "standing", name: "Standing", emoji: "🧍", icon: "🟢" },
    { id: "walking", name: "Walking", emoji: "🚶", icon: "🟡" },
    { id: "posing", name: "Pose", emoji: "💃", icon: "🔵" },
    { id: "running", name: "Running", emoji: "🏃", icon: "🟣" },
  ];

  const qualityOptions = [
    { id: "basic", name: "Basic", desc: "Fast rendering", color: "#4DCCFF" },
    { id: "standard", name: "Standard", desc: "Good quality", color: "#7B61FF" },
    { id: "premium", name: "Premium", desc: "Photorealistic", color: "#FF6B8B" },
  ];

  const measurementSliders = [
    { key: "height", label: "Height", unit: "cm", min: 140, max: 220, icon: <Ruler size={20} color="#4DCCFF" /> },
    { key: "chest", label: "Chest", unit: "cm", min: 60, max: 140, icon: <Scale size={20} color="#FF6B8B" /> },
    { key: "waist", label: "Waist", unit: "cm", min: 50, max: 120, icon: <Sliders size={20} color="#FFB84D" /> },
    { key: "hips", label: "Hips", unit: "cm", min: 60, max: 140, icon: <User size={20} color="#6BFFB8" /> },
    { key: "shoulder", label: "Shoulder", unit: "cm", min: 30, max: 60, icon: <Maximize2 size={20} color="#7B61FF" /> },
    { key: "inseam", label: "Inseam", unit: "cm", min: 60, max: 100, icon: <Minimize2 size={20} color="#FF8A7A" /> },
  ];

  if (!hasAvatar) {
    return (
      <SafeAreaView style={[styles.container, { backgroundColor: theme.colors.background }]}>
        <StatusBar style={isDark ? "light" : "dark"} />

        <LinearGradient
          colors={[theme.colors.background, theme.colors.surface]}
          style={styles.container}
        >
          {/* Header */}
          <View style={[styles.header, { backgroundColor: theme.colors.background, borderBottomColor: theme.colors.border }]}>
            <Text style={[styles.headerTitle, { color: theme.colors.text }]}>Create Your Avatar</Text>
            <Text style={styles.headerSubtitle}>Your digital twin for virtual try-ons</Text>
          </View>

          {/* Main Content */}
          <ScrollView
            contentContainerStyle={styles.emptyContent}
            showsVerticalScrollIndicator={false}
          >
            <Animated.View
              entering={FadeIn.duration(800)}
              style={styles.avatarPlaceholder}
            >
              <View style={styles.avatarGlow} />
              <LinearGradient
                colors={["#667eea", "#764ba2"]}
                style={styles.avatarGradient}
              >
                <User size={80} color="#FFFFFF" />
              </LinearGradient>
            </Animated.View>

            <Animated.View
              entering={SlideInDown.duration(600).delay(200)}
              style={[styles.instructionCard, { backgroundColor: theme.colors.card }]}
            >
              <Text style={[styles.instructionTitle, { color: theme.colors.text }]}>Step-by-Step Guide</Text>

              <View style={styles.stepsContainer}>
                {[
                  { step: "1", title: "Stand in Good Light", desc: "Face camera in a well-lit room" },
                  { step: "2", title: "Wear Fitted Clothes", desc: "Tight clothing for accurate scans" },
                  { step: "3", title: "Follow Instructions", desc: "Move as guided by the app" },
                  { step: "4", title: "Wait for Processing", desc: "AI creates your 3D model" },
                ].map((step, index) => (
                  <View key={index} style={styles.stepItem}>
                    <View style={styles.stepNumber}>
                      <Text style={styles.stepNumberText}>{step.step}</Text>
                    </View>
                    <View style={styles.stepInfo}>
                      <Text style={styles.stepTitle}>{step.title}</Text>
                      <Text style={styles.stepDesc}>{step.desc}</Text>
                    </View>
                    {index < 3 && <ChevronRight size={16} color="#CCCCCC" />}
                  </View>
                ))}
              </View>
            </Animated.View>

            <Animated.View
              entering={SlideInRight.duration(600).delay(400)}
              style={[styles.scanCard, { backgroundColor: theme.colors.card }]}
            >
              <View style={styles.scanIconContainer}>
                <Scan size={32} color={theme.colors.primary} />
                {isScanning && (
                  <View style={styles.scanningDot}>
                    <View style={styles.pulseAnimation} />
                  </View>
                )}
              </View>

              <View style={styles.scanInfo}>
                <Text style={styles.scanTitle}>
                  {isScanning ? "Scanning in Progress..." : "Ready to Scan"}
                </Text>
                <Text style={styles.scanDesc}>
                  {isScanning
                    ? "Please stand still while we capture your body measurements"
                    : "Create a millimeter-accurate 3D avatar using AR technology"
                  }
                </Text>
              </View>

              <TouchableOpacity
                onPress={handleScanBody}
                style={[styles.scanButton, isScanning && styles.scanningButton]}
                disabled={isScanning}
              >
                {isScanning ? (
                  <>
                    <RefreshCw size={20} color="#FFFFFF" />
                    <Text style={styles.scanButtonText}>Scanning...</Text>
                  </>
                ) : (
                  <>
                    <Camera size={20} color="#FFFFFF" />
                    <Text style={styles.scanButtonText}>Start 3D Scan</Text>
                  </>
                )}
              </TouchableOpacity>
            </Animated.View>

            {/* Quick Create Option */}
            <Animated.View
              entering={SlideInDown.duration(600).delay(600)}
              style={[styles.quickCreateCard, { backgroundColor: theme.colors.card }]}
            >
              <Text style={[styles.quickCreateTitle, { color: theme.colors.text }]}>Quick Create</Text>
              <Text style={[styles.quickCreateDesc, { color: theme.colors.textSecondary }]}>
                Create avatar manually without scanning
              </Text>
              <TouchableOpacity
                style={styles.quickCreateButton}
                onPress={() => setHasAvatar(true)}
              >
                <Sliders size={20} color="#7B61FF" />
                <Text style={styles.quickCreateButtonText}>Manual Setup</Text>
              </TouchableOpacity>
            </Animated.View>
          </ScrollView>
        </LinearGradient>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.colors.background }]}>
      <StatusBar style={isDark ? "light" : "dark"} />

      <LinearGradient
        colors={[theme.colors.background, theme.colors.surface]}
        style={styles.container}
      >
        {/* Header */}
        <View style={[styles.header, { backgroundColor: theme.colors.background, borderBottomColor: theme.colors.border }]}>
          <View>
            <Text style={[styles.headerTitle, { color: theme.colors.text }]}>My Avatar</Text>
            <Text style={[styles.headerSubtitle, { color: theme.colors.textSecondary }]}>Edit and customize your 3D model</Text>
          </View>
          <View style={styles.headerActions}>
            <TouchableOpacity style={[styles.headerButton, { backgroundColor: theme.colors.surface }]} onPress={handleReset}>
              <RotateCw size={20} color={theme.colors.textSecondary} />
            </TouchableOpacity>
            <TouchableOpacity style={[styles.headerButton, { backgroundColor: theme.colors.surface }]} onPress={handleSaveAvatar}>
              <Save size={20} color={theme.colors.primary} />
            </TouchableOpacity>
          </View>
        </View>

        <ScrollView
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.content}
        >
          {/* 3D Avatar Preview */}
          <Animated.View
            entering={FadeIn.duration(600)}
            style={styles.avatarPreviewContainer}
          >
            <View style={styles.previewHeader}>
              <Text style={[styles.previewTitle, { color: theme.colors.text }]}>3D Preview</Text>
              <TouchableOpacity
                style={[styles.viewToggle, { backgroundColor: theme.colors.surface }]}
                onPress={() => setIs3DView(!is3DView)}
              >
                <Text style={[styles.viewToggleText, { color: theme.colors.primary }]}>
                  {is3DView ? "3D View" : "AR View"}
                </Text>
                <Zap size={16} color={theme.colors.primary} />
              </TouchableOpacity>
            </View>

            <LinearGradient
              colors={["#667eea", "#764ba2"]}
              style={styles.avatarPreview}
            >
              <View style={styles.avatarModel}>
                <View style={styles.avatarModelInner}>
                  <User size={80} color="#FFFFFF" />
                </View>

                {/* Measurement Indicators */}
                <View style={[styles.measurementIndicator, styles.heightIndicator]}>
                  <View style={styles.indicatorLine} />
                  <Text style={styles.indicatorText}>{measurements.height}cm</Text>
                </View>

                <View style={[styles.measurementIndicator, styles.chestIndicator]}>
                  <View style={styles.indicatorLine} />
                  <Text style={styles.indicatorText}>{measurements.chest}cm</Text>
                </View>

                <View style={[styles.measurementIndicator, styles.waistIndicator]}>
                  <View style={styles.indicatorLine} />
                  <Text style={styles.indicatorText}>{measurements.waist}cm</Text>
                </View>
              </View>

              <View style={styles.previewStats}>
                <View style={styles.statItem}>
                  <Text style={styles.statLabel}>Accuracy</Text>
                  <Text style={styles.statValue}>98%</Text>
                </View>
                <View style={styles.statItem}>
                  <Text style={styles.statLabel}>Quality</Text>
                  <Text style={styles.statValue}>{avatarQuality}</Text>
                </View>
                <View style={styles.statItem}>
                  <Text style={styles.statLabel}>Last Updated</Text>
                  <Text style={styles.statValue}>Today</Text>
                </View>
              </View>
            </LinearGradient>
          </Animated.View>

          {/* Pose Selection */}
          <Animated.View
            entering={SlideInRight.duration(600).delay(200)}
            style={styles.section}
          >
            <Text style={[styles.sectionTitle, { color: theme.colors.text }]}>Select Pose</Text>
            <Text style={[styles.sectionSubtitle, { color: theme.colors.textSecondary }]}>Test how clothes fit in different positions</Text>

            <View style={styles.posesGrid}>
              {poses.map((pose) => (
                <TouchableOpacity
                  key={pose.id}
                  style={[
                    styles.poseCard,
                    { backgroundColor: theme.colors.card },
                    selectedPose === pose.id && [styles.selectedPoseCard, { backgroundColor: theme.colors.surface, borderColor: theme.colors.primary }],
                  ]}
                  onPress={() => setSelectedPose(pose.id)}
                >
                  <Text style={styles.poseEmoji}>{pose.emoji}</Text>
                  <Text style={[styles.poseName, { color: theme.colors.text }]}>{pose.name}</Text>
                  {selectedPose === pose.id && (
                    <View style={[styles.selectedBadge, { backgroundColor: theme.colors.primary }]}>
                      <Check size={12} color="#FFFFFF" />
                    </View>
                  )}
                </TouchableOpacity>
              ))}
            </View>
          </Animated.View>

          {/* Quality Settings */}
          <Animated.View
            entering={SlideInDown.duration(600).delay(300)}
            style={styles.section}
          >
            <Text style={[styles.sectionTitle, { color: theme.colors.text }]}>Avatar Quality</Text>
            <Text style={[styles.sectionSubtitle, { color: theme.colors.textSecondary }]}>Higher quality = better visuals, slower rendering</Text>

            <View style={styles.qualityGrid}>
              {qualityOptions.map((option) => (
                <TouchableOpacity
                  key={option.id}
                  style={[
                    styles.qualityCard,
                    { backgroundColor: theme.colors.card },
                    avatarQuality === option.id && { borderColor: option.color },
                  ]}
                  onPress={() => setAvatarQuality(option.id)}
                >
                  <View style={[styles.qualityIcon, { backgroundColor: `${option.color}20` }]}>
                    <View style={[styles.qualityDot, { backgroundColor: option.color }]} />
                  </View>
                  <Text style={[styles.qualityName, { color: theme.colors.text }]}>{option.name}</Text>
                  <Text style={[styles.qualityDesc, { color: theme.colors.textSecondary }]}>{option.desc}</Text>
                  {avatarQuality === option.id && (
                    <View style={[styles.qualitySelected, { backgroundColor: option.color }]}>
                      <Check size={12} color="#FFFFFF" />
                    </View>
                  )}
                </TouchableOpacity>
              ))}
            </View>
          </Animated.View>

          {/* Body Measurements */}
          <Animated.View
            entering={SlideInRight.duration(600).delay(400)}
            style={styles.section}
          >
            <View style={styles.measurementsHeader}>
              <View>
                <Text style={[styles.sectionTitle, { color: theme.colors.text }]}>Body Measurements</Text>
                <Text style={[styles.sectionSubtitle, { color: theme.colors.textSecondary }]}>Adjust for perfect fit</Text>
              </View>
              <TouchableOpacity style={[styles.autoButton, { backgroundColor: theme.colors.surface }]} onPress={() => setHasAvatar(false)}>
                <Scan size={16} color={theme.colors.primary} />
                <Text style={[styles.autoButtonText, { color: theme.colors.primary }]}>Rescan</Text>
              </TouchableOpacity>
            </View>

            <View style={[styles.measurementsGrid, { backgroundColor: theme.colors.card }]}>
              {measurementSliders.map((slider) => (
                <View key={slider.key} style={styles.measurementCard}>
                  <View style={styles.measurementHeader}>
                    <View style={[styles.measurementIcon, { backgroundColor: theme.colors.surface }]}>
                      {slider.icon}
                    </View>
                    <Text style={[styles.measurementLabel, { color: theme.colors.text }]}>{slider.label}</Text>
                    <Text style={[styles.measurementValue, { color: theme.colors.primary }]}>
                      {measurements[slider.key as keyof typeof measurements]}{slider.unit}
                    </Text>
                  </View>

                  <View style={styles.sliderContainer}>
                    <Text style={[styles.sliderMin, { color: theme.colors.textTertiary }]}>{slider.min}{slider.unit}</Text>
                    <View style={[styles.sliderTrack, { backgroundColor: theme.colors.border }]}>
                      <View
                        style={[
                          styles.sliderProgress,
                          {
                            width: `${((measurements[slider.key as keyof typeof measurements] - slider.min) / (slider.max - slider.min)) * 100}%`,
                            backgroundColor: theme.colors.primary
                          }
                        ]}
                      />
                    </View>
                    <Text style={[styles.sliderMax, { color: theme.colors.textTertiary }]}>{slider.max}{slider.unit}</Text>
                  </View>

                  <View style={styles.sliderButtons}>
                    <TouchableOpacity
                      style={[styles.sliderButton, { backgroundColor: theme.colors.surface }]}
                      onPress={() => updateMeasurement(slider.key, measurements[slider.key as keyof typeof measurements] - 1)}
                    >
                      <Text style={[styles.sliderButtonText, { color: theme.colors.text }]}>-</Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                      style={[styles.sliderButton, { backgroundColor: theme.colors.surface }]}
                      onPress={() => updateMeasurement(slider.key, measurements[slider.key as keyof typeof measurements] + 1)}
                    >
                      <Text style={[styles.sliderButtonText, { color: theme.colors.text }]}>+</Text>
                    </TouchableOpacity>
                  </View>
                </View>
              ))}
            </View>
          </Animated.View>

          {/* Advanced Settings */}
          <Animated.View
            entering={SlideInDown.duration(600).delay(500)}
            style={styles.advancedSection}
          >
            <TouchableOpacity style={[styles.advancedButton, { backgroundColor: theme.colors.card }]}>
              <Sliders size={20} color={theme.colors.primary} />
              <Text style={[styles.advancedButtonText, { color: theme.colors.text }]}>Advanced Settings</Text>
              <ChevronRight size={20} color={theme.colors.text} />
            </TouchableOpacity>
          </Animated.View>
        </ScrollView>
      </LinearGradient>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 20,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    backgroundColor: "#FFFFFF",
    borderBottomWidth: 1,
    borderBottomColor: "#F0F0F0",
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: "700",
    color: "#1A1A1A",
    fontFamily: "Inter_700Bold",
  },
  headerSubtitle: {
    fontSize: 14,
    color: "#666666",
    marginTop: 4,
    fontFamily: "Inter_400Regular",
  },
  headerActions: {
    flexDirection: "row",
    gap: 12,
  },
  headerButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: "#F5F5F5",
    justifyContent: "center",
    alignItems: "center",
  },
  emptyContent: {
    flexGrow: 1,
    paddingHorizontal: 20,
    paddingBottom: 40,
  },
  avatarPlaceholder: {
    alignItems: "center",
    marginTop: 40,
    marginBottom: 40,
  },
  avatarGlow: {
    position: "absolute",
    width: 200,
    height: 200,
    borderRadius: 100,
    backgroundColor: "#7B61FF",
    opacity: 0.1,
  },
  avatarGradient: {
    width: 150,
    height: 150,
    borderRadius: 75,
    justifyContent: "center",
    alignItems: "center",
  },
  instructionCard: {
    backgroundColor: "#FFFFFF",
    borderRadius: 20,
    padding: 24,
    marginBottom: 20,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  instructionTitle: {
    fontSize: 20,
    fontWeight: "700",
    color: "#1A1A1A",
    marginBottom: 20,
    fontFamily: "Inter_700Bold",
  },
  stepsContainer: {
    gap: 16,
  },
  stepItem: {
    flexDirection: "row",
    alignItems: "center",
  },
  stepNumber: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: "#F5F5FF",
    justifyContent: "center",
    alignItems: "center",
    marginRight: 16,
  },
  stepNumberText: {
    fontSize: 14,
    fontWeight: "700",
    color: "#7B61FF",
  },
  stepInfo: {
    flex: 1,
  },
  stepTitle: {
    fontSize: 16,
    fontWeight: "600",
    color: "#1A1A1A",
    marginBottom: 2,
  },
  stepDesc: {
    fontSize: 14,
    color: "#666666",
  },
  scanCard: {
    backgroundColor: "#FFFFFF",
    borderRadius: 20,
    padding: 24,
    marginBottom: 20,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  scanIconContainer: {
    alignItems: "center",
    marginBottom: 16,
  },
  scanningDot: {
    position: "absolute",
    top: -5,
    right: -5,
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: "#7B61FF",
    justifyContent: "center",
    alignItems: "center",
  },
  pulseAnimation: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: "#7B61FF",
    opacity: 0.5,
  },
  scanInfo: {
    alignItems: "center",
    marginBottom: 24,
  },
  scanTitle: {
    fontSize: 22,
    fontWeight: "700",
    color: "#1A1A1A",
    marginBottom: 8,
    textAlign: "center",
  },
  scanDesc: {
    fontSize: 15,
    color: "#666666",
    textAlign: "center",
    lineHeight: 22,
  },
  scanButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#7B61FF",
    paddingVertical: 16,
    borderRadius: 16,
    gap: 12,
  },
  scanningButton: {
    backgroundColor: "#4DCCFF",
  },
  scanButtonText: {
    fontSize: 16,
    fontWeight: "600",
    color: "#FFFFFF",
  },
  quickCreateCard: {
    backgroundColor: "#FFFFFF",
    borderRadius: 20,
    padding: 24,
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  quickCreateTitle: {
    fontSize: 18,
    fontWeight: "700",
    color: "#1A1A1A",
    marginBottom: 8,
  },
  quickCreateDesc: {
    fontSize: 14,
    color: "#666666",
    marginBottom: 20,
    textAlign: "center",
  },
  quickCreateButton: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#F5F5FF",
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 12,
    gap: 8,
  },
  quickCreateButtonText: {
    fontSize: 15,
    fontWeight: "600",
    color: "#7B61FF",
  },
  content: {
    paddingHorizontal: 20,
    paddingBottom: 40,
  },
  avatarPreviewContainer: {
    marginTop: 20,
    marginBottom: 30,
  },
  previewHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 16,
  },
  previewTitle: {
    fontSize: 20,
    fontWeight: "700",
    color: "#1A1A1A",
  },
  viewToggle: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#F5F5FF",
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
    gap: 6,
  },
  viewToggleText: {
    fontSize: 14,
    fontWeight: "600",
    color: "#7B61FF",
  },
  avatarPreview: {
    borderRadius: 24,
    overflow: "hidden",
    padding: 24,
  },
  avatarModel: {
    height: 300,
    justifyContent: "center",
    alignItems: "center",
    position: "relative",
  },
  avatarModelInner: {
    width: 200,
    height: 200,
    borderRadius: 100,
    backgroundColor: "rgba(255, 255, 255, 0.2)",
    justifyContent: "center",
    alignItems: "center",
  },
  measurementIndicator: {
    position: "absolute",
    flexDirection: "row",
    alignItems: "center",
  },
  indicatorLine: {
    width: 40,
    height: 2,
    backgroundColor: "rgba(255, 255, 255, 0.8)",
  },
  indicatorText: {
    fontSize: 12,
    color: "#FFFFFF",
    marginLeft: 8,
    fontWeight: "600",
  },
  heightIndicator: {
    top: 20,
    right: 20,
  },
  chestIndicator: {
    top: '40%',
    left: 20,
  },
  waistIndicator: {
    bottom: 60,
    right: 40,
  },
  previewStats: {
    flexDirection: "row",
    justifyContent: "space-around",
    backgroundColor: "rgba(255, 255, 255, 0.2)",
    borderRadius: 16,
    padding: 16,
    marginTop: 20,
  },
  statItem: {
    alignItems: "center",
  },
  statLabel: {
    fontSize: 12,
    color: "rgba(255, 255, 255, 0.9)",
    marginBottom: 4,
  },
  statValue: {
    fontSize: 16,
    fontWeight: "700",
    color: "#FFFFFF",
  },
  section: {
    marginBottom: 30,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: "700",
    color: "#1A1A1A",
    marginBottom: 8,
  },
  sectionSubtitle: {
    fontSize: 14,
    color: "#666666",
    marginBottom: 16,
  },
  posesGrid: {
    flexDirection: "row",
    justifyContent: "space-between",
  },
  poseCard: {
    width: (width - 60) / 4,
    alignItems: "center",
    backgroundColor: "#F8F9FA",
    padding: 16,
    borderRadius: 16,
    position: "relative",
  },
  selectedPoseCard: {
    backgroundColor: "#F5F5FF",
    borderWidth: 2,
    borderColor: "#7B61FF",
  },
  poseEmoji: {
    fontSize: 32,
    marginBottom: 8,
  },
  poseName: {
    fontSize: 12,
    fontWeight: "600",
    color: "#1A1A1A",
  },
  selectedBadge: {
    position: "absolute",
    top: -8,
    right: -8,
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: "#7B61FF",
    justifyContent: "center",
    alignItems: "center",
  },
  qualityGrid: {
    flexDirection: "row",
    justifyContent: "space-between",
  },
  qualityCard: {
    width: (width - 80) / 3,
    backgroundColor: "#FFFFFF",
    padding: 16,
    borderRadius: 16,
    alignItems: "center",
    borderWidth: 2,
    borderColor: "transparent",
    position: "relative",
  },
  qualityIcon: {
    width: 56,
    height: 56,
    borderRadius: 28,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 12,
  },
  qualityDot: {
    width: 12,
    height: 12,
    borderRadius: 6,
  },
  qualityName: {
    fontSize: 16,
    fontWeight: "700",
    color: "#1A1A1A",
    marginBottom: 4,
  },
  qualityDesc: {
    fontSize: 12,
    color: "#666666",
    textAlign: "center",
  },
  qualitySelected: {
    position: "absolute",
    top: -8,
    right: -8,
    width: 24,
    height: 24,
    borderRadius: 12,
    justifyContent: "center",
    alignItems: "center",
  },
  measurementsHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 16,
  },
  autoButton: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#F5F5FF",
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
    gap: 6,
  },
  autoButtonText: {
    fontSize: 14,
    fontWeight: "600",
    color: "#7B61FF",
  },
  measurementsGrid: {
    backgroundColor: "#FFFFFF",
    borderRadius: 20,
    padding: 20,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  measurementCard: {
    marginBottom: 20,
  },
  measurementHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 12,
  },
  measurementIcon: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: "#F8F9FA",
    justifyContent: "center",
    alignItems: "center",
    marginRight: 12,
  },
  measurementLabel: {
    fontSize: 16,
    fontWeight: "600",
    color: "#1A1A1A",
    flex: 1,
  },
  measurementValue: {
    fontSize: 16,
    fontWeight: "700",
    color: "#7B61FF",
  },
  sliderContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 12,
  },
  sliderTrack: {
    flex: 1,
    height: 6,
    backgroundColor: "#F0F0F0",
    borderRadius: 3,
    marginHorizontal: 12,
    overflow: "hidden",
  },
  sliderProgress: {
    height: 6,
    backgroundColor: "#7B61FF",
    borderRadius: 3,
  },
  sliderMin: {
    fontSize: 12,
    color: "#999999",
    width: 40,
  },
  sliderMax: {
    fontSize: 12,
    color: "#999999",
    width: 40,
    textAlign: "right",
  },
  sliderButtons: {
    flexDirection: "row",
    justifyContent: "center",
    gap: 20,
  },
  sliderButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: "#F5F5F5",
    justifyContent: "center",
    alignItems: "center",
  },
  sliderButtonText: {
    fontSize: 20,
    fontWeight: "700",
    color: "#1A1A1A",
  },
  advancedSection: {
    marginTop: 10,
  },
  advancedButton: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#FFFFFF",
    padding: 20,
    borderRadius: 16,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  advancedButtonText: {
    flex: 1,
    fontSize: 16,
    fontWeight: "600",
    color: "#1A1A1A",
    marginLeft: 16,
  },
});