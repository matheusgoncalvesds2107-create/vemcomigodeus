const BASE = 'https://servidor-vem-comigo-deus-qi8q.onrender.com';
const STREAM = BASE + '/radio.mp3';

const radio = document.getElementById('radio');
const playBtn = document.getElementById('playBtn');
const muteBtn = document.getElementById('muteBtn');
const reloadBtn = document.getElementById('reloadBtn');
const volume = document.getElementById('volume');
const visualizer = document.getElementById('visualizer');
const playerStatus = document.getElementById('playerStatus');
const currentTrack = document.getElementById('currentTrack');
const currentKind = document.getElementById('currentKind');
const listeners = document.getElementById('listeners');
const serverBadge = document.getElementById('serverBadge');
const liveLabel = document.getElementById('liveLabel');
const prayBtn = document.getElementById('prayBtn');

let installPrompt = null;

radio.volume = Number(volume.value);

async function playRadio(){
  try{
    playerStatus.textContent = 'Conectando ao sinal...';
    radio.src = STREAM + '?t=' + Date.now();
    await radio.play();
    playBtn.textContent = '❚❚';
    visualizer.classList.add('playing');
    playerStatus.textContent = 'Transmitindo ao vivo';
  }catch(e){
    playerStatus.textContent = 'Toque novamente para iniciar o áudio.';
  }
}

function pauseRadio(){
  radio.pause();
  playBtn.textContent = '▶';
  visualizer.classList.remove('playing');
  playerStatus.textContent = 'Pausado';
}

playBtn.addEventListener('click', ()=>{
  if(radio.paused) playRadio();
  else pauseRadio();
});

muteBtn.addEventListener('click', ()=>{
  radio.muted = !radio.muted;
  muteBtn.textContent = radio.muted ? '🔇' : '🔊';
});

volume.addEventListener('input', ()=>{
  radio.volume = Number(volume.value);
  if(radio.volume > 0){
    radio.muted = false;
    muteBtn.textContent = '🔊';
  }
});

reloadBtn.addEventListener('click', async ()=>{
  const wasPlaying = !radio.paused;
  radio.pause();
  radio.src = STREAM + '?t=' + Date.now();
  radio.load();
  if(wasPlaying) await playRadio();
  else playerStatus.textContent = 'Sinal recarregado';
});

radio.addEventListener('playing', ()=>{
  playBtn.textContent = '❚❚';
  visualizer.classList.add('playing');
  playerStatus.textContent = 'Transmitindo ao vivo';
});

radio.addEventListener('waiting', ()=>{
  playerStatus.textContent = 'Reconectando...';
});

radio.addEventListener('error', ()=>{
  playBtn.textContent = '▶';
  visualizer.classList.remove('playing');
  playerStatus.textContent = 'Sinal indisponível no momento';
});

async function updateStatus(){
  try{
    const [healthRes,statusRes] = await Promise.all([
      fetch(BASE + '/health?ts=' + Date.now(), {cache:'no-store'}),
      fetch(BASE + '/status?ts=' + Date.now(), {cache:'no-store'})
    ]);

    const h = await healthRes.json();
    const s = await statusRes.json();

    listeners.textContent = h.listeners ?? s.listeners ?? 0;
    currentTrack.textContent = s.currentTrack || h.currentTrack || 'Web Rádio Vem Comigo Deus';

    if(h.sourceConnected){
      currentKind.textContent = 'Painel Web Rádio • AO VIVO';
      liveLabel.textContent = 'PAINEL AO VIVO';
    }else{
      currentKind.textContent = 'Programação automática / fallback';
      liveLabel.textContent = 'NO AR AGORA';
    }

    serverBadge.textContent = h.onAir ? '● SERVIDOR ONLINE' : '● OFFLINE';
    serverBadge.className = 'server-badge ' + (h.onAir ? 'ok' : 'bad');
  }catch(e){
    serverBadge.textContent = '● SERVIDOR OFFLINE';
    serverBadge.className = 'server-badge bad';
  }
}

prayBtn.addEventListener('click', ()=>{
  alert('🙏 Senhor, entregamos este momento em Tuas mãos. Leva paz, força e esperança a cada pessoa que está ouvindo. Amém.');
});

window.addEventListener('beforeinstallprompt', e=>{
  e.preventDefault();
  installPrompt = e;
  document.getElementById('installBtn').hidden = false;
});

document.getElementById('installBtn').addEventListener('click', async ()=>{
  if(!installPrompt) return;
  installPrompt.prompt();
  try{ await installPrompt.userChoice; }catch{}
  installPrompt = null;
  document.getElementById('installBtn').hidden = true;
});

if('serviceWorker' in navigator){
  navigator.serviceWorker.register('./sw.js').catch(()=>{});
}

updateStatus();
setInterval(updateStatus,15000);
