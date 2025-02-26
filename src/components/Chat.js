import React, { useState, useEffect } from "react";
import io from "socket.io-client";

const socket = io("http://localhost:3000"); // Conectar ao backend Node.js

const Chat = () => {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  const [selectedAtendente, setSelectedAtendente] = useState("");

  useEffect(() => {
    socket.on("mensagemRecebida", (mensagem) => {
      setMessages((prev) => [...prev, mensagem]);
    });
  }, []);

  const sendMessage = () => {
    if (input.trim() && selectedAtendente) {
      const mensagem = { texto: input, atendente: selectedAtendente };
      socket.emit("enviarMensagem", mensagem);
      setMessages((prev) => [...prev, mensagem]);
      setInput("");
    } else {
      alert("Escolha um atendente e digite uma mensagem.");
    }
  };

  return (
    <div style={{ maxWidth: "400px", margin: "auto", textAlign: "center" }}>
      <h2>Chatbot - Arena Cred Consignado</h2>

      {/* Selecionar Atendente */}
      <select onChange={(e) => setSelectedAtendente(e.target.value)} value={selectedAtendente}>
        <option value="">Escolha um atendente</option>
        <option value="Mariana">Mariana</option>
        <option value="Tainara">Tainara</option>
        <option value="Erika">Erika</option>
      </select>

      {/* Exibir Mensagens */}
      <div style={{ border: "1px solid #ccc", padding: "10px", height: "300px", overflowY: "scroll", marginTop: "10px" }}>
        {messages.map((msg, index) => (
          <p key={index}><strong>{msg.atendente}:</strong> {msg.texto}</p>
        ))}
      </div>

      {/* Campo de entrada */}
      <input
        type="text"
        value={input}
        onChange={(e) => setInput(e.target.value)}
        placeholder="Digite sua mensagem..."
        style={{ width: "80%", padding: "5px", marginTop: "10px" }}
      />
      <button onClick={sendMessage} style={{ padding: "5px 10px", marginLeft: "5px" }}>Enviar</button>
    </div>
  );
};

export default Chat;
