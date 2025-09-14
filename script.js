// Handle registration
document.addEventListener("DOMContentLoaded", () => {
  const form = document.getElementById("registrationForm");

  if (form) {
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
      document.getElementById("photoUrl").value = editStudent.photoUrl;

      document.getElementById("submitText").innerText = "Update Student";
    }

    form.addEventListener("submit", (e) => {
      e.preventDefault();

      const student = {
        firstName: document.getElementById("firstName").value,
        lastName: document.getElementById("lastName").value,
        email: document.getElementById("email").value,
        programme: document.getElementById("programme").value,
        year: document.getElementById("year").value,
        interests: document.getElementById("interests").value,
        photoUrl: document.getElementById("photoUrl").value || "https://via.placeholder.com/150"
      };

      let students = JSON.parse(localStorage.getItem("students")) || [];

      if (editIndex !== null && editIndex !== "null") {
        students[editIndex] = student;
        localStorage.removeItem("editStudent");
        localStorage.removeItem("editIndex");
      } else {
        students.push(student);
      }

      localStorage.setItem("students", JSON.stringify(students));

      alert("Student saved successfully!");
      form.reset();
    });
  }

  // Profiles Page
  const grid = document.getElementById("profilesGrid");
  if (grid) {
    loadProfiles(grid);
  }
});

function loadProfiles(grid) {
  let students = JSON.parse(localStorage.getItem("students")) || [];
  grid.innerHTML = "";

  if (students.length === 0) {
    grid.innerHTML = "<p>No students registered yet.</p>";
    return;
  }

  students.forEach((student, index) => {
    const card = document.createElement("div");
    card.className = "profile-card"; // use CSS profile-card instead of box

    // Split hobbies into an array (comma-separated)
    const hobbies = student.interests
      ? student.interests.split(",").map(hobby => hobby.trim())
      : [];

    // Create hobbies HTML
    const hobbiesHTML = hobbies.map(hobby => `<span class="hobby-card">${hobby}</span>`).join(" ");

    card.innerHTML = `
      <div class="profile-header">
        <img src="${student.photoUrl}" alt="Photo of ${student.firstName}" class="profile-photo">
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
  let students = JSON.parse(localStorage.getItem("students")) || [];
  students.splice(index, 1);
  localStorage.setItem("students", JSON.stringify(students));
  location.reload();
}
