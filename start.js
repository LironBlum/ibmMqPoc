const express = require('express');
const path = require('path');
const swaggerDoc = require('./app/swagger.json');
const swaggerTools = require('swagger-tools');

require('dotenv').config({ path: 'variables.env' }); // import environmental variables from variables.env file

const app = express();

swaggerTools.initializeMiddleware(swaggerDoc, (middleware) => {
  
  app.use(middleware.swaggerMetadata());
  app.use(middleware.swaggerValidator({
    validateResponse: true,
  }));
  app.use(middleware.swaggerRouter({
    controllers: path.join(__dirname, 'routes/'),
  }));
  app.use(middleware.swaggerUi());
  app.use((err, req, res, next) => {
    res.header("Access-Control-Allow-Origin", "*");
    res.header("Access-Control-Allow-Headers", "Content-Type");
    
    next();
  });
  
  const server = app.listen(process.env.PORT, () => {
    console.log(`Express running → PORT ${server.address().port}`);
  });
     
});

