# What is Sanity Studio?

## Overview

This folder contains a **Sanity Studio** - a customizable content management system (CMS) for the CrashLensAI project.

## What Does It Do?

Sanity Studio provides a visual interface to:
- View all crash incidents reported by your application
- Browse incident details (error messages, explanations, fixes)
- Search and filter incidents
- Manually edit or delete incidents if needed

Think of it as an admin dashboard for your crash data.

## How Does It Work?

```
Your App → Backend API → Sanity Database
                              ↓
                        Sanity Studio (this folder)
```

1. Your backend API stores crash incidents in Sanity (cloud database)
2. This Studio connects to the same Sanity project
3. You can view and manage all incidents through the Studio UI

## The Schema

The Studio is configured with one document type: **Incident**

Each incident contains:
- **endpoint**: Which API endpoint crashed (e.g., "/api/login")
- **statusCode**: HTTP error code (e.g., 500)
- **errorMessage**: The actual error text
- **explanation**: AI-generated explanation of what went wrong
- **suggestedFix**: AI-generated suggestion to fix it
- **timestamp**: When the crash occurred
- **requestBody**: Optional JSON data from the request

## Key Files

- `schemas/incident.ts` - Defines the incident data structure
- `sanity.config.ts` - Main configuration (project ID, plugins)
- `sanity.cli.ts` - CLI configuration for deployments
- `package.json` - Dependencies and scripts

## Why Sanity?

- **Cloud-hosted**: No database setup required
- **Real-time**: Changes sync instantly
- **Flexible**: Easy to customize the schema
- **Free tier**: Generous free plan for small projects
- **API-first**: Your backend can read/write via API

## Do I Need to Run This?

**No, it's optional!** The Studio is just a viewer. Your backend works fine without it.

However, it's useful for:
- Debugging: See exactly what incidents are being stored
- Monitoring: Browse recent crashes
- Management: Clean up old or test data

## Getting Started

See `QUICK_START.md` for setup instructions.

## Alternative: Sanity Dashboard

You can also view your data at:
https://www.sanity.io/manage

The Studio is just a customized version of that interface.
