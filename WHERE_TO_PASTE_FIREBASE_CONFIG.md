# Where to Paste Your Firebase Config

## 📍 Location: `.env.local` file in the project root

The file should be in the same folder as `package.json`, `src`, `public`, etc.

## 📝 Step-by-Step Instructions

### Option 1: Create the file manually (Easiest)

1. **Open your project folder** in File Explorer:
   ```
   G:\3D\Projects\2025\November\Hamster\hamster_cursor
   ```

2. **Create a new file** called `.env.local` (make sure it starts with a dot!)

3. **Paste this template** into the file:
   ```
   VITE_FIREBASE_API_KEY=your-api-key-here
   VITE_FIREBASE_AUTH_DOMAIN=your-project.firebaseapp.com
   VITE_FIREBASE_PROJECT_ID=your-project-id
   VITE_FIREBASE_STORAGE_BUCKET=your-project.appspot.com
   VITE_FIREBASE_MESSAGING_SENDER_ID=123456789
   VITE_FIREBASE_APP_ID=1:123456789:web:abc123
   ```

4. **Replace the placeholder values** with your actual Firebase config values from Firebase Console

### Option 2: Use VS Code or your editor

1. In VS Code (or your editor), right-click in the project root folder
2. Select "New File"
3. Name it `.env.local`
4. Paste the template above
5. Replace with your Firebase values

## 🔥 Where to Get Your Firebase Config

1. Go to https://console.firebase.google.com/
2. Select your project
3. Click the gear icon ⚙️ → "Project settings"
4. Scroll down to "Your apps" section
5. Find your web app (or click `</>` to add one)
6. You'll see a config object like this:
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

7. Copy each value and paste into `.env.local`:
   ```
   VITE_FIREBASE_API_KEY=AIzaSy... (paste your apiKey here)
   VITE_FIREBASE_AUTH_DOMAIN=your-project.firebaseapp.com
   VITE_FIREBASE_PROJECT_ID=your-project-id
   VITE_FIREBASE_STORAGE_BUCKET=your-project.appspot.com
   VITE_FIREBASE_MESSAGING_SENDER_ID=123456789
   VITE_FIREBASE_APP_ID=1:123456789:web:abc123
   ```

## ✅ Example of a Complete `.env.local` File

```
VITE_FIREBASE_API_KEY=AIzaSyC1234567890abcdefghijklmnopqrstuvwxyz
VITE_FIREBASE_AUTH_DOMAIN=hampter-12345.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=hampter-12345
VITE_FIREBASE_STORAGE_BUCKET=hampter-12345.appspot.com
VITE_FIREBASE_MESSAGING_SENDER_ID=987654321
VITE_FIREBASE_APP_ID=1:987654321:web:abcdef123456789
```

## ⚠️ Important Notes

- The file MUST be named `.env.local` (starts with a dot, no extension)
- It should be in the **root folder** (same level as `package.json`)
- **Don't commit this file to Git** (it's already in `.gitignore`)
- After creating/updating the file, **restart your dev server** (`npm run dev`)

## 🧪 Test It Works

After creating the file:
1. Restart your dev server: `npm run dev`
2. Open the app in browser
3. Check browser console for any Firebase errors
4. Try creating a username - it should save to Firebase!

