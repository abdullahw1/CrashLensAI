# Quick Start - Sanity Studio for CrashLensAI

## 🚀 Get Started in 3 Steps

### Step 1: Install Dependencies

```bash
npm install
```

### Step 2: Configure Your Project

1. **Create a Sanity project** at https://www.sanity.io/
   - Sign up or log in
   - Click "Create new project"
   - Name it "CrashLensAI"
   - Choose "production" as dataset
   - **Copy your Project ID**

2. **Set up environment variables:**

```bash
cp .env.example .env
```

Edit `.env` and add your project ID:

```env
SANITY_STUDIO_PROJECT_ID=abc123xyz  # Your actual project ID
SANITY_STUDIO_DATASET=production
```

### Step 3: Deploy Schema & Start

```bash
# Deploy the incident schema to Sanity
npm run deploy

# Start the Studio
npm run dev
```

Open http://localhost:3333 🎉

## What You'll See

The Studio includes one document type: **Incident**

Each incident has:
- Endpoint (where the crash happened)
- Status Code (HTTP error code)
- Error Message (the actual error)
- Explanation (AI-generated)
- Suggested Fix (AI-generated)
- Timestamp (when it occurred)
- Request Body (optional JSON data)

## Next: Connect the Backend

After the Studio is running, you need to:

1. **Create an API Token:**
   - Go to your Sanity project dashboard
   - Navigate to API → Tokens
   - Create a new token with "Editor" permissions
   - Copy the token

2. **Configure the backend:**
   - Go to `../backend/.env`
   - Add your project ID, dataset, and token

See `../backend/SANITY_SETUP.md` for detailed backend setup.

## Troubleshooting

**"Project not found"**
- Double-check your project ID in `.env`
- Make sure you created the project at sanity.io

**Schema won't deploy**
- Run `npm install` first
- Make sure you're logged in: `npx sanity login`

**Can't access Studio**
- Check that port 3333 isn't already in use
- Try `npm run dev` again

## Need Help?

- 📖 [Full Setup Guide](../SETUP_GUIDE.md)
- 📚 [Sanity Documentation](https://www.sanity.io/docs)
- 🔧 [Backend Setup](../backend/SANITY_SETUP.md)
