import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Dimensions } from 'react-native';
import { useLocalSearchParams, Stack, useRouter } from 'expo-router';
import { BlurView } from 'expo-blur';
import { LinearGradient } from 'expo-linear-gradient';
import ThreeDViewer from '@/components/ThreeDViewer';

const { width, height } = Dimensions.get('window');
const API_BASE = 'http://192.168.1.11:8000';

export default function PropertyDetailScreen() {
    const params = useLocalSearchParams();
    const router = useRouter();
    const [isFullscreen, setIsFullscreen] = useState(false);

    const property = params.property ? JSON.parse(params.property as string) : null;

    if (!property) {
        return (
            <View style={styles.container}>
                <Text style={styles.errorText}>Property not found</Text>
            </View>
        );
    }

    const modelUrl = property.three_d_file 
        ? (property.three_d_file.startsWith('http') ? property.three_d_file : `${API_BASE}${property.three_d_file}`)
        : null;

    if (isFullscreen) {
        return (
            <View style={styles.container}>
                <Stack.Screen options={{ headerShown: false }} />
                <View style={{ flex: 1 }}>
                    <ThreeDViewer
                        visible={true}
                        onClose={() => { }}
                        modelUrl={modelUrl}
                        propertyName={property.name}
                    />
                </View>
                <TouchableOpacity
                    style={styles.exitFullscreen}
                    onPress={() => setIsFullscreen(false)}
                >
                    <Text style={styles.exitIcon}>⤓</Text>
                </TouchableOpacity>
            </View>
        );
    }

    return (
        <View style={styles.container}>
            <Stack.Screen options={{ headerShown: false }} />

            {/* Back button overlay */}
            <View style={styles.headerOverlay}>
                <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
                    <Text style={styles.backIcon}>←</Text>
                </TouchableOpacity>
                <Text style={styles.headerTitle} numberOfLines={1}>{property.name}</Text>
                <TouchableOpacity
                    onPress={() => modelUrl && setIsFullscreen(true)}
                    style={[styles.backBtn, !modelUrl && { opacity: 0.3 }]}
                >
                    <Text style={styles.backIcon}>⤢</Text>
                </TouchableOpacity>
            </View>

            {/* 3D Viewer - 3/4 screen */}
            <View style={styles.viewerSection}>
                <ThreeDViewer
                    visible={true}
                    onClose={() => { }}
                    modelUrl={modelUrl}
                    propertyName={property.name}
                />
            </View>

            {/* Details - scrollable bottom 1/4 */}
            <View style={styles.detailsSection}>
                <ScrollView
                    showsVerticalScrollIndicator={false}
                    contentContainerStyle={styles.detailsContent}
                >
                    <LinearGradient
                        colors={['rgba(26, 26, 46, 0.95)', 'rgba(10, 10, 10, 0.98)']}
                        style={styles.detailsCard}
                    >
                        {/* Price */}
                        <View style={styles.priceRow}>
                            <Text style={styles.price}>{property.price}</Text>
                            <Text style={styles.location}>📍 {property.location}</Text>
                        </View>

                        {/* Stats Row */}
                        <View style={styles.statsRow}>
                            <View style={styles.stat}>
                                <Text style={styles.statVal}>{property.bedrooms}</Text>
                                <Text style={styles.statLabel}>Beds</Text>
                            </View>
                            <View style={styles.statDivider} />
                            <View style={styles.stat}>
                                <Text style={styles.statVal}>{property.bathrooms}</Text>
                                <Text style={styles.statLabel}>Baths</Text>
                            </View>
                            <View style={styles.statDivider} />
                            <View style={styles.stat}>
                                <Text style={styles.statVal}>{property.area}</Text>
                                <Text style={styles.statLabel}>Area</Text>
                            </View>
                        </View>

                        {/* Description */}
                        {property.description ? (
                            <View>
                                <Text style={styles.sectionTitle}>About</Text>
                                <Text style={styles.description}>{property.description}</Text>
                            </View>
                        ) : null}

                        {/* Book button */}
                        <TouchableOpacity style={styles.bookBtn}>
                            <LinearGradient
                                colors={['#667eea', '#764ba2']}
                                style={styles.bookGradient}
                            >
                                <Text style={styles.bookText}>📅 Book a Viewing</Text>
                            </LinearGradient>
                        </TouchableOpacity>
                    </LinearGradient>
                </ScrollView>
            </View>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#0a0a0a',
    },
    headerOverlay: {
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        zIndex: 10,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingTop: 50,
        paddingHorizontal: 16,
        paddingBottom: 10,
    },
    backBtn: {
        width: 38,
        height: 38,
        borderRadius: 19,
        backgroundColor: 'rgba(0, 0, 0, 0.5)',
        justifyContent: 'center',
        alignItems: 'center',
        borderWidth: 0.5,
        borderColor: 'rgba(255, 255, 255, 0.15)',
    },
    backIcon: {
        fontSize: 20,
        color: '#fff',
    },
    headerTitle: {
        flex: 1,
        fontSize: 16,
        fontWeight: '600',
        color: '#fff',
        textAlign: 'center',
        marginHorizontal: 10,
    },
    viewerSection: {
        height: height * 0.6,
    },
    detailsSection: {
        flex: 1,
    },
    detailsContent: {
        paddingHorizontal: 16,
        paddingTop: 12,
        paddingBottom: 40,
    },
    detailsCard: {
        borderRadius: 20,
        padding: 20,
        borderWidth: 0.5,
        borderColor: 'rgba(255, 255, 255, 0.1)',
    },
    priceRow: {
        marginBottom: 16,
    },
    price: {
        fontSize: 28,
        fontWeight: 'bold',
        color: '#4CAF50',
        marginBottom: 4,
    },
    location: {
        fontSize: 14,
        color: 'rgba(255, 255, 255, 0.7)',
    },
    statsRow: {
        flexDirection: 'row',
        justifyContent: 'space-around',
        paddingVertical: 14,
        backgroundColor: 'rgba(255, 255, 255, 0.05)',
        borderRadius: 12,
        marginBottom: 16,
    },
    stat: {
        alignItems: 'center',
    },
    statVal: {
        fontSize: 18,
        fontWeight: 'bold',
        color: '#fff',
    },
    statLabel: {
        fontSize: 11,
        color: 'rgba(255, 255, 255, 0.5)',
        marginTop: 2,
    },
    statDivider: {
        width: 1,
        backgroundColor: 'rgba(255, 255, 255, 0.1)',
    },
    sectionTitle: {
        fontSize: 16,
        fontWeight: '600',
        color: '#fff',
        marginBottom: 8,
    },
    description: {
        fontSize: 14,
        lineHeight: 22,
        color: 'rgba(255, 255, 255, 0.7)',
        marginBottom: 16,
    },
    bookBtn: {
        borderRadius: 14,
        overflow: 'hidden',
        marginTop: 4,
    },
    bookGradient: {
        paddingVertical: 14,
        alignItems: 'center',
    },
    bookText: {
        color: '#fff',
        fontSize: 16,
        fontWeight: 'bold',
    },
    exitFullscreen: {
        position: 'absolute',
        top: 55,
        right: 20,
        width: 44,
        height: 44,
        borderRadius: 22,
        backgroundColor: 'rgba(0, 0, 0, 0.6)',
        justifyContent: 'center',
        alignItems: 'center',
        borderWidth: 0.5,
        borderColor: 'rgba(255, 255, 255, 0.2)',
    },
    exitIcon: {
        fontSize: 22,
        color: '#fff',
    },
    errorText: {
        color: '#fff',
        fontSize: 18,
        textAlign: 'center',
        marginTop: 100,
    },
});
