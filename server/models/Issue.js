const mongoose = require('mongoose');

const issueSchema = new mongoose.Schema({
    title: { type: String, required: true },
    original_description: { type: String, required: true },
    ai_enhanced_description: { type: String },
    category: { type: String },
    priority: { type: String, enum: ['Low', 'Medium', 'High', 'Critical'], default: 'Medium' },
    location: {
        lat: { type: Number },
        lng: { type: Number },
        address: { type: String } // Optional address string
    },
    zone: { type: String, enum: ['North Zone', 'South Zone', 'East Zone', 'West Zone'], default: 'North Zone' },
    images: [{ type: String }], // URLs or base64
    status: { type: String, enum: ['Pending', 'In Progress', 'Pending Verification', 'Resolved', 'Failed'], default: 'Pending' },
    severity: { type: String, default: 'Medium' }, // low, medium, high
    recommendedAction: { type: String },
    reportedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    assignedTo: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    status_history: [{
        status: String,
        updatedAt: { type: Date, default: Date.now },
        updatedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
        remark: String,
        proofImage: String
    }],
    ai_feedback: { type: String } // Feedback message for citizen
}, { timestamps: true });

module.exports = mongoose.model('Issue', issueSchema);
