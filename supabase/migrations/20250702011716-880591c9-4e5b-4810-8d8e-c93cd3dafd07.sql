
-- Criar tabela de perfis de usuário
CREATE TABLE public.profiles (
  id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  nome TEXT NOT NULL,
  email TEXT NOT NULL,
  role TEXT NOT NULL DEFAULT 'teste' CHECK (role IN ('admin', 'teste')),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  PRIMARY KEY (id)
);

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
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.tutores ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.animais ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.atendimentos ENABLE ROW LEVEL SECURITY;

-- Criar políticas RLS para profiles
CREATE POLICY "Users can view their own profile"
  ON public.profiles FOR SELECT
  USING (auth.uid() = id);

CREATE POLICY "Users can update their own profile"
  ON public.profiles FOR UPDATE
  USING (auth.uid() = id);

-- Criar políticas RLS para tutores (admins e usuários teste podem acessar)
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

-- Criar função para criar perfil automaticamente quando usuário se registra
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER SET search_path = public
AS $$
BEGIN
  INSERT INTO public.profiles (id, nome, email, role)
  VALUES (
    new.id,
    COALESCE(new.raw_user_meta_data->>'nome', new.email),
    new.email,
    COALESCE(new.raw_user_meta_data->>'role', 'teste')
  );
  RETURN new;
END;
$$;

-- Criar trigger para executar a função quando usuário é criado
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Inserir dados de exemplo dos tutores
INSERT INTO public.tutores (id, nome, cpf, telefone, email, endereco) VALUES
('11111111-1111-1111-1111-111111111111', 'Maria Silva Santos', '123.456.789-01', '(11) 98765-4321', 'maria.silva@email.com', 'Rua das Flores, 123 - Centro - São Paulo/SP'),
('22222222-2222-2222-2222-222222222222', 'João Carlos Oliveira', '987.654.321-09', '(11) 91234-5678', 'joao.carlos@email.com', 'Av. Paulista, 456 - Bela Vista - São Paulo/SP'),
('33333333-3333-3333-3333-333333333333', 'Ana Paula Costa', '456.789.123-45', '(11) 95555-1234', 'ana.costa@email.com', NULL),
('44444444-4444-4444-4444-444444444444', 'Pedro Henrique Lima', '321.654.987-12', '(11) 94444-5555', 'pedro.lima@email.com', 'Rua Augusta, 789 - Consolação - São Paulo/SP'),
('55555555-5555-5555-5555-555555555555', 'Carla Fernanda Souza', '654.321.987-33', '(11) 97777-8888', 'carla.souza@email.com', 'Av. Faria Lima, 321 - Itaim Bibi - São Paulo/SP'),
('66666666-6666-6666-6666-666666666666', 'Ricardo Santos Pereira', '789.123.456-77', '(11) 96666-9999', 'ricardo.pereira@email.com', 'Rua Oscar Freire, 654 - Jardins - São Paulo/SP'),
('77777777-7777-7777-7777-777777777777', 'Luciana Almeida', '111.222.333-44', '(11) 93333-4444', 'luciana.almeida@email.com', 'Rua da Consolação, 987 - Centro - São Paulo/SP'),
('88888888-8888-8888-8888-888888888888', 'Fernando Rodrigues', '555.666.777-88', '(11) 92222-3333', 'fernando.rodrigues@email.com', 'Av. Ibirapuera, 654 - Vila Olímpia - São Paulo/SP'),
('99999999-9999-9999-9999-999999999999', 'Isabela Santos', '999.888.777-66', '(11) 91111-2222', 'isabela.santos@email.com', 'Rua Estados Unidos, 321 - Jardim América - São Paulo/SP');

