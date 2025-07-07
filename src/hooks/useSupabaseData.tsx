import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/hooks/use-toast';

interface Tutor {
  id: string;
  nome: string;
  cpf: string;
  telefone: string;
  email?: string;
  endereco?: string;
}

interface Animal {
  id: string;
  tutor_id: string;
  nome: string;
  especie: string;
  raca: string;
  data_nascimento: string;
  sexo: string;
  cor: string;
  peso: number;
  data_adesao: string;
  created_at: string;
  updated_at: string;
}

interface Atendimento {
  id: string;
  animal_id: string;
  data: string;
  veterinario: string;
  sintomas: string;
  diagnostico: string;
  tratamento: string;
  medicamentos: string;
  observacoes: string | null;
  proximo_retorno: string | null;
  created_at: string;
  updated_at: string;
}

export function useSupabaseData() {
  const [tutores, setTutores] = useState<Tutor[]>([]);
  const [animais, setAnimais] = useState<Animal[]>([]);
  const [atendimentos, setAtendimentos] = useState<Atendimento[]>([]);
  const [loading, setLoading] = useState(true);

  const loadData = async () => {
    try {
      setLoading(true);
      
      // Load tutores
      const { data: tutoresData, error: tutoresError } = await supabase
        .from('tutores')
        .select('*')
        .order('nome');
      
      if (tutoresError) throw tutoresError;
      setTutores(tutoresData || []);

      // Load animais
      const { data: animaisData, error: animaisError } = await supabase
        .from('animais')
        .select('*')
        .order('nome');
      
      if (animaisError) throw animaisError;
      setAnimais(animaisData || []);

      // Load atendimentos
      const { data: atendimentosData, error: atendimentosError } = await supabase
        .from('atendimentos')
        .select('*')
        .order('data', { ascending: false });
      
      if (atendimentosError) throw atendimentosError;
      setAtendimentos(atendimentosData || []);

    } catch (error) {
      console.error('Error loading data:', error);
      toast({
        title: "Erro",
        description: "Erro ao carregar dados do servidor.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const saveTutor = async (tutor: Omit<Tutor, 'id'>) => {
    try {
      const { data, error } = await supabase
        .from('tutores')
        .insert(tutor)
        .select()
        .single();
      
      if (error) throw error;
      
      setTutores(prev => [...prev, data]);
      toast({
        title: "Sucesso!",
        description: "Tutor cadastrado com sucesso.",
      });
      return data.id;
    } catch (error) {
      console.error('Error saving tutor:', error);
      toast({
        title: "Erro",
        description: "Erro ao cadastrar tutor.",
        variant: "destructive",
      });
      throw error;
    }
  };

  const saveAnimal = async (animal: Omit<Animal, 'id' | 'data_adesao' | 'created_at' | 'updated_at'>) => {
    try {
      const { data, error } = await supabase
        .from('animais')
        .insert(animal)
        .select()
        .single();
      
      if (error) throw error;
      
      setAnimais(prev => [...prev, data]);
      toast({
        title: "Sucesso!",
        description: "Animal cadastrado com sucesso.",
      });
      return data.id;
    } catch (error) {
      console.error('Error saving animal:', error);
      toast({
        title: "Erro",
        description: "Erro ao cadastrar animal.",
        variant: "destructive",
      });
      throw error;
    }
  };

  const saveAtendimento = async (atendimento: Omit<Atendimento, 'id' | 'created_at' | 'updated_at'>) => {
    try {
      console.log('Saving atendimento:', atendimento);
      
      const { data, error } = await supabase
        .from('atendimentos')
        .insert(atendimento)
        .select()
        .single();
      
      if (error) {
        console.error('Supabase error:', error);
        throw error;
      }
      
      console.log('Atendimento saved:', data);
      setAtendimentos(prev => [data, ...prev]);
      
      return data.id;
    } catch (error) {
      console.error('Error saving atendimento:', error);
      throw error;
    }
  };

  const deleteAnimal = async (animalId: string) => {
    try {
      // First delete all atendimentos for this animal
      const { error: atendimentosError } = await supabase
        .from('atendimentos')
        .delete()
        .eq('animal_id', animalId);
      
      if (atendimentosError) throw atendimentosError;

      // Then delete the animal
      const { error: animalError } = await supabase
        .from('animais')
        .delete()
        .eq('id', animalId);
      
      if (animalError) throw animalError;

      // Update local state
      setAtendimentos(prev => prev.filter(a => a.animal_id !== animalId));
      setAnimais(prev => prev.filter(a => a.id !== animalId));

      toast({
        title: "Sucesso!",
        description: "Animal e seus atendimentos foram excluídos com sucesso.",
      });
    } catch (error) {
      console.error('Error deleting animal:', error);
      toast({
        title: "Erro",
        description: "Erro ao excluir animal.",
        variant: "destructive",
      });
      throw error;
    }
  };

  const deleteAtendimento = async (atendimentoId: string) => {
    try {
      const { error } = await supabase
        .from('atendimentos')
        .delete()
        .eq('id', atendimentoId);
      
      if (error) throw error;

      // Update local state
      setAtendimentos(prev => prev.filter(a => a.id !== atendimentoId));

      toast({
        title: "Sucesso!",
        description: "Atendimento excluído com sucesso.",
      });
    } catch (error) {
      console.error('Error deleting atendimento:', error);
      toast({
        title: "Erro",
        description: "Erro ao excluir atendimento.",
        variant: "destructive",
      });
      throw error;
    }
  };

  const updateAnimal = async (animalId: string, updatedData: Partial<Animal>) => {
    try {
      const { data, error } = await supabase
        .from('animais')
        .update(updatedData)
        .eq('id', animalId)
        .select()
        .single();
      
      if (error) throw error;

      // Update local state
      setAnimais(prev => prev.map(a => a.id === animalId ? data : a));

      toast({
        title: "Sucesso!",
        description: "Animal atualizado com sucesso.",
      });

      return data;
    } catch (error) {
      console.error('Error updating animal:', error);
      toast({
        title: "Erro",
        description: "Erro ao atualizar animal.",
        variant: "destructive",
      });
      throw error;
    }
  };

  const updateTutor = async (tutorId: string, updatedData: Partial<Tutor>) => {
    try {
      const { data, error } = await supabase
        .from('tutores')
        .update(updatedData)
        .eq('id', tutorId)
        .select()
        .single();
      
      if (error) throw error;

      // Update local state
      setTutores(prev => prev.map(t => t.id === tutorId ? data : t));

      toast({
        title: "Sucesso!",
        description: "Tutor atualizado com sucesso.",
      });

      return data;
    } catch (error) {
      console.error('Error updating tutor:', error);
      toast({
        title: "Erro",
        description: "Erro ao atualizar tutor.",
        variant: "destructive",
      });
      throw error;
    }
  };

  const updateAtendimento = async (atendimentoId: string, updatedData: Partial<Atendimento>) => {
    try {
      const { data, error } = await supabase
        .from('atendimentos')
        .update(updatedData)
        .eq('id', atendimentoId)
        .select()
        .single();
      
      if (error) throw error;

      // Update local state
      setAtendimentos(prev => prev.map(a => a.id === atendimentoId ? data : a));

      toast({
        title: "Sucesso!",
        description: "Atendimento atualizado com sucesso.",
      });

      return data;
    } catch (error) {
      console.error('Error updating atendimento:', error);
      toast({
        title: "Erro",
        description: "Erro ao atualizar atendimento.",
        variant: "destructive",
      });
      throw error;
    }
  };

  const getUsuarios = async () => {
    try {
      const { data, error } = await supabase
        .from('usuarios')
        .select('*')
        .eq('ativo', true)
        .order('nome');
      
      if (error) throw error;
      return data || [];
    } catch (error) {
      console.error('Error loading usuarios:', error);
      toast({
        title: "Erro",
        description: "Erro ao carregar usuários.",
        variant: "destructive",
      });
      return [];
    }
  };

  return {
    tutores,
    animais,
    atendimentos,
    loading,
    saveTutor,
    saveAnimal,
    saveAtendimento,
    deleteAnimal,
    deleteAtendimento,
    updateAnimal,
    updateTutor,
    updateAtendimento,
    setTutores,
    setAnimais,
    setAtendimentos,
    reloadData: loadData,
    getUsuarios,
  };
}
