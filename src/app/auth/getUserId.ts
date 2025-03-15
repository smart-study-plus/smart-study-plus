import { createBrowserClient } from '@supabase/ssr';
import { API_URL } from '@/config/urls';

// Keep track of whether we've verified the user in MongoDB
let userVerifiedInMongoDB = false;

export async function getUserId(): Promise<string | null> {
  if (typeof window === 'undefined') {
    console.warn('Skipping Supabase auth check during SSR.');
    return null;
  }

  try {
    const supabase = createBrowserClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
    );

    const {
      data: { session },
    } = await supabase.auth.getSession();

    if (!session) {
      console.error('User is not authenticated.');
      return null;
    }

    const { data } = await supabase.auth.getUser();
    const userId = data?.user?.id;

    if (!userId) {
      console.error('Failed to get user ID.');
      return null;
    }

    // Ensure user exists in MongoDB if not already verified
    if (!userVerifiedInMongoDB) {
      try {
        const token = session.access_token;
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
            const createUserResponse = await fetch(
              `${API_URL}/api/user/create`,
              {
                method: 'POST',
                headers: {
                  Authorization: `Bearer ${token}`,
                  'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                  supabase_id: userId,
                  email: data?.user?.email,
                  created_at: data?.user?.created_at,
                }),
              }
            );

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

    return userId;
  } catch (error) {
    console.error('Error getting user ID:', error);
    return null;
  }
}
