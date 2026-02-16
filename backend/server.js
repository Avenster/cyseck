require('dotenv').config();
const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const jwt = require('jsonwebtoken');
const nodemailer = require('nodemailer');
const twilio = require('twilio');

const app = express();
const PORT = 3000;
const JWT_SECRET = process.env.JWT_SECRET || 'super_secret_challenge_key';

app.use(cors());
app.use(bodyParser.json());

const client = new twilio(process.env.TWILIO_SID, process.env.TWILIO_AUTH_TOKEN);
const users = [
    { 
        id: 1, 
        email: 'ankurkaushl13@gmail.com', 
        phone: '9876543210', 
        name: 'Ankur Kaushal' 
    }
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

const getIdentifierType = (input) => {
    const emailRegex = /\S+@\S+\.\S+/;
    return emailRegex.test(input) ? 'email' : 'phone';
};

const isBlocked = (identifier) => {
    const record = blockStore[identifier];
    if (!record) return false;
    if (record.blockExpiresAt && new Date() < record.blockExpiresAt) return true;
    return false;
};

app.post('/auth/request-otp', async (req, res) => {
    let identifier = req.body.identifier || req.body.email || req.body.phone;

    if (!identifier) return res.status(400).json({ message: 'Identifier required' });


    if (isBlocked(identifier)) {
        const timeLeft = Math.ceil((blockStore[identifier].blockExpiresAt - new Date()) / 60000);
        return res.status(429).json({ message: `Blocked. Try again in ${timeLeft} mins.` });
    }

    const otp = generateOTP();
    otpStore[identifier] = { 
        code: otp, 
        expiresAt: new Date(Date.now() + OTP_EXPIRY_MS) 
    };

    const type = getIdentifierType(identifier);

    try {
        if (type === 'email') {
            await transporter.sendMail({
                from: process.env.EMAIL_USER,
                to: identifier,
                subject: 'Login OTP',
                text: `Your OTP is: ${otp}`
            });
            console.log(`[MAIL] Sent to ${identifier}`);
        } else {
            let formattedPhone = identifier;
            if (!identifier.startsWith('+')) {
                formattedPhone = '+91' + identifier; 
            }

            console.log(`[Twilio] Sending SMS to ${formattedPhone}...`);
            await client.messages.create({
                body: `Your verification code is: ${otp}`,
                from: process.env.TWILIO_PHONE_NUMBER,
                to: formattedPhone
            });
            console.log(`[Twilio] SMS sent successfully!`);
        }
        res.json({ message: `OTP sent to ${type}` });

    } catch (error) {
        console.error('Delivery Error:', error);
        res.status(500).json({ message: 'Failed to send OTP. Check server logs.' });
    }
});

app.post('/auth/verify-otp', (req, res) => {
    const identifier = req.body.identifier || req.body.email || req.body.phone;
    const { otp } = req.body;

    if (!identifier || !otp) return res.status(400).json({ message: 'Identifier and OTP required' });
    if (isBlocked(identifier)) return res.status(429).json({ message: 'Account blocked.' });

    const storedOtpData = otpStore[identifier];
    if (!storedOtpData) return res.status(400).json({ message: 'No OTP requested' });
    if (new Date() > storedOtpData.expiresAt) { 
        delete otpStore[identifier]; 
        return res.status(400).json({ message: 'Expired' }); 
    }

    if (storedOtpData.code !== otp) {
        if (!blockStore[identifier]) blockStore[identifier] = { attempts: 0, blockExpiresAt: null };
        blockStore[identifier].attempts += 1;
        if (blockStore[identifier].attempts >= MAX_ATTEMPTS) {
            blockStore[identifier].blockExpiresAt = new Date(Date.now() + BLOCK_DURATION_MS);
            return res.status(429).json({ message: 'Blocked for 10 minutes.' });
        }
        return res.status(401).json({ message: 'Invalid OTP' });
    }

    delete otpStore[identifier];
    delete blockStore[identifier];

    const type = getIdentifierType(identifier);
    
    let user = users.find(u => u[type] === identifier);

    if (!user) {
        user = {
            id: users.length + 1,
            name: "Ankur",
            [type]: identifier 
        };
        users.push(user);
        console.log(`[DB] New User Created:`, user);
    } else {
        console.log(`[DB] Existing User Logged In:`, user);
    }

    const token = jwt.sign(
        { id: user.id, email: user.email, phone: user.phone, name: user.name }, 
        JWT_SECRET, 
        { expiresIn: '1h' }
    );

    res.json({ 
        message: 'Login successful', 
        token, 
        user 
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
});