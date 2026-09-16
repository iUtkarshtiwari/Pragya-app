import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { 
  Bell, 
  CheckCircle2, 
  User, 
  CheckSquare, 
  Zap, 
  LogOut, 
  ShieldCheck, 
  Lock, 
  ExternalLink, 
  Copy,
  X,
  Sparkles,
  TrendingUp,
  Award,
  Flame,
  Clock,
  Check
} from 'lucide-react';

import { DeviceSecurityService } from '../services/DeviceSecurityService';
import { API_BASE_URL, EXAM_APP_URL, apiUrl } from '../config';

export function DashboardScreen({ onOpenExamInvitation, onSelectTask, onLogout }: { onOpenExamInvitation: () => void; onSelectTask: (task: any) => void; onLogout?: () => void }) {
  const [studentEmail, setStudentEmail] = useState<string>('pragyat841@gmail.com');
  const [activeTab, setActiveTab] = useState<'dashboard' | 'tasks' | 'assignments' | 'notifications' | 'profile'>('dashboard');
  const [tasks, setTasks] = useState<any[]>([]);
  const [lockedReason, setLockedReason] = useState<string | null>(null);
  const [userTestUrl, setUserTestUrl] = useState<string | null>(null);
  const [copiedLink, setCopiedLink] = useState(false);

  // Daily Motivational Thought State
  const [dailyThought, setDailyThought] = useState<{ thought: string; author: string }>({
    thought: "Consistency is the key to mastering code and achieving excellence every single day.",
    author: "Super Admin Utkarsh Tiwari"
  });

  // Notification & FCM Token State
  const [notifications, setNotifications] = useState<any[]>([]);
  const [unreadCount, setUnreadCount] = useState<number>(0);
  const [fcmRegistered, setFcmRegistered] = useState<boolean>(false);

  useEffect(() => {
    DeviceSecurityService.getDeviceCredentials().then(creds => {
      const email = creds?.userId || 'pragyat841@gmail.com';
      setStudentEmail(email);
      fetchTasks(email);
      fetchNotifications(email);
      fetchDailyThought();
      registerFcmToken(email);
    });
  }, []);

  const fetchDailyThought = async () => {
    try {
      const res = await fetch(apiUrl('/api/v1/dashboard/thought'));
      const json = await res.json();
      if (json.success && json.data?.thought) {
        setDailyThought({
          thought: json.data.thought,
          author: json.data.author || 'Super Admin Utkarsh Tiwari'
        });
      }
    } catch (e) {}
  };

  const registerFcmToken = async (email: string) => {
    try {
      await fetch(apiUrl('/api/v1/notifications/register-fcm-token'), {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId: email, fcmToken: `fcm_token_device_${Date.now()}`, appState: 'FOREGROUND' })
      });
      setFcmRegistered(true);
    } catch (e) {}
  };

  const fetchNotifications = async (email: string) => {
    try {
      const res = await fetch(apiUrl(`/api/v1/notifications?userId=${encodeURIComponent(email)}`));
      const json = await res.json();
      if (json.success && json.data) {
        setNotifications(json.data.notifications || []);
        setUnreadCount(json.data.unreadCount || 0);
      }
    } catch (e) {}
  };

  const markNotificationRead = async (id: string) => {
    setNotifications(prev => prev.map(n => n.id === id ? { ...n, read: true } : n));
    setUnreadCount(prev => Math.max(0, prev - 1));
    try {
      await fetch(apiUrl(`/api/v1/notifications/${id}/read`), { method: 'PATCH' });
    } catch (e) {}
  };

  // Fetch student's tasks from MongoDB API
  const fetchTasks = async (email: string) => {
    try {
      const res = await fetch(apiUrl(`/api/v1/tasks?userId=${encodeURIComponent(email)}`));
      const json = await res.json();
      if (json.success && json.data) {
        setTasks(json.data);
      }
    } catch (e) {
      console.warn('Task query notice:', e);
    }
  };

  const handleTaskStateTransition = async (taskId: string) => {
    setTasks(prev => prev.map(t => {
      if (t.id === taskId || t._id === taskId) {
        const nextStatus = t.status === 'COMPLETED' ? 'IN_PROGRESS' : 'COMPLETED';
        return { ...t, status: nextStatus };
      }
      return t;
    }));

    try {
      const target = tasks.find(t => t.id === taskId || t._id === taskId);
      const nextStatus = target?.status === 'COMPLETED' ? 'IN_PROGRESS' : 'COMPLETED';
      await fetch(apiUrl(`/api/v1/tasks/${taskId}/status`), {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: nextStatus, userId: studentEmail })
      });
    } catch (e) {}
  };

  const pendingTasks = tasks.filter(t => t.status !== 'COMPLETED');
  const isAssignmentLocked = pendingTasks.length > 0;
  const completedCount = tasks.filter(t => t.status === 'COMPLETED').length;
  const progressRate = tasks.length > 0 ? Math.round((completedCount / tasks.length) * 100) : 0;

  // Generate User-Specific and Test-ID-Specific Assignment Link!
  const handleLaunchUserSpecificAssignment = async () => {
    if (isAssignmentLocked) {
      setLockedReason(`Assignment Locked: You have ${pendingTasks.length} pending prerequisite task(s). Mark all tasks COMPLETED to unlock!`);
      return;
    }

    setLockedReason(null);
    try {
      const res = await fetch(apiUrl('/api/v1/exams/generate-user-test-link'), {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ studentEmail: studentEmail, testId: 'PROCTORED_TEST_841' })
      });
      const json = await res.json();
      if (json.success && json.data) {
        setUserTestUrl(json.data.assignmentUrl);
        window.open(json.data.assignmentUrl, '_blank');
      } else {
        onOpenExamInvitation();
      }
    } catch (e) {
      onOpenExamInvitation();
    }
  };

  const handleCopyLink = () => {
    if (userTestUrl) {
      navigator.clipboard.writeText(userTestUrl);
      setCopiedLink(true);
      setTimeout(() => setCopiedLink(false), 2500);
    }
  };

  return (
    <View style={{ flex: 1, backgroundColor: '#090d16' }}>
      <ScrollView style={[styles.container, { paddingBottom: 80 }]}>
        {/* Instagram-Style Top Header Bar with Lucide Bell Icon Directing to Page */}
        <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingTop: 40, paddingBottom: 16, borderBottomWidth: 1, borderBottomColor: 'rgba(255,255,255,0.06)', marginBottom: 16 }}>
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
            <View style={{ width: 32, height: 32, borderRadius: 10, backgroundColor: '#06b6d4', alignItems: 'center', justifyContent: 'center' }}>
              <Text style={{ color: '#000', fontWeight: '900', fontSize: 16 }}>P</Text>
            </View>
            <Text style={{ fontSize: 20, fontWeight: '900', color: '#ffffff', letterSpacing: -0.5 }}>Pragya</Text>
          </View>

          {/* Dedicated Full Page Notifications Trigger */}
          <TouchableOpacity 
            style={{ position: 'relative', padding: 8, backgroundColor: activeTab === 'notifications' ? 'rgba(6,182,212,0.2)' : 'rgba(255,255,255,0.05)', borderRadius: 12, borderWidth: 1, borderColor: activeTab === 'notifications' ? '#06b6d4' : 'rgba(255,255,255,0.08)' }}
            onPress={() => setActiveTab('notifications')}
          >
            <Bell size={20} color={activeTab === 'notifications' ? '#ffffff' : '#06b6d4'} />
            {unreadCount > 0 && (
              <View style={{ position: 'absolute', top: -4, right: -4, backgroundColor: '#f43f5e', borderRadius: 8, minWidth: 16, height: 16, alignItems: 'center', justifyContent: 'center', paddingHorizontal: 3 }}>
                <Text style={{ color: 'white', fontSize: 9, fontWeight: '900' }}>{unreadCount}</Text>
              </View>
            )}
          </TouchableOpacity>
        </View>

        {/* TAB 1: Student Progress & Motivational Thought Dashboard */}
        {activeTab === 'dashboard' && (
          <View>
            {/* Daily Motivational Thought Banner managed by Super Admin */}
            <View style={{ borderRadius: 20, padding: 20, borderWidth: 1, borderColor: 'rgba(139, 92, 246, 0.4)', marginBottom: 20, backgroundColor: '#131b2e' }}>
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 10 }}>
                <Sparkles size={18} color="#8b5cf6" />
                <Text style={{ color: '#8b5cf6', fontSize: 12, fontWeight: '900', letterSpacing: 1 }}>DAILY MOTIVATION</Text>
              </View>
              <Text style={{ color: '#ffffff', fontSize: 15, fontWeight: '700', fontStyle: 'italic', lineHeight: 22 }}>
                "{dailyThought.thought}"
              </Text>
              <Text style={{ color: '#06b6d4', fontSize: 12, fontWeight: '800', marginTop: 10, textAlign: 'right' }}>
                — {dailyThought.author}
              </Text>
            </View>

            {/* Student Overall Progress Metrics Grid */}
            <View style={{ flexDirection: 'row', gap: 12, marginBottom: 20 }}>
              <View style={{ flex: 1, backgroundColor: 'rgba(18, 24, 40, 0.85)', borderRadius: 18, padding: 16, borderWidth: 1, borderColor: 'rgba(6, 182, 212, 0.3)' }}>
                <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
                  <Text style={{ color: '#94a3b8', fontSize: 11, fontWeight: '800' }}>COMPLETION</Text>
                  <TrendingUp size={16} color="#06b6d4" />
                </View>
                <Text style={{ color: '#ffffff', fontSize: 24, fontWeight: '900' }}>{progressRate}%</Text>
                <Text style={{ color: '#06b6d4', fontSize: 11, marginTop: 4, fontWeight: '700' }}>
                  {completedCount} of {tasks.length} tasks done
                </Text>
              </View>

              <View style={{ flex: 1, backgroundColor: 'rgba(18, 24, 40, 0.85)', borderRadius: 18, padding: 16, borderWidth: 1, borderColor: 'rgba(16, 185, 129, 0.3)' }}>
                <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
                  <Text style={{ color: '#94a3b8', fontSize: 11, fontWeight: '800' }}>DAILY STREAK</Text>
                  <Flame size={16} color="#10b981" />
                </View>
                <Text style={{ color: '#ffffff', fontSize: 24, fontWeight: '900' }}>5 Days</Text>
                <Text style={{ color: '#10b981', fontSize: 11, marginTop: 4, fontWeight: '700' }}>
                  🔥 Active Learner
                </Text>
              </View>
            </View>

            {/* Progress Track Bar */}
            <View style={styles.card}>
              <View style={styles.cardHeader}>
                <Text style={styles.cardTitle}>Assigned Tasks Progress</Text>
                <Text style={styles.progressLabel}>{completedCount} / {tasks.length} Completed</Text>
              </View>
              <View style={styles.progressBarTrack}>
                <View style={[styles.progressBarFill, { width: `${progressRate}%` }]} />
              </View>
            </View>

            {/* Quick Action Links */}
            <View style={{ flexDirection: 'row', gap: 10 }}>
              <TouchableOpacity 
                style={{ flex: 1, backgroundColor: 'rgba(6,182,212,0.15)', borderWidth: 1, borderColor: '#06b6d4', padding: 14, borderRadius: 14, alignItems: 'center' }}
                onPress={() => setActiveTab('tasks')}
              >
                <CheckSquare size={18} color="#06b6d4" />
                <Text style={{ color: '#06b6d4', fontSize: 12, fontWeight: '800', marginTop: 6 }}>View Tasks ({tasks.length})</Text>
              </TouchableOpacity>

              <TouchableOpacity 
                style={{ flex: 1, backgroundColor: 'rgba(139,92,246,0.15)', borderWidth: 1, borderColor: '#8b5cf6', padding: 14, borderRadius: 14, alignItems: 'center' }}
                onPress={() => setActiveTab('assignments')}
              >
                <Zap size={18} color="#8b5cf6" />
                <Text style={{ color: '#8b5cf6', fontSize: 12, fontWeight: '800', marginTop: 6 }}>View Contests</Text>
              </TouchableOpacity>
            </View>
          </View>
        )}

        {/* TAB 2: Dedicated Full Notifications Page */}
        {activeTab === 'notifications' && (
          <View>
            <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
                <Bell size={20} color="#06b6d4" />
                <Text style={{ color: '#ffffff', fontSize: 18, fontWeight: '900' }}>Notifications Page</Text>
              </View>
              <View style={{ backgroundColor: 'rgba(6,182,212,0.15)', paddingHorizontal: 10, paddingVertical: 4, borderRadius: 12 }}>
                <Text style={{ color: '#06b6d4', fontSize: 11, fontWeight: '800' }}>{unreadCount} Unread</Text>
              </View>
            </View>

            <View style={{ backgroundColor: 'rgba(255,255,255,0.03)', padding: 12, borderRadius: 12, marginBottom: 16 }}>
              <Text style={{ color: '#94a3b8', fontSize: 12 }}>
                Real-time FCM notifications for task updates, contest invitations, and Super Admin announcements.
              </Text>
            </View>

            {notifications.length === 0 ? (
              <View style={[styles.card, { alignItems: 'center', padding: 30 }]}>
                <Bell size={32} color="#64748b" />
                <Text style={{ color: '#94a3b8', fontSize: 14, marginTop: 12, fontWeight: '600' }}>No notifications available right now.</Text>
              </View>
            ) : (
              notifications.map(n => (
                <TouchableOpacity 
                  key={n.id} 
                  style={{ backgroundColor: n.read ? 'rgba(18, 24, 40, 0.75)' : 'rgba(6,182,212,0.12)', padding: 16, borderRadius: 16, marginBottom: 12, borderWidth: 1, borderColor: n.read ? 'rgba(255,255,255,0.08)' : 'rgba(6,182,212,0.4)' }}
                  onPress={() => markNotificationRead(n.id)}
                >
                  <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6 }}>
                    <Text style={{ color: '#ffffff', fontWeight: '800', fontSize: 14, flex: 1 }}>{n.title}</Text>
                    {!n.read ? (
                      <View style={{ backgroundColor: '#06b6d4', paddingHorizontal: 8, paddingVertical: 2, borderRadius: 8 }}>
                        <Text style={{ color: '#000000', fontSize: 10, fontWeight: '900' }}>NEW</Text>
                      </View>
                    ) : (
                      <Text style={{ color: '#64748b', fontSize: 10, fontWeight: '700' }}>READ</Text>
                    )}
                  </View>
                  <Text style={{ color: '#cbd5e1', fontSize: 13, lineHeight: 18 }}>{n.body}</Text>
                  <Text style={{ color: '#64748b', fontSize: 10, marginTop: 8 }}>{n.createdAt || 'Just now'}</Text>
                </TouchableOpacity>
              ))
            )}
          </View>
        )}

        {/* TAB 3: Prerequisite Tasks View */}
        {activeTab === 'tasks' && (
          <View>
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionTitle}>1. Prerequisite Assigned Tasks & Badges</Text>
            </View>

            {tasks.length === 0 ? (
              <View style={[styles.card, { alignItems: 'center', padding: 20 }]}>
                <Text style={{ color: '#94a3b8', fontSize: 14 }}>No prerequisite tasks assigned right now.</Text>
              </View>
            ) : (
              tasks.map(t => (
                <TouchableOpacity key={t.id || t._id} style={styles.taskCard} onPress={() => onSelectTask(t)}>
                  <View style={styles.taskHeaderRow}>
                    <View style={{ flex: 1 }}>
                      <Text style={styles.taskTitle}>{t.title}</Text>
                      <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 6, marginTop: 4 }}>
                        <View style={{ backgroundColor: 'rgba(6,182,212,0.15)', paddingHorizontal: 6, paddingVertical: 2, borderRadius: 6, maxWidth: '100%' }}>
                          <Text style={{ color: '#06b6d4', fontSize: 10, fontWeight: '700' }} numberOfLines={1}>Task ID: {t.id || t._id || 'tsk_101'}</Text>
                        </View>
                        <View style={{ backgroundColor: 'rgba(139,92,246,0.15)', paddingHorizontal: 6, paddingVertical: 2, borderRadius: 6, maxWidth: '100%' }}>
                          <Text style={{ color: '#8b5cf6', fontSize: 10, fontWeight: '700' }} numberOfLines={1}>Student: {t.assignedToEmail || 'pragyat841@gmail.com'}</Text>
                        </View>
                      </View>
                    </View>
                    <View style={[styles.priorityBadge, { backgroundColor: t.priority === 'HIGH' || t.priority === 'URGENT' ? 'rgba(244,63,94,0.15)' : 'rgba(6,182,212,0.15)' }]}>
                      <Text style={[styles.priorityText, { color: t.priority === 'HIGH' || t.priority === 'URGENT' ? '#f43f5e' : '#06b6d4' }]}>{t.priority}</Text>
                    </View>
                  </View>

                  <Text style={styles.taskDescription} numberOfLines={2}>{t.description || 'Complete prerequisite task before accessing test.'}</Text>

                  <View style={styles.taskFooter}>
                    <Text style={styles.dueText}>Status: {t.status}</Text>

                    <TouchableOpacity 
                      style={[styles.statusBtn, { backgroundColor: t.status === 'COMPLETED' ? 'rgba(16,185,129,0.2)' : 'rgba(6,182,212,0.2)' }]}
                      onPress={() => handleTaskStateTransition(t.id || t._id)}
                    >
                      <Text style={[styles.statusBtnText, { color: t.status === 'COMPLETED' ? '#10b981' : '#06b6d4' }]}>
                        {t.status === 'COMPLETED' ? '✓ Task Completed' : 'Mark Completed'}
                      </Text>
                    </TouchableOpacity>
                  </View>
                </TouchableOpacity>
              ))
            )}
          </View>
        )}

        {/* TAB 4: Coding Contests View */}
        {activeTab === 'assignments' && (
          <View>
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionTitle}>2. Assigned Coding Contests & Proctored Tests</Text>
            </View>

            {lockedReason && (
              <View style={styles.lockedBanner}>
                <Text style={styles.lockedText}>{lockedReason}</Text>
              </View>
            )}

            {userTestUrl && (
              <View style={styles.unlockedLinkBox}>
                <Text style={styles.unlockedLinkTitle}>🔑 Signed Assignment Link Generated:</Text>
                <Text style={styles.unlockedLinkText}>{userTestUrl}</Text>
                
                <View style={{ flexDirection: 'row', gap: 10, marginTop: 10 }}>
                  <TouchableOpacity 
                    style={{ flex: 1, backgroundColor: '#06b6d4', borderRadius: 8, paddingVertical: 10, alignItems: 'center' }} 
                    onPress={() => window.open(userTestUrl, '_blank')}
                  >
                    <Text style={{ color: '#000', fontWeight: '800', fontSize: 13 }}>🚀 Open Proctored Exam</Text>
                  </TouchableOpacity>

                  <TouchableOpacity 
                    style={{ flex: 1, backgroundColor: 'rgba(255,255,255,0.1)', borderWidth: 1, borderColor: '#06b6d4', borderRadius: 8, paddingVertical: 10, alignItems: 'center' }} 
                    onPress={handleCopyLink}
                  >
                    <Text style={{ color: '#06b6d4', fontWeight: '800', fontSize: 13 }}>
                      {copiedLink ? '✓ Link Copied!' : '📋 Copy Link'}
                    </Text>
                  </TouchableOpacity>
                </View>
              </View>
            )}

            <View style={[styles.card, styles.challengeCard, isAssignmentLocked && styles.challengeLockedCard]}>
              <View style={styles.challengeBadge}>
                <Text style={styles.challengeBadgeText}>
                  {isAssignmentLocked ? '🔒 ASSIGNMENT LOCKED (PREREQUISITES PENDING)' : '⚡ UNLOCKED: PROCTORED ASSIGNMENT'}
                </Text>
              </View>
              
              <Text style={styles.assignmentDetailsText}>
                Student: <Text style={{ color: 'white', fontWeight: '700' }}>{studentEmail}</Text> | Test ID: <Text style={{ color: '#06b6d4', fontWeight: '700' }}>PROCTORED_TEST_841</Text>
              </Text>
              <Text style={styles.challengeMeta}>Proctored • Max 3 Violations Allowed • Camera & Environment Setup</Text>

              <TouchableOpacity 
                style={[styles.challengeBtn, isAssignmentLocked && styles.challengeBtnDisabled]} 
                onPress={handleLaunchUserSpecificAssignment}
              >
                <Text style={[styles.challengeBtnText, isAssignmentLocked && styles.challengeBtnDisabled]}>
                  {isAssignmentLocked ? '🔒 Locked (Complete Prerequisite Tasks First)' : 'Start Assignment'}
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        )}

        {/* TAB 5: Profile View */}
        {activeTab === 'profile' && (
          <View style={[styles.card, { backgroundColor: 'rgba(6, 182, 212, 0.06)', borderColor: 'rgba(6, 182, 212, 0.3)', padding: 18, marginBottom: 18 }]}>
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 12 }}>
              <User size={20} color="#06b6d4" />
              <Text style={{ color: '#06b6d4', fontSize: 16, fontWeight: '800' }}>Student Account Profile</Text>
            </View>
            
            <View style={{ marginBottom: 12 }}>
              <Text style={{ color: '#94a3b8', fontSize: 11, fontWeight: '700' }}>STUDENT EMAIL</Text>
              <Text style={{ color: '#ffffff', fontSize: 15, fontWeight: '800', marginTop: 2 }}>{studentEmail}</Text>
            </View>

            <View style={{ marginBottom: 12 }}>
              <Text style={{ color: '#94a3b8', fontSize: 11, fontWeight: '700' }}>UNIQUE STUDENT CODE</Text>
              <Text style={{ color: '#06b6d4', fontSize: 15, fontWeight: '800', fontFamily: 'monospace', marginTop: 2 }}>
                {`STU-${studentEmail.split('@')[0].toUpperCase()}-841`}
              </Text>
            </View>

            <View style={{ marginBottom: 12 }}>
              <Text style={{ color: '#94a3b8', fontSize: 11, fontWeight: '700' }}>HARDWARE FCM PUSH TOKEN STATUS</Text>
              <Text style={{ color: '#10b981', fontSize: 13, fontWeight: '700', marginTop: 2 }}>
                {fcmRegistered ? '✓ Active Listener (Foreground, Background & Killed State)' : 'Connecting FCM Service...'}
              </Text>
            </View>

            <View style={{ backgroundColor: 'rgba(255,255,255,0.03)', padding: 12, borderRadius: 10, marginBottom: 16 }}>
              <Text style={{ color: '#cbd5e1', fontSize: 12, lineHeight: 16 }}>
                Super Admin approval: <Text style={{ color: '#10b981', fontWeight: '800' }}>APPROVED</Text>. You are authorized to complete prerequisite tasks and join proctored exams.
              </Text>
            </View>

            {onLogout && (
              <TouchableOpacity style={{ backgroundColor: 'rgba(244,63,94,0.15)', borderWidth: 1, borderColor: '#f43f5e', paddingVertical: 12, borderRadius: 12, flexDirection: 'row', justifyContent: 'center', alignItems: 'center', gap: 8 }} onPress={onLogout}>
                <LogOut size={16} color="#f43f5e" />
                <Text style={{ color: '#f43f5e', fontSize: 13, fontWeight: '800' }}>Log Out of Device Session</Text>
              </TouchableOpacity>
            )}
          </View>
        )}
      </ScrollView>

      {/* Instagram-Style Fixed Bottom Navigation Bar with Dedicated Tabs & Lucide Vector Icons */}
      <View style={{ flexDirection: 'row', backgroundColor: '#0d121e', borderTopWidth: 1, borderTopColor: 'rgba(255,255,255,0.08)', paddingVertical: 10, position: 'absolute', bottom: 0, left: 0, right: 0 }}>
        <TouchableOpacity style={{ flex: 1, alignItems: 'center' }} onPress={() => setActiveTab('dashboard')}>
          <TrendingUp size={18} color={activeTab === 'dashboard' ? '#06b6d4' : '#64748b'} />
          <Text style={{ fontSize: 10, fontWeight: '700', marginTop: 4, color: activeTab === 'dashboard' ? '#06b6d4' : '#64748b' }}>Dashboard</Text>
        </TouchableOpacity>

        <TouchableOpacity style={{ flex: 1, alignItems: 'center' }} onPress={() => setActiveTab('tasks')}>
          <CheckSquare size={18} color={activeTab === 'tasks' ? '#06b6d4' : '#64748b'} />
          <Text style={{ fontSize: 10, fontWeight: '700', marginTop: 4, color: activeTab === 'tasks' ? '#06b6d4' : '#64748b' }}>Tasks</Text>
        </TouchableOpacity>

        <TouchableOpacity style={{ flex: 1, alignItems: 'center' }} onPress={() => setActiveTab('assignments')}>
          <Zap size={18} color={activeTab === 'assignments' ? '#06b6d4' : '#64748b'} />
          <Text style={{ fontSize: 10, fontWeight: '700', marginTop: 4, color: activeTab === 'assignments' ? '#06b6d4' : '#64748b' }}>Contests</Text>
        </TouchableOpacity>

        <TouchableOpacity style={{ flex: 1, alignItems: 'center', position: 'relative' }} onPress={() => setActiveTab('notifications')}>
          <Bell size={18} color={activeTab === 'notifications' ? '#06b6d4' : '#64748b'} />
          {unreadCount > 0 && (
            <View style={{ position: 'absolute', top: -2, right: 20, backgroundColor: '#f43f5e', borderRadius: 6, minWidth: 12, height: 12, alignItems: 'center', justifyContent: 'center' }}>
              <Text style={{ color: 'white', fontSize: 8, fontWeight: '900' }}>{unreadCount}</Text>
            </View>
          )}
          <Text style={{ fontSize: 10, fontWeight: '700', marginTop: 4, color: activeTab === 'notifications' ? '#06b6d4' : '#64748b' }}>Alerts</Text>
        </TouchableOpacity>

        <TouchableOpacity style={{ flex: 1, alignItems: 'center' }} onPress={() => setActiveTab('profile')}>
          <User size={18} color={activeTab === 'profile' ? '#06b6d4' : '#64748b'} />
          <Text style={{ fontSize: 10, fontWeight: '700', marginTop: 4, color: activeTab === 'profile' ? '#06b6d4' : '#64748b' }}>Profile</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#090d16', padding: 20 },
  sectionHeader: { marginTop: 10, marginBottom: 14 },
  sectionTitle: { color: '#06b6d4', fontSize: 16, fontWeight: '800' },
  card: { backgroundColor: 'rgba(18, 24, 40, 0.75)', borderRadius: 20, padding: 20, borderWidth: 1, borderColor: 'rgba(255, 255, 255, 0.08)', marginBottom: 20 },
  cardHeader: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 12 },
  cardTitle: { color: '#ffffff', fontSize: 15, fontWeight: '700' },
  progressLabel: { color: '#06b6d4', fontSize: 13, fontWeight: '700' },
  progressBarTrack: { height: 10, backgroundColor: 'rgba(255,255,255,0.06)', borderRadius: 10, overflow: 'hidden' },
  progressBarFill: { height: '100%', backgroundColor: '#06b6d4', borderRadius: 10 },
  challengeCard: { borderColor: 'rgba(6, 182, 212, 0.4)', backgroundColor: 'rgba(6, 182, 212, 0.08)' },
  challengeLockedCard: { borderColor: 'rgba(239, 68, 68, 0.4)', backgroundColor: 'rgba(239, 68, 68, 0.05)' },
  challengeBadge: { alignSelf: 'flex-start', backgroundColor: 'rgba(245, 158, 11, 0.2)', paddingHorizontal: 10, paddingVertical: 4, borderRadius: 20, marginBottom: 12 },
  challengeBadgeText: { color: '#f59e0b', fontSize: 11, fontWeight: '800' },
  assignmentDetailsText: { color: '#cbd5e1', fontSize: 14, marginBottom: 6 },
  challengeMeta: { color: '#94a3b8', fontSize: 13, marginBottom: 16 },
  challengeBtn: { backgroundColor: '#06b6d4', borderRadius: 12, paddingVertical: 14, alignItems: 'center' },
  challengeBtnDisabled: { backgroundColor: 'rgba(255,255,255,0.08)' },
  challengeBtnText: { color: '#000000', fontWeight: '800', fontSize: 15 },
  challengeBtnTextDisabled: { color: '#ef4444' },
  lockedBanner: { backgroundColor: 'rgba(239, 68, 68, 0.15)', borderWidth: 1, borderColor: '#ef4444', padding: 12, borderRadius: 12, marginBottom: 14 },
  lockedText: { color: '#ef4444', fontSize: 13, fontWeight: '700', lineHeight: 18 },
  unlockedLinkBox: { backgroundColor: 'rgba(6,182,212,0.15)', borderWidth: 1, borderColor: '#06b6d4', padding: 12, borderRadius: 12, marginBottom: 14 },
  unlockedLinkTitle: { color: '#06b6d4', fontSize: 13, fontWeight: '800', marginBottom: 4 },
  unlockedLinkText: { color: '#ffffff', fontSize: 12, fontFamily: 'monospace' },
  taskCard: { backgroundColor: 'rgba(18, 24, 40, 0.75)', borderRadius: 16, padding: 18, borderWidth: 1, borderColor: 'rgba(255,255,255,0.08)', marginBottom: 14 },
  taskHeaderRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 },
  taskTitle: { color: '#ffffff', fontSize: 16, fontWeight: '700', flex: 1, marginRight: 8 },
  priorityBadge: { paddingHorizontal: 8, paddingVertical: 4, borderRadius: 8 },
  priorityText: { fontSize: 11, fontWeight: '800' },
  taskDescription: { color: '#94a3b8', fontSize: 13, lineHeight: 18, marginBottom: 14 },
  taskFooter: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  dueText: { color: '#64748b', fontSize: 12 },
  statusBtn: { paddingHorizontal: 14, paddingVertical: 8, borderRadius: 10 },
  statusBtnText: { fontSize: 13, fontWeight: '700' }
});
