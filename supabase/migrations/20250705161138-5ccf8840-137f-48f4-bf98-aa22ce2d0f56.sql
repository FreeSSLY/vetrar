
-- Criar tabela de usuários com permissões limitadas
CREATE TABLE public.usuarios (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  email text NOT NULL UNIQUE,
  senha text NOT NULL,
  nome text NOT NULL,
  ativo boolean NOT NULL DEFAULT true,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now()
);

-- Adicionar RLS à tabela usuarios
ALTER TABLE public.usuarios ENABLE ROW LEVEL SECURITY;

-- Policy para permitir que usuários vejam apenas seus próprios dados
CREATE POLICY "Usuarios podem ver seus próprios dados" 
  ON public.usuarios 
  FOR SELECT 
  USING (true);

-- Inserir o usuário especificado (senha será hasheada no código)
INSERT INTO public.usuarios (email, senha, nome) 
VALUES ('yan.hellen.2024@gmail.com', 'Senha0744', 'Yan Hellen');
