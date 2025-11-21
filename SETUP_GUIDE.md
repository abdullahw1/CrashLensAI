# CrashLensAI Complete Setup Guide

This guide will help you set up the complete CrashLensAI system with backend and Sanity.

## Prerequisites

- Node.js v20+ installed
- npm or yarn package manager
- A Sanity account (free at https://www.sanity.io/)

## Step-by-Step Setup

### 1. Set Up Sanity Studio

```bash
# Navigate to the Sanity Studio folder
cd sanity-studio

# Install dependencies
npm install

# Create environment file
cp .env.example .env
```

Now edit `sanity-studio/.env` and add your Sanity project details:
- Get your project ID from https://www.sanity.io/manage
- If you don't have a project yet, create one at https://www.sanity.io/

```env
SANITY_STUDIO_PROJECT_ID=your-project-id-here
SANITY_STUDIO_DATASET=production
```

Deploy the schema:

```bash
npm run deploy
```

### 2. Create a Sanity API Token

1. Go to https://www.sanity.io/manage
2. Select your project
3. Go to **API** → **Tokens**
4. Click **Add API token**
5. Name: "CrashLensAI Backend"
6. Permissions: **Editor**
7. Copy the token (you won't see it again!)

### 3. Set Up Backend

```bash
# Navigate to backend folder
cd ../backend

# Install dependencies (if not already done)
npm install

# Update .env file with your Sanity credentials
```

Edit `backend/.env`:

```env
PORT=3001

# Sanity Configuration
SANITY_PROJECT_ID=your-project-id-here
SANITY_DATASET=production
SANITY_TOKEN=your-api-token-here
```

### 4. Start the Services

**Terminal 1 - Backend:**
```bash
cd backend
npm start
```

**Terminal 2 - Sanity Studio (optional):**
```bash
cd sanity-studio
npm run dev
```

### 5. Test the System

**Create an incident:**
```bash
curl -X POST http://localhost:3001/api/report-crash \
  -H "Content-Type: application/json" \
  -d '{
    "endpoint": "/api/test",
    "statusCode": 500,
    "errorMessage": "Cannot read property '\''id'\'' of undefined"
  }'
```

**Retrieve incidents:**
```bash
curl http://localhost:3001/api/incidents
```

**View in Sanity Studio:**
- Open http://localhost:3333
- Click "Incident" in the sidebar
- You should see your test incident

## What's Next?

Now that your backend and Sanity are set up:

1. ✅ Backend API is running on http://localhost:3001
2. ✅ Sanity Studio is running on http://localhost:3333
3. ✅ Incidents are being stored in Sanity
4. ⏭️ Next: Build the frontend dashboard (Task 3)

## Troubleshooting

### "Project not found"
- Verify `SANITY_PROJECT_ID` matches your actual project ID
- Check you're logged in to the correct Sanity account

### "Insufficient permissions"
- Make sure your API token has "Editor" permissions
- Regenerate the token if needed

### "Schema not found"
- Run `npm run deploy` in the sanity-studio folder
- Check that the schema deployed successfully

### Backend can't connect to Sanity
- Verify all three environment variables are set correctly
- Check for typos in the project ID or token
- Ensure the token hasn't expired

## Architecture Overview

```
┌─────────────────┐
│   Frontend      │  (Coming in Task 3)
│   Dashboard     │
└────────┬────────┘
         │
         ↓
┌─────────────────┐
│   Backend API   │  ← You are here
│   (Express)     │
└────────┬────────┘
         │
         ↓
┌─────────────────┐
│  Sanity CMS     │  ← Configured
│  (Database)     │
└─────────────────┘
```

## Useful Commands

**Backend:**
- `npm start` - Start the backend server
- `npm run dev` - Start in development mode

**Sanity Studio:**
- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run deploy` - Deploy to Sanity hosting

## Resources

- [Sanity Documentation](https://www.sanity.io/docs)
- [Backend API Documentation](./backend/README.md)
- [Sanity Studio Documentation](./sanity-studio/README.md)
