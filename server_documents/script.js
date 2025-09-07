/*
    Functional JavaScript
    developed by: Francisco Passos
    devoleped in: 04/09/2025

    modified in: 07/09/2025
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

    //save the atual chat state 
    let currentMessages = [];

    //render chat messages as <div> elements
    const renderMessages = (msgs, user) =>
        msgs.map(m => {
            const isMine = m.user === user; //isMine === "I am"
            const div = document.createElement("div");
            div.className = isMine ? "my-message chat-bubble" : "other-message chat-bubble";

            //responsible for showing how the message should be loaded depending on who sends it
            if (isMine) {
                div.innerText = m.text;
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

                //display user information when clickin on the avatar
                avatar.addEventListener("click", () => {
                    const since = new Date(m.date * 1000);
//user information - username - favorite color - first login                  
alert(`User: ${m.user} 
Favorite Color: ${m.color}
Since: ${since.toLocaleString("default", { month: "long", year: "numeric" })}`);
                });

                //message from (another) user
                //------------->(medium) :o
                const msgDiv = document.createElement("div");
                msgDiv.className = "other-message chat-bubble";
                msgDiv.innerText = `${m.user}: ${m.text}`;

                container.appendChild(avatar);
                container.appendChild(msgDiv);
                return container;
            }
            return div; //display messages
        });

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

    //check for new messages
    const hasNewMessages = (prevMsgs, newMsgs) => newMsgs.length > prevMsgs.length;

    //Função funcional para renderizar e atualizar chat
    const displayMessagesFunctional = (prevMsgs, newMsgs, user) => {
        const chat = document.querySelector(".chat");
        //returns previous state if chat does not exist
        if (!chat) return prevMsgs; 

        //render messages
        chat.innerHTML = "";
        renderMessages(newMsgs, user).forEach(div => chat.appendChild(div));

        //refreshs the scroll only if there are new messages
        if (hasNewMessages(prevMsgs, newMsgs)) {
            chat.scrollTop = chat.scrollHeight;
        }
        //returns the new state (new set of messages)
        return newMsgs;
    };

    //server communication
    const fetchMessages = () =>
        fetch("/messages").then(res => res.json());

    //sends a message to the server with the given user, message, color, and since
    const sendMessage = (user, msg, color, since) => 
        fetch("/send", {
            method: "POST",
            headers: { "Content-Type": "application/x-www-form-urlencoded" },
            body: `user=${encodeURIComponent(user)}&message=${encodeURIComponent(msg)}&color=${encodeURIComponent(color)}&date=${encodeURIComponent(since)}`
        });

    //initialize user and color: resolve, save, and display
    const initUserAndColor = () => {
        const user = resolveValue(getUser(), askUsername);
        if (user) {
            setUser(user);
            displayUsername(user);
            displayDate(getUserDate());
        }
    
        let color = resolveValue(getColor(), askFavoriteColor);
        if (color) {
            setColor(color);
            displayColor(color);
        } else {
            color = askFavoriteColor();
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
    
    //handle chat form submit: send message and refresh chat
    const setupChatForm = () => {
        const form = document.querySelector(".chat-form");
        const input = document.querySelector(".chat-input");
        if (!form || !input) return;

        form.addEventListener("submit", (e) => {
            e.preventDefault();
            const msg = input.value.trim();
            if (!msg) return;

            const color = getColor(); 
            const since = getUserDate(); 
            sendMessage(getUser(), msg, color, since).then(() => {
                input.value = "";
                fetchMessages().then(msgs => {
                    currentMessages = displayMessagesFunctional(currentMessages, msgs, getUser());
                });
            });
        });         
    };
    
    //periodically refresh messages from server
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
