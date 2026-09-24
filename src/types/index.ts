// ========== User ==========
export interface User {
  id: string;
  email: string;
  displayName: string;
  avatarUrl: string | null;
  timezone: string;
  createdAt: string;
  updatedAt: string;
}

// ========== Auth ==========
export interface AuthResponse {
  user: User;
  accessToken: string;
  refreshToken: string;
}

export interface LoginCredentials {
  email: string;
  password: string;
}

export interface RegisterCredentials {
  email: string;
  password: string;
  displayName: string;
  timezone?: string;
}

// ========== Task ==========
export type TaskStatus = "todo" | "in_progress" | "done";
export type TaskPriority = "low" | "medium" | "high";

export interface Task {
  id: string;
  userId: string;
  categoryId: string | null;
  title: string;
  description: string | null;
  status: TaskStatus;
  priority: TaskPriority;
  startTime: string;
  endTime: string | null;
  isAllDay: boolean;
  order: number;
  originalDate?: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface CreateTaskInput {
  title: string;
  description?: string;
  status?: TaskStatus;
  priority?: TaskPriority;
  startTime: string;
  endTime?: string;
  isAllDay?: boolean;
  categoryId?: string;
  order?: number;
  originalDate?: string;
}

export type UpdateTaskInput = Partial<CreateTaskInput>;

export interface ReorderTaskItemInput {
  id: string;
  order: number;
  startTime?: string;
  endTime?: string;
}

export interface ReorderTasksInput {
  items: ReorderTaskItemInput[];
}

// ========== Category ==========
export interface Category {
  id: string;
  userId: string;
  name: string;
  color: string;
  createdAt: string;
}

export interface CreateCategoryInput {
  name: string;
  color?: string;
}

export type UpdateCategoryInput = Partial<CreateCategoryInput>;

// ========== API Response ==========
export interface ApiResponse<T> {
  success: boolean;
  statusCode: number;
  data: T;
  timestamp: string;
}

// ========== Note ==========
export interface Note {
  id: string;
  userId: string;
  title: string;
  content: string;
  color: string;
  isPinned: boolean;
  tags: string[];
  createdAt: string;
  updatedAt: string;
  expiresAt: string;
}

export interface CreateNoteInput {
  title: string;
  content?: string;
  color?: string;
  isPinned?: boolean;
  tags?: string[];
}

export type UpdateNoteInput = Partial<CreateNoteInput>;

export interface ConvertNoteToTaskInput {
  startTime: string;
  endTime?: string;
  isAllDay?: boolean;
  categoryId?: string;
  priority?: TaskPriority;
  deleteNoteAfter?: boolean;
}

export type NoteSortBy = "createdAt" | "expiresAt";

// ========== Calendar ==========
export type CalendarView = "day" | "week" | "month";

// ========== Dashboard & Statistics ==========
export interface TaskStatsSummary {
  total: number;
  completed: number;
  pending: number;
  todo: number;
  inProgress: number;
  completionRate: number;
}

export interface ActivityStats {
  activityMap: Record<string, number>;
  currentStreak: number;
  longestStreak: number;
  totalCompletedThisWeek: number;
  totalCompletedThisMonth: number;
  totalCompletedYear: number;
}

export interface PriorityItemStats {
  total: number;
  completed: number;
}

export interface PriorityBreakdown {
  high: PriorityItemStats;
  medium: PriorityItemStats;
  low: PriorityItemStats;
}

export interface CategoryItemStats {
  id: string;
  name: string;
  color: string;
  total: number;
  completed: number;
}

export interface DashboardStatsResponse {
  summary: TaskStatsSummary;
  activity: ActivityStats;
  priorityBreakdown: PriorityBreakdown;
  categoryBreakdown: CategoryItemStats[];
}

