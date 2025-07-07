
import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";
import { Badge } from "@/components/ui/badge";
import { ChevronRight, Edit, Trash2 } from "lucide-react";
import { toast } from "@/hooks/use-toast";

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
  observacoes: string;
  proximo_retorno?: string;
}

interface AnimalListProps {
  animais: Animal[];
  tutores: Tutor[];
  atendimentos: Atendimento[];
  onUpdateAnimais: (animais: Animal[]) => void;
  onUpdateTutores: (tutores: Tutor[]) => void;
  onUpdateAtendimentos: (atendimentos: Atendimento[]) => void;
}

const AnimalList = ({ 
  animais, 
  tutores, 
  atendimentos,
  onUpdateAnimais,
  onUpdateTutores,
  onUpdateAtendimentos
}: AnimalListProps) => {
  const [selectedAnimal, setSelectedAnimal] = useState<Animal | null>(null);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [animalToDelete, setAnimalToDelete] = useState<Animal | null>(null);

  // Ordenar animais por data de adesão (mais recente primeiro)
  const animaisOrdenados = [...animais].sort((a, b) => 
    new Date(b.data_adesao).getTime() - new Date(a.data_adesao).getTime()
  );

  const getTutor = (tutorId: string) => {
    return tutores.find(t => t.id === tutorId);
  };

  const getAtendimentosDoAnimal = (animalId: string) => {
    return atendimentos.filter(a => a.animal_id === animalId)
      .sort((a, b) => new Date(b.data).getTime() - new Date(a.data).getTime());
  };

  const calcularIdade = (dataNascimento: string) => {
    const hoje = new Date();
    const nascimento = new Date(dataNascimento);
    const diffTime = Math.abs(hoje.getTime() - nascimento.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    if (diffDays < 30) {
      return `${diffDays} dias`;
    } else if (diffDays < 365) {
      const meses = Math.floor(diffDays / 30);
      return `${meses} ${meses === 1 ? 'mês' : 'meses'}`;
    } else {
      const anos = Math.floor(diffDays / 365);
      return `${anos} ${anos === 1 ? 'ano' : 'anos'}`;
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('pt-BR');
  };

  const handleDelete = (animal: Animal) => {
    // Remover atendimentos do animal
    const novosAtendimentos = atendimentos.filter(a => a.animal_id !== animal.id);
    onUpdateAtendimentos(novosAtendimentos);
    
    // Remover animal
    const novosAnimais = animais.filter(a => a.id !== animal.id);
    onUpdateAnimais(novosAnimais);
    
    toast({
      title: "Excluído com sucesso",
      description: `${animal.nome} e seus atendimentos foram removidos.`,
    });
    
    setShowDeleteConfirm(false);
    setAnimalToDelete(null);
  };

  const getEspecieEmoji = (especie: string) => {
    switch (especie.toLowerCase()) {
      case 'cão': return '🐕';
      case 'gato': return '🐱';
      case 'hamster': return '🐹';
      case 'coelho': return '🐰';
      case 'pássaro': return '🐦';
      default: return '🐾';
    }
  };

  return (
    <div className="space-y-6">
      <Card className="shadow-lg">
        <CardHeader>
          <CardTitle className="text-crarar-primary flex items-center gap-2">
            🐾 Animais Cadastrados
          </CardTitle>
          <CardDescription>
            Lista de todos os animais em ordem cronológica de adesão
          </CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground mb-4">
            Total de animais: <span className="font-semibold">{animais.length}</span>
          </p>
        </CardContent>
      </Card>

      <div className="space-y-4">
        {animaisOrdenados.map((animal) => {
          const tutor = getTutor(animal.tutor_id);
          const atendimentosAnimal = getAtendimentosDoAnimal(animal.id);
          const ultimoAtendimento = atendimentosAnimal[0];

          return (
            <Card key={animal.id} className="animate-fade-in shadow-sm hover:shadow-md transition-shadow">
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <span className="text-2xl">{getEspecieEmoji(animal.especie)}</span>
                      <div>
                        <h3 className="font-semibold text-lg">{animal.nome}</h3>
                        <p className="text-sm text-muted-foreground">
                          {animal.especie} • {animal.raca} • {calcularIdade(animal.data_nascimento)}
                        </p>
                      </div>
                      <Badge variant="outline" className="ml-2">
                        Adesão: {formatDate(animal.data_adesao)}
                      </Badge>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-sm text-muted-foreground">
                      <p><strong>Tutor:</strong> {tutor?.nome}</p>
                      <p><strong>Peso:</strong> {animal.peso} kg</p>
                      {ultimoAtendimento && (
                        <p><strong>Último atendimento:</strong> {formatDate(ultimoAtendimento.data)}</p>
                      )}
                      <p><strong>Total de atendimentos:</strong> {atendimentosAnimal.length}</p>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <Dialog>
                      <DialogTrigger asChild>
                        <Button 
                          variant="outline"
                          size="sm"
                          onClick={() => setSelectedAnimal(animal)}
                        >
                          Ver Detalhes
                          <ChevronRight className="w-4 h-4 ml-1" />
                        </Button>
                      </DialogTrigger>
                      <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
                        <DialogHeader>
                          <DialogTitle className="flex items-center gap-2">
                            {getEspecieEmoji(animal.especie)} Detalhes Completos - {animal.nome}
                          </DialogTitle>
                          <DialogDescription>
                            Informações do tutor, animal e histórico completo de atendimentos
                          </DialogDescription>
                        </DialogHeader>
                        
                        {selectedAnimal && (
                          <div className="space-y-6">
                            {/* Dados do Animal */}
                            <Card>
                              <CardHeader>
                                <CardTitle className="text-base">🐾 Dados do Animal</CardTitle>
                              </CardHeader>
                              <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                                <div className="space-y-2">
                                  <p><strong>Nome:</strong> {selectedAnimal.nome}</p>
                                  <p><strong>Espécie:</strong> {selectedAnimal.especie}</p>
                                  <p><strong>Raça:</strong> {selectedAnimal.raca}</p>
                                  <p><strong>Sexo:</strong> {selectedAnimal.sexo}</p>
                                </div>
                                <div className="space-y-2">
                                  <p><strong>Cor:</strong> {selectedAnimal.cor}</p>
                                  <p><strong>Peso:</strong> {selectedAnimal.peso} kg</p>
                                  <p><strong>Idade:</strong> {calcularIdade(selectedAnimal.data_nascimento)}</p>
                                  <p><strong>Data de Adesão:</strong> {formatDate(selectedAnimal.data_adesao)}</p>
                                </div>
                              </CardContent>
                            </Card>

                            {/* Dados do Tutor */}
                            {tutor && (
                              <Card>
                                <CardHeader>
                                  <CardTitle className="text-base">👤 Dados do Tutor</CardTitle>
                                </CardHeader>
                                <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                                  <div className="space-y-2">
                                    <p><strong>Nome:</strong> {tutor.nome}</p>
                                    <p><strong>CPF:</strong> {tutor.cpf}</p>
                                    <p><strong>Telefone:</strong> {tutor.telefone}</p>
                                  </div>
                                  <div className="space-y-2">
                                    {tutor.email && <p><strong>Email:</strong> {tutor.email}</p>}
                                    {tutor.endereco && <p><strong>Endereço:</strong> {tutor.endereco}</p>}
                                  </div>
                                </CardContent>
                              </Card>
                            )}

                            {/* Histórico de Atendimentos */}
                            <Card>
                              <CardHeader>
                                <CardTitle className="text-base">🩺 Histórico de Atendimentos ({atendimentosAnimal.length})</CardTitle>
                              </CardHeader>
                              <CardContent>
                                {atendimentosAnimal.length > 0 ? (
                                  <div className="space-y-4 max-h-60 overflow-y-auto">
                                    {atendimentosAnimal.map(atendimento => (
                                      <div key={atendimento.id} className="border rounded p-3 text-xs">
                                        <div className="flex justify-between items-start mb-2">
                                          <span className="font-medium">{formatDate(atendimento.data)}</span>
                                          <span className="text-muted-foreground">Dr(a). {atendimento.veterinario}</span>
                                        </div>
                                        <div className="space-y-1">
                                          <p><strong>Sintomas:</strong> {atendimento.sintomas}</p>
                                          <p><strong>Diagnóstico:</strong> {atendimento.diagnostico}</p>
                                          <p><strong>Tratamento:</strong> {atendimento.tratamento}</p>
                                          {atendimento.medicamentos && (
                                            <p><strong>Medicamentos:</strong> {atendimento.medicamentos}</p>
                                          )}
                                          {atendimento.observacoes && (
                                            <p><strong>Observações:</strong> {atendimento.observacoes}</p>
                                          )}
                                          {atendimento.proximo_retorno && (
                                            <p><strong>Próximo retorno:</strong> {formatDate(atendimento.proximo_retorno)}</p>
                                          )}
                                        </div>
                                      </div>
                                    ))}
                                  </div>
                                ) : (
                                  <p className="text-muted-foreground">Nenhum atendimento registrado</p>
                                )}
                              </CardContent>
                            </Card>

                            {/* Botões de Ação */}
                            <div className="flex justify-end gap-2 pt-4 border-t">
                              <Button variant="outline" disabled>
                                <Edit className="w-4 h-4 mr-2" />
                                Editar
                              </Button>
                              
                              <Button 
                                variant="outline" 
                                className="text-red-600 hover:text-red-700"
                                onClick={() => {
                                  setAnimalToDelete(selectedAnimal);
                                  setShowDeleteConfirm(true);
                                }}
                              >
                                <Trash2 className="w-4 h-4 mr-2" />
                                Excluir
                              </Button>
                            </div>
                          </div>
                        )}
                      </DialogContent>
                    </Dialog>
                  </div>
                </div>
              </CardContent>
            </Card>
          );
        })}

        {animais.length === 0 && (
          <Card>
            <CardContent className="text-center py-8">
              <p className="text-muted-foreground">
                Nenhum animal cadastrado ainda.
              </p>
            </CardContent>
          </Card>
        )}
      </div>

      {/* Dialog de Confirmação de Exclusão */}
      <AlertDialog open={showDeleteConfirm} onOpenChange={setShowDeleteConfirm}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>⚠️ Confirmar Exclusão</AlertDialogTitle>
            <AlertDialogDescription>
              Você tem certeza que deseja excluir <strong>{animalToDelete?.nome}</strong>?
              <br />
              <br />
              <span className="text-red-600 font-semibold">
                Esta ação irá remover também todos os atendimentos relacionados a este animal!
              </span>
              <br />
              <br />
              Esta ação não pode ser desfeita.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => animalToDelete && handleDelete(animalToDelete)}
              className="bg-red-600 hover:bg-red-700"
            >
              Sim, Excluir Definitivamente
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

export default AnimalList;
