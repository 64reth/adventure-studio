"""Run with Python + PyMuPDF. Verifies actual rendered PDFs, not SVG previews."""
import fitz, json, pathlib
reports = []
for profile in ['no-bleed', 'kdp-bleed']:
    root = pathlib.Path('artifacts/enchanted-kingdom') / profile
    for name in ['interior', 'answers']:
        doc = fitz.open(root / (name + '.pdf'))
        assert len(doc) == 5
        expected = (612, 792) if profile == 'no-bleed' else (621, 810)
        for i, page in enumerate(doc):
            assert tuple(page.rect)[2:] == expected
            assert page.get_fonts() and all(doc.extract_font(f[0])[3] for f in page.get_fonts())
            text = page.get_text()
            assert 'REVIEW COPY' in text
            assert ('ANSWER:' if name == 'answers' else 'Answer:') in text
            for word in page.get_text('words'):
                assert word[0] >= 0 and word[1] >= 0 and word[2] <= expected[0] and word[3] <= expected[1], (profile, name, i, word)
            drawings = page.get_drawings()
            for drawing in drawings:
                box = drawing['rect']
                assert box.x0 >= -.1 and box.y0 >= -.1 and box.x1 <= expected[0]+.1 and box.y1 <= expected[1]+.1, (profile, name, i, box)
            page.get_pixmap(matrix=fitz.Matrix(1, 1)).save(root / f'{name}-render-{i+1}.png')
        reports.append({'profile': profile, 'file': name+'.pdf', 'pages': len(doc), 'dimensionsPoints': expected, 'embeddedFonts': True, 'allTextAndPathsWithinMediaBox': True, 'rendered': True})
pathlib.Path('artifacts/pdf-verification.json').write_text(json.dumps(reports, indent=2))
print(json.dumps(reports, indent=2))
