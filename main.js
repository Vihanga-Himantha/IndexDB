// Open IndexedDB
let db;
const request = indexedDB.open('StudentDB', 1);

request.onupgradeneeded = function(event) {
    console.log('Upgrading database...');
    db = event.target.result;
    if (!db.objectStoreNames.contains('students')) {
        const objectStore = db.createObjectStore('students', { keyPath: 'id', autoIncrement: true });
        objectStore.createIndex('name', 'name', { unique: false });
        objectStore.createIndex('age', 'age', { unique: false });
        objectStore.createIndex('grade', 'grade', { unique: false });
    }
};

request.onsuccess = function(event) {
    console.log('Database opened successfully');
    db = event.target.result;
    loadStudents();
};

request.onerror = function(event) {
    console.error('Database error:', event.target.errorCode);
};

// Add Student
document.getElementById('studentForm').addEventListener('submit', function(event) {
    event.preventDefault();
    const name = document.getElementById('studentName').value;
    const age = document.getElementById('studentAge').value;
    const grade = document.getElementById('studentGrade').value;

    console.log('Adding student:', { name, age, grade });

    const transaction = db.transaction(['students'], 'readwrite');
    const objectStore = transaction.objectStore('students');

    const request = objectStore.add({ name, age, grade });
    request.onsuccess = function() {
        console.log('Student added successfully');
        loadStudents();
        document.getElementById('studentForm').reset();
    };
    request.onerror = function(event) {
        console.error('Error adding student:', event.target.errorCode);
    };
});

// Load Students
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
                <td><button onclick="deleteStudent(${cursor.key})">Delete</button></td>
            </tr>`;
            tbody.insertAdjacentHTML('beforeend', row);
            cursor.continue();
        }
    };
}

// Delete Student
function deleteStudent(id) {
    const transaction = db.transaction(['students'], 'readwrite');
    const objectStore = transaction.objectStore('students');

    objectStore.delete(id).onsuccess = function() {
        console.log('Student deleted successfully');
        loadStudents();
    };
}
