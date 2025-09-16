// Handle registration
document.addEventListener("DOMContentLoaded", () => {
  const form = document.getElementById("registrationForm");

  // Photo upload functionality
  if (form) {
    setupPhotoUpload();
    
    // If editing, load student info
    const editStudent = JSON.parse(localStorage.getItem("editStudent"));
    const editIndex = localStorage.getItem("editIndex");

    if (editStudent) {
      document.getElementById("firstName").value = editStudent.firstName;
      document.getElementById("lastName").value = editStudent.lastName;
      document.getElementById("email").value = editStudent.email;
      document.getElementById("programme").value = editStudent.programme;
      document.getElementById("year").value = editStudent.year;
      document.getElementById("interests").value = editStudent.interests;
      
      // Handle photo loading for editing
      if (editStudent.photoUrl) {
        if (editStudent.photoUrl.startsWith("data:")) {
          // It's a file upload (base64)
          document.querySelector('input[value="file"]').checked = true;
          showPreview(editStudent.photoUrl);
        } else {
          // It's a URL
          document.querySelector('input[value="url"]').checked = true;
          document.getElementById("photoUrl").value = editStudent.photoUrl;
          showPreview(editStudent.photoUrl);
        }
        toggleUploadSections();
      }

      document.getElementById("submitText").innerText = "Update Student";
    }

    form.addEventListener("submit", handleFormSubmit);
  }

  // Profiles Page
  const grid = document.getElementById("profilesGrid");
  if (grid) {
    loadProfiles(grid);
  }
});

// Setup photo upload functionality
function setupPhotoUpload() {
  const photoOptions = document.querySelectorAll('input[name="photoOption"]');
  const fileInput = document.getElementById("photoFile");
  const urlInput = document.getElementById("photoUrl");

  // Handle radio button changes
  photoOptions.forEach(option => {
    option.addEventListener("change", toggleUploadSections);
  });

  // Handle file selection
  if (fileInput) {
    fileInput.addEventListener("change", handleFileSelect);
  }

  // Handle URL input
  if (urlInput) {
    urlInput.addEventListener("input", handleUrlInput);
  }
}

// Toggle between file upload and URL sections
function toggleUploadSections() {
  const selectedOption = document.querySelector('input[name="photoOption"]:checked').value;
  const fileSection = document.getElementById("fileUploadSection");
  const urlSection = document.getElementById("urlUploadSection");

  if (selectedOption === "file") {
    fileSection.style.display = "block";
    urlSection.style.display = "none";
  } else {
    fileSection.style.display = "none";
    urlSection.style.display = "block";
  }
}

// Handle file selection and preview
function handleFileSelect(event) {
  const file = event.target.files[0];
  
  if (file) {
    // Validate file type
    if (!file.type.startsWith("image/")) {
      alert("Please select a valid image file (JPG, PNG, GIF).");
      event.target.value = "";
      return;
    }

    // Validate file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      alert("File size must be less than 5MB.");
      event.target.value = "";
      return;
    }

    // Convert file to base64 for preview and storage
    const reader = new FileReader();
    reader.onload = function(e) {
      showPreview(e.target.result);
    };
    reader.readAsDataURL(file);
  } else {
    hidePreview();
  }
}

// Handle URL input and preview
function handleUrlInput(event) {
  const url = event.target.value.trim();
  
  if (url) {
    // Simple URL validation
    try {
      new URL(url);
      showPreview(url);
    } catch {
      hidePreview();
    }
  } else {
    hidePreview();
  }
}

// Show image preview
function showPreview(src) {
  const previewImage = document.getElementById("previewImage");
  const placeholder = document.getElementById("previewPlaceholder");
  
  previewImage.src = src;
  previewImage.style.display = "block";
  placeholder.style.display = "none";
  
  // Handle image load errors
  previewImage.onerror = function() {
    hidePreview();
  };
}

// Hide image preview
function hidePreview() {
  const previewImage = document.getElementById("previewImage");
  const placeholder = document.getElementById("previewPlaceholder");
  
  previewImage.style.display = "none";
  placeholder.style.display = "flex";
}

