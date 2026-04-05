# WearVirtually Mobile App

This is the Expo React Native mobile application for the WearVirtually Final Year BSCS Project. It provides users with a seamless shopping experience including virtual try-on, AR features, shop management, and social engagement.

## Overview

The mobile app enables:
- User registration and authentication
- Product discovery and search
- Virtual try-on and AR fitting experiences
- User avatar and body measurement management
- Shopping cart and checkout workflows
- Order tracking and management
- Shop creation and storefront management
- Shop dashboard and product administration
- Social features (chat, following, suggestions)
- Account settings and preferences

## Technology Stack

- **Framework:** React Native
- **Development Platform:** Expo
- **Navigation:** Expo Router (file-based routing)
- **Language:** TypeScript
- **UI Components:** React Native Paper
- **HTTP Client:** Axios
- **State Management:** React Context API
- **Local Storage:** Async Storage
- **Additional Libraries:**
  - React Navigation
  - Lucide React Native (icons)
  - React Native Gesture Handler
  - React Native Reanimated
  - React Native SVG
  - React Native Toast Message
  - Expo Image Picker, Document Picker, Linking, Sharing

## Project Structure

```
frontend/wv/
├── app/                         # File-based routing with Expo Router
│   ├── (auth)/                  # Authentication screens (unauthenticated)
│   │   ├── _layout.tsx          # Auth stack layout
│   │   ├── login.tsx            # Login screen
│   │   ├── register.tsx         # User registration
│   │   ├── shop-register.tsx    # Shop owner registration
│   │   └── forgot-password.tsx  # Password recovery
│   ├── (main)/                  # Main app screens (authenticated)
│   │   ├── _layout.tsx          # Main tab navigation
│   │   ├── home/                # Home feed
│   │   ├── search/              # Product search and discovery
│   │   ├── saved-items/         # Wishlist / saved items
│   │   ├── try-on/              # Virtual try-on interface
│   │   ├── chats/               # Messaging and chat
│   │   ├── buy/                 # Checkout and order flow
│   │   ├── profile/             # User profile management
│   │   ├── settings/            # App settings
│   │   ├── support/             # Help and support
│   │   ├── social/              # Social features (QR, suggestions)
│   │   ├── shop/                # Shop owner features
│   │   │   ├── dashboard/       # Shop analytics and stats
│   │   │   ├── shopProfile/     # Shop profile management
│   │   │   ├── addProduct/      # Add new products
│   │   │   ├── staff/           # Staff management
│   │   │   └── storefront/      # Shop storefront view
│   │   ├── avatar/              # Avatar creation and management
│   │   └── user-profile.tsx     # View other user profiles
│   ├── (ar)/                    # AR feature screens
│   │   ├── _layout.tsx          # AR stack layout
│   │   ├── ar-try-on/           # AR clothing try-on
│   │   ├── body-scan/           # 3D body scanning
│   │   └── virtual-fitting-room/ # Virtual fitting room
│   ├── (admin)/                 # Admin/analytics screens
│   │   ├── _layout.tsx          # Admin layout
│   │   ├── dashboard/           # Admin dashboard
│   │   ├── analytics/           # Sales and user analytics
│   │   └── shop-management/     # Shop management tools
│   ├── _layout.tsx              # Root layout and theme provider
│   ├── index.tsx                # Splash/loading screen
│   ├── splash.tsx               # Splash screen
│   └── +not-found.tsx           # 404 not found screen
├── src/
│   ├── api/                     # API service layer
│   │   ├── authService.js       # Authentication API calls
│   │   ├── productService.js    # Product API interactions
│   │   ├── shopService.js       # Shop API operations
│   │   ├── orderService.js      # Order and checkout handling
│   │   ├── savedItemService.js  # Wishlist API calls
│   │   ├── config.js            # API configuration and base URL
│   │   └── index.js             # Service exports
│   ├── components/              # Reusable React components
│   │   ├── Header.tsx           # Common header component
│   │   └── LogoutButton.tsx     # Logout button component
│   ├── context/                 # Global state management
│   │   ├── AuthContext.tsx      # Authentication state and logic
│   │   ├── UserContext.tsx      # User data state
│   │   └── ThemeContext.tsx     # Theme and dark mode state
│   ├── theme/                   # Styling and theming
│   │   ├── index.ts             # Theme exports
│   │   ├── appTheme.ts          # Main app theme colors/styles
│   │   ├── authTheme.ts         # Authentication flow theme
│   │   ├── paperThemes.ts       # React Native Paper themes
│   │   └── themeUtils.ts        # Theme utility functions
│   ├── types/                   # TypeScript type definitions
│   │   └── index.ts             # Type exports
│   └── utils/                   # Utility helper functions
│       └── themeUtils.ts        # Theme-related utilities
├── assets/                      # Static assets (images, fonts)
├── app.json                     # Expo project config
├── eas.json                     # EAS build configuration
├── tsconfig.json                # TypeScript configuration
├── eslint.config.js             # ESLint rules for code quality
├── babel.config.js              # Babel configuration
├── metro.config.js              # Metro bundler config
├── package.json                 # Dependencies and scripts
└── README.md                    # This file
```

