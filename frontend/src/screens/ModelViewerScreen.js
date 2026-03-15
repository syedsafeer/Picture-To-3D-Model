import React from 'react';
import { View, StyleSheet, Platform, Text, TouchableOpacity, Linking } from 'react-native';

export default function ViewerScreen({ route }) {
  // Navigation se Model ka link hasil karna
  const { modelUrl } = route.params || {};

  // Agar link nahi mila, toh Error dikhaye
  if (!modelUrl) {
    return (
      <View style={styles.center}>
        <Text style={{color: 'red', fontSize: 20}}>❌ Error: Model URL nahi mila!</Text>
        <Text style={{color: '#aaa', marginTop: 10}}>Dobara photo upload karein.</Text>
      </View>
    );
  }

  // Three.js Code (Jo 3D file ko chalayega)
  const htmlContent = `
    <!DOCTYPE html>
    <html lang="en">
      <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <style>
          body { margin: 0; overflow: hidden; background-color: #121212; color: white; font-family: sans-serif; }
          #info { position: absolute; top: 10px; width: 100%; text-align: center; z-index: 100; pointer-events: none; font-weight: bold; text-shadow: 1px 1px 2px black; }
          canvas { display: block; width: 100vw; height: 100vh; }
        </style>
        <script src="https://unpkg.com/three@0.128.0/build/three.min.js"></script>
        <script src="https://unpkg.com/three@0.128.0/examples/js/controls/OrbitControls.js"></script>
        <script src="https://unpkg.com/three@0.128.0/examples/js/loaders/OBJLoader.js"></script>
      </head>
      <body>
        <div id="info">⏳ Loading Model... (Sabar karein)</div>
        <script>
          let scene, camera, renderer, controls;

          function init() {
            // 1. Scene
            scene = new THREE.Scene();
            scene.background = new THREE.Color(0x222222); // Dark Grey Background

            // 2. Camera
            camera = new THREE.PerspectiveCamera(45, window.innerWidth / window.innerHeight, 0.1, 1000);
            camera.position.set(0, 1.5, 4);

            // 3. Renderer
            renderer = new THREE.WebGLRenderer({ antialias: true });
            renderer.setSize(window.innerWidth, window.innerHeight);
            document.body.appendChild(renderer.domElement);

            // 4. Lights
            const ambLight = new THREE.AmbientLight(0xffffff, 0.8);
            scene.add(ambLight);
            const dirLight = new THREE.DirectionalLight(0xffffff, 0.6);
            dirLight.position.set(5, 10, 7);
            scene.add(dirLight);

            // 5. Controls (Mouse se ghumana)
            controls = new THREE.OrbitControls(camera, renderer.domElement);

            // 6. OBJ Loader
            const loader = new THREE.OBJLoader();
            console.log("Loading:", "${modelUrl}");

            loader.load(
              "${modelUrl}",
              function (object) {
                document.getElementById('info').innerText = "✅ Model Loaded! (Mouse se ghumayen)";
                document.getElementById('info').style.color = "#4CAF50";

                // Auto-Center & Resize
                const box = new THREE.Box3().setFromObject(object);
                const center = box.getCenter(new THREE.Vector3());
                object.position.sub(center);

                const size = box.getSize(new THREE.Vector3());
                const maxDim = Math.max(size.x, size.y, size.z);
                const scale = 2.5 / maxDim;
                object.scale.set(scale, scale, scale);

                scene.add(object);
              },
              function (xhr) {
                const percent = Math.round((xhr.loaded / xhr.total * 100));
                document.getElementById('info').innerText = "⏳ Loading: " + percent + "%";
              },
              function (error) {
                console.error(error);
                document.getElementById('info').innerText = "❌ Load Failed! Console dekhein.";
                document.getElementById('info').style.color = "red";
              }
            );

            // Animation Loop
            function animate() {
              requestAnimationFrame(animate);
              controls.update();
              renderer.render(scene, camera);
            }
            animate();

            window.addEventListener('resize', function() {
              camera.aspect = window.innerWidth / window.innerHeight;
              camera.updateProjectionMatrix();
              renderer.setSize(window.innerWidth, window.innerHeight);
            });
          }
          init();
        </script>
      </body>
    </html>
  `;

  return (
    <View style={styles.container}>
      <Text style={styles.header}>✨ Final 3D Viewer ✨</Text>

      <View style={styles.viewerContainer}>
        {Platform.OS === 'web' ? (
          <iframe
            srcDoc={htmlContent}
            style={{ width: '100%', height: '100%', border: 'none', backgroundColor: '#222' }}
            title="3D Viewer"
          />
        ) : (
          <Text style={{color:'white'}}>Mobile View ke liye WebView lagana hoga.</Text>
        )}
      </View>

      <TouchableOpacity onPress={() => Linking.openURL(modelUrl)} style={styles.btn}>
        <Text style={styles.btnText}>Download .obj File</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#121212', paddingBottom: 20 },
  header: { color: '#4CAF50', fontSize: 22, fontWeight: 'bold', textAlign: 'center', marginVertical: 15 },
  viewerContainer: { flex: 1, backgroundColor: '#222', marginHorizontal: 10, borderRadius: 10, overflow: 'hidden', borderWidth: 1, borderColor: '#333' },
  btn: { backgroundColor: '#4CAF50', padding: 15, margin: 20, borderRadius: 8, alignItems: 'center' },
  btnText: { color: 'white', fontWeight: 'bold' },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#121212' }
});