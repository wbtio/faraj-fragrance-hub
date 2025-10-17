import { supabase } from '@/lib/supabase';

// This script creates an admin user for the dashboard
// Note: This should be run in a secure environment with proper permissions

async function createAdminUser() {
  console.log('Creating admin user...');
  
  try {
    // Sign up the admin user
    const { data, error } = await supabase.auth.signUp({
      email: 'admin@farajfragrance.com',
      password: 'Admin123!',
      options: {
        data: {
          username: 'admin',
          phone: '0000000000'
        }
      }
    });

    if (error) {
      // Check if user already exists
      if (error.message.includes('already registered')) {
        console.log('Admin user already exists');
      } else {
        console.error('Error creating admin user:', error);
      }
    } else {
      console.log('Admin user created successfully:', data.user?.id);
      
      // Also insert into users table
      if (data.user) {
        const { error: insertError } = await supabase
          .from('users')
          .insert([
            {
              id: data.user.id,
              username: 'admin',
              phone: '0000000000',
              email: 'admin@farajfragrance.com'
            }
          ]);

        if (insertError) {
          console.error('Error inserting admin user into users table:', insertError);
        } else {
          console.log('Admin user inserted into users table');
        }
      }
    }
  } catch (error) {
    console.error('Error creating admin user:', error);
  }
}

// Run the function if this script is executed directly
if (typeof window === 'undefined') {
  createAdminUser();
}

export default createAdminUser;