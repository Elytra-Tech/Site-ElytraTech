import pymssql
import bcrypt
from flask import Flask, request, jsonify
from flask_cors import CORS

app = Flask(__name__)
CORS(app)

import psycopg2

def conectar_banco():
    return psycopg2.connect(
        "postgresql://postgres:[YOUR-PASSWORD]@db.ffzntduztrjwjgbpcczs.supabase.co:5432/postgres"
    )

@app.route('/api/registrar', methods=['POST'])
def registrar_usuario():
    dados = request.json
    usuario = dados.get('usuario')
    telefone = dados.get('telefone')
    email = dados.get('email')
    senha = dados.get('senha')

    if not usuario or not telefone or not email or not senha:
        return jsonify({"sucesso": False, "mensagem": "Preencha todos os campos."}), 400

    conexao = None
    cursor = None

    try:
        conexao = conectar_banco()
        cursor = conexao.cursor(as_dict=True)
        
        # Verifica se o email ou o usuário já existem antes de cadastrar
        sql_verifica = "SELECT * FROM cliente WHERE Email = %s OR Usuario = %s"
        cursor.execute(sql_verifica, (email, usuario))
        existente = cursor.fetchone()

        if existente:
            cursor.close()
            conexao.close()
            return jsonify({"sucesso": False, "mensagem": "Este email ou nome de usuário já está em uso."}), 400

        # Se não existir, faz o hash da senha e insere
        senha_hash = bcrypt.hashpw(senha.encode('utf-8'), bcrypt.gensalt()).decode('utf-8')

        sql_insere = "INSERT INTO cliente (Usuario, Telefone, Email, Senha) VALUES (%s, %s, %s, %s)"
        cursor.execute(sql_insere, (usuario, telefone, email, senha_hash))
        conexao.commit()
        
        cursor.close()
        conexao.close()

        return jsonify({"sucesso": True, "mensagem": "Usuário cadastrado com sucesso!"}), 201
        
    except Exception as e:
        print("Erro detalhado no registo:", str(e))
        return jsonify({"sucesso": False, "mensagem": "Erro interno no servidor."}), 500
    finally:
        # Fecha apenas se foram criados com sucesso
        if cursor is not None:
            try:
                cursor.close()
            except:
                pass
        if conexao is not None:
            try:
                conexao.close()
            except:
                pass

@app.route('/api/login', methods=['POST'])
def login_usuario():
    dados = request.get_json()
    identificador = dados.get('email') or dados.get('usuario')  # Aceita email ou usuario
    senha = dados.get('senha')

    if not identificador or not senha:
        return jsonify({"sucesso": False, "mensagem": "Preencha todos os campos."}), 400

    try:
        conexao = conectar_banco()
        cursor = conexao.cursor(as_dict=True)

        # Procura tanto pelo email quanto pelo nome de usuário
        SQL = "SELECT * FROM cliente WHERE Email = %s OR Usuario = %s"
        cursor.execute(SQL, (identificador, identificador))
        cliente_db = cursor.fetchone()

        cursor.close()
        conexao.close()

        if cliente_db:
            senha_armazenada = cliente_db['Senha'].encode('utf-8')
            if bcrypt.checkpw(senha.encode('utf-8'), senha_armazenada):
                return jsonify({"sucesso": True, "mensagem": "Login efetuado com sucesso!"}), 200
                
        return jsonify({"sucesso": False, "mensagem": "Usuário/Email ou senha incorretos."}), 401
    except Exception as e:
        print("Erro detalhado no login:", str(e))
        return jsonify({"sucesso": False, "mensagem": str(e)}), 500

if __name__ == '__main__':
    app.run(port=3000, debug=True)