import type {Asset,Mechanic} from '../core/index';
import {scenery} from '../composer/index';
export type ArtworkRequest={theme:string;mechanic:Mechanic;seed:string;references:string[]};
export interface ArtworkProvider {id:string;capabilities:{references:boolean;variation:boolean;paid:boolean};generate(request:ArtworkRequest):Promise<{svg:string;asset:Asset;cost:number}>}
export async function sha256(content:string){return Array.from(new Uint8Array(await crypto.subtle.digest('SHA-256',new TextEncoder().encode(content)))).map(n=>n.toString(16).padStart(2,'0')).join('');}
export function prompt(request:ArtworkRequest){return `Original ${request.theme} colouring scenery. Bold black outlines, white enclosed areas, no shading. Perspective top-down. Decorative perimeter only. Do not alter protected ${request.mechanic} puzzle geometry. Seed ${request.seed}. No third-party characters or artist imitation.`;}
export class LocalArtworkProvider implements ArtworkProvider {
 id='original-svg';capabilities={references:false,variation:false,paid:false};
 async generate(request:ArtworkRequest){const svg=`<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 550 580">${scenery(request.mechanic,request.theme)}</svg>`,hash=await sha256(svg);return {svg,cost:0,asset:{id:hash,type:'svg' as const,provider:this.id,source:'Adventure Studio original procedural SVG',creationRecord:prompt(request),version:'1.0.0',createdAt:new Date().toISOString(),licence:'Original project-authored artwork; human commercial review required',rightsReview:'Needs Review' as const,contentHash:hash,file:`assets/${hash}.svg`}};}
}
export class SpendingGuard implements ArtworkProvider{
 id='disabled-external';capabilities={references:false,variation:false,paid:true};
 async generate(_request:ArtworkRequest):Promise<never>{throw new Error('Paid generation is disabled. Separate spending authorisation and a configured provider are required.');}
}
