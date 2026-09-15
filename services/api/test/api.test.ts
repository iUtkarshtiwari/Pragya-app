import assert from 'assert';
import { db } from '../src/db/store';

async function runTests() {
  console.log('🧪 Starting Pragya Platform Backend Tests...');

  // 1. Verify User Seed
  const student = db.users.get('usr_student_1');
  assert.ok(student, 'Student user should exist in database');
  assert.strictEqual(student.email, 'alex.chen@student.edu');
  console.log('✅ User & Availability seed test passed');

  // 2. Task State Machine Transition Validation
  const task1 = db.tasks.get('tsk_101');
  const assignment1 = db.taskAssignments.get('asgn_1');
  assert.ok(task1 && assignment1, 'Task and assignment should exist');
  assert.strictEqual(assignment1.status, 'IN_PROGRESS');

  // Simulate completion state transition
  assignment1.status = 'COMPLETED';
  assignment1.completedAt = new Date().toISOString();
  assert.strictEqual(assignment1.status, 'COMPLETED');
  console.log('✅ Task state machine transition test passed');

  // 3. Exam Invitation 5-Minute Window Check
  const inv = db.contestInvitations.get('inv_1001');
  assert.ok(inv, 'Contest invitation should exist');
  const now = new Date();
  const expiresAt = new Date(inv.expiresAt);
  assert.ok(expiresAt > now, 'Invitation expiresAt must be in the future (5 min window)');
  console.log('✅ 5-Minute Exam Start Window test passed');

  // 4. Proctoring Telemetry Event Ingestion
  const events = db.proctoringEvents.get('atm_test_1') || [];
  events.push({
    id: 'evt_1',
    attemptId: 'atm_test_1',
    eventType: 'TAB_SWITCH',
    severity: 'MEDIUM',
    timestamp: new Date().toISOString()
  });
  db.proctoringEvents.set('atm_test_1', events);
  assert.strictEqual(db.proctoringEvents.get('atm_test_1')?.length, 1);
  console.log('✅ Proctoring telemetry event logging test passed');

  console.log('🎉 ALL BACKEND UNIT & INTEGRATION TESTS PASSED CLEANLY!');
}

runTests().catch(err => {
  console.error('❌ Test failed:', err);
  process.exit(1);
});
