"use client";

import { useEffect, useState } from "react";
import { useRouter, usePathname } from "next/navigation";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import {
    Calendar,
    ChevronLeft,
    LayoutDashboard,
    LogOut,
    Menu,
    Settings,
    Plus,
    StickyNote,
} from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Separator } from "@/components/ui/separator";
import { ThemeToggle } from "@/components/theme-toggle";
import { LanguageToggle } from "@/components/language-toggle";
import { TaskNotifier } from "@/components/tasks/task-notifier";
import { api } from "@/lib/axios";
import { disconnectSocket } from "@/lib/socket";
import { useAuthStore } from "@/stores/auth-store";
import { useUiStore } from "@/stores/ui-store";
import { useCategories } from "@/hooks/use-categories";
import { useNotes } from "@/hooks/use-notes";
import { useLanguage } from "@/hooks/use-language";
import type { ApiResponse, User as UserType } from "@/types";

export default function DashboardLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    const router = useRouter();
    const pathname = usePathname();
    const user = useAuthStore((s) => s.user);
    const setUser = useAuthStore((s) => s.setUser);
    const clearAuth = useAuthStore((s) => s.clearAuth);
    const initialize = useAuthStore((s) => s.initialize);
    const sidebarOpen = useUiStore((s) => s.sidebarOpen);
    const toggleSidebar = useUiStore((s) => s.toggleSidebar);
    const openTaskDialog = useUiStore((s) => s.openTaskDialog);
    const setSidebarOpen = useUiStore((s) => s.setSidebarOpen);
    const { data: categories } = useCategories();
    const { notes } = useNotes();
    const { t } = useLanguage();
    const [mounted, setMounted] = useState(false);

    // Automatically close sidebar on mobile when navigating
    useEffect(() => {
        if (typeof window !== "undefined" && window.innerWidth < 768) {
            setSidebarOpen(false);
        }
    }, [pathname, setSidebarOpen]);

    useEffect(() => {
        setMounted(true);
        initialize();
    }, [initialize]);

    // Fetch user profile on mount
    useEffect(() => {
        const fetchMe = async () => {
            try {
                const token = localStorage.getItem("accessToken");
                if (!token) {
                    router.replace("/login");
                    return;
                }
                const { data } =
                    await api.get<ApiResponse<UserType>>("/auth/me");
                setUser(data.data);
            } catch {
                clearAuth();
                router.replace("/login");
            }
        };
        fetchMe();
    }, [setUser, clearAuth, router]);

    const handleLogout = async () => {
        try {
            await api.post("/auth/logout");
        } catch {
            // ignore
        }
        disconnectSocket();
        clearAuth();
        toast.success("Logged out successfully");
        router.replace("/login");
    };

    if (!mounted || !user) {
        return (
            <div className="flex min-h-[100dvh] items-center justify-center bg-background">
                <div className="flex flex-col items-center gap-3">
                    <div className="h-10 w-10 animate-spin rounded-full border-4 border-primary border-t-transparent" />
                    <p className="text-xs text-muted-foreground font-mono">
                        {t.common.loading}
                    </p>
                </div>
            </div>
        );
    }

    const initials = user.displayName
        ? user.displayName
              .split(" ")
              .map((n) => n[0])
              .join("")
              .toUpperCase()
              .slice(0, 2)
        : "U";

    return (
        <div className="flex h-[100dvh] overflow-hidden bg-background text-foreground relative">
            {/* Mobile Drawer Backdrop Overlay */}
            <AnimatePresence>
                {sidebarOpen && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        transition={{ duration: 0.2 }}
                        onClick={toggleSidebar}
                        className="fixed inset-0 z-40 bg-background/80 backdrop-blur-xs md:hidden"
                        aria-hidden="true"
                    />
                )}
            </AnimatePresence>

            {/* Collapsible Animated Sidebar (Drawer on mobile, Inline on desktop) */}
            <AnimatePresence mode="wait">
                {sidebarOpen && (
                    <motion.aside
                        initial={{ width: 0, opacity: 0 }}
                        animate={{ width: 280, opacity: 1 }}
                        exit={{ width: 0, opacity: 0 }}
                        transition={{ duration: 0.25, ease: [0.16, 1, 0.3, 1] }}
                        className="fixed inset-y-0 left-0 z-50 md:relative md:z-20 flex h-full flex-col border-r border-border/70 bg-card/95 md:bg-card/60 backdrop-blur-xl overflow-hidden shrink-0 shadow-2xl md:shadow-none"
                    >
                        {/* Brand Title */}
                        <div className="flex h-16 items-center justify-between px-5 shrink-0">
                            <Link
                                href="/calendar"
                                className="flex items-center gap-2.5 group"
                            >
                                <div className="h-9 w-9 rounded-xl bg-primary/10 border border-primary/20 flex items-center justify-center text-primary group-hover:scale-105 transition-transform">
                                    <Calendar className="h-5 w-5" />
                                </div>
                                <div className="flex flex-col">
                                    <span className="text-base font-bold tracking-tight bg-gradient-to-r from-primary-600 via-primary-500 to-indigo-400 bg-clip-text text-transparent">
                                        DayTask
                                    </span>
                                    <span className="text-[10px] text-muted-foreground -mt-1 font-mono">
                                        Workspace
                                    </span>
                                </div>
                            </Link>
                            <Button
                                variant="ghost"
                                size="icon"
                                onClick={toggleSidebar}
                                className="h-8 w-8 rounded-lg text-muted-foreground hover:text-foreground"
                                title="Close sidebar"
                            >
                                <ChevronLeft className="h-4 w-4" />
                            </Button>
                        </div>

                        <Separator className="opacity-60" />

                        {/* Quick Action Button */}
                        <div className="p-3 shrink-0">
                            <Button
                                onClick={() => {
                                    if (
                                        typeof window !== "undefined" &&
                                        window.innerWidth < 768
                                    ) {
                                        setSidebarOpen(false);
                                    }
                                    openTaskDialog();
                                }}
                                className="w-full h-10 rounded-xl justify-center gap-2 shadow-sm font-medium"
                            >
                                <Plus className="h-4 w-4" />
                                {t.nav.newTask}
                            </Button>
                        </div>

                        {/* Navigation links */}
                        <nav className="flex-1 px-3 py-2 space-y-1.5 overflow-y-auto">
                            <Link
                                href="/dashboard"
                                className={`flex items-center gap-3 rounded-xl px-3.5 py-2.5 text-sm font-medium transition-all ${
                                    pathname === "/dashboard"
                                        ? "bg-primary/10 text-primary shadow-xs"
                                        : "text-muted-foreground hover:bg-accent/60 hover:text-foreground"
                                }`}
                            >
                                <LayoutDashboard className="h-4 w-4" />
                                <span>{t.nav.dashboard}</span>
                            </Link>

                            <Link
                                href="/calendar"
                                className={`flex items-center gap-3 rounded-xl px-3.5 py-2.5 text-sm font-medium transition-all ${
                                    pathname === "/calendar"
                                        ? "bg-primary/10 text-primary shadow-xs"
                                        : "text-muted-foreground hover:bg-accent/60 hover:text-foreground"
                                }`}
                            >
                                <Calendar className="h-4 w-4" />
                                <span>{t.nav.calendar}</span>
                            </Link>

                            <Link
                                href="/notes"
                                className={`flex items-center justify-between rounded-xl px-3.5 py-2.5 text-sm font-medium transition-all ${
                                    pathname === "/notes"
                                        ? "bg-primary/10 text-primary shadow-xs"
                                        : "text-muted-foreground hover:bg-accent/60 hover:text-foreground"
                                }`}
                            >
                                <div className="flex items-center gap-3">
                                    <StickyNote className="h-4 w-4" />
                                    <span>{t.nav.notes}</span>
                                </div>
                                {notes && notes.length > 0 && (
                                    <span className="text-[11px] font-mono px-1.5 py-0.5 rounded-md bg-primary/20 text-primary font-semibold">
                                        {notes.length}
                                    </span>
                                )}
                            </Link>

                            {/* Categories list */}
                            {categories && categories.length > 0 && (
                                <div className="pt-5">
                                    <div className="flex items-center justify-between px-3.5 mb-2">
                                        <span className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground/80">
                                            {t.nav.categories}
                                        </span>
                                        <span className="text-[10px] font-mono text-muted-foreground/60">
                                            {categories.length}
                                        </span>
                                    </div>

                                    <div className="space-y-1">
                                        {categories.map((cat) => (
                                            <div
                                                key={cat.id}
                                                className="flex items-center gap-2.5 rounded-lg px-3.5 py-1.5 text-xs text-muted-foreground hover:text-foreground hover:bg-accent/40 transition-colors"
                                            >
                                                <span
                                                    className="h-2.5 w-2.5 rounded-full shrink-0 shadow-xs"
                                                    style={{
                                                        backgroundColor:
                                                            cat.color,
                                                    }}
                                                />
                                                <span className="truncate">
                                                    {cat.name}
                                                </span>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}
                        </nav>

                        {/* User Profile Card & Settings at bottom */}
                        <div className="border-t border-border/70 p-3 space-y-1 bg-muted/20 shrink-0">
                            <div className="flex items-center gap-3 px-2 py-2 rounded-xl bg-card border border-border/60">
                                <Avatar className="h-9 w-9 ring-1 ring-border">
                                    <AvatarImage
                                        src={user.avatarUrl || undefined}
                                    />
                                    <AvatarFallback className="text-xs bg-primary/10 text-primary font-semibold">
                                        {initials}
                                    </AvatarFallback>
                                </Avatar>
                                <div className="flex-1 min-w-0">
                                    <p className="text-xs font-semibold truncate leading-tight">
                                        {user.displayName}
                                    </p>
                                    <p className="text-[11px] text-muted-foreground truncate font-mono">
                                        {user.email}
                                    </p>
                                </div>
                            </div>

                            <div className="grid grid-cols-2 gap-1 pt-1">
                                <Link
                                    href="/settings"
                                    className={`flex items-center justify-center gap-1.5 rounded-lg py-1.5 text-xs transition-colors ${
                                        pathname === "/settings"
                                            ? "bg-primary/10 text-primary font-medium"
                                            : "text-muted-foreground hover:bg-accent hover:text-foreground"
                                    }`}
                                >
                                    <Settings className="h-3.5 w-3.5" />
                                    {t.nav.settings}
                                </Link>

                                <button
                                    onClick={handleLogout}
                                    className="flex items-center justify-center gap-1.5 rounded-lg py-1.5 text-xs text-muted-foreground hover:bg-destructive/10 hover:text-destructive transition-colors"
                                >
                                    <LogOut className="h-3.5 w-3.5" />
                                    {t.nav.logout}
                                </button>
                            </div>
                        </div>
                    </motion.aside>
                )}
            </AnimatePresence>

            {/* Main Content Area */}
            <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
                {/* Top Floating App Bar */}
                <header className="h-14 sm:h-16 border-b border-border/60 px-3 sm:px-6 flex items-center justify-between bg-card/40 backdrop-blur-md shrink-0">
                    <div className="flex items-center gap-2 sm:gap-3">
                        <Button
                            variant="outline"
                            size="icon"
                            onClick={toggleSidebar}
                            className="h-8.5 w-8.5 sm:h-9 sm:w-9 rounded-xl border-border/70 hover:bg-accent"
                        >
                            <Menu className="h-4 w-4" />
                        </Button>

                        <div className="flex items-center gap-2">
                            <span className="text-xs sm:text-sm font-semibold tracking-tight">
                                {pathname === "/dashboard"
                                    ? t.nav.dashboard
                                    : pathname === "/calendar"
                                      ? t.nav.calendar
                                      : pathname === "/notes"
                                        ? t.notes.title
                                        : t.settings.title}
                            </span>
                        </div>
                    </div>

                    <div className="flex items-center gap-2">
                        <LanguageToggle />
                        <ThemeToggle className="h-8.5 w-8.5 sm:h-9 sm:w-9 rounded-xl text-muted-foreground hover:text-foreground" />
                    </div>
                </header>

                {/* Page Views Container */}
                <main className="flex-1 overflow-hidden flex flex-col bg-background/50">
                    <TaskNotifier />
                    {children}
                </main>
            </div>
        </div>
    );
}
