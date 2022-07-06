const db = require('./index');
const helper = require('./helper');

async function getOrders(page = 1, max=10) {
    const offset = helper.getOffset(page, max);
    const rows = await db.query(
        'SELECT id, username, details, created_at FROM orders ORDER BY created_at DESC OFFSET $1 LIMIT $2',
        [offset, max]
    );
    const data = helper.emptyOrRows(rows);
    const meta = { page };

    return {
        data,
        meta
    }
}

async function getOrdersByUsername(username, page = 1, max=10) {
  const offset = helper.getOffset(page, max);
  const rows = await db.query(
      'SELECT id, username, details, created_at \
      FROM orders \
      WHERE username = $1 \
      ORDER BY created_at DESC \
      OFFSET $2 LIMIT $3',
      [username, offset, max]
  );
  const data = helper.emptyOrRows(rows);
  const meta = { page };

  return {
      data,
      meta
  }
}

async function getOrderById(orderId) {
  const result = await db.query(
      'SELECT id, username, details, created_at \
      FROM orders \
      WHERE id = $1',
      [orderId]
  );

  if(result.length == 1) {
    return result[0];
  } else {
    throw new Error('Order with provided id not found.');
  }
}

async function createOrder(username, details) {
    const result = await db.query(
      'INSERT INTO orders(username, details) VALUES ($1, $2) RETURNING *',
      [username, details]
    );
  
    if(result.length == 1) {
      return result[0];
    } else {
      return null;
    }
  }
  
  async function deleteOrder(id) {
    const result = await db.query(
      'DELETE FROM orders WHERE id = $1 RETURNING *',[id]);
  
    if(result.length == 1) {
      return result[0];
    } else {
      return null;
    }
  }

module.exports = {
  getOrders,
  getOrdersByUsername,
  getOrderById,
  createOrder,
  deleteOrder
}