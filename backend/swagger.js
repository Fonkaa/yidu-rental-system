const swaggerJsdoc = require('swagger-jsdoc');

const options = {
  definition: {
    openapi: '3.0.0',

    info: {
      title: 'House Rental System API',
      version: '1.0.0',
      description: 'House Rental System API documentation',
    },

    servers: [
      {
        url: 'http://localhost:5000',
        description: 'Local development server',
      },
    ],

    components: {
      securitySchemes: {
        bearerAuth: {
          type: 'http',
          scheme: 'bearer',
          bearerFormat: 'JWT',
        },
      },
    },

    paths: {
      // ==========================================
      // AUTHENTICATION — Developer A / Shared
      // ==========================================

      '/api/auth/register': {
        post: {
          tags: ['Authentication'],
          summary: 'Register a new user',
          description:
            'Register a Tenant, Landlord, or Admin account.',

          requestBody: {
            required: true,

            content: {
              'application/json': {
                schema: {
                  type: 'object',

                  required: [
                    'fullName',
                    'email',
                    'password',
                    'phone',
                  ],

                  properties: {
                    fullName: {
                      type: 'string',
                      example: 'Test Tenant',
                    },

                    email: {
                      type: 'string',
                      format: 'email',
                      example: 'tenant@test.com',
                    },

                    password: {
                      type: 'string',
                      format: 'password',
                      example: 'Test@12345',
                    },

                    phone: {
                      type: 'string',
                      example: '0912345678',
                    },

                    role: {
                      type: 'string',
                      enum: ['TENANT', 'LANDLORD', 'ADMIN'],
                      example: 'TENANT',
                    },
                  },
                },
              },
            },
          },

          responses: {
            201: {
              description: 'User registered successfully',
            },

            400: {
              description: 'Required fields are missing',
            },

            409: {
              description: 'Email already exists',
            },

            500: {
              description: 'Server error',
            },
          },
        },
      },

      '/api/auth/login': {
        post: {
          tags: ['Authentication'],
          summary: 'Login user',

          requestBody: {
            required: true,

            content: {
              'application/json': {
                schema: {
                  type: 'object',

                  required: ['email', 'password'],

                  properties: {
                    email: {
                      type: 'string',
                      format: 'email',
                      example: 'tenant@test.com',
                    },

                    password: {
                      type: 'string',
                      format: 'password',
                      example: 'Test@12345',
                    },
                  },
                },
              },
            },
          },

          responses: {
            200: {
              description: 'Login successful',
            },

            400: {
              description: 'Email and password are required',
            },

            401: {
              description: 'Invalid email or password',
            },

            500: {
              description: 'Server error',
            },
          },
        },
      },

      '/api/auth/forgot-password': {
        post: {
          tags: ['Authentication'],
          summary: 'Request password reset',

          requestBody: {
            required: true,

            content: {
              'application/json': {
                schema: {
                  type: 'object',

                  required: ['email'],

                  properties: {
                    email: {
                      type: 'string',
                      format: 'email',
                      example: 'tenant@test.com',
                    },
                  },
                },
              },
            },
          },

          responses: {
            200: {
              description: 'Password reset request processed',
            },

            500: {
              description: 'Server error',
            },
          },
        },
      },

      '/api/auth/reset-password': {
        post: {
          tags: ['Authentication'],
          summary: 'Reset password',

          requestBody: {
            required: true,

            content: {
              'application/json': {
                schema: {
                  type: 'object',

                  required: ['resetToken', 'newPassword'],

                  properties: {
                    resetToken: {
                      type: 'string',
                      example: 'reset-token',
                    },

                    newPassword: {
                      type: 'string',
                      format: 'password',
                      example: 'NewPassword@123',
                    },
                  },
                },
              },
            },
          },

          responses: {
            200: {
              description: 'Password reset successful',
            },

            400: {
              description: 'Invalid or expired reset token',
            },

            500: {
              description: 'Server error',
            },
          },
        },
      },

      '/api/auth/me': {
        get: {
          tags: ['Authentication'],
          summary: 'Get current logged-in user',

          security: [
            {
              bearerAuth: [],
            },
          ],

          responses: {
            200: {
              description: 'Current user returned successfully',
            },

            401: {
              description: 'Unauthorized',
            },
          },
        },
      },
// ==========================================
// PROPERTIES — Developer B
// ==========================================

'/api/properties': {
  get: {
    tags: ['Properties'],
    summary: 'Search and filter approved properties',

    security: [
      {
        bearerAuth: [],
      },
    ],

    parameters: [
      {
        name: 'search',
        in: 'query',
        required: false,
        schema: {
          type: 'string',
        },
        description: 'Search by property title or description',
      },

      {
        name: 'minPrice',
        in: 'query',
        required: false,
        schema: {
          type: 'number',
        },
      },

      {
        name: 'maxPrice',
        in: 'query',
        required: false,
        schema: {
          type: 'number',
        },
      },

      {
        name: 'rooms',
        in: 'query',
        required: false,
        schema: {
          type: 'integer',
        },
      },

      {
        name: 'furnished',
        in: 'query',
        required: false,
        schema: {
          type: 'boolean',
        },
      },

      {
        name: 'categoryId',
        in: 'query',
        required: false,
        schema: {
          type: 'string',
          format: 'uuid',
        },
      },

      {
        name: 'locationId',
        in: 'query',
        required: false,
        schema: {
          type: 'string',
          format: 'uuid',
        },
      },
    ],

    responses: {
      200: {
        description: 'Properties returned successfully',
      },

      401: {
        description: 'Unauthorized',
      },

      500: {
        description: 'Server error',
      },
    },
  },
},

'/api/properties/{id}': {
  get: {
    tags: ['Properties'],
    summary: 'Get property details',

    security: [
      {
        bearerAuth: [],
      },
    ],

    parameters: [
      {
        name: 'id',
        in: 'path',
        required: true,

        schema: {
          type: 'string',
          format: 'uuid',
        },
      },
    ],

    responses: {
      200: {
        description: 'Property details returned successfully',
      },

      401: {
        description: 'Unauthorized',
      },

      404: {
        description: 'Property not found or not available',
      },

      500: {
        description: 'Server error',
      },
    },
  },
},
      // ==========================================
      // FAVORITES — Developer B
      // ==========================================

      '/api/favorites': {
        get: {
          tags: ['Favorites'],
          summary: 'Get my favorite properties',

          security: [
            {
              bearerAuth: [],
            },
          ],

          responses: {
            200: {
              description: 'Favorites returned successfully',
            },

            401: {
              description: 'Unauthorized',
            },
          },
        },

        post: {
          tags: ['Favorites'],
          summary: 'Add a property to favorites',

          security: [
            {
              bearerAuth: [],
            },
          ],

          requestBody: {
            required: true,

            content: {
              'application/json': {
                schema: {
                  type: 'object',

                  required: ['propertyId'],

                  properties: {
                    propertyId: {
                      type: 'string',
                      format: 'uuid',
                      example: 'property-uuid',
                    },
                  },
                },
              },
            },
          },

          responses: {
            201: {
              description: 'Favorite created',
            },

            400: {
              description: 'Invalid request',
            },

            401: {
              description: 'Unauthorized',
            },

            404: {
              description: 'Property not found',
            },
          },
        },
      },

      '/api/favorites/{propertyId}': {
        delete: {
          tags: ['Favorites'],
          summary: 'Remove a property from favorites',

          security: [
            {
              bearerAuth: [],
            },
          ],

          parameters: [
            {
              name: 'propertyId',
              in: 'path',
              required: true,

              schema: {
                type: 'string',
                format: 'uuid',
              },
            },
          ],

          responses: {
            200: {
              description: 'Favorite removed',
            },

            401: {
              description: 'Unauthorized',
            },

            404: {
              description: 'Favorite not found',
            },
          },
        },
      },

      // ==========================================
      // MESSAGES — Developer B
      // ==========================================

      '/api/messages': {
        get: {
          tags: ['Messages'],
          summary: 'Get all my messages',

          security: [
            {
              bearerAuth: [],
            },
          ],

          responses: {
            200: {
              description: 'Messages returned successfully',
            },

            401: {
              description: 'Unauthorized',
            },
          },
        },

        post: {
          tags: ['Messages'],
          summary: 'Send a message',

          security: [
            {
              bearerAuth: [],
            },
          ],

          requestBody: {
            required: true,

            content: {
              'application/json': {
                schema: {
                  type: 'object',

                  required: ['receiverId', 'text'],

                  properties: {
                    receiverId: {
                      type: 'string',
                      format: 'uuid',
                      example: 'user-uuid',
                    },

                    text: {
                      type: 'string',
                      example:
                        'I am interested in this property.',
                    },

                    propertyId: {
                      type: 'string',
                      format: 'uuid',
                      example: 'property-uuid',
                    },
                  },
                },
              },
            },
          },

          responses: {
            201: {
              description: 'Message sent successfully',
            },

            400: {
              description: 'Invalid request',
            },

            401: {
              description: 'Unauthorized',
            },

            500: {
              description: 'Server error',
            },
          },
        },
      },

      '/api/messages/{contactUserId}': {
        get: {
          tags: ['Messages'],
          summary: 'Get conversation with another user',

          security: [
            {
              bearerAuth: [],
            },
          ],

          parameters: [
            {
              name: 'contactUserId',
              in: 'path',
              required: true,

              schema: {
                type: 'string',
                format: 'uuid',
              },
            },

            {
              name: 'propertyId',
              in: 'query',
              required: false,

              schema: {
                type: 'string',
                format: 'uuid',
              },
            },
          ],

          responses: {
            200: {
              description: 'Conversation returned',
            },

            401: {
              description: 'Unauthorized',
            },
          },
        },
      },

      // ==========================================
      // RENTAL REQUESTS — Developer B
      // ==========================================

      '/api/rental-requests': {
        get: {
          tags: ['Rental Requests'],
          summary: 'Get my rental requests',

          security: [
            {
              bearerAuth: [],
            },
          ],

          responses: {
            200: {
              description: 'Rental requests returned',
            },

            401: {
              description: 'Unauthorized',
            },
          },
        },

        post: {
          tags: ['Rental Requests'],
          summary: 'Create a rental request',

          security: [
            {
              bearerAuth: [],
            },
          ],

          requestBody: {
            required: true,

            content: {
              'application/json': {
                schema: {
                  type: 'object',

                  required: ['propertyId'],

                  properties: {
                    propertyId: {
                      type: 'string',
                      format: 'uuid',
                      example: 'property-uuid',
                    },

                    message: {
                      type: 'string',
                      example:
                        'I would like to rent this house.',
                    },
                  },
                },
              },
            },
          },

          responses: {
            201: {
              description: 'Rental request created',
            },

            400: {
              description: 'Invalid request',
            },

            401: {
              description: 'Unauthorized',
            },

            404: {
              description: 'Property not found',
            },
          },
        },
      },

      // ==========================================
      // LEASES — Developer B
      // ==========================================

      '/api/leases': {
        get: {
          tags: ['Leases'],
          summary: 'Get my leases',

          security: [
            {
              bearerAuth: [],
            },
          ],

          responses: {
            200: {
              description: 'Leases returned successfully',
            },

            401: {
              description: 'Unauthorized',
            },
          },
        },
      },

      // ==========================================
      // NOTIFICATIONS — Developer B
      // ==========================================

      '/api/notifications': {
        get: {
          tags: ['Notifications'],
          summary: 'Get my notifications',

          security: [
            {
              bearerAuth: [],
            },
          ],

          responses: {
            200: {
              description: 'Notifications returned successfully',
            },

            401: {
              description: 'Unauthorized',
            },
          },
        },
      },
    },
  },

  apis: [],
};

const swaggerSpec = swaggerJsdoc(options);

module.exports = swaggerSpec;