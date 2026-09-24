export type ColorThemeId =
  | "indigo"
  | "emerald"
  | "blue"
  | "rose"
  | "violet"
  | "amber"
  | "teal"
  | "orange"
  | "cyan";

export interface ColorThemePreset {
  id: ColorThemeId;
  name: string;
  nameVi: string;
  swatch: string;
  gradient: string;
  description: string;
}

export const COLOR_THEME_KEY = "daytask-color-theme";
export const DEFAULT_COLOR_THEME: ColorThemeId = "indigo";

export const COLOR_THEME_PRESETS: ColorThemePreset[] = [
  {
    id: "indigo",
    name: "Indigo",
    nameVi: "Xanh chàm (Mặc định)",
    swatch: "#6366f1",
    gradient: "from-indigo-500 to-indigo-600",
    description: "Tông xanh chàm nguyên bản thanh lịch, công thái học.",
  },
  {
    id: "emerald",
    name: "Emerald",
    nameVi: "Xanh ngọc lục bảo",
    swatch: "#10b981",
    gradient: "from-emerald-500 to-teal-600",
    description: "Tươi mát, tạo cảm giác tập trung và năng động.",
  },
  {
    id: "blue",
    name: "Ocean Blue",
    nameVi: "Xanh dương đại dương",
    swatch: "#3b82f6",
    gradient: "from-blue-500 to-sky-600",
    description: "Sâu lắng, tin cậy và chuyên nghiệp cho công việc.",
  },
  {
    id: "rose",
    name: "Rose",
    nameVi: "Hồng Ruby",
    swatch: "#f43f5e",
    gradient: "from-rose-500 to-pink-600",
    description: "Nổi bật, ấm áp và giàu cảm hứng sáng tạo.",
  },
  {
    id: "violet",
    name: "Violet",
    nameVi: "Tím Thạch anh",
    swatch: "#8b5cf6",
    gradient: "from-purple-500 to-violet-600",
    description: "Huyền bí, sang trọng và độc đáo cho không gian làm việc.",
  },
  {
    id: "amber",
    name: "Amber",
    nameVi: "Vàng Hổ phách",
    swatch: "#f59e0b",
    gradient: "from-amber-500 to-yellow-600",
    description: "Ấm áp, tràn đầy năng lượng tích cực.",
  },
  {
    id: "teal",
    name: "Teal",
    nameVi: "Xanh Mòng két",
    swatch: "#14b8a6",
    gradient: "from-teal-500 to-emerald-600",
    description: "Cân bằng, dễ chịu và thư giãn thị giác.",
  },
  {
    id: "orange",
    name: "Sunset Orange",
    nameVi: "Cam Hoàng hôn",
    swatch: "#f97316",
    gradient: "from-orange-500 to-amber-600",
    description: "Nhiệt huyết, bắt mắt và thúc đẩy hoàn thành mục tiêu.",
  },
  {
    id: "cyan",
    name: "Cyan",
    nameVi: "Xanh Lam ngọc",
    swatch: "#06b6d4",
    gradient: "from-cyan-500 to-blue-500",
    description: "Sắc sảo, phong cách công nghệ tương lai.",
  },
];

export function applyColorTheme(themeId: ColorThemeId) {
  if (typeof document === "undefined") return;
  const root = document.documentElement;
  if (themeId === "indigo") {
    root.removeAttribute("data-color-theme");
  } else {
    root.setAttribute("data-color-theme", themeId);
  }
}
