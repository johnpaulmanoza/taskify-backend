// This script creates the MySQL database and tables
require('dotenv').config();
const mysql = require('mysql2/promise');

async function main() {
  let connection;

  try {
    console.log('Attempting to connect to MySQL server...');
    console.log(`Host: ${process.env.DB_HOST || 'localhost'}`);
    console.log(`Port: ${process.env.DB_PORT || '3306'}`);
    console.log(`User: ${process.env.DB_USER || 'root'}`);
    
    // First connect without database to create it if it doesn't exist
    connection = await mysql.createConnection({
      host: process.env.DB_HOST || 'localhost',
      user: process.env.DB_USER || 'root',
      password: process.env.DB_PASSWORD || 'password',
      port: parseInt(process.env.DB_PORT || '3306'),
      // Add connection timeout
      connectTimeout: 10000
    });

    console.log('Connected to MySQL server');

    // Create database if it doesn't exist
    const dbName = process.env.DB_NAME || 'trello_clone';
    await connection.execute(`CREATE DATABASE IF NOT EXISTS ${dbName}`);
    console.log(`Database '${dbName}' created or already exists`);

    // Close the initial connection
    await connection.end();

    // Connect to the specific database
    connection = await mysql.createConnection({
      host: process.env.DB_HOST || 'localhost',
      user: process.env.DB_USER || 'root',
      password: process.env.DB_PASSWORD || 'password',
      database: dbName,
      port: parseInt(process.env.DB_PORT || '3306'),
      connectTimeout: 10000
    });

    console.log(`Connected to database '${dbName}'`);

    // Create tables
    console.log('Creating tables...');

    // Create users table
    await connection.execute(`
      CREATE TABLE IF NOT EXISTS users (
        id INT AUTO_INCREMENT PRIMARY KEY,
        username VARCHAR(255) NOT NULL UNIQUE,
        email VARCHAR(255) NOT NULL UNIQUE,
        password VARCHAR(255) NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);
    console.log('Users table created');

    // Create boards table
    await connection.execute(`
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
    console.log('Boards table created');

    // Create lists table
    await connection.execute(`
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
    console.log('Lists table created');

    // Create cards table
    await connection.execute(`
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
    console.log('Cards table created');

    // Create labels table
    await connection.execute(`
      CREATE TABLE IF NOT EXISTS labels (
        id INT AUTO_INCREMENT PRIMARY KEY,
        name VARCHAR(255) NOT NULL,
        color VARCHAR(50) NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);
    console.log('Labels table created');

    // Create card_labels junction table
    await connection.execute(`
      CREATE TABLE IF NOT EXISTS card_labels (
        card_id INT NOT NULL,
        label_id INT NOT NULL,
        PRIMARY KEY (card_id, label_id),
        FOREIGN KEY (card_id) REFERENCES cards(id) ON DELETE CASCADE,
        FOREIGN KEY (label_id) REFERENCES labels(id) ON DELETE CASCADE
      )
    `);
    console.log('Card_labels table created');

    console.log('All tables created successfully');

  } catch (error) {
    console.error('Error setting up database:', error);
    console.error('Error details:', error.message);
    
    // Provide more helpful error messages based on common issues
    if (error.code === 'ECONNREFUSED') {
      console.error('\nConnection refused. This usually means:');
      console.error('1. MySQL server is not running');
      console.error('2. MySQL server is not accepting connections on the specified host/port');
      console.error('3. A firewall is blocking the connection');
      console.error('\nTroubleshooting steps:');
      console.error('- Check if MySQL is running: `sudo service mysql status` (Linux) or `brew services list` (macOS)');
      console.error('- Start MySQL if needed: `sudo service mysql start` (Linux) or `brew services start mysql` (macOS)');
      console.error('- Verify MySQL connection settings in your .env file');
      console.error('- Try connecting with the mysql command line client to verify credentials');
    } else if (error.code === 'ER_ACCESS_DENIED_ERROR') {
      console.error('\nAccess denied. This usually means:');
      console.error('1. The username or password is incorrect');
      console.error('2. The user does not have permission to connect from this host');
      console.error('\nTroubleshooting steps:');
      console.error('- Double-check your username and password in the .env file');
      console.error('- Try connecting with the mysql command line client to verify credentials');
    }
    
    process.exit(1);
  } finally {
    if (connection) {
      await connection.end();
      console.log('Database connection closed');
    }
  }
}

main();