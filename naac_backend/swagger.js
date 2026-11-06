const swaggerJsdoc = require('swagger-jsdoc');
const dotenv=require('dotenv');
dotenv.config();
const PORT=process.env.PORT;
const swaggerOptions = {
    definition: {
      openapi: '3.0.0',
      info: {
        title: 'MMCH Backend API',
        version: '1.0.0',
        description: 'API documentation for MMCH (Medical College) Backend',
        contact: {
          name: 'API Support',
          email: 'support@mmch.com'
        }
      },
      servers: [
        {
          url: `http://localhost:${PORT || 5000}/api`,
          description: 'Development server'
        },
        {
          url: 'https://mmch-backend.vercel.app/api',
          description: 'Production server'
        }
      ],
      components: {
        securitySchemes: {
          bearerAuth: {
            type: 'http',
            scheme: 'bearer',
            bearerFormat: 'JWT'
          }
        }
      }
    },
    apis: ['./routes/*.js', './controller/*.js'] // Path to the API docs
  };
  
  const swaggerSpec = swaggerJsdoc(swaggerOptions);
  module.exports=swaggerSpec;