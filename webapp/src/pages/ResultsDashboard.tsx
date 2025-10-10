import { useState, useRef, useCallback } from 'react';
import PageLayout from '@/components/PageLayout';
import DataTable, { EventData } from '@/components/DataTable';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { 
  PieChart, 
  Pie, 
  Cell, 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  Legend, 
  ScatterChart, 
  Scatter, 
  ResponsiveContainer,
  LineChart,
  Line,
  Brush,
  ReferenceLine
} from 'recharts';
import Plot from 'react-plotly.js';
import html2canvas from 'html2canvas';
import { 
  Download, 
  Eye, 
  EyeOff, 
  AlertTriangle, 
  Search, 
  Check, 
  Clock, 
  Filter,
  Maximize,
  Maximize2,
  Grid3X3,
  BarChart3,
  Box,
  Star,
  RotateCcw
} from 'lucide-react';

// Mock data for demonstrations
const mockEventData: EventData[] = [
  { id: 'EVT-001', energy: 12.5, s1: 45, s2: 320, s2s1Ratio: 7.11, type: 'WIMP', confidence: 87, timestamp: '2024-10-10T08:15:30Z' },
  { id: 'EVT-002', energy: 8.2, s1: 120, s2: 180, s2s1Ratio: 1.5, type: 'Background', confidence: 92, timestamp: '2024-10-10T08:22:15Z' },
  { id: 'EVT-003', energy: 15.3, s1: 67, s2: 1689, s2s1Ratio: 25.2, type: 'Axion', confidence: 76, timestamp: '2024-10-10T08:28:45Z' },
  { id: 'EVT-004', energy: 22.1, s1: 89, s2: 4450, s2s1Ratio: 50.0, type: 'Neutrino', confidence: 94, timestamp: '2024-10-10T08:35:20Z' },
  { id: 'EVT-005', energy: 6.8, s1: 34, s2: 145, s2s1Ratio: 4.26, type: 'WIMP', confidence: 82, timestamp: '2024-10-10T08:41:10Z' },
  { id: 'EVT-006', energy: 18.7, s1: 78, s2: 890, s2s1Ratio: 11.4, type: 'Background', confidence: 88, timestamp: '2024-10-10T08:47:35Z' },
  { id: 'EVT-007', energy: 35.2, s1: 156, s2: 2340, s2s1Ratio: 15.0, type: 'Anomaly', confidence: 65, timestamp: '2024-10-10T08:53:22Z' },
  { id: 'EVT-008', energy: 9.4, s1: 52, s2: 287, s2s1Ratio: 5.52, type: 'WIMP', confidence: 89, timestamp: '2024-10-10T09:02:18Z' },
  { id: 'EVT-009', energy: 14.6, s1: 95, s2: 1520, s2s1Ratio: 16.0, type: 'Background', confidence: 91, timestamp: '2024-10-10T09:09:45Z' },
  { id: 'EVT-010', energy: 28.3, s1: 118, s2: 5900, s2s1Ratio: 50.0, type: 'Neutrino', confidence: 96, timestamp: '2024-10-10T09:15:30Z' },
  { id: 'EVT-011', energy: 7.1, s1: 41, s2: 205, s2s1Ratio: 5.0, type: 'WIMP', confidence: 85, timestamp: '2024-10-10T09:21:12Z' },
  { id: 'EVT-012', energy: 42.8, s1: 189, s2: 1890, s2s1Ratio: 10.0, type: 'Anomaly', confidence: 58, timestamp: '2024-10-10T09:28:55Z' },
  { id: 'EVT-013', energy: 11.2, s1: 68, s2: 952, s2s1Ratio: 14.0, type: 'Background', confidence: 87, timestamp: '2024-10-10T09:34:40Z' },
  { id: 'EVT-014', energy: 19.5, s1: 102, s2: 3570, s2s1Ratio: 35.0, type: 'Axion', confidence: 79, timestamp: '2024-10-10T09:41:25Z' },
  { id: 'EVT-015', energy: 5.9, s1: 29, s2: 145, s2s1Ratio: 5.0, type: 'WIMP', confidence: 91, timestamp: '2024-10-10T09:47:08Z' }
];

// Mock anomaly data
const mockAnomalies = [
  {
    id: 'A001',
    eventId: 'EVT-2024-1001',
    severity: 'Critical',
    score: 0.92,
    energy: 45.2,
    s2s1Ratio: 125.3,
    detectionTime: '2024-10-10T14:23:15Z',
    features: ['Extreme S2/S1 ratio', 'Multiple scatter signature', 'Edge event'],
    hypothesis: 'Possible cosmic ray interaction with detector wall, creating cascade of secondary particles',
    status: 'open'
  },
  {
    id: 'A002',
    eventId: 'EVT-2024-1087',
    severity: 'Moderate',
    score: 0.74,
    energy: 2.1,
    s2s1Ratio: 0.3,
    detectionTime: '2024-10-10T13:45:22Z',
    features: ['Sub-threshold energy', 'Abnormal pulse shape', 'Late light signal'],
    hypothesis: 'Potential detector artifact or electronic noise mimicking low-energy event',
    status: 'open'
  },
  {
    id: 'A003',
    eventId: 'EVT-2024-1156',
    severity: 'Minor',
    score: 0.58,
    energy: 18.7,
    s2s1Ratio: 15.2,
    detectionTime: '2024-10-10T12:18:33Z',
    features: ['Delayed coincidence', 'Asymmetric light pattern'],
    hypothesis: 'Possible neutron capture event with delayed gamma emission',
    status: 'open'
  },
  {
    id: 'A004',
    eventId: 'EVT-2024-0998',
    severity: 'Critical',
    score: 0.89,
    energy: 78.9,
    s2s1Ratio: 245.7,
    detectionTime: '2024-10-10T11:32:41Z',
    features: ['High energy deposit', 'Multiple PMT hits', 'Saturation warning'],
    hypothesis: 'Likely muon track passing through active volume, causing localized energy deposits',
    status: 'investigating'
  },
  {
    id: 'A005',
    eventId: 'EVT-2024-1203',
    severity: 'Moderate',
    score: 0.67,
    energy: 12.4,
    s2s1Ratio: 3.1,
    detectionTime: '2024-10-10T10:15:17Z',
    features: ['Position reconstruction failure', 'Low light yield'],
    hypothesis: 'Event near detector boundary with partial charge collection efficiency',
    status: 'open'
  }
];

