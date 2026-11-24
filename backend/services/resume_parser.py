
import re
import logging
from io import BytesIO
from pathlib import Path
from typing import Tuple, Dict, Any, Union, BinaryIO

logger = logging.getLogger("careerlens.parser")


def extract_text_from_pdf(
    source: Union[str, Path, bytes, bytearray, BinaryIO]
) -> Tuple[str, Dict[str, Any]]:
    """
    Extract text and metadata from a PDF.

    Supports:
    - File paths (existing workflow)
    - PDF bytes
    - File-like objects

    Tries pdfplumber first, with fallback to pypdf.
    """

    text_content = []
    page_count = 0
    extraction_method = "pdfplumber"

    # Normalize input into a file-like object.
    if isinstance(source, (str, Path)):
        pdf_source = str(source)
    elif isinstance(source, (bytes, bytearray)):
        pdf_source = BytesIO(source)
    else:
        pdf_source = source

    # Primary extraction: pdfplumber
    try:
        import pdfplumber

        with pdfplumber.open(pdf_source) as pdf:
            page_count = len(pdf.pages)

            for page in pdf.pages:
                page_text = page.extract_text(
                    layout=False,
                    x_tolerance=2,
                    y_tolerance=3
                )

                if not page_text or len(page_text.strip()) < 20:
                    page_text = page.extract_text(layout=True)

                if page_text:
                    text_content.append(page_text)

    except Exception as e:
        logger.warning(
            f"pdfplumber extraction failed: {e}. "
            "Trying pypdf fallback..."
        )
        extraction_method = "pypdf"
        text_content = []

    # Fallback: pypdf
    if not text_content:
        try:
            import pypdf

            if isinstance(pdf_source, (str, Path)):
                reader = pypdf.PdfReader(str(pdf_source))
            else:
                if hasattr(pdf_source, "seek"):
                    pdf_source.seek(0)

                reader = pypdf.PdfReader(pdf_source)

            page_count = len(reader.pages)

            for page in reader.pages:
                extracted = page.extract_text()

                if extracted:
                    text_content.append(extracted)

        except Exception as e:
            logger.error(f"pypdf fallback also failed: {e}")

    raw_text = "\n\n".join(text_content).strip()
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

    text = text.replace("\xa0", " ").replace("\u200b", "")

    text = re.sub(
        r"[\u2022\u2023\u25E6\u2043\u2219\uf0b7]",
        " • ",
        text
    )

    text = re.sub(r"(\w+)-\n(\w+)", r"\1\2", text)
    text = re.sub(r"\n{3,}", "\n\n", text)

    lines = [
        re.sub(r"[ \t]+", " ", line).strip()
        for line in text.split("\n")
    ]

    return "\n".join(lines).strip()
