// server2.js
import express from 'express';
import { MongoClient } from 'mongodb';
import cors from "cors";

const app = express();
app.use(express.json());
app.use(cors());
// Direct MongoDB URI (replace <username>, <password>, <cluster-url> properly)
const uri = 'mongodb+srv://chaitraligharge_db_user:C2HKWO71Zwjmu30z@learnsphere.vl6vxo4.mongodb.net/?retryWrites=true&w=majority&appName=LearnSphere';

// MongoDB setup
const client = new MongoClient(uri);
let db;

async function connectDB() {
  try {
    await client.connect();
    db = client.db('test'); // ✅ database name shown in your screenshot
    console.log('✅ Connected to MongoDB (test database)');
  } catch (err) {
    console.error('❌ MongoDB Connection Error:', err);
    process.exit(1);
  }
}
connectDB();


// ====================== 📘 STUDYMATERIALS ROUTES ======================

// Get all study materials
app.get('/api/studymaterials', async (req, res) => {
  try {
    const materials = await db.collection('studymaterials').find({}).toArray();
    res.status(200).json(materials);
  } catch (err) {
    console.error('❌ Error fetching study materials:', err);
    res.status(500).json({ message: 'Error fetching study materials' });
  }
});

// Add new study material
app.post('/api/studymaterials', async (req, res) => {
  try {
    const newMaterial = req.body;
    const result = await db.collection('studymaterials').insertOne(newMaterial);
    res.status(201).json({ insertedId: result.insertedId });
  } catch (err) {
    console.error('❌ Error inserting study material:', err);
    res.status(500).json({ message: 'Error inserting study material' });
  }
});


// ====================== 👤 USERS ROUTES ======================

// Get all users
app.get('/api/users', async (req, res) => {
  try {
    const users = await db.collection('users').find({}).toArray();
    res.status(200).json(users);
  } catch (err) {
    console.error('❌ Error fetching users:', err);
    res.status(500).json({ message: 'Error fetching users' });
  }
});

// Add new user
app.post('/api/users', async (req, res) => {
  try {
    const newUser = req.body;
    const result = await db.collection('users').insertOne(newUser);
    res.status(201).json({ insertedId: result.insertedId });
  } catch (err) {
    console.error('❌ Error inserting user:', err);
    res.status(500).json({ message: 'Error inserting user' });
  }
});


// ====================== 🚀 START SERVER ======================
const PORT = 5001;
app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
});
