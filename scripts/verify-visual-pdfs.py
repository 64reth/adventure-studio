"""Optional PyMuPDF check of the Build 006 visual-editor print fixture."""
import fitz, json, pathlib
root=pathlib.Path('artifacts/build-006');report=[]
for name in ['interior','answers']:
    document=fitz.open(root/(name+'.pdf'))
    assert len(document)==1
    page=document[0];expected=(210/25.4*72,297/25.4*72)
    assert abs(page.rect.width-expected[0])<.01 and abs(page.rect.height-expected[1])<.01
    fonts=[f[3] for f in page.get_fonts()]
    assert len(fonts)==3
    assert all(document.extract_font(f[0])[3] for f in page.get_fonts())
    for word in page.get_text('words'):
        assert word[0]>=0 and word[1]>=0 and word[2]<=page.rect.width and word[3]<=page.rect.height,word
    for item in page.get_drawings():
        box=item['rect'];assert box.x0>=0 and box.y0>=0 and box.x1<=page.rect.width and box.y1<=page.rect.height,box
    page.get_pixmap().save(root/(name+'-render.png'))
    report.append({'file':name+'.pdf','dimensionsPoints':list(page.rect)[2:],'fonts':fonts,'withinBounds':True})
(root/'pdf-verification.json').write_text(json.dumps(report,indent=2))
print(json.dumps(report,indent=2))
