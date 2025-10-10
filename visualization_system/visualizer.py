#!/usr/bin/env python3
"""
Dark Matter Event Visualization System
Integrates with classification_system to create comprehensive visual analysis
"""

import pandas as pd
import matplotlib.pyplot as plt
import numpy as np
import json
import os
import sys
from pathlib import Path
from typing import Dict, Any, List, Tuple

# --- Configuration ---
DATASET_PATH = Path('../dataset/dark_matter_synthetic_dataset.csv')
CLASSIFICATION_RESULTS_PATH = Path('../classification_system/results/classification_results.json')
CHARTS_OUTPUT_DIR = Path('charts_output')

# --- Define Classification Bands (matching classification_system logic) ---
S2S1_AXION_MAX = 2.0
S2S1_WIMP_MIN = 2.0
S2S1_WIMP_MAX = 4.0
S2S1_BACKGROUND_MIN = 5.0

# Create output directory
CHARTS_OUTPUT_DIR.mkdir(exist_ok=True)


def load_data() -> Tuple[pd.DataFrame, List[Dict[str, Any]]]:
    """Loads the main dataset and the classification results."""
    print(f"\n{'='*80}")
    print("LOADING DATA")
    print(f"{'='*80}\n")
    
    # Load dataset
    try:
        df = pd.read_csv(DATASET_PATH)
        print(f"✓ Loaded dataset: {len(df):,} events from {DATASET_PATH}")
        
        # Calculate Log10(S2/S1) for better visualization scale
        df['log10_s2_over_s1'] = df['s2_over_s1_ratio'].apply(
            lambda x: np.log10(x) if pd.notna(x) and x > 0 else np.nan
        )
        print(f"✓ Calculated log10(S2/S1) ratios")
        
    except FileNotFoundError:
        print(f"❌ Error: Dataset not found at {DATASET_PATH}")
        print("   Please ensure the dataset exists or run: python ../main.py")
        sys.exit(1)
    
    # Load classification results
    classification_data = []
    if CLASSIFICATION_RESULTS_PATH.exists():
        with open(CLASSIFICATION_RESULTS_PATH, 'r', encoding='utf-8') as f:
            classification_data = json.load(f)
        print(f"✓ Loaded classification results: {len(classification_data)} analyzed events")
    else:
        print(f"⚠ Warning: No classification results found at {CLASSIFICATION_RESULTS_PATH}")
        print("   Run classification first: python ../classification_system/enhanced_classifier.py")

    return df, classification_data


