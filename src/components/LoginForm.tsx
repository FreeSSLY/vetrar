import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useAuth } from "@/hooks/useAuth";
import { useUsuarios } from "@/hooks/useUsuarios";
import { toast } from "@/hooks/use-toast";

export default function LoginForm() {
  const { signIn, signUp } = useAuth();
  const { loginUsuario } = useUsuarios();
  const [loading, setLoading] = useState(false);

  // Login form state
  const [loginEmail, setLoginEmail] = useState("");
  const [loginPassword, setLoginPassword] = useState("");

  // Signup form state
  const [signupEmail, setSignupEmail] = useState("");
  const [signupPassword, setSignupPassword] = useState("");
  const [signupNome, setSignupNome] = useState("");
  const [signupRole, setSignupRole] = useState<"admin" | "teste">("teste");

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!loginEmail || !loginPassword) {
      toast({
        title: "Erro",
        description: "Por favor, preencha todos os campos.",
        variant: "destructive",
      });
      return;
    }

    setLoading(true);

    try {
      console.log("Iniciando processo de login...");

      // Primeiro tenta login como usuário limitado (atendente)
      const atendenteSuccess = await loginUsuario(loginEmail, loginPassword);

      if (atendenteSuccess) {
        console.log("Login como atendente bem-sucedido");
        // Não precisa fazer mais nada - o AuthWrapper detectará automaticamente
        // e redirecionará para a interface do atendente
        setLoading(false);
        return;
      }

      console.log("Tentando login como administrador...");
      // Se não conseguiu fazer login como atendente, tenta como admin
      await signIn(loginEmail, loginPassword);
      toast({
        title: "Sucesso!",
        description: "Login realizado com sucesso.",
      });
    } catch (error: any) {
      console.error("Erro no login:", error);
      toast({
        title: "Erro",
        description: "Email ou senha incorretos.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!signupEmail || !signupPassword || !signupNome) {
      toast({
        title: "Erro",
        description: "Por favor, preencha todos os campos.",
        variant: "destructive",
      });
      return;
    }

    setLoading(true);
    try {
      await signUp(signupEmail, signupPassword, signupNome, signupRole);
      toast({
        title: "Sucesso!",
        description:
          "Conta criada com sucesso. Verifique seu email para ativar a conta.",
      });
    } catch (error: any) {
      toast({
        title: "Erro",
        description: error.message || "Erro ao criar conta.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-crarar-secondary to-white flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-crarar-primary mb-2">
            CRARAR
          </h1>
          <p className="text-lg text-crarar-text opacity-80">
            Sistema de Gestão Veterinária
          </p>
        </div>

        <Card className="shadow-lg">
          <Tabs defaultValue="login" className="w-full">
            {/* <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="login">Login</TabsTrigger>
              <TabsTrigger value="signup">Cadastrar</TabsTrigger>
            </TabsList> */}

            <TabsContent value="login">
              <CardHeader>
                <CardTitle>Fazer Login</CardTitle>
                <CardDescription>
                  Entre com suas credenciais de atendente ou administrador
                </CardDescription>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleLogin} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="login-email">Email</Label>
                    <Input
                      id="login-email"
                      type="email"
                      value={loginEmail}
                      onChange={(e) => setLoginEmail(e.target.value)}
                      placeholder="seu@email.com"
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="login-password">Senha</Label>
                    <Input
                      id="login-password"
                      type="password"
                      value={loginPassword}
                      onChange={(e) => setLoginPassword(e.target.value)}
                      placeholder="••••••••"
                      required
                    />
                  </div>
                  <Button type="submit" className="w-full" disabled={loading}>
                    {loading ? "Entrando..." : "Entrar"}
                  </Button>
                </form>

                {/* <div className="mt-4 text-center">
                  <p className="text-sm text-gray-600">
                    O sistema identificará automaticamente se você é atendente
                    ou administrador
                  </p>
                </div> */}
              </CardContent>
            </TabsContent>

            <TabsContent value="signup">
              <CardHeader>
                <CardTitle>Criar Conta</CardTitle>
                <CardDescription>
                  Cadastre-se como administrador no sistema
                </CardDescription>
              </CardHeader>
              {/* <CardContent>
                <form onSubmit={handleSignup} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="signup-nome">Nome Completo</Label>
                    <Input
                      id="signup-nome"
                      type="text"
                      value={signupNome}
                      onChange={(e) => setSignupNome(e.target.value)}
                      placeholder="Seu nome completo"
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="signup-email">Email</Label>
                    <Input
                      id="signup-email"
                      type="email"
                      value={signupEmail}
                      onChange={(e) => setSignupEmail(e.target.value)}
                      placeholder="seu@email.com"
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="signup-password">Senha</Label>
                    <Input
                      id="signup-password"
                      type="password"
                      value={signupPassword}
                      onChange={(e) => setSignupPassword(e.target.value)}
                      placeholder="••••••••"
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="signup-role">Tipo de Usuário</Label>
                    <Select
                      value={signupRole}
                      onValueChange={(value: "admin" | "teste") =>
                        setSignupRole(value)
                      }
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="teste">Usuário Teste</SelectItem>
                        <SelectItem value="admin">Administrador</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <Button type="submit" className="w-full" disabled={loading}>
                    {loading ? "Criando..." : "Criar Conta"}
                  </Button>
                </form>
              </CardContent> */}
            </TabsContent>
          </Tabs>
        </Card>
      </div>
    </div>
  );
}
