import InteractiveLogo from '@/components/InteractiveLogo';
import Navbar from '@/components/Navbar';
import ScrollView from '@/components/ScrollView';
import ParticleSystem from '@/components/ParticleSystem';

export default function Home() {
  return (
    <div style={{ position: 'relative' }}>
      {/* Background layer */}
      <div style={{ position: 'fixed', top: 0, left: 0, width: '100%', height: '100vh', zIndex: 1 }}>
        <InteractiveLogo />
      </div>
      
      {/* Particle system layer */}
      {/* <ParticleSystem /> */}
      
      {/* Content layer */}
      <div style={{ position: 'relative', zIndex: 2 }}>
        <Navbar />
        <ScrollView />
      </div>
    </div>
  );
}
