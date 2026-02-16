import { Tabs } from 'expo-router';
import React from 'react';
import { StyleSheet, View, Dimensions } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { BlurView } from 'expo-blur';

const { width } = Dimensions.get('window');

export default function TabLayout() {
  return (
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: '#5B8DEF',
        tabBarInactiveTintColor: 'rgba(255, 255, 255, 0.4)',
        headerShown: false,
        tabBarShowLabel: true,
        tabBarStyle: {
          position: 'absolute',
          bottom: 50,
          left: width * 0.25,
          right: width * 0.25,
          height: 60,
          backgroundColor: 'transparent',
          borderRadius: 30,
          borderWidth: 0,
          elevation: 20,
          shadowColor: '#000',
          shadowOffset: { width: 0, height: 10 },
          shadowOpacity: 0.3,
          shadowRadius: 25,
        },
        tabBarItemStyle: {
          height: 60,
          paddingTop: 4,
          paddingBottom: 6,
          paddingHorizontal: 0,
        },
        tabBarLabelStyle: {
          fontSize: 9,
          fontWeight: '500',
          marginTop: 0,
        },
        tabBarBackground: () => (
          <BlurView
            intensity={60}
            tint="dark"
            style={{
              ...StyleSheet.absoluteFillObject,
              borderRadius: 30,
              backgroundColor: 'rgba(18, 18, 25, 0.85)',
              borderWidth: 1,
              borderColor: 'rgba(255, 255, 255, 0.12)',
              overflow: 'hidden',
            }}
          />
        ),
      }}>
      <Tabs.Screen
        name="index"
        options={{
          title: 'Home',
          tabBarIcon: ({ color, focused }) => (
            <View style={[iconStyles.container, focused && iconStyles.activeContainer]}>
              <Ionicons
                name="home-outline"
                size={22}
                color={color}
              />
            </View>
          ),
        }}
      />

      <Tabs.Screen
        name="bookings"
        options={{
          title: 'Bookings',
          tabBarIcon: ({ color, focused }) => (
            <View style={[iconStyles.container, focused && iconStyles.activeContainer]}>
              <Ionicons
                name="calendar-outline"
                size={22}
                color={color}
              />
            </View>
          ),
        }}
      />

      <Tabs.Screen
        name="profile"
        options={{
          title: 'Chat',
          tabBarIcon: ({ color, focused }) => (
            <View style={[iconStyles.container, focused && iconStyles.activeContainer]}>
              <Ionicons
                name="chatbubble-outline"
                size={22}
                color={color}
              />
            </View>
          ),
        }}
      />
    </Tabs>
  );
} 

const iconStyles = StyleSheet.create({
  container: {
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
  },
  activeContainer: {
    // Color change handles the active state
  },
});