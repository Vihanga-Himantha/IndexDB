// This file handles exporting data to Excel

function exportToExcel() {
    const transaction = db.transaction(['students'], 'readonly');
    const objectStore = transaction.objectStore('students');
    const students = [];

    objectStore.openCursor().onsuccess = function(event) {
        const cursor = event.target.result;
        if (cursor) {
            students.push(cursor.value);
            cursor.continue();
        } else {
            // Convert JSON data to worksheet
            const ws = XLSX.utils.json_to_sheet(students);

            // Create a new workbook and add the worksheet
            const wb = XLSX.utils.book_new();
            XLSX.utils.book_append_sheet(wb, ws, 'Students');

            // Generate Excel file and trigger download
            XLSX.writeFile(wb, 'students.xlsx');
        }
    };
}

// Make the function available globally
window.exportToExcel = exportToExcel;
