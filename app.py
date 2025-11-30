import os
from flask import Flask, jsonify, request, render_template, redirect, session
from flask_mysqldb import MySQL
from werkzeug.utils import secure_filename
from datetime import datetime
from functools import wraps

app = Flask(__name__)
app.config['UPLOAD_FOLDER'] = 'static/uploads'
app.secret_key = "ElMejorProyecto2025"   # tu llave

# ========================================
# CONFIGURACIÓN MYSQL
# ========================================
app.config['MYSQL_HOST'] = 'localhost'
app.config['MYSQL_USER'] = 'root'
app.config['MYSQL_PASSWORD'] = ''
app.config['MYSQL_DB'] = 'productos_db'
app.config['MYSQL_CURSORCLASS'] = 'DictCursor'

mysql = MySQL(app)


# ========================================
# LOGIN REQUIRED (CORREGIDO)
# ========================================
def login_required(f):
    @wraps(f)
    def wrapper(*args, **kwargs):
        if "user_id" not in session:      # <-- CORREGIDO
            return redirect("/login")
        return f(*args, **kwargs)
    return wrapper



# ========================================
# LOGIN
# ========================================
@app.route("/login", methods=["GET", "POST"])
def login():

    if request.method == "POST":
        usuario = request.form.get("usuario")   # <-- machea con name="usuario"
        password = request.form.get("password")

        cursor = mysql.connection.cursor()
        cursor.execute("SELECT * FROM usuarios WHERE usuario=%s", (usuario,))
        user = cursor.fetchone()

        if not user:
            return render_template("login.html", mensaje="Usuario no existe")

        if user["password"] != password:
            return render_template("login.html", mensaje="Contraseña incorrecta")

        # GUARDAR SESIÓN (corregido)
        session["user_id"] = user["id"]
        session["user_name"] = user["usuario"]
        session["user_rol"] = user["rol"]

        return redirect("/")     # redirige a la ruta protegida

    return render_template("login.html")


# ========================================
# LOGOUT
# ========================================
@app.route("/logout")
def logout():
    session.clear()
    return redirect("/login")



# ========================================
# VIEW PRINCIPAL (PROTEGIDA)
# ========================================
@app.route("/")
@login_required
def home():
    return render_template("index.html")



# ========================================
# GET PRODUCTOS
# ========================================
@app.route('/productos', methods=['GET'])
@login_required
def productos():

    cursor = mysql.connection.cursor()
    cursor.execute("SELECT * FROM productos")
    productos = cursor.fetchall()

    for p in productos:
        p["habilitado"] = bool(p["habilitado"])
        if p["imagen"]:
            p["imagen"] = f"/static/uploads/{p['imagen']}"

        # obtener comentarios
        cursor.execute("SELECT nombre, texto, fecha FROM comentarios WHERE producto_id=%s", (p["id"],))
        p["comentarios"] = cursor.fetchall()

    return jsonify(productos)



# ========================================
# AGREGAR PRODUCTO
# ========================================
@app.route('/productos', methods=['POST'])
@login_required
def agregar_producto():

    nombre = request.form.get('nombre')
    precio = request.form.get('precio')
    categoria = request.form.get('categoria')
    imagen = request.files.get('imagen')

    if not nombre or not precio or not imagen:
        return jsonify({"message": "Faltan datos"}), 400

    filename = secure_filename(imagen.filename)
    imagen.save(os.path.join(app.config['UPLOAD_FOLDER'], filename))

    cursor = mysql.connection.cursor()
    cursor.execute("""
        INSERT INTO productos (nombre, precio, imagen, habilitado, categoria)
        VALUES (%s, %s, %s, 1, %s)
    """, (nombre, precio, filename, categoria))

    mysql.connection.commit()
    new_id = cursor.lastrowid

    return jsonify({
        "message": "Producto agregado exitosamente",
        "producto": {
            "id": new_id,
            "nombre": nombre,
            "precio": float(precio),
            "imagen": f"/static/uploads/{filename}",
            "habilitado": True,
            "categoria": categoria,
            "comentarios": []
        }
    }), 201



# ========================================
# EDITAR PRODUCTO
# ========================================
@app.route('/productos/<int:id>', methods=['PUT'])
@login_required
def editar_producto(id):

    data = request.json

    nombre = data.get("nombre")
    precio = data.get("precio")
    categoria = data.get("categoria")

    cursor = mysql.connection.cursor()
    cursor.execute("""
        UPDATE productos SET nombre=%s, precio=%s, categoria=%s
        WHERE id=%s
    """, (nombre, precio, categoria, id))

    mysql.connection.commit()

    cursor.execute("SELECT * FROM productos WHERE id=%s", (id,))
    p = cursor.fetchone()

    p["habilitado"] = bool(p["habilitado"])
    if p["imagen"]:
        p["imagen"] = f"/static/uploads/{p['imagen']}"

    return jsonify({"message": "OK", "producto": p})



# ========================================
# TOGGLE
# ========================================
@app.route('/productos/<int:id>/toggle', methods=['PATCH'])
@login_required
def toggle_producto(id):

    cursor = mysql.connection.cursor()
    cursor.execute("SELECT habilitado FROM productos WHERE id=%s", (id,))
    row = cursor.fetchone()

    nuevo = 0 if row["habilitado"] else 1

    cursor.execute("UPDATE productos SET habilitado=%s WHERE id=%s", (nuevo, id))
    mysql.connection.commit()

    cursor.execute("SELECT * FROM productos WHERE id=%s", (id,))
    p = cursor.fetchone()

    p["habilitado"] = bool(p["habilitado"])
    if p["imagen"]:
        p["imagen"] = f"/static/uploads/{p['imagen']}"

    return jsonify({"producto": p})



# ========================================
# ELIMINAR
# ========================================
@app.route('/productos/<int:id>', methods=['DELETE'])
@login_required
def eliminar_producto(id):

    cursor = mysql.connection.cursor()
    cursor.execute("DELETE FROM comentarios WHERE producto_id=%s", (id,))
    cursor.execute("DELETE FROM productos WHERE id=%s", (id,))
    mysql.connection.commit()

    return jsonify({"message": "Producto eliminado"})


# ========================================
# COMENTARIOS
# ========================================
@app.route("/productos/<int:id>/comentarios", methods=["POST"])
@login_required
def agregar_comentario(id):

    data = request.json

    cursor = mysql.connection.cursor()
    cursor.execute("""
        INSERT INTO comentarios (producto_id, nombre, texto, fecha)
        VALUES (%s, %s, %s, %s)
    """, (id, data["nombre"], data["texto"], data["fecha"]))

    mysql.connection.commit()
    return jsonify({"message": "OK"}), 201



# ========================================
# RUN
# ========================================
if __name__ == '__main__':
    app.run(debug=True, port=5000)
