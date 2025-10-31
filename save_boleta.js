// save_boleta.js
// Node.js backend to receive form submissions and update boletas.xlsx in the GitHub repo.
// IMPORTANT: paste your token into GITHUB_TOKEN variable below BEFORE running.
//
// Usage:
// 1. npm install express node-fetch @octokit/rest xlsx
// 2. node save_boleta.js
//
// The server listens on http://localhost:3000 and exposes POST /save
//
// The script will:
// - fetch boletas.xlsx from the repository (raw)
// - parse it, update the row (by N°) or append if empty
// - upload the new file back to the repo using GitHub Contents API (requires token)
//
// WARNING: keep your token private! Do NOT commit it into a public repo.

const express = require('express');
const fetch = require('node-fetch');
const XLSX = require('xlsx');
const { Octokit } = require('@octokit/rest');

const APP_PORT = 3000;

// === CONFIGURE BELOW ===
// Paste your token here (keep file private, do NOT commit)
const GITHUB_TOKEN = "AQUÍ_PEGAS_TU_TOKEN_PRIVADO";
const GITHUB_USER = "sergiolexdiaz";
const GITHUB_REPO = "datosvotaciones";
const GITHUB_PATH = "boletas.xlsx"; // path in repo
const BRANCH = "main";
// ========================

if(!GITHUB_TOKEN || GITHUB_TOKEN.includes("AQUÍ_PEGAS")){
  console.error("ERROR: pega tu token en la variable GITHUB_TOKEN dentro de este archivo antes de ejecutar.");
  process.exit(1);
}

const octokit = new Octokit({ auth: GITHUB_TOKEN });
const app = express();
app.use(express.json({limit:'10mb'}));

async function getFileAndSha(){
  // get content metadata
  const res = await octokit.repos.getContent({ owner: GITHUB_USER, repo: GITHUB_REPO, path: GITHUB_PATH, ref: BRANCH });
  const sha = res.data.sha;
  const download_url = res.data.download_url;
  // fetch raw
  const raw = await fetch(download_url);
  const buffer = await raw.arrayBuffer();
  return { buffer: Buffer.from(buffer), sha };
}

async function updateFile(buffer, sha, message){
  const contentBase64 = buffer.toString('base64');
  await octokit.repos.createOrUpdateFileContents({
    owner: GITHUB_USER,
    repo: GITHUB_REPO,
    path: GITHUB_PATH,
    message: message,
    content: contentBase64,
    branch: BRANCH,
    sha: sha
  });
}

app.post('/save', async (req, res)=>{
  try{
    const payload = req.body;
    // fetch current file
    const { buffer, sha } = await getFileAndSha();
    const workbook = XLSX.read(buffer, {type:'buffer'});
    const sheetName = workbook.SheetNames[0];
    const sheet = workbook.Sheets[sheetName];
    const rows = XLSX.utils.sheet_to_json(sheet, {defval:''});

    // find row by N°
    const n = Number(payload.numero);
    let found = false;
    for(let i=0;i<rows.length;i++){
      const row = rows[i];
      const rowNum = Number(row['N°'] || row['Número de Boleta'] || row['Numero'] || '');
      if(rowNum === n){
        // update fields
        row['Vendedor'] = payload.vendedor || row['Vendedor'];
        row['Grupo'] = payload.grupo || row['Grupo'];
        row['Nombre del cliente'] = payload.cliente || row['Nombre del cliente'];
        row['Teléfono'] = payload.telefono || row['Teléfono'];
        row['Estado'] = payload.estado || row['Estado'];
        row['Valor'] = payload.valor || row['Valor'];
        row['Observaciones'] = payload.observaciones || row['Observaciones'];
        row['Fecha'] = new Date().toLocaleString();
        found = true;
        break;
      }
    }
    if(!found){
      // append new row
      rows.push({
        'N°': n,
        'Vendedor': payload.vendedor || '',
        'Grupo': payload.grupo || '',
        'Nombre del cliente': payload.cliente || '',
        'Teléfono': payload.telefono || '',
        'Estado': payload.estado || '',
        'Valor': payload.valor || 0,
        'Observaciones': payload.observaciones || '',
        'Fecha': new Date().toLocaleString()
      });
    }

    // convert back to sheet and workbook
    const newSheet = XLSX.utils.json_to_sheet(rows, {skipHeader:false});
    const newWb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(newWb, newSheet, sheetName || 'Boletas');
    const wbout = XLSX.write(newWb, {type:'buffer', bookType:'xlsx'});

    // update file on GitHub
    await updateFile(wbout, sha, `Actualizar boleta ${n} via Control Boletas`);
    res.json({ ok:true, message: 'Guardado en repo' });
  }catch(err){
    console.error(err);
    res.status(500).json({ok:false, message: err.message});
  }
});

app.listen(APP_PORT, ()=> console.log('Backend listening on http://localhost:'+APP_PORT));
