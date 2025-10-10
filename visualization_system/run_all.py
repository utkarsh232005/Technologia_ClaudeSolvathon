#!/usr/bin/env python3
"""
Complete Workflow: Classify Events → Generate Visualizations → Display Results
Run this single script to do everything!
"""

import subprocess
import sys
from pathlib import Path

def print_header(text, char='='):
    """Print a formatted header"""
    width = 80
    print(f"\n{char * width}")
    print(f"{text:^{width}}")
    print(f"{char * width}\n")

def run_command(description, command):
    """Run a command and handle errors"""
    print(f"\n{'─'*80}")
    print(f"⏳ {description}...")
    print(f"{'─'*80}\n")
    
    try:
        result = subprocess.run(command, shell=True, check=True, 
                              capture_output=False, text=True)
        print(f"\n✅ {description} - COMPLETE\n")
        return True
    except subprocess.CalledProcessError as e:
        print(f"\n❌ {description} - FAILED")
        print(f"Error: {e}")
        return False

def main():
    """Run the complete analysis pipeline"""
    print_header("🌌 DARK MATTER ANALYSIS - COMPLETE PIPELINE 🌌", "━")
    
    print("This script will:")
    print("  1. Classify events using Gemini API with feature importance")
    print("  2. Generate all visualization charts")
    print("  3. Display results in terminal")
    print("  4. Open charts in image viewer")
    
    # Ask for number of events
    print("\n" + "─"*80)
    try:
        num_events = input("How many events to classify? (default: 10): ").strip()
        num_events = int(num_events) if num_events else 10
    except ValueError:
        num_events = 10
    
    print(f"Will classify {num_events} events")
    print("─"*80)
    
    # Step 1: Classification
    if not run_command(
        f"STEP 1: Classifying {num_events} events with feature importance",
        f"python mainClassify.py --num-events {num_events}"
    ):
        print("\n❌ Classification failed. Exiting.")
        sys.exit(1)
    
    # Step 2: Visualization
    if not run_command(
        "STEP 2: Generating visualization charts",
        "python visualizer.py"
    ):
        print("\n⚠️  Visualization failed, but continuing...")
    
    # Step 3: Display Results
    if not run_command(
        "STEP 3: Displaying detailed results in terminal",
        "python show_results.py"
    ):
        print("\n⚠️  Display failed, but continuing...")
    
    # Step 4: Open Charts
    print("\n" + "─"*80)
    open_charts = input("\nOpen charts in image viewer? (y/n, default: y): ").strip().lower()
    if open_charts != 'n':
        run_command(
            "STEP 4: Opening charts in image viewer",
            "python view_charts.py"
        )
    
    # Final Summary
    print_header("✅ PIPELINE COMPLETE!", "━")
    
    print("📁 Generated Files:")
    print("   results/claude_classified_results_detailed.json")
    print("   charts_output/01_discrimination_bands.png")
    print("   charts_output/02_class_distribution.png")
    print("   charts_output/03_classification_accuracy.png")
    print("   charts_output/04_energy_distributions.png")
    print("   charts_output/05_s2s1_distributions.png")
    print("   charts_output/visualization_summary.txt")
    
    print("\n📊 Next Steps:")
    print("   • Review charts in charts_output/")
    print("   • Check visualization_summary.txt for statistics")
    print("   • Re-run with different event count: python run_all.py")
    print("   • Run individual scripts for specific analysis")
    
    print("\n" + "━"*80 + "\n")

if __name__ == '__main__':
    try:
        main()
    except KeyboardInterrupt:
        print("\n\n⚠️  Pipeline interrupted by user")
        sys.exit(0)
