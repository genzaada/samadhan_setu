require('dotenv').config();

const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const compression = require('compression');

const authRoutes = require('../server/routes/authRoutes');
const issueRoutes = require('../server/routes/issueRoutes');
const aiRoutes = require('../server/routes/aiRoutes');
const adminAiRoutes = require('../server/routes/adminAiRoutes');
const feedbackRoutes = require('../server/routes/feedbackRoutes');

const app = express();

app.use(compression());

app.use(cors({
    origin: function (origin, callback) {
        if (!origin) return callback(null, true);

        if (origin.includes('localhost') || origin.endsWith('.vercel.app')) {
            return callback(null, true);
        } else {
            console.log('Blocked by CORS:', origin);
            return callback(new Error('Not allowed by CORS'));
        }
    },
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization']
}));

app.use(express.json({ limit: '500mb' }));
app.use(express.urlencoded({ limit: '500mb', extended: true }));

// --- MongoDB Connection ---
let cached = global.mongoose;

if (!cached) {
    cached = global.mongoose = { conn: null, promise: null };
}

const connectDB = async () => {
    if (cached.conn) return cached.conn;

    if (!cached.promise) {
        const opts = {
            bufferCommands: false,
            serverSelectionTimeoutMS: 5000
        };

        console.log('Attempting to connect to MongoDB Atlas...');

        cached.promise = mongoose.connect(process.env.MONGO_URI, opts)
            .then((mongoose) => {
                console.log('✅ MongoDB connected');
                return mongoose;
            })
            .catch(err => {
                console.error('❌ MongoDB connection error:', err);
                throw err;
            });
    }

    cached.conn = await cached.promise;
    return cached.conn;
};

// Health check
app.get("/", (req, res) => {
    res.status(200).json({ message: "Server is alive 🚀" });
});

// Ensure DB connection for all API routes
app.use(async (req, res, next) => {
    await connectDB();
    next();
});

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/issues', issueRoutes);
app.use('/api/feedback', feedbackRoutes);
app.use('/api/ai', aiRoutes);
app.use('/api/admin/ai', adminAiRoutes);

const PORT = process.env.PORT || 5000;

// Only listen if run directly (local dev)
if (require.main === module) {
    app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
}

module.exports = app;
