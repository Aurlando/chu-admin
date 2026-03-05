const express    = require('express');
const router     = express.Router();  
const staffControllers = require('../controllers/staffControllers');

// ?search=  &department=  &service=  &fonction=  &page=  &limit=
router.get('/show-all',    staffControllers.getStaff);

// liste des départements pour le dropdown
router.get('/departments', staffControllers.getDepartments);

// liste des job titles pour le dropdown
router.get('/fonctions',   staffControllers.getFonctions);

module.exports = router;
