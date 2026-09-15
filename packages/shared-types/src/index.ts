export type UserRole = 'SUPER_ADMIN' | 'ADMIN' | 'STUDENT';

export interface User {
  id: string;
  email: string;
  fullName: string;
  role: UserRole;
  createdAt: string;
}

export type TaskStatus = 'NOT_STARTED' | 'IN_PROGRESS' | 'COMPLETED' | 'OVERDUE' | 'CANCELLED';
export type TaskPriority = 'LOW' | 'MEDIUM' | 'HIGH' | 'URGENT';
export type TaskReminderType = 'ABSOLUTE_UTC' | 'LOCAL_TIME';

export interface Task {
  id: string;
  title: string;
  description: string;
  priority: TaskPriority;
  createdById: string;
  createdBy?: User;
  dueAt: string; // UTC ISO string
  estimatedDurationMinutes: number;
  reminderTimeUtc?: string;
  reminderType: TaskReminderType;
  instructions?: string;
  status: TaskStatus;
  createdAt: string;
  updatedAt: string;
}

export interface TaskAssignment {
  id: string;
  taskId: string;
  userId: string;
  task?: Task;
  user?: User;
  status: TaskStatus;
  assignedAt: string;
  startedAt?: string;
  completedAt?: string;
}

export type TaskEventType =
  | 'TASK_CREATED'
  | 'TASK_ASSIGNED'
  | 'TASK_VIEWED'
  | 'TASK_STARTED'
  | 'TASK_PAUSED'
  | 'TASK_RESUMED'
  | 'TASK_COMPLETED'
  | 'TASK_REOPENED'
  | 'TASK_OVERDUE'
  | 'REMINDER_SENT'
  | 'REMINDER_OPENED';

export interface TaskEvent {
  id: string;
  taskId: string;
  userId: string;
  eventType: TaskEventType;
  source: string;
  metadata?: Record<string, any>;
  createdAt: string;
}

export type QuestionType = 'MCQ' | 'MULTIPLE_SELECT' | 'CODING';
export type QuestionDifficulty = 'EASY' | 'MEDIUM' | 'HARD';

export interface QuestionHint {
  id: string;
  penaltyMarks: number;
  revealOrder: number;
  content: string;
}

export interface TestCase {
  id: string;
  input: string;
  expectedOutput: string;
  isPublic: boolean;
}

export interface Question {
  id: string;
  title: string;
  body: string;
  questionType: QuestionType;
  topic: string;
  difficulty: QuestionDifficulty;
  marks: number;
  negativeMarks: number;
  timeAllocationSeconds: number;
  isTimeHardLimit: boolean;
  hints: QuestionHint[];
  explanation?: string;
  // Coding specific
  allowedLanguages?: string[];
  starterCode?: Record<string, string>;
  constraints?: string;
  examples?: Array<{ input: string; output: string; explanation?: string }>;
  testCases?: TestCase[];
  cpuLimitMs?: number;
  memoryLimitMb?: number;
}

export type ProctoringLevel = 'OFF' | 'BASIC' | 'STRICT' | 'LOCKDOWN';

export interface ProctoringConfig {
  level: ProctoringLevel;
  cameraRequired: boolean;
  microphoneRequired: boolean;
  fullscreenRequired: boolean;
  tabSwitchDetection: boolean;
  copyPasteDetection: boolean;
  devToolsDetectionSignal: boolean;
  maxTabSwitchesAllowed: number;
  cameraDisconnectGraceSeconds: number;
}

export interface Contest {
  id: string;
  title: string;
  description: string;
  durationMinutes: number;
  startWindowMinutes: number;
  availabilityStart: string; // UTC
  availabilityEnd: string; // UTC
  passingScore: number;
  leaderboardVisible: boolean;
  randomizeQuestions: boolean;
  proctoringConfig: ProctoringConfig;
  questions: Question[];
  createdAt: string;
}

export type ExamAttemptStatus =
  | 'CREATED'
  | 'VERIFICATION'
  | 'READY'
  | 'IN_PROGRESS'
  | 'PAUSED_REVIEW'
  | 'SUBMITTED'
  | 'AUTO_SUBMITTED'
  | 'EXPIRED'
  | 'DISQUALIFIED'
  | 'ABANDONED';

export interface ContestInvitation {
  id: string;
  contestId: string;
  userId: string;
  invitationToken: string;
  expiresAt: string; // 5 min start window
  isUsed: boolean;
}

export interface ExamAttempt {
  id: string;
  contestId: string;
  userId: string;
  invitationId: string;
  status: ExamAttemptStatus;
  startedAt?: string;
  expiresAt?: string;
  score: number;
  autoSubmitted: boolean;
  submittedAt?: string;
  user?: User;
  contest?: Contest;
}

export type ProctoringEventType =
  | 'CAMERA_STARTED'
  | 'CAMERA_STOPPED'
  | 'CAMERA_PERMISSION_DENIED'
  | 'CAMERA_DISCONNECTED'
  | 'CAMERA_RECONNECTED'
  | 'TAB_SWITCH'
  | 'WINDOW_BLUR'
  | 'WINDOW_FOCUS'
  | 'FULLSCREEN_EXIT'
  | 'PAGE_HIDDEN'
  | 'PAGE_VISIBLE'
  | 'COPY_ATTEMPT'
  | 'PASTE_ATTEMPT'
  | 'DEVTOOLS_SUSPECTED'
  | 'NETWORK_DISCONNECTED'
  | 'NETWORK_RECONNECTED'
  | 'HINT_REQUESTED'
  | 'HINT_REVEALED';

export type EventSeverity = 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';

export interface ProctoringEvent {
  id: string;
  attemptId: string;
  eventType: ProctoringEventType;
  severity: EventSeverity;
  metadata?: Record<string, any>;
  timestamp: string;
}

export type RiskLevel = 'NORMAL' | 'REVIEW' | 'SUSPICIOUS' | 'HIGH_RISK';

export interface CodeExecutionRequest {
  language: string;
  sourceCode: string;
  input: string;
  expectedOutput?: string;
  timeLimitMs?: number;
  memoryLimitMb?: number;
}

export interface CodeExecutionResult {
  stdout: string;
  stderr: string;
  error?: string;
  passed: boolean;
  executionTimeMs: number;
  memoryBytes: number;
}

export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  error?: {
    code: string;
    message: string;
    details?: any;
  };
  meta?: Record<string, any>;
}
