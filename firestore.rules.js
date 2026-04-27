// ============================================================
//  Firestore Security Rules
//  Deploy: Firebase Console → Firestore → Rules → Paste → Publish
// ============================================================
//
//  rules_version = '2';
//  service cloud.firestore {
//    match /databases/{database}/documents {
//      // Only authenticated users (doctors/nurses) can read/write
//      match /{document=**} {
//        allow read, write: if request.auth != null;
//      }
//    }
//  }
//
// ============================================================
//  HOW TO APPLY:
//  1. Go to https://console.firebase.google.com
//  2. Select your project: it4health-bebeiu22198
//  3. Navigate to Firestore Database → Rules tab
//  4. Replace the existing rules with the content above
//  5. Click "Publish"
// ============================================================
