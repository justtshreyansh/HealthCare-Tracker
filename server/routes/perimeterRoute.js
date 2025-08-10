const express = require('express');
const { setPerimeter, getPerimeter,getPerimeterByWorker } = require('../controllers/perimeterController');
const { authenticateToken,authorizeManager, authorizeWorker } = require('../middlewares/auth');

const router = express.Router();

router.post('/setPerimeter', authenticateToken,authorizeManager, setPerimeter);
router.get('/getPerimeter', authenticateToken,authorizeManager,getPerimeter);
router.get('/getPerimeterByWorker',authenticateToken,authorizeWorker,getPerimeterByWorker);

module.exports = router;
