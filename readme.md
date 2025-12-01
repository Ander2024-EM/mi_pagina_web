#  Gestor de Productos – Flask + SQLite + JavaScript

Aplicación web completa para gestionar productos, con login, subida de imágenes, comentarios, filtros, exportación de reportes y base de datos SQLite.  
Desplegada en Render y funciona sin dependencias adicionales.

---

## Funcionalidades Principales

###  Autenticación
- Login con usuario y contraseña
- Protección de rutas usando sesiones Flask
- Cierre de sesión seguro

###  Gestión de Productos
- Crear productos con: nombre, precio, categoría, imagen
- Habilitar / deshabilitar productos
- Editar nombre y precio
- Eliminar productos
- Vista moderna tipo tarjetas

### Imágenes
- Las imágenes se suben a la carpeta `static/uploads/`
- Compatible con Render gracias a un `.gitkeep` que asegura la carpeta

###  Comentarios
- Agregar comentarios por producto
- Mostrar nombre, texto y fecha

###  Filtros y búsqueda
- Buscar por nombre
- Filtrar por estado (habilitados / deshabilitados)
- Ordenar por precio ascendente o descendente

###  Exportaciones
- Exportar a **PDF**
- Exportar a **Excel (.xls)**

###  Base de datos SQLite
- Se guarda dentro de `instance/database.db`
- Soporta reinicios del servidor

---

##  Tecnologías Usadas

| Área | Tecnología |
|------|------------|
| Backend | Python, Flask, SQLAlchemy |
| Base de Datos | SQLite |
| Frontend | HTML, CSS, JavaScript (modular ES6) |
| Deploy | Render (Web Service) |
| Otros | SweetAlert2, Gunicorn |

---

##  Estructura del Proyecto
mi_pagina_web/
│
├── app.py
├── requirements.txt
├── Procfile
│
├── instance/
│ └── database.db
│
├── static/
│ ├── js/
│ │ ├── api.js
│ │ ├── main.js
│ │ ├── ui.js
│ │ ├── utils.js
│ │ └── components/
│ │ └── product-card.js
│ │
│ ├── uploads/
│ │ └── .gitkeep
│ │
│ ├── styles.css
│ └── login.css
│
└── templates/
├── index.html
└── login.html

##  AUTOR
Ander Elias
Desarrollador de Software y Docente de Programación

## Link para render
https://mi-pagina-web-d2ly.onrender.com/login