def plot_discrimination_bands(df: pd.DataFrame):
    """
    Creates the main scatter plot showing particle discrimination (S2/S1 vs. Energy).
    Matches the classification system's logic exactly.
    """
    print("\n[1/5] Generating Physics Discrimination Bands Plot...")
    
    # Define colors matching classification types
    label_colors = {
        'Background': '#FF5733',      # Red-Orange
        'WIMP-like': '#00BFFF',       # Deep Sky Blue
        'Axion-like': '#FF69B4',      # Hot Pink
        'Sterile-Neutrino': '#3CB371', # Medium Sea Green
        'Novel-Anomaly': '#FF8C00'    # Dark Orange
    }
    
    fig, ax = plt.subplots(figsize=(14, 9))

    # Scatter plot for each particle type
    for label, color in label_colors.items():
        subset = df[df['label'] == label].dropna(subset=['log10_s2_over_s1', 'recoil_energy_keV'])
        if len(subset) > 0:
            ax.scatter(
                subset['recoil_energy_keV'],
                subset['log10_s2_over_s1'],
                s=8, alpha=0.5, label=f"{label} (n={len(subset):,})", color=color, edgecolors='none'
            )

    # --- Draw Classification Bands (Horizontal Lines) ---
    y_limits = ax.get_ylim()
    x_limits = ax.get_xlim()
    
    # Background Threshold (Log10(5.0) ≈ 0.70)
    if S2S1_BACKGROUND_MIN > 0:
        bg_line = np.log10(S2S1_BACKGROUND_MIN)
        ax.axhline(bg_line, color='red', linestyle='--', linewidth=2, 
                   label=f'Background Cutoff (S2/S1 > {S2S1_BACKGROUND_MIN})', alpha=0.8)
        ax.fill_between(x_limits, bg_line, y_limits[1], alpha=0.1, color='red')
        ax.text(x_limits[1] * 0.75, bg_line + 0.05, 'BACKGROUND REGION (ER)', 
                color='red', fontsize=11, weight='bold', ha='center')

    # WIMP Region (Log10(2.0) to Log10(4.0))
    wimp_min_line = np.log10(S2S1_WIMP_MIN)
    wimp_max_line = np.log10(S2S1_WIMP_MAX)
    ax.axhline(wimp_max_line, color='blue', linestyle='-.', linewidth=2, alpha=0.8)
    ax.axhline(wimp_min_line, color='purple', linestyle='-.', linewidth=2, alpha=0.8)
    ax.fill_between(x_limits, wimp_min_line, wimp_max_line, alpha=0.1, color='blue')
    ax.text(x_limits[1] * 0.75, (wimp_min_line + wimp_max_line) / 2, 
            'WIMP REGION (NR)', color='blue', fontsize=11, weight='bold', ha='center')
    
    # Axion Region (Log10(S2/S1) < Log10(2.0))
    ax.fill_between(x_limits, y_limits[0], wimp_min_line, alpha=0.1, color='purple')
    ax.text(x_limits[1] * 0.75, wimp_min_line - 0.2, 'AXION REGION (Exotic ER)', 
            color='purple', fontsize=11, weight='bold', ha='center')
    
    # --- Final Plot Aesthetics ---
    ax.set_title('Particle Discrimination: Log₁₀(S2/S1 Ratio) vs. Recoil Energy\n' +
                 'Classification Bands Match Enhanced Classifier Logic',
                 fontsize=14, weight='bold', pad=20)
    ax.set_xlabel('Recoil Energy (keV)', fontsize=12, weight='bold')
    ax.set_ylabel('Log₁₀(S2/S1 Ratio)', fontsize=12, weight='bold')
    ax.legend(title='True Label', fontsize=10, loc='upper right', framealpha=0.9)
    ax.grid(True, linestyle=':', alpha=0.4)
    ax.set_xlim(x_limits)
    ax.set_ylim(y_limits)
    
    fig.tight_layout()
    output_path = CHARTS_OUTPUT_DIR / '01_discrimination_bands.png'
    plt.savefig(output_path, dpi=300, bbox_inches='tight')
    plt.close()
    print(f"  ✓ Saved: {output_path}")


def plot_class_distribution(df: pd.DataFrame):
    """
    Creates a bar chart showing the distribution of particle types in the dataset.
    """
    print("\n[2/5] Generating Class Distribution Plot...")
    
    class_counts = df['label'].value_counts()
    
    # Reorder for better visual flow
    order = ['Background', 'WIMP-like', 'Axion-like', 'Novel-Anomaly', 'Sterile-Neutrino']
    class_counts = class_counts.reindex(order, fill_value=0)
    
    # Color scheme matching discrimination plot
    colors = ['#FF5733', '#00BFFF', '#FF69B4', '#FF8C00', '#3CB371']
    
    fig, ax = plt.subplots(figsize=(12, 7))
    bars = ax.bar(class_counts.index, class_counts.values, color=colors, edgecolor='black', linewidth=1.5)
    
    ax.set_title(f'Synthetic Dataset Class Distribution\nTotal Events: {len(df):,}',
                 fontsize=14, weight='bold', pad=20)
    ax.set_xlabel('Particle Type', fontsize=12, weight='bold')
    ax.set_ylabel('Number of Events', fontsize=12, weight='bold')
    
    # Add percentage and count on top of bars
    total_events = len(df)
    for bar, count in zip(bars, class_counts.values):
        height = bar.get_height()
        percentage = (count / total_events) * 100
        ax.text(bar.get_x() + bar.get_width() / 2., height + 200,
                f'{count:,}\n({percentage:.1f}%)',
                ha='center', va='bottom', fontsize=11, weight='bold')

    plt.xticks(rotation=30, ha='right', fontsize=11)
    ax.grid(axis='y', linestyle=':', alpha=0.4)
    fig.tight_layout()
    
    output_path = CHARTS_OUTPUT_DIR / '02_class_distribution.png'
    plt.savefig(output_path, dpi=300, bbox_inches='tight')
    plt.close()
    print(f"  ✓ Saved: {output_path}")


