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

