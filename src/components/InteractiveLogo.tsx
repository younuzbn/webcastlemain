"use client";

import { useEffect, useRef, useState } from 'react';
import * as THREE from 'three';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

// Register GSAP plugins
if (typeof window !== 'undefined') {
  gsap.registerPlugin(ScrollTrigger);
}

const InteractiveLogo = () => {
  const containerRef = useRef<HTMLDivElement>(null);
  const observerRef = useRef<HTMLDivElement>(null);
  const sceneRef = useRef<THREE.Scene | null>(null);
  const cameraRef = useRef<THREE.PerspectiveCamera | null>(null);
  const rendererRef = useRef<THREE.WebGLRenderer | null>(null);
  const particleSystemRef = useRef<THREE.Points | null>(null);
  const circlesRef = useRef<THREE.Group | null>(null);
  const originalPositionsRef = useRef<Float32Array | null>(null);
  const bulbPositionsRef = useRef<Float32Array | null>(null);
  const scatterDirectionsRef = useRef<Array<{ x: number; y: number; z: number }>>([]);
  const mouseRef = useRef<THREE.Vector2>(new THREE.Vector2());
  const mouseSphereRef = useRef<THREE.Sphere>(new THREE.Sphere(new THREE.Vector3(0, 0, 0), 50));
  const isMouseActiveRef = useRef<boolean>(false);
  const isScatteringRef = useRef<boolean>(false);
  const scatterForceRef = useRef<number>(0);
  const lastScrollTimeRef = useRef<number>(0);
  const animationFrameRef = useRef<number>(0);
  const shouldReformRef = useRef<boolean>(true);
  const currentScrollPositionRef = useRef<number>(0);
  const inSection2Ref = useRef<boolean>(false);
  const cameraAnimationRef = useRef<gsap.core.Tween | null>(null);
  const [ellipseShadowOpacity, setEllipseShadowOpacity] = useState(1); // State for ellipse shadow opacity
  const [scrollData, setScrollData] = useState({
    progress: 0,
    section: 1,
    cameraX: 0,
    cameraY: 0,
    cameraZ: 0,
    scatterForce: 0
  });

  // Store camera position states for each section
  const section1Camera = { x: -180, y: 20, z: 270 };
  const section2Camera = { x: 0, y: 0, z: 470 };

  useEffect(() => {
    if (!containerRef.current) return;

    // Three.js setup
    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 2000);
    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    
    sceneRef.current = scene;
    cameraRef.current = camera;
    rendererRef.current = renderer;

    renderer.setSize(window.innerWidth, window.innerHeight);
    // Make renderer transparent to show background
    renderer.setClearColor(0x000000, 0);
    containerRef.current.appendChild(renderer.domElement);

    // Position camera initially for section 1
    camera.position.z = section1Camera.z;
    camera.position.y = section1Camera.y;
    camera.position.x = section1Camera.x;
    camera.far = 3000; // Increase camera far plane to see more distant objects
    camera.updateProjectionMatrix();
    
    // Create first logo SVG paths in offscreen canvas to sample points
    const logoPaths = [
      'M130.58 39.0756L155.967 0.68457H50.1982V77.1184H155.967L130.58 39.0756Z',
      'M38.47 0.722656H0.388184V216.053C0.581687 229.521 4.02635 242.718 10.3733 254.599C16.7202 266.48 25.776 276.659 36.8444 284.36C51.1249 294.229 68.0373 299.57 85.3752 299.647C100.855 299.57 116.026 295.428 129.339 287.611C147.838 276.31 161.267 258.43 166.995 237.532C172.684 216.672 170.246 194.42 160.106 175.302C149.966 156.183 132.938 141.632 112.427 134.666C91.9543 127.661 69.5464 128.745 49.8478 137.684V184.203C54.2209 179.172 59.6389 175.147 65.6762 172.399C71.7522 169.651 78.3313 168.219 85.0266 168.219C92.1088 168.219 99.1138 169.767 105.538 172.786C109.563 174.605 113.201 177.12 116.258 180.255C122.025 185.441 126.359 192.02 128.913 199.335C131.506 206.649 132.164 214.467 130.964 222.129C129.726 229.792 126.63 236.99 121.908 243.144C117.187 249.297 110.995 254.135 103.874 257.27C96.7915 260.404 89.0129 261.72 81.3114 261.101C73.5713 260.482 66.1409 257.966 59.6392 253.709C53.1374 249.491 47.7967 243.724 44.1201 236.913C40.4436 230.102 38.47 222.478 38.47 214.738V0.722656Z'
    ];

    // Bulb SVG paths
    const bulbPaths = [
      'M169.43 301.06 168.51 303.9 143.19 303.9 142.27 301.06 169.43 301.06',
      'M185.56 283.35v5.73h0c0 1.21-.97 2.18-2.18 2.18h-2.07c-.21.01-.42.02-.64.03-.16-.02-.33-.02-.5-.02h-48.65c-.17 0-.33 0-.5.02-.21-.01-.42-.02-.63-.02h-2.08c-1.2-.01-2.17-.98-2.16-2.18v-5.74h59.41Z',
      'M126.15 267.5h59.41v6.04h-59.41z',
      'M186.89 249.78c-.67 2.59-1.08 5.25-1.24 7.92h-59.59c-.16-2.67-.58-5.33-1.25-7.92h62.08Z',
      'M41.42 156.16c0 2.7-2.19 4.9-4.9 4.9H4.9c-2.71 0-4.9-2.2-4.9-4.9s2.19-4.9 4.9-4.9h31.62c2.71 0 4.9 2.19 4.9 4.9Z',
      'M75.09 244.06l-22.36 22.36c-1.92 1.91-5.02 1.91-6.94 0-1.91-1.91-1.91-5.02 0-6.93l22.36-22.37c1.92-1.91 5.02-1.91 6.94 0 1.91 1.92 1.91 5.02 0 6.94Z',
      'M266.41 266.3c-1.94 1.89-5.04 1.84-6.93-.09l-22.36-22.37c-1.92-1.91-1.92-5.01 0-6.93s5.02-1.91 6.93 0l22.36 22.37s.07.06.1.09c1.88 1.94 1.84 5.04-.1 6.93Z',
      'M312 155.85c0 2.71-2.19 4.9-4.9 4.9h-31.63c-2.71-.01-4.89-2.19-4.89-4.9s2.19-4.9 4.9-4.9h31.62c2.71 0 4.9 2.2 4.9 4.9Z',
      'M266.21 52.52l-22.37 22.36c-1.91 1.92-5.01 1.92-6.93 0-1.91-1.91-1.92-5.01 0-6.93l22.36-22.37c1.92-1.91 5.02-1.91 6.93 0h.01c1.91 1.92 1.91 5.03 0 6.94Z',
      'M160.75 4.9v31.63c0 2.71-2.2 4.9-4.9 4.9s-4.9-2.19-4.9-4.9V4.9c0-2.7 2.19-4.9 4.9-4.9s4.9 2.2 4.9 4.9Z',
      'M74.88 75.27c-1.96 1.86-5.07 1.78-6.93-.18l-22.36-22.36c-.06-.06-.12-.11-.18-.17-1.86-1.96-1.79-5.07.18-6.93 1.96-1.87 5.06-1.79 6.92.17l22.37 22.37c.06.05.11.11.17.17 1.86 1.96 1.79 5.06-.17 6.93Z',
      'M223.78 111.81c-15.46-22.24-40.84-35.51-67.92-35.51h0c-45.69 0-82.72 37.04-82.71 82.73 0 27.09 13.26 52.46 35.51 67.92 4.96 3.39 9.1 7.84 12.14 13.03h70.12c3.04-5.19 7.19-9.63 12.15-13.03 37.51-26.07 46.79-77.62 20.72-115.14ZM213.12 134.16c-2.42 1.22-5.37.25-6.59-2.17-9.28-18.37-29.18-30.23-50.68-30.23-2.71 0-4.9-2.2-4.9-4.9h0c0-2.72 2.2-4.91 4.9-4.91 25.17 0 48.5 13.99 59.43 35.62 1.22 2.41.26 5.36-2.16 6.59Z'
    ];

    // For the logo, use the original extraction method to get exactly the same particles
    const getLogoPoints = () => {
      const offscreenCanvas = document.createElement('canvas');
      const context = offscreenCanvas.getContext('2d');
      offscreenCanvas.width = 1500;
      offscreenCanvas.height = 2000;
      
      if (!context) return [];
    
      // Fill the paths with white to sample later
      context.scale(3, 3);
      context.fillStyle = 'white';
      
      logoPaths.forEach(path => {
        const pathData = new Path2D(path);
        context.fill(pathData);
      });
      
      // Sample points from the image in a grid pattern
      const imgData = context.getImageData(0, 0, offscreenCanvas.width, offscreenCanvas.height);
      const validPoints: Array<{ x: number; y: number }> = [];
      
      const gridSpacing = 7;
      
      function randomOffset() {
        return (Math.random() - 0.5) * gridSpacing * 0.0;
      }
      
      const svgWidth = 170;
      const svgHeight = 300;
      const xOffset = svgWidth / 2;
      const yOffset = svgHeight / 2;
      
      for (let y = 0; y < offscreenCanvas.height; y += gridSpacing) {
        for (let x = 0; x < offscreenCanvas.width; x += gridSpacing) {
          const i = (y * offscreenCanvas.width + x) * 4;
          if (imgData.data[i] > 0) {
            validPoints.push({
              x: x / 3 - xOffset + randomOffset(),
              y: -y / 3 + yOffset + randomOffset()
            });
          }
        }
      }
      
      return validPoints;
    };

    // Function to extract points from SVG paths for the bulb
    const extractBulbPoints = (svgPaths: string[]) => {
      const offscreenCanvas = document.createElement('canvas');
      const context = offscreenCanvas.getContext('2d');
      offscreenCanvas.width = 1500;
      offscreenCanvas.height = 2000;
      
      if (!context) return [];
    
      // Fill the paths with white to sample later
      context.clearRect(0, 0, offscreenCanvas.width, offscreenCanvas.height);
      context.fillStyle = 'white';
      
      // Scale the canvas appropriately for the bulb
      context.resetTransform();
      context.scale(2.5, 2.5);
      context.translate(38, 85); // Further adjusted to center the bulb precisely
      
      svgPaths.forEach(path => {
        const pathData = new Path2D(path);
        context.fill(pathData);
      });
      
      // Sample points from the image in a grid pattern
      const imgData = context.getImageData(0, 0, offscreenCanvas.width, offscreenCanvas.height);
      const validPoints: Array<{ x: number; y: number }> = [];
      
      const gridSpacing = 10;
      
      const randomOffset = () => (Math.random() - 0.5) * gridSpacing * 0.0;
      
      const svgWidth = 312;
      const svgHeight = 304;
      const xOffset = svgWidth / 2;
      const yOffset = svgHeight / 2;
      
      for (let y = 0; y < offscreenCanvas.height; y += gridSpacing) {
        for (let x = 0; x < offscreenCanvas.width; x += gridSpacing) {
          const i = (y * offscreenCanvas.width + x) * 4;
          if (imgData.data[i] > 0) {
            validPoints.push({
              x: x / 3 - xOffset + randomOffset(),
              y: -y / 3 + yOffset + randomOffset()
            });
          }
        }
      }
      
      return validPoints;
    };

    // Extract points for both shapes
    const logoPoints = getLogoPoints();
    const bulbPoints = extractBulbPoints(bulbPaths);
    
    console.log(`Original logo points: ${logoPoints.length}, Bulb points: ${bulbPoints.length}`);
    
    // Create particle system using the original number of points
    const particles = new THREE.BufferGeometry();
    const positions = new Float32Array(logoPoints.length * 3);
    const colors = new Float32Array(logoPoints.length * 3);
    const originalPositions = new Float32Array(logoPoints.length * 3);
    const bulbPositions = new Float32Array(logoPoints.length * 3);
    
    // Fill both position arrays
    for (let i = 0; i < logoPoints.length; i++) {
      const logoPoint = logoPoints[i];
      
      // Initial position (logo)
      positions[i * 3] = logoPoint.x;
      positions[i * 3 + 1] = logoPoint.y;
      positions[i * 3 + 2] = 0;
      
      // Original logo positions
      originalPositions[i * 3] = logoPoint.x;
      originalPositions[i * 3 + 1] = logoPoint.y;
      originalPositions[i * 3 + 2] = 0;
      
      // Particle colors
      colors[i * 3] = 1.0;
      colors[i * 3 + 1] = 1.0;
      colors[i * 3 + 2] = 1.0;
    }
    
    // Map the bulb points to match the logo point count
    // This will either sample or duplicate bulb points as needed
    for (let i = 0; i < logoPoints.length; i++) {
      let bulbPoint;
      
      if (bulbPoints.length > 0) {
        // Map index to available bulb points
        const bulbIndex = Math.floor((i / logoPoints.length) * bulbPoints.length);
        bulbPoint = bulbPoints[Math.min(bulbIndex, bulbPoints.length - 1)];
      } else {
        bulbPoint = { x: 0, y: 0 };
      }
      
      // Bulb positions for morphing - scale and center
      bulbPositions[i * 3] = bulbPoint.x * 1.15; // Scale the bulb to match better
      bulbPositions[i * 3 + 1] = bulbPoint.y * 1.15; // Removed vertical offset for perfect centering
      bulbPositions[i * 3 + 2] = 0;
    }
    
    particles.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    particles.setAttribute('color', new THREE.BufferAttribute(colors, 3));
    
    const particleMaterial = new THREE.PointsMaterial({
      size: 1.5,
      vertexColors: true,
      transparent: true,
      opacity: 1.0,
      blending: THREE.AdditiveBlending
    });
    
    const particleSystem = new THREE.Points(particles, particleMaterial);
    scene.add(particleSystem);
    particleSystemRef.current = particleSystem;
    originalPositionsRef.current = originalPositions;
    bulbPositionsRef.current = bulbPositions;
    
    // Initialize scatter directions
    const scatterDirections = Array(logoPoints.length).fill(0).map(() => {
      const angle = Math.random() * Math.PI * 2;
      const strength = 0.5 + Math.random() * 1.5;
      return {
        x: Math.cos(angle) * strength,
        y: Math.sin(angle) * strength,
        z: (Math.random() - 0.5) * 2
      };
    });
    scatterDirectionsRef.current = scatterDirections;

    // Create a group to hold all the small circles
    const circlesGroup = new THREE.Group();
    scene.add(circlesGroup);
    circlesRef.current = circlesGroup;

    // Add small circles in random positions
    const circleGeometry = new THREE.CircleGeometry(2, 32);
    const circleMaterial = new THREE.MeshBasicMaterial({
      color: 0xffffff,
      transparent: true,
      opacity: 1.0,
      side: THREE.DoubleSide
    });

    // Create blurred circle material for the background circles
    const blurredCircleMaterial = new THREE.MeshBasicMaterial({
      color: 0xffffff,
      transparent: true,
      opacity: 0.4,
      side: THREE.DoubleSide
    });

    // Create a shader material for the blurred effect
    const blurredShaderMaterial = new THREE.ShaderMaterial({
      uniforms: {
        color: { value: new THREE.Color(0xffffff) }
      },
      vertexShader: `
        varying vec2 vUv;
        void main() {
          vUv = uv;
          gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
        }
      `,
      fragmentShader: `
        uniform vec3 color;
        varying vec2 vUv;
        void main() {
          float distance = length(vUv - vec2(0.5));
          float alpha = smoothstep(0.5, 0.2, distance);
          gl_FragColor = vec4(color, alpha * 0.5);
        }
      `,
      transparent: true,
      side: THREE.DoubleSide
    });

    // Create a number of small circles - increase for more density
    const numCircles = 50;
    for (let i = 0; i < numCircles; i++) {
      // Create random position and speed for this pair of circles
      const posX = (Math.random() - 0.5) * 1000;
      const posY = (Math.random() - 0.5) * 1000;
      const posZ = (Math.random() - 0.5) * 150;
      
      const speedX = (Math.random() - 0.5) * 0.3;
      const speedY = (Math.random() - 0.5) * 0.3;
      const speedZ = (Math.random() - 0.5) * 0.15;

      // Add some random scale variation - make some circles larger
      const scale = Math.random() * 1.5 + 0.5;
      
      // Generate a color if needed
      let circleColor = new THREE.Color(0xffffff);
      let useCustomColor = false;
      
      if (Math.random() > 0.7) {
        const hue = Math.random();
        circleColor = new THREE.Color().setHSL(hue, 0.8, 0.8);
        useCustomColor = true;
      }

      // Create animation data
      const userData = {
        speedX: speedX,
        speedY: speedY,
        speedZ: speedZ,
        pulseSpeed: 0.01 + Math.random() * 0.03,
        pulseAmount: 0.1 + Math.random() * 0.3,
        pulseOffset: Math.random() * Math.PI * 2,
        baseScale: scale
      };
      
      // 1. Create the background blurred circle (slightly larger)
      const backgroundCircle = new THREE.Mesh(
        new THREE.CircleGeometry(2, 32),
        blurredShaderMaterial.clone()
      );
      
      // Position and scale the background circle
      backgroundCircle.position.set(posX, posY, posZ - 0.5); // Slightly behind
      backgroundCircle.scale.set(scale * 2.5, scale * 2.5, scale * 2.5); // Much larger (was 1.5x)
      
      // If using custom color, set it for the background circle
      if (useCustomColor) {
        (backgroundCircle.material as THREE.ShaderMaterial).uniforms.color.value = circleColor;
      }
      
      // Set the user data for animations
      backgroundCircle.userData = { ...userData, isBackgroundCircle: true };
      
      // 2. Create the foreground circle (original)
      const frontCircle = new THREE.Mesh(circleGeometry, circleMaterial.clone());
      
      // Position and scale the front circle
      frontCircle.position.set(posX, posY, posZ);
      frontCircle.scale.set(scale, scale, scale);
      
      // If using custom color, set it for the front circle
      if (useCustomColor) {
        (frontCircle.material as THREE.MeshBasicMaterial).color = circleColor;
      }
      
      // Set the user data for animations
      frontCircle.userData = { ...userData, isBackgroundCircle: false };
      
      // Add both circles to the group
      circlesGroup.add(backgroundCircle);
      circlesGroup.add(frontCircle);
    }

    // Initialize GSAP ScrollTrigger
    const setupScrollTrigger = () => {
      // Main trigger for section transitions
      ScrollTrigger.create({
        trigger: "body",
        start: "top top",
        end: "bottom bottom",
        onUpdate: (self) => {
          // Calculate normalized progress for camera animation (between 1% and 50%)
          const animationProgress = Math.max(0, Math.min(1, (self.progress - 0.01) / (0.5 - 0.01)));
          
          // Directly interpolate camera position based on scroll progress
          if (cameraRef.current) {
            // Only update camera if we're between 1% and 50% scroll
            if (self.progress >= 0.01 && self.progress <= 0.5) {
              // Linear interpolation between section1Camera and section2Camera
              cameraRef.current.position.x = section1Camera.x + (section2Camera.x - section1Camera.x) * animationProgress;
              cameraRef.current.position.y = section1Camera.y + (section2Camera.y - section1Camera.y) * animationProgress;
              cameraRef.current.position.z = section1Camera.z + (section2Camera.z - section1Camera.z) * animationProgress;
            } else if (self.progress < 0.01) {
              // Before 1%, stick to section1Camera
              cameraRef.current.position.x = section1Camera.x;
              cameraRef.current.position.y = section1Camera.y;
              cameraRef.current.position.z = section1Camera.z;
            } else if (self.progress > 0.5) {
              // After 50%, stick to section2Camera
              cameraRef.current.position.x = section2Camera.x;
              cameraRef.current.position.y = section2Camera.y;
              cameraRef.current.position.z = section2Camera.z;
            }
          }
          
          // Update scroll data for the observer UI
          setScrollData(prevData => ({
            ...prevData,
            progress: self.progress,
            cameraX: cameraRef.current?.position.x || 0,
            cameraY: cameraRef.current?.position.y || 0,
            cameraZ: cameraRef.current?.position.z || 0,
            scatterForce: scatterForceRef.current
          }));
          
          // Fade out ellipse shadow based on scroll progress
          // Start fading at 6.5% and completely fade out by 12%
          const ellipseFadeStartPoint = 0.065; // 6.5%
          const ellipseFadeEndPoint = 0.12; // 12%
          
          if (self.progress <= ellipseFadeStartPoint) {
            setEllipseShadowOpacity(1); // Fully visible
          } else if (self.progress >= ellipseFadeEndPoint) {
            setEllipseShadowOpacity(0); // Fully transparent
          } else {
            // Linear interpolation for smooth fade
            const fadeProgress = (self.progress - ellipseFadeStartPoint) / (ellipseFadeEndPoint - ellipseFadeStartPoint);
            setEllipseShadowOpacity(1 - fadeProgress);
          }
          
          // Check if we've crossed the 50% threshold for particle formation
          const wasInSection2 = inSection2Ref.current;
          const isNowInSection2 = self.progress >= 0.5;
          
          if (wasInSection2 !== isNowInSection2) {
            inSection2Ref.current = isNowInSection2;
            // We don't need to call animateCameraToSection anymore
            // but we still need to update reform state
            shouldReformRef.current = true;
          }
        }
      });
    };

    // Function to animate camera position - now we'll use this only when manually needed
    const animateCameraToSection = (targetSection: number) => {
      // Kill any existing animation
      if (cameraAnimationRef.current) {
        cameraAnimationRef.current.kill();
      }
      
      // Set target position based on section
      const targetPosition = targetSection === 2 ? section2Camera : section1Camera;
      
      // Create GSAP animation
      cameraAnimationRef.current = gsap.to(camera.position, {
        x: targetPosition.x,
        y: targetPosition.y,
        z: targetPosition.z,
        duration: 1.2, // Animation duration in seconds
        ease: "power2.inOut", // Smooth easing
        onUpdate: () => {
          // Update scroll data in the UI
          setScrollData(prevData => ({
            ...prevData,
            cameraX: camera.position.x,
            cameraY: camera.position.y,
            cameraZ: camera.position.z,
          }));
        }
      });
    };

    // Function to check if we should reform the logo based on scroll position
    const checkShouldReform = () => {
      // Get the current scroll position
      const scrollY = window.scrollY;
      
      // Calculate total scroll height and current progress
      const totalHeight = document.body.scrollHeight - window.innerHeight;
      const progress = Math.min(scrollY / totalHeight, 1);
      
      // Check if we've crossed the 50% scroll threshold
      const isAfterMidpoint = progress >= 0.5;
      
      // We want to form the logo when:
      // 1. At the top of the page (progress near 0)
      // 2. When we're past the midpoint (progress >= 0.5)
      const tolerance = 0.05; // 5% tolerance
      
      const inSection1 = progress < tolerance;
      const inSection2 = isAfterMidpoint;
      
      // Check if we're transitioning between sections
      const wasInSection2 = inSection2Ref.current;
      shouldReformRef.current = inSection1 || inSection2;
      inSection2Ref.current = inSection2;
      
      // If section changed, animate camera position
      if (wasInSection2 !== inSection2) {
        animateCameraToSection(inSection2 ? 2 : 1);
      }
      
      // Debug logging to help understand the scroll position
      console.log(`Scroll progress: ${progress.toFixed(2)}, Should reform: ${shouldReformRef.current}, In Section2: ${inSection2Ref.current}`);
      
      // Update the scroll data state
      setScrollData({
        progress: progress,
        section: inSection2Ref.current ? 2 : 1,
        cameraX: camera.position.x,
        cameraY: camera.position.y,
        cameraZ: camera.position.z,
        scatterForce: scatterForceRef.current
      });
      
      // Fade out ellipse shadow based on scroll progress
      // Start fading at 6.5% and completely fade out by 12%
      const ellipseFadeStartPoint = 0.065; // 6.5%
      const ellipseFadeEndPoint = 0.12; // 12%
      
      if (progress <= ellipseFadeStartPoint) {
        setEllipseShadowOpacity(1); // Fully visible
      } else if (progress >= ellipseFadeEndPoint) {
        setEllipseShadowOpacity(0); // Fully transparent
      } else {
        // Linear interpolation for smooth fade
        const fadeProgress = (progress - ellipseFadeStartPoint) / (ellipseFadeEndPoint - ellipseFadeStartPoint);
        setEllipseShadowOpacity(1 - fadeProgress);
      }
      
      // Check if we're scrolling and not at a reform point
      if (!shouldReformRef.current && Math.abs(scrollY - currentScrollPositionRef.current) > 5) {
        // We're scrolling and not at a reform point, so scatter
        isScatteringRef.current = true;
        scatterForceRef.current = Math.min(scatterForceRef.current + 2.0, 25); // Increased force increment and max value
        
        // Removed ellipse shadow opacity update from here as it's now based on scroll progress
      } else if (shouldReformRef.current) {
        // Removed ellipse shadow opacity update from here as it's now based on scroll progress
      }
      
      // Store current position for next check
      currentScrollPositionRef.current = scrollY;
    };

    // Event handlers
    const handleMouseMove = (event: MouseEvent) => {
      mouseRef.current.x = (event.clientX / window.innerWidth) * 2 - 1;
      mouseRef.current.y = -(event.clientY / window.innerHeight) * 2 + 1;
      
      const vector = new THREE.Vector3(mouseRef.current.x, mouseRef.current.y, 0.5);
      vector.unproject(camera);
      const dir = vector.sub(camera.position).normalize();
      const distance = -camera.position.z / dir.z;
      const pos = camera.position.clone().add(dir.multiplyScalar(distance));
      
      mouseSphereRef.current.center.copy(pos);
      isMouseActiveRef.current = true;
    };

    const handleMouseOut = () => {
      isMouseActiveRef.current = false;
    };

    // Add scroll damping factor to reduce scroll sensitivity
    const scrollDampingFactor = 0.25; // Lower = less sensitive scrolling

    const handleWheel = (event: WheelEvent) => {
      // Reduce scroll sensitivity by applying damping factor
      const scrollDelta = Math.abs(event.deltaY) * scrollDampingFactor;
      const now = Date.now();
      
      if (now - lastScrollTimeRef.current > 200) {
        scatterForceRef.current = 0;
      }
      
      checkShouldReform();
      
      if (!shouldReformRef.current) {
        // Reduce scroll force impact as well
        scatterForceRef.current += scrollDelta * 0.005; // Reduced from 0.01
        scatterForceRef.current = Math.min(scatterForceRef.current, 25);
        isScatteringRef.current = true;
        
        // Removed ellipse shadow opacity update from here as it's now based on scroll progress
      }
      
      lastScrollTimeRef.current = now;

      // Optional: prevent default to take over scroll control completely
      // But this might interfere with normal page scrolling
      // event.preventDefault();
    };

    // Add a scroll event listener for more precise control
    const handleScroll = () => {
      // Apply damping to scroll sensitivity
      // The checkShouldReform function uses window.scrollY, which we can't directly modify
      // But we can slow down how often we respond to scroll events
      const now = Date.now();
      if (now - lastScrollTimeRef.current < 100 / scrollDampingFactor) {
        return; // Skip this scroll event to reduce sensitivity
      }
      
      checkShouldReform();
      lastScrollTimeRef.current = now;
    };

    const handleResize = () => {
      if (!cameraRef.current || !rendererRef.current) return;
      
      cameraRef.current.aspect = window.innerWidth / window.innerHeight;
      cameraRef.current.far = 3000; // Maintain expanded view space on resize
      cameraRef.current.updateProjectionMatrix();
      rendererRef.current.setSize(window.innerWidth, window.innerHeight);
      
      // Recalculate reform points on resize
      checkShouldReform();
    };

    setupScrollTrigger();

    // Add event listeners
    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('mouseout', handleMouseOut);
    window.addEventListener('wheel', handleWheel);
    window.addEventListener('scroll', handleScroll);
    window.addEventListener('resize', handleResize);

    // Initial check
    checkShouldReform();

    // Animation loop
    const animate = () => {
      if (!particleSystemRef.current || !originalPositionsRef.current || !bulbPositionsRef.current) return;

      const positions = particleSystemRef.current.geometry.attributes.position.array as Float32Array;
      
      if (isScatteringRef.current) {
        for (let i = 0; i < positions.length / 3; i++) {
          const dir = scatterDirectionsRef.current[i];
          
          positions[i * 3] += dir.x * scatterForceRef.current * 0.2; // Doubled the movement speed
          positions[i * 3 + 1] += dir.y * scatterForceRef.current * 0.2; // Doubled the movement speed
          positions[i * 3 + 2] += dir.z * scatterForceRef.current * 0.2; // Doubled the movement speed
        }
        
        // Only reduce force if we should reform
        if (shouldReformRef.current) {
          scatterForceRef.current *= 0.55; // Even faster reduction (was 0.9)
          if (scatterForceRef.current < 0.1) {
            isScatteringRef.current = false;
            scatterForceRef.current = 0;
          }
        }
      } else if (isMouseActiveRef.current) {
        for (let i = 0; i < positions.length / 3; i++) {
          const px = positions[i * 3];
          const py = positions[i * 3 + 1];
          const pz = positions[i * 3 + 2];
          
          const particlePos = new THREE.Vector3(px, py, pz);
          const distance = particlePos.distanceTo(mouseSphereRef.current.center);
          
          if (distance < mouseSphereRef.current.radius) {
            const repulsionDir = new THREE.Vector3().subVectors(particlePos, mouseSphereRef.current.center).normalize();
            const force = 1 - distance / mouseSphereRef.current.radius;
            const repulsionStrength = 15 * force;
            
            positions[i * 3] += repulsionDir.x * repulsionStrength;
            positions[i * 3 + 1] += repulsionDir.y * repulsionStrength;
          } else if (shouldReformRef.current) {
            // Return to the appropriate shape based on current section
            const targetPositions = inSection2Ref.current ? bulbPositionsRef.current : originalPositionsRef.current;
            const returnSpeed = 0.1;
            
            positions[i * 3] += (targetPositions[i * 3] - positions[i * 3]) * returnSpeed;
            positions[i * 3 + 1] += (targetPositions[i * 3 + 1] - positions[i * 3 + 1]) * returnSpeed;
            positions[i * 3 + 2] += (targetPositions[i * 3 + 2] - positions[i * 3 + 2]) * returnSpeed;
          }
        }
      } else if (shouldReformRef.current) {
        // Reform to the appropriate shape based on which section we're in
        const targetPositions = inSection2Ref.current ? bulbPositionsRef.current : originalPositionsRef.current;
        const returnSpeed = 0.1;
        
        for (let i = 0; i < positions.length / 3; i++) {
          positions[i * 3] += (targetPositions[i * 3] - positions[i * 3]) * returnSpeed;
          positions[i * 3 + 1] += (targetPositions[i * 3 + 1] - positions[i * 3 + 1]) * returnSpeed;
          positions[i * 3 + 2] += (targetPositions[i * 3 + 2] - positions[i * 3 + 2]) * returnSpeed;
        }
      }
      
      particleSystemRef.current.geometry.attributes.position.needsUpdate = true;
      
      // Animate the small circles
      if (circlesRef.current && cameraRef.current) {
        const camera = cameraRef.current; // Store camera reference to avoid null checks
        circlesRef.current.children.forEach((circle) => {
          // Move each circle according to its speed
          circle.position.x += circle.userData.speedX;
          circle.position.y += circle.userData.speedY;
          circle.position.z += circle.userData.speedZ;
          
          // Make circle always face the camera to avoid oval appearance
          circle.lookAt(camera.position);
          
          // Apply pulsing scale effect
          const time = performance.now() * 0.001;
          const pulse = Math.sin(time * circle.userData.pulseSpeed + circle.userData.pulseOffset) * circle.userData.pulseAmount + 1;
          const baseScale = circle.userData.baseScale || 1;
          
          // Apply different pulse scales to background vs foreground circles
          if (circle.userData.isBackgroundCircle) {
            // Background circles should always be larger
            circle.scale.set(baseScale * pulse * 2.5, baseScale * pulse * 2.5, baseScale * pulse * 2.5); // Much larger (was 1.5x)
          } else {
            circle.scale.set(baseScale * pulse, baseScale * pulse, baseScale * pulse);
          }
          
          // If circle moves too far, reset it to the other side - increased boundaries
          if (Math.abs(circle.position.x) > 600) {
            circle.position.x = -Math.sign(circle.position.x) * 600;
          }
          if (Math.abs(circle.position.y) > 600) {
            circle.position.y = -Math.sign(circle.position.y) * 600;
          }
          if (Math.abs(circle.position.z) > 100) {
            circle.position.z = -Math.sign(circle.position.z) * 100;
          }
        });
      }
      
      if (rendererRef.current && sceneRef.current && cameraRef.current) {
        rendererRef.current.render(sceneRef.current, cameraRef.current);
      }
      
      animationFrameRef.current = requestAnimationFrame(animate);
    };

    animate();

    // Cleanup
    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseout', handleMouseOut);
      window.removeEventListener('wheel', handleWheel);
      window.removeEventListener('scroll', handleScroll);
      window.removeEventListener('resize', handleResize);
      
      // Kill any active GSAP animations
      if (cameraAnimationRef.current) {
        cameraAnimationRef.current.kill();
      }
      
      // Clean up ScrollTrigger
      ScrollTrigger.getAll().forEach(trigger => trigger.kill());
      
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
      
      if (containerRef.current && rendererRef.current) {
        containerRef.current.removeChild(rendererRef.current.domElement);
      }
      
      if (sceneRef.current) {
        sceneRef.current.traverse((object) => {
          if (object instanceof THREE.Mesh) {
            object.geometry.dispose();
            if (Array.isArray(object.material)) {
              object.material.forEach(material => material.dispose());
            } else {
              object.material.dispose();
            }
          }
        });
      }
      
      if (rendererRef.current) {
        rendererRef.current.dispose();
      }
      
      if (circlesRef.current) {
        circlesRef.current.children.forEach(circle => {
          if (circle instanceof THREE.Mesh) {
            circle.geometry.dispose();
            if (circle.material instanceof THREE.Material) {
              circle.material.dispose();
            }
          }
        });
      }
    };
  }, []);

  return (
    <>
      {/* Ellipse Shadow */}
      <div 
        style={{ 
          position: 'fixed',
          top: 0,
          left: 0,
          width: '100%', 
          height: '100vh',
          zIndex: 0,
          opacity: ellipseShadowOpacity,
          transition: 'opacity 0.3s ease',
          pointerEvents: 'none', // Make sure it doesn't interfere with mouse events
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
        }}
      >
        <img 
          src="/ellipse-shadow.svg" 
          alt="Shadow" 
          style={{
            position: 'absolute',
            width: '100%',
            maxWidth: '906px',
            height: 'auto',
            transform: 'translateX(0%)', // Increased from 15% to move further right
            right: '0%', // Position 5% from the right edge of the screen
            left: 'auto', // Override any default left positioning
          }}
        />
      </div>
    
      {/* Background layer with interactive logo */}
      <div 
        ref={containerRef} 
        style={{ 
          width: '100%', 
          height: '100vh', 
          position: 'relative',
          background: 'transparent',
          overflow: 'hidden',
          zIndex: 1
        }} 
      />
      
      {/* Floating Observer UI */}
      <div
        ref={observerRef}
        style={{
          position: 'fixed',
          bottom: '20px',
          right: '20px',
          background: 'rgba(0, 0, 0, 0.7)',
          color: 'white',
          padding: '15px',
          borderRadius: '8px',
          zIndex: 1000,
          fontFamily: 'monospace',
          fontSize: '12px',
          boxShadow: '0 0 10px rgba(0, 0, 0, 0.3)',
          backdropFilter: 'blur(5px)',
          maxWidth: '250px',
          transition: 'opacity 0.3s ease',
          opacity: 0.7
        }}
        onMouseEnter={(e) => e.currentTarget.style.opacity = '1'}
        onMouseLeave={(e) => e.currentTarget.style.opacity = '0.7'}
      >
        <div style={{ marginBottom: '8px', borderBottom: '1px solid rgba(255,255,255,0.3)', paddingBottom: '5px' }}>
          <strong>Scroll Observer</strong>
        </div>
        <div>Progress: {(scrollData.progress * 100).toFixed(1)}%</div>
        <div>Section: {scrollData.section}</div>
        <div>
          Camera: [{scrollData.cameraX.toFixed(1)}, {scrollData.cameraY.toFixed(1)}, {scrollData.cameraZ.toFixed(1)}]
        </div>
        <div>Target: {scrollData.section === 1 ? 
          `[${section1Camera.x}, ${section1Camera.y}, ${section1Camera.z}]` : 
          `[${section2Camera.x}, ${section2Camera.y}, ${section2Camera.z}]`}
        </div>
        <div>Scatter Force: {scrollData.scatterForce.toFixed(2)}</div>
        <div>Shadow Opacity: {ellipseShadowOpacity.toFixed(2)}</div>
        <div style={{ 
          width: '100%', 
          height: '5px', 
          background: 'rgba(255,255,255,0.2)', 
          borderRadius: '3px', 
          marginTop: '8px' 
        }}>
          <div style={{ 
            width: `${scrollData.progress * 100}%`, 
            height: '100%', 
            background: 'rgba(0,255,128,0.8)', 
            borderRadius: '3px',
            transition: 'width 0.1s ease'
          }} />
        </div>
      </div>
    </>
  );
};

export default InteractiveLogo; 