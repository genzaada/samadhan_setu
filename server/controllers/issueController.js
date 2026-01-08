const Issue = require('../models/Issue');
const { enhanceIssueDescription, summarizeIssues, generateFeedback } = require('../ai/chains');
const fs = require('fs');
const path = require('path');

const LOG_FILE = path.join(__dirname, '../debug_issues.log');

const logToFile = (message) => {
    try {
        const timestamp = new Date().toISOString();
        const logLine = `[${timestamp}] ${message}\n`;
        fs.appendFileSync(LOG_FILE, logLine);
    } catch (e) { console.error("Log failed", e); }
};

exports.createIssue = async (req, res) => {
    try {
        const { title, description, location, images, category, audio } = req.body;
        logToFile(`[createIssue] Request received. Title: ${title}, User: ${req.user.id}`);

        // AI Enhancement - resilient
        let aiResult = { enhanced_description: null, category: null, priority: 'Medium' };
        try {
            aiResult = await enhanceIssueDescription(description);
        } catch (aiError) {
            logToFile(`[createIssue] AI Failed: ${aiError.message}`);
        }

        const issue = await Issue.create({
            title,
            original_description: description,
            ai_enhanced_description: aiResult.enhanced_description || description, // Fallback
            category: category || aiResult.category || 'Maintenance', // Fallback
            priority: aiResult.priority || 'Medium',
            location,
            images,
            audio,
            reportedBy: req.user.id
        });

        logToFile(`[createIssue] SUCCESS. IssueID: ${issue._id}, ReportedBy: ${issue.reportedBy}`);
        res.status(201).json(issue);
    } catch (error) {
        logToFile(`[createIssue] ERROR: ${error.message}`);
        res.status(500).json({ message: 'Error creating issue', error: error.message });
    }
};

exports.getIssues = async (req, res) => {
    try {
        // If admin, all issues. If citizen, their issues. If worker, assigned issues.
        let query = {};
        if (req.user.role === 'citizen') {
            query.reportedBy = req.user.id;
        } else if (req.user.role === 'worker') {
            query.assignedTo = req.user.id;
        }

        logToFile(`[getIssues] Fetching for User: ${req.user.id} (${req.user.role}), Query: ${JSON.stringify(query)}`);

        const issues = await Issue.find(query).sort({ createdAt: -1 }).populate('reportedBy', 'name').populate('assignedTo', 'name');

        logToFile(`[getIssues] Found ${issues.length} issues.`);

        res.json(issues);
    } catch (error) {
        logToFile(`[getIssues] ERROR: ${error.message}`);
        res.status(500).json({ message: 'Error fetching issues', error: error.message });
    }
};

exports.getPublicIssues = async (req, res) => {
    try {
        // Return all issues for map view (optimize fields if needed)
        const issues = await Issue.find({}).select('title location category status createdAt').sort({ createdAt: -1 });
        res.json(issues);
    } catch (error) {
        res.status(500).json({ message: 'Error fetching public issues', error: error.message });
    }
};

exports.assignIssue = async (req, res) => {
    try {
        const { issueId } = req.params;
        const { workerId } = req.body;

        logToFile(`[assignIssue] Request. Issue: ${issueId}, Worker: ${workerId}, AssignedBy: ${req.user.id}`);

        const issue = await Issue.findByIdAndUpdate(
            issueId,
            { assignedTo: workerId, status: 'In Progress' },
            { new: true }
        );

        if (!issue) {
            logToFile(`[assignIssue] Issue not found: ${issueId}`);
            return res.status(404).json({ message: 'Issue not found' });
        }

        // Add history
        issue.status_history.push({
            status: 'In Progress',
            updatedBy: req.user.id,
            remark: 'Assigned to field worker'
        });
        await issue.save();

        logToFile(`[assignIssue] Success. Issue: ${issueId}`);
        res.json(issue);
    } catch (error) {
        logToFile(`[assignIssue] Error: ${error.message}`);
        res.status(500).json({ message: 'Error assigning issue', error: error.message });
    }
};

exports.resolveIssue = async (req, res) => {
    try {
        const { issueId } = req.params;
        const { proofImage, remark } = req.body;

        logToFile(`[resolveIssue] Request. Issue: ${issueId}, User: ${req.user.id}`);
        logToFile(`[resolveIssue] Body Keys: ${Object.keys(req.body).join(', ')}`);
        logToFile(`[resolveIssue] Remark: "${remark}", ImageLength: ${proofImage ? proofImage.length : 'N/A'}`);

        const issue = await Issue.findById(issueId);
        if (!issue) {
            logToFile(`[resolveIssue] Issue not found: ${issueId}`);
            return res.status(404).json({ message: 'Issue not found' });
        }

        issue.status = 'Pending Verification';

        // Generate AI Feedback
        try {
            const feedback = await generateFeedback(issue.title, remark);
            issue.ai_feedback = feedback;
        } catch (aiError) {
            console.error("AI Feedback skipped in controller:", aiError);
            logToFile(`[resolveIssue] AI Error: ${aiError.message}`);
        }

        issue.status_history.push({
            status: 'Pending Verification',
            updatedBy: req.user.id,
            proofImage,
            remark
        });

        await issue.save();
        logToFile(`[resolveIssue] Success. Saved status history.`);
        res.json(issue);
    } catch (error) {
        logToFile(`[resolveIssue] Error: ${error.message}`);
        res.status(500).json({ message: 'Error resolving issue', error: error.message });
    }
};

exports.verifyIssue = async (req, res) => {
    try {
        const { issueId } = req.params;
        const issue = await Issue.findById(issueId);
        if (!issue) return res.status(404).json({ message: 'Issue not found' });

        issue.status = 'Resolved';
        issue.status_history.push({
            status: 'Resolved',
            updatedBy: req.user.id,
            remark: 'Verified by Admin'
        });

        await issue.save();
        res.json(issue);
    } catch (error) {
        res.status(500).json({ message: 'Error verifying issue', error: error.message });
    }
};

exports.dismissIssue = async (req, res) => {
    try {
        const { issueId } = req.params;
        const issue = await Issue.findById(issueId);
        if (!issue) return res.status(404).json({ message: 'Issue not found' });

        issue.status = 'In Progress'; // Revert to In Progress
        issue.status_history.push({
            status: 'In Progress',
            updatedBy: req.user.id,
            remark: 'Resolution dismissed by Admin'
        });

        await issue.save();
        res.json(issue);
    } catch (error) {
        res.status(500).json({ message: 'Error dismissing issue', error: error.message });
    }
};

exports.getSummary = async (req, res) => {
    try {
        const issues = await Issue.find({ status: { $ne: 'Resolved' } });
        const summary = await summarizeIssues(issues);
        res.json({ summary });
    } catch (error) {
        res.status(500).json({ message: 'Error generating summary', error: error.message });
    }
};
