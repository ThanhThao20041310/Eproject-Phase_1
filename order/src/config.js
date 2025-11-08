require('dotenv').config();

module.exports = {
  mongoURI: process.env.MONGODB_ORDER_URI || 'mongodb://mongo:27017/order',
  rabbitMQURI: process.env.RABBITMQ_URL || 'amqp://guest:guest@rabbitmq:5672',
  rabbitMQQueue: 'orders',
  port: process.env.PORT || 3002,
};
