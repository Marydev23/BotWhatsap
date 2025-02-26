const express = require('express');
const http = require('http');
const socketIo = require('socket.io');
const axios = require('axios');

const app = express();
const server = http.createServer(app);
const io = socketIo(server);

// Configurações do backend Flask
const FLASK_API_URL = 'http://127.0.0.1:5000'; // Altere para o endereço do seu backend Flask

app.use(express.static('public')); // Para servir arquivos estáticos (se necessário)

// Conectar-se ao socket
io.on('connection', (socket) => {
  console.log('Novo cliente conectado');

  // Escutar mensagens do cliente
  socket.on('message', async (data) => {
    console.log('Mensagem recebida: ', data);

    // Enviar a mensagem para o backend Flask para processamento
    try {
      const response = await axios.post(`${FLASK_API_URL}/process_message`, {
        message: data.message,
        atendente: data.atendente,
      });

      // Enviar a resposta do backend de volta para o cliente
      socket.emit('response', response.data);
    } catch (error) {
      console.error('Erro ao se comunicar com o backend:', error);
      socket.emit('response', { text: 'Erro no servidor, tente novamente mais tarde.' });
    }
  });

  // Desconectar cliente
  socket.on('disconnect', () => {
    console.log('Cliente desconectado');
  });
});

// Iniciar o servidor
const PORT = 3000;
server.listen(PORT, () => {
  console.log(`Servidor rodando em http://localhost:${PORT}`);
});
