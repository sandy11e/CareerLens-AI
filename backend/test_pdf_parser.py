
from pathlib import Path
from services.resume_parser import extract_text_from_pdf

# Replace this with the path to an actual PDF on your machine.
pdf_path = Path(r"C:/Users/Arshathdeen/Documents/R.Arshathdeen Resume-1.pdf")

# Test 1: Existing file-path input
text_from_path, metadata_path = extract_text_from_pdf(pdf_path)

# Test 2: In-memory PDF bytes
pdf_bytes = pdf_path.read_bytes()
text_from_bytes, metadata_bytes = extract_text_from_pdf(pdf_bytes)

print("Path extraction:", len(text_from_path), "characters")
print("Bytes extraction:", len(text_from_bytes), "characters")

print("Path metadata:", metadata_path)
print("Bytes metadata:", metadata_bytes)

assert text_from_path == text_from_bytes
assert metadata_path["page_count"] == metadata_bytes["page_count"]

print("\nBoth PDF input methods passed!")
