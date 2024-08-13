let db;
let deleteStudentId;


const request = indexedDB.open('StudentDB', 1);

request.onupgradeneeded = function(event) {
    db = event.target.result;
    if (!db.objectStoreNames.contains('students')) {
        const objectStore = db.createObjectStore('students', { keyPath: 'id', autoIncrement: true });
        objectStore.createIndex('name', 'name', { unique: false });
        objectStore.createIndex('age', 'age', { unique: false });
        objectStore.createIndex('grade', 'grade', { unique: false });
    }
};


request.onsuccess = function(event) {
    db = event.target.result;
    loadStudents();
};

request.onerror = function(event) {
    console.error('Database error:', event.target.errorCode);
};

document.getElementById('studentForm').addEventListener('submit', function(event) {
    event.preventDefault();
    const name = document.getElementById('studentName').value;
    const age = document.getElementById('studentAge').value;
    const grade = document.getElementById('studentGrade').value;

    const transaction = db.transaction(['students'], 'readwrite');
    const objectStore = transaction.objectStore('students');

    const request = objectStore.add({ name, age, grade });
    request.onsuccess = function() {
        loadStudents();
        document.getElementById('studentForm').reset();
    };
});

function loadStudents() {
    const transaction = db.transaction(['students'], 'readonly');
    const objectStore = transaction.objectStore('students');
    const tbody = document.querySelector('#studentTable tbody');
    tbody.innerHTML = '';

    objectStore.openCursor().onsuccess = function(event) {
        const cursor = event.target.result;
        if (cursor) {
            const row = `<tr>
                <td>${cursor.value.name}</td>
                <td>${cursor.value.age}</td>
                <td>${cursor.value.grade}</td>
                <td>
                    <button onclick="editStudent(${cursor.key})">Edit</button>
                    <button class="delete-button" onclick="confirmDeleteStudent(${cursor.key})">Delete</button>
                </td>
            </tr>`;
            tbody.insertAdjacentHTML('beforeend', row);
            cursor.continue();
        }
    };
}

function confirmDeleteStudent(id) {
    deleteStudentId = id;
    document.getElementById('confirmModal').style.display = 'flex';
}

document.getElementById('confirmDeleteBtn').addEventListener('click', function() {
    const transaction = db.transaction(['students'], 'readwrite');
    const objectStore = transaction.objectStore('students');
    objectStore.delete(deleteStudentId).onsuccess = function() {
        loadStudents();
        document.getElementById('confirmModal').style.display = 'none';
    };
});

document.getElementById('cancelDeleteBtn').addEventListener('click', function() {
    document.getElementById('confirmModal').style.display = 'none';
});

document.getElementById('closeConfirmModal').addEventListener('click', function() {
    document.getElementById('confirmModal').style.display = 'none';
});




// Your existing code for IndexedDB and other functionalities

// Add event listener for the export button
document.getElementById('exportButton').addEventListener('click', function() {
    exportToExcel(); // This will call the function from export.js
});






function editStudent(id) {
    const transaction = db.transaction(['students'], 'readonly');
    const objectStore = transaction.objectStore('students');
    const request = objectStore.get(id);

    request.onsuccess = function(event) {
        const student = event.target.result;
        editingStudentId = id;
        document.getElementById('editStudentName').value = student.name;
        document.getElementById('editStudentAge').value = student.age;
        document.getElementById('editStudentGrade').value = student.grade;
        document.getElementById('editModal').style.display = 'flex';
    };
}

document.getElementById('editStudentForm').addEventListener('submit', function(event) {
    event.preventDefault();
    const name = document.getElementById('editStudentName').value;
    const age = document.getElementById('editStudentAge').value;
    const grade = document.getElementById('editStudentGrade').value;

    const transaction = db.transaction(['students'], 'readwrite');
    const objectStore = transaction.objectStore('students');
    const request = objectStore.put({ id: editingStudentId, name, age, grade });

    request.onsuccess = function() {
        loadStudents();
        document.getElementById('editModal').style.display = 'none';
    };
});

document.getElementById('closeEditModal').addEventListener('click', function() {
    document.getElementById('editModal').style.display = 'none';
});

document.getElementById('searchInput').addEventListener('input', function() {
    const query = this.value.toLowerCase();
    const rows = document.querySelectorAll('#studentTable tbody tr');
    rows.forEach(row => {
        const name = row.cells[0].textContent.toLowerCase();
        row.style.display = name.includes(query) ? '' : 'none';
    });
});




// Function to display students and sort them
function displayStudents(sortBy = 'name') {
    const transaction = db.transaction(['students'], 'readonly');
    const objectStore = transaction.objectStore('students');
    const students = [];

    objectStore.openCursor().onsuccess = function(event) {
        const cursor = event.target.result;
        if (cursor) {
            students.push(cursor.value);
            cursor.continue();
        } else {
            // Sort students array
            if (sortBy === 'name') {
                students.sort((a, b) => a.name.localeCompare(b.name));
            } else if (sortBy === 'age') {
                students.sort((a, b) => a.age - b.age); // Sort by age as a number
            } else if (sortBy === 'grade') {
                students.sort((a, b) => a.grade - b.grade); // Sort by grade as a number
            }

            // Clear the table before adding new sorted entries
            studentTable.innerHTML = '';

            // Display sorted students
            students.forEach(student => addStudentToTable(student));
        }
    };
}

// Event listeners for sorting buttons
document.getElementById('sortByName').addEventListener('click', function() {
    displayStudents('name');
});

document.getElementById('sortByAge').addEventListener('click', function() {
    displayStudents('age');
});

document.getElementById('sortByGrade').addEventListener('click', function() {
    displayStudents('grade');
});

