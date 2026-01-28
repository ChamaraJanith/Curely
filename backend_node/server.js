require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const multer = require('multer');
const pdf = require('pdf-parse');
const fs = require('fs');
const path = require('path');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { OAuth2Client } = require('google-auth-library');

const app = express();
const PORT = process.env.PORT || 3000;
const JWT_SECRET = process.env.JWT_SECRET || 'fallback_secret';
const GOOGLE_CLIENT_ID = process.env.GOOGLE_CLIENT_ID;
const client = new OAuth2Client(GOOGLE_CLIENT_ID);


// Middleware
app.use(cors());
app.use(express.json());

// MongoDB Connection
const uri = process.env.MONGO_URI;
mongoose.connect(uri, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
  serverSelectionTimeoutMS: 5000,
})
  .then(() => console.log('✅ MongoDB Connected Successfully'))
  .catch(err => console.error('❌ MongoDB Connection Error:', err.message));

// Schemas
const UserSchema = new mongoose.Schema({
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true }
});

const ReportSchema = new mongoose.Schema({
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    filename: String,
    uploadedAt: { type: Date, default: Date.now },
    data: {
        glucose: Number,
        systolic: Number,
        diastolic: Number
    }
});

const User = mongoose.model('User', UserSchema);
const Report = mongoose.model('Report', ReportSchema);

// Multer Setup
const upload = multer({ dest: 'uploads/' });

// Auth Middleware
const authenticateToken = (req, res, next) => {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];

    if (!token) return res.status(401).json({ error: 'Access denied. No token provided.' });

    jwt.verify(token, JWT_SECRET, (err, user) => {
        if (err) return res.status(403).json({ error: 'Invalid token.' });
        req.user = user;
        next();
    });
};

// PDF Extract Function
const extractMedicalData = async (buffer) => {
    let data;
    try {
        data = await pdf(buffer);
    } catch (err) {
        throw new Error('Failed to parse PDF');
    }
    const text = data.text;
    
    // Improved Regex
    const glucoseMatch = text.match(/(?:Glucose|Sugar|Blood Sugar|Fasting Blood Sugar|RBS)[\s\:\-]+(\d+)/i);
    const bpMatch = text.match(/(\d{2,3})\s*\/\s*(\d{2,3})/); 
    const systolicMatch = text.match(/(?:Systolic|Sys)[\s\:\-]+(\d+)/i);
    const diastolicMatch = text.match(/(?:Diastolic|Dia)[\s\:\-]+(\d+)/i);

    let systolic = systolicMatch ? parseInt(systolicMatch[1]) : 0;
    let diastolic = diastolicMatch ? parseInt(diastolicMatch[1]) : 0;

    if (bpMatch) {
       systolic = parseInt(bpMatch[1]);
       diastolic = parseInt(bpMatch[2]);
    }

    return {
        glucose: glucoseMatch ? parseInt(glucoseMatch[1]) : 0,
        systolic,
        diastolic
    };
};

// --- ROUTES ---

// Auth Routes
app.post('/register', async (req, res) => {
    try {
        const { name, email, password } = req.body;
        const hashedPassword = await bcrypt.hash(password, 10);
        const user = new User({ name, email, password: hashedPassword });
        await user.save();
        res.status(201).json({ message: 'User registered successfully' });
    } catch (error) {
        res.status(400).json({ error: 'Registration failed', details: error.message });
    }
});

app.post('/google-login', async (req, res) => {
    try {
        const { token: idToken } = req.body;
        console.log('--- Google Login Debug ---');
        console.log('Configured Client ID:', GOOGLE_CLIENT_ID);
        console.log('Received Token (first 20 chars):', idToken?.substring(0, 20));
        
        console.log('Step 1: Attempting to verify token...');
        const ticket = await client.verifyIdToken({
            idToken,
            audience: GOOGLE_CLIENT_ID
        });
        const payload = ticket.getPayload();
        const { email, name } = payload;
        console.log('Step 2: Token verified for:', email);

        let user = await User.findOne({ email });
        
        if (!user) {
            console.log('Step 3: Creating new user...');
            const dummyPassword = await bcrypt.hash(Math.random().toString(36), 10);
            user = new User({ name, email, password: dummyPassword });
            await user.save();
            console.log('Step 4: New user saved.');
        } else {
            console.log('Step 3: Existing user found.');
        }

        const token = jwt.sign({ id: user._id, name: user.name }, JWT_SECRET, { expiresIn: '7d' });
        console.log('Step 5: JWT generated. Sending response.');
        res.json({ token, user: { id: user._id, name: user.name, email: user.email } });
    } catch (error) {
        console.error('--- Google Login Error ---');
        console.error('Error Code:', error.code || 'N/A');
        console.error('Message:', error.message);
        console.error(error.stack);
        res.status(500).json({ error: 'Google authentication failed', details: error.message });
    }
});

app.post('/login', async (req, res) => {

    try {
        const { email, password } = req.body;
        const user = await User.findOne({ email });
        if (!user) return res.status(400).json({ error: 'User not found' });

        const validPassword = await bcrypt.compare(password, user.password);
        if (!validPassword) return res.status(400).json({ error: 'Invalid password' });

        const token = jwt.sign({ id: user._id, name: user.name }, JWT_SECRET, { expiresIn: '7d' });
        res.json({ token, user: { id: user._id, name: user.name, email: user.email } });
    } catch (error) {
        res.status(500).json({ error: 'Login failed' });
    }
});

// Protected Report Routes
app.post('/upload', authenticateToken, upload.single('file'), async (req, res) => {
    try {
        if (!req.file) return res.status(400).json({ error: 'No file uploaded' });

        const filePath = req.file.path;
        const dataBuffer = fs.readFileSync(filePath);
        const medicalData = await extractMedicalData(dataBuffer);
        fs.unlinkSync(filePath);

        const newReport = new Report({
            userId: req.user.id,
            filename: req.file.originalname,
            data: medicalData
        });

        await newReport.save();
        res.json({ message: 'Report processed successfully', report: newReport });
    } catch (error) {
        res.status(500).json({ error: 'Failed to process report', details: error.message });
    }
});

app.get('/reports', authenticateToken, async (req, res) => {
    try {
        const reports = await Report.find({ userId: req.user.id }).sort({ uploadedAt: 1 });
        res.json(reports);
    } catch (error) {
        res.status(500).json({ error: 'Failed to fetch reports' });
    }
});

app.listen(PORT, () => console.log(`🚀 Server running on http://localhost:${PORT}`));
