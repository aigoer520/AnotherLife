#!/usr/bin/env python3
"""把 src/ 的拆分源码打包成单文件玩家版 dist/yisheng.html（内嵌 JS 与图片）。"""
import base64, os, re, sys

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
SRC = os.path.join(ROOT, "src")
OUT = os.path.join(ROOT, "dist", "yisheng.html")

html = open(os.path.join(SRC, "index.html"), encoding="utf-8").read()
for js in ("data.js", "engine.js", "ui.js"):
    code = open(os.path.join(SRC, js), encoding="utf-8").read()
    html = html.replace(f'<script src="{js}"></script>', "<script>\n" + code + "\n</script>")

assets = os.path.join(SRC, "assets", "panels")
for fn in os.listdir(assets):
    with open(os.path.join(assets, fn), "rb") as f:
        uri = "data:image/jpeg;base64," + base64.b64encode(f.read()).decode()
    html = html.replace("assets/panels/" + fn, uri)

os.makedirs(os.path.dirname(OUT), exist_ok=True)
open(OUT, "w", encoding="utf-8").write(html)
print("built", OUT, len(html), "bytes")
