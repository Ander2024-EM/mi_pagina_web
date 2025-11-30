// ========================================
// COMPONENTE: CARD DE PRODUCTO
// ========================================

export function ProductCard(producto, onDelete, onToggle, onEdit) {

    const card = document.createElement("div");
    card.className = "product-card";

    // Imagen
    const img = document.createElement("img");
    img.src = producto.imagen;
    img.className = "product-img";
    img.alt = producto.nombre;

    // Nombre
    const name = document.createElement("h3");
    name.className = "product-name";
    name.textContent = producto.nombre;

    // Precio
    const price = document.createElement("p");
    price.className = "product-price";
    price.textContent = `Q${producto.precio}`;

    // Categoría (si no trae, no se muestra)
    const category = document.createElement("p");
    category.className = "product-category";
    category.textContent = producto.categoria ? `Categoría: ${producto.categoria}` : "";

    // Estado habilitado/deshabilitado
    const estado = document.createElement("p");
    estado.className = "product-state";
    estado.innerHTML = producto.habilitado
        ? `<span style="color:green;font-weight:bold;">Habilitado</span>`
        : `<span style="color:red;font-weight:bold;">Deshabilitado</span>`;

    // ========================================
    // COMENTARIOS
    // ========================================

    const comentariosBox = document.createElement("div");
    comentariosBox.className = "comentarios-box";

    const comentariosTitulo = document.createElement("h4");
    comentariosTitulo.textContent = "Comentarios:";

    comentariosBox.appendChild(comentariosTitulo);

    if (!producto.comentarios || producto.comentarios.length === 0) {
        const noCom = document.createElement("p");
        noCom.style.color = "#64748b";
        noCom.style.fontSize = "0.9rem";
        noCom.textContent = "— No hay comentarios —";
        comentariosBox.appendChild(noCom);
    } else {
        producto.comentarios.forEach((c, index) => {
            const com = document.createElement("div");
            com.className = "comentario-item";

            com.innerHTML = `
                <p><strong>${c.nombre}</strong> 
                <span style="font-size:0.8rem;color:#64748b;">${c.fecha}</span></p>
                <p>${c.texto}</p>
            `;

            comentariosBox.appendChild(com);
        });
    }

    // ========================================
    // BOTONES
    // ========================================

    const btnBox = document.createElement("div");
    btnBox.className = "card-buttons";

    // ------ BOTÓN EDITAR ------
    const btnEdit = document.createElement("button");
    btnEdit.className = "btn-small btn-edit";
    btnEdit.textContent = "Editar";

    // Llama al callback que abrirá el modal
    btnEdit.addEventListener("click", () => onEdit(producto));

    // ------ BOTÓN TOGGLE ------
    const btnToggle = document.createElement("button");
    btnToggle.className = "btn-small btn-toggle";
    btnToggle.textContent = producto.habilitado ? "Deshabilitar" : "Habilitar";

    btnToggle.addEventListener("click", () => onToggle(producto.id));

    // ------ BOTÓN ELIMINAR ------
    const btnDelete = document.createElement("button");
    btnDelete.className = "btn-small btn-delete";
    btnDelete.textContent = "Eliminar";

    btnDelete.addEventListener("click", () => onDelete(producto.id));

    // Agregamos los botones
    btnBox.appendChild(btnEdit);
    btnBox.appendChild(btnToggle);
    btnBox.appendChild(btnDelete);

    // ========================================
    // ENSAMBLAR TARJETA
    // ========================================

    card.appendChild(img);
    card.appendChild(name);
    card.appendChild(price);
    if (producto.categoria) card.appendChild(category);
    card.appendChild(estado);
    card.appendChild(comentariosBox);
    card.appendChild(btnBox);

    return card;
}
