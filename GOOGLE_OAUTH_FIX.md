# Environment Configuration for Gen-Z Fashion

## Local Development (.env.local)
```
REACT_APP_API_URL=http://localhost:5000
REACT_APP_GOOGLE_CLIENT_ID=567073435709-c1mccbial301f1u88ks693rbd532u96o.apps.googleusercontent.com
REACT_APP_SITE_URL=http://localhost:3000
```

## Production (.env.production)
```
REACT_APP_API_URL=https://your-api-domain.com
REACT_APP_GOOGLE_CLIENT_ID=567073435709-c1mccbial301f1u88ks693rbd532u96o.apps.googleusercontent.com
REACT_APP_SITE_URL=https://your-site-domain.com
```

## Backend (.env in server root)
```
# MongoDB
MONGODB_URI=mongodb://...

# JWT
JWT_SECRET=your_secret_key

# Email
EMAIL_USER=your_email@gmail.com
EMAIL_PASS=your_app_password

# Razorpay
RAZORPAY_KEY_ID=your_key
RAZORPAY_KEY_SECRET=your_secret

# Google OAuth (for backend API calls if needed)
GOOGLE_CLIENT_ID=567073435709-c1mccbial301f1u88ks693rbd532u96o.apps.googleusercontent.com

# Server
PORT=5000
NODE_ENV=production

# Client
CLIENT_URL=https://your-site-domain.com
```

## Important Notes:

1. **REACT_APP_GOOGLE_CLIENT_ID** must be set in production `.env`
2. **REACT_APP_API_URL** must match your backend deployment URL
3. The Google Client ID must be authorized in Google Cloud Console for your production domain
4. Environment variables in .env files are NOT loaded by the browser automatically in production builds
   - They must be set as environment variables on your hosting/deployment platform
