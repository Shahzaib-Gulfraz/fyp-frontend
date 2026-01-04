import React, {
  forwardRef,
  useImperativeHandle,
  useRef,
} from "react";
import { View, StyleSheet, TouchableOpacity } from "react-native";
import { TextInput } from "react-native-paper";
import { useTheme } from "@/src/context/ThemeContext";
import { Search, ArrowLeft, X } from "lucide-react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

/* =======================
   TYPES
======================= */

export interface SearchHeaderRef {
  focus: () => void;
  blur: () => void;
}

interface SearchHeaderProps {
  searchQuery: string;
  onSearchChange: (query: string) => void;
  onClearSearch: () => void;
  onBackPress: () => void;
  onSearchFocus: () => void;
  showBackButton: boolean;
}

/* =======================
   COMPONENT
======================= */

const SearchHeader = forwardRef<SearchHeaderRef, SearchHeaderProps>(
  (
    {
      searchQuery,
      onSearchChange,
      onClearSearch,
      onBackPress,
      onSearchFocus,
      showBackButton,
    },
    ref
  ) => {
    const insets = useSafeAreaInsets();
    const { theme } = useTheme();
    const { colors } = theme;

    const textInputRef = useRef<any>(null);

    useImperativeHandle(ref, () => ({
      focus: () => textInputRef.current?.focus(),
      blur: () => textInputRef.current?.blur(),
    }));

    return (
      <View
        style={[
          styles.header,
          {
            paddingTop: insets.top + 15,
            backgroundColor: colors.background,
            borderBottomColor: colors.border,
            borderBottomWidth: showBackButton ? 1 : 0,
          },
        ]}
      >
        <View style={styles.searchContainer}>
          {/* Back Button */}
          {showBackButton && (
            <TouchableOpacity
              onPress={onBackPress}
              style={styles.backButton}
              hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
            >
              <ArrowLeft size={24} color={colors.text} />
            </TouchableOpacity>
          )}

          {/* Search Input */}
          <TextInput
            ref={textInputRef}
            placeholder="Search"
            value={searchQuery}
            onChangeText={onSearchChange}
            onFocus={onSearchFocus}
            style={[
              styles.searchInput,
              {
                backgroundColor: colors.surface,
                marginLeft: showBackButton ? 8 : 0,
              },
            ]}
            mode="outlined"
            outlineColor="transparent"
            activeOutlineColor={colors.primary}
            placeholderTextColor={colors.textSecondary}
            theme={{
              colors: {
                text: colors.text,
                background: "transparent",
                placeholder: colors.textSecondary,
                primary: colors.primary,
              },
              roundness: 12,
            }}
            left={
              <TextInput.Icon
                icon={() => (
                  <Search size={20} color={colors.textSecondary} />
                )}
                style={styles.searchIcon}
              />
            }
            right={
              searchQuery.length > 0 ? (
                <TextInput.Icon
                  icon={() => (
                    <X size={20} color={colors.textSecondary} />
                  )}
                  onPress={onClearSearch}
                />
              ) : null
            }
            contentStyle={styles.inputContent}
          />
        </View>
      </View>
    );
  }
);

SearchHeader.displayName = "SearchHeader";

export default SearchHeader;

/* =======================
   STYLES
======================= */

const styles = StyleSheet.create({
  header: {
    paddingHorizontal: 16,
    paddingBottom: 12,
    zIndex: 100,
  },
  searchContainer: {
    flexDirection: "row",
    alignItems: "center",
  },
  backButton: {
    marginRight: 8,
    padding: 4,
  },
  searchInput: {
    flex: 1,
    fontSize: 16,
    height: 44,
    borderRadius: 12,
  },
  searchIcon: {
    marginTop: 4,
  },
  inputContent: {
    paddingLeft: 8,
  },
});
