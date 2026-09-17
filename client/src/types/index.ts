// ---------- Auth / User ----------

export interface User {
  id: string;
  name: string;
  email: string;
  createdAt: string;
}

export interface AuthResponse {
  user: User;
  token: string;
}

// ---------- Business ----------

export type BusinessCategory =
  | "Retail Store"
  | "Restaurant / Café"
  | "Freelancer / Service"
  | "E-commerce"
  | "Education / Coaching"
  | "Healthcare / Wellness"
  | "Local Shop"
  | "Other";

export interface BusinessProfile {
  id: string;
  userId: string;
  name: string;
  category: BusinessCategory;
  location: string;
  description: string;
  productsOrServices: string;
  targetCustomers: string;
  monthlyBudget: number;
  goal: string;
  monthlyRevenue?: number;
  customerCount?: number;
  averageOrderValue?: number;
  websiteUrl?: string;
  socialMediaPresence?: string;
  employeeCount?: number;
  createdAt: string;
  updatedAt: string;
}

// ---------- Diagnosis ----------

export type Severity = "Low" | "Medium" | "High" | "Critical";
export type DiagnosisStatus = "draft" | "diagnosed" | "in_progress" | "completed";
export type Priority = "Low" | "Medium" | "High";

export interface PossibleCause {
  cause: string;
  reason: string;
  evidenceNeeded: string;
}

export interface Recommendation {
  title: string;
  description: string;
  whyItFits: string;
  estimatedCost: number;
  priority: Priority;
}

export interface FollowUpQuestion {
  question: string;
  reason: string;
  answer?: string;
}

export interface ActionPlanTask {
  id: string;
  day: number;
  title: string;
  description: string;
  priority: Priority;
  estimatedCost: number;
  expectedOutput: string;
  completed: boolean;
  completedAt?: string | null;
  notes?: string;
}

export type Confidence = "Low" | "Medium" | "High";

export interface Diagnosis {
  id: string;
  businessId: string;
  businessName: string;
  problem: string;
  problemDuration: string;
  severity: Severity;
  recentChanges: string;
  previousAttempts: string;
  desiredOutcome?: string;
  additionalContext?: string;
  currentMetrics?: string;
  answers: Record<string, string>;
  summary: string;
  confidence: Confidence;
  possibleCauses: PossibleCause[];
  recommendations: Recommendation[];
  followUpQuestions: FollowUpQuestion[];
  dataLimitations: string[];
  assumptions: string[];
  risks: string[];
  actionPlan: ActionPlanTask[];
  status: DiagnosisStatus;
  createdAt: string;
  updatedAt: string;
}

export interface DiagnosisHistoryItem {
  id: string;
  businessName: string;
  problem: string;
  createdAt: string;
  status: DiagnosisStatus;
  progressPercent: number;
}

// ---------- Dashboard ----------

export interface DashboardStats {
  totalBusinesses: number;
  totalDiagnoses: number;
  activeActionPlans: number;
  completedTasks: number;
  averageProgressPercent: number;
  recentDiagnoses: DiagnosisHistoryItem[];
}

// ---------- API ----------

export interface ApiErrorResponse {
  message: string;
  code: string;
  details: string[];
}
