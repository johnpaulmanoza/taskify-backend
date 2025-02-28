#!/bin/bash
# This script deploys the Taskify backend to an EC2 instance using Docker

# Check if required environment variables are set
# Load environment variables from .env file and export them
if [[ -f .env ]]; then
  export $(grep -v '^#' .env | xargs)
else
  echo "Error: .env file not found!"
  exit 1
fi

# Function to check if a variable is empty
check_env_var() {
  local var_name="$1"
  local var_value="${!var_name}"
  
  if [[ -z "$var_value" ]]; then
    echo "Error: $var_name is not set or empty -- {$var_value}"
    exit 1
  fi
}

# Check required environment variables
check_env_var "EC2_HOST"
check_env_var "REPO_URL"
check_env_var "JWT_SECRET"
check_env_var "DB_HOST"
check_env_var "DB_USER"
check_env_var "DB_PASSWORD"
check_env_var "DB_NAME"

echo "All required environment variables are set."

# Set variables
EC2_USER="ec2-user"
KEY_PATH="./taskify-key.pem" # Path to your SSH key (relative to current directory)

# Colors for output
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

echo -e "${YELLOW}Deploying Taskify Backend to EC2...${NC}"

# Debug information
echo -e "${YELLOW}Checking for SSH key file...${NC}"
if [ -f "$KEY_PATH" ]; then
    echo -e "${GREEN}Found SSH key at: $KEY_PATH${NC}"
    ls -la "$KEY_PATH"
else
    echo -e "${RED}SSH key not found at: $KEY_PATH${NC}"
    echo -e "${YELLOW}Current directory: $(pwd)${NC}"
    echo -e "${YELLOW}Files in current directory:${NC}"
    ls -la
    exit 1
fi

# Set proper permissions for the key file
echo -e "${YELLOW}Setting permissions for key file: $KEY_PATH${NC}"
chmod 400 "$KEY_PATH"

# Create deployment script to run on the EC2 instance
echo -e "${YELLOW}Creating deployment script...${NC}"
cat > /tmp/deploy-script.sh << 'EOF'
#!/bin/bash

# Install Docker if not already installed
if ! command -v docker &> /dev/null; then
    echo "Installing Docker..."
    sudo yum update -y
    sudo amazon-linux-extras install docker -y
    sudo service docker start
    sudo usermod -a -G docker ec2-user
    sudo systemctl enable docker
    
    # Install Docker Compose
    sudo curl -L "https://github.com/docker/compose/releases/download/v2.20.3/docker-compose-$(uname -s)-$(uname -m)" -o /usr/local/bin/docker-compose
    sudo chmod +x /usr/local/bin/docker-compose
    
    # Need to log out and back in for group changes to take effect
    echo "Docker installed. Please reconnect to the instance for group changes to take effect."
    exit 0
fi

# Create app directory if it doesn't exist
mkdir -p ~/taskify-backend

# Clone or pull the repository
if [ -d ~/taskify-backend/.git ]; then
    echo "Updating existing repository..."
    cd ~/taskify-backend
    git pull
else
    echo "Cloning repository..."
    git clone REPO_URL_PLACEHOLDER ~/taskify-backend
    cd ~/taskify-backend
fi

# Create .env file for Docker Compose
cat > .env << 'ENV'
JWT_SECRET=RDS_JWT_SECRET_PLACEHOLDER
DB_HOST=RDS_ENDPOINT_PLACEHOLDER
DB_USER=RDS_USERNAME_PLACEHOLDER
DB_PASSWORD=RDS_PASSWORD_PLACEHOLDER
DB_NAME=RDS_DBNAME_PLACEHOLDER
DB_PORT=3306
EC2_HOST=EC2_HOST_PLACEHOLDER
REPO_URL=REPO_URL_PLACEHOLDER
ENV

# Build and start the Docker containers
echo "Building and starting Docker containers..."
docker-compose down
docker-compose build --no-cache
docker-compose up -d

# Set up Nginx as reverse proxy if not already configured
if [ ! -f /etc/nginx/conf.d/taskify.conf ]; then
    echo "Setting up Nginx reverse proxy..."
    sudo amazon-linux-extras install nginx1 -y
    sudo systemctl start nginx
    sudo systemctl enable nginx
    
    # Configure Nginx
    sudo tee /etc/nginx/conf.d/taskify.conf > /dev/null << 'EON'
server {
    listen 80;
    server_name _;
    
    # Backend API (Next.js)
    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
    }
}
EON
    
    sudo systemctl restart nginx
fi

echo "Deployment completed successfully!"
EOF

# Replace placeholders in the script
echo -e "${YELLOW}Configuring deployment script...${NC}"

# Replace placeholders using perl (works on both Linux and macOS)
perl -i -pe "s|REPO_URL_PLACEHOLDER|$REPO_URL|g" /tmp/deploy-script.sh
perl -i -pe "s|RDS_ENDPOINT_PLACEHOLDER|$DB_HOST|g" /tmp/deploy-script.sh
perl -i -pe "s|RDS_USERNAME_PLACEHOLDER|$DB_USER|g" /tmp/deploy-script.sh
perl -i -pe "s|RDS_PASSWORD_PLACEHOLDER|$DB_PASSWORD|g" /tmp/deploy-script.sh
perl -i -pe "s|RDS_DBNAME_PLACEHOLDER|$DB_NAME|g" /tmp/deploy-script.sh
perl -i -pe "s|RDS_JWT_SECRET_PLACEHOLDER|$JWT_SECRET|g" /tmp/deploy-script.sh
perl -i -pe "s|EC2_HOST_PLACEHOLDER|$EC2_HOST|g" /tmp/deploy-script.sh
perl -i -pe "s|REPO_URL_PLACEHOLDER|$REPO_URL|g" /tmp/deploy-script.sh

# Make the script executable
chmod +x /tmp/deploy-script.sh

# Copy the script to the EC2 instance
echo -e "${YELLOW}Copying deployment script to EC2 instance...${NC}"
scp -i "$KEY_PATH" -o StrictHostKeyChecking=no /tmp/deploy-script.sh $EC2_USER@$EC2_HOST:~/deploy-script.sh

if [ $? -ne 0 ]; then
    echo -e "${RED}Failed to copy deployment script to EC2 instance.${NC}"
    echo -e "${YELLOW}Checking SSH connection...${NC}"
    ssh -i "$KEY_PATH" -o StrictHostKeyChecking=no -o ConnectTimeout=10 $EC2_USER@$EC2_HOST "echo 'SSH connection successful'"
    exit 1
fi

# Execute the script on the EC2 instance
echo -e "${YELLOW}Executing deployment script on EC2 instance...${NC}"
ssh -i "$KEY_PATH" -o StrictHostKeyChecking=no $EC2_USER@$EC2_HOST "chmod +x ~/deploy-script.sh && ~/deploy-script.sh"

if [ $? -ne 0 ]; then
    echo -e "${RED}Failed to execute deployment script on EC2 instance.${NC}"
    exit 1
fi

# Clean up local script
rm /tmp/deploy-script.sh

echo -e "${GREEN}Deployment process completed!${NC}"
echo -e "${YELLOW}Note: If Docker was just installed, you may need to reconnect to the instance and run the script again.${NC}"
echo -e "${GREEN}Your application should be accessible at: http://$EC2_HOST${NC}"