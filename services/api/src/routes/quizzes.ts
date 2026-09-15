import { Router, Request, Response } from 'express';
import { db } from '../db/store';

const router = Router();

// Today's Challenge / Quiz Endpoint for Mobile Dashboard
router.get('/today', (req: Request, res: Response) => {
  // Return active daily challenge quiz details
  const todayQuiz = {
    id: 'quiz_today_2026',
    title: "Today's Full-Stack & Algorithm Challenge",
    description: '10 MCQ & 2 Coding Questions evaluating JS async runtime, array manipulation, and dynamic programming.',
    mcqCount: 10,
    codingCount: 2,
    estimatedDurationMinutes: 45,
    difficulty: 'MEDIUM',
    topic: 'Full-Stack & Algorithms',
    startAvailability: '00:00 UTC',
    expiration: '23:59 UTC',
    attemptStatus: 'NOT_STARTED',
    invitationToken: 'INV_TOKEN_ALEX_CHEN_2026'
  };

  return res.json({
    success: true,
    data: todayQuiz
  });
});

export default router;
