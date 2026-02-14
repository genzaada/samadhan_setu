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

const { MongoMemoryServer } = require('mongodb-memory-server');

const connectDB = async () => {
    if (cached.conn) return cached.conn;

    // Try connecting to the configured URI (Atlas) first
    try {
        if (!cached.promise) {
            const opts = {
                bufferCommands: false,
            };
            console.log('Attempting to connect to MongoDB Atlas...');
            cached.promise = mongoose.connect(process.env.MONGO_URI, { ...opts, serverSelectionTimeoutMS: 5000 }).then((mongoose) => {
                console.log('✅ MongoDB connected (Atlas)');
                return mongoose;
            });
        }
        cached.conn = await cached.promise;
        return cached.conn;
    } catch (error) {
        console.error('❌ Failed to connect to MongoDB Atlas:', error.message);
        console.log('⚠️  Falling back to In-Memory Database...');

        try {
            // Reset promise for retry
            cached.promise = null;

            // Start In-Memory Server
            const mongod = await MongoMemoryServer.create();
            const uri = mongod.getUri();

            console.log(`Attempting to connect to In-Memory DB at: ${uri}`);

            const opts = {
                bufferCommands: false,
            };

            cached.promise = mongoose.connect(uri, opts).then((mongoose) => {
                console.log('✅ MongoDB connected (In-Memory)');
                return mongoose;
            });

            cached.conn = await cached.promise;
            return cached.conn;
        } catch (memError) {
            console.error('❌ Failed to start In-Memory Database:', memError);
            throw memError;
        }
    }
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
