"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { motion } from "framer-motion";
import { toast } from "sonner";
import { useTheme } from "next-themes";
import {
  Plus,
  Trash2,
  Edit2,
  User as UserIcon,
  Palette,
  Lock,
  Sparkles,
  Globe,
  Mail,
  Check,
  Sun,
  Moon,
  Laptop,
  CheckCircle2,
  AlertTriangle,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { api } from "@/lib/axios";
import { useAuthStore } from "@/stores/auth-store";
import { useColorTheme } from "@/hooks/use-color-theme";
import { useLanguage } from "@/hooks/use-language";
import {
  useCategories,
  useCreateCategory,
  useUpdateCategory,
  useDeleteCategory,
} from "@/hooks/use-categories";
import type { Category } from "@/types";

// Profile Schema
const profileSchema = z.object({
  displayName: z.string().min(1, "Display name is required").max(100),
  timezone: z.string().optional(),
});

// Password Schema
const passwordSchema = z
  .object({
    currentPassword: z.string().min(1, "Current password is required"),
    newPassword: z.string().min(6, "New password must be at least 6 characters"),
    confirmNewPassword: z.string().min(1, "Please confirm your new password"),
  })
  .refine((data) => data.newPassword === data.confirmNewPassword, {
    message: "Passwords do not match",
    path: ["confirmNewPassword"],
  });

type ProfileForm = z.infer<typeof profileSchema>;
type PasswordForm = z.infer<typeof passwordSchema>;

const PRESET_COLORS = [
  "#6366f1", // indigo
  "#ec4899", // pink
  "#f43f5e", // rose
  "#f97316", // orange
  "#eab308", // yellow
  "#10b981", // emerald
  "#06b6d4", // cyan
  "#8b5cf6", // purple
  "#64748b", // slate
];

export default function SettingsPage() {
  const user = useAuthStore((s) => s.user);
  const setUser = useAuthStore((s) => s.setUser);
  const { theme, setTheme } = useTheme();
  const { colorTheme, setColorTheme, presets, mounted } = useColorTheme();
  const { language, setLanguage, t } = useLanguage();
  const { data: categories = [] } = useCategories();
  const createCategory = useCreateCategory();
  const updateCategory = useUpdateCategory();
  const deleteCategory = useDeleteCategory();

  // Category modal state
  const [categoryModalOpen, setCategoryModalOpen] = useState(false);
  const [editingCategory, setEditingCategory] = useState<Category | null>(null);
  const [categoryToDelete, setCategoryToDelete] = useState<Category | null>(null);
  const [categoryName, setCategoryName] = useState("");
  const [categoryColor, setCategoryColor] = useState("#6366f1");

  // Profile form
  const {
    register: registerProfile,
    handleSubmit: handleProfileSubmit,
    formState: { isSubmitting: isProfileSubmitting },
  } = useForm<ProfileForm>({
    resolver: zodResolver(profileSchema),
    defaultValues: {
      displayName: user?.displayName || "",
      timezone: user?.timezone || "UTC",
    },
  });

  // Password form
  const {
    register: registerPassword,
    handleSubmit: handlePasswordSubmit,
    reset: resetPassword,
    formState: { errors: passwordErrors, isSubmitting: isPasswordSubmitting },
  } = useForm<PasswordForm>({
    resolver: zodResolver(passwordSchema),
  });

  const onProfileSubmit = async (data: ProfileForm) => {
    try {
      const res = await api.patch("/users/profile", data);
      setUser(res.data.data);
      toast.success(t.settings.profileUpdatedToast);
    } catch (error: any) {
      toast.error(error.response?.data?.message || t.common.error);
    }
  };

  const onPasswordSubmit = async (data: PasswordForm) => {
    try {
      await api.patch("/users/password", {
        currentPassword: data.currentPassword,
        newPassword: data.newPassword,
      });
      toast.success(t.settings.passwordUpdatedToast);
      resetPassword();
    } catch (error: any) {
      toast.error(error.response?.data?.message || t.common.error);
    }
  };

  const openCategoryModal = (cat?: Category) => {
    if (cat) {
      setEditingCategory(cat);
      setCategoryName(cat.name);
      setCategoryColor(cat.color);
    } else {
      setEditingCategory(null);
      setCategoryName("");
      setCategoryColor("#6366f1");
    }
    setCategoryModalOpen(true);
  };

  const handleSaveCategory = () => {
    if (!categoryName.trim()) return;

    if (editingCategory) {
      updateCategory.mutate(
        { id: editingCategory.id, name: categoryName, color: categoryColor },
        { onSuccess: () => setCategoryModalOpen(false) }
      );
    } else {
      createCategory.mutate(
        { name: categoryName, color: categoryColor },
        { onSuccess: () => setCategoryModalOpen(false) }
      );
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
      className="max-w-4xl mx-auto p-6 sm:p-8 space-y-8 overflow-y-auto no-scrollbar"
    >
      {/* Page Header */}
      <div>
        <h1 className="text-2xl font-bold tracking-tight bg-gradient-to-r from-foreground to-muted-foreground bg-clip-text text-transparent">
          {t.settings.title}
        </h1>
        <p className="text-sm text-muted-foreground mt-1">
          {t.settings.subtitle}
        </p>
      </div>

      {/* Language Section */}
      <section className="rounded-2xl border border-border/80 bg-card/60 backdrop-blur-md p-6 shadow-xs space-y-6">
        <div className="flex items-center gap-3">
          <div className="h-10 w-10 rounded-xl bg-primary/10 border border-primary/20 flex items-center justify-center text-primary">
            <Globe className="h-5 w-5" />
          </div>
          <div>
            <h2 className="text-base font-semibold tracking-tight">{t.settings.languageSection}</h2>
            <p className="text-xs text-muted-foreground">{t.settings.languageDesc}</p>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 max-w-md">
          <button
            type="button"
            onClick={() => {
              setLanguage("en");
              toast.success(t.settings.languageAppliedToast);
            }}
            className={`flex items-center justify-between p-4 rounded-xl border transition-all duration-200 text-xs font-semibold ${
              language === "en"
                ? "border-primary bg-primary/10 text-primary shadow-sm ring-1 ring-primary"
                : "border-border/70 bg-background/50 text-muted-foreground hover:text-foreground hover:bg-background/80"
            }`}
          >
            <div className="flex items-center gap-2.5">
              <span className="text-base">🇺🇸</span>
              <span>{t.settings.langEnglish}</span>
            </div>
            {language === "en" && <Check className="h-4 w-4 text-primary" />}
          </button>

          <button
            type="button"
            onClick={() => {
              setLanguage("vi");
              toast.success(t.settings.languageAppliedToast);
            }}
            className={`flex items-center justify-between p-4 rounded-xl border transition-all duration-200 text-xs font-semibold ${
              language === "vi"
                ? "border-primary bg-primary/10 text-primary shadow-sm ring-1 ring-primary"
                : "border-border/70 bg-background/50 text-muted-foreground hover:text-foreground hover:bg-background/80"
            }`}
          >
            <div className="flex items-center gap-2.5">
              <span className="text-base">🇻🇳</span>
              <span>{t.settings.langVietnamese}</span>
            </div>
            {language === "vi" && <Check className="h-4 w-4 text-primary" />}
          </button>
        </div>
      </section>

      {/* Profile Section */}
      <section className="rounded-2xl border border-border/80 bg-card/60 backdrop-blur-md p-6 shadow-xs space-y-6">
        <div className="flex items-center gap-3">
          <div className="h-10 w-10 rounded-xl bg-primary/10 border border-primary/20 flex items-center justify-center text-primary">
            <UserIcon className="h-5 w-5" />
          </div>
          <div>
            <h2 className="text-base font-semibold tracking-tight">{t.settings.profileSection}</h2>
            <p className="text-xs text-muted-foreground">{t.settings.profileDesc}</p>
          </div>
        </div>

        <form
          onSubmit={handleProfileSubmit(onProfileSubmit)}
          className="space-y-4 max-w-lg"
        >
          <div className="space-y-1.5">
            <Label htmlFor="displayName" className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
              {t.settings.displayName}
            </Label>
            <Input
              id="displayName"
              className="h-10 rounded-xl bg-background/50 border-border/80 text-sm"
              {...registerProfile("displayName")}
            />
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="email" className="text-xs font-semibold uppercase tracking-wider text-muted-foreground flex items-center gap-1.5">
              <Mail className="h-3.5 w-3.5 text-muted-foreground" />
              {t.settings.email}
            </Label>
            <Input
              id="email"
              value={user?.email || ""}
              disabled
              className="h-10 rounded-xl bg-muted/40 border-border/60 text-sm text-muted-foreground font-mono"
            />
          </div>

          <Button
            type="submit"
            disabled={isProfileSubmitting}
            className="rounded-xl h-9 px-5 text-xs font-medium shadow-sm hover:shadow-md transition-all active:scale-[0.98]"
          >
            {isProfileSubmitting ? t.common.saving : t.settings.saveProfile}
          </Button>
        </form>
      </section>

      {/* Appearance & Color Theme Section */}
      <section className="rounded-2xl border border-border/80 bg-card/60 backdrop-blur-md p-6 shadow-xs space-y-6">
        <div className="flex items-center gap-3">
          <div className="h-10 w-10 rounded-xl bg-primary/10 border border-primary/20 flex items-center justify-center text-primary">
            <Palette className="h-5 w-5" />
          </div>
          <div>
            <h2 className="text-base font-semibold tracking-tight">{t.settings.appearanceSection}</h2>
            <p className="text-xs text-muted-foreground">
              {t.settings.appearanceDesc}
            </p>
          </div>
        </div>

        {/* 1. Theme Mode: Light / Dark / System */}
        <div className="space-y-3 pt-2">
          <Label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
            {t.settings.themeMode}
          </Label>
          <div className="grid grid-cols-3 gap-3 max-w-md">
            <button
              type="button"
              onClick={() => setTheme("light")}
              className={`flex flex-col items-center justify-center gap-2 p-3.5 rounded-xl border transition-all duration-200 text-xs font-semibold ${
                mounted && theme === "light"
                  ? "border-primary bg-primary/10 text-primary shadow-sm ring-1 ring-primary"
                  : "border-border/70 bg-background/50 text-muted-foreground hover:text-foreground hover:bg-background/80"
              }`}
            >
              <Sun className="h-5 w-5" />
              <span>{t.settings.themeLight}</span>
            </button>

            <button
              type="button"
              onClick={() => setTheme("dark")}
              className={`flex flex-col items-center justify-center gap-2 p-3.5 rounded-xl border transition-all duration-200 text-xs font-semibold ${
                mounted && theme === "dark"
                  ? "border-primary bg-primary/10 text-primary shadow-sm ring-1 ring-primary"
                  : "border-border/70 bg-background/50 text-muted-foreground hover:text-foreground hover:bg-background/80"
              }`}
            >
              <Moon className="h-5 w-5" />
              <span>{t.settings.themeDark}</span>
            </button>

            <button
              type="button"
              onClick={() => setTheme("system")}
              className={`flex flex-col items-center justify-center gap-2 p-3.5 rounded-xl border transition-all duration-200 text-xs font-semibold ${
                mounted && theme === "system"
                  ? "border-primary bg-primary/10 text-primary shadow-sm ring-1 ring-primary"
                  : "border-border/70 bg-background/50 text-muted-foreground hover:text-foreground hover:bg-background/80"
              }`}
            >
              <Laptop className="h-5 w-5" />
              <span>{t.settings.themeSystem}</span>
            </button>
          </div>
        </div>

        {/* 2. Color Theme Palette Selection */}
        <div className="space-y-3 pt-4 border-t border-border/50">
          <div className="flex items-center justify-between">
            <Label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
              {t.settings.accentColors}
            </Label>
            <span className="text-xs font-medium text-muted-foreground">
              Selected: <span className="font-semibold text-primary">{presets.find(p => p.id === colorTheme)?.name || colorTheme}</span>
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3.5">
            {presets.map((preset) => {
              const isSelected = mounted && colorTheme === preset.id;
              return (
                <button
                  key={preset.id}
                  type="button"
                  onClick={() => {
                    setColorTheme(preset.id);
                    toast.success(`${t.settings.themeAppliedToast} ${preset.name}`);
                  }}
                  className={`group relative flex flex-col text-left p-3.5 rounded-xl border transition-all duration-200 ${
                    isSelected
                      ? "border-primary bg-primary/[0.07] shadow-sm ring-2 ring-primary/60"
                      : "border-border/70 bg-background/40 hover:bg-background/80 hover:border-border hover:shadow-xs"
                  }`}
                >
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2.5">
                      <span
                        className="h-4 w-4 rounded-full shadow-xs border border-white/20 shrink-0"
                        style={{ backgroundColor: preset.swatch }}
                      />
                      <span className="font-bold text-sm text-foreground">
                        {preset.name}
                      </span>
                    </div>

                    {isSelected ? (
                      <CheckCircle2 className="h-4 w-4 text-primary shrink-0" />
                    ) : (
                      <span className="h-4 w-4 rounded-full border border-border/60 opacity-0 group-hover:opacity-40 transition-opacity" />
                    )}
                  </div>

                  <p className="text-[11px] text-muted-foreground leading-relaxed line-clamp-2">
                    {preset.description}
                  </p>

                  <div className="mt-2.5 pt-2 border-t border-border/40 flex items-center justify-between">
                    <div className="h-1.5 w-20 rounded-full overflow-hidden bg-muted/60">
                      <div
                        className="h-full w-full rounded-full"
                        style={{ backgroundColor: preset.swatch }}
                      />
                    </div>
                    <span className="text-[10px] font-mono text-muted-foreground uppercase">
                      {preset.swatch}
                    </span>
                  </div>
                </button>
              );
            })}
          </div>
        </div>
      </section>

      {/* Categories Section */}
      <section className="rounded-2xl border border-border/80 bg-card/60 backdrop-blur-md p-6 shadow-xs space-y-6">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-xl bg-primary/10 border border-primary/20 flex items-center justify-center text-primary">
              <Palette className="h-5 w-5" />
            </div>
            <div>
              <h2 className="text-base font-semibold tracking-tight">{t.settings.categoriesSection}</h2>
              <p className="text-xs text-muted-foreground">
                {t.settings.categoriesDesc}
              </p>
            </div>
          </div>
          <Button
            size="sm"
            onClick={() => openCategoryModal()}
            className="rounded-xl h-9 px-4 text-xs font-medium shadow-sm hover:shadow-md transition-all active:scale-[0.98]"
          >
            <Plus className="h-4 w-4 mr-1.5" />
            {t.settings.newCategory}
          </Button>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
          {categories.map((cat) => (
            <div
              key={cat.id}
              className="group flex items-center justify-between rounded-xl border border-border/70 bg-background/40 hover:bg-background/80 p-3.5 transition-all duration-200 hover:shadow-sm"
              style={{ borderLeft: `4px solid ${cat.color}` }}
            >
              <div className="flex items-center gap-2.5 min-w-0">
                <span
                  className="h-3 w-3 rounded-full shadow-xs shrink-0"
                  style={{ backgroundColor: cat.color }}
                />
                <span className="font-semibold text-sm truncate">{cat.name}</span>
              </div>
              <div className="flex items-center gap-1 opacity-80 group-hover:opacity-100 transition-opacity">
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-7 w-7 rounded-lg text-muted-foreground hover:text-foreground"
                  onClick={() => openCategoryModal(cat)}
                >
                  <Edit2 className="h-3.5 w-3.5" />
                </Button>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-7 w-7 rounded-lg text-muted-foreground hover:text-destructive hover:bg-destructive/10"
                  onClick={() => setCategoryToDelete(cat)}
                >
                  <Trash2 className="h-3.5 w-3.5" />
                </Button>
              </div>
            </div>
          ))}

          {categories.length === 0 && (
            <div className="col-span-full py-8 text-center border border-dashed border-border/60 rounded-xl">
              <Sparkles className="h-6 w-6 text-primary mx-auto mb-2 opacity-80" />
              <p className="text-xs font-semibold text-foreground">No categories created yet</p>
              <p className="text-[11px] text-muted-foreground mt-0.5">Click &quot;{t.settings.newCategory}&quot; to customize your workspace.</p>
            </div>
          )}
        </div>
      </section>

      {/* Change Password Section */}
      <section className="rounded-2xl border border-border/80 bg-card/60 backdrop-blur-md p-6 shadow-xs space-y-6">
        <div className="flex items-center gap-3">
          <div className="h-10 w-10 rounded-xl bg-primary/10 border border-primary/20 flex items-center justify-center text-primary">
            <Lock className="h-5 w-5" />
          </div>
          <div>
            <h2 className="text-base font-semibold tracking-tight">{t.settings.passwordSection}</h2>
            <p className="text-xs text-muted-foreground">{t.settings.passwordDesc}</p>
          </div>
        </div>

        <form
          onSubmit={handlePasswordSubmit(onPasswordSubmit)}
          className="space-y-4 max-w-lg"
        >
          <div className="space-y-1.5">
            <Label htmlFor="currentPassword" className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
              {t.settings.currentPassword}
            </Label>
            <Input
              id="currentPassword"
              type="password"
              className="h-10 rounded-xl bg-background/50 border-border/80 text-sm"
              {...registerPassword("currentPassword")}
            />
            {passwordErrors.currentPassword && (
              <p className="text-xs text-destructive">
                {passwordErrors.currentPassword.message}
              </p>
            )}
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="newPassword" className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
              {t.settings.newPassword}
            </Label>
            <Input
              id="newPassword"
              type="password"
              className="h-10 rounded-xl bg-background/50 border-border/80 text-sm"
              {...registerPassword("newPassword")}
            />
            {passwordErrors.newPassword && (
              <p className="text-xs text-destructive">
                {passwordErrors.newPassword.message}
              </p>
            )}
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="confirmNewPassword" className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
              {t.settings.confirmNewPassword}
            </Label>
            <Input
              id="confirmNewPassword"
              type="password"
              className="h-10 rounded-xl bg-background/50 border-border/80 text-sm"
              {...registerPassword("confirmNewPassword")}
            />
            {passwordErrors.confirmNewPassword && (
              <p className="text-xs text-destructive">
                {passwordErrors.confirmNewPassword.message}
              </p>
            )}
          </div>

          <Button
            type="submit"
            disabled={isPasswordSubmitting}
            className="rounded-xl h-9 px-5 text-xs font-medium shadow-sm hover:shadow-md transition-all active:scale-[0.98]"
          >
            {isPasswordSubmitting ? t.common.saving : t.settings.updatePassword}
          </Button>
        </form>
      </section>

      {/* Category Edit/Create Dialog */}
      <Dialog
        open={categoryModalOpen}
        onOpenChange={(open) => !open && setCategoryModalOpen(false)}
      >
        <DialogContent className="max-w-md rounded-2xl border-border/80 bg-card/95 backdrop-blur-xl p-6 shadow-2xl">
          <DialogHeader className="space-y-1">
            <DialogTitle className="text-lg font-bold tracking-tight">
              {editingCategory ? t.common.edit : t.settings.newCategory}
            </DialogTitle>
            <DialogDescription className="text-xs text-muted-foreground">
              {t.settings.categoriesDesc}
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-2">
            <div className="space-y-1.5">
              <Label htmlFor="catName" className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                {t.settings.categoryNamePlaceholder}
              </Label>
              <Input
                id="catName"
                placeholder="e.g. Work, Personal, Fitness"
                value={categoryName}
                onChange={(e) => setCategoryName(e.target.value)}
                className="h-10 rounded-xl bg-background/50 border-border/80 text-sm"
              />
            </div>

            <div className="space-y-1.5">
              <Label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                {t.settings.accentColors}
              </Label>
              <div className="flex items-center gap-2.5 flex-wrap pt-1">
                {PRESET_COLORS.map((c) => (
                  <button
                    key={c}
                    type="button"
                    onClick={() => setCategoryColor(c)}
                    className={`h-8 w-8 rounded-xl transition-all duration-200 flex items-center justify-center shadow-xs ${
                      categoryColor === c
                        ? "scale-110 ring-2 ring-primary ring-offset-2 ring-offset-background"
                        : "hover:scale-105 opacity-80 hover:opacity-100"
                    }`}
                    style={{ backgroundColor: c }}
                  >
                    {categoryColor === c && <Check className="h-4 w-4 text-white drop-shadow-sm" />}
                  </button>
                ))}
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-4 border-t border-border/60">
              <Button
                variant="outline"
                onClick={() => setCategoryModalOpen(false)}
                className="rounded-xl h-9 text-xs font-medium border-border/80"
              >
                {t.common.cancel}
              </Button>
              <Button
                onClick={handleSaveCategory}
                disabled={!categoryName.trim() || createCategory.isPending || updateCategory.isPending}
                className="rounded-xl h-9 px-5 text-xs font-medium shadow-sm hover:shadow-md transition-all active:scale-[0.98]"
              >
                {editingCategory ? t.common.save : t.settings.addCategory}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Category Delete Confirmation Dialog */}
      <Dialog
        open={!!categoryToDelete}
        onOpenChange={(open) => !open && setCategoryToDelete(null)}
      >
        <DialogContent className="max-w-md rounded-2xl border-border/80 bg-card/95 backdrop-blur-xl p-6 shadow-2xl">
          <DialogHeader className="space-y-3">
            <div className="mx-auto h-12 w-12 rounded-2xl bg-destructive/10 border border-destructive/20 flex items-center justify-center text-destructive shadow-xs">
              <AlertTriangle className="h-6 w-6" />
            </div>
            <div className="text-center space-y-1">
              <DialogTitle className="text-lg font-bold tracking-tight">
                {t.settings.deleteCategoryTitle}
              </DialogTitle>
              <DialogDescription className="text-xs text-muted-foreground leading-relaxed">
                {t.settings.deleteCategoryDesc}
              </DialogDescription>
            </div>
          </DialogHeader>

          {categoryToDelete && (
            <div className="py-2">
              <div
                className="flex items-center justify-center gap-2.5 px-4 py-3 rounded-xl border border-border/60 bg-muted/30"
                style={{ borderLeft: `4px solid ${categoryToDelete.color}` }}
              >
                <span
                  className="h-3.5 w-3.5 rounded-full shadow-xs shrink-0"
                  style={{ backgroundColor: categoryToDelete.color }}
                />
                <span className="font-semibold text-sm text-foreground truncate">
                  {categoryToDelete.name}
                </span>
              </div>
            </div>
          )}

          <div className="flex items-center justify-end gap-2.5 pt-2 border-t border-border/60">
            <Button
              variant="outline"
              onClick={() => setCategoryToDelete(null)}
              disabled={deleteCategory.isPending}
              className="rounded-xl h-9 text-xs font-medium border-border/80"
            >
              {t.common.cancel}
            </Button>
            <Button
              variant="destructive"
              disabled={deleteCategory.isPending}
              onClick={() => {
                if (categoryToDelete) {
                  deleteCategory.mutate(categoryToDelete.id, {
                    onSuccess: () => setCategoryToDelete(null),
                  });
                }
              }}
              className="rounded-xl h-9 px-4 text-xs font-medium shadow-sm hover:shadow-md transition-all active:scale-[0.98]"
            >
              <Trash2 className="h-3.5 w-3.5 mr-1.5" />
              {deleteCategory.isPending
                ? t.settings.deletingCategory
                : t.settings.deleteCategoryAction}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </motion.div>
  );
}
