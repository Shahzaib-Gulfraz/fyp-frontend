// app/(main)/support/contact.tsx
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  TextInput,
  Alert,
  Linking,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { StatusBar } from "expo-status-bar";
import { useRouter } from "expo-router";
import {
  ArrowLeft,
  Mail,
  Phone,
  Clock,
  MapPin,
  Send,
  MessageSquare,
  Globe,
} from "lucide-react-native";
import React, { useState } from "react";
import { useTheme } from "../../../src/context/ThemeContext";

const contactMethods = [
  {
    id: "email",
    title: "Email Support",
    description: "Get help via email",
    icon: <Mail size={24} color="#00BCD4" />,
    value: "support@wearvirtually.com",
    action: () => Linking.openURL('mailto:support@wearvirtually.com'),
  },
  {
    id: "phone",
    title: "Phone Support",
    description: "Call our support team",
    icon: <Phone size={24} color="#00BCD4" />,
    value: "+1 (555) 123-4567",
    action: () => Linking.openURL('tel:+15551234567'),
  },
  {
    id: "live_chat",
    title: "Live Chat",
    description: "Chat with support agents",
    icon: <MessageSquare size={24} color="#00BCD4" />,
    value: "Available 24/7",
    action: () => Alert.alert("Live Chat", "Live chat would open here"),
  },
];

const businessHours = [
  { day: "Monday - Friday", hours: "9:00 AM - 8:00 PM EST" },
  { day: "Saturday", hours: "10:00 AM - 6:00 PM EST" },
  { day: "Sunday", hours: "12:00 PM - 5:00 PM EST" },
];

