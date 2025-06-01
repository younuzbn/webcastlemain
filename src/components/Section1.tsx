"use client";

import React, { useEffect, useState } from 'react';

const Section1 = () => {
  const [textOpacity, setTextOpacity] = useState(1); // Start with fully visible text
  const [divOpacity, setDivOpacity] = useState(1); // Start with fully visible div

  useEffect(() => {
    const handleScroll = () => {
      // Get current scroll position
      const scrollPosition = window.scrollY;
      
      // Calculate total document height and view height for percentage-based scrolling
      const totalHeight = document.body.scrollHeight - window.innerHeight;
      const scrollProgress = (scrollPosition / totalHeight) * 100;
      
      // Fade out text between 3.0% and 18.0% scroll progress
      const textFadeStartPoint = 3.0; // Start fading at 3.0% scroll
      const textFadeEndPoint = 18.0;   // Complete fade at 18.0% scroll
      
      // Calculate opacity based on scroll progress percentage for text
      if (scrollProgress <= textFadeStartPoint) {
        setTextOpacity(1); // Fully visible before 3.0%
      } else if (scrollProgress >= textFadeEndPoint) {
        setTextOpacity(0); // Fully transparent after 18.0%
      } else {
        // Linear interpolation for smooth fade
        const textFadeProgress = (scrollProgress - textFadeStartPoint) / (textFadeEndPoint - textFadeStartPoint);
        setTextOpacity(1 - textFadeProgress);
      }
      
      // Fade out div structure between 9.0% and 21.0% scroll progress
      const divFadeStartPoint = 9.0;  // Start fading at 9.0% scroll
      const divFadeEndPoint = 37.0;   // Complete fade at 21.0% scroll
      
      // Calculate opacity based on scroll progress percentage for div
      if (scrollProgress <= divFadeStartPoint) {
        setDivOpacity(1); // Fully visible before 9.0%
      } else if (scrollProgress >= divFadeEndPoint) {
        setDivOpacity(0); // Fully transparent after 21.0%
      } else {
        // Linear interpolation for smooth fade
        const divFadeProgress = (scrollProgress - divFadeStartPoint) / (divFadeEndPoint - divFadeStartPoint);
        setDivOpacity(1 - divFadeProgress);
      }
      
      // Debug
      console.log(`Scroll Progress: ${scrollProgress.toFixed(1)}%, Text Opacity: ${textOpacity.toFixed(2)}, Div Opacity: ${divOpacity.toFixed(2)}`);
    };

    // Add scroll event listener
    window.addEventListener('scroll', handleScroll);
    
    // Initial check
    handleScroll();
    
    // Clean up
    return () => {
      window.removeEventListener('scroll', handleScroll);
    };
  }, [textOpacity, divOpacity]); // Added both opacities as dependencies

  return (
    <div 
      style={{
        width: '100%',
        height: '88vh',
        backgroundColor: 'rgba(255, 0, 0, 0.0)',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'flex-start',
        alignItems: 'flex-start',
        margin: '0',
        padding: '0',
        position: 'relative',
      }}
    >
      {/* Text container with its own opacity */}
      <div style={{
        marginLeft: '10%',
        marginRight: '50%',
        marginTop: '25vh',
        color: 'white',
        fontFamily: 'Arial, sans-serif',
        opacity: textOpacity,
        transition: 'opacity 0.2s ease',
      }}>
        <h3 style={{
          fontSize: '2rem',
          fontWeight: '400',
          margin: '0',
          lineHeight: '1.2',
        }}>
          Your trusted partner in
        </h3>
        <h2 style={{
          fontSize: '4.5rem',
          fontWeight: '200',
          margin: '0',
          marginTop: '0.5rem',
          lineHeight: '1.2',
        }}>
          Digital Evolution!
        </h2>
      </div>

      {/* Green box */}
      <div style={{
        position: 'absolute',
        left: '10%',
        right: '60%',
        bottom: '21%',
        top: '50%',
        backgroundColor: 'rgba(0, 128, 0, 0.0)',
        borderRadius: '8px',
        boxShadow: '0 4px 8px rgba(0, 0, 0, 0.0)',
        display: 'flex',
        flexDirection: 'column', // Stack children vertically
        opacity: divOpacity,
        transition: 'opacity 0.2s ease',
      }}>
        {/* Top blue box - 70% height */}
        <div style={{
          width: '100%',
          height: '70%',
          backgroundColor: 'rgba(255, 255, 255, 0.12)',
          borderTopLeftRadius: '8px',
          borderTopRightRadius: '8px',
          marginBottom: '9px',
          borderRadius: '10px',
          padding: '7px',
          display: 'flex',
          flexDirection: 'row',
          alignItems: 'center'
        }}>
          <div style={{ padding: '0px' }}>
            <img 
              src="/lulu.png" 
              alt="Lulu Mall" 
              style={{
                borderRadius: '8px',
                maxWidth: '100%',
                height: '100%',
                objectFit: 'contain'
              }}
            />
          </div>
          <div style={{ 
            marginLeft: '12px',
            display: 'flex',
            flexDirection: 'column'
          }}>
            <h3 style={{ 
              color: '#ffffff',
              fontSize: '20px',
              fontWeight: '600',
              marginTop: '0',
              marginBottom: '0px'
              
            }}>
              Lulu Happiness
            </h3>
            <p style={{ 
              color: '#ffffff', 
              fontSize: '14px',
              lineHeight: '1.5',
              margin: '0',
              opacity: '0.9'
            }}>
              WebCastle is a top quality web designing company in Ernakulam aimed at creating a better brand.
            </p>
          </div>
        </div>
        
        {/* Bottom red box - 30% height */}
        <div style={{
          width: '100%',
          height: '30%',
          backgroundColor: 'rgba(255, 0, 0, 0.0)',
          borderBottomLeftRadius: '8px',
          borderBottomRightRadius: '8px',
          borderRadius: '10px',
          display: 'flex', // Use flexbox for horizontal layout
          flexDirection: 'row', // Arrange children horizontally
        }}>
          {/* Left yellow box - 50% width */}
          <div style={{
            width: '50%',
            height: '100%',
            backgroundColor: 'rgba(255, 255, 255, 0.12)', // Yellow with opacity
            borderTopLeftRadius: '10px',
            borderBottomLeftRadius: '10px',
            marginRight: '9px',
            borderRadius: '10px',
          }}>
          </div>
          
          {/* Right purple box - 50% width */}
          <div style={{
            width: '50%',
            height: '100%',
            backgroundColor: 'rgba(255, 255, 255, 0.12)', // Purple with opacity
            borderTopRightRadius: '10px',
            borderBottomRightRadius: '10px',
            borderRadius: '10px',
          }}>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Section1; 