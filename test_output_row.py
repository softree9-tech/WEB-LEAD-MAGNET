import unittest
from agents.website_analyzer import website_analyzer_agent
import os

class TestOutputRow(unittest.TestCase):
    def test_output_row_no_duplicates(self):
        # We check the source code for duplicate keys in the output_row dict
        import ast
        with open("agents/website_analyzer.py", "r") as f:
            tree = ast.parse(f.read())

        for node in ast.walk(tree):
            if isinstance(node, ast.Assign) and len(node.targets) == 1:
                if isinstance(node.targets[0], ast.Name) and node.targets[0].id == "output_row":
                    if isinstance(node.value, ast.Dict):
                        keys = []
                        for k in node.value.keys:
                            if isinstance(k, ast.Constant):
                                keys.append(k.value)

                        duplicates = [k for k in keys if keys.count(k) > 1]
                        self.assertEqual(len(keys), len(set(keys)), f"Duplicate keys found in output_row: {set(duplicates)}")

    def test_seo_vars_initialized(self):
        # Check that seo_title, seo_canonical, seo_og are initialized before the playwright block
        with open("agents/website_analyzer.py", "r") as f:
            content = f.read()

        self.assertIn("seo_title = False", content)
        self.assertIn("seo_canonical = False", content)
        self.assertIn("seo_og = False", content)

if __name__ == "__main__":
    unittest.main()
