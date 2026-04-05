# WearVirtually Backend

This is the Node.js + Express REST API server for the WearVirtually Final Year BSCS Project. It provides all backend services for user authentication, product management, shop operations, orders, and social features.

## Overview

The backend is responsible for:
- User and shop owner authentication and account management
- Product catalog and inventory management
- Shop storefront management and operations
- Order processing and fulfillment workflows
- Saved items (wishlists) and user engagement data
- Social features (chat, follows, notifications)
- AR session and user measurement data
- Image upload and storage via Cloudinary

## Technology Stack

- **Runtime:** Node.js
- **Framework:** Express.js
- **Database:** MongoDB + Mongoose ODM
- **Authentication:** JWT (JSON Web Tokens)
- **Password Security:** bcryptjs
- **File Upload:** Multer
- **Media Storage:** Cloudinary
- **Input Validation:** express-validator
- **Server Reload:** Nodemon (dev)
- **CORS Management:** cors
- **Environment Config:** dotenv

## Project Structure

```
backend/
├── src/
│   ├── config/
│   │   ├── database.js          # MongoDB connection setup
│   │   └── cloudinary.js        # Cloudinary SDK and helpers
│   ├── controllers/
│   │   ├── authController.js    # Auth endpoints (register, login, profile, password)
│   │   ├── productController.js # Product CRUD and listing
│   │   ├── shopController.js    # Shop management and profiles
│   │   ├── orderController.js   # Order creation and status tracking
│   │   └── savedItemController.js # Wishlist management
│   ├── middleware/
│   │   ├── auth.js              # JWT verification & protected routes
│   │   ├── upload.js            # Multer file upload configuration
│   │   └── errorHandler.js      # Centralized error handling
│   ├── models/
│   │   ├── User.js              # User account model
│   │   ├── Shop.js              # Shop profile model
│   │   ├── Product.js           # Product model with images and AR data
│   │   ├── ProductVariant.js    # Product variants (size, color, etc.)
│   │   ├── Order.js             # Order header model
│   │   ├── OrderItem.js         # Order line items
│   │   ├── SavedItem.js         # Saved/favorited products
│   │   ├── Review.js            # Product reviews and ratings
│   │   ├── Chat.js              # Chat conversation model
│   │   ├── Message.js           # Individual chat messages
│   │   ├── Notification.js      # User notifications
│   │   ├── ARSession.js         # AR try-on session data
│   │   ├── UserMeasurement.js   # User body measurements for AR
│   │   ├── UserFollow.js        # User-to-user follow relationships
│   │   ├── ShopFollow.js        # User-to-shop follow relationships
│   │   ├── ShopStaff.js         # Shop staff members
│   │   └── index.js             # Model exports
│   ├── routes/
│   │   ├── auth.js              # Authentication endpoints
│   │   ├── products.js          # Product endpoints
│   │   ├── shops.js             # Shop endpoints
│   │   ├── orders.js            # Order endpoints
│   │   └── savedItems.js        # Saved items endpoints
│   └── server.js                # Express app entry point
├── .env.example                 # Environment variables template
├── .gitignore                   # Git ignore rules
└── package.json                 # Dependencies and scripts
```

## Environment Configuration

Create a `.env` file in the backend root (use `.env.example` as a template):

```bash
# MongoDB Connection
MONGODB_URI=mongodb://localhost:27017/wearvirtually
# For MongoDB Atlas: mongodb+srv://username:password@cluster.mongodb.net/wearvirtually

# JWT Authentication
JWT_SECRET=your_super_secret_jwt_key_change_this_in_production
JWT_EXPIRE=7d

# Cloudinary (Image Storage)
# Get credentials from https://cloudinary.com/console
CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret

# Server Configuration
PORT=3000
NODE_ENV=development

# CORS Settings
# List frontend addresses separated by commas
CORS_ORIGIN=http://localhost:8081,exp://192.168.1.100:8081

# File Upload Limits
MAX_FILE_SIZE=5242880  # 5MB in bytes
```

