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
  Loader2,
  Eye,
  EyeOff,
  Sparkles,
  ArrowRight,
  Zap,
  Repeat,
  CalendarCheck,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { api } from "@/lib/axios";
import { useAuthStore } from "@/stores/auth-store";
import { useLanguage } from "@/hooks/use-language";
import type { ApiResponse, AuthResponse } from "@/types";

export default function LoginPage() {
  const router = useRouter();
  const setAuth = useAuthStore((s) => s.setAuth);
  const { t } = useLanguage();
  const [isLoading, setIsLoading] = useState(false);
  const [isDemoLoading, setIsDemoLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const loginSchema = useMemo(
    () =>
      z.object({
        email: z.string().email(t.auth.valEmailValid),
        password: z.string().min(1, t.auth.valPasswordRequired),
      }),
    [t.auth.valEmailValid, t.auth.valPasswordRequired]
  );

  type LoginForm = z.infer<typeof loginSchema>;

  const {
    register,
    handleSubmit,
    setValue,
    formState: { errors },
  } = useForm<LoginForm>({
    resolver: zodResolver(loginSchema),
  });

  const handleFillDemo = () => {
    setValue("email", "demo@daytask.app", { shouldValidate: true, shouldDirty: true });
    setValue("password", "Password123!", { shouldValidate: true, shouldDirty: true });
    toast.success(t.auth.demoCredentialsToast, {
      icon: <Sparkles className="h-4 w-4 text-primary" />,
    });
  };

  const handleOneClickDemo = async () => {
    setIsDemoLoading(true);
    try {
      const res = await api.post<ApiResponse<AuthResponse>>("/auth/login", {
        email: "demo@daytask.app",
        password: "Password123!",
      });
      const { user, accessToken } = res.data.data;
      setAuth(user, accessToken);
      toast.success(`${t.auth.demoWelcomeToast}, ${user.displayName}!`, {
        icon: <Sparkles className="h-4 w-4 text-primary" />,
      });
      router.push("/dashboard");
    } catch (error: any) {
      const message =
        error.response?.data?.message || t.auth.demoLoginFailed;
      toast.error(Array.isArray(message) ? message[0] : message);
    } finally {
      setIsDemoLoading(false);
    }
  };

  const onSubmit = async (data: LoginForm) => {
    setIsLoading(true);
    try {
      const res = await api.post<ApiResponse<AuthResponse>>("/auth/login", data);
      const { user, accessToken } = res.data.data;
      setAuth(user, accessToken);
      toast.success(`${t.auth.welcomeBackToast}, ${user.displayName}!`);
      router.push("/dashboard");
    } catch (error: any) {
      const message =
        error.response?.data?.message || t.auth.loginFailed;
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
      <div className="absolute top-0 inset-x-0 h-1 bg-gradient-to-r from-primary/30 via-indigo-500 to-cyan-400" />

      {/* Header section with floating badges */}
      <div className="text-center space-y-2">
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full border border-primary/25 bg-primary/10 text-[11px] font-medium text-primary shadow-xs">
          <Sparkles className="h-3 w-3" />
          <span>{t.auth.productivityBadge}</span>
        </div>
        <h1 className="text-2xl sm:text-3xl font-bold tracking-tight">{t.auth.loginTitle}</h1>
        <p className="text-xs sm:text-sm text-muted-foreground">
          {t.auth.loginSubtitle}
        </p>
      </div>

      {/* Highlights pill tags */}
      <div className="flex items-center justify-center gap-2 pt-1 pb-1">
        <span className="inline-flex items-center gap-1 text-[11px] px-2.5 py-0.5 rounded-md bg-muted/60 border border-border/60 text-muted-foreground">
          <CalendarCheck className="h-3 w-3 text-primary" /> {t.auth.dayAndWeekTag}
        </span>
        <span className="inline-flex items-center gap-1 text-[11px] px-2.5 py-0.5 rounded-md bg-muted/60 border border-border/60 text-muted-foreground">
          <Repeat className="h-3 w-3 text-emerald-500" /> {t.auth.autoRolloverTag}
        </span>
        <span className="inline-flex items-center gap-1 text-[11px] px-2.5 py-0.5 rounded-md bg-muted/60 border border-border/60 text-muted-foreground">
          <Zap className="h-3 w-3 text-amber-500" /> {t.auth.liveSyncTag}
        </span>
      </div>

      {/* One-Click Demo Account Banner */}
      <div className="relative group overflow-hidden rounded-xl border border-primary/25 bg-gradient-to-r from-primary/10 via-indigo-500/10 to-primary/5 p-3.5 flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 transition-all hover:border-primary/40">
        <div className="flex items-center gap-2.5 min-w-0">
          <div className="h-8 w-8 rounded-lg bg-primary/20 text-primary flex items-center justify-center shrink-0">
            <Sparkles className="h-4 w-4 text-primary" />
          </div>
          <div className="min-w-0">
            <div className="flex items-center gap-2">
              <p className="text-xs font-semibold text-foreground">{t.auth.demoBannerTitle}</p>
              <span className="text-[10px] bg-primary/20 text-primary px-1.5 py-0.5 rounded font-medium">{t.auth.oneClick}</span>
            </div>
            <p className="text-[11px] text-muted-foreground truncate">{t.auth.demoBannerSubtitle}</p>
          </div>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          <Button
            type="button"
            onClick={handleFillDemo}
            size="sm"
            variant="ghost"
            className="h-8 text-xs font-normal text-muted-foreground hover:text-foreground px-2"
          >
            {t.auth.autofill}
          </Button>
          <Button
            type="button"
            onClick={handleOneClickDemo}
            disabled={isDemoLoading || isLoading}
            size="sm"
            className="h-8 text-xs font-medium rounded-lg bg-primary hover:bg-primary/90 text-primary-foreground shadow-xs"
          >
            {isDemoLoading ? (
              <>
                <Loader2 className="h-3.5 w-3.5 animate-spin mr-1.5" />
                {t.auth.loggingIn}
              </>
            ) : (
              <>
                <Zap className="h-3.5 w-3.5 mr-1 text-amber-300" />
                {t.auth.oneClickDemo}
              </>
            )}
          </Button>
        </div>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
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
              className="pl-10 rounded-xl h-11 bg-background/60 border-border/70 transition-all focus-visible:ring-primary/30 focus-visible:border-primary"
              {...register("email")}
            />
          </div>
          {errors.email && (
            <p className="text-xs text-destructive mt-1">{errors.email.message}</p>
          )}
        </div>

        {/* Password */}
        <div className="space-y-1.5">
          <div className="flex items-center justify-between">
            <Label htmlFor="password" className="text-xs font-medium">
              {t.auth.passwordLabel}
            </Label>
          </div>
          <div className="relative">
            <Lock className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              id="password"
              type={showPassword ? "text" : "password"}
              placeholder="••••••••"
              className="pl-10 pr-10 rounded-xl h-11 bg-background/60 border-border/70 transition-all focus-visible:ring-primary/30 focus-visible:border-primary"
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

        {/* Submit Button */}
        <Button
          type="submit"
          className="w-full h-11 rounded-xl font-medium shadow-md shadow-primary/20 hover:shadow-lg hover:shadow-primary/30 active:scale-[0.98] transition-all bg-primary hover:bg-primary/90 text-primary-foreground"
          disabled={isLoading}
        >
          {isLoading ? (
            <>
              <Loader2 className="h-4 w-4 animate-spin mr-2" />
              {t.auth.loggingIn}
            </>
          ) : (
            <>
              {t.auth.loginButton}
              <ArrowRight className="h-4 w-4 ml-1.5" />
            </>
          )}
        </Button>
      </form>

      {/* Switch to Register */}
      <div className="pt-2 text-center text-xs text-muted-foreground">
        {t.auth.noAccount}{" "}
        <Link
          href="/register"
          className="font-semibold text-primary hover:underline"
        >
          {t.auth.signUp}
        </Link>
      </div>
    </motion.div>
  );
}
