import React from 'react';
import Link from 'next/link';

export default function NotFound() {
  return (
    <div style={{
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      height: '100vh',
      textAlign: 'center',
      color: 'white',
      backgroundColor: '#000',
      padding: '20px'
    }}>
      <h1 style={{ fontSize: '3rem', marginBottom: '2rem' }}>404 - Page Not Found</h1>
      <p style={{ fontSize: '1.2rem', maxWidth: '600px', marginBottom: '2rem' }}>
        The page you are looking for might have been removed or is temporarily unavailable.
      </p>
      <Link href="/" style={{
        backgroundColor: '#4a90e2',
        color: 'white',
        padding: '12px 24px',
        borderRadius: '4px',
        textDecoration: 'none',
        fontWeight: 'bold',
        transition: 'background-color 0.3s'
      }}>
        Return to Home
      </Link>
    </div>
  );
} 