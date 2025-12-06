
import { Suspense, useEffect } from 'react';
import LoginFormContent from './LoginFormContent'; 

// Fallback mostrado durante hidração (breve)
function LoginFallback() {
  return (
    <div className="min-h-screen bg-cyan-50 flex items-center justify-center px-4 sm:px-6 lg:px-8">
      <div className="text-center text-gray-600">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-600 mx-auto mb-2"></div>
        Carregando formulário...
      </div>
    </div>
  );
}

export default function LoginPage() {
  return (
    <Suspense fallback={<LoginFallback />}>
      <LoginFormContent />
    </Suspense>
  );
}