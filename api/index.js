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
    credentials: true
}));

app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

// ---- MongoDB Connection (Serverless Safe) ----
let cached = global.mongoose;

if (!cached) {
    cached = global.mongoose = { conn: null, promise: null };
}

const connectDB = async () => {
    if (cached.conn) return cached.conn;

    if (!cached.promise) {
        cached.promise = mongoose.connect(process.env.MONGO_URI, {
            bufferCommands: false,
            serverSelectionTimeoutMS: 5000
        }).then((mongoose) => {
            console.log('✅ MongoDB connected');
            return mongoose;
        });
    }

    cached.conn = await cached.promise;
    return cached.conn;
};

// Health check
app.get("/api", (req, res) => {
    res.status(200).json({ message: "API is live 🚀" });
});

// Ensure DB connection before handling routes
app.use(async (req, res, next) => {
    await connectDB();
    next();
});

// IMPORTANT: No /api prefix here (Vercel already adds it)
app.use('/auth', authRoutes);
app.use('/issues', issueRoutes);
app.use('/feedback', feedbackRoutes);
app.use('/ai', aiRoutes);
app.use('/admin/ai', adminAiRoutes);

// Local development only
const PORT = process.env.PORT || 5000;

if (require.main === module) {
    app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
}

module.exports = app;
