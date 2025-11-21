# CrashLensAI Sanity Studio

This is the Sanity Studio for managing CrashLensAI incident data.

## Quick Start

### 1. Install Dependencies

```bash
npm install
```

### 2. Configure Your Project

Create a `.env` file based on `.env.example`:

```bash
cp .env.example .env
```

Then update the values:
- `SANITY_STUDIO_PROJECT_ID`: Your Sanity project ID
- `SANITY_STUDIO_DATASET`: Your dataset name (usually "production")

### 3. Create a Sanity Project (First Time Only)

If you don't have a Sanity project yet:

1. Go to https://www.sanity.io/
2. Sign up or log in
3. Create a new project
4. Note your Project ID
5. Create a dataset (e.g., "production")

Alternatively, you can use the Sanity CLI:

```bash
npm install -g @sanity/cli
sanity login
sanity init
```

### 4. Deploy the Schema

Deploy your schema to Sanity:

```bash
npm run deploy
```

This will push the incident schema to your Sanity project.

### 5. Start the Development Server

```bash
npm run dev
```

The Studio will be available at http://localhost:3333

## Schema

The Studio includes one document type:

### Incident

Fields:
- **endpoint** (string, required): The API endpoint that crashed
- **statusCode** (number, required): HTTP status code
- **errorMessage** (text, required): The error message
- **explanation** (text): AI-generated explanation
- **suggestedFix** (text): AI-generated suggested fix
- **timestamp** (datetime, required): When the incident occurred
- **requestBody** (text): JSON string of the request body

## Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run deploy` - Deploy Studio to Sanity's hosted service
- `npm run deploy-graphql` - Deploy GraphQL API

## Creating an API Token

To allow the backend to write incidents:

1. Go to your Sanity project dashboard
2. Navigate to **API** → **Tokens**
3. Click **Add API token**
4. Name it "CrashLensAI Backend"
5. Set permissions to **Editor**
6. Copy the token and add it to your backend `.env` file

## Viewing Incidents

Once the Studio is running:

1. Open http://localhost:3333
2. Click on "Incident" in the sidebar
3. You'll see all incidents created by the backend

## Production Deployment

To deploy the Studio to Sanity's hosted service:

```bash
npm run deploy
```

This will give you a URL like: `https://your-project.sanity.studio`

## Troubleshooting

### "Project not found" error
- Check that `SANITY_STUDIO_PROJECT_ID` in `.env` matches your actual project ID
- Verify you're logged in: `sanity login`

### Schema not deploying
- Make sure you've run `npm install` first
- Try running `sanity deploy` directly from the CLI

### Can't see incidents
- Verify the backend is configured with the correct project ID and token
- Check that the token has "Editor" permissions
- Look for errors in the backend console
