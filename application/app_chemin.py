from flask import Flask
import psycopg2
import random

app = Flask(__name__)

# Configuration PostgreSQL
DB_CONFIG = {
    "host": "container-bdd",
    "dbname": "application",
    "user": "postgres",
    "password": "postgres"
}

@app.route('/app/<name>')
def hello(name):
    return f'Hello {name}!'


@app.route('/random/')
def random_word():
    # valeur aléatoire entre 1 et 42
    random_id = random.randint(1, 42)

    try:
        conn = psycopg2.connect(**DB_CONFIG)
        cur = conn.cursor()

        cur.execute(
            "SELECT mot FROM mot_alea WHERE id = %s;",
            (random_id,)
        )

        result = cur.fetchone()

        cur.close()
        conn.close()

        if result:
            return f"Mot aléatoire (id={random_id}) : {result[0]}"
        else:
            return f"Aucun mot trouvé pour id={random_id}"

    except Exception as e:
        return f"Erreur BDD : {e}", 500


if __name__ == '__main__':
    app.run(host="0.0.0.0", port=8080)
