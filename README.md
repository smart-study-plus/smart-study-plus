## smartstudy+ web

### requirements

- Nodejs
- Yarn
- Supabase environment

### setup

1. Make sure you have a supabase/auth project ready to go.
2. Clone .env.example to .env.local, and fill in the environment variables.
3. Run `yarn` to install dependencies.
4. Run `yarn dev` to begin debugging.

### more

For more advanced information, please see the frontend master sheet on Notion.

# SmartStudy+ Frontend

## MongoDB User Synchronization

SmartStudy+ uses Supabase for authentication but stores user data in MongoDB. To ensure consistency between these systems, we've implemented a comprehensive synchronization mechanism.

### How It Works

The synchronization mechanism works in two ways:

1. **Automatic Synchronization**: When a user makes an authenticated request, the system checks if they exist in MongoDB. If not, it automatically creates a new user record using the Supabase user data.

2. **Manual Synchronization**: After a successful signup on the client, the system explicitly calls the `/api/user/create` endpoint to create a new user in MongoDB.

Both approaches ensure that users created in Supabase are also created in MongoDB, maintaining consistency between the two systems.

### Implementation Details

The synchronization is implemented in several key places:

1. **auth-form.tsx**: After successful authentication, calls the `/api/user/auth-status` endpoint to check if the user exists in MongoDB. If not, it calls `/api/user/create` to create the user.

2. **fetchWithAuth.ts**: Before making any authenticated API calls, checks if the user exists in MongoDB. If not, it creates the user.

3. **getUserId.ts**: When retrieving the user ID, also ensures the user exists in MongoDB.

### API Endpoints

- `/api/user/auth-status`: Checks if a user exists in MongoDB based on their Supabase ID.
- `/api/user/create`: Creates a new user in MongoDB using data from Supabase.

### Client Integration

The frontend automatically handles the synchronization, so no additional steps are needed when implementing new features. Any authenticated API calls will ensure the user exists in MongoDB before proceeding.

## Getting Started

...
