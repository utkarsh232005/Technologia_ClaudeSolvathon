import { useState, useRef, useCallback } from 'react';
import PageLayout from '@/components/PageLayout';
import { LoadingSpinner, ProgressBar } from '@/components/LoadingComponents';
import { showToast } from '@/lib/toast';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { 
  Upload, 
  Brain, 
  CheckCircle, 
  Flag, 
  ChevronDown, 
  Copy, 
  ChevronRight, 
  FileText, 
  Download,
  X,
  Clock,
  AlertTriangle,
  BarChart3,
  ExternalLink
} from 'lucide-react';

interface EventData {
  recoilEnergy: string;
  s1Signal: string;
  s2Signal: string;
  pulseShape: string;
  positionX: string;
  positionY: string;
  positionZ: string;
  timestamp: string;
}

interface BatchEventData {
  id: string;
  energy: number;
  s1: number;
  s2: number;
  s2s1Ratio: number;
  type: string;
  confidence: number;
  position?: { x: number; y: number; z: number };
  timestamp?: string;
}

interface ProcessingResult {
  event: BatchEventData;
  classification: {
    type: string;
    confidence: number;
    processingTime: number;
  };
}

interface BatchProcessingState {
  isUploading: boolean;
  isProcessing: boolean;
  uploadedFile: File | null;
  fileData: any[];
  previewData: any[];
  processedResults: ProcessingResult[];
  currentIndex: number;
  totalEvents: number;
  startTime: number;
  errors: string[];
  validationErrors: string[];
}

const requiredColumns = ['energy', 's1', 's2'];
const optionalColumns = ['id', 'position_x', 'position_y', 'position_z', 'timestamp'];

