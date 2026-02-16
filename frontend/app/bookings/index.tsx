
import React from 'react';
import { View, Text, ScrollView, TouchableOpacity, Image } from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { styles } from './styles';

export default function BookingsScreen() {
    const router = useRouter();

    const bookings = [
        {
            id: 1,
            title: 'Modern Loft',
            location: 'Downtown, NY',
            date: '12',
            month: 'FEB',
            status: 'upcoming',
            image: 'https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?q=80&w=300&auto=format&fit=crop',
        },
        {
            id: 2,
            title: 'Cozy Apartment',
            location: 'Brooklyn, NY',
            date: '28',
            month: 'JAN',
            status: 'completed',
            image: 'https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?q=80&w=300&auto=format&fit=crop',
        },
    ];

    return (
        <View style={styles.container}>
            <View style={styles.header}>
                <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
                    <Ionicons name="chevron-back" size={24} color="#fff" />
                </TouchableOpacity>
                <Text style={styles.headerTitle}>My Bookings</Text>
                <View style={styles.placeholder} />
            </View>

            <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
                {bookings.length > 0 ? (
                    bookings.map((booking) => (
                        <TouchableOpacity key={booking.id} style={styles.bookingCard}>
                            <Image source={{ uri: booking.image }} style={styles.bookingImage} />
                            <View style={styles.bookingInfo}>
                                <Text style={styles.propertyTitle}>{booking.title}</Text>
                                <Text style={styles.propertyLocation}>{booking.location}</Text>
                                <View style={[styles.statusBadge,
                                booking.status === 'completed' && { backgroundColor: 'rgba(255, 255, 255, 0.1)', borderColor: 'rgba(255, 255, 255, 0.2)' }
                                ]}>
                                    <Text style={[styles.statusText,
                                    booking.status === 'completed' && { color: 'rgba(255, 255, 255, 0.6)' }
                                    ]}>
                                        {booking.status.toUpperCase()}
                                    </Text>
                                </View>
                            </View>
                            <View style={styles.dateContainer}>
                                <Text style={styles.dateText}>{booking.date}</Text>
                                <Text style={styles.monthText}>{booking.month}</Text>
                            </View>
                        </TouchableOpacity>
                    ))
                ) : (
                    <View style={styles.emptyState}>
                        <Ionicons name="calendar-outline" size={80} color="#fff" style={styles.emptyIcon} />
                        <Text style={styles.emptyText}>No Bookings Yet</Text>
                        <Text style={styles.emptySubtext}>
                            When you book a property, it will show up here.
                        </Text>
                    </View>
                )}
            </ScrollView>
        </View>
    );
}
