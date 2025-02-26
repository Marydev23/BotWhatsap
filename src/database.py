from sqlalchemy import create_engine, Column, Integer, String, ForeignKey
from sqlalchemy.orm import declarative_base, sessionmaker

Base = declarative_base()
engine = create_engine("sqlite:///chatbot.db")
SessionLocal = sessionmaker(bind=engine)
session = SessionLocal()

# Tabela de Clientes
class Cliente(Base):
    __tablename__ = "clientes"
    id = Column(Integer, primary_key=True)
    nome = Column(String, nullable=False)
    atendente_id = Column(Integer, ForeignKey("atendentes.id"), nullable=True)

# Tabela de Atendentes
class Atendente(Base):
    __tablename__ = "atendentes"
    id = Column(Integer, primary_key=True)
    nome = Column(String, nullable=False, unique=True)

# Criar tabelas no banco de dados
Base.metadata.create_all(engine)

# Adicionar atendentes padrão (executar apenas uma vez)
def adicionar_atendentes():
    atendentes = ["Mariana", "Tainara", "Erika"]
    for nome in atendentes:
        if not session.query(Atendente).filter_by(nome=nome).first():
            session.add(Atendente(nome=nome))
    session.commit()

adicionar_atendentes()
