/*
    Functional JavaScript
    developed by: Francisco Passos
    developed in: 04/09/2025
    modified in: 05/09/2025
*/

// Load the JavaScript after the HTML is ready
document.addEventListener("DOMContentLoaded", () => {
    //------Pure Functions-----

    //pure function: formats an ISO date string into "Month Year"
    const formatMonthYear = (isoDate) => {
        if (!isoDate) return "";
        const date = new Date(isoDate);
        return `${date.toLocaleString("default", { month: "long" })} ${date.getFullYear()}`;
    };

    //higher-order pure function: returns existing value or calls fallback function
    const resolveValue = (existing, askFn) => existing || askFn();

    //pure function: checks if new messages arrived
    const hasNewMessages = (prevMsgs, newMsgs) => newMsgs.length > prevMsgs.length;

    //pure function: creates DOM elements for messages but does not update DOM itself
    const renderMessages = (msgs, user) =>
        msgs.map(m => {
            const div = document.createElement("div");
            const isMine = m.text.startsWith(user + ":");
            div.className = isMine ? "my-message chat-bubble" : "other-message chat-bubble";
    
            if (isMine) {
                div.innerText = m.text.replace(user + ":", "").trim();
            } else {
                const container = document.createElement("div");
                container.style.display = "flex";
                container.style.alignItems = "flex-start";
                container.style.gap = "10px";
    
                const avatar = document.createElement("img");
                avatar.src = "images/icons/icon_user_purple.png";
                avatar.alt = "User Avatar";
                avatar.style.width = "80px";
                avatar.style.height = "80px";
                avatar.style.borderRadius = "15%";
    
                const msgDiv = document.createElement("div");
                msgDiv.className = "other-message chat-bubble";
                msgDiv.innerText = m.text;
    
                container.appendChild(avatar);
                container.appendChild(msgDiv);
    
                return container;
            }
            return div;
        });

    //-----Impure Functions (have side effects, manipulate DOM, localStorage, network)------

    //localStorage getters (impure: read from storage)
    const getUser = () => localStorage.getItem("chatUser") || "";
    const getColor = () => localStorage.getItem("favoriteColor") || "";
    const getUserDate = () => localStorage.getItem("chatUserDate") || "";

    //localStorage setters (impure: write to storage)
    const setUser = (user) => {
        localStorage.setItem("chatUser", user);
        if (!localStorage.getItem("chatUserDate")) {
            localStorage.setItem("chatUserDate", new Date().toISOString());
        }
    };
    const setColor = (color) => localStorage.setItem("favoriteColor", color);

    //prompt user input (impure: user interaction)
    const askUsername = () => prompt("Your username: ");
    const askFavoriteColor = () => prompt("Your favorite color: ");

    //DOM update functions (impure: side effects)
    const displayUsername = (user) => {
        const el = document.getElementById("username");
        if (el) el.innerText = user;
    };

    const displayColor = (color) => {
        const el = document.getElementById("favoriteColor");
        if (el) el.innerText = color;
    };

    const displayDate = (isoDate) => {
        const el = document.getElementById("date");
        if (el) el.innerText = formatMonthYear(isoDate);
    };

    //functional, impure: renders messages and updates the scroll only if new messages exist
    const displayMessagesFunctional = (prevMsgs, newMsgs, user) => {
        const chat = document.querySelector(".chat");
        if (!chat) return prevMsgs; // returns previous state if chat does not exist

        chat.innerHTML = "";
        renderMessages(newMsgs, user).forEach(div => chat.appendChild(div));

        if (hasNewMessages(prevMsgs, newMsgs)) {
            chat.scrollTop = chat.scrollHeight; // DOM mutation
        }

        //returns new state (immutable approach)
        return newMsgs; 
    };

    //-----Network / Server Communication (impure: network side effects)-----
    const fetchMessages = () =>
        fetch("/messages").then(res => res.json());

    const sendMessage = (user, msg) =>
        fetch("/send", {
            method: "POST",
            headers: { "Content-Type": "application/x-www-form-urlencoded" },
            body: `user=${encodeURIComponent(user)}&message=${encodeURIComponent(msg)}`
        });

    //-----Orchestration / Initialization-----

    //initialize user and color: resolve values, save, and display (impure)
    const initUserAndColor = () => {
        const user = resolveValue(getUser(), askUsername); // higher-order function
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

    //attach hidden "user" field to form before submit (impure)
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

    //handle chat form submit: send message and refresh chat (impure)
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
                fetchMessages().then(msgs => {
                    currentMessages = displayMessagesFunctional(currentMessages, msgs, getUser());
                });
            });
        });
    };
    
    //periodically refresh messages from server (impure: side effect + functional state handling)
    const startMessageUpdater = () => {
        setInterval(() => {
            fetchMessages().then(msgs => {
                currentMessages = displayMessagesFunctional(currentMessages, msgs, getUser());
            });
        }, 1000);
    };

    //start
    initUserAndColor();
    attachUserToForm();
    setupChatForm();
    startMessageUpdater();

});
