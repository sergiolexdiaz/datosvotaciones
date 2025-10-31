// 🔑 Tu token directo (NO lo compartas públicamente)
const token = "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";

// Login simple
document.getElementById("loginBtn").addEventListener("click", () => {
  const clave = document.getElementById("accessKey").value;
  if(clave === "controlSergio2025") {
    document.getElementById("formulario").style.display = "block";
  } else {
    alert("Clave incorrecta");
  }
});

// Guardar boleta
document.getElementById("guardar").addEventListener("click", async () => {
  const boleta = {
    numero: document.getElementById("numero").value,
    cliente: document.getElementById("cliente").value,
    vendedor: document.getElementById("vendedor").value,
    grupo: document.getElementById("grupo").value,
    telefono: document.getElementById("telefono").value,
    estado: document.getElementById("estado").value,
    valor: document.getElementById("valor").value
  };

  // Convertir boleta a base64 para GitHub API
  const content = btoa(JSON.stringify(boleta));

  try {
    const response = await fetch("https://api.github.com/repos/sergiolexdiaz/datosvotaciones/contents/boletas.json", {
      method: "PUT",
      headers: {
        "Authorization": `token ${token}`,
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        message: `Agregar boleta #${boleta.numero}`,
        content: content,
        branch: "main"
      })
    });

    if(response.ok) {
      alert("Boleta guardada en GitHub correctamente ✅");
    } else {
      const error = await response.json();
      alert("Error al guardar: " + error.message);
    }
  } catch(err) {
    alert("Error de red: " + err.message);
  }
});
