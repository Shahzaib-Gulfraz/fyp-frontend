import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { useRouter } from 'expo-router';
import { useTheme } from 'react-native-paper';

export default function NotFoundScreen() {
  const router = useRouter();
  const theme = useTheme();
  const colors = theme.colors;

  return (
    <View style={[styles.container, { backgroundColor: colors.primary }]}>
      <Text style={[styles.title, { color: colors.onPrimary }]}>404</Text>
      <Text style={[styles.subtitle, { color: colors.onPrimary }]}>
        Oops! Page Not Found
      </Text>
      <Text style={[styles.description, { color: colors.onPrimary }]}>
        The page you are looking for does not exist.
      </Text>
      <TouchableOpacity
        style={[styles.button, { backgroundColor: colors.onPrimary }]}
        onPress={() => router.replace("/(main)/home")}
      >
        <Text style={[styles.buttonText, { color: colors.primary }]}>
          Go Back Home
        </Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  title: {
    fontSize: 80,
    fontWeight: 'bold',
  },
  subtitle: {
    fontSize: 24,
    fontWeight: '600',
    marginTop: 10,
  },
  description: {
    fontSize: 16,
    textAlign: 'center',
    marginVertical: 20,
  },
  button: {
    paddingVertical: 12,
    paddingHorizontal: 30,
    borderRadius: 25,
  },
  buttonText: {
    fontWeight: '600',
    fontSize: 16,
  },
});