// src/app/signup/page.jsx
import SignupComponent from '@/components/SignupComponent';
import { Suspense } from 'react';

export default function LoginPage() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <SignupComponent />
    </Suspense>
  );
}