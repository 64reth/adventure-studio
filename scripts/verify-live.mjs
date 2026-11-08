import {chromium} from '@playwright/test';
import fs from 'node:fs/promises';
import crypto from 'node:crypto';
const base=process.env.STAGING_URL;
if(!base?.startsWith('https://'))throw new Error('Set STAGING_URL to the authorised HTTPS staging origin');
const browser=await chromium.launch({headless:true});
try{
 const page=await browser.newPage({viewport:{width:1440,height:1000}});
 const errors=[];
 page.on('pageerror',e=>errors.push(String(e)));
 await page.goto(base);
 await page.waitForSelector('.adventure-card');
 await page.screenshot({path:'artifacts/ui-dashboard.png',fullPage:true});
 await page.getByRole('button',{name:'Page Studio',exact:true}).click();
 await page.waitForSelector('[data-layer="puzzle"]');
 await page.screenshot({path:'artifacts/ui-page-studio.png',fullPage:true});
 await page.setViewportSize({width:820,height:1180});
 await page.screenshot({path:'artifacts/ui-tablet.png',fullPage:true});
 const overflow=await page.evaluate(()=>document.documentElement.scrollWidth>innerWidth);
 if(overflow)throw new Error('Tablet page overflows viewport');
 const hash=bytes=>crypto.createHash('sha256').update(bytes).digest('hex');
 const pdfs=[];
 for(const profile of ['no-bleed','kdp-bleed'])for(const name of ['interior','answers']){
  const response=await page.request.get(base+`/prototype/${profile}/${name}.pdf`);
  if(response.status()!==200)throw new Error('Live sample PDF failed');
  const bytes=await response.body();
  const local=await fs.readFile(`artifacts/enchanted-kingdom/${profile}/${name}.pdf`);
  if(hash(bytes)!==hash(local))throw new Error('Live PDF hash mismatch');
  pdfs.push({profile,name,status:200,sha256:hash(bytes)});
 }
 if(errors.length)throw new Error(errors.join('\n'));
 const adventure=JSON.parse(await fs.readFile('artifacts/enchanted-kingdom/no-bleed/adventure.json','utf8'));
 const response=await fetch(base+'/api/export',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({adventure,mode:'review',profile:'no-bleed'})});
 if(!response.ok)throw new Error(await response.text());
 await fs.writeFile('/tmp/adventure-live-review-export.zip',new Uint8Array(await response.arrayBuffer()));
 await fs.writeFile('artifacts/live-verification.json',JSON.stringify({url:base,version:process.env.DEPLOYMENT_VERSION,browserErrors:errors,tabletOverflow:overflow,pdfs,dynamicExportHTTP:response.status},null,2));
 console.log('Live desktop/tablet, four PDF hashes and dynamic export verified.');
}finally{await browser.close();}
