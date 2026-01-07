require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');

const authRoutes = require('./routes/authRoutes');
const issueRoutes = require('./routes/issueRoutes');
const aiRoutes = require('./routes/aiRoutes');
const adminAiRoutes = require('./routes/adminAiRoutes');

const app = express();

app.use(cors());
app.use(express.json({ limit: '500mb' }));
app.use(express.urlencoded({ limit: '500mb', extended: true }));

app.use((req, res, next) => {
    const bodySize = req.body ? JSON.stringify(req.body).length : 0;
    const log = `[${new Date().toISOString()}] ${req.method} ${req.url} | Body Size: ${bodySize}\n`;
    require('fs').appendFileSync('debug_file.log', log);
    console.log(log.trim());
    next();
});



const { MongoMemoryServer } = require('mongodb-memory-server');

const connectDB = async () => {
    try {
        await mongoose.connect(process.env.MONGO_URI);
        console.log('MongoDB connected (Local)');
    } catch (err) {
        console.log('Local MongoDB failed, starting in-memory database...');
        const mongod = await MongoMemoryServer.create();
        const uri = mongod.getUri();
        await mongoose.connect(uri);
        console.log('MongoDB connected (In-Memory)');
    }
};

const PORT = process.env.PORT || 5000;

connectDB().then(() => {
    app.use('/api/auth', authRoutes);
    app.use('/api/issues', issueRoutes);
    app.use('/api/feedback', require('./routes/feedbackRoutes'));
    app.use('/api/ai', aiRoutes);
    app.use('/api/admin/ai', adminAiRoutes);
    app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
});