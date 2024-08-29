'use client'; 

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function SplashScreen() {
  const router = useRouter();

  useEffect(() => {
    const timer = setTimeout(() => {
      router.push('/login');
    }, 4000); // Durasi splash screen diubah menjadi 4 detik

    return () => clearTimeout(timer);
  }, [router]);

  return (
    <div style={styles.container}>
      <img src="/splashscreen.gif" alt="Loading..." style={styles.gif} /> {/* Pastikan path ini benar */}
    </div>
  );
}

const styles = {
  container: {
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    height: '100vh',
    backgroundColor: '#f5f5f5',
  },
  gif: {
    width: '100%', // Menyesuaikan ukuran GIF agar memenuhi layar
    maxWidth: '600px', // Memberikan batasan ukuran maksimal
    height: 'auto',
  },
};
