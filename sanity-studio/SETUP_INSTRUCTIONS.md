# Sanity Studio Setup Instructions

Good news! You're already logged in to Sanity. Now you just need to complete the setup.

## What Happened?

The error you saw was because of conflicting CLI flags in the automated command. But you successfully:
- ✅ Logged into Sanity
- ✅ Created the studio directory structure
- ✅ Set up the incident schema

## Next Steps

### 1. Run the Interactive Setup

Since you're already logged in, run this command from the `sanity-studio` directory:

```bash
cd CrashLensAI/sanity-studio
npm create sanity@latest -- --reconfigure
```

Or create a new project interactively:

```bash
cd CrashLensAI/sanity-studio
npx sanity init
```

This will:
- Let you select an existing project or create a new one
- Configure your project ID and dataset
- Update the configuration files

### 2. Alternative: Manual Configuration

If you prefer to configure manually:

1. Go to https://sanity.io/manage
2. Create a new project (or select an existing one)
3. Note your **Project ID**
4. Create a `.env` file in the `sanity-studio` directory:

```env
SANITY_STUDIO_PROJECT_ID=your_project_id_here
SANITY_STUDIO_DATASET=production
```

5. Or directly update `sanity.config.ts` and `sanity.cli.ts` with your project ID

### 3. Install Dependencies

```bash
cd CrashLensAI/sanity-studio
npm install
```

### 4. Deploy the Schema

Once configured, deploy your incident schema:

```bash
npm run deploy
```

Or if you want to use GraphQL:

```bash
npm run deploy-graphql
```

### 5. Start the Studio

```bash
npm run dev
```

This will start the Sanity Studio at `http://localhost:3333` (or another port if 3333 is taken).

### 6. Create an API Token

1. Go to https://sanity.io/manage
2. Select your project
3. Go to "API" → "Tokens"
4. Click "Add API token"
5. Name it "CrashLensAI Backend"
6. Set permissions to "Editor"
7. Copy the token

### 7. Update Backend .env

Add the token to `CrashLensAI/backend/.env`:

```env
PORT=3001

# Sanity Configuration
SANITY_PROJECT_ID=your_project_id_here
SANITY_DATASET=production
SANITY_TOKEN=your_api_token_here
```

## Testing

Once everything is set up:

1. Start the backend:
   ```bash
   cd CrashLensAI/backend
   npm start
   ```

2. Send a test crash report:
   ```bash
   curl -X POST http://localhost:3001/api/report-crash \
     -H "Content-Type: application/json" \
     -d '{
       "endpoint": "/api/test",
       "statusCode": 500,
       "errorMessage": "Test error"
     }'
   ```

3. Check Sanity Studio to see the incident
4. Retrieve incidents:
   ```bash
   curl http://localhost:3001/api/incidents
   ```

## Troubleshooting

### Node Version Warning

You saw a warning about Node v20.11.1 not being fully supported. This is just a warning - it should still work. If you encounter issues, consider upgrading to Node v20.19+ or v22.12+.

### "Project not found" Error

Make sure you've completed step 1 or 2 to configure your project ID.

### Schema Not Deployed

Run `npm run deploy` from the sanity-studio directory to deploy the incident schema.

## What's Already Done

✅ Sanity Studio structure created
✅ Incident schema defined with all required fields
✅ TypeScript configuration
✅ Package.json with all necessary scripts
✅ Schema exports configured
✅ You're logged into Sanity

You just need to configure the project ID and you're ready to go!
