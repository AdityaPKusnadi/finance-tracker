'use client'; // Tambahkan ini di baris pertama

import { useEffect } from 'react';
import { useRouter } from 'next/navigation'; // Ganti import dari 'next/router' ke 'next/navigation'

export default function SplashScreen() {
  const router = useRouter();

  useEffect(() => {
    const timer = setTimeout(() => {
      router.push('/login');
    }, 3000); // Durasi splash screen (3 detik)

    return () => clearTimeout(timer);
  }, [router]);

  return (
    <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
      <h1>Welcome to Finance Tracker</h1>
    </div>
  );
}
