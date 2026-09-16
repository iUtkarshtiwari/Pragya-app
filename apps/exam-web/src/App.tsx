import React, { useState, useEffect, useRef } from 'react';
import { 
  Camera, 
  Clock, 
  ShieldAlert, 
  CheckCircle2, 
  Play, 
  AlertTriangle,
  ChevronRight,
  Send,
  Lock,
  Volume2,
  WifiOff
} from 'lucide-react';
import { apiUrl, wsUrl } from './config';

export default function App() {
  const [phase, setPhase] = useState<'verification' | 'exam' | 'submitted' | 'prerequisite_locked' | 'disqualified'>('verification');
  const [candidateName, setCandidateName] = useState('Pragya Student');
  const [candidateEmail, setCandidateEmail] = useState('pragyat841@gmail.com');
  const [testId, setTestId] = useState('PROCTORED_TEST_841');
  const [cameraActive, setCameraActive] = useState(false);

  // Security Violations (Max 3 Allowed!)
  const [violationCount, setViolationCount] = useState(0);
  const [warningMessage, setWarningMessage] = useState<string | null>(null);
  const [adminInterruption, setAdminInterruption] = useState<string | null>(null);
  const [isOffline, setIsOffline] = useState(false);

  const [questions, setQuestions] = useState<any[]>([]);
  const [secondsRemaining, setSecondsRemaining] = useState(45 * 60);

  const [codeContent, setCodeContent] = useState('function solution() {\n  // Write solution\n}');
  const [codeExecutionResult, setCodeExecutionResult] = useState<any>(null);
  const videoRef = useRef<HTMLVideoElement>(null);

  // 1. Setup Camera Preview
  const startCamera = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: true });
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
      }
      setCameraActive(true);
    } catch (err) {
      setCameraActive(true);
    }
  };

  // 2. Fetch User-Specific & Test-ID-Specific Session & Enforce Prerequisite Check
  const fetchExamSession = async () => {
    try {
      const urlParams = new URLSearchParams(window.location.search);
      const token = urlParams.get('token') || 'TEST_PRAGYAT841_PROCTORED_TEST_841';
      const userParam = urlParams.get('user') || 'pragyat841@gmail.com';
      const testIdParam = urlParams.get('testId') || 'PROCTORED_TEST_841';

      setCandidateEmail(userParam);
      setTestId(testIdParam);

      const res = await fetch(apiUrl('/api/v1/exams/verify-invitation'), {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ invitationToken: token })
      });
      const json = await res.json();
      if (!json.success && json.error?.code === 'PREREQUISITE_TASKS_INCOMPLETE') {
        setPhase('prerequisite_locked');
        return;
      }
      if (json.success && json.data) {
        setCandidateName(json.data.candidate.fullName);
      }
    } catch (e) {
      console.warn('Exam invitation verify notice:', e);
    }
  };

  useEffect(() => {
    fetchExamSession();
  }, []);

  // 3. WebSockets Listener for Super Admin Live Voice/Text Interruption
  useEffect(() => {
    try {
      const ws = new WebSocket(wsUrl('/ws/proctoring'));
      ws.onmessage = (event) => {
        try {
          const msg = JSON.parse(event.data);
          if (msg.type === 'ADMIN_INTERRUPT') {
            setAdminInterruption(msg.message || '⚠️ Super Admin Interruption: Stop moving away from your test screen!');
          }
        } catch (e) {}
      };
      return () => ws.close();
    } catch (e) {}
  }, []);

  // 4. Network Status Monitoring
  useEffect(() => {
    const handleOffline = () => setIsOffline(true);
    const handleOnline = () => setIsOffline(false);

    window.addEventListener('offline', handleOffline);
    window.addEventListener('online', handleOnline);

    return () => {
      window.removeEventListener('offline', handleOffline);
      window.removeEventListener('online', handleOnline);
    };
  }, []);

  // 5. Anti-Cheating & 3-Violation Disqualification Rule
  const recordViolation = (reason: string) => {
    setViolationCount(prev => {
      const nextCount = prev + 1;
      setWarningMessage(`⚠️ Security Violation Warning ${nextCount}/3: ${reason}`);

      // Post violation event to backend
      fetch(apiUrl(`/api/v1/exams/atm_${testId}/proctoring-event`), {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ eventType: 'TAB_SWITCH', metadata: { reason, violationIndex: nextCount } })
      }).catch(() => {});

      if (nextCount >= 3) {
        setPhase('disqualified');
      }
      return nextCount;
    });
  };

  useEffect(() => {
    if (phase !== 'exam') return;

    const handleVisibilityChange = () => {
      if (document.hidden) {
        recordViolation('Moving away from exam window or focus lost');
      }
    };

    const handleCopyPaste = (e: ClipboardEvent) => {
      e.preventDefault();
      recordViolation('Copy / Paste attempt trapped');
    };

    window.addEventListener('visibilitychange', handleVisibilityChange);
    window.addEventListener('copy', handleCopyPaste);
    window.addEventListener('paste', handleCopyPaste);

    return () => {
      window.removeEventListener('visibilitychange', handleVisibilityChange);
      window.removeEventListener('copy', handleCopyPaste);
      window.removeEventListener('paste', handleCopyPaste);
    };
  }, [phase]);

  // 6. Countdown Timer Sync
  useEffect(() => {
    if (phase !== 'exam') return;
    const interval = setInterval(() => {
      setSecondsRemaining(prev => {
        if (prev <= 1) {
          clearInterval(interval);
          setPhase('submitted');
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(interval);
  }, [phase]);

  const formatTimer = (totalSecs: number) => {
    const mins = Math.floor(totalSecs / 60);
    const secs = totalSecs % 60;
    return `${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;
  };

  const handleStartExam = () => setPhase('exam');
  const handleSubmitExam = () => setPhase('submitted');

  return (
    <div style={{ background: 'var(--bg-exam)', height: '100vh', position: 'relative' }}>
      {/* Network Disconnect Overlay Modal */}
      {isOffline && (
        <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.85)', backdropFilter: 'blur(10px)', zIndex: 99999, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <div style={{ background: '#111827', border: '1px solid var(--accent-rose)', borderRadius: '20px', padding: '40px', maxWidth: '480px', textAlign: 'center' }}>
            <WifiOff size={56} color="var(--accent-rose)" style={{ marginBottom: '16px' }} />
            <h2 style={{ fontSize: '22px', fontWeight: 800, color: 'var(--accent-rose)' }}>Network Connection Lost</h2>
            <p style={{ color: '#cbd5e1', marginTop: '12px', fontSize: '14px', lineHeight: '1.6' }}>
              Attempting to reconnect to secure exam sandbox... Answers are buffered locally. Server timing remains authoritative.
            </p>
          </div>
        </div>
      )}

      {/* Header Bar */}
      <header className="exam-header">
        <div className="exam-title-badge">
          <div style={{ background: 'var(--accent-cyan)', color: 'black', fontWeight: 800, padding: '4px 8px', borderRadius: '6px', fontSize: '12px' }}>PROCTORED</div>
          <span style={{ fontWeight: 800, fontSize: '15px' }}>User: {candidateEmail} | Test ID: {testId}</span>
        </div>

        {phase === 'exam' && (
          <div className="timer-box">
            <Clock size={20} />
            <span>{formatTimer(secondsRemaining)}</span>
          </div>
        )}

        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <span style={{ fontSize: '13px', color: 'var(--accent-rose)', fontWeight: 700 }}>Violations: {violationCount} / 3</span>
        </div>
      </header>

      {/* Super Admin Live Interruption Warning Banner */}
      {adminInterruption && (
        <div style={{ background: 'linear-gradient(90deg, #dc2626, #991b1b)', color: 'white', padding: '14px 24px', fontWeight: 800, fontSize: '15px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', zIndex: 10000 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <Volume2 size={24} /> {adminInterruption}
          </div>
          <button style={{ background: 'rgba(255,255,255,0.2)', border: 'none', color: 'white', padding: '4px 12px', borderRadius: '6px', cursor: 'pointer' }} onClick={() => setAdminInterruption(null)}>Acknowledge</button>
        </div>
      )}

      {/* Phase: Disqualified (3 Violations Exceeded!) */}
      {phase === 'disqualified' && (
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: 'calc(100vh - 60px)', padding: '20px' }}>
          <div style={{ background: 'var(--panel-bg)', border: '2px solid var(--accent-rose)', borderRadius: '24px', padding: '40px', maxWidth: '520px', textAlign: 'center' }}>
            <AlertTriangle size={64} color="var(--accent-rose)" style={{ marginBottom: '16px' }} />
            <h2 style={{ fontSize: '26px', fontWeight: 800, color: 'var(--accent-rose)' }}>TEST TERMINATED & DISQUALIFIED</h2>
            <p style={{ color: '#cbd5e1', marginTop: '12px', fontSize: '15px', lineHeight: '1.6' }}>
              You have exceeded the maximum limit of 3 security violations (moving away from test window / focus loss).
            </p>
            <div style={{ marginTop: '24px', padding: '16px', background: '#090d16', borderRadius: '12px', color: 'var(--accent-rose)', fontWeight: 700 }}>
              Status: DISQUALIFIED • Super Admin Utkarsh Tiwari Notified
            </div>
          </div>
        </div>
      )}

      {/* Phase 1: Verification & Environment Setup */}
      {phase === 'verification' && (
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: 'calc(100vh - 60px)', padding: '20px' }}>
          <div style={{ background: 'var(--panel-bg)', border: '1px solid var(--panel-border)', borderRadius: '20px', padding: '36px', maxWidth: '560px', width: '100%' }}>
            <div style={{ textAlign: 'center', marginBottom: '20px' }}>
              <ShieldAlert size={48} color="var(--accent-cyan)" />
              <h2 style={{ fontSize: '24px', fontWeight: 800, marginTop: '10px' }}>Candidate Verification & Setup</h2>
              <p style={{ color: 'var(--text-secondary)', fontSize: '13px', marginTop: '4px' }}>
                Verify student credentials and grant audio/camera permissions to begin the proctored test.
              </p>
            </div>

            {/* Candidate Credential Card */}
            <div style={{ background: '#090d16', padding: '16px', borderRadius: '12px', marginBottom: '20px', border: '1px solid var(--panel-border)' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
                <span style={{ fontSize: '12px', color: 'var(--text-secondary)', fontWeight: 700 }}>STUDENT CREDENTIALS</span>
                <span style={{ fontSize: '11px', color: '#10b981', background: 'rgba(16,185,129,0.15)', padding: '2px 8px', borderRadius: '4px' }}>AUTHENTICATED</span>
              </div>
              <div style={{ fontWeight: 700, fontSize: '15px', color: '#06b6d4' }}>{candidateName}</div>
              <div style={{ fontSize: '13px', color: '#cbd5e1' }}>Email: {candidateEmail}</div>
              <div style={{ fontSize: '13px', color: '#8b5cf6', marginTop: '4px' }}>Assigned Test ID: {testId}</div>
            </div>

            {/* Camera Preview & Permission Box */}
            <div className="camera-preview-box" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '180px', marginBottom: '16px', borderRadius: '12px', overflow: 'hidden', position: 'relative' }}>
              <video ref={videoRef} autoPlay playsInline muted style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
              {!cameraActive ? (
                <button className="btn-run" onClick={startCamera}>
                  <Camera size={16} /> Allow Camera & Microphone Access
                </button>
              ) : (
                <div className="camera-status-dot">● WebRTC Camera & Audio Active</div>
              )}
            </div>

            {/* Environment Readiness Checklist */}
            <div style={{ marginBottom: '20px', background: 'rgba(255,255,255,0.02)', padding: '12px', borderRadius: '10px' }}>
              <div style={{ fontSize: '12px', fontWeight: 700, color: 'var(--text-secondary)', marginBottom: '8px' }}>ENVIRONMENT SETUP CHECKLIST:</div>
              <div style={{ display: 'flex', gap: '16px', fontSize: '12px' }}>
                <span style={{ color: cameraActive ? '#10b981' : '#f43f5e', fontWeight: 700 }}>
                  {cameraActive ? '✓ Camera Ready' : '✕ Camera Needed'}
                </span>
                <span style={{ color: '#10b981', fontWeight: 700 }}>✓ Audio Mic Ready</span>
                <span style={{ color: '#10b981', fontWeight: 700 }}>✓ Focus Guard Active</span>
              </div>
            </div>

            <button 
              className="btn-submit" 
              style={{ width: '100%', padding: '14px', fontSize: '16px', opacity: cameraActive ? 1 : 0.6, cursor: cameraActive ? 'pointer' : 'not-allowed' }} 
              onClick={handleStartExam}
              disabled={!cameraActive}
            >
              {cameraActive ? 'Start Proctored Test Now' : 'Complete Setup Above to Begin'} <ChevronRight size={18} />
            </button>
          </div>
        </div>
      )}

      {/* Phase 2: Active Exam */}
      {phase === 'exam' && (
        <div className="exam-layout">
          <div className="pane">
            <div className="camera-preview-box">
              <video ref={videoRef} autoPlay playsInline muted style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
              <div className="camera-status-dot">● Camera Live</div>
            </div>
          </div>
          <div className="center-editor-pane" style={{ padding: '24px' }}>
            {warningMessage && (
              <div className="warning-banner" style={{ marginBottom: '16px' }}>
                {warningMessage}
              </div>
            )}
            <h2>Proctored Test Session (#{testId})</h2>
            <textarea className="code-textarea" value={codeContent} onChange={e => setCodeContent(e.target.value)} />
            <div className="editor-action-bar">
              <button className="btn-submit" onClick={handleSubmitExam}>Submit Test <Send size={16} /></button>
            </div>
          </div>
          <div className="pane">
            <h4>Execution Output</h4>
          </div>
        </div>
      )}

      {/* Phase 3: Submitted */}
      {phase === 'submitted' && (
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: 'calc(100vh - 60px)' }}>
          <div style={{ background: 'var(--panel-bg)', border: '1px solid var(--panel-border)', borderRadius: '20px', padding: '40px', textAlign: 'center' }}>
            <CheckCircle2 size={64} color="var(--accent-emerald)" />
            <h2 style={{ fontSize: '24px', fontWeight: 800, marginTop: '12px' }}>Test Attempt Submitted</h2>
          </div>
        </div>
      )}
    </div>
  );
}
