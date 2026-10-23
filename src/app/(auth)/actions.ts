"use server";

import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { loginSchema, registerSchema } from "@/lib/validations/auth";

export async function loginAction(formData: FormData) {
  const rawData = {
    email: formData.get("email"),
    password: formData.get("password"),
  };

  const parsed = loginSchema.safeParse(rawData);
  if (!parsed.success) {
    return {
      error: parsed.error.errors[0]?.message || "Dados inválidos",
    };
  }

  const supabase = await createClient();
  const { data, error } = await supabase.auth.signInWithPassword({
    email: parsed.data.email,
    password: parsed.data.password,
  });

  if (error) {
    return { error: "E-mail ou senha inválidos." };
  }

  // Verifica se o usuário já pertence a uma clínica
  const { data: member } = await supabase
    .from("clinic_members")
    .select("clinic_id")
    .eq("user_id", data.user.id)
    .single();

  if (!member) {
    redirect("/onboarding");
  }

  redirect("/agenda");
}

export async function registerAction(formData: FormData) {
  const rawData = {
    name: formData.get("name"),
    email: formData.get("email"),
    password: formData.get("password"),
    confirmPassword: formData.get("confirmPassword"),
  };

  const parsed = registerSchema.safeParse(rawData);
  if (!parsed.success) {
    return {
      error: parsed.error.errors[0]?.message || "Dados inválidos",
    };
  }

  const supabase = await createClient();
  const { data, error } = await supabase.auth.signUp({
    email: parsed.data.email,
    password: parsed.data.password,
    options: {
      data: {
        full_name: parsed.data.name,
      },
    },
  });

  if (error) {
    return { error: error.message || "Erro ao criar conta." };
  }

  if (data.session) {
    redirect("/onboarding");
  }

  return {
    success: true,
    message: "Conta criada! Verifique seu e-mail caso a confirmação seja necessária.",
  };
}

export async function logoutAction() {
  const supabase = await createClient();
  await supabase.auth.signOut();
  redirect("/login");
}
