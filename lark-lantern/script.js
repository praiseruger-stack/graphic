document.addEventListener("DOMContentLoaded", () => {
  const navToggle = document.querySelector(".nav-toggle");
  const siteNav = document.querySelector(".site-nav");

  if (navToggle && siteNav) {
    navToggle.addEventListener("click", () => {
      const isOpen = siteNav.classList.toggle("is-open");
      navToggle.setAttribute("aria-expanded", String(isOpen));
    });

    siteNav.querySelectorAll("a").forEach((link) => {
      link.addEventListener("click", () => {
        siteNav.classList.remove("is-open");
        navToggle.setAttribute("aria-expanded", "false");
      });
    });
  }

  const yearEl = document.getElementById("year");
  if (yearEl) {
    yearEl.textContent = new Date().getFullYear();
  }

  const revealedItems = document.querySelectorAll("[data-reveal]");
  if (revealedItems.length) {
    const revealObserver = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add("is-visible");
            revealObserver.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.18 }
    );

    revealedItems.forEach((item) => revealObserver.observe(item));
  }

  const form = document.querySelector(".contact-form");
  if (form) {
    const fields = {
      name: document.getElementById("name"),
      email: document.getElementById("email"),
      interest: document.getElementById("interest"),
      message: document.getElementById("message")
    };

    const status = form.querySelector(".form-status");
    const submitButton = form.querySelector('button[type="submit"]');

    // Replace these with your actual EmailJS account values.
    const EMAILJS_PUBLIC_KEY = "YOUR_PUBLIC_KEY";
    const EMAILJS_SERVICE_ID = "YOUR_SERVICE_ID";
    const EMAILJS_TEMPLATE_ID = "YOUR_TEMPLATE_ID";

    const setError = (field, message) => {
      const errorNode = field.parentElement.querySelector(".error-message");
      if (errorNode) {
        errorNode.textContent = message;
      }
      field.setAttribute("aria-invalid", message ? "true" : "false");
    };

    const validateField = (fieldName) => {
      const field = fields[fieldName];
      if (!field) return true;

      const value = field.value.trim();

      if (fieldName === "name" && value.length < 2) {
        setError(field, "Please enter your name.");
        return false;
      }

      if (fieldName === "email") {
        const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailPattern.test(value)) {
          setError(field, "Please enter a valid email address.");
          return false;
        }
      }

      if (fieldName === "interest" && !value) {
        setError(field, "Please choose an experience.");
        return false;
      }

      if (fieldName === "message" && value.length < 12) {
        setError(field, "Please share a few more details.");
        return false;
      }

      setError(field, "");
      return true;
    };

    Object.keys(fields).forEach((fieldName) => {
      fields[fieldName].addEventListener("input", () => validateField(fieldName));
      fields[fieldName].addEventListener("blur", () => validateField(fieldName));
    });

    const fallbackMailto = () => {
      const recipientEmail = "praiseruger@gmail.com";
      const subject = encodeURIComponent(`Retreat reservation: ${fields.interest.value.trim()}`);
      const body = encodeURIComponent(
        `Name: ${fields.name.value.trim()}\n` +
          `Email: ${fields.email.value.trim()}\n` +
          `Interest: ${fields.interest.value.trim()}\n\n` +
          `Message:\n${fields.message.value.trim()}`
      );

      window.location.href = `mailto:${recipientEmail}?subject=${subject}&body=${body}`;
    };

    form.addEventListener("submit", async (event) => {
      event.preventDefault();

      const isValid = Object.keys(fields).every((fieldName) => validateField(fieldName));

      if (!isValid) {
        status.textContent = "Please fix the highlighted fields and try again.";
        status.style.color = "#b24242";
        return;
      }

      submitButton.disabled = true;
      submitButton.textContent = "Sending...";
      status.textContent = "Sending your inquiry...";
      status.style.color = "#1b3b32";

      const isEmailJsConfigured =
        EMAILJS_PUBLIC_KEY !== "YOUR_PUBLIC_KEY" &&
        EMAILJS_SERVICE_ID !== "YOUR_SERVICE_ID" &&
        EMAILJS_TEMPLATE_ID !== "YOUR_TEMPLATE_ID";

      try {
        if (isEmailJsConfigured && window.emailjs && typeof window.emailjs.send === "function") {
          const response = await window.emailjs.send(EMAILJS_SERVICE_ID, EMAILJS_TEMPLATE_ID, {
            from_name: fields.name.value.trim(),
            reply_to: fields.email.value.trim(),
            interest: fields.interest.value.trim(),
            message: fields.message.value.trim(),
            sender_email: fields.email.value.trim()
          });

          if (response && response.status === 200) {
            status.textContent = "Thanks! Your inquiry has been received. We’ll be in touch within 1–2 business days.";
            status.style.color = "#1b3b32";
            form.reset();
            Object.keys(fields).forEach((fieldName) => setError(fields[fieldName], ""));
            return;
          }
        }

        throw new Error("EmailJS not available");
      } catch (error) {
        fallbackMailto();
        status.textContent = "Your email app was opened so you can send the reservation request directly. If it does not open, email praise.ruger@gmail.com.";
        status.style.color = "#1b3b32";
        form.reset();
        Object.keys(fields).forEach((fieldName) => setError(fields[fieldName], ""));
      } finally {
        submitButton.disabled = false;
        submitButton.textContent = "Send inquiry";
      }
    });
  }
});
