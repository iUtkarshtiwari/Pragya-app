import { Router, Request, Response } from 'express';
import { db } from '../db/store';
import { ContestModel } from '../db/mongodb';
import mongoose from 'mongoose';

const router = Router();

// 1. Get all Coding Contests & Task-Linked Assignments
router.get('/', async (req: Request, res: Response) => {
  try {
    let list = [];
    if (mongoose.connection.readyState === 1) {
      list = await ContestModel.find().sort({ createdAt: -1 });
    }

    if (list.length === 0) {
      list = [Array.from(db.contests.values())[0]];
    }

    return res.json({
      success: true,
      data: list
    });
  } catch (err: any) {
    return res.status(500).json({ success: false, error: { code: 'SERVER_ERROR', message: err.message } });
  }
});

// 2. Create Coding Assignment linked to a Task (Super Admin Question & Test Case Builder)
router.post('/create-assignment', async (req: Request, res: Response) => {
  const {
    title,
    description,
    associatedTaskId,
    durationMinutes,
    starterCode,
    visibleTestCases,
    hiddenTestCases,
    cpuLimitMs,
    memoryLimitMb
  } = req.body;

  try {
    if (mongoose.connection.readyState === 1) {
      const newContest = await ContestModel.create({
        title,
        description,
        associatedTaskId,
        durationMinutes: durationMinutes || 45,
        starterCode: starterCode || 'function solution(nums) {\n  // Write solution here\n}',
        visibleTestCases: visibleTestCases || [{ input: '[2,7,11,15], target = 9', expectedOutput: '[0,1]', explanation: '2 + 7 = 9' }],
        hiddenTestCases: hiddenTestCases || [{ input: '[3,2,4], target = 6', expectedOutput: '[1,2]' }],
        cpuLimitMs: cpuLimitMs || 2000,
        memoryLimitMb: memoryLimitMb || 256,
        proctoringConfig: { level: 'STRICT', cameraRequired: true, maxViolationsAllowed: 3 }
      });

      return res.json({
        success: true,
        data: newContest
      });
    }

    const contestId = `cnt_${Date.now()}`;
    const fallbackContest = {
      id: contestId,
      title,
      description,
      associatedTaskId,
      durationMinutes: durationMinutes || 45,
      starterCode: starterCode || 'function solution() {}',
      visibleTestCases,
      hiddenTestCases
    };
    db.contests.set(contestId, fallbackContest as any);

    return res.json({
      success: true,
      data: fallbackContest
    });
  } catch (err: any) {
    return res.status(500).json({ success: false, error: { code: 'SERVER_ERROR', message: err.message } });
  }
});

export default router;
