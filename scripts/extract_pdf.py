from pypdf import PdfReader

reader = PdfReader("assets/autoCV__3_.pdf")
texts = []
for p in reader.pages:
    t = p.extract_text()
    if t:
        texts.append(t.strip())

out = "\n\n".join(texts)
with open("resume_text.md","w",encoding="utf-8") as f:
    f.write(out)
print("Wrote resume_text.md")
