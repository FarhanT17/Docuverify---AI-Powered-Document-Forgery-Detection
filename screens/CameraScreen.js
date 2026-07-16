import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Image,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';
import axios from 'axios';
import { API_CONFIG } from './appconfig';

export default function CameraScreen({ navigation }) {
  const [imageUri, setImageUri] = useState(null);
  const [loading, setLoading] = useState(false);

  // ✅ Use the API URL from config
  const API_URL = `${API_CONFIG.baseUrl}${API_CONFIG.endpoints.verify}`;

  useEffect(() => {
    (async () => {
      const cam = await ImagePicker.requestCameraPermissionsAsync();
      const media = await ImagePicker.requestMediaLibraryPermissionsAsync();

      if (cam.status !== 'granted') {
        Alert.alert('Camera permission not granted');
      }

      if (media.status !== 'granted') {
        Alert.alert('Media library permission not granted');
      }
    })();
  }, []);

  // Reset image when screen is focused
  useEffect(() => {
    const unsubscribe = navigation.addListener('focus', () => {
      setImageUri(null);
      setLoading(false);
    });

    return unsubscribe;
  }, [navigation]);

  const selectImage = async () => {
    const result = await ImagePicker.launchImageLibraryAsync({
      // ✅ FIXED: MediaTypeOptions → MediaType
      mediaTypes: ImagePicker.MediaType.Images,
      quality: 1,
    });

    if (!result.canceled) {
      const uri = result.assets[0].uri;
      setImageUri(uri);
      uploadImage(uri);
    }
  };

  const takePhoto = async () => {
    try {
      const permission = await ImagePicker.requestCameraPermissionsAsync();

      if (!permission.granted) {
        Alert.alert('Camera permission denied');
        return;
      }

      const result = await ImagePicker.launchCameraAsync({
        // ✅ FIXED: MediaTypeOptions → MediaType
        mediaTypes: ImagePicker.MediaType.Images,
        quality: 1,
      });

      if (!result.canceled) {
        const uri = result.assets[0].uri;
        setImageUri(uri);
        uploadImage(uri);
      }
    } catch (err) {
      console.log(err);
      Alert.alert('Camera Error', 'Failed to take photo');
    }
  };

  const uploadImage = async (uri) => {
    setLoading(true);

    const formData = new FormData();
    formData.append('file', {
      uri: uri,
      type: 'image/jpeg',
      name: 'verification_document.jpg',
    });

    try {
      console.log('📤 Sending to:', API_URL);
      
      const response = await axios.post(API_URL, formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
          'Accept': 'application/json',
        },
        timeout: API_CONFIG.timeout || 30000,
      });

      console.log('📥 Response:', response.data);

      const result = response.data;

      if (result.success) {
        navigation.navigate('Result', { 
          result: result, 
          imageUri: uri 
        });
      } else {
        Alert.alert(
          'Verification Failed',
          result.message || 'Unable to verify this document. Please try again.'
        );
      }
    } catch (error) {
      console.error('❌ Upload error:', error);
      
      let errorMessage = 'Unable to verify this document. Please try again.';
      
      if (error.response) {
        errorMessage = error.response.data?.detail || error.response.data?.message || errorMessage;
      } else if (error.request) {
        errorMessage = 'Cannot connect to server. Please check your connection.';
      } else {
        errorMessage = error.message || errorMessage;
      }
      
      Alert.alert(
        'Verification Failed',
        errorMessage
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <LinearGradient
        colors={['#667eea', '#764ba2']}
        style={styles.headerGradient}
      >
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => navigation.goBack()}
        >
          <Ionicons name="arrow-back" size={24} color="#fff" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Verify Document</Text>
        <View style={{ width: 40 }} />
      </LinearGradient>

      <View style={styles.content}>
        {imageUri && (
          <View style={styles.imageContainer}>
            <Image source={{ uri: imageUri }} style={styles.image} />
          </View>
        )}

        {loading && (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color="#667eea" />
            <Text style={styles.loadingText}>
              Checking document authenticity...
            </Text>
          </View>
        )}

        <View style={styles.buttonContainer}>
          <TouchableOpacity style={styles.button} onPress={takePhoto}>
            <LinearGradient
              colors={['#667eea', '#764ba2']}
              style={styles.gradientButton}
            >
              <Ionicons name="camera" size={24} color="#fff" />
              <Text style={styles.buttonText}>Capture Document</Text>
            </LinearGradient>
          </TouchableOpacity>

          <TouchableOpacity style={styles.button} onPress={selectImage}>
            <LinearGradient
              colors={['#f093fb', '#f5576c']}
              style={styles.gradientButton}
            >
              <Ionicons name="images" size={24} color="#fff" />
              <Text style={styles.buttonText}>Upload Document</Text>
            </LinearGradient>
          </TouchableOpacity>
        </View>

        <View style={styles.tipsContainer}>
          <Text style={styles.tipsTitle}>📄 Tips for Accurate Verification</Text>
          <Text style={styles.tipItem}>• Place the document on a flat surface</Text>
          <Text style={styles.tipItem}>• Avoid shadows and reflections</Text>
          <Text style={styles.tipItem}>• Make sure all text is visible</Text>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8f9fa',
  },
  headerGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingTop: 50,
    paddingBottom: 20,
    paddingHorizontal: 20,
  },
  backButton: {
    padding: 8,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#fff',
  },
  content: {
    flex: 1,
    padding: 20,
  },
  imageContainer: {
    alignItems: 'center',
    marginVertical: 20,
  },
  image: {
    width: 300,
    height: 350,
    borderRadius: 15,
    borderWidth: 2,
    borderColor: '#ddd',
  },
  loadingContainer: {
    alignItems: 'center',
    marginVertical: 20,
  },
  loadingText: {
    marginTop: 10,
    fontSize: 16,
    color: '#667eea',
    fontWeight: '600',
  },
  buttonContainer: {
    marginVertical: 20,
    gap: 12,
  },
  button: {
    borderRadius: 12,
    overflow: 'hidden',
  },
  gradientButton: {
    flexDirection: 'row',
    padding: 16,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 10,
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  tipsContainer: {
    backgroundColor: '#fff',
    borderRadius: 15,
    padding: 18,
    marginTop: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 10,
    elevation: 3,
  },
  tipsTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 10,
  },
  tipItem: {
    fontSize: 14,
    color: '#666',
    marginVertical: 3,
  },
});