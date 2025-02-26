from flask import Flask, request, jsonify
from database import session, Cliente, Atendente

app = Flask(__name__)

# Mensagem inicial do chatbot
@app.route("/start", methods=["POST"])
def start_chat():
    data = request.get_json()
    nome_cliente = data.get("nome")

    # Criar um novo cliente se não existir
    cliente = session.query(Cliente).filter_by(nome=nome_cliente).first()
    if not cliente:
        cliente = Cliente(nome=nome_cliente)
        session.add(cliente)
        session.commit()

    return jsonify({
        "mensagem": f"Olá {nome_cliente}, bem-vindo à Arena Cred Consignado! Com qual atendente deseja falar? (Mariana, Tainara ou Erika)"
    })

# Cliente escolhe o atendente
@app.route("/escolher_atendente", methods=["POST"])
def escolher_atendente():
    data = request.get_json()
    nome_cliente = data.get("nome_cliente")
    nome_atendente = data.get("nome_atendente")

    # Verificar se atendente existe
    atendente = session.query(Atendente).filter_by(nome=nome_atendente).first()
    if not atendente:
        return jsonify({"erro": "Atendente não encontrado!"}), 400

    # Associar cliente ao atendente
    cliente = session.query(Cliente).filter_by(nome=nome_cliente).first()
    if not cliente:
        return jsonify({"erro": "Cliente não encontrado!"}), 400

    cliente.atendente_id = atendente.id
    session.commit()

    return jsonify({
        "mensagem": f"Você foi direcionado para {nome_atendente}. Aguarde o atendimento."
    })

# Cliente envia mensagem
@app.route("/enviar_mensagem", methods=["POST"])
def enviar_mensagem():
    data = request.get_json()
    nome_cliente = data.get("nome_cliente")
    mensagem = data.get("mensagem")

    cliente = session.query(Cliente).filter_by(nome=nome_cliente).first()
    if not cliente or not cliente.atendente_id:
        return jsonify({"erro": "Nenhum atendente foi selecionado!"}), 400

    atendente = session.query(Atendente).filter_by(id=cliente.atendente_id).first()
    return jsonify({
        "mensagem": f"Mensagem enviada para {atendente.nome}: {mensagem}"
    })

if __name__ == "__main__":
    app.run(debug=True)