def plot_classification_accuracy(classification_data: List[Dict[str, Any]]):
    """
    Analyzes classification results and creates accuracy visualization.
    """
    if not classification_data:
        print("\n[3/5] Skipping Classification Accuracy Plot (no results available)")
        return
    
    print("\n[3/5] Generating Classification Accuracy Analysis...")
    
    df_results = pd.DataFrame(classification_data)
    
    # Extract base classification (remove (ER) and (NR) suffixes)
    df_results['predicted_base'] = df_results['classification'].str.replace(r'\s*\([^)]*\)', '', regex=True)
    df_results['true_base'] = df_results['true_label'].str.split('-').str[0]
    
    # Check if prediction matches true label
    df_results['correct'] = df_results.apply(
        lambda row: row['predicted_base'].lower().startswith(row['true_base'].lower()), axis=1
    )
    
    # Calculate accuracy
    accuracy = (df_results['correct'].sum() / len(df_results)) * 100
    
    # Create confusion matrix style plot
    fig, (ax1, ax2) = plt.subplots(1, 2, figsize=(16, 6))
    
    # Left plot: Correct vs Incorrect
    correct_counts = df_results['correct'].value_counts()
    colors_acc = ['#2ECC71', '#E74C3C']  # Green for correct, Red for incorrect
    labels_acc = [f'Correct\n({correct_counts.get(True, 0)})', 
                  f'Incorrect\n({correct_counts.get(False, 0)})']
    
    wedges, texts, autotexts = ax1.pie(
        [correct_counts.get(True, 0), correct_counts.get(False, 0)],
        labels=labels_acc,
        colors=colors_acc,
        autopct='%1.1f%%',
        startangle=90,
        textprops={'fontsize': 12, 'weight': 'bold'}
    )
    ax1.set_title(f'Classification Accuracy\nOverall: {accuracy:.1f}%', 
                  fontsize=13, weight='bold', pad=15)
    
    # Right plot: Confidence distribution
    ax2.hist(df_results['confidence'], bins=15, color='#3498DB', edgecolor='black', alpha=0.7)
    ax2.axvline(df_results['confidence'].mean(), color='red', linestyle='--', 
                linewidth=2, label=f'Mean: {df_results["confidence"].mean():.2%}')
    ax2.set_title('Confidence Score Distribution', fontsize=13, weight='bold', pad=15)
    ax2.set_xlabel('Confidence', fontsize=11, weight='bold')
    ax2.set_ylabel('Number of Events', fontsize=11, weight='bold')
    ax2.legend(fontsize=10)
    ax2.grid(axis='y', linestyle=':', alpha=0.4)
    
    fig.tight_layout()
    output_path = CHARTS_OUTPUT_DIR / '03_classification_accuracy.png'
    plt.savefig(output_path, dpi=300, bbox_inches='tight')
    plt.close()
    print(f"  ✓ Saved: {output_path}")
    print(f"  ℹ Accuracy: {accuracy:.1f}% ({correct_counts.get(True, 0)}/{len(df_results)} correct)")


def plot_energy_distributions(df: pd.DataFrame):
    """
    Creates overlapping energy distributions for each particle type.
    """
    print("\n[4/5] Generating Energy Distribution Plot...")
    
    fig, ax = plt.subplots(figsize=(14, 8))
    
    label_colors = {
        'Background': '#FF5733',
        'WIMP-like': '#00BFFF',
        'Axion-like': '#FF69B4',
        'Novel-Anomaly': '#FF8C00',
        'Sterile-Neutrino': '#3CB371'
    }
    
    # Plot histogram for each type
    for label, color in label_colors.items():
        subset = df[df['label'] == label]['recoil_energy_keV'].dropna()
        if len(subset) > 0:
            ax.hist(subset, bins=50, alpha=0.5, label=f"{label} (n={len(subset):,})", 
                   color=color, edgecolor='black', linewidth=0.5)
    
    ax.set_title('Recoil Energy Distribution by Particle Type', 
                 fontsize=14, weight='bold', pad=20)
    ax.set_xlabel('Recoil Energy (keV)', fontsize=12, weight='bold')
    ax.set_ylabel('Number of Events', fontsize=12, weight='bold')
    ax.legend(fontsize=10, loc='upper right', framealpha=0.9)
    ax.grid(axis='y', linestyle=':', alpha=0.4)
    ax.set_xlim(0, df['recoil_energy_keV'].quantile(0.99))  # Trim outliers for better view
    
    fig.tight_layout()
    output_path = CHARTS_OUTPUT_DIR / '04_energy_distributions.png'
    plt.savefig(output_path, dpi=300, bbox_inches='tight')
    plt.close()
    print(f"  ✓ Saved: {output_path}")


