const swaggerJSDoc = require('swagger-jsdoc');

const swaggerDefinition = {
  info: {
    title: 'Dev Cafe API',
    version: '1.0.0',
    description: 'API for Dev Cafe',
  },
  host: 'localhost:3000',
  basePath: '/api/v1',
};

const options = {
  swaggerDefinition,
  apis: ['./routes/api/v1/index.js'],
};

const swwagerSpec = swaggerJSDoc(options);
module.exports = swwagerSpec;
