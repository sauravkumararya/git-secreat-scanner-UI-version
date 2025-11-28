// swaggerConfig.js
const swaggerJsdoc = require('swagger-jsdoc');

const options = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'NPCI Secret Scanner API',
      version: '1.0.0',
      description: 'API documentation for the automated security scanner service',
      contact: {
        name: 'Security Team',
        email: 'security@example.com'
      },
    },
    servers: [
      {
        url: 'http://localhost:3000',
        description: 'Local Development Server',
      },
    ],
    components: {
      securitySchemes: {
        // We describe our custom Auth logic here (body-based)
        // Note: Since we use body params for auth, we document it in the schemas below
      },
      schemas: {
        ScanRequest: {
          type: 'object',
          required: ['productName', 'apiKey', 'repoUrl'],
          properties: {
            productName: { type: 'string', example: 'MySecureApp' },
            apiKey: { type: 'string', example: '12345-SECRET-KEY' },
            repoUrl: { type: 'string', example: 'https://github.com/awslabs/git-secrets' }
          }
        },
        RegisterRequest: {
          type: 'object',
          required: ['productName', 'apiKey'],
          properties: {
            productName: { type: 'string', example: 'MyNewProduct' },
            apiKey: { type: 'string', example: 'NEW-API-KEY-999' }
          }
        }
      }
    }
  },
  // Paths to files containing OpenAPI definitions
  apis: ['./server.js'], 
};

const specs = swaggerJsdoc(options);
module.exports = specs;