def plot_s2s1_distributions(df: pd.DataFrame):
    """
    Creates S2/S1 ratio distributions showing the discrimination power.
    """
    print("\n[5/5] Generating S2/S1 Ratio Distribution Plot...")
    
    fig, (ax1, ax2) = plt.subplots(2, 1, figsize=(14, 10))
    
    label_colors = {
        'Background': '#FF5733',
        'WIMP-like': '#00BFFF',
        'Axion-like': '#FF69B4',
        'Novel-Anomaly': '#FF8C00',
        'Sterile-Neutrino': '#3CB371'
    }
    
    # Top plot: Linear S2/S1 ratio
    for label, color in label_colors.items():
        subset = df[df['label'] == label]['s2_over_s1_ratio'].dropna()
        if len(subset) > 0:
            ax1.hist(subset, bins=60, alpha=0.5, label=f"{label} (n={len(subset):,})", 
                    color=color, edgecolor='black', linewidth=0.5, range=(0, 15))
    
    # Add classification band markers
    ax1.axvline(S2S1_AXION_MAX, color='purple', linestyle='--', linewidth=2, 
                label=f'Axion Max ({S2S1_AXION_MAX})')
    ax1.axvline(S2S1_WIMP_MAX, color='blue', linestyle='--', linewidth=2, 
                label=f'WIMP Max ({S2S1_WIMP_MAX})')
    ax1.axvline(S2S1_BACKGROUND_MIN, color='red', linestyle='--', linewidth=2, 
                label=f'Background Min ({S2S1_BACKGROUND_MIN})')
    
    ax1.set_title('S2/S1 Ratio Distribution (Linear Scale)', fontsize=13, weight='bold')
    ax1.set_xlabel('S2/S1 Ratio', fontsize=11, weight='bold')
    ax1.set_ylabel('Number of Events', fontsize=11, weight='bold')
    ax1.legend(fontsize=9, loc='upper right', framealpha=0.9, ncol=2)
    ax1.grid(axis='y', linestyle=':', alpha=0.4)
    
    # Bottom plot: Log10 S2/S1 ratio
    for label, color in label_colors.items():
        subset = df[df['label'] == label]['log10_s2_over_s1'].dropna()
        if len(subset) > 0:
            ax2.hist(subset, bins=60, alpha=0.5, label=f"{label}", 
                    color=color, edgecolor='black', linewidth=0.5)
    
    # Add log-scale band markers
    ax2.axvline(np.log10(S2S1_AXION_MAX), color='purple', linestyle='--', linewidth=2)
    ax2.axvline(np.log10(S2S1_WIMP_MAX), color='blue', linestyle='--', linewidth=2)
    ax2.axvline(np.log10(S2S1_BACKGROUND_MIN), color='red', linestyle='--', linewidth=2)
    
    ax2.set_title('S2/S1 Ratio Distribution (Log₁₀ Scale)', fontsize=13, weight='bold')
    ax2.set_xlabel('Log₁₀(S2/S1 Ratio)', fontsize=11, weight='bold')
    ax2.set_ylabel('Number of Events', fontsize=11, weight='bold')
    ax2.legend(fontsize=9, loc='upper right', framealpha=0.9, ncol=2)
    ax2.grid(axis='y', linestyle=':', alpha=0.4)
    
    fig.tight_layout()
    output_path = CHARTS_OUTPUT_DIR / '05_s2s1_distributions.png'
    plt.savefig(output_path, dpi=300, bbox_inches='tight')
    plt.close()
    print(f"  ✓ Saved: {output_path}")


