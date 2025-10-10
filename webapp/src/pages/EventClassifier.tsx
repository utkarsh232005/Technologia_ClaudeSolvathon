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
  ExternalLink,
  Shield,
  Sparkles,
  Box
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

  const loadExample = (type: 'wimp' | 'background' | 'neutrino') => {
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
    } else if (type === 'background') {
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
    } else if (type === 'neutrino') {
      setEventData({
        recoilEnergy: '25.8',
        s1Signal: '78',
        s2Signal: '4200',
        pulseShape: '0.15',
        positionX: '-2.5',
        positionY: '1.8',
        positionZ: '22.3',
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
      {/* Premium Header with Gradient Text */}
      <div className="mb-8">
        <h1 className="text-4xl font-bold mb-3 bg-gradient-to-r from-cyan-400 via-blue-400 to-purple-400 bg-clip-text text-transparent leading-tight">
          Dark Matter Event Classifier
        </h1>
        <p className="text-lg text-slate-300 max-w-3xl">
          Leverage advanced machine learning to distinguish WIMP signals from background noise with high precision analysis.
        </p>
      </div>

      <Tabs defaultValue="single" className="w-full">
        <TabsList className="grid w-full grid-cols-2 mb-8 h-12 bg-slate-800/60 border border-slate-700">
          <TabsTrigger 
            value="single" 
            className="text-sm font-medium data-[state=active]:bg-gradient-to-r data-[state=active]:from-purple-600 data-[state=active]:to-blue-600 data-[state=active]:text-white"
          >
            Single Event Analysis
          </TabsTrigger>
          <TabsTrigger 
            value="batch" 
            className="text-sm font-medium data-[state=active]:bg-gradient-to-r data-[state=active]:from-purple-600 data-[state=active]:to-blue-600 data-[state=active]:text-white"
          >
            Batch Processing
          </TabsTrigger>
        </TabsList>

        <TabsContent value="single">
          <div className="grid grid-cols-1 xl:grid-cols-5 gap-8">
            {/* Left Panel - Event Input (55% width) */}
            <div className="xl:col-span-3 space-y-6">
              <Card className="backdrop-blur-md bg-slate-800/40 border border-slate-700/50 shadow-2xl">
                <CardHeader className="pb-4">
                  <div className="flex items-center gap-3 mb-2">
                    <div className="p-2 rounded-lg bg-gradient-to-r from-purple-600/20 to-blue-600/20 border border-purple-500/30">
                      <Shield className="w-5 h-5 text-cyan-400" />
                    </div>
                    <div>
                      <CardTitle className="text-xl font-semibold text-white flex items-center gap-2">
                        Event Data Input
                        <div className="h-px bg-gradient-to-r from-cyan-400 to-blue-500 flex-1 ml-4"></div>
                      </CardTitle>
                      <CardDescription className="text-slate-400 mt-1">
                        Enter precise detector measurements for classification analysis
                      </CardDescription>
                    </div>
                  </div>
                </CardHeader>
          <CardContent className="space-y-6">
            {/* Example Data Quick-Load Section */}
            <div className="bg-slate-700/30 rounded-lg p-4 border border-slate-600/50">
              <h3 className="text-sm font-semibold text-slate-300 mb-3 flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-blue-400" />
                Quick Load Example Data
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <Button 
                  variant="outline-example" 
                  size="sm" 
                  onClick={() => loadExample('wimp')}
                  className="w-full"
                >
                  <Box className="w-4 h-4 mr-2" />
                  WIMP Candidate
                </Button>
                <Button 
                  variant="outline-example" 
                  size="sm" 
                  onClick={() => loadExample('background')}
                  className="w-full"
                >
                  <Box className="w-4 h-4 mr-2" />
                  Background Event
                </Button>
                <Button 
                  variant="outline-example" 
                  size="sm" 
                  onClick={() => loadExample('neutrino')}
                  className="w-full"
                >
                  <Box className="w-4 h-4 mr-2" />
                  Neutrino Event
                </Button>
              </div>
            </div>

            {/* Primary Detector Signals */}
            <div className="space-y-4">
              <h3 className="text-base font-semibold text-white flex items-center gap-2">
                Primary Detector Signals
                <div className="h-px bg-gradient-to-r from-blue-500/50 to-transparent flex-1 ml-3"></div>
              </h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="recoilEnergy" className="text-sm font-medium text-slate-300 flex items-center gap-2">
                    Recoil Energy
                    <span className="text-xs text-slate-500">(keV)</span>
                  </Label>
                  <Input
                    id="recoilEnergy"
                    type="number"
                    value={eventData.recoilEnergy}
                    onChange={(e) => handleInputChange('recoilEnergy', e.target.value)}
                    placeholder="0.0"
                    className="bg-slate-700/50 border-slate-600 text-white placeholder:text-slate-500 focus:border-blue-500 transition-colors"
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="s1Signal" className="text-sm font-medium text-slate-300 flex items-center gap-2">
                    S1 Signal
                    <span className="text-xs text-slate-500">(PE)</span>
                  </Label>
                  <Input
                    id="s1Signal"
                    type="number"
                    value={eventData.s1Signal}
                    onChange={(e) => handleInputChange('s1Signal', e.target.value)}
                    placeholder="0"
                    className="bg-slate-700/50 border-slate-600 text-white placeholder:text-slate-500 focus:border-blue-500 transition-colors"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="s2Signal" className="text-sm font-medium text-slate-300 flex items-center gap-2">
                    S2 Signal
                    <span className="text-xs text-slate-500">(PE)</span>
                  </Label>
                  <Input
                    id="s2Signal"
                    type="number"
                    value={eventData.s2Signal}
                    onChange={(e) => handleInputChange('s2Signal', e.target.value)}
                    placeholder="0"
                    className="bg-slate-700/50 border-slate-600 text-white placeholder:text-slate-500 focus:border-blue-500 transition-colors"
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="pulseShape" className="text-sm font-medium text-slate-300 flex items-center gap-2">
                    Pulse Shape
                    <span className="text-xs text-slate-500">(0-1)</span>
                  </Label>
                  <Input
                    id="pulseShape"
                    type="number"
                    step="0.01"
                    min="0"
                    max="1"
                    value={eventData.pulseShape}
                    onChange={(e) => handleInputChange('pulseShape', e.target.value)}
                    placeholder="0.00"
                    className="bg-slate-700/50 border-slate-600 text-white placeholder:text-slate-500 focus:border-blue-500 transition-colors"
                  />
                </div>
              </div>
            </div>

            {/* Spatial Coordinates */}
            <div className="space-y-4">
              <h3 className="text-base font-semibold text-white flex items-center gap-2">
                Spatial Coordinates
                <div className="h-px bg-gradient-to-r from-blue-500/50 to-transparent flex-1 ml-3"></div>
              </h3>
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="positionX" className="text-sm font-medium text-slate-300 flex items-center gap-2">
                    X Position
                    <span className="text-xs text-slate-500">(cm)</span>
                  </Label>
                  <Input
                    id="positionX"
                    type="number"
                    value={eventData.positionX}
                    onChange={(e) => handleInputChange('positionX', e.target.value)}
                    placeholder="0.0"
                    className="bg-slate-700/50 border-slate-600 text-white placeholder:text-slate-500 focus:border-blue-500 transition-colors"
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="positionY" className="text-sm font-medium text-slate-300 flex items-center gap-2">
                    Y Position
                    <span className="text-xs text-slate-500">(cm)</span>
                  </Label>
                  <Input
                    id="positionY"
                    type="number"
                    value={eventData.positionY}
                    onChange={(e) => handleInputChange('positionY', e.target.value)}
                    placeholder="0.0"
                    className="bg-slate-700/50 border-slate-600 text-white placeholder:text-slate-500 focus:border-blue-500 transition-colors"
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="positionZ" className="text-sm font-medium text-slate-300 flex items-center gap-2">
                    Z Position
                    <span className="text-xs text-slate-500">(cm)</span>
                  </Label>
                  <Input
                    id="positionZ"
                    type="number"
                    value={eventData.positionZ}
                    onChange={(e) => handleInputChange('positionZ', e.target.value)}
                    placeholder="0.0"
                    className="bg-slate-700/50 border-slate-600 text-white placeholder:text-slate-500 focus:border-blue-500 transition-colors"
                  />
                </div>
              </div>
            </div>

            {/* Timestamp */}
            <div className="space-y-4">
              <h3 className="text-base font-semibold text-white flex items-center gap-2">
                Event Metadata
                <div className="h-px bg-gradient-to-r from-blue-500/50 to-transparent flex-1 ml-3"></div>
              </h3>
              
              <div className="space-y-2">
                <Label htmlFor="timestamp" className="text-sm font-medium text-slate-300">
                  Event Timestamp
                </Label>
                <Input
                  id="timestamp"
                  type="datetime-local"
                  value={eventData.timestamp}
                  onChange={(e) => handleInputChange('timestamp', e.target.value)}
                  className="bg-slate-700/50 border-slate-600 text-white placeholder:text-slate-500 focus:border-blue-500 transition-colors"
                />
              </div>
            </div>

            {/* Calculated Metrics */}
            <div className="bg-slate-700/30 rounded-lg p-4 border border-slate-600/50">
              <h3 className="text-sm font-semibold text-slate-300 mb-3">Calculated Metrics</h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="bg-slate-800/50 rounded-lg p-3 text-center">
                  <div className="text-xs text-slate-400 font-medium mb-1">S2/S1 Ratio</div>
                  <div className="text-lg font-bold text-cyan-400">{calculateS2S1Ratio()}</div>
                </div>
                <div className="bg-slate-800/50 rounded-lg p-3 text-center">
                  <div className="text-xs text-slate-400 font-medium mb-1">Event Quality</div>
                  <div className="text-lg font-bold text-green-400">
                    {eventData.s1Signal && eventData.s2Signal ? 'Valid' : 'Incomplete'}
                  </div>
                </div>
              </div>
            </div>

            {/* Primary Classification Button */}
            <div className="pt-4">
              <Button 
                variant="premium" 
                size="xl" 
                onClick={classifyEvent}
                className="w-full h-14 text-lg font-semibold"
                disabled={!eventData.recoilEnergy || !eventData.s1Signal || !eventData.s2Signal}
              >
                <Brain className="w-6 h-6 mr-3" />
                Classify Event with AI
                <Sparkles className="w-5 h-5 ml-3" />
              </Button>
              {(!eventData.recoilEnergy || !eventData.s1Signal || !eventData.s2Signal) && (
                <p className="text-xs text-slate-400 mt-2 text-center">
                  Please fill in recoil energy, S1, and S2 signals to classify
                </p>
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Right Panel - Results and Analysis (45% width) */}
      <div className="xl:col-span-2 space-y-6">
        {/* Classification Results and Analysis Panel */}
        <Card className="backdrop-blur-md bg-slate-800/40 border border-slate-700/50 shadow-2xl">
          <CardHeader className="pb-4">
            <div className="flex items-center gap-3 mb-2">
              <div className="p-2 rounded-lg bg-gradient-to-r from-blue-600/20 to-purple-600/20 border border-blue-500/30">
                <Brain className="w-5 h-5 text-blue-400" />
              </div>
              <div>
                <CardTitle className="text-xl font-semibold text-white flex items-center gap-2">
                  AI Classification Results
                  <div className="h-px bg-gradient-to-r from-blue-400 to-purple-500 flex-1 ml-4"></div>
                </CardTitle>
                <CardDescription className="text-slate-400 mt-1">
                  Advanced machine learning analysis with confidence metrics
                </CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            {!isClassified ? (
              <div className="flex items-center justify-center h-96 text-slate-400">
                <div className="text-center space-y-4">
                  <div className="w-24 h-24 mx-auto rounded-full bg-gradient-to-br from-slate-700/50 to-slate-800/50 border border-slate-600/50 flex items-center justify-center">
                    <Brain className="w-12 h-12 text-slate-500 animate-pulse" />
                  </div>
                  <div>
                    <p className="text-lg font-medium text-slate-300 mb-2">Awaiting Event Data</p>
                    <p className="text-sm text-slate-500">Complete the form and click "Classify Event" to begin AI analysis</p>
                  </div>
                </div>
              </div>
            ) : (
              <div className="space-y-6">
                {/* Primary Classification Result */}
                <div className="relative overflow-hidden">
                  <div className="absolute inset-0 bg-gradient-to-r from-blue-600/10 via-purple-600/10 to-cyan-600/10 rounded-lg"></div>
                  <div className="relative bg-slate-800/60 border border-blue-500/30 rounded-lg p-6 text-center backdrop-blur-sm">
                    <div className="flex items-center justify-center gap-3 mb-3">
                      <CheckCircle className="w-8 h-8 text-green-400" />
                      <div className="text-3xl font-bold bg-gradient-to-r from-blue-400 to-cyan-400 bg-clip-text text-transparent">
                        WIMP-Like Candidate
                      </div>
                    </div>
                    <div className="text-sm text-slate-400 mb-4">
                      High probability dark matter interaction detected
                    </div>
                    <Badge className="bg-green-500/20 text-green-300 border-green-500/30">
                      Confidence: 94.7%
                    </Badge>
                  </div>
                </div>

                {/* Confidence Visualization */}
                <div className="bg-slate-700/30 rounded-lg p-5 border border-slate-600/50">
                  <h3 className="text-base font-semibold text-white mb-4 flex items-center gap-2">
                    Confidence Analysis
                    <div className="h-px bg-gradient-to-r from-green-500/50 to-transparent flex-1 ml-3"></div>
                  </h3>
                  <div className="flex items-center justify-center">
                    <div className="relative w-32 h-32">
                      {/* Background circle */}
                      <svg className="w-32 h-32 transform -rotate-90" viewBox="0 0 100 100">
                        <circle
                          cx="50"
                          cy="50"
                          r="40"
                          stroke="currentColor"
                          strokeWidth="8"
                          fill="transparent"
                          className="text-slate-600"
                        />
                        <circle
                          cx="50"
                          cy="50"
                          r="40"
                          stroke="currentColor"
                          strokeWidth="8"
                          fill="transparent"
                          strokeDasharray={`${94.7 * 2.51} ${100 * 2.51}`}
                          className="text-green-400"
                          style={{
                            strokeLinecap: 'round',
                            filter: 'drop-shadow(0 0 8px rgba(34, 197, 94, 0.3))'
                          }}
                        />
                      </svg>
                      <div className="absolute inset-0 flex items-center justify-center">
                        <span className="text-2xl font-bold text-green-400">94.7%</span>
                      </div>
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-3 gap-3 text-center text-sm">
                    <div>
                      <div className="text-xs text-slate-400 mb-1">WIMP Score</div>
                      <div className="font-semibold text-green-400">94.7%</div>
                    </div>
                    <div>
                      <div className="text-xs text-slate-400 mb-1">Background</div>
                      <div className="font-semibold text-orange-400">4.8%</div>
                    </div>
                    <div>
                      <div className="text-xs text-slate-400 mb-1">Anomaly</div>
                      <div className="font-semibold text-red-400">0.5%</div>
                    </div>
                  </div>
                </div>

                {/* Signal Characteristics */}
                <div className="bg-slate-700/30 rounded-lg p-5 border border-slate-600/50">
                  <h3 className="text-base font-semibold text-white mb-4 flex items-center gap-2">
                    Signal Characteristics
                    <div className="h-px bg-gradient-to-r from-blue-500/50 to-transparent flex-1 ml-3"></div>
                  </h3>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="flex items-center gap-3 p-3 bg-slate-800/40 rounded-lg">
                      <CheckCircle className="w-5 h-5 text-green-400 flex-shrink-0" />
                      <div>
                        <div className="text-sm font-medium text-white">Low Recoil Energy</div>
                        <div className="text-xs text-slate-400">12.5 keV - typical WIMP range</div>
                      </div>
                    </div>
                    
                    <div className="flex items-center gap-3 p-3 bg-slate-800/40 rounded-lg">
                      <CheckCircle className="w-5 h-5 text-green-400 flex-shrink-0" />
                      <div>
                        <div className="text-sm font-medium text-white">Optimal S2/S1 Ratio</div>
                        <div className="text-xs text-slate-400">7.11 - nuclear recoil signature</div>
                      </div>
                    </div>
                    
                    <div className="flex items-center gap-3 p-3 bg-slate-800/40 rounded-lg">
                      <CheckCircle className="w-5 h-5 text-green-400 flex-shrink-0" />
                      <div>
                        <div className="text-sm font-medium text-white">Pulse Shape Match</div>
                        <div className="text-xs text-slate-400">Nuclear recoil-like signature</div>
                      </div>
                    </div>
                    
                    <div className="flex items-center gap-3 p-3 bg-slate-800/40 rounded-lg">
                      <CheckCircle className="w-5 h-5 text-green-400 flex-shrink-0" />
                      <div>
                        <div className="text-sm font-medium text-white">Fiducial Position</div>
                        <div className="text-xs text-slate-400">Within active detector volume</div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Detailed Analysis Expandable */}
                <Collapsible open={isReasoningOpen} onOpenChange={setIsReasoningOpen}>
                  <CollapsibleTrigger asChild>
                    <Button variant="expandable" className="w-full">
                      <span className="font-medium">Detailed AI Reasoning & Analysis</span>
                      <ChevronDown className={`w-4 h-4 transition-transform duration-300 ${isReasoningOpen ? 'rotate-180' : ''}`} />
                    </Button>
                  </CollapsibleTrigger>
                  <CollapsibleContent className="mt-4">
                    <div className="space-y-4">
                      {/* Analysis Decision Tree */}
                      <div className="bg-slate-800/40 rounded-lg p-4 border border-slate-600/30">
                        <div className="flex items-center justify-between mb-3">
                          <h4 className="font-semibold text-white">ML Decision Tree Analysis</h4>
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

                {/* Action Buttons */}
                <div className="pt-4 border-t border-slate-700/50">
                  <Button variant="danger-outline" className="w-full">
                    <Flag className="w-4 h-4 mr-2" />
                    Flag as Anomaly for Review
                  </Button>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
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
                  <div 
                    className="stat-card"
                    style={{ animationDelay: '0.1s' }}
                  >
                    <div className="stat-number text-2xl">{batchState.currentIndex}</div>
                    <div className="text-xs text-muted-foreground font-medium">Processed</div>
                  </div>
                  <div 
                    className="stat-card"
                    style={{ animationDelay: '0.25s' }}
                  >
                    <div className="stat-number text-2xl">{batchState.totalEvents - batchState.currentIndex}</div>
                    <div className="text-xs text-muted-foreground font-medium">Remaining</div>
                  </div>
                  <div 
                    className="stat-card"
                    style={{ animationDelay: '0.4s' }}
                  >
                    <div className="stat-number text-2xl">
                      {batchState.currentIndex > 0 ? 
                        Math.round((Date.now() - batchState.startTime) / batchState.currentIndex) : 0}ms
                    </div>
                    <div className="text-xs text-muted-foreground font-medium">Avg Time</div>
                  </div>
                  <div 
                    className="stat-card"
                    style={{ animationDelay: '0.55s' }}
                  >
                    <div className="stat-number text-2xl">
                      {batchState.currentIndex > 0 ? 
                        Math.round(((batchState.totalEvents - batchState.currentIndex) * 
                          (Date.now() - batchState.startTime)) / batchState.currentIndex / 1000) : 0}s
                    </div>
                    <div className="text-xs text-muted-foreground font-medium">Est. Remaining</div>
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
                    ).map(([type, count], index) => (
                      <div 
                        key={type} 
                        className="stat-card text-center"
                        style={{ animationDelay: `${0.1 + index * 0.1}s` }}
                      >
                        <Badge 
                          className={`mb-2 badge-outline-premium ${
                            type === 'WIMP' ? 'border-blue-500/50 text-blue-400' :
                            type === 'Background' ? 'border-green-500/50 text-green-400' :
                            type === 'Axion' ? 'border-purple-500/50 text-purple-400' :
                            type === 'Neutrino' ? 'border-orange-500/50 text-orange-400' :
                            'border-red-500/50 text-red-400'
                          }`}
                        >
                          {type}
                        </Badge>
                        <div className="stat-number text-2xl">{count}</div>
                        <div className="text-xs text-muted-foreground font-medium">
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
                    <div 
                      className="stat-card"
                      style={{ animationDelay: '0.1s' }}
                    >
                      <div className="flex items-center gap-2 mb-2">
                        <Clock className="w-4 h-4" />
                        <span className="text-sm font-medium">Average Processing Time</span>
                      </div>
                      <div className="stat-number text-xl">
                        {(batchState.processedResults.reduce((acc, result) => 
                          acc + result.classification.processingTime, 0) / 
                          batchState.processedResults.length).toFixed(1)}ms
                      </div>
                    </div>
                    <div 
                      className="stat-card"
                      style={{ animationDelay: '0.25s' }}
                    >
                      <div className="flex items-center gap-2 mb-2">
                        <CheckCircle className="w-4 h-4" />
                        <span className="text-sm font-medium">Total Events</span>
                      </div>
                      <div className="stat-number text-xl">{batchState.processedResults.length}</div>
                    </div>
                    <div 
                      className="stat-card"
                      style={{ animationDelay: '0.4s' }}
                    >
                      <div className="flex items-center gap-2 mb-2">
                        <Brain className="w-4 h-4" />
                        <span className="text-sm font-medium">Average Confidence</span>
                      </div>
                      <div className="stat-number text-xl">
                        {(batchState.processedResults.reduce((acc, result) => 
                          acc + result.event.confidence, 0) / 
                          batchState.processedResults.length).toFixed(1)}%
                      </div>
                    </div>
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="flex flex-col sm:flex-row gap-3">
                  <Button 
                    onClick={downloadResults} 
                    variant="premium"
                    className="flex-1 group"
                  >
                    <Download className="w-4 h-4 mr-2 transition-transform duration-300 group-hover:translate-x-1" />
                    Download Classified Dataset
                  </Button>
                  <Button variant="outline" className="flex-1 group">
                    <ExternalLink className="w-4 h-4 mr-2 transition-transform duration-300 group-hover:translate-x-1" />
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
