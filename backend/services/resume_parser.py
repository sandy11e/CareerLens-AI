import re
import logging
from typing import Tuple, Dict, Any

logger = logging.getLogger("careerlens.parser")

def extract_text_from_pdf(file_path: str) -> Tuple[str, Dict[str, Any]]:
    """
    Extracts text and metadata from a PDF file with high precision.
    Tries pdfplumber first, with fallback to pypdf.
    """
    text_content = []
    page_count = 0
    extraction_method = "pdfplumber"

    # 1. Primary: pdfplumber for high fidelity layout parsing
    try:
        import pdfplumber
        with pdfplumber.open(file_path) as pdf:
            page_count = len(pdf.pages)
            for idx, page in enumerate(pdf.pages):
                # Try layout-aware extraction
                page_text = page.extract_text(layout=False, x_tolerance=2, y_tolerance=3)
                if not page_text or len(page_text.strip()) < 20:
                    # Fallback to layout=True
                    page_text = page.extract_text(layout=True)
                
                if page_text:
                    text_content.append(page_text)
    except Exception as e:
        logger.warning(f"pdfplumber extraction encountered error: {e}. Trying pypdf fallback...")
        extraction_method = "pypdf"
        text_content = []

    # 2. Fallback: pypdf if pdfplumber failed or extracted empty content
    if not text_content:
        try:
            import pypdf
            reader = pypdf.PdfReader(file_path)
            page_count = len(reader.pages)
            for page in reader.pages:
                extracted = page.extract_text()
                if extracted:
                    text_content.append(extracted)
        except Exception as e:
            logger.error(f"pypdf fallback also failed: {e}")

    raw_text = "\n\n".join(text_content).strip()

    # Post-process: clean up weird artifacts while preserving line breaks
    cleaned_text = clean_extracted_text(raw_text)

    metadata = {
        "page_count": page_count,
        "word_count": len(cleaned_text.split()),
        "char_count": len(cleaned_text),
        "extraction_method": extraction_method,
        "is_scanned_or_empty": len(cleaned_text.strip()) < 50
    }

    return cleaned_text, metadata

def clean_extracted_text(text: str) -> str:
    if not text:
        return ""
    
    # Normalize unicode spaces
    text = text.replace('\xa0', ' ').replace('\u200b', '')
    
    # Standardize bullet symbols
    text = re.sub(r'[\u2022\u2023\u25E6\u2043\u2219\uf0b7]', ' • ', text)
    
    # Fix hyphenated words broken across lines: e.g. "experi-\nence" -> "experience"
    text = re.sub(r'(\w+)-\n(\w+)', r'\1\2', text)
    
    # Collapse 3+ consecutive newlines to 2
    text = re.sub(r'\n{3,}', '\n\n', text)
    
    # Collapse multiple horizontal whitespace to single space
    lines = [re.sub(r'[ \t]+', ' ', line).strip() for line in text.split('\n')]
    
    return '\n'.join(lines).strip()