// Handle form submission
function handleFormSubmit(e) {
  e.preventDefault();

  const selectedOption = document.querySelector('input[name="photoOption"]:checked').value;
  let photoUrl = "https://via.placeholder.com/150"; // Default placeholder

  // Get photo based on selected option
  if (selectedOption === "file") {
    const fileInput = document.getElementById("photoFile");
    if (fileInput.files[0]) {
      // Convert file to base64 for storage
      const reader = new FileReader();
      reader.onload = function(e) {
        saveStudent(e.target.result);
      };
      reader.readAsDataURL(fileInput.files[0]);
      return; // Exit here, saveStudent will be called in the onload
    }
  } else {
    const urlInput = document.getElementById("photoUrl");
    if (urlInput.value.trim()) {
      photoUrl = urlInput.value.trim();
    }
  }

  saveStudent(photoUrl);
}

// Save student data
function saveStudent(photoUrl) {
  const student = {
    firstName: document.getElementById("firstName").value,
    lastName: document.getElementById("lastName").value,
    email: document.getElementById("email").value,
    programme: document.getElementById("programme").value,
    year: document.getElementById("year").value,
    interests: document.getElementById("interests").value,
    photoUrl: photoUrl
  };

  let students = JSON.parse(localStorage.getItem("students")) || [];
  const editIndex = localStorage.getItem("editIndex");

  if (editIndex !== null && editIndex !== "null") {
    students[editIndex] = student;
    localStorage.removeItem("editStudent");
    localStorage.removeItem("editIndex");
  } else {
    students.push(student);
  }

  localStorage.setItem("students", JSON.stringify(students));

  alert("Student saved successfully!");
  document.getElementById("registrationForm").reset();
  hidePreview();
  toggleUploadSections(); // Reset to default view
}

// Load profiles (existing functionality)
function loadProfiles(grid) {
  let students = JSON.parse(localStorage.getItem("students")) || [];
  grid.innerHTML = "";

  if (students.length === 0) {
    grid.innerHTML = '<div class="empty-state"><h3>No students registered yet</h3><p>Start by registering your first student!</p></div>';
    return;
  }

  students.forEach((student, index) => {
    const card = document.createElement("div");
    card.className = "profile-card";

    // Split hobbies into an array (comma-separated)
    const hobbies = student.interests
      ? student.interests.split(",").map(hobby => hobby.trim())
      : [];

    // Create hobbies HTML
    const hobbiesHTML = hobbies.map(hobby => `<span class="hobby-card">${hobby}</span>`).join(" ");

    // Handle photo display with error fallback
    const photoUrl = student.photoUrl || "https://via.placeholder.com/150";

    card.innerHTML = `
      <div class="profile-header">
        <img src="${photoUrl}" alt="Photo of ${student.firstName}" class="profile-photo" onerror="this.src='https://via.placeholder.com/150'">
        <h3 class="profile-name">${student.firstName} ${student.lastName}</h3>
      </div>
      <div class="profile-body">
        <div class="profile-detail"><span class="detail-label">Email:</span><span class="detail-value">${student.email}</span></div>
        <div class="profile-detail"><span class="detail-label">Programme:</span><span class="detail-value">${student.programme}</span></div>
        <div class="profile-detail"><span class="detail-label">Year:</span><span class="detail-value">${student.year}</span></div>
        <div class="profile-detail"><span class="detail-label">Hobbies:</span></div>
        <div class="hobbies-container">${hobbiesHTML}</div>
        <div class="profile-actions">
          <button class="btn btn-secondary" onclick="editStudent(${index})">Edit</button>
          <button class="btn btn-danger" onclick="deleteStudent(${index})">Delete</button>
        </div>
      </div>
    `;
    grid.appendChild(card);
  });
}

function editStudent(index) {
  let students = JSON.parse(localStorage.getItem("students")) || [];
  let student = students[index];

  localStorage.setItem("editIndex", index);
  localStorage.setItem("editStudent", JSON.stringify(student));

  window.location.href = "index.html";
}

function deleteStudent(index) {
  if (confirm("Are you sure you want to delete this student?")) {
    let students = JSON.parse(localStorage.getItem("students")) || [];
    students.splice(index, 1);
    localStorage.setItem("students", JSON.stringify(students));
    location.reload();
  }
}