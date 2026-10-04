import type {CatalogItem} from './catalog-registry';
type PhotoSource={source?:string;sourceTitle?:string};

/** The basic AirPods 4 case differs from the ANC charging case. */
export function photoSourceMatchesItem(item:Pick<CatalogItem,'model'|'configuration'>,entry:PhotoSource):boolean {
 if(item.model!=='AirPods 4'||/\bANC\b|Active Noise Cancellation|с шумоподавлением/i.test(item.configuration??''))return true;
 const evidence=`${entry.sourceTitle??''} ${entry.source??''}`.toLowerCase();
 return !/\banc\b|active[-\s]+noise[-\s]+cancell|с\s+шумоподавлен|s-shumopodavlen/.test(evidence);
}
