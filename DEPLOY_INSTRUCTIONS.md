# Deployment Instructions for hampter

To deploy this project to GitHub (https://github.com/3seater/hampter.git), follow these steps:

## Prerequisites
1. Install Git if not already installed: https://git-scm.com/downloads
2. Make sure you have GitHub credentials set up

## Steps to Deploy

1. **Initialize Git repository** (if not already initialized):
   ```bash
   git init
   ```

2. **Add the remote repository**:
   ```bash
   git remote add origin https://github.com/3seater/hampter.git
   ```
   
   Or if the remote already exists, update it:
   ```bash
   git remote set-url origin https://github.com/3seater/hampter.git
   ```

3. **Stage all files**:
   ```bash
   git add .
   ```

4. **Commit the changes**:
   ```bash
   git commit -m "Initial commit: hampter TikTok-style hamster meme site"
   ```

5. **Push to GitHub**:
   ```bash
   git branch -M main
   git push -u origin main
   ```

## If you encounter authentication issues:

- Use a Personal Access Token instead of password
- Or set up SSH keys for GitHub
- Or use GitHub Desktop application

## Project Structure
- React + TypeScript + Vite
- TikTok-style UI with video player and comments
- Hamster meme image picker
- Social sharing buttons
- Mobile responsive design

