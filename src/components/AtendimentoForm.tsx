
import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Button } from "@/components/ui/button";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { toast } from "@/hooks/use-toast";

const atendimentoSchema = z.object({
  animal_id: z.string().min(1, "Selecione um animal"),
  data: z.string().min(1, "Data é obrigatória"),
  veterinario: z.string().min(1, "Veterinário é obrigatório"),
  sintomas: z.string().min(1, "Sintomas são obrigatórios"),
  diagnostico: z.string().min(1, "Diagnóstico é obrigatório"),
  tratamento: z.string().min(1, "Tratamento é obrigatório"),
  medicamentos: z.string().optional(),
  observacoes: z.string().optional(),
  proximo_retorno: z.string().optional()
});

type AtendimentoFormData = z.infer<typeof atendimentoSchema>;

interface Animal {
  id: string;
  tutor_id: string;
  nome: string;
  especie: string;
}

interface Tutor {
  id: string;
  nome: string;
}

interface AtendimentoFormProps {
  animais: Animal[];
  tutores: Tutor[];
  onSave: (atendimento: AtendimentoFormData) => void;
}

const AtendimentoForm = ({ animais, tutores, onSave }: AtendimentoFormProps) => {
  const [isLoading, setIsLoading] = useState(false);
  const [selectedAnimal, setSelectedAnimal] = useState<Animal | null>(null);
  const [sintomasCount, setSintomasCount] = useState(0);

  const form = useForm<AtendimentoFormData>({
    resolver: zodResolver(atendimentoSchema),
    defaultValues: {
      animal_id: '',
      data: new Date().toISOString().split('T')[0],
      veterinario: '',
      sintomas: '',
      diagnostico: '',
      tratamento: '',
      medicamentos: '',
      observacoes: '',
      proximo_retorno: ''
    }
  });

  const onSubmit = async (data: AtendimentoFormData) => {
    setIsLoading(true);
    
    try {
      // Convert empty strings to null for optional fields
      const cleanedData = {
        ...data,
        medicamentos: data.medicamentos || '',
        observacoes: data.observacoes || null,
        proximo_retorno: data.proximo_retorno || null
      };

      await onSave(cleanedData);
      
      form.reset({
        animal_id: '',
        data: new Date().toISOString().split('T')[0],
        veterinario: '',
        sintomas: '',
        diagnostico: '',
        tratamento: '',
        medicamentos: '',
        observacoes: '',
        proximo_retorno: ''
      });
      setSelectedAnimal(null);
      setSintomasCount(0);
      
      toast({
        title: "Sucesso!",
        description: "Atendimento registrado com sucesso.",
      });
    } catch (error) {
      console.error('Erro ao salvar atendimento:', error);
      toast({
        title: "Erro",
        description: "Erro ao salvar atendimento. Tente novamente.",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  const getTutorByAnimal = (animalId: string) => {
    const animal = animais.find(a => a.id === animalId);
    if (!animal) return null;
    return tutores.find(t => t.id === animal.tutor_id);
  };

  return (
    <Card className="animate-fade-in">
      <CardHeader>
        <CardTitle className="text-crarar-primary">🩺 Registro de Atendimento</CardTitle>
        <CardDescription>
          Documente a consulta veterinária
        </CardDescription>
      </CardHeader>
      <CardContent>
        {animais.length === 0 ? (
          <div className="text-center py-8">
            <p className="text-muted-foreground mb-4">
              Você precisa cadastrar um animal primeiro para registrar um atendimento.
            </p>
            <Button variant="outline" onClick={() => toast({
              title: "Dica",
              description: "Vá para a aba 'Animal' e cadastre um pet primeiro."
            })}>
              Cadastrar Animal Primeiro
            </Button>
          </div>
        ) : (
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
              <FormField
                control={form.control}
                name="animal_id"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Animal *</FormLabel>
                    <Select onValueChange={(value) => {
                      field.onChange(value);
                      const animal = animais.find(a => a.id === value);
                      setSelectedAnimal(animal || null);
                    }} value={field.value}>
                      <FormControl>
                        <SelectTrigger className="focus:border-crarar-primary">
                          <SelectValue placeholder="Selecione o animal" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {animais.map((animal) => {
                          const tutor = getTutorByAnimal(animal.id);
                          return (
                            <SelectItem key={animal.id} value={animal.id}>
                              {animal.nome} ({animal.especie}) - {tutor?.nome}
                            </SelectItem>
                          );
                        })}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {selectedAnimal && (
                <div className="bg-crarar-secondary p-3 rounded-lg">
                  <p className="text-sm font-medium">Animal selecionado:</p>
                  <p className="text-sm text-crarar-text">
                    {selectedAnimal.nome} ({selectedAnimal.especie}) - Tutor: {getTutorByAnimal(selectedAnimal.id)?.nome}
                  </p>
                </div>
              )}

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="data"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Data do Atendimento *</FormLabel>
                      <FormControl>
                        <Input 
                          type="date"
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
                  name="veterinario"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Veterinário Responsável *</FormLabel>
                      <FormControl>
                        <Input 
                          placeholder="Dr(a). Nome do veterinário"
                          className="focus:border-crarar-primary"
                          {...field} 
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <FormField
                control={form.control}
                name="sintomas"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Sintomas Relatados *</FormLabel>
                    <FormControl>
                      <Textarea 
                        placeholder="Descreva os sintomas observados pelo tutor..."
                        className="focus:border-crarar-primary min-h-[100px]"
                        {...field}
                        onChange={(e) => {
                          field.onChange(e);
                          setSintomasCount(e.target.value.length);
                        }}
                      />
                    </FormControl>
                    <div className="flex justify-between">
                      <FormMessage />
                      <span className="text-xs text-muted-foreground">
                        {sintomasCount} caracteres
                      </span>
                    </div>
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="diagnostico"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Diagnóstico *</FormLabel>
                    <FormControl>
                      <Textarea 
                        placeholder="Diagnóstico médico veterinário..."
                        className="focus:border-crarar-primary min-h-[100px]"
                        {...field} 
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="tratamento"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Tratamento Prescrito *</FormLabel>
                    <FormControl>
                      <Textarea 
                        placeholder="Tratamento recomendado..."
                        className="focus:border-crarar-primary min-h-[100px]"
                        {...field} 
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="medicamentos"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Medicamentos</FormLabel>
                    <FormControl>
                      <Textarea 
                        placeholder="Medicamentos aplicados ou receitados..."
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
                name="observacoes"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Observações</FormLabel>
                    <FormControl>
                      <Textarea 
                        placeholder="Observações adicionais..."
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
                name="proximo_retorno"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Próximo Retorno</FormLabel>
                    <FormControl>
                      <Input 
                        type="date"
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
                {isLoading ? "Salvando..." : "Registrar Atendimento"}
              </Button>
            </form>
          </Form>
        )}
      </CardContent>
    </Card>
  );
};

export default AtendimentoForm;
