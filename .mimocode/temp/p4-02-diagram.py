#!/usr/bin/env python3
"""
生成 P4 程序结构流程图
"""

from PIL import Image, ImageDraw, ImageFont
import os

def create_program_structure():
    """生成 P4 程序结构流程图"""
    
    width, height = 1000, 500
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
    draw.text((350, 20), "P4 程序数据流", fill='#ffffff', font=title_font)
    
    # 报文进入
    draw.rectangle([50, 80, 200, 140], fill='#2d2d4a', outline='#4a4a6a')
    draw.text((80, 100), "报文进入", fill='#888888', font=label_font)
    
    # 箭头
    draw.polygon([(210, 110), (230, 100), (230, 120)], fill='#4ecdc4')
    
    # Parser
    draw.rectangle([240, 60, 440, 160], fill='#1b4965', outline='#2d6a4f', width=2)
    draw.text((300, 80), "Parser", fill='#4ecdc4', font=label_font)
    draw.text((280, 110), "解析报文", fill='#3d8b37', font=small_font)
    draw.text((280, 130), "提取报头", fill='#3d8b37', font=small_font)
    
    # 箭头
    draw.polygon([(450, 110), (470, 100), (470, 120)], fill='#4ecdc4')
    
    # Control
    draw.rectangle([480, 60, 680, 160], fill='#1b4965', outline='#2d6a4f', width=2)
    draw.text((540, 80), "Control", fill='#4ecdc4', font=label_font)
    draw.text((520, 110), "匹配-动作", fill='#3d8b37', font=small_font)
    draw.text((520, 130), "处理逻辑", fill='#3d8b37', font=small_font)
    
    # 箭头
    draw.polygon([(690, 110), (710, 100), (710, 120)], fill='#4ecdc4')
    
    # Deparser
    draw.rectangle([720, 60, 920, 160], fill='#1b4965', outline='#2d6a4f', width=2)
    draw.text((770, 80), "Deparser", fill='#4ecdc4', font=label_font)
    draw.text((760, 110), "重新打包", fill='#3d8b37', font=small_font)
    draw.text((760, 130), "输出字节流", fill='#3d8b37', font=small_font)
    
    # 箭头
    draw.polygon([(930, 110), (950, 100), (950, 120)], fill='#4ecdc4')
    
    # 报文离开
    draw.rectangle([960, 80, 1000, 140], fill='#2d2d4a', outline='#4a4a6a')
    draw.text((965, 100), "离开", fill='#888888', font=label_font)
    
    # 下方：V1Model 架构
    draw.text((350, 200), "V1Model 架构", fill='#ffffff', font=title_font)
    
    # 六大块
    blocks = [
        ("Parser", 80, 250),
        ("Verify\nChecksum", 220, 250),
        ("Ingress", 360, 250),
        ("Egress", 500, 250),
        ("Compute\nChecksum", 640, 250),
        ("Deparser", 780, 250),
    ]
    
    colors = ['#1b4965', '#2d6a4f', '#3d8b37', '#3d8b37', '#2d6a4f', '#1b4965']
    
    for i, (name, x, y) in enumerate(blocks):
        draw.rectangle([x, y, x+120, y+80], fill=colors[i], outline='#4ecdc4')
        draw.text((x+30, y+25), name, fill='#ffffff', font=small_font)
        
        if i < len(blocks) - 1:
            draw.polygon([(x+130, y+40), (x+140, y+30), (x+140, y+50)], fill='#4ecdc4')
    
    # 保存
    output_path = os.path.join(os.path.dirname(__file__), 'p4-02-structure.png')
    img.save(output_path, 'PNG', quality=95)
    print(f"图片已保存: {output_path}")
    return output_path

if __name__ == '__main__':
    create_program_structure()
