import { ProductCard } from "./components/product-card.js";

export const UI = {

    // ------------------------
    // ALERTA BONITA
    // ------------------------
    alert(msg, icon = "info") {
        Swal.fire({
            text: msg,
            icon: icon,
            confirmButtonColor: "#2563eb"
        });
    },

    // ------------------------
    // CONFIRMACIÓN BONITA
    // ------------------------
    async confirm(msg) {
        const res = await Swal.fire({
            title: "Confirmar",
            text: msg,
            icon: "warning",
            showCancelButton: true,
            confirmButtonColor: "#2563eb",
            cancelButtonColor: "#ef4444",
            confirmButtonText: "Sí",
            cancelButtonText: "Cancelar"
        });

        return res.isConfirmed;
    },

    // ------------------------
    // SELECCIONAR FORMATO EXPORTACIÓN
    // ------------------------
    async chooseExport() {

        const res = await Swal.fire({
            title: "Exportar Reporte",
            text: "Selecciona el formato",
            showCancelButton: true,
            showDenyButton: true,
            confirmButtonText: "PDF",
            denyButtonText: "Excel",
            cancelButtonText: "Cancelar",
            confirmButtonColor: "#2563eb",
            denyButtonColor: "#16a34a"
        });

        if (res.isConfirmed) return "pdf";
        if (res.isDenied) return "xls";
        return null;
    },

    // ------------------------
    // RENDERIZAR TARJETAS (AGREGADO: onEdit)
    // ------------------------
    renderProductos(contenedor, lista, onDelete, onToggle, onEdit) {
        contenedor.innerHTML = "";
        lista.forEach(p => {
            const card = ProductCard(p, onDelete, onToggle, onEdit);
            contenedor.appendChild(card);
        });
    },

    // =====================================================
    //  MODAL — abrir con datos
    // =====================================================
    abrirModal(producto) {
        document.getElementById("editModal").classList.remove("hidden");

        document.getElementById("editNombre").value = producto.nombre;
        document.getElementById("editPrecio").value = producto.precio;

        // Guardamos ID dentro del botón de guardar
        document
            .getElementById("btnGuardarCambios")
            .setAttribute("data-id", producto.id);
    },

    // =====================================================
    //  MODAL — cerrar
    // =====================================================
    cerrarModal() {
        document.getElementById("editModal").classList.add("hidden");
    }
};