const classificationColors = {
  'Background': '#10b981', // green
  'WIMP': '#3b82f6', // blue
  'Axion': '#8b5cf6', // purple
  'Neutrino': '#f59e0b', // orange
};

const severityConfig = {
  'Critical': { color: 'bg-red-500', border: 'border-l-red-500', emoji: '🔴', textColor: 'text-red-400' },
  'Moderate': { color: 'bg-yellow-500', border: 'border-l-yellow-500', emoji: '🟡', textColor: 'text-yellow-400' },
  'Minor': { color: 'bg-green-500', border: 'border-l-green-500', emoji: '🟢', textColor: 'text-green-400' }
};

const ResultsDashboard = () => {
  const [visibleTypes, setVisibleTypes] = useState<{[key: string]: boolean}>({
    'Background': true,
    'WIMP': true,
    'Axion': true,
    'Neutrino': true,
  });

  const [severityFilter, setSeverityFilter] = useState<string>('all');
  const [sortBy, setSortBy] = useState<string>('score');
  const [anomalyStatuses, setAnomalyStatuses] = useState<{[key: string]: string}>(
    mockAnomalies.reduce((acc, anomaly) => ({ ...acc, [anomaly.id]: anomaly.status }), {})
  );

  // New state for enhanced visualizations
  const [plot3DMode, setPlot3DMode] = useState<'3d' | 'xy' | 'xz' | 'yz'>('3d');
  const [timelineRange, setTimelineRange] = useState<[number, number]>([0, 100]);
  const [fullScreenChart, setFullScreenChart] = useState<string | null>(null);
  const chartRefs = useRef<{[key: string]: HTMLDivElement | null}>({});

  // Utility functions for chart downloads
  const downloadChart = useCallback(async (chartId: string, filename: string) => {
    const element = chartRefs.current[chartId];
    if (element) {
      try {
        const canvas = await html2canvas(element, { 
          backgroundColor: '#0f172a',
          scale: 2 
        });
        const link = document.createElement('a');
        link.download = `${filename}-${new Date().toISOString().split('T')[0]}.png`;
        link.href = canvas.toDataURL();
        link.click();
      } catch (error) {
        console.error('Failed to download chart:', error);
      }
    }
  }, []);

  const toggleFullScreen = (chartId: string) => {
    setFullScreenChart(fullScreenChart === chartId ? null : chartId);
  };

  // Calculate overview statistics
  const totalEvents = mockEventData.length;
  const classificationBreakdown = Object.entries(
    mockEventData.reduce((acc, event) => {
      acc[event.type] = (acc[event.type] || 0) + 1;
      return acc;
    }, {} as {[key: string]: number})
  ).map(([name, value]) => ({ name, value, fill: classificationColors[name as keyof typeof classificationColors] }));

  const averageConfidence = Math.round(
    mockEventData.reduce((sum, event) => sum + event.confidence, 0) / totalEvents
  );

  const anomalies = mockEventData.filter(event => event.confidence < 70).length;

  // Filter and sort anomalies
  const filteredAnomalies = mockAnomalies
    .filter(anomaly => severityFilter === 'all' || anomaly.severity === severityFilter)
    .sort((a, b) => {
      switch (sortBy) {
        case 'score':
          return b.score - a.score;
        case 'eventId':
          return a.eventId.localeCompare(b.eventId);
        case 'time':
          return new Date(b.detectionTime).getTime() - new Date(a.detectionTime).getTime();
        default:
          return 0;
      }
    });

  const openAnomalies = mockAnomalies.filter(a => anomalyStatuses[a.id] === 'open').length;

  // Confidence distribution data
  const confidenceDistribution = [
    { 
      range: 'High (>80%)', 
      count: mockEventData.filter(e => e.confidence > 80).length,
      fill: '#10b981'
    },
    { 
      range: 'Medium (50-80%)', 
      count: mockEventData.filter(e => e.confidence >= 50 && e.confidence <= 80).length,
      fill: '#f59e0b'
    },
    { 
      range: 'Low (<50%)', 
      count: mockEventData.filter(e => e.confidence < 50).length,
      fill: '#ef4444'
    },
  ];

  // Filtered scatter plot data
  const scatterData = mockEventData.filter(event => visibleTypes[event.type]).map(event => ({
    energy: event.energy,
    s2s1Ratio: event.s2s1Ratio,
    classification: event.type,
    id: event.id,
    confidence: event.confidence
  }));

  const toggleType = (type: string) => {
    setVisibleTypes(prev => ({ ...prev, [type]: !prev[type] }));
  };

  const exportChart = (chartName: string) => {
    // Mock export functionality
    console.log(`Exporting ${chartName} chart...`);
  };

  const handleAnomalyAction = (anomalyId: string, action: 'investigate' | 'mark-known') => {
    setAnomalyStatuses(prev => ({
      ...prev,
      [anomalyId]: action === 'investigate' ? 'investigating' : 'known'
    }));
  };

  // DataTable handlers
  const handleViewDetails = (event: EventData) => {
    console.log('View details for event:', event);
    // TODO: Open event details modal
  };

  const handleEditEvent = (event: EventData) => {
    console.log('Edit event:', event);
    // TODO: Open edit modal
  };

  const handleFlagAnomaly = (event: EventData) => {
    console.log('Flag as anomaly:', event);
    // TODO: Add to anomaly list
  };

  const handleExportEvents = (events: EventData[]) => {
    console.log('Export events:', events);
    // TODO: Export to CSV/JSON
  };

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      return (
        <div className="bg-background/95 p-3 rounded-lg border border-white/20 shadow-lg">
          <p className="text-sm font-semibold">Event #{data.id}</p>
          <p className="text-sm">Energy: {data.energy} keV</p>
          <p className="text-sm">S2/S1 Ratio: {data.s2s1Ratio}</p>
          <p className="text-sm">Classification: {data.classification}</p>
          <p className="text-sm">Confidence: {data.confidence}%</p>
        </div>
      );
    }
    return null;
  };

  return (
    <PageLayout
      title="Results Dashboard"
      description="Visualize and analyze detection data with interactive insights"
    >
      {/* Top Section - Overview Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <Card className="backdrop-blur-md bg-card/50 border-white/10">
          <CardHeader className="pb-2">
            <CardDescription>Total Events Processed</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-foreground mb-1">{totalEvents.toLocaleString()}</div>
            <div className="text-sm text-primary">+12% from last week</div>
          </CardContent>
        </Card>

        <Card className="backdrop-blur-md bg-card/50 border-white/10">
          <CardHeader className="pb-2">
            <CardDescription>Classification Breakdown</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-4">
              <div className="w-16 h-16">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={classificationBreakdown}
                      dataKey="value"
                      cx="50%"
                      cy="50%"
                      innerRadius={15}
                      outerRadius={30}
                      strokeWidth={0}
                    >
                      {classificationBreakdown.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.fill} />
                      ))}
                    </Pie>
                  </PieChart>
                </ResponsiveContainer>
              </div>
              <div className="text-sm space-y-1">
                {classificationBreakdown.slice(0, 2).map((item, i) => (
                  <div key={i} className="flex items-center gap-2">
                    <div 
                      className="w-2 h-2 rounded-full" 
                      style={{ backgroundColor: item.fill }}
                    />
                    <span className="text-xs">{item.name}: {item.value}</span>
                  </div>
                ))}
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="backdrop-blur-md bg-card/50 border-white/10">
          <CardHeader className="pb-2">
            <CardDescription>Average Confidence Score</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-foreground mb-1">{averageConfidence}%</div>
            <div className="text-sm text-primary">+2.1% from last week</div>
          </CardContent>
        </Card>

        <Card className={`backdrop-blur-md bg-card/50 border-white/10 ${anomalies > 0 ? 'border-red-500/50 bg-red-500/5' : ''}`}>
          <CardHeader className="pb-2">
            <CardDescription className="flex items-center gap-2">
              Anomalies Detected
              {anomalies > 0 && <AlertTriangle className="w-4 h-4 text-red-400" />}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className={`text-3xl font-bold mb-1 ${anomalies > 0 ? 'text-red-400' : 'text-foreground'}`}>
              {anomalies}
            </div>
            <div className="text-sm text-muted-foreground">Low confidence events</div>
          </CardContent>
        </Card>
      </div>

      {/* Middle Section - Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        {/* Left: Pie Chart */}
        <Card className="backdrop-blur-md bg-card/50 border-white/10">
          <CardHeader className="flex flex-row items-center justify-between">
            <div>
              <CardTitle>Classification Distribution</CardTitle>
              <CardDescription>Breakdown by particle type</CardDescription>
            </div>
            <Button 
              size="sm" 
              variant="outline" 
              onClick={() => exportChart('classification-distribution')}
            >
              <Download className="w-4 h-4" />
            </Button>
          </CardHeader>
          <CardContent>
            <div className="h-80">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={classificationBreakdown}
                    dataKey="value"
                    nameKey="name"
                    cx="50%"
                    cy="50%"
                    outerRadius={100}
                    strokeWidth={2}
                    stroke="rgba(255,255,255,0.1)"
                  >
                    {classificationBreakdown.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.fill} />
                    ))}
                  </Pie>
                  <Tooltip 
                    contentStyle={{
                      backgroundColor: 'rgba(0,0,0,0.8)',
                      border: '1px solid rgba(255,255,255,0.2)',
                      borderRadius: '8px',
                      color: 'white'
                    }}
                  />
                  <Legend />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        {/* Right: Bar Chart */}
        <Card className="backdrop-blur-md bg-card/50 border-white/10">
          <CardHeader className="flex flex-row items-center justify-between">
            <div>
              <CardTitle>Confidence Score Distribution</CardTitle>
              <CardDescription>Events by confidence level</CardDescription>
            </div>
            <Button 
              size="sm" 
              variant="outline" 
              onClick={() => exportChart('confidence-distribution')}
            >
              <Download className="w-4 h-4" />
            </Button>
          </CardHeader>
          <CardContent>
            <div className="h-80">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={confidenceDistribution}>
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" />
                  <XAxis 
                    dataKey="range" 
                    stroke="rgba(255,255,255,0.7)"
                    fontSize={12}
                  />
                  <YAxis 
                    stroke="rgba(255,255,255,0.7)"
                    fontSize={12}
                  />
                  <Tooltip 
                    contentStyle={{
                      backgroundColor: 'rgba(0,0,0,0.8)',
                      border: '1px solid rgba(255,255,255,0.2)',
                      borderRadius: '8px',
                      color: 'white'
                    }}
                  />
                  <Bar 
                    dataKey="count" 
                    radius={[4, 4, 0, 0]}
                    stroke="rgba(255,255,255,0.2)"
                    strokeWidth={1}
                  />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Bottom Section - Interactive Scatter Plot */}
      <Card className="backdrop-blur-md bg-card/50 border-white/10">
        <CardHeader className="flex flex-row items-center justify-between">
          <div>
            <CardTitle>Energy vs S2/S1 Ratio Analysis</CardTitle>
            <CardDescription>Interactive scatter plot with particle type filtering</CardDescription>
          </div>
          <Button 
            size="sm" 
            variant="outline" 
            onClick={() => exportChart('scatter-plot')}
          >
            <Download className="w-4 h-4" />
          </Button>
        </CardHeader>
        <CardContent>
          {/* Filter toggles */}
          <div className="flex flex-wrap gap-2 mb-6">
            {Object.entries(classificationColors).map(([type, color]) => (
              <Button
                key={type}
                size="sm"
                variant={visibleTypes[type] ? "default" : "outline"}
                onClick={() => toggleType(type)}
                className="flex items-center gap-2"
                style={visibleTypes[type] ? { backgroundColor: color } : {}}
              >
                {visibleTypes[type] ? <Eye className="w-3 h-3" /> : <EyeOff className="w-3 h-3" />}
                {type}
              </Button>
            ))}
          </div>
          
          <div className="h-96">
            <ResponsiveContainer width="100%" height="100%">
              <ScatterChart
                data={scatterData}
                margin={{ top: 20, right: 20, bottom: 20, left: 20 }}
              >
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" />
                <XAxis 
                  type="number" 
                  dataKey="energy" 
                  name="Energy (keV)"
                  stroke="rgba(255,255,255,0.7)"
                  fontSize={12}
                />
                <YAxis 
                  type="number" 
                  dataKey="s2s1Ratio" 
                  name="S2/S1 Ratio"
                  stroke="rgba(255,255,255,0.7)"
                  fontSize={12}
                />
                <Tooltip content={<CustomTooltip />} />
                <Legend />
                {Object.entries(classificationColors).map(([type, color]) => (
                  <Scatter
                    key={type}
                    name={type}
                    data={scatterData.filter(d => d.classification === type)}
                    fill={color}
                    strokeWidth={2}
                    stroke="rgba(255,255,255,0.3)"
                  />
                ))}
              </ScatterChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>

      {/* Anomaly Hub Section */}
      <div className="mt-8">
        <Card className="backdrop-blur-md bg-card/50 border-white/10">
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="flex items-center gap-2">
                  <AlertTriangle className="w-5 h-5 text-yellow-400" />
                  Anomaly Hub
                </CardTitle>
                <CardDescription>Detected anomalies requiring investigation</CardDescription>
              </div>
              <Badge variant="destructive" className="bg-red-500/20 text-red-400 border-red-500/50">
                {openAnomalies} anomalies detected in last batch
              </Badge>
            </div>
          </CardHeader>
          <CardContent>
            {/* Filters */}
            <div className="flex gap-4 mb-6">
              <div className="flex items-center gap-2">
                <Filter className="w-4 h-4 text-muted-foreground" />
                <span className="text-sm text-muted-foreground">Filter by severity:</span>
                <Select value={severityFilter} onValueChange={setSeverityFilter}>
                  <SelectTrigger className="w-32">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All</SelectItem>
                    <SelectItem value="Critical">Critical</SelectItem>
                    <SelectItem value="Moderate">Moderate</SelectItem>
                    <SelectItem value="Minor">Minor</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-sm text-muted-foreground">Sort by:</span>
                <Select value={sortBy} onValueChange={setSortBy}>
                  <SelectTrigger className="w-40">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="score">Anomaly Score</SelectItem>
                    <SelectItem value="eventId">Event ID</SelectItem>
                    <SelectItem value="time">Detection Time</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            {/* Anomaly Accordion */}
            <Accordion type="single" collapsible className="space-y-3">
              {filteredAnomalies.map((anomaly) => {
                const config = severityConfig[anomaly.severity as keyof typeof severityConfig];
                const status = anomalyStatuses[anomaly.id];
                
                return (
                  <AccordionItem key={anomaly.id} value={anomaly.id} className="border-none">
                    <Card className={`backdrop-blur-md bg-card/50 border-white/10 ${config.border} border-l-4`}>
                      <AccordionTrigger className="hover:no-underline p-0">
                        <CardHeader className="w-full">
                          <div className="flex items-center justify-between w-full">
                            <div className="flex items-center gap-3">
                              <span className="text-lg">{config.emoji}</span>
                              <div className="text-left">
                                <div className="flex items-center gap-2">
                                  <span className="font-semibold">{anomaly.eventId}</span>
                                  <Badge variant="outline" className={`${config.textColor} border-current`}>
                                    {anomaly.severity}
                                  </Badge>
                                  {status !== 'open' && (
                                    <Badge variant="secondary" className="text-xs">
                                      {status === 'investigating' ? 'Investigating' : 'Known'}
                                    </Badge>
                                  )}
                                </div>
                                <div className="text-sm text-muted-foreground">
                                  Anomaly Score: {anomaly.score.toFixed(2)} | 
                                  Energy: {anomaly.energy} keV | 
                                  S2/S1: {anomaly.s2s1Ratio}
                                </div>
                              </div>
                            </div>
                            <div className="text-right">
                              <div className="text-lg font-bold text-primary">{anomaly.score.toFixed(2)}</div>
                              <div className="text-xs text-muted-foreground">
                                {new Date(anomaly.detectionTime).toLocaleTimeString()}
                              </div>
                            </div>
                          </div>
                        </CardHeader>
                      </AccordionTrigger>
                      
                      <AccordionContent>
                        <CardContent className="pt-0">
                          <div className="space-y-4">
                            {/* Quick Stats */}
                            <div className="grid grid-cols-3 gap-4 p-3 bg-muted/10 rounded-lg">
                              <div>
                                <div className="text-xs text-muted-foreground">Energy</div>
                                <div className="font-semibold">{anomaly.energy} keV</div>
                              </div>
                              <div>
                                <div className="text-xs text-muted-foreground">S2/S1 Ratio</div>
                                <div className="font-semibold">{anomaly.s2s1Ratio}</div>
                              </div>
                              <div>
                                <div className="text-xs text-muted-foreground">Detection Time</div>
                                <div className="font-semibold text-xs">
                                  {new Date(anomaly.detectionTime).toLocaleString()}
                                </div>
                              </div>
                            </div>

                            {/* Unusual Features */}
                            <div>
                              <div className="text-sm font-semibold mb-2">Unusual Features:</div>
                              <div className="flex flex-wrap gap-2">
                                {anomaly.features.map((feature, idx) => (
                                  <Badge key={idx} variant="outline" className="text-xs">
                                    {feature}
                                  </Badge>
                                ))}
                              </div>
                            </div>

                            {/* Claude's Hypothesis */}
                            <div>
                              <div className="text-sm font-semibold mb-2">Claude's Hypothesis:</div>
                              <div className="text-sm text-muted-foreground italic bg-muted/10 p-3 rounded-lg">
                                "{anomaly.hypothesis}"
                              </div>
                            </div>

                            {/* Action Buttons */}
                            <div className="flex gap-2 pt-2">
                              <Button
                                size="sm"
                                variant="default"
                                onClick={() => handleAnomalyAction(anomaly.id, 'investigate')}
                                disabled={status !== 'open'}
                                className="flex items-center gap-2"
                              >
                                <Search className="w-3 h-3" />
                                {status === 'investigating' ? 'Investigating...' : 'Investigate'}
                              </Button>
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => handleAnomalyAction(anomaly.id, 'mark-known')}
                                disabled={status !== 'open'}
                                className="flex items-center gap-2"
                              >
                                <Check className="w-3 h-3" />
                                {status === 'known' ? 'Marked as Known' : 'Mark as Known'}
                              </Button>
                              {status !== 'open' && (
                                <div className="flex items-center gap-1 text-xs text-muted-foreground ml-auto">
                                  <Clock className="w-3 h-3" />
                                  Status updated
                                </div>
                              )}
                            </div>
                          </div>
                        </CardContent>
                      </AccordionContent>
                    </Card>
                  </AccordionItem>
                );
              })}
            </Accordion>

            {filteredAnomalies.length === 0 && (
              <div className="text-center py-8 text-muted-foreground">
                <AlertTriangle className="w-12 h-12 mx-auto mb-4 opacity-50" />
                <p>No anomalies found matching current filters.</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Feature Space Explorer */}
      <div className="mt-8">
        <Card className="bg-slate-900/50 backdrop-blur-sm border-slate-700/50">
          <CardHeader>
            <div className="flex justify-between items-center">
              <CardTitle className="text-xl text-blue-300 flex items-center gap-2">
                <Box className="h-5 w-5" />
                Feature Space Explorer
              </CardTitle>
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => downloadChart('feature-space', 'feature-space-plot')}
                  className="border-slate-600 hover:bg-slate-700"
                >
                  <Download className="h-4 w-4" />
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => toggleFullScreen('feature-space')}
                  className="border-slate-600 hover:bg-slate-700"
                >
                  <Maximize2 className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {/* Plot Mode Controls */}
              <div className="flex gap-2">
                {(['3d', 'xy', 'xz', 'yz'] as const).map((mode) => (
                  <Button
                    key={mode}
                    variant={plot3DMode === mode ? "default" : "outline"}
                    size="sm"
                    onClick={() => setPlot3DMode(mode)}
                    className={`${
                      plot3DMode === mode 
                        ? "bg-blue-600 hover:bg-blue-700" 
                        : "border-slate-600 hover:bg-slate-700"
                    }`}
                  >
                    {mode.toUpperCase()}
                  </Button>
                ))}
              </div>

              {/* 3D Scatter Plot */}
              <div 
                ref={(el) => chartRefs.current['feature-space'] = el}
                className={`${
                  fullScreenChart === 'feature-space' 
                    ? 'fixed inset-0 z-50 bg-slate-900 p-8' 
                    : 'h-96'
                }`}
              >
                <Plot
                  data={[
                    {
                      x: mockEventData.map(d => d.energy),
                      y: mockEventData.map(d => d.s1),
                      z: plot3DMode === '3d' ? mockEventData.map(d => d.s2) : undefined,
                      mode: 'markers',
                      type: plot3DMode === '3d' ? 'scatter3d' : 'scatter',
                      marker: {
                        size: 8,
                        color: mockEventData.map(d => 
                          d.type === 'WIMP' ? '#3b82f6' : 
                          d.type === 'Neutrino' ? '#ef4444' : '#10b981'
                        ),
                        opacity: 0.8,
                        line: {
                          color: '#ffffff',
                          width: 1
                        }
                      },
                      text: mockEventData.map(d => 
                        `Event ${d.id}<br>Type: ${d.type}<br>Confidence: ${d.confidence}%`
                      ),
                      hovertemplate: '%{text}<extra></extra>',
                      name: 'Events'
                    }
                  ]}
                  layout={{
                    paper_bgcolor: 'transparent',
                    plot_bgcolor: 'transparent',
                    font: { color: '#e2e8f0' },
                    ...(plot3DMode === '3d' ? {
                      scene: {
                        xaxis: { 
                          title: 'Energy (keV)', 
                          gridcolor: '#475569',
                          zerolinecolor: '#64748b'
                        },
                        yaxis: { 
                          title: 'S1 Signal', 
                          gridcolor: '#475569',
                          zerolinecolor: '#64748b'
                        },
                        zaxis: { 
                          title: 'S2 Signal', 
                          gridcolor: '#475569',
                          zerolinecolor: '#64748b'
                        },
                        bgcolor: 'transparent',
                        camera: {
                          eye: { x: 1.5, y: 1.5, z: 1.5 }
                        }
                      }
                    } : {
                      xaxis: { 
                        title: plot3DMode.includes('x') ? 'Energy (keV)' : 'S2 Signal',
                        gridcolor: '#475569',
                        zerolinecolor: '#64748b'
                      },
                      yaxis: { 
                        title: plot3DMode === 'xy' ? 'S1 Signal' : 'S2 Signal',
                        gridcolor: '#475569',
                        zerolinecolor: '#64748b'
                      }
                    }),
                    margin: { t: 20, r: 20, b: 40, l: 60 },
                    legend: {
                      font: { color: '#e2e8f0' }
                    }
                  }}
                  config={{
                    displayModeBar: true,
                    displaylogo: false,
                    modeBarButtonsToRemove: ['pan2d', 'lasso2d']
                  }}
                  style={{ 
                    width: '100%', 
                    height: fullScreenChart === 'feature-space' ? 'calc(100vh - 200px)' : '100%' 
                  }}
                />
              </div>

              {/* Legend */}
              <div className="flex justify-center gap-6 text-sm">
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full bg-blue-500"></div>
                  <span className="text-slate-300">WIMP Candidates</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full bg-red-500"></div>
                  <span className="text-slate-300">Neutron Events</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full bg-green-500"></div>
                  <span className="text-slate-300">Background</span>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Timeline View */}
      <div className="mt-8">
        <Card className="bg-slate-900/50 backdrop-blur-sm border-slate-700/50">
          <CardHeader>
            <div className="flex justify-between items-center">
              <CardTitle className="text-xl text-purple-300 flex items-center gap-2">
                <Clock className="h-5 w-5" />
                Timeline View
              </CardTitle>
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => downloadChart('timeline', 'timeline-plot')}
                  className="border-slate-600 hover:bg-slate-700"
                >
                  <Download className="h-4 w-4" />
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => toggleFullScreen('timeline')}
                  className="border-slate-600 hover:bg-slate-700"
                >
                  <Maximize2 className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {/* Timeline Controls */}
              <div className="flex items-center gap-4">
                <span className="text-sm text-slate-300">Time Range:</span>
                <div className="flex-1 px-4">
                  <input
                    type="range"
                    min="0"
                    max="100"
                    value={timelineRange[0]}
                    onChange={(e) => setTimelineRange([parseInt(e.target.value), timelineRange[1]])}
                    className="w-full h-2 bg-slate-600 rounded-lg appearance-none cursor-pointer"
                  />
                </div>
                <span className="text-xs text-slate-400 w-20">
                  {timelineRange[0]}% - {timelineRange[1]}%
                </span>
              </div>

              {/* Timeline Plot */}
              <div 
                ref={(el) => chartRefs.current['timeline'] = el}
                className={`${
                  fullScreenChart === 'timeline' 
                    ? 'fixed inset-0 z-50 bg-slate-900 p-8' 
                    : 'h-80'
                }`}
              >
                <Plot
                  data={[
                    {
                      x: mockEventData.map(d => d.timestamp),
                      y: mockEventData.map(d => d.confidence),
                      mode: 'markers+lines',
                      type: 'scatter',
                      marker: {
                        size: 10,
                        color: mockEventData.map(d => 
                          d.type === 'WIMP' ? '#3b82f6' : 
                          d.type === 'Neutrino' ? '#ef4444' : '#10b981'
                        ),
                        opacity: 0.8,
                        line: {
                          color: '#ffffff',
                          width: 2
                        }
                      },
                      line: {
                        color: '#64748b',
                        width: 1
                      },
                      text: mockEventData.map(d => 
                        `Event ${d.id}<br>Time: ${new Date(d.timestamp || '').toLocaleTimeString()}<br>Type: ${d.type}<br>Confidence: ${d.confidence}%`
                      ),
                      hovertemplate: '%{text}<extra></extra>',
                      name: 'Events'
                    },
                    // Anomaly highlights
                    {
                      x: mockEventData.filter(d => d.confidence < 70).map(d => d.timestamp),
                      y: mockEventData.filter(d => d.confidence < 70).map(d => d.confidence),
                      mode: 'markers',
                      type: 'scatter',
                      marker: {
                        size: 15,
                        color: 'transparent',
                        line: {
                          color: '#fbbf24',
                          width: 3
                        },
                        symbol: 'circle-open'
                      },
                      text: mockEventData.filter(d => d.confidence < 70).map(d => 
                        `ANOMALY: Event ${d.id}<br>Time: ${new Date(d.timestamp).toLocaleTimeString()}<br>Low confidence: ${d.confidence}%`
                      ),
                      hovertemplate: '%{text}<extra></extra>',
                      name: 'Anomalies',
                      showlegend: true
                    }
                  ]}
                  layout={{
                    paper_bgcolor: 'transparent',
                    plot_bgcolor: 'transparent',
                    font: { color: '#e2e8f0' },
                    xaxis: { 
                      title: 'Time',
                      gridcolor: '#475569',
                      zerolinecolor: '#64748b',
                      type: 'date'
                    },
                    yaxis: { 
                      title: 'Confidence Score (%)',
                      gridcolor: '#475569',
                      zerolinecolor: '#64748b',
                      range: [0, 100]
                    },
                    margin: { t: 20, r: 20, b: 60, l: 60 },
                    legend: {
                      font: { color: '#e2e8f0' },
                      x: 1,
                      y: 1
                    },
                    shapes: [
                      // Confidence threshold line
                      {
                        type: 'line',
                        x0: mockEventData[0]?.timestamp,
                        x1: mockEventData[mockEventData.length - 1]?.timestamp,
                        y0: 70,
                        y1: 70,
                        line: {
                          color: '#fbbf24',
                          width: 2,
                          dash: 'dash'
                        }
                      }
                    ],
                    annotations: [
                      {
                        x: mockEventData[Math.floor(mockEventData.length / 2)]?.timestamp,
                        y: 72,
                        text: 'Anomaly Threshold',
                        showarrow: false,
                        font: { color: '#fbbf24', size: 12 }
                      }
                    ]
                  }}
                  config={{
                    displayModeBar: true,
                    displaylogo: false,
                    modeBarButtonsToRemove: ['pan2d', 'lasso2d']
                  }}
                  style={{ 
                    width: '100%', 
                    height: fullScreenChart === 'timeline' ? 'calc(100vh - 200px)' : '100%' 
                  }}
                />
              </div>

              {/* Timeline Statistics */}
              <div className="grid grid-cols-3 gap-4 text-center">
                <div className="bg-slate-800/50 rounded-lg p-3">
                  <div className="text-lg font-bold text-blue-400">
                    {mockEventData.filter(d => d.type === 'WIMP').length}
                  </div>
                  <div className="text-xs text-slate-400">WIMP Events</div>
                </div>
                <div className="bg-slate-800/50 rounded-lg p-3">
                  <div className="text-lg font-bold text-yellow-400">
                    {mockEventData.filter(d => d.confidence < 70).length}
                  </div>
                  <div className="text-xs text-slate-400">Low Confidence</div>
                </div>
                <div className="bg-slate-800/50 rounded-lg p-3">
                  <div className="text-lg font-bold text-green-400">
                    {(mockEventData.reduce((acc, d) => acc + d.confidence, 0) / mockEventData.length).toFixed(1)}%
                  </div>
                  <div className="text-xs text-slate-400">Avg Confidence</div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Distribution Histograms */}
      <div className="mt-8">
        <Card className="bg-slate-900/50 backdrop-blur-sm border-slate-700/50">
          <CardHeader>
            <div className="flex justify-between items-center">
              <CardTitle className="text-xl text-green-300 flex items-center gap-2">
                <BarChart3 className="h-5 w-5" />
                Feature Distributions
              </CardTitle>
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => downloadChart('distributions', 'feature-distributions')}
                  className="border-slate-600 hover:bg-slate-700"
                >
                  <Download className="h-4 w-4" />
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => toggleFullScreen('distributions')}
                  className="border-slate-600 hover:bg-slate-700"
                >
                  <Maximize2 className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Energy Distribution */}
              <div className="space-y-2">
                <h4 className="text-sm font-medium text-slate-300">Energy Distribution (keV)</h4>
                <div 
                  ref={(el) => chartRefs.current['energy-dist'] = el}
                  className="h-64"
                >
                  <Plot
                    data={[
                      {
                        x: mockEventData.filter(d => d.type === 'WIMP').map(d => d.energy),
                        type: 'histogram',
                        name: 'WIMP',
                        opacity: 0.7,
                        marker: { color: '#3b82f6' },
                        xbins: { size: 5 }
                      },
                      {
                        x: mockEventData.filter(d => d.type === 'Neutrino').map(d => d.energy),
                        type: 'histogram',
                        name: 'Neutrino',
                        opacity: 0.7,
                        marker: { color: '#ef4444' },
                        xbins: { size: 5 }
                      },
                      {
                        x: mockEventData.filter(d => d.type === 'Background').map(d => d.energy),
                        type: 'histogram',
                        name: 'Background',
                        opacity: 0.7,
                        marker: { color: '#10b981' },
                        xbins: { size: 5 }
                      }
                    ]}
                    layout={{
                      paper_bgcolor: 'transparent',
                      plot_bgcolor: 'transparent',
                      font: { color: '#e2e8f0', size: 10 },
                      xaxis: { 
                        title: 'Energy (keV)',
                        gridcolor: '#475569',
                        zerolinecolor: '#64748b'
                      },
                      yaxis: { 
                        title: 'Count',
                        gridcolor: '#475569',
                        zerolinecolor: '#64748b'
                      },
                      margin: { t: 20, r: 20, b: 40, l: 40 },
                      legend: { 
                        font: { color: '#e2e8f0', size: 10 },
                        x: 1, y: 1
                      },
                      barmode: 'overlay'
                    }}
                    config={{
                      displayModeBar: false,
                      displaylogo: false
                    }}
                    style={{ width: '100%', height: '100%' }}
                  />
                </div>
                <div className="text-xs text-slate-400 text-center">
                  Mean: {(mockEventData.reduce((acc, d) => acc + d.energy, 0) / mockEventData.length).toFixed(1)} keV
                </div>
              </div>

              {/* S1 Distribution */}
              <div className="space-y-2">
                <h4 className="text-sm font-medium text-slate-300">S1 Signal Distribution</h4>
                <div 
                  ref={(el) => chartRefs.current['s1-dist'] = el}
                  className="h-64"
                >
                  <Plot
                    data={[
                      {
                        x: mockEventData.filter(d => d.type === 'WIMP').map(d => d.s1),
                        type: 'histogram',
                        name: 'WIMP',
                        opacity: 0.7,
                        marker: { color: '#3b82f6' },
                        xbins: { size: 20 }
                      },
                      {
                        x: mockEventData.filter(d => d.type === 'Neutrino').map(d => d.s1),
                        type: 'histogram',
                        name: 'Neutrino',
                        opacity: 0.7,
                        marker: { color: '#ef4444' },
                        xbins: { size: 20 }
                      },
                      {
                        x: mockEventData.filter(d => d.type === 'Background').map(d => d.s1),
                        type: 'histogram',
                        name: 'Background',
                        opacity: 0.7,
                        marker: { color: '#10b981' },
                        xbins: { size: 20 }
                      }
                    ]}
                    layout={{
                      paper_bgcolor: 'transparent',
                      plot_bgcolor: 'transparent',
                      font: { color: '#e2e8f0', size: 10 },
                      xaxis: { 
                        title: 'S1 Signal',
                        gridcolor: '#475569',
                        zerolinecolor: '#64748b'
                      },
                      yaxis: { 
                        title: 'Count',
                        gridcolor: '#475569',
                        zerolinecolor: '#64748b'
                      },
                      margin: { t: 20, r: 20, b: 40, l: 40 },
                      legend: { 
                        font: { color: '#e2e8f0', size: 10 },
                        x: 1, y: 1
                      },
                      barmode: 'overlay'
                    }}
                    config={{
                      displayModeBar: false,
                      displaylogo: false
                    }}
                    style={{ width: '100%', height: '100%' }}
                  />
                </div>
                <div className="text-xs text-slate-400 text-center">
                  Mean: {(mockEventData.reduce((acc, d) => acc + d.s1, 0) / mockEventData.length).toFixed(1)}
                </div>
              </div>

              {/* S2 Distribution */}
              <div className="space-y-2">
                <h4 className="text-sm font-medium text-slate-300">S2 Signal Distribution</h4>
                <div 
                  ref={(el) => chartRefs.current['s2-dist'] = el}
                  className="h-64"
                >
                  <Plot
                    data={[
                      {
                        x: mockEventData.filter(d => d.type === 'WIMP').map(d => d.s2),
                        type: 'histogram',
                        name: 'WIMP',
                        opacity: 0.7,
                        marker: { color: '#3b82f6' },
                        xbins: { size: 500 }
                      },
                      {
                        x: mockEventData.filter(d => d.type === 'Neutrino').map(d => d.s2),
                        type: 'histogram',
                        name: 'Neutrino',
                        opacity: 0.7,
                        marker: { color: '#ef4444' },
                        xbins: { size: 500 }
                      },
                      {
                        x: mockEventData.filter(d => d.type === 'Background').map(d => d.s2),
                        type: 'histogram',
                        name: 'Background',
                        opacity: 0.7,
                        marker: { color: '#10b981' },
                        xbins: { size: 500 }
                      }
                    ]}
                    layout={{
                      paper_bgcolor: 'transparent',
                      plot_bgcolor: 'transparent',
                      font: { color: '#e2e8f0', size: 10 },
                      xaxis: { 
                        title: 'S2 Signal',
                        gridcolor: '#475569',
                        zerolinecolor: '#64748b'
                      },
                      yaxis: { 
                        title: 'Count',
                        gridcolor: '#475569',
                        zerolinecolor: '#64748b'
                      },
                      margin: { t: 20, r: 20, b: 40, l: 40 },
                      legend: { 
                        font: { color: '#e2e8f0', size: 10 },
                        x: 1, y: 1
                      },
                      barmode: 'overlay'
                    }}
                    config={{
                      displayModeBar: false,
                      displaylogo: false
                    }}
                    style={{ width: '100%', height: '100%' }}
                  />
                </div>
                <div className="text-xs text-slate-400 text-center">
                  Mean: {(mockEventData.reduce((acc, d) => acc + d.s2, 0) / mockEventData.length).toFixed(0)}
                </div>
              </div>
            </div>

            {/* Statistical Summary */}
            <div className="mt-6 grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="bg-slate-800/50 rounded-lg p-4">
                <h5 className="text-sm font-medium text-blue-300 mb-2">Energy Statistics</h5>
                <div className="space-y-1 text-xs text-slate-400">
                  <div>Min: {Math.min(...mockEventData.map(d => d.energy)).toFixed(1)} keV</div>
                  <div>Max: {Math.max(...mockEventData.map(d => d.energy)).toFixed(1)} keV</div>
                  <div>Std: {Math.sqrt(mockEventData.reduce((acc, d) => acc + Math.pow(d.energy - mockEventData.reduce((a, b) => a + b.energy, 0) / mockEventData.length, 2), 0) / mockEventData.length).toFixed(1)} keV</div>
                </div>
              </div>
              <div className="bg-slate-800/50 rounded-lg p-4">
                <h5 className="text-sm font-medium text-purple-300 mb-2">S1 Statistics</h5>
                <div className="space-y-1 text-xs text-slate-400">
                  <div>Min: {Math.min(...mockEventData.map(d => d.s1)).toFixed(1)}</div>
                  <div>Max: {Math.max(...mockEventData.map(d => d.s1)).toFixed(1)}</div>
                  <div>Std: {Math.sqrt(mockEventData.reduce((acc, d) => acc + Math.pow(d.s1 - mockEventData.reduce((a, b) => a + b.s1, 0) / mockEventData.length, 2), 0) / mockEventData.length).toFixed(1)}</div>
                </div>
              </div>
              <div className="bg-slate-800/50 rounded-lg p-4">
                <h5 className="text-sm font-medium text-green-300 mb-2">S2 Statistics</h5>
                <div className="space-y-1 text-xs text-slate-400">
                  <div>Min: {Math.min(...mockEventData.map(d => d.s2)).toFixed(0)}</div>
                  <div>Max: {Math.max(...mockEventData.map(d => d.s2)).toFixed(0)}</div>
                  <div>Std: {Math.sqrt(mockEventData.reduce((acc, d) => acc + Math.pow(d.s2 - mockEventData.reduce((a, b) => a + b.s2, 0) / mockEventData.length, 2), 0) / mockEventData.length).toFixed(0)}</div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Event Data Table */}
      <div className="mt-8">
        <DataTable
          data={mockEventData}
          title="Detection Events"
          onViewDetails={handleViewDetails}
          onEdit={handleEditEvent}
          onFlag={handleFlagAnomaly}
          onExport={handleExportEvents}
        />
      </div>
    </PageLayout>
  );
};

export default ResultsDashboard;
