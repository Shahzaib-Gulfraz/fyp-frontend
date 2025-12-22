# WearVirtually Backend - Models Documentation

## Overview
This directory contains all Mongoose models for the WearVirtually application. The models are designed for MongoDB with Cloudinary integration for image storage.

## Models List

### Core Models
1. **User** - User accounts (both regular users and shop owners)
2. **Shop** - Shop profiles and business information
3. **Product** - Product catalog with images and AR support
4. **ProductVariant** - Product variations (size, color)

### E-commerce Models
5. **Order** - Customer orders with status tracking
6. **OrderItem** - Individual items within orders
7. **SavedItem** - User's saved/favorited products

### Communication Models
8. **Chat** - Chat conversations between users
9. **Message** - Individual messages within chats

### Review & Rating
10. **Review** - Product reviews with ratings

### Shop Management
11. **ShopStaff** - Staff members for multi-user shop management

### AR Features
12. **ARSession** - AR try-on session data
13. **UserMeasurement** - User body measurements for AR fitting

### Notifications & Social
14. **Notification** - User notifications
15. **UserFollow** - User following relationships
16. **ShopFollow** - Users following shops

## Installation

### 1. Install Dependencies
```bash
cd backend
npm install
```

### 2. Setup Environment Variables
Create a `.env` file in the backend root directory:

```bash
cp .env.example .env
```

Then edit `.env` with your actual values:
- MongoDB connection string
- JWT secret key
- Cloudinary credentials (from https://cloudinary.com)

### 3. Setup MongoDB
**Option A: Local MongoDB**
```bash
# Install MongoDB locally
# Start MongoDB service
mongod
```

**Option B: MongoDB Atlas (Cloud)**
1. Create account at https://www.mongodb.com/cloud/atlas
2. Create a cluster
3. Get connection string
4. Update `MONGODB_URI` in `.env`

### 4. Setup Cloudinary
1. Create account at https://cloudinary.com
2. Get credentials from dashboard
3. Update Cloudinary variables in `.env`

## Usage

### Importing Models
```javascript
// Import all models
const models = require('./models');
const { User, Product, Order } = models;

// Or import individually
const User = require('./models/User');
const Product = require('./models/Product');
```

### Example: Create a User
```javascript
const User = require('./models/User');

const newUser = await User.create({
  username: 'johndoe',
  email: 'john@example.com',
  password: 'SecurePass123!',
  fullName: 'John Doe',
  phone: '+1234567890',
  role: 'user'
});
```

### Example: Upload Product with Images
```javascript
const Product = require('./models/Product');
const { uploadImage, uploadMultipleImages } = require('./config/cloudinary');

// Upload images to Cloudinary
const thumbnail = await uploadImage(thumbnailFile, 'products/thumbnails');
const images = await uploadMultipleImages(imageFiles, 'products');

// Create product
const product = await Product.create({
  shopId: shopId,
  name: 'Summer Dress',
  description: 'Beautiful summer dress',
  category: 'dress',
  price: 89.99,
  thumbnail: thumbnail,
  images: images,
  stockQuantity: 50
});
```

### Example: User Authentication
```javascript
const User = require('./models/User');

// Login
const user = await User.findOne({ email: 'john@example.com' }).select('+password');
const isMatch = await user.comparePassword(candidatePassword);

if (isMatch) {
  // Generate JWT token
  const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET);
}
```

### Example: Create Order
```javascript
const Order = require('./models/Order');
const OrderItem = require('./models/OrderItem');

// Create order
const order = await Order.create({
  userId: userId,
  shopId: shopId,
  subtotal: 89.99,
  total: 89.99,
  shippingAddress: {
    street: '123 Main St',
    city: 'New York',
    country: 'USA',
    zipCode: '10001',
    phone: '+1234567890'
  },
  paymentMethod: 'card'
});

// Add order items
await OrderItem.create({
  orderId: order._id,
  productId: productId,
  productName: 'Summer Dress',
  unitPrice: 89.99,
  quantity: 1,
  subtotal: 89.99
});
```

## Model Features

### Validation
All models include comprehensive validation:
- Required fields
- String length limits
- Number ranges
- Email format validation
- Custom validators (username format, etc.)

### Indexes
Optimized indexes for common queries:
- Foreign key indexes
- Compound indexes for unique constraints
- Text search indexes (where applicable)

### Middleware Hooks
- **Pre-save**: Password hashing, order number generation
- **Post-save**: Update related documents (reviews update product ratings)
- **Pre-delete**: Cleanup related data

### Cloudinary Integration
Models with image fields include:
- `url`: Public Cloudinary URL
- `publicId`: Cloudinary public ID for deletion

### Timestamps
All models include automatic `createdAt` and `updatedAt` timestamps.

## Running the Server

### Development Mode
```bash
npm run dev
```

### Production Mode
```bash
npm start
```

## Database Connection
The database connection is handled in `src/config/database.js` with:
- Automatic reconnection
- Error handling
- Graceful shutdown
- Connection event logging

## Cloudinary Helper Functions
Located in `src/config/cloudinary.js`:
- `uploadImage(file, folder)` - Upload single image
- `uploadMultipleImages(files, folder)` - Upload multiple images
- `deleteImage(publicId)` - Delete single image
- `deleteMultipleImages(publicIds)` - Delete multiple images

## Best Practices

### 1. Always Use Transactions for Related Operations
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

### 2. Delete Cloudinary Images When Deleting Documents
```javascript
const { deleteImage } = require('./config/cloudinary');

// Delete product and its images
const product = await Product.findById(productId);
if (product.thumbnail?.publicId) {
  await deleteImage(product.thumbnail.publicId);
}
await Product.findByIdAndDelete(productId);
```

### 3. Use Populate for Related Data
```javascript
const order = await Order.findById(orderId)
  .populate('userId', 'username email')
  .populate('shopId', 'shopName');
```

### 4. Handle Errors Properly
```javascript
try {
  const user = await User.create(userData);
} catch (error) {
  if (error.code === 11000) {
    // Duplicate key error
    throw new Error('Email or username already exists');
  }
  throw error;
}
```

## Next Steps

1. **Create API Routes** - Build Express routes for each model
2. **Add Authentication Middleware** - Protect routes with JWT
3. **Implement File Upload** - Use Multer for handling file uploads
4. **Add Validation Middleware** - Use express-validator for request validation
5. **Create Controllers** - Separate business logic from routes
6. **Add Error Handling** - Centralized error handling middleware
7. **Setup Testing** - Write unit and integration tests

## Support

For issues or questions, refer to:
- [Mongoose Documentation](https://mongoosejs.com/docs/)
- [Cloudinary Documentation](https://cloudinary.com/documentation)
- [MongoDB Documentation](https://docs.mongodb.com/)
