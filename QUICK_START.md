# WearVirtually - Quick Start Guide

## 🚀 Running the Application

### Backend Setup

1. **Navigate to backend:**
   ```bash
   cd backend
   ```

2. **Create `.env` file:**
   ```bash
   cp .env.example .env
   ```

3. **Edit `.env` with your credentials:**
   ```env
   # MongoDB (use local or Atlas)
   MONGODB_URI=mongodb://localhost:27017/wearvirtually
   
   # JWT Secret (change this!)
   JWT_SECRET=your_super_secret_key_change_this_in_production
   JWT_EXPIRE=7d
   
   # Cloudinary (get from https://cloudinary.com/console)
   CLOUDINARY_CLOUD_NAME=your_cloud_name
   CLOUDINARY_API_KEY=your_api_key
   CLOUDINARY_API_SECRET=your_api_secret
   
   # Server
   PORT=3000
   NODE_ENV=development
   
   # CORS
   CORS_ORIGIN=http://localhost:8081,exp://192.168.100.44:8081
   
   # File Upload
   MAX_FILE_SIZE=5242880
   ```

4. **Start MongoDB** (if using local):
   ```bash
   mongod
   ```

5. **Start backend server:**
   ```bash
   npm run dev
   ```
   
   Server will run on `http://localhost:3000`

---

### Frontend Setup

1. **Navigate to frontend:**
   ```bash
   cd frontend/wv
   ```

2. **Start Expo dev server:**
   ```bash
   npx expo start
   ```

3. **Run on device:**
   - Press `a` for Android
   - Press `i` for iOS (Mac only)
   - Scan QR code with Expo Go app

---

## 📡 API Configuration

Your frontend is configured to connect to:
- **Development:** `http://192.168.100.44:3000/api`
- **Production:** Update in `src/api/config.js`

---

## 🧪 Testing the Connection

### Test Login
Update your login screen (`app/(auth)/login.tsx`):

```javascript
import { authService } from '../../src/api';
import { Alert } from 'react-native';

const handleLogin = async () => {
  setIsLoading(true);
  try {
    const response = await authService.login(email, password);
    console.log('Login successful:', response.user);
    
    // Navigate to home
    router.replace('/(main)/home');
  } catch (error) {
    Alert.alert('Login Failed', error.message);
  } finally {
    setIsLoading(false);
  }
};
```

### Test Registration
Update register screen (`app/(auth)/register.tsx`):

```javascript
import { authService } from '../../src/api';

const handleRegister = async () => {
  try {
    const userData = {
      username,
      email,
      password,
      fullName,
      phone,
      role: userRole
    };
    
    const response = await authService.register(userData);
    Alert.alert('Success', 'Account created successfully!');
    router.replace('/(auth)/login');
  } catch (error) {
    Alert.alert('Registration Failed', error.message);
  }
};
```

---

## 📁 Project Structure

```
fyp/
├── backend/                    # Express.js API
│   ├── src/
│   │   ├── config/            # Database & Cloudinary
│   │   ├── controllers/       # Business logic
│   │   ├── middleware/        # Auth, upload, errors
│   │   ├── models/            # Mongoose models (17)
│   │   ├── routes/            # API routes
│   │   └── server.js          # Entry point
│   ├── .env                   # Environment variables
│   └── package.json
│
└── frontend/wv/               # React Native (Expo)
    ├── app/                   # Expo Router screens
    │   ├── (auth)/           # Login, Register
    │   ├── (main)/           # Home, Profile, Shop
    │   └── (ar)/             # AR features
    ├── src/
    │   ├── api/              # API services ✅
    │   ├── context/          # React Context
    │   └── utils/            # Utilities
    └── package.json
```

---

## 🔐 Available API Services

```javascript
import {
  authService,      // Authentication
  productService,   // Products
  shopService,      // Shops
  orderService,     // Orders
  savedItemService  // Wishlist
} from '../api';
```

### Authentication
- `authService.register(userData)`
- `authService.login(email, password)`
- `authService.getProfile()`
- `authService.updateProfile(data)`
- `authService.changePassword(current, new)`
- `authService.uploadAvatar(imageUri)`
- `authService.logout()`

### Products
- `productService.getProducts(filters)`
- `productService.getProduct(id)`
- `productService.createProduct(data, images)`
- `productService.updateProduct(id, data)`
- `productService.deleteProduct(id)`

### Shops
- `shopService.getShops(filters)`
- `shopService.getShop(id)`
- `shopService.getShopProducts(id)`
- `shopService.createShop(data, images)`
- `shopService.getMyShop()`
- `shopService.updateShop(id, data)`

### Orders
- `orderService.createOrder(data)`
- `orderService.getUserOrders()`
- `orderService.getShopOrders(shopId)`
- `orderService.getOrder(id)`
- `orderService.updateOrderStatus(id, status)`

### Saved Items
- `savedItemService.getSavedItems()`
- `savedItemService.addSavedItem(productId, variantId)`
- `savedItemService.removeSavedItem(id)`
- `savedItemService.checkSaved(productId)`

---

## 🐛 Troubleshooting

### Backend won't start
- Check if MongoDB is running
- Verify `.env` file exists and has correct values
- Check port 3000 is not in use

### Frontend can't connect
- Make sure backend is running
- Check IP address in `src/api/config.js`
- Ensure phone/emulator is on same WiFi network
- Update `CORS_ORIGIN` in backend `.env`

### "Network Error"
- Backend not running
- Wrong IP address
- Firewall blocking connection
- Different WiFi networks

### "401 Unauthorized"
- Token expired - login again
- Invalid credentials
- Token not being sent

---

## 📚 Documentation

- **Database Schema:** See `database_schema.md`
- **Models Guide:** See `models_walkthrough.md`
- **API Guide:** See `api_walkthrough.md`
- **Connection Guide:** See `frontend_connection_guide.md`
- **Code Quality:** See `code_quality_review.md`

---

## ✅ Checklist

**Backend:**
- [x] MongoDB models created (17 models)
- [x] API routes implemented (5 route sets)
- [x] Authentication with JWT
- [x] File upload with Cloudinary
- [x] Error handling
- [x] Packages installed

**Frontend:**
- [x] API services created
- [x] Axios configured
- [x] Auto-token injection
- [x] Error handling
- [x] IP address configured

**Next Steps:**
- [ ] Update login screen to use API
- [ ] Update register screen to use API
- [ ] Test authentication flow
- [ ] Implement product listing
- [ ] Test image uploads

---

## 🎉 You're Ready!

Your full-stack application is set up and ready to use!

**Start developing:**
1. Backend: `cd backend && npm run dev`
2. Frontend: `cd frontend/wv && npx expo start`
3. Test login/register
4. Build your features!

For detailed examples, check the documentation files in the artifacts folder.
