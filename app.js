const BASE='https://servidor-vem-comigo-deus-qi8q.onrender.com';
const STREAM=BASE+'/radio.mp3';

const radio=document.getElementById('radio');
const playBtn=document.getElementById('playBtn');
const muteBtn=document.getElementById('muteBtn');
const reloadBtn=document.getElementById('reloadBtn');
const volume=document.getElementById('volume');
const visualizer=document.getElementById('visualizer');
const playerStatus=document.getElementById('playerStatus');

radio.volume=Number(volume.value);

async function tocar(){
  try{
    playerStatus.textContent='Conectando ao sinal...';
    radio.src=STREAM+'?t='+Date.now();
    await radio.play();
    playBtn.textContent='❚❚';
    visualizer.classList.add('playing');
    playerStatus.textContent='Transmitindo ao vivo';
  }catch(e){
    playerStatus.textContent='Toque novamente para ouvir';
  }
}
function pausar(){
  radio.pause();
  playBtn.textContent='▶';
  visualizer.classList.remove('playing');
  playerStatus.textContent='Pausado';
}
playBtn.onclick=()=>radio.paused?tocar():pausar();

muteBtn.onclick=()=>{
  radio.muted=!radio.muted;
  muteBtn.textContent=radio.muted?'🔇':'🔊';
};

volume.oninput=()=>{
  radio.volume=Number(volume.value);
  if(radio.volume>0){
    radio.muted=false;
    muteBtn.textContent='🔊';
  }
};

reloadBtn.onclick=async()=>{
  const wasPlaying=!radio.paused;
  radio.pause();
  radio.src=STREAM+'?t='+Date.now();
  radio.load();
  if(wasPlaying)await tocar();
};

radio.addEventListener('playing',()=>{
  visualizer.classList.add('playing');
  playBtn.textContent='❚❚';
  playerStatus.textContent='Transmitindo ao vivo';
});
radio.addEventListener('waiting',()=>playerStatus.textContent='Reconectando...');
radio.addEventListener('error',()=>{
  visualizer.classList.remove('playing');
  playBtn.textContent='▶';
  playerStatus.textContent='Sinal indisponível no momento';
});

async function atualizar(){
  try{
    const [hr,sr]=await Promise.all([
      fetch(BASE+'/health?ts='+Date.now(),{cache:'no-store'}),
      fetch(BASE+'/status?ts='+Date.now(),{cache:'no-store'})
    ]);
    const h=await hr.json();
    const s=await sr.json();

    document.getElementById('currentTrack').textContent=s.currentTrack||h.currentTrack||'Web Rádio Vem Comigo Deus';
    document.getElementById('listeners').textContent=h.listeners??s.listeners??0;

    const badge=document.getElementById('serverBadge');
    badge.textContent=h.onAir?'● NO AR':'● OFFLINE';
    badge.className='live-badge '+(h.onAir?'ok':'bad');

    document.getElementById('sourceLabel').textContent=
      h.sourceConnected?'Painel Web Rádio • AO VIVO':'Programação automática / fallback';
  }catch{
    const badge=document.getElementById('serverBadge');
    badge.textContent='● OFFLINE';
    badge.className='live-badge bad';
  }
}

if('serviceWorker' in navigator){
  navigator.serviceWorker.register('./sw.js').catch(()=>{});
}
atualizar();
setInterval(atualizar,15000);


let deferredInstallPrompt=null;
const installBtn=document.getElementById('installAppBtn');

window.addEventListener('beforeinstallprompt',event=>{
  event.preventDefault();
  deferredInstallPrompt=event;
  if(installBtn) installBtn.hidden=false;
});

if(installBtn){
  installBtn.addEventListener('click',async()=>{
    if(!deferredInstallPrompt)return;
    deferredInstallPrompt.prompt();
    try{await deferredInstallPrompt.userChoice}catch{}
    deferredInstallPrompt=null;
    installBtn.hidden=true;
  });
}

window.addEventListener('appinstalled',()=>{
  deferredInstallPrompt=null;
  if(installBtn) installBtn.hidden=true;
});
