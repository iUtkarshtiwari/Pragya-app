import mongoose from 'mongoose';

const mongoUri = process.env.MONGODB_URI;

if (!mongoUri) {
  throw new Error('Missing MONGODB_URI environment variable. Set it in your local .env file before running the seeding script.');
}

async function runDirectSeeding() {
  console.log(`🔌 Running Seeding Script against MongoDB Atlas...`);

  try {
    await mongoose.connect(mongoUri, { serverSelectionTimeoutMS: 5000 });
    console.log('🎉 CONNECTED TO MONGODB ATLAS!');

    const db = mongoose.connection.db;

    // 1. Ensure Super Admin (utkarsh@admin.com) -> APPROVED
    await db.collection('users').updateOne(
      { email: 'utkarsh@admin.com' },
      {
        $set: {
          email: 'utkarsh@admin.com',
          password: 'Utkarsh@2005',
          fullName: 'Utkarsh Tiwari (Super Admin)',
          role: 'SUPER_ADMIN',
          status: 'APPROVED',
          createdAt: new Date()
        }
      },
      { upsert: true }
    );

    // 2. Ensure Student (pragyat841@gmail.com) -> APPROVED
    await db.collection('users').updateOne(
      { email: 'pragyat841@gmail.com' },
      {
        $set: {
          email: 'pragyat841@gmail.com',
          password: 'Pragya@2008',
          fullName: 'Pragya Student',
          role: 'STUDENT',
          status: 'APPROVED',
          createdAt: new Date()
        }
      },
      { upsert: true }
    );

    // 3. Seed initial Task for pragyat841@gmail.com
    await db.collection('tasks').updateOne(
      { title: 'Complete Data Structures & Algorithms Assignment 3' },
      {
        $set: {
          title: 'Complete Data Structures & Algorithms Assignment 3',
          description: 'Implement AVL Tree balancing and Graph BFS/DFS traversal in C++.',
          priority: 'HIGH',
          createdById: 'utkarsh@admin.com',
          assignedToEmail: 'pragyat841@gmail.com',
          dueAt: new Date(Date.now() + 86400000),
          estimatedDurationMinutes: 120,
          status: 'IN_PROGRESS',
          createdAt: new Date()
        }
      },
      { upsert: true }
    );

    console.log('✅ MongoDB Atlas Seeded with Approved Super Admin, Approved Student, and Initial Assigned Task!');
    await mongoose.disconnect();
    process.exit(0);
  } catch (err: any) {
    console.error('❌ Seeding failed:', err.message);
    process.exit(1);
  }
}

runDirectSeeding();
