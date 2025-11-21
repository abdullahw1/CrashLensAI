# Sanity Quick Start - What You Need to Do

## TL;DR - The Error Explained

The error `Both --project and --create-project specified` happened because I passed conflicting CLI flags. **This is not a problem with your setup!** You successfully logged into Sanity, and all the files are ready.

## What's Already Done ✅

1. ✅ You're logged into Sanity
2. ✅ Sanity Studio directory created at `CrashLensAI/sanity-studio`
3. ✅ Incident schema is fully defined with all required fields
4. ✅ All configuration files are in place
5. ✅ Backend integration code is complete

## What You Need to Do (3 Simple Steps)

### Step 1: Get Your Project ID

**Option A - Create New Project (Recommended):**
```bash
cd CrashLensAI/sanity-studio
npx sanity init
```
Follow the prompts to create a new project.

**Option B - Use Existing Project:**
1. Go to https://sanity.io/manage
2. Select or create a project
3. Copy the Project ID

### Step 2: Configure the Studio

Create `CrashLensAI/sanity-studio/.env`:
```env
SANITY_STUDIO_PROJECT_ID=your_actual_project_id
SANITY_STUDIO_DATASET=production
```

### Step 3: Install & Deploy

```bash
cd CrashLensAI/sanity-studio
npm install
npm run deploy
npm run dev
```

The studio will open at http://localhost:3333

### Step 4: Get API Token & Configure Backend

1. Go to https://sanity.io/manage → Your Project → API → Tokens
2. Create a token with "Editor" permissions
3. Update `CrashLensAI/backend/.env`:

```env
PORT=3001

SANITY_PROJECT_ID=your_actual_project_id
SANITY_DATASET=production
SANITY_TOKEN=your_actual_api_token
```

### Step 5: Test It

```bash
# Terminal 1 - Start backend
cd CrashLensAI/backend
npm start

# Terminal 2 - Test
curl -X POST http://localhost:3001/api/report-crash \
  -H "Content-Type: application/json" \
  -d '{"endpoint": "/api/test", "statusCode": 500, "errorMessage": "Test error"}'

curl http://localhost:3001/api/incidents
```

Check your Sanity Studio to see the incident!

## Files Reference

- **Studio Config**: `CrashLensAI/sanity-studio/sanity.config.ts`
- **Schema**: `CrashLensAI/sanity-studio/schemas/incident.ts`
- **Backend Service**: `CrashLensAI/backend/services/sanity.js`
- **API Routes**: `CrashLensAI/backend/routes/incidents.js`

## Need More Help?

See `CrashLensAI/sanity-studio/SETUP_INSTRUCTIONS.md` for detailed instructions and troubleshooting.
