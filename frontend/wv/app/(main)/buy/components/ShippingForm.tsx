import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
} from 'react-native';
import { useTheme } from '@/src/context/ThemeContext';
import { appTheme } from '@/src/theme/appTheme';
import { Check, MapPin, Plus, ChevronDown } from 'lucide-react-native';
import { ShippingAddress } from '@/src/types';

interface ShippingFormProps {
  onAddressSelect: (address: ShippingAddress) => void;
  selectedAddress: ShippingAddress | null;
}

const ShippingForm: React.FC<ShippingFormProps> = ({ onAddressSelect, selectedAddress }) => {
  const { colors } = useTheme();
  const { spacing, radius, fonts } = appTheme.tokens;

  const [savedAddresses] = useState<ShippingAddress[]>([
    {
      id: '1',
      fullName: 'John Doe',
      street: '123 Main Street',
      city: 'New York',
      state: 'NY',
      zipCode: '10001',
      country: 'United States',
      phone: '+1 (555) 123-4567',
      email: 'john.doe@example.com',
      isDefault: true,
    },
    {
      id: '2',
      fullName: 'John Doe',
      street: '456 Park Avenue',
      city: 'Brooklyn',
      state: 'NY',
      zipCode: '11201',
      country: 'United States',
      phone: '+1 (555) 123-4567',
      email: 'john.doe@example.com',
      isDefault: false,
    },
  ]);

  const [showNewAddress, setShowNewAddress] = useState(false);
  const [newAddress, setNewAddress] = useState({
    fullName: '',
    street: '',
    city: '',
    state: '',
    zipCode: '',
    country: 'United States',
    phone: '',
    email: '',
  });

  const handleSelectAddress = (address: ShippingAddress) => {
    onAddressSelect(address);
  };

  const handleSaveNewAddress = () => {
    const address: ShippingAddress = {
      id: Date.now().toString(),
      ...newAddress,
      isDefault: false,
    };
    onAddressSelect(address);
    setShowNewAddress(false);
  };

  return (
    <View style={[styles.container, { marginBottom: spacing.lg }]}>
      <View style={styles.header}>
        <MapPin size={20} color={colors.primary} />
        <Text style={[styles.sectionTitle, { color: colors.text, fontFamily: fonts.semiBold, marginLeft: spacing.sm }]}>
          Shipping Address
        </Text>
      </View>

      {/* Saved Addresses */}
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.addressesContainer}
      >
        {savedAddresses.map((address) => (
          <TouchableOpacity
            key={address.id}
            onPress={() => handleSelectAddress(address)}
            style={[
              styles.addressCard,
              {
                backgroundColor: colors.surface,
                borderColor: selectedAddress?.id === address.id ? colors.primary : colors.border,
                borderRadius: radius.lg,
              },
            ]}
          >
            <View style={styles.addressHeader}>
              <Text style={[styles.addressName, { color: colors.text, fontFamily: fonts.semiBold }]}>
                {address.fullName}
              </Text>
              {address.isDefault && (
                <View style={[styles.defaultBadge, { backgroundColor: colors.primary + '20' }]}>
                  <Text style={[styles.defaultText, { color: colors.primary, fontFamily: fonts.medium }]}>
                    Default
                  </Text>
                </View>
              )}
            </View>
            
            <Text style={[styles.addressText, { color: colors.textSecondary, fontFamily: fonts.regular }]}>
              {address.street}
            </Text>
            <Text style={[styles.addressText, { color: colors.textSecondary, fontFamily: fonts.regular }]}>
              {address.city}, {address.state} {address.zipCode}
            </Text>
            <Text style={[styles.addressText, { color: colors.textSecondary, fontFamily: fonts.regular }]}>
              {address.country}
            </Text>
            
            <View style={[styles.addressFooter, { borderTopColor: colors.border }]}>
              <Text style={[styles.phoneText, { color: colors.textTertiary, fontFamily: fonts.regular }]}>
                {address.phone}
              </Text>
              
              {selectedAddress?.id === address.id && (
                <View style={[styles.selectedIndicator, { backgroundColor: colors.primary }]}>
                  <Check size={16} color={colors.background} />
                </View>
              )}
            </View>
          </TouchableOpacity>
        ))}
      </ScrollView>

      {/* Add New Address Button */}
      {!showNewAddress ? (
        <TouchableOpacity
          onPress={() => setShowNewAddress(true)}
          style={[
            styles.addButton,
            {
              backgroundColor: colors.surface,
              borderColor: colors.border,
              borderRadius: radius.lg,
            },
          ]}
        >
          <Plus size={20} color={colors.primary} />
          <Text style={[styles.addButtonText, { color: colors.primary, fontFamily: fonts.medium }]}>
            Add New Address
          </Text>
        </TouchableOpacity>
      ) : (
        <View style={[styles.newAddressForm, { backgroundColor: colors.surface, borderRadius: radius.lg }]}>
          <Text style={[styles.formTitle, { color: colors.text, fontFamily: fonts.semiBold }]}>
            New Shipping Address
          </Text>
          
          {Object.entries(newAddress).map(([key, value]) => (
            key !== 'isDefault' && (
              <View key={key} style={styles.inputContainer}>
                <Text style={[styles.inputLabel, { color: colors.textTertiary, fontFamily: fonts.medium }]}>
                  {key.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase())}
                </Text>
                <TextInput
                  value={value}
                  onChangeText={(text) => setNewAddress(prev => ({ ...prev, [key]: text }))}
                  style={[
                    styles.input,
                    {
                      backgroundColor: colors.background,
                      borderColor: colors.border,
                      color: colors.text,
                      fontFamily: fonts.regular,
                      borderRadius: radius.sm,
                    },
                  ]}
                  placeholderTextColor={colors.textTertiary}
                />
              </View>
            )
          ))}
          
          <View style={styles.formButtons}>
            <TouchableOpacity
              onPress={() => setShowNewAddress(false)}
              style={[
                styles.cancelButton,
                {
                  backgroundColor: colors.surface,
                  borderColor: colors.border,
                  borderRadius: radius.sm,
                },
              ]}
            >
              <Text style={[styles.cancelButtonText, { color: colors.textSecondary, fontFamily: fonts.medium }]}>
                Cancel
              </Text>
            </TouchableOpacity>
            
            <TouchableOpacity
              onPress={handleSaveNewAddress}
              style={[
                styles.saveButton,
                {
                  backgroundColor: colors.primary,
                  borderRadius: radius.sm,
                },
              ]}
            >
              <Text style={[styles.saveButtonText, { color: colors.background, fontFamily: fonts.semiBold }]}>
                Save Address
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginTop: 16,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 20,
  },
  addressesContainer: {
    paddingVertical: 8,
    paddingRight: 16,
  },
  addressCard: {
    width: 280,
    padding: 16,
    marginRight: 12,
    borderWidth: 2,
  },
  addressHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  addressName: {
    fontSize: 16,
    flex: 1,
  },
  defaultBadge: {
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 4,
  },
  defaultText: {
    fontSize: 10,
    textTransform: 'uppercase',
  },
  addressText: {
    fontSize: 13,
    lineHeight: 18,
    marginBottom: 4,
  },
  addressFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingTop: 12,
    marginTop: 8,
    borderTopWidth: 1,
  },
  phoneText: {
    fontSize: 12,
  },
  selectedIndicator: {
    width: 24,
    height: 24,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  addButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 16,
    marginTop: 12,
    borderWidth: 1,
    borderStyle: 'dashed',
  },
  addButtonText: {
    fontSize: 16,
    marginLeft: 8,
  },
  newAddressForm: {
    padding: 16,
    marginTop: 12,
    borderWidth: 1,
    borderColor: 'transparent',
  },
  formTitle: {
    fontSize: 18,
    marginBottom: 16,
  },
  inputContainer: {
    marginBottom: 12,
  },
  inputLabel: {
    fontSize: 13,
    marginBottom: 6,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  input: {
    padding: 12,
    borderWidth: 1,
    fontSize: 14,
  },
  formButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 16,
  },
  cancelButton: {
    flex: 1,
    paddingVertical: 12,
    marginRight: 8,
    alignItems: 'center',
    borderWidth: 1,
  },
  cancelButtonText: {
    fontSize: 14,
  },
  saveButton: {
    flex: 2,
    paddingVertical: 12,
    alignItems: 'center',
  },
  saveButtonText: {
    fontSize: 14,
  },
});

export default ShippingForm;