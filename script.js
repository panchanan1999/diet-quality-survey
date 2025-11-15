// --- Page handling and validation ---
const questionnairePage = document.getElementById('page1');
const detailsPage = document.getElementById('page2');
const nextBtn = document.getElementById('nextBtn');
const backBtn = document.getElementById('backBtn');
const questionnaireForm = document.getElementById('questionnaireForm');
const detailsForm = document.getElementById('detailsForm');
const foodError = document.getElementById('foodError');
const proteinError = document.getElementById('proteinError');
const nameInput = document.getElementById('userName');
const phoneInput = document.getElementById('userPhone');
const nameError = document.getElementById('nameError');
const phoneError = document.getElementById('phoneError');
const submitBtn = document.getElementById('submitBtn');
const submitLoader = document.getElementById('submitLoader');
const submitText = document.getElementById('submitText');
const successMessage = document.getElementById('successMessage');

// Camera elements
const video = document.getElementById('video');
const captureBtn = document.getElementById('captureBtn');
const photoCanvas = document.getElementById('photoCanvas');
const photoPreview = document.getElementById('photoPreview');

// Replace with your Google Apps Script endpoint
const GOOGLE_SHEET_API = "https://script.google.com/macros/s/AKfycbx4aFr7-zGcMAqB6CvZFzi4JVnOtZ2w-9gT9V6BfEZS_q6dO-Q1asjIm7wtHrtSIjg6/exec";

// Utility for page transition
function goToPage(show, hide) {
  hide.classList.remove('page-active');
  setTimeout(function() {
    show.classList.add('page-active');
    hide.style.display = "none";
    show.style.display = "block";
  }, 350);
}

function validateCheckboxSection(groupId, errorElem) {
  const checkboxes = document.querySelectorAll(`#${groupId} input[type="checkbox"]`);
  let checkedItems = Array.from(checkboxes).filter(c => c.checked);
  if (checkedItems.length === 0) {
    errorElem.textContent = "Select at least one option.";
    return false;
  }
  errorElem.textContent = "";
  return true;
}

nextBtn.addEventListener('click', () => {
  let foodsValid = validateCheckboxSection('foodGroups', foodError);
  let proteinsValid = validateCheckboxSection('proteinSources', proteinError);
  if (!foodsValid || !proteinsValid) return;
  goToPage(detailsPage, questionnairePage);
});
backBtn.addEventListener('click', () => {
  goToPage(questionnairePage, detailsPage);
});

function validateName(name) {
  if (!name.trim()) {
    nameError.textContent = "Name is required.";
    nameInput.classList.add('error');
    return false;
  }
  if (name.trim().length < 2) {
    nameError.textContent = "Name must be at least 2 characters.";
    nameInput.classList.add('error');
    return false;
  }
  nameError.textContent = "";
  nameInput.classList.remove('error');
  return true;
}
function validatePhone(phone) {
  if (!phone.trim()) {
    phoneError.textContent = "Phone number is required.";
    phoneInput.classList.add('error');
    return false;
  }
  if (!/^[6-9]\d{9}$/.test(phone)) {
    phoneError.textContent = "Enter a valid 10-digit Indian mobile number (starts 6-9).";
    phoneInput.classList.add('error');
    return false;
  }
  phoneError.textContent = "";
  phoneInput.classList.remove('error');
  return true;
}

// Camera capture, to preview image (not sent to sheet)
function startCamera() {
  if (navigator.mediaDevices && navigator.mediaDevices.getUserMedia) {
    navigator.mediaDevices.getUserMedia({ video: true }).then(stream => {
      video.srcObject = stream;
      video.play();
    });
  }
}
captureBtn.addEventListener('click', () => {
  photoCanvas.width = video.videoWidth;
  photoCanvas.height = video.videoHeight;
  photoCanvas.getContext('2d').drawImage(video, 0, 0, video.videoWidth, video.videoHeight);
  const dataUrl = photoCanvas.toDataURL('image/png');
  photoPreview.innerHTML = `<img src="${dataUrl}" alt="Captured Photo"/>`;
});
window.addEventListener('DOMContentLoaded', startCamera);

detailsForm.addEventListener('submit', async function(e) {
  e.preventDefault();
  let name = nameInput.value.trim();
  let phone = phoneInput.value.trim();
  let isNameValid = validateName(name);
  let isPhoneValid = validatePhone(phone);

  if (!isNameValid || !isPhoneValid) {
    if (!isNameValid) nameInput.focus();
    else phoneInput.focus();
    return;
  }

  submitBtn.disabled = true;
  submitText.style.display = 'none';
  submitLoader.style.display = 'inline-block';

  const foods = Array.from(document.querySelectorAll('#foodGroups input[type="checkbox"]:checked')).map(cb => cb.value);
  const proteins = Array.from(document.querySelectorAll('#proteinSources input[type="checkbox"]:checked')).map(cb => cb.value);
  let totalScore = foods.length + proteins.length;

  // Prepare data for sheet (no photo)
  const data = {
    name: name,
    phone: `+91${phone}`,
    foodGroups: foods,
    proteinSources: proteins,
    totalScore: totalScore
  };

  try {
    const response = await fetch(GOOGLE_SHEET_API, {
      method: "POST",
      body: JSON.stringify(data),
      headers: { "Content-Type": "application/json" }
    });
    if (response.ok) {
      detailsForm.style.display = 'none';
      successMessage.style.display = 'block';
      setTimeout(() => successMessage.style.animation = 'none', 1000);
      detailsForm.reset(); questionnaireForm.reset();
      nameInput.classList.remove('error'); phoneInput.classList.remove('error');
    } else {
      alert("Failed to submit. Please try again.");
      submitBtn.disabled = false;
      submitText.style.display = 'inline';
      submitLoader.style.display = 'none';
    }
  } catch (error) {
    alert("Submission error. Please check your network and try again.");
    submitBtn.disabled = false;
    submitText.style.display = 'inline';
    submitLoader.style.display = 'none';
  }
});
