# Deployment script for hampter project
# Make sure Git is installed before running this script

Write-Host "Deploying hampter to GitHub..." -ForegroundColor Green

# Check if git is available
try {
    git --version | Out-Null
} catch {
    Write-Host "ERROR: Git is not installed or not in PATH." -ForegroundColor Red
    Write-Host "Please install Git from: https://git-scm.com/downloads" -ForegroundColor Yellow
    exit 1
}

# Initialize git if needed
if (-not (Test-Path .git)) {
    Write-Host "Initializing git repository..." -ForegroundColor Yellow
    git init
}

# Add remote (or update if exists)
Write-Host "Setting up remote repository..." -ForegroundColor Yellow
$remoteExists = git remote get-url origin 2>$null
if ($LASTEXITCODE -eq 0) {
    git remote set-url origin https://github.com/3seater/hampter.git
    Write-Host "Updated existing remote" -ForegroundColor Green
} else {
    git remote add origin https://github.com/3seater/hampter.git
    Write-Host "Added new remote" -ForegroundColor Green
}

# Stage all files
Write-Host "Staging files..." -ForegroundColor Yellow
git add .

# Commit
Write-Host "Committing changes..." -ForegroundColor Yellow
git commit -m "Deploy hampter TikTok-style hamster meme site"

# Push to GitHub
Write-Host "Pushing to GitHub..." -ForegroundColor Yellow
git branch -M main
git push -u origin main

if ($LASTEXITCODE -eq 0) {
    Write-Host "Successfully deployed to GitHub!" -ForegroundColor Green
    Write-Host "Repository: https://github.com/3seater/hampter.git" -ForegroundColor Cyan
} else {
    Write-Host "Error pushing to GitHub. You may need to authenticate." -ForegroundColor Red
    Write-Host "Try using GitHub Desktop or set up authentication." -ForegroundColor Yellow
}

