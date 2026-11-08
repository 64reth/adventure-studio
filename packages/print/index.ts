export type PrintProfile='no-bleed'|'kdp-bleed';
export function gutter(count:number):number {if(!Number.isInteger(count)||count<1||count>828)throw new Error('Page count must be 1–828');return count<=150?.375:count<=300?.5:count<=500?.625:count<=700?.75:.875;}
export function layout(profile:PrintProfile,page:number,count:number,inset=.385){
 if(!Number.isInteger(page)||page<1||page>count)throw new Error('Invalid page number');
 if(!Number.isFinite(inset)||inset<.385)throw new Error('Design inset must be at least 0.385 inches');
 const bleed=profile==='kdp-bleed';const odd=page%2===1;const inside=Math.max(gutter(count),inset);const outside=Math.max(bleed?.375:.25,inset);
 const trim={x:bleed&&!odd?.125:0,y:bleed?.125:0,width:8.5,height:11};
 return {width:bleed?8.625:8.5,height:bleed?11.25:11,trim,gutter:inside,safe:{x:trim.x+(odd?inside:outside),y:trim.y+outside,width:8.5-inside-outside,height:11-2*outside}};
}
