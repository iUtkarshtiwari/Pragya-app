import { Router, Request, Response } from 'express';
import { db } from '../db/store';
import { RiskLevel } from '@pragya/shared-types';

const router = Router();

// 1. Admin Dashboard Analytics Metrics
router.get('/metrics', (req: Request, res: Response) => {
  const totalTasks = db.tasks.size;
  const assignments = Array.from(db.taskAssignments.values());

  const completedTasks = assignments.filter(a => a.status === 'COMPLETED').length;
  const pendingTasks = assignments.filter(a => a.status === 'NOT_STARTED').length;
  const inProgressTasks = assignments.filter(a => a.status === 'IN_PROGRESS').length;
  const overdueTasks = assignments.filter(a => a.status === 'OVERDUE').length;

  const totalExams = db.contests.size;
  const totalAttempts = db.examAttempts.size;
  const activeExams = Array.from(db.examAttempts.values()).filter(a => a.status === 'IN_PROGRESS').length;

  return res.json({
    success: true,
    data: {
      taskMetrics: {
        totalTasks,
        completedTasks,
        pendingTasks,
        inProgressTasks,
        overdueTasks,
        completionRatePercent: assignments.length ? Math.round((completedTasks / assignments.length) * 100) : 0
      },
      examMetrics: {
        totalExams,
        totalAttempts,
        activeExams
      }
    }
  });
});

// 2. Live Exam Monitoring for Candidates
router.get('/live-candidates', (req: Request, res: Response) => {
  const attempts = Array.from(db.examAttempts.values());

  const candidateOverviewList = attempts.map(att => {
    const candidate = db.users.get(att.userId);
    const contest = db.contests.get(att.contestId);
    const events = db.proctoringEvents.get(att.id) || [];
    const answers = db.examAnswers.get(att.id) || {};

    // Calculate Risk Level Heuristics
    const tabSwitches = events.filter(e => e.eventType === 'TAB_SWITCH' || e.eventType === 'FULLSCREEN_EXIT').length;
    const cameraDisconnects = events.filter(e => e.eventType === 'CAMERA_DISCONNECTED').length;
    const devtools = events.filter(e => e.eventType === 'DEVTOOLS_SUSPECTED').length;

    let riskLevel: RiskLevel = 'NORMAL';
    if (tabSwitches >= 1) riskLevel = 'REVIEW';
    if (tabSwitches >= 3 || devtools >= 1) riskLevel = 'SUSPICIOUS';
    if (cameraDisconnects >= 1 || tabSwitches >= 5) riskLevel = 'HIGH_RISK';

    return {
      attemptId: att.id,
      candidateName: candidate?.fullName || 'Unknown Candidate',
      candidateEmail: candidate?.email || '',
      contestTitle: contest?.title || '',
      status: att.status,
      startedAt: att.startedAt,
      expiresAt: att.expiresAt,
      questionsAnswered: Object.keys(answers).length,
      totalQuestions: contest?.questions.length || 0,
      score: att.score,
      proctoringEventsCount: events.length,
      tabSwitchCount: tabSwitches,
      cameraStatus: cameraDisconnects > 0 ? 'DISCONNECTED' : 'ACTIVE',
      riskLevel,
      lastEvent: events.length > 0 ? events[events.length - 1] : null
    };
  });

  return res.json({
    success: true,
    data: candidateOverviewList
  });
});

// 3. Candidate Proctoring Event Timeline
router.get('/attempts/:attemptId/timeline', (req: Request, res: Response) => {
  const attemptId = req.params.attemptId;
  const attempt = db.examAttempts.get(attemptId);
  const events = db.proctoringEvents.get(attemptId) || [];
  const candidate = attempt ? db.users.get(attempt.userId) : null;

  return res.json({
    success: true,
    data: {
      attempt,
      candidate,
      events
    }
  });
});

// 4. Leaderboard
router.get('/leaderboard/:contestId', (req: Request, res: Response) => {
  const contestId = req.params.contestId;
  const attempts = Array.from(db.examAttempts.values()).filter(a => a.contestId === contestId && (a.status === 'SUBMITTED' || a.status === 'AUTO_SUBMITTED'));

  const leaderboard = attempts
    .map(a => {
      const u = db.users.get(a.userId);
      const events = db.proctoringEvents.get(a.id) || [];
      const hintsCount = events.filter(e => e.eventType === 'HINT_REVEALED').length;
      return {
        rank: 1,
        candidateName: u?.fullName || 'Anonymous',
        score: a.score,
        hintsUsed: hintsCount,
        submittedAt: a.submittedAt
      };
    })
    .sort((a, b) => b.score - a.score)
    .map((item, idx) => ({ ...item, rank: idx + 1 }));

  return res.json({
    success: true,
    data: leaderboard
  });
});

// 5. Daily Motivational Thought GET & POST
router.get('/thought', (req: Request, res: Response) => {
  return res.json({
    success: true,
    data: db.dailyThought
  });
});

router.post('/thought', (req: Request, res: Response) => {
  const { thought, author } = req.body;
  if (!thought || typeof thought !== 'string') {
    return res.status(400).json({ success: false, error: 'Thought content is required' });
  }

  db.dailyThought = {
    thought: thought.trim(),
    author: (author && typeof author === 'string') ? author.trim() : 'Super Admin Utkarsh Tiwari',
    updatedAt: new Date().toISOString()
  };

  return res.json({
    success: true,
    message: 'Daily motivational thought updated successfully',
    data: db.dailyThought
  });
});

export default router;
