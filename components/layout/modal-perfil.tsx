// components/perfil/ModalPerfil.tsx
'use client';

import React, { useEffect, useRef, useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { X, User, Lock, Mail, Phone, MapPin, FileText, Save, Loader2 } from 'lucide-react';
import { useAuth, useAuthStore } from '@/storage/atuh-storage';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useClienteReservasStore } from '@/storage/cliente-storage';

// Schema para dados pessoais
const perfilSchema = z.object({
    nome: z.string().min(3, 'Nome deve ter pelo menos 3 caracteres').max(100, 'Nome muito longo'),
    email: z.string().email('Email inválido').max(100, 'Email muito longo'),
    telefone: z.string()
        .min(9, 'Telefone inválido (mínimo 9 dígitos)')
        .max(15, 'Telefone muito longo')
        .regex(/^[+]?[0-9\s\-()]+$/, 'Telefone inválido'),
    whatsapp: z.string()
        .min(9, 'WhatsApp inválido (mínimo 9 dígitos)')
        .max(15, 'WhatsApp muito longo')
        .regex(/^[+]?[0-9\s\-()]+$/, 'WhatsApp inválido'),
    biPassaporte: z.string().optional().or(z.literal('')),
    morada: z.string().optional().or(z.literal('')),
});

// Schema para alteração de senha
const senhaSchema = z.object({
    senhaAtual: z.string()
        .min(6, 'Senha atual deve ter pelo menos 6 caracteres')
        .max(50, 'Senha muito longa'),
    novaSenha: z.string()
        .min(6, 'Nova senha deve ter pelo menos 6 caracteres')
        .max(50, 'Senha muito longa')
        .regex(/[A-Z]/, 'Deve conter pelo menos uma letra maiúscula')
        .regex(/[a-z]/, 'Deve conter pelo menos uma letra minúscula')
        .regex(/[0-9]/, 'Deve conter pelo menos um número'),
    confirmarSenha: z.string(),
}).refine((data) => data.novaSenha === data.confirmarSenha, {
    message: 'As senhas não coincidem',
    path: ['confirmarSenha'],
});

type PerfilFormData = z.infer<typeof perfilSchema>;
type SenhaFormData = z.infer<typeof senhaSchema>;

interface ModalPerfilProps {
    isOpen: boolean;
    onClose: () => void;
}

