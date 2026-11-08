"""Optional regeneration; requires fontTools. UI variable fonts remain unchanged.
OFL licences alongside the fonts apply to these fixed-weight print instances.
"""
from fontTools.ttLib import TTFont
from fontTools.varLib.instancer import instantiateVariableFont
for name in ['Fredoka','Nunito']:
    path=f'apps/studio/public/fonts/{name.lower()}/{name}.ttf'
    font=TTFont(path)
    axes={a.axisTag:500 if a.axisTag=='wght' else a.defaultValue for a in font['fvar'].axes}
    instantiateVariableFont(font,axes,inplace=False,updateFontNames=True).save(path.replace('.ttf','-Print.ttf'))