def plot_feature_importance_charts(classification_data: List[Dict[str, Any]]):
    """
    Creates individual feature importance bar charts for each classified event.
    Only works with claude_classified_results_detailed.json format.
    """
    if not classification_data:
        return
    
    # Check if this is the detailed format with importance_analysis
    if not classification_data[0].get('importance_analysis'):
        print("\n[6/X] Skipping Feature Importance Charts (detailed results not available)")
        print("       Run: python mainClassify.py to generate feature importance data")
        return
    
    print(f"\n[6/X] Generating Feature Importance Charts for {len(classification_data)} events...")
    
    for event_data in classification_data:
        try:
            event_id = event_data.get('event_id', 'UNKNOWN')
            importance_data = event_data.get('importance_analysis', {})
            api_analysis = event_data.get('api_analysis', {})
            
            # Extract importance scores (exclude summary_reasoning)
            scores = {
                'S2/S1 Ratio': importance_data.get('s2_s1_ratio_importance', 0),
                'Energy': importance_data.get('energy_importance', 0),
                'Pulse Shape': importance_data.get('pulse_shape_importance', 0),
                'Position': importance_data.get('position_importance', 0),
                'Drift Time': importance_data.get('drift_time_importance', 0)
            }
            
            features = list(scores.keys())
            values = list(scores.values())
            
            classification_label = api_analysis.get('classification', 'N/A')
            true_label = event_data.get('true_label', 'Unknown')
            
            # Create chart
            fig, ax = plt.subplots(figsize=(10, 6))
            bars = ax.barh(features, values, color='#9370DB', edgecolor='black', linewidth=1.5)
            
            # Color bars by importance level
            colors = ['#E74C3C' if v < 40 else '#F39C12' if v < 70 else '#2ECC71' for v in values]
            for bar, color in zip(bars, colors):
                bar.set_color(color)
            
            ax.set_xlabel('Importance Score (0 - 100)', fontsize=12, weight='bold')
            ax.set_title(f'Feature Importance Analysis\nEvent {event_id}: {classification_label} (True: {true_label})',
                        fontsize=13, weight='bold', pad=15)
            ax.set_xlim(0, 100)
            ax.grid(axis='x', linestyle=':', alpha=0.4)
            
            # Add value labels
            for i, v in enumerate(values):
                color = 'white' if v > 50 else 'black'
                ax.text(v - 3 if v > 50 else v + 3, i, str(v), 
                       va='center', fontsize=11, weight='bold', color=color,
                       ha='right' if v > 50 else 'left')
            
            fig.tight_layout()
            chart_filename = CHARTS_OUTPUT_DIR / f"06_importance_event_{event_id}.png"
            plt.savefig(chart_filename, dpi=300, bbox_inches='tight')
            plt.close()
        
        except Exception as e:
            print(f"  ⚠ Error generating chart for Event {event_id}: {e}")
    
    print(f"  ✓ Saved {len(classification_data)} feature importance charts")


