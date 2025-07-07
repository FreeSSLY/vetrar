
import { useEffect, useState } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { useUsuarios } from '@/hooks/useUsuarios';
import LoginForm from '@/components/LoginForm';
import AtendenteInterface from '@/components/AtendenteInterface';

interface AuthWrapperProps {
  children: React.ReactNode;
}

export default function AuthWrapper({ children }: AuthWrapperProps) {
  const { session, loading: authLoading } = useAuth();
  const { currentUsuario, loading: usuarioLoading } = useUsuarios();
  const [initializing, setInitializing] = useState(true);

  useEffect(() => {
    // Aguarda ambos os hooks terminarem de carregar
    if (!authLoading && !usuarioLoading) {
      console.log('Auth carregado - Session:', !!session);
      console.log('Usuario carregado - CurrentUsuario:', !!currentUsuario);
      setInitializing(false);
    }
  }, [authLoading, usuarioLoading, session, currentUsuario]);

  // Mostra loading enquanto está inicializando
  if (initializing) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-crarar-secondary to-white flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-crarar-primary mx-auto"></div>
          <p className="mt-4 text-crarar-text">Carregando...</p>
        </div>
      </div>
    );
  }

  // Se há um usuário atendente logado, mostrar interface do atendente
  if (currentUsuario) {
    console.log('Mostrando interface do atendente para:', currentUsuario.nome);
    return <AtendenteInterface />;
  }

  // Se há uma sessão do Supabase Auth (admin), mostrar interface completa
  if (session) {
    console.log('Mostrando interface admin para sessão:', session.user.email);
    return <>{children}</>;
  }

  // Se não há nenhum usuário logado, mostrar tela de login
  console.log('Nenhum usuário logado, mostrando tela de login');
  return <LoginForm />;
}