## Getting Started

### Prerequisites

- Node.js (LTS recommended)
- npm or yarn
- Expo Go app (for testing on physical device)
- Android Emulator or iOS Simulator (for testing)

### 1. Install Dependencies

```bash
cd frontend/wv
npm install
```

### 2. Start Development Server

```bash
npm run dev
```

This starts the Expo development server with a QR code you can scan with Expo Go.

### 3. Run on Target Platform

From the Expo CLI menu:

- Press `a` to open Android emulator
- Press `i` to open iOS simulator (macOS only)
- Press `w` to open web version
- Scan QR code with Expo Go app to run on physical device

Alternatively, run specific commands:

```bash
npm run android   # Run on Android emulator/device
npm run ios       # Run on iOS simulator/device (macOS only)
npm run web       # Run web version
```

## Project Configuration

### API Base URL

Update the API base URL in `src/api/config.js`:

```javascript
const API_BASE_URL = 'http://192.168.1.100:3000/api';
```

Replace with your backend server address.

### Environment Setup

Create `.env` file if needed:

```
EXPO_PUBLIC_API_URL=http://192.168.1.100:3000/api
```

### Theme Configuration

Customize theme in `src/theme/`:

- App colors and styles in `appTheme.ts`
- Authentication theme in `authTheme.ts`
- React Native Paper themes in `paperThemes.ts`

## Feature Overview

### Authentication Module (app/(auth))

- User registration with email/password
- Shop owner account creation
- Login/logout flows
- Password recovery
- JWT token management

### Main App Screens (app/(main))

**Home Feed**
- Social feed of shop posts and products
- Quick actions and recommendations
- Shop and product discovery

**Search**
- Product search with filters
- Browse by category
- Search history
- Recent searches

**Saved Items**
- Wishlist management
- Save/unsave products
- View saved items collection

**Shopping (Buy Flow)**
- Product details and variants
- Quantity selection
- Checkout process
- Order summary and confirmation
- Shipping address form
- Payment method selection

**Chats**
- Customer support messaging
- Shop communication
- Message history
- Typing indicators

**User Profile**
- Profile information display
- Avatar management
- Order history
- Account settings
- Change password
- Account deletion
- Privacy settings

**Settings**
- App preferences
- Theme selection (light/dark)
- Notifications
- Account info and support

**Shop Owner Features**
- Dashboard with stats and analytics
- Product management and creation
- Shop profile editing
- Order management
- Staff management
- Storefront customization

### AR Features (app/(ar))

**AR Try-On**
- Real-time clothing virtual try-on
- Camera preview with AR overlay
- Save AR try-on sessions

**Body Scan**
- 3D body measurement capture
- Avatar generation
- Body profile storage

**Virtual Fitting Room**
- Complete outfit try-on
- Multiple garment simulation
- Measurements-based recommendations

### Admin Features (app/(admin))

- Analytics dashboard
- Sales metrics and reporting
- User activity monitoring
- Shop performance analytics

## State Management

### AuthContext

Manages:
- Login/logout state
- JWT token storage
- User authentication status

### UserContext

