const { Client, LocalAuth } = require('whatsapp-web.js');
const qrcode = require('qrcode-terminal');
const axios = require('axios');

// Lista de atendentes com suas respectivas instâncias do bot
const atendentes = ["Mariana", "Tainara", "Erika"];
const bots = {};
const clientesAtendentes = {}; // Mapeia clientes para atendentes

// Criando uma instância do bot para cada atendente
atendentes.forEach(atendente => {
    bots[atendente] = new Client({
        authStrategy: new LocalAuth({ clientId: atendente }) // Cada atendente tem sua própria autenticação
    });

    bots[atendente].on('qr', qr => {
        console.log(`📸 Escaneie o QR Code para conectar o bot da atendente ${atendente}:`);
        qrcode.generate(qr, { small: true });
    });

    bots[atendente].on('ready', () => {
        console.log(`✅ Bot do WhatsApp da atendente ${atendente} conectado!`);
    });

    bots[atendente].on('message', async (message) => {
        const userMessage = message.body.trim().toLowerCase();
        const userId = message.from;

        console.log(`📩 [${atendente}] Mensagem de ${userId}: ${message.body}`);

        // Se o cliente já escolheu uma atendente, todas as mensagens devem ser encaminhadas para ela
        if (clientesAtendentes[userId] && clientesAtendentes[userId] !== atendente) {
            return; // Ignora mensagens para bots errados
        }

        if (!clientesAtendentes[userId]) {
            // Se ainda não tem atendente, mostra opções
            if (userMessage === 'oi' || userMessage === 'olá') {
                await message.reply(
                    `👋 Olá! Seja bem-vindo(a) à *Arena Cred Consignado*!  
💰 Somos especialistas em crédito consignado e estamos prontos para te ajudar!  

📌 No que posso te ajudar? Escolha uma opção:  
1️⃣ Simulação de crédito  
2️⃣ Informações sobre empréstimos  
3️⃣ Falar com uma atendente`
                );
                return;
            }

            if (userMessage === '3' || userMessage === '3️⃣') {
                await message.reply(
                    `👩‍💼 Escolha uma atendente digitando o número correspondente:  
1️⃣ Mariana  
2️⃣ Tainara  
3️⃣ Erika`
                );
                return;
            }

            if (['mariana', '1', '1️⃣'].includes(userMessage)) {
                await redirecionarParaAtendente(message, 'Mariana');
                return;
            }

            if (['tainara', '2', '2️⃣'].includes(userMessage)) {
                await redirecionarParaAtendente(message, 'Tainara');
                return;
            }

            if (['erika', '3', '3️⃣'].includes(userMessage)) {
                await redirecionarParaAtendente(message, 'Erika');
                return;
            }
        } else {
            // O cliente já escolheu uma atendente, todas as mensagens são encaminhadas
            await encaminharMensagemAtendente(userId, mensagem, atendente);
        }
    });

    bots[atendente].initialize();
});

// Função para redirecionar cliente para a atendente escolhida
async function redirecionarParaAtendente(message, nome_atendente) {
    const userId = message.from;
    clientesAtendentes[userId] = nome_atendente; // Salva a escolha do cliente

    try {
        const response = await axios.post('http://localhost:5000/escolher_atendente', {
            nome_cliente: userId,
            nome_atendente
        });

        await message.reply(`✅ Você foi direcionado para a atendente *${nome_atendente}*.\nAguarde, ela responderá em breve.`);
    } catch (error) {
        await message.reply('❌ Ocorreu um erro ao tentar escolher a atendente.');
    }
}

// Função para encaminhar mensagens do cliente para a atendente correta
async function encaminharMensagemAtendente(userId, mensagem, atendente) {
    try {
        await bots[atendente].sendMessage(userId, `📩 *Atendente ${atendente}*: ${mensagem}`);
    } catch (error) {
        console.error(`Erro ao encaminhar mensagem para ${atendente}:`, error);
    }
}

// Instância principal do bot que gerencia as interações iniciais com o cliente
const client = new Client({
    authStrategy: new LocalAuth()
});

client.on('qr', qr => {
    console.log('📸 Escaneie o QR Code abaixo para conectar o bot principal:');
    qrcode.generate(qr, { small: true });
});

client.on('ready', () => {
    console.log('✅ Bot principal do WhatsApp conectado!');
});

client.on('message', async (message) => {
    const userMessage = message.body.trim().toLowerCase(); // Remove espaços extras e coloca em minúsculas
    const userId = message.from;

    // Verifica a saudação inicial
    if (userMessage === 'oi' || userMessage === 'olá') {
        await message.reply(
            `👋 Olá! Seja bem-vindo(a) à *Arena Cred Consignado*!  
💰 Somos especialistas em crédito consignado e estamos prontos para te ajudar!  

📌 No que posso te ajudar? Escolha uma opção:  
1️⃣ Simulação de crédito  
2️⃣ Informações sobre empréstimos  
3️⃣ Falar com uma atendente`
        );
        return;
    }

    // Opção 3 - Falar com uma atendente
    if (userMessage === '3' || userMessage === '3️⃣') {
        await message.reply(
            `👩‍💼 Escolha uma atendente digitando o número correspondente:  
1️⃣ Mariana  
2️⃣ Tainara  
3️⃣ Erika`
        );
        return;
    }

    // Escolha de atendente
    if (['mariana', '1', '1️⃣'].includes(userMessage)) {
        await redirecionarParaAtendente(message, 'Mariana');
        return;
    }

    if (['tainara', '2', '2️⃣'].includes(userMessage)) {
        await redirecionarParaAtendente(message, 'Tainara');
        return;
    }

    if (['erika', '3', '3️⃣'].includes(userMessage)) {
        await redirecionarParaAtendente(message, 'Erika');
        return;
    }
});

client.initialize();
