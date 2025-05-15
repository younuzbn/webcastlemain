'use client';

import { useEffect, useRef } from 'react';
import * as THREE from 'three';

const ParticleSystem = () => {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!containerRef.current) return;
    
    // Scene setup
    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.setClearColor(0x000000, 0); // Transparent background
    containerRef.current.appendChild(renderer.domElement);

    // Create a sharp circular texture for the front particles
    const createSharpParticleTexture = () => {
      const canvas = document.createElement('canvas');
      const size = 128;
      canvas.width = size;
      canvas.height = size;
      
      const context = canvas.getContext('2d');
      if (!context) return null;
      
      // Draw a sharp, solid circle
      const centerX = size / 2;
      const centerY = size / 2;
      const radius = size / 4;
      
      // Create a radial gradient for slight edge softening
      const gradient = context.createRadialGradient(
        centerX, centerY, 0,
        centerX, centerY, radius
      );
      
      gradient.addColorStop(0, 'rgba(255, 255, 255, 1)');
      gradient.addColorStop(0.8, 'rgba(255, 255, 255, 0.95)');
      gradient.addColorStop(1, 'rgba(255, 255, 255, 0.8)');
      
      context.beginPath();
      context.arc(centerX, centerY, radius, 0, Math.PI * 2, false);
      context.fillStyle = gradient;
      context.fill();
      
      const texture = new THREE.Texture(canvas);
      texture.needsUpdate = true;
      return texture;
    };

    // Create a blurred circular texture for the background glow particles
    const createBlurredGlowTexture = () => {
      const canvas = document.createElement('canvas');
      const size = 1024; // Massive canvas for high-quality blur
      canvas.width = size;
      canvas.height = size;
      
      const context = canvas.getContext('2d');
      if (!context) return null;
      
      // Create soft glow effect
      const centerX = size / 2;
      const centerY = size / 2;
      const innerRadius = size / 15;
      const outerRadius = size / 1.6; // Very wide radius for extensive glow
      
      // Draw outer glow
      const outerGlow = context.createRadialGradient(
        centerX, centerY, innerRadius,
        centerX, centerY, outerRadius
      );
      
      outerGlow.addColorStop(0, 'rgba(255, 255, 255, 0.7)');
      outerGlow.addColorStop(0.1, 'rgba(255, 255, 255, 0.6)');
      outerGlow.addColorStop(0.3, 'rgba(255, 255, 255, 0.4)');
      outerGlow.addColorStop(0.5, 'rgba(255, 255, 255, 0.2)');
      outerGlow.addColorStop(0.7, 'rgba(255, 255, 255, 0.1)');
      outerGlow.addColorStop(0.9, 'rgba(255, 255, 255, 0.05)');
      outerGlow.addColorStop(1, 'rgba(255, 255, 255, 0)');
      
      context.fillStyle = outerGlow;
      context.fillRect(0, 0, size, size);
      
      // Apply multiple blur passes to the entire canvas for a softer effect
      context.filter = 'blur(25px)';
      context.globalAlpha = 0.7;
      context.drawImage(canvas, 0, 0, size, size);
      
      context.filter = 'blur(15px)';
      context.globalAlpha = 0.5;
      context.drawImage(canvas, 0, 0, size, size);
      
      // Reset filter and alpha
      context.filter = 'none';
      context.globalAlpha = 1.0;
      
      const texture = new THREE.Texture(canvas);
      texture.needsUpdate = true;
      return texture;
    };
    
    // Generate our particle textures
    const sharpParticleTexture = createSharpParticleTexture();
    const blurredGlowTexture = createBlurredGlowTexture();

    // Calculate total particles and visible count
    const totalParticlesCount = 50000;
    const visibleParticlesCount = Math.floor(totalParticlesCount * 0.9); // Show 50% of particles
    
    // Arrays to store particle positions and distances
    const positions = [];
    const distances = [];
    
    // Generate all particle positions first
    for (let i = 0; i < totalParticlesCount; i++) {
      let x, y, z;
      
      if (i % 3 === 0) {
        // Spherical distribution
        const radius = 3 + (Math.random() * 6); // Radius between 3 and 9
        const theta = Math.random() * Math.PI * 2; // Random angle
        const phi = Math.random() * Math.PI; // Random polar angle
        
        x = radius * Math.sin(phi) * Math.cos(theta);
        y = radius * Math.sin(phi) * Math.sin(theta);
        z = radius * Math.cos(phi) - 3; // Offset to position in front of camera
      } else if (i % 3 === 1) {
        // Flat disc distribution
        const radius = Math.sqrt(Math.random()) * 12; // Square root for even distribution
        const theta = Math.random() * Math.PI * 2;
        
        x = radius * Math.cos(theta);
        y = radius * Math.sin(theta);
        z = (Math.random() - 0.5) * 2 - 4; // Thin z distribution
      } else {
        // Random cubic distribution - distant stars
        x = (Math.random() - 0.5) * 20;
        y = (Math.random() - 0.5) * 20;
        z = (Math.random() - 0.5) * 20 - 10;
      }
      
      positions.push({ x, y, z });
      
      // Calculate distance to camera (at 0,0,5)
      const distanceToCamera = Math.sqrt(
        Math.pow(x, 2) + 
        Math.pow(y, 2) + 
        Math.pow(z - 5, 2)
      );
      
      distances.push({
        index: i,
        distance: distanceToCamera
      });
    }
    
    // Sort by distance (closest first)
    distances.sort((a, b) => a.distance - b.distance);
    
    // Filter out particles that are too far away
    const maxDistanceThreshold = 0.7;
    const filteredDistances = distances.filter(item => item.distance < maxDistanceThreshold);
    const finalVisibleCount = Math.min(filteredDistances.length, visibleParticlesCount);
    
    // Store min and max distances for normalizing
    const minDistance = filteredDistances[0].distance;
    const maxDistance = filteredDistances[finalVisibleCount - 1].distance;
    const distanceRange = maxDistance - minDistance;
    
    // Create geometries for both particle systems
    const frontGeometry = new THREE.BufferGeometry();
    const backGeometry = new THREE.BufferGeometry();
    
    // Create arrays for both particle systems
    const frontPositions = new Float32Array(finalVisibleCount * 3);
    const frontColors = new Float32Array(finalVisibleCount * 3);
    const frontSizes = new Float32Array(finalVisibleCount);
    
    const backPositions = new Float32Array(finalVisibleCount * 3);
    const backColors = new Float32Array(finalVisibleCount * 3);
    const backSizes = new Float32Array(finalVisibleCount);
    
    // Fill with the closest particles
    for (let i = 0; i < finalVisibleCount; i++) {
      const originalIndex = filteredDistances[i].index;
      const pos = positions[originalIndex];
      
      // Set positions for both front and back particles (at same spot)
      frontPositions[i * 3] = pos.x;
      frontPositions[i * 3 + 1] = pos.y;
      frontPositions[i * 3 + 2] = pos.z;
      
      backPositions[i * 3] = pos.x;
      backPositions[i * 3 + 1] = pos.y;
      backPositions[i * 3 + 2] = pos.z;
      
      // Calculate normalized distance (0 = closest, 1 = farthest within visible set)
      const normalizedDistance = (filteredDistances[i].distance - minDistance) / distanceRange;
      
      // Use a non-linear curve for size scaling
      const sizeFactor = Math.pow(normalizedDistance, 0.8);
      
      // Set sizes - back particles are larger than front particles
      const frontMinSize = 0.007; // Slightly smaller front particle
      const frontMaxSize = 0.018;
      frontSizes[i] = frontMinSize + (frontMaxSize - frontMinSize) * sizeFactor;
      
      // Back particles are MUCH larger now (6-7x the front size)
      const backMinSize = 0.05; // ~7x the front minimum size
      const backMaxSize = 0.12; // ~6.5x the front maximum size
      backSizes[i] = backMinSize + (backMaxSize - backMinSize) * sizeFactor;
      
      // Add a tiny random variation to avoid uniform appearance
      frontSizes[i] *= (0.9 + Math.random() * 0.2);
      backSizes[i] *= (0.8 + Math.random() * 0.4); // More variation in back sizes
      
      // Colors - front particles are full color
      if (i % 2 === 0) {
        // Bright green
        frontColors[i * 3] = 0.2;     // R - low red
        frontColors[i * 3 + 1] = 1.0; // G - full green
        frontColors[i * 3 + 2] = 0.5; // B - some blue for a nicer green
        
        // Back particles match but are slightly desaturated
        backColors[i * 3] = 0.3;     // Higher red
        backColors[i * 3 + 1] = 0.9; // Slightly lower green
        backColors[i * 3 + 2] = 0.6; // Higher blue
      } else {
        // White/light gray
        const brightness = 0.9 + Math.random() * 0.1;
        frontColors[i * 3] = brightness;
        frontColors[i * 3 + 1] = brightness;
        frontColors[i * 3 + 2] = brightness;
        
        // Back particles match
        backColors[i * 3] = brightness * 0.95;
        backColors[i * 3 + 1] = brightness * 0.95;
        backColors[i * 3 + 2] = brightness * 0.95;
      }
    }
    
    // Set attributes for front particles
    frontGeometry.setAttribute('position', new THREE.BufferAttribute(frontPositions, 3));
    frontGeometry.setAttribute('color', new THREE.BufferAttribute(frontColors, 3));
    frontGeometry.setAttribute('size', new THREE.BufferAttribute(frontSizes, 1));
    
    // Set attributes for back particles
    backGeometry.setAttribute('position', new THREE.BufferAttribute(backPositions, 3));
    backGeometry.setAttribute('color', new THREE.BufferAttribute(backColors, 3));
    backGeometry.setAttribute('size', new THREE.BufferAttribute(backSizes, 1));
    
    // Create material for front particles (sharp, solid)
    const frontMaterial = new THREE.PointsMaterial({
      size: 0.01,
      vertexColors: true,
      transparent: true,
      opacity: 1.0,
      blending: THREE.AdditiveBlending,
      depthWrite: false,
      sizeAttenuation: true,
      map: sharpParticleTexture,
      alphaTest: 0.1,
    });
    
    // Create material for back particles (blurred, transparent)
    const backMaterial = new THREE.PointsMaterial({
      size: 0.01,
      vertexColors: true,
      transparent: true,
      opacity: 0.45, // Slightly reduced opacity for back particles
      blending: THREE.AdditiveBlending,
      depthWrite: false,
      sizeAttenuation: true,
      map: blurredGlowTexture,
      alphaTest: 0.0001, // Much lower threshold for maximum glow extension
    });
    
    // Create meshes for both particle systems
    const backParticlesMesh = new THREE.Points(backGeometry, backMaterial);
    const frontParticlesMesh = new THREE.Points(frontGeometry, frontMaterial);
    
    // Add particle systems to scene (back first, then front)
    scene.add(backParticlesMesh);
    scene.add(frontParticlesMesh);
    
    camera.position.z = 5;

    // Animation
    const clock = new THREE.Clock();
    const animate = () => {
      const elapsedTime = clock.getElapsedTime();
      
      requestAnimationFrame(animate);
      
      // Add subtle wave-like motion to both particle systems
      backParticlesMesh.position.y = Math.sin(elapsedTime * 0.3) * 0.1;
      frontParticlesMesh.position.y = Math.sin(elapsedTime * 0.3) * 0.1;

      backParticlesMesh.position.x = Math.sin(elapsedTime * 0.3) * 0.1;
      frontParticlesMesh.position.x = Math.sin(elapsedTime * 0.3) * 0.1;
      // Constant slow rotation
      backParticlesMesh.rotation.z += 0.0003;
      frontParticlesMesh.rotation.z += 0.0003;
      
      renderer.render(scene, camera);
    };

    animate();

    // Handle window resize
    const handleResize = () => {
      camera.aspect = window.innerWidth / window.innerHeight;
      camera.updateProjectionMatrix();
      renderer.setSize(window.innerWidth, window.innerHeight);
    };

    window.addEventListener('resize', handleResize);

    // Handle scroll interactions
    const handleScroll = () => {
      const scrollY = window.scrollY;
      const viewportHeight = window.innerHeight;
      
      // Keep particles visible all the time through all sections
      // We'll just make them fade slightly between sections for a smoother transition
      if (scrollY < viewportHeight * 0.5) {
        // First half of Section 1 - full opacity
        frontMaterial.opacity = 1.0;
        backMaterial.opacity = 0.45;
      } else if (scrollY < viewportHeight) {
        // Second half of Section 1 - slight fade to create transition
        const progress = (scrollY - viewportHeight * 0.5) / (viewportHeight * 0.5);
        frontMaterial.opacity = 0.65 * (1 - progress * 0.3);
        backMaterial.opacity = 0.3 * (1 - progress * 0.3);
      } else if (scrollY < viewportHeight * 1.2) {
        // Start of Section 2 - fade back to full
        const progress = (scrollY - viewportHeight) / (viewportHeight * 0.2);
        frontMaterial.opacity = 0.65 * (0.7 + progress * 0.3);
        backMaterial.opacity = 0.3 * (0.7 + progress * 0.3);
      } else if (scrollY < viewportHeight * 1.8) {
        // Most of Section 2 - full opacity
        frontMaterial.opacity = 0.65;
        backMaterial.opacity = 0.3;
      } else if (scrollY < viewportHeight * 2) {
        // End of Section 2 - slight fade for transition to Section 3
        const progress = (scrollY - viewportHeight * 1.8) / (viewportHeight * 0.2);
        frontMaterial.opacity = 0.65 * (1 - progress * 0.3);
        backMaterial.opacity = 0.3 * (1 - progress * 0.3);
      } else if (scrollY < viewportHeight * 2.2) {
        // Start of Section 3 - fade back to full
        const progress = (scrollY - viewportHeight * 2) / (viewportHeight * 0.2);
        frontMaterial.opacity = 0.65 * (0.7 + progress * 0.3);
        backMaterial.opacity = 0.3 * (0.7 + progress * 0.3);
      } else {
        // Rest of Section 3 - full opacity
        frontMaterial.opacity = 0.65;
        backMaterial.opacity = 0.3;
      }
    };
    
    window.addEventListener('scroll', handleScroll);

    // Cleanup
    return () => {
      window.removeEventListener('resize', handleResize);
      window.removeEventListener('scroll', handleScroll);
      
      if (containerRef.current && containerRef.current.contains(renderer.domElement)) {
        containerRef.current.removeChild(renderer.domElement);
      }
      
      scene.remove(frontParticlesMesh);
      scene.remove(backParticlesMesh);
      frontGeometry.dispose();
      backGeometry.dispose();
      frontMaterial.dispose();
      backMaterial.dispose();
      if (sharpParticleTexture) sharpParticleTexture.dispose();
      if (blurredGlowTexture) blurredGlowTexture.dispose();
      renderer.dispose();
    };
  }, []);

  return (
    <div 
      ref={containerRef} 
      style={{ 
        position: 'fixed',
        top: 0,
        left: 0,
        width: '100%', 
        height: '100vh',
        pointerEvents: 'none', // Allow clicking through to elements beneath
        zIndex: 1.5
      }} 
    />
  );
};

export default ParticleSystem; 