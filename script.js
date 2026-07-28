
  //  1. PRELOADER  

window.addEventListener("load", function () {
  const preloader = document.getElementById("preloader");

  // small delay so the animation is actually visible
  setTimeout(function () {
    preloader.classList.add("hidden");
  }, 700);
});


/* 
   2. DARK / LIGHT MODE TOGGLE  (bonus feature)
   We save the choice in localStorage so it is remembered.
 */
const themeToggle = document.getElementById("themeToggle");

// read the saved theme 
const savedTheme = localStorage.getItem("hackverse-theme");
if (savedTheme === "light") {
  document.body.classList.add("light");
}

themeToggle.addEventListener("click", function () {
  document.body.classList.toggle("light");

  // remember the new choice
  const isLight = document.body.classList.contains("light");
  localStorage.setItem("hackverse-theme", isLight ? "light" : "dark");
});


/* 
   3. MOBILE MENU 
 */
const menuBtn = document.getElementById("menuBtn");
const navLinks = document.getElementById("navLinks");

menuBtn.addEventListener("click", function () {
  const isOpen = navLinks.classList.toggle("open");
  menuBtn.classList.toggle("open", isOpen);
  menuBtn.setAttribute("aria-expanded", isOpen ? "true" : "false");
});

// close the menu whenever a link inside it is clicked
navLinks.querySelectorAll("a").forEach(function (link) {
  link.addEventListener("click", function () {
    navLinks.classList.remove("open");
    menuBtn.classList.remove("open");
    menuBtn.setAttribute("aria-expanded", "false");
  });
});


/* 
   4. NAVBAR SHADOW ON SCROLL + BACK TO TOP BUTTON
 */
const navbar = document.getElementById("navbar");
const backToTop = document.getElementById("backToTop");

function handleScrollUI() {
  const y = window.scrollY;

  // add a border + shadow to the navbar after scrolling 30px
  navbar.classList.toggle("scrolled", y > 30);

  // show the back-to-top button after scrolling 400px
  backToTop.classList.toggle("show", y > 400);
}

window.addEventListener("scroll", handleScrollUI);
handleScrollUI(); // run once at the start

// clicking the button scrolls smoothly to the very top
backToTop.addEventListener("click", function () {
  window.scrollTo({ top: 0, behavior: "smooth" });
});


/* 
   5. ACTIVE NAV LINK HIGHLIGHT WHILE SCROLLING
   Figures out which section is currently on screen.
 */
const sections = document.querySelectorAll("section[id]");
const allNavLinks = document.querySelectorAll(".nav-link");

function highlightActiveLink() {
  let current = "home";

  sections.forEach(function (section) {
    // 120px offset accounts for the sticky navbar height
    if (window.scrollY >= section.offsetTop - 120) {
      current = section.getAttribute("id");
    }
  });

  allNavLinks.forEach(function (link) {
    const isActive = link.getAttribute("href") === "#" + current;
    link.classList.toggle("active", isActive);
  });
}

window.addEventListener("scroll", highlightActiveLink);
highlightActiveLink();


/* 
   6. COUNTDOWN TIMER  (bonus feature)
   Counts down to the event date: 17 august 2026, 9:00 AM
- */
const eventDate = new Date("2026-08-17T09:00:00").getTime();

const cdDays = document.getElementById("cdDays");
const cdHours = document.getElementById("cdHours");
const cdMins = document.getElementById("cdMins");
const cdSecs = document.getElementById("cdSecs");

// helper: always show 2 digits (5 -> "05")
function pad(number) {
  return String(number).padStart(2, "0");
}

