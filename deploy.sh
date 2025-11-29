#!/bin/bash
# Deployment script for hampter project
# Make sure Git is installed before running this script

echo "Deploying hampter to GitHub..."

# Check if git is available
if ! command -v git &> /dev/null; then
    echo "ERROR: Git is not installed or not in PATH."
    echo "Please install Git from: https://git-scm.com/downloads"
    exit 1
fi

# Initialize git if needed
if [ ! -d .git ]; then
    echo "Initializing git repository..."
    git init
fi

# Add remote (or update if exists)
echo "Setting up remote repository..."
if git remote get-url origin &> /dev/null; then
    git remote set-url origin https://github.com/3seater/hampter.git
    echo "Updated existing remote"
else
    git remote add origin https://github.com/3seater/hampter.git
    echo "Added new remote"
fi

# Stage all files
echo "Staging files..."
git add .

# Commit
echo "Committing changes..."
git commit -m "Deploy hampter TikTok-style hamster meme site"

# Push to GitHub
echo "Pushing to GitHub..."
git branch -M main
git push -u origin main

if [ $? -eq 0 ]; then
    echo "Successfully deployed to GitHub!"
    echo "Repository: https://github.com/3seater/hampter.git"
else
    echo "Error pushing to GitHub. You may need to authenticate."
    echo "Try using GitHub Desktop or set up authentication."
fi

