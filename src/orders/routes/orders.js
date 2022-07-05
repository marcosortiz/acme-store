const Router = require('express-promise-router');
const db = require('../db');
const Order = require ('../db/orders');

const router = new Router();

router.get('/', async (req, res) => {
  const { id } = req.params
  try{
    const resp = await Order.getOrders();
    res.json({
      data: resp.data,
      meta: {page: resp.meta.page, az: req.az}
    });  
  } catch (err) {
    console.error(`Error while getting orders: `, err.message);
    console.error(err.stack);
    throw(err);
  }
});

router.post('/', async (req, res) => {
  try{
    let order = await Order.createOrder(req.body.username, req.body.details);
    res.json({
      data: order,
      meta: {az: req.az}
    });
  } catch (err) {
    console.error(`Error while creating order: `, err.message);
    console.error(err.stack);
    throw(err);
  }
});

router.delete('/:id', async (req, res) => {
  try{
    const id = parseInt(req.params.id)
    let order = await Order.deleteOrder(id);
    res.json({
      data: order,
      meta: req.az
    });
  } catch (err) {
    console.error(`Error while deleting order: `, err.message);
    console.error(err.stack);
    throw(err);
  }
});

module.exports = router;