function updateCountdown() {
  const now = new Date().getTime();
  let gap = eventDate - now;

  // if the event already started, freeze everything at zero
  if (gap < 0) {
    cdDays.textContent = "00";
    cdHours.textContent = "00";
    cdMins.textContent = "00";
    cdSecs.textContent = "00";
    document.querySelector(".countdown-label").textContent = "The hackathon has begun!";
    clearInterval(timerId);
    return;
  }

  // convert the millisecond gap into days / hours / minutes / seconds
  const days = Math.floor(gap / (1000 * 60 * 60 * 24));
  const hours = Math.floor((gap % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
  const minutes = Math.floor((gap % (1000 * 60 * 60)) / (1000 * 60));
  const seconds = Math.floor((gap % (1000 * 60)) / 1000);

  cdDays.textContent = pad(days);
  cdHours.textContent = pad(hours);
  cdMins.textContent = pad(minutes);
  cdSecs.textContent = pad(seconds);
}

updateCountdown(); // run immediately so there is no "00" flash
const timerId = setInterval(updateCountdown, 1000);


/* 
   7. SCROLL REVEAL ANIMATIONS  
   Uses IntersectionObserver: adds .visible when an element
   scrolls into the viewport.
 */
const revealItems = document.querySelectorAll(".reveal");

const revealObserver = new IntersectionObserver(
  function (entries) {
    entries.forEach(function (entry) {
      if (entry.isIntersecting) {
        entry.target.classList.add("visible");
        revealObserver.unobserve(entry.target); // animate only once
      }
    });
  },
  { threshold: 0.15 }
);

revealItems.forEach(function (item) {
  revealObserver.observe(item);
});


/* 
   8. ANIMATED STATISTICS COUNTER  (bonus feature)
   Numbers count up from 0 when the stats row is visible.
- */
const statNumbers = document.querySelectorAll(".stat-num");

function animateCounter(el) {
  const target = Number(el.dataset.target);
  const suffix = el.dataset.suffix || "";
  const duration = 1600; // total time in milliseconds
  const startTime = performance.now();

  function step(now) {
    const progress = Math.min((now - startTime) / duration, 1);

    // ease-out so it slows down near the end 
    const eased = 1 - Math.pow(1 - progress, 3);

    el.textContent = Math.round(target * eased) + suffix;

    if (progress < 1) {
      requestAnimationFrame(step);
    }
  }

  requestAnimationFrame(step);
}

const statsObserver = new IntersectionObserver(
  function (entries) {
    entries.forEach(function (entry) {
      if (entry.isIntersecting) {
        animateCounter(entry.target);
        statsObserver.unobserve(entry.target);
      }
    });
  },
  { threshold: 0.5 }
);

statNumbers.forEach(function (num) {
  statsObserver.observe(num);
});


/* 
   9. REGISTRATION FORM VALIDATION
   Checks required fields, email format and phone number.
 */
const form = document.getElementById("registerForm");
const submitBtn = document.getElementById("submitBtn");
const successMsg = document.getElementById("successMsg");

//  clear an error under a field
function showError(id, message) {
  document.getElementById(id).classList.add("invalid");
  document.getElementById("err-" + id).textContent = message;
}

function clearError(id) {
  document.getElementById(id).classList.remove("invalid");
  document.getElementById("err-" + id).textContent = "";
}

// validate one field and return true / false
function validateField(id) {
  const input = document.getElementById(id);
  const value = input.value.trim();

  clearError(id);

  switch (id) {
    case "fullName":
      if (value === "") { showError(id, "Please enter your full name."); return false; }
      if (value.length < 3) { showError(id, "Name must be at least 3 characters."); return false; }
      break;

    case "email": {
      // simple but effective email pattern: text@text.text
      const emailPattern = /^[^\s@]+@[^\s@]+\.[a-zA-Z]{2,}$/;
      if (value === "") { showError(id, "Please enter your email address."); return false; }
      if (!emailPattern.test(value)) { showError(id, "Enter a valid email (e.g. name@college.edu)."); return false; }
      break;
    }

    case "college":
      if (value === "") { showError(id, "Please enter your college name."); return false; }
      break;

    case "team":
      if (value === "") { showError(id, "Please enter a team name (or your own name)."); return false; }
      break;

    case "phone": {
      // allow only 10 digits
      const phonePattern = /^[0-9]{10}$/;
      if (value === "") { showError(id, "Please enter your phone number."); return false; }
      if (!phonePattern.test(value)) { showError(id, "Enter a valid 10-digit phone number."); return false; }
      break;
    }

    case "type":
      if (value === "") { showError(id, "Please choose Individual or Team."); return false; }
      break;
  }

  return true;
}

// list of every field we need to check
const fieldIds = ["fullName", "email", "college", "team", "phone", "type"];

// live validation: clear/re-check the field once the user leaves it
fieldIds.forEach(function (id) {
  const input = document.getElementById(id);

  input.addEventListener("blur", function () {
    if (input.value.trim() !== "") validateField(id);
  });

  input.addEventListener("input", function () {
    if (input.classList.contains("invalid")) clearError(id);
  });
});

// handle the actual submit
form.addEventListener("submit", function (event) {
  event.preventDefault(); 

  successMsg.classList.remove("show");

  let isFormValid = true;

  // validate every field (we do NOT stop at the first error,
  // so the user can see all problems at once)
  fieldIds.forEach(function (id) {
    if (!validateField(id)) isFormValid = false;
  });

  if (!isFormValid) {
    // scroll to the first field with an error and focus it
    const firstBad = form.querySelector(".invalid");
    if (firstBad) {
      firstBad.scrollIntoView({ behavior: "smooth", block: "center" });
      firstBad.focus({ preventScroll: true });
    }
    return;
  }

  // ---- everything is valid ----
  // fake a short "submitting" delay so the button spinner is visible
  submitBtn.classList.add("loading");
  submitBtn.textContent = "Submitting";

  setTimeout(function () {
    submitBtn.classList.remove("loading");
    submitBtn.textContent = "Submit Registration";

    successMsg.textContent = "🎉 Registration Successful! We'll contact you soon.";
    successMsg.classList.add("show");

    form.reset();

    // clear any leftover error text
    fieldIds.forEach(clearError);

    // make sure the user actually sees the message
    successMsg.scrollIntoView({ behavior: "smooth", block: "center" });

    // hide the message after 8 seconds
    setTimeout(function () {
      successMsg.classList.remove("show");
    }, 8000);
  }, 1200);
});



document.querySelectorAll('a[href^="#"]').forEach(function (link) {
  link.addEventListener("click", function (event) {
    const targetId = link.getAttribute("href");
    if (targetId === "#") return;

    const target = document.querySelector(targetId);
    if (!target) return;

    event.preventDefault();

    const navHeight = navbar.offsetHeight;
    const top = target.getBoundingClientRect().top + window.scrollY - navHeight + 1;

    window.scrollTo({ top: top, behavior: "smooth" });
  });
});




