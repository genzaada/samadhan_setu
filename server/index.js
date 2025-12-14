require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');

const authRoutes = require('./routes/authRoutes');
const issueRoutes = require('./routes/issueRoutes');

const app = express();

app.use(cors());
app.use(express.json({ limit: '500mb' }));
app.use(express.urlencoded({ limit: '500mb', extended: true }));

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
    app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
});
