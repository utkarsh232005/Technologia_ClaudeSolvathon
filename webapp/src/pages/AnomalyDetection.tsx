import { useState } from 'react';
import PageLayout from '@/components/PageLayout';
import { LoadingSpinner, ProgressBar } from '@/components/LoadingComponents';
import { showToast } from '@/lib/toast';
import anomalyAPI, { AnomalyResult, DatasetAnalysisResponse } from '@/lib/anomalyAPI';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Switch } from '@/components/ui/switch';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog';
import {
    AlertTriangle,
    CheckCircle,
    Search,
    Activity,
    TrendingUp,
    Zap,
    Database,
    Eye,
    Download
} from 'lucide-react';

const AnomalyDetection = () => {
    // State management
    const [isAnalyzing, setIsAnalyzing] = useState(false);
    const [datasetAnalysis, setDatasetAnalysis] = useState<DatasetAnalysisResponse | null>(null);
    const [singleEventResult, setSingleEventResult] = useState<AnomalyResult | null>(null);
    const [useClaudeAI, setUseClaudeAI] = useState(true); // Enable by default to use Claude extensively
    const [threshold, setThreshold] = useState(0.3);
    const [maxEvents, setMaxEvents] = useState(100);
    
    // Dialog state
    const [showSampleDialog, setShowSampleDialog] = useState(false);
    const [tempMaxEvents, setTempMaxEvents] = useState(100);

    // Single event input
    const [singleEvent, setSingleEvent] = useState({
        energy: '',
        s1: '',
        s2: '',
        s2s1Ratio: ''
    });

    // Open sample selection dialog
    const handleOpenSampleDialog = () => {
        setTempMaxEvents(maxEvents);
        setShowSampleDialog(true);
    };

    // Confirm and start analysis
    const handleConfirmAnalysis = () => {
        setMaxEvents(tempMaxEvents);
        setShowSampleDialog(false);
        // Start analysis immediately after dialog closes
        setTimeout(() => {
            performDatasetAnalysis(tempMaxEvents);
        }, 100);
    };

    // Perform the actual dataset analysis
    const performDatasetAnalysis = async (eventsToAnalyze: number) => {
        setIsAnalyzing(true);
        const toastId = showToast.loading('Analyzing dataset for anomalies...');

        try {
            const result = await anomalyAPI.analyzeDataset({
                max_events: eventsToAnalyze,
                use_claude: useClaudeAI,
                threshold: threshold
            });

            if (result.success) {
                setDatasetAnalysis(result);
                showToast.success(`Found ${result.statistics.anomalies_detected} anomalies in ${result.statistics.total_analyzed} events`);
            } else {
                showToast.error(result.error || 'Analysis failed');
            }
        } catch (error) {
            showToast.error(error instanceof Error ? error.message : 'Analysis failed');
        } finally {
            setIsAnalyzing(false);
            showToast.dismiss(toastId);
        }
    };

    // Analyze entire dataset (now opens dialog first)
    const handleAnalyzeDataset = () => {
        handleOpenSampleDialog();
    };

    // Analyze single event
    const handleAnalyzeSingleEvent = async () => {
        // Validate inputs
        if (!singleEvent.energy || !singleEvent.s1 || !singleEvent.s2) {
            showToast.error('Please fill in all required fields');
            return;
        }

        setIsAnalyzing(true);
        const toastId = showToast.loading('Detecting anomalies...');

        try {
            const eventData = {
                energy: parseFloat(singleEvent.energy),
                s1: parseFloat(singleEvent.s1),
                s2: parseFloat(singleEvent.s2),
                s2s1Ratio: singleEvent.s2s1Ratio ? parseFloat(singleEvent.s2s1Ratio) : parseFloat(singleEvent.s2) / parseFloat(singleEvent.s1)
            };

            const result = await anomalyAPI.detectSingleAnomaly(eventData, {
                use_claude: useClaudeAI,
                threshold: threshold
            });

            if (result.success && result.results.length > 0) {
                setSingleEventResult(result.results[0]);
                if (result.results[0].is_anomaly) {
                    showToast.success('Anomaly detected!');
                } else {
                    showToast.info('No anomaly detected');
                }
            } else {
                showToast.error(result.error || 'Analysis failed');
            }
        } catch (error) {
            showToast.error(error instanceof Error ? error.message : 'Analysis failed');
        } finally {
            setIsAnalyzing(false);
            showToast.dismiss(toastId);
        }
    };

    const getSeverityColor = (severity: string) => {
        switch (severity) {
            case 'high': return 'bg-red-500/20 text-red-400 border-red-500/50';
            case 'medium': return 'bg-yellow-500/20 text-yellow-400 border-yellow-500/50';
            case 'low': return 'bg-blue-500/20 text-blue-400 border-blue-500/50';
            default: return 'bg-gray-500/20 text-gray-400 border-gray-500/50';
        }
    };

    return (
        <PageLayout
            title="Anomaly Detection"
            description="Detect unusual patterns and anomalies in dark matter events using AI"
        >
            <div className="space-y-6">
                {/* Configuration Panel */}
                <Card className="bg-slate-800/50 border-slate-700">
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <Zap className="h-5 w-5 text-cyan-400" />
                            Detection Settings
                        </CardTitle>
                        <CardDescription>Configure anomaly detection parameters</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <Label htmlFor="threshold">Anomaly Threshold</Label>
                                <Input
                                    id="threshold"
                                    type="number"
                                    min="0"
                                    max="1"
                                    step="0.05"
                                    value={threshold}
                                    onChange={(e) => setThreshold(parseFloat(e.target.value))}
                                    className="bg-slate-900 border-slate-700"
                                />
                                <p className="text-xs text-slate-400">Minimum score to flag as anomaly (0.0 - 1.0)</p>
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="useAI" className="flex items-center gap-2">
                                    Use Claude AI Analysis
                                </Label>
                                <div className="flex items-center space-x-2 pt-2">
                                    <Switch
                                        id="useAI"
                                        checked={useClaudeAI}
                                        onCheckedChange={setUseClaudeAI}
                                    />
                                    <span className="text-sm text-slate-400">
                                        {useClaudeAI ? 'Enabled' : 'Disabled'}
                                    </span>
                                </div>
                                <p className="text-xs text-slate-400">AI-powered classification and reasoning</p>
                            </div>
                        </div>
                        
                        {/* Info box about sample selection */}
                        <div className="mt-4 p-3 bg-cyan-500/10 border border-cyan-500/30 rounded-lg">
                            <p className="text-sm text-cyan-300">
                                💡 <strong>Tip:</strong> When you click "Start Analysis", you'll be asked to select how many events to analyze from the dataset.
                            </p>
                        </div>
                    </CardContent>
                </Card>

                {/* Main Tabs */}
                <Tabs defaultValue="dataset" className="space-y-4">
                    <TabsList className="bg-slate-800/50 border border-slate-700">
                        <TabsTrigger value="dataset" className="data-[state=active]:bg-slate-700">
                            <Database className="h-4 w-4 mr-2" />
                            Dataset Analysis
                        </TabsTrigger>
                        <TabsTrigger value="single" className="data-[state=active]:bg-slate-700">
                            <Activity className="h-4 w-4 mr-2" />
                            Single Event
                        </TabsTrigger>
                    </TabsList>

                    {/* Dataset Analysis Tab */}
                    <TabsContent value="dataset" className="space-y-4">
                        <Card className="bg-slate-800/50 border-slate-700">
                            <CardHeader>
                                <CardTitle className="flex items-center gap-2">
                                    <Search className="h-5 w-5 text-cyan-400" />
                                    Analyze Dataset
                                </CardTitle>
                                <CardDescription>
                                    Scan the dark matter dataset for anomalous events
                                </CardDescription>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <Button
                                    onClick={handleAnalyzeDataset}
                                    disabled={isAnalyzing}
                                    className="w-full bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-700 hover:to-blue-700"
                                >
                                    {isAnalyzing ? (
                                        <>
                                            <LoadingSpinner size="sm" className="mr-2" />
                                            Analyzing...
                                        </>
                                    ) : (
                                        <>
                                            <Search className="h-4 w-4 mr-2" />
                                            Start Analysis
                                        </>
                                    )}
                                </Button>

                                {/* Dataset Analysis Results */}
                                {datasetAnalysis && datasetAnalysis.success && (
                                    <div className="space-y-4 mt-6">
                                        {/* Statistics Cards */}
                                        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                                            <Card className="bg-slate-900/50 border-slate-700">
                                                <CardContent className="pt-6">
                                                    <div className="text-center">
                                                        <p className="text-2xl font-bold text-cyan-400">
                                                            {datasetAnalysis.statistics.total_analyzed}
                                                        </p>
                                                        <p className="text-sm text-slate-400">Events Analyzed</p>
                                                    </div>
                                                </CardContent>
                                            </Card>

                                            <Card className="bg-slate-900/50 border-slate-700">
                                                <CardContent className="pt-6">
                                                    <div className="text-center">
                                                        <p className="text-2xl font-bold text-red-400">
                                                            {datasetAnalysis.statistics.anomalies_detected}
                                                        </p>
                                                        <p className="text-sm text-slate-400">Anomalies Found</p>
                                                    </div>
                                                </CardContent>
                                            </Card>

                                            <Card className="bg-slate-900/50 border-slate-700">
                                                <CardContent className="pt-6">
                                                    <div className="text-center">
                                                        <p className="text-2xl font-bold text-yellow-400">
                                                            {(datasetAnalysis.statistics.anomaly_rate * 100).toFixed(1)}%
                                                        </p>
                                                        <p className="text-sm text-slate-400">Anomaly Rate</p>
                                                    </div>
                                                </CardContent>
                                            </Card>

                                            <Card className="bg-slate-900/50 border-slate-700">
                                                <CardContent className="pt-6">
                                                    <div className="text-center">
                                                        <p className="text-2xl font-bold text-purple-400">
                                                            {datasetAnalysis.statistics.avg_anomaly_score.toFixed(2)}
                                                        </p>
                                                        <p className="text-sm text-slate-400">Avg Score</p>
                                                    </div>
                                                </CardContent>
                                            </Card>
                                        </div>

                                        {/* Anomaly Types Distribution */}
                                        {Object.keys(datasetAnalysis.statistics.by_type).length > 0 && (
                                            <Card className="bg-slate-900/50 border-slate-700">
                                                <CardHeader>
                                                    <CardTitle className="text-lg">Anomalies by Type</CardTitle>
                                                </CardHeader>
                                                <CardContent>
                                                    <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                                                        {Object.entries(datasetAnalysis.statistics.by_type).map(([type, count]) => (
                                                            <div key={type} className="p-3 rounded-lg bg-slate-800/50 border border-slate-700">
                                                                <p className="text-lg font-bold text-cyan-400">{count}</p>
                                                                <p className="text-xs text-slate-400 truncate">{type}</p>
                                                            </div>
                                                        ))}
                                                    </div>
                                                </CardContent>
                                            </Card>
                                        )}

                                        {/* Top Anomalies List - Detailed Scientific Report Format */}
                                        <Card className="bg-slate-900/50 border-slate-700">
                                            <CardHeader>
                                                <CardTitle className="text-lg flex items-center gap-2">
                                                    <TrendingUp className="h-5 w-5 text-red-400" />
                                                    Detailed Anomaly Analysis Report
                                                </CardTitle>
                                                <CardDescription>
                                                    Comprehensive scientific analysis of detected anomalies
                                                </CardDescription>
                                            </CardHeader>
                                            <CardContent>
                                                <div className="space-y-6">
                                                    {/* Scientific Report Header */}
                                                    <div className="p-4 bg-slate-800/50 border border-slate-700 rounded-lg">
                                                        <h3 className="text-sm font-mono text-cyan-400 mb-2">SCIENTIFIC ANOMALY DETECTION REPORT</h3>
                                                        <p className="text-xs text-slate-400">Dark Matter Event Analysis with AI Classification</p>
                                                    </div>

                                                    {/* Executive Summary */}
                                                    <div className="space-y-2">
                                                        <h4 className="text-sm font-semibold text-white uppercase tracking-wide">Executive Summary</h4>
                                                        <div className="p-3 bg-slate-800/30 rounded border-l-4 border-cyan-500">
                                                            <p className="text-sm text-slate-300">
                                                                <span className="font-semibold text-cyan-400">Total Anomalies Detected:</span> {datasetAnalysis.statistics.anomalies_detected}
                                                            </p>
                                                            <p className="text-sm text-slate-300">
                                                                <span className="font-semibold text-cyan-400">Anomaly Type:</span> Point Anomalies (Individual events deviating from norm)
                                                            </p>
                                                        </div>
                                                    </div>

                                                    {/* Severity Breakdown */}
                                                    <div className="space-y-2">
                                                        <h4 className="text-sm font-semibold text-white uppercase tracking-wide">Severity Breakdown</h4>
                                                        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                                                            {['Critical', 'High', 'Medium'].map((severity) => {
                                                                const count = datasetAnalysis.top_anomalies.filter(a => {
                                                                    if (a.anomaly_score > 0.7) return severity === 'Critical';
                                                                    if (a.anomaly_score > 0.5) return severity === 'High';
                                                                    return severity === 'Medium';
                                                                }).length;
                                                                if (count === 0) return null;
                                                                return (
                                                                    <div key={severity} className="p-3 bg-slate-800/30 rounded border-l-4 border-yellow-500">
                                                                        <p className="text-lg font-bold text-yellow-400">{count}</p>
                                                                        <p className="text-xs text-slate-400">{severity} Severity</p>
                                                                    </div>
                                                                );
                                                            })}
                                                        </div>
                                                    </div>

                                                    {/* Detailed Anomaly Cards */}
                                                    <div className="space-y-4">
                                                        <h4 className="text-sm font-semibold text-white uppercase tracking-wide border-b border-slate-700 pb-2">
                                                            Detailed Anomaly Analysis (Top {Math.min(10, datasetAnalysis.top_anomalies.length)})
                                                        </h4>
                                                        <div className="space-y-4 max-h-[600px] overflow-y-auto pr-2">
                                                            {datasetAnalysis.top_anomalies.slice(0, 10).map((anomaly, idx) => {
                                                                const severity = anomaly.anomaly_score > 0.7 ? 'Critical' : anomaly.anomaly_score > 0.5 ? 'High' : 'Medium';
                                                                const interpretation = anomaly.anomaly_score > 0.7 ? 'CRITICAL - Multiple severe violations detected' :
                                                                    anomaly.anomaly_score > 0.5 ? 'HIGH - Significant deviation from expected behavior' :
                                                                        anomaly.anomaly_score > 0.3 ? 'MEDIUM - Notable anomaly requiring investigation' : 'LOW - Minor deviation from norm';

                                                                return (
                                                                    <Card key={idx} className="bg-slate-800/50 border-slate-700 hover:border-cyan-500/50 transition-all">
                                                                        <CardHeader className="pb-3">
                                                                            <div className="flex items-center justify-between">
                                                                                <div className="flex items-center gap-2">
                                                                                    <AlertTriangle className={`h-5 w-5 ${severity === 'Critical' ? 'text-red-400' : severity === 'High' ? 'text-orange-400' : 'text-yellow-400'}`} />
                                                                                    <span className="font-mono text-lg text-white">ANOMALY #{idx + 1}</span>
                                                                                </div>
                                                                                <Badge className={`${severity === 'Critical' ? 'bg-red-500/20 text-red-400 border-red-500/50' : severity === 'High' ? 'bg-orange-500/20 text-orange-400 border-orange-500/50' : 'bg-yellow-500/20 text-yellow-400 border-yellow-500/50'}`}>
                                                                                    {severity}
                                                                                </Badge>
                                                                            </div>
                                                                            <p className="text-sm text-slate-400">Event ID: {anomaly.event_index}</p>
                                                                        </CardHeader>
                                                                        <CardContent className="space-y-4">
                                                                            {/* 1. WHAT IS THE ANOMALY? */}
                                                                            <div className="space-y-2">
                                                                                <h5 className="text-sm font-semibold text-cyan-400 uppercase">1. What is the Anomaly?</h5>
                                                                                <div className="pl-4 border-l-2 border-cyan-500/30 space-y-1">
                                                                                    <p className="text-sm text-slate-300">
                                                                                        <span className="text-slate-400">Event Identifier:</span> {anomaly.event_index}
                                                                                    </p>
                                                                                    <p className="text-sm text-slate-300">
                                                                                        <span className="text-slate-400">Anomaly Type:</span> Point Anomaly (Single Deviant Event)
                                                                                    </p>
                                                                                    <p className="text-sm text-slate-300">
                                                                                        <span className="text-slate-400">Classification:</span> <span className="text-cyan-400 font-semibold">{anomaly.classification}</span>
                                                                                    </p>
                                                                                </div>
                                                                            </div>

                                                                            {/* 2. HOW BAD IS IT? */}
                                                                            <div className="space-y-2">
                                                                                <h5 className="text-sm font-semibold text-orange-400 uppercase">2. How Bad is It? (Severity Assessment)</h5>
                                                                                <div className="pl-4 border-l-2 border-orange-500/30 space-y-1">
                                                                                    <p className="text-sm text-slate-300">
                                                                                        <span className="text-slate-400">Severity Level:</span> <span className="font-semibold text-orange-400">{severity}</span>
                                                                                    </p>
                                                                                    <p className="text-sm text-slate-300">
                                                                                        <span className="text-slate-400">Anomaly Score:</span> <span className="font-mono text-red-400 font-bold">{anomaly.anomaly_score.toFixed(3)}</span> / 1.000
                                                                                    </p>
                                                                                    <p className="text-sm text-slate-300">
                                                                                        <span className="text-slate-400">Flags Triggered:</span> {anomaly.anomaly_flags.length} violation(s)
                                                                                    </p>
                                                                                    <p className="text-sm text-slate-300">
                                                                                        <span className="text-slate-400">AI Confidence:</span> <span className="text-green-400 font-semibold">{(anomaly.confidence * 100).toFixed(0)}%</span>
                                                                                    </p>
                                                                                    <p className="text-xs text-slate-400 italic mt-1">
                                                                                        {interpretation}
                                                                                    </p>
                                                                                </div>
                                                                            </div>

                                                                            {/* 3. WHY IS IT AN ANOMALY? */}
                                                                            <div className="space-y-2">
                                                                                <h5 className="text-sm font-semibold text-purple-400 uppercase">3. Why is It an Anomaly? (Root Cause Analysis)</h5>
                                                                                <div className="pl-4 border-l-2 border-purple-500/30 space-y-2">
                                                                                    <div className="space-y-1">
                                                                                        <p className="text-xs text-slate-400 font-semibold">Event Characteristics:</p>
                                                                                        <div className="grid grid-cols-2 gap-2 text-xs">
                                                                                            <p className="text-slate-300">• Energy: <span className="text-white font-mono">{anomaly.energy.toFixed(3)} keV</span></p>
                                                                                            <p className="text-slate-300">• S2/S1 Ratio: <span className="text-white font-mono">{anomaly.s2s1_ratio.toFixed(3)}</span></p>
                                                                                        </div>
                                                                                    </div>

                                                                                    {anomaly.anomaly_flags.length > 0 && (
                                                                                        <div className="space-y-1">
                                                                                            <p className="text-xs text-slate-400 font-semibold">Violation Details:</p>
                                                                                            <div className="space-y-1">
                                                                                                {anomaly.anomaly_flags.map((flag, i) => (
                                                                                                    <div key={i} className="text-xs bg-slate-900/50 p-2 rounded">
                                                                                                        <p className="text-white font-semibold">[{i + 1}] {flag.type}</p>
                                                                                                        <p className="text-slate-400">Severity: <span className="uppercase font-semibold text-yellow-400">{flag.severity}</span></p>
                                                                                                        <p className="text-slate-400">Value: <span className="text-white font-mono">{typeof flag.value === 'number' ? flag.value.toFixed(2) : flag.value}</span></p>
                                                                                                        <p className="text-slate-400">Weight: <span className="text-cyan-400">{flag.weight.toFixed(2)}</span></p>
                                                                                                    </div>
                                                                                                ))}
                                                                                            </div>
                                                                                        </div>
                                                                                    )}
                                                                                </div>
                                                                            </div>

                                                                            {/* 4. WHAT SHOULD I DO? */}
                                                                            <div className="space-y-2">
                                                                                <h5 className="text-sm font-semibold text-green-400 uppercase">4. What Should I Do? (Recommended Action)</h5>
                                                                                <div className="pl-4 border-l-2 border-green-500/30">
                                                                                    {severity === 'Critical' ? (
                                                                                        <div className="space-y-1">
                                                                                            <p className="text-sm text-red-400 font-semibold">🔴 CRITICAL ANOMALY - PRIORITY INVESTIGATION</p>
                                                                                            <p className="text-xs text-slate-300"><span className="text-slate-400">Action:</span> IMMEDIATE manual review required</p>
                                                                                            <p className="text-xs text-slate-300"><span className="text-slate-400">Reason:</span> Extreme deviation suggesting novel physics or system failure</p>
                                                                                            <div className="text-xs text-slate-400 mt-2">
                                                                                                <p className="font-semibold mb-1">Next Steps:</p>
                                                                                                <p>1. Expert physicist review within 24 hours</p>
                                                                                                <p>2. Cross-reference with detector calibration data</p>
                                                                                                <p>3. Consider for publication if novel physics candidate</p>
                                                                                            </div>
                                                                                        </div>
                                                                                    ) : severity === 'High' ? (
                                                                                        <div className="space-y-1">
                                                                                            <p className="text-sm text-orange-400 font-semibold">🟡 PHYSICS ANOMALY - STANDARD REVIEW</p>
                                                                                            <p className="text-xs text-slate-300"><span className="text-slate-400">Action:</span> Include in anomaly catalog for detailed study</p>
                                                                                            <p className="text-xs text-slate-300"><span className="text-slate-400">Reason:</span> Unusual but valid event - potential signal</p>
                                                                                            <div className="text-xs text-slate-400 mt-2">
                                                                                                <p className="font-semibold mb-1">Next Steps:</p>
                                                                                                <p>1. Add to candidate event list</p>
                                                                                                <p>2. Apply additional background rejection cuts</p>
                                                                                                <p>3. Statistical analysis of similar events</p>
                                                                                            </div>
                                                                                        </div>
                                                                                    ) : (
                                                                                        <div className="space-y-1">
                                                                                            <p className="text-sm text-blue-400 font-semibold">ℹ️ STANDARD ANOMALY - ROUTINE REVIEW</p>
                                                                                            <p className="text-xs text-slate-300"><span className="text-slate-400">Action:</span> Log for periodic review</p>
                                                                                            <div className="text-xs text-slate-400 mt-2">
                                                                                                <p className="font-semibold mb-1">Next Steps:</p>
                                                                                                <p>1. Include in weekly anomaly summary</p>
                                                                                                <p>2. Monitor for patterns</p>
                                                                                            </div>
                                                                                        </div>
                                                                                    )}
                                                                                </div>
                                                                            </div>
                                                                        </CardContent>
                                                                    </Card>
                                                                );
                                                            })}
                                                        </div>
                                                    </div>

                                                    {/* Report Legend */}
                                                    <div className="p-4 bg-slate-800/30 rounded border border-slate-700">
                                                        <h4 className="text-sm font-semibold text-cyan-400 mb-2">REPORT LEGEND</h4>
                                                        <div className="text-xs text-slate-400 space-y-1">
                                                            <p>• <span className="text-white">Point Anomaly:</span> Individual event that deviates from expected behavior</p>
                                                            <p>• <span className="text-white">Anomaly Score:</span> Weighted sum of violation flags (0.0 - 1.0)</p>
                                                            <p>• <span className="text-white">Severity:</span> Critical (&gt;0.7) | High (&gt;0.5) | Medium (&gt;0.3)</p>
                                                            <p>• <span className="text-white">AI Classification:</span> Powered by Claude AI for expert-level analysis</p>
                                                        </div>
                                                    </div>
                                                </div>
                                            </CardContent>
                                        </Card>
                                    </div>
                                )}
                            </CardContent>
                        </Card>
                    </TabsContent>

                    {/* Single Event Analysis Tab */}
                    <TabsContent value="single" className="space-y-4">
                        <Card className="bg-slate-800/50 border-slate-700">
                            <CardHeader>
                                <CardTitle className="flex items-center gap-2">
                                    <Eye className="h-5 w-5 text-cyan-400" />
                                    Analyze Single Event
                                </CardTitle>
                                <CardDescription>
                                    Check if a specific event shows anomalous characteristics
                                </CardDescription>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div className="space-y-2">
                                        <Label htmlFor="energy">Recoil Energy (keV) *</Label>
                                        <Input
                                            id="energy"
                                            type="number"
                                            step="0.01"
                                            value={singleEvent.energy}
                                            onChange={(e) => setSingleEvent({ ...singleEvent, energy: e.target.value })}
                                            className="bg-slate-900 border-slate-700"
                                            placeholder="e.g., 5.5"
                                        />
                                    </div>

                                    <div className="space-y-2">
                                        <Label htmlFor="s1">S1 Signal (PE) *</Label>
                                        <Input
                                            id="s1"
                                            type="number"
                                            step="0.01"
                                            value={singleEvent.s1}
                                            onChange={(e) => setSingleEvent({ ...singleEvent, s1: e.target.value })}
                                            className="bg-slate-900 border-slate-700"
                                            placeholder="e.g., 15.5"
                                        />
                                    </div>

                                    <div className="space-y-2">
                                        <Label htmlFor="s2">S2 Signal (PE) *</Label>
                                        <Input
                                            id="s2"
                                            type="number"
                                            step="0.01"
                                            value={singleEvent.s2}
                                            onChange={(e) => setSingleEvent({ ...singleEvent, s2: e.target.value })}
                                            className="bg-slate-900 border-slate-700"
                                            placeholder="e.g., 89.3"
                                        />
                                    </div>

                                    <div className="space-y-2">
                                        <Label htmlFor="s2s1Ratio">S2/S1 Ratio (optional)</Label>
                                        <Input
                                            id="s2s1Ratio"
                                            type="number"
                                            step="0.01"
                                            value={singleEvent.s2s1Ratio}
                                            onChange={(e) => setSingleEvent({ ...singleEvent, s2s1Ratio: e.target.value })}
                                            className="bg-slate-900 border-slate-700"
                                            placeholder="Auto-calculated"
                                        />
                                    </div>
                                </div>

                                <Button
                                    onClick={handleAnalyzeSingleEvent}
                                    disabled={isAnalyzing}
                                    className="w-full bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-700 hover:to-blue-700"
                                >
                                    {isAnalyzing ? (
                                        <>
                                            <LoadingSpinner size="sm" className="mr-2" />
                                            Analyzing...
                                        </>
                                    ) : (
                                        <>
                                            <Activity className="h-4 w-4 mr-2" />
                                            Detect Anomaly
                                        </>
                                    )}
                                </Button>

                                {/* Single Event Result */}
                                {singleEventResult && (
                                    <Alert className={singleEventResult.is_anomaly ? 'border-red-500/50 bg-red-500/10' : 'border-green-500/50 bg-green-500/10'}>
                                        <div className="flex items-start gap-3">
                                            {singleEventResult.is_anomaly ? (
                                                <AlertTriangle className="h-5 w-5 text-red-400 mt-0.5" />
                                            ) : (
                                                <CheckCircle className="h-5 w-5 text-green-400 mt-0.5" />
                                            )}
                                            <div className="flex-1 space-y-3">
                                                <div>
                                                    <h4 className="font-semibold text-white mb-1">
                                                        {singleEventResult.is_anomaly ? 'Anomaly Detected' : 'Normal Event'}
                                                    </h4>
                                                    <AlertDescription className="text-slate-300">
                                                        {singleEventResult.reasoning}
                                                    </AlertDescription>
                                                </div>

                                                <div className="grid grid-cols-2 gap-3 text-sm">
                                                    <div>
                                                        <span className="text-slate-400">Classification:</span>
                                                        <span className="ml-2 font-semibold text-cyan-400">{singleEventResult.classification}</span>
                                                    </div>
                                                    <div>
                                                        <span className="text-slate-400">Confidence:</span>
                                                        <span className="ml-2 font-semibold text-green-400">{(singleEventResult.confidence * 100).toFixed(0)}%</span>
                                                    </div>
                                                    <div>
                                                        <span className="text-slate-400">Anomaly Score:</span>
                                                        <span className="ml-2 font-semibold text-red-400">{singleEventResult.anomaly_score.toFixed(2)}</span>
                                                    </div>
                                                    <div>
                                                        <span className="text-slate-400">Flags:</span>
                                                        <span className="ml-2 font-semibold text-yellow-400">{singleEventResult.anomaly_flags.length}</span>
                                                    </div>
                                                </div>

                                                {singleEventResult.anomaly_flags.length > 0 && (
                                                    <div className="space-y-2">
                                                        <p className="text-sm font-semibold text-slate-300">Anomaly Flags:</p>
                                                        <div className="flex flex-wrap gap-2">
                                                            {singleEventResult.anomaly_flags.map((flag, idx) => (
                                                                <Badge
                                                                    key={idx}
                                                                    className={getSeverityColor(flag.severity)}
                                                                >
                                                                    {flag.type} ({flag.severity})
                                                                </Badge>
                                                            ))}
                                                        </div>
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                    </Alert>
                                )}
                            </CardContent>
                        </Card>
                    </TabsContent>
                </Tabs>

                {/* Sample Selection Dialog */}
                <Dialog open={showSampleDialog} onOpenChange={setShowSampleDialog}>
                    <DialogContent className="bg-slate-800 border-slate-700">
                        <DialogHeader>
                            <DialogTitle className="text-cyan-400 flex items-center gap-2">
                                <Database className="h-5 w-5" />
                                Select Sample Size
                            </DialogTitle>
                            <DialogDescription className="text-slate-400">
                                Choose how many events from the dataset you want to analyze for anomalies.
                                More events = more comprehensive but slower analysis.
                            </DialogDescription>
                        </DialogHeader>
                        
                        <div className="space-y-4 py-4">
                            <div className="space-y-3">
                                <Label htmlFor="sample-size" className="text-white">
                                    Number of Events to Analyze
                                </Label>
                                <Input
                                    id="sample-size"
                                    type="number"
                                    min="10"
                                    max="1000"
                                    value={tempMaxEvents}
                                    onChange={(e) => setTempMaxEvents(parseInt(e.target.value) || 10)}
                                    className="bg-slate-900 border-slate-700 text-white"
                                />
                                <p className="text-xs text-slate-400">
                                    Range: 10 - 1000 events
                                </p>
                            </div>

                            {/* Quick Selection Buttons */}
                            <div className="space-y-2">
                                <Label className="text-slate-300 text-sm">Quick Select:</Label>
                                <div className="grid grid-cols-4 gap-2">
                                    {[50, 100, 200, 500].map((value) => (
                                        <Button
                                            key={value}
                                            variant="outline"
                                            size="sm"
                                            onClick={() => setTempMaxEvents(value)}
                                            className={`${
                                                tempMaxEvents === value
                                                    ? 'bg-cyan-600 border-cyan-500 text-white hover:bg-cyan-700'
                                                    : 'bg-slate-700 border-slate-600 text-slate-300 hover:bg-slate-600'
                                            }`}
                                        >
                                            {value}
                                        </Button>
                                    ))}
                                </div>
                            </div>

                            {/* Estimation Info */}
                            <div className="p-3 bg-slate-900/50 border border-slate-700 rounded-lg">
                                <div className="text-sm space-y-1">
                                    <p className="text-slate-300">
                                        <span className="text-cyan-400 font-semibold">Estimated Time:</span>{' '}
                                        {useClaudeAI ? (
                                            <>
                                                ~{Math.ceil(tempMaxEvents / 10)} minutes
                                                <span className="text-xs text-slate-400 ml-2">(with Claude AI)</span>
                                            </>
                                        ) : (
                                            <>
                                                ~{Math.ceil(tempMaxEvents / 100)} seconds
                                                <span className="text-xs text-slate-400 ml-2">(statistical only)</span>
                                            </>
                                        )}
                                    </p>
                                    <p className="text-slate-300">
                                        <span className="text-cyan-400 font-semibold">Analysis Mode:</span>{' '}
                                        {useClaudeAI ? (
                                            <Badge className="bg-purple-500/20 text-purple-400 border-purple-500/50">
                                                AI-Powered
                                            </Badge>
                                        ) : (
                                            <Badge className="bg-blue-500/20 text-blue-400 border-blue-500/50">
                                                Statistical
                                            </Badge>
                                        )}
                                    </p>
                                </div>
                            </div>
                        </div>

                        <DialogFooter>
                            <Button
                                variant="outline"
                                onClick={() => setShowSampleDialog(false)}
                                className="bg-slate-700 border-slate-600 text-slate-300 hover:bg-slate-600"
                            >
                                Cancel
                            </Button>
                            <Button
                                onClick={handleConfirmAnalysis}
                                className="bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-700 hover:to-blue-700"
                            >
                                <Search className="h-4 w-4 mr-2" />
                                Start Analysis
                            </Button>
                        </DialogFooter>
                    </DialogContent>
                </Dialog>
            </div>
        </PageLayout>
    );
};

export default AnomalyDetection;
