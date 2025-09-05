document.addEventListener("DOMContentLoaded", () => {
    const getUser = () => localStorage.getItem("chatUser") || "";
    const getColor = () => localStorage.getItem("favoriteColor") || "";

    const setUser = user => {
        localStorage.setItem("chatUser", user);
        if (!localStorage.getItem("chatUserDate")) {
            localStorage.setItem("chatUserDate", new Date().toISOString());
        }
    };

    const setColor = color => localStorage.setItem("favoriteColor", color);

    const resolveUser = (existingUser, askFn) => existingUser || askFn();
    const resolveColor = (existingColor, askFn) => existingColor || askFn();

    const askUsername = () => prompt("Your username: "); 
    const askFavoriteColor = () => prompt("Your favorite color: ");

    const displayUsername = user => document.getElementById("username").innerText = user;
    const displayColor = color => document.getElementById("favoriteColor").innerText = color;

    const getUserSavedMonthYear = () => {
        const saved = localStorage.getItem("chatUserDate");
        if (!saved) return "";
        const date = new Date(saved);
        return `${date.toLocaleString("default",{month:"long"})} ${date.getFullYear()}`;
    };

    const initUserAndColor = () => {
        const user = resolveUser(getUser(), askUsername);
        if (user) {
            setUser(user);
            displayUsername(user);
            const dateElem = document.getElementById("date");
            if (dateElem) dateElem.innerText = getUserSavedMonthYear();
        }

        const color = resolveColor(getColor(), askFavoriteColor);
        if (color) {
            setColor(color);
            displayColor(color);
        }
    };

    const attachUser = () => {
        const form = document.querySelector(".chat-form");
        form.addEventListener("submit", () => {
            form.querySelectorAll('input[name="user"]').forEach(i => i.remove());
            const input = document.createElement("input");
            input.type = "hidden";
            input.name = "user";
            input.value = getUser();
            form.appendChild(input);
        });
    };

    const updateMessages = () => {
        fetch("/messages")
            .then(res => res.json())
            .then(msgs => {
                const chat = document.querySelector(".chat"); 
                chat.innerHTML = "";
                msgs.forEach(m => {
                    const div = document.createElement("div");
                    const isMine = m.text.startsWith(getUser() + ":");
                    div.className = isMine ? "my-message chat-bubble" : "other-message chat-bubble";
                    div.innerText = m.text;
                    // não usamos mais div.style.backgroundColor
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

    initUserAndColor();
    attachUser();
    updateMessages();
    setInterval(updateMessages, 1000);
});
