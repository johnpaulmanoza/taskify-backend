import mysql from 'mysql2/promise';
import bcrypt from 'bcryptjs';

// Create a connection pool with more robust error handling
const createPool = () => {
  try {
    console.log('Creating MySQL connection pool...');
    return mysql.createPool({
      host: process.env.DB_HOST || 'localhost',
      user: process.env.DB_USER || 'root',
      password: process.env.DB_PASSWORD || 'password',
      database: process.env.DB_NAME || 'trello_clone',
      port: parseInt(process.env.DB_PORT || '3306'),
      waitForConnections: true,
      connectionLimit: 10,
      queueLimit: 0,
      connectTimeout: 10000
    });
  } catch (error) {
    console.error('Error creating connection pool:', error);
    throw error;
  }
};

// Initialize the pool
let pool: mysql.Pool;

try {
  pool = createPool();
} catch (error) {
  console.error('Failed to initialize database pool:', error);
  // Create a fallback pool that will attempt to reconnect when used
  pool = {
    execute: async (sql: string, params: any[]) => {
      try {
        const tempPool = createPool();
        return await tempPool.execute(sql, params);
      } catch (error) {
        console.error('Error executing query with fallback pool:', error);
        throw error;
      }
    }
  } as any;
}

// Helper function to execute SQL queries with error handling
export async function query(sql: string, params: any[] = []) {
  try {
    const [rows, fields] = await pool.execute(sql, params);
    return rows;
  } catch (error) {
    console.error('Database query error:', error);
    console.error('Query:', sql);
    console.error('Parameters:', params);
    throw error;
  }
}

// Initialize database tables if they don't exist
export async function initDb() {
  try {
    console.log('Initializing database...');
    
    // Create users table
    await query(`
      CREATE TABLE IF NOT EXISTS users (
        id INT AUTO_INCREMENT PRIMARY KEY,
        username VARCHAR(255) NOT NULL UNIQUE,
        email VARCHAR(255) NOT NULL UNIQUE,
        password VARCHAR(255) NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);

    // Create boards table
    await query(`
      CREATE TABLE IF NOT EXISTS boards (
        id INT AUTO_INCREMENT PRIMARY KEY,
        user_id INT NOT NULL,
        title VARCHAR(255) NOT NULL,
        description TEXT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
      )
    `);

    // Create lists table
    await query(`
      CREATE TABLE IF NOT EXISTS lists (
        id INT AUTO_INCREMENT PRIMARY KEY,
        board_id INT NOT NULL,
        title VARCHAR(255) NOT NULL,
        position INT NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        FOREIGN KEY (board_id) REFERENCES boards(id) ON DELETE CASCADE
      )
    `);

    // Create cards table
    await query(`
      CREATE TABLE IF NOT EXISTS cards (
        id INT AUTO_INCREMENT PRIMARY KEY,
        list_id INT NOT NULL,
        title VARCHAR(255) NOT NULL,
        description TEXT,
        position INT NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        FOREIGN KEY (list_id) REFERENCES lists(id) ON DELETE CASCADE
      )
    `);

    // Create labels table
    await query(`
      CREATE TABLE IF NOT EXISTS labels (
        id INT AUTO_INCREMENT PRIMARY KEY,
        name VARCHAR(255) NOT NULL,
        color VARCHAR(50) NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);

    // Create card_labels junction table
    await query(`
      CREATE TABLE IF NOT EXISTS card_labels (
        card_id INT NOT NULL,
        label_id INT NOT NULL,
        PRIMARY KEY (card_id, label_id),
        FOREIGN KEY (card_id) REFERENCES cards(id) ON DELETE CASCADE,
        FOREIGN KEY (label_id) REFERENCES labels(id) ON DELETE CASCADE
      )
    `);

    // Create default labels if they don't exist
    const defaultLabels = [
      { name: 'Bug', color: '#E53E3E' },
      { name: 'Feature', color: '#38A169' },
      { name: 'Enhancement', color: '#3182CE' },
      { name: 'Documentation', color: '#DD6B20' },
      { name: 'Question', color: '#805AD5' }
    ];

    for (const label of defaultLabels) {
      const existingLabels = await query(
        'SELECT * FROM labels WHERE name = ?',
        [label.name]
      ) as any[];

      if (!existingLabels || existingLabels.length === 0) {
        await query(
          'INSERT INTO labels (name, color) VALUES (?, ?)',
          [label.name, label.color]
        );
      }
    }

    // Create a sample user for testing
    const hashedPassword = bcrypt.hashSync('password123', 10);
    
    // Check if the sample user already exists
    const existingUser = await query(
      'SELECT * FROM users WHERE username = ?',
      ['testuser']
    ) as any[];
    
    if (!existingUser || existingUser.length === 0) {
      await query(
        'INSERT INTO users (username, email, password) VALUES (?, ?, ?)',
        ['testuser', 'test@example.com', hashedPassword]
      );
      console.log('Sample user created: testuser / password123');
    }

    console.log('Database initialized successfully');
    return { success: true, message: 'Database initialized successfully' };
  } catch (error) {
    console.error('Database initialization error:', error);
    throw error;
  }
}

// Helper function to get a user by username or email
export async function getUserByUsernameOrEmail(usernameOrEmail: string) {
  try {
    const users = await query(`
      SELECT * FROM users 
      WHERE username = ? OR email = ?
    `, [usernameOrEmail, usernameOrEmail]) as any[];
    
    return users.length > 0 ? users[0] : null;
  } catch (error) {
    console.error('Error getting user:', error);
    throw error;
  }
}

// Helper function to get a user by ID
export async function getUserById(id: number) {
  try {
    const users = await query(
      'SELECT id, username, email, created_at FROM users WHERE id = ?', 
      [id]
    ) as any[];
    
    return users.length > 0 ? users[0] : null;
  } catch (error) {
    console.error('Error getting user by ID:', error);
    throw error;
  }
}

// Initialize the database immediately
(async function() {
  try {
    await initDb();
    console.log('Database initialized on startup');
  } catch (error) {
    console.error('Failed to initialize database on startup:', error);
    console.error('The application will attempt to reconnect when needed');
  }
})();