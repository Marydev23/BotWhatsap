const { Client, LocalAuth } = require('whatsapp-web.js');
const qrcode = require('qrcode-terminal');
const axios = require('axios');

// Lista de atendentes com suas respectivas instâncias do bot
const atendentes = ["Mariana", "Tainara", "Erika"];
const bots = {};
const clientesAtendentes = {}; // Mapeia clientes para atendentes

// Controle de QR Codes gerados para cada instância do bot
const qrCodeGerado = {
    main: false, // Bot principal
    Mariana: false, // QR Code para Mariana
    Tainara: false, // QR Code para Tainara
    Erika: false // QR Code para Erika
};

// Função para criar instância do bot para cada atendente
atendentes.forEach(atendente => {
    if (!bots[atendente]) {
        bots[atendente] = new Client({
            authStrategy: new LocalAuth({ clientId: atendente }) // Cada atendente tem sua própria autenticação
        });

        bots[atendente].on('qr', qr => {
            // Gera o QR Code para a atendente apenas uma vez
            if (!qrCodeGerado[atendente]) {
                console.log(`📸 Escaneie o QR Code para conectar o bot da atendente ${atendente}:`);
                qrcode.generate(qr, { small: true });
                qrCodeGerado[atendente] = true; // Impede gerar o QRCode novamente
            }
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

            // Se o cliente já escolheu atendente, permite que as mensagens sejam encaminhadas
            if (clientesAtendentes[userId]) {
                await encaminharMensagemAtendente(userId, message.body, atendente);
            } else {
                // O cliente ainda não escolheu atendente, exibe as opções iniciais
                await exibirOpcoesDeAtendimento(message);
            }
        });

        bots[atendente].initialize(); // Inicializa o bot da atendente
    }
});

// Instância principal do bot que gerencia as interações iniciais com o cliente
const client = new Client({
    authStrategy: new LocalAuth()
});

client.on('qr', qr => {
    // Gera o QR Code para o bot principal apenas uma vez
    if (!qrCodeGerado.main) {
        console.log('📸 Escaneie o QR Code abaixo para conectar o bot principal:');
        qrcode.generate(qr, { small: true });
        qrCodeGerado.main = true; // Impede gerar o QRCode novamente
    }
});

client.on('ready', () => {
    console.log('✅ Bot principal do WhatsApp conectado!');
});

client.on('message', async (message) => {
    const userMessage = message.body.trim().toLowerCase();
    const userId = message.from;

    console.log(`📩 Mensagem recebida de ${userId}: ${message.body}`);

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

    // Opção 1 - Simulação de crédito
    if (userMessage === '1' || userMessage === '1️⃣') {
        await message.reply('📊 Para simulação de crédito, por favor, informe seu *CPF* e a quantidade desejada.');
        return;
    }

    // Opção 2 - Informações sobre empréstimos
    if (userMessage === '2' || userMessage === '2️⃣') {
        await message.reply('ℹ️ Nossos empréstimos são consignados, com taxas especiais para aposentados, pensionistas, FGTS, Bolsa Família e servidores públicos. Se desejar mais informações, por favor, entre em contato com um de nossos atendentes!');
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

// Função para exibir as opções iniciais quando o cliente ainda não escolheu um atendente
async function exibirOpcoesDeAtendimento(message) {
    await message.reply(
        `👋 Olá! Seja bem-vindo(a) à *Arena Cred Consignado*!
💰 Somos especialistas em crédito consignado e estamos prontos para te ajudar!

📌 No que posso te ajudar? Escolha uma opção:  
1️⃣ Simulação de crédito  
2️⃣ Informações sobre empréstimos  
3️⃣ Falar com uma atendente`
    );
}

// Inicializa o bot principal
client.initialize();
