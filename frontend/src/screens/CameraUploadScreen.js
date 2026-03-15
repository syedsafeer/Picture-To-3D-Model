import React, { useState, useEffect, useRef } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Alert, ScrollView, Image, ActivityIndicator, Modal, Platform } from 'react-native';
import { CameraView, useCameraPermissions } from 'expo-camera';

export default function CameraUploadScreen({ navigation }) {
  const [permission, requestPermission] = useCameraPermissions();
  const [images, setImages] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const cameraRef = useRef(null);

  useEffect(() => {
    if (permission && !permission.granted) requestPermission();
  }, [permission]);

  const takePicture = async () => {
    if (cameraRef.current) {
      try {
        const photo = await cameraRef.current.takePictureAsync({ quality: 0.5 });
        setImages([...images, photo.uri]);
      } catch (e) { Alert.alert("Error", "Photo capture fail."); }
    }
  };

  const uploadImages = async () => {
    if (images.length === 0) return;
    setIsLoading(true);

    const formData = new FormData();
    try {
      for (let i = 0; i < images.length; i++) {
        const filename = `photo_${i}.jpg`;
        if (Platform.OS === 'web') {
          const res = await fetch(images[i]);
          const blob = await res.blob();
          formData.append('images', blob, filename);
        } else {
          formData.append('images', { uri: images[i], name: filename, type: 'image/jpeg' });
        }
      }

      // FIXED: Headers mein Content-Type nahi likhna
      const response = await fetch('http://127.0.0.1:8000/api/3d/upload/', {
        method: 'POST',
        body: formData,
      });

      const data = await response.json();
      if (response.ok) {
        setIsLoading(false);
        setImages([]);
        navigation.navigate('ModelViewerScreen', { modelUrl: data.model_url });
      } else {
        setIsLoading(false);
        Alert.alert("Server Error", data.error || "Upload fail.");
      }
    } catch (e) {
      setIsLoading(false);
      Alert.alert("Network Error", "Check your Server IP/Connection.");
    }
  };

  if (!permission || !permission.granted) {
    return (
      <View style={styles.center}>
        <Text style={{color: 'white', marginBottom: 20}}>Camera Permission Required</Text>
        <TouchableOpacity onPress={requestPermission} style={styles.uploadBtn}>
          <Text style={styles.btnText}>Allow Camera</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <CameraView style={styles.camera} ref={cameraRef} facing="back" />

      <View style={styles.galleryContainer}>
        <ScrollView horizontal>
          {images.map((img, i) => (<Image key={i} source={{ uri: img }} style={styles.thumbnail} />))}
        </ScrollView>
      </View>

      <View style={styles.controls}>
        <TouchableOpacity style={styles.captureBtn} onPress={takePicture}>
          <Text style={styles.btnText}>📷 CLICK</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.uploadBtn, images.length === 0 && styles.disabledBtn]}
          onPress={uploadImages}
          disabled={images.length === 0}
        >
          <Text style={styles.btnText}>✨ CREATE 3D</Text>
        </TouchableOpacity>
      </View>

      {/* Loading Screen Overlay */}
      <Modal transparent visible={isLoading}>
        <View style={styles.loadingOverlay}>
          <View style={styles.loadingBox}>
            <ActivityIndicator size="large" color="#4CAF50" />
            <Text style={styles.loadingTitle}> Creating 3D Model...</Text>
            <Text style={styles.loadingWait}>(Please Wait, 1-2 Minutes)</Text>
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: 'black' },
  camera: { flex: 4 },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: 'black' },
  galleryContainer: { flex: 1, backgroundColor: '#1a1a1a', padding: 10 },
  thumbnail: { width: 70, height: 70, marginRight: 10, borderRadius: 10, borderWidth: 1, borderColor: 'white' },
  controls: { flex: 1, flexDirection: 'row', justifyContent: 'space-around', alignItems: 'center', paddingBottom: 20 },
  captureBtn: { backgroundColor: '#2196F3', padding: 20, borderRadius: 15, width: '40%', alignItems: 'center' },
  uploadBtn: { backgroundColor: '#4CAF50', padding: 20, borderRadius: 15, width: '45%', alignItems: 'center' },
  disabledBtn: { backgroundColor: '#555' },
  btnText: { color: 'white', fontWeight: 'bold', fontSize: 16 },
  loadingOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.85)', justifyContent: 'center', alignItems: 'center' },
  loadingBox: { width: '85%', backgroundColor: '#222', padding: 30, borderRadius: 20, alignItems: 'center', borderWidth: 1, borderColor: '#4CAF50' },
  loadingTitle: { color: 'white', fontSize: 18, fontWeight: 'bold', marginTop: 20 },
  loadingWait: { color: '#4CAF50', fontSize: 14, marginTop: 10 }
});