## Getting Started

### 1. Install Dependencies

```bash
cd backend
npm install
```

### 2. Setup Environment Variables

```bash
cp .env.example .env
# Edit .env with your actual credentials
```

### 3. Setup MongoDB

**Option A: Local MongoDB**
```bash
mongod
```

**Option B: MongoDB Atlas (Cloud)**
1. Create account at https://www.mongodb.com/cloud/atlas
2. Create a cluster and get connection URI
3. Update `MONGODB_URI` in `.env`

### 4. Setup Cloudinary

1. Create account at https://cloudinary.com
2. Get API credentials from Dashboard
3. Update Cloudinary variables in `.env`

### 5. Start Development Server

```bash
npm run dev
```

Server will run on `http://localhost:3000`

## Running the Server

### Development Mode (with hot reload)
```bash
npm run dev
```

### Production Mode
```bash
npm start
```

## API Routes Overview

### Authentication (`/api/auth`)

- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - Login and get JWT token
- `GET /api/auth/me` - Get current user profile (Protected)
- `PUT /api/auth/profile` - Update profile information (Protected)
- `PUT /api/auth/change-password` - Change account password (Protected)
- `POST /api/auth/avatar` - Upload profile avatar (Protected)

### Products (`/api/products`)

- `GET /api/products` - List all products with filters
- `GET /api/products/:id` - Get product details
- `POST /api/products` - Create new product (Shop Owner)
- `PUT /api/products/:id` - Update product (Shop Owner)
- `DELETE /api/products/:id` - Delete product (Shop Owner)

### Shops (`/api/shops`)

- `GET /api/shops` - List all shops
- `GET /api/shops/:id` - Get shop profile
- `GET /api/shops/:id/products` - Get shop's products
- `POST /api/shops` - Create new shop (Protected)
- `GET /api/shops/my/shop` - Get current user's shop (Shop Owner)
- `PUT /api/shops/:id` - Update shop profile (Shop Owner)

### Orders (`/api/orders`)

- `POST /api/orders` - Create new order (Protected)
- `GET /api/orders` - Get user's orders (Protected)
- `GET /api/orders/shop/:shopId` - Get shop's orders (Shop Owner)
- `GET /api/orders/:id` - Get order details (Protected)
- `PUT /api/orders/:id/status` - Update order status (Shop Owner)

### Saved Items (`/api/saved-items`)

- `GET /api/saved-items` - Get user's saved items (Protected)
- `POST /api/saved-items` - Add product to saved (Protected)
- `DELETE /api/saved-items/:id` - Remove from saved (Protected)
- `GET /api/saved-items/check/:productId` - Check if product is saved (Protected)

### Health Check

- `GET /` - API metadata and status
- `GET /health` - Health check endpoint

## Authentication

Protected routes require JWT token in the Authorization header:

```
Authorization: Bearer YOUR_JWT_TOKEN
```

### User Roles

- **user** - Regular user (can browse, order, save items)
- **shop_owner** - Shop owner (can manage shop and products)

Access control is enforced per endpoint based on user role.

## File Upload

### Supported Formats

- JPEG, JPG, PNG, GIF, WebP

### Single Image Upload

```
POST /api/auth/avatar
Content-Type: multipart/form-data

Field: image
```

### Multiple Image Upload (Products)

```
Content-Type: multipart/form-data

Fields:
- thumbnail (file)
- images (files array)
```

All images are uploaded to Cloudinary and referenced via URL and public ID.

## Error Handling

All error responses follow a consistent JSON format:

```json
{
  "message": "Error description",
  "errors": ["Validation error 1", "Validation error 2"]
}
```

### Status Codes

- `200` - OK / Success
- `201` - Created
- `400` - Bad Request / Validation Error
- `401` - Unauthorized (invalid/missing JWT)
- `403` - Forbidden (insufficient permissions)
- `404` - Not Found
- `500` - Server Error

## Database Models

