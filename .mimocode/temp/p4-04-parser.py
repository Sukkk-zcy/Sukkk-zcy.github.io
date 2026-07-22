#!/usr/bin/env python3
"""
生成 Parser 状态机图
"""

from PIL import Image, ImageDraw, ImageFont
import os

def create_parser_fsm():
    """生成 Parser 状态机图"""
    
    width, height = 1000, 400
    img = Image.new('RGB', (width, height), '#0a0a0a')
    draw = ImageDraw.Draw(img)
    
    try:
        title_font = ImageFont.truetype("arial.ttf", 24)
        label_font = ImageFont.truetype("arial.ttf", 16)
        small_font = ImageFont.truetype("arial.ttf", 12)
    except:
        title_font = ImageFont.load_default()
        label_font = ImageFont.load_default()
        small_font = ImageFont.load_default()
    
    # 标题
    draw.text((350, 20), "Parser 状态机", fill='#ffffff', font=title_font)
    
    # 状态节点
    states = [
        ("start", 100, 150, '#1b4965'),
        ("parse_ethernet", 300, 150, '#1b4965'),
        ("parse_ipv4", 500, 150, '#1b4965'),
        ("accept", 750, 150, '#2d6a4f'),
        ("reject", 750, 300, '#8b0000'),
    ]
    
    for name, x, y, color in states:
        draw.ellipse([x, y, x+100, y+60], fill=color, outline='#4ecdc4', width=2)
        draw.text((x+20, y+20), name, fill='#ffffff', font=label_font)
    
    # 转换箭头和标签
    transitions = [
        (200, 180, 300, 180, "extract\nethernet"),
        (400, 180, 500, 180, "select\netherType"),
        (600, 180, 750, 180, "accept"),
        (600, 210, 750, 300, "reject"),
    ]
    
    for x1, y1, x2, y2, label in transitions:
        draw.line([(x1, y1), (x2, y2)], fill='#4ecdc4', width=2)
        draw.text((x1+50, y1+10), label, fill='#888888', font=small_font)
    
    # 保存
    output_path = os.path.join(os.path.dirname(__file__), 'p4-04-parser.png')
    img.save(output_path, 'PNG', quality=95)
    print(f"图片已保存: {output_path}")
    return output_path

if __name__ == '__main__':
    create_parser_fsm()
