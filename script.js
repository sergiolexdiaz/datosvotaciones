// 📊 Cargar archivo Excel desde el repositorio público de GitHub
const urlExcel = "https://raw.githubusercontent.com/sergiolexdiaz/datosvotaciones/main/registro_boletas.xlsx";

async function cargarExcel() {
  const response = await fetch(urlExcel);
  const data = await response.arrayBuffer();
  const workbook = XLSX.read(data, { type: "array" });
  const hoja = workbook.Sheets[workbook.SheetNames[0]];
  const json = XLSX.utils.sheet_to_json(hoja);

  mostrarDatos(json);
}

function mostrarDatos(datos) {
  const cuerpo = document.getElementById("tablaCuerpo");
  cuerpo.innerHTML = "";

  let totalCompradas = 0;
  let totalRegaladas = 0;
  let totalDebe = 0;
  let totalDinero = 0;

  datos.forEach((fila) => {
    const tr = document.createElement("tr");
    tr.innerHTML = `
      <td>${fila["N°"] || ""}</td>
      <td>${fila["Nombre"] || ""}</td>
      <td>${fila["Teléfono"] || ""}</td>
      <td>${fila["Estado"] || ""}</td>
      <td>${fila["Valor"] || ""}</td>
    `;
    cuerpo.appendChild(tr);

    // Contadores
    if (fila["Estado"] === "Comprada") totalCompradas++;
    if (fila["Estado"] === "Regalada") totalRegaladas++;
    if (fila["Estado"] === "Debe") totalDebe++;
    if (fila["Valor"]) totalDinero += parseInt(fila["Valor"]);
  });

  document.getElementById("compradas").innerText = totalCompradas;
  document.getElementById("regaladas").innerText = totalRegaladas;
  document.getElementById("debe").innerText = totalDebe;
  document.getElementById("total").innerText = totalDinero.toLocaleString("es-CO");
}

// 🔍 Buscador
document.getElementById("buscador").addEventListener("input", (e) => {
  const texto = e.target.value.toLowerCase();
  const filas = document.querySelectorAll("#tablaCuerpo tr");

  filas.forEach((fila) => {
    const contenido = fila.innerText.toLowerCase();
    fila.style.display = contenido.includes(texto) ? "" : "none";
  });
});

// 🚀 Iniciar
cargarExcel();
