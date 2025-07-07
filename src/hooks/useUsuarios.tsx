
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/hooks/use-toast';

interface Usuario {
  id: string;
  email: string;
  nome: string;
  ativo: boolean;
}

export function useUsuarios() {
  const [currentUsuario, setCurrentUsuario] = useState<Usuario | null>(null);
  const [loading, setLoading] = useState(true);

  const loginUsuario = async (email: string, senha: string): Promise<boolean> => {
    try {
      console.log('Tentando login do usuário:', email);
      
      const { data, error } = await supabase
        .from('usuarios')
        .select('*')
        .eq('email', email)
        .eq('senha', senha)
        .eq('ativo', true)
        .single();
      
      if (error || !data) {
        console.log('Login falhou:', error);
        return false;
      }

      console.log('Login bem-sucedido:', data);
      setCurrentUsuario(data);
      
      // Salvar no localStorage para persistir a sessão
      localStorage.setItem('usuario_limitado', JSON.stringify(data));
      
      toast({
        title: "Sucesso!",
        description: `Bem-vindo, ${data.nome}!`,
      });
      
      // Forçar atualização da página após login bem-sucedido
      setTimeout(() => {
        window.location.reload();
      }, 500);
      
      return true;
    } catch (error) {
      console.error('Error logging in usuario:', error);
      return false;
    }
  };

  const logoutUsuario = () => {
    console.log('Fazendo logout do usuário');
    setCurrentUsuario(null);
    localStorage.removeItem('usuario_limitado');
    toast({
      title: "Logout",
      description: "Você foi desconectado.",
    });
    
    // Forçar atualização da página após logout
    setTimeout(() => {
      window.location.reload();
    }, 500);
  };

  // Verificar se há usuário logado no localStorage
  useEffect(() => {
    const checkSavedUsuario = () => {
      console.log('Verificando usuário salvo...');
      const savedUsuario = localStorage.getItem('usuario_limitado');
      if (savedUsuario) {
        try {
          const usuario = JSON.parse(savedUsuario);
          console.log('Usuário encontrado no localStorage:', usuario);
          setCurrentUsuario(usuario);
        } catch (error) {
          console.error('Error parsing saved usuario:', error);
          localStorage.removeItem('usuario_limitado');
        }
      }
      setLoading(false);
    };

    checkSavedUsuario();
  }, []);

  return {
    currentUsuario,
    loginUsuario,
    logoutUsuario,
    loading,
  };
}
