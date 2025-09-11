import { db, sqlite } from '../server/db';
import bcrypt from 'bcrypt';
import * as schema from '../shared/schema-sqlite';

async function initializeDatabase() {
  console.log('Initializing SQLite database...');
  
  try {
    // Create all tables
    console.log('Creating tables...');
    
    // Users table
    sqlite.exec(`
      CREATE TABLE IF NOT EXISTS users (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        username TEXT NOT NULL UNIQUE,
        email TEXT NOT NULL UNIQUE,
        password TEXT NOT NULL,
        role TEXT NOT NULL DEFAULT 'operator',
        created_at INTEGER NOT NULL
      );
    `);

    // States table
    sqlite.exec(`
      CREATE TABLE IF NOT EXISTS states (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        name TEXT NOT NULL UNIQUE,
        code TEXT NOT NULL UNIQUE,
        created_at INTEGER NOT NULL
      );
    `);

    // Cities table
    sqlite.exec(`
      CREATE TABLE IF NOT EXISTS cities (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        name TEXT NOT NULL,
        state_id INTEGER NOT NULL REFERENCES states(id),
        created_at INTEGER NOT NULL
      );
    `);

    // Crops table
    sqlite.exec(`
      CREATE TABLE IF NOT EXISTS crops (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        name TEXT NOT NULL UNIQUE,
        unit TEXT NOT NULL DEFAULT 'quintal',
        base_price REAL,
        created_at INTEGER NOT NULL
      );
    `);

    // Parties table
    sqlite.exec(`
      CREATE TABLE IF NOT EXISTS parties (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        name TEXT NOT NULL,
        type TEXT NOT NULL,
        contact_number TEXT,
        email TEXT,
        address TEXT,
        city_id INTEGER REFERENCES cities(id),
        state_id INTEGER REFERENCES states(id),
        balance REAL DEFAULT 0,
        created_at INTEGER NOT NULL
      );
    `);

    // Purchases table
    sqlite.exec(`
      CREATE TABLE IF NOT EXISTS purchases (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        party_id INTEGER NOT NULL REFERENCES parties(id),
        crop_id INTEGER NOT NULL REFERENCES crops(id),
        quantity REAL NOT NULL,
        rate REAL NOT NULL,
        total_amount REAL NOT NULL,
        quality_grade TEXT,
        moisture_content REAL,
        purchase_date INTEGER NOT NULL,
        created_at INTEGER NOT NULL
      );
    `);

    // Sales table
    sqlite.exec(`
      CREATE TABLE IF NOT EXISTS sales (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        party_id INTEGER NOT NULL REFERENCES parties(id),
        crop_id INTEGER NOT NULL REFERENCES crops(id),
        quantity REAL NOT NULL,
        rate REAL NOT NULL,
        total_amount REAL NOT NULL,
        quality_grade TEXT,
        sale_date INTEGER NOT NULL,
        payment_status TEXT NOT NULL DEFAULT 'pending',
        created_at INTEGER NOT NULL
      );
    `);

    // Expenses table
    sqlite.exec(`
      CREATE TABLE IF NOT EXISTS expenses (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        type TEXT NOT NULL,
        description TEXT,
        amount REAL NOT NULL,
        purchase_id INTEGER REFERENCES purchases(id),
        sale_id INTEGER REFERENCES sales(id),
        expense_date INTEGER NOT NULL,
        created_at INTEGER NOT NULL
      );
    `);

    // Inventory table
    sqlite.exec(`
      CREATE TABLE IF NOT EXISTS inventory (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        crop_id INTEGER NOT NULL REFERENCES crops(id),
        quality_grade TEXT DEFAULT 'A',
        current_stock REAL NOT NULL DEFAULT 0,
        average_cost REAL NOT NULL DEFAULT 0,
        total_value REAL NOT NULL DEFAULT 0,
        last_updated INTEGER NOT NULL
      );
    `);

    // Ledger entries table
    sqlite.exec(`
      CREATE TABLE IF NOT EXISTS ledger_entries (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        party_id INTEGER NOT NULL REFERENCES parties(id),
        transaction_type TEXT NOT NULL,
        transaction_id INTEGER,
        debit REAL NOT NULL DEFAULT 0,
        credit REAL NOT NULL DEFAULT 0,
        balance REAL NOT NULL DEFAULT 0,
        description TEXT,
        transaction_date INTEGER NOT NULL,
        created_at INTEGER NOT NULL
      );
    `);

    console.log('Tables created successfully!');

    // Check if admin user exists
    const existingUser = sqlite.prepare('SELECT * FROM users WHERE email = ?').get('admin@example.com');
    
    if (!existingUser) {
      console.log('Creating default admin user...');
      
      // Hash password
      const hashedPassword = await bcrypt.hash('admin123', 10);
      
      // Insert admin user
      const insertUser = sqlite.prepare(`
        INSERT INTO users (username, email, password, role, created_at) 
        VALUES (?, ?, ?, ?, ?)
      `);
      
      insertUser.run('admin', 'admin@example.com', hashedPassword, 'admin', Date.now());

      console.log('Admin user created!');
      console.log('Login credentials:');
      console.log('Email: admin@example.com');
      console.log('Password: admin123');
    } else {
      console.log('Admin user already exists');
    }

    console.log('Database initialization complete!');
    
  } catch (error) {
    console.error('Error initializing database:', error);
  } finally {
    sqlite.close();
  }
}

// Run initialization
initializeDatabase();