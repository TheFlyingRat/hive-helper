// Add an event listener onto the submit of the login form
document.getElementById('loginForm').addEventListener('submit', async (event) => {
    event.preventDefault();
    const formData = new FormData(event.target);

    const jsonObject = Object.fromEntries(formData.entries());
    const jsonData = JSON.stringify(jsonObject);

    // Send a login request
    try {
        const response = await fetch("/login", {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: jsonData
        });

        // Check for errors or success
        switch (response.status) {
            case 200:
                window.location.href = '/home';
                break;
            case 400:
                alert("Please fill out all fields!");
                break;
            case 401:
                alert("Username or password incorrect!");
                break;
            default:
                alert('An error occurred while processing your request.');
        }
    } catch (error) {
        console.error('Error:', error);
        alert('An error occurred while processing your request.');
    }
});
