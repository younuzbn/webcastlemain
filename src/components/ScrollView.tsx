"use client";

import React from 'react';
import Section1 from './Section1';
import Section2 from './Section2';
import Section3 from './Section3';

const ScrollView = () => {
  return (
    <div style={{ 
      width: '100%',
      position: 'relative',
      zIndex: 5,
      overflowY: 'auto',
      overflowX: 'hidden',
      height: 'auto',
      paddingTop: '12vh' // Space for the navbar
    }}>
      <Section1 />
      <Section2 />
      <Section3 />
    </div>
  );
};

export default ScrollView; 