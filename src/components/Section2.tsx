"use client";

import React, { useEffect, useState } from 'react';
import FloatingTextBox from './FloatingTextBox';

const Section2 = () => {
  const [textOpacity, setTextOpacity] = useState(0); // Start with invisible text

  useEffect(() => {
    const handleScroll = () => {
      // Get current scroll position
      const scrollPosition = window.scrollY;
      
      // Calculate total document height and view height for percentage-based scrolling
      const totalHeight = document.body.scrollHeight - window.innerHeight;
      const scrollProgress = (scrollPosition / totalHeight) * 100;
      
      // Fade in text between 17.0% and 25.0% scroll progress
      const fadeStartPoint = 17.0; // Start fading in at 17.0% scroll
      const fadeEndPoint = 35.0;   // Completely visible at 25.0% scroll
      
      // Calculate opacity based on scroll progress percentage
      if (scrollProgress <= fadeStartPoint) {
        setTextOpacity(0); // Fully transparent before 17.0%
      } else if (scrollProgress >= fadeEndPoint) {
        setTextOpacity(1); // Fully visible after 25.0%
      } else {
        // Linear interpolation for smooth fade
        const fadeProgress = (scrollProgress - fadeStartPoint) / (fadeEndPoint - fadeStartPoint);
        setTextOpacity(fadeProgress);
      }
      
      // Debug
      console.log(`Scroll Progress: ${scrollProgress.toFixed(1)}%, Section2 Text Opacity: ${textOpacity.toFixed(2)}`);
    };

    // Add scroll event listener
    window.addEventListener('scroll', handleScroll);
    
    // Initial check
    handleScroll();
    
    // Clean up
    return () => {
      window.removeEventListener('scroll', handleScroll);
    };
  }, [textOpacity]); // Add textOpacity as dependency to update the console log

  return (
    <div 
      style={{
        width: '100%',
        height: '100vh',
        backgroundColor: 'rgba(0, 128, 0, 0.0)',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'flex-start',
        alignItems: 'center',
        margin: '0',
        padding: '0',
        position: 'relative',
      }}
    >
      <h1 
        style={{ 
          color: 'white', 
          fontSize: '3rem',
          marginTop: '10%',
          textAlign: 'center',
          fontWeight: 'normal',
          lineHeight: '1.2',
          opacity: textOpacity,
          transform: `translateY(${10 * (1 - textOpacity)}px)`, // Subtle upward animation as it fades in
          transition: 'opacity 0.2s ease, transform 0.2s ease',
        }}
      >
        Perfect Solution for<br />
        Your Business
      </h1>

      {/* Blue box with 40% height of parent and 100% width */}
      <div
        style={{
          position: 'absolute',
          bottom: 0,
          left: 0,
          width: '100%',
          height: '40%',
          backgroundColor: 'rgba(0, 0, 255, 0.0)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
        }}
      />
      <FloatingTextBox />
    </div>
  );
};

export default Section2; 