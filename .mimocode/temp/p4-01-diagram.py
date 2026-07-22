#!/usr/bin/env python3
"""
生成 P4 文章的技术插图
"""

from PIL import Image, ImageDraw, ImageFont
import os

def create_traditional_vs_p4():
    """生成传统网络 vs P4 网络对比图"""
    
    # 创建图片
    width, height = 1200, 600
    img = Image.new('RGB', (width, height), '#0a0a0a')
    draw = ImageDraw.Draw(img)
    
    # 尝试加载字体
    try:
        title_font = ImageFont.truetype("arial.ttf", 28)
        label_font = ImageFont.truetype("arial.ttf", 18)
        small_font = ImageFont.truetype("arial.ttf", 14)
    except:
        title_font = ImageFont.load_default()
        label_font = ImageFont.load_default()
        small_font = ImageFont.load_default()
    
    # 左侧：传统网络（灰色调）
    draw.rectangle([50, 50, 550, 550], fill='#1a1a2e', outline='#3d3d5c', width=2)
    draw.text((180, 80), "传统网络", fill='#888888', font=title_font)
    draw.text((120, 130), "控制面（可编程）", fill='#666666', font=label_font)
    draw.rectangle([100, 160, 500, 280], fill='#2d2d4a', outline='#4a4a6a')
    draw.text((200, 200), "OpenFlow", fill='#888888', font=label_font)
    draw.text((150, 240), "控制器程序", fill='#666666', font=small_font)
    
    draw.text((150, 310), "数据面（固定）", fill='#666666', font=label_font)
    draw.rectangle([100, 340, 500, 460], fill='#1a1a2e', outline='#3d3d5c')
    draw.text((180, 380), "固定协议", fill='#555555', font=label_font)
    draw.text((150, 420), "无法自定义", fill='#444444', font=small_font)
    
    # 中间：箭头（门打开）
    draw.polygon([(570, 250), (630, 200), (630, 400), (570, 350)], fill='#3d8b37')
    draw.text((575, 280), "P4", fill='#ffffff', font=title_font)
    
    # 右侧：P4 网络（彩色）
    draw.rectangle([650, 50, 1150, 550], fill='#0d1b2a', outline='#1b4965', width=2)
    draw.text((830, 80), "P4 网络", fill='#4ecdc4', font=title_font)
    draw.text((770, 130), "控制面（可编程）", fill='#4ecdc4', font=label_font)
    draw.rectangle([700, 160, 1100, 280], fill='#1b4965', outline='#2d6a4f')
    draw.text((800, 200), "P4Runtime", fill='#4ecdc4', font=label_font)
    draw.text((750, 240), "Python 控制器", fill='#3d8b37', font=small_font)
    
    draw.text((750, 310), "数据面（可编程）", fill='#4ecdc4', font=label_font)
    draw.rectangle([700, 340, 1100, 460], fill='#1b4965', outline='#2d6a4f')
    draw.text((800, 380), "自定义协议", fill='#4ecdc4', font=label_font)
    draw.text((750, 420), "用户定义", fill='#3d8b37', font=small_font)
    
    # 保存
    output_path = os.path.join(os.path.dirname(__file__), 'p4-01-comparison.png')
    img.save(output_path, 'PNG', quality=95)
    print(f"图片已保存: {output_path}")
    return output_path

if __name__ == '__main__':
    create_traditional_vs_p4()
