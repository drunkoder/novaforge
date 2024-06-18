import express from 'express';
import swaggerJsdoc from 'swagger-jsdoc';
import swaggerUi from 'swagger-ui-express';
import * as authRoutes from './src/routes/auth.js';
import * as miningAreaRoutes from './src/routes/miningAreas.js';
import * as productRoutes from './src/routes/products.js';
import * as userRoutes from './src/routes/users.js';
// import * as userInventoryRoutes from './src/routes/userInventory.js'
import path from 'path';

const router = express.Router();
  
router.use('/auth', authRoutes.default);
router.use('/miningareas', miningAreaRoutes.default);
router.use('/products', productRoutes.default);
router.use('/users', userRoutes.default);
// router.use('./inventory', userInventoryRoutes.default);

// setup
const swaggerOptions = {
    definition: {
        openapi: '3.0.0',
        info: {
            title: 'NovaForge API Documentation',
            version: '1.0.0',
            description: 'API documentation for the NovaForge application',
        },
        servers: [
            {
                url: 'http://localhost:3000', // Adjust the URL based on your server configuration
                description: 'Development server',
            },
        ],
    },
    // Path to the API routes files
    apis: ['backend/src/routes/*.js'],
    paths: {
        '/api/auth/login': {
            post: {
                summary: 'Login user',
                description: 'Authenticate user credentials and generate JWT token for authorization',
                requestBody: {
                    content: {
                        'application/json': {
                            schema: {
                                type: 'object',
                                properties: {
                                    email: {
                                        type: 'string',
                                        description: 'User email',
                                    },
                                    password: {
                                        type: 'string',
                                        description: 'User password',
                                    },
                                },
                            },
                        },
                    },
                },
                responses: {
                    '200': {
                        description: 'Successful operation',
                        content: {
                            'application/json': {
                                schema: {
                                    type: 'object',
                                    properties: {
                                        message: {
                                            type: 'string',
                                            description: 'Response message',
                                        },
                                        user: {
                                            type: 'object',
                                            description: 'Authenticated user information',
                                        },
                                        token: {
                                            type: 'string',
                                            description: 'JWT token for authorization',
                                        },
                                    },
                                },
                            },
                        },
                    },
                    '400': {
                        description: 'Invalid credentials',
                    },
                    '500': {
                        description: 'Server error',
                    },
                },
            },
        },
        '/api/miningareas': {
            get: {
                summary: 'Get all mining areas',
                description: 'Retrieve a list of all mining areas with pagination and search options',
                parameters: [
                    {
                        name: 'page',
                        in: 'query',
                        description: 'Page number',
                        required: false,
                        schema: {
                            type: 'integer',
                            format: 'int32',
                            minimum: 1,
                        },
                    },
                    {
                        name: 'limit',
                        in: 'query',
                        description: 'Number of items per page',
                        required: false,
                        schema: {
                            type: 'integer',
                            format: 'int32',
                            minimum: 1,
                        },
                    },
                    {
                        name: 'search',
                        in: 'query',
                        description: 'Search query to filter mining areas by name',
                        required: false,
                        schema: {
                            type: 'string',
                        },
                    },
                ],
                responses: {
                    '200': {
                        description: 'Successful operation',
                        content: {
                            'application/json': {
                                schema: {
                                    type: 'array',
                                    items: {
                                        $ref: '#/components/schemas/MiningArea', // Reference to the MiningArea schema definition
                                    },
                                },
                            },
                        },
                    },
                    '500': {
                        description: 'Server error',
                    },
                },
            },
            post: {
                summary: 'Create a new mining area',
                description: 'Create a new mining area with provided details',
                requestBody: {
                    content: {
                        'application/json': {
                            schema: {
                                $ref: '#/components/schemas/NewMiningArea', // Reference to the NewMiningArea schema definition
                            },
                        },
                    },
                },
                responses: {
                    '201': {
                        description: 'Mining area created successfully',
                        content: {
                            'application/json': {
                                schema: {
                                    $ref: '#/components/schemas/MiningArea', // Reference to the MiningArea schema definition
                                },
                            },
                        },
                    },
                    '400': {
                        description: 'Invalid request data',
                    },
                    '500': {
                        description: 'Server error',
                    },
                },
            },
        },
        // Define paths for other routes similarly
    },
    components: {
        schemas: {
            MiningArea: {
                type: 'object',
                properties: {
                    _id: {
                        type: 'string',
                        description: 'Mining area ID',
                    },
                    name: {
                        type: 'string',
                        description: 'Mining area name',
                    },
                    type: {
                        type: 'string',
                        description: 'Mining area type (e.g., planet, asteroid)',
                    },
                    description: {
                        type: 'string',
                        description: 'Mining area description',
                    },
                    image: {
                        type: 'string',
                        description: 'URL of the mining area image',
                    },
                    products: {
                        type: 'array',
                        items: {
                            $ref: '#/components/schemas/MiningAreaProduct', // Reference to the MiningAreaProduct schema definition
                        },
                    },
                },
            },
            MiningAreaProduct: {
                type: 'object',
                properties: {
                    product: {
                        type: 'object',
                        properties: {
                            _id: {
                                type: 'string',
                                description: 'Product ID',
                            },
                            name: {
                                type: 'string',
                                description: 'Product name',
                            },
                            description: {
                                type: 'string',
                                description: 'Product description',
                            },
                            image: {
                                type: 'string',
                                description: 'URL of the product image',
                            },
                        },
                    },
                    price: {
                        type: 'number',
                        description: 'Price of the product in the mining area',
                    },
                    quantity: {
                        type: 'integer',
                        description: 'Quantity of the product available in the mining area',
                    },
                },
            },
            NewMiningArea: {
                type: 'object',
                properties: {
                    name: {
                        type: 'string',
                        description: 'Mining area name',
                    },
                    type: {
                        type: 'string',
                        description: 'Mining area type (e.g., planet, asteroid)',
                    },
                    description: {
                        type: 'string',
                        description: 'Mining area description',
                    },
                    image: {
                        type: 'string',
                        description: 'URL of the mining area image',
                    },
                    products: {
                        type: 'array',
                        items: {
                            type: 'string',
                            description: 'Product IDs associated with the mining area',
                        },
                    },
                },
            },
        },
    },
};


const swaggerSpec = swaggerJsdoc(swaggerOptions);
router.use('/swagger', swaggerUi.serve);
router.get('/swagger', swaggerUi.setup(swaggerSpec));

export default router;
