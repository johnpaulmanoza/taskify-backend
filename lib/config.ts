// Configuration file for the application

// Get environment variables with fallbacks
export const config = {
    // Database configuration
    db: {
      host: process.env.DB_HOST || 'localhost',
      user: process.env.DB_USER || 'root',
      password: process.env.DB_PASSWORD || 'password',
      name: process.env.DB_NAME || 'taskify',
      port: parseInt(process.env.DB_PORT || '3306', 10),
    },
    
    // JWT configuration
    jwt: {
      secret: process.env.JWT_SECRET || 'your-secret-key-at-least-32-characters',
      expiresIn: '24h',
    },
    
    // Deployment configuration
    deployment: {
      ec2Host: process.env.EC2_HOST || 'localhost',
      repoUrl: process.env.REPO_URL || 'https://github.com/yourusername/taskify-backend.git',
    },
    
    // Server configuration
    server: {
      port: parseInt(process.env.PORT || '3000', 10),
      nodeEnv: process.env.NODE_ENV || 'development',
    }
  };