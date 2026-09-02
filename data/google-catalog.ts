export interface GoogleCatalogSku { id:string; model:string; modelSlug:string; storage:string; color:string; price:number; image:string; gallery:string[] }
export const googleSlugify=(value:string)=>value.toLowerCase().replace(/[^a-z0-9]+/g,'-').replace(/^-|-$/g,'');
const models=[
  {model:'Google Pixel 10 Pro XL',storage:'256 ГБ',price:68000,prefix:'pixel10proxl',colors:[['Обсидиан','obsidian'],['Фарфор','porcelain'],['Лунный камень','moonstone'],['Нефрит','jade']]},
  {model:'Google Pixel 10',storage:'256 ГБ',price:47000,prefix:'pixel10',colors:[['Индиго','indigo'],['Обсидиан','obsidian'],['Лаймовый','lemongrass'],['Морозный','frost']]},
  {model:'Google Pixel 9 Pro XL',storage:'128 ГБ',price:49900,prefix:'pixel9proxl',colors:[['Фарфор','porcelain'],['Розовый кварц','rose-quartz'],['Серо-зелёный','hazel'],['Обсидиан','obsidian']]},
] as const;
export const googleCatalog:GoogleCatalogSku[]=models.flatMap(item=>item.colors.map(([color,colorSlug])=>{const folder=`${item.prefix}-${colorSlug}`;const gallery=[1,2,3].map(i=>`/images/products/gallery/${folder}/view-${i}.jpg`);return{id:folder,model:item.model,modelSlug:googleSlugify(item.model),storage:item.storage,color,price:item.price,image:gallery[0],gallery}}));
export const googleModels=[...new Map(googleCatalog.map(s=>[s.modelSlug,s.model])).entries()].map(([slug,name])=>({slug,name}));
