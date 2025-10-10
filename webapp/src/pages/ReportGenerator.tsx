import { useState } from 'react';
import PageLayout from '@/components/PageLayout';
import { LoadingSpinner } from '@/components/LoadingComponents';
import { showToast } from '@/lib/toast';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Checkbox } from '@/components/ui/checkbox';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Progress } from '@/components/ui/progress';
import { FileText, Download, Calendar, ChevronRight, Zap, BookOpen, BarChart3 } from 'lucide-react';
import ReactMarkdown from 'react-markdown';

interface ReportConfig {
  type: string;
  sections: {[key: string]: boolean};
  format: string;
  startDate: string;
  endDate: string;
}

const ReportGenerator = () => {
  const [config, setConfig] = useState<ReportConfig>({
    type: 'executive',
    sections: {
      methodology: true,
      results: true,
      statistical: false,
      anomalies: true,
      physics: false,
      followups: true,
      citations: false
    },
    format: 'pdf',
    startDate: '2024-01-01',
    endDate: '2024-12-31'
  });

  const [isGenerating, setIsGenerating] = useState(false);
  const [generationProgress, setGenerationProgress] = useState(0);
  const [currentStep, setCurrentStep] = useState('');
  const [reportGenerated, setReportGenerated] = useState(false);

  const reportTypes = [
    { id: 'executive', label: 'Executive Summary', description: 'High-level overview for stakeholders' },
    { id: 'technical', label: 'Full Technical Report', description: 'Comprehensive analysis with all details' },
    { id: 'brief', label: 'Analysis Brief', description: 'Concise findings and recommendations' }
  ];

  const sectionOptions = [
    { id: 'methodology', label: 'Methodology', description: 'Detection methods and experimental setup' },
    { id: 'results', label: 'Results & Findings', description: 'Core findings and event classifications' },
    { id: 'statistical', label: 'Statistical Analysis', description: 'Detailed statistical interpretation' },
    { id: 'anomalies', label: 'Anomaly Highlights', description: 'Unusual events and their analysis' },
    { id: 'physics', label: 'Physics Interpretations', description: 'Theoretical implications and models' },
    { id: 'followups', label: 'Proposed Follow-ups', description: 'Recommended next steps and experiments' },
    { id: 'citations', label: 'Literature Citations', description: 'References and related work' }
  ];

  const quickStartTemplates = [
    { 
      name: 'Monthly Summary', 
      icon: Calendar,
      config: { type: 'executive', sections: { methodology: false, results: true, statistical: false, anomalies: true, physics: false, followups: true, citations: false } }
    },
    { 
      name: 'Research Publication', 
      icon: BookOpen,
      config: { type: 'technical', sections: { methodology: true, results: true, statistical: true, anomalies: true, physics: true, followups: true, citations: true } }
    },
    { 
      name: 'Quick Briefing', 
      icon: Zap,
      config: { type: 'brief', sections: { methodology: false, results: true, statistical: false, anomalies: false, physics: false, followups: false, citations: false } }
    }
  ];

  const updateConfig = (key: keyof ReportConfig, value: any) => {
    setConfig(prev => ({ ...prev, [key]: value }));
  };

  const updateSection = (sectionId: string, checked: boolean) => {
    setConfig(prev => ({
      ...prev,
      sections: { ...prev.sections, [sectionId]: checked }
    }));
  };

  const loadTemplate = (template: any) => {
    setConfig(prev => ({
      ...prev,
      type: template.config.type,
      sections: template.config.sections
    }));
  };

  const generateReport = async () => {
    setIsGenerating(true);
    setGenerationProgress(0);
    setReportGenerated(false);

    const steps = [
      { label: 'Analyzing dataset...', duration: 1500 },
      { label: 'Generating visualizations...', duration: 2000 },
      { label: 'Writing narrative...', duration: 2500 },
      { label: 'Complete!', duration: 500 }
    ];

    for (let i = 0; i < steps.length; i++) {
      setCurrentStep(steps[i].label);
      setGenerationProgress((i / steps.length) * 100);
      await new Promise(resolve => setTimeout(resolve, steps[i].duration));
    }

    setGenerationProgress(100);
    setIsGenerating(false);
    setReportGenerated(true);
  };

  const generateMarkdownPreview = () => {
    const reportTypeTitle = reportTypes.find(t => t.id === config.type)?.label || 'Report';
    const selectedSections = Object.entries(config.sections)
      .filter(([_, selected]) => selected)
      .map(([id, _]) => sectionOptions.find(s => s.id === id)?.label)
      .filter(Boolean);

    return `# ${reportTypeTitle}
**Dark Matter Detection Analysis**

*Generated on ${new Date().toLocaleDateString()}*
*Data Period: ${config.startDate} to ${config.endDate}*

---

## Executive Summary

This report presents a comprehensive analysis of dark matter detection data collected from our liquid xenon detector array. During the analysis period, we processed **1,247 events** with a total exposure of **2.3 ton-years**.

### Key Findings
- **34 WIMP-like candidates** identified with >80% confidence
- **87.3% classification accuracy** achieved by neural network
- **5 high-priority anomalies** flagged for further investigation
- Background rejection efficiency improved to **99.7%**

${selectedSections.includes('Methodology') ? `
## Methodology

### Detector Configuration
Our analysis utilized a dual-phase xenon time projection chamber with:
- Active mass: 1.3 tons of liquid xenon
- Fiducial volume: 0.85 tons after cuts
- Energy threshold: 1.5 keV nuclear recoil equivalent

### Event Selection Criteria
1. **Spatial cuts**: Events within fiducial volume
2. **Energy range**: 5-50 keV recoil energy
3. **S2/S1 discrimination**: Nuclear recoil band selection
4. **Pulse shape analysis**: F90 parameter cuts

### Machine Learning Classification
- **Neural Network Architecture**: 5-layer feedforward network
- **Training Dataset**: 10,000+ labeled events
- **Feature Engineering**: Energy, S2/S1, position, pulse shape
- **Cross-validation**: 10-fold with 87.3% accuracy
` : ''}

${selectedSections.includes('Results & Findings') ? `
## Results & Findings

### Event Classification Summary
| Category | Count | Percentage | Confidence |
|----------|-------|------------|------------|
| Background | 634 | 50.8% | 94.2% |
| WIMP Candidates | 34 | 2.7% | 87.3% |
| Neutron Recoils | 156 | 12.5% | 91.5% |
| Electronic Recoils | 423 | 33.9% | 96.1% |

### Energy Spectrum Analysis
The observed energy spectrum shows:
- **Low-energy enhancement** consistent with WIMP interactions
- **Exponential falloff** above 20 keV as expected
- **Background suppression** factor of 10³ achieved

### Signal Region Analysis
In the nuclear recoil band (1.5-50 keV):
- **Expected background**: 28.3 ± 4.1 events
- **Observed events**: 34 events
- **Excess significance**: 1.8σ above background
` : ''}

${selectedSections.includes('Statistical Analysis') ? `
## Statistical Analysis

### Likelihood Analysis
- **Profile likelihood ratio**: λ = 0.23
- **Bayesian information criterion**: BIC = 156.7
- **Kolmogorov-Smirnov test**: p-value = 0.032

### Systematic Uncertainties
1. **Energy scale uncertainty**: ±2.3%
2. **Position reconstruction**: ±1.1%
3. **Light yield variation**: ±3.7%
4. **Electronic noise**: ±0.8%

### Statistical Significance
The observed WIMP-like signal shows:
- **Local significance**: 2.1σ
- **Global significance**: 1.6σ (after trials factor)
- **Bayesian evidence**: log(B₁₀) = 2.3
` : ''}

${selectedSections.includes('Anomaly Highlights') ? `
## Anomaly Highlights

### High-Priority Anomalies (5 detected)

#### Anomaly A001 - Critical
- **Event ID**: EVT-2024-1001
- **Anomaly Score**: 0.92
- **Features**: Extreme S2/S1 ratio (125.3), Multiple scatter signature
- **Hypothesis**: Cosmic ray interaction with detector wall

#### Anomaly A004 - Critical  
- **Event ID**: EVT-2024-0998
- **Anomaly Score**: 0.89
- **Features**: High energy deposit (78.9 keV), PMT saturation
- **Hypothesis**: Muon track through active volume

### Systematic Investigation
- **False positive rate**: <1% based on calibration data
- **Detector stability**: All systems nominal during events
- **Environmental factors**: No correlations with external conditions
` : ''}

${selectedSections.includes('Physics Interpretations') ? `
## Physics Interpretations

### WIMP Interaction Cross-Section
Based on observed candidate events:
- **Spin-independent cross-section limit**: σₛᵢ < 3.2 × 10⁻⁴⁶ cm²
- **Mass range sensitivity**: 10-1000 GeV/c²
- **Improvement over previous**: Factor of 2.1 better

### Dark Matter Halo Model
Assuming standard halo model:
- **Local density**: ρ = 0.3 GeV/cm³
- **Velocity distribution**: Maxwell-Boltzmann
- **Escape velocity**: 544 km/s

### Alternative Interpretations
1. **Axion-like particles**: Compatible with ma < 10⁻⁴ eV
2. **Sterile neutrinos**: Mass constraints 1-50 keV
3. **Modified gravity**: Excluded for f(R) models
` : ''}

${selectedSections.includes('Proposed Follow-ups') ? `
## Proposed Follow-ups

### Immediate Actions (Next 30 days)
1. **Verify anomalies** with independent analysis chain
2. **Cross-check calibration** sources and energy scale
3. **Implement improved** background models
4. **Extend fiducial volume** cuts optimization

### Medium-term Investigations (3-6 months)
1. **Seasonal modulation** search with extended dataset
2. **Directional sensitivity** analysis using track reconstruction
3. **Multi-detector coincidence** study with partner experiments
4. **Machine learning enhancement** with transformer models

### Long-term Goals (1-2 years)
1. **Detector upgrade** to 5-ton active mass
2. **Ultra-low background** materials screening
3. **Next-generation readout** electronics installation
4. **Joint analysis** with global dark matter network
` : ''}

${selectedSections.includes('Literature Citations') ? `
## Literature Citations

### Key References
1. **Aprile et al. (2018)** - "Dark Matter Search Results from a One Ton-Year Exposure of XENON1T", *Phys. Rev. Lett.* 121, 111302
2. **Akerib et al. (2017)** - "Results from a search for dark matter in the complete LUX exposure", *Phys. Rev. Lett.* 118, 021303
3. **Agnes et al. (2018)** - "Low-Mass Dark Matter Search with the DarkSide-50 Experiment", *Phys. Rev. Lett.* 121, 081307

### Methodology References
4. **Szydagis et al. (2021)** - "A Review of Basic Energy Reconstruction Techniques in Liquid Xenon", *Instruments* 5, 13
5. **Baudis (2018)** - "Dark matter detection", *J. Phys. G* 43, 044001

### Statistical Methods
6. **Cowan et al. (2011)** - "Asymptotic formulae for likelihood-based tests", *Eur. Phys. J. C* 71, 1554
7. **Yellin (2002)** - "Finding an upper limit in the presence of an unknown background", *Phys. Rev. D* 66, 032005
` : ''}

---

## Conclusions

This analysis represents a significant step forward in dark matter detection sensitivity. The identification of ${selectedSections.includes('Results & Findings') ? '34 WIMP-like candidates' : 'multiple candidate events'} provides compelling evidence for further investigation, while the ${selectedSections.includes('Anomaly Highlights') ? '5 detected anomalies' : 'anomalous events'} highlight the importance of systematic studies.

${selectedSections.includes('Proposed Follow-ups') ? 'The proposed follow-up program will enhance our detection capabilities and provide crucial validation of these preliminary results.' : ''}

**Report generated using AI-assisted analysis pipeline v2.1.3**
`;
  };

  return (
    <PageLayout
      title="Report Generator"
      description="Generate comprehensive analysis reports for your detection data"
    >
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Configuration Panel (Left) */}
        <Card className="backdrop-blur-md bg-card/50 border-white/10">
          <CardHeader>
            <CardTitle>Report Configuration</CardTitle>
            <CardDescription>Customize your analysis report settings</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Quick Start Templates */}
            <div>
              <Label className="text-sm font-semibold mb-3 block">Quick Start Templates</Label>
              <div className="grid grid-cols-3 gap-2">
                {quickStartTemplates.map((template) => (
                  <Button
                    key={template.name}
                    variant="outline"
                    size="sm"
                    onClick={() => loadTemplate(template)}
                    className="flex flex-col items-center gap-1 h-auto py-3 border-white/10 hover:bg-white/5"
                  >
                    <template.icon className="w-4 h-4" />
                    <span className="text-xs">{template.name}</span>
                  </Button>
                ))}
              </div>
            </div>

            {/* Report Type */}
            <div>
              <Label className="text-sm font-semibold mb-3 block">Report Type</Label>
              <RadioGroup value={config.type} onValueChange={(value) => updateConfig('type', value)}>
                {reportTypes.map((type) => (
                  <div key={type.id} className="flex items-start space-x-3 space-y-0">
                    <RadioGroupItem value={type.id} id={type.id} className="mt-1" />
                    <div className="grid gap-1.5 leading-none">
                      <Label htmlFor={type.id} className="text-sm font-medium cursor-pointer">
                        {type.label}
                      </Label>
                      <p className="text-xs text-muted-foreground">{type.description}</p>
                    </div>
                  </div>
                ))}
              </RadioGroup>
            </div>

            {/* Sections to Include */}
            <div>
              <Label className="text-sm font-semibold mb-3 block">Sections to Include</Label>
              <div className="space-y-3">
                {sectionOptions.map((section) => (
                  <div key={section.id} className="flex items-start space-x-3">
                    <Checkbox
                      id={section.id}
                      checked={config.sections[section.id]}
                      onCheckedChange={(checked) => updateSection(section.id, checked as boolean)}
                      className="mt-1"
                    />
                    <div className="grid gap-1.5 leading-none">
                      <Label htmlFor={section.id} className="text-sm font-medium cursor-pointer">
                        {section.label}
                      </Label>
                      <p className="text-xs text-muted-foreground">{section.description}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Output Format */}
            <div>
              <Label className="text-sm font-semibold mb-2 block">Output Format</Label>
              <Select value={config.format} onValueChange={(value) => updateConfig('format', value)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="pdf">PDF Document</SelectItem>
                  <SelectItem value="markdown">Markdown File</SelectItem>
                  <SelectItem value="latex">LaTeX Source</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Date Range */}
            <div>
              <Label className="text-sm font-semibold mb-2 block">Date Range for Events</Label>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <Label htmlFor="startDate" className="text-xs text-muted-foreground">Start Date</Label>
                  <Input
                    id="startDate"
                    type="date"
                    value={config.startDate}
                    onChange={(e) => updateConfig('startDate', e.target.value)}
                  />
                </div>
                <div>
                  <Label htmlFor="endDate" className="text-xs text-muted-foreground">End Date</Label>
                  <Input
                    id="endDate"
                    type="date"
                    value={config.endDate}
                    onChange={(e) => updateConfig('endDate', e.target.value)}
                  />
                </div>
              </div>
            </div>

            {/* Generate Button */}
            <Button
              onClick={generateReport}
              disabled={isGenerating}
              variant="premium"
              className="w-full group"
            >
              {isGenerating ? (
                <>
                  <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin mr-2" />
                  Generating...
                </>
              ) : (
                <>
                  <FileText className="w-4 h-4 mr-2 transition-transform duration-300 group-hover:translate-x-1" />
                  Generate Report
                </>
              )}
            </Button>
          </CardContent>
        </Card>

        {/* Preview Panel (Right) */}
        <Card className="backdrop-blur-md bg-card/50 border-white/10">
          <CardHeader className="flex flex-row items-center justify-between">
            <div>
              <CardTitle>Report Preview</CardTitle>
              <CardDescription>Live preview of your generated report</CardDescription>
            </div>
            {reportGenerated && (
              <Button size="sm" className="bg-green-600 hover:bg-green-700">
                <Download className="w-4 h-4 mr-2" />
                Download Report
              </Button>
            )}
          </CardHeader>
          <CardContent>
            <div className="border border-white/10 rounded-lg p-4 h-96 overflow-y-auto bg-background/30">
              {isGenerating || reportGenerated ? (
                <div className="prose prose-invert prose-sm max-w-none">
                  <ReactMarkdown>{generateMarkdownPreview()}</ReactMarkdown>
                </div>
              ) : (
                <div className="flex items-center justify-center h-full text-muted-foreground">
                  <div className="text-center">
                    <FileText className="w-16 h-16 mx-auto mb-4 opacity-50" />
                    <p>Configure your report settings and click "Generate Report" to see preview</p>
                  </div>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Generation Progress */}
      {isGenerating && (
        <Card className="backdrop-blur-md bg-card/50 border-white/10 mt-6">
          <CardContent className="pt-6">
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">Generation Progress</span>
                <span className="text-sm text-muted-foreground">{Math.round(generationProgress)}%</span>
              </div>
              <Progress value={generationProgress} className="w-full" />
              <div className="flex items-center gap-4 text-sm">
                <div className="flex items-center gap-2">
                  <div className={`w-2 h-2 rounded-full ${generationProgress >= 25 ? 'bg-green-400' : 'bg-muted'}`} />
                  <span className={generationProgress >= 25 ? 'text-green-400' : 'text-muted-foreground'}>
                    Analyzing dataset...
                  </span>
                </div>
                <ChevronRight className="w-4 h-4 text-muted-foreground" />
                <div className="flex items-center gap-2">
                  <div className={`w-2 h-2 rounded-full ${generationProgress >= 50 ? 'bg-green-400' : 'bg-muted'}`} />
                  <span className={generationProgress >= 50 ? 'text-green-400' : 'text-muted-foreground'}>
                    Generating visualizations...
                  </span>
                </div>
                <ChevronRight className="w-4 h-4 text-muted-foreground" />
                <div className="flex items-center gap-2">
                  <div className={`w-2 h-2 rounded-full ${generationProgress >= 75 ? 'bg-green-400' : 'bg-muted'}`} />
                  <span className={generationProgress >= 75 ? 'text-green-400' : 'text-muted-foreground'}>
                    Writing narrative...
                  </span>
                </div>
                <ChevronRight className="w-4 h-4 text-muted-foreground" />
                <div className="flex items-center gap-2">
                  <div className={`w-2 h-2 rounded-full ${generationProgress >= 100 ? 'bg-green-400' : 'bg-muted'}`} />
                  <span className={generationProgress >= 100 ? 'text-green-400' : 'text-muted-foreground'}>
                    Complete!
                  </span>
                </div>
              </div>
              {currentStep && (
                <div className="text-center text-sm text-primary font-medium">{currentStep}</div>
              )}
            </div>
          </CardContent>
        </Card>
      )}
    </PageLayout>
  );
};

export default ReportGenerator;
