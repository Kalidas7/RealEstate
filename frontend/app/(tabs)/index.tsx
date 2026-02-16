import React, { useState, useEffect } from 'react';
import { StyleSheet, ScrollView, View, Text, TextInput, TouchableOpacity, RefreshControl, Alert } from 'react-native';
import { useRouter } from 'expo-router';
import AsyncStorage from '@react-native-async-storage/async-storage';
import PropertyCard from '@/components/PropertyCard';

const API_URL = 'http://192.168.1.11:8000/api';

interface Property {
  id: number;
  name: string;
  location: string;
  price: string;
  image: string;
  bedrooms: number;
  bathrooms: number;
  area: string;
  description: string;
  three_d_file: string | null;
}

export default function HomeScreen() {
  const router = useRouter();
  const [user, setUser] = useState<any>(null);
  const [properties, setProperties] = useState<Property[]>([]);
  const [filteredProperties, setFilteredProperties] = useState<Property[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);

  // Filter States
  const [isFilterVisible, setIsFilterVisible] = useState(false);
  const [activeFilter, setActiveFilter] = useState<string | null>(null);

  useEffect(() => {
    loadUser();
    fetchProperties();
  }, []);

  useEffect(() => {
    let result = properties;

    // 1. Search Filter
    if (searchQuery.trim() !== '') {
      result = result.filter(
        (property) =>
          property.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
          property.location.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    // 2. Category Filter
    if (activeFilter) {
      switch (activeFilter) {
        case 'Villa':
          result = result.filter(p =>
            p.name.toLowerCase().includes('villa') ||
            p.description?.toLowerCase().includes('villa')
          );
          break;
        case 'Bedroom':
          // Sort or filter by bedrooms (e.g., more than 2)
          result = result.sort((a, b) => b.bedrooms - a.bedrooms);
          break;
        case 'Place':
          // Sort by location
          result = result.sort((a, b) => a.location.localeCompare(b.location));
          break;
        case 'Type':
          // Sort by price for now as a proxy for type/quality
          // Cleaning string price "$1,200,000" -> 1200000
          result = result.sort((a, b) => {
            const priceA = parseInt(a.price.replace(/[^0-9]/g, '')) || 0;
            const priceB = parseInt(b.price.replace(/[^0-9]/g, '')) || 0;
            return priceA - priceB;
          });
          break;
      }
    }

    setFilteredProperties(result);
  }, [searchQuery, properties, activeFilter]);

  const loadUser = async () => {
    try {
      const userData = await AsyncStorage.getItem('user');
      if (userData) {
        setUser(JSON.parse(userData));
      } else {
        router.replace('/');
      }
    } catch (e) {
      console.error(e);
    }
  };

  const fetchProperties = async () => {
    setLoading(true);
    try {
      const response = await fetch(`${API_URL}/properties/`);
      const data = await response.json();
      if (response.ok) {
        setProperties(data);
        setFilteredProperties(data);
      } else {
        Alert.alert('Error', 'Failed to load properties');
      }
    } catch (error) {
      Alert.alert('Error', 'Failed to connect to server');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const onRefresh = () => {
    setRefreshing(true);
    fetchProperties();
  };

  const handlePropertyPress = (property: any) => {
    router.push({
      pathname: '/property/[id]',
      params: {
        id: property.id,
        property: JSON.stringify(property)
      }
    });
  };

  const toggleFilter = () => {
    setIsFilterVisible(!isFilterVisible);
  };

  const selectFilter = (filter: string) => {
    if (activeFilter === filter) {
      setActiveFilter(null); // Deselect if already active
    } else {
      setActiveFilter(filter);
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <View style={styles.headerTop}>
          <View>
            <Text style={styles.greeting}>Find Your Dream</Text>
            <Text style={styles.title}>Home</Text>
          </View>
          <TouchableOpacity onPress={() => router.push('/(tabs)/profile')} style={styles.profileButton}>
            <Text style={styles.profileIcon}>👤</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.searchContainer}>
          <Text style={styles.searchIcon}>🔍</Text>
          <TextInput
            style={styles.searchInput}
            placeholder="Search buildings or locations..."
            placeholderTextColor="rgba(255, 255, 255, 0.6)"
            value={searchQuery}
            onChangeText={setSearchQuery}
          />
        </View>

        <TouchableOpacity style={styles.filterButton} onPress={toggleFilter}>
          <Text style={styles.filterIcon}>⚙️</Text>
          <Text style={styles.filterText}>Filters</Text>
        </TouchableOpacity>

        {isFilterVisible && (
          <View style={styles.filterOptionsContainer}>
            {['Place', 'Villa', 'Type', 'Bedroom'].map((filter) => (
              <TouchableOpacity
                key={filter}
                style={[
                  styles.filterOption,
                  activeFilter === filter && styles.filterOptionActive
                ]}
                onPress={() => selectFilter(filter)}
              >
                <Text style={[
                  styles.filterOptionText,
                  activeFilter === filter && styles.filterOptionTextActive
                ]}>
                  {filter}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        )}
      </View>

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.propertiesContainer}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
        showsVerticalScrollIndicator={false}
      >
        {loading && properties.length === 0 ? (
          <Text style={styles.loadingText}>Loading properties...</Text>
        ) : filteredProperties.length === 0 ? (
          <Text style={styles.emptyText}>
            {searchQuery ? 'No properties match your search' : 'No properties available'}
          </Text>
        ) : (
          filteredProperties.map((property) => (
            <PropertyCard
              key={property.id}
              id={property.id}
              name={property.name}
              location={property.location}
              price={property.price}
              image={property.image}
              bedrooms={property.bedrooms}
              area={property.area}
              onPress={() => handlePropertyPress(property)}
            />
          ))
        )}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0a0a0a',
  },
  header: {
    paddingTop: 60,
    paddingHorizontal: 20,
    paddingBottom: 30,
    backgroundColor: 'transparent',
  },
  headerTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 25,
  },
  greeting: {
    fontSize: 16,
    color: 'rgba(255, 255, 255, 0.9)',
  },
  title: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#fff',
  },
  profileButton: {
    width: 45,
    height: 45,
    borderRadius: 22.5,
    backgroundColor: 'rgba(255, 255, 255, 0.3)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  profileIcon: {
    fontSize: 24,
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.25)',
    borderRadius: 15,
    paddingHorizontal: 15,
    paddingVertical: 12,
    marginBottom: 15,
  },
  searchIcon: {
    fontSize: 18,
    marginRight: 10,
  },
  searchInput: {
    flex: 1,
    fontSize: 16,
    color: '#fff',
  },
  filterButton: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'flex-start',
    backgroundColor: 'rgba(255, 255, 255, 0.25)',
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 12,
    gap: 8,
  },
  filterIcon: {
    fontSize: 16,
  },
  filterText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '600',
  },
  filterOptionsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
    marginTop: 15,
  },
  filterOption: {
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.2)',
  },
  filterOptionActive: {
    backgroundColor: '#667eea',
    borderColor: '#667eea',
  },
  filterOptionText: {
    color: 'rgba(255, 255, 255, 0.8)',
    fontSize: 14,
  },
  filterOptionTextActive: {
    color: '#fff',
    fontWeight: 'bold',
  },
  scrollView: {
    flex: 1,
    marginBottom: 110, // Space for floating tab bar
  },
  propertiesContainer: {
    padding: 20,
    paddingBottom: 20,
  },
  loadingText: {
    textAlign: 'center',
    color: '#666',
    fontSize: 16,
    marginTop: 40,
  },
  emptyText: {
    textAlign: 'center',
    color: '#999',
    fontSize: 16,
    marginTop: 40,
  },
});
