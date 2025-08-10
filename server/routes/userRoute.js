const express = require('express');
const { signup, login, getUser } = require('../controllers/userController');
const { authenticateToken, authorizeWorker, authorizeManager } = require('../middlewares/auth');

const router = express.Router();

router.post('/signup', signup);
router.post('/login', login);
router.get('/workerDashboard', authenticateToken, authorizeWorker, getUser);
router.get('/managerDashboard', authenticateToken, authorizeManager, getUser);



module.exports = router;
