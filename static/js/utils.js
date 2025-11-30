// ===============================
// UTILIDADES
// ===============================

export const Utils = {

    // -----------------------------
    // BÚSQUEDA
    // -----------------------------
    buscar(lista, texto) {
        if (!texto) return lista;
        return lista.filter(p =>
            p.nombre.toLowerCase().includes(texto.toLowerCase())
        );
    },

    // -----------------------------
    // FILTRAR POR ESTADO
    // -----------------------------
    filtrarEstado(lista, estado) {
        if (estado === "habilitados")
            return lista.filter(p => p.habilitado);

        if (estado === "deshabilitados")
            return lista.filter(p => !p.habilitado);

        return lista;
    },

    // -----------------------------
    // ORDENAR POR PRECIO
    // -----------------------------
    ordenar(lista, tipo) {
        if (tipo === "asc")
            return lista.sort((a, b) => a.precio - b.precio);

        if (tipo === "desc")
            return lista.sort((a, b) => b.precio - a.precio);

        return lista;
    },

    // -----------------------------
    // EXPORTAR CSV (opcional)
    // -----------------------------
    exportarCSV(lista) {
        let csv = "ID,Nombre,Precio,Habilitado\n";

        lista.forEach(p => {
            csv += `${p.id},${p.nombre},${p.precio},${p.habilitado}\n`;
        });

        const blob = new Blob([csv], { type: "text/csv" });
        const url = URL.createObjectURL(blob);

        const a = document.createElement("a");
        a.href = url;
        a.download = "productos.csv";
        a.click();
        URL.revokeObjectURL(url);
    },

    // -----------------------------
    // LOADER GLOBAL
    // -----------------------------
    showLoader() {
        const loader = document.getElementById("loaderOverlay");
        if (loader) loader.classList.remove("hidden");
    },

    hideLoader() {
        const loader = document.getElementById("loaderOverlay");
        if (loader) loader.classList.add("hidden");
    },

    // -----------------------------
    // RETARDO — PARA MOSTRAR LA RUEDITA
    // -----------------------------
    delay(ms) {
        return new Promise(resolve => setTimeout(resolve, ms));
    },

    // ================================
    // EXPORTAR PDF BONITO
    // ================================
    exportarPDF(lista) {

        const win = window.open("", "_blank");

        win.document.write(`
            <html>
            <head>
                <title>Reporte de Productos</title>
                <style>
                    body { font-family: Arial; margin: 20px; }
                    h2 { text-align:center; }
                    table { border-collapse: collapse; width: 100%; margin-top: 20px; }
                    th, td { border: 1px solid #555; padding: 8px; text-align: center; }
                    th { background: #e2e8f0; }
                </style>
            </head>
            <body>
                <h2>Reporte de Productos</h2>
                <table>
                    <tr>
                        <th>ID</th>
                        <th>Nombre</th>
                        <th>Precio</th>
                        <th>Habilitado</th>
                    </tr>
        `);

        lista.forEach(p => {
            win.document.write(`
                    <tr>
                        <td>${p.id}</td>
                        <td>${p.nombre}</td>
                        <td>Q${p.precio}</td>
                        <td>${p.habilitado ? "Sí" : "No"}</td>
                    </tr>
            `);
        });

        win.document.write(`
                </table>
            </body>
            </html>
        `);

        win.document.close();
        win.print();
    },

    // ================================
    // EXPORTAR EXCEL BONITO (.xls)
    // ================================
    exportarXLS(lista) {

        let html = `
            <table border="1">
                <tr style="font-weight:bold; background:#e2e8f0;">
                    <td>ID</td>
                    <td>Nombre</td>
                    <td>Precio</td>
                    <td>Habilitado</td>
                </tr>
        `;

        lista.forEach(p => {
            html += `
                <tr>
                    <td>${p.id}</td>
                    <td>${p.nombre}</td>
                    <td>${p.precio}</td>
                    <td>${p.habilitado ? "Sí" : "No"}</td>
                </tr>
            `;
        });

        html += `</table>`;

        const archivo = new Blob([html], { 
            type: "application/vnd.ms-excel;charset=utf-8;" 
        });

        const url = URL.createObjectURL(archivo);

        const a = document.createElement("a");
        a.href = url;
        a.download = "productos.xls";
        a.click();

        URL.revokeObjectURL(url);
    }
};