export const ModalPerfil: React.FC<ModalPerfilProps> = ({ isOpen, onClose }) => {
    const { user } = useAuth();
    const { alterarSenha, getProfile } = useAuthStore();
    const { updateClineteData, loading, error, clearError } = useClienteReservasStore();

    const [activeTab, setActiveTab] = useState<'dados' | 'senha'>('dados');
    const [successMessage, setSuccessMessage] = useState<string>('');
    const [isSubmitting, setIsSubmitting] = useState(false);
    const modalRef = useRef<HTMLDivElement>(null);
    // Formulário de dados pessoais
    const {
        register: registerPerfil,
        handleSubmit: handleSubmitPerfil,
        formState: { errors: errorsPerfil, isDirty: isDirtyPerfil },
        reset: resetPerfil,
        watch: watchPerfil,
    } = useForm<PerfilFormData>({
        resolver: zodResolver(perfilSchema),
        defaultValues: {
            nome: '',
            email: '',
            telefone: '',
            whatsapp: '',
            biPassaporte: '',
            morada: '',
        },
        mode: 'onChange',
    });

    // Formulário de alteração de senha
    const {
        register: registerSenha,
        handleSubmit: handleSubmitSenha,
        formState: { errors: errorsSenha, isDirty: isDirtySenha },
        reset: resetSenha,
        watch: watchSenha,
    } = useForm<SenhaFormData>({
        resolver: zodResolver(senhaSchema),
        defaultValues: {
            senhaAtual: '',
            novaSenha: '',
            confirmarSenha: '',
        },
        mode: 'onChange',
    });
    // 2. Obtenha os valores observados
    const senhaAtual = watchSenha('senhaAtual');
    const novaSenha = watchSenha('novaSenha');
    const confirmarSenha = watchSenha('confirmarSenha');
    // Atualizar formulário quando user mudar
    useEffect(() => {
        if (user && isOpen) {
            resetPerfil({
                nome: user.nome || '',
                email: user.email || '',
                telefone: user.telefone || '',
                whatsapp: user.whatsapp || '',
                biPassaporte: user.biPassaporte || '',
                morada: user.morada || '',
            });
        }
    }, [user, isOpen, resetPerfil]);

    // Limpar mensagens
    useEffect(() => {
        if (error || successMessage) {
            const timer = setTimeout(() => {
                clearError();
                setSuccessMessage('');
            }, 5000);
            return () => clearTimeout(timer);
        }
    }, [error, successMessage, clearError]);

    // Fechar modal com Escape
    useEffect(() => {
        const handleEsc = (e: KeyboardEvent) => {
            if (e.key === 'Escape' && isOpen) {
                onClose();
            }
        };
        window.addEventListener('keydown', handleEsc);
        return () => window.removeEventListener('keydown', handleEsc);
    }, [isOpen, onClose]);

    // Fechar modal ao clicar fora
    useEffect(() => {
        const handleClickOutside = (e: MouseEvent) => {
            // Verifica se o clique foi fora do conteúdo do modal
            if (
                isOpen &&
                modalRef.current &&
                !modalRef.current.contains(e.target as Node) &&
                // Verifica se o clique foi no overlay (background)
                (e.target as HTMLElement).hasAttribute('data-modal-overlay')
            ) {
                onClose();
            }
        };

        if (isOpen) {
            // Adiciona um pequeno delay para evitar fechamento imediato
            const timer = setTimeout(() => {
                window.addEventListener('click', handleClickOutside);
            }, 10);

            return () => {
                clearTimeout(timer);
                window.removeEventListener('click', handleClickOutside);
            };
        }

        return () => {
            window.removeEventListener('click', handleClickOutside);
        };
    }, [isOpen, onClose]);

    if (!isOpen) return null;

    // Handler para atualizar dados pessoais
    const onSubmitPerfil = async (data: PerfilFormData) => {
        if (!user) return;

        setIsSubmitting(true);
        clearError();
        setSuccessMessage('');

        try {
            // Preparar dados para envio
            const updateData = {
                _id: user._id,
                ...data,
            };

            const result = await updateClineteData(updateData);

            // Atualizar perfil no auth store
            await getProfile();

            setSuccessMessage('Dados pessoais atualizados com sucesso!');
            setIsSubmitting(false);

            // Resetar formulário para refletir mudanças
            resetPerfil(data);
        } catch (err) {
            console.error('Erro ao atualizar dados:', err);
            setIsSubmitting(false);
        }
    };

    // Handler para alterar senha
    const onSubmitSenha = async (data: SenhaFormData) => {
        setIsSubmitting(true);
        clearError();
        setSuccessMessage('');

        try {
            await alterarSenha({
                senhaAtual: data.senhaAtual,
                novaSenha: data.novaSenha,
            });

            setSuccessMessage('Senha alterada com sucesso!');
            resetSenha();
            setIsSubmitting(false);
        } catch (err) {
            console.error('Erro ao alterar senha:', err);
            setIsSubmitting(false);
        }
    };

    // Função para formatar data
    const formatDate = (dateString?: string) => {
        if (!dateString) return 'Nunca';
        try {
            return new Date(dateString).toLocaleDateString('pt-AO', {
                day: '2-digit',
                month: 'short',
                year: 'numeric',
                hour: '2-digit',
                minute: '2-digit',
            });
        } catch {
            return 'Data inválida';
        }
    };

    // Observar mudanças nos campos
    const watchFields = watchPerfil();

    return (
        <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm" data-modal-overlay>
            <div ref={modalRef} className="relative w-full max-w-4xl max-h-[90vh] overflow-hidden bg-white rounded-2xl shadow-2xl flex flex-col" onClick={(e) => e.stopPropagation()}>
                {/* Header */}
                <div className="flex items-center justify-between p-6 border-b border-gray-200 bg-gradient-to-r from-purple-50 to-white">
                    <div className="flex items-center space-x-3">
                        <div className="w-10 h-10 bg-gradient-to-br from-purple-500 to-purple-600 rounded-lg flex items-center justify-center shadow-lg">
                            <User className="w-5 h-5 text-white" />
                        </div>
                        <div>
                            <h2 className="text-2xl font-bold text-gray-900">Meu Perfil</h2>
                            <p className="text-sm text-gray-600">Gerencie suas informações pessoais e segurança</p>
                        </div>
                    </div>
                    <button
                        onClick={onClose}
                        className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-gray-100 transition-colors"
                        aria-label="Fechar"
                    >
                        <X className="w-5 h-5 text-gray-500" />
                    </button>
                </div>

                {/* Alertas */}
                <div className="px-6 pt-4">
                    {error && (
                        <div className="mb-4 bg-red-50 border border-red-200 rounded-lg p-4 animate-in slide-in-from-top-2">
                            <div className="flex items-center">
                                <div className="flex-shrink-0">
                                    <svg className="h-5 w-5 text-red-400" viewBox="0 0 20 20" fill="currentColor">
                                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                                    </svg>
                                </div>
                                <div className="ml-3">
                                    <p className="text-sm text-red-700">{error}</p>
                                </div>
                            </div>
                        </div>
                    )}

                    {successMessage && (
                        <div className="mb-4 bg-green-50 border border-green-200 rounded-lg p-4 animate-in slide-in-from-top-2">
                            <div className="flex items-center">
                                <div className="flex-shrink-0">
                                    <svg className="h-5 w-5 text-green-400" viewBox="0 0 20 20" fill="currentColor">
                                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                                    </svg>
                                </div>
                                <div className="ml-3">
                                    <p className="text-sm text-green-700">{successMessage}</p>
                                </div>
                            </div>
                        </div>
                    )}
                </div>

                {/* Conteúdo */}
                <div className="flex-1 overflow-y-auto p-6">
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                        {/* Coluna Esquerda - Informações do Sistema */}
                        <div className="lg:col-span-1">
                            <Card className="border-0 shadow-md rounded-xl bg-gradient-to-b from-gray-50 to-white">
                                <CardHeader className="pb-3">
                                    <CardTitle className="text-lg font-bold text-gray-900">
                                        Informações do Sistema
                                    </CardTitle>
                                </CardHeader>
                                <CardContent className="space-y-4">
                                    <div className="space-y-3">
                                        <div>
                                            <p className="text-xs font-medium text-gray-500 mb-1">Número do Cliente</p>
                                            <div className="px-3 py-2 bg-gray-100 rounded-lg">
                                                <p className="text-sm font-bold text-gray-900">{user?.numeroCliente}</p>
                                            </div>
                                        </div>

                                        <div>
                                            <p className="text-xs font-medium text-gray-500 mb-1">Tipo de Cliente</p>
                                            <Badge className="bg-gradient-to-r from-purple-100 to-purple-50 text-purple-700 border border-purple-200 px-3 py-1">
                                                {user?.tipo ? user.tipo.charAt(0).toUpperCase() + user.tipo.slice(1) : '-'}
                                            </Badge>
                                        </div>

                                        <div>
                                            <p className="text-xs font-medium text-gray-500 mb-1">Status da Conta</p>
                                            <Badge className={`
                        px-3 py-1 border font-medium
                        ${user?.status === 'Ativo'
                                                    ? 'bg-gradient-to-r from-emerald-100 to-emerald-50 text-emerald-700 border-emerald-200'
                                                    : 'bg-gradient-to-r from-amber-100 to-amber-50 text-amber-700 border-amber-200'
                                                }
                      `}>
                                                {user?.status || 'Desconhecido'}
                                            </Badge>
                                        </div>

                                        <div>
                                            <p className="text-xs font-medium text-gray-500 mb-1">Último Acesso</p>
                                            <div className="px-3 py-2 bg-gray-100 rounded-lg">
                                                <p className="text-sm font-medium text-gray-900">
                                                    {formatDate(user?.webCredencial?.lastLogin)}
                                                </p>
                                            </div>
                                        </div>

                                        <div>
                                            <p className="text-xs font-medium text-gray-500 mb-1">Conta Criada</p>
                                            <div className="px-3 py-2 bg-gray-100 rounded-lg">
                                                <p className="text-sm font-medium text-gray-900">
                                                    {formatDate(user?.createdAt)}
                                                </p>
                                            </div>
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>

                            {/* Dicas de Segurança */}
                            <Card className="border-0 shadow-md rounded-xl bg-gradient-to-b from-blue-50 to-white mt-6">
                                <CardHeader className="pb-3">
                                    <CardTitle className="text-lg font-bold text-gray-900 flex items-center space-x-2">
                                        <Lock className="w-4 h-4 text-blue-600" />
                                        <span>Dicas de Segurança</span>
                                    </CardTitle>
                                </CardHeader>
                                <CardContent>
                                    <ul className="space-y-2 text-sm text-gray-700">
                                        <li className="flex items-start space-x-2">
                                            <div className="w-5 h-5 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0">
                                                <span className="text-xs font-bold text-blue-600">1</span>
                                            </div>
                                            <span>Use uma senha forte com caracteres especiais</span>
                                        </li>
                                        <li className="flex items-start space-x-2">
                                            <div className="w-5 h-5 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0">
                                                <span className="text-xs font-bold text-blue-600">2</span>
                                            </div>
                                            <span>Nunca compartilhe suas credenciais de login</span>
                                        </li>
                                        <li className="flex items-start space-x-2">
                                            <div className="w-5 h-5 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0">
                                                <span className="text-xs font-bold text-blue-600">3</span>
                                            </div>
                                            <span>Mantenha seus dados de contato atualizados</span>
                                        </li>
                                    </ul>
                                </CardContent>
                            </Card>
                        </div>

                        {/* Coluna Direita - Formulários */}
                        <div className="lg:col-span-2">
                            {/* Tabs */}
                            <div className="flex space-x-1 bg-gray-100 rounded-lg p-1 mb-6">
                                <button
                                    onClick={() => setActiveTab('dados')}
                                    className={`
                    flex-1 px-4 py-2.5 rounded-md text-sm font-semibold transition-all
                    ${activeTab === 'dados'
                                            ? 'bg-white text-gray-900 shadow-sm'
                                            : 'text-gray-600 hover:text-gray-900'
                                        }
                  `}
                                >
                                    <div className="flex items-center justify-center space-x-2">
                                        <User className="w-4 h-4" />
                                        <span>Dados Pessoais</span>
                                    </div>
                                </button>
                                <button
                                    onClick={() => setActiveTab('senha')}
                                    className={`
                    flex-1 px-4 py-2.5 rounded-md text-sm font-semibold transition-all
                    ${activeTab === 'senha'
                                            ? 'bg-white text-gray-900 shadow-sm'
                                            : 'text-gray-600 hover:text-gray-900'
                                        }
                  `}
                                >
                                    <div className="flex items-center justify-center space-x-2">
                                        <Lock className="w-4 h-4" />
                                        <span>Alterar Senha</span>
                                    </div>
                                </button>
                            </div>

                            {/* Formulário Ativo */}
                            {activeTab === 'dados' ? (
                                <form onSubmit={handleSubmitPerfil(onSubmitPerfil)} className="space-y-6">
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        {/* Nome */}
                                        <div className="space-y-2">
                                            <label htmlFor="nome" className="text-sm font-medium text-gray-700 flex items-center space-x-1">
                                                <User className="w-4 h-4 text-gray-500" />
                                                <span>Nome Completo *</span>
                                            </label>
                                            <input
                                                type="text"
                                                id="nome"
                                                {...registerPerfil('nome')}
                                                className={`
                          w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all
                          ${errorsPerfil.nome
                                                        ? 'border-red-300 bg-red-50'
                                                        : 'border-gray-300 hover:border-gray-400'
                                                    }
                        `}
                                                placeholder="Digite seu nome completo"
                                            />
                                            {errorsPerfil.nome && (
                                                <p className="text-xs text-red-600 animate-in slide-in-from-top-2">
                                                    {errorsPerfil.nome.message}
                                                </p>
                                            )}
                                        </div>

                                        {/* Email */}
                                        <div className="space-y-2">
                                            <label htmlFor="email" className="text-sm font-medium text-gray-700 flex items-center space-x-1">
                                                <Mail className="w-4 h-4 text-gray-500" />
                                                <span>Email *</span>
                                            </label>
                                            <input
                                                type="email"
                                                disabled
                                                id="email"
                                                {...registerPerfil('email')}
                                                className={`
                                                w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all
                                                ${errorsPerfil.email
                                                        ? 'border-red-300 bg-red-50'
                                                        : 'border-gray-300 hover:border-gray-400'
                                                    }
                                                `}
                                                placeholder="seu@email.com"
                                            />
                                            {errorsPerfil.email && (
                                                <p className="text-xs text-red-600 animate-in slide-in-from-top-2">
                                                    {errorsPerfil.email.message}
                                                </p>
                                            )}
                                        </div>

                                        {/* Telefone */}
                                        <div className="space-y-2">
                                            <label htmlFor="telefone" className="text-sm font-medium text-gray-700 flex items-center space-x-1">
                                                <Phone className="w-4 h-4 text-gray-500" />
                                                <span>Telefone *</span>
                                            </label>
                                            <input
                                                type="tel"
                                                id="telefone"
                                                {...registerPerfil('telefone')}
                                                className={`
                          w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all
                          ${errorsPerfil.telefone
                                                        ? 'border-red-300 bg-red-50'
                                                        : 'border-gray-300 hover:border-gray-400'
                                                    }
                        `}
                                                placeholder="+244 900 000 000"
                                            />
                                            {errorsPerfil.telefone && (
                                                <p className="text-xs text-red-600 animate-in slide-in-from-top-2">
                                                    {errorsPerfil.telefone.message}
                                                </p>
                                            )}
                                        </div>

                                        {/* WhatsApp */}
                                        <div className="space-y-2">
                                            <label htmlFor="whatsapp" className="text-sm font-medium text-gray-700 flex items-center space-x-1">
                                                <Phone className="w-4 h-4 text-gray-500" />
                                                <span>WhatsApp *</span>
                                            </label>
                                            <input
                                                type="tel"
                                                id="whatsapp"
                                                {...registerPerfil('whatsapp')}
                                                className={`
                          w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all
                          ${errorsPerfil.whatsapp
                                                        ? 'border-red-300 bg-red-50'
                                                        : 'border-gray-300 hover:border-gray-400'
                                                    }
                        `}
                                                placeholder="+244 900 000 000"
                                            />
                                            {errorsPerfil.whatsapp && (
                                                <p className="text-xs text-red-600 animate-in slide-in-from-top-2">
                                                    {errorsPerfil.whatsapp.message}
                                                </p>
                                            )}
                                        </div>

                                        {/* BI/Passaporte */}
                                        <div className="space-y-2">
                                            <label htmlFor="biPassaporte" className="text-sm font-medium text-gray-700 flex items-center space-x-1">
                                                <FileText className="w-4 h-4 text-gray-500" />
                                                <span>BI/Passaporte</span>
                                            </label>
                                            <input
                                                type="text"
                                                id="biPassaporte"
                                                {...registerPerfil('biPassaporte')}
                                                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all hover:border-gray-400"
                                                placeholder="Número do documento"
                                            />
                                        </div>

                                        {/* Morada */}
                                        <div className="space-y-2 md:col-span-2">
                                            <label htmlFor="morada" className="text-sm font-medium text-gray-700 flex items-center space-x-1">
                                                <MapPin className="w-4 h-4 text-gray-500" />
                                                <span>Morada</span>
                                            </label>
                                            <textarea
                                                id="morada"
                                                {...registerPerfil('morada')}
                                                rows={2}
                                                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all hover:border-gray-400 resize-none"
                                                placeholder="Endereço completo (rua, bairro, cidade)"
                                            />
                                        </div>
                                    </div>

                                    {/* Botões Dados Pessoais */}
                                    <div className="flex items-center justify-between pt-6 border-t border-gray-200">
                                        <div className="text-sm text-gray-500">
                                            {isDirtyPerfil && (
                                                <span className="text-amber-600 animate-pulse">⚠️ Há alterações não salvas</span>
                                            )}
                                        </div>
                                        <div className="flex space-x-3">
                                            <Button
                                                type="button"
                                                variant="outline"
                                                onClick={() => {
                                                    resetPerfil({
                                                        nome: user?.nome || '',
                                                        email: user?.email || '',
                                                        telefone: user?.telefone || '',
                                                        whatsapp: user?.whatsapp || '',
                                                        biPassaporte: user?.biPassaporte || '',
                                                        morada: user?.morada || '',
                                                    });
                                                }}
                                                disabled={isSubmitting || loading || !isDirtyPerfil}
                                                className="px-4 py-2 border-2 border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 disabled:opacity-50"
                                            >
                                                Descartar
                                            </Button>
                                            <Button
                                                type="submit"
                                                disabled={isSubmitting || loading || !isDirtyPerfil}
                                                className="px-4 py-2 bg-gradient-to-r from-purple-600 to-purple-700 text-white rounded-lg font-medium hover:from-purple-700 hover:to-purple-800 disabled:opacity-50 disabled:cursor-not-allowed"
                                            >
                                                {(isSubmitting || loading) ? (
                                                    <span className="flex items-center space-x-2">
                                                        <Loader2 className="w-4 h-4 animate-spin" />
                                                        <span>Salvando...</span>
                                                    </span>
                                                ) : (
                                                    <span className="flex items-center space-x-2">
                                                        <Save className="w-4 h-4" />
                                                        <span>Salvar Alterações</span>
                                                    </span>
                                                )}
                                            </Button>
                                        </div>
                                    </div>
                                </form>
                            ) : (
                                <form onSubmit={handleSubmitSenha(onSubmitSenha)} className="space-y-6">
                                    <div className="space-y-4">
                                        {/* Senha Atual */}
                                        <div className="space-y-2">
                                            <label htmlFor="senhaAtual" className="text-sm font-medium text-gray-700">
                                                Senha Atual *
                                            </label>
                                            <input
                                                type="password"
                                                id="senhaAtual"
                                                {...registerSenha('senhaAtual')}
                                                className={`
                          w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all
                          ${errorsSenha.senhaAtual
                                                        ? 'border-red-300 bg-red-50'
                                                        : 'border-gray-300 hover:border-gray-400'
                                                    }
                        `}
                                                placeholder="Digite sua senha atual"
                                            />
                                            {errorsSenha.senhaAtual && (
                                                <p className="text-xs text-red-600 animate-in slide-in-from-top-2">
                                                    {errorsSenha.senhaAtual.message}
                                                </p>
                                            )}
                                        </div>

                                        {/* Nova Senha */}
                                        <div className="space-y-2">
                                            <label htmlFor="novaSenha" className="text-sm font-medium text-gray-700">
                                                Nova Senha *
                                            </label>
                                            <input
                                                type="password"
                                                id="novaSenha"
                                                {...registerSenha('novaSenha')}
                                                className={`
                          w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all
                          ${errorsSenha.novaSenha
                                                        ? 'border-red-300 bg-red-50'
                                                        : 'border-gray-300 hover:border-gray-400'
                                                    }
                        `}
                                                placeholder="Mínimo 6 caracteres com maiúscula, minúscula e número"
                                            />
                                            {errorsSenha.novaSenha && (
                                                <p className="text-xs text-red-600 animate-in slide-in-from-top-2">
                                                    {errorsSenha.novaSenha.message}
                                                </p>
                                            )}
                                        </div>

                                        {/* Confirmar Senha */}
                                        <div className="space-y-2">
                                            <label htmlFor="confirmarSenha" className="text-sm font-medium text-gray-700">
                                                Confirmar Nova Senha *
                                            </label>
                                            <input
                                                type="password"
                                                id="confirmarSenha"
                                                {...registerSenha('confirmarSenha')}
                                                className={`
                          w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all
                          ${errorsSenha.confirmarSenha
                                                        ? 'border-red-300 bg-red-50'
                                                        : 'border-gray-300 hover:border-gray-400'
                                                    }
                        `}
                                                placeholder="Digite a nova senha novamente"
                                            />
                                            {errorsSenha.confirmarSenha && (
                                                <p className="text-xs text-red-600 animate-in slide-in-from-top-2">
                                                    {errorsSenha.confirmarSenha.message}
                                                </p>
                                            )}
                                        </div>
                                    </div>

                                    {/* Requisitos da Senha */}
                                    <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                                        <h4 className="text-sm font-medium text-blue-800 mb-2">Requisitos da Senha:</h4>
                                        <ul className="grid grid-cols-1 md:grid-cols-2 gap-2 text-sm text-blue-700">
                                            <li className="flex items-center space-x-2">
                                                <div className={`w-4 h-4 rounded-full flex items-center justify-center ${novaSenha?.length >= 6 ? 'bg-emerald-100 text-emerald-600' : 'bg-gray-100 text-gray-400'
                                                    }`}>
                                                    {novaSenha?.length >= 6 ? '✓' : '○'}
                                                </div>
                                                <span>Mínimo 6 caracteres</span>
                                            </li>
                                            <li className="flex items-center space-x-2">
                                                <div className={`w-4 h-4 rounded-full flex items-center justify-center ${/[A-Z]/.test(novaSenha || '') ? 'bg-emerald-100 text-emerald-600' : 'bg-gray-100 text-gray-400'
                                                    }`}>
                                                    {/[A-Z]/.test(novaSenha || '') ? '✓' : '○'}
                                                </div>
                                                <span>Uma letra maiúscula</span>
                                            </li>
                                            <li className="flex items-center space-x-2">
                                                <div className={`w-4 h-4 rounded-full flex items-center justify-center ${/[a-z]/.test(novaSenha || '') ? 'bg-emerald-100 text-emerald-600' : 'bg-gray-100 text-gray-400'
                                                    }`}>
                                                    {/[a-z]/.test(novaSenha || '') ? '✓' : '○'}
                                                </div>
                                                <span>Uma letra minúscula</span>
                                            </li>
                                            <li className="flex items-center space-x-2">
                                                <div className={`w-4 h-4 rounded-full flex items-center justify-center ${/[0-9]/.test(novaSenha || '') ? 'bg-emerald-100 text-emerald-600' : 'bg-gray-100 text-gray-400'
                                                    }`}>
                                                    {/[0-9]/.test(novaSenha || '') ? '✓' : '○'}
                                                </div>
                                                <span>Um número</span>
                                            </li>
                                        </ul>
                                    </div>

                                    {/* Botões Alterar Senha */}
                                    <div className="flex items-center justify-between pt-6 border-t border-gray-200">
                                        <div className="text-sm text-gray-500">
                                            {isDirtySenha && (
                                                <span className="text-amber-600 animate-pulse">⚠️ Há alterações não salvas</span>
                                            )}
                                        </div>
                                        <div className="flex space-x-3">
                                            <Button
                                                type="button"
                                                variant="outline"
                                                onClick={() => resetSenha()}
                                                disabled={isSubmitting || !isDirtySenha}
                                                className="px-4 py-2 border-2 border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 disabled:opacity-50"
                                            >
                                                Limpar
                                            </Button>
                                            <Button
                                                type="submit"
                                                disabled={isSubmitting || !isDirtySenha}
                                                className="px-4 py-2 bg-gradient-to-r from-purple-600 to-purple-700 text-white rounded-lg font-medium hover:from-purple-700 hover:to-purple-800 disabled:opacity-50 disabled:cursor-not-allowed"
                                            >
                                                {isSubmitting ? (
                                                    <span className="flex items-center space-x-2">
                                                        <Loader2 className="w-4 h-4 animate-spin" />
                                                        <span>Alterando...</span>
                                                    </span>
                                                ) : (
                                                    <span className="flex items-center space-x-2">
                                                        <Lock className="w-4 h-4" />
                                                        <span>Alterar Senha</span>
                                                    </span>
                                                )}
                                            </Button>
                                        </div>
                                    </div>
                                </form>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};