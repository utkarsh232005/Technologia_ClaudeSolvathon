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
  const [generatedReportContent, setGeneratedReportContent] = useState('');
  const [lastGeneratedConfig, setLastGeneratedConfig] = useState<ReportConfig | null>(null);

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
    setGeneratedReportContent('');

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

    // Generate and store the report content
    const reportContent = generateMarkdownPreview();
    setGeneratedReportContent(reportContent);
    setLastGeneratedConfig({ ...config });
    
    setGenerationProgress(100);
    setIsGenerating(false);
    setReportGenerated(true);
    
    // Show success message
    showToast.success("Report Generated Successfully!", "Your analysis report is ready for download.");
  };

  const downloadReport = () => {
    if (!generatedReportContent) {
      showToast.error("No Report to Download", "Please generate a report first.");
      return;
    }

    const reportTypeTitle = reportTypes.find(t => t.id === config.type)?.label || 'Report';
    const timestamp = new Date().toISOString().split('T')[0];
    let filename = `${reportTypeTitle.replace(/\s+/g, '_')}_${timestamp}`;
    let content = generatedReportContent;
    let mimeType = 'text/plain';

    // Handle different file formats
    switch (config.format) {
      case 'pdf':
        filename += '.pdf';
        // For a real implementation, you would convert markdown to PDF here
        // For now, we'll download as text with PDF extension
        mimeType = 'application/pdf';
        break;
      case 'markdown':
        filename += '.md';
        mimeType = 'text/markdown';
        break;
      case 'latex':
        filename += '.tex';
        // Convert markdown to basic LaTeX format
        content = convertToLatex(generatedReportContent);
        mimeType = 'application/x-latex';
        break;
      default:
        filename += '.txt';
    }

    // Create and download the file
    const blob = new Blob([content], { type: mimeType });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);

    showToast.success("Download Started", `${filename} is being downloaded.`);
  };

  const convertToLatex = (markdown: string): string => {
    // Basic markdown to LaTeX conversion
    return markdown
      .replace(/^# (.*$)/gim, '\\section{$1}')
      .replace(/^## (.*$)/gim, '\\subsection{$1}')
      .replace(/^### (.*$)/gim, '\\subsubsection{$1}')
      .replace(/\*\*(.*?)\*\*/g, '\\textbf{$1}')
      .replace(/\*(.*?)\*/g, '\\textit{$1}')
      .replace(/^---$/gm, '\\hrule')
      .replace(/^\* (.*$)/gim, '\\item $1')
      .replace(/^\d+\. (.*$)/gim, '\\item $1');
  };

  const hasConfigChanged = (): boolean => {
    if (!lastGeneratedConfig) return false;
    return JSON.stringify(config) !== JSON.stringify(lastGeneratedConfig);
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
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-purple-950 to-slate-950">
      {/* Page Header */}
      <div className="max-w-7xl mx-auto px-8 pt-12 pb-8">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-extrabold bg-gradient-to-r from-white via-cyan-300 to-blue-400 bg-clip-text text-transparent mb-2" 
              style={{ 
                textShadow: '0 0 20px rgba(34, 211, 238, 0.25)',
                letterSpacing: '0.5px'
              }}>
            Report Generator
          </h1>
          <p className="text-base text-gray-400 leading-relaxed max-w-2xl mx-auto">
            Generate comprehensive analysis reports for your detection data with advanced visualization and insights
          </p>
        </div>

        <div className="grid grid-cols-1 xl:grid-cols-2 gap-8 max-w-[1600px] mx-auto">
          {/* Configuration Panel (Left) */}
          <div className="bg-slate-900/80 border border-slate-600 rounded-2xl p-9 shadow-lg">
            <div className="space-y-7">
              {/* Quick Start Templates */}
              <div>
                <div className="flex items-center mb-4">
                  <div className="w-0.5 h-8 bg-gradient-to-b from-purple-500 to-cyan-500 rounded-full mr-3.5"></div>
                  <h3 className="text-base font-semibold text-white">Quick Start Templates</h3>
                </div>
                <div className="grid grid-cols-3 gap-3">
                  {quickStartTemplates.map((template) => (
                    <button
                      key={template.name}
                      onClick={() => loadTemplate(template)}
                      className="bg-slate-800/80 border-[1.5px] border-slate-600 rounded-lg p-5 text-center transition-all duration-300 ease-out hover:bg-blue-600/15 hover:border-blue-500 hover:-translate-y-1 hover:shadow-lg hover:shadow-blue-500/25 group"
                    >
                      <template.icon className="w-6 h-6 text-cyan-400 mx-auto mb-3 transition-all duration-200 group-hover:scale-110 group-hover:text-cyan-300" />
                      <span className="text-sm font-medium text-white">{template.name}</span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Report Type */}
              <div>
                <div className="flex items-center mb-4">
                  <div className="w-0.5 h-8 bg-gradient-to-b from-purple-500 to-cyan-500 rounded-full mr-3.5"></div>
                  <h3 className="text-base font-semibold text-white">Report Type</h3>
                </div>
                <div className="space-y-3">
                  {reportTypes.map((type) => (
                    <div
                      key={type.id}
                      onClick={() => updateConfig('type', type.id)}
                      className={`bg-slate-800/60 border-[1.5px] rounded-lg p-4 cursor-pointer transition-all duration-250 hover:bg-slate-800/80 hover:border-blue-500 hover:translate-x-0.5 ${
                        config.type === type.id
                          ? 'bg-blue-600/12 border-blue-500 border-2 shadow-[0_0_0_3px_rgba(59,130,246,0.1)]'
                          : 'border-slate-600'
                      }`}
                    >
                      <div className="flex items-start space-x-4">
                        <div className="relative mt-1">
                          <div className={`w-5 h-5 rounded-full border-2 transition-all duration-250 ${
                            config.type === type.id
                              ? 'border-blue-500 shadow-[0_0_0_4px_rgba(59,130,246,0.15)]'
                              : 'border-slate-500'
                          }`}>
                            {config.type === type.id && (
                              <div className="absolute inset-1 rounded-full bg-gradient-to-br from-purple-600 to-cyan-500"></div>
                            )}
                          </div>
                        </div>
                        <div className="flex-1">
                          <h4 className="text-base font-semibold text-white mb-1">{type.label}</h4>
                          <p className="text-sm text-slate-300">{type.description}</p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Sections to Include */}
              <div>
                <div className="flex items-center mb-4">
                  <div className="w-0.5 h-8 bg-gradient-to-b from-purple-500 to-cyan-500 rounded-full mr-3.5"></div>
                  <h3 className="text-base font-semibold text-white">Sections to Include</h3>
                </div>
                <div className="space-y-2.5">
                  {sectionOptions.map((section) => (
                    <div key={section.id} className="flex items-start space-x-3 group">
                      <div className="relative mt-1">
                        <input
                          type="checkbox"
                          id={section.id}
                          checked={config.sections[section.id]}
                          onChange={(e) => updateSection(section.id, e.target.checked)}
                          className="w-5 h-5 rounded border-2 border-slate-500 bg-transparent cursor-pointer transition-all duration-250 checked:bg-gradient-to-br checked:from-purple-600 checked:to-blue-600 checked:border-blue-500 checked:shadow-[0_0_0_3px_rgba(59,130,246,0.12)] hover:border-blue-500"
                        />
                        {config.sections[section.id] && (
                          <svg className="absolute inset-0 w-5 h-5 text-white pointer-events-none" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                          </svg>
                        )}
                      </div>
                      <label htmlFor={section.id} className="flex-1 cursor-pointer">
                        <div className="text-sm font-medium text-white mb-0.5 group-hover:text-slate-100 transition-colors duration-200">
                          {section.label}
                        </div>
                        <p className="text-xs text-slate-400">{section.description}</p>
                      </label>
                    </div>
                  ))}
                </div>
              </div>

              {/* Output Format */}
              <div>
                <div className="flex items-center mb-3">
                  <div className="w-0.5 h-8 bg-gradient-to-b from-purple-500 to-cyan-500 rounded-full mr-3.5"></div>
                  <h3 className="text-base font-semibold text-white">Output Format</h3>
                </div>
                <select
                  value={config.format}
                  onChange={(e) => updateConfig('format', e.target.value)}
                  className="w-full bg-slate-900 border-[1.5px] border-slate-600 rounded-lg h-12 px-4 text-white text-sm font-medium cursor-pointer transition-all duration-200 focus:border-blue-500 focus:bg-slate-800 focus:shadow-[0_0_0_3px_rgba(59,130,246,0.15)] focus:outline-none hover:border-slate-500"
                >
                  <option value="pdf" className="bg-slate-800 text-slate-200">PDF Document</option>
                  <option value="markdown" className="bg-slate-800 text-slate-200">Markdown File</option>
                  <option value="latex" className="bg-slate-800 text-slate-200">LaTeX Source</option>
                </select>
              </div>

              {/* Date Range */}
              <div>
                <div className="flex items-center mb-3">
                  <div className="w-0.5 h-8 bg-gradient-to-b from-purple-500 to-cyan-500 rounded-full mr-3.5"></div>
                  <h3 className="text-base font-semibold text-white">Date Range for Events</h3>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-xs font-medium text-slate-300 mb-1.5 block">Start Date</label>
                    <input
                      type="date"
                      value={config.startDate}
                      onChange={(e) => updateConfig('startDate', e.target.value)}
                      className="w-full bg-slate-900 border-[1.5px] border-slate-600 rounded-lg h-12 px-4 text-white text-sm transition-all duration-200 focus:border-blue-500 focus:bg-slate-800 focus:shadow-[0_0_0_3px_rgba(59,130,246,0.15)] focus:outline-none"
                    />
                  </div>
                  <div>
                    <label className="text-xs font-medium text-slate-300 mb-1.5 block">End Date</label>
                    <input
                      type="date"
                      value={config.endDate}
                      onChange={(e) => updateConfig('endDate', e.target.value)}
                      className="w-full bg-slate-900 border-[1.5px] border-slate-600 rounded-lg h-12 px-4 text-white text-sm transition-all duration-200 focus:border-blue-500 focus:bg-slate-800 focus:shadow-[0_0_0_3px_rgba(59,130,246,0.15)] focus:outline-none"
                    />
                  </div>
                </div>
              </div>

              {/* Generate Button */}
              <div className="mt-8">
                <button
                  onClick={generateReport}
                  disabled={isGenerating}
                  className="w-full h-[52px] bg-gradient-to-r from-purple-600 via-indigo-600 to-blue-600 text-white text-base font-semibold rounded-lg transition-all duration-300 cubic-bezier(0.4, 0, 0.2, 1) hover:scale-[1.02] hover:-translate-y-0.5 hover:shadow-[0_8px_28px_rgba(139,92,246,0.55)] hover:brightness-110 active:scale-[0.98] disabled:opacity-80 disabled:cursor-not-allowed disabled:hover:scale-100 disabled:hover:translate-y-0 shadow-[0_4px_16px_rgba(139,92,246,0.4)] group relative overflow-hidden"
                >
                  {isGenerating && (
                    <div className="absolute inset-0 bg-gradient-to-r from-purple-600/20 via-indigo-600/20 to-blue-600/20 animate-pulse"></div>
                  )}
                  <div className="relative flex items-center justify-center">
                    {isGenerating ? (
                      <>
                        <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin mr-3" />
                        Generating Report...
                      </>
                    ) : (
                      <>
                        <FileText className="w-5 h-5 mr-3 transition-transform duration-300 group-hover:translate-x-1" />
                        {reportGenerated && hasConfigChanged() ? 'Regenerate Report' : 'Generate Report'}
                      </>
                    )}
                  </div>
                </button>
              </div>
            </div>
          </div>

          {/* Preview Panel (Right) */}
          <div className="bg-slate-900/80 border border-slate-600 rounded-2xl p-9 shadow-lg min-h-[600px]">
            <div className="flex items-center justify-between mb-8">
              <div>
                <h2 className="text-xl font-semibold text-white mb-2">Report Preview</h2>
                <p className="text-sm text-slate-400">Live preview of your generated report</p>
              </div>
              {reportGenerated && (
                <button 
                  onClick={downloadReport}
                  className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg font-medium text-sm transition-colors duration-200 flex items-center shadow-lg hover:shadow-xl transform hover:scale-105"
                >
                  <Download className="w-4 h-4 mr-2" />
                  Download Report
                </button>
              )}
            </div>

            <div className="border border-slate-600 rounded-lg p-6 min-h-[500px] overflow-y-auto bg-slate-900/30 custom-scrollbar">
              {isGenerating || reportGenerated ? (
                <div className="prose prose-invert prose-sm max-w-none">
                  <ReactMarkdown>{reportGenerated ? generatedReportContent : generateMarkdownPreview()}</ReactMarkdown>
                </div>
              ) : (
                <div className="flex items-center justify-center h-full text-slate-500">
                  <div className="text-center max-w-xs">
                    <FileText className="w-20 h-20 mx-auto mb-4 opacity-50 text-slate-500" />
                    <p className="text-sm">Configure your report settings and click "Generate Report" to see preview</p>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Generation Progress */}
        {isGenerating && (
          <div className="bg-slate-900/80 border border-slate-600 rounded-2xl p-6 mt-8 max-w-[1600px] mx-auto">
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium text-white">Generation Progress</span>
                <span className="text-sm text-slate-400">{Math.round(generationProgress)}%</span>
              </div>
              <div className="w-full bg-slate-700 rounded-full h-2">
                <div 
                  className="bg-gradient-to-r from-purple-500 to-blue-500 h-2 rounded-full transition-all duration-300"
                  style={{ width: `${generationProgress}%` }}
                ></div>
              </div>
              <div className="flex items-center gap-4 text-sm flex-wrap">
                <div className="flex items-center gap-2">
                  <div className={`w-2 h-2 rounded-full transition-colors duration-300 ${generationProgress >= 25 ? 'bg-green-400' : 'bg-slate-600'}`} />
                  <span className={`transition-colors duration-300 ${generationProgress >= 25 ? 'text-green-400' : 'text-slate-500'}`}>
                    Analyzing dataset...
                  </span>
                </div>
                <ChevronRight className="w-4 h-4 text-slate-500" />
                <div className="flex items-center gap-2">
                  <div className={`w-2 h-2 rounded-full transition-colors duration-300 ${generationProgress >= 50 ? 'bg-green-400' : 'bg-slate-600'}`} />
                  <span className={`transition-colors duration-300 ${generationProgress >= 50 ? 'text-green-400' : 'text-slate-500'}`}>
                    Generating visualizations...
                  </span>
                </div>
                <ChevronRight className="w-4 h-4 text-slate-500" />
                <div className="flex items-center gap-2">
                  <div className={`w-2 h-2 rounded-full transition-colors duration-300 ${generationProgress >= 75 ? 'bg-green-400' : 'bg-slate-600'}`} />
                  <span className={`transition-colors duration-300 ${generationProgress >= 75 ? 'text-green-400' : 'text-slate-500'}`}>
                    Writing narrative...
                  </span>
                </div>
                <ChevronRight className="w-4 h-4 text-slate-500" />
                <div className="flex items-center gap-2">
                  <div className={`w-2 h-2 rounded-full transition-colors duration-300 ${generationProgress >= 100 ? 'bg-green-400' : 'bg-slate-600'}`} />
                  <span className={`transition-colors duration-300 ${generationProgress >= 100 ? 'text-green-400' : 'text-slate-500'}`}>
                    Complete!
                  </span>
                </div>
              </div>
              {currentStep && (
                <div className="text-center text-sm text-blue-400 font-medium">{currentStep}</div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ReportGenerator;
