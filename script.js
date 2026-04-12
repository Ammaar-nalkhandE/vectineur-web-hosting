const CONFIG = window.VECTINEUR_CONFIG || {};

const menuBtn = document.getElementById("menuBtn");
const nav = document.getElementById("nav");
const form = document.getElementById("contactForm");
const toast = document.getElementById("toast");

function showToast(message) {
  toast.textContent = message;
  toast.classList.add("show");
  clearTimeout(showToast._timer);
  showToast._timer = setTimeout(() => {
    toast.classList.remove("show");
  }, 3000);
}

function closeMenu() {
  nav.classList.remove("open");
  menuBtn.setAttribute("aria-expanded", "false");
}

if (menuBtn) {
  menuBtn.addEventListener("click", () => {
    const isOpen = nav.classList.toggle("open");
    menuBtn.setAttribute("aria-expanded", String(isOpen));
  });
}

document.querySelectorAll('a[href^="#"]').forEach((anchor) => {
  anchor.addEventListener("click", (e) => {
    const targetId = anchor.getAttribute("href").slice(1);
    const target = document.getElementById(targetId);

    if (target) {
      e.preventDefault();
      target.scrollIntoView({ behavior: "smooth", block: "start" });
      closeMenu();
    }
  });
});

const revealItems = document.querySelectorAll(".reveal");

const observer = new IntersectionObserver(
  (entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        entry.target.classList.add("show");
        observer.unobserve(entry.target);
      }
    });
  },
  { threshold: 0.16 }
);

revealItems.forEach((el) => observer.observe(el));

function isValidEmail(email) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

if (form) {
  form.addEventListener("submit", async (e) => {
    e.preventDefault();

    const name = document.getElementById("name").value.trim();
    const email = document.getElementById("email").value.trim();
    const company = document.getElementById("company").value.trim();
    const message = document.getElementById("message").value.trim();

    if (name.length < 2) {
      showToast("Please enter a valid name.");
      return;
    }

    if (!isValidEmail(email)) {
      showToast("Please enter a valid email address.");
      return;
    }

    if (message.length < 10) {
      showToast("Please add a little more detail.");
      return;
    }

    const payload = {
      name,
      email,
      company,
      message,
      source: "vectineur.com",
      timestamp: new Date().toISOString()
    };

    try {
      if (CONFIG.formEndpoint) {
        const res = await fetch(CONFIG.formEndpoint, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload)
        });

        if (!res.ok) throw new Error("Submission failed");
      } else {
        console.log("Enquiry payload:", payload);
      }

      form.reset();
      showToast("Enquiry sent. We will get back to you soon.");
    } catch (error) {
      console.error(error);
      showToast("Something went wrong. Please try again.");
    }
  });
}