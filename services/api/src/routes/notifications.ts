import { Router, Request, Response } from 'express';

const router = Router();

// In-Memory Push Notifications Store
interface NotificationItem {
  id: string;
  userId: string;
  title: string;
  body: string;
  category: 'TASK_ASSIGNED' | 'ASSIGNMENT_UNLOCKED' | 'SYSTEM_ALERT';
  read: boolean;
  createdAt: string;
}

const notificationsStore: NotificationItem[] = [
  {
    id: 'ntf_101',
    userId: 'pragyat841@gmail.com',
    title: '🎉 Welcome to Pragya Student Portal',
    body: 'Your account is active. Complete prerequisite tasks to unlock proctored assignments.',
    category: 'SYSTEM_ALERT',
    read: false,
    createdAt: new Date(Date.now() - 3600000).toISOString()
  },
  {
    id: 'ntf_102',
    userId: 'pragyat841@gmail.com',
    title: '📌 New Prerequisite Task Assigned',
    body: 'Super Admin Utkarsh Tiwari assigned Data Structures & Algorithms Assignment 3 to you.',
    category: 'TASK_ASSIGNED',
    read: false,
    createdAt: new Date().toISOString()
  }
];

const fcmTokens = new Map<string, string>(); // userId -> fcmToken

// 1. Register FCM Push Token for Foreground/Background/Dead State Push Trigger
router.post('/register-fcm-token', (req: Request, res: Response) => {
  const { userId, fcmToken, appState } = req.body;
  const user = userId || 'pragyat841@gmail.com';
  const token = fcmToken || `fcm_token_device_${Date.now()}`;

  fcmTokens.set(user, token);
  console.log(`🔔 FCM Push Token Registered for ${user} (State: ${appState || 'FOREGROUND'}): ${token}`);

  return res.json({
    success: true,
    data: {
      userId: user,
      fcmToken: token,
      status: 'ACTIVE_LISTENER',
      supportedStates: ['FOREGROUND', 'BACKGROUND', 'DEAD_KILL_STATE']
    }
  });
});

// 2. Fetch Notifications for Logged-In Student
router.get('/', (req: Request, res: Response) => {
  const userId = (req.query.userId as string) || 'pragyat841@gmail.com';
  const userNotifications = notificationsStore.filter(n => n.userId === userId);

  const unreadCount = userNotifications.filter(n => !n.read).length;

  return res.json({
    success: true,
    data: {
      notifications: userNotifications,
      unreadCount,
      totalCount: userNotifications.length
    }
  });
});

// 3. Mark Notification as Read
router.patch('/:id/read', (req: Request, res: Response) => {
  const id = req.params.id;
  const target = notificationsStore.find(n => n.id === id);
  if (target) {
    target.read = true;
  }
  return res.json({ success: true, data: { id, read: true } });
});

// 4. Trigger Server Push Notification (Simulating FCM Push to Foreground/Background/Killed App)
router.post('/trigger-push', (req: Request, res: Response) => {
  const { userId, title, body, category } = req.body;
  const user = userId || 'pragyat841@gmail.com';
  
  const newNotification: NotificationItem = {
    id: `ntf_${Date.now()}`,
    userId: user,
    title: title || '⚡ New Assignment Unlocked!',
    body: body || 'You have completed all prerequisite tasks. Your proctored test link is now ready.',
    category: category || 'ASSIGNMENT_UNLOCKED',
    read: false,
    createdAt: new Date().toISOString()
  };

  notificationsStore.unshift(newNotification);

  return res.json({
    success: true,
    data: {
      notification: newNotification,
      fcmPayloadSent: {
        to: fcmTokens.get(user) || 'fcm_broadcast_channel',
        notification: { title: newNotification.title, body: newNotification.body },
        data: { category: newNotification.category, timestamp: newNotification.createdAt }
      }
    }
  });
});

export default router;
