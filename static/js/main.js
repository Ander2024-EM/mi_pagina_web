import { API } from "./api.js";
import { UI } from "./ui.js";
import { Utils } from "./utils.js";

const Main = {

    productos: [],

    async init() {
        Utils.showLoader();

        this.productos = await API.obtenerProductos();

        Utils.hideLoader();
        this.render();

        document.getElementById("btnAgregar").addEventListener("click", () => this.agregar());
        document.getElementById("searchInput").addEventListener("input", () => this.render());
        document.getElementById("filterEstado").addEventListener("change", () => this.render());
        document.getElementById("filterPrecio").addEventListener("change", () => this.render());

        document.getElementById("btnExportar").addEventListener("click", () => this.exportar());

        document.getElementById("btnComentar").addEventListener("click", () => this.comentar());

        // =============================
        // EVENTOS DEL MODAL DE EDICIÓN
        // =============================
        document.getElementById("btnCerrarModal")
            .addEventListener("click", () => UI.cerrarModal());

        document.getElementById("btnGuardarCambios")
            .addEventListener("click", () => this.guardarCambios());
    },

    render() {
        let lista = [...this.productos];

        const busqueda = document.getElementById("searchInput").value.trim();
        lista = Utils.buscar(lista, busqueda);

        const estado = document.getElementById("filterEstado").value;
        lista = Utils.filtrarEstado(lista, estado);

        const precio = document.getElementById("filterPrecio").value;
        lista = Utils.ordenar(lista, precio);

        UI.renderProductos(
            document.getElementById("productosLista"),
            lista,
            (id) => this.eliminar(id),
            (id) => this.toggle(id),
            (producto) => this.editar(producto)      // 🔥 nuevo
        );
    },

    // ==============================
    // AGREGAR PRODUCTO
    // ==============================
    async agregar() {
        Utils.showLoader();

        const nombre = document.getElementById("nombre");
        const precio = document.getElementById("precio");
        const imagen = document.getElementById("imagen");

        if (!nombre.value || !precio.value || !imagen.files[0]) {
            Utils.hideLoader();
            return UI.alert("Faltan datos");
        }

        const form = new FormData();
        form.append("nombre", nombre.value);
        form.append("precio", precio.value);
        form.append("imagen", imagen.files[0]);

        const res = await API.agregarProducto(form);

        if (res.producto) {
            this.productos.push(res.producto);
            this.render();
            UI.alert("Producto agregado correctamente");

            nombre.value = "";
            precio.value = "";
            imagen.value = "";
        }

        Utils.hideLoader();
    },

    // ==============================
    // ELIMINAR PRODUCTO
    // ==============================
    async eliminar(id) {
        const ok = await UI.confirm("¿Estás seguro de eliminar este producto?");
        if (!ok) return;

        Utils.showLoader();
        await Utils.delay(500);

        await API.eliminarProducto(id);

        this.productos = this.productos.filter(p => p.id !== id);
        this.render();

        Utils.hideLoader();
        UI.alert("Producto eliminado correctamente");
    },

    // ==============================
    //  HABILITAR / DESHABILITAR
    // ==============================
    async toggle(id) {
        Utils.showLoader();

        const res = await API.toggleProducto(id);

        const index = this.productos.findIndex(p => p.id === id);
        this.productos[index] = res.producto;

        this.render();
        Utils.hideLoader();
    },

    // ==============================
    //     EDITAR PRODUCTO (abrir modal)
    // ==============================
    editar(producto) {
        UI.abrirModal(producto);
    },

    // ==============================
    //      GUARDAR CAMBIOS DEL MODAL
    // ==============================
    async guardarCambios() {
        Utils.showLoader();

        const id = document.getElementById("btnGuardarCambios").dataset.id;
        const nombre = document.getElementById("editNombre").value;
        const precio = document.getElementById("editPrecio").value;

        if (!nombre || !precio) {
            Utils.hideLoader();
            return UI.alert("Completa todos los campos");
        }

        const datos = { nombre, precio };

        const res = await API.editarProducto(id, datos);

        // Actualizamos en memoria
        const index = this.productos.findIndex(p => p.id == id);
        if (index >= 0) {
            this.productos[index] = res.producto;
        }

        this.render();
        UI.cerrarModal();

        Utils.hideLoader();
        UI.alert("Producto actualizado correctamente", "success");
    },

    // ==============================
    // EXPORTAR
    // ==============================
    async exportar() {
        const tipo = await UI.chooseExport();

        if (!tipo) return UI.alert("Operación cancelada");
        if (tipo !== "pdf" && tipo !== "xls") return UI.alert("Opción inválida");

        Utils.showLoader();
        await Utils.delay(500);

        if (tipo === "pdf") Utils.exportarPDF(this.productos);
        else Utils.exportarXLS(this.productos);

        Utils.hideLoader();
    },

    // ==============================
    // COMENTARIOS
    // ==============================
    async comentar() {
        Utils.showLoader();

        const id = document.getElementById("comentarioId").value;
        const nombre = document.getElementById("comentarioNombre").value;
        const texto = document.getElementById("comentarioTexto").value;

        if (!id || !nombre || !texto) {
            Utils.hideLoader();
            return UI.alert("Completa todos los campos");
        }

        const comentario = {
            nombre,
            texto,
            fecha: new Date().toLocaleString()
        };

        await API.comentar(id, comentario);

        const prod = this.productos.find(p => p.id == id);
        if (prod) {
            prod.comentarios = prod.comentarios || [];
            prod.comentarios.push(comentario);
        }

        this.render();

        UI.alert("Comentario agregado", "success");
        Utils.hideLoader();

        document.getElementById("comentarioId").value = "";
        document.getElementById("comentarioNombre").value = "";
        document.getElementById("comentarioTexto").value = "";
    }
};

document.addEventListener("DOMContentLoaded", () => Main.init());
