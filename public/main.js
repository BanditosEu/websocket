const socket = io(); // Initialiseert de verbinding met de WebSocket server

// Selecteer HTML elementen
const clientsTotal = document.getElementById('client-total');
const messageContainer = document.getElementById('message-container');
const nameInput = document.getElementById('name-input');
const messageForm = document.getElementById('message-form');
const messageInput = document.getElementById('message-input');

const messageTone = new Audio('/message-tone.mp3'); // Geluidsbestand voor nieuwe berichten

// Voorkom standaard actie en stuur bericht bij formulier inzending
messageForm.addEventListener('submit', (e) => {
    e.preventDefault();
    sendMessage();
});

// Update het aantal clients in de chat
socket.on('clients-total', (data) => {
    clientsTotal.innerText = `Aantal in chat: ${data}`;
});

// Stuur bericht naar server
function sendMessage() {
    if (messageInput.value === '') return; // Stuur geen leeg bericht
    const data = {
        name: nameInput.value,
        message: messageInput.value,
        dateTime: new Date(), // Huidige datum en tijd
    };
    socket.emit('message', data); // Verzend bericht naar server
    addMessageToUI(true, data); // Voeg bericht toe aan UI
    messageInput.value = ''; // Leeg het invoerveld
}

// Ontvang bericht van andere clients
socket.on('chat-message', (data) => {
    messageTone.play(); // Speel geluid af bij nieuw bericht
    addMessageToUI(false, data); // Voeg bericht toe aan UI
});

// Voeg bericht toe aan de UI
function addMessageToUI(isOwnMessage, data) {
    clearFeedback(); // Wis typ-indicatie
    const element = `
        <li class="${isOwnMessage ? 'message-right' : 'message-left'}">
            <p class="message">
              ${data.message}
              <span>${data.name} ● ${moment(data.dateTime).fromNow()}</span>
            </p>
        </li>
    `;
    messageContainer.innerHTML += element; // Voeg nieuw bericht toe aan message container
    scrollToBottom(); // Scroll naar onderkant van de chat
}

// Scroll naar onderkant van de chat
function scrollToBottom() {
    messageContainer.scrollTo(0, messageContainer.scrollHeight);
}

// Typ-indicatie verzenden
messageInput.addEventListener('focus', (e) => {
    socket.emit('feedback', {
      feedback: `✍️ ${nameInput.value} is typing a message`,
    });
});

// Typ-indicatie bij elke toetsaanslag
messageInput.addEventListener('keypress', (e) => {
    socket.emit('feedback', {
      feedback: `✍️ ${nameInput.value} is typing a message`,
    });
});

// Wis typ-indicatie bij verlies van focus
messageInput.addEventListener('blur', (e) => {
    socket.emit('feedback', {
      feedback: '',
    });
});

// Ontvang typ-indicatie van andere clients
socket.on('feedback', (data) => {
    clearFeedback(); // Wis vorige typ-indicatie
    const element = `
          <li class="message-feedback">
            <p class="feedback" id="feedback">${data.feedback}</p>
          </li>
    `;
    messageContainer.innerHTML += element; // Voeg typ-indicatie toe aan message container
});

// Wis typ-indicaties
function clearFeedback() {
    document.querySelectorAll('li.message-feedback').forEach((element) => {
      element.parentNode.removeChild(element); // Verwijder feedback element
    });
}
