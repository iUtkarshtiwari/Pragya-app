import { Router, Request, Response } from 'express';
import { UserModel } from '../db/mongodb';

const router = Router();

// 1. Get All Students for Super Admin Management
router.get('/students', async (req: Request, res: Response) => {
  try {
    let students = [];
    if (UserModel) {
      students = await UserModel.find({ role: 'STUDENT' }).sort({ createdAt: -1 });
    }
    return res.json({
      success: true,
      data: students
    });
  } catch (err: any) {
    return res.status(500).json({ success: false, error: { code: 'SERVER_ERROR', message: err.message } });
  }
});

// 2. Super Admin Approval Endpoint (PENDING_APPROVAL -> APPROVED)
router.patch('/:id/approve', async (req: Request, res: Response) => {
  const userId = req.params.id;
  try {
    const user = await UserModel.findByIdAndUpdate(
      userId,
      { status: 'APPROVED' },
      { new: true }
    );

    if (!user) {
      return res.status(404).json({ success: false, error: { code: 'USER_NOT_FOUND', message: 'Student user not found.' } });
    }

    return res.json({
      success: true,
      data: user
    });
  } catch (err: any) {
    return res.status(500).json({ success: false, error: { code: 'SERVER_ERROR', message: err.message } });
  }
});

export default router;
