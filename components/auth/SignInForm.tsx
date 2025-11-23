'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { z } from 'zod';

// Enums
const ClienteTipo = {
  SONANGOL: 'Sonangol',
  EXTERNO: 'Externo',
} as const;

const ClienteStatus = {
  ATIVO: 'ATIVO',
  INATIVO: 'INATIVO',
} as const;

// Schema de validação Zod
const clienteSchema = z.object({
  nome: z.string().min(3, 'Nome deve ter no mínimo 3 caracteres'),
  tipo: z.enum([ClienteTipo.SONANGOL, ClienteTipo.EXTERNO]),
  telefone: z.string().min(9, 'Telefone inválido'),
  whatsapp: z.string().optional(),
  email: z.string().email('E-mail inválido'),
  numeroCliente: z.string().min(1, 'Número do cliente é obrigatório'),
  biPassaporte: z.string().min(1, 'BI/Passaporte é obrigatório'),
  morada: z.string().optional(),
  senha: z.string().min(6, 'Senha deve ter no mínimo 6 caracteres'),
  confirmarSenha: z.string(),
}).refine((data) => data.senha === data.confirmarSenha, {
  message: 'As senhas não coincidem',
  path: ['confirmarSenha'],
});

type ClienteFormData = z.infer<typeof clienteSchema>;

