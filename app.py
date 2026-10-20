from flask import Flask, jsonify, request, render_template
import sqlite3
from pathlib import Path
from datetime import datetime

BASE_DIR = Path(__file__).resolve().parent
DB_PATH = BASE_DIR / "campusspace.db"
SCHEMA = BASE_DIR / "database" / "schema.sql"
SEED = BASE_DIR / "database" / "seed.sql"

app = Flask(__name__, static_folder="src/static", template_folder="src/templates")


def get_db():
    conn = sqlite3.connect(DB_PATH)
    conn.row_factory = sqlite3.Row
    return conn


def init_db():
    conn = get_db()
    conn.executescript(SCHEMA.read_text(encoding="utf-8"))
    count = conn.execute("SELECT COUNT(*) FROM rooms").fetchone()[0]
    if count == 0:
        conn.executescript(SEED.read_text(encoding="utf-8"))
    conn.commit()
    conn.close()


@app.route("/")
def index():
    return render_template("index.html")


@app.get("/api/rooms")
def rooms():
    building = request.args.get("building", "").strip()
    min_capacity = request.args.get("min_capacity", type=int)

    query = "SELECT * FROM rooms WHERE 1=1"
    params = []

    if building:
        query += " AND building = ?"
        params.append(building)
    if min_capacity:
        query += " AND capacity >= ?"
        params.append(min_capacity)

    query += " ORDER BY building, room_number"

    conn = get_db()
    rows = conn.execute(query, params).fetchall()
    conn.close()
    return jsonify([dict(row) for row in rows])


@app.get("/api/bookings")
def bookings():
    conn = get_db()
    rows = conn.execute("""
        SELECT b.*, r.building, r.room_number
        FROM bookings b
        JOIN rooms r ON r.id = b.room_id
        ORDER BY b.start_time
    """).fetchall()
    conn.close()
    return jsonify([dict(row) for row in rows])


@app.post("/api/bookings")
def create_booking():
    data = request.get_json(silent=True) or {}

    required = ["room_id", "student_name", "start_time", "end_time"]
    if any(not data.get(key) for key in required):
        return jsonify({"error": "Заполните все обязательные поля"}), 400

    try:
        start = datetime.fromisoformat(data["start_time"])
        end = datetime.fromisoformat(data["end_time"])
    except ValueError:
        return jsonify({"error": "Неверный формат даты и времени"}), 400

    if end <= start:
        return jsonify({"error": "Время окончания должно быть позже начала"}), 400

    conn = get_db()
    conflict = conn.execute("""
        SELECT 1 FROM bookings
        WHERE room_id = ?
          AND start_time < ?
          AND end_time > ?
    """, (data["room_id"], data["end_time"], data["start_time"])).fetchone()

    if conflict:
        conn.close()
        return jsonify({"error": "Аудитория уже забронирована на это время"}), 409

    cur = conn.execute("""
        INSERT INTO bookings (room_id, student_name, start_time, end_time)
        VALUES (?, ?, ?, ?)
    """, (data["room_id"], data["student_name"],
          data["start_time"], data["end_time"]))
    conn.commit()
    booking_id = cur.lastrowid
    conn.close()

    return jsonify({"id": booking_id, "message": "Аудитория забронирована"}), 201


@app.delete("/api/bookings/<int:booking_id>")
def delete_booking(booking_id):
    conn = get_db()
    cur = conn.execute("DELETE FROM bookings WHERE id = ?", (booking_id,))
    conn.commit()
    deleted = cur.rowcount
    conn.close()

    if not deleted:
        return jsonify({"error": "Бронирование не найдено"}), 404
    return jsonify({"message": "Бронирование отменено"})


if __name__ == "__main__":
    init_db()
    app.run(debug=True)
