# Enterprise Event Management & Stall Booking Backend

A scalable, production-grade backend architecture built with **Node.js**, **Express.js**, **MongoDB**, **Redis**, **BullMQ**, **Socket.IO**, **Razorpay**, **Docker**, and **GitHub Actions**.

---

## 📁 Architecture & Directory Layout

```
Event_Mangement_backend/
├── .github/
│   └── workflows/
│       └── ci-cd.yml             # GitHub Actions CI/CD pipeline
├── docker/
│   ├── Dockerfile                # Production Docker container spec
│   ├── Dockerfile.dev            # Development Docker container spec
│   └── docker-compose.yml        # Docker composition for App, MongoDB & Redis
├── src/
│   ├── config/                   # Centralized application configurations
│   │   ├── db.config.js          # MongoDB connection initialization
│   │   ├── redis.config.js       # Redis client instance config
│   │   ├── razorpay.config.js    # Razorpay SDK initialization
│   │   ├── logger.config.js      # Structured logging setup
│   │   └── env.config.js         # Environment variable schemas & exports
│   ├── controllers/              # HTTP request & response management
│   ├── services/                 # Enterprise domain business logic
│   ├── models/                   # Database schemas & Mongoose data models
│   ├── routes/                   # API endpoint route declarations
│   ├── middlewares/              # Express request processing middlewares
│   │   ├── auth.middleware.js    # JWT verification & RBAC authorization
│   │   ├── upload.middleware.js  # File upload middleware (Multer/S3)
│   │   ├── error.middleware.js   # Global error handling middleware
│   │   ├── rateLimiter.js        # Redis-backed rate limiting
│   │   └── validate.middleware.js# Request validation payload middleware
│   ├── validations/              # Payload validation schemas (Joi/Zod)
│   ├── sockets/                  # Real-time WebSocket handlers (Socket.IO)
│   │   ├── socket.init.js        # Socket initialization & handshake setup
│   │   ├── handlers/             # Real-time event logic (e.g. live seat locking)
│   │   └── listeners/            # Event listener bindings
│   ├── queues/                   # Background job execution (BullMQ)
│   │   ├── queue.config.js       # Queue setup with Redis instance
│   │   ├── producers/            # Job producers/publishers
│   │   └── workers/              # Job consumers/workers
│   ├── uploads/                  # Local storage buffer for media files
│   │   ├── temp/                 # Temporary upload buffer
│   │   └── permanent/            # Staged file storage
│   ├── utils/                    # Utility wrappers (ApiError, ApiResponse, asyncHandler)
│   ├── constants/                # Domain constants & status enums
│   ├── app.js                    # Express app configuration
│   └── server.js                 # HTTP server entry point & graceful shutdown
├── .env.example                  # Environment variable blueprint
├── .gitignore                    # Git exclusion rules
├── package.json                  # Dependencies & script runner configuration
└── README.md                     # Project documentation
```
