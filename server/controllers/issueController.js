const Issue = require('../models/Issue');
const { enhanceIssueDescription, summarizeIssues, generateFeedback } = require('../ai/chains');

exports.createIssue = async (req, res) => {
    try {
        const { title, description, location, images } = req.body;

        // AI Enhancement
        const aiResult = await enhanceIssueDescription(description);

        const issue = await Issue.create({
            title,
            original_description: description,
            ai_enhanced_description: aiResult.enhanced_description,
            category: aiResult.category,
            priority: aiResult.priority,
            location,
            images,
            reportedBy: req.user.id
        });

        res.status(201).json(issue);
    } catch (error) {
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

        const issues = await Issue.find(query).sort({ createdAt: -1 }).populate('reportedBy', 'name').populate('assignedTo', 'name');
        res.json(issues);
    } catch (error) {
        res.status(500).json({ message: 'Error fetching issues', error: error.message });
    }
};

exports.assignIssue = async (req, res) => {
    try {
        const { issueId } = req.params;
        const { workerId } = req.body;

        const issue = await Issue.findByIdAndUpdate(
            issueId,
            { assignedTo: workerId, status: 'In Progress' },
            { new: true }
        );

        // Add history
        issue.status_history.push({
            status: 'In Progress',
            updatedBy: req.user.id,
            remark: 'Assigned to field worker'
        });
        await issue.save();

        res.json(issue);
    } catch (error) {
        res.status(500).json({ message: 'Error assigning issue', error: error.message });
    }
};

exports.resolveIssue = async (req, res) => {
    try {
        const { issueId } = req.params;
        const { proofImage, remark } = req.body;

        const issue = await Issue.findById(issueId);
        if (!issue) return res.status(404).json({ message: 'Issue not found' });

        issue.status = 'Resolved';

        // Generate AI Feedback
        const feedback = await generateFeedback(issue.title, remark);
        issue.ai_feedback = feedback;

        issue.status_history.push({
            status: 'Resolved',
            updatedBy: req.user.id,
            proofImage,
            remark
        });

        await issue.save();
        res.json(issue);
    } catch (error) {
        res.status(500).json({ message: 'Error resolving issue', error: error.message });
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
