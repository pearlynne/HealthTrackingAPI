function setupFieldValidation(form) {
  const fields = form.querySelectorAll(".form-field");
  fields.forEach((field) => {
    field.addEventListener("input", () => {
      field.setCustomValidity(""); 
      form.reportValidity(); 
    });
  });
}

function validatePassword(password) {
  const minLength = 8;
  const hasUpperCase = /[A-Z]/.test(password);
  const hasLowerCase = /[a-z]/.test(password);
  const hasNumber = /\d/.test(password);
  const hasSpecialChar = /[!@#$%^&*(),.?":{}|<>]/.test(password);

  return (
    password.length >= minLength &&
    hasUpperCase &&
    hasLowerCase &&
    hasNumber &&
    hasSpecialChar
  );
}

function handleSignUpFormSubmission(event) {
  event.preventDefault();

  const passwordElement = document.getElementById("signupPassword");
  const confirmPasswordElement = document.getElementById("confirmPassword");
  const formElement = document.getElementById("signup-form");
  const firstNameEl = document.getElementById("firstName");
  const lastNameEl = document.getElementById("lastName");
  const emailEl = document.getElementById("email");

  passwordElement.setCustomValidity("");
  confirmPasswordElement.setCustomValidity("");

  const password = passwordElement.value;
  const confirmPassword = confirmPasswordElement.value;

  if (!validatePassword(password)) {
    passwordElement.setCustomValidity(
      "Password must be at least 8 characters long, contain one uppercase letter, one lowercase letter, one number, and one special character."
    );
  }

  if (password !== confirmPassword) {
    confirmPasswordElement.setCustomValidity("Passwords do not match.");
  }

  if (!firstNameEl.value) {
    firstNameEl.setCustomValidity("First name required.");
  }
  if (!lastNameEl.value) {
    lastNameEl.setCustomValidity("Last name required.");
  }

  if (!formElement.reportValidity()) {
    return;
  }

  fetch("/auth/signup", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      firstName: firstNameEl.value,
      lastName: lastNameEl.value,
      email: emailEl.value,
      roles: document.getElementById("roles").value,
      password: password,
    }),
  })
    .then((response) => response.json())
    .then((data) => {
      if (data.success) {
        window.location.href = data.redirectUrl;
      } else {
        alert(data.message);
      }
    })
    .catch((error) => console.error("Error:", error));
}

function handleLoginFormSubmission(event) {
  event.preventDefault();

  fetch("/auth/login", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
		email: document.getElementById("email").value,
		password: document.getElementById("password").value,
    }),
  })
    .then((response) => response.json())
    .then((data) => {
      if (data.success) {
        localStorage.setItem("authenticated", "true");
        document.getElementById("login-btn").classList.add("hidden");
        document.getElementById("signup-btn").classList.add("hidden");
        document.getElementById("logout-btn").classList.remove("hidden");
        window.location.href = data.redirectUrl;
      } else {
        alert(data.message);
        window.location.href = data.redirectUrl;
      }
    })
    .catch((error) => console.error("Error:", error));
}

function handlePasswordFormSubmission(event) {
  event.preventDefault();

	const passwordElement = document.getElementById("newPassword");
  const confirmPasswordElement = document.getElementById("repeatPassword");
  const formElement = document.getElementById("password-form");

  passwordElement.setCustomValidity("");
  confirmPasswordElement.setCustomValidity("");

  const password = passwordElement.value;
  const confirmPassword = confirmPasswordElement.value;

	if (!validatePassword(password)) {
    passwordElement.setCustomValidity(
      "Password must be at least 8 characters long, contain one uppercase letter, one lowercase letter, one number, and one special character."
    );
  }

  if (password !== confirmPassword) {
    confirmPasswordElement.setCustomValidity("Passwords do not match.");
  }

	if (!formElement.reportValidity()) {
    return;
  }

  fetch("/auth/password", {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
			oldPassword: document.getElementById("oldPassword").value,
			newPassword: document.getElementById("newPassword").value,
			repeatPassword: document.getElementById("repeatPassword").value,
    }),
  })
    .then((response) => response.json())
    .then((data) => {
      if (data.success) {
        window.location.href = data.redirectUrl;
      } else {
        alert(data.message);
        window.location.href = data.redirectUrl;
      }
    })
    .catch((error) => console.error("Error:", error));
}

document.addEventListener("DOMContentLoaded", () => {
  const loginBtn = document.getElementById("login-btn");
  const logoutBtn = document.getElementById("logout-btn");
  const signupBtn = document.getElementById("signup-btn");

  // Check authentication status
  const isAuthenticated = localStorage.getItem("authenticated") !== null;
  loginBtn.classList.toggle("hidden", isAuthenticated);
  signupBtn.classList.toggle("hidden", isAuthenticated);
  logoutBtn.classList.toggle("hidden", !isAuthenticated);

  const loginForm = document.getElementById("login-form");
  const signupForm = document.getElementById("signup-form");
  const passwordForm = document.getElementById("password-form");

  if (loginForm) {
    setupFieldValidation(loginForm);
    loginForm.addEventListener("submit", handleLoginFormSubmission);
  }

  if (logoutBtn) {
    logoutBtn.addEventListener("click", function (event) {
      event.preventDefault();
      localStorage.removeItem("authenticated");
      loginBtn.classList.remove("hidden");
      signupBtn.classList.remove("hidden");
      logoutBtn.classList.add("hidden");
      window.location.href = "/auth/login";
    });
  }

  if (signupForm) {
    setupFieldValidation(signupForm);
    signupForm.addEventListener("submit", handleSignUpFormSubmission);
  }

	if (passwordForm) {
    setupFieldValidation(passwordForm);
    passwordForm.addEventListener("submit", handlePasswordFormSubmission);
  }
});
