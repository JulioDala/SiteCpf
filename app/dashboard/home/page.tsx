'use client';
import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Calendar, Dumbbell, Clock, CheckCircle, AlertCircle, XCircle, Plus, User, Bell, LogOut, Loader2, Home } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import ModalDetalheDesporto from '@/components/layout/modal-detalho-desporto';
import ModalDetalheReserva from '@/components/layout/modal-detalhe-reserva';
import { useClienteReservasStore } from '@/storage/cliente-storage';
import { useAuthStore } from '@/storage/atuh-storage';
import { useDesportoStore } from '@/storage/cliente-desporto-stores';
import NotificacaoBell from '@/components/layout/notificacaoBell';
import NotificacoesModal from '@/components/layout/notificacoesModal';
import { ModalPerfil } from '@/components/layout/modal-perfil';
import CalendarioGeralCard from '@/components/layout/calendario-geral-card';
import ModalCalendarioGeral from '@/components/layout/modal-calendario-geral';

export default function ClientPortalHome() {
  const router = useRouter();
  const { userLogin, logout } = useAuthStore();

  const navigateTo = (path: string) => {
    router.push(path);
  };


  const [showNotificacoesModal, setShowNotificacoesModal] = useState(false);
  const [showPerfilModal, setShowPerfilModal] = useState(false);
  const [showCalendarioModal, setShowCalendarioModal] = useState(false);

  const clientName = userLogin?.cliente.nome || "Jose da Costa Quinanga";
  const email = userLogin?.cliente.email || "";
  const numeroCliente = userLogin?.cliente.numeroCliente || "";

  const goToHome = () => navigateTo('/dashboard/home');
  const goToAgendar = () => navigateTo('/dashboard/agendar');

  // Função de logout
  const handleLogout = async () => {
    await logout();
    router.push('/');
  };

  return (
    <div className="min-h-screen bg-cyan-50 text-gray-900">
      {/* ==================== HEADER ==================== */}
      <header className="fixed top-0 left-0 right-0 z-50 bg-white/95 backdrop-blur-md border-b border-purple-200/50 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            {/* Esquerda - Logo + Nome */}
            <div className="flex items-center gap-10">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg overflow-hidden flex items-center justify-center bg-white shadow-sm">
                  <img
                    src="./../images/ico-paz-flor.png"
                    alt="Logo CPF"
                    className="w-full h-full object-cover"
                  />
                </div>
                <div>
                  <h1 className="text-xl font-bold text-gray-900 leading-tight">
                    Paz Flor
                  </h1>
                  <p className="text-xs text-purple-600 font-medium">
                    Portal do Cliente
                  </p>
                </div>
              </div>
            </div>

            {/* Menu horizontal com ícones */}
            <nav>
              <ul className="flex items-center gap-8 text-sm font-medium">
                <li>
                  <button
                    onClick={() => { goToHome() }}
                    className="flex items-center gap-2 text-gray-700 hover:text-purple-700 transition-colors"
                  >
                    <Home size={18} />
                    Início
                  </button>
                </li>
                <li>
                  <button
                    onClick={() => { goToAgendar() }}
                    className="flex items-center gap-2 text-gray-700 hover:text-purple-700 transition-colors"
                  >
                    <Calendar size={18} />
                    Minhas Reservas
                  </button>
                </li>
              </ul>
            </nav>

            {/* Direita - Ações do usuário */}
            <div className="flex items-center gap-5">
              {/* Sino de notificações */}
              <NotificacaoBell
                userEmail={email}
                onClick={() => setShowNotificacoesModal(true)}
              >
                {/* Se o componente NotificacaoBell não renderiza o ícone, podes colocar assim: */}
                {/* <Bell size={20} className="text-gray-600" /> */}
              </NotificacaoBell>

              <div className="flex items-center gap-4">
                <div className="text-right">
                  <p className="text-sm font-medium text-gray-900">
                    {clientName.split(' ')[0]}
                  </p>
                  <p className="text-xs text-gray-500">Membro</p>
                </div>

                {/* Perfil */}
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-9 w-9 rounded-full hover:bg-gray-100"
                  onClick={() => setShowPerfilModal(true)}
                  title="Perfil"
                >
                  <User size={20} className="text-gray-600" />
                </Button>

                {/* Logout */}
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-9 w-9 rounded-full hover:bg-rose-50 text-rose-600"
                  onClick={handleLogout}
                  title="Sair"
                >
                  <LogOut size={20} />
                </Button>
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* ==================== CONTEÚDO PRINCIPAL ==================== */}
      <main className="pt-20 pb-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Saudação */}
          <div className="mb-6">
            <h1 className=" text-center text-3xl sm:text-4xl font-bold text-gray-900">
              Olá, {clientName.split(' ')[0]}!
            </h1>
            <p className="mt-2 text-lg text-center text-gray-600">
              Acompanhe suas reservas e atividades desportivas
            </p>
          </div>

          {/* ==================== CARD DO CALENDÁRIO CENTRALIZADO ==================== */}
          <div className="mb-12 dispaly-flex item-center">


            {/* Card do calendário ocupando boa parte da largura */}
            <div className="flex items-center justify-center">

              {/* Área do calendário - centralizado e com tamanho relativo */}
              <div className="p-6 flex justify-center">
                <div className="w-full max-w-[480px] h-[500px] aspect-square bg-white rounded-xl shadow-inner border border-gray-200 overflow-hidden">
                  <CalendarioGeralCard
                    onOpenModal={() => setShowCalendarioModal(true)}
                  />
                </div>
              </div>



            </div>
          </div>
        </div>
      </main>

      {/* ==================== MODAIS ==================== */}
      {showCalendarioModal && (
        <ModalCalendarioGeral
          isOpen={showCalendarioModal}
          onClose={() => setShowCalendarioModal(false)}
        />
      )}

      {showNotificacoesModal && (
        <NotificacoesModal
          userEmail={email}
          numeroCliente={numeroCliente}
          isOpen={showNotificacoesModal}
          onClose={() => setShowNotificacoesModal(false)}
        />
      )}

      {showPerfilModal && (
        <ModalPerfil
          isOpen={showPerfilModal}
          onClose={() => setShowPerfilModal(false)}
        />
      )}
    </div>
  );
}