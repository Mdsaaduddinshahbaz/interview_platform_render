// const BASEURL="https://productivity-ai-agent.onrender.com"
// import { BASEURL } from "../my_extension/config";
async function loadConfig() {
  const { BASEURL } = await import("../my_extension/config");
  //console.log(BASEURL);
  return BASEURL
}
const BASEURL=loadConfig()
document.addEventListener("DOMContentLoaded", () => {
  const signupForm = document.getElementById("signupform");

  signupForm.addEventListener("submit", async (e) => {
    e.preventDefault();

    const email = document.getElementById("email").value.trim();
    const password = document.getElementById("password").value;
    const username=document.getElementById("username").value.trim();
    const confirmPassword = document.getElementById("confirm_password").value;

    if (password !== confirmPassword) {
      alert("Passwords do not match!");
      return;
    }

    try {
      const res = await fetch(`/signup_user`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ "email":email, "password":password,"username":username }),
      });

      const data = await res.json();
      if (data.success) {
        alert(data.message || "Signup successful! Please login.");
        window.location.href = "/login";
      }
      else if(!data.success){
        alert(data.message || "User already exists");
      }
       else {
        alert(data.message || "Signup failed, try again.");
      }
    } catch (err) {
      console.error("Signup error:", err);
      alert("Something went wrong!");
    }
  });
});