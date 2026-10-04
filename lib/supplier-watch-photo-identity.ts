/** Compare separately declared Ultra case, band, colour and size facts. */
export function matchesSupplierUltraPhoto(catalogTitle:string,sourceTitle:string):boolean {
 const expected=catalogTitle.match(/^Ultra ([23]) 49mm (Natural|Black) Ti (Blue|Black|Natural) (Ocean Band|Alpine Loop|Trail Loop|Milanese Loop)(?: (Small|Medium|Large|S\/M|M\/L))?$/);
 if(!expected)return false;
 const [,generation,finish,color,band,length]=expected;
 const norm=(value:string)=>value.toLowerCase().replace(/ё/g,'е').replace(/(\d+)\s*(?:mm|мм)/g,'$1 мм').replace(/watch\s+ultra\s*(\d)/g,'watch ultra $1').replace(/[^\p{L}\p{N}]+/gu,' ').trim();
 const title=` ${norm(sourceTitle)} `;
 const has=(phrase:string)=>title.includes(` ${norm(phrase)} `);
 if(!has(`Apple Watch Ultra ${generation}`)||!has('49 мм'))return false;
 const caseNames=finish==='Natural'?['Natural Titanium','натуральный титан']:['Black Titanium','Satin Black','черный титан'];
 const actualCase=caseNames.find(has);if(!actualCase)return false;
 const bandName=band==='Trail Loop'?(has(band)?band:has('Trail')?'Trail':undefined):has(band)?band:undefined;
 if(!bandName)return false;
 for(const other of ['Ocean Band','Alpine Loop','Trail Loop','Milanese Loop'])if(other!==band&&has(other))return false;
 const strap=` ${title.replace(` ${norm(actualCase)} `,' ')} `;
 const shades:Record<string,string[]>={Blue:['blue','синий','голубой','темно синий'],Black:['black','черный','bl charcoal'],Natural:['natural','натуральный']};
 if(!shades[color].some(shade=>strap.includes(` ${norm(shade)} `)))return false;
 if(length==='S/M'||length==='M/L'){
  const aliases=length==='S/M'?['s m','sm']:['m l','ml'];
  const conflicting=length==='S/M'?['m l','ml']:['s m','sm'];
  if(!aliases.some(has)||conflicting.some(has))return false;
 }else if(length){
  const letter=({Small:'s',Medium:'m',Large:'l'} as Record<string,string>)[length];
  const letters=[...title.matchAll(/(?<= )([sml])(?= )/g)].map(m=>m[1]);
  if(!has(length)&&(letters.length!==1||letters[0]!==letter))return false;
 }
 return true;
}
