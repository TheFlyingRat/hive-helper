document.addEventListener('DOMContentLoaded', () => {
    // Get the form from the DOM
    const signupForm = document.getElementById('signupForm');

    // Add event listener for the form submission
    signupForm.addEventListener('submit', async (event) => {
        event.preventDefault();
        const formData = new FormData(signupForm);

        // Ensure passwords match
        if (formData.get('password') !== formData.get('confirm')) {
            alert("Passwords are not matching.");
            return false;
        }

        // Convert FormData to JSON object
        const jsonObject = Object.fromEntries(formData.entries());
        const jsonData = JSON.stringify(jsonObject);

        // Send a register request to the api
        try {
            let response = await fetch("/register", {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: jsonData
            });

            // Check for response codes
            switch (response.status) {
                case 400:
                    alert("Please fill out all fields!");
                    return false;
                case 409:
                    alert("You already have an account! Please log in instead.");
                    return false;
                default:
                    if (!response.ok) {
                        throw new Error('An error occurred while processing your request.');
                    }
            }

            // If its successful, log the user in
            response = await fetch("/login", {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: jsonData
            });

            // If the login is successful, redirect user to homepage
            switch (response.status) {
                case 200:
                    window.location.href = '/home';
                    return true;
                default:
                    throw new Error('An error occurred while processing your request.');
            }

        } catch (error) {
            console.error('Error:', error);
            alert(error.message);
            return false;
        }
    });
});
