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
// ask user for their username using prompt
const askUsername = () => prompt("your username: "); 

// update DOM with the username
const displayUsername = user => document.getElementById("username").innerText = user; 

// chat container DOM element
const chat = document.querySelector(".chat");

// attach username to form on submit, so server receives it
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
// initialize user, ask if none saved, and update DOM
const initUser = () => {
  const user = resolveUser(getUser(), askUsername); // pure decision
  if (user) {
    setUser(user);          
    displayUsername(user);  
  }
};

// --- Send message to server ---
// event handler for form submit
function sendMessage(event){
    event.preventDefault(); 
    const user = getUser(); 
    const msg = document.querySelector(".chat-input").value; 
    
    // send message via POST request
    fetch("/send", {
        method: "POST",
        headers: {"Content-Type": "application/x-www-form-urlencoded"}, 
        body: `user=${encodeURIComponent(user)}&message=${encodeURIComponent(msg)}` 
    }).then(() => {
        document.querySelector(".chat-input").value = ""; 
        updateMessages();                                
    });
}

// --- Update chat messages ---
// fetch messages from server and update chat container
function updateMessages() {
    fetch("/messages")
    .then(res => res.text())       
    .then(html => chat.innerHTML = html); 
}

// attach sendMessage to chat form submit
document.querySelector(".chat-form").addEventListener("submit", sendMessage);

// refresh chat every second
setInterval(updateMessages, 1000);

// --- Initialize username and attach to form ---
initUser();    
attachUser();   