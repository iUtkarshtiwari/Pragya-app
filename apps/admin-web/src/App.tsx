import React, { useState, useEffect } from 'react';
import { 
  CheckCircle2, 
  Clock, 
  AlertTriangle, 
  Users, 
  Plus, 
  Code, 
  ShieldAlert, 
  Activity, 
  UserCheck,
  Send,
  Lock,
  LogOut,
  Volume2,
  Camera,
  FileCode
} from 'lucide-react';

export default function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [adminEmailInput, setAdminEmailInput] = useState('utkarsh@admin.com');
  const [adminPasswordInput, setAdminPasswordInput] = useState('Utkarsh@2005');
  const [loginError, setLoginError] = useState<string | null>(null);

  const [activeTab, setActiveTab] = useState<'dashboard' | 'students' | 'tasks' | 'live' | 'contests'>('dashboard');
  const [showTaskModal, setShowTaskModal] = useState(false);
  const [showCodingModal, setShowCodingModal] = useState(false);
  const [interruptionText, setInterruptionText] = useState('⚠️ Super Admin Warning: Stop moving away from your test screen!');

  // Metrics State
  const [metrics, setMetrics] = useState({
    totalTasks: 1,
    completedTasks: 0,
    pendingTasks: 1,
    overdueTasks: 0,
    completionRatePercent: 0,
    activeExams: 1,
    totalAttempts: 1
  });

  const [taskList, setTaskList] = useState<any[]>([
    {
      id: 'tsk_101',
      title: 'Complete Data Structures & Algorithms Assignment 3',
      description: 'Implement AVL Tree balancing and Graph BFS/DFS traversal in C++.',
      priority: 'HIGH',
      assignedToEmail: 'pragyat841@gmail.com',
      dueAt: 'Tomorrow 06:00 PM',
      status: 'IN_PROGRESS'
    }
  ]);

  const [studentsList, setStudentsList] = useState<any[]>([
    {
      id: 'usr_student_pragya',
      email: 'pragyat841@gmail.com',
      fullName: 'Pragya Student',
      role: 'STUDENT',
      status: 'APPROVED'
    }
  ]);

  const [contestList, setContestList] = useState<any[]>([
    {
      id: 'cnt_2026_dsa',
      title: 'CS301 Data Structures & Algorithms Coding Test',
      description: 'Timed proctored test linked to DS & Algo Assignment 3.',
      associatedTaskId: 'tsk_101',
      durationMinutes: 45,
      starterCode: 'function twoSum(nums, target) {\n  // Write your code here\n}',
      visibleTestCases: [{ input: '[2,7,11,15], 9', expectedOutput: '[0,1]' }],
      hiddenTestCases: [{ input: '[3,2,4], 6', expectedOutput: '[1,2]' }]
    }
  ]);

  const [liveCandidates, setLiveCandidates] = useState<any[]>([
    {
      attemptId: 'atm_TEST_PRAGYAT841_PROCTORED_TEST_841',
      candidateName: 'Pragya Student',
      candidateEmail: 'pragyat841@gmail.com',
      testId: 'PROCTORED_TEST_841',
      assignmentUrl: 'http://localhost:3002/exam?token=TEST_PRAGYAT841_PROCTORED_TEST_841&user=pragyat841%40gmail.com&testId=PROCTORED_TEST_841',
      status: 'IN_PROGRESS',
      startedAt: new Date().toLocaleTimeString(),
      violationCount: 1,
      maxViolations: 3,
      cameraStatus: 'ACTIVE',
      riskLevel: 'REVIEW'
    }
  ]);

  // Modal Inputs
  const [codingTitle, setCodingTitle] = useState('');
  const [codingDesc, setCodingDesc] = useState('');
  const [selectedTaskForTest, setSelectedTaskForTest] = useState('tsk_101');
  const [selectedTaskIdsForTest, setSelectedTaskIdsForTest] = useState<string[]>(['tsk_101']);
  const [starterCodeInput, setStarterCodeInput] = useState('function solution(nums, target) {\n  // Starter code\n}');
  // Dynamic Test Cases State
  const [visibleTestCases, setVisibleTestCases] = useState<{ input: string; expectedOutput: string }[]>([
    { input: '[2,7,11,15], 9', expectedOutput: '[0,1]' }
  ]);
  const [hiddenTestCases, setHiddenTestCases] = useState<{ input: string; expectedOutput: string }[]>([
    { input: '[3,2,4], 6', expectedOutput: '[1,2]' }
  ]);

  const addVisibleTestCase = () => setVisibleTestCases([...visibleTestCases, { input: '', expectedOutput: '' }]);
  const removeVisibleTestCase = (index: number) => setVisibleTestCases(visibleTestCases.filter((_, i) => i !== index));
  const updateVisibleTestCase = (index: number, field: 'input' | 'expectedOutput', value: string) => {
    const updated = [...visibleTestCases];
    updated[index][field] = value;
    setVisibleTestCases(updated);
  };

  const addHiddenTestCase = () => setHiddenTestCases([...hiddenTestCases, { input: '', expectedOutput: '' }]);
  const removeHiddenTestCase = (index: number) => setHiddenTestCases(hiddenTestCases.filter((_, i) => i !== index));
  const updateHiddenTestCase = (index: number, field: 'input' | 'expectedOutput', value: string) => {
    const updated = [...hiddenTestCases];
    updated[index][field] = value;
    setHiddenTestCases(updated);
  };

  const [newTaskTitle, setNewTaskTitle] = useState('');
  const [newTaskPriority, setNewTaskPriority] = useState('HIGH');
  const [newTaskDue, setNewTaskDue] = useState('');
  const [selectedStudentEmails, setSelectedStudentEmails] = useState<string[]>(['pragyat841@gmail.com']);
  const [generatedInvitationUrl, setGeneratedInvitationUrl] = useState('');

  const [ws, setWs] = useState<WebSocket | null>(null);

  // Daily Motivational Thought Manager State
  const [dailyThoughtInput, setDailyThoughtInput] = useState<string>('Consistency is the key to mastering code and achieving excellence every single day.');
  const [dailyThoughtSavedMessage, setDailyThoughtSavedMessage] = useState<string | null>(null);

  useEffect(() => {
    fetchDailyThought();
  }, []);

  const fetchDailyThought = async () => {
    try {
      const res = await fetch('http://localhost:3001/api/v1/dashboard/thought');
      const json = await res.json();
      if (json.success && json.data?.thought) {
        setDailyThoughtInput(json.data.thought);
      }
    } catch (e) {}
  };

  const handleUpdateDailyThought = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await fetch('http://localhost:3001/api/v1/dashboard/thought', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ thought: dailyThoughtInput, author: 'Super Admin Utkarsh Tiwari' })
      });
      const json = await res.json();
      if (json.success) {
        setDailyThoughtSavedMessage('Daily motivational thought published to all student dashboards!');
        setTimeout(() => setDailyThoughtSavedMessage(null), 3000);
      }
    } catch (e) {}
  };

  useEffect(() => {
    try {
      const socket = new WebSocket('ws://localhost:3001/ws/proctoring');
      setWs(socket);
    } catch (e) {}
  }, []);

  const handleAdminLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (adminEmailInput === 'utkarsh@admin.com' && adminPasswordInput === 'Utkarsh@2005') {
      setIsAuthenticated(true);
      fetchDashboardData();
    } else {
      setLoginError('Invalid Super Admin credentials.');
    }
  };

  const fetchDashboardData = async () => {
    try {
      const tasksRes = await fetch('http://localhost:3001/api/v1/tasks');
      const tasksJson = await tasksRes.json();
      if (tasksJson.success && tasksJson.data && tasksJson.data.length > 0) setTaskList(tasksJson.data);

      const studentsRes = await fetch('http://localhost:3001/api/v1/users/students');
      const studentsJson = await studentsRes.json();
      if (studentsJson.success && studentsJson.data && studentsJson.data.length > 0) setStudentsList(studentsJson.data);

      const contestsRes = await fetch('http://localhost:3001/api/v1/contests');
      const contestsJson = await contestsRes.json();
      if (contestsJson.success && contestsJson.data && contestsJson.data.length > 0) setContestList(contestsJson.data);
    } catch (err) {}
  };

  useEffect(() => {
    if (isAuthenticated) fetchDashboardData();
  }, [isAuthenticated]);

  const handleApproveStudent = async (studentId: string) => {
    try {
      await fetch(`http://localhost:3001/api/v1/users/${studentId}/approve`, { method: 'PATCH' });
    } catch (e) {}
    setStudentsList(prev => prev.map(s => s.id === studentId || s._id === studentId ? { ...s, status: 'APPROVED' } : s));
  };

  const handleCreateTask = async (e: React.FormEvent) => {
    e.preventDefault();
    const targetEmails = selectedStudentEmails.length > 0 ? selectedStudentEmails : ['pragyat841@gmail.com'];
    
    const newTasks = targetEmails.map(email => ({
      id: `tsk_${Date.now()}_${Math.random().toString().slice(-4)}`,
      title: newTaskTitle,
      priority: newTaskPriority,
      assignedToEmail: email,
      dueAt: newTaskDue || 'Tomorrow 06:00 PM',
      status: 'NOT_STARTED'
    }));

    setTaskList([...newTasks, ...taskList]);
    setShowTaskModal(false);
    setNewTaskTitle('');

    try {
      await fetch('http://localhost:3001/api/v1/tasks', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: newTaskTitle,
          priority: newTaskPriority,
          dueAt: newTaskDue || new Date(Date.now() + 86400000).toISOString(),
          assignToUserIds: targetEmails
        })
      });
    } catch (err) {}
  };

  const handleCreateCodingAssignment = async (e: React.FormEvent) => {
    e.preventDefault();
    const primaryTaskId = selectedTaskIdsForTest[0] || selectedTaskForTest || 'tsk_101';
    
    const newAssignment = {
      id: `cnt_${Date.now()}`,
      title: codingTitle,
      description: codingDesc,
      associatedTaskId: primaryTaskId,
      associatedTaskIds: selectedTaskIdsForTest,
      durationMinutes: 45,
      starterCode: starterCodeInput,
      visibleTestCases: visibleTestCases.filter(t => t.input.trim() !== ''),
      hiddenTestCases: hiddenTestCases.filter(t => t.input.trim() !== '')
    };

    setContestList([newAssignment, ...contestList]);
    setShowCodingModal(false);
    setCodingTitle('');
    setCodingDesc('');

    try {
      await fetch('http://localhost:3001/api/v1/contests/create-assignment', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newAssignment)
      });
    } catch (e) {}
  };

  const handleSendAdminInterruption = (attemptId: string) => {
    if (ws && ws.readyState === WebSocket.OPEN) {
      ws.send(JSON.stringify({ type: 'ADMIN_INTERRUPT', attemptId, message: interruptionText }));
      alert('Sent Super Admin Live Interruption Warning to candidate screen!');
    } else {
      alert(`Sent Super Admin Warning: "${interruptionText}"`);
    }
  };

  const handleGenerateInvitation = () => {
    const token = `TEST_PRAGYAT841_PROCTORED_TEST_${Math.random().toString().slice(-4)}`;
    const url = `http://localhost:3002/exam?token=${token}&user=pragyat841%40gmail.com&testId=PROCTORED_TEST_${Math.random().toString().slice(-4)}`;
    setGeneratedInvitationUrl(url);
  };

  if (!isAuthenticated) {
    return (
      <div style={{ background: 'var(--bg-dark)', minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '20px' }}>
        <div style={{ background: 'var(--card-bg)', border: '1px solid var(--card-border)', borderRadius: '24px', padding: '40px', maxWidth: '440px', width: '100%' }}>
          <div style={{ textAlign: 'center', marginBottom: '24px' }}>
            <div className="brand-icon" style={{ margin: '0 auto 16px auto', width: '48px', height: '48px' }}>P</div>
            <h2 style={{ fontSize: '24px', fontWeight: 800 }}>Pragya Super Admin Login</h2>
            <p style={{ color: 'var(--text-muted)', fontSize: '13px', marginTop: '6px' }}>
              Sign in as Super Admin to approve student sign-ups, assign tasks, and monitor live proctored tests.
            </p>
          </div>

          {loginError && (
            <div style={{ background: 'rgba(244, 63, 94, 0.15)', border: '1px solid var(--accent-rose)', color: 'var(--accent-rose)', padding: '12px', borderRadius: '10px', fontSize: '13px', marginBottom: '20px' }}>
              ⚠️ {loginError}
            </div>
          )}

          <form onSubmit={handleAdminLogin}>
            <div className="form-group">
              <label>Super Admin Email</label>
              <input type="email" className="form-input" value={adminEmailInput} onChange={e => setAdminEmailInput(e.target.value)} required />
            </div>

            <div className="form-group">
              <label>Password</label>
              <input type="password" className="form-input" value={adminPasswordInput} onChange={e => setAdminPasswordInput(e.target.value)} required />
            </div>

            <button type="submit" className="btn" style={{ width: '100%', padding: '14px', justifyContent: 'center', fontSize: '15px', marginTop: '8px' }}>
              <Lock size={16} /> Authenticate Super Admin
            </button>
          </form>

          <div style={{ marginTop: '20px', padding: '12px', background: 'rgba(255,255,255,0.03)', borderRadius: '10px', fontSize: '12px', color: 'var(--text-muted)', textAlign: 'center' }}>
            Seeded Credentials: <span style={{ color: 'white', fontWeight: 700 }}>utkarsh@admin.com</span> / <span style={{ color: 'white', fontWeight: 700 }}>Utkarsh@2005</span>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="app-container">
      {/* Sidebar */}
      <aside className="sidebar">
        <div className="brand">
          <div className="brand-icon">P</div>
          <div className="brand-name">Pragya Admin</div>
        </div>
        <ul className="nav-list">
          <li className={`nav-item ${activeTab === 'dashboard' ? 'active' : ''}`} onClick={() => setActiveTab('dashboard')}>
            <Activity size={18} /> Dashboard Overview
          </li>
          <li className={`nav-item ${activeTab === 'students' ? 'active' : ''}`} onClick={() => setActiveTab('students')}>
            <UserCheck size={18} /> Student Approvals
          </li>
          <li className={`nav-item ${activeTab === 'tasks' ? 'active' : ''}`} onClick={() => setActiveTab('tasks')}>
            <CheckCircle2 size={18} /> Tasks & Prerequisites
          </li>
          <li className={`nav-item ${activeTab === 'contests' ? 'active' : ''}`} onClick={() => setActiveTab('contests')}>
            <Code size={18} /> Coding Assignment Builder
          </li>
          <li className={`nav-item ${activeTab === 'live' ? 'active' : ''}`} onClick={() => setActiveTab('live')}>
            <ShieldAlert size={18} /> Live Monitoring & Voice
          </li>
        </ul>

        <div style={{ marginTop: 'auto', paddingTop: '20px', borderTop: '1px solid var(--card-border)' }}>
          <button 
            onClick={() => setIsAuthenticated(false)}
            style={{ background: 'transparent', border: '1px solid var(--card-border)', color: 'var(--accent-rose)', width: '100%', padding: '10px', borderRadius: '10px', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', fontWeight: 700, fontSize: '13px' }}
          >
            <LogOut size={16} /> Sign Out
          </button>
        </div>
      </aside>

      {/* Main Content Area */}
      <main className="main-content">
        <header className="header">
          <div className="header-title">
            <h1>Super Admin Operations Portal</h1>
            <p>Utkarsh Tiwari (utkarsh@admin.com) • Real-Time Telemetry, Task Assigner & Test Case Builder</p>
          </div>
          <div className="user-profile">
            <div className="avatar">UT</div>
            <div>
              <div style={{ fontSize: '14px', fontWeight: 700 }}>Utkarsh Tiwari</div>
              <div style={{ fontSize: '11px', color: 'var(--text-muted)' }}>utkarsh@admin.com (Super Admin)</div>
            </div>
          </div>
        </header>

        {/* Tab 1: Dashboard Overview */}
        {activeTab === 'dashboard' && (
          <div>
            <div className="metrics-grid">
              <div className="metric-card">
                <div className="metric-header">
                  <span>TOTAL ASSIGNED TASKS</span>
                  <CheckCircle2 size={18} color="var(--accent-cyan)" />
                </div>
                <div className="metric-value">{taskList.length}</div>
                <div style={{ marginTop: '8px', fontSize: '12px', color: 'var(--text-muted)' }}>
                  Prerequisite Assigned Tasks
                </div>
              </div>

              <div className="metric-card">
                <div className="metric-header">
                  <span>STUDENT APPROVALS</span>
                  <UserCheck size={18} color="var(--accent-emerald)" />
                </div>
                <div className="metric-value">{studentsList.length}</div>
                <div style={{ marginTop: '8px', fontSize: '12px', color: 'var(--text-muted)' }}>
                  Approved Students: <span style={{ color: 'var(--accent-emerald)', fontWeight: 700 }}>{studentsList.filter(s => s.status === 'APPROVED').length}</span>
                </div>
              </div>

              <div className="metric-card">
                <div className="metric-header">
                  <span>ACTIVE PROCTORED EXAMS</span>
                  <Camera size={18} color="var(--accent-violet)" />
                </div>
                <div className="metric-value">{liveCandidates.length}</div>
                <div style={{ marginTop: '8px', fontSize: '12px', color: 'var(--text-muted)' }}>
                  Live WebRTC Candidates
                </div>
              </div>
            </div>

            {/* Daily Motivational Thought Management Card */}
            <div className="data-card" style={{ border: '1px solid rgba(139, 92, 246, 0.4)', background: 'linear-gradient(135deg, rgba(139, 92, 246, 0.08), rgba(6, 182, 212, 0.08))' }}>
              <div className="card-title-bar">
                <div>
                  <h2 style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <span style={{ fontSize: '20px' }}>💡</span> Daily Motivational Thought Manager
                  </h2>
                  <p style={{ fontSize: '12px', color: 'var(--text-muted)', marginTop: '4px' }}>
                    Post a daily motivational quote to inspire students at the top of their mobile dashboard screen.
                  </p>
                </div>
              </div>

              {dailyThoughtSavedMessage && (
                <div style={{ background: 'rgba(16, 185, 129, 0.15)', border: '1px solid var(--accent-emerald)', color: 'var(--accent-emerald)', padding: '10px 14px', borderRadius: '10px', fontSize: '13px', marginBottom: '16px' }}>
                  ✅ {dailyThoughtSavedMessage}
                </div>
              )}

              <form onSubmit={handleUpdateDailyThought} style={{ display: 'flex', gap: '12px', alignItems: 'center', flexWrap: 'wrap' }}>
                <input
                  type="text"
                  className="form-input"
                  style={{ flex: 1, minWidth: '300px' }}
                  placeholder="Enter daily motivational thought for students..."
                  value={dailyThoughtInput}
                  onChange={e => setDailyThoughtInput(e.target.value)}
                  required
                />
                <button type="submit" className="btn btn-secondary" style={{ background: 'linear-gradient(135deg, #8b5cf6, #06b6d4)', color: '#ffffff', fontWeight: 700, padding: '12px 24px' }}>
                  Publish Thought to Mobile App
                </button>
              </form>
            </div>

            {/* Task Assignments Table */}
            <div className="data-card">
              <div className="card-title-bar">
                <h2>Current Task Assignments</h2>
                <button className="btn" onClick={() => setShowTaskModal(true)}>
                  <Plus size={16} /> Assign New Task
                </button>
              </div>

              <table className="custom-table">
                <thead>
                  <tr>
                    <th>Task Title</th>
                    <th>Priority</th>
                    <th>Assigned Student</th>
                    <th>Due Date</th>
                    <th>Status</th>
                  </tr>
                </thead>
                <tbody>
                  {taskList.map((t, idx) => (
                    <tr key={t.id || t._id || idx}>
                      <td style={{ fontWeight: 700 }}>{t.title}</td>
                      <td>
                        <span className={`badge ${t.priority === 'URGENT' || t.priority === 'HIGH' ? 'badge-rose' : 'badge-cyan'}`}>
                          {t.priority}
                        </span>
                      </td>
                      <td>{t.assignedToEmail || 'pragyat841@gmail.com'}</td>
                      <td>{t.dueAt || 'Tomorrow 06:00 PM'}</td>
                      <td>
                        <span className={`badge ${t.status === 'COMPLETED' ? 'badge-emerald' : t.status === 'OVERDUE' ? 'badge-rose' : 'badge-amber'}`}>
                          {t.status}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Live Active Candidates */}
            <div className="data-card">
              <div className="card-title-bar">
                <h2>Real-Time Active Candidate Sessions</h2>
                <button className="btn" onClick={() => setActiveTab('live')}>
                  Open Live Proctoring Monitor
                </button>
              </div>

              <div className="table-responsive">
              <table className="custom-table">
                <thead>
                  <tr>
                    <th>Candidate</th>
                    <th>User-Specific Test URL</th>
                    <th>Started</th>
                    <th>Webcam Stream</th>
                    <th>Violations</th>
                    <th>Risk Level</th>
                  </tr>
                </thead>
                <tbody>
                  {liveCandidates.map(c => (
                    <tr key={c.attemptId}>
                      <td>
                        <div style={{ fontWeight: 700 }}>{c.candidateName}</div>
                        <div style={{ fontSize: '12px', color: 'var(--text-muted)' }}>{c.candidateEmail}</div>
                      </td>
                      <td style={{ fontFamily: 'var(--font-mono)', fontSize: '12px' }}>
                        <a href={c.assignmentUrl} target="_blank" rel="noreferrer" style={{ color: 'var(--accent-cyan)' }}>
                          {c.assignmentUrl}
                        </a>
                      </td>
                      <td style={{ fontFamily: 'var(--font-mono)' }}>{c.startedAt}</td>
                      <td>
                        <span className={`badge ${c.cameraStatus === 'ACTIVE' ? 'badge-emerald' : 'badge-rose'}`}>
                          ● {c.cameraStatus}
                        </span>
                      </td>
                      <td><span className="badge badge-rose">{c.violationCount} / {c.maxViolations}</span></td>
                      <td>
                        <span className={`badge ${c.riskLevel === 'HIGH_RISK' ? 'badge-rose' : 'badge-amber'}`}>
                          {c.riskLevel}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
              </div>
            </div>
          </div>
        )}

        {/* Tab 2: Student Approvals */}
        {activeTab === 'students' && (
          <div className="data-card">
            <div className="card-title-bar">
              <h2>Student Sign-Up Approvals (Super Admin Portal)</h2>
            </div>
            <p style={{ fontSize: '13px', color: 'var(--text-muted)', marginBottom: '20px' }}>
              Only students approved by Super Admin Utkarsh Tiwari can receive task assignments, contest invitations, and take proctored tests.
            </p>

            <div className="table-responsive">
              <table className="custom-table">
              <thead>
                <tr>
                  <th>Student Name</th>
                  <th>Email Address</th>
                  <th>Role</th>
                  <th>Approval Status</th>
                  <th>Super Admin Action</th>
                </tr>
              </thead>
              <tbody>
                {studentsList.map(s => (
                  <tr key={s.id || s._id || s.email}>
                    <td style={{ fontWeight: 700 }}>{s.fullName}</td>
                    <td>{s.email}</td>
                    <td><span className="badge badge-cyan">{s.role}</span></td>
                    <td>
                      <span className={`badge ${s.status === 'APPROVED' ? 'badge-emerald' : 'badge-amber'}`}>
                        ● {s.status || 'APPROVED'}
                      </span>
                    </td>
                    <td>
                      {s.status === 'PENDING_APPROVAL' ? (
                        <button className="btn" style={{ padding: '6px 12px', fontSize: '12px' }} onClick={() => handleApproveStudent(s.id || s._id)}>
                          ✓ Approve Student
                        </button>
                      ) : (
                        <span style={{ fontSize: '12px', color: 'var(--accent-emerald)', fontWeight: 700 }}>✓ Account Active & Approved</span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            </div>
          </div>
        )}

        {/* Tab 3: Tasks & Assignments Management */}
        {activeTab === 'tasks' && (
          <div className="data-card">
            <div className="card-title-bar">
              <h2>Task Assignments Management</h2>
              <button className="btn" onClick={() => setShowTaskModal(true)}>
                <Plus size={16} /> Assign New Task
              </button>
            </div>

            <div className="table-responsive">
              <table className="custom-table">
              <thead>
                <tr>
                  <th>Task Title</th>
                  <th>Priority</th>
                  <th>Assigned Student</th>
                  <th>Due Date</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                {taskList.map((t, idx) => (
                  <tr key={t.id || t._id || idx}>
                    <td style={{ fontWeight: 700 }}>{t.title}</td>
                    <td>
                      <span className={`badge ${t.priority === 'URGENT' || t.priority === 'HIGH' ? 'badge-rose' : 'badge-cyan'}`}>
                        {t.priority}
                      </span>
                    </td>
                    <td>{t.assignedToEmail || 'pragyat841@gmail.com'}</td>
                    <td>{t.dueAt || 'Tomorrow 06:00 PM'}</td>
                    <td>
                      <span className={`badge ${t.status === 'COMPLETED' ? 'badge-emerald' : t.status === 'OVERDUE' ? 'badge-rose' : 'badge-amber'}`}>
                        {t.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            </div>
          </div>
        )}

        {/* Tab 4: Coding Assignment Builder */}
        {activeTab === 'contests' && (
          <div className="data-card">
            <div className="card-title-bar">
              <h2>Coding Contest & Task-Linked Test Case Builder</h2>
              <div style={{ display: 'flex', gap: '12px' }}>
                <button className="btn" style={{ background: 'linear-gradient(135deg, var(--accent-emerald), #059669)' }} onClick={() => setShowCodingModal(true)}>
                  <Plus size={16} /> Create Coding Assignment
                </button>
              </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: '20px' }}>
              {contestList.map(cnt => (
                <div key={cnt.id || cnt._id} style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid var(--card-border)', borderRadius: '16px', padding: '24px' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
                    <h3 style={{ fontSize: '18px', fontWeight: 800 }}>{cnt.title}</h3>
                    <span className="badge badge-cyan">Linked to Task: {cnt.associatedTaskId || 'tsk_101'}</span>
                  </div>

                  <p style={{ fontSize: '14px', color: 'var(--text-muted)', marginBottom: '16px' }}>{cnt.description}</p>

                  <div style={{ background: '#090d16', padding: '16px', borderRadius: '12px', marginBottom: '16px' }}>
                    <div style={{ fontSize: '12px', color: 'var(--text-muted)', marginBottom: '6px' }}>Starter Code:</div>
                    <pre style={{ fontFamily: 'var(--font-mono)', color: '#a7f3d0', fontSize: '13px', margin: 0 }}>{cnt.starterCode}</pre>
                  </div>

                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', fontSize: '13px' }}>
                    <div style={{ background: 'rgba(16, 185, 129, 0.1)', border: '1px solid rgba(16, 185, 129, 0.3)', padding: '12px', borderRadius: '10px' }}>
                      <div style={{ fontWeight: 700, color: 'var(--accent-emerald)', marginBottom: '4px' }}>✓ Visible Test Case:</div>
                      <div>Input: <code style={{ color: 'white' }}>{cnt.visibleTestCases?.[0]?.input || '[2,7,11,15], 9'}</code></div>
                      <div>Expected Output: <code style={{ color: 'white' }}>{cnt.visibleTestCases?.[0]?.expectedOutput || '[0,1]'}</code></div>
                    </div>

                    <div style={{ background: 'rgba(244, 63, 94, 0.1)', border: '1px solid rgba(244, 63, 94, 0.3)', padding: '12px', borderRadius: '10px' }}>
                      <div style={{ fontWeight: 700, color: 'var(--accent-rose)', marginBottom: '4px' }}>🔒 Hidden Test Case (Server Evaluated):</div>
                      <div>Input: <code style={{ color: 'white' }}>{cnt.hiddenTestCases?.[0]?.input || '[3,2,4], 6'}</code></div>
                      <div>Expected Output: <code style={{ color: 'white' }}>{cnt.hiddenTestCases?.[0]?.expectedOutput || '[1,2]'}</code></div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Tab 5: Live Proctoring & Voice Interruption */}
        {activeTab === 'live' && (
          <div className="data-card">
            <div className="card-title-bar">
              <h2>Proctoring Security & Candidate Telemetry Monitor</h2>
              <span className="badge badge-emerald">WebSockets Connected</span>
            </div>

            {liveCandidates.map(cand => (
              <div key={cand.attemptId} style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid var(--card-border)', borderRadius: '16px', padding: '20px', marginBottom: '20px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
                  <div>
                    <span style={{ fontWeight: 800, fontSize: '18px' }}>{cand.candidateName}</span>
                    <span style={{ marginLeft: '12px', fontSize: '13px', color: 'var(--text-muted)' }}>({cand.candidateEmail})</span>
                  </div>
                  <span className="badge badge-rose">Violations: {cand.violationCount} / {cand.maxViolations}</span>
                </div>

                <div style={{ background: '#090d16', padding: '12px', borderRadius: '10px', marginBottom: '16px', fontFamily: 'var(--font-mono)', fontSize: '12px' }}>
                  <span style={{ color: 'var(--text-muted)' }}>User-Specific & Test-ID-Specific Link:</span>
                  <div style={{ color: 'var(--accent-cyan)', wordBreak: 'break-all', marginTop: '4px' }}>
                    <a href={cand.assignmentUrl} target="_blank" rel="noreferrer" style={{ color: 'var(--accent-cyan)' }}>
                      {cand.assignmentUrl}
                    </a>
                  </div>
                </div>

                {/* Super Admin Live Interruption Controls */}
                <div style={{ background: 'rgba(239, 68, 68, 0.1)', border: '1px solid var(--accent-rose)', padding: '16px', borderRadius: '12px' }}>
                  <div style={{ fontWeight: 800, color: 'var(--accent-rose)', fontSize: '14px', marginBottom: '8px', display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <Volume2 size={16} /> Super Admin Live Voice / Text Interruption Control
                  </div>

                  <div style={{ display: 'flex', gap: '12px' }}>
                    <input 
                      type="text" 
                      className="form-input" 
                      value={interruptionText} 
                      onChange={e => setInterruptionText(e.target.value)}
                      style={{ flex: 1 }}
                    />
                    <button className="btn" style={{ background: 'linear-gradient(135deg, var(--accent-rose), #dc2626)' }} onClick={() => handleSendAdminInterruption(cand.attemptId)}>
                      <Volume2 size={16} /> Interrupt Candidate Screen
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </main>

      {/* Task Creation Modal */}
      {showTaskModal && (
        <div className="modal-overlay">
          <div className="modal-card">
            <h2 style={{ fontSize: '20px', marginBottom: '20px' }}>Assign New Task to Approved Student</h2>
            <form onSubmit={handleCreateTask}>
              <div className="form-group">
                <label>Task Title</label>
                <input type="text" className="form-input" placeholder="e.g. Implement AVL Tree in C++" value={newTaskTitle} onChange={e => setNewTaskTitle(e.target.value)} required />
              </div>

              <div className="form-group">
                <label>Priority Level</label>
                <select className="form-select" value={newTaskPriority} onChange={e => setNewTaskPriority(e.target.value)}>
                  <option value="LOW">LOW</option>
                  <option value="MEDIUM">MEDIUM</option>
                  <option value="HIGH">HIGH</option>
                  <option value="URGENT">URGENT</option>
                </select>
              </div>

              <div className="form-group">
                <label>Assign to Approved Student(s) [Multi-Select Supported]</label>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', maxHeight: '130px', overflowY: 'auto', background: 'rgba(255,255,255,0.03)', padding: '10px', borderRadius: '8px', border: '1px solid var(--card-border)' }}>
                  {studentsList.filter(s => s.status === 'APPROVED').map(s => (
                    <label key={s.email} style={{ display: 'flex', alignItems: 'center', gap: '10px', fontSize: '13px', cursor: 'pointer' }}>
                      <input 
                        type="checkbox" 
                        checked={selectedStudentEmails.includes(s.email)}
                        onChange={(e) => {
                          if (e.target.checked) {
                            setSelectedStudentEmails([...selectedStudentEmails, s.email]);
                          } else {
                            setSelectedStudentEmails(selectedStudentEmails.filter(email => email !== s.email));
                          }
                        }}
                      />
                      <span>{s.fullName} ({s.email}) — <code style={{ color: 'var(--accent-cyan)' }}>{s.userUniqueCode || `STU-${s.email.split('@')[0].toUpperCase()}-841`}</code></span>
                    </label>
                  ))}
                </div>

                {/* Selected Students Visual Tags Display */}
                <div style={{ marginTop: '10px', display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
                  <span style={{ fontSize: '12px', color: 'var(--text-muted)', width: '100%', marginBottom: '2px' }}>Selected Students ({selectedStudentEmails.length}):</span>
                  {selectedStudentEmails.map(email => {
                    const student = studentsList.find(s => s.email === email);
                    const code = student?.userUniqueCode || `STU-${email.split('@')[0].toUpperCase()}-841`;
                    return (
                      <span key={email} style={{ background: 'rgba(6,182,212,0.15)', border: '1px solid var(--accent-cyan)', color: 'var(--accent-cyan)', padding: '4px 10px', borderRadius: '16px', fontSize: '12px', fontWeight: 700 }}>
                        {student?.fullName || email} ({code})
                      </span>
                    );
                  })}
                </div>
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '12px', marginTop: '24px' }}>
                <button type="button" className="btn" style={{ background: 'transparent', border: '1px solid var(--card-border)' }} onClick={() => setShowTaskModal(false)}>
                  Cancel
                </button>
                <button type="submit" className="btn">Assign Task to Group</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Coding Assignment Modal */}
      {showCodingModal && (
        <div className="modal-overlay">
          <div className="modal-card" style={{ maxWidth: '720px', maxHeight: '90vh', overflowY: 'auto' }}>
            <h2 style={{ fontSize: '20px', marginBottom: '20px' }}>Create Coding Assignment & Dynamic Test Cases</h2>
            <form onSubmit={handleCreateCodingAssignment}>
              <div className="form-group">
                <label>Select Associated Prerequisite Tasks [Multi-Task Linkage]</label>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', maxHeight: '130px', overflowY: 'auto', background: 'rgba(255,255,255,0.03)', padding: '10px', borderRadius: '8px', border: '1px solid var(--card-border)' }}>
                  {taskList.map(t => (
                    <label key={t.id || t._id} style={{ display: 'flex', alignItems: 'center', gap: '10px', fontSize: '13px', cursor: 'pointer' }}>
                      <input 
                        type="checkbox" 
                        checked={selectedTaskIdsForTest.includes(t.id || t._id)}
                        onChange={(e) => {
                          const taskId = t.id || t._id;
                          if (e.target.checked) {
                            setSelectedTaskIdsForTest([...selectedTaskIdsForTest, taskId]);
                          } else {
                            setSelectedTaskIdsForTest(selectedTaskIdsForTest.filter(id => id !== taskId));
                          }
                        }}
                      />
                      <span>{t.title} (Assigned To: {t.assignedToEmail || 'pragyat841@gmail.com'})</span>
                    </label>
                  ))}
                </div>
              </div>

              <div className="form-group">
                <label>Assignment / Test Title</label>
                <input type="text" className="form-input" placeholder="e.g. AVL Tree & Two Sum Algorithm Test" value={codingTitle} onChange={e => setCodingTitle(e.target.value)} required />
              </div>

              <div className="form-group">
                <label>Problem Statement / Description</label>
                <textarea className="form-textarea" rows={3} placeholder="Given an array of integers nums and target, return indices..." value={codingDesc} onChange={e => setCodingDesc(e.target.value)} required />
              </div>

              <div className="form-group">
                <label>Starter / Boilerplate Code</label>
                <textarea className="form-textarea" rows={3} style={{ fontFamily: 'var(--font-mono)' }} value={starterCodeInput} onChange={e => setStarterCodeInput(e.target.value)} required />
              </div>

              {/* Dynamic Visible Test Cases */}
              <div style={{ marginBottom: '16px', background: 'rgba(255,255,255,0.03)', padding: '16px', borderRadius: '12px', border: '1px solid var(--card-border)' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
                  <label style={{ fontWeight: 700, color: 'var(--accent-cyan)' }}>Visible Test Cases (Candidate UI)</label>
                  <button type="button" className="btn" style={{ padding: '4px 10px', fontSize: '12px', background: 'rgba(6,182,212,0.2)', color: 'var(--accent-cyan)' }} onClick={addVisibleTestCase}>
                    + Add Test Case
                  </button>
                </div>
                {visibleTestCases.map((tc, idx) => (
                  <div key={idx} style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 40px', gap: '10px', marginBottom: '10px' }}>
                    <input type="text" className="form-input" placeholder="Input (e.g. [2,7,11,15], 9)" value={tc.input} onChange={e => updateVisibleTestCase(idx, 'input', e.target.value)} required />
                    <input type="text" className="form-input" placeholder="Expected Output (e.g. [0,1])" value={tc.expectedOutput} onChange={e => updateVisibleTestCase(idx, 'expectedOutput', e.target.value)} required />
                    {visibleTestCases.length > 1 && (
                      <button type="button" style={{ background: 'rgba(244,63,94,0.2)', border: 'none', color: '#f43f5e', borderRadius: '8px', cursor: 'pointer' }} onClick={() => removeVisibleTestCase(idx)}>
                        ✕
                      </button>
                    )}
                  </div>
                ))}
              </div>

              {/* Dynamic Hidden Test Cases */}
              <div style={{ marginBottom: '16px', background: 'rgba(255,255,255,0.03)', padding: '16px', borderRadius: '12px', border: '1px solid var(--card-border)' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
                  <label style={{ fontWeight: 700, color: 'var(--accent-violet)' }}>Hidden Test Cases (Validation Evaluation)</label>
                  <button type="button" className="btn" style={{ padding: '4px 10px', fontSize: '12px', background: 'rgba(139,92,246,0.2)', color: 'var(--accent-violet)' }} onClick={addHiddenTestCase}>
                    + Add Hidden Case
                  </button>
                </div>
                {hiddenTestCases.map((tc, idx) => (
                  <div key={idx} style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 40px', gap: '10px', marginBottom: '10px' }}>
                    <input type="text" className="form-input" placeholder="Input (e.g. [3,2,4], 6)" value={tc.input} onChange={e => updateHiddenTestCase(idx, 'input', e.target.value)} required />
                    <input type="text" className="form-input" placeholder="Expected Output (e.g. [1,2])" value={tc.expectedOutput} onChange={e => updateHiddenTestCase(idx, 'expectedOutput', e.target.value)} required />
                    {hiddenTestCases.length > 1 && (
                      <button type="button" style={{ background: 'rgba(244,63,94,0.2)', border: 'none', color: '#f43f5e', borderRadius: '8px', cursor: 'pointer' }} onClick={() => removeHiddenTestCase(idx)}>
                        ✕
                      </button>
                    )}
                  </div>
                ))}
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '12px', marginTop: '24px' }}>
                <button type="button" className="btn" style={{ background: 'transparent', border: '1px solid var(--card-border)' }} onClick={() => setShowCodingModal(false)}>
                  Cancel
                </button>
                <button type="submit" className="btn">Publish Coding Assignment</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
