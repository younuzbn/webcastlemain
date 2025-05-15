"use client";

import React, { useEffect, useState } from 'react';
import Image from 'next/image';

const Navbar = () => {
  const [opacity, setOpacity] = useState(1); // Start fully visible

  useEffect(() => {
    const handleScroll = () => {
      // Get current scroll position
      const scrollPosition = window.scrollY;
      
      // Calculate when to start fading (after 20px of scroll)
      const fadeStartPoint = 20;
      
      // Calculate when to be fully transparent (after 150px of scroll)
      const fadeEndPoint = 100;
      
      // Calculate opacity based on scroll position
      if (scrollPosition <= fadeStartPoint) {
        setOpacity(1); // Fully visible
      } else if (scrollPosition >= fadeEndPoint) {
        setOpacity(0.0); // Almost fully transparent, but still slightly visible
      } else {
        // Linear interpolation for smooth fade
        const fadeProgress = (scrollPosition - fadeStartPoint) / (fadeEndPoint - fadeStartPoint);
        setOpacity(1 - (fadeProgress * 1.0)); // Fade to 0.1 opacity
      }
    };

    // Add scroll event listener
    window.addEventListener('scroll', handleScroll);
    
    // Initial check
    handleScroll();
    
    // Clean up
    return () => {
      window.removeEventListener('scroll', handleScroll);
    };
  }, []);

  return (
    <nav
      style={{
        height: '12vh',
        width: '100%',
        backgroundColor: 'rgba(255, 0, 0, 0.0)',
        position: 'fixed',
        top: 0,
        left: 0,
        zIndex: 1000,
        display: 'flex',
        alignItems: 'center',
        padding: 0,
        opacity: opacity, // Dynamic opacity based on scroll
        transition: 'opacity 0.2s ease', // Smooth transition
      }}
    >
      <div style={{
        display: 'flex',
        width: '100%',
        height: '100%'
      }}>
        <div style={{ 
          width: '42%', 
          height: '100%', 
          backgroundColor: 'rgba(0, 128, 0, 0.0)',
          position: 'relative',
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'flex-end',
          paddingBottom: '15px'
        }}>
          <Image 
            src="/logo.png" 
            alt="Logo" 
            width={200} 
            height={250}
            style={{
              maxWidth: '800%',
              maxHeight: '80%',
              objectFit: 'contain'
            }}
          />
        </div>
        <div style={{ 
          width: '68%', 
          height: '100%', 
          backgroundColor: 'rgba(255, 255, 0, 0.0)',
          display: 'flex',
          justifyContent: 'space-evenly',
          alignItems: 'center',
          paddingLeft: '0px',
          paddingTop: '15px'
        }}>
          <span style={{ color: 'white', fontWeight: 'normal', fontSize: '20px' }}>Services</span>
          <span style={{ color: 'white', fontWeight: 'normal', fontSize: '20px' }}>Works</span>
          <span style={{ color: 'white', fontWeight: 'normal', fontSize: '20px' }}>Industries</span>
          <span style={{ color: 'white', fontWeight: 'normal', fontSize: '20px' }}>Solutions</span>
          <span style={{ color: 'white', fontWeight: 'normal', fontSize: '20px' }}>Technologies</span>
          <div style={{ display: 'flex', alignItems: 'center', marginLeft: '10px' }}>
            <Image 
              src="/callicon.png" 
              alt="Call Icon" 
              width={44} 
              height={44}
              style={{
                objectFit: 'contain',
                paddingLeft: '10px'
              }}
            />
          </div>
        </div>
        <div style={{ 
          width: '12%', 
          height: '100%', 
          backgroundColor: 'rgba(0, 0, 255, 0.0)',
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          paddingTop: '16px',
          paddingRight: '26px'
        }}>
          <div style={{
            backgroundColor: '#1C2129',
            padding: '5px 2px',
            borderRadius: '4px',
            width: '100%',
            height: '60%',
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            gap: '8px'
          }}>
            <span style={{ color: 'white', fontSize: '16px', fontWeight: '500' }}>MENU</span>
            <Image 
              src="/menu-icon.png" 
              alt="Menu Icon" 
              width={28} 
              height={28}
              style={{
                objectFit: 'contain'
              }}
            />
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar; 