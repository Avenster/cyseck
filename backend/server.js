require('dotenv').config();
const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const jwt = require('jsonwebtoken');
const nodemailer = require('nodemailer');

const app = express();
const PORT = 3000;
const JWT_SECRET = process.env.JWT_SECRET || 'super_secret_challenge_key';

app.use(cors());
app.use(bodyParser.json());
const users = [
    { id: 1, email: 'ankurkaushl13@gmail.com', name: 'Ankur Kaushal', password: 'Ankur@123' }
];

const otpStore = {};

const blockStore = {};

const OTP_EXPIRY_MS = 10 * 60 * 1000;
const BLOCK_DURATION_MS = 10 * 60 * 1000;
const MAX_ATTEMPTS = 3;

const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
        user: process.env.EMAIL_USER, 
        pass: process.env.EMAIL_PASS  
    }
});

const generateOTP = () => Math.floor(100000 + Math.random() * 900000).toString();

const isBlocked = (email) => {
    const record = blockStore[email];
    if (!record) return false;
    if (record.blockExpiresAt && new Date() < record.blockExpiresAt) {
        return true;
    }
    return false;
};

app.post('/auth/request-otp', async (req, res) => {
    const { email } = req.body;

    if (!email) return res.status(400).json({ message: 'Email is required' });

    const user = users.find(u => u.email === email);
    if (!user) {
        return res.status(404).json({ message: 'User not found' });
    }
    if (isBlocked(email)) {
        const timeLeft = Math.ceil((blockStore[email].blockExpiresAt - new Date()) / 60000);
        return res.status(429).json({ message: `Account blocked. Try again in ${timeLeft} minutes.` });
    }

    const otp = generateOTP();
    otpStore[email] = {
        code: otp,
        expiresAt: new Date(Date.now() + OTP_EXPIRY_MS)
    };

    console.log(`[DEBUG] Generated OTP for ${email}: ${otp}`);

    try {
        if (process.env.EMAIL_USER && process.env.EMAIL_PASS) {
            await transporter.sendMail({
                from: process.env.EMAIL_USER,
                to: email,
                subject: 'Your Login OTP',
                text: `Your OTP is: ${otp}. It expires in 10 minutes.`
            });
            console.log(`[MAIL] Sent to ${email}`);
        } else {
            console.log(`[MOCK EMAIL] To: ${email} | Subject: Your OTP | Body: ${otp}`);
        }
        res.json({ message: 'OTP sent successfully' });
    } catch (error) {
        console.error('Email error:', error);
        res.status(500).json({ message: 'Failed to send OTP' });
    }
});

app.post('/auth/verify-otp', (req, res) => {
    const { email, otp } = req.body;

    if (!email || !otp) return res.status(400).json({ message: 'Email and OTP required' });

    if (isBlocked(email)) {
        return res.status(429).json({ message: 'Account blocked due to too many failed attempts.' });
    }

    const storedOtpData = otpStore[email];

    if (!storedOtpData) {
        return res.status(400).json({ message: 'No OTP requested or OTP expired' });
    }

    if (new Date() > storedOtpData.expiresAt) {
        delete otpStore[email];
        return res.status(400).json({ message: 'OTP has expired' });
    }

    if (storedOtpData.code !== otp) {
        if (!blockStore[email]) blockStore[email] = { attempts: 0, blockExpiresAt: null };
        
        blockStore[email].attempts += 1;
        
        if (blockStore[email].attempts >= MAX_ATTEMPTS) {
            blockStore[email].blockExpiresAt = new Date(Date.now() + BLOCK_DURATION_MS);
            return res.status(429).json({ message: 'Too many failed attempts. Account blocked for 10 minutes.' });
        }

        const remaining = MAX_ATTEMPTS - blockStore[email].attempts;
        return res.status(401).json({ message: `Invalid OTP. ${remaining} attempts remaining.` });
    }

    delete otpStore[email];
    delete blockStore[email]; 
    const user = users.find(u => u.email === email);
    const token = jwt.sign(
        { id: user.id, email: user.email, name: user.name },
        JWT_SECRET,
        { expiresIn: '1h' }
    );

    res.json({ 
        message: 'Login successful',
        token,
        user: { email: user.email, name: user.name }
    });
});

const verifyToken = (req, res, next) => {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1]; 

    if (!token) return res.status(401).json({ message: 'Access Denied' });

    jwt.verify(token, JWT_SECRET, (err, user) => {
        if (err) return res.status(403).json({ message: 'Invalid Token' });
        req.user = user;
        next();
    });
};

app.get('/auth/me', verifyToken, (req, res) => {
    res.json({ 
        message: 'User data retrieved',
        user: req.user 
    });
});

app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
    console.log(`Test Account: ankurkaushl13@gmail.com`);
});