export default function CadastroClienteForm() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<Partial<Record<keyof ClienteFormData, string>>>({});
  
  const [formData, setFormData] = useState<ClienteFormData>({
    nome: '',
    tipo: ClienteTipo.SONANGOL,
    telefone: '',
    whatsapp: '',
    email: '',
    numeroCliente: '',
    biPassaporte: '',
    morada: '',
    senha: '',
    confirmarSenha: '',
  });

  const handleChange = (field: keyof ClienteFormData, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: undefined }));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setErrors({});

    try {
      // Validação com Zod
      clienteSchema.parse(formData);

      // MOCK: Simula cadastro com dados falsos
      // const res = await clienteAPI.cadastrar(formData);
      setTimeout(() => {
        alert('Cliente cadastrado com sucesso!');
        router.push('/login');
        setLoading(false);
      }, 1500);
    } catch (error) {
      if (error instanceof z.ZodError) {
        const fieldErrors: Partial<Record<keyof ClienteFormData, string>> = {};
        (error as any).errors.forEach((err: any) => {
          if (err.path[0]) {
            fieldErrors[err.path[0] as keyof ClienteFormData] = err.message;
          }
        });
        setErrors(fieldErrors);
      }
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-cyan-50 text-gray-900 flex items-center justify-center px-4 sm:px-6 lg:px-8 py-8">
      <Card className="mx-auto max-w-2xl w-full border-0 shadow-lg bg-white">
        <CardHeader className="space-y-1 pb-6">
          <div className="flex items-center justify-center mb-4">
            <div className="w-16 h-16 flex items-center justify-center">
              <img src="./../images/ico-paz-flor.png" alt="Logo CPF" className="w-full h-full rounded-xl" />
            </div>
          </div>
          <CardTitle className="text-3xl font-bold text-center text-gray-900">Cadastro de Cliente</CardTitle>
          <CardDescription className="text-center text-gray-600">Preencha os dados abaixo para criar sua conta.</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-5">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              {/* Nome */}
              <div className="space-y-2 md:col-span-2">
                <Label htmlFor="nome" className="text-gray-700 font-medium">Nome Completo *</Label>
                <Input 
                  id="nome" 
                  type="text" 
                  placeholder="João da Silva" 
                  value={formData.nome} 
                  onChange={(e) => handleChange('nome', e.target.value)} 
                  className={`border-gray-300 focus:border-purple-600 focus:ring-purple-600 ${errors.nome ? 'border-red-500' : ''}`}
                />
                {errors.nome && <p className="text-red-500 text-sm">{errors.nome}</p>}
              </div>

              {/* Tipo */}
              <div className="space-y-2">
                <Label htmlFor="tipo" className="text-gray-700 font-medium">Tipo de Cliente *</Label>
                <Select value={formData.tipo} onValueChange={(value: any) => handleChange('tipo', value)}>
                  <SelectTrigger className={`border-gray-300 focus:border-purple-600 focus:ring-purple-600 ${errors.tipo ? 'border-red-500' : ''}`}>
                    <SelectValue placeholder="Selecione o tipo" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value={ClienteTipo.SONANGOL}>Pessoa Física</SelectItem>
                    <SelectItem value={ClienteTipo.EXTERNO}>Pessoa Jurídica</SelectItem>
                  </SelectContent>
                </Select>
                {errors.tipo && <p className="text-red-500 text-sm">{errors.tipo}</p>}
              </div>

              {/* Número do Cliente */}
              <div className="space-y-2">
                <Label htmlFor="numeroCliente" className="text-gray-700 font-medium">Número do Cliente *</Label>
                <Input 
                  id="numeroCliente" 
                  type="text" 
                  placeholder="ex: CLI-001" 
                  value={formData.numeroCliente} 
                  onChange={(e) => handleChange('numeroCliente', e.target.value)} 
                  className={`border-gray-300 focus:border-purple-600 focus:ring-purple-600 ${errors.numeroCliente ? 'border-red-500' : ''}`}
                />
                {errors.numeroCliente && <p className="text-red-500 text-sm">{errors.numeroCliente}</p>}
              </div>

              {/* BI/Passaporte */}
              <div className="space-y-2">
                <Label htmlFor="biPassaporte" className="text-gray-700 font-medium">BI/Passaporte *</Label>
                <Input 
                  id="biPassaporte" 
                  type="text" 
                  placeholder="000000000LA000" 
                  value={formData.biPassaporte} 
                  onChange={(e) => handleChange('biPassaporte', e.target.value)} 
                  className={`border-gray-300 focus:border-purple-600 focus:ring-purple-600 ${errors.biPassaporte ? 'border-red-500' : ''}`}
                />
                {errors.biPassaporte && <p className="text-red-500 text-sm">{errors.biPassaporte}</p>}
              </div>

              {/* E-mail */}
              <div className="space-y-2">
                <Label htmlFor="email" className="text-gray-700 font-medium">E-mail *</Label>
                <Input 
                  id="email" 
                  type="email" 
                  placeholder="cliente@email.com" 
                  value={formData.email} 
                  onChange={(e) => handleChange('email', e.target.value)} 
                  className={`border-gray-300 focus:border-purple-600 focus:ring-purple-600 ${errors.email ? 'border-red-500' : ''}`}
                />
                {errors.email && <p className="text-red-500 text-sm">{errors.email}</p>}
              </div>

              {/* Telefone */}
              <div className="space-y-2">
                <Label htmlFor="telefone" className="text-gray-700 font-medium">Telefone *</Label>
                <Input 
                  id="telefone" 
                  type="tel" 
                  placeholder="+244 900 000 000" 
                  value={formData.telefone} 
                  onChange={(e) => handleChange('telefone', e.target.value)} 
                  className={`border-gray-300 focus:border-purple-600 focus:ring-purple-600 ${errors.telefone ? 'border-red-500' : ''}`}
                />
                {errors.telefone && <p className="text-red-500 text-sm">{errors.telefone}</p>}
              </div>

              {/* WhatsApp */}
              <div className="space-y-2">
                <Label htmlFor="whatsapp" className="text-gray-700 font-medium">WhatsApp</Label>
                <Input 
                  id="whatsapp" 
                  type="tel" 
                  placeholder="+244 900 000 000" 
                  value={formData.whatsapp} 
                  onChange={(e) => handleChange('whatsapp', e.target.value)} 
                  className="border-gray-300 focus:border-purple-600 focus:ring-purple-600"
                />
              </div>

              {/* Morada */}
              <div className="space-y-2 md:col-span-2">
                <Label htmlFor="morada" className="text-gray-700 font-medium">Morada</Label>
                <Input 
                  id="morada" 
                  type="text" 
                  placeholder="Rua, Bairro, Município" 
                  value={formData.morada} 
                  onChange={(e) => handleChange('morada', e.target.value)} 
                  className="border-gray-300 focus:border-purple-600 focus:ring-purple-600"
                />
              </div>

              {/* Senha */}
              <div className="space-y-2">
                <Label htmlFor="senha" className="text-gray-700 font-medium">Senha *</Label>
                <Input 
                  id="senha" 
                  type="password" 
                  placeholder="Mínimo 6 caracteres" 
                  value={formData.senha} 
                  onChange={(e) => handleChange('senha', e.target.value)} 
                  className={`border-gray-300 focus:border-purple-600 focus:ring-purple-600 ${errors.senha ? 'border-red-500' : ''}`}
                />
                {errors.senha && <p className="text-red-500 text-sm">{errors.senha}</p>}
              </div>

              {/* Confirmar Senha */}
              <div className="space-y-2">
                <Label htmlFor="confirmarSenha" className="text-gray-700 font-medium">Confirmar Senha *</Label>
                <Input 
                  id="confirmarSenha" 
                  type="password" 
                  placeholder="Repita a senha" 
                  value={formData.confirmarSenha} 
                  onChange={(e) => handleChange('confirmarSenha', e.target.value)} 
                  className={`border-gray-300 focus:border-purple-600 focus:ring-purple-600 ${errors.confirmarSenha ? 'border-red-500' : ''}`}
                />
                {errors.confirmarSenha && <p className="text-red-500 text-sm">{errors.confirmarSenha}</p>}
              </div>
            </div>

            <Button type="submit" className="w-full bg-purple-600 hover:bg-purple-700 text-white py-6 text-base font-semibold mt-6" disabled={loading}>
              {loading ? 'Cadastrando...' : 'Criar Conta'}
            </Button>
          </form>

          <div className="mt-6 pt-6 border-t border-gray-200 text-center">
            <p className="text-sm text-gray-500">
              Já tem uma conta? <a href="/auth/login" className="text-purple-600 hover:text-purple-700 font-semibold">Faça login</a>
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}