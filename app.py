from flask import Flask, request, jsonify
import sqlite3

from flask_cors import CORS

app = Flask(__name__)
CORS(
    app,
    origins=[
        "https://kinaraideezzz.github.io"
    ]
)
def init_db():
    conn = sqlite3.connect("rating.db")
    conn.execute("""
    CREATE TABLE IF NOT EXISTS ratings(
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        score REAL,
        time TEXT
    )
    """)
    conn.close()

init_db()

@app.route("/rating", methods=["POST"])
def save_rating():

    data = request.json

    conn = sqlite3.connect("rating.db")

    conn.execute(
        "INSERT INTO ratings(score,time) VALUES(?,?)",
        (data["rating"], data["time"])
    )

    conn.commit()
    conn.close()

    return jsonify({"status":"ok"})


@app.route("/ratings")
def ratings():

    conn = sqlite3.connect("rating.db")

    rows = conn.execute(
        "SELECT * FROM ratings"
    ).fetchall()

    conn.close()

    return jsonify(rows)

@app.route("/stats")
def stats():

    conn = sqlite3.connect("rating.db")

    rows = conn.execute(
        "SELECT score FROM ratings"
    ).fetchall()

    conn.close()

    total = len(rows)

    avg = round(
        sum(r[0] for r in rows)/total,
        2
    ) if total else 0

    return jsonify({
        "average": avg,
        "total": total
    })

@app.route("/admin")
def admin():

    conn = sqlite3.connect("rating.db")

    rows = conn.execute("""
        SELECT score,time
        FROM ratings
        ORDER BY id DESC
    """).fetchall()

    conn.close()

    total = len(rows)

    avg = round(
        sum(r[0] for r in rows) / total,
        2
    ) if total else 0

    html = f"""
    <html>
    <head>
    <title>Admin Dashboard</title>

    <style>

    body{{
        background:#f4f4f4;
        font-family:Prompt,sans-serif;
        padding:30px;`
    }}

    .card{{
        background:white;
        padding:20px;
        border-radius:20px;
        margin-bottom:20px;
        box-shadow:0 4px 15px rgba(0,0,0,.1);
    }}

    h1{{
        color:#ff8800;
    }}

    table{{
        width:100%;
        border-collapse:collapse;
        background:white;
    }}

    th,td{{
        padding:12px;
        border-bottom:1px solid #ddd;
        text-align:center;
    }}

    th{{
        background:#ffb74d;
    }}

    </style>

    </head>

    <body>

    <h1>⭐ Dashboard คะแนนเว็บไซต์</h1>

    <div class="card">
        <h2>⭐ คะแนนเฉลี่ย : {avg}</h2>
    </div>

    <div class="card">
        <h2>👥 จำนวนผู้ให้คะแนน : {total}</h2>
    </div>

    <table>

    <tr>
        <th>คะแนน</th>
        <th>เวลา</th>
    </tr>
    """

    for score,time in rows:

        html += f"""
        <tr>
            <td>{score} ⭐</td>
            <td>{time}</td>
        </tr>
        """

    html += """
    </table>

    </body>
    </html>
    """

    return html