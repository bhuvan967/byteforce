# Auth0 Setup Guide

## Step 1: Create an Auth0 Account
1. Go to [auth0.com](https://auth0.com) and sign up for a free account
2. Create a new application (Regular Web Application or Single Page Application)

## Step 2: Get Your Credentials
1. In the Auth0 Dashboard, go to **Applications** → **Applications**
2. Click on your application
3. Go to the **Settings** tab
4. Copy the following:
   - **Domain** (e.g., `your-app.auth0.com`)
   - **Client ID**

## Step 3: Configure Allowed Callbacks
In your Auth0 Application Settings:
1. Set **Allowed Callback URLs** to:
   - `http://localhost:3000` (for development)
   - `http://localhost:3000/callback` (optional, for callback page)
   - Your production URL when deploying

2. Set **Allowed Logout URLs** to:
   - `http://localhost:3000`

3. Set **Allowed Web Origins** to:
   - `http://localhost:3000`

## Step 4: Configure .env.local
Update your `.env.local` file with the credentials:

```
REACT_APP_AUTH0_DOMAIN=your_auth0_domain.auth0.com
REACT_APP_AUTH0_CLIENT_ID=your_auth0_client_id
REACT_APP_AUTH0_CALLBACK_URL=http://localhost:3000
```

**IMPORTANT:** Never commit `.env.local` to version control. Add it to `.gitignore`.

## Step 5: Install Dependencies
```bash
npm install @auth0/auth0-react
```

## Step 6: Test the Application
1. Run: `npm start`
2. Click Login or Sign up in the navbar
3. You should be redirected to Auth0's Universal Login page
4. Enter your credentials or use Google OAuth

## Google OAuth Setup (Optional)
To enable Google login:
1. In Auth0 Dashboard, go to **Connections** → **Social**
2. Find and enable **Google**
3. Google OAuth will automatically be available in the login form

## Features Implemented
✅ Email/Password authentication via Auth0
✅ Google OAuth integration
✅ Secure credential storage in environment variables
✅ Loading states during authentication
✅ Auth0 Universal Login (hosted login page)

## Production Deployment
When deploying to production:
1. Update `.env` variables with your production Auth0 settings
2. Add your production URL to Auth0 Application Allowed Callbacks
3. Never expose `.env` files in your repository
