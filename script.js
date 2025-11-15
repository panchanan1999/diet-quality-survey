// Firebase Configuration
// IMPORTANT: Replace these values with your own Firebase project configuration
// You can find these in your Firebase Console > Project Settings > General

import { initializeApp } from 'https://www.gstatic.com/firebasejs/10.7.1/firebase-app.js';
import { 
    getFirestore, 
    collection, 
    addDoc, 
    serverTimestamp 
} from 'https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js';

// Your web app's Firebase configuration
// Replace these values with your actual Firebase config
const firebaseConfig = {
    apiKey: "AIzaSyDpvaCnm_uq2z78tw_s6F4C6EzzBMn2m00",
    authDomain: "diet-assesment.firebaseapp.com",
    databaseURL: "https://diet-assesment-default-rtdb.firebaseio.com",
    projectId: "diet-assesment",
    storageBucket: "diet-assesment.firebasestorage.app",
    messagingSenderId: "483037826596",
    appId: "1:483037826596:web:3aae70d40eb5ddab9912b1"
  };

// Initialize Firebase
let app;
let db;
let submissionsCollection;

try {
    app = initializeApp(firebaseConfig);
    db = getFirestore(app);
    submissionsCollection = collection(db, 'dietSubmissions');
    console.log('Firebase initialized successfully');
} catch (error) {
    console.error('Firebase initialization error:', error);
    alert('Firebase configuration error. Please check your Firebase config in script.js');
}

// Application State
let formData = {
    foodGroups: [],
    proteinSources: [],
    name: '',
    email: '',
    phone: '',
    countryCode: '',
    imageBase64: '',
    score: {
        question1: 0,
        question2: 0,
        total: 0
    },
    timestamp: null
};

let stream = null;
let capturedImageBlob = null;

// DOM Elements
const page1 = document.getElementById('page1');
const page2 = document.getElementById('page2');
const page3 = document.getElementById('page3');

const nextBtn = document.getElementById('nextBtn');
const backBtn = document.getElementById('backBtn');
const submitBtn = document.getElementById('submitBtn');
const submitAnotherBtn = document.getElementById('submitAnotherBtn');

const questionnaireForm = document.getElementById('questionnaireForm');
const personalInfoForm = document.getElementById('personalInfoForm');

const startCameraBtn = document.getElementById('startCameraBtn');
const captureBtn = document.getElementById('captureBtn');
const retakeBtn = document.getElementById('retakeBtn');
const fileUpload = document.getElementById('fileUpload');

const video = document.getElementById('video');
const canvas = document.getElementById('canvas');
const capturedImage = document.getElementById('capturedImage');
const previewPlaceholder = document.getElementById('previewPlaceholder');

// Initialize app
document.addEventListener('DOMContentLoaded', () => {
    initializeEventListeners();
    checkFirebaseServices();
});

// Check if Firebase services are available
function checkFirebaseServices() {
    if (!db || !submissionsCollection) {
        console.warn('Firebase services not fully initialized. Please check firebase-config.js');
    }
}

// Initialize Event Listeners
function initializeEventListeners() {
    // Page 1: Next Button
    nextBtn.addEventListener('click', handleNextStep);

    // Page 2: Back Button
    backBtn.addEventListener('click', handleBackStep);

    // Page 2: Camera Controls
    startCameraBtn.addEventListener('click', startCamera);
    captureBtn.addEventListener('click', capturePhoto);
    retakeBtn.addEventListener('click', retakePhoto);
    fileUpload.addEventListener('change', handleFileUpload);

    // Page 2: Submit Form
    personalInfoForm.addEventListener('submit', handleSubmit);

    // Page 3: Submit Another
    submitAnotherBtn.addEventListener('click', resetForm);

    // Checkbox changes for questionnaire
    document.querySelectorAll('input[type="checkbox"]').forEach(checkbox => {
        checkbox.addEventListener('change', handleCheckboxChange);
    });

    // Input validation
    document.getElementById('fullName').addEventListener('blur', validateName);
    document.getElementById('email').addEventListener('blur', validateEmail);
    document.getElementById('phoneNumber').addEventListener('blur', validatePhone);
}

