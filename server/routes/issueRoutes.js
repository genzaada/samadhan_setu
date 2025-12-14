const express = require('express');
const router = express.Router();
const issueController = require('../controllers/issueController');
const authMiddleware = require('../middlewares/authMiddleware');

router.post('/', authMiddleware(['citizen']), issueController.createIssue);
router.get('/', authMiddleware(), issueController.getIssues); // Role-based filtering inside controller
router.put('/:issueId/assign', authMiddleware(['admin']), issueController.assignIssue);
router.put('/:issueId/resolve', authMiddleware(['worker']), issueController.resolveIssue);
router.get('/summary', authMiddleware(['admin']), issueController.getSummary);

module.exports = router;
