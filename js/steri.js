
function wireSteri(){
  const input=document.getElementById("scanInput");
  const tbody=document.getElementById("scanTbody");
  const btnClear=document.getElementById("clearScans");
  const btnRelease=document.getElementById("steriRelease");

  function findByLabel(label){
    const sessions=loadSessions();
    for(const [k,v] of Object.entries(sessions)){ if(v?.label===label) return { setId:parseInt(k,10), sess:v }; }
    return null;
  }
  function addRow(label){
    const hit=findByLabel(label);
    const tr=document.createElement("tr");
    if(!hit){
      tr.innerHTML = `<td>${label}</td><td class="subtle">-</td><td><span class="badge bad">Unbekannt</span></td><td></td>`;
    }else{
      const s=getSetById(hit.setId);
      const st=hit.sess.released_at?'<span class="badge good">Freigegeben</span>':'<span class="badge warn">bereit</span>';
      tr.dataset.setId=hit.setId; tr.dataset.label=label;
      tr.innerHTML = `<td>${label}</td><td>${s.code} – ${s.name}</td><td>${st}</td><td><button class="ghost" data-remove>Entfernen</button></td>`;
    }
    tbody.prepend(tr);
  }

  input.onkeydown=(e)=>{
    if(e.key==="Enter"){
      e.preventDefault();
      const raw=(input.value||"").trim();
      if(!raw) return;
      raw.split(/[\s,;]+/).forEach(x=>{ if(x) addRow(x); });
      input.value="";
    }
  };
  tbody.addEventListener("click",(e)=>{ const b=e.target.closest("[data-remove]"); if(b) b.closest("tr").remove(); });
  btnClear.onclick=()=> tbody.innerHTML="";
  btnRelease.onclick=()=>{
    const rows=Array.from(tbody.querySelectorAll("tr")]);
    if(!rows.length){ alert('Keine Etiketten in der Liste.'); return; }
    const sessions=loadSessions(); let cnt=0;
    rows.forEach(tr=>{
      const id=parseInt(tr.dataset.setId||'0',10); const lab=tr.dataset.label;
      if(!id||!lab) return; const sess=sessions[id]; if(!sess) return;
      sess.released_at=new Date().toISOString(); sess.steri_by=(getUser()?.username)||'steri'; cnt++;
    });
    saveSessions(sessions); alert(cnt+' Set(s) freigegeben.'); tbody.innerHTML=''; renderSetList(searchEl.value); renderDetails();
  }
  };
}