// Handle checkbox changes and calculate scores
function handleCheckboxChange(e) {
    const checkbox = e.target;
    const name = checkbox.name;
    const value = checkbox.value;
    const card = checkbox.closest('.card-checkbox');

    if (checkbox.checked) {
        if (!formData[name].includes(value)) {
            formData[name].push(value);
        }
        // Add ripple effect
        addRippleEffect(card);
    } else {
        formData[name] = formData[name].filter(item => item !== value);
    }

    // Calculate scores
    calculateScores();
}

// Add ripple effect to cards
function addRippleEffect(element) {
    const ripple = document.createElement('div');
    ripple.style.cssText = `
        position: absolute;
        border-radius: 50%;
        background: rgba(102, 126, 234, 0.3);
        width: 100px;
        height: 100px;
        margin-top: -50px;
        margin-left: -50px;
        top: 50%;
        left: 50%;
        pointer-events: none;
        animation: ripple 0.6s ease-out;
    `;
    
    element.style.position = 'relative';
    element.appendChild(ripple);
    
    setTimeout(() => {
        ripple.remove();
    }, 600);
}

// Add ripple animation to style if not exists
if (!document.getElementById('ripple-style')) {
    const style = document.createElement('style');
    style.id = 'ripple-style';
    style.textContent = `
        @keyframes ripple {
            to {
                transform: scale(4);
                opacity: 0;
            }
        }
    `;
    document.head.appendChild(style);
}

// Calculate Scores
function calculateScores() {
    // Question 1: Food Groups Consumed
    formData.score.question1 = formData.foodGroups.length;

    // Question 2: Protein Sources
    formData.score.question2 = formData.proteinSources.length;

    // Total Score
    formData.score.total = formData.score.question1 + formData.score.question2;

    console.log('Scores calculated:', formData.score);
}

// Page Navigation
function showPage(pageNumber) {
    // Hide all pages
    page1.classList.remove('active');
    page2.classList.remove('active');
    page3.classList.remove('active');

    // Show selected page
    if (pageNumber === 1) {
        page1.classList.add('active');
    } else if (pageNumber === 2) {
        page2.classList.add('active');
    } else if (pageNumber === 3) {
        page3.classList.add('active');
    }

    // Scroll to top
    window.scrollTo({ top: 0, behavior: 'smooth' });
}

function handleNextStep(e) {
    e.preventDefault();
    
    // Calculate scores before proceeding
    calculateScores();

    // Validate that at least one selection was made
    if (formData.foodGroups.length === 0 && formData.proteinSources.length === 0) {
        alert('Please select at least one food group or protein source before proceeding.');
        return;
    }

    // Show page 2
    showPage(2);
}

function handleBackStep(e) {
    e.preventDefault();
    
    // Stop camera if running
    stopCamera();
    
    // Show page 1
    showPage(1);
}

// Input Validation
function validateName() {
    const nameInput = document.getElementById('fullName');
    const errorElement = document.getElementById('fullNameError');
    const value = nameInput.value.trim();

    if (!value) {
        showError(nameInput, errorElement, 'Full name is required');
        return false;
    } else if (value.length < 2) {
        showError(nameInput, errorElement, 'Name must be at least 2 characters');
        return false;
    } else {
        clearError(nameInput, errorElement);
        return true;
    }
}

function validateEmail() {
    const emailInput = document.getElementById('email');
    const errorElement = document.getElementById('emailError');
    const value = emailInput.value.trim();
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    if (!value) {
        showError(emailInput, errorElement, 'Email is required');
        return false;
    } else if (!emailRegex.test(value)) {
        showError(emailInput, errorElement, 'Please enter a valid email address');
        return false;
    } else {
        clearError(emailInput, errorElement);
        return true;
    }
}

