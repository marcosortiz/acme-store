const express = require('express');

const router = express.Router();

router.get('/', (req, res, next) => {
    res.json({
      data: {
        service: 'orders',
        version: '1.0',
      },
      meta: {
        az: req.az  
      }
    }); 
});

module.exports = router;