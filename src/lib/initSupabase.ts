import { supabase } from './supabase';

// Function to create tables if they don't exist
export const initDatabase = async () => {
  try {
    // Create users table
    const { error: usersError } = await supabase.rpc('create_users_table');
    if (usersError && !usersError.message.includes('already exists')) {
      console.error('Error creating users table:', usersError);
    }

    // Create products table
    const { error: productsError } = await supabase.rpc('create_products_table');
    if (productsError && !productsError.message.includes('already exists')) {
      console.error('Error creating products table:', productsError);
    }

    console.log('Database initialization complete');
  } catch (error) {
    console.error('Database initialization error:', error);
  }
};

// Direct SQL approach for creating tables
export const createTables = async () => {
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
    }

    console.log('Tables created successfully');
  } catch (error) {
    console.error('Error creating tables:', error);
  }
};