function validatePhone() {
    const phoneInput = document.getElementById('phoneNumber');
    const countryCodeSelect = document.getElementById('countryCode');
    const errorElement = document.getElementById('phoneError');
    const phoneValue = phoneInput.value.trim();
    const countryCode = countryCodeSelect.value;

    if (!countryCode) {
        showError(countryCodeSelect, errorElement, 'Country code is required');
        return false;
    } else if (!phoneValue) {
        showError(phoneInput, errorElement, 'Phone number is required');
        return false;
    } else if (!/^\d{6,15}$/.test(phoneValue.replace(/\s/g, ''))) {
        showError(phoneInput, errorElement, 'Please enter a valid phone number');
        return false;
    } else {
        clearError(phoneInput, errorElement);
        clearError(countryCodeSelect, errorElement);
        return true;
    }
}

function validatePhoto() {
    const errorElement = document.getElementById('photoError');
    
    if (!formData.imageBase64) {
        errorElement.textContent = 'Please capture or upload a photo';
        return false;
    } else {
        errorElement.textContent = '';
        return true;
    }
}

function showError(input, errorElement, message) {
    input.classList.add('error');
    errorElement.textContent = message;
}

function clearError(input, errorElement) {
    input.classList.remove('error');
    errorElement.textContent = '';
}

// Camera Functions
async function startCamera() {
    try {
        // Request camera access
        stream = await navigator.mediaDevices.getUserMedia({
            video: {
                facingMode: 'user', // Front camera
                width: { ideal: 1280 },
                height: { ideal: 720 }
            }
        });

        video.srcObject = stream;
        video.style.display = 'block';
        capturedImage.style.display = 'none';
        previewPlaceholder.style.display = 'none';
        
        startCameraBtn.style.display = 'none';
        captureBtn.style.display = 'inline-flex';
        retakeBtn.style.display = 'none';
        
        // Clear any previous errors
        document.getElementById('photoError').textContent = '';
        
        // Enable capture button
        captureBtn.disabled = false;
    } catch (error) {
        console.error('Error accessing camera:', error);
        alert('Unable to access camera. Please use the file upload option instead.');
        
        // Fallback to file upload
        startCameraBtn.textContent = 'Camera Unavailable - Use File Upload';
        startCameraBtn.disabled = true;
    }
}

function capturePhoto() {
    if (!stream) {
        alert('Camera is not started. Please click "Start Camera" first.');
        return;
    }

    // Set canvas dimensions to match video
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;

    // Draw video frame to canvas
    const ctx = canvas.getContext('2d');
    ctx.drawImage(video, 0, 0, canvas.width, canvas.height);

    // Convert canvas to blob
    canvas.toBlob((blob) => {
        if (blob) {
            capturedImageBlob = blob;
            
            // Convert blob to Base64
            convertBlobToBase64(blob).then(base64 => {
                formData.imageBase64 = base64;
                capturedImage.src = base64;
                
                // Show captured image and hide video
                video.style.display = 'none';
                capturedImage.style.display = 'block';
                previewPlaceholder.style.display = 'none';
                
                // Update buttons
                captureBtn.style.display = 'none';
                retakeBtn.style.display = 'inline-flex';
                
                // Clear photo error
                document.getElementById('photoError').textContent = '';
                
                // Stop camera stream
                stopCamera();
            });
        }
    }, 'image/jpeg', 0.9);
}

function retakePhoto() {
    // Reset image
    capturedImage.src = '';
    capturedImage.style.display = 'none';
    previewPlaceholder.style.display = 'block';
    capturedImageBlob = null;
    formData.imageBase64 = '';
    
    // Clear photo error
    document.getElementById('photoError').textContent = '';
    
    // Restart camera
    startCamera();
}

function stopCamera() {
    if (stream) {
        stream.getTracks().forEach(track => track.stop());
        stream = null;
        video.srcObject = null;
    }
}

// Convert Blob to Base64
function convertBlobToBase64(blob) {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onloadend = () => {
            resolve(reader.result); // This is the Base64 string
        };
        reader.onerror = reject;
        reader.readAsDataURL(blob);
    });
}