### User
- Email, username, password (hashed)
- Profile info (full name, phone, avatar)
- Role-based access (user or shop_owner)
- Timestamps

### Shop
- Shop name, username, business type
- Contact and location info
- Logo and banner images on Cloudinary
- Owner reference and staff

### Product
- Name, description, category, price
- Thumbnail and multiple product images
- Stock quantity
- Variants (size, color)
- AR-compatible metadata

### Order
- Order number and reference
- User and shop references
- Item list and totals
- Shipping address and payment method
- Status tracking (pending, processing, shipped, delivered)

### Notification
- User reference
- Message and type
- Read status
- Timestamp

## Best Practices

### 1. Use Transactions for Multi-Model Operations

```javascript
const session = await mongoose.startSession();
session.startTransaction();

try {
  const order = await Order.create([orderData], { session });
  await OrderItem.create(orderItems, { session });
  await session.commitTransaction();
} catch (error) {
  await session.abortTransaction();
  throw error;
} finally {
  session.endSession();
}
```

### 2. Clean Up Cloudinary Images

When deleting products or users, always remove their images from Cloudinary:

```javascript
const { deleteImage } = require('./config/cloudinary');

const product = await Product.findById(productId);
if (product.thumbnail?.publicId) {
  await deleteImage(product.thumbnail.publicId);
}
await Product.findByIdAndDelete(productId);
```

### 3. Use Population for Related Data

Leverage Mongoose populate to fetch related documents:

```javascript
const order = await Order.findById(orderId)
  .populate('userId')
  .populate('shopId')
  .populate('items');
```

### 4. Validate Input Early

Use express-validator middleware to catch invalid input before processing:

```javascript
const { body, validationResult } = require('express-validator');

router.post(
  '/api/auth/register',
  [
    body('email').isEmail(),
    body('password').isLength({ min: 6 })
  ],
  (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }
    // Process request
  }
);
```

## Testing the API

### Register a User

```bash
POST http://localhost:3000/api/auth/register
Content-Type: application/json

{
  "username": "johndoe",
  "email": "john@example.com",
  "password": "SecurePass123!",
  "fullName": "John Doe",
  "phone": "+1234567890"
}
```

### Login

```bash
POST http://localhost:3000/api/auth/login
Content-Type: application/json

{
  "email": "john@example.com",
  "password": "SecurePass123!"
}
```

Response includes `token` - use in Authorization header for protected routes.

### Get Products

```bash
GET http://localhost:3000/api/products?category=dress&minPrice=50&maxPrice=200
```

### Create Shop

```bash
POST http://localhost:3000/api/shops
Authorization: Bearer YOUR_JWT_TOKEN
Content-Type: multipart/form-data

{
  "shopName": "Fashion Hub",
  "shopUsername": "fashionhub",
  "businessType": "small_business",
  "email": "shop@example.com",
  "phone": "+1234567890",
  "address": "123 Main St",
  "city": "New York",
  "country": "USA",
  "description": "Best fashion store",
  "logo": [file],
  "banner": [file]
}
```

## Troubleshooting

### MongoDB Connection Fails
- Ensure MongoDB is running (`mongod` for local)
- Check `MONGODB_URI` in `.env`
- For Atlas, verify whitelist IP and credentials

### Cloudinary Upload Fails
- Verify API credentials in `.env`
- Check file size limits
- Ensure image formats are supported (JPEG, PNG, GIF, WebP)

### JWT Authentication Errors
- Verify token format: `Authorization: Bearer <token>`
- Check token expiration
- Ensure `JWT_SECRET` matches across requests

### CORS Errors
- Add frontend address to `CORS_ORIGIN` in `.env`
- Separate multiple origins with commas

## Future Enhancements

- Real-time notifications with WebSocket support
- Payment gateway integration
- Advanced search and recommendation engine
- Batch operations and bulk imports
- Analytics and reporting dashboard
- API rate limiting and caching strategies

## License

This backend is part of the WearVirtually project, which includes an MIT License. See the LICENSE file in the root repository for details.
