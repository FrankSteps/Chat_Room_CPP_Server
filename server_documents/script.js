/*
 Functional programming style: fully functional-first
*/

// --- Pure functions ---
const getUser = () => localStorage.getItem("chatUser") || "";
const setUser = user => localStorage.setItem("chatUser", user);
const resolveUser = (existingUser, askFn) => existingUser || askFn();

// --- Impure / side-effect functions ---
const askUsername = () => prompt("Your username:"); 
const displayUsername = user => document.getElementById("username").innerText = user;

const attachUser = () => {
    const form = document.querySelector(".chat-form");
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
    const user = resolveUser(getUser(), askUsername);
    if (user) {
        setUser(user);
        displayUsername(user);
    }
};

// --- Fetch and display messages ---
const updateMessages = () => {
    fetch("/messages")
        .then(res => res.json())
        .then(msgs => {
            const chat = document.querySelector(".chat"); 
            chat.innerHTML = "";
            msgs.forEach(m => {
                const div = document.createElement("div");
                div.className = m.text.startsWith(getUser() + ":") ? "my-message chat-bubble" : "other-message chat-bubble";
                div.innerText = m.text;
                chat.appendChild(div);
            });
            chat.scrollTop = chat.scrollHeight;
        });
};

document.querySelector(".chat-form").addEventListener("submit", (e) => {
    e.preventDefault();
    const input = document.querySelector(".chat-input");
    const msg = input.value.trim();
    if (!msg) return;

    fetch("/send", {
        method: "POST",
        headers: { "Content-Type": "application/x-www-form-urlencoded" },
        body: `user=${encodeURIComponent(getUser())}&message=${encodeURIComponent(msg)}`
    }).then(() => {
        input.value = "";   
        updateMessages();   
    });
});

// Initialize
initUser();
attachUser();
updateMessages();
setInterval(updateMessages, 1000);
