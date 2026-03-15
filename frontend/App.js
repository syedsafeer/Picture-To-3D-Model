import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import CameraUploadScreen from './src/screens/CameraUploadScreen';
import ModelViewerScreen from './src/screens/ModelViewerScreen';

const Stack = createNativeStackNavigator();

export default function App() {
  return (
    <NavigationContainer>
      <Stack.Navigator initialRouteName="Camera">
        <Stack.Screen name="Camera" component={CameraUploadScreen} options={{ title: 'Capture Object' }} />
        <Stack.Screen name="Viewer" component={ModelViewerScreen} options={{ title: '3D Model' }} />
      </Stack.Navigator>
    </NavigationContainer>
  );
}