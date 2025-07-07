
import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Button } from "@/components/ui/button";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { toast } from "@/hooks/use-toast";

const tutorSchema = z.object({
  nome: z.string().min(2, "Nome deve ter pelo menos 2 caracteres"),
  cpf: z.string().optional().or(z.literal('')),
  telefone: z.string().min(10, "Telefone inválido"),
  email: z.string().email("Email inválido").optional().or(z.literal('')),
  endereco: z.string().optional()
});

type TutorFormData = z.infer<typeof tutorSchema>;

interface TutorFormProps {
  onSave: (tutor: TutorFormData) => Promise<string>;
}

const TutorForm = ({ onSave }: TutorFormProps) => {
  const [isLoading, setIsLoading] = useState(false);

  const form = useForm<TutorFormData>({
    resolver: zodResolver(tutorSchema),
    defaultValues: {
      nome: '',
      cpf: '',
      telefone: '',
      email: '',
      endereco: ''
    }
  });

  const formatCPF = (value: string) => {
    return value
      .replace(/\D/g, '')
      .replace(/(\d{3})(\d)/, '$1.$2')
      .replace(/(\d{3})(\d)/, '$1.$2')
      .replace(/(\d{3})(\d{1,2})/, '$1-$2')
      .replace(/(-\d{2})\d+?$/, '$1');
  };

  const formatTelefone = (value: string) => {
    return value
      .replace(/\D/g, '')
      .replace(/(\d{2})(\d)/, '($1) $2')
      .replace(/(\d{4})(\d)/, '$1-$2')
      .replace(/(\d{4})-(\d)(\d{4})/, '$1$2-$3')
      .replace(/(-\d{4})\d+?$/, '$1');
  };

  const validateCPF = (cpf: string) => {
    if (!cpf || cpf.trim() === '') return true; // CPF é opcional agora
    
    const numbers = cpf.replace(/\D/g, '');
    if (numbers.length !== 11) return false;
    
    // Verificação básica de CPF
    if (/^(\d)\1+$/.test(numbers)) return false;
    
    let sum = 0;
    for (let i = 0; i < 9; i++) {
      sum += parseInt(numbers[i]) * (10 - i);
    }
    let remainder = (sum * 10) % 11;
    if (remainder === 10 || remainder === 11) remainder = 0;
    if (remainder !== parseInt(numbers[9])) return false;
    
    sum = 0;
    for (let i = 0; i < 10; i++) {
      sum += parseInt(numbers[i]) * (11 - i);
    }
    remainder = (sum * 10) % 11;
    if (remainder === 10 || remainder === 11) remainder = 0;
    return remainder === parseInt(numbers[10]);
  };

  const onSubmit = async (data: TutorFormData) => {
    setIsLoading(true);
    
    // Só valida CPF se foi preenchido
    if (data.cpf && data.cpf.trim() !== '' && !validateCPF(data.cpf)) {
      toast({
        title: "CPF Inválido",
        description: "Por favor, insira um CPF válido ou deixe em branco.",
        variant: "destructive"
      });
      setIsLoading(false);
      return;
    }

    try {
      await onSave(data);
      form.reset();
    } catch (error) {
      toast({
        title: "Erro",
        description: "Erro ao salvar tutor. Tente novamente.",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Card className="animate-fade-in">
      <CardHeader>
        <CardTitle className="text-crarar-primary">👤 Dados do Tutor</CardTitle>
        <CardDescription>
          Preencha as informações básicas do responsável pelo animal
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="nome"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Nome Completo *</FormLabel>
                  <FormControl>
                    <Input 
                      placeholder="Digite o nome completo"
                      className="focus:border-crarar-primary"
                      {...field} 
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="cpf"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>CPF (opcional)</FormLabel>
                    <FormControl>
                      <Input 
                        placeholder="000.000.000-00"
                        className="focus:border-crarar-primary"
                        {...field}
                        onChange={(e) => {
                          const formatted = formatCPF(e.target.value);
                          field.onChange(formatted);
                        }}
                        maxLength={14}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="telefone"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Telefone *</FormLabel>
                    <FormControl>
                      <Input 
                        placeholder="(00) 00000-0000"
                        className="focus:border-crarar-primary"
                        {...field}
                        onChange={(e) => {
                          const formatted = formatTelefone(e.target.value);
                          field.onChange(formatted);
                        }}
                        maxLength={15}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <FormField
              control={form.control}
              name="email"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Email</FormLabel>
                  <FormControl>
                    <Input 
                      type="email"
                      placeholder="email@exemplo.com"
                      className="focus:border-crarar-primary"
                      {...field} 
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="endereco"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Endereço Completo</FormLabel>
                  <FormControl>
                    <Input 
                      placeholder="Rua, número, bairro, cidade - CEP"
                      className="focus:border-crarar-primary"
                      {...field} 
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <Button 
              type="submit" 
              className="w-full bg-crarar-primary hover:bg-crarar-primary/90 transition-colors"
              disabled={isLoading}
            >
              {isLoading ? "Salvando..." : "Salvar Tutor"}
            </Button>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
};

export default TutorForm;
