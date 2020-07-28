var usernameForm = document.querySelector("#usernameForm");
var messageForm = document.querySelector("#messageForm");
var messageInput = document.querySelector("#message");
var messageArea = document.querySelector("#messageArea");
var connectingElement = document.querySelector(".connecting");

var stompClient = null;
var username = null;

// Upon successful connection, the client subscribes to /topic/public destination and tells
// the user’s name to the server by sending a message to the /app/chat.addUser destination.
// snippet : func
function onConnected() {
  // The stompClient.subscribe() function takes a callback method which
  // is called whenever a message arrives on the subscribed topic.
  // connected to the controller/ChatController on backend
  stompClient.subscribe("/topic/public", onMessageReceived);

  // connected to the controller/ChatController addUser() method on backend
  stompClient.send(
    "/app/chat.addUser",
    {},
    // can be seen on web browser devtools
    JSON.stringify({ sender: username, type: "JOIN" })
  );
}

// snippet : func
function onError(error) {
  // connected to above connectingElement
  // will appear once server is disconnected
  connectingElement.textContent =
    "Could not connect to WebSocket server. Please refresh this page to try again";
  connectingElement.style.color = "red";
}

// The connect() function uses SockJS and stomp client to connect
// to the /ws endpoint that we configured in Spring Boot.
// snippet : func
function connect(event) {
  // getting the username from input tag
  username = document.querySelector("#name").value.trim();
  if (username) {
    // connected to the configuration/WebSocketConfig registerStompEndpoints() method on backend
    var socket = new SockJS("/ws");
    stompClient = Stomp.over(socket);

    //.connect(destination node, output, input)
    stompClient.connect({}, onConnected, onError);
  }
  // prevent web page refresh
  event.preventDefault();
}

// snippet : func
function onMessageReceived(payload) {
  var message = JSON.parse(payload.body);
  console.log(message);
  var messageElement = document.createElement("li");

  if (message.type === "JOIN") {
    message.content = message.sender + " joined";
  } else if (message.type === "LEAVE") {
    message.content = message.sender + " left";
  } else {
    var usernameElement = document.createElement("span");
    var usernameText = document.createTextNode(message.sender);
    // appending the sender on the created <span> tag
    usernameElement.appendChild(usernameText);
    // appending the sender on created <li> tag
    messageElement.appendChild(usernameElement);
    console.log("after if condition execution - now executing else condition");
  }

  var textElement = document.createElement("p");
  var messageText = document.createTextNode(message.content);
  // appending the message content on created <p> tag
  textElement.appendChild(messageText);
  // appending the <p> tag on <li> tag
  messageElement.appendChild(textElement);
  // appending the <li> tag on existing <ul> tag
  messageArea.appendChild(messageElement);
  // for scrolling
  messageArea.scrollTop = messageArea.scrollHeight;
}

// snippet : func
function sendMessage(event) {
  // messageInput is a var from above
  var messageContent = messageInput.value.trim();
  if (messageContent && stompClient) {
    var chatMessage = {
      sender: username,
      content: messageInput.value,
      type: "CHAT",
    };
    // connected to the controller/ChatController sendMessage() method on backend
    // can be seend on web browser devtools
    stompClient.send("/app/chat.sendMessage", {}, JSON.stringify(chatMessage));
    // clear input message
    messageInput.value = "";
  }
  // prevent web page refresh
  event.preventDefault();
}

// connected to above usernameForm which is form tag on username registration (see comment) on index.html
usernameForm.addEventListener("submit", connect, true);
messageForm.addEventListener("submit", sendMessage, true);

// data flow
// connect()
//   -> onError()
//   -> onConnected()
//       -> onMessageReceived()
// sendMessage()