Manages:
- Current user profile data
- User preferences
- Cart/wishlist state

### ThemeContext

Manages:
- Dark/light mode toggle
- Theme preference persistence

## API Integration

### Services (src/api/)

Each service module wraps API endpoints:

```javascript
// authService.js
export const login = (email, password) => { ... }
export const register = (userData) => { ... }
export const logout = () => { ... }

// productService.js
export const getProducts = (filters) => { ... }
export const getProductById = (id) => { ... }

// shopService.js
export const createShop = (shopData) => { ... }
export const getShopById = (id) => { ... }

// orderService.js
export const placeOrder = (orderData) => { ... }
export const getOrders = () => { ... }

// savedItemService.js
export const getSavedItems = () => { ... }
export const saveItem = (productId) => { ... }
export const removeSavedItem = (itemId) => { ... }
```

All API calls use Axios with base URL and header configuration from `config.js`.

## Code Quality

### Linting

Run ESLint to check code quality:

```bash
npm run lint
```

### TypeScript

This project uses TypeScript for type safety. Type definitions are in `src/types/index.ts`.

## Component Structure

Components follow React best practices:

- Functional components with hooks
- Props validation with TypeScript
- Proper error boundaries
- Loading and error states
- Accessibility considerations

Example component structure:

```typescript
import React, { useState, useEffect } from 'react';
import { View, Text } from 'react-native';
import { useAuth } from '@/context/AuthContext';

interface ProductCardProps {
  productId: string;
  onPress?: () => void;
}

export const ProductCard: React.FC<ProductCardProps> = ({
  productId,
  onPress
}) => {
  // Component logic
  return (
    <View>
      {/* Component JSX */}
    </View>
  );
};
```

## Navigation

File-based routing with Expo Router:

- Routes are automatically generated from file paths in `app/`
- Route groups `(name)` organize navigation stacks
- Dynamic routes use `[id]` pattern
- Layout files `_layout.tsx` define navigation structure

## Performance Optimization

- Lazy load screens with React.lazy
- Optimize images with Expo Image
- Memoize expensive components
- Use React.useMemo for calculations
- Implement proper list virtualization

## Troubleshooting

### Can't Connect to API
- Verify backend is running on correct port
- Check API base URL in `src/api/config.js`
- Ensure device/emulator can reach server IP

### Build Errors
- Clear cache: `expo prebuild --clean`
- Reinstall dependencies: `rm -rf node_modules && npm install`
- Check Node.js version compatibility

### Hot Reload Not Working
- Restart Expo dev server
- Clear Expo cache: `npx expo start --clear`

### Blank Screen on Startup
- Check `app/_layout.tsx` for errors
- Verify context providers are wrapping app
- Check app.json configuration

## Development Workflow

1. **Create feature branch** from main
2. **Make changes** in `app/` or `src/`
3. **Test on emulator/device** with Expo Go
4. **Run linter**: `npm run lint`
5. **Commit and push** to repository
6. **Create pull request** with changes summary

## Testing on Physical Device

### Using Expo Go

1. **Install Expo Go** from App Store or Play Store
2. **Start dev server**: `npm run dev`
3. **Scan QR code** with Expo Go app
4. **App loads** and hot reloads on code changes

### Using EAS Build

For production-like testing:

```bash
eas build --platform android  # or ios
```

See `eas.json` for build configuration.

## Deployment

### Android

```bash
eas build --platform android --release
```

### iOS (macOS only)

```bash
eas build --platform ios --release
```

### Web

```bash
npm run web
# Then deploy build output
```

## Future Enhancements

- Push notification support
- Offline mode with local caching
- Advanced image caching
- ML-based size recommendations
- Real-time chat with WebSockets
- Animated transitions and micro-interactions
- Accessibility improvements (a11y)
- Internationalization (i18n) support
- Advanced analytics tracking

## Contributing

1. Follow the existing code style
2. Use TypeScript for type safety
3. Write descriptive commit messages
4. Test thoroughly before submitting PR
5. Update README if adding major features

## License

This mobile app is part of the WearVirtually project, which includes an MIT License. See the LICENSE file in the root repository for details.
