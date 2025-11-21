# Sanity Setup Guide for CrashLensAI

This guide walks you through setting up Sanity for the CrashLensAI backend.

## Quick Start (Recommended)

We've included a pre-configured Sanity Studio in `../sanity-studio/`. Follow these steps:

### 1. Create a Sanity Account & Project

1. Go to https://www.sanity.io/ and sign up or log in
2. Click "Create new project"
3. Choose a project name (e.g., "CrashLensAI")
4. Select a dataset name (use "production")
5. Note your **Project ID** - you'll need this

### 2. Set Up the Studio

```bash
cd ../sanity-studio
npm install
```

### 3. Configure the Studio

Create a `.env` file in the `sanity-studio` folder:

```bash
cp .env.example .env
```

Edit `.env` and add your project ID:

```env
SANITY_STUDIO_PROJECT_ID=your-project-id-here
SANITY_STUDIO_DATASET=production
```

### 4. Deploy the Schema

```bash
npm run deploy
```

This will deploy the incident schema to your Sanity project.

### 5. Start the Studio (Optional)

```bash
npm run dev
```

The Studio will be available at http://localhost:3333 where you can view and manage incidents.

## Alternative: Manual Schema Setup

If you prefer to set up the schema manually:

### Option A: Using Sanity Dashboard

1. Go to your Sanity project dashboard
2. Navigate to the Schema section
3. Create a new document type called "incident" with these fields:
   - `endpoint` (string, required)
   - `statusCode` (number, required)
   - `errorMessage` (text, required)
   - `explanation` (text)
   - `suggestedFix` (text)
   - `timestamp` (datetime, required)
   - `requestBody` (text)

### Option B: Using Sanity CLI

1. Install Sanity CLI:
   ```bash
   npm install -g @sanity/cli
   ```

2. Login and initialize:
   ```bash
   sanity login
   sanity init
   ```

3. Use the schema file from `sanity-schema.js` as reference

## Backend Configuration

### Step 1: Create an API Token

1. Go to your Sanity project dashboard
2. Navigate to "API" settings
3. Click "Add API token"
4. Name it "CrashLensAI Backend"
5. Set permissions to "Editor" (write access)
6. Copy the token - you won't see it again!

### Step 2: Configure Backend Environment

Update your `backend/.env` file with your Sanity credentials:

```env
PORT=3001

# Sanity Configuration
SANITY_PROJECT_ID=your_project_id_here
SANITY_DATASET=production
SANITY_TOKEN=your_api_token_here
```

Replace:
- `your_project_id_here` with your actual Project ID
- `your_api_token_here` with the API token you created

### Step 3: Test the Integration

1. Start the backend server:
   ```bash
   npm start
   ```

2. Send a test crash report:
   ```bash
   curl -X POST http://localhost:3001/api/report-crash \
     -H "Content-Type: application/json" \
     -d '{
       "endpoint": "/api/test",
       "statusCode": 500,
       "errorMessage": "Test error message"
     }'
   ```

3. Verify in Sanity Studio:
   - Go to your Sanity Studio
   - You should see a new "incident" document

4. Retrieve incidents via API:
   ```bash
   curl http://localhost:3001/api/incidents
   ```

## Troubleshooting

### "Project not found" error
- Double-check your `SANITY_PROJECT_ID` in `.env`
- Make sure you're using the correct project ID from your Sanity dashboard

### "Insufficient permissions" error
- Verify your API token has "Editor" permissions
- Make sure the token is correctly copied to `SANITY_TOKEN` in `.env`

### "Document type 'incident' not found" error
- The schema hasn't been deployed yet
- Follow Step 2 to deploy the incident schema

### Connection timeout
- Check your internet connection
- Verify Sanity services are operational at https://status.sanity.io/

## Next Steps

Once Sanity is configured and working:
- Test with Postman to create multiple incidents
- Verify incidents are stored and retrieved correctly
- Move on to implementing the frontend dashboard (Task 3)
