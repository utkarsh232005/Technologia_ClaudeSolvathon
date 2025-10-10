import { useState } from 'react';
import PageLayout from '@/components/PageLayout';
import DataTable, { EventData } from '@/components/DataTable';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
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
  ResponsiveContainer 
} from 'recharts';
import { Download, Eye, EyeOff, AlertTriangle, Search, Check, Clock, Filter } from 'lucide-react';

// Mock data for demonstrations
const mockEventData: EventData[] = [
  { id: 'EVT-001', energy: 12.5, s1: 45, s2: 320, s2s1Ratio: 7.11, type: 'WIMP', confidence: 87 },
  { id: 'EVT-002', energy: 8.2, s1: 120, s2: 180, s2s1Ratio: 1.5, type: 'Background', confidence: 92 },
  { id: 'EVT-003', energy: 15.3, s1: 67, s2: 1689, s2s1Ratio: 25.2, type: 'Axion', confidence: 76 },
  { id: 'EVT-004', energy: 22.1, s1: 89, s2: 4077, s2s1Ratio: 45.8, type: 'Neutrino', confidence: 68 },
  { id: 'EVT-005', energy: 9.8, s1: 134, s2: 281, s2s1Ratio: 2.1, type: 'Background', confidence: 89 },
  { id: 'EVT-006', energy: 18.7, s1: 72, s2: 893, s2s1Ratio: 12.4, type: 'WIMP', confidence: 82 },
  { id: 'EVT-007', energy: 35.2, s1: 156, s2: 12214, s2s1Ratio: 78.3, type: 'Neutrino', confidence: 71 },
  { id: 'EVT-008', energy: 14.1, s1: 58, s2: 1096, s2s1Ratio: 18.9, type: 'Axion', confidence: 79 },
  { id: 'EVT-009', energy: 6.5, s1: 98, s2: 176, s2s1Ratio: 1.8, type: 'Background', confidence: 95 },
  { id: 'EVT-010', energy: 11.3, s1: 52, s2: 452, s2s1Ratio: 8.7, type: 'WIMP', confidence: 84 },
  { id: 'EVT-011', energy: 28.4, s1: 112, s2: 7896, s2s1Ratio: 70.5, type: 'Neutrino', confidence: 73 },
  { id: 'EVT-012', energy: 7.9, s1: 145, s2: 203, s2s1Ratio: 1.4, type: 'Background', confidence: 91 },
  { id: 'EVT-013', energy: 16.8, s1: 63, s2: 1428, s2s1Ratio: 22.7, type: 'Axion', confidence: 77 },
  { id: 'EVT-014', energy: 5.3, s1: 87, s2: 139, s2s1Ratio: 1.6, type: 'Background', confidence: 94 },
  { id: 'EVT-015', energy: 13.2, s1: 49, s2: 539, s2s1Ratio: 11.0, type: 'WIMP', confidence: 85 },
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