def generate_summary_report(df: pd.DataFrame, classification_data: List[Dict[str, Any]]):
    """
    Generates a text summary report of the visualization.
    """
    print(f"\n{'='*80}")
    print("GENERATING SUMMARY REPORT")
    print(f"{'='*80}\n")
    
    report_lines = []
    report_lines.append("=" * 80)
    report_lines.append("DARK MATTER EVENT ANALYSIS - VISUALIZATION SUMMARY")
    report_lines.append("=" * 80)
    report_lines.append("")
    
    # Dataset statistics
    report_lines.append("DATASET STATISTICS:")
    report_lines.append(f"  Total Events: {len(df):,}")
    report_lines.append(f"  Features: {len(df.columns)}")
    report_lines.append("")
    
    # Class distribution
    report_lines.append("CLASS DISTRIBUTION:")
    class_counts = df['label'].value_counts()
    for label, count in class_counts.items():
        percentage = (count / len(df)) * 100
        report_lines.append(f"  {label:20s}: {count:6,} ({percentage:5.2f}%)")
    report_lines.append("")
    
    # Feature statistics
    report_lines.append("KEY FEATURE STATISTICS:")
    report_lines.append(f"  Recoil Energy (keV):")
    report_lines.append(f"    Mean:   {df['recoil_energy_keV'].mean():.3f}")
    report_lines.append(f"    Median: {df['recoil_energy_keV'].median():.3f}")
    report_lines.append(f"    Std:    {df['recoil_energy_keV'].std():.3f}")
    report_lines.append("")
    
    report_lines.append(f"  S2/S1 Ratio:")
    s2s1_valid = df['s2_over_s1_ratio'].dropna()
    report_lines.append(f"    Mean:   {s2s1_valid.mean():.3f}")
    report_lines.append(f"    Median: {s2s1_valid.median():.3f}")
    report_lines.append(f"    Std:    {s2s1_valid.std():.3f}")
    report_lines.append("")
    
    # Classification results (if available)
    if classification_data:
        df_results = pd.DataFrame(classification_data)
        df_results['predicted_base'] = df_results['classification'].str.replace(r'\s*\([^)]*\)', '', regex=True)
        df_results['true_base'] = df_results['true_label'].str.split('-').str[0]
        df_results['correct'] = df_results.apply(
            lambda row: row['predicted_base'].lower().startswith(row['true_base'].lower()), axis=1
        )
        
        accuracy = (df_results['correct'].sum() / len(df_results)) * 100
        
        report_lines.append("CLASSIFICATION RESULTS:")
        report_lines.append(f"  Events Classified: {len(df_results)}")
        report_lines.append(f"  Accuracy: {accuracy:.2f}%")
        report_lines.append(f"  Mean Confidence: {df_results['confidence'].mean():.2%}")
        report_lines.append(f"  Median Confidence: {df_results['confidence'].median():.2%}")
        report_lines.append("")
    
    report_lines.append("=" * 80)
    report_lines.append("Charts generated in: charts_output/")
    report_lines.append("=" * 80)
    
    # Save report
    report_path = CHARTS_OUTPUT_DIR / 'visualization_summary.txt'
    with open(report_path, 'w', encoding='utf-8') as f:
        f.write('\n'.join(report_lines))
    
    # Print to console
    print('\n'.join(report_lines))
    print(f"\n✓ Summary report saved: {report_path}")


def main():
    """Main visualization pipeline."""
    print(f"\n{'#'*80}")
    print("DARK MATTER EVENT VISUALIZATION SYSTEM")
    print("Integrated with Enhanced Classification System")
    print(f"{'#'*80}")
    
    # Load data
    df, classification_data = load_data()
    
    # Generate all visualizations
    print(f"\n{'='*80}")
    print("GENERATING VISUALIZATIONS")
    print(f"{'='*80}")
    
    plot_discrimination_bands(df)
    plot_class_distribution(df)
    plot_classification_accuracy(classification_data)
    plot_energy_distributions(df)
    plot_s2s1_distributions(df)
    plot_feature_importance_charts(classification_data)
    
    # Generate summary
    generate_summary_report(df, classification_data)
    
    print(f"\n{'='*80}")
    print("✓ VISUALIZATION PIPELINE COMPLETE!")
    print(f"{'='*80}")
    print(f"\nAll charts saved in: {CHARTS_OUTPUT_DIR.absolute()}")
    print("\nGenerated files:")
    print("  1. 01_discrimination_bands.png - Main physics discrimination plot")
    print("  2. 02_class_distribution.png - Dataset composition")
    print("  3. 03_classification_accuracy.png - AI classifier performance")
    print("  4. 04_energy_distributions.png - Energy spectra by particle type")
    print("  5. 05_s2s1_distributions.png - S2/S1 discrimination analysis")
    
    # Check if feature importance charts were generated
    importance_charts = list(CHARTS_OUTPUT_DIR.glob("06_importance_event_*.png"))
    if importance_charts:
        print(f"  6. 06_importance_event_*.png - {len(importance_charts)} feature importance charts")
    
    print("  X. visualization_summary.txt - Detailed statistics report")
    print("")


if __name__ == '__main__':
    main()
