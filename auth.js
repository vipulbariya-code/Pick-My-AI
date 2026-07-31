// Frontend-only che: anhiya thi toggle button ane form fields na validations handle thy che
const pageType = document.body.dataset.page;
const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/; // basic email check
const passwordRegex =
  /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[^A-Za-z\d]).{8,64}$/; // strong password rule

function setError(fieldId, message, ok = false) {
  const el = document.getElementById(fieldId + "Error");
  if (!el) return;
  el.textContent = message || "";
  el.classList.toggle("field-ok", Boolean(ok));
}

function setStatus(message, isError = false) {
  const status = document.getElementById("statusMsg");
  if (!status) return;
  status.textContent = message || "";
  status.style.color = isError ? "var(--danger)" : "var(--success)";
}

async function postForm(form) {
  const response = await fetch(form.action, {
    method: "POST",
    body: new FormData(form)
  });

  let data;

  try {
    data = await response.json();
  } catch (error) {
    throw new Error("Server thi valid response nathi aavyo.");
  }

  if (!response.ok || !data.success) {
    throw new Error(data.message || "Request failed.");
  }

  return data;
}

function initThemeToggle() {
  const toggleBtn = document.getElementById("themeToggle");
  if (!toggleBtn) return;

  const storedTheme = localStorage.getItem("auth_theme");
  if (storedTheme === "light") {
    document.body.classList.add("light");
  }

  // Button thi theme switch, preference localStorage ma save
  toggleBtn.addEventListener("click", () => {
    document.body.classList.toggle("light");
    localStorage.setItem(
      "auth_theme",
      document.body.classList.contains("light") ? "light" : "dark"
    );
  });
}

function initSignin() {
  const form = document.getElementById("signinForm");
  if (!form) return;

  // Submit par khali client-side checks + demo success message
  form.addEventListener("submit", async (event) => {
    event.preventDefault();
    setStatus("");
    setError("email", "");
    setError("password", "");

    const email = form.email.value.trim();
    const password = form.password.value;
    const rememberMe = form.rememberMe.checked;
    let hasError = false;

    if (!emailRegex.test(email)) {
      setError("email", "Please enter a valid email address.");
      hasError = true;
    }
    if (!password) {
      setError("password", "Password is required.");
      hasError = true;
    }
    if (hasError) return;

    try {
      const data = await postForm(form);
      localStorage.setItem(
        "pickmyai_signin_preview",
        JSON.stringify({ email, rememberMe, signedInAt: new Date().toISOString() })
      );
      setStatus(data.message);
      setTimeout(() => {
        window.location.href = "index.html";
      }, 700);
    } catch (error) {
      setStatus(error.message, true);
    }
  });
}

function initSignup() {
  const form = document.getElementById("signupForm");
  if (!form) return;

  // Realtime field listeners: user ne tarat j feedback male
  const fullName = form.fullName;
  const email = form.email;
  const password = form.password;
  const confirmPassword = form.confirmPassword;

  fullName.addEventListener("input", () => {
    if (fullName.value.trim().length < 2) {
      setError("fullName", "Full name must be at least 2 characters.");
    } else {
      setError("fullName", "Looks good.", true);
    }
  });

  email.addEventListener("input", () => {
    if (!emailRegex.test(email.value.trim())) {
      setError("email", "Please enter a valid email address.");
    } else {
      setError("email", "Valid email.", true);
    }
  });

  password.addEventListener("input", () => {
    if (!passwordRegex.test(password.value)) {
      setError(
        "password",
        "Use 8+ chars with uppercase, lowercase, number and symbol."
      );
    } else {
      setError("password", "Strong password.", true);
    }
  });

  confirmPassword.addEventListener("input", () => {
    if (confirmPassword.value !== password.value) {
      setError("confirmPassword", "Passwords do not match.");
    } else {
      setError("confirmPassword", "Passwords match.", true);
    }
  });

  // Submit par aggregated validation + success message
  form.addEventListener("submit", async (event) => {
    event.preventDefault();
    setStatus("");
    setError("fullName", "");
    setError("email", "");
    setError("password", "");
    setError("confirmPassword", "");

    const payload = {
      fullName: fullName.value.trim(),
      email: email.value.trim(),
      password: password.value,
      confirmPassword: confirmPassword.value
    };

    let hasError = false;
    if (payload.fullName.length < 2) {
      setError("fullName", "Full name must be at least 2 characters.");
      hasError = true;
    }
    if (!emailRegex.test(payload.email)) {
      setError("email", "Please enter a valid email address.");
      hasError = true;
    }
    if (!passwordRegex.test(payload.password)) {
      setError(
        "password",
        "Use 8+ chars with uppercase, lowercase, number and symbol."
      );
      hasError = true;
    }
    if (payload.password !== payload.confirmPassword) {
      setError("confirmPassword", "Passwords do not match.");
      hasError = true;
    }
    if (hasError) return;

    try {
      const data = await postForm(form);
      localStorage.setItem(
        "pickmyai_signup_preview",
        JSON.stringify({
          fullName: payload.fullName,
          email: payload.email,
          createdAt: new Date().toISOString()
        })
      );
      setStatus(data.message);
      setTimeout(() => {
        window.location.href = "signin.html";
      }, 900);
    } catch (error) {
      setStatus(error.message, true);
    }
  });
}

initThemeToggle();
if (pageType === "signin") initSignin();
if (pageType === "signup") initSignup();
