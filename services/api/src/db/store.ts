import {
  User,
  Task,
  TaskAssignment,
  TaskEvent,
  Question,
  Contest,
  ContestInvitation,
  ExamAttempt,
  ProctoringEvent
} from '@pragya/shared-types';

export class DatabaseStore {
  public users: Map<string, User> = new Map();
  public userDevices: Map<string, any> = new Map();
  public userAvailability: Map<string, any> = new Map();
  public tasks: Map<string, Task> = new Map();
  public taskAssignments: Map<string, TaskAssignment> = new Map();
  public taskEvents: TaskEvent[] = [];
  public questions: Map<string, Question> = new Map();
  public contests: Map<string, Contest> = new Map();
  public contestInvitations: Map<string, ContestInvitation> = new Map();
  public examAttempts: Map<string, ExamAttempt> = new Map();
  public examAnswers: Map<string, Record<string, any>> = new Map();
  public codeSubmissions: Map<string, Array<any>> = new Map();
  public proctoringEvents: Map<string, ProctoringEvent[]> = new Map();
  public auditLogs: Array<any> = [];
  public dailyThought: { thought: string; author: string; updatedAt: string } = {
    thought: "Consistency is the key to mastering code and achieving excellence every single day.",
    author: "Super Admin Utkarsh Tiwari",
    updatedAt: new Date().toISOString()
  };

  constructor() {
    this.seedInitialCredentialsOnly();
  }

  private seedInitialCredentialsOnly() {
    // Seed ONLY the 2 requested user accounts
    const superAdmin: User = {
      id: 'usr_admin_utkarsh',
      email: 'utkarsh@admin.com',
      fullName: 'Utkarsh Tiwari (Super Admin)',
      role: 'SUPER_ADMIN',
      createdAt: new Date().toISOString()
    };

    const student: User = {
      id: 'usr_student_pragya',
      email: 'pragyat841@gmail.com',
      fullName: 'Pragya Student',
      role: 'STUDENT',
      createdAt: new Date().toISOString()
    };

    this.users.set(superAdmin.id, superAdmin);
    this.users.set(student.id, student);

    // NO dummy tasks, NO dummy contests, NO mock live candidates!
  }
}

export const db = new DatabaseStore();
