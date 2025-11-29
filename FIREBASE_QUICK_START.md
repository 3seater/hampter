# Firebase Quick Start Guide

## 🚀 Quick Setup (5 minutes)

### 1. Create Firebase Project
- Go to https://console.firebase.google.com/
- Click "Add project"
- Name it `hampter` (or your choice)
- Complete setup wizard

### 2. Register Web App
- Click the Web icon (`</>`)
- App nickname: `hampter-web`
- Click "Register app"
- **COPY THE CONFIG VALUES** (you'll need them next)

### 3. Enable Firestore
- Go to "Build" → "Firestore Database"
- Click "Create database"
- Choose "Start in test mode"
- Select location
- Click "Enable"

### 4. Set Security Rules
- Go to "Firestore Database" → "Rules"
- Paste these rules:
```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /{document=**} {
      allow read, write: if true;
    }
  }
}
```
- Click "Publish"

### 5. Add Config to Project
1. Copy `.env.local.example` to `.env.local`:
   ```bash
   cp .env.local.example .env.local
   ```

2. Open `.env.local` and paste your Firebase config values

3. Restart your dev server:
   ```bash
   npm run dev
   ```

## ✅ That's it!

Your app now has:
- ✅ Real-time comments
- ✅ Live like counts
- ✅ Persistent bookmarks
- ✅ User profiles stored in Firebase

## 📊 View Your Data

Go to Firebase Console → Firestore Database to see:
- `users` - All user profiles
- `comments` - All comments and replies
- `videoStats` - Video likes, comments, bookmarks counts

## 🔒 Security Note

The rules above allow anyone to read/write (test mode). Before going live, update the rules for production security.

