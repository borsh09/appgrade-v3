export function track(event:'page_view'|'add_to_cart'|'client_error'|'checkout_started'){
  if(typeof window==='undefined')return;
  void fetch('/api/events',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({event}),keepalive:true}).catch(()=>{});
}
