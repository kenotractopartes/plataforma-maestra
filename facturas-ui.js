(function(root){
  'use strict';
  const dateFormatter=new Intl.DateTimeFormat('es-MX',{day:'numeric',month:'long',year:'numeric',timeZone:'UTC'});
  function fecha(value){
    const day=String(value||'').slice(0,10);
    if(!/^\d{4}-\d{2}-\d{2}$/.test(day))return 'Fecha por confirmar';
    const date=new Date(day+'T12:00:00Z');
    if(!Number.isFinite(date.getTime())||date.toISOString().slice(0,10)!==day)return 'Fecha por confirmar';
    return dateFormatter.format(date);
  }
  function empresaKey(value){
    const name=String(value||'Empresa por revisar').normalize('NFD').replace(/[\u0300-\u036f]/g,'').trim().replace(/\s+/g,' ').toUpperCase();
    // Both names appear on Leadway's invoice/CFDI. This groups the filter only, not payments.
    return /^LEADWAY CRM SOFTWARE(?: BY LEVA)?$/.test(name)?'LEADWAY CRM SOFTWARE':name;
  }
  function empresaLabel(value){return empresaKey(value)==='LEADWAY CRM SOFTWARE'?'Leadway CRM Software':value||'Empresa por revisar'}
  function tarjetas(record){return [...new Set([...(record.tarjetas||[]),record.tarjeta,...(record.archivos||[]).flatMap(f=>f.tarjetas||[])].filter(x=>/^\d{4}$/.test(x||'')))];}
  function ordenArchivos(record){
    function score(f){return f.tipo==='application/pdf'?(f.tiene_metodo_pago?(f.rotulo==='recibo'?0:1):f.rotulo==='recibo'?2:3):4}
    return (record.archivos||[]).map((file,index)=>({file,index})).sort((a,b)=>score(a.file)-score(b.file)||a.index-b.index);
  }
  function filtradas(records,{desde='0000',hasta='9999',consulta='',excluidas=[]}={}){
    const excluded=new Set(excluidas),query=String(consulta).trim().toLocaleLowerCase();
    return records.filter(r=>r.fecha>=desde&&r.fecha<=hasta&&!excluded.has(empresaKey(r.empresa))&&(!query||[r.empresa,r.folio,r.uuid,(r.comprobantes||[]).map(c=>[c.empresa,c.folio,c.uuid].join(' ')).join(' '),(r.fuentes||[]).map(f=>f.asunto).join(' ')].join(' ').toLocaleLowerCase().includes(query)));
  }
  const api={fecha,empresaKey,empresaLabel,tarjetas,ordenArchivos,filtradas};
  if(typeof module==='object'&&module.exports)module.exports=api;else root.FacturasUI=api;
})(typeof window==='object'?window:this);
