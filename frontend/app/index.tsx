import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, TouchableOpacity, Image, StyleSheet, Alert, ActivityIndicator, ScrollView, Platform } from 'react-native';
import { useRouter } from 'expo-router';
import * as ImagePicker from 'expo-image-picker';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { Colors } from '@/constants/theme';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';

const API_URL = 'http://192.168.1.11:8000/api'; // Use local IP for physical device/emulator

export default function LoginScreen() {
  const router = useRouter();
  const colorScheme = useColorScheme();
  const theme = Colors[colorScheme ?? 'light'];

  const [step, setStep] = useState<'email' | 'login' | 'signup'>('email');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [contactNumber, setContactNumber] = useState('');
  const [profilePic, setProfilePic] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    checkUser();
  }, []);

  const checkUser = async () => {
    try {
      const user = await AsyncStorage.getItem('user');
      if (user) {
        router.replace('/(tabs)');
      }
    } catch (e) {
      console.error(e);
    }
  };

  const handleCheckEmail = async () => {
    if (!email) return Alert.alert('Error', 'Please enter an email');
    setLoading(true);
    try {
      const response = await fetch(`${API_URL}/check-email/`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      });
      const data = await response.json();
      if (response.ok) {
        if (data.exists) {
          setStep('login');
        } else {
          setStep('signup');
        }
      } else {
        Alert.alert('Error', data.error || 'Something went wrong');
      }
    } catch (error) {
      Alert.alert('Error', 'Failed to connect to server');
    } finally {
      setLoading(false);
    }
  };

  const handleLogin = async () => {
    if (!password) return Alert.alert('Error', 'Please enter password');
    setLoading(true);
    try {
      const response = await fetch(`${API_URL}/login/`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });
      const data = await response.json();
      if (response.ok) {
        await AsyncStorage.setItem('user', JSON.stringify(data.user));
        router.replace('/(tabs)');
      } else {
        Alert.alert('Login Failed', data.error);
      }
    } catch (error) {
      Alert.alert('Error', 'Failed to connect');
    } finally {
      setLoading(false);
    }
  };

  const handleSignup = async () => {
    if (!password || !contactNumber) return Alert.alert('Error', 'Please fill all fields');
    setLoading(true);

    const formData = new FormData();
    formData.append('email', email);
    formData.append('password', password);
    formData.append('contact_number', contactNumber);

    if (profilePic) {
      const uri = profilePic;
      const uriParts = uri.split('.');
      const fileType = uriParts[uriParts.length - 1];

      // @ts-ignore
      formData.append('profile_pic', {
        uri: uri,
        name: `photo.${fileType}`,
        type: `image/${fileType}`,
      });
    }

    try {
      const response = await fetch(`${API_URL}/signup/`, {
        method: 'POST',
        body: formData, // FormData handles headers
      });
      const data = await response.json();
      if (response.ok) {
        await AsyncStorage.setItem('user', JSON.stringify(data.user));
        router.replace('/(tabs)');
      } else {
        Alert.alert('Signup Failed', data.error);
      }
    } catch (error) {
      Alert.alert('Error', 'Failed to connect');
    } finally {
      setLoading(false);
    }
  };

  const pickImage = async () => {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.5,
    });

    if (!result.canceled) {
      setProfilePic(result.assets[0].uri);
    }
  };

  return (
    <ThemedView style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <ThemedText type="title" style={styles.title}>
          {step === 'email' ? 'Welcome' : step === 'login' ? 'Welcome Back' : 'Create Account'}
        </ThemedText>

        {step === 'email' && (
          <View style={styles.form}>
            <TextInput
              style={[styles.input, { color: theme.text, borderColor: theme.icon }]}
              placeholder="Email"
              placeholderTextColor={theme.icon}
              value={email}
              onChangeText={setEmail}
              autoCapitalize="none"
              keyboardType="email-address"
            />
            <TouchableOpacity style={[styles.button, { backgroundColor: theme.tint }]} onPress={handleCheckEmail} disabled={loading}>
              {loading ? <ActivityIndicator color="#fff" /> : <Text style={styles.buttonText}>Continue</Text>}
            </TouchableOpacity>
          </View>
        )}

        {step === 'login' && (
          <View style={styles.form}>
            <TextInput
              style={[styles.input, { color: theme.text, borderColor: theme.icon }]}
              placeholder="Password"
              placeholderTextColor={theme.icon}
              value={password}
              onChangeText={setPassword}
              secureTextEntry
            />
            <TouchableOpacity style={[styles.button, { backgroundColor: theme.tint }]} onPress={handleLogin} disabled={loading}>
              {loading ? <ActivityIndicator color="#fff" /> : <Text style={styles.buttonText}>Login</Text>}
            </TouchableOpacity>
            <TouchableOpacity onPress={() => setStep('email')}>
              <ThemedText style={styles.link}>Change Email</ThemedText>
            </TouchableOpacity>
          </View>
        )}

        {step === 'signup' && (
          <View style={styles.form}>
            <TouchableOpacity onPress={pickImage} style={styles.imagePicker}>
              {profilePic ? (
                <Image source={{ uri: profilePic }} style={styles.profileImage} />
              ) : (
                <View style={[styles.placeholderImage, { borderColor: theme.icon }]}>
                  <ThemedText>Add Photo (Optional)</ThemedText>
                </View>
              )}
            </TouchableOpacity>

            <TextInput
              style={[styles.input, { color: theme.text, borderColor: theme.icon }]}
              placeholder="Password"
              placeholderTextColor={theme.icon}
              value={password}
              onChangeText={setPassword}
              secureTextEntry
            />
            <TextInput
              style={[styles.input, { color: theme.text, borderColor: theme.icon }]}
              placeholder="Contact Number"
              placeholderTextColor={theme.icon}
              value={contactNumber}
              onChangeText={setContactNumber}
              keyboardType="phone-pad"
            />
            <TouchableOpacity style={[styles.button, { backgroundColor: theme.tint }]} onPress={handleSignup} disabled={loading}>
              {loading ? <ActivityIndicator color="#fff" /> : <Text style={styles.buttonText}>Sign Up</Text>}
            </TouchableOpacity>
            <TouchableOpacity onPress={() => setStep('email')}>
              <ThemedText style={styles.link}>Change Email</ThemedText>
            </TouchableOpacity>
          </View>
        )}
      </ScrollView>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    padding: 20,
  },
  scrollContent: {
    flexGrow: 1,
    justifyContent: 'center',
  },
  title: {
    textAlign: 'center',
    marginBottom: 40,
  },
  form: {
    gap: 15,
  },
  input: {
    height: 50,
    borderWidth: 1,
    borderRadius: 8,
    paddingHorizontal: 15,
    fontSize: 16,
  },
  button: {
    height: 50,
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 10,
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  link: {
    textAlign: 'center',
    marginTop: 15,
    textDecorationLine: 'underline',
  },
  imagePicker: {
    alignSelf: 'center',
    marginBottom: 20,
  },
  profileImage: {
    width: 100,
    height: 100,
    borderRadius: 50,
  },
  placeholderImage: {
    width: 100,
    height: 100,
    borderRadius: 50,
    borderWidth: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
});
