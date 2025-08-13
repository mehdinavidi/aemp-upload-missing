(function(){
  if (window.DATA && Array.isArray(window.DATA.sets)) return;
  const sets = [
    { id:1, code:'ACH-101', name:'Standard-OP Set', department:'Chirurgie', status:'Freigegeben', image_url:'' },
    { id:2, code:'ACH-102', name:'Laparoskopie Set', department:'Chirurgie', status:'Freigegeben', image_url:'' },
    { id:3, code:'ACH-103', name:'Orthopädie Standard', department:'Ortho', status:'Freigegeben', image_url:'' }
  ];
  const instruments = [
    { id:1, code:'INST-1', name:'Skalpellgriff Nr. 4', category:'Schneiden', image_url:'' },
    { id:2, code:'INST-2', name:'Schere Metzenbaum 14 cm', category:'Schneiden', image_url:'' },
    { id:3, code:'INST-3', name:'Pinzette anatomisch 14 cm', category:'Greifen', image_url:'' },
    { id:4, code:'INST-4', name:'Klemme Kocher gebogen', category:'Klemmen', image_url:'' },
    { id:5, code:'INST-5', name:'Nadelhalter Mayo-Hegar 16 cm', category:'Halten/Nähen', image_url:'' }
  ];
  const setInstruments = [
    { set_id:1, instrument_id:1, qty_required:2 },
    { set_id:1, instrument_id:2, qty_required:1 },
    { set_id:1, instrument_id:3, qty_required:2 },
    { set_id:1, instrument_id:4, qty_required:2 },
    { set_id:1, instrument_id:5, qty_required:1 },
    { set_id:2, instrument_id:1, qty_required:1 },
    { set_id:2, instrument_id:3, qty_required:2 },
    { set_id:2, instrument_id:4, qty_required:2 },
    { set_id:3, instrument_id:1, qty_required:1 },
    { set_id:3, instrument_id:2, qty_required:2 },
    { set_id:3, instrument_id:4, qty_required:3 },
    { set_id:3, instrument_id:5, qty_required:1 }
  ];
  window.DATA = { sets, instruments, setInstruments };
})();
