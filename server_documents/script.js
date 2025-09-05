/*
    Functional JavaScript
    developed by: Francisco Passos
    devoleped in: 04/09/2025

    modified in: 05/09/2025
*/

//load the Java Script after the HTML is ready
document.addEventListener("DOMContentLoaded", () => {
    // Format ISO date -> "Month Year"
    const formatMonthYear = (isoDate) => {
        if (!isoDate) return "";
        const date = new Date(isoDate);
        return `${date.toLocaleString("default", { month: "long" })} ${date.getFullYear()}`;
    };

    //return existing value or call fallback function
    const resolveValue = (existing, askFn) => existing || askFn();

    //render chat messages as <div> elements
    const renderMessages = (msgs, user) =>
        msgs.map(m => {
            const div = document.createElement("div");
            const isMine = m.text.startsWith(user + ":");
            div.className = isMine ? "my-message chat-bubble" : "other-message chat-bubble";
            div.innerText = m.text;
            return div;
        });

    //---Impure functions: storage, DOM, fetch---

    //localStorage getters
    const getUser = () => localStorage.getItem("chatUser") || "";
    const getColor = () => localStorage.getItem("favoriteColor") || "";
    const getUserDate = () => localStorage.getItem("chatUserDate") || "";

    //localStorage setters
    const setUser = (user) => {
        localStorage.setItem("chatUser", user);
        if (!localStorage.getItem("chatUserDate")) {
            localStorage.setItem("chatUserDate", new Date().toISOString());
        }
    };
    const setColor = (color) => localStorage.setItem("favoriteColor", color);

    //ask user for input (impure: prompt)
    const askUsername = () => prompt("Your username: ");
    const askFavoriteColor = () => prompt("Your favorite color: ");

    //DOM updates
    const displayUsername = (user) => {
        const el = document.getElementById("username");
        if (el) el.innerText = user;
    };

    //update the DOM element with id "favoriteColor" to show the user color
    //impure function (side effect: changes the DOM)
    const displayColor = (color) => {
        const el = document.getElementById("favoriteColor");
        if (el) el.innerText = color;
    };

    //update the DOM element with id "date" 
    //(should be combined with formatMonthYear before calling this)
    //impure function (side effect: changes the DOM)
    const displayDate = (isoDate) => {
        const el = document.getElementById("date");
        if (el) el.innerText = formatMonthYear(isoDate);
    };

    //show chat messages on screen
    //impure (changes DOM)
    const displayMessages = (msgs, user) => {
        const chat = document.querySelector(".chat");
        if (!chat) return;
        chat.innerHTML = "";
        renderMessages(msgs, user).forEach(div => chat.appendChild(div));
        chat.scrollTop = chat.scrollHeight;
    };

    //server communication
    const fetchMessages = () =>
        fetch("/messages").then(res => res.json());

    const sendMessage = (user, msg) =>
        fetch("/send", {
            method: "POST",
            headers: { "Content-Type": "application/x-www-form-urlencoded" },
            body: `user=${encodeURIComponent(user)}&message=${encodeURIComponent(msg)}`
        });

    //---Initialization and orchestration---

    //initialize user and color: resolve, save, and display
    const initUserAndColor = () => {
        const user = resolveValue(getUser(), askUsername);
        if (user) {
            setUser(user);
            displayUsername(user);
            displayDate(getUserDate());
        }

        const color = resolveValue(getColor(), askFavoriteColor);
        if (color) {
            setColor(color);
            displayColor(color);
        }
    };

    //attach hidden "user" field to the form before submit
    const attachUserToForm = () => {
        const form = document.querySelector(".chat-form");
        if (!form) return;

        form.addEventListener("submit", () => {
            form.querySelectorAll('input[name="user"]').forEach(i => i.remove());
            const input = document.createElement("input");
            input.type = "hidden";
            input.name = "user";
            input.value = getUser();
            form.appendChild(input);
        });
    };

    //handle chat form submit: send message and refresh chat
    const setupChatForm = () => {
        const form = document.querySelector(".chat-form");
        const input = document.querySelector(".chat-input");
        if (!form || !input) return;

        form.addEventListener("submit", (e) => {
            e.preventDefault();
            const msg = input.value.trim();
            if (!msg) return;
            sendMessage(getUser(), msg).then(() => {
                input.value = "";
                fetchMessages().then(msgs => displayMessages(msgs, getUser()));
            });
        });
    };

    //periodically refresh messages from server
    const startMessageUpdater = () => {
        setInterval(() => {
            fetchMessages().then(msgs => displayMessages(msgs, getUser()));
        }, 1000);
    };

    //start
    initUserAndColor();
    attachUserToForm();
    setupChatForm();
    startMessageUpdater();
});
