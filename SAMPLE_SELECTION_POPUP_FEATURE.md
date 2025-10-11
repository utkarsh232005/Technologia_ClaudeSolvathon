# Anomaly Detection UI Enhancement - Sample Selection Popup

## Summary
Added an interactive popup dialog that allows users to select how many events they want to analyze from the dataset before starting the anomaly detection process.

## Changes Made

### 1. Updated Component Imports
**File:** `/webapp/src/pages/AnomalyDetection.tsx`

Added Dialog components from shadcn/ui:
```typescript
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog';
```

### 2. Added New State Variables
Added state management for the sample selection dialog:
```typescript
const [showSampleDialog, setShowSampleDialog] = useState(false);
const [tempMaxEvents, setTempMaxEvents] = useState(100);
```

### 3. Refactored Analysis Flow
**Before:**
- Clicking "Start Analysis" immediately started analysis with the configured max events
- Max events was set in the configuration panel

**After:**
- Clicking "Start Analysis" opens a popup dialog
- User selects sample size in the dialog
- User confirms, then analysis starts with selected sample size

**New Functions:**
- `handleOpenSampleDialog()` - Opens the sample selection dialog
- `handleConfirmAnalysis()` - Confirms selection and starts analysis
- `performDatasetAnalysis(eventsToAnalyze)` - Performs the actual analysis
- `handleAnalyzeDataset()` - Now triggers the dialog instead of direct analysis

### 4. Updated Configuration Panel
**Removed:**
- "Max Events to Analyze" input field from the configuration panel
- Changed grid from 3 columns to 2 columns

**Added:**
- Info box with helpful tip about sample selection popup

### 5. Added Sample Selection Dialog
**Features:**
- **Manual Input:** Number input field (range: 10-1000)
- **Quick Select Buttons:** Pre-configured options (50, 100, 200, 500)
- **Estimated Time Display:** Shows approximate analysis time based on:
  - Selected sample size
  - Whether Claude AI is enabled or not
- **Analysis Mode Badge:** Visual indicator of statistical vs AI-powered mode
- **Cancel & Confirm Actions:** User-friendly dialog controls

**Dialog Layout:**
```
┌─────────────────────────────────────┐
│ Select Sample Size                  │
├─────────────────────────────────────┤
│ Number of Events: [___100____]      │
│ Range: 10 - 1000 events             │
│                                      │
│ Quick Select:                        │
│ [50] [100] [200] [500]              │
│                                      │
│ ┌─────────────────────────────────┐ │
│ │ Estimated Time: ~10 seconds     │ │
│ │ Analysis Mode: Statistical      │ │
│ └─────────────────────────────────┘ │
│                                      │
│        [Cancel] [Start Analysis]    │
└─────────────────────────────────────┘
```

## User Experience Improvements

### Before
1. User sets max events in config panel
2. User clicks "Start Analysis"
3. Analysis begins immediately

### After
1. User clicks "Start Analysis"
2. **🆕 Popup appears asking for sample size**
3. User selects number of events (with visual feedback)
4. User sees estimated time before committing
5. User clicks "Start Analysis" in dialog
6. Analysis begins with selected sample size

## Benefits

### 1. Better User Intent
- Forces users to consciously decide how many events to analyze
- Prevents accidental analysis of too many/few events

### 2. Improved Transparency
- Shows estimated analysis time before starting
- Displays current analysis mode (AI vs Statistical)
- Provides visual feedback on time/performance tradeoffs

### 3. Easier Sample Selection
- Quick select buttons for common sizes
- No need to navigate back to config panel
- Contextual decision-making at point of action

### 4. Cleaner UI
- Reduced clutter in configuration panel
- Focused configuration on settings that affect all analyses
- Sample size selection only appears when relevant

## Technical Details

### State Management
```typescript
// Dialog visibility
const [showSampleDialog, setShowSampleDialog] = useState(false);

// Temporary storage for user selection (before confirmation)
const [tempMaxEvents, setTempMaxEvents] = useState(100);

// Actual value used in analysis (after confirmation)
const [maxEvents, setMaxEvents] = useState(100);
```

### Analysis Flow
```typescript
handleAnalyzeDataset() 
  → Opens Dialog
  → User selects sample size
  → handleConfirmAnalysis()
  → Updates maxEvents state
  → Calls performDatasetAnalysis(tempMaxEvents)
  → Analysis runs with selected size
```

### Estimated Time Calculation
```typescript
// With Claude AI: ~10 events per minute
estimatedTime = Math.ceil(tempMaxEvents / 10) + " minutes"

// Statistical only: ~100 events per second  
estimatedTime = Math.ceil(tempMaxEvents / 100) + " seconds"
```

## Testing

### Manual Testing Steps
1. ✅ Open Anomaly Detection page
2. ✅ Click "Start Analysis" button
3. ✅ Verify popup appears
4. ✅ Test manual input (enter custom number)
5. ✅ Test quick select buttons (50, 100, 200, 500)
6. ✅ Verify estimated time updates based on sample size
7. ✅ Toggle Claude AI and verify time estimate changes
8. ✅ Click Cancel - dialog closes without analysis
9. ✅ Click Start Analysis - dialog closes and analysis begins
10. ✅ Verify analysis uses the selected sample size

### Edge Cases Handled
- ✅ Input validation (min: 10, max: 1000)
- ✅ Invalid input (non-numbers) defaults to minimum
- ✅ Dialog can be closed by clicking outside or pressing Escape
- ✅ Quick select buttons highlight the active selection
- ✅ Estimated time adjusts for AI vs Statistical mode

## Files Modified

### Primary Changes
- `/webapp/src/pages/AnomalyDetection.tsx` - Main component update

### Supporting Files (No changes needed)
- `/webapp/src/lib/anomalyAPI.ts` - Already supports dynamic sample sizes
- `/webapp/src/components/ui/dialog.tsx` - Existing component used
- `/webapp_backend.py` - Already supports `max_events` parameter

## Backward Compatibility

✅ **Fully Compatible**
- Backend API unchanged
- All existing functionality preserved
- No breaking changes to data structures
- Previous analysis results remain valid

## Future Enhancements

### Possible Additions
1. **Sample Size Presets Based on Dataset**
   - Auto-suggest 10%, 25%, 50%, 100% of total events
   - "Analyze All" quick option

2. **Performance Metrics**
   - Show actual analysis time after completion
   - Compare estimated vs actual time
   - Provide feedback for future estimates

3. **Batch Analysis**
   - Analyze multiple sample sizes in sequence
   - Compare results across different sample sizes

4. **Save Preferences**
   - Remember user's last selected sample size
   - Persist quick select favorites

## Conclusion

✅ **Implementation Complete**
- Sample selection popup fully functional
- User experience significantly improved
- No regression in existing features
- Ready for production use

The anomaly detection system now provides users with:
- **Better control** over analysis scope
- **Clear expectations** before starting analysis
- **Faster workflow** with quick select options
- **Informed decisions** with time estimates

---

**Status:** ✅ COMPLETE AND TESTED
**Integration Status:** ✅ ALL SYSTEMS OPERATIONAL
