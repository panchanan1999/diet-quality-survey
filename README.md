# Daily Diet Quality Assessment

A complete working website for Daily Diet Quality Assessment with multi-step form, Firebase Firestore integration, camera capture, scoring system, and Base64 image storage.

## Features

- ✅ **Multi-step Form**: Questionnaire → Personal Info → Results (3 pages)
- ✅ **Scoring System**: Automatic score calculation for food groups and protein sources
- ✅ **Firebase Firestore**: Save submissions with Base64 image storage
- ✅ **Camera Capture**: Capture photos directly or upload from device
- ✅ **Base64 Storage**: Images stored as Base64 strings (perfect for Excel export)
- ✅ **Score Table**: Clean table displaying question scores and total
- ✅ **Blue Tick Chips**: Beautiful styled chips for selected answers
- ✅ **Modern UI**: Clean design with Plus Jakarta Sans font
- ✅ **Mobile Responsive**: Optimized for all screen sizes
- ✅ **Form Validation**: Input validation with error messages
- ✅ **Researcher Block**: Chandana M S - Dietitian & PhD Scholar

## File Structure

```
/project-folder
   ├── index.html    # Single-page HTML with all 3 steps
   ├── style.css     # All styling (modern, mobile-responsive)
   └── script.js     # All JavaScript logic (Firebase, scoring, camera, navigation)
```

## Setup Instructions

### 1. Firebase Setup

1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Create a new project or select an existing one
3. Enable **Firestore Database**:
   - Go to Firestore Database
   - Click "Create database"
   - Start in **test mode** (for development) or **production mode**
4. Get your Firebase configuration:
   - Go to Project Settings (gear icon)
   - Scroll down to "Your apps"
   - Click the web icon (`</>`) to add a web app
   - Copy the `firebaseConfig` object

### 2. Configure Firebase in script.js

Open `script.js` and replace the placeholder values with your actual Firebase configuration:

```javascript
const firebaseConfig = {
    apiKey: "YOUR_API_KEY",
    authDomain: "YOUR_AUTH_DOMAIN",
    projectId: "YOUR_PROJECT_ID",
    storageBucket: "YOUR_STORAGE_BUCKET",
    messagingSenderId: "YOUR_MESSAGING_SENDER_ID",
    appId: "YOUR_APP_ID"
};
```

### 3. Firestore Security Rules (Optional - for production)

Update your Firestore rules for better security:

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /dietSubmissions/{document=**} {
      allow read, write: if request.auth != null; // Requires authentication
      // OR for public access (less secure, for testing):
      // allow read, write: if true;
    }
  }
}
```

### 4. Run the Application

**Option 1: Direct file opening** (may have limitations)
- Simply open `index.html` in a modern web browser

**Option 2: Local web server** (recommended)
```bash
# Using Python 3
python -m http.server 8000

# Using Node.js (http-server)
npx http-server

# Using PHP
php -S localhost:8000
```
- Open `http://localhost:8000` in your browser

**Option 3: GitHub Pages** (for deployment)
- Push your files to a GitHub repository
- Enable GitHub Pages in repository settings
- Your site will be available at `https://username.github.io/repository-name`

## Usage Flow

### Page 1 - Questionnaire
1. Select food groups consumed (multi-select cards)
2. Select protein sources (multi-select cards)
3. Scores are calculated automatically (1 point per selection)
4. Click "Next" to proceed

### Page 2 - Personal Information
1. Enter full name, email, and phone number
2. Select country code from dropdown
3. Capture photo using camera or upload from device
4. Image is converted to Base64 automatically
5. Click "Submit" to save to Firestore

### Page 3 - Results Page
1. View submission confirmation
2. See user information (Name, Email, Phone, Timestamp)
3. View score table with:
   - Food Groups Consumed score
   - Protein Sources score
   - Total score
4. See selected answers as blue tick chips
5. View captured photo (displayed from Base64)
6. Click "Submit Another Response" to start over

## Scoring System

- **Question 1 (Food Groups Consumed)**: 1 point per selected food group
- **Question 2 (Protein Sources)**: 1 point per selected protein source
- **Total Score**: Sum of Question 1 and Question 2 scores

## Data Storage

Submissions are saved to Firestore with the following structure:

```javascript
{
  name: "John Doe",
  email: "john@example.com",
  phone: "+1 1234567890",
  countryCode: "+1",
  foodGroups: ["meat-poultry-fish-eggs", "fruits", "vegetables"],
  proteinSources: ["meat", "fish", "eggs"],
  score: {
    question1: 3,
    question2: 3,
    total: 6
  },
  imageBase64: "data:image/jpeg;base64,/9j/4AAQSkZJRg...",
  timestamp: serverTimestamp()
}
```

## Browser Compatibility

- Chrome/Edge (recommended)
- Firefox
- Safari
- Opera

**Note**: Camera capture requires HTTPS in production (except localhost for development).

## Troubleshooting

### Camera not working
- Ensure HTTPS is enabled (required in production)
- Check browser permissions for camera access
- Use the file upload fallback option

### Firebase errors
- Verify your Firebase configuration in `script.js`
- Check that Firestore is enabled in Firebase Console
- Verify security rules allow read/write operations

### Images not displaying
- Check that Base64 conversion is working
- Verify image size is under 5MB
- Check browser console for errors

### Scores not calculating
- Ensure at least one checkbox is selected
- Check browser console for JavaScript errors
- Verify form data is being collected correctly

## GitHub Pages Deployment

1. Create a new GitHub repository
2. Upload all three files (`index.html`, `style.css`, `script.js`)
3. Go to repository Settings → Pages
4. Select source branch (usually `main`)
5. Your site will be live at `https://username.github.io/repository-name`

**Important**: For GitHub Pages, make sure your Firebase config allows requests from your GitHub Pages domain, or use public read/write rules for testing.

## Researcher Information

**Chandana M S**  
Dietitian & PhD Scholar

---

Built with ❤️ for Daily Diet Quality Assessment
