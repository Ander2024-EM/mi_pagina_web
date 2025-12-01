import os
import base64
from flask import Flask, jsonify, request, render_template, redirect, session
from datetime import datetime
from functools import wraps
from flask_sqlalchemy import SQLAlchemy

app = Flask(__name__)
app.secret_key = "ElMejorProyecto2025"

# ========================================
# CONFIGURACIÓN SQLITE
# ========================================
app.config['SQLALCHEMY_DATABASE_URI'] = 'sqlite:///database.db'
app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False

db = SQLAlchemy(app)

# ========================================
# MODELOS
# ========================================

class Usuario(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    usuario = db.Column(db.String(100), unique=True)
    password = db.Column(db.String(100))
    rol = db.Column(db.String(50))


class Producto(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    nombre = db.Column(db.String(255))
    precio = db.Column(db.Float)
    imagen_base64 = db.Column(db.Text)   # 🔥 GUARDAMOS BASE64
    habilitado = db.Column(db.Integer, default=1)
    categoria = db.Column(db.String(100))


class Comentario(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    producto_id = db.Column(db.Integer)
    nombre = db.Column(db.String(255))
    texto = db.Column(db.String(255))
    fecha = db.Column(db.String(50))


# Crear tablas si no existen
with app.app_context():
    db.create_all()

# ========================================
# LOGIN REQUIRED
# ========================================
def login_required(f):
    @wraps(f)
    def wrapper(*args, **kwargs):
        if "user_id" not in session:
            return redirect("/login")
        return f(*args, **kwargs)
    return wrapper

# ========================================
# LOGIN
# ========================================
@app.route("/login", methods=["GET", "POST"])
def login():

    if request.method == "POST":
        usuario = request.form.get("usuario")
        password = request.form.get("password")

        user = Usuario.query.filter_by(usuario=usuario).first()

        if not user:
            return render_template("login.html", mensaje="Usuario no existe")

        if user.password != password:
            return render_template("login.html", mensaje="Contraseña incorrecta")

        session["user_id"] = user.id
        session["user_name"] = user.usuario
        session["user_rol"] = user.rol

        return redirect("/")

    return render_template("login.html")

# ========================================
# LOGOUT
# ========================================
@app.route("/logout")
def logout():
    session.clear()
    return redirect("/login")

# ========================================
# HOME
# ========================================
@app.route("/")
@login_required
def home():
    return render_template("index.html")

# ========================================
# OBTENER PRODUCTOS
# ========================================
@app.route('/productos', methods=['GET'])
@login_required
def productos():

    resultado = []

    for p in Producto.query.all():

        img_src = f"data:image/jpeg;base64,{p.imagen_base64}" if p.imagen_base64 else None

        prod = {
            "id": p.id,
            "nombre": p.nombre,
            "precio": p.precio,
            "imagen": img_src,
            "habilitado": bool(p.habilitado),
            "categoria": p.categoria,
            "comentarios": []
        }

        for c in Comentario.query.filter_by(producto_id=p.id).all():
            prod["comentarios"].append({
                "nombre": c.nombre,
                "texto": c.texto,
                "fecha": c.fecha
            })

        resultado.append(prod)

    return jsonify(resultado)

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

    # Convertir imagen a Base64
    imagen_bytes = imagen.read()
    imagen_b64 = base64.b64encode(imagen_bytes).decode("utf-8")

    nuevo = Producto(
        nombre=nombre,
        precio=float(precio),
        categoria=categoria,
        imagen_base64=imagen_b64,
        habilitado=1
    )

    db.session.add(nuevo)
    db.session.commit()

    return jsonify({
        "message": "Producto agregado exitosamente",
        "producto": {
            "id": nuevo.id,
            "nombre": nombre,
            "precio": float(precio),
            "imagen": f"data:image/jpeg;base64,{imagen_b64}",
            "habilitado": True,
            "categoria": categoria,
            "comentarios": []
        }
    })

# ========================================
# EDITAR PRODUCTO
# ========================================
@app.route('/productos/<int:id>', methods=['PUT'])
@login_required
def editar_producto(id):

    data = request.json
    p = Producto.query.get(id)

    if not p:
        return jsonify({"message": "Producto no existe"}), 404

    p.nombre = data.get("nombre")
    p.precio = data.get("precio")
    p.categoria = data.get("categoria")

    db.session.commit()

    return jsonify({"message": "OK"})

# ========================================
# TOGGLE PRODUCTO
# ========================================
@app.route('/productos/<int:id>/toggle', methods=['PATCH'])
@login_required
def toggle_producto(id):

    p = Producto.query.get(id)
    if not p:
        return jsonify({"message": "Producto no existe"}), 404

    p.habilitado = 0 if p.habilitado else 1
    db.session.commit()

    return jsonify({
        "producto": {
            "id": p.id,
            "nombre": p.nombre,
            "precio": p.precio,
            "categoria": p.categoria,
            "habilitado": bool(p.habilitado),
            "imagen": f"data:image/jpeg;base64,{p.imagen_base64}"
        }
    })

# ========================================
# ELIMINAR PRODUCTO
# ========================================
@app.route('/productos/<int:id>', methods=['DELETE'])
@login_required
def eliminar_producto(id):

    Comentario.query.filter_by(producto_id=id).delete()
    Producto.query.filter_by(id=id).delete()
    db.session.commit()

    return jsonify({"message": "Producto eliminado"})

# ========================================
# AGREGAR COMENTARIO
# ========================================
@app.route("/productos/<int:id>/comentarios", methods=["POST"])
@login_required
def agregar_comentario(id):

    data = request.json

    nuevo = Comentario(
        producto_id=id,
        nombre=data["nombre"],
        texto=data["texto"],
        fecha=data["fecha"]
    )

    db.session.add(nuevo)
    db.session.commit()

    return jsonify({"message": "OK"}), 201

# ========================================
# RUN
# ========================================
if __name__ == '__main__':
    app.run(debug=True, port=5000)
