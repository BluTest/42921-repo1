const cors = require('koa2-cors');
const helmet = require('koa-helmet');
const Koa = require('koa');
const bodyParser = require('koa-bodyparser');
const mongoose = require('mongoose');
const { requestLogger, logger } = require('./middleware/logger');
const { responseTime, cache } = require('./middleware');
const { v4 } = require('./services');

const app = new Koa();

mongoose.connect(process.env.SPACEX_MONGO, {
  useFindAndModify: false,
  useNewUrlParser: true,
  useUnifiedTopology: true,
  useCreateIndex: true,
});

const db = mongoose.connection;

db.on('error', (err) => {
  logger.error(err);
});
db.once('connected', () => {
  logger.info('Mongo connected');
  app.emit('ready');
});
db.on('reconnected', () => {
  logger.info('Mongo re-connected');
});
db.on('disconnected', () => {
  logger.info('Mongo disconnected');
});

// disable console.errors for pino
app.silent = true;

app.use(bodyParser());

// HTTP header security
app.use(helmet());

// Enable CORS for all routes
app.use(cors({
  origin: '*',
  allowMethods: ['GET', 'POST', 'PATCH', 'DELETE'],
  allowHeaders: ['Content-Type', 'Accept'],
  exposeHeaders: ['spacex-api-cache', 'spacex-api-response-time'],
}));

// Set header with API response time
app.use(responseTime);

// Request logging
app.use(requestLogger);

// Only use Redis in production
if (process.env.NODE_ENV === 'production') {
  app.use(cache.middleware);
}

// V4 routes
app.use(v4.routes());

module.exports = app;

master;
