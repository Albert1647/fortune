// routes : define api list and its controller
const express = require('express');

const fortune_controller = require('../controllers/fortune');

const router = express.Router();

// get personalize auspicious time for user
// query: date
router.get('/get-user-time', fortune_controller.getUserTime);

// get general bazi god of day
// query: date, time?
router.get('/bazi-god', fortune_controller.getBaziGod);

// get general bazi god of day
// query: date, time?
router.get('/bazi-element', fortune_controller.getBaziElement);

// get weekly personalize color of user 
// query: date
router.get('/get-user-color-weekly', fortune_controller.getUserColorWeekly);

// *for older version
// get personalize color of user 
// no query
router.get('/get-user-color', fortune_controller.getUserColor);

module.exports = router;