document.addEventListener("DOMContentLoaded", function () {
    const toggleButton = document.getElementById("dark-mode-toggle");
    const body = document.body;
  
    
    if (localStorage.getItem("theme") === "dark") {
      body.classList.add("dark-mode");
      toggleButton.textContent = "☀️"; 
    } else {
      body.classList.add("light-mode");
    }
  
    toggleButton.addEventListener("click", function () {
      if (body.classList.contains("light-mode")) {
        body.classList.remove("light-mode");
        body.classList.add("dark-mode");
        toggleButton.textContent = "☀️"; 
        localStorage.setItem("theme", "dark");
      } else {
        body.classList.remove("dark-mode");
        body.classList.add("light-mode");
        toggleButton.textContent = "🌙"; 
        localStorage.setItem("theme", "light");
      }
    });
  });
  