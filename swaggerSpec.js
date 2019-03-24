const swaggerJSDoc = require('swagger-jsdoc');

const swaggerDefinition = {
  info: {
    title: 'Dev Cafe API',
    version: '1.0.0',
    description: 'API for Dev Cafe',
  },
  basePath: '/api/v1',
};

const options = {
  swaggerDefinition,
  apis: ['./controllers/**/*js'],
};

const swwagerSpec = swaggerJSDoc(options);
module.exports = swwagerSpec;
