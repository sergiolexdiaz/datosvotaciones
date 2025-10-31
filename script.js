// script.js - cliente
const RAW_URL = "https://raw.githubusercontent.com/sergiolexdiaz/datosvotaciones/main/boletas.xlsx";

const $ = sel => document.querySelector(sel);
const loginDiv = document.getElementById('login');
const appDiv = document.getElementById('app');
const keyInput = document.getElementById('accessKey');

document.getElementById('btnLogin').addEventListener('click', ()=>{
  const k = keyInput.value.trim();
  if(k === 'controlSergio2025'){
    loginDiv.style.display='none';
    appDiv.style.display='block';
    loadAndShow();
  } else {
    alert('Clave incorrecta');
  }
});

async function fetchExcelRaw(url){
  const res = await fetch(url);
  if(!res.ok) throw new Error('No se pudo obtener el Excel: '+res.status);
  const ab = await res.arrayBuffer();
  return ab;
}

function formatMoney(n){ return Number(n).toLocaleString('es-CO'); }

async function loadAndShow(){
  try{
    $('#status').textContent = 'Cargando...';
    const ab = await fetchExcelRaw(RAW_URL);
    const data = new Uint8Array(ab);
    const wb = XLSX.read(data, {type:'array'});
    const sheet = wb.Sheets[wb.SheetNames[0]];
    const json = XLSX.utils.sheet_to_json(sheet, {defval:''});
    renderTable(json);
    $('#status').textContent = 'Datos cargados.';
  }catch(e){
    $('#status').textContent = 'Error: '+e.message;
  }
}

function renderTable(rows){
  const div = document.getElementById('tablaCont');
  if(!rows.length){ div.innerHTML = '<p class="muted">Archivo vacío</p>'; return; }
  let html='<table><thead><tr><th>N°</th><th>Vendedor</th><th>Grupo</th><th>Cliente</th><th>Tel</th><th>Estado</th><th>Valor</th></tr></thead><tbody>';
  rows.forEach(r=>{
    html += `<tr><td>${r['N°']||r['Número de Boleta']||''}</td><td>${r['Vendedor']||''}</td><td>${r['Grupo']||''}</td><td>${r['Nombre del cliente']||''}</td><td>${r['Teléfono']||''}</td><td>${r['Estado']||''}</td><td>${r['Valor']||''}</td></tr>`;
  });
  html += '</tbody></table>';
  div.innerHTML = html;
}

// Form submit: send to backend endpoint /save (must run save_boleta.js locally or hosted)
document.getElementById('formBoleta').addEventListener('submit', async (e)=>{
  e.preventDefault();
  const payload = {
    numero: Number($('#numBoleta').value),
    vendedor: $('#vendedor').value,
    grupo: $('#grupo').value,
    cliente: $('#cliente').value,
    telefono: $('#telefono').value,
    estado: $('#estado').value,
    valor: Number($('#valor').value),
    observaciones: $('#obs').value
  };
  // POST to local backend - default endpoint http://localhost:3000/save
  try{
    $('#status').textContent = 'Enviando...';
    const res = await fetch('/save', {
      method: 'POST',
      headers: {'Content-Type':'application/json'},
      body: JSON.stringify(payload)
    });
    const j = await res.json();
    if(res.ok){
      $('#status').textContent = 'Guardado ✅';
      loadAndShow();
    } else {
      $('#status').textContent = 'Error: '+ (j.message || res.statusText);
    }
  }catch(err){
    $('#status').textContent = 'No se pudo conectar al backend. Ejecuta save_boleta.js en tu máquina (ver README).';
  }
});

// download excel button - simply opens the raw file
document.getElementById('btnDescargar').addEventListener('click', ()=>{
  window.open(RAW_URL, '_blank');
});

document.getElementById('btnRefresh').addEventListener('click', loadAndShow);
