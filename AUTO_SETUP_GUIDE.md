# 🚀 Auto Setup Guide - Do Everything For You!

## Option 1: Use the Setup Script (Easiest!)

I've created a script that will do everything for you:

1. **Run the setup script:**
   ```powershell
   .\setup-firebase.ps1
   ```

2. **Enter your Firebase config values** when prompted (the script will ask for each one)

3. **Done!** The script creates `.env.local` automatically

## Option 2: Quick Manual Setup (2 minutes)

### Step 1: Get Your Firebase Config

1. Go to https://console.firebase.google.com/
2. Select your project (or create one)
3. Click ⚙️ **Project Settings**
4. Scroll to **"Your apps"** section
5. Click on your web app (or click `</>` to add one)
6. You'll see a config like this:
   ```javascript
   const firebaseConfig = {
     apiKey: "AIzaSy...",
     authDomain: "your-project.firebaseapp.com",
     projectId: "your-project-id",
     storageBucket: "your-project.appspot.com",
     messagingSenderId: "123456789",
     appId: "1:123456789:web:abc123"
   };
   ```

### Step 2: Create `.env.local` File

**In your project root folder** (`G:\3D\Projects\2025\November\Hamster\hamster_cursor`):

1. Create a new file named `.env.local` (starts with a dot!)
2. Copy the template from `env.local.template`
3. Replace the `PASTE_YOUR_...` values with your actual Firebase values

**Example:**
```
VITE_FIREBASE_API_KEY=AIzaSyC1234567890abcdefghijklmnopqrstuvwxyz
VITE_FIREBASE_AUTH_DOMAIN=my-project.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=my-project-12345
VITE_FIREBASE_STORAGE_BUCKET=my-project-12345.appspot.com
VITE_FIREBASE_MESSAGING_SENDER_ID=987654321
VITE_FIREBASE_APP_ID=1:987654321:web:abcdef123456789
```

### Step 3: Enable Firestore

1. In Firebase Console, go to **"Build" → "Firestore Database"**
2. Click **"Create database"**
3. Choose **"Start in test mode"**
4. Select a location (closest to your users)
5. Click **"Enable"**

### Step 4: Set Security Rules

1. In Firestore, go to **"Rules"** tab
2. Paste this:
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
3. Click **"Publish"**

### Step 5: Restart Dev Server

```bash
npm run dev
```

## ✅ That's It!

Your app now has:
- ✅ Real-time comments
- ✅ Live likes
- ✅ Persistent bookmarks
- ✅ User profiles

## 🧪 Test It

1. Open your app in browser
2. Create a username
3. Post a comment
4. Check Firebase Console → Firestore Database to see your data!

## 🆘 Need Help?

- Check browser console for errors
- Verify `.env.local` is in the project root
- Make sure Firestore is enabled
- Restart dev server after creating `.env.local`

