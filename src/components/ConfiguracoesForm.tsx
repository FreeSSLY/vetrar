import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { toast } from "@/hooks/use-toast";
import { User, Lock, Mail, Edit } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";

interface ConfiguracoesFormProps {
  userRole: string;
}

const ConfiguracoesForm = ({ userRole }: ConfiguracoesFormProps) => {
  const { profile } = useAuth();
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [newEmail, setNewEmail] = useState("");
  const [newName, setNewName] = useState("");

  const handleNameChange = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!newName.trim()) {
      toast({
        title: "Erro!",
        description: "Digite um nome válido.",
        variant: "destructive",
      });
      return;
    }

    try {
      const { error } = await supabase.auth.updateUser({
        data: { nome: newName },
      });

      if (error) throw error;

      toast({
        title: "Sucesso!",
        description: "Nome alterado com sucesso.",
      });

      setNewName("");
    } catch (error) {
      console.error("Error updating name:", error);
      toast({
        title: "Erro!",
        description: "Erro ao alterar nome. Tente novamente.",
        variant: "destructive",
      });
    }
  };

  const handlePasswordChange = async (e: React.FormEvent) => {
    e.preventDefault();

    if (newPassword !== confirmPassword) {
      toast({
        title: "Erro!",
        description: "As senhas não coincidem.",
        variant: "destructive",
      });
      return;
    }

    if (newPassword.length < 6) {
      toast({
        title: "Erro!",
        description: "A nova senha deve ter pelo menos 6 caracteres.",
        variant: "destructive",
      });
      return;
    }

    try {
      const { error } = await supabase.auth.updateUser({
        password: newPassword,
      });

      if (error) throw error;

      toast({
        title: "Sucesso!",
        description: "Senha alterada com sucesso.",
      });

      setCurrentPassword("");
      setNewPassword("");
      setConfirmPassword("");
    } catch (error) {
      console.error("Error updating password:", error);
      toast({
        title: "Erro!",
        description: "Erro ao alterar senha. Tente novamente.",
        variant: "destructive",
      });
    }
  };

  const handleEmailChange = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!newEmail || !newEmail.includes("@")) {
      toast({
        title: "Erro!",
        description: "Digite um email válido.",
        variant: "destructive",
      });
      return;
    }

    try {
      const { error } = await supabase.auth.updateUser({
        email: newEmail,
      });

      if (error) throw error;

      toast({
        title: "Sucesso!",
        description:
          "Email de confirmação enviado. Verifique sua caixa de entrada.",
      });

      setNewEmail("");
    } catch (error) {
      console.error("Error updating email:", error);
      toast({
        title: "Erro!",
        description: "Erro ao alterar email. Tente novamente.",
        variant: "destructive",
      });
    }
  };

  return (
    <div className="space-y-6">
      {/* Informações do Usuário */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <User className="w-5 h-5" />
            Informações do Usuário
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div>
              <Label>Tipo de Usuário</Label>
              <Input
                value={userRole === "admin" ? "Administrador" : "Usuário Teste"}
                disabled
                className="bg-gray-50"
              />
            </div>
            <div>
              <Label>Email Atual</Label>
              <Input
                value={profile?.email || "usuario@teste.com"}
                disabled
                className="bg-gray-50"
              />
            </div>
            <div>
              <Label>Nome Atual</Label>
              <Input
                value={profile?.nome || "Usuário"}
                disabled
                className="bg-gray-50"
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Alterar Nome */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Edit className="w-5 h-5" />
            Alterar Nome
          </CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleNameChange} className="space-y-4">
            <div>
              <Label htmlFor="newName">Novo Nome</Label>
              <Input
                id="newName"
                type="text"
                value={newName}
                onChange={(e) => setNewName(e.target.value)}
                placeholder="Digite o novo nome"
                required
              />
            </div>
            <Button type="submit" className="w-full">
              Alterar Nome
            </Button>
          </form>
        </CardContent>
      </Card>

      {/* Alterar Email */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Mail className="w-5 h-5" />
            Alterar Email
          </CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleEmailChange} className="space-y-4">
            <div>
              <Label htmlFor="newEmail">Novo Email</Label>
              <Input
                id="newEmail"
                type="email"
                value={newEmail}
                onChange={(e) => setNewEmail(e.target.value)}
                placeholder="Digite o novo email"
                required
              />
            </div>
            <Button type="submit" className="w-full">
              Alterar Email
            </Button>
          </form>
        </CardContent>
      </Card>

      <Separator />

      {/* Alterar Senha */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Lock className="w-5 h-5" />
            Alterar Senha
          </CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handlePasswordChange} className="space-y-4">
            <div>
              <Label htmlFor="newPassword">Nova Senha</Label>
              <Input
                id="newPassword"
                type="password"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                placeholder="Digite a nova senha"
                required
              />
            </div>

            <div>
              <Label htmlFor="confirmPassword">Confirmar Nova Senha</Label>
              <Input
                id="confirmPassword"
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="Confirme a nova senha"
                required
              />
            </div>

            <Button type="submit" className="w-full">
              Alterar Senha
            </Button>
          </form>
        </CardContent>
      </Card>

      {/* Informações Adicionais */}
      <Card>
        <CardHeader>
          <CardTitle>Informações do Sistema</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-sm text-gray-600 space-y-2">
            <p>
              <strong>Versão:</strong> 1.0.0
            </p>
            <p>
              <strong>Última atualização:</strong>{" "}
              {new Date().toLocaleDateString("pt-BR")}
            </p>
            <p>
              <strong>Permissões:</strong>{" "}
              {userRole === "admin"
                ? "Administrador completo"
                : "Visualização e cadastro limitado"}
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default ConfiguracoesForm;
