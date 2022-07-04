const users = require('./user')
const orders = require('./orders')

module.exports = app => {
  app.use('/orders', orders);
}
