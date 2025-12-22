# WearVirtually Backend - Quick Start Guide

## 🚀 Setup Instructions

### 1. Install Dependencies
```bash
cd backend
npm install
```

### 2. Configure Environment Variables
Create a `.env` file in the backend root:

```bash
cp .env.example .env
```

Edit `.env` with your credentials:
```env
# MongoDB
MONGODB_URI=mongodb://localhost:27017/wearvirtually
# Or use MongoDB Atlas: mongodb+srv://username:password@cluster.mongodb.net/wearvirtually

# JWT
JWT_SECRET=your_super_secret_jwt_key_change_this
JWT_EXPIRE=7d

# Cloudinary (get from https://cloudinary.com/console)
CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret

# Server
PORT=3000
NODE_ENV=development

# CORS (React Native Expo dev server)
CORS_ORIGIN=http://localhost:8081,exp://192.168.1.100:8081

# File Upload
MAX_FILE_SIZE=5242880
```

### 3. Start MongoDB
**Local MongoDB:**
```bash
mongod
```

**Or use MongoDB Atlas** (cloud) - just update `MONGODB_URI` in `.env`

### 4. Run the Server
**Development mode (with auto-reload):**
```bash
npm run dev
```

**Production mode:**
```bash
npm start
```

Server will run on `http://localhost:3000`

---

## 📡 API Endpoints

### Authentication (`/api/auth`)
- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - Login user
- `GET /api/auth/me` - Get current user (Protected)
- `PUT /api/auth/profile` - Update profile (Protected)
- `PUT /api/auth/change-password` - Change password (Protected)
- `POST /api/auth/avatar` - Upload avatar (Protected)

### Products (`/api/products`)
- `GET /api/products` - Get all products (with filters)
- `GET /api/products/:id` - Get single product
- `POST /api/products` - Create product (Shop Owner)
- `PUT /api/products/:id` - Update product (Shop Owner)
- `DELETE /api/products/:id` - Delete product (Shop Owner)

### Shops (`/api/shops`)
- `GET /api/shops` - Get all shops
- `GET /api/shops/:id` - Get single shop
- `GET /api/shops/:id/products` - Get shop products
- `POST /api/shops` - Create shop (Protected)
- `GET /api/shops/my/shop` - Get my shop (Shop Owner)
- `PUT /api/shops/:id` - Update shop (Shop Owner)

### Orders (`/api/orders`)
- `POST /api/orders` - Create order (Protected)
- `GET /api/orders` - Get user's orders (Protected)
- `GET /api/orders/shop/:shopId` - Get shop orders (Shop Owner)
- `GET /api/orders/:id` - Get single order (Protected)
- `PUT /api/orders/:id/status` - Update order status (Shop Owner)

### Saved Items (`/api/saved-items`)
- `GET /api/saved-items` - Get saved items (Protected)
- `POST /api/saved-items` - Add to saved (Protected)
- `DELETE /api/saved-items/:id` - Remove from saved (Protected)
- `GET /api/saved-items/check/:productId` - Check if saved (Protected)

---

## 🧪 Testing the API

### 1. Register a User
```bash
POST http://localhost:3000/api/auth/register
Content-Type: application/json

{
  "username": "johndoe",
  "email": "john@example.com",
  "password": "SecurePass123!",
  "fullName": "John Doe",
  "phone": "+1234567890",
  "role": "user"
}
```

### 2. Login
```bash
POST http://localhost:3000/api/auth/login
Content-Type: application/json

{
  "email": "john@example.com",
  "password": "SecurePass123!"
}
```

Response includes `token` - use this in Authorization header for protected routes.

### 3. Get Products
```bash
GET http://localhost:3000/api/products?category=dress&minPrice=50&maxPrice=200
```

### 4. Create Shop (Protected)
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

---

## 📁 Project Structure

```
backend/
├── src/
│   ├── config/
│   │   ├── database.js          # MongoDB connection
│   │   └── cloudinary.js        # Cloudinary utilities
│   ├── controllers/
│   │   ├── authController.js    # Auth logic
│   │   ├── productController.js # Product logic
│   │   ├── shopController.js    # Shop logic
│   │   ├── orderController.js   # Order logic
│   │   └── savedItemController.js # Saved items logic
│   ├── middleware/
│   │   ├── auth.js              # JWT authentication
│   │   ├── upload.js            # File upload (Multer)
│   │   └── errorHandler.js      # Error handling
│   ├── models/
│   │   ├── User.js              # User model
│   │   ├── Shop.js              # Shop model
│   │   ├── Product.js           # Product model
│   │   ├── Order.js             # Order model
│   │   └── ... (17 models total)
│   ├── routes/
│   │   ├── auth.js              # Auth routes
│   │   ├── products.js          # Product routes
│   │   ├── shops.js             # Shop routes
│   │   ├── orders.js            # Order routes
│   │   └── savedItems.js        # Saved items routes
│   └── server.js                # Main server file
├── .env.example                 # Environment template
├── .gitignore                   # Git ignore
└── package.json                 # Dependencies
```

---

## 🔐 Authentication

All protected routes require JWT token in Authorization header:
```
Authorization: Bearer YOUR_JWT_TOKEN
```

### Role-Based Access:
- **user** - Regular users (can browse, order, save items)
- **shop_owner** - Shop owners (can manage shop, products, orders)

---

## 📸 Image Upload

Images are uploaded to Cloudinary. Supported formats: `jpeg`, `jpg`, `png`, `gif`, `webp`

**Single image:**
```javascript
Content-Type: multipart/form-data
image: [file]
```

**Multiple images:**
```javascript
Content-Type: multipart/form-data
images: [file1, file2, file3]
```

**Product images:**
```javascript
Content-Type: multipart/form-data
thumbnail: [file]
images: [file1, file2, ...]
```

---

## 🐛 Error Handling

All errors return JSON:
```json
{
  "message": "Error description",
  "errors": ["Validation error 1", "Validation error 2"]
}
```

Common status codes:
- `200` - Success
- `201` - Created
- `400` - Bad Request / Validation Error
- `401` - Unauthorized
- `403` - Forbidden
- `404` - Not Found
- `500` - Server Error

---

## 📝 Development Tips

### 1. Use Postman or Thunder Client
Create a collection with all endpoints for easy testing.

### 2. Check Logs
Server logs all requests in development mode.

### 3. MongoDB Compass
Use MongoDB Compass to view/edit database visually.

### 4. Cloudinary Dashboard
Monitor uploaded images in Cloudinary console.

---

## 🔄 Next Steps

1. ✅ Models created
2. ✅ Routes & Controllers created
3. ✅ Authentication implemented
4. ✅ File upload configured
5. 🔲 Add more routes (Reviews, Chat, AR Sessions)
6. 🔲 Add input validation
7. 🔲 Add rate limiting
8. 🔲 Add API documentation (Swagger)
9. 🔲 Add unit tests
10. 🔲 Deploy to production

---

## 🆘 Troubleshooting

**MongoDB connection error:**
- Check if MongoDB is running
- Verify `MONGODB_URI` in `.env`

**Cloudinary upload error:**
- Verify credentials in `.env`
- Check file size (max 5MB by default)

**JWT error:**
- Ensure `JWT_SECRET` is set in `.env`
- Check token format in Authorization header

**CORS error:**
- Update `CORS_ORIGIN` in `.env` with your frontend URL

---

## 📚 Resources

- [Express.js Docs](https://expressjs.com/)
- [Mongoose Docs](https://mongoosejs.com/)
- [Cloudinary Docs](https://cloudinary.com/documentation)
- [JWT Docs](https://jwt.io/)
