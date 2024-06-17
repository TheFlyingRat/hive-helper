document.addEventListener('DOMContentLoaded', () => {
    // Get elements from the DOM
    const hamburger = document.querySelector(".hamburger");
    const navMenu = document.querySelector(".nav-menu");
    const navLinks = document.querySelectorAll(".nav-link");

    // Function to toggle the menu
    const toggleMenu = () => {
        hamburger.classList.toggle("active");
        navMenu.classList.toggle("active");
    };

    // Function to close the mobile menu
    const closeMenu = () => {
        hamburger.classList.remove("active");
        navMenu.classList.remove("active");
    };

    // Add event listener for hamburger menu click
    hamburger.addEventListener("click", toggleMenu);

    // Hide the menu upon mobile menu link click
    navLinks.forEach(link => link.addEventListener("click", closeMenu));
});