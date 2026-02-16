import React, { useState } from 'react';
import { View, Text, StyleSheet, ActivityIndicator } from 'react-native';
import { WebView } from 'react-native-webview';

interface ThreeDViewerProps {
  visible: boolean;
  onClose: () => void;
  modelUrl: string | null;
  propertyName: string;
}

export default function ThreeDViewer({ visible, onClose, modelUrl, propertyName }: ThreeDViewerProps) {
  const [loading, setLoading] = useState(true);

  if (!modelUrl) {
    return (
      <View style={styles.placeholder}>
        <Text style={styles.placeholderIcon}>🏗️</Text>
        <Text style={styles.placeholderText}>No 3D model available</Text>
      </View>
    );
  }

  const htmlContent = `
    <!DOCTYPE html>
    <html>
    <head>
      <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no" />
      <style>
        * { margin: 0; padding: 0; box-sizing: border-box; }
        body { background: #0a0a0a; overflow: hidden; }
        #container { width: 100vw; height: 100vh; }
        #loading {
          position: absolute; top: 50%; left: 50%;
          transform: translate(-50%, -50%);
          color: white; font-size: 16px; text-align: center;
          font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif;
        }
        .spinner {
          border: 3px solid rgba(255,255,255,0.1);
          border-top: 3px solid #667eea;
          border-radius: 50%; width: 40px; height: 40px;
          animation: spin 1s linear infinite;
          margin: 0 auto 16px;
        }
        @keyframes spin { to { transform: rotate(360deg); } }
        .controls {
          position: absolute; bottom: 20px; left: 50%;
          transform: translateX(-50%);
          background: rgba(0,0,0,0.6); backdrop-filter: blur(10px);
          padding: 8px 16px; border-radius: 20px;
          color: rgba(255,255,255,0.8); font-size: 11px;
          border: 1px solid rgba(255,255,255,0.1);
          font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif;
          white-space: nowrap;
          pointer-events: none;
        }
        #error { display: none; position: absolute; top: 50%; left: 50%;
          transform: translate(-50%, -50%); color: #ff6b6b;
          text-align: center; font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif; }
      </style>
      <script type="importmap">
        {
          "imports": {
            "three": "https://unpkg.com/three@0.160.0/build/three.module.js",
            "three/addons/": "https://unpkg.com/three@0.160.0/examples/jsm/"
          }
        }
      </script>
    </head>
    <body>
      <div id="container"></div>
      <div id="loading"><div class="spinner"></div>Loading 3D Model...</div>
      <div class="controls">🔄 Drag to rotate · 🔍 Pinch to zoom</div>
      <div id="error"><div style="font-size:48px;margin-bottom:12px">❌</div>Failed to load 3D model</div>

      <script type="module">
        import * as THREE from 'three';
        import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';
        import { OrbitControls } from 'three/addons/controls/OrbitControls.js';

        // Helper to log back to React Native
        function log(msg) {
          window.ReactNativeWebView.postMessage(JSON.stringify({ type: 'log', message: msg }));
        }
        function errorLog(msg) {
          window.ReactNativeWebView.postMessage(JSON.stringify({ type: 'error', message: msg }));
        }

        let scene, camera, renderer, controls;

        function init() {
          log('Initializing 3D scene...');
          try {
            scene = new THREE.Scene();
            scene.background = new THREE.Color(0x0a0a0a);
            
            camera = new THREE.PerspectiveCamera(45, window.innerWidth / window.innerHeight, 0.1, 1000);
            camera.position.set(0, 2, 5);

            renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
            renderer.setSize(window.innerWidth, window.innerHeight);
            renderer.setPixelRatio(window.devicePixelRatio);
            renderer.toneMapping = THREE.ACESFilmicToneMapping;
            renderer.toneMappingExposure = 1.2;
            document.getElementById('container').appendChild(renderer.domElement);

            const ambientLight = new THREE.AmbientLight(0xffffff, 1.0);
            scene.add(ambientLight);
            
            const mainLight = new THREE.DirectionalLight(0xffffff, 1.5);
            mainLight.position.set(5, 10, 7.5);
            scene.add(mainLight);

            const fillLight = new THREE.DirectionalLight(0x667eea, 0.8);
            fillLight.position.set(-5, 5, -5);
            scene.add(fillLight);

            controls = new OrbitControls(camera, renderer.domElement);
            controls.enableDamping = true;
            controls.dampingFactor = 0.05;
            controls.autoRotate = true;
            controls.autoRotateSpeed = 0.5;

            log('Loading model from: ' + '${modelUrl}');
            const loader = new GLTFLoader();
            loader.load(
              '${modelUrl}',
              (gltf) => {
                log('Model loaded successfully');
                const model = gltf.scene;
                
                // Center and scale model
                const box = new THREE.Box3().setFromObject(model);
                const center = box.getCenter(new THREE.Vector3());
                const size = box.getSize(new THREE.Vector3());
                
                const maxDim = Math.max(size.x, size.y, size.z);
                const scale = 3.5 / maxDim;
                model.scale.setScalar(scale);
                model.position.sub(center.multiplyScalar(scale));
                
                scene.add(model);
                document.getElementById('loading').style.display = 'none';
              },
              (xhr) => {
                if (xhr.total) {
                  const percent = Math.round((xhr.loaded / xhr.total) * 100);
                  document.getElementById('loading').innerHTML =
                    '<div class="spinner"></div>Loading... ' + percent + '%';
                }
              },
              (error) => {
                errorLog('Error loading model: ' + error.message);
                console.error('Error loading model:', error);
                document.getElementById('loading').style.display = 'none';
                document.getElementById('error').style.display = 'block';
              }
            );

            window.addEventListener('resize', onWindowResize);
            animate();
          } catch (e) {
            errorLog('Init error: ' + e.message);
            console.error('Init error:', e);
            document.getElementById('loading').style.display = 'none';
            document.getElementById('error').style.display = 'block';
          }
        }

        function onWindowResize() {
          camera.aspect = window.innerWidth / window.innerHeight;
          camera.updateProjectionMatrix();
          renderer.setSize(window.innerWidth, window.innerHeight);
        }

        function animate() {
          requestAnimationFrame(animate);
          if (controls) controls.update();
          if (renderer && scene && camera) renderer.render(scene, camera);
        }

        init();
      </script>
    </body>
    </html>
    `;

  return (
    <View style={styles.container}>
      <WebView
        source={{ html: htmlContent }}
        style={styles.webview}
        onLoadStart={() => setLoading(true)}
        onLoadEnd={() => setLoading(false)}
        originWhitelist={['*']}
        javaScriptEnabled={true}
        domStorageEnabled={true}
        allowFileAccess={true}
        mixedContentMode="always"
        onMessage={(event) => {
          try {
            const data = JSON.parse(event.nativeEvent.data);
            if (data.type === 'log') {
              console.log('[WebView Log]', data.message);
            } else if (data.type === 'error') {
              console.error('[WebView Error]', data.message);
            }
          } catch (e) {
            console.log('[WebView Message]', event.nativeEvent.data);
          }
        }}
        onError={() => setLoading(false)}
      />
      {loading && (
        <View style={styles.loadingOverlay}>
          <ActivityIndicator size="large" color="#667eea" />
          <Text style={styles.loadingText}>Loading 3D Viewer...</Text>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0a0a0a',
  },
  webview: {
    flex: 1,
    backgroundColor: 'transparent',
  },
  loadingOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(10, 10, 10, 0.9)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 12,
    fontSize: 14,
    color: 'rgba(255, 255, 255, 0.7)',
  },
  placeholder: {
    flex: 1,
    backgroundColor: '#0a0a0a',
    justifyContent: 'center',
    alignItems: 'center',
  },
  placeholderIcon: {
    fontSize: 60,
    marginBottom: 16,
  },
  placeholderText: {
    fontSize: 16,
    color: 'rgba(255, 255, 255, 0.5)',
  },
});
