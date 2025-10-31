Control Boletas - Paquete para sincronizar boletas con GitHub
===========================================================

Contenido:
- index.html (panel + formulario)
- style.css
- script.js (cliente)
- save_boleta.js (Node backend that updates boletas.xlsx in the repo)
- boletas.xlsx (blank, 1..1000 rows)
- README.txt (estas instrucciones)

INSTRUCCIONES RÁPIDAS
1) Edita save_boleta.js y pega tu token en la variable GITHUB_TOKEN (NO subir a repos públicos).
2) Instalar dependencias (desde la carpeta del paquete):
   npm install express node-fetch xlsx @octokit/rest
3) Ejecutar el backend:
   node save_boleta.js
4) Subir index.html, style.css y script.js a GitHub Pages (o mantenerlos en el repo).
5) Abre la web y usa la clave: controlSergio2025 para entrar.
6) Al enviar el formulario, el backend actualizará boletas.xlsx en tu repo.

SEGURIDAD
- Nunca publiques tu token en un repo público.
- Puedes desplegar el backend en un servidor privado o en servicios como Render/Replit (oculta el token en variables de entorno).