// File Upload Handler
function handleFileUpload(e) {
    const file = e.target.files[0];
    if (file) {
        // Validate file type
        if (!file.type.startsWith('image/')) {
            alert('Please select an image file.');
            fileUpload.value = '';
            return;
        }

        // Validate file size (max 5MB)
        if (file.size > 5 * 1024 * 1024) {
            alert('Image size should be less than 5MB.');
            fileUpload.value = '';
            return;
        }

        // Stop camera if running
        stopCamera();

        // Convert file to blob
        capturedImageBlob = file;

        // Convert to Base64
        convertBlobToBase64(file).then(base64 => {
            formData.imageBase64 = base64;
            capturedImage.src = base64;
            capturedImage.style.display = 'block';
            video.style.display = 'none';
            previewPlaceholder.style.display = 'none';
            
            // Update buttons
            startCameraBtn.style.display = 'none';
            captureBtn.style.display = 'none';
            retakeBtn.style.display = 'inline-flex';
            
            // Clear photo error
            document.getElementById('photoError').textContent = '';
        }).catch(error => {
            console.error('Error converting file to Base64:', error);
            alert('Error processing image. Please try again.');
        });
    }
}

// Handle Form Submit
async function handleSubmit(e) {
    e.preventDefault();
    
    // Validate all fields
    const isNameValid = validateName();
    const isEmailValid = validateEmail();
    const isPhoneValid = validatePhone();
    const isPhotoValid = validatePhoto();

    if (!isNameValid || !isEmailValid || !isPhoneValid || !isPhotoValid) {
        // Scroll to first error
        const firstError = document.querySelector('.error');
        if (firstError) {
            firstError.scrollIntoView({ behavior: 'smooth', block: 'center' });
        }
        return;
    }

    // Collect form data
    formData.name = document.getElementById('fullName').value.trim();
    formData.email = document.getElementById('email').value.trim();
    formData.countryCode = document.getElementById('countryCode').value;
    formData.phone = formData.countryCode + ' ' + document.getElementById('phoneNumber').value.trim();

    // Ensure scores are calculated
    calculateScores();

    // Disable submit button and show loader
    submitBtn.disabled = true;
    document.getElementById('submitBtnText').style.display = 'none';
    document.getElementById('submitLoader').style.display = 'inline-block';

    try {
        // Check if Firebase is initialized
        if (!db || !submissionsCollection) {
            throw new Error('Firebase is not initialized. Please check your Firebase configuration in script.js');
        }

        // Save submission to Firestore
        const submissionData = {
            name: formData.name,
            email: formData.email,
            phone: formData.phone,
            countryCode: formData.countryCode,
            foodGroups: formData.foodGroups,
            proteinSources: formData.proteinSources,
            score: {
                question1: formData.score.question1,
                question2: formData.score.question2,
                total: formData.score.total
            },
            imageBase64: formData.imageBase64,
            timestamp: serverTimestamp()
        };

        const docRef = await addDoc(submissionsCollection, submissionData);
        console.log('Document written with ID: ', docRef.id);

        // Store timestamp
        formData.timestamp = new Date();

        // Show success message
        showResultsPage();
        
    } catch (error) {
        console.error('Submission error:', error);
        alert('Failed to save submission: ' + error.message + '. Please try again.');
        
        // Re-enable submit button
        submitBtn.disabled = false;
        document.getElementById('submitBtnText').style.display = 'inline';
        document.getElementById('submitLoader').style.display = 'none';
    }
}

// Format checkbox values for display
function formatDisplayName(value) {
    return value
        .split('-')
        .map(word => word.charAt(0).toUpperCase() + word.slice(1))
        .join(' / ');
}

// Animate number counting
function animateNumber(element, target, duration = 1000) {
    const start = 0;
    const increment = target / (duration / 16);
    let current = start;
    
    const timer = setInterval(() => {
        current += increment;
        if (current >= target) {
            element.textContent = target;
            clearInterval(timer);
        } else {
            element.textContent = Math.floor(current);
        }
    }, 16);
}

