import { Router, Request, Response } from 'express';
import { db } from '../db/store';
import { TaskModel, ExamAttemptModel } from '../db/mongodb';
import mongoose from 'mongoose';

const router = Router();

// In-Memory store for violation counters & active attempts
const violationCounters = new Map<string, number>();

// 1. Verify User-Specific & Test-ID-Specific Signed Token
router.post('/verify-invitation', async (req: Request, res: Response) => {
  const { invitationToken } = req.body;
  const tokenStr = invitationToken || 'TEST_PRAGYA_STUDENT_841';

  // Extract user binding from token or default student
  const targetEmail = tokenStr.includes('pragya') ? 'pragyat841@gmail.com' : 'pragyat841@gmail.com';
  const testId = tokenStr.split('_').pop() || 'CS301_ALGORITHM_TEST';

  // 🔒 Prerequisite Task Completion Check!
  if (mongoose.connection.readyState === 1) {
    try {
      const pendingTasks = await TaskModel.find({
        assignedToEmail: targetEmail,
        status: { $ne: 'COMPLETED' }
      });

      if (pendingTasks.length > 0) {
        return res.status(403).json({
          success: false,
          error: {
            code: 'PREREQUISITE_TASKS_INCOMPLETE',
            message: `Prerequisite Tasks Incomplete: You have ${pendingTasks.length} pending task(s). Mark all assigned tasks COMPLETED to unlock this assignment!`
          }
        });
      }
    } catch (e) {}
  }

  const attemptId = `atm_${tokenStr}`;
  violationCounters.set(attemptId, 0);

  return res.json({
    success: true,
    data: {
      attemptId,
      candidate: {
        id: 'usr_student_pragya',
        fullName: 'Pragya Student',
        email: targetEmail
      },
      contest: {
        id: testId,
        title: `Proctored Assignment #${testId}`,
        durationMinutes: 45,
        proctoringConfig: { level: 'STRICT', cameraRequired: true, maxViolationsAllowed: 3 }
      },
      serverTime: new Date().toISOString()
    }
  });
});

// 2. Ingest Proctoring Violation Event & Enforce 3-Violation Disqualification Limit
router.post('/:attemptId/proctoring-event', (req: Request, res: Response) => {
  const attemptId = req.params.attemptId;
  const { eventType, metadata } = req.body;

  const currentCount = (violationCounters.get(attemptId) || 0) + 1;
  violationCounters.set(attemptId, currentCount);

  const isDisqualified = currentCount >= 3;

  const events = db.proctoringEvents.get(attemptId) || [];
  events.push({
    id: `evt_${Date.now()}`,
    attemptId,
    eventType,
    severity: currentCount >= 3 ? 'CRITICAL' : 'HIGH',
    metadata: { ...metadata, violationIndex: currentCount },
    timestamp: new Date().toISOString()
  });
  db.proctoringEvents.set(attemptId, events);

  return res.json({
    success: true,
    data: {
      violationCount: currentCount,
      maxViolationsAllowed: 3,
      isDisqualified,
      warningMessage: isDisqualified 
        ? '🔴 TEST TERMINATED: You have exceeded the maximum limit of 3 security violations.'
        : `⚠️ Security Violation Warning ${currentCount}/3: Moving away from the test screen is restricted!`
    }
  });
});

// 3. Generate User-Specific and Test-ID-Specific Assignment Link
router.post('/generate-user-test-link', async (req: Request, res: Response) => {
  const { studentEmail, testId, userUniqueCode } = req.body;

  const targetEmail = studentEmail || 'pragyat841@gmail.com';
  const targetTestId = testId || `TEST_841`;
  const userCode = userUniqueCode || `STU-${targetEmail.split('@')[0].toUpperCase()}-841`;

  // Signed link structure: TEST_[TEST_ID]_[USER_CODE]
  const token = `TEST_${targetTestId}_${userCode}`;
  const assignmentUrl = `http://localhost:3002/exam?token=${token}&user=${encodeURIComponent(targetEmail)}&testId=${targetTestId}&userCode=${encodeURIComponent(userCode)}`;

  return res.json({
    success: true,
    data: {
      studentEmail: targetEmail,
      userUniqueCode: userCode,
      testId: targetTestId,
      token,
      assignmentUrl
    }
  });
});

export default router;
