const CONFIG = window.VECTINEUR_CONFIG || {};

const menuBtn = document.getElementById("menuBtn");
const nav = document.getElementById("nav");
const form = document.getElementById("contactForm");
const toast = document.getElementById("toast");
const submitBtn = document.getElementById("submitBtn");
const year = document.getElementById("year");

function showToast(message) {
  if (!toast) return;

  toast.textContent = message;
  toast.classList.add("show");

  clearTimeout(showToast._timer);
  showToast._timer = setTimeout(() => {
    toast.classList.remove("show");
  }, 3600);
}

function closeMenu() {
  if (!nav || !menuBtn) return;

  nav.classList.remove("open");
  menuBtn.setAttribute("aria-expanded", "false");
  menuBtn.setAttribute("aria-label", "Open navigation");
  document.body.classList.remove("menu-open");
}

function openMenu() {
  if (!nav || !menuBtn) return;

  nav.classList.add("open");
  menuBtn.setAttribute("aria-expanded", "true");
  menuBtn.setAttribute("aria-label", "Close navigation");
  document.body.classList.add("menu-open");
}

if (menuBtn && nav) {
  menuBtn.addEventListener("click", () => {
    const isOpen = nav.classList.contains("open");
    if (isOpen) closeMenu();
    else openMenu();
  });

  document.addEventListener("keydown", (event) => {
    if (event.key === "Escape") closeMenu();
  });

  document.addEventListener("click", (event) => {
    if (
      nav.classList.contains("open") &&
      !nav.contains(event.target) &&
      !menuBtn.contains(event.target)
    ) {
      closeMenu();
    }
  });
}

document.querySelectorAll('a[href^="#"]').forEach((anchor) => {
  anchor.addEventListener("click", (event) => {
    const targetId = anchor.getAttribute("href").slice(1);
    const target = document.getElementById(targetId);

    if (!target) return;

    event.preventDefault();

    target.scrollIntoView({
      behavior: "smooth",
      block: "start",
    });

    closeMenu();
  });
});

const revealItems = document.querySelectorAll(".reveal");

if ("IntersectionObserver" in window) {
  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) return;

        entry.target.classList.add("show");
        observer.unobserve(entry.target);
      });
    },
    { threshold: 0.12 }
  );

  revealItems.forEach((element) => observer.observe(element));
} else {
  revealItems.forEach((element) => element.classList.add("show"));
}

function isValidEmail(email) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

function buildMailtoUrl({ name, email, company, message }) {
  const subject = company
    ? `Project enquiry — ${company}`
    : "Project enquiry — VectiNeur Labs";

  const body = [
    `Name: ${name}`,
    `Email: ${email}`,
    `Company / Project: ${company || "Not provided"}`,
    "",
    "Project brief:",
    message,
  ].join("\n");

  return `mailto:contact@vectineur.com?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
}

if (form) {
  form.addEventListener("submit", async (event) => {
    event.preventDefault();

    const name = document.getElementById("name")?.value.trim() || "";
    const email = document.getElementById("email")?.value.trim() || "";
    const company = document.getElementById("company")?.value.trim() || "";
    const message = document.getElementById("message")?.value.trim() || "";

    if (name.length < 2) {
      showToast("Please enter your full name.");
      document.getElementById("name")?.focus();
      return;
    }

    if (!isValidEmail(email)) {
      showToast("Please enter a valid email address.");
      document.getElementById("email")?.focus();
      return;
    }

    if (message.length < 10) {
      showToast("Please add a little more detail about the project.");
      document.getElementById("message")?.focus();
      return;
    }

    const payload = {
      name,
      email,
      company,
      message,
      source: "vectineur.com",
      timestamp: new Date().toISOString(),
    };

    if (submitBtn) {
      submitBtn.disabled = true;
      submitBtn.innerHTML = 'Sending enquiry <span aria-hidden="true">…</span>';
    }

    try {
      if (CONFIG.formEndpoint) {
        const response = await fetch(CONFIG.formEndpoint, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(payload),
        });

        if (!response.ok) {
          throw new Error("Submission failed");
        }

        form.reset();
        showToast("Your enquiry has been sent. We will be in touch shortly.");
      } else {
        // Safe fallback when the production endpoint is not configured.
        window.location.href = buildMailtoUrl({
          name,
          email,
          company,
          message,
        });

        showToast("Opening your email client…");
      }
    } catch (error) {
      console.error("VectiNeur enquiry error:", error);
      showToast("We could not send the enquiry. Please email contact@vectineur.com.");
    } finally {
      if (submitBtn) {
        submitBtn.disabled = false;
        submitBtn.innerHTML = 'Send project enquiry <span aria-hidden="true">↗</span>';
      }
    }
  });
}

if (year) {
  year.textContent = new Date().getFullYear();
}
