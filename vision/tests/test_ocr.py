import os
import unittest
from PIL import Image
from vision.ocr_engine import Best50Parser

class TestBest50OCR(unittest.TestCase):
    def setUp(self):
        self.sample_path = os.path.abspath(os.path.join(os.path.dirname(__file__), '../../AnisphiaaaUwU_top_plays_record.png'))
        self.parser = Best50Parser()

    def test_parse_sample_image(self):
        if not os.path.exists(self.sample_path):
            self.skipTest(f"Sample image {self.sample_path} not found")

        img = Image.open(self.sample_path)
        result = self.parser.parse(img)

        self.assertTrue(result.success)
        self.assertEqual(result.nickname, "AnisphiaaaUwU")
        self.assertEqual(result.generated_date, "2026/09/18")
        self.assertEqual(result.printed_potential, 12.668)
        self.assertEqual(result.total_cards, 50)

        # Check Card #1 (Extradimensional Cosmic Symphony)
        card1 = result.cards[0]
        self.assertEqual(card1.rank, 1)
        self.assertEqual(card1.score, 9900167)
        self.assertEqual(card1.printed_potential, 13.001)
        self.assertIn("Extradimensional", card1.title_raw)

        print(f"\n[+] OCR Test passed! Extracted {len(result.cards)} cards with avg confidence: {result.average_confidence}")

if __name__ == '__main__':
    unittest.main()
