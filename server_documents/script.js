/*
 Functional programming style: fully functional-first

 debug:
    localStorage.removeItem("Frank");
    localStorage.clear();
*/

// --- Pure functions ---
// get username from storage, return "" if not found
const getUser = () => localStorage.getItem("chatUser") || "";

// save username in storage
const setUser = user => localStorage.setItem("chatUser", user);

// decide which username to use (existing or new)
const resolveUser = (existingUser, askFn) => existingUser || askFn();

// --- Impure / side-effect functions ---
const askUsername = () => prompt("your username: "); // ask user
const displayUsername = user => document.getElementById("username").innerText = user; // update DOM

// attach username to form on submit
const attachUser = () => {
  const form = document.querySelector("form.chat-form");
  form.addEventListener("submit", () => {
    const input = document.createElement("input");
    input.type = "hidden";
    input.name = "user";
    input.value = getUser();
    form.appendChild(input);
  });
};

// --- Compose side effects ---
const initUser = () => {
  const user = resolveUser(getUser(), askUsername); // pure decision
  if (user) {
    setUser(user);          // effect: save
    displayUsername(user);  // effect: DOM
  }
};

// --- Initialize ---
initUser();
attachUser();