// Show Results Page
function showResultsPage() {
    // Show page 3
    showPage(3);
    
    // Display user information with animation
    setTimeout(() => {
        document.getElementById('resultName').textContent = formData.name;
        document.getElementById('resultEmail').textContent = formData.email;
        document.getElementById('resultPhone').textContent = formData.phone;
        
        // Format timestamp
        const timestamp = formData.timestamp || new Date();
        const formattedDate = new Intl.DateTimeFormat('en-US', {
            year: 'numeric',
            month: 'long',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit',
            second: '2-digit'
        }).format(timestamp);
        document.getElementById('resultTimestamp').textContent = formattedDate;
    }, 200);

    // Animate scores in table
    setTimeout(() => {
        const score1El = document.getElementById('scoreQuestion1');
        const score2El = document.getElementById('scoreQuestion2');
        const totalEl = document.getElementById('scoreTotal');
        
        animateNumber(score1El, formData.score.question1, 800);
        setTimeout(() => {
            animateNumber(score2El, formData.score.question2, 800);
        }, 200);
        setTimeout(() => {
            animateNumber(totalEl, formData.score.total, 1000);
        }, 400);
    }, 400);

    // Display Food Groups as Blue Tick Chips with staggered animation
    const foodGroupsContainer = document.getElementById('foodGroupsChips');
    foodGroupsContainer.innerHTML = '';
    
    if (formData.foodGroups.length > 0) {
        formData.foodGroups.forEach((group, index) => {
            setTimeout(() => {
                const chip = createBlueTickChip(formatDisplayName(group));
                foodGroupsContainer.appendChild(chip);
            }, 600 + (index * 100));
        });
    } else {
        foodGroupsContainer.innerHTML = '<p style="color: var(--text-secondary);">No food groups selected</p>';
    }

    // Display Protein Sources as Blue Tick Chips with staggered animation
    const proteinSourcesContainer = document.getElementById('proteinSourcesChips');
    proteinSourcesContainer.innerHTML = '';
    
    if (formData.proteinSources.length > 0) {
        formData.proteinSources.forEach((source, index) => {
            setTimeout(() => {
                const chip = createBlueTickChip(formatDisplayName(source));
                proteinSourcesContainer.appendChild(chip);
            }, 800 + (index * 100));
        });
    } else {
        proteinSourcesContainer.innerHTML = '<p style="color: var(--text-secondary);">No protein sources selected</p>';
    }

    // Display uploaded photo using Base64 with fade-in
    setTimeout(() => {
        const resultPhoto = document.getElementById('resultPhoto');
        if (formData.imageBase64) {
            resultPhoto.src = formData.imageBase64;
            resultPhoto.style.display = 'block';
            resultPhoto.style.opacity = '0';
            resultPhoto.style.transition = 'opacity 0.5s ease-in';
            setTimeout(() => {
                resultPhoto.style.opacity = '1';
            }, 100);
        }
    }, 1000);
}

// Create Blue Tick Chip
function createBlueTickChip(text) {
    const chip = document.createElement('div');
    chip.className = 'chip';
    chip.setAttribute('role', 'listitem');
    chip.setAttribute('aria-label', `Selected: ${text}`);
    
    chip.innerHTML = `
        <span class="chip-tick">✓</span>
        <span>${text}</span>
    `;
    
    return chip;
}

// Reset Form
function resetForm() {
    // Reset form data
    formData = {
        foodGroups: [],
        proteinSources: [],
        name: '',
        email: '',
        phone: '',
        countryCode: '',
        imageBase64: '',
        score: {
            question1: 0,
            question2: 0,
            total: 0
        },
        timestamp: null
    };

    // Stop camera
    stopCamera();

    // Reset forms
    questionnaireForm.reset();
    personalInfoForm.reset();

    // Reset image previews
    capturedImage.src = '';
    capturedImage.style.display = 'none';
    video.style.display = 'none';
    previewPlaceholder.style.display = 'block';
    capturedImageBlob = null;

    // Reset buttons
    startCameraBtn.style.display = 'inline-flex';
    startCameraBtn.disabled = false;
    startCameraBtn.textContent = 'Start Camera';
    captureBtn.style.display = 'none';
    retakeBtn.style.display = 'none';
    submitBtn.disabled = false;
    document.getElementById('submitBtnText').style.display = 'inline';
    document.getElementById('submitLoader').style.display = 'none';

    // Clear all errors
    document.querySelectorAll('.error-message').forEach(el => el.textContent = '');
    document.querySelectorAll('.error').forEach(el => el.classList.remove('error'));

    // Show page 1
    showPage(1);
}

// Cleanup on page unload
window.addEventListener('beforeunload', () => {
    stopCamera();
});

