const students = JSON.parse(localStorage.getItem('students')) || [];
let currentDate = new Date(localStorage.getItem('currentDate')) || new Date();

const tableBody = document.getElementById("attendance-body");
const nextDayButton = document.getElementById("next-day-btn");
const skipDayButton = document.getElementById("skip-day-btn");
const addStudentButton = document.getElementById("add-student-btn");
const studentNameInput = document.getElementById("student-name");
const dateInput = document.getElementById("custom-date"); // Date input for custom date

// Function to format date as DD-MM-YYYY
function formatDate(date) {
    const day = String(date.getDate()).padStart(2, '0');
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const year = date.getFullYear();
    return `${day}-${month}-${year}`; // Format as DD-MM-YYYY
}

// Function to calculate attendance percentage
function calculatePercentage(student) {
    const totalPeriods = student.totalDays * 7;
    return totalPeriods > 0
        ? ((student.attendedPeriods / totalPeriods) * 100).toFixed(2)
        : 0;
}

// Function to populate the attendance table
function populateTable() {
    tableBody.innerHTML = "";
    students.forEach((student, index) => {
        const row = document.createElement("tr");
        row.innerHTML = `
            <td>${student.name}</td>
            <td>${formatDate(currentDate)}</td> <!-- Show the current date -->
            ${Array(7)
                .fill(0)
                .map(
                    (_, i) =>
                        `<td>
                            <select id="attendance-${index}-${i}">
                                <option value="present">Present</option>
                                <option value="absent">Absent</option>
                            </select>
                        </td>`
                )
                .join("")}
            <td id="percentage-${index}">${calculatePercentage(student)}%</td>
            <td><button class="remove-btn" data-index="${index}">Remove</button></td> <!-- Remove button -->
        `;
        tableBody.appendChild(row);
    });

    // Add event listeners to remove buttons
    document.querySelectorAll('.remove-btn').forEach(button => {
        button.addEventListener('click', (e) => {
            const index = e.target.getAttribute('data-index');
            removeStudent(index);
        });
    });
}

// Function to add a new student
addStudentButton.addEventListener("click", () => {
    const studentName = studentNameInput.value.trim();
    if (studentName) {
        students.push({ name: studentName, attendedPeriods: 0, totalDays: 0 });
        studentNameInput.value = "";
        saveToLocalStorage();
        populateTable();
    }
});

// Function to handle end of day logic
function endDay(isSkipped) {
    if (!isSkipped) {
        students.forEach((student, index) => {
            student.totalDays += 1;
            for (let i = 0; i < 7; i++) {
                const attendance = document.getElementById(`attendance-${index}-${i}`).value;
                if (attendance === "present") {
                    student.attendedPeriods += 1;
                }
            }
            document.getElementById(`percentage-${index}`).textContent = calculatePercentage(student) + "%";
        });
    }
    currentDate.setDate(currentDate.getDate() + 1); // Move to the next day
    saveToLocalStorage();
    populateTable(); // Refresh the table
}

// Event listener for next day button
nextDayButton.addEventListener("click", () => endDay(false));

// Event listener for skip day button
skipDayButton.addEventListener("click", () => endDay(true));

// Function to remove a student
function removeStudent(index) {
    students.splice(index, 1); // Remove student from array
    saveToLocalStorage(); // Update localStorage
    populateTable(); // Refresh table after removal
}

// Function to save student data and current date to localStorage
function saveToLocalStorage() {
    localStorage.setItem('students', JSON.stringify(students));
    localStorage.setItem('currentDate', currentDate.toISOString()); 
}

// Function to handle custom date input
dateInput.addEventListener("change", () => {
    const selectedDate = new Date(dateInput.value);
    if (!isNaN(selectedDate)) {
        currentDate = selectedDate; // Update current date to selected date
        saveToLocalStorage(); // Save the updated date to localStorage
        populateTable(); // Refresh the table to reflect the new date
    }
});

// Initialize table and set the custom date input
populateTable();
dateInput.value = currentDate.toISOString().split('T')[0]; // Set the default value of the date input
