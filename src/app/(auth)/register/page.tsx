"use client";

import { useState, useMemo } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { motion } from "framer-motion";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { toast } from "sonner";
import {
  Mail,
  Lock,
  User,
  Loader2,
  Eye,
  EyeOff,
  ArrowRight,
  Sparkles,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { api } from "@/lib/axios";
import { useAuthStore } from "@/stores/auth-store";
import { useLanguage } from "@/hooks/use-language";
import type { ApiResponse, AuthResponse } from "@/types";

export default function RegisterPage() {
  const router = useRouter();
  const setAuth = useAuthStore((s) => s.setAuth);
  const { t } = useLanguage();
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const registerSchema = useMemo(
    () =>
      z
        .object({
          displayName: z.string().min(1, t.auth.valNameRequired).max(100),
          email: z.string().email(t.auth.valEmailValid),
          password: z.string().min(6, t.auth.valPasswordMin),
          confirmPassword: z.string().min(1, t.auth.valConfirmPasswordRequired),
        })
        .refine((data) => data.password === data.confirmPassword, {
          message: t.auth.valPasswordsMatch,
          path: ["confirmPassword"],
        }),
    [
      t.auth.valNameRequired,
      t.auth.valEmailValid,
      t.auth.valPasswordMin,
      t.auth.valConfirmPasswordRequired,
      t.auth.valPasswordsMatch,
    ]
  );

  type RegisterForm = z.infer<typeof registerSchema>;

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<RegisterForm>({
    resolver: zodResolver(registerSchema),
  });

  const onSubmit = async (data: RegisterForm) => {
    setIsLoading(true);
    try {
      const res = await api.post<ApiResponse<AuthResponse>>("/auth/register", {
        email: data.email,
        password: data.password,
        displayName: data.displayName,
        timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
      });
      const { user, accessToken } = res.data.data;
      setAuth(user, accessToken);
      toast.success(`${t.auth.welcomeRegisterToast}, ${user.displayName}!`);
      router.push("/dashboard");
    } catch (error: any) {
      const message =
        error.response?.data?.message || t.auth.registerFailed;
      toast.error(Array.isArray(message) ? message[0] : message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className="relative rounded-2xl border border-border/80 bg-card/90 backdrop-blur-xl p-6 sm:p-8 shadow-2xl space-y-6 overflow-hidden ring-1 ring-primary/10"
    >
      {/* Top subtle highlight gradient beam */}
      <div className="absolute top-0 inset-x-0 h-1 bg-gradient-to-r from-cyan-400 via-indigo-500 to-primary/40" />

      {/* Header section */}
      <div className="text-center space-y-2">
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full border border-primary/25 bg-primary/10 text-[11px] font-medium text-primary shadow-xs">
          <Sparkles className="h-3 w-3" />
          <span>{t.auth.registerBadge}</span>
        </div>
        <h1 className="text-2xl sm:text-3xl font-bold tracking-tight">{t.auth.registerTitle}</h1>
        <p className="text-xs sm:text-sm text-muted-foreground">
          {t.auth.registerSubtitle}
        </p>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        {/* Display Name */}
        <div className="space-y-1.5">
          <Label htmlFor="displayName" className="text-xs font-medium">
            {t.auth.displayNameLabel}
          </Label>
          <div className="relative">
            <User className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              id="displayName"
              placeholder={t.auth.displayNamePlaceholder}
              className="pl-10 rounded-xl h-11 bg-background/60 border-border/70 transition-all focus-visible:ring-primary/30"
              {...register("displayName")}
            />
          </div>
          {errors.displayName && (
            <p className="text-xs text-destructive mt-1">{errors.displayName.message}</p>
          )}
        </div>

        {/* Email */}
        <div className="space-y-1.5">
          <Label htmlFor="email" className="text-xs font-medium">
            {t.auth.emailLabel}
          </Label>
          <div className="relative">
            <Mail className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              id="email"
              type="email"
              placeholder={t.auth.emailPlaceholder}
              className="pl-10 rounded-xl h-11 bg-background/60 border-border/70 transition-all focus-visible:ring-primary/30"
              {...register("email")}
            />
          </div>
          {errors.email && (
            <p className="text-xs text-destructive mt-1">{errors.email.message}</p>
          )}
        </div>

        {/* Password */}
        <div className="space-y-1.5">
          <Label htmlFor="password" className="text-xs font-medium">
            {t.auth.passwordLabel}
          </Label>
          <div className="relative">
            <Lock className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              id="password"
              type={showPassword ? "text" : "password"}
              placeholder={t.auth.passwordPlaceholder}
              className="pl-10 pr-10 rounded-xl h-11 bg-background/60 border-border/70 transition-all focus-visible:ring-primary/30"
              {...register("password")}
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-3.5 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
            >
              {showPassword ? (
                <EyeOff className="h-4 w-4" />
              ) : (
                <Eye className="h-4 w-4" />
              )}
            </button>
          </div>
          {errors.password && (
            <p className="text-xs text-destructive mt-1">{errors.password.message}</p>
          )}
        </div>

        {/* Confirm Password */}
        <div className="space-y-1.5">
          <Label htmlFor="confirmPassword" className="text-xs font-medium">
            {t.auth.confirmPasswordLabel}
          </Label>
          <div className="relative">
            <Lock className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              id="confirmPassword"
              type={showPassword ? "text" : "password"}
              placeholder={t.auth.confirmPasswordPlaceholder}
              className="pl-10 rounded-xl h-11 bg-background/60 border-border/70 transition-all focus-visible:ring-primary/30"
              {...register("confirmPassword")}
            />
          </div>
          {errors.confirmPassword && (
            <p className="text-xs text-destructive mt-1">
              {errors.confirmPassword.message}
            </p>
          )}
        </div>

        {/* Submit */}
        <Button
          type="submit"
          className="w-full h-11 rounded-xl font-medium shadow-md shadow-primary/20 hover:shadow-lg hover:shadow-primary/30 active:scale-[0.98] transition-all bg-primary hover:bg-primary/90 text-primary-foreground"
          disabled={isLoading}
        >
          {isLoading ? (
            <>
              <Loader2 className="h-4 w-4 animate-spin mr-2" />
              {t.auth.registering}
            </>
          ) : (
            <>
              {t.auth.registerButton}
              <ArrowRight className="h-4 w-4 ml-1.5" />
            </>
          )}
        </Button>
      </form>

      <div className="pt-2 text-center text-xs text-muted-foreground">
        {t.auth.haveAccount}{" "}
        <Link
          href="/login"
          className="font-semibold text-primary hover:underline"
        >
          {t.auth.signIn}
        </Link>
      </div>
    </motion.div>
  );
}
