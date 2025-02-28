# Taskify API with MySQL

This is a Taskify API built with Next.js and MySQL. It provides endpoints to manage boards, lists, cards, and labels with authentication.

## Features

- User authentication (register, login, logout)
- Board management (create, read, update, delete)
- List management within boards
- Card management within lists
- Label management for cards
- MySQL database for data storage

## Getting Started

### Prerequisites

- Node.js 14.x or higher
- MySQL 5.7 or higher

### Setting Up MySQL Locally

1. **Install MySQL**:

   - **Windows**: Download and install MySQL from the [official website](https://dev.mysql.com/downloads/installer/).
   - **macOS**: Use Homebrew: `brew install mysql`
   - **Linux (Ubuntu/Debian)**: `sudo apt install mysql-server`

2. **Start MySQL Service**:

   - **Windows**: MySQL service should start automatically after installation.
   - **macOS**: `brew services start mysql`
   - **Linux**: `sudo systemctl start mysql`

3. **Set Up Root Password**:

   - **Windows/macOS**: During installation, you'll be prompted to set a root password.
   - **Linux**: `sudo mysql_secure_installation`

4. **Log in to MySQL**:

   ```bash
   mysql -u root -p
   ```

5. **Create Database**:

   ```sql
   CREATE DATABASE trello_clone;
   ```

6. **Create a User (Optional but Recommended)**:

   ```sql
   CREATE USER 'trello_user'@'localhost' IDENTIFIED BY 'your_password';
   GRANT ALL PRIVILEGES ON trello_clone.* TO 'trello_user'@'localhost';
   FLUSH PRIVILEGES;
   ```

### Installing and Running the Application

1. Clone the repository:

   ```bash
   git clone <repository-url>
   cd trello-clone-backend
   ```

2. Install dependencies:

   ```bash
   npm install
   ```

3. Configure environment variables:

   Create a `.env` file in the root directory with the following content:

   ```
   JWT_SECRET=your_jwt_secret
   DB_HOST=localhost
   DB_USER=root  # or the user you created
   DB_PASSWORD=your_password
   DB_NAME=trello_clone
   DB_PORT=3306
   ```

4. Run the database migration script:

   ```bash
   npm run db:migrate
   ```

5. Start the development server:

   ```bash
   npm run dev
   ```

6. The API will be available at `http://localhost:3000`

## Troubleshooting MySQL Connection Issues

If you encounter the error `ECONNREFUSED` when running the migration script, it typically means:

1. **MySQL server is not running**
   - Start MySQL using the appropriate command for your OS:
     - macOS: `brew services start mysql`
     - Linux: `sudo service mysql start` or `sudo systemctl start mysql`
     - Windows: Check Services or MySQL Workbench

2. **Incorrect connection details**
   - Verify the host, port, username, and password in your `.env` file
   - Try connecting with the MySQL command line client to test your credentials:
     ```
     mysql -u root -p -h localhost
     ```

3. **Firewall blocking connections**
   - Check if your firewall is blocking port 3306 (MySQL's default port)

4. **MySQL not accepting remote connections**
   - If connecting from a different machine, ensure MySQL is configured to accept remote connections

## API Documentation

The API documentation is available in the application itself. After starting the server, navigate to `http://localhost:3000` in your browser to see the interactive API documentation.

## Sample User

A sample user is created automatically for testing:

- **Username**: testuser
- **Email**: test@example.com
- **Password**: password123

## License

This project is licensed under the MIT License.