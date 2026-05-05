import swaggerJsdoc from 'swagger-jsdoc';

const options: swaggerJsdoc.Options = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'Community Hub API',
      version: '1.0.0',
      description: 'API documentation for Community Hub application',
    },
    servers: [
      {
        url: 'http://localhost:5000',
        description: 'Development server',
      },
      {
        url: 'https://your-production-url.com',
        description: 'Production server',
      },
    ],
    components: {
      securitySchemes: {
        session: {
          type: 'apiKey',
          in: 'cookie',
          name: 'connect.sid',
          description: 'Session cookie',
        },
      },
    },
    security: [
      {
        session: [],
      },
    ],
  },
  apis: ['./server/routes.ts'],
};

export const swaggerSpec = swaggerJsdoc(options);