export default function ContactUsScreen() {
  const { theme, isDark } = useTheme();
  const styles = getStyles(theme.colors);
  
  const router = useRouter();
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    subject: "",
    message: "",
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const validateForm = () => {
    if (!formData.name.trim()) {
      Alert.alert("Error", "Please enter your name");
      return false;
    }
    if (!formData.email.trim() || !formData.email.includes('@')) {
      Alert.alert("Error", "Please enter a valid email address");
      return false;
    }
    if (!formData.subject.trim()) {
      Alert.alert("Error", "Please enter a subject");
      return false;
    }
    if (!formData.message.trim()) {
      Alert.alert("Error", "Please enter your message");
      return false;
    }
    return true;
  };

  const handleSubmit = async () => {
    if (!validateForm()) return;
    
    setIsSubmitting(true);
    
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      Alert.alert(
        "Message Sent",
        "Thank you for contacting us! We'll get back to you within 24 hours.",
        [{ text: "OK", onPress: () => {
          setFormData({ name: "", email: "", subject: "", message: "" });
          router.back();
        }}]
      );
    } catch (error) {
      Alert.alert("Error", "Failed to send message. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar style={isDark ? "light" : "dark"} />
      
      {/* Header */}
      <View style={styles.header}>
        <View style={styles.headerContent}>
          <TouchableOpacity
            style={styles.backButton}
            onPress={() => router.back()}
          >
            <ArrowLeft size={24} color={theme.colors.text} />
          </TouchableOpacity>
          
          <Text style={styles.headerTitle}>Contact Us</Text>
          
          <View style={{ width: 40 }} />
        </View>
      </View>

      <ScrollView
        style={styles.scrollView}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        {/* Contact Methods */}
        <View style={styles.contactMethods}>
          <Text style={styles.sectionTitle}>Quick Contact</Text>
          {contactMethods.map((method) => (
            <TouchableOpacity
              key={method.id}
              style={styles.contactMethod}
              onPress={method.action}
            >
              <View style={styles.methodIcon}>
                {method.icon}
              </View>
              <View style={styles.methodInfo}>
                <Text style={styles.methodTitle}>{method.title}</Text>
                <Text style={styles.methodDescription}>{method.description}</Text>
              </View>
              <Text style={styles.methodValue}>{method.value}</Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* Contact Form */}
        <View style={styles.formSection}>
          <Text style={styles.sectionTitle}>Send us a Message</Text>
          
          <View style={styles.formGroup}>
            <Text style={styles.formLabel}>Your Name</Text>
            <TextInput
              style={styles.input}
              value={formData.name}
              onChangeText={(text) => handleInputChange('name', text)}
              placeholder="Enter your name"
              placeholderTextColor="#999"
            />
          </View>
          
          <View style={styles.formGroup}>
            <Text style={styles.formLabel}>Email Address</Text>
            <TextInput
              style={styles.input}
              value={formData.email}
              onChangeText={(text) => handleInputChange('email', text)}
              placeholder="Enter your email"
              placeholderTextColor="#999"
              keyboardType="email-address"
              autoCapitalize="none"
            />
          </View>
          
          <View style={styles.formGroup}>
            <Text style={styles.formLabel}>Subject</Text>
            <TextInput
              style={styles.input}
              value={formData.subject}
              onChangeText={(text) => handleInputChange('subject', text)}
              placeholder="What is this regarding?"
              placeholderTextColor="#999"
            />
          </View>
          
          <View style={styles.formGroup}>
            <Text style={styles.formLabel}>Message</Text>
            <TextInput
              style={styles.textArea}
              value={formData.message}
              onChangeText={(text) => handleInputChange('message', text)}
              placeholder="How can we help you?"
              placeholderTextColor="#999"
              multiline
              numberOfLines={6}
              textAlignVertical="top"
            />
            <Text style={styles.charCount}>
              {formData.message.length}/2000
            </Text>
          </View>
          
          <TouchableOpacity
            style={[
              styles.submitButton,
              isSubmitting && styles.submitButtonDisabled
            ]}
            onPress={handleSubmit}
            disabled={isSubmitting}
          >
            {isSubmitting ? (
              <Text style={styles.submitButtonText}>Sending...</Text>
            ) : (
              <>
                <Send size={20} color="#FFFFFF" />
                <Text style={styles.submitButtonText}>Send Message</Text>
              </>
            )}
          </TouchableOpacity>
        </View>

        {/* Business Information */}
        <View style={styles.infoSection}>
          <Text style={styles.sectionTitle}>Business Information</Text>
          
          <View style={styles.infoCard}>
            <View style={styles.infoItem}>
              <Clock size={20} color="#00BCD4" />
              <View style={styles.infoContent}>
                <Text style={styles.infoTitle}>Business Hours</Text>
                {businessHours.map((item, index) => (
                  <View key={index} style={styles.hoursItem}>
                    <Text style={styles.hoursDay}>{item.day}</Text>
                    <Text style={styles.hoursTime}>{item.hours}</Text>
                  </View>
                ))}
              </View>
            </View>
            
            <View style={styles.infoItem}>
              <MapPin size={20} color="#00BCD4" />
              <View style={styles.infoContent}>
                <Text style={styles.infoTitle}>Location</Text>
                <Text style={styles.infoText}>
                  123 Fashion Street{"\n"}
                  New York, NY 10001{"\n"}
                  United States
                </Text>
              </View>
            </View>
            
            <View style={styles.infoItem}>
              <Globe size={20} color="#00BCD4" />
              <View style={styles.infoContent}>
                <Text style={styles.infoTitle}>Website</Text>
                <TouchableOpacity onPress={() => Linking.openURL('https://wearvirtually.com')}>
                  <Text style={styles.websiteLink}>wearvirtually.com</Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const getStyles = (colors: any) =>
  StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: colors.background,
    },
    header: {
      backgroundColor: colors.surface,
      borderBottomWidth: 1,
      borderBottomColor: colors.border,
      paddingHorizontal: 20,
      paddingVertical: 15,
    },
    headerContent: {
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "space-between",
    },
    backButton: {
      width: 40,
      height: 40,
      borderRadius: 20,
      backgroundColor: "#F8F9FA",
      justifyContent: "center",
      alignItems: "center",
      borderWidth: 1,
      borderColor: "#F0F0F0",
    },
    headerTitle: {
      fontSize: 18,
      fontWeight: "700",
      color: colors.text,
    },
    scrollView: {
      flex: 1,
    },
    scrollContent: {
      paddingBottom: 40,
    },
    sectionTitle: {
      fontSize: 18,
      fontWeight: "700",
      color: colors.text,
      marginBottom: 16,
    },
    contactMethods: {
      paddingHorizontal: 20,
      marginTop: 20,
    },
    contactMethod: {
      flexDirection: "row",
      alignItems: "center",
      backgroundColor: colors.surface,
      borderWidth: 1,
      borderColor: colors.border,
      borderRadius: 12,
      padding: 16,
      marginBottom: 12,
    },
    methodIcon: {
      width: 48,
      height: 48,
      borderRadius: 24,
      backgroundColor: "#E0F7FA",
      justifyContent: "center",
      alignItems: "center",
      marginRight: 16,
    },
    methodInfo: {
      flex: 1,
    },
    methodTitle: {
      fontSize: 16,
      fontWeight: "600",
      color: colors.text,
      marginBottom: 2,
    },
    methodDescription: {
      fontSize: 12,
      color: "#666",
    },
    methodValue: {
      fontSize: 14,
      color: "#00BCD4",
      fontWeight: "500",
    },
    formSection: {
      paddingHorizontal: 20,
      marginTop: 24,
    },
    formGroup: {
      marginBottom: 16,
    },
    formLabel: {
      fontSize: 14,
      fontWeight: "600",
      color: colors.text,
      marginBottom: 8,
    },
    input: {
      backgroundColor: colors.surface,
      borderWidth: 1,
      borderColor: colors.border,
      borderRadius: 12,
      paddingHorizontal: 16,
      paddingVertical: 14,
      fontSize: 16,
      color: colors.text,
    },
    textArea: {
      backgroundColor: colors.surface,
      borderWidth: 1,
      borderColor: colors.border,
      borderRadius: 12,
      paddingHorizontal: 16,
      paddingVertical: 14,
      fontSize: 16,
      color: colors.text,
      minHeight: 120,
      textAlignVertical: "top",
    },
    charCount: {
      fontSize: 12,
      color: "#999",
      marginTop: 8,
      textAlign: "right",
    },
    submitButton: {
      backgroundColor: "#00BCD4",
      borderRadius: 12,
      paddingVertical: 16,
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "center",
      gap: 8,
      marginTop: 8,
    },
    submitButtonDisabled: {
      opacity: 0.7,
    },
    submitButtonText: {
      fontSize: 16,
      fontWeight: "600",
      color: "#FFFFFF",
    },
    infoSection: {
      paddingHorizontal: 20,
      marginTop: 24,
    },
    infoCard: {
      backgroundColor: colors.surface,
      borderWidth: 1,
      borderColor: colors.border,
      borderRadius: 16,
      padding: 20,
    },
    infoItem: {
      flexDirection: "row",
      marginBottom: 20,
    },
    infoContent: {
      flex: 1,
      marginLeft: 16,
    },
    infoTitle: {
      fontSize: 15,
      fontWeight: "600",
      color: colors.text,
      marginBottom: 8,
    },
    hoursItem: {
      flexDirection: "row",
      justifyContent: "space-between",
      marginBottom: 4,
    },
    hoursDay: {
      fontSize: 14,
      color: colors.text,
    },
    hoursTime: {
      fontSize: 14,
      color: "#666",
    },
    infoText: {
      fontSize: 14,
      color: "#666",
      lineHeight: 20,
    },
    websiteLink: {
      fontSize: 14,
      color: "#00BCD4",
      fontWeight: "500",
    },
  });