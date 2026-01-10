require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');

const authRoutes = require('./routes/authRoutes');
const issueRoutes = require('./routes/issueRoutes');
const aiRoutes = require('./routes/aiRoutes');
const adminAiRoutes = require('./routes/adminAiRoutes');

const compression = require('compression');

const app = express();

app.use(compression()); // Compress all responses
app.use(cors({
    origin: function (origin, callback) {
        // Allow requests with no origin (like mobile apps or curl requests)
        if (!origin) return callback(null, true);

        // Allow localhost and any Vercel deployment
        if (origin.includes('localhost') || origin.endsWith('.vercel.app')) {
            return callback(null, true);
        } else {
            console.log('Blocked by CORS:', origin); // Log blocked origins for debugging
            return callback(new Error('Not allowed by CORS'));
        }
    },
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization']
}));
app.use(express.json({ limit: '500mb' }));
app.use(express.urlencoded({ limit: '500mb', extended: true }));

app.use((req, res, next) => {
    // Only log if not in production to save logs
    if (process.env.NODE_ENV !== 'production') {
        const bodySize = req.body ? JSON.stringify(req.body).length : 0;
        console.log(`[${new Date().toISOString()}] ${req.method} ${req.url} | Body Size: ${bodySize}`);
    }
    next();
});

// --- Serverless MongoDB Connection Pattern ---
let cached = global.mongoose;
if (!cached) {
    cached = global.mongoose = { conn: null, promise: null };
}

const connectDB = async () => {
    if (cached.conn) return cached.conn;

    if (!cached.promise) {
        const opts = {
            bufferCommands: false, // Disable buffering for serverless
        };
        cached.promise = mongoose.connect(process.env.MONGO_URI, opts).then((mongoose) => {
            console.log('MongoDB connected (Cloud - New Connection)');
            return mongoose;
        });
    }
    try {
        cached.conn = await cached.promise;
    } catch (e) {
        cached.promise = null;
        throw e;
    }
    return cached.conn;
};

// Middleware to ensure DB is connected before handling legitimate requests
app.use(async (req, res, next) => {
    // Skip for root health check if needed, but safer to just ensure DB for all API routes
    if (req.path.startsWith('/api')) {
        await connectDB();
    }
    next();
});

const PORT = process.env.PORT || 5000;

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/issues', issueRoutes);
app.use('/api/feedback', require('./routes/feedbackRoutes'));
app.use('/api/ai', aiRoutes);
app.use('/api/admin/ai', adminAiRoutes);

app.get('/', (req, res) => {
    res.send('Server is running');
});

// Only listen if run directly (not on Vercel)
if (require.main === module) {
    app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
}

module.exports = app;