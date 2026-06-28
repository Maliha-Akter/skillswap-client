// src/app/login/page.jsx
import LoginComponent from '@/components/LoginComponent';
import { Suspense } from 'react';

export default function LoginPage() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <LoginComponent />
    </Suspense>
  );
}
