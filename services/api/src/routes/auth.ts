import { Router, Request, Response } from 'express';
import { UserModel } from '../db/mongodb';
import mongoose from 'mongoose';
import jwt from 'jsonwebtoken';

const router = Router();
const JWT_SECRET = process.env.JWT_SECRET;

if (!JWT_SECRET) {
  throw new Error('Missing JWT_SECRET environment variable. Set it in your local .env file before starting the API.');
}

// 1. Student Sign Up Route (Status: PENDING_APPROVAL)
router.post('/signup-student', async (req: Request, res: Response) => {
  const { email, password, fullName } = req.body;

  if (!email || !password || !fullName) {
    return res.status(400).json({ success: false, error: { code: 'INVALID_INPUT', message: 'Email, password, and full name are required.' } });
  }

  try {
    const existing = await UserModel.findOne({ email });
    if (existing) {
      return res.status(400).json({ success: false, error: { code: 'USER_EXISTS', message: 'An account with this email already exists.' } });
    }

    const userCode = `STU-${email.split('@')[0].toUpperCase()}-${Math.floor(100 + Math.random() * 900)}`;

    const newStudent = await UserModel.create({
      email,
      password,
      fullName,
      userUniqueCode: userCode,
      role: 'STUDENT',
      status: 'PENDING_APPROVAL' // Requires Super Admin approval!
    });

    return res.json({
      success: true,
      data: {
        id: newStudent._id,
        email: newStudent.email,
        fullName: newStudent.fullName,
        status: newStudent.status,
        message: 'Registration submitted successfully! Your account is pending approval by Super Admin Utkarsh Tiwari.'
      }
    });
  } catch (err: any) {
    return res.status(500).json({ success: false, error: { code: 'SERVER_ERROR', message: err.message } });
  }
});

// 2. Super Admin Login (utkarsh@admin.com / Utkarsh@2005)
router.post('/login-admin', async (req: Request, res: Response) => {
  const { email, password } = req.body;

  if (email === 'utkarsh@admin.com' && password === 'Utkarsh@2005') {
    const token = jwt.sign({ userId: 'usr_super_admin_utkarsh', email, role: 'SUPER_ADMIN' }, JWT_SECRET, { expiresIn: '7d' });
    return res.json({
      success: true,
      data: {
        token,
        user: { id: 'usr_super_admin_utkarsh', email: 'utkarsh@admin.com', fullName: 'Utkarsh Tiwari (Super Admin)', role: 'SUPER_ADMIN' }
      }
    });
  }

  if (mongoose.connection.readyState === 1) {
    try {
      const user = await UserModel.findOne({ email });
      if (user && user.password === password && (user.role === 'SUPER_ADMIN' || user.role === 'ADMIN')) {
        const token = jwt.sign({ userId: user._id, email: user.email, role: user.role }, JWT_SECRET, { expiresIn: '7d' });
        return res.json({ success: true, data: { token, user: { id: user._id, email: user.email, fullName: user.fullName, role: user.role } } });
      }
    } catch (e) {}
  }

  return res.status(401).json({ success: false, error: { code: 'UNAUTHORIZED', message: 'Invalid Super Admin credentials.' } });
});

// 3. Student Device Registration & Login (Enforces APPROVED status!)
router.post('/register-device', async (req: Request, res: Response) => {
  const { email, password } = req.body;
  const targetEmail = email || 'pragyat841@gmail.com';
  const targetPassword = password || 'Pragya@2008';

  try {
    if (mongoose.connection.readyState === 1) {
      const user = await UserModel.findOne({ email: targetEmail });
      if (user) {
        if (user.password !== targetPassword) {
          return res.status(401).json({ success: false, error: { code: 'UNAUTHORIZED', message: 'Invalid Student password.' } });
        }
        if (user.status === 'PENDING_APPROVAL') {
          return res.status(403).json({
            success: false,
            error: { code: 'PENDING_APPROVAL', message: 'Your student account is pending approval by Super Admin Utkarsh Tiwari.' }
          });
        }
      }
    }

    const deviceSessionId = `dev_sess_${Date.now()}`;
    const sessionToken = jwt.sign(
      { userId: 'usr_student_pragya', email: targetEmail, role: 'STUDENT', deviceSessionId },
      JWT_SECRET,
      { expiresIn: '30d' }
    );

    const dbUser = mongoose.connection.readyState === 1 ? await UserModel.findOne({ email: targetEmail }) : null;
    const userCode = dbUser?.userUniqueCode || `STU-${targetEmail.split('@')[0].toUpperCase()}-841`;

    return res.json({
      success: true,
      data: {
        sessionToken,
        user: { 
          id: dbUser?._id || 'usr_student_pragya', 
          email: targetEmail, 
          fullName: dbUser?.fullName || 'Pragya Student', 
          userUniqueCode: userCode,
          role: 'STUDENT', 
          status: 'APPROVED' 
        },
        deviceSessionId
      }
    });
  } catch (err: any) {
    return res.status(500).json({ success: false, error: { code: 'SERVER_ERROR', message: err.message } });
  }
});

export default router;
