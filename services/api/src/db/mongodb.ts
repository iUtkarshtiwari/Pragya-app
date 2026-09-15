import mongoose from 'mongoose';

export async function connectMongoDB(): Promise<boolean> {
  const mongoUri = process.env.MONGODB_URI;

  if (!mongoUri) {
    console.error('Missing MONGODB_URI environment variable. Set it in your local .env file before starting the API.');
    return false;
  }

  try {
    console.log(`🔌 Connecting to MongoDB Atlas cluster...`);
    await mongoose.connect(mongoUri, { serverSelectionTimeoutMS: 5000 });
    console.log('🎉 CONNECTED TO MONGODB ATLAS!');
    await seedRequiredUsersAndTasks();
    return true;
  } catch (err: any) {
    console.warn(`⚠️ MongoDB Atlas Notice: ${err.message}.`);
    return false;
  }
}

// 1. User Schema
const UserSchema = new mongoose.Schema({
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  fullName: { type: String, required: true },
  userUniqueCode: { type: String }, // e.g. STU-PRAGYA-841
  role: { type: String, enum: ['SUPER_ADMIN', 'ADMIN', 'STUDENT'], default: 'STUDENT' },
  status: { type: String, enum: ['PENDING_APPROVAL', 'APPROVED', 'REJECTED'], default: 'PENDING_APPROVAL' },
  createdAt: { type: Date, default: Date.now }
});

// 2. Task Schema
const TaskSchema = new mongoose.Schema({
  title: { type: String, required: true },
  description: { type: String },
  priority: { type: String, enum: ['LOW', 'MEDIUM', 'HIGH', 'URGENT'], default: 'MEDIUM' },
  createdById: { type: String, required: true },
  assignedToEmail: { type: String, default: 'pragyat841@gmail.com' },
  dueAt: { type: Date, required: true },
  estimatedDurationMinutes: { type: Number, default: 60 },
  status: { type: String, enum: ['NOT_STARTED', 'IN_PROGRESS', 'COMPLETED', 'OVERDUE', 'CANCELLED'], default: 'NOT_STARTED' },
  createdAt: { type: Date, default: Date.now }
});

// 3. Coding Assignment / Contest Schema (with Task ID linkage, starter code, test cases)
const ContestSchema = new mongoose.Schema({
  title: { type: String, required: true },
  description: { type: String },
  associatedTaskId: { type: String },
  durationMinutes: { type: Number, default: 45 },
  passingScore: { type: Number, default: 30 },
  starterCode: { type: String, default: 'function solution() {\n  // Starter code\n}' },
  visibleTestCases: [
    { input: String, expectedOutput: String, explanation: String }
  ],
  hiddenTestCases: [
    { input: String, expectedOutput: String }
  ],
  cpuLimitMs: { type: Number, default: 2000 },
  memoryLimitMb: { type: Number, default: 256 },
  proctoringConfig: { type: Object, default: {} },
  questions: { type: Array, default: [] },
  createdAt: { type: Date, default: Date.now }
});

export const UserModel = mongoose.models.User || mongoose.model('User', UserSchema);
export const TaskModel = mongoose.models.Task || mongoose.model('Task', TaskSchema);
export const ContestModel = mongoose.models.Contest || mongoose.model('Contest', ContestSchema);

async function seedRequiredUsersAndTasks() {
  try {
    const superAdminEmail = 'utkarsh@admin.com';
    const studentEmail = 'pragyat841@gmail.com';

    if (mongoose.connection.readyState === 1) {
      await UserModel.findOneAndUpdate(
        { email: superAdminEmail },
        { email: superAdminEmail, password: 'Utkarsh@2005', fullName: 'Utkarsh Tiwari (Super Admin)', role: 'SUPER_ADMIN', status: 'APPROVED' },
        { upsert: true, new: true }
      );

      await UserModel.findOneAndUpdate(
        { email: studentEmail },
        { email: studentEmail, password: 'Pragya@2008', fullName: 'Pragya Student', role: 'STUDENT', status: 'APPROVED' },
        { upsert: true, new: true }
      );
    }
  } catch (err: any) {
    console.error('Seeding notice:', err.message);
  }
}
