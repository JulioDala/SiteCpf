// app/dashboard/layout.tsx
import { AuthProvider } from '@/components/providers/AuthProvider';
import { ReactNode } from 'react';

export default function DashboardLayout({ children }: { children: ReactNode }) {
  return (
    <AuthProvider requireAuth={true}>
      {children}
    </AuthProvider>
  );
}