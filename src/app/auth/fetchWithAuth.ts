import { createBrowserClient } from '@supabase/ssr';
import { API_URL } from '@/config/urls';

// Keep track of whether we've verified the user in MongoDB
let userVerifiedInMongoDB = false;

export async function fetchWithAuth(url: string, options: RequestInit = {}) {
  const supabase = createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );

  const {
    data: { session },
  } = await supabase.auth.getSession();

  if (!session) {
    console.error('User is not authenticated.');
    throw new Error('Unauthorized: No active session');
  }

  const token = session.access_token;

  // Ensure user exists in MongoDB if not already verified
  if (!userVerifiedInMongoDB) {
    try {
      const authStatusResponse = await fetch(
        `${API_URL}/api/user/auth-status`,
        {
          method: 'GET',
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
        }
      );

      if (authStatusResponse.ok) {
        userVerifiedInMongoDB = true;
      } else {
        // If auth-status fails, explicitly create the user in MongoDB
        try {
          const { data: userData } = await supabase.auth.getUser();
          const userId = userData?.user?.id;

          const createUserResponse = await fetch(`${API_URL}/api/user/create`, {
            method: 'POST',
            headers: {
              Authorization: `Bearer ${token}`,
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              supabase_id: userId,
              email: userData?.user?.email,
              created_at: userData?.user?.created_at,
            }),
          });

          if (createUserResponse.ok) {
            console.log('User successfully created in MongoDB');
            userVerifiedInMongoDB = true;
          } else {
            console.error(
              'Failed to create user in MongoDB:',
              await createUserResponse.text()
            );
            // Set to true anyway to avoid repeated failed attempts
            userVerifiedInMongoDB = true;
          }
        } catch (createError) {
          console.error('Error creating user in MongoDB:', createError);
          // Set to true anyway to avoid repeated failed attempts
          userVerifiedInMongoDB = true;
        }
      }
    } catch (syncError) {
      console.error('Error during MongoDB user synchronization:', syncError);
      // Set to true anyway to avoid repeated failed attempts
      userVerifiedInMongoDB = true;
    }
  }

  // Merge headers to include Authorization
  const headers = {
    ...options.headers,
    Authorization: `Bearer ${token}`,
    'Content-Type': 'application/json',
  };

  // Directly return the response
  return fetch(url, { ...options, headers });
}
