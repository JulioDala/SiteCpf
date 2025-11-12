'use client';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';

// Tipagem do usuário
interface User {
  id: string;
  nome: string;
  email: string;
  status: 'Ativo' | 'Inativo';
}

// Hook principal
export function useAuth() {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  // Simulação de "base de dados estática"
  const mockUsers: User[] = [
    { id: '1', nome: 'Pedro Almeida', email: 'admin@gmail.com', status: 'Ativo' },
    { id: '2', nome: 'Maria Santos', email: 'maria@gmail.com', status: 'Ativo' },
  ];

  // Carregar user do localStorage (sessão persistente)
  useEffect(() => {
    const storedUser = localStorage.getItem('user');
    if (storedUser) setUser(JSON.parse(storedUser));
    setLoading(false);
  }, []);

  // Função de login
  function login(email: string, password: string) {
    setLoading(true);

    // Simula tempo de requisição da API
    setTimeout(() => {
      const foundUser = mockUsers.find(u => u.email === email);

      if (foundUser && password === '1234') {
        localStorage.setItem('user', JSON.stringify(foundUser));
        setUser(foundUser);
        router.push('/dashboard/home');
      } else {
        alert('Credenciais inválidas');
      }

      setLoading(false);
    }, 1000);
  }

  // Função de logout
  function logout() {
    localStorage.removeItem('user');
    setUser(null);
    router.push('/login');
  }

  return {
    user,
    loading,
    isAuthenticated: !!user,
    login,
    logout,
  };
}
