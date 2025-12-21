// app/(main)/support/help.tsx
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  TextInput,
  FlatList,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { StatusBar } from "expo-status-bar";
import { useRouter } from "expo-router";
import {
  ArrowLeft,
  HelpCircle,
  Search,
  ChevronRight,
  BookOpen,
  MessageSquare,
  Phone,
  Mail,
  FileText,
  Video,
} from "lucide-react-native";
import React, { useState } from "react";
import { useTheme } from "../../../src/context/ThemeContext";

const faqCategories = [
  {
    id: "getting_started",
    title: "Getting Started",
    icon: <BookOpen size={20} color="#00BCD4" />,
    questions: [
      { id: "1", question: "How do I create an account?", answer: "To create an account, tap on the 'Sign Up' button on the login screen and follow the instructions." },
      { id: "2", question: "How to set up my avatar?", answer: "Go to Profile → Edit Avatar to customize your virtual avatar." },
      { id: "3", question: "How to upload my first outfit?", answer: "Tap the + button on the home screen and select 'Upload Outfit'." },
    ],
  },
  {
    id: "virtual_tryon",
    title: "Virtual Try-On",
    icon: <Video size={20} color="#00BCD4" />,
    questions: [
      { id: "4", question: "How accurate is the virtual try-on?", answer: "Our technology provides 95% accuracy in fit and appearance based on your measurements." },
      { id: "5", question: "Can I try on multiple outfits?", answer: "Yes, you can create and save multiple outfits in your virtual wardrobe." },
    ],
  },
  {
    id: "account",
    title: "Account & Settings",
    icon: <FileText size={20} color="#00BCD4" />,
    questions: [
      { id: "6", question: "How to change my password?", answer: "Go to Settings → Account → Change Password to update your password." },
      { id: "7", question: "How to delete my account?", answer: "Go to Settings → Account → Delete Account to permanently remove your account." },
    ],
  },
];

const popularArticles = [
  { id: "1", title: "How to use the virtual fitting room", category: "Getting Started" },
  { id: "2", title: "Measuring your body for accurate fit", category: "Virtual Try-On" },
  { id: "3", title: "Managing your virtual wardrobe", category: "Features" },
  { id: "4", title: "Privacy and data security", category: "Account & Settings" },
];

