/*
    Functional JavaScript
    developed by: Francisco Passos
    devoleped in: 04/09/2025

    modified in: 09/09/2025
*/

//load the Java Script after the HTML is ready
document.addEventListener("DOMContentLoaded", () => {
    // Format ISO date -> "Month Year"
    const formatMonthYear = (isoDate) => {
        if (!isoDate) return "";
        const date = new Date(isoDate);
        return `${date.toLocaleString("default", { month: "long" })} ${date.getFullYear()}`;
    };

    // available avatar color options
    const options = ["aqua-green", "black", "orange", "pink", "purple", "red", "blue", "white"];
    
    //fallback if choice is invalid
    const defaultChoice = "aqua-green";

    //check if choice is valid
    const isValidChoice = (choice) =>
    choice && options.includes(choice.toLowerCase());

    //alert result of choice or fallback
    const showResult = (choice) =>
    alert(
        isValidChoice(choice)
            ? `You chose the avatar: ${choice}`
            : `Invalid option. Using default avatar (${defaultChoice}).`
    );

    //update avatar image and save in localStorage
    const updateAvatarImage = (choice) => {
        const img = document.getElementById("avatarImg");
        const validChoice = isValidChoice(choice) ? choice : defaultChoice;
        img.src = `images/icons/icon_user_${validChoice}.png`;
    
        setAvatar(`images/icons/icon_user_${validChoice}.png`);
    };   

    //return existing value or call fallback function
    const resolveValue = (existing, askFn) => existing || askFn();

    //save the atual chat state 
    let currentMessages = [];

    //render chat messages as <div> elements
    const renderMessages = (msgs, user) =>
        msgs.map(m => {
            const isMine = m.user === user; 
            const div = document.createElement("div");
            div.className = isMine ? "my-message chat-bubble" : "other-message chat-bubble";
    
            if (isMine) {
                div.innerText = m.text;
            } else {
                const container = document.createElement("div");
                container.style.display = "flex";
                container.style.alignItems = "flex-start";
                container.style.gap = "10px";
    
                const avatar = document.createElement("img");
                avatar.src = m.avatar || "images/icons/icon_user_purple.png";
                avatar.alt = "User Avatar";
                avatar.style.width = "80px";
                avatar.style.height = "80px";
                avatar.style.borderRadius = "15%";
    
                avatar.addEventListener("click", () => {
                    const since = new Date(m.date); 
                    alert(`User: ${m.user} 
Favorite Color: ${m.color}
Since: ${since.toLocaleString("default", { month: "long", year: "numeric" })}`);
                });
    
                //create message bubble for other user
                const msgDiv = document.createElement("div");
                msgDiv.className = "other-message chat-bubble";
                msgDiv.innerText = `${m.user}: 
                                    ${m.text}`;

                // add avatar + message to container
                container.appendChild(avatar);
                container.appendChild(msgDiv);
                return container;
            }
            return div;
        });
    
    
    //localStorage getters
    const getUser = () => localStorage.getItem("chatUser") || ""; //username
    const getColor = () => localStorage.getItem("favoriteColor") || ""; //favorite color 
    const getUserDate = () => localStorage.getItem("chatUserDate") || ""; //date
    const getAvatar = () => localStorage.getItem("chatAvatar") || ""; //avatar

    //localStorage setters
    const setUser = (user) => { //username
        localStorage.setItem("chatUser", user);
        if (!localStorage.getItem("chatUserDate")) {
            localStorage.setItem("chatUserDate", new Date().toISOString());
        }
    };
    const setColor = (color) => localStorage.setItem("favoriteColor", color); //favorite color
    const setAvatar = (avatar) => localStorage.setItem("chatAvatar", avatar); //avatar

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

    //sends a message to the server with the given user, message, color, since and avatar choose
    const sendMessage = (user, msg, color, since) => 
        fetch("/send", {
            method: "POST",
            headers: { "Content-Type": "application/x-www-form-urlencoded" },
            body: `user=${encodeURIComponent(user)}&message=${encodeURIComponent(msg)}&color=${encodeURIComponent(color)}&date=${encodeURIComponent(since)}&avatar=${encodeURIComponent(getAvatar())}`
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
    
    //initialize avatar user: resolve, save and display
    const initAvatar = () => {
        const savedAvatar = getAvatar();
        if (savedAvatar) {
            const choice = savedAvatar.split("icon_user_")[1].replace(".png", "");
            document.getElementById("avatarChoice").value = choice;
            updateAvatarImage(choice);
        } else {
            updateAvatarImage(defaultChoice);
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

    const select = document.getElementById("avatarChoice");
    if (select) {
        select.addEventListener("change", (e) => {
            updateAvatarImage(e.target.value);
    });
}

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
    initAvatar();
    attachUserToForm();
    setupChatForm();
    startMessageUpdater();
});
