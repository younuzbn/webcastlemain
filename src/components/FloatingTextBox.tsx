"use client";

import React, { useEffect, useState } from 'react';

const FloatingTextBox = () => {
  const [opacity, setOpacity] = useState(0);
  const [position, setPosition] = useState<'left' | 'right'>('left');
  const [transform, setTransform] = useState('translateX(-20px)');

  useEffect(() => {
    const handleScroll = () => {
      const scrollPosition = window.scrollY;
      const totalHeight = document.body.scrollHeight - window.innerHeight;
      const scrollProgress = (scrollPosition / totalHeight) * 100;

      // Bulb shape appears at 50%, Apple at 75%, Microsoft at 90%
      if (scrollProgress >= 50 && scrollProgress < 75) {
        // Bulb shape - fade in from left
        setPosition('left');
        setOpacity(1);
        setTransform('translateX(0)');
      } else if (scrollProgress >= 75 && scrollProgress < 90) {
        // Apple shape - fade out from left, fade in from right
        if (position === 'left') {
          setOpacity(0);
          setTransform('translateX(-20px)');
          setTimeout(() => {
            setPosition('right');
            setOpacity(1);
            setTransform('translateX(0)');
          }, 300);
        }
      } else if (scrollProgress >= 90) {
        // Microsoft shape - fade out from right, fade in from left
        if (position === 'right') {
          setOpacity(0);
          setTransform('translateX(20px)');
          setTimeout(() => {
            setPosition('left');
            setOpacity(1);
            setTransform('translateX(0)');
          }, 300);
        }
      } else {
        // Before bulb shape - hidden
        setOpacity(0);
        setTransform(position === 'left' ? 'translateX(-20px)' : 'translateX(20px)');
      }
    };

    window.addEventListener('scroll', handleScroll);
    handleScroll(); // Initial check

    return () => {
      window.removeEventListener('scroll', handleScroll);
    };
  }, [position]);

  return (
    <div
      style={{
        position: 'fixed',
        bottom: '10%',
        left: position === 'left' ? '7%' : 'auto',
        right: position === 'right' ? '7%' : 'auto',
        width: '29%',
        height: '30%',
        backgroundColor: 'rgba(255, 255, 255, 0.1)',
        borderRadius: '10px',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'flex-start',
        alignItems: 'flex-start',
        padding: '20px',
        opacity: opacity,
        transform: transform,
        transition: 'opacity 0.3s ease, transform 0.3s ease',
        zIndex: 1000,
      }}
    >
      {/* "We Think" text with different colors */}
      <div style={{ display: 'flex', gap: '10px' }}>
        <span style={{ color: '#818286', fontSize: '2.2rem', fontWeight: 'normal' }}>
          We
        </span>
        <span style={{ color: '#35D867', fontSize: '2.2rem', fontWeight: 'normal' }}>
          Think
        </span>
      </div>

      {/* Paragraph below the "We Think" text */}
      <p 
        style={{ 
          color: 'white', 
          fontSize: '1rem', 
          marginTop: '20px',
          lineHeight: '1.6',
          fontWeight: 'light',
        }}
      >
        At WebCastle Media, everything starts with an idea. We take time to understand your goals, research the market, and come up with creative and strategic solutions.
      </p>
    </div>
  );
};

export default FloatingTextBox; 