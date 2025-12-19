// app/login/layout.tsx
import { AuthProvider } from '@/components/providers/AuthProvider';
import { ReactNode } from 'react';

export default function LoginLayout({ children }: { children: ReactNode }) {
  return (
    <AuthProvider requireAuth={false}>
      {children}
    </AuthProvider>
  );
}