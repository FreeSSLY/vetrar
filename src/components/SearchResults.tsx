
import { useState, useMemo } from 'react';
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";
import { Badge } from "@/components/ui/badge";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Search, Edit, Trash2, ChevronRight, Dog, Cat, Rabbit, Bird, Heart, Download } from "lucide-react";
import { toast } from "@/hooks/use-toast";
import jsPDF from 'jspdf';

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

interface SearchResultsProps {
  tutores: Tutor[];
  animais: Animal[];
  atendimentos: Atendimento[];
  readOnly?: boolean;
  onUpdateTutores?: (tutores: Tutor[]) => void;
  onUpdateAnimais?: (animais: Animal[]) => void;
  onUpdateAtendimentos?: (atendimentos: Atendimento[]) => void;
  onDeleteAnimal?: (animalId: string) => Promise<void>;
  onDeleteAtendimento?: (atendimentoId: string) => Promise<void>;
  onUpdateAnimal?: (animalId: string, data: any) => Promise<any>;
  onUpdateTutor?: (tutorId: string, data: any) => Promise<any>;
  onUpdateAtendimento?: (atendimentoId: string, data: any) => Promise<any>;
  userRole?: string;
}

const SearchResults = ({ 
  tutores, 
  animais, 
  atendimentos,
  readOnly = false,
  onUpdateTutores,
  onUpdateAnimais,
  onUpdateAtendimentos,
  onDeleteAnimal,
  onDeleteAtendimento,
  onUpdateAnimal,
  onUpdateTutor,
  onUpdateAtendimento,
  userRole = 'admin'
}: SearchResultsProps) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedRecord, setSelectedRecord] = useState<any>(null);
  const [editingAnimal, setEditingAnimal] = useState<Animal | null>(null);
  const [editingTutor, setEditingTutor] = useState<Tutor | null>(null);
  const [editingAtendimento, setEditingAtendimento] = useState<Atendimento | null>(null);

  // Ordenar animais por data de adesão (mais recente primeiro)
  const animaisOrdenados = [...animais].sort((a, b) => 
    new Date(b.data_adesao).getTime() - new Date(a.data_adesao).getTime()
  );

  const filteredAnimais = useMemo(() => {
    if (!searchTerm) return animaisOrdenados;

    const searchLower = searchTerm.toLowerCase();
    
    return animaisOrdenados.filter(animal => {
      const tutor = tutores.find(t => t.id === animal.tutor_id);
      
      // Buscar por nome do animal
      const nomeAnimalMatch = animal.nome.toLowerCase().includes(searchLower);
      
      // Buscar por nome do tutor
      const nomeTutorMatch = tutor?.nome.toLowerCase().includes(searchLower) || false;
      
      // Buscar por CPF (apenas números)
      const cpfNumbers = tutor?.cpf.replace(/\D/g, '') || '';
      const searchNumbers = searchTerm.replace(/\D/g, '');
      const cpfMatch = searchNumbers && cpfNumbers.includes(searchNumbers);
      
      return nomeAnimalMatch || nomeTutorMatch || cpfMatch;
    });
  }, [searchTerm, animaisOrdenados, tutores]);

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

  const getEspecieIcon = (especie: string) => {
    const iconClass = "w-5 h-5 text-crarar-primary";
    switch (especie.toLowerCase()) {
      case 'cão': return <Dog className={iconClass} />;
      case 'gato': return <Cat className={iconClass} />;
      case 'hamster': return <Heart className={iconClass} />;
      case 'coelho': return <Rabbit className={iconClass} />;
      case 'pássaro': return <Bird className={iconClass} />;
      default: return <Heart className={iconClass} />;
    }
  };

  const handleDelete = async (animal: Animal) => {
    if (readOnly || !onDeleteAnimal) return;
    try {
      await onDeleteAnimal(animal.id);
    } catch (error) {
      console.error('Error deleting animal:', error);
    }
  };

  const handleEditAnimal = (animal: Animal) => {
    if (readOnly) return;
    setEditingAnimal(animal);
  };

  const handleEditTutor = (tutor: Tutor) => {
    if (readOnly) return;
    setEditingTutor(tutor);
  };

  const handleEditAtendimento = (atendimento: Atendimento) => {
    if (readOnly) return;
    setEditingAtendimento(atendimento);
  };

  const handleSaveAnimal = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingAnimal || readOnly || !onUpdateAnimal) return;

    try {
      const updateData = {
        nome: editingAnimal.nome,
        especie: editingAnimal.especie,
        raca: editingAnimal.raca,
        sexo: editingAnimal.sexo,
        cor: editingAnimal.cor,
        peso: editingAnimal.peso,
      };

      await onUpdateAnimal(editingAnimal.id, updateData);
      setEditingAnimal(null);
    } catch (error) {
      console.error('Error updating animal:', error);
    }
  };

  const handleSaveTutor = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingTutor || readOnly || !onUpdateTutor) return;

    try {
      const updateData = {
        nome: editingTutor.nome,
        cpf: editingTutor.cpf,
        telefone: editingTutor.telefone,
        email: editingTutor.email,
        endereco: editingTutor.endereco,
      };

      await onUpdateTutor(editingTutor.id, updateData);
      setEditingTutor(null);
    } catch (error) {
      console.error('Error updating tutor:', error);
    }
  };

  const handleSaveAtendimento = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingAtendimento || readOnly || !onUpdateAtendimento) return;

    try {
      const updateData = {
        data: editingAtendimento.data,
        veterinario: editingAtendimento.veterinario,
        sintomas: editingAtendimento.sintomas,
        diagnostico: editingAtendimento.diagnostico,
        tratamento: editingAtendimento.tratamento,
        medicamentos: editingAtendimento.medicamentos,
        observacoes: editingAtendimento.observacoes,
        proximo_retorno: editingAtendimento.proximo_retorno,
      };

      await onUpdateAtendimento(editingAtendimento.id, updateData);
      setEditingAtendimento(null);
    } catch (error) {
      console.error('Error updating atendimento:', error);
    }
  };

  const handleDeleteAtendimento = async (atendimento: Atendimento) => {
    if (readOnly || !onDeleteAtendimento) return;
    try {
      await onDeleteAtendimento(atendimento.id);
    } catch (error) {
      console.error('Error deleting atendimento:', error);
    }
  };

  const generatePDF = (animal: Animal, tutor: Tutor, atendimentosAnimal: Atendimento[]) => {
    const doc = new jsPDF();
    const pageWidth = doc.internal.pageSize.width;
    const margin = 20;
    let yPosition = 30;

    // Cabeçalho
    doc.setFontSize(20);
    doc.setTextColor(59, 122, 87); // Cor do tema
    doc.text('CRARAR - Sistema de Gestão Veterinária', pageWidth / 2, yPosition, { align: 'center' });
    
    yPosition += 10;
    doc.setFontSize(14);
    doc.setTextColor(0, 0, 0);
    doc.text('Relatório Detalhado do Animal', pageWidth / 2, yPosition, { align: 'center' });
    
    yPosition += 20;

    // Dados do Animal
    doc.setFontSize(14);
    doc.setTextColor(59, 122, 87);
    doc.text('DADOS DO ANIMAL', margin, yPosition);
    yPosition += 10;

    doc.setFontSize(10);
    doc.setTextColor(0, 0, 0);
    const animalInfo = [
      `Nome: ${animal.nome}`,
      `Espécie: ${animal.especie}`,
      `Raça: ${animal.raca}`,
      `Sexo: ${animal.sexo}`,
      `Cor: ${animal.cor}`,
      `Peso: ${animal.peso} kg`,
      `Idade: ${calcularIdade(animal.data_nascimento)}`,
      `Data de Adesão: ${formatDate(animal.data_adesao)}`
    ];

    animalInfo.forEach((info, index) => {
      if (index % 2 === 0) {
        doc.text(info, margin, yPosition);
      } else {
        doc.text(info, pageWidth / 2, yPosition);
        yPosition += 6;
      }
    });

    if (animalInfo.length % 2 !== 0) yPosition += 6;
    yPosition += 10;

    // Dados do Tutor
    doc.setFontSize(14);
    doc.setTextColor(59, 122, 87);
    doc.text('DADOS DO TUTOR', margin, yPosition);
    yPosition += 10;

    doc.setFontSize(10);
    doc.setTextColor(0, 0, 0);
    const tutorInfo = [
      `Nome: ${tutor.nome}`,
      `CPF: ${tutor.cpf}`,
      `Telefone: ${tutor.telefone}`,
      tutor.email ? `Email: ${tutor.email}` : null,
    ].filter(Boolean);

    tutorInfo.forEach((info, index) => {
      if (info) {
        if (index % 2 === 0) {
          doc.text(info, margin, yPosition);
        } else {
          doc.text(info, pageWidth / 2, yPosition);
          yPosition += 6;
        }
      }
    });

    if (tutorInfo.length % 2 !== 0) yPosition += 6;
    if (tutor.endereco) {
      yPosition += 2;
      doc.text(`Endereço: ${tutor.endereco}`, margin, yPosition);
      yPosition += 6;
    }
    yPosition += 10;

    // Histórico de Atendimentos
    doc.setFontSize(14);
    doc.setTextColor(59, 122, 87);
    doc.text(`HISTÓRICO DE ATENDIMENTOS (${atendimentosAnimal.length})`, margin, yPosition);
    yPosition += 10;

    if (atendimentosAnimal.length > 0) {
      atendimentosAnimal.forEach((atendimento, index) => {
        if (yPosition > 250) {
          doc.addPage();
          yPosition = 30;
        }

        doc.setFontSize(12);
        doc.setTextColor(59, 122, 87);
        doc.text(`Atendimento ${index + 1} - ${formatDate(atendimento.data)}`, margin, yPosition);
        yPosition += 8;

        doc.setFontSize(10);
        doc.setTextColor(0, 0, 0);
        
        const atendimentoInfo = [
          `Veterinário: ${atendimento.veterinario}`,
          `Sintomas: ${atendimento.sintomas}`,
          `Diagnóstico: ${atendimento.diagnostico}`,
          `Tratamento: ${atendimento.tratamento}`,
        ];

        if (atendimento.medicamentos) {
          atendimentoInfo.push(`Medicamentos: ${atendimento.medicamentos}`);
        }
        if (atendimento.observacoes) {
          atendimentoInfo.push(`Observações: ${atendimento.observacoes}`);
        }
        if (atendimento.proximo_retorno) {
          atendimentoInfo.push(`Próximo retorno: ${formatDate(atendimento.proximo_retorno)}`);
        }

        atendimentoInfo.forEach(info => {
          const lines = doc.splitTextToSize(info, pageWidth - 2 * margin);
          lines.forEach((line: string) => {
            if (yPosition > 280) {
              doc.addPage();
              yPosition = 30;
            }
            doc.text(line, margin, yPosition);
            yPosition += 5;
          });
        });

        yPosition += 5;
      });
    } else {
      doc.setFontSize(10);
      doc.setTextColor(128, 128, 128);
      doc.text('Nenhum atendimento registrado', margin, yPosition);
    }

    // Rodapé
    const now = new Date();
    doc.setFontSize(8);
    doc.setTextColor(128, 128, 128);
    doc.text(`Relatório gerado em: ${now.toLocaleDateString('pt-BR')} às ${now.toLocaleTimeString('pt-BR')}`, margin, doc.internal.pageSize.height - 10);

    // Salvar o PDF
    doc.save(`Relatorio_${animal.nome}_${now.toISOString().split('T')[0]}.pdf`);
  };

  const canEdit = !readOnly && userRole === 'admin';
  const canDelete = !readOnly && userRole === 'admin';

  return (
    <div className="space-y-4 sm:space-y-6">
      {/* Filtros de Busca */}
      <Card className="shadow-lg">
        <CardHeader className="pb-4">
          <CardTitle className="text-crarar-primary flex items-center gap-2 text-lg sm:text-xl">
            <Search className="w-4 h-4 sm:w-5 sm:h-5" />
            Buscar e Consultar Animais
          </CardTitle>
          <CardDescription className="text-sm">
            Lista de todos os animais cadastrados - {animais.length} total
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex gap-4">
            <div className="flex-1">
              <Input
                placeholder="Nome do animal, nome do tutor ou CPF..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="focus:border-crarar-primary text-sm sm:text-base"
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Lista de Animais */}
      <div className="space-y-3 sm:space-y-4">
        {filteredAnimais.map((animal) => {
          const tutor = getTutor(animal.tutor_id);
          const atendimentosAnimal = getAtendimentosDoAnimal(animal.id);
          const ultimoAtendimento = atendimentosAnimal[0];

          return (
            <Card key={animal.id} className="animate-fade-in shadow-sm hover:shadow-md transition-shadow">
              <CardContent className="p-3 sm:p-4">
                <div className="flex items-start justify-between gap-3">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 sm:gap-3 mb-2">
                      {getEspecieIcon(animal.especie)}
                      <div className="min-w-0 flex-1">
                        <h3 className="font-semibold text-base sm:text-lg text-gray-900 truncate">{animal.nome}</h3>
                        <p className="text-xs sm:text-sm text-muted-foreground truncate">
                          {animal.especie} • {animal.raca} • {calcularIdade(animal.data_nascimento)}
                        </p>
                      </div>
                    </div>

                    <div className="space-y-1 text-xs sm:text-sm text-muted-foreground">
                      <p className="truncate"><strong>Tutor:</strong> {tutor?.nome}</p>
                      <div className="flex flex-wrap gap-2 sm:gap-4 text-xs">
                        <span><strong>Peso:</strong> {animal.peso} kg</span>
                        <span><strong>Atendimentos:</strong> {atendimentosAnimal.length}</span>
                      </div>
                      {ultimoAtendimento && (
                        <p className="text-xs"><strong>Último atendimento:</strong> {formatDate(ultimoAtendimento.data)}</p>
                      )}
                    </div>

                    <Badge variant="outline" className="mt-2 text-xs">
                      Adesão: {formatDate(animal.data_adesao)}
                    </Badge>
                  </div>

                  <div className="flex-shrink-0">
                    <Dialog>
                      <DialogTrigger asChild>
                        <Button 
                          variant="outline"
                          size="sm"
                          className="text-xs px-2 py-1 h-8 w-20 sm:w-auto"
                          onClick={() => setSelectedRecord({ type: 'animal', data: animal, tutor, atendimentosAnimal })}
                        >
                          <span className="text-xs">Detalhes</span>
                          <ChevronRight className="w-3 h-3 ml-1" />
                        </Button>
                      </DialogTrigger>
                      <DialogContent className="w-[95vw] max-w-4xl max-h-[85vh] overflow-y-auto">
                        <DialogHeader className="pb-4">
                          <DialogTitle className="flex items-center gap-2 text-lg sm:text-xl">
                            {getEspecieIcon(animal.especie)} Detalhes Completos - {animal.nome}
                          </DialogTitle>
                          <DialogDescription className="text-sm">
                            Informações do tutor, animal e histórico completo de atendimentos
                          </DialogDescription>
                        </DialogHeader>
                        
                        {selectedRecord && (
                          <div className="space-y-4 sm:space-y-6">
                            <Card>
                              <CardHeader className="pb-3">
                                <CardTitle className="text-sm sm:text-base flex items-center gap-2">
                                  {getEspecieIcon(selectedRecord.data.especie)} Dados do Animal
                                </CardTitle>
                              </CardHeader>
                              <CardContent className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4 text-xs sm:text-sm">
                                <div className="space-y-2">
                                  <p><strong>Nome:</strong> {selectedRecord.data.nome}</p>
                                  <p><strong>Espécie:</strong> {selectedRecord.data.especie}</p>
                                  <p><strong>Raça:</strong> {selectedRecord.data.raca}</p>
                                  <p><strong>Sexo:</strong> {selectedRecord.data.sexo}</p>
                                </div>
                                <div className="space-y-2">
                                  <p><strong>Cor:</strong> {selectedRecord.data.cor}</p>
                                  <p><strong>Peso:</strong> {selectedRecord.data.peso} kg</p>
                                  <p><strong>Idade:</strong> {calcularIdade(selectedRecord.data.data_nascimento)}</p>
                                  <p><strong>Data de Adesão:</strong> {formatDate(selectedRecord.data.data_adesao)}</p>
                                </div>
                              </CardContent>
                            </Card>

                            {selectedRecord.tutor && (
                              <Card>
                                <CardHeader className="pb-3">
                                  <CardTitle className="text-sm sm:text-base flex items-center gap-2">
                                    <Heart className="w-4 h-4" /> Dados do Tutor
                                  </CardTitle>
                                </CardHeader>
                                <CardContent className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4 text-xs sm:text-sm">
                                  <div className="space-y-2">
                                    <p><strong>Nome:</strong> {selectedRecord.tutor.nome}</p>
                                    <p><strong>CPF:</strong> {selectedRecord.tutor.cpf}</p>
                                    <p><strong>Telefone:</strong> {selectedRecord.tutor.telefone}</p>
                                  </div>
                                  <div className="space-y-2">
                                    {selectedRecord.tutor.email && <p><strong>Email:</strong> {selectedRecord.tutor.email}</p>}
                                    {selectedRecord.tutor.endereco && <p><strong>Endereço:</strong> {selectedRecord.tutor.endereco}</p>}
                                  </div>
                                </CardContent>
                              </Card>
                            )}

                            {/* Histórico de Atendimentos */}
                            <Card>
                              <CardHeader className="pb-3">
                                <CardTitle className="text-sm sm:text-base flex items-center gap-2">
                                  <Heart className="w-4 h-4" /> Histórico de Atendimentos ({selectedRecord.atendimentosAnimal?.length || 0})
                                </CardTitle>
                              </CardHeader>
                              <CardContent>
                                {selectedRecord.atendimentosAnimal?.length > 0 ? (
                                  <div className="space-y-3 max-h-48 sm:max-h-60 overflow-y-auto">
                                    {selectedRecord.atendimentosAnimal.map((atendimento: Atendimento) => (
                                      <div key={atendimento.id} className="border rounded p-2 sm:p-3 text-xs">
                                        <div className="flex justify-between items-start mb-2">
                                          <span className="font-medium">{formatDate(atendimento.data)}</span>
                                          <div className="flex gap-1">
                                            <span className="text-muted-foreground text-xs">Dr(a). {atendimento.veterinario}</span>
                                            {canEdit && (
                                              <div className="flex gap-1 ml-2">
                                                <Button
                                                  variant="ghost"
                                                  size="sm"
                                                  className="h-6 w-6 p-0"
                                                  onClick={() => handleEditAtendimento(atendimento)}
                                                >
                                                  <Edit className="w-3 h-3" />
                                                </Button>
                                                <AlertDialog>
                                                  <AlertDialogTrigger asChild>
                                                    <Button
                                                      variant="ghost"
                                                      size="sm"
                                                      className="h-6 w-6 p-0 text-red-600 hover:text-red-700"
                                                    >
                                                      <Trash2 className="w-3 h-3" />
                                                    </Button>
                                                  </AlertDialogTrigger>
                                                  <AlertDialogContent className="w-[95vw] max-w-md">
                                                    <AlertDialogHeader>
                                                      <AlertDialogTitle className="text-base">⚠️ Excluir Atendimento</AlertDialogTitle>
                                                      <AlertDialogDescription className="text-sm">
                                                        Você tem certeza que deseja excluir este atendimento?
                                                      </AlertDialogDescription>
                                                    </AlertDialogHeader>
                                                    <AlertDialogFooter className="flex-col sm:flex-row gap-2">
                                                      <AlertDialogCancel className="text-sm">Cancelar</AlertDialogCancel>
                                                      <AlertDialogAction
                                                        onClick={() => handleDeleteAtendimento(atendimento)}
                                                        className="bg-red-600 hover:bg-red-700 text-sm"
                                                      >
                                                        Excluir
                                                      </AlertDialogAction>
                                                    </AlertDialogFooter>
                                                  </AlertDialogContent>
                                                </AlertDialog>
                                              </div>
                                            )}
                                          </div>
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
                                  <p className="text-muted-foreground text-sm">Nenhum atendimento registrado</p>
                                )}
                              </CardContent>
                            </Card>

                            {/* Botões de Ação */}
                            <div className="flex flex-col sm:flex-row justify-between gap-2 pt-4 border-t">
                              <Button 
                                variant="outline"
                                onClick={() => generatePDF(selectedRecord.data, selectedRecord.tutor, selectedRecord.atendimentosAnimal)}
                                className="text-sm"
                              >
                                <Download className="w-4 h-4 mr-2" />
                                Exportar PDF
                              </Button>

                              {canEdit && (
                                <div className="flex flex-col sm:flex-row gap-2">
                                  <Button 
                                    variant="outline"
                                    onClick={() => handleEditAnimal(selectedRecord.data)}
                                    className="text-sm"
                                  >
                                    <Edit className="w-4 h-4 mr-2" />
                                    Editar Animal
                                  </Button>

                                  <Button 
                                    variant="outline"
                                    onClick={() => handleEditTutor(selectedRecord.tutor)}
                                    className="text-sm"
                                  >
                                    <Edit className="w-4 h-4 mr-2" />
                                    Editar Tutor
                                  </Button>
                                  
                                  {canDelete && (
                                    <AlertDialog>
                                      <AlertDialogTrigger asChild>
                                        <Button 
                                          variant="outline" 
                                          className="text-red-600 hover:text-red-700 text-sm"
                                        >
                                          <Trash2 className="w-4 h-4 mr-2" />
                                          Excluir
                                        </Button>
                                      </AlertDialogTrigger>
                                      <AlertDialogContent className="w-[95vw] max-w-md">
                                        <AlertDialogHeader>
                                          <AlertDialogTitle className="text-base">⚠️ Confirmar Exclusão</AlertDialogTitle>
                                          <AlertDialogDescription className="text-sm">
                                            Você tem certeza que deseja excluir <strong>{selectedRecord.data.nome}</strong>?
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
                                        <AlertDialogFooter className="flex-col sm:flex-row gap-2">
                                          <AlertDialogCancel className="text-sm">Cancelar</AlertDialogCancel>
                                          <AlertDialogAction
                                            onClick={() => handleDelete(selectedRecord.data)}
                                            className="bg-red-600 hover:bg-red-700 text-sm"
                                          >
                                            Sim, Excluir Definitivamente
                                          </AlertDialogAction>
                                        </AlertDialogFooter>
                                      </AlertDialogContent>
                                    </AlertDialog>
                                  )}
                                </div>
                              )}
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

        {filteredAnimais.length === 0 && searchTerm && (
          <Card>
            <CardContent className="text-center py-6 sm:py-8">
              <p className="text-muted-foreground text-sm">
                Nenhum resultado encontrado para "{searchTerm}"
              </p>
            </CardContent>
          </Card>
        )}

        {animais.length === 0 && (
          <Card>
            <CardContent className="text-center py-6 sm:py-8">
              <p className="text-muted-foreground text-sm">
                Nenhum animal cadastrado ainda.
              </p>
            </CardContent>
          </Card>
        )}
      </div>

      {/* Modal de Edição do Animal */}
      {editingAnimal && !readOnly && (
        <Dialog open={!!editingAnimal} onOpenChange={() => setEditingAnimal(null)}>
          <DialogContent className="w-[95vw] max-w-2xl max-h-[85vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Editar Animal - {editingAnimal.nome}</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleSaveAnimal} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="nome">Nome</Label>
                  <Input
                    id="nome"
                    value={editingAnimal.nome}
                    onChange={(e) => setEditingAnimal({...editingAnimal, nome: e.target.value})}
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="especie">Espécie</Label>
                  <Select value={editingAnimal.especie} onValueChange={(value) => setEditingAnimal({...editingAnimal, especie: value})}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Cão">Cão</SelectItem>
                      <SelectItem value="Gato">Gato</SelectItem>
                      <SelectItem value="Hamster">Hamster</SelectItem>
                      <SelectItem value="Coelho">Coelho</SelectItem>
                      <SelectItem value="Pássaro">Pássaro</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label htmlFor="raca">Raça</Label>
                  <Input
                    id="raca"
                    value={editingAnimal.raca}
                    onChange={(e) => setEditingAnimal({...editingAnimal, raca: e.target.value})}
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="sexo">Sexo</Label>
                  <Select value={editingAnimal.sexo} onValueChange={(value) => setEditingAnimal({...editingAnimal, sexo: value})}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Macho">Macho</SelectItem>
                      <SelectItem value="Fêmea">Fêmea</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label htmlFor="cor">Cor</Label>
                  <Input
                    id="cor"
                    value={editingAnimal.cor}
                    onChange={(e) => setEditingAnimal({...editingAnimal, cor: e.target.value})}
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="peso">Peso (kg)</Label>
                  <Input
                    id="peso"
                    type="number"
                    step="0.1"
                    value={editingAnimal.peso}
                    onChange={(e) => setEditingAnimal({...editingAnimal, peso: parseFloat(e.target.value)})}
                    required
                  />
                </div>
              </div>
              <div className="flex justify-end gap-2">
                <Button type="button" variant="outline" onClick={() => setEditingAnimal(null)}>
                  Cancelar
                </Button>
                <Button type="submit">
                  Salvar Alterações
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      )}

      {/* Modal de Edição do Tutor */}
      {editingTutor && !readOnly && (
        <Dialog open={!!editingTutor} onOpenChange={() => setEditingTutor(null)}>
          <DialogContent className="w-[95vw] max-w-2xl max-h-[85vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Editar Tutor - {editingTutor.nome}</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleSaveTutor} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="nome">Nome Completo</Label>
                  <Input
                    id="nome"
                    value={editingTutor.nome}
                    onChange={(e) => setEditingTutor({...editingTutor, nome: e.target.value})}
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="cpf">CPF</Label>
                  <Input
                    id="cpf"
                    value={editingTutor.cpf}
                    onChange={(e) => setEditingTutor({...editingTutor, cpf: e.target.value})}
                  />
                </div>
                <div>
                  <Label htmlFor="telefone">Telefone</Label>
                  <Input
                    id="telefone"
                    value={editingTutor.telefone}
                    onChange={(e) => setEditingTutor({...editingTutor, telefone: e.target.value})}
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="email">Email</Label>
                  <Input
                    id="email"
                    type="email"
                    value={editingTutor.email || ''}
                    onChange={(e) => setEditingTutor({...editingTutor, email: e.target.value})}
                  />
                </div>
              </div>
              <div>
                <Label htmlFor="endereco">Endereço</Label>
                <Textarea
                  id="endereco"
                  value={editingTutor.endereco || ''}
                  onChange={(e) => setEditingTutor({...editingTutor, endereco: e.target.value})}
                  rows={3}
                />
              </div>
              <div className="flex justify-end gap-2">
                <Button type="button" variant="outline" onClick={() => setEditingTutor(null)}>
                  Cancelar
                </Button>
                <Button type="submit">
                  Salvar Alterações
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      )}

      {/* Modal de Edição do Atendimento */}
      {editingAtendimento && !readOnly && (
        <Dialog open={!!editingAtendimento} onOpenChange={() => setEditingAtendimento(null)}>
          <DialogContent className="w-[95vw] max-w-2xl max-h-[85vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Editar Atendimento - {formatDate(editingAtendimento.data)}</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleSaveAtendimento} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="data">Data do Atendimento</Label>
                  <Input
                    id="data"
                    type="date"
                    value={editingAtendimento.data}
                    onChange={(e) => setEditingAtendimento({...editingAtendimento, data: e.target.value})}
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="veterinario">Veterinário</Label>
                  <Input
                    id="veterinario"
                    value={editingAtendimento.veterinario}
                    onChange={(e) => setEditingAtendimento({...editingAtendimento, veterinario: e.target.value})}
                    required
                  />
                </div>
              </div>
              <div>
                <Label htmlFor="sintomas">Sintomas</Label>
                <Textarea
                  id="sintomas"
                  value={editingAtendimento.sintomas}
                  onChange={(e) => setEditingAtendimento({...editingAtendimento, sintomas: e.target.value})}
                  rows={3}
                  required
                />
              </div>
              <div>
                <Label htmlFor="diagnostico">Diagnóstico</Label>
                <Textarea
                  id="diagnostico"
                  value={editingAtendimento.diagnostico}
                  onChange={(e) => setEditingAtendimento({...editingAtendimento, diagnostico: e.target.value})}
                  rows={3}
                  required
                />
              </div>
              <div>
                <Label htmlFor="tratamento">Tratamento</Label>
                <Textarea
                  id="tratamento"
                  value={editingAtendimento.tratamento}
                  onChange={(e) => setEditingAtendimento({...editingAtendimento, tratamento: e.target.value})}
                  rows={3}
                  required
                />
              </div>
              <div>
                <Label htmlFor="medicamentos">Medicamentos</Label>
                <Textarea
                  id="medicamentos"
                  value={editingAtendimento.medicamentos}
                  onChange={(e) => setEditingAtendimento({...editingAtendimento, medicamentos: e.target.value})}
                  rows={2}
                />
              </div>
              <div>
                <Label htmlFor="observacoes">Observações</Label>
                <Textarea
                  id="observacoes"
                  value={editingAtendimento.observacoes || ''}
                  onChange={(e) => setEditingAtendimento({...editingAtendimento, observacoes: e.target.value})}
                  rows={3}
                />
              </div>
              <div>
                <Label htmlFor="proximoRetorno">Próximo Retorno</Label>
                <Input
                  id="proximoRetorno"
                  type="date"
                  value={editingAtendimento.proximo_retorno || ''}
                  onChange={(e) => setEditingAtendimento({...editingAtendimento, proximo_retorno: e.target.value})}
                />
              </div>
              <div className="flex justify-end gap-2">
                <Button type="button" variant="outline" onClick={() => setEditingAtendimento(null)}>
                  Cancelar
                </Button>
                <Button type="submit">
                  Salvar Alterações
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
};

export default SearchResults;
