const Router = require('express-promise-router');
const db = require('../db');
const Order = require ('../db/orders');

const router = new Router();

router.get('/', async (req, res) => {
  const { id } = req.params
  try{
    const rows = await Order.getOrders();
    res.json(rows);  
  } catch (err) {
    console.error(`Error while getting orders: `, err.message);
    console.err(err.stack);
  }
});

module.exports = router;