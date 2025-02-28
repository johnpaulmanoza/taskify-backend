#!/bin/bash

# This script deploys the Taskify backend to an EC2 instance using Docker

# Set variables
EC2_USER="ec2-user"
EC2_HOST="your-ec2-public-ip" # Replace with your EC2 public IP
KEY_PATH="~/path/to/your-key.pem" # Replace with path to your key file
REPO_URL="https://github.com/yourusername/taskify-backend.git" # Replace with your repo URL

# Colors for output
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

echo -e "${YELLOW}Deploying Taskify Backend to EC2...${NC}"

# Create deployment script to run on the EC2 instance
cat > deploy-script.sh << 'EOL'
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
EOL

# Replace placeholders in the script
sed -i "s|REPO_URL_PLACEHOLDER|$REPO_URL|g" deploy-script.sh

# Get RDS details from Terraform output
echo -e "${YELLOW}Retrieving RDS details from Terraform...${NC}"
cd terraform

# Get RDS endpoint
RDS_ENDPOINT=$(terraform output -raw rds_endpoint 2>/dev/null)
if [ -z "$RDS_ENDPOINT" ]; then
    echo -e "${RED}Failed to get RDS endpoint from Terraform. Make sure you've applied your Terraform configuration.${NC}"
    exit 1
fi

# Get other RDS details from terraform.tfvars
RDS_USERNAME=$(grep db_username terraform.tfvars | cut -d '=' -f2 | tr -d ' "')
RDS_PASSWORD=$(grep db_password terraform.tfvars | cut -d '=' -f2 | tr -d ' "')
RDS_DBNAME=$(grep db_name terraform.tfvars | cut -d '=' -f2 | tr -d ' "')
JWT_SECRET=$(grep jwt_secret terraform.tfvars | cut -d '=' -f2 | tr -d ' "')

# Get EC2 public IP if not provided
if [ "$EC2_HOST" = "your-ec2-public-ip" ]; then
    EC2_HOST=$(terraform output -raw ec2_public_ip 2>/dev/null)
    if [ -z "$EC2_HOST" ]; then
        echo -e "${RED}Failed to get EC2 public IP from Terraform. Please provide it manually.${NC}"
        exit 1
    fi
fi

cd ..

# Replace RDS details in the script
sed -i "s|RDS_ENDPOINT_PLACEHOLDER|$RDS_ENDPOINT|g" deploy-script.sh
sed -i "s|RDS_USERNAME_PLACEHOLDER|$RDS_USERNAME|g" deploy-script.sh
sed -i "s|RDS_PASSWORD_PLACEHOLDER|$RDS_PASSWORD|g" deploy-script.sh
sed -i "s|RDS_DBNAME_PLACEHOLDER|$RDS_DBNAME|g" deploy-script.sh
sed -i "s|RDS_JWT_SECRET_PLACEHOLDER|$JWT_SECRET|g" deploy-script.sh

# Make the script executable
chmod +x deploy-script.sh

# Copy the script to the EC2 instance
echo -e "${YELLOW}Copying deployment script to EC2 instance...${NC}"
scp -i "$KEY_PATH" -o StrictHostKeyChecking=no deploy-script.sh $EC2_USER@$EC2_HOST:~/deploy-script.sh

# Execute the script on the EC2 instance
echo -e "${YELLOW}Executing deployment script on EC2 instance...${NC}"
ssh -i "$KEY_PATH" -o StrictHostKeyChecking=no $EC2_USER@$EC2_HOST "chmod +x ~/deploy-script.sh && ~/deploy-script.sh"

# Clean up local script
rm deploy-script.sh

echo -e "${GREEN}Deployment process completed!${NC}"
echo -e "${YELLOW}Note: If Docker was just installed, you may need to reconnect to the instance and run the script again.${NC}"
echo -e "${GREEN}Your application should be accessible at: http://$EC2_HOST${NC}"