document.addEventListener("DOMContentLoaded", () => {
  // 🔑 Tu token directo (NO lo compartas públicamente)
  const token = "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";
  const repoOwner = "sergiolexdiaz";
  const repoName = "datosvotaciones";
  const filePath = "boletas.json";
  const branch = "main";

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

    const content = btoa(JSON.stringify([boleta])); // Se guarda como array para futuras boletas

    try {
      // 1️⃣ Ver si el archivo ya existe para obtener su SHA
      let sha = null;
      const getResp = await fetch(`https://api.github.com/repos/${repoOwner}/${repoName}/contents/${filePath}?ref=${branch}`, {
        headers: {
          "Authorization": `Bearer ${token}`,
          "Content-Type": "application/json"
        }
      });

      if(getResp.ok) {
        const data = await getResp.json();
        sha = data.sha; // si existe, obtenemos SHA para actualizar
      }

      // 2️⃣ Subir o actualizar archivo
      const putResp = await fetch(`https://api.github.com/repos/${repoOwner}/${repoName}/contents/${filePath}`, {
        method: "PUT",
        headers: {
          "Authorization": `Bearer ${token}`,
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          message: `Agregar boleta #${boleta.numero}`,
          content: content,
          sha: sha, // null si es nuevo
          branch: branch
        })
      });

      if(putResp.ok) {
        alert("Boleta guardada en GitHub correctamente ✅");
      } else {
        const error = await putResp.json();
        alert("Error al guardar: " + error.message);
      }

    } catch(err) {
      alert("Error de red: " + err.message);
    }
  });
});
