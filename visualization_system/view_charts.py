#!/usr/bin/env python3
"""
Terminal Chart Viewer
Opens all generated charts for viewing
"""

import os
from pathlib import Path
from PIL import Image

CHARTS_DIR = Path('charts_output')

def view_charts():
    """Open all generated charts"""
    print("\n" + "="*80)
    print("OPENING VISUALIZATION CHARTS")
    print("="*80 + "\n")
    
    # Find all PNG files
    chart_files = sorted(CHARTS_DIR.glob('*.png'))
    
    if not chart_files:
        print("No charts found! Run visualizer.py first.")
        return
    
    print(f"Found {len(chart_files)} charts:\n")
    
    for i, chart_path in enumerate(chart_files, 1):
        print(f"{i}. {chart_path.name}")
        # Open the image with default viewer
        try:
            img = Image.open(chart_path)
            img.show()
            print(f"   ✓ Opened in image viewer")
        except Exception as e:
            print(f"   ✗ Error opening: {e}")
    
    print("\n" + "="*80)
    print("All charts opened in your default image viewer!")
    print("="*80 + "\n")

if __name__ == '__main__':
    view_charts()
