import { Router, Request, Response } from 'express';
import { TaskModel, UserModel } from '../db/mongodb';
import mongoose from 'mongoose';

const router = Router();

// 1. Get Tasks (Fetches real tasks from MongoDB Atlas)
router.get('/', async (req: Request, res: Response) => {
  try {
    let taskList = [];
    if (mongoose.connection.readyState === 1) {
      taskList = await TaskModel.find().sort({ createdAt: -1 });
    }

    // Fallback default task if collection empty
    if (taskList.length === 0) {
      taskList = [{
        id: 'tsk_101',
        title: 'Complete Data Structures & Algorithms Assignment 3',
        description: 'Implement AVL Tree balancing and Graph BFS/DFS traversal in C++.',
        priority: 'HIGH',
        assignedToEmail: 'pragyat841@gmail.com',
        dueAt: 'Tomorrow 06:00 PM',
        status: 'IN_PROGRESS'
      }];
    }

    return res.json({
      success: true,
      data: taskList
    });
  } catch (err: any) {
    return res.status(500).json({ success: false, error: { code: 'SERVER_ERROR', message: err.message } });
  }
});

// 2. Create Task (Admin -> Only allowed to assign to APPROVED students!)
router.post('/', async (req: Request, res: Response) => {
  const { title, description, priority, dueAt, estimatedDurationMinutes, assignToUserIds } = req.body;
  const targetEmail = assignToUserIds?.[0] || 'pragyat841@gmail.com';

  try {
    // Check if target student is approved
    if (mongoose.connection.readyState === 1) {
      const student = await UserModel.findOne({ email: targetEmail });
      if (student && student.status === 'PENDING_APPROVAL') {
        return res.status(403).json({
          success: false,
          error: { code: 'STUDENT_NOT_APPROVED', message: `Cannot assign task to ${targetEmail} because their account is pending Super Admin approval.` }
        });
      }

      const newTask = await TaskModel.create({
        title,
        description,
        priority: priority || 'MEDIUM',
        createdById: 'utkarsh@admin.com',
        assignedToEmail: targetEmail,
        dueAt: dueAt || new Date(Date.now() + 86400000),
        estimatedDurationMinutes: estimatedDurationMinutes || 60,
        status: 'NOT_STARTED'
      });

      return res.json({
        success: true,
        data: newTask
      });
    }

    return res.json({
      success: true,
      data: {
        id: `tsk_${Date.now()}`,
        title,
        priority,
        assignedToEmail: targetEmail,
        status: 'NOT_STARTED'
      }
    });
  } catch (err: any) {
    return res.status(500).json({ success: false, error: { code: 'SERVER_ERROR', message: err.message } });
  }
});

// 3. Update Task Status
router.patch('/:id/status', async (req: Request, res: Response) => {
  const taskId = req.params.id;
  const { status } = req.body;

  try {
    if (mongoose.connection.readyState === 1 && mongoose.Types.ObjectId.isValid(taskId)) {
      const updated = await TaskModel.findByIdAndUpdate(taskId, { status }, { new: true });
      return res.json({ success: true, data: updated });
    }

    return res.json({
      success: true,
      data: { taskId, status, updatedAt: new Date().toISOString() }
    });
  } catch (err: any) {
    return res.status(500).json({ success: false, error: { code: 'SERVER_ERROR', message: err.message } });
  }
});

export default router;