const EventClassifier = () => {
  // Single event classification state
  const [eventData, setEventData] = useState<EventData>({
    recoilEnergy: '',
    s1Signal: '',
    s2Signal: '',
    pulseShape: '',
    positionX: '',
    positionY: '',
    positionZ: '',
    timestamp: ''
  });
  
  const [isClassified, setIsClassified] = useState(false);
  const [isReasoningOpen, setIsReasoningOpen] = useState(false);
  const [expandedSections, setExpandedSections] = useState<{[key: string]: boolean}>({});

  // Batch processing state
  const [batchState, setBatchState] = useState<BatchProcessingState>({
    isUploading: false,
    isProcessing: false,
    uploadedFile: null,
    fileData: [],
    previewData: [],
    processedResults: [],
    currentIndex: 0,
    totalEvents: 0,
    startTime: 0,
    errors: [],
    validationErrors: []
  });

  const fileInputRef = useRef<HTMLInputElement>(null);

  // Utility functions for file processing
  const parseCSV = (csvText: string): any[] => {
    const lines = csvText.trim().split('\n');
    const headers = lines[0].split(',').map(h => h.trim().toLowerCase());
    const data = [];

    for (let i = 1; i < lines.length; i++) {
      const values = lines[i].split(',');
      const row: any = {};
      headers.forEach((header, index) => {
        row[header] = values[index]?.trim();
      });
      data.push(row);
    }

    return data;
  };

  const validateFileData = (data: any[]): string[] => {
    const errors: string[] = [];
    
    if (data.length === 0) {
      errors.push("File appears to be empty");
      return errors;
    }

    const headers = Object.keys(data[0]);
    const missingColumns = requiredColumns.filter(col => !headers.includes(col));
    
    if (missingColumns.length > 0) {
      errors.push(`Missing required columns: ${missingColumns.join(', ')}`);
    }

    // Check for data validity
    let validRows = 0;
    for (const row of data.slice(0, 10)) { // Check first 10 rows
      if (row.energy && row.s1 && row.s2) {
        if (isNaN(Number(row.energy)) || isNaN(Number(row.s1)) || isNaN(Number(row.s2))) {
          errors.push("Invalid numeric values found in energy, s1, or s2 columns");
          break;
        }
        validRows++;
      }
    }

    if (validRows === 0) {
      errors.push("No valid data rows found");
    }

    return errors;
  };

  const processFileUpload = async (file: File) => {
    setBatchState(prev => ({ ...prev, isUploading: true, errors: [], validationErrors: [] }));

    try {
      const text = await file.text();
      let data: any[] = [];

      if (file.name.endsWith('.json')) {
        data = JSON.parse(text);
        if (!Array.isArray(data)) {
          throw new Error("JSON file must contain an array of events");
        }
      } else if (file.name.endsWith('.csv')) {
        data = parseCSV(text);
      } else {
        throw new Error("Only CSV and JSON files are supported");
      }

      const validationErrors = validateFileData(data);
      
      setBatchState(prev => ({
        ...prev,
        isUploading: false,
        uploadedFile: file,
        fileData: data,
        previewData: data.slice(0, 5),
        totalEvents: data.length,
        validationErrors
      }));

    } catch (error) {
      setBatchState(prev => ({
        ...prev,
        isUploading: false,
        errors: [error instanceof Error ? error.message : "Failed to process file"]
      }));
    }
  };

  // Batch processing functions
  const simulateClassification = async (event: any): Promise<ProcessingResult> => {
    const startTime = performance.now();
    
    // Simulate processing delay
    await new Promise(resolve => setTimeout(resolve, 100 + Math.random() * 200));
    
    const s2s1Ratio = Number(event.s2) / Number(event.s1);
    const energy = Number(event.energy);
    
    // Simple classification logic
    let type = 'Background';
    let confidence = 60 + Math.random() * 30;
    
    if (s2s1Ratio < 10 && energy < 20) {
      type = 'WIMP';
      confidence = 75 + Math.random() * 20;
    } else if (s2s1Ratio > 50) {
      type = 'Neutrino';
      confidence = 65 + Math.random() * 25;
    } else if (energy > 40) {
      type = 'Anomaly';
      confidence = 50 + Math.random() * 30;
    }

    const endTime = performance.now();
    
    const batchEvent: BatchEventData = {
      id: event.id || `EVT-${Math.floor(Math.random() * 10000)}`,
      energy: energy,
      s1: Number(event.s1),
      s2: Number(event.s2),
      s2s1Ratio: Number(s2s1Ratio.toFixed(2)),
      type,
      confidence: Math.round(confidence),
      position: event.position_x ? {
        x: Number(event.position_x),
        y: Number(event.position_y || 0),
        z: Number(event.position_z || 0)
      } : undefined,
      timestamp: event.timestamp || new Date().toISOString()
    };

    return {
      event: batchEvent,
      classification: {
        type,
        confidence: Math.round(confidence),
        processingTime: endTime - startTime
      }
    };
  };

  const startBatchProcessing = async () => {
    if (batchState.validationErrors.length > 0) return;

    setBatchState(prev => ({
      ...prev,
      isProcessing: true,
      processedResults: [],
      currentIndex: 0,
      startTime: Date.now(),
      errors: []
    }));

    const results: ProcessingResult[] = [];

    for (let i = 0; i < batchState.fileData.length; i++) {
      // Check if processing was cancelled
      if (!batchState.isProcessing) break;

      try {
        const result = await simulateClassification(batchState.fileData[i]);
        results.push(result);

        setBatchState(prev => ({
          ...prev,
          currentIndex: i + 1,
          processedResults: [...results]
        }));

      } catch (error) {
        setBatchState(prev => ({
          ...prev,
          errors: [...prev.errors, `Error processing event ${i + 1}: ${error}`]
        }));
      }
    }

    setBatchState(prev => ({
      ...prev,
      isProcessing: false
    }));
  };

  const cancelBatchProcessing = () => {
    setBatchState(prev => ({
      ...prev,
      isProcessing: false
    }));
  };

  const resetBatchProcessing = () => {
    setBatchState({
      isUploading: false,
      isProcessing: false,
      uploadedFile: null,
      fileData: [],
      previewData: [],
      processedResults: [],
      currentIndex: 0,
      totalEvents: 0,
      startTime: 0,
      errors: [],
      validationErrors: []
    });
  };

  const downloadResults = () => {
    const csvContent = [
      ['id', 'energy', 's1', 's2', 's2s1Ratio', 'type', 'confidence', 'processing_time_ms'].join(','),
      ...batchState.processedResults.map(result => [
        result.event.id,
        result.event.energy,
        result.event.s1,
        result.event.s2,
        result.event.s2s1Ratio,
        result.event.type,
        result.event.confidence,
        result.classification.processingTime.toFixed(2)
      ].join(','))
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `classified_events_${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  // File upload handlers
  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      processFileUpload(file);
    }
  };

  const handleFileDrop = useCallback((event: React.DragEvent) => {
    event.preventDefault();
    const file = event.dataTransfer.files[0];
    if (file) {
      processFileUpload(file);
    }
  }, []);

  const handleDragOver = useCallback((event: React.DragEvent) => {
    event.preventDefault();
  }, []);

  const toggleSection = (section: string) => {
    setExpandedSections(prev => ({
      ...prev,
      [section]: !prev[section]
    }));
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
  };

  const handleInputChange = (field: keyof EventData, value: string) => {
    setEventData(prev => ({ ...prev, [field]: value }));
  };

  const calculateS2S1Ratio = () => {
    const s1 = parseFloat(eventData.s1Signal);
    const s2 = parseFloat(eventData.s2Signal);
    if (s1 && s2) {
      return (s2 / s1).toFixed(2);
    }
    return '--';
  };

  const loadExample = (type: 'wimp' | 'background') => {
    if (type === 'wimp') {
      setEventData({
        recoilEnergy: '12.5',
        s1Signal: '45',
        s2Signal: '320',
        pulseShape: '0.85',
        positionX: '2.1',
        positionY: '-1.3',
        positionZ: '15.7',
        timestamp: new Date().toISOString().slice(0, 16)
      });
    } else {
      setEventData({
        recoilEnergy: '8.2',
        s1Signal: '120',
        s2Signal: '180',
        pulseShape: '0.45',
        positionX: '0.8',
        positionY: '3.2',
        positionZ: '8.1',
        timestamp: new Date().toISOString().slice(0, 16)
      });
    }
  };

  const classifyEvent = () => {
    setIsClassified(true);
  };

  return (
    <PageLayout
      title="Event Classifier"
      description="AI-powered classification to distinguish WIMP signals from background noise"
    >
      <Tabs defaultValue="single" className="w-full">
        <TabsList className="grid w-full grid-cols-2 mb-6">
          <TabsTrigger value="single">Single Event</TabsTrigger>
          <TabsTrigger value="batch">Batch Processing</TabsTrigger>
        </TabsList>

        <TabsContent value="single">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Left Side - Event Input Form */}
            <Card className="backdrop-blur-md bg-card/50 border-white/10">
              <CardHeader>
                <CardTitle>Event Input</CardTitle>
                <CardDescription>Enter event parameters for classification</CardDescription>
              </CardHeader>
          <CardContent className="space-y-4">
            {/* Quick-fill buttons */}
            <div className="flex gap-2 mb-4">
              <Button 
                variant="outline" 
                size="sm" 
                onClick={() => loadExample('wimp')}
                className="flex-1"
              >
                Load WIMP Example
              </Button>
              <Button 
                variant="outline" 
                size="sm" 
                onClick={() => loadExample('background')}
                className="flex-1"
              >
                Load Background Example
              </Button>
            </div>

            {/* Input fields */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="recoilEnergy">Recoil Energy (keV)</Label>
                <Input
                  id="recoilEnergy"
                  type="number"
                  value={eventData.recoilEnergy}
                  onChange={(e) => handleInputChange('recoilEnergy', e.target.value)}
                  placeholder="0.0"
                />
              </div>
              <div>
                <Label htmlFor="s1Signal">S1 Signal (PE)</Label>
                <Input
                  id="s1Signal"
                  type="number"
                  value={eventData.s1Signal}
                  onChange={(e) => handleInputChange('s1Signal', e.target.value)}
                  placeholder="0"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="s2Signal">S2 Signal (PE)</Label>
                <Input
                  id="s2Signal"
                  type="number"
                  value={eventData.s2Signal}
                  onChange={(e) => handleInputChange('s2Signal', e.target.value)}
                  placeholder="0"
                />
              </div>
              <div>
                <Label htmlFor="pulseShape">Pulse Shape (0-1)</Label>
                <Input
                  id="pulseShape"
                  type="number"
                  step="0.01"
                  min="0"
                  max="1"
                  value={eventData.pulseShape}
                  onChange={(e) => handleInputChange('pulseShape', e.target.value)}
                  placeholder="0.00"
                />
              </div>
            </div>

            <div className="grid grid-cols-3 gap-4">
              <div>
                <Label htmlFor="positionX">Position X (cm)</Label>
                <Input
                  id="positionX"
                  type="number"
                  value={eventData.positionX}
                  onChange={(e) => handleInputChange('positionX', e.target.value)}
                  placeholder="0.0"
                />
              </div>
              <div>
                <Label htmlFor="positionY">Position Y (cm)</Label>
                <Input
                  id="positionY"
                  type="number"
                  value={eventData.positionY}
                  onChange={(e) => handleInputChange('positionY', e.target.value)}
                  placeholder="0.0"
                />
              </div>
              <div>
                <Label htmlFor="positionZ">Position Z (cm)</Label>
                <Input
                  id="positionZ"
                  type="number"
                  value={eventData.positionZ}
                  onChange={(e) => handleInputChange('positionZ', e.target.value)}
                  placeholder="0.0"
                />
              </div>
            </div>

            <div>
              <Label htmlFor="timestamp">Timestamp</Label>
              <Input
                id="timestamp"
                type="datetime-local"
                value={eventData.timestamp}
                onChange={(e) => handleInputChange('timestamp', e.target.value)}
              />
            </div>

            {/* S2/S1 Ratio Display */}
            <div className="p-3 bg-muted/20 rounded-lg">
              <div className="text-sm text-muted-foreground">S2/S1 Ratio</div>
              <div className="text-2xl font-bold text-primary">{calculateS2S1Ratio()}</div>
            </div>

            {/* Action buttons */}
            <div className="space-y-2">
              <Button 
                className="w-full bg-gradient-to-r from-primary to-secondary hover:opacity-90"
                onClick={classifyEvent}
              >
                <Brain className="w-4 h-4 mr-2" />
                Classify Event
              </Button>
              <Button variant="outline" className="w-full">
                <Upload className="w-4 h-4 mr-2" />
                Upload CSV for Batch
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Right Side - Classification Result */}
        <Card className="backdrop-blur-md bg-card/50 border-white/10">
          <CardHeader>
            <CardTitle>Classification Result</CardTitle>
            <CardDescription>AI analysis and confidence assessment</CardDescription>
          </CardHeader>
          <CardContent>
            {!isClassified ? (
              <div className="flex items-center justify-center h-96 text-muted-foreground">
                <div className="text-center">
                  <Brain className="w-16 h-16 mx-auto mb-4 opacity-50" />
                  <p>Enter event data and click "Classify Event" to see results</p>
                </div>
              </div>
            ) : (
              <div className="space-y-6">
                {/* Result Label */}
                <div className="text-center p-6 rounded-lg bg-blue-500/10 border border-blue-500/20">
                  <div className="text-3xl font-bold text-blue-400 mb-2">WIMP-Like Candidate</div>
                  <div className="text-sm text-muted-foreground">High probability dark matter signal</div>
                </div>

                {/* Confidence Gauge */}
                <div className="text-center">
                  <div className="text-sm text-muted-foreground mb-2">Confidence</div>
                  <div className="relative w-32 h-32 mx-auto mb-4">
                    <svg className="w-32 h-32 transform -rotate-90" viewBox="0 0 100 100">
                      <circle
                        cx="50"
                        cy="50"
                        r="40"
                        stroke="currentColor"
                        strokeWidth="8"
                        fill="transparent"
                        className="text-muted/20"
                      />
                      <circle
                        cx="50"
                        cy="50"
                        r="40"
                        stroke="currentColor"
                        strokeWidth="8"
                        fill="transparent"
                        strokeDasharray={`${87 * 2.51} ${100 * 2.51}`}
                        className="text-blue-400"
                      />
                    </svg>
                    <div className="absolute inset-0 flex items-center justify-center">
                      <span className="text-2xl font-bold text-blue-400">87%</span>
                    </div>
                  </div>
                </div>

                {/* Key Features */}
                <div>
                  <h4 className="font-semibold mb-3 text-foreground">Key Features</h4>
                  <div className="space-y-2">
                    <div className="flex items-center gap-2">
                      <CheckCircle className="w-4 h-4 text-green-400" />
                      <span className="text-sm">Low recoil energy (12.5 keV)</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <CheckCircle className="w-4 h-4 text-green-400" />
                      <span className="text-sm">High S2/S1 ratio (7.11)</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <CheckCircle className="w-4 h-4 text-green-400" />
                      <span className="text-sm">Nuclear recoil-like pulse shape</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <CheckCircle className="w-4 h-4 text-green-400" />
                      <span className="text-sm">Fiducial volume position</span>
                    </div>
                  </div>
                </div>

                {/* Expandable Reasoning Explorer */}
                <Collapsible open={isReasoningOpen} onOpenChange={setIsReasoningOpen}>
                  <CollapsibleTrigger asChild>
                    <Button variant="ghost" className="w-full justify-between p-0">
                      <span className="font-semibold">View Full Reasoning</span>
                      <ChevronDown className={`w-4 h-4 transition-transform ${isReasoningOpen ? 'rotate-180' : ''}`} />
                    </Button>
                  </CollapsibleTrigger>
                  <CollapsibleContent className="mt-3">
                    <div className="space-y-4">
                      {/* Main Analysis Tree */}
                      <div className="bg-muted/10 rounded-lg p-4 font-mono text-sm">
                        <div className="flex items-center justify-between mb-3">
                          <h4 className="font-semibold font-sans">Analysis Tree</h4>
                          <Button 
                            size="sm" 
                            variant="ghost" 
                            onClick={() => copyToClipboard(`Event Classification Analysis:
├─ Step 1: Energy Analysis
│  ├─ Recoil energy: 12.5 keV (consistent with WIMP interaction)
│  └─ Below nuclear recoil threshold (50 keV)
├─ Step 2: Signal Discrimination
│  ├─ S2/S1 ratio: 7.11 (nuclear recoil band)
│  └─ Electronic recoil ratio would be >20
├─ Step 3: Pulse Shape Analysis
│  └─ Decay time: 0.85 (nuclear recoil characteristic)
├─ Step 4: Spatial Check
│  └─ Position (2.1, -1.3, 15.7) within fiducial volume
└─ Conclusion: WIMP-like candidate (87% confidence)`)}
                          >
                            <Copy className="w-3 h-3" />
                          </Button>
                        </div>
                        
                        <div className="text-green-400">
                          <div className="cursor-pointer" onClick={() => toggleSection('step1')}>
                            <span className={expandedSections.step1 ? 'text-blue-400' : ''}>
                              {expandedSections.step1 ? '├─' : '├─'} Step 1: Energy Analysis
                            </span>
                          </div>
                          {expandedSections.step1 && (
                            <div className="ml-2 text-gray-300">
                              <div>│  ├─ Recoil energy: {eventData.recoilEnergy || '12.5'} keV (consistent with WIMP interaction)</div>
                              <div>│  ├─ Below nuclear recoil threshold (50 keV)</div>
                              <div>│  └─ Energy spectrum matches expected WIMP range</div>
                            </div>
                          )}
                          
                          <div className="cursor-pointer" onClick={() => toggleSection('step2')}>
                            <span className={expandedSections.step2 ? 'text-blue-400' : ''}>
                              ├─ Step 2: Signal Discrimination
                            </span>
                          </div>
                          {expandedSections.step2 && (
                            <div className="ml-2 text-gray-300">
                              <div>│  ├─ S2/S1 ratio: {calculateS2S1Ratio()} (nuclear recoil band)</div>
                              <div>│  ├─ Electronic recoil ratio would be &gt;20</div>
                              <div>│  └─ Charge yield consistent with nuclear recoil</div>
                            </div>
                          )}
                          
                          <div className="cursor-pointer" onClick={() => toggleSection('step3')}>
                            <span className={expandedSections.step3 ? 'text-blue-400' : ''}>
                              ├─ Step 3: Pulse Shape Analysis
                            </span>
                          </div>
                          {expandedSections.step3 && (
                            <div className="ml-2 text-gray-300">
                              <div>│  ├─ Decay time: {eventData.pulseShape || '0.85'} (nuclear recoil characteristic)</div>
                              <div>│  ├─ Rise time within expected range</div>
                              <div>│  └─ F90 parameter indicates nuclear interaction</div>
                            </div>
                          )}
                          
                          <div className="cursor-pointer" onClick={() => toggleSection('step4')}>
                            <span className={expandedSections.step4 ? 'text-blue-400' : ''}>
                              ├─ Step 4: Spatial Check
                            </span>
                          </div>
                          {expandedSections.step4 && (
                            <div className="ml-2 text-gray-300">
                              <div>│  ├─ Position ({eventData.positionX || '2.1'}, {eventData.positionY || '-1.3'}, {eventData.positionZ || '15.7'}) cm</div>
                              <div>│  ├─ Within fiducial volume boundaries</div>
                              <div>│  └─ Away from detector walls (background rejection)</div>
                            </div>
                          )}
                          
                          <div className="text-yellow-400">
                            └─ <span className="font-bold">Conclusion: WIMP-like candidate (87% confidence)</span>
                          </div>
                        </div>
                      </div>

                      {/* Related Literature */}
                      <Collapsible open={expandedSections.literature} onOpenChange={() => toggleSection('literature')}>
                        <CollapsibleTrigger asChild>
                          <Button variant="ghost" className="w-full justify-between text-left">
                            <span className="font-semibold">Related Literature</span>
                            <div className="flex items-center gap-2">
                              <Copy 
                                className="w-3 h-3" 
                                onClick={(e) => {
                                  e.stopPropagation();
                                  copyToClipboard(`Related Literature:
1. Aprile et al. (2018) - "Dark Matter Search Results from a One Ton-Year Exposure of XENON1T"
2. Akerib et al. (2017) - "Results from a search for dark matter in the complete LUX exposure"
3. Agnes et al. (2018) - "Low-Mass Dark Matter Search with the DarkSide-50 Experiment"`);
                                }}
                              />
                              <ChevronRight className={`w-4 h-4 transition-transform ${expandedSections.literature ? 'rotate-90' : ''}`} />
                            </div>
                          </Button>
                        </CollapsibleTrigger>
                        <CollapsibleContent>
                          <div className="bg-muted/10 rounded-lg p-3 text-sm space-y-2">
                            <div>
                              <div className="font-semibold text-blue-400">1. Aprile et al. (2018)</div>
                              <div className="text-muted-foreground">"Dark Matter Search Results from a One Ton-Year Exposure of XENON1T"</div>
                              <div className="text-xs">Phys. Rev. Lett. 121, 111302 - Similar S2/S1 discrimination methods</div>
                            </div>
                            <div>
                              <div className="font-semibold text-blue-400">2. Akerib et al. (2017)</div>
                              <div className="text-muted-foreground">"Results from a search for dark matter in the complete LUX exposure"</div>
                              <div className="text-xs">Phys. Rev. Lett. 118, 021303 - Pulse shape discrimination techniques</div>
                            </div>
                            <div>
                              <div className="font-semibold text-blue-400">3. Agnes et al. (2018)</div>
                              <div className="text-muted-foreground">"Low-Mass Dark Matter Search with the DarkSide-50 Experiment"</div>
                              <div className="text-xs">Phys. Rev. Lett. 121, 081307 - Low-energy nuclear recoil analysis</div>
                            </div>
                          </div>
                        </CollapsibleContent>
                      </Collapsible>

                      {/* Alternative Hypotheses */}
                      <Collapsible open={expandedSections.alternatives} onOpenChange={() => toggleSection('alternatives')}>
                        <CollapsibleTrigger asChild>
                          <Button variant="ghost" className="w-full justify-between text-left">
                            <span className="font-semibold">Alternative Hypotheses</span>
                            <div className="flex items-center gap-2">
                              <Copy 
                                className="w-3 h-3" 
                                onClick={(e) => {
                                  e.stopPropagation();
                                  copyToClipboard(`Alternative Hypotheses:
1. Neutron scatter (15% probability) - Could produce similar nuclear recoil signature
2. Alpha decay (8% probability) - Possible if alpha particle energy deposited partially
3. Detector artifact (5% probability) - Electronic noise or calibration issue`);
                                }}
                              />
                              <ChevronRight className={`w-4 h-4 transition-transform ${expandedSections.alternatives ? 'rotate-90' : ''}`} />
                            </div>
                          </Button>
                        </CollapsibleTrigger>
                        <CollapsibleContent>
                          <div className="bg-muted/10 rounded-lg p-3 text-sm space-y-2">
                            <div className="flex justify-between items-start">
                              <div>
                                <div className="font-semibold text-orange-400">Neutron scatter (15% probability)</div>
                                <div className="text-muted-foreground">Could produce similar nuclear recoil signature</div>
                                <div className="text-xs">• Would require coincident veto failure</div>
                                <div className="text-xs">• Energy spectrum slightly different</div>
                              </div>
                            </div>
                            <div>
                              <div className="font-semibold text-orange-400">Alpha decay (8% probability)</div>
                              <div className="text-muted-foreground">Possible if alpha particle energy deposited partially</div>
                              <div className="text-xs">• Requires surface contamination</div>
                              <div className="text-xs">• Pulse shape would be different</div>
                            </div>
                            <div>
                              <div className="font-semibold text-orange-400">Detector artifact (5% probability)</div>
                              <div className="text-muted-foreground">Electronic noise or calibration issue</div>
                              <div className="text-xs">• Statistical analysis shows low probability</div>
                              <div className="text-xs">• Would require multiple system failures</div>
                            </div>
                          </div>
                        </CollapsibleContent>
                      </Collapsible>

                      {/* Suggested Follow-ups */}
                      <Collapsible open={expandedSections.followups} onOpenChange={() => toggleSection('followups')}>
                        <CollapsibleTrigger asChild>
                          <Button variant="ghost" className="w-full justify-between text-left">
                            <span className="font-semibold">Suggested Follow-ups</span>
                            <div className="flex items-center gap-2">
                              <Copy 
                                className="w-3 h-3" 
                                onClick={(e) => {
                                  e.stopPropagation();
                                  copyToClipboard(`Suggested Follow-ups:
1. Cross-check with neutron veto systems
2. Analyze events in temporal vicinity (±10 minutes)
3. Verify detector calibration for this energy range
4. Review similar events in historical data
5. Perform Monte Carlo simulation comparison`);
                                }}
                              />
                              <ChevronRight className={`w-4 h-4 transition-transform ${expandedSections.followups ? 'rotate-90' : ''}`} />
                            </div>
                          </Button>
                        </CollapsibleTrigger>
                        <CollapsibleContent>
                          <div className="bg-muted/10 rounded-lg p-3 text-sm space-y-2">
                            <div className="flex items-center gap-2">
                              <span className="text-green-400">1.</span>
                              <span>Cross-check with neutron veto systems</span>
                            </div>
                            <div className="flex items-center gap-2">
                              <span className="text-green-400">2.</span>
                              <span>Analyze events in temporal vicinity (±10 minutes)</span>
                            </div>
                            <div className="flex items-center gap-2">
                              <span className="text-green-400">3.</span>
                              <span>Verify detector calibration for this energy range</span>
                            </div>
                            <div className="flex items-center gap-2">
                              <span className="text-green-400">4.</span>
                              <span>Review similar events in historical data</span>
                            </div>
                            <div className="flex items-center gap-2">
                              <span className="text-green-400">5.</span>
                              <span>Perform Monte Carlo simulation comparison</span>
                            </div>
                          </div>
                        </CollapsibleContent>
                      </Collapsible>
                    </div>
                  </CollapsibleContent>
                </Collapsible>

                {/* Flag as Anomaly Button */}
                <Button variant="outline" className="w-full border-orange-500/50 text-orange-400 hover:bg-orange-500/10">
                  <Flag className="w-4 h-4 mr-2" />
                  Flag as Anomaly
                </Button>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </TabsContent>

    <TabsContent value="batch">
      <div className="space-y-6">
        {/* File Upload Section */}
        {!batchState.uploadedFile && (
          <Card className="backdrop-blur-md bg-card/50 border-white/10">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Upload className="w-5 h-5" />
                Upload Event Data
              </CardTitle>
              <CardDescription>
                Upload a CSV or JSON file containing event data for batch classification
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div
                className={`border-2 border-dashed rounded-lg p-8 text-center transition-colors ${
                  batchState.isUploading 
                    ? 'border-primary bg-primary/5' 
                    : 'border-white/20 hover:border-white/40'
                }`}
                onDrop={handleFileDrop}
                onDragOver={handleDragOver}
              >
                <div className="mx-auto flex max-w-[420px] flex-col items-center justify-center text-center">
                  <FileText className="h-10 w-10 text-muted-foreground mb-4" />
                  <h3 className="font-semibold">
                    {batchState.isUploading ? 'Processing file...' : 'Drag and drop your file here'}
                  </h3>
                  <p className="text-sm text-muted-foreground mt-2">
                    {batchState.isUploading ? 'Please wait while we process your file' : 'CSV or JSON files accepted'}
                  </p>
                  {!batchState.isUploading && (
                    <>
                      <div className="text-sm text-muted-foreground mt-4">or</div>
                      <Button 
                        variant="outline" 
                        className="mt-4"
                        onClick={() => fileInputRef.current?.click()}
                      >
                        Click to browse
                      </Button>
                    </>
                  )}
                </div>
              </div>

              <input
                ref={fileInputRef}
                type="file"
                accept=".csv,.json"
                onChange={handleFileSelect}
                className="hidden"
              />

              {batchState.errors.length > 0 && (
                <Alert className="mt-4 border-red-500/50 bg-red-500/10">
                  <AlertTriangle className="h-4 w-4" />
                  <AlertDescription>
                    {batchState.errors.map((error, index) => (
                      <div key={index}>{error}</div>
                    ))}
                  </AlertDescription>
                </Alert>
              )}

              <div className="mt-4 text-xs text-muted-foreground">
                <p><strong>Required columns:</strong> energy, s1, s2</p>
                <p><strong>Optional columns:</strong> id, position_x, position_y, position_z, timestamp</p>
                <p><strong>Supported formats:</strong> CSV with headers, JSON array of objects</p>
              </div>
            </CardContent>
          </Card>
        )}

        {/* File Preview Section */}
        {batchState.uploadedFile && !batchState.isProcessing && batchState.processedResults.length === 0 && (
          <Card className="backdrop-blur-md bg-card/50 border-white/10">
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="flex items-center gap-2">
                    <CheckCircle className="w-5 h-5 text-green-500" />
                    File Uploaded Successfully
                  </CardTitle>
                  <CardDescription>
                    {batchState.uploadedFile.name} • {(batchState.uploadedFile.size / 1024).toFixed(1)} KB • {batchState.totalEvents} events
                  </CardDescription>
                </div>
                <Button variant="outline" size="sm" onClick={resetBatchProcessing}>
                  <X className="w-4 h-4 mr-2" />
                  Remove
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              {batchState.validationErrors.length > 0 && (
                <Alert className="mb-4 border-red-500/50 bg-red-500/10">
                  <AlertTriangle className="h-4 w-4" />
                  <AlertDescription>
                    <strong>Validation Errors:</strong>
                    {batchState.validationErrors.map((error, index) => (
                      <div key={index}>• {error}</div>
                    ))}
                  </AlertDescription>
                </Alert>
              )}

              {batchState.validationErrors.length === 0 && (
                <>
                  <div className="mb-4">
                    <h4 className="font-medium mb-2">Data Preview (First 5 rows)</h4>
                    <div className="overflow-x-auto">
                      <table className="w-full text-sm">
                        <thead>
                          <tr className="border-b border-white/10">
                            {Object.keys(batchState.previewData[0] || {}).map(key => (
                              <th key={key} className="text-left p-2 font-medium">
                                {key}
                                {requiredColumns.includes(key) && (
                                  <span className="text-red-400 ml-1">*</span>
                                )}
                              </th>
                            ))}
                          </tr>
                        </thead>
                        <tbody>
                          {batchState.previewData.map((row, index) => (
                            <tr key={index} className="border-b border-white/5">
                              {Object.values(row).map((value, valueIndex) => (
                                <td key={valueIndex} className="p-2 font-mono text-xs">
                                  {String(value)}
                                </td>
                              ))}
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>

                  <Button onClick={startBatchProcessing} className="w-full">
                    <Brain className="w-4 h-4 mr-2" />
                    Start Batch Classification
                  </Button>
                </>
              )}
            </CardContent>
          </Card>
        )}

        {/* Processing View */}
        {batchState.isProcessing && (
          <Card className="backdrop-blur-md bg-card/50 border-white/10">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Brain className="w-5 h-5 animate-pulse" />
                Processing Events
              </CardTitle>
              <CardDescription>
                AI classification in progress...
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div>
                  <div className="flex justify-between text-sm mb-2">
                    <span>Processing event {batchState.currentIndex}/{batchState.totalEvents}...</span>
                    <span>{Math.round((batchState.currentIndex / batchState.totalEvents) * 100)}%</span>
                  </div>
                  <Progress value={(batchState.currentIndex / batchState.totalEvents) * 100} />
                </div>

                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
                  <div className="p-3 bg-muted/20 rounded-lg">
                    <div className="text-2xl font-bold">{batchState.currentIndex}</div>
                    <div className="text-xs text-muted-foreground">Processed</div>
                  </div>
                  <div className="p-3 bg-muted/20 rounded-lg">
                    <div className="text-2xl font-bold">{batchState.totalEvents - batchState.currentIndex}</div>
                    <div className="text-xs text-muted-foreground">Remaining</div>
                  </div>
                  <div className="p-3 bg-muted/20 rounded-lg">
                    <div className="text-2xl font-bold">
                      {batchState.currentIndex > 0 ? 
                        Math.round((Date.now() - batchState.startTime) / batchState.currentIndex) : 0}ms
                    </div>
                    <div className="text-xs text-muted-foreground">Avg Time</div>
                  </div>
                  <div className="p-3 bg-muted/20 rounded-lg">
                    <div className="text-2xl font-bold">
                      {batchState.currentIndex > 0 ? 
                        Math.round(((batchState.totalEvents - batchState.currentIndex) * 
                          (Date.now() - batchState.startTime)) / batchState.currentIndex / 1000) : 0}s
                    </div>
                    <div className="text-xs text-muted-foreground">Est. Remaining</div>
                  </div>
                </div>

                <Button 
                  variant="outline" 
                  onClick={cancelBatchProcessing}
                  className="w-full border-red-500/50 text-red-400 hover:bg-red-500/10"
                >
                  <X className="w-4 h-4 mr-2" />
                  Cancel Processing
                </Button>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Results Summary */}
        {batchState.processedResults.length > 0 && !batchState.isProcessing && (
          <Card className="backdrop-blur-md bg-card/50 border-white/10">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <BarChart3 className="w-5 h-5" />
                Classification Results
              </CardTitle>
              <CardDescription>
                Batch processing completed successfully
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                {/* Classification Breakdown */}
                <div>
                  <h4 className="font-medium mb-3">Classification Breakdown</h4>
                  <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
                    {Object.entries(
                      batchState.processedResults.reduce((acc, result) => {
                        acc[result.event.type] = (acc[result.event.type] || 0) + 1;
                        return acc;
                      }, {} as Record<string, number>)
                    ).map(([type, count]) => (
                      <div key={type} className="text-center p-4 bg-muted/20 rounded-lg">
                        <Badge 
                          variant="outline" 
                          className={`mb-2 ${
                            type === 'WIMP' ? 'border-blue-500/50 text-blue-400' :
                            type === 'Background' ? 'border-green-500/50 text-green-400' :
                            type === 'Axion' ? 'border-purple-500/50 text-purple-400' :
                            type === 'Neutrino' ? 'border-orange-500/50 text-orange-400' :
                            'border-red-500/50 text-red-400'
                          }`}
                        >
                          {type}
                        </Badge>
                        <div className="text-2xl font-bold">{count}</div>
                        <div className="text-xs text-muted-foreground">
                          {((count / batchState.processedResults.length) * 100).toFixed(1)}%
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Processing Stats */}
                <div>
                  <h4 className="font-medium mb-3">Processing Statistics</h4>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="p-4 bg-muted/20 rounded-lg">
                      <div className="flex items-center gap-2 mb-2">
                        <Clock className="w-4 h-4" />
                        <span className="text-sm font-medium">Average Processing Time</span>
                      </div>
                      <div className="text-xl font-bold">
                        {(batchState.processedResults.reduce((acc, result) => 
                          acc + result.classification.processingTime, 0) / 
                          batchState.processedResults.length).toFixed(1)}ms
                      </div>
                    </div>
                    <div className="p-4 bg-muted/20 rounded-lg">
                      <div className="flex items-center gap-2 mb-2">
                        <CheckCircle className="w-4 h-4" />
                        <span className="text-sm font-medium">Total Events</span>
                      </div>
                      <div className="text-xl font-bold">{batchState.processedResults.length}</div>
                    </div>
                    <div className="p-4 bg-muted/20 rounded-lg">
                      <div className="flex items-center gap-2 mb-2">
                        <Brain className="w-4 h-4" />
                        <span className="text-sm font-medium">Average Confidence</span>
                      </div>
                      <div className="text-xl font-bold">
                        {(batchState.processedResults.reduce((acc, result) => 
                          acc + result.event.confidence, 0) / 
                          batchState.processedResults.length).toFixed(1)}%
                      </div>
                    </div>
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="flex flex-col sm:flex-row gap-3">
                  <Button onClick={downloadResults} className="flex-1">
                    <Download className="w-4 h-4 mr-2" />
                    Download Classified Dataset
                  </Button>
                  <Button variant="outline" className="flex-1">
                    <ExternalLink className="w-4 h-4 mr-2" />
                    View in Results Dashboard
                  </Button>
                  <Button variant="outline" onClick={resetBatchProcessing}>
                    <Upload className="w-4 h-4 mr-2" />
                    Process Another File
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </TabsContent>
  </Tabs>
    </PageLayout>
  );
};

export default EventClassifier;
