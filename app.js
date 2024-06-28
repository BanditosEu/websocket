const express = require('express'); // Importeer Express module
const path = require('path'); // Importeer path module voor bestands- en directorypaden
const app = express(); // Initialiseer Express applicatie
const PORT = process.env.PORT || 4000; // Stel de poort in waarop de server luistert
const server = app.listen(PORT, () => console.log(`💬 server on port ${PORT}`)); // Start de server

const io = require('socket.io')(server); // Initialiseer Socket.IO en verbind het met de server

app.use(express.static(path.join(__dirname, 'public'))); // Configureer de server om statische bestanden te serveren

let socketsConnected = new Set(); // Maak een Set om unieke socket-ID's van verbonden clients op te slaan

io.on('connection', onConnected); // Stel een event handler in voor nieuwe verbindingen

// Handler voor nieuwe verbindingen
function onConnected(socket) {
    console.log(socket.id); 
    socketsConnected.add(socket.id); 

    io.emit('clients-total', socketsConnected.size); // Stuur het totaal aantal verbonden clients naar alle clients

    // Handler voor verbroken verbindingen
    socket.on('disconnect', () => {
        console.log('Socket disconnected', socket.id);
        socketsConnected.delete(socket.id); // Verwijder socket-ID uit de Set
        io.emit('clients-total', socketsConnected.size); // Stuur het bijgewerkte aantal verbonden clients naar alle clients
    });

    // Handler voor ontvangen berichten
    socket.on('message', (data) => {
        console.log(data); 
        socket.broadcast.emit('chat-message', data); // Stuur bericht naar alle andere verbonden clients
    });

    // Handler voor typ-indicaties
    socket.on('feedback', (data) => {
        socket.broadcast.emit('feedback', data); // Stuur typ-indicatie naar alle andere verbonden clients
    });
}
