import React, { useState } from 'react';
import io from 'socket.io-client';

const socket = io('http://localhost:3000');

function App() {
  const [message, setMessage] = useState('');
  const [messages, setMessages] = useState([]);
  const [selectedAttendant, setSelectedAttendant] = useState('');

  const sendMessage = () => {
    socket.emit('chat message', { message, attendant: selectedAttendant });
    setMessages([...messages, { message, attendant: selectedAttendant }]);
    setMessage('');
  };

  socket.on('chat message', (data) => {
    setMessages([...messages, data]);
  });

  return (
    <div>
      <h1>Chatbot - Arena Cred Consignado</h1>
      {!selectedAttendant && (
        <div>
          <button onClick={() => setSelectedAttendant('Mariana')}>Mariana</button>
          <button onClick={() => setSelectedAttendant('Tainara')}>Tainara</button>
          <button onClick={() => setSelectedAttendant('Erika')}>Erika</button>
        </div>
      )}
      {selectedAttendant && (
        <div>
          <h2>Você está conversando com {selectedAttendant}</h2>
          <div>
            {messages.map((msg, index) => (
              <div key={index}>
                <strong>{msg.attendant}: </strong>{msg.message}
              </div>
            ))}
          </div>
          <input
            type="text"
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            placeholder="Digite sua mensagem"
          />
          <button onClick={sendMessage}>Enviar</button>
        </div>
      )}
    </div>
  );
}

export default App;
