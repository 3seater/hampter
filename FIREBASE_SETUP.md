# Firebase Setup Instructions for hampter

## Step 1: Create Firebase Project

1. Go to https://console.firebase.google.com/
2. Click "Add project" or select an existing project
3. Follow the setup wizard:
   - Enter project name: `hampter` (or your preferred name)
   - Enable Google Analytics (optional)
   - Click "Create project"

## Step 2: Register Web App

1. In your Firebase project, click the Web icon (`</>`)
2. Register your app:
   - App nickname: `hampter-web`
   - Check "Also set up Firebase Hosting" (optional)
   - Click "Register app"
3. **Copy your Firebase config** - You'll see something like:
   ```javascript
   const firebaseConfig = {
     apiKey: "AIza...",
     authDomain: "your-project.firebaseapp.com",
     projectId: "your-project-id",
     storageBucket: "your-project.appspot.com",
     messagingSenderId: "123456789",
     appId: "1:123456789:web:abc123"
   };
   ```

## Step 3: Enable Firestore Database

1. In Firebase Console, go to "Build" → "Firestore Database"
2. Click "Create database"
3. Choose "Start in test mode" (for development)
4. Select a location (choose closest to your users)
5. Click "Enable"

## Step 4: Set Up Firestore Security Rules

1. Go to "Firestore Database" → "Rules"
2. Replace the rules with:
   ```javascript
   rules_version = '2';
   service cloud.firestore {
     match /databases/{database}/documents {
       // Users collection - anyone can read, only authenticated users can write
       match /users/{userId} {
         allow read: if true;
         allow write: if request.auth != null || request.resource.data.username == request.resource.data.username;
       }
       
       // Comments collection - anyone can read/write
       match /comments/{commentId} {
         allow read, write: if true;
       }
       
       // Video stats - anyone can read/write
       match /videoStats/{docId} {
         allow read, write: if true;
       }
       
       // User interactions (likes, bookmarks) - anyone can read/write
       match /userInteractions/{userId} {
         allow read, write: if true;
       }
     }
   }
   ```
3. Click "Publish"

## Step 5: Add Firebase Config to Your Project

1. Create a file `.env.local` in your project root
2. Add your Firebase config:
   ```
   VITE_FIREBASE_API_KEY=your-api-key-here
   VITE_FIREBASE_AUTH_DOMAIN=your-project.firebaseapp.com
   VITE_FIREBASE_PROJECT_ID=your-project-id
   VITE_FIREBASE_STORAGE_BUCKET=your-project.appspot.com
   VITE_FIREBASE_MESSAGING_SENDER_ID=123456789
   VITE_FIREBASE_APP_ID=1:123456789:web:abc123
   ```

## Step 6: Firestore Database Structure

The app will automatically create these collections:

### `users/{userId}`
```json
{
  "username": "string",
  "pfp": "string (image URL)",
  "createdAt": "timestamp"
}
```

### `comments/{commentId}`
```json
{
  "username": "string",
  "userPfp": "string",
  "text": "string (optional)",
  "imageUrl": "string (optional)",
  "timestamp": "timestamp",
  "likes": "number",
  "likedBy": ["array of usernames"],
  "parentId": "string (optional, for replies)",
  "replies": ["array of comment IDs"]
}
```

### `videoStats/main`
```json
{
  "likes": {
    "count": "number",
    "likedBy": ["array of usernames"]
  },
  "comments": {
    "count": "number"
  },
  "bookmarks": {
    "count": "number",
    "bookmarkedBy": ["array of usernames"]
  }
}
```

### `userInteractions/{username}`
```json
{
  "likedComments": ["array of comment IDs"],
  "bookmarkedVideo": "boolean"
}
```

## Step 7: Test the Integration

1. Run `npm run dev`
2. Create a username
3. Post a comment
4. Check Firebase Console → Firestore Database to see data appear in real-time

## Important Notes

- **Test Mode**: The rules above allow anyone to read/write. For production, you should implement proper authentication
- **Quotas**: Firebase free tier includes:
  - 50K reads/day
  - 20K writes/day
  - 20K deletes/day
- **Security**: Update Firestore rules before going to production

