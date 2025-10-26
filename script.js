document.getElementById("formulario").addEventListener("submit", function(e) {
  e.preventDefault();

  const archivo = document.getElementById("archivoExcel").files[0];
  const mensaje = document.getElementById("mensaje").value;

  const lector = new FileReader();
  lector.onload = function(e) {
    const datos = new Uint8Array(e.target.result);
    const workbook = XLSX.read(datos, { type: "array" });
    const hoja = workbook.Sheets[workbook.SheetNames[0]];
    const filas = XLSX.utils.sheet_to_json(hoja);

    filas.forEach((fila, i) => {
      const nombre = fila.nombre || fila.Nombre || "amigo";
      const telefono = fila.telefono || fila.Telefono;
      const profesor = fila.profesor || fila.Profesor || "José Luis Gil";

      if (telefono) {
        const texto = mensaje
          .replace("{nombre}", nombre)
          .replace("{profesor}", profesor);

        const url = `https://wa.me/57${telefono}?text=${encodeURIComponent(texto)}`;
        setTimeout(() => window.open(url, "_blank"), i * 1500);
      }
    });
  };
  lector.readAsArrayBuffer(archivo);
});
