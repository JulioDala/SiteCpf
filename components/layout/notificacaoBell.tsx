// components/NotificacaoBell.tsx
'use client';

import React, { useEffect, useState } from 'react';
import { Bell, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useNotificacaoStore } from '@/storage/notificacao-store';

interface NotificacaoBellProps {
  userEmail: string;
  onClick: () => void;
}

const NotificacaoBell: React.FC<NotificacaoBellProps> = ({ userEmail, onClick }) => {
  const { contagemNaoVisualizadas, contarNotificacoesNaoVisualizadas } = useNotificacaoStore();
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const loadNotificationCount = async () => {
      if (userEmail) {
        setLoading(true);
        try {
          await contarNotificacoesNaoVisualizadas(userEmail);
        } catch (error) {
          console.error('Erro ao carregar contagem de notificações:', error);
        } finally {
          setLoading(false);
        }
      }
    };

    loadNotificationCount();
    
    // Recarregar a contagem a cada 30 segundos
    const interval = setInterval(loadNotificationCount, 30000);
    
    return () => clearInterval(interval);
  }, [userEmail, contarNotificacoesNaoVisualizadas]);

  return (
    <Button 
      variant="ghost" 
      size="icon" 
      className="rounded-full hover:bg-gray-100 relative"
      onClick={onClick}
      disabled={loading}
    >
      {loading ? (
        <Loader2 className="w-5 h-5 text-purple-600 animate-spin" />
      ) : (
        <Bell className="w-5 h-5 text-purple-600" />
      )}
      
      {!loading && contagemNaoVisualizadas > 0 && (
        <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center animate-pulse">
          {contagemNaoVisualizadas > 9 ? '9+' : contagemNaoVisualizadas}
        </span>
      )}
    </Button>
  );
};

export default NotificacaoBell;