'use client';

import React from 'react';
import { useRouter } from 'next/navigation';
import Button from '@mui/material/Button';
import Divider from '@mui/material/Divider';

export default function Home() {
  const router = useRouter();

  return (
    <main>
      <h1>42Login!</h1>
      <Divider />
      <Button
        variant="contained"
        onClick={() => {
          router.push('/register');
        }}
      >
        register
      </Button>
      <h1>make Room</h1>
      <Divider />
      <Button
        variant="contained"
        onClick={() => {
          router.push('/chat');
        }}
      >
        chat
      </Button>
    </main>
  );
}