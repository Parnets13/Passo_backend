#!/bin/bash

# Backend Setup Script
echo "🚀 Setting up Worker Management Backend..."

# Check if Node.js is installed
if ! command -v node &> /dev/null; then
    echo "❌ Node.js is not installed. Please install Node.js first."
    exit 1
fi

echo "✅ Node.js version: $(node -v)"

# Check if npm is installed
if ! command -v npm &> /dev/null; then
    echo "❌ npm is not installed. Please install npm first."
    exit 1
fi

echo "✅ npm version: $(npm -v)"

# Install dependencies
echo "📦 Installing dependencies..."
npm install

if [ $? -ne 0 ]; then
    echo "❌ Failed to install dependencies"
    exit 1
fi

echo "✅ Dependencies installed successfully"

# Create .env file if it doesn't exist
if [ ! -f .env ]; then
    echo "📝 Creating .env file..."
    cp .env.example .env
    echo "✅ .env file created. Please update it with your configuration."
else
    echo "⚠️  .env file already exists. Skipping..."
fi

# Check if MongoDB is running
echo "🔍 Checking MongoDB connection..."
if command -v mongosh &> /dev/null; then
    mongosh --eval "db.version()" > /dev/null 2>&1
    if [ $? -eq 0 ]; then
        echo "✅ MongoDB is running"
    else
        echo "⚠️  MongoDB is not running. Please start MongoDB or use MongoDB Atlas."
    fi
else
    echo "⚠️  mongosh not found. Please ensure MongoDB is installed and running."
fi

# Ask if user wants to seed data
read -p "Do you want to seed initial data? (y/n) " -n 1 -r
echo
if [[ $REPLY =~ ^[Yy]$ ]]; then
    echo "🌱 Seeding database..."
    npm run seed
    if [ $? -eq 0 ]; then
        echo "✅ Database seeded successfully"
        echo ""
        echo "📝 Default Admin Credentials:"
        echo "   Email: admin@admin.com"
        echo "   Password: admin123"
        echo ""
    else
        echo "❌ Failed to seed database. Please check your MongoDB connection."
    fi
fi

echo ""
echo "🎉 Setup complete!"
echo ""
echo "To start the server, run:"
echo "  npm run dev"
echo ""
