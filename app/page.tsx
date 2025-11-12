'use client';
import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Calendar, Dumbbell, Users, Trophy, MapPin, Clock, CheckCircle, ArrowRight, Menu, X, Sparkles } from 'lucide-react';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import Link from 'next/link';

export default function CPFLandingPage() {
  const router = useRouter();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const services = [
    {
      icon: <Calendar className="w-8 h-8" />,
      title: "Reservas de Espaços",
      description: "Reserve quadras, salas de conferência e espaços para eventos com facilidade e acompanhe suas solicitações em tempo real.",
      color: "from-purple-500 to-purple-600",
      bgColor: "from-purple-50 to-purple-100"
    },
    {
      icon: <Dumbbell className="w-8 h-8" />,
      title: "Ginásio & Desporto",
      description: "Acesso completo ao ginásio com equipamentos modernos. Acompanhe suas sessões, metas e evolução física.",
      color: "from-emerald-500 to-emerald-600",
      bgColor: "from-emerald-50 to-emerald-100"
    },
    {
      icon: <Users className="w-8 h-8" />,
      title: "Gestão de Membros",
      description: "Gerencie sua conta, visualize seu perfil e mantenha seus dados sempre atualizados de forma simples.",
      color: "from-cyan-500 to-cyan-600",
      bgColor: "from-cyan-50 to-cyan-100"
    },
    {
      icon: <Trophy className="w-8 h-8" />,
      title: "Acompanhamento",
      description: "Monitore seu progresso, conquistas e histórico de atividades com relatórios detalhados e estatísticas.",
      color: "from-amber-500 to-amber-600",
      bgColor: "from-amber-50 to-amber-100"
    }
  ];

  const features = [
    "Reservas online 24/7",
    "Notificações em tempo real",
    "Histórico completo de atividades",
    "Pagamentos integrados",
    "Suporte dedicado",
    "Interface intuitiva"
  ];

  const handleLogin = () => {
    router.push('/auth/login');
  };

  return (
    <div className="min-h-screen bg-cyan-50 text-gray-900">
      {/* Navigation - Light theme with blue accents */}
      <nav className="fixed top-0 w-full bg-white/95 backdrop-blur-sm shadow-sm z-50 border-b border-blue-200/50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <div className="flex items-center space-x-3">
              <div className="w-12 h-12 flex items-center justify-center">
                <img src="./images/ico-paz-flor.png" alt="Logo CPF" className="w-full h-full" />
              </div>
              <div>
                <h1 className="text-xl font-bold text-gray-900">Centro Polivalente</h1>
                <p className="text-xs text-blue-600">Portal do Cliente</p>
              </div>
            </div>

            {/* Desktop Menu */}
            <div className="hidden md:flex items-center space-x-8">
              <a href="#services" className="text-gray-600 hover:text-purple-600 transition font-medium">Serviços</a>
              <a href="#features" className="text-gray-600 hover:text-purple-600 transition font-medium">Recursos</a>
              <a href="#about" className="text-gray-600 hover:text-purple-600 transition font-medium">Sobre</a>
              <Button 
                className="bg-purple-600 hover:bg-purple-700 text-white"
                onClick={handleLogin}
              >
                Entrar no Sistema
              </Button>
            </div>

            {/* Mobile Menu Button */}
            <button 
              className="md:hidden p-2 hover:bg-gray-100 rounded-lg text-purple-600"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            >
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>

          {/* Mobile Menu */}
          {mobileMenuOpen && (
            <div className="md:hidden py-4 border-t border-gray-200">
              <div className="flex flex-col space-y-4">
                <a href="#services" className="text-gray-600 hover:text-purple-600 transition font-medium">Serviços</a>
                <a href="#features" className="text-gray-600 hover:text-purple-600 transition font-medium">Recursos</a>
                <a href="#about" className="text-gray-600 hover:text-purple-600 transition font-medium">Sobre</a>
                <Button 
                  className="w-full bg-purple-600 hover:bg-purple-700 text-white"
                  onClick={handleLogin}
                >
                  Entrar no Sistema
                </Button>
              </div>
            </div>
          )}
        </div>
      </nav>

      {/* Hero Section - Enhanced with gradients */}
      <section className="pt-32 pb-20 px-6 lg:px-8">
        <div className="max-w-7xl mx-auto grid lg:grid-cols-2 gap-12 items-center">
          <div>
            <div className="inline-flex items-center space-x-2 bg-purple-100 text-purple-700 px-4 py-2 rounded-full text-sm font-medium mb-6">
              <Sparkles className="w-4 h-4" />
              <span>Plataforma Completa</span>
            </div>
            <h1 className="text-5xl md:text-6xl font-bold text-gray-900 mb-6 leading-tight">
              Acompanhe já as suas 
              <span className="block bg-gradient-to-r from-purple-600 to-cyan-600 bg-clip-text text-transparent">reservas </span>
            </h1>
            <p className="text-xl text-gray-600 mb-8 leading-relaxed">
              Monitore em tempo real suas reservas de espaços, atividades desportivas e sessões de ginásio. Gerencie pagamentos, cauções e histórico completo em um só lugar.
            </p>
            <div className="flex flex-col sm:flex-row gap-4">
              <Button 
                size="lg" 
                className="px-8 py-4 bg-gradient-to-r from-purple-600 to-purple-700 hover:from-purple-700 hover:to-purple-800 text-white rounded-xl font-semibold shadow-lg hover:shadow-xl transition-all flex items-center space-x-2 transform hover:scale-105"
                onClick={handleLogin}
              >
                <span>Entrar no Sistema</span>
                <ArrowRight className="w-5 h-5" />
              </Button>
              <Button variant="outline" size="lg" className="px-8 py-4 border-2 border-purple-300 text-purple-700 rounded-xl font-semibold hover:bg-purple-50 transition-all transform hover:scale-105">
                Saiba Mais
              </Button>
            </div>
          </div>

          <div className="relative">
            {/* Hero Image Placeholder - Adapt to sports theme */}
            <div className="bg-white/80 backdrop-blur-sm rounded-3xl shadow-2xl p-8 border border-purple-200">
              <div className="grid grid-cols-2 gap-4">
                <div className="bg-gradient-to-br from-purple-100 to-purple-200 rounded-2xl p-6 flex flex-col items-center justify-center hover:scale-105 transition-transform cursor-pointer shadow-md">
                  <div className="w-14 h-14 bg-gradient-to-br from-purple-500 to-purple-600 rounded-xl flex items-center justify-center mb-3 shadow-lg">
                    <Calendar className="w-7 h-7 text-white" />
                  </div>
                  <p className="text-sm font-bold text-gray-900">Reservas</p>
                </div>
                <div className="bg-gradient-to-br from-emerald-100 to-emerald-200 rounded-2xl p-6 flex flex-col items-center justify-center hover:scale-105 transition-transform cursor-pointer shadow-md">
                  <div className="w-14 h-14 bg-gradient-to-br from-emerald-500 to-emerald-600 rounded-xl flex items-center justify-center mb-3 shadow-lg">
                    <Dumbbell className="w-7 h-7 text-white" />
                  </div>
                  <p className="text-sm font-bold text-gray-900">Ginásio</p>
                </div>
                <div className="bg-gradient-to-br from-cyan-100 to-cyan-200 rounded-2xl p-6 flex flex-col items-center justify-center hover:scale-105 transition-transform cursor-pointer shadow-md">
                  <div className="w-14 h-14 bg-gradient-to-br from-cyan-500 to-cyan-600 rounded-xl flex items-center justify-center mb-3 shadow-lg">
                    <Users className="w-7 h-7 text-white" />
                  </div>
                  <p className="text-sm font-bold text-gray-900">Membros</p>
                </div>
                <div className="bg-gradient-to-br from-amber-100 to-amber-200 rounded-2xl p-6 flex flex-col items-center justify-center hover:scale-105 transition-transform cursor-pointer shadow-md">
                  <div className="w-14 h-14 bg-gradient-to-br from-amber-500 to-amber-600 rounded-xl flex items-center justify-center mb-3 shadow-lg">
                    <Trophy className="w-7 h-7 text-white" />
                  </div>
                  <p className="text-sm font-bold text-gray-900">Progresso</p>
                </div>
              </div>
            </div>
            {/* Decorative elements */}
            <div className="absolute -top-4 -right-4 w-32 h-32 bg-purple-200 rounded-full blur-3xl opacity-50"></div>
            <div className="absolute -bottom-4 -left-4 w-32 h-32 bg-cyan-200 rounded-full blur-3xl opacity-50"></div>
          </div>
        </div>
      </section>

      {/* Services Section - Using shadcn Card */}
      <section id="services" className="py-20 px-6 lg:px-8 bg-white">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <div className="inline-flex items-center space-x-2 bg-purple-100 text-purple-700 px-4 py-2 rounded-full text-sm font-medium mb-4">
              <Sparkles className="w-4 h-4" />
              <span>Nossos Serviços</span>
            </div>
            <h2 className="text-4xl font-bold text-gray-900 mb-4">Escolha & Aproveite</h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              Descubra nossos serviços e comece a gerenciar suas atividades hoje
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-8">
            {services.map((service, index) => (
              <Card key={index} className="group border-0 shadow-sm hover:shadow-2xl transition-all duration-300 overflow-hidden transform hover:-translate-y-2 rounded-2xl">
                <CardHeader className="pb-4">
                  <div className={`w-16 h-16 bg-gradient-to-br ${service.color} rounded-2xl flex items-center justify-center text-white mb-4 group-hover:scale-110 transition-transform shadow-lg`}>
                    {service.icon}
                  </div>
                  <CardTitle className="text-2xl font-bold text-gray-900">{service.title}</CardTitle>
                </CardHeader>
                <CardContent>
                  <CardDescription className="text-gray-600 leading-relaxed">{service.description}</CardDescription>
                </CardContent>
                <div className={`h-2 bg-gradient-to-r ${service.color}`}></div>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Features Section - Light theme */}
      <section id="features" className="py-20 px-6 lg:px-8 bg-gradient-to-br from-gray-50 to-purple-50">
        <div className="max-w-7xl mx-auto">
          <div className="grid md:grid-cols-2 gap-12 items-center">
            <div>
              <div className="inline-flex items-center space-x-2 bg-purple-100 text-purple-700 px-4 py-2 rounded-full text-sm font-medium mb-6">
                <Sparkles className="w-4 h-4" />
                <span>Recursos</span>
              </div>
              <h2 className="text-4xl font-bold text-gray-900 mb-6">
                Recursos Poderosos ao Seu Alcance
              </h2>
              <p className="text-lg text-gray-600 mb-8">
                Nossa plataforma foi desenvolvida para oferecer a melhor experiência na gestão de suas atividades e reservas.
              </p>
              <div className="space-y-4">
                {features.map((feature, index) => (
                  <div key={index} className="flex items-center space-x-3 bg-white rounded-xl p-4 shadow-sm hover:shadow-md transition-all">
                    <div className="w-10 h-10 bg-gradient-to-br from-purple-500 to-purple-600 rounded-xl flex items-center justify-center flex-shrink-0 shadow-md">
                      <CheckCircle className="w-5 h-5 text-white" />
                    </div>
                    <span className="text-gray-700 font-medium">{feature}</span>
                  </div>
                ))}
              </div>
            </div>

            <Card className="border-0 shadow-2xl bg-white overflow-hidden rounded-3xl">
              <CardHeader className="bg-gradient-to-r from-purple-600 to-purple-700 text-white p-6">
                <CardTitle className="text-2xl font-bold">Comece Hoje Mesmo</CardTitle>
                <CardDescription className="text-purple-100">
                  Acesse o portal do cliente e desfrute de todas as funcionalidades disponíveis para gerenciar suas reservas e atividades.
                </CardDescription>
              </CardHeader>
              <CardContent className="pt-0 space-y-6 p-6">
                <div className="flex items-center space-x-3 text-sm text-gray-600 p-4 bg-gradient-to-r from-blue-50 to-cyan-50 rounded-xl">
                  <div className="w-12 h-12 bg-gradient-to-br from-cyan-500 to-cyan-600 rounded-xl flex items-center justify-center shadow-md">
                    <MapPin className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Localização</p>
                    <p className="font-semibold text-gray-900">Luanda, Angola</p>
                  </div>
                </div>
                <div className="flex items-center space-x-3 text-sm text-gray-600 p-4 bg-gradient-to-r from-emerald-50 to-green-50 rounded-xl">
                  <div className="w-12 h-12 bg-gradient-to-br from-emerald-500 to-emerald-600 rounded-xl flex items-center justify-center shadow-md">
                    <Clock className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Disponibilidade</p>
                    <p className="font-semibold text-gray-900">Disponível 24/7</p>
                  </div>
                </div>
                <Button 
                  className="w-full py-4 bg-gradient-to-r from-purple-600 to-purple-700 hover:from-purple-700 hover:to-purple-800 text-white rounded-xl font-semibold shadow-lg hover:shadow-xl transition-all flex items-center space-x-2"
                  onClick={handleLogin}
                >
                  <span>Acessar Portal</span>
                  <ArrowRight className="w-4 h-4" />
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* CTA Section - Solid purple */}
      <section className="py-20 px-6 lg:px-8 bg-gradient-to-r from-purple-600 via-purple-700 to-cyan-600 relative overflow-hidden">
        <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHZpZXdCb3g9IjAgMCA2MCA2MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZyBmaWxsPSJub25lIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiPjxnIGZpbGw9IiNmZmYiIGZpbGwtb3BhY2l0eT0iMC4xIj48cGF0aCBkPSJNMzYgMzBoLTZ2LTZoNnYtNmg2djZoNnY2aC02djZoLTZ6Ii8+PC9nPjwvZz48L3N2Zz4=')] opacity-30"></div>
        <div className="max-w-4xl mx-auto text-center relative z-10">
          <h2 className="text-4xl md:text-5xl font-bold text-white mb-6">
            Pronto para Começar?
          </h2>
          <p className="text-xl text-purple-100 mb-10">
            Entre no sistema agora e tenha acesso completo a todos os nossos serviços
          </p>
          <Button 
            size="lg" 
            className="px-12 py-5 bg-white text-purple-600 hover:bg-gray-50 rounded-xl text-lg font-bold shadow-2xl hover:shadow-3xl transition-all flex items-center space-x-3 mx-auto transform hover:scale-105"
            onClick={handleLogin}
          >
            <span>Entrar no Sistema</span>
            <ArrowRight className="w-6 h-6" />
          </Button>
        </div>
      </section>

      {/* Footer - Light theme */}
      <footer className="bg-gradient-to-br from-gray-900 to-gray-800 text-white py-12 px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="grid md:grid-cols-4 gap-8 mb-8">
            <div className="md:col-span-2">
              <div className="flex items-center space-x-3 mb-4">
                <div className="w-10 h-10 bg-gradient-to-br from-purple-600 to-cyan-500 rounded-lg flex items-center justify-center shadow-lg">
                  <span className="text-white font-bold">CPF</span>
                </div>
                <span className="font-bold text-lg">Centro Polivalente</span>
              </div>
              <p className="text-gray-400 mb-4">
                Sua plataforma completa para gestão de reservas e atividades desportivas.
              </p>
            </div>
            <div>
              <h4 className="font-semibold mb-4 text-purple-400">Links Rápidos</h4>
              <ul className="space-y-2 text-gray-400">
                <li><a href="#services" className="hover:text-purple-400 transition">Serviços</a></li>
                <li><a href="#features" className="hover:text-purple-400 transition">Recursos</a></li>
                <li><a href="#about" className="hover:text-purple-400 transition">Sobre</a></li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold mb-4 text-purple-400">Suporte</h4>
              <ul className="space-y-2 text-gray-400">
                <li><a href="#" className="hover:text-purple-400 transition">Ajuda</a></li>
                <li><a href="#" className="hover:text-purple-400 transition">Contato</a></li>
                <li><a href="#" className="hover:text-purple-400 transition">FAQ</a></li>
              </ul>
            </div>
          </div>
          <div className="border-t border-gray-700 pt-8 text-center text-gray-400">
            <p>&copy; 2025 Centro Polivalente. Todos os direitos reservados.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}