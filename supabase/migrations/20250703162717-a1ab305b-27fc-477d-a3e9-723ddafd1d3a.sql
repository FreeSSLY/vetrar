
-- Criar tabela de tutores
CREATE TABLE public.tutores (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  nome TEXT NOT NULL,
  cpf TEXT NOT NULL UNIQUE,
  telefone TEXT NOT NULL,
  email TEXT,
  endereco TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Criar tabela de animais
CREATE TABLE public.animais (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  tutor_id UUID NOT NULL REFERENCES public.tutores(id) ON DELETE CASCADE,
  nome TEXT NOT NULL,
  especie TEXT NOT NULL,
  raca TEXT NOT NULL,
  data_nascimento DATE NOT NULL,
  sexo TEXT NOT NULL CHECK (sexo IN ('Macho', 'Fêmea')),
  cor TEXT NOT NULL,
  peso DECIMAL(5,2) NOT NULL,
  data_adesao DATE NOT NULL DEFAULT CURRENT_DATE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Criar tabela de atendimentos
CREATE TABLE public.atendimentos (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  animal_id UUID NOT NULL REFERENCES public.animais(id) ON DELETE CASCADE,
  data DATE NOT NULL,
  veterinario TEXT NOT NULL,
  sintomas TEXT NOT NULL,
  diagnostico TEXT NOT NULL,
  tratamento TEXT NOT NULL,
  medicamentos TEXT NOT NULL,
  observacoes TEXT,
  proximo_retorno DATE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Habilitar RLS (Row Level Security) nas tabelas
ALTER TABLE public.tutores ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.animais ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.atendimentos ENABLE ROW LEVEL SECURITY;

-- Criar políticas RLS para usuários autenticados
CREATE POLICY "Authenticated users can view tutores"
  ON public.tutores FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Authenticated users can insert tutores"
  ON public.tutores FOR INSERT
  TO authenticated
  WITH CHECK (true);

CREATE POLICY "Authenticated users can update tutores"
  ON public.tutores FOR UPDATE
  TO authenticated
  USING (true);

CREATE POLICY "Authenticated users can delete tutores"
  ON public.tutores FOR DELETE
  TO authenticated
  USING (true);

-- Criar políticas RLS para animais
CREATE POLICY "Authenticated users can view animais"
  ON public.animais FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Authenticated users can insert animais"
  ON public.animais FOR INSERT
  TO authenticated
  WITH CHECK (true);

CREATE POLICY "Authenticated users can update animais"
  ON public.animais FOR UPDATE
  TO authenticated
  USING (true);

CREATE POLICY "Authenticated users can delete animais"
  ON public.animais FOR DELETE
  TO authenticated
  USING (true);

-- Criar políticas RLS para atendimentos
CREATE POLICY "Authenticated users can view atendimentos"
  ON public.atendimentos FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Authenticated users can insert atendimentos"
  ON public.atendimentos FOR INSERT
  TO authenticated
  WITH CHECK (true);

CREATE POLICY "Authenticated users can update atendimentos"
  ON public.atendimentos FOR UPDATE
  TO authenticated
  USING (true);

CREATE POLICY "Authenticated users can delete atendimentos"
  ON public.atendimentos FOR DELETE
  TO authenticated
  USING (true);
