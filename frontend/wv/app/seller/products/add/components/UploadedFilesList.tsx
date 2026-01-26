import React from "react";
import { View, Text, StyleSheet } from "react-native";

export default function UploadedFilesList() {
    return (
        <View style={styles.container}>
            <Text style={styles.title}>Uploaded Files</Text>
            <Text style={styles.empty}>No files uploaded yet</Text>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        padding: 16,
    },
    title: {
        fontSize: 16,
        fontWeight: "bold",
        marginBottom: 8,
    },
    empty: {
        color: "#666",
        fontStyle: "italic",
    },
});
