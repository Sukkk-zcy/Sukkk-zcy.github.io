import os
import re

html_dir = "E:/bk/blog/public"
count = 0
for root, dirs, files in os.walk(html_dir):
    for f in files:
        if f.endswith(".html"):
            path = os.path.join(root, f)
            try:
                with open(path, "r", encoding="utf-8") as fh:
                    content = fh.read()
                new_content = re.sub(r' integrity="[^"]*"', '', content)
                if new_content != content:
                    with open(path, "w", encoding="utf-8") as fh:
                        fh.write(new_content)
                    count += 1
            except Exception as e:
                print(f"Error: {path}: {e}")

print(f"Fixed {count} HTML files")
