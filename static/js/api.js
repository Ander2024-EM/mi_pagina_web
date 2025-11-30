// ===============================
// API: Conexión con el backend Flask
// ===============================

export const API = {

    async obtenerProductos() {
        const res = await fetch("/productos");
        return await res.json();
    },

    async agregarProducto(formData) {
        const res = await fetch("/productos", {
            method: "POST",
            body: formData
        });
        return await res.json();
    },

    async eliminarProducto(id) {
        const res = await fetch(`/productos/${id}`, {
            method: "DELETE"
        });
        return await res.json();
    },

    async toggleProducto(id) {
        const res = await fetch(`/productos/${id}/toggle`, {
            method: "PATCH"
        });
        return await res.json();
    },

    async comentar(id, comentario) {
        const res = await fetch(`/productos/${id}/comentarios`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(comentario)
        });
        return await res.json();
    },
    // ===========================================
// EDITAR PRODUCTO
// ===========================================
async editarProducto(id, datos) {
    try {
        const res = await fetch(`/productos/${id}`, {
            method: "PUT",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(datos)
        });

        return await res.json();
    } catch (error) {
        return { error: error.message };
    }
},

};
