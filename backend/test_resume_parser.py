import unittest

from services.resume_parser import clean_extracted_text


class ResumeParserCleaningTests(unittest.TestCase):
    def test_normalizes_nonbreaking_spaces_and_zero_width_characters(self):
        self.assertEqual(clean_extracted_text("Python\u00a0Engineer\u200b"), "Python Engineer")

    def test_joins_words_split_across_line_breaks(self):
        self.assertEqual(clean_extracted_text("experi-\nence"), "experience")

    def test_collapses_repeated_blank_lines_and_spacing(self):
        self.assertEqual(clean_extracted_text("  Skills   \n\n\n  Python  "), "Skills\n\nPython")


if __name__ == "__main__":
    unittest.main()