-- Inserir dados de exemplo dos animais
INSERT INTO public.animais (id, tutor_id, nome, especie, raca, data_nascimento, sexo, cor, peso, data_adesao) VALUES
('aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', '11111111-1111-1111-1111-111111111111', 'Beethoven', 'Cão', 'Golden Retriever', '2020-03-15', 'Macho', 'Dourado', 28.5, '2023-01-10'),
('bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb', '22222222-2222-2222-2222-222222222222', 'Mimi', 'Gato', 'Persa', '2019-07-22', 'Fêmea', 'Branco', 4.2, '2023-02-05'),
('cccccccc-cccc-cccc-cccc-cccccccccccc', '11111111-1111-1111-1111-111111111111', 'Luna', 'Gato', 'Siamês', '2021-11-08', 'Fêmea', 'Creme e marrom', 3.8, '2023-03-12'),
('dddddddd-dddd-dddd-dddd-dddddddddddd', '33333333-3333-3333-3333-333333333333', 'Rex', 'Cão', 'Pastor Alemão', '2018-12-03', 'Macho', 'Preto e marrom', 32.0, '2023-04-18'),
('eeeeeeee-eeee-eeee-eeee-eeeeeeeeeeee', '22222222-2222-2222-2222-222222222222', 'Pipoca', 'Hamster', 'Sírio', '2023-01-15', 'Fêmea', 'Dourado', 0.12, '2023-05-22'),
('ffffffff-ffff-ffff-ffff-ffffffffffff', '44444444-4444-4444-4444-444444444444', 'Thor', 'Cão', 'Labrador', '2019-05-10', 'Macho', 'Chocolate', 30.2, '2023-06-15'),
('gggggggg-gggg-gggg-gggg-gggggggggggg', '55555555-5555-5555-5555-555555555555', 'Bella', 'Gato', 'Maine Coon', '2020-09-12', 'Fêmea', 'Rajado', 5.8, '2023-07-08'),
('hhhhhhhh-hhhh-hhhh-hhhh-hhhhhhhhhhhh', '66666666-6666-6666-6666-666666666666', 'Max', 'Cão', 'Bulldog Francês', '2021-02-28', 'Macho', 'Branco e preto', 12.5, '2023-08-20'),
('iiiiiiii-iiii-iiii-iiii-iiiiiiiiiiii', '77777777-7777-7777-7777-777777777777', 'Mel', 'Gato', 'Ragdoll', '2020-05-20', 'Fêmea', 'Creme', 4.5, '2023-09-10'),
('jjjjjjjj-jjjj-jjjj-jjjj-jjjjjjjjjjjj', '88888888-8888-8888-8888-888888888888', 'Zeus', 'Cão', 'Rottweiler', '2019-01-12', 'Macho', 'Preto', 35.0, '2023-10-05'),
('kkkkkkkk-kkkk-kkkk-kkkk-kkkkkkkkkkkk', '99999999-9999-9999-9999-999999999999', 'Nina', 'Gato', 'British Shorthair', '2021-08-03', 'Fêmea', 'Cinza', 3.2, '2023-11-15');

-- Inserir dados de exemplo dos atendimentos
INSERT INTO public.atendimentos (id, animal_id, data, veterinario, sintomas, diagnostico, tratamento, medicamentos, observacoes, proximo_retorno) VALUES
('aaaaaaaa-1111-1111-1111-aaaaaaaaaaaa', 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', '2024-06-25', 'Dr. Roberto Silva', 'Tosse persistente e perda de apetite', 'Bronquite canina', 'Antibiótico e repouso', 'Amoxicilina 250mg - 2x ao dia por 7 dias', 'Animal apresentou melhora significativa após 3 dias de tratamento', '2024-07-05'),
('bbbbbbbb-2222-2222-2222-bbbbbbbbbbbb', 'bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb', '2024-06-20', 'Dra. Carla Mendes', 'Vômitos e diarreia', 'Gastroenterite', 'Dieta leve e medicação', 'Probióticos e protetor gástrico', 'Recomendado jejum de 12h antes da próxima refeição', NULL),
('cccccccc-3333-3333-3333-cccccccccccc', 'cccccccc-cccc-cccc-cccc-cccccccccccc', '2024-06-28', 'Dr. Roberto Silva', 'Consulta de rotina - vacinação', 'Animal saudável', 'Vacinação V4 + antirrábica', 'Vacinas aplicadas', 'Próxima vacinação em 1 ano', '2025-06-28'),
('dddddddd-4444-4444-4444-dddddddddddd', 'dddddddd-dddd-dddd-dddd-dddddddddddd', '2024-06-15', 'Dra. Ana Beatriz', 'Claudicação na pata traseira direita', 'Artrite leve', 'Anti-inflamatório e fisioterapia', 'Meloxicam 0.5mg - 1x ao dia por 10 dias', 'Recomendado exercícios leves e controle de peso', NULL),
('eeeeeeee-5555-5555-5555-eeeeeeeeeeee', 'ffffffff-ffff-ffff-ffff-ffffffffffff', '2024-06-30', 'Dr. Felipe Santos', 'Check-up anual', 'Animal saudável', 'Vacinação e vermifugação', 'Vacina V10 + vermífugo', 'Animal em excelente estado de saúde', NULL),
('ffffffff-6666-6666-6666-ffffffffffff', 'gggggggg-gggg-gggg-gggg-gggggggggggg', '2024-07-01', 'Dra. Mariana Costa', 'Pelos embaraçados e coceira', 'Dermatite alérgica', 'Banho medicinal e anti-histamínico', 'Shampoo antisséptico e Loratadina', 'Evitar contato com plantas específicas', NULL);
