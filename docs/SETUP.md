# Expajo Setup Guide

## Quick Start

### 1. Install Dependencies
```bash
npm install
```

### 2. Set Up Environment Variables

Create a `.env.local` file in the root directory with the following content:

```env
# Supabase Configuration
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url_here
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key_here

# Optional: For production
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key_here
```

### 3. Set Up Supabase (Optional for Development)

If you want to use the full functionality, set up a Supabase project:

1. Go to [supabase.com](https://supabase.com) and create a new project
2. Copy your project URL and anon key from the project settings
3. Replace the placeholder values in `.env.local`
4. Run the SQL scripts from the README to set up the database schema

### 4. Run the Development Server

```bash
npm run dev
```

The application will be available at [http://localhost:3000](http://localhost:3000)

## Development Without Supabase

The application is designed to work without Supabase configuration for development. When environment variables are missing:

- Authentication forms will show "Supabase not configured" errors
- Mock data will be used for listings and other features
- The UI will still be fully functional for design and development

## Troubleshooting

### "supabaseUrl is required" Error
This error occurs when Supabase environment variables are not set. The application now handles this gracefully with mock data, but you can fix it by:

1. Creating a `.env.local` file with the environment variables
2. Or setting up a Supabase project and adding the real credentials

### Build Errors
If you encounter build errors, try:
```bash
npm run type-check
npm run lint
```

### Missing Dependencies
If you get module not found errors:
```bash
npm install --legacy-peer-deps
```
