import { supabase } from '@/lib/supabase';

// This script should be run in a development environment with proper permissions
// It creates the necessary tables for the application

async function initTables() {
  console.log('Initializing database tables...');
  
  try {
    // Create users table
    const { error: usersError } = await supabase.rpc('execute_sql', {
      sql: `
        CREATE TABLE IF NOT EXISTS users (
          id UUID PRIMARY KEY REFERENCES auth.users(id),
          username TEXT UNIQUE NOT NULL,
          phone TEXT UNIQUE NOT NULL,
          email TEXT UNIQUE,
          created_at TIMESTAMP DEFAULT NOW()
        );
      `
    });

    if (usersError) {
      console.error('Error creating users table:', usersError);
    } else {
      console.log('Users table created successfully');
    }

    // Create products table
    const { error: productsError } = await supabase.rpc('execute_sql', {
      sql: `
        CREATE TABLE IF NOT EXISTS products (
          id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
          name TEXT NOT NULL,
          brand TEXT NOT NULL,
          price DECIMAL(10, 2) NOT NULL,
          description TEXT,
          image TEXT,
          created_at TIMESTAMP DEFAULT NOW()
        );
      `
    });

    if (productsError) {
      console.error('Error creating products table:', productsError);
    } else {
      console.log('Products table created successfully');
    }

    // Create RLS policies for users table
    const { error: usersPolicyError } = await supabase.rpc('execute_sql', {
      sql: `
        ALTER TABLE users ENABLE ROW LEVEL SECURITY;
        CREATE POLICY "Users are viewable by themselves" ON users
          FOR SELECT USING (auth.uid() = id);
        CREATE POLICY "Users can insert their own profile" ON users
          FOR INSERT WITH CHECK (auth.uid() = id);
        CREATE POLICY "Users can update their own profile" ON users
          FOR UPDATE USING (auth.uid() = id);
      `
    });

    if (usersPolicyError) {
      console.error('Error creating users policies:', usersPolicyError);
    } else {
      console.log('Users policies created successfully');
    }

    // Create RLS policies for products table
    const { error: productsPolicyError } = await supabase.rpc('execute_sql', {
      sql: `
        ALTER TABLE products ENABLE ROW LEVEL SECURITY;
        CREATE POLICY "Products are viewable by everyone" ON products
          FOR SELECT USING (true);
        CREATE POLICY "Products can be inserted by authenticated users" ON products
          FOR INSERT WITH CHECK (auth.role() = 'authenticated');
        CREATE POLICY "Products can be updated by authenticated users" ON products
          FOR UPDATE USING (auth.role() = 'authenticated');
        CREATE POLICY "Products can be deleted by authenticated users" ON products
          FOR DELETE USING (auth.role() = 'authenticated');
      `
    });

    if (productsPolicyError) {
      console.error('Error creating products policies:', productsPolicyError);
    } else {
      console.log('Products policies created successfully');
    }

    console.log('Database initialization complete!');
  } catch (error) {
    console.error('Error initializing database:', error);
  }
}

// Run the initialization if this script is executed directly
if (typeof window === 'undefined') {
  initTables();
}

export default initTables;