#!/bin/bash

# Script to generate hypothesis data for the Report Generator
# This will classify events and generate hypotheses for anomalous ones

echo "🔬 Generating Dark Matter Event Classification and Hypothesis Data"
echo "=================================================================="
echo ""

# Check if CLAUDE_API_KEY is set
if [ -z "$CLAUDE_API_KEY" ]; then
    echo "❌ Error: CLAUDE_API_KEY environment variable is not set"
    echo "💡 Please set it in your .env file or export it:"
    echo "   export CLAUDE_API_KEY='your-key-here'"
    exit 1
fi

echo "✅ Claude API key found"
echo ""

# Check if dataset exists
if [ ! -f "dataset/dark_matter_synthetic_dataset.json" ]; then
    echo "❌ Error: Dataset not found at dataset/dark_matter_synthetic_dataset.json"
    exit 1
fi

echo "📊 Found dataset"
echo ""

# Option 1: Quick test with 5 events
echo "Option 1: Quick Test (5 events)"
echo "================================"
echo "Command: python3 mainClassify.py --num-events 5 --detect-anomalies --generate-hypotheses"
echo ""

# Option 2: Medium batch (20 events)
echo "Option 2: Medium Batch (20 events)"
echo "==================================="
echo "Command: python3 mainClassify.py --num-events 20 --detect-anomalies --generate-hypotheses"
echo ""

# Option 3: Full analysis (50+ events)
echo "Option 3: Full Analysis (50 events)"
echo "===================================="
echo "Command: python3 mainClassify.py --num-events 50 --detect-anomalies --generate-hypotheses"
echo ""

# Prompt user
read -p "Choose an option (1-3) or press Enter to run Quick Test: " choice

case $choice in
    1|"")
        NUM_EVENTS=5
        ;;
    2)
        NUM_EVENTS=20
        ;;
    3)
        NUM_EVENTS=50
        ;;
    *)
        echo "❌ Invalid option"
        exit 1
        ;;
esac

echo ""
echo "🚀 Running classification with $NUM_EVENTS events..."
echo ""

# Run the classification
python3 mainClassify.py --num-events $NUM_EVENTS --detect-anomalies --generate-hypotheses

if [ $? -eq 0 ]; then
    echo ""
    echo "✅ Classification complete!"
    echo ""
    
    # Check for output files
    if [ -f "results/claude_classified_results_detailed.json" ]; then
        echo "📁 Found classification results"
        
        # Copy to webapp public directory
        mkdir -p webapp/public/dataset
        cp results/claude_classified_results_detailed.json webapp/public/dataset/
        echo "✅ Copied classification results to webapp/public/dataset/"
    fi
    
    if [ -f "results/anomaly_analysis.json" ]; then
        echo "📁 Found anomaly analysis"
        cp results/anomaly_analysis.json webapp/public/dataset/
        echo "✅ Copied anomaly data to webapp/public/dataset/"
    fi
    
    if [ -f "results/comprehensive_hypothesis_analysis.json" ]; then
        echo "📁 Found hypothesis analysis"
        cp results/comprehensive_hypothesis_analysis.json webapp/public/dataset/hypothesis_data.json
        echo "✅ Copied hypothesis data to webapp/public/dataset/"
    fi
    
    echo ""
    echo "🎉 All done! Data is ready for the Report Generator"
    echo ""
    echo "Next steps:"
    echo "1. Start the webapp dev server: cd webapp && npm run dev"
    echo "2. Open http://localhost:5173/report-generator"
    echo "3. The page should now show real data instead of 'Using Sample Data'"
    
else
    echo ""
    echo "❌ Classification failed. Check the error messages above."
    exit 1
fi
