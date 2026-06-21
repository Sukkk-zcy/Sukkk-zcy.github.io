import os
import re

html_dir = "E:/bk/blog/public"
for root, dirs, files in os.walk(html_dir):
    for f in files:
        if f.endswith(".html"):
            path = os.path.join(root, f)
            with open(path, "r", encoding="utf-8") as fh:
                content = fh.read()
            new_content = re.sub(r' integrity="[^"]*"', '', content)
            if new_content != content:
                with open(path, "w", encoding="utf-8") as fh:
                    fh.write(new_content)
                print(f"Fixed: {os.path.relpath(path, html_dir)}")

print("All HTML files processed")
