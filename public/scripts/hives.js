document.addEventListener('DOMContentLoaded', function() {
    const tableHeader = document.getElementById('tableHeader');
    const tableBody = document.getElementById('tableBody');

    // Manual column names, api returns the column names as written in database
    const headers = ['Hive ID', 'Beekeeper ID', 'Hive Name', 'Location', 'Hive Type'];

    // Fetch data from the /hive endpoint to list all hives
    fetch('/hive')
        .then(response => response.json())
        .then(data => {
            // Create table headers
            headers.forEach(header => {
                const th = document.createElement('th');
                th.textContent = header;
                tableHeader.appendChild(th);
            });

            // Populate table rows with data
            data.forEach(rowData => {
                const tr = document.createElement('tr');
                headers.forEach(header => {
                    const td = document.createElement('td');
                    td.textContent = rowData[header.toLowerCase().replace(' ', '_')];
                    tr.appendChild(td);
                });
                tableBody.appendChild(tr);
            });
        })
        .catch(error => console.error('Error fetching hive data:', error));

    // Function to perform Quicksort, works based on column index
    function quickSort(arr, columnIdx, reverse) {
        if (arr.length <= 1) return arr;

        const pivot = arr[Math.floor(arr.length / 2)][columnIdx];
        const less = [];
        const equal = [];
        const greater = [];

        arr.forEach(item => {
            const val = item[columnIdx];
            if (val < pivot) less.push(item);
            else if (val === pivot) equal.push(item);
            else greater.push(item);
        });

        if (reverse) {
            return [...quickSort(greater, columnIdx, reverse), ...equal, ...quickSort(less, columnIdx, reverse)];
        } else {
            return [...quickSort(less, columnIdx, reverse), ...equal, ...quickSort(greater, columnIdx, reverse)];
        }
    }

    // Function to sort table data alphabetically using Quicksort algorithm
    function sortTable(columnIdx, reverse) {
        const rows = Array.from(tableBody.getElementsByTagName('tr'));
        const rowData = rows.map(row => Array.from(row.getElementsByTagName('td')).map(td => td.textContent.trim()));
        const sortedData = quickSort(rowData, columnIdx, reverse);
        tableBody.innerHTML = '';
        sortedData.forEach(rowData => {
            const tr = document.createElement('tr');
            rowData.forEach(cellData => {
                const td = document.createElement('td');
                td.textContent = cellData;
                tr.appendChild(td);
            });
            tableBody.appendChild(tr);
        });
    }

    // Add event listeners to table headers for sorting, add indicator arrows too for clarity
    tableHeader.addEventListener('click', event => {
        if (event.target.tagName === 'TH') {
            const columnIdx = Array.from(event.target.parentNode.children).indexOf(event.target);
            let reverse = event.target.classList.contains('sorted-desc');
            reverse = !reverse;
            Array.from(event.target.parentNode.children).forEach(th => {
                th.classList.remove('sorted-asc', 'sorted-desc');
                th.textContent = th.textContent.replace(' ▼', '').replace(' ▲', '');
            });
            const indicatorArrow = reverse ? ' ▼' : ' ▲';
            event.target.textContent += indicatorArrow;
            sortTable(columnIdx, reverse);
            event.target.classList.add(reverse ? 'sorted-desc' : 'sorted-asc');
        }
    });

    // Get the modal elements
    const modal = document.getElementById("modal");
    const createBtn = document.getElementById("modalCreate");
    const deleteBtn = document.getElementById("modalDelete");
    const modalTitle = document.getElementById("modalTitle");
    const createHiveForm = document.getElementById("createHiveForm");
    const deleteHiveForm = document.getElementById("deleteHiveForm");
    const span = document.getElementsByClassName("close")[0];

    // Show the modal for creating a hive
    createBtn.onclick = function() {
        modal.style.display = "block";
        createHiveForm.style.display = "block";
        deleteHiveForm.style.display = "none";
        modalTitle.innerText = "Create New Hive";
    };

    // Show the modal for deleting a hive
    deleteBtn.onclick = function() {
        modal.style.display = "block";
        createHiveForm.style.display = "none";
        deleteHiveForm.style.display = "block";
        modalTitle.innerText = "Delete Hive";
    };

    // Close the modal
    span.onclick = function() {
        modal.style.display = "none";
    };

    // Clicking out of the modal
    window.onclick = function(event) {
        if (event.target == modal) {
            modal.style.display = "none";
        }
    };

    // Handle form submission
    const handleSubmit = async (event, type) => {
        event.preventDefault();
        const formData = new FormData(event.target);

        let endpoint, method, hiveData;

        // Determining what we're trying to do
        if (type === "createHiveForm") {
            endpoint = "/hive";
            method = "POST";
            hiveData = {
                hive_name: formData.get("hiveName"),
                location: formData.get("location"),
                hive_type: formData.get("hiveType")
            };
        } else if (type === "deleteHiveForm") {
            endpoint = "/hive/" + formData.get("hiveID");
            method = "DELETE";
            hiveData = {};
        }

        // Submit the request to the api
        try {
            const response = await fetch(endpoint, {
                method: method,
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(hiveData)
            });

            if (response.status === 404) { return alert("Hive not found or not owned by the user!"); }
            if (!response.ok) throw new Error('An error occurred... Please try again later');

            modal.style.display = "none";
            window.location.reload();
        } catch (error) {
            console.error('Error:', error);
            alert('An error occurred... Please try again later');
        }
    };

    // Add submit event listeners to the forms
    createHiveForm.addEventListener('submit', (event) => handleSubmit(event, "createHiveForm"));
    deleteHiveForm.addEventListener('submit', (event) => handleSubmit(event, "deleteHiveForm"));
});