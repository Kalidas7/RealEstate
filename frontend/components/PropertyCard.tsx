import React from 'react';
import { View, Text, Image, StyleSheet, TouchableOpacity } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';

interface PropertyCardProps {
    id: number;
    name: string;
    location: string;
    price: string;
    image: string;
    bedrooms: number;
    area: string;
    onPress: () => void;
}

export default function PropertyCard({
    name,
    location,
    price,
    image,
    bedrooms,
    area,
    onPress,
}: PropertyCardProps) {
    return (
        <TouchableOpacity style={styles.card} onPress={onPress} activeOpacity={0.9}>
            <Image source={{ uri: image }} style={styles.image} />
            <LinearGradient
                colors={['transparent', 'rgba(0,0,0,0.8)']}
                style={styles.gradient}
            />
            <View style={styles.content}>
                <Text style={styles.name} numberOfLines={1}>{name}</Text>
                <Text style={styles.location} numberOfLines={1}>📍 {location}</Text>
                <View style={styles.footer}>
                    <Text style={styles.price}>{price}</Text>
                    <View style={styles.specs}>
                        <View style={styles.spec}>
                            <Text style={styles.specIcon}>🛏️</Text>
                            <Text style={styles.specText}>{bedrooms}</Text>
                        </View>
                        <View style={styles.spec}>
                            <Text style={styles.specIcon}>📐</Text>
                            <Text style={styles.specText}>{area}</Text>
                        </View>
                    </View>
                </View>
            </View>
        </TouchableOpacity>
    );
}

const styles = StyleSheet.create({
    card: {
        borderRadius: 20,
        overflow: 'hidden',
        marginBottom: 20,
        backgroundColor: '#fff',
        elevation: 5,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.3,
        shadowRadius: 8,
    },
    image: {
        width: '100%',
        height: 220,
        resizeMode: 'cover',
    },
    gradient: {
        position: 'absolute',
        left: 0,
        right: 0,
        bottom: 0,
        height: '50%',
    },
    content: {
        position: 'absolute',
        bottom: 0,
        left: 0,
        right: 0,
        padding: 16,
    },
    name: {
        fontSize: 20,
        fontWeight: 'bold',
        color: '#fff',
        marginBottom: 4,
    },
    location: {
        fontSize: 14,
        color: 'rgba(255, 255, 255, 0.9)',
        marginBottom: 12,
    },
    footer: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
    },
    price: {
        fontSize: 22,
        fontWeight: 'bold',
        color: '#4CAF50',
    },
    specs: {
        flexDirection: 'row',
        gap: 12,
    },
    spec: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 4,
    },
    specIcon: {
        fontSize: 14,
    },
    specText: {
        fontSize: 14,
        color: '#fff',
        fontWeight: '600',
    },
});
