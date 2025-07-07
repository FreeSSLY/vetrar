import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Search, LogOut, Settings } from "lucide-react";
import TutorForm from "@/components/TutorForm";
import AnimalForm from "@/components/AnimalForm";
import AtendimentoForm from "@/components/AtendimentoForm";
import SearchResults from "@/components/SearchResults";
import ConfiguracoesForm from "@/components/ConfiguracoesForm";
import { useAuth } from "@/hooks/useAuth";
import { useSupabaseData } from "@/hooks/useSupabaseData";
import { useState } from "react";

const Index = () => {
  const { profile, signOut } = useAuth();
  const {
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
  } = useSupabaseData();
  const [activeTab, setActiveTab] = useState("busca");

  const handleLogout = async () => {
    try {
      await signOut();
    } catch (error) {
      console.error("Error signing out:", error);
    }
  };

  // Convert database format to SearchResults format
  const animaisFormatted = animais.map((animal) => ({
    id: animal.id,
    tutor_id: animal.tutor_id,
    nome: animal.nome,
    especie: animal.especie,
    raca: animal.raca,
    data_nascimento: animal.data_nascimento,
    sexo: animal.sexo,
    cor: animal.cor,
    peso: animal.peso,
    data_adesao: animal.data_adesao,
    created_at: animal.created_at,
    updated_at: animal.updated_at,
  }));

  const atendimentosFormatted = atendimentos.map((atendimento) => ({
    id: atendimento.id,
    animal_id: atendimento.animal_id,
    data: atendimento.data,
    veterinario: atendimento.veterinario,
    sintomas: atendimento.sintomas,
    diagnostico: atendimento.diagnostico,
    tratamento: atendimento.tratamento,
    medicamentos: atendimento.medicamentos,
    observacoes: atendimento.observacoes || "",
    proximo_retorno: atendimento.proximo_retorno,
    created_at: atendimento.created_at,
    updated_at: atendimento.updated_at,
  }));

  // Convert for AtendimentoForm (keeping database format)
  const animaisForAtendimento = animais.map((animal) => ({
    id: animal.id,
    tutor_id: animal.tutor_id,
    nome: animal.nome,
    especie: animal.especie,
  }));

  const handleUpdateAnimais = (updatedAnimais: any[]) => {
    const dbFormatAnimais = updatedAnimais.map((animal) => ({
      id: animal.id,
      tutor_id: animal.tutorId,
      nome: animal.nome,
      especie: animal.especie,
      raca: animal.raca,
      data_nascimento: animal.dataNascimento,
      sexo: animal.sexo,
      cor: animal.cor,
      peso: animal.peso,
      data_adesao: animal.dataAdesao,
      created_at: "",
      updated_at: "",
    }));
    setAnimais(dbFormatAnimais);
  };

  const handleUpdateAtendimentos = (updatedAtendimentos: any[]) => {
    const dbFormatAtendimentos = updatedAtendimentos.map((atendimento) => ({
      id: atendimento.id,
      animal_id: atendimento.animalId,
      data: atendimento.data,
      veterinario: atendimento.veterinario,
      sintomas: atendimento.sintomas,
      diagnostico: atendimento.diagnostico,
      tratamento: atendimento.tratamento,
      medicamentos: atendimento.medicamentos,
      observacoes: atendimento.observacoes || null,
      proximo_retorno: atendimento.proximoRetorno || null,
      created_at: "",
      updated_at: "",
    }));
    setAtendimentos(dbFormatAtendimentos);
  };

  const handleUpdateTutores = (updatedTutores: any[]) => {
    setTutores(updatedTutores);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-crarar-secondary to-white flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-crarar-primary mx-auto"></div>
          <p className="mt-4 text-crarar-text">Carregando dados...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-crarar-secondary to-white">
      <div className="container mx-auto p-4 sm:p-6">
        {/* Header */}
        <div className="mb-6 sm:mb-8 text-center animate-fade-in relative">
          <Button
            onClick={handleLogout}
            variant="outline"
            size="sm"
            className="absolute top-0 right-0 flex items-center gap-2 text-xs sm:text-sm"
          >
            <LogOut className="w-3 h-3 sm:w-4 sm:h-4" />
            <span className="hidden sm:inline">Sair</span>
          </Button>

          <h1 className="text-3xl sm:text-4xl font-bold text-crarar-primary mb-2">
            CRARAR
          </h1>
          <p className="text-lg sm:text-xl text-crarar-text opacity-80">
            Sistema de Gestão Veterinária
          </p>
          {/*<p className="text-xs sm:text-sm text-crarar-text opacity-60">
            Usuário: {profile?.nome} ({profile?.role === 'admin' ? 'Administrador' : 'Usuário Teste'})
          </p>*/}
        </div>

        {/* Navigation Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-3 mb-4 sm:mb-6 bg-white shadow-sm h-auto">
            <TabsTrigger
              value="cadastro"
              className="data-[state=active]:bg-crarar-primary data-[state=active]:text-white transition-all duration-300 flex flex-col sm:flex-row items-center gap-1 sm:gap-2 py-2 sm:py-1.5 px-2 sm:px-3 text-xs sm:text-sm"
            >
              <span className="text-lg sm:hidden">📝</span>
              <span className="hidden sm:inline">📝</span>
              <span className="text-center leading-tight">Cadastros</span>
            </TabsTrigger>
            <TabsTrigger
              value="busca"
              className="data-[state=active]:bg-crarar-primary data-[state=active]:text-white transition-all duration-300 flex flex-col sm:flex-row items-center gap-1 sm:gap-2 py-2 sm:py-1.5 px-2 sm:px-3 text-xs sm:text-sm"
            >
              <Search className="w-4 h-4 sm:w-4 sm:h-4" />
              <span className="text-center leading-tight">Buscar</span>
            </TabsTrigger>
            <TabsTrigger
              value="configuracoes"
              className="data-[state=active]:bg-crarar-primary data-[state=active]:text-white transition-all duration-300 flex flex-col sm:flex-row items-center gap-1 sm:gap-2 py-2 sm:py-1.5 px-2 sm:px-3 text-xs sm:text-sm"
            >
              <Settings className="w-4 h-4 sm:w-4 sm:h-4" />
              <span className="text-center leading-tight">Config</span>
            </TabsTrigger>
          </TabsList>

          {/* Cadastro Tab */}
          <TabsContent value="cadastro" className="animate-slide-in">
            <Card className="shadow-lg border-0 bg-white/95 backdrop-blur-sm">
              <CardHeader className="bg-crarar-primary text-white">
                <CardTitle className="text-2xl">Cadastros</CardTitle>
                <CardDescription className="text-white/90">
                  {profile?.role === "admin"
                    ? "Complete as informações em etapas"
                    : "Cadastre tutores e animais"}
                </CardDescription>
              </CardHeader>
              <CardContent className="p-6">
                <Tabs defaultValue="tutor" className="w-full">
                  <TabsList
                    className={`grid w-full ${
                      profile?.role === "admin" ? "grid-cols-3" : "grid-cols-2"
                    } mb-6`}
                  >
                    <TabsTrigger value="tutor">Tutor</TabsTrigger>
                    <TabsTrigger value="animal">Animal</TabsTrigger>
                    {profile?.role === "admin" && (
                      <TabsTrigger value="atendimento">Atendimento</TabsTrigger>
                    )}
                  </TabsList>

                  <TabsContent value="tutor">
                    <TutorForm onSave={saveTutor} />
                  </TabsContent>

                  <TabsContent value="animal">
                    <AnimalForm tutores={tutores} onSave={saveAnimal} />
                  </TabsContent>

                  {profile?.role === "admin" && (
                    <TabsContent value="atendimento">
                      <AtendimentoForm
                        animais={animaisForAtendimento}
                        tutores={tutores}
                        onSave={saveAtendimento}
                      />
                    </TabsContent>
                  )}
                </Tabs>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Busca Tab */}
          <TabsContent value="busca" className="animate-slide-in">
            <SearchResults
              tutores={tutores}
              animais={animaisFormatted}
              atendimentos={atendimentosFormatted}
              onUpdateTutores={handleUpdateTutores}
              onUpdateAnimais={handleUpdateAnimais}
              onUpdateAtendimentos={handleUpdateAtendimentos}
              onDeleteAnimal={deleteAnimal}
              onDeleteAtendimento={deleteAtendimento}
              onUpdateAnimal={updateAnimal}
              onUpdateTutor={updateTutor}
              onUpdateAtendimento={updateAtendimento}
              userRole={profile?.role || "teste"}
            />
          </TabsContent>

          {/* Configurações Tab */}
          <TabsContent value="configuracoes" className="animate-slide-in">
            <Card className="shadow-lg border-0 bg-white/95 backdrop-blur-sm">
              <CardHeader className="bg-crarar-primary text-white">
                <CardTitle className="text-2xl flex items-center gap-2">
                  <Settings className="w-6 h-6" />
                  Configurações
                </CardTitle>
                <CardDescription className="text-white/90">
                  Gerencie suas configurações de conta e perfil
                </CardDescription>
              </CardHeader>
              <CardContent className="p-6">
                <ConfiguracoesForm userRole={profile?.role || "teste"} />
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default Index;
