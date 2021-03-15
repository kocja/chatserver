let messages = [];

const storagePath = "/chat/user/local/";
const requestArray = ["http://localhost:5001/api/Users", "http://localhost:5001/api/Messages"]

function getAll() {
    Promise.all(requestArray.map((request) => {
        return fetch(request).then((response) => {
            return response.json();
        }).then((data) => {
            return data;
        });
    })).then((values) => {
        initData(values[0], values[1])
    }).catch(console.error.bind(console))
}

function initData(users, messages) {
    this.messages = messages;
    initUsers();
    initMessages();
}

// document.getElementById("submit").addEventListener("click", postMessage;

const addMessage = (ev) => {
    ev.preventDefault(); // Um das Abschicken des Formulars zu stoppen
    let message = {
        message: document.getElementById('message').value,
        user: localStorage.getItem(storagePath + "id")
    }
    const b = JSON.stringify({
        'user_id': localStorage.getItem(storagePath + 'id'),
        message: document.getElementById('message').value
    });
    console.log(b);
    fetch('http://localhost:5001/api/Messages', {
        headers: {
            'Accept': 'application/json',
            'Content-Type': 'application/json'
        },
        method: 'POST',
        body: b
    }).then(data => console.log(data));

    messages.push(message);
    document.forms[0].reset(); // Ausgefülltes Formular auf default zurücksetzen

    localStorage.setItem('MessageList', JSON.stringify(messages));
}
document.addEventListener('DOMContentLoaded', () => {
    const element = document.getElementById('submit');
    if (element) {
        element.addEventListener('click', addMessage);
    }
});

function startEventListener() {
    /*
    document.addEventListener('DOMContentLoaded', () => {
        document.getElementById('login').addEventListener('click', addUser)
    })
    */
}

function initMessages() {
    for (let i = 0; i < messages.length; i++) {
        addMessages(messages[i])
    }
}

function getUsersById(id) {
    for (let i = 0; i < users.length; i++) {
        if (users[i].id === id) {
            return users[i].nickname;
        }
    }


    return localStorage.getItem(storagePath + "id");
}

function addMessages(message) {

    let section = document.createElement("section");
    section.setAttribute("id", message.id);

    let userName = document.createElement("span");
    userName.appendChild(document.createTextNode(getUsersById(message.user_id)));
    console.log(message.user_id)
    section.appendChild(userName);

    let messageText = document.createElement("span");
    messageText.appendChild(document.createTextNode(message.message));
    section.appendChild(messageText);
    document.getElementById("messageList").appendChild(section);
}

function setNickname(nickname) {
    console.log("ES FUNKTIONIERT")
    localStorage.setItem(storagePath + "nickname", nickname)
}

function getNickname() {
    return (localStorage.getItem(storagePath + "nickname"));
}

function newInput() {
    let input = document.createElement("input");
    input.setAttribute("type", "text");
    input.setAttribute("value", getNickname());
    document.getElementById("nicknameInput").appendChild(input)
}

function putUser(id, nickname) {
    fetch('http://localhost:5001/api/Users' + id, {
        headers: {
            'Accept': 'application/json',
            'Content-Type': 'application/json'
        },
        method: 'PUT',
        body: JSON.stringify({"nickname": nickname, "status": "online"})
    }).then(function (response) {
        if (response.status === 200) {
            return response.json();
        } else {
            console.log("nicht 200")
        }
    }).then(function (json) {
        setLocalUser({"id": json["id"], "nickname": nickname});
        loginSuccesfully();
    }).catch(err => console.log("exc", err));
}

function startWebSocket() {
    const ws = new WebSocket('ws://localhost:5001/ws');

    ws.onerror = function (event) {
        console.error('WebSocket Error', event)
    }
    ws.onmessage = function (event) {
        console.log('I handle the message:');
        handleMessage(event.data);
    };
    ws.onopen = function (event) {
        const element = document.getElementById('pfooter');
        if (element) {
            element.innerHTML = 'Websocket connected!';
        }
        // Sende eine Nachricht an den Server, der Server wird diese danach einfach an alle verbundenen Clients zurückschicken (Echo).
        //ws.send('Hello World')
        // ws.send('I connected to the server');
    };
    ws.onclose = function (event) {
        const element = document.getElementById('pfooter');
        if (element) {
            element.innerHTML = 'Not connected!';
        }
    };
}


function updateUser(id) {
    id = getUsersById(id);
}

function handleMessage(input) {
    const jsonObject = JSON.parse(input);
    const action = jsonObject.action;
    switch (action) {
        case 'message_added':
            console.log('Message added:');
            console.log(jsonObject.data);
            break;
    }

    if (action === "user_updated") {
        updateUser({
            "id": jsonObject.data.id,
            "status": jsonObject.data.status,
            "avatar": jsonObject.data.avatar,
            "nickname": jsonObject.data.nickname
        });
    } else if (action === "user_deleted") {
        console.log("user_deleted noch nicht implementiert")
    } else {
        console.error("websocket - unbekannte Action")
    }
}

startWebSocket();


