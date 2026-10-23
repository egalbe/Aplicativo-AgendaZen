"use client";

import { useState } from "react";
import Link from "next/link";
import { registerAction } from "../actions";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { AlertCircle, CheckCircle2, Loader2 } from "lucide-react";

export default function RegisterPage() {
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);
    setSuccess(null);
    setLoading(true);

    const formData = new FormData(e.currentTarget);
    const result = await registerAction(formData);

    if (result?.error) {
      setError(result.error);
      setLoading(false);
    } else if (result?.success) {
      setSuccess(result.message || "Conta criada com sucesso!");
      setLoading(false);
    }
  }

  return (
    <Card className="shadow-md border-slate-200">
      <CardHeader className="space-y-1">
        <CardTitle className="text-2xl font-bold tracking-tight text-brand-dark">
          Criar conta no AgendaZen
        </CardTitle>
        <CardDescription>
          Comece agora seu teste grátis de 14 dias sem compromisso
        </CardDescription>
      </CardHeader>
      <CardContent>
        {success ? (
          <div className="space-y-4 text-center py-4">
            <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-emerald-100 text-brand-light">
              <CheckCircle2 className="h-6 w-6" />
            </div>
            <p className="text-sm text-slate-700">{success}</p>
            <Button asChild className="w-full bg-brand-dark hover:bg-brand-primary">
              <Link href="/login">Ir para o Login</Link>
            </Button>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            {error && (
              <div className="flex items-center gap-2 p-3 text-sm text-red-700 bg-red-50 border border-red-200 rounded-lg">
                <AlertCircle className="h-4 w-4 shrink-0" />
                <span>{error}</span>
              </div>
            )}

            <div className="space-y-1.5">
              <Label htmlFor="name">Seu Nome Completo</Label>
              <Input
                id="name"
                name="name"
                type="text"
                required
                placeholder="Dra. Mariana Silva"
                className="bg-white"
              />
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="email">E-mail de Trabalho</Label>
              <Input
                id="email"
                name="email"
                type="email"
                required
                placeholder="mariana@clinicazen.com.br"
                className="bg-white"
              />
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="password">Criar Senha</Label>
              <Input
                id="password"
                name="password"
                type="password"
                required
                placeholder="No mínimo 6 dígitos"
                className="bg-white"
              />
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="confirmPassword">Confirmar Senha</Label>
              <Input
                id="confirmPassword"
                name="confirmPassword"
                type="password"
                required
                placeholder="Repita a senha"
                className="bg-white"
              />
            </div>

            <Button
              type="submit"
              className="w-full bg-brand-dark hover:bg-brand-primary font-semibold py-2.5"
              disabled={loading}
            >
              {loading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Cadastrando clínica...
                </>
              ) : (
                "Criar Conta & Configurar Clínica"
              )}
            </Button>

            <div className="text-center text-sm text-slate-600 pt-2">
              Já possui uma conta?{" "}
              <Link
                href="/login"
                className="font-medium text-brand-dark hover:text-brand-primary underline"
              >
                Entrar
              </Link>
            </div>
          </form>
        )}
      </CardContent>
    </Card>
  );
}
