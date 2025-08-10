const express = require('express');
const { clockIn, clockOut,getUserShifts, getActiveShift } = require('../controllers/shiftController');
const { authenticateToken, authorizeWorker } = require('../middlewares/auth');

const router = express.Router();

router.post('/clockIn', authenticateToken, authorizeWorker, clockIn);            // careWorkerId from req.user
router.post('/clockOut/:shiftId', authenticateToken, authorizeWorker, clockOut);
router.get('/myShifts', authenticateToken, getUserShifts);
router.get('/active-shift', authenticateToken, getActiveShift); 
module.exports = router;