export default function HelpCenterScreen() {
  const { theme, isDark } = useTheme();
  const styles = getStyles(theme.colors);
  
  const router = useRouter();
  const [searchQuery, setSearchQuery] = useState("");
  const [expandedFAQ, setExpandedFAQ] = useState<string | null>(null);

  const toggleFAQ = (questionId: string) => {
    setExpandedFAQ(expandedFAQ === questionId ? null : questionId);
  };

  const renderFAQItem = (item: any, categoryIndex: number) => {
    const isExpanded = expandedFAQ === item.id;
    
    return (
      <View key={item.id} style={styles.faqItem}>
        <TouchableOpacity
          style={styles.faqQuestion}
          onPress={() => toggleFAQ(item.id)}
        >
          <Text style={styles.faqQuestionText}>{item.question}</Text>
          <ChevronRight 
            size={20} 
            color="#666" 
            style={[styles.chevron, isExpanded && styles.chevronExpanded]} 
          />
        </TouchableOpacity>
        
        {isExpanded && (
          <View style={styles.faqAnswer}>
            <Text style={styles.faqAnswerText}>{item.answer}</Text>
            <TouchableOpacity style={styles.helpfulButton}>
              <Text style={styles.helpfulText}>Was this helpful?</Text>
            </TouchableOpacity>
          </View>
        )}
      </View>
    );
  };

  const renderArticleItem = ({ item }: { item: any }) => (
    <TouchableOpacity style={styles.articleItem}>
      <View style={styles.articleContent}>
        <Text style={styles.articleTitle}>{item.title}</Text>
        <Text style={styles.articleCategory}>{item.category}</Text>
      </View>
      <ChevronRight size={20} color="#666" />
    </TouchableOpacity>
  );

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
          
          <Text style={styles.headerTitle}>Help Center</Text>
          
          <View style={{ width: 40 }} />
        </View>
      </View>

      <ScrollView
        style={styles.scrollView}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        {/* Search Bar */}
        <View style={styles.searchContainer}>
          <Search size={20} color="#999" />
          <TextInput
            style={styles.searchInput}
            placeholder="Search for help..."
            placeholderTextColor="#999"
            value={searchQuery}
            onChangeText={setSearchQuery}
          />
        </View>

        {/* Quick Actions */}
        <View style={styles.quickActions}>
          <Text style={styles.sectionTitle}>Quick Help</Text>
          <View style={styles.quickActionsGrid}>
            <TouchableOpacity style={styles.quickAction}>
              <View style={styles.quickActionIcon}>
                <MessageSquare size={24} color="#00BCD4" />
              </View>
              <Text style={styles.quickActionText}>Live Chat</Text>
            </TouchableOpacity>
            
            <TouchableOpacity style={styles.quickAction}>
              <View style={styles.quickActionIcon}>
                <Phone size={24} color="#00BCD4" />
              </View>
              <Text style={styles.quickActionText}>Call Support</Text>
            </TouchableOpacity>
            
            <TouchableOpacity 
              style={styles.quickAction}
              onPress={() => router.push("/support/report")}
            >
              <View style={styles.quickActionIcon}>
                <Mail size={24} color="#00BCD4" />
              </View>
              <Text style={styles.quickActionText}>Email Us</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Popular Articles */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Popular Articles</Text>
          <FlatList
            data={popularArticles}
            renderItem={renderArticleItem}
            keyExtractor={(item) => item.id}
            scrollEnabled={false}
          />
        </View>

        {/* FAQ Categories */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Frequently Asked Questions</Text>
          
          {faqCategories.map((category) => (
            <View key={category.id} style={styles.faqCategory}>
              <View style={styles.categoryHeader}>
                {category.icon}
                <Text style={styles.categoryTitle}>{category.title}</Text>
              </View>
              
              {category.questions.map((question) => renderFAQItem(question, 0))}
            </View>
          ))}
        </View>

        {/* Still Need Help */}
        <View style={styles.helpBox}>
          <HelpCircle size={24} color="#00BCD4" />
          <Text style={styles.helpBoxTitle}>Still need help?</Text>
          <Text style={styles.helpBoxText}>
            Our support team is available 24/7 to assist you with any questions.
          </Text>
          <TouchableOpacity 
            style={styles.contactButton}
            onPress={() => router.push("/support/contact")}
          >
            <Text style={styles.contactButtonText}>Contact Support</Text>
          </TouchableOpacity>
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
    searchContainer: {
      flexDirection: "row",
      alignItems: "center",
      backgroundColor: colors.surface,
      borderWidth: 1,
      borderColor: colors.border,
      borderRadius: 12,
      paddingHorizontal: 16,
      marginHorizontal: 20,
      marginTop: 20,
      marginBottom: 24,
    },
    searchInput: {
      flex: 1,
      fontSize: 16,
      color: colors.text,
      paddingVertical: 14,
      marginLeft: 12,
    },
    quickActions: {
      paddingHorizontal: 20,
      marginBottom: 24,
    },
    section: {
      paddingHorizontal: 20,
      marginBottom: 24,
    },
    sectionTitle: {
      fontSize: 18,
      fontWeight: "700",
      color: colors.text,
      marginBottom: 16,
    },
    quickActionsGrid: {
      flexDirection: "row",
      justifyContent: "space-between",
    },
    quickAction: {
      alignItems: "center",
      flex: 1,
      marginHorizontal: 6,
    },
    quickActionIcon: {
      width: 60,
      height: 60,
      borderRadius: 30,
      backgroundColor: "#E0F7FA",
      justifyContent: "center",
      alignItems: "center",
      marginBottom: 8,
    },
    quickActionText: {
      fontSize: 12,
      color: colors.text,
      textAlign: "center",
    },
    articleItem: {
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "space-between",
      backgroundColor: colors.surface,
      borderWidth: 1,
      borderColor: colors.border,
      borderRadius: 12,
      paddingHorizontal: 16,
      paddingVertical: 14,
      marginBottom: 8,
    },
    articleContent: {
      flex: 1,
    },
    articleTitle: {
      fontSize: 15,
      fontWeight: "600",
      color: colors.text,
      marginBottom: 4,
    },
    articleCategory: {
      fontSize: 12,
      color: "#666",
    },
    faqCategory: {
      marginBottom: 20,
    },
    categoryHeader: {
      flexDirection: "row",
      alignItems: "center",
      marginBottom: 12,
    },
    categoryTitle: {
      fontSize: 16,
      fontWeight: "700",
      color: colors.text,
      marginLeft: 12,
    },
    faqItem: {
      backgroundColor: colors.surface,
      borderWidth: 1,
      borderColor: colors.border,
      borderRadius: 12,
      marginBottom: 8,
      overflow: "hidden",
    },
    faqQuestion: {
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "space-between",
      paddingHorizontal: 16,
      paddingVertical: 16,
    },
    faqQuestionText: {
      flex: 1,
      fontSize: 15,
      fontWeight: "600",
      color: colors.text,
      marginRight: 12,
    },
    chevron: {
      transform: [{ rotate: '90deg' }],
    },
    chevronExpanded: {
      transform: [{ rotate: '-90deg' }],
    },
    faqAnswer: {
      paddingHorizontal: 16,
      paddingBottom: 16,
      borderTopWidth: 1,
      borderTopColor: colors.border,
    },
    faqAnswerText: {
      fontSize: 14,
      color: "#666",
      lineHeight: 20,
      marginBottom: 12,
    },
    helpfulButton: {
      alignSelf: 'flex-start',
    },
    helpfulText: {
      fontSize: 13,
      color: "#00BCD4",
      fontWeight: "500",
    },
    helpBox: {
      backgroundColor: "#E0F7FA",
      borderRadius: 16,
      padding: 24,
      marginHorizontal: 20,
      marginTop: 8,
      alignItems: "center",
    },
    helpBoxTitle: {
      fontSize: 18,
      fontWeight: "700",
      color: "#006064",
      marginTop: 12,
      marginBottom: 8,
    },
    helpBoxText: {
      fontSize: 14,
      color: "#006064",
      textAlign: "center",
      marginBottom: 16,
      lineHeight: 20,
    },
    contactButton: {
      backgroundColor: "#00BCD4",
      paddingHorizontal: 24,
      paddingVertical: 12,
      borderRadius: 20,
    },
    contactButtonText: {
      fontSize: 14,
      fontWeight: "600",
      color: "#FFFFFF",
    },
  });