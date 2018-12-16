/* eslint-disable*/
const createError = require('http-errors');
const express = require('express');
const path = require('path');
const cookieParser = require('cookie-parser');
const logger = require('morgan');
const mongoose = require('mongoose');
const config = require('./config/config');
const swaggerUi = require('swagger-ui-express');
const swaggerSpec = require('./swaggerSpec');

const apiRouterV1 = require('./routes/api/v1');

const clientApp = path.join(__dirname, './public/App');
const app = express();

if (process.env.NODE_ENV !== 'test') app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

// set mongodb
mongoose.Promise = global.Promise;
mongoose.set('useFindAndModify', false);
mongoose.connect(
  config.mongoDbUri,
  {
    useNewUrlParser: true,
  },
);
const db = mongoose.connection;
db.on('error', console.error.bind(console, 'mongoDB connection error:'));
if (process.env.NODE_ENV !== 'test')
  db.once('open', () => console.log('Connected to mongodb Atlas'));

app.use((req, res, next) => {
  res.header('Access-Control-Allow-Origin', '*');
  res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE');
  res.header('Access-Control-Allow-Headers', 'content-type, x-access-token');
  next();
});

app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec));
app.use('/api/v1', apiRouterV1);
app.use('*', express.static(clientApp));

// catch 404 and forward to error handler
app.use((req, res, next) => {
  next(createError(404));
});

// error handler
app.use((err, req, res, next) => {
  // print error in development
  if (process.env.NODE_ENV === 'development') console.error(err);

  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};

  // render the error page
  res.status(err.status || 500).json({
    message: err.message,
    error: err,
  });
});

module.exports = app;
