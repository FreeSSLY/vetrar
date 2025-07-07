import { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { LogOut, User, PlusCircle, Search } from 'lucide-react';
import { useUsuarios } from '@/hooks/useUsuarios';
import { useSupabaseData } from '@/hooks/useSupabaseData';
import TutorForm from './TutorForm';
import AnimalForm from './AnimalForm';
import SearchResults from './SearchResults';
export default function AtendenteInterface() {
  const {
    currentUsuario,
    logoutUsuario
  } = useUsuarios();
  const {
    tutores,
    animais,
    loading,
    saveTutor,
    saveAnimal
  } = useSupabaseData();
  const [searchTerm, setSearchTerm] = useState('');
  const [activeTab, setActiveTab] = useState('cadastro-tutor');
  const filteredTutores = tutores.filter(tutor => tutor.nome.toLowerCase().includes(searchTerm.toLowerCase()) || tutor.cpf.includes(searchTerm) || tutor.telefone && tutor.telefone.includes(searchTerm));
  const filteredAnimais = animais.filter(animal => animal.nome.toLowerCase().includes(searchTerm.toLowerCase()) || animal.especie.toLowerCase().includes(searchTerm.toLowerCase()) || animal.raca.toLowerCase().includes(searchTerm.toLowerCase()));
  if (loading) {
    return <div className="min-h-screen bg-gradient-to-br from-crarar-secondary to-white flex items-center justify-center p-4">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 md:h-32 md:w-32 border-b-2 border-crarar-primary mx-auto"></div>
          <p className="mt-4 text-crarar-text text-sm md:text-base">Carregando...</p>
        </div>
      </div>;
  }
  return <div className="min-h-screen bg-gradient-to-br from-crarar-secondary to-white">
      <div className="container mx-auto p-3 md:p-6 max-w-7xl">
        {/* Header */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 md:mb-8 gap-4">
          <div className="flex-1">
            <h1 className="text-2xl md:text-4xl font-bold text-crarar-primary mb-1 md:mb-2">CRARAR</h1>
            <p className="text-sm md:text-lg text-crarar-text opacity-80">Painel do Atendente</p>
          </div>
          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-2 sm:gap-4 w-full sm:w-auto">
            <div className="flex items-center gap-2">
              <User className="h-4 w-4 md:h-5 md:w-5 text-crarar-primary" />
              <span className="text-crarar-text font-medium text-sm md:text-base truncate max-w-32 sm:max-w-none">
                {currentUsuario?.nome}
              </span>
            </div>
            <Button onClick={logoutUsuario} variant="outline" size="sm" className="flex items-center gap-2 w-full sm:w-auto justify-center">
              <LogOut className="h-3 w-3 md:h-4 md:w-4" />
              <span className="text-xs md:text-sm">Sair</span>
            </Button>
          </div>
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4 md:space-y-6">
          <TabsList className="grid w-full grid-cols-3 h-auto p-1">
            <TabsTrigger value="cadastro-tutor" className="flex flex-col sm:flex-row items-center gap-1 sm:gap-2 p-2 md:p-3 text-xs md:text-sm">
              <PlusCircle className="h-3 w-3 md:h-4 md:w-4" />
              <span className="text-center leading-tight">
                <span className="block sm:hidden">Tutor</span>
                <span className="hidden sm:block">Cadastro de Tutor</span>
              </span>
            </TabsTrigger>
            <TabsTrigger value="cadastro-animal" className="flex flex-col sm:flex-row items-center gap-1 sm:gap-2 p-2 md:p-3 text-xs md:text-sm">
              <PlusCircle className="h-3 w-3 md:h-4 md:w-4" />
              <span className="text-center leading-tight">
                <span className="block sm:hidden">Animal</span>
                <span className="hidden sm:block">Cadastro de Animal</span>
              </span>
            </TabsTrigger>
            <TabsTrigger value="busca" className="flex flex-col sm:flex-row items-center gap-1 sm:gap-2 p-2 md:p-3 text-xs md:text-sm">
              <Search className="h-3 w-3 md:h-4 md:w-4" />
              <span className="text-center leading-tight">Busca</span>
            </TabsTrigger>
          </TabsList>

          <TabsContent value="cadastro-tutor">
            <Card>
              <CardHeader className="p-4 md:p-6">
                <CardTitle className="text-lg md:text-xl">Cadastro de Tutor</CardTitle>
                <CardDescription className="text-sm md:text-base">
                  Cadastre um novo tutor no sistema
                </CardDescription>
              </CardHeader>
              <CardContent className="p-4 md:p-6 pt-0">
                <TutorForm onSave={saveTutor} />
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="cadastro-animal">
            <Card>
              <CardHeader className="p-4 md:p-6">
                <CardTitle className="text-lg md:text-xl">Cadastro de Animal</CardTitle>
                <CardDescription className="text-sm md:text-base">
                  Cadastre um novo animal no sistema
                </CardDescription>
              </CardHeader>
              <CardContent className="p-4 md:p-6 pt-0">
                <AnimalForm tutores={tutores} onSave={saveAnimal} />
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="busca">
            <Card>
              
              <CardContent className="p-4 md:p-6 pt-0">
                <div className="mb-4 md:mb-6">
                  
                </div>
                <SearchResults tutores={filteredTutores} animais={filteredAnimais} atendimentos={[]} // Atendente não tem acesso aos atendimentos
              readOnly={true} // Apenas visualização
              />
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>;
}