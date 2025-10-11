import { useState, useRef, useCallback, useEffect } from 'react';
import PageLayout from '@/components/PageLayout';
import DataTable, { EventData } from '@/components/DataTable';
import { LoadingSpinner, ProgressBar } from '@/components/LoadingComponents';
import { showToast } from '@/lib/toast';
import ClassificationAPI from '@/lib/classificationAPI';
import anomalyAPI from '@/lib/anomalyAPI';
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

// Types for dataset statistics
interface DatasetStatistics {
  totalEvents: number;
  classificationBreakdown: Record<string, number>;
  energyStats: {
    min: number;
    max: number;
    mean: number;
    median: number;
    std: number;
  };
  s2s1Stats: {
    min: number;
    max: number;
    mean: number;
    median: number;
    std: number;
  };
  confidenceDistribution: {
    high: number;
    medium: number;
    low: number;
  };
  energyDistribution: Array<{ range: string; count: number }>;
  s2s1ByClassification: Record<string, {
    mean: number;
    std: number;
    min: number;
    max: number;
  }>;
  scatterData: Array<{
    energy: number;
    s2s1Ratio: number;
    classification: string;
    id: string;
    s1: number;
    s2: number;
    confidence?: number;
  }>;
  dataSource?: 'analyzed' | 'raw' | 'mixed';
  analyzedCount?: number;
  rawCount?: number;
  analysisTimestamp?: string;
}

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
  // State for data loading
  const [isLoading, setIsLoading] = useState(true);
  const [eventData, setEventData] = useState<EventData[]>([]);
  const [datasetStats, setDatasetStats] = useState<DatasetStatistics | null>(null);
  const [error, setError] = useState<string | null>(null);

  const [visibleTypes, setVisibleTypes] = useState<{ [key: string]: boolean }>({
    'Background': true,
    'WIMP': true,
    'WIMP-like': true,
    'Axion': true,
    'Neutrino': true,
    'Anomaly': true,
    'Novel Anomaly': true,
  });

  const [severityFilter, setSeverityFilter] = useState<string>('all');
  const [sortBy, setSortBy] = useState<string>('score');
  const [anomalyStatuses, setAnomalyStatuses] = useState<{ [key: string]: string }>({});

  // New state for enhanced visualizations
  const [plot3DMode, setPlot3DMode] = useState<'3d' | 'xy' | 'xz' | 'yz'>('3d');
  const [timelineRange, setTimelineRange] = useState<[number, number]>([0, 100]);
  const [fullScreenChart, setFullScreenChart] = useState<string | null>(null);
  const chartRefs = useRef<{ [key: string]: HTMLDivElement | null }>({});

  // Fetch real data from backend on mount
  useEffect(() => {
    const fetchData = async () => {
      console.log('🔄 Fetching real dataset statistics...');
      setIsLoading(true);
      setError(null);

      try {
        // Fetch comprehensive statistics from new endpoint
        console.log('📊 Loading real dataset statistics...');
        const response = await fetch('http://localhost:5001/api/dataset/statistics');
        const result = await response.json();

        if (!result.success || !result.statistics) {
          throw new Error(result.error || 'Failed to load dataset statistics');
        } const stats = result.statistics;
        console.log(`✅ Loaded statistics for ${stats.totalEvents} total events`);
        console.log(`📈 Classification breakdown:`, stats.classificationBreakdown);
        console.log(`🔬 Data source: ${stats.dataSource === 'analyzed' ? 'ANALYZED (Claude AI)' : 'RAW Dataset'}`);

        setDatasetStats(stats);

        // Transform scatter data to EventData format for the table
        const scatterData = stats.scatterData || [];
        const transformedEvents: EventData[] = scatterData.map((event, index: number) => ({
          id: String(event.id || `EVT-${index + 1}`),
          energy: Number(event.energy || 0),
          s1: Number(event.s1 || 0),
          s2: Number(event.s2 || 0),
          s2s1Ratio: Number(event.s2s1Ratio || 0),
          type: event.classification || 'Unknown',
          confidence: Math.round((Number(event.confidence) || 0.85) * 100),
          timestamp: event.timestamp || new Date().toISOString()
        }));

        console.log(`✅ Prepared ${transformedEvents.length} events for visualization`);
        setEventData(transformedEvents);

        showToast.success(`Loaded real data: ${stats.totalEvents.toLocaleString()} total events`);
      } catch (err) {
        console.error('❌ Error loading dashboard data:', err);
        const errorMessage = err instanceof Error ? err.message : 'Failed to load data. Is the backend running?';
        setError(errorMessage);
        showToast.error(errorMessage);
        // Fallback to empty data
        setEventData([]);
        setDatasetStats(null);
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, []);

  // Use real data if available, otherwise empty array
  const mockEventData = eventData;

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

  // Calculate overview statistics from real data
  const totalEvents = datasetStats?.totalEvents || mockEventData.length;

  const classificationBreakdown = datasetStats?.classificationBreakdown
    ? Object.entries(datasetStats.classificationBreakdown).map(([name, value]) => ({
      name,
      value: value as number,
      fill: classificationColors[name as keyof typeof classificationColors] || '#64748b'
    }))
    : Object.entries(
      mockEventData.reduce((acc, event) => {
        acc[event.type] = (acc[event.type] || 0) + 1;
        return acc;
      }, {} as { [key: string]: number })
    ).map(([name, value]) => ({
      name,
      value,
      fill: classificationColors[name as keyof typeof classificationColors] || '#64748b'
    }));

  const averageConfidence = datasetStats?.confidenceDistribution
    ? Math.round(
      ((datasetStats.confidenceDistribution.high * 90) +
        (datasetStats.confidenceDistribution.medium * 65) +
        (datasetStats.confidenceDistribution.low * 30)) /
      (datasetStats.confidenceDistribution.high +
        datasetStats.confidenceDistribution.medium +
        datasetStats.confidenceDistribution.low || 1)
    )
    : Math.round(
      mockEventData.reduce((sum, event) => sum + event.confidence, 0) / (totalEvents || 1)
    );

  const anomalies = datasetStats?.confidenceDistribution?.low
    || mockEventData.filter(event => event.confidence < 70).length;

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

  // Confidence distribution data - use real data if available
  const confidenceDistribution = datasetStats?.confidenceDistribution
    ? [
      {
        range: 'High (>80%)',
        count: datasetStats.confidenceDistribution.high,
        fill: '#10b981'
      },
      {
        range: 'Medium (50-80%)',
        count: datasetStats.confidenceDistribution.medium,
        fill: '#f59e0b'
      },
      {
        range: 'Low (<50%)',
        count: datasetStats.confidenceDistribution.low,
        fill: '#ef4444'
      },
    ]
    : [
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

  // Filtered scatter plot data - use real scatter data if available
  const scatterData = (datasetStats?.scatterData || mockEventData)
    .filter((event) => {
      const eventType = 'classification' in event ? event.classification : event.type;
      return visibleTypes[eventType as string];
    })
    .map((event) => ({
      energy: 'classification' in event ? event.energy : event.energy,
      s2s1Ratio: 'classification' in event ? event.s2s1Ratio : event.s2s1Ratio,
      classification: 'classification' in event ? event.classification : event.type,
      id: String(event.id),
      confidence: 'confidence' in event ? (event.confidence || 85) : event.confidence
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

  const CustomTooltip = ({ active, payload, label }: { active?: boolean; payload?: Array<{ payload: EventData }>; label?: string }) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      return (
        <div className="custom-tooltip">
          <p className="text-sm font-semibold text-white mb-2">Event #{data.id}</p>
          <div className="space-y-1">
            <p className="text-xs text-slate-300">Energy: <span className="text-cyan-400 font-mono">{data.energy} keV</span></p>
            <p className="text-xs text-slate-300">S2/S1 Ratio: <span className="text-cyan-400 font-mono">{data.s2s1Ratio}</span></p>
            <p className="text-xs text-slate-300">Classification: <span className="text-white font-medium">{data.type}</span></p>
            <p className="text-xs text-slate-300">Confidence: <span className="text-green-400 font-mono">{data.confidence}%</span></p>
          </div>
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
      {/* Data source badge */}
      {datasetStats && (
        <div className="mb-4 flex items-center gap-2">
          <Badge variant="outline" className="bg-green-500/10 text-green-400 border-green-500/50">
            <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse mr-2" />
            Live Data: {totalEvents.toLocaleString()} Events
          </Badge>
          {datasetStats.dataSource === 'analyzed' ? (
            <Badge variant="outline" className="bg-purple-500/10 text-purple-400 border-purple-500/50">
              🔬 AI-Analyzed Data (Claude)
            </Badge>
          ) : datasetStats.dataSource === 'mixed' ? (
            <Badge variant="outline" className="bg-violet-500/10 text-violet-400 border-violet-500/50">
              🔬 Mixed Data: {datasetStats.analyzedCount} AI + {datasetStats.rawCount} Raw
            </Badge>
          ) : (
            <Badge variant="outline" className="bg-blue-500/10 text-blue-400 border-blue-500/50">
              📊 Raw Dataset
            </Badge>
          )}
          <Badge variant="outline" className="bg-cyan-500/10 text-cyan-400 border-cyan-500/50">
            Real-time Analysis
          </Badge>
        </div>
      )}
      {isLoading ? (
        <div className="flex flex-col items-center justify-center min-h-[400px] space-y-4">
          <LoadingSpinner size="lg" />
          <p className="text-slate-400">Loading real dataset statistics and analyzing events...</p>
          <p className="text-slate-500 text-sm">Processing comprehensive data analysis from backend...</p>
        </div>
      ) : error ? (
        <div className="flex flex-col items-center justify-center min-h-[400px] space-y-4">
          <AlertTriangle className="w-16 h-16 text-red-400" />
          <p className="text-red-400 text-lg font-semibold">Error Loading Data</p>
          <p className="text-slate-400 text-center max-w-md">{error}</p>
          <Button onClick={() => window.location.reload()} className="mt-4">
            <RotateCcw className="w-4 h-4 mr-2" />
            Retry
          </Button>
        </div>
      ) : mockEventData.length === 0 ? (
        <div className="flex flex-col items-center justify-center min-h-[400px] space-y-4">
          <AlertTriangle className="w-16 h-16 text-yellow-400" />
          <p className="text-yellow-400 text-lg font-semibold">No Data Available</p>
          <p className="text-slate-400 text-center max-w-md">
            No events found in the dataset. Please check if the dataset file exists.
          </p>
        </div>
      ) : (
        <>
          {/* Top Section - Overview Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            <Card className="stat-card">
              <CardHeader className="pb-2">
                <CardDescription className="text-xs font-medium text-slate-400 uppercase tracking-wide">
                  Total Events Processed
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="stat-number text-5xl mb-3">{totalEvents.toLocaleString()}</div>
                <div className="text-sm text-cyan-400 font-medium">+12% from last week</div>
              </CardContent>
            </Card>

            <Card className="stat-card">
              <CardHeader className="pb-2">
                <CardDescription className="text-xs font-medium text-slate-400 uppercase tracking-wide">
                  Classification Breakdown
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex items-center gap-4">
                  <div className="w-20 h-20">
                    <ResponsiveContainer width="100%" height="100%">
                      <PieChart>
                        <Pie
                          data={classificationBreakdown}
                          dataKey="value"
                          cx="50%"
                          cy="50%"
                          innerRadius={18}
                          outerRadius={38}
                          strokeWidth={0}
                        >
                          {classificationBreakdown.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={entry.fill} />
                          ))}
                        </Pie>
                      </PieChart>
                    </ResponsiveContainer>
                  </div>
                  <div className="text-sm space-y-2">
                    {classificationBreakdown.slice(0, 2).map((item, i) => (
                      <div key={i} className="flex items-center gap-2">
                        <div
                          className="w-3 h-3 rounded-full"
                          style={{ backgroundColor: item.fill }}
                        />
                        <span className="text-xs text-slate-300">{item.name}: {item.value}</span>
                      </div>
                    ))}
                    {classificationBreakdown.length > 2 && (
                      <div className="text-xs text-slate-500">+{classificationBreakdown.length - 2} more</div>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="stat-card">
              <CardHeader className="pb-2">
                <CardDescription className="text-xs font-medium text-slate-400 uppercase tracking-wide">
                  Average Confidence Score
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="stat-number text-5xl mb-3">{averageConfidence}%</div>
                <div className="text-sm text-cyan-400 font-medium">+2.1% from last week</div>
              </CardContent>
            </Card>

            <Card className={`stat-card ${anomalies > 0 ? 'border-red-500/50 bg-red-500/5' : ''}`}>
              <CardHeader className="pb-2">
                <CardDescription className="flex items-center gap-2 text-xs font-medium text-slate-400 uppercase tracking-wide">
                  Anomalies Detected
                  {anomalies > 0 && <AlertTriangle className="w-4 h-4 text-red-400" />}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className={`text-5xl mb-3 font-bold ${anomalies > 0 ? 'text-red-400' : ''} ${anomalies === 0 ? 'stat-number' : ''}`}>
                  {anomalies}
                </div>
                <div className="text-sm text-slate-400">Low confidence events</div>
              </CardContent>
            </Card>
          </div>

          {/* Middle Section - Charts */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
            {/* Left: Pie Chart */}
            <Card className="chart-card relative overflow-hidden">
              {/* Animated background gradient */}
              <div className="absolute inset-0 bg-gradient-to-br from-blue-900/20 via-purple-900/20 to-cyan-900/20 animate-pulse"></div>
              <CardHeader className="flex flex-row items-center justify-between relative z-10">
                <div>
                  <CardTitle className="section-heading">
                    <BarChart3 className="icon animate-pulse" />
                    Classification Distribution
                  </CardTitle>
                  <CardDescription className="text-slate-400">Breakdown by particle type</CardDescription>
                </div>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => exportChart('classification-distribution')}
                  className="border-slate-600 hover:bg-slate-700 hover:border-cyan-400 transition-all duration-300 hover:shadow-lg hover:shadow-cyan-400/20"
                >
                  <Download className="w-4 h-4" />
                </Button>
              </CardHeader>
              <CardContent className="relative z-10">
                <div className="h-80 relative">
                  {/* Glow effect behind chart */}
                  <div className="absolute inset-0 bg-gradient-radial from-cyan-500/10 via-transparent to-transparent animate-pulse"></div>
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <defs>
                        <filter id="glow">
                          <feGaussianBlur stdDeviation="3" result="coloredBlur" />
                          <feMerge>
                            <feMergeNode in="coloredBlur" />
                            <feMergeNode in="SourceGraphic" />
                          </feMerge>
                        </filter>
                        <linearGradient id="wimpGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                          <stop offset="0%" stopColor="#3b82f6" />
                          <stop offset="100%" stopColor="#1d4ed8" />
                        </linearGradient>
                        <linearGradient id="backgroundGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                          <stop offset="0%" stopColor="#10b981" />
                          <stop offset="100%" stopColor="#047857" />
                        </linearGradient>
                        <linearGradient id="axionGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                          <stop offset="0%" stopColor="#8b5cf6" />
                          <stop offset="100%" stopColor="#6d28d9" />
                        </linearGradient>
                        <linearGradient id="neutrinoGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                          <stop offset="0%" stopColor="#f59e0b" />
                          <stop offset="100%" stopColor="#d97706" />
                        </linearGradient>
                        <linearGradient id="anomalyGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                          <stop offset="0%" stopColor="#ef4444" />
                          <stop offset="100%" stopColor="#dc2626" />
                        </linearGradient>
                      </defs>
                      <Pie
                        data={classificationBreakdown}
                        dataKey="value"
                        nameKey="name"
                        cx="50%"
                        cy="50%"
                        outerRadius={110}
                        innerRadius={40}
                        strokeWidth={3}
                        stroke="rgba(255,255,255,0.2)"
                        filter="url(#glow)"
                        animationBegin={0}
                        animationDuration={1500}
                      >
                        {classificationBreakdown.map((entry, index) => {
                          const gradientMap = {
                            'WIMP': 'url(#wimpGradient)',
                            'Background': 'url(#backgroundGradient)',
                            'Axion': 'url(#axionGradient)',
                            'Neutrino': 'url(#neutrinoGradient)',
                            'Anomaly': 'url(#anomalyGradient)'
                          };
                          return (
                            <Cell
                              key={`cell-${index}`}
                              fill={gradientMap[entry.name as keyof typeof gradientMap] || entry.fill}
                            />
                          );
                        })}
                      </Pie>
                      <Tooltip
                        contentStyle={{
                          backgroundColor: 'rgba(30, 41, 59, 0.95)',
                          border: '1px solid #334155',
                          borderRadius: '12px',
                          color: 'white',
                          fontSize: '13px',
                          boxShadow: '0 10px 25px rgba(0, 0, 0, 0.5), 0 0 20px rgba(34, 211, 238, 0.2)',
                          backdropFilter: 'blur(10px)'
                        }}
                        formatter={(value, name) => [
                          <span style={{ color: '#22d3ee', fontWeight: 'bold' }}>{value}</span>,
                          <span style={{ color: '#cbd5e1' }}>{name}</span>
                        ]}
                      />
                      <Legend
                        wrapperStyle={{
                          color: '#cbd5e1',
                          fontSize: '13px',
                          fontWeight: '500'
                        }}
                        iconType="circle"
                        formatter={(value) => (
                          <span className="text-slate-300 font-medium">{value}</span>
                        )}
                      />
                    </PieChart>
                  </ResponsiveContainer>

                  {/* Floating particles effect */}
                  <div className="absolute top-4 left-4 w-2 h-2 bg-cyan-400 rounded-full animate-ping"></div>
                  <div className="absolute top-8 right-8 w-1 h-1 bg-blue-400 rounded-full animate-pulse"></div>
                  <div className="absolute bottom-6 left-8 w-1.5 h-1.5 bg-purple-400 rounded-full animate-bounce" style={{ animationDelay: '1s' }}></div>
                </div>
              </CardContent>
            </Card>

            {/* Right: Bar Chart */}
            <Card className="chart-card relative overflow-hidden">
              {/* Animated background gradient */}
              <div className="absolute inset-0 bg-gradient-to-bl from-green-900/20 via-orange-900/20 to-red-900/20 animate-pulse"></div>
              <CardHeader className="flex flex-row items-center justify-between relative z-10">
                <div>
                  <CardTitle className="section-heading">
                    <BarChart3 className="icon animate-pulse" />
                    Confidence Score Distribution
                  </CardTitle>
                  <CardDescription className="text-slate-400">Events by confidence level</CardDescription>
                </div>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => exportChart('confidence-distribution')}
                  className="border-slate-600 hover:bg-slate-700 hover:border-green-400 transition-all duration-300 hover:shadow-lg hover:shadow-green-400/20"
                >
                  <Download className="w-4 h-4" />
                </Button>
              </CardHeader>
              <CardContent className="relative z-10">
                <div className="h-80 relative">
                  {/* Glow effect behind chart */}
                  <div className="absolute inset-0 bg-gradient-radial from-green-500/10 via-transparent to-transparent animate-pulse"></div>
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={confidenceDistribution}>
                      <defs>
                        <filter id="barGlow">
                          <feGaussianBlur stdDeviation="3" result="coloredBlur" />
                          <feMerge>
                            <feMergeNode in="coloredBlur" />
                            <feMergeNode in="SourceGraphic" />
                          </feMerge>
                        </filter>
                        <linearGradient id="highConfidence" x1="0%" y1="0%" x2="0%" y2="100%">
                          <stop offset="0%" stopColor="#22d3ee" />
                          <stop offset="50%" stopColor="#10b981" />
                          <stop offset="100%" stopColor="#047857" />
                        </linearGradient>
                        <linearGradient id="mediumConfidence" x1="0%" y1="0%" x2="0%" y2="100%">
                          <stop offset="0%" stopColor="#fbbf24" />
                          <stop offset="50%" stopColor="#f59e0b" />
                          <stop offset="100%" stopColor="#d97706" />
                        </linearGradient>
                        <linearGradient id="lowConfidence" x1="0%" y1="0%" x2="0%" y2="100%">
                          <stop offset="0%" stopColor="#f87171" />
                          <stop offset="50%" stopColor="#ef4444" />
                          <stop offset="100%" stopColor="#dc2626" />
                        </linearGradient>
                      </defs>
                      <CartesianGrid
                        strokeDasharray="3 3"
                        stroke="rgba(51, 65, 85, 0.3)"
                        strokeWidth={1}
                      />
                      <XAxis
                        dataKey="range"
                        stroke="#94a3b8"
                        fontSize={12}
                        fontWeight={500}
                        tick={{ fill: '#cbd5e1' }}
                      />
                      <YAxis
                        stroke="#94a3b8"
                        fontSize={12}
                        fontWeight={500}
                        tick={{ fill: '#cbd5e1' }}
                      />
                      <Tooltip
                        contentStyle={{
                          backgroundColor: 'rgba(30, 41, 59, 0.95)',
                          border: '1px solid #334155',
                          borderRadius: '12px',
                          color: 'white',
                          fontSize: '13px',
                          boxShadow: '0 10px 25px rgba(0, 0, 0, 0.5), 0 0 20px rgba(34, 211, 238, 0.2)',
                          backdropFilter: 'blur(10px)'
                        }}
                        formatter={(value, name) => [
                          <span style={{ color: '#22d3ee', fontWeight: 'bold' }}>{value} events</span>,
                          <span style={{ color: '#cbd5e1' }}>Count</span>
                        ]}
                        labelFormatter={(label) => (
                          <span style={{ color: '#ffffff', fontWeight: 'bold' }}>{label}</span>
                        )}
                      />
                      <Bar
                        dataKey="count"
                        radius={[6, 6, 0, 0]}
                        stroke="rgba(255,255,255,0.3)"
                        strokeWidth={2}
                        filter="url(#barGlow)"
                        animationBegin={0}
                        animationDuration={1500}
                      >
                        {confidenceDistribution.map((entry, index) => {
                          const gradients = [
                            'url(#highConfidence)',
                            'url(#mediumConfidence)',
                            'url(#lowConfidence)'
                          ];
                          return (
                            <Cell
                              key={`cell-${index}`}
                              fill={gradients[index] || entry.fill}
                            />
                          );
                        })}
                      </Bar>
                    </BarChart>
                  </ResponsiveContainer>

                  {/* Floating particles effect */}
                  <div className="absolute top-6 right-6 w-2 h-2 bg-green-400 rounded-full animate-ping"></div>
                  <div className="absolute top-12 left-12 w-1 h-1 bg-yellow-400 rounded-full animate-pulse" style={{ animationDelay: '0.5s' }}></div>
                  <div className="absolute bottom-8 right-12 w-1.5 h-1.5 bg-red-400 rounded-full animate-bounce" style={{ animationDelay: '1.5s' }}></div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Bottom Section - Interactive Scatter Plot */}
          <Card className="chart-card relative overflow-hidden">
            {/* Animated background gradient */}
            <div className="absolute inset-0 bg-gradient-to-tr from-violet-900/20 via-indigo-900/20 to-blue-900/20 animate-pulse" style={{ animationDuration: '4s' }}></div>
            <CardHeader className="flex flex-row items-center justify-between relative z-10">
              <div>
                <CardTitle className="section-heading">
                  <Star className="icon animate-spin" style={{ animationDuration: '8s' }} />
                  Energy vs S2/S1 Ratio Analysis
                </CardTitle>
                <CardDescription className="text-slate-400">Interactive scatter plot with particle type filtering</CardDescription>
              </div>
              <Button
                size="sm"
                variant="outline"
                onClick={() => exportChart('scatter-plot')}
                className="border-slate-600 hover:bg-slate-700 hover:border-violet-400 transition-all duration-300 hover:shadow-lg hover:shadow-violet-400/20"
              >
                <Download className="w-4 h-4" />
              </Button>
            </CardHeader>
            <CardContent className="relative z-10">
              {/* Filter toggles */}
              <div className="flex flex-wrap gap-3 mb-6">
                {Object.entries(classificationColors).map(([type, color]) => (
                  <Button
                    key={type}
                    size="sm"
                    variant={visibleTypes[type] ? "default" : "outline"}
                    onClick={() => toggleType(type)}
                    className={`filter-badge flex items-center gap-2 transition-all duration-200 ${visibleTypes[type]
                      ? 'active shadow-lg'
                      : 'inactive border-slate-600 hover:bg-slate-700'
                      }`}
                    style={visibleTypes[type] ? {
                      backgroundColor: color,
                      borderColor: color,
                      boxShadow: `0 2px 8px ${color}40`
                    } : {}}
                  >
                    {visibleTypes[type] ? <Eye className="w-3 h-3" /> : <EyeOff className="w-3 h-3" />}
                    {type}
                  </Button>
                ))}
              </div>

              <div className="h-96 relative">
                {/* Glow effect behind chart */}
                <div className="absolute inset-0 bg-gradient-radial from-violet-500/10 via-blue-500/10 to-transparent animate-pulse" style={{ animationDuration: '3s' }}></div>
                <ResponsiveContainer width="100%" height="100%">
                  <ScatterChart
                    data={scatterData}
                    margin={{ top: 20, right: 20, bottom: 20, left: 20 }}
                  >
                    <defs>
                      <filter id="interactiveGlow">
                        <feGaussianBlur stdDeviation="2" result="coloredBlur" />
                        <feMerge>
                          <feMergeNode in="coloredBlur" />
                          <feMergeNode in="SourceGraphic" />
                        </feMerge>
                      </filter>
                      {Object.entries(classificationColors).map(([type, color]) => (
                        <radialGradient key={type} id={`gradient-${type}`} cx="50%" cy="50%" r="50%">
                          <stop offset="0%" stopColor={color} stopOpacity={1} />
                          <stop offset="70%" stopColor={color} stopOpacity={0.8} />
                          <stop offset="100%" stopColor={color} stopOpacity={0.6} />
                        </radialGradient>
                      ))}
                    </defs>
                    <CartesianGrid
                      strokeDasharray="3 3"
                      stroke="rgba(51, 65, 85, 0.3)"
                      strokeWidth={1}
                    />
                    <XAxis
                      type="number"
                      dataKey="energy"
                      name="Energy (keV)"
                      stroke="#94a3b8"
                      fontSize={12}
                      fontWeight={500}
                      tick={{ fill: '#cbd5e1' }}
                    />
                    <YAxis
                      type="number"
                      dataKey="s2s1Ratio"
                      name="S2/S1 Ratio"
                      stroke="#94a3b8"
                      fontSize={12}
                      fontWeight={500}
                      tick={{ fill: '#cbd5e1' }}
                    />
                    <Tooltip content={<CustomTooltip />} />
                    <Legend
                      wrapperStyle={{
                        color: '#cbd5e1',
                        fontSize: '13px',
                        fontWeight: '500'
                      }}
                    />
                    {Object.entries(classificationColors).map(([type, color]) => (
                      <Scatter
                        key={type}
                        name={type}
                        data={scatterData.filter(d => d.classification === type)}
                        fill={`url(#gradient-${type})`}
                        strokeWidth={2}
                        stroke="rgba(255,255,255,0.4)"
                        r={8}
                        filter="url(#interactiveGlow)"
                        animationBegin={Object.keys(classificationColors).indexOf(type) * 200}
                        animationDuration={2000}
                      />
                    ))}
                  </ScatterChart>
                </ResponsiveContainer>

                {/* Floating particles effect */}
                <div className="absolute top-8 right-12 w-2 h-2 bg-violet-400 rounded-full animate-ping"></div>
                <div className="absolute top-20 left-16 w-1 h-1 bg-indigo-400 rounded-full animate-pulse" style={{ animationDelay: '1.2s' }}></div>
                <div className="absolute bottom-16 right-8 w-1.5 h-1.5 bg-blue-400 rounded-full animate-bounce" style={{ animationDelay: '2.1s' }}></div>
                <div className="absolute bottom-8 left-12 w-1 h-1 bg-purple-400 rounded-full animate-ping" style={{ animationDelay: '0.8s' }}></div>
                <div className="absolute top-1/2 right-4 w-1 h-1 bg-cyan-400 rounded-full animate-pulse" style={{ animationDelay: '1.8s' }}></div>
              </div>
            </CardContent>
          </Card>

          {/* Anomaly Hub Section */}
          <div className="mt-8">
            <Card className="chart-card">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle className="section-heading">
                      <AlertTriangle className="icon text-yellow-400" />
                      Anomaly Hub
                    </CardTitle>
                    <CardDescription className="text-slate-400">Detected anomalies requiring investigation</CardDescription>
                  </div>
                  <Badge className="badge-danger">
                    <AlertTriangle className="w-3 h-3" />
                    {openAnomalies} anomalies detected in last batch
                  </Badge>
                </div>
              </CardHeader>
              <CardContent>
                {/* Filters */}
                <div className="flex gap-4 mb-6">
                  <div className="flex items-center gap-2">
                    <Filter className="w-4 h-4 text-slate-400" />
                    <span className="text-sm text-slate-400">Filter by severity:</span>
                    <Select value={severityFilter} onValueChange={setSeverityFilter}>
                      <SelectTrigger className="w-32 border-slate-600 bg-slate-800">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent className="bg-slate-800 border-slate-600">
                        <SelectItem value="all">All</SelectItem>
                        <SelectItem value="Critical">Critical</SelectItem>
                        <SelectItem value="Moderate">Moderate</SelectItem>
                        <SelectItem value="Minor">Minor</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-sm text-slate-400">Sort by:</span>
                    <Select value={sortBy} onValueChange={setSortBy}>
                      <SelectTrigger className="w-40 border-slate-600 bg-slate-800">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent className="bg-slate-800 border-slate-600">
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
                    const scoreLevel = anomaly.score > 0.85 ? 'high' : anomaly.score > 0.7 ? 'medium' : 'low';

                    return (
                      <AccordionItem key={anomaly.id} value={anomaly.id} className="border-none">
                        <Card className={`chart-card ${config.border} border-l-4`}>
                          <AccordionTrigger className="hover:no-underline p-0">
                            <CardHeader className="w-full">
                              <div className="flex items-center justify-between w-full">
                                <div className="flex items-center gap-3">
                                  <span className="text-lg">{config.emoji}</span>
                                  <div className="text-left">
                                    <div className="flex items-center gap-2">
                                      <span className="font-semibold text-white">{anomaly.eventId}</span>
                                      <Badge className={`badge-outline-premium ${config.textColor} border-current`}>
                                        {anomaly.severity}
                                      </Badge>
                                      {status !== 'open' && (
                                        <Badge className="badge-premium text-xs">
                                          {status === 'investigating' ? 'Investigating' : 'Known'}
                                        </Badge>
                                      )}
                                    </div>
                                    <div className="text-sm text-slate-400">
                                      Anomaly Score: {anomaly.score.toFixed(2)} |
                                      Energy: {anomaly.energy} keV |
                                      S2/S1: {anomaly.s2s1Ratio}
                                    </div>
                                  </div>
                                </div>
                                <div className="text-right">
                                  <div className={`text-lg font-bold anomaly-score-badge ${scoreLevel}`}>
                                    {anomaly.score.toFixed(2)}
                                  </div>
                                  <div className="text-xs text-slate-400 mt-1">
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
                                <div className="grid grid-cols-3 gap-4 p-3 bg-slate-800/30 rounded-lg">
                                  <div>
                                    <div className="text-xs text-slate-400 mb-1">Energy</div>
                                    <div className="font-semibold text-white">{anomaly.energy} keV</div>
                                  </div>
                                  <div>
                                    <div className="text-xs text-slate-400 mb-1">S2/S1 Ratio</div>
                                    <div className="font-semibold text-white">{anomaly.s2s1Ratio}</div>
                                  </div>
                                  <div>
                                    <div className="text-xs text-slate-400 mb-1">Detection Time</div>
                                    <div className="font-semibold text-xs text-white">
                                      {new Date(anomaly.detectionTime).toLocaleString()}
                                    </div>
                                  </div>
                                </div>

                                {/* Unusual Features */}
                                <div>
                                  <div className="text-sm font-semibold mb-2 text-white">Unusual Features:</div>
                                  <div className="flex flex-wrap gap-2">
                                    {anomaly.features.map((feature, idx) => (
                                      <Badge key={idx} className="badge-outline-premium text-xs border-slate-500 text-slate-300">
                                        {feature}
                                      </Badge>
                                    ))}
                                  </div>
                                </div>

                                {/* Claude's Hypothesis */}
                                <div>
                                  <div className="text-sm font-semibold mb-2 text-white">Claude's Hypothesis:</div>
                                  <div className="text-sm text-slate-300 italic bg-slate-800/30 p-3 rounded-lg">
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
                                    className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700"
                                  >
                                    <Search className="w-3 h-3" />
                                    {status === 'investigating' ? 'Investigating...' : 'Investigate'}
                                  </Button>
                                  <Button
                                    size="sm"
                                    variant="outline"
                                    onClick={() => handleAnomalyAction(anomaly.id, 'mark-known')}
                                    disabled={status !== 'open'}
                                    className="flag-button"
                                  >
                                    <Check className="w-3 h-3" />
                                    {status === 'known' ? 'Marked as Known' : 'Flag for Review'}
                                  </Button>
                                  {status !== 'open' && (
                                    <div className="flex items-center gap-1 text-xs text-slate-400 ml-auto">
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
                  <div className="text-center py-8 text-slate-400">
                    <AlertTriangle className="w-12 h-12 mx-auto mb-4 opacity-50" />
                    <p>No anomalies found matching current filters.</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Feature Space Explorer */}
          <div className="mt-8">
            <Card className="chart-card">
              <CardHeader>
                <div className="flex justify-between items-center">
                  <CardTitle className="section-heading">
                    <Box className="icon" />
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
                        className={`transition-all duration-200 ${plot3DMode === mode
                          ? "bg-blue-600 hover:bg-blue-700 shadow-lg"
                          : "border-slate-600 hover:bg-slate-700 hover:border-blue-600"
                          }`}
                      >
                        {mode.toUpperCase()}
                      </Button>
                    ))}
                  </div>

                  {/* 3D Scatter Plot */}
                  <div
                    ref={(el) => chartRefs.current['feature-space'] = el}
                    className={`${fullScreenChart === 'feature-space'
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
                      <div className="w-3 h-3 rounded-full bg-blue-500 shadow-lg"></div>
                      <span className="text-slate-300">WIMP Candidates</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="w-3 h-3 rounded-full bg-red-500 shadow-lg"></div>
                      <span className="text-slate-300">Neutron Events</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="w-3 h-3 rounded-full bg-green-500 shadow-lg"></div>
                      <span className="text-slate-300">Background</span>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Timeline View */}
          <div className="mt-8">
            <Card className="chart-card relative overflow-hidden">
              {/* Animated background gradient */}
              <div className="absolute inset-0 bg-gradient-to-br from-purple-900/20 via-pink-900/20 to-red-900/20 animate-pulse" style={{ animationDuration: '5s' }}></div>
              <CardHeader className="relative z-10">
                <div className="flex justify-between items-center">
                  <CardTitle className="section-heading">
                    <Clock className="icon text-purple-400 animate-pulse" />
                    Timeline View
                  </CardTitle>
                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => downloadChart('timeline', 'timeline-plot')}
                      className="border-slate-600 hover:bg-slate-700 hover:border-purple-400 transition-all duration-300 hover:shadow-lg hover:shadow-purple-400/20"
                    >
                      <Download className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => toggleFullScreen('timeline')}
                      className="border-slate-600 hover:bg-slate-700 hover:border-pink-400 transition-all duration-300 hover:shadow-lg hover:shadow-pink-400/20"
                    >
                      <Maximize2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="relative z-10">
                <div className="space-y-4">
                  {/* Timeline Controls */}
                  <div className="flex items-center gap-4 mb-4">
                    <span className="text-sm text-slate-300 font-medium">Time Range:</span>
                    <div className="flex-1 px-4">
                      <input
                        type="range"
                        min="0"
                        max="100"
                        value={timelineRange[0]}
                        onChange={(e) => setTimelineRange([parseInt(e.target.value), timelineRange[1]])}
                        className="w-full h-2 bg-slate-600 rounded-lg appearance-none cursor-pointer slider-thumb"
                      />
                    </div>
                    <span className="text-xs text-slate-400 w-20 font-mono">
                      {timelineRange[0]}% - {timelineRange[1]}%
                    </span>
                  </div>

                  {/* Timeline Plot */}
                  <div
                    ref={(el) => chartRefs.current['timeline'] = el}
                    className={`${fullScreenChart === 'timeline'
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
                    <div
                      className="stat-card"
                      style={{ animationDelay: '0.1s' }}
                    >
                      <div className="stat-number text-2xl">
                        {mockEventData.filter(d => d.type === 'WIMP').length}
                      </div>
                      <div className="text-xs text-slate-400 font-medium uppercase tracking-wide mt-2">WIMP Events</div>
                    </div>
                    <div
                      className="stat-card"
                      style={{ animationDelay: '0.25s' }}
                    >
                      <div className="stat-number text-2xl">
                        {mockEventData.filter(d => d.confidence < 70).length}
                      </div>
                      <div className="text-xs text-slate-400 font-medium uppercase tracking-wide mt-2">Low Confidence</div>
                    </div>
                    <div
                      className="stat-card"
                      style={{ animationDelay: '0.4s' }}
                    >
                      <div className="stat-number text-2xl">
                        {(mockEventData.reduce((acc, d) => acc + d.confidence, 0) / mockEventData.length).toFixed(1)}%
                      </div>
                      <div className="text-xs text-slate-400 font-medium uppercase tracking-wide mt-2">Avg Confidence</div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Distribution Histograms */}
          <div className="mt-8">
            <Card className="chart-card">
              <CardHeader>
                <div className="flex justify-between items-center">
                  <CardTitle className="section-heading">
                    <BarChart3 className="icon text-green-400" />
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
                  <div className="space-y-3">
                    <h4 className="text-sm font-semibold text-slate-300">Energy Distribution (keV)</h4>
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
                            opacity: 0.8,
                            marker: {
                              color: '#22d3ee',
                              line: { color: '#0891b2', width: 1 }
                            },
                            xbins: { size: 5 }
                          },
                          {
                            x: mockEventData.filter(d => d.type === 'Neutrino').map(d => d.energy),
                            type: 'histogram',
                            name: 'Neutrino',
                            opacity: 0.8,
                            marker: {
                              color: '#a855f7',
                              line: { color: '#9333ea', width: 1 }
                            },
                            xbins: { size: 5 }
                          },
                          {
                            x: mockEventData.filter(d => d.type === 'Background').map(d => d.energy),
                            type: 'histogram',
                            name: 'Background',
                            opacity: 0.8,
                            marker: {
                              color: '#ef4444',
                              line: { color: '#dc2626', width: 1 }
                            },
                            xbins: { size: 5 }
                          }
                        ]}
                        layout={{
                          paper_bgcolor: 'transparent',
                          plot_bgcolor: 'transparent',
                          font: { color: '#e2e8f0', size: 10 },
                          xaxis: {
                            title: 'Energy (keV)',
                            gridcolor: 'rgba(51, 65, 85, 0.3)',
                            zerolinecolor: '#64748b'
                          },
                          yaxis: {
                            title: 'Count',
                            gridcolor: 'rgba(51, 65, 85, 0.3)',
                            zerolinecolor: '#64748b'
                          },
                          margin: { t: 20, r: 20, b: 40, l: 40 },
                          legend: {
                            font: { color: '#cbd5e1', size: 10 },
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
                    <div className="text-xs text-slate-400 text-center bg-slate-800/30 p-2 rounded">
                      <span className="font-semibold">Mean:</span> {(mockEventData.reduce((acc, d) => acc + d.energy, 0) / mockEventData.length).toFixed(1)} keV
                    </div>
                  </div>

                  {/* S1 Distribution */}
                  <div className="space-y-3">
                    <h4 className="text-sm font-semibold text-slate-300">S1 Signal Distribution</h4>
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
                            opacity: 0.8,
                            marker: {
                              color: '#3b82f6',
                              line: { color: '#2563eb', width: 1 }
                            },
                            xbins: { size: 20 }
                          },
                          {
                            x: mockEventData.filter(d => d.type === 'Neutrino').map(d => d.s1),
                            type: 'histogram',
                            name: 'Neutrino',
                            opacity: 0.8,
                            marker: {
                              color: '#a855f7',
                              line: { color: '#9333ea', width: 1 }
                            },
                            xbins: { size: 20 }
                          },
                          {
                            x: mockEventData.filter(d => d.type === 'Background').map(d => d.s1),
                            type: 'histogram',
                            name: 'Background',
                            opacity: 0.8,
                            marker: {
                              color: '#ef4444',
                              line: { color: '#dc2626', width: 1 }
                            },
                            xbins: { size: 20 }
                          }
                        ]}
                        layout={{
                          paper_bgcolor: 'transparent',
                          plot_bgcolor: 'transparent',
                          font: { color: '#e2e8f0', size: 10 },
                          xaxis: {
                            title: 'S1 Signal',
                            gridcolor: 'rgba(51, 65, 85, 0.3)',
                            zerolinecolor: '#64748b'
                          },
                          yaxis: {
                            title: 'Count',
                            gridcolor: 'rgba(51, 65, 85, 0.3)',
                            zerolinecolor: '#64748b'
                          },
                          margin: { t: 20, r: 20, b: 40, l: 40 },
                          legend: {
                            font: { color: '#cbd5e1', size: 10 },
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
                    <div className="text-xs text-slate-400 text-center bg-slate-800/30 p-2 rounded">
                      <span className="font-semibold">Mean:</span> {(mockEventData.reduce((acc, d) => acc + d.s1, 0) / mockEventData.length).toFixed(1)}
                    </div>
                  </div>

                  {/* S2 Distribution */}
                  <div className="space-y-3">
                    <h4 className="text-sm font-semibold text-slate-300">S2 Signal Distribution</h4>
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
                            opacity: 0.8,
                            marker: {
                              color: '#3b82f6',
                              line: { color: '#2563eb', width: 1 }
                            },
                            xbins: { size: 500 }
                          },
                          {
                            x: mockEventData.filter(d => d.type === 'Neutrino').map(d => d.s2),
                            type: 'histogram',
                            name: 'Neutrino',
                            opacity: 0.8,
                            marker: {
                              color: '#a855f7',
                              line: { color: '#9333ea', width: 1 }
                            },
                            xbins: { size: 500 }
                          },
                          {
                            x: mockEventData.filter(d => d.type === 'Background').map(d => d.s2),
                            type: 'histogram',
                            name: 'Background',
                            opacity: 0.8,
                            marker: {
                              color: '#ef4444',
                              line: { color: '#dc2626', width: 1 }
                            },
                            xbins: { size: 500 }
                          }
                        ]}
                        layout={{
                          paper_bgcolor: 'transparent',
                          plot_bgcolor: 'transparent',
                          font: { color: '#e2e8f0', size: 10 },
                          xaxis: {
                            title: 'S2 Signal',
                            gridcolor: 'rgba(51, 65, 85, 0.3)',
                            zerolinecolor: '#64748b'
                          },
                          yaxis: {
                            title: 'Count',
                            gridcolor: 'rgba(51, 65, 85, 0.3)',
                            zerolinecolor: '#64748b'
                          },
                          margin: { t: 20, r: 20, b: 40, l: 40 },
                          legend: {
                            font: { color: '#cbd5e1', size: 10 },
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
                    <div className="text-xs text-slate-400 text-center bg-slate-800/30 p-2 rounded">
                      <span className="font-semibold">Mean:</span> {(mockEventData.reduce((acc, d) => acc + d.s2, 0) / mockEventData.length).toFixed(0)}
                    </div>
                  </div>
                </div>

                {/* Statistical Summary */}
                <div className="mt-6 grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="bg-slate-800/50 border border-slate-600 rounded-lg p-4 hover:bg-slate-700/50 transition-colors">
                    <h5 className="text-sm font-semibold text-cyan-300 mb-3 flex items-center gap-2">
                      <div className="w-2 h-2 bg-cyan-400 rounded-full"></div>
                      Energy Statistics
                    </h5>
                    <div className="space-y-2 text-xs text-slate-400">
                      <div className="flex justify-between">
                        <span>Min:</span>
                        <span className="font-mono text-white">{Math.min(...mockEventData.map(d => d.energy)).toFixed(1)} keV</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Max:</span>
                        <span className="font-mono text-white">{Math.max(...mockEventData.map(d => d.energy)).toFixed(1)} keV</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Std:</span>
                        <span className="font-mono text-white">{Math.sqrt(mockEventData.reduce((acc, d) => acc + Math.pow(d.energy - mockEventData.reduce((a, b) => a + b.energy, 0) / mockEventData.length, 2), 0) / mockEventData.length).toFixed(1)} keV</span>
                      </div>
                    </div>
                  </div>
                  <div className="bg-slate-800/50 border border-slate-600 rounded-lg p-4 hover:bg-slate-700/50 transition-colors">
                    <h5 className="text-sm font-semibold text-blue-300 mb-3 flex items-center gap-2">
                      <div className="w-2 h-2 bg-blue-400 rounded-full"></div>
                      S1 Statistics
                    </h5>
                    <div className="space-y-2 text-xs text-slate-400">
                      <div className="flex justify-between">
                        <span>Min:</span>
                        <span className="font-mono text-white">{Math.min(...mockEventData.map(d => d.s1)).toFixed(1)}</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Max:</span>
                        <span className="font-mono text-white">{Math.max(...mockEventData.map(d => d.s1)).toFixed(1)}</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Std:</span>
                        <span className="font-mono text-white">{Math.sqrt(mockEventData.reduce((acc, d) => acc + Math.pow(d.s1 - mockEventData.reduce((a, b) => a + b.s1, 0) / mockEventData.length, 2), 0) / mockEventData.length).toFixed(1)}</span>
                      </div>
                    </div>
                  </div>
                  <div className="bg-slate-800/50 border border-slate-600 rounded-lg p-4 hover:bg-slate-700/50 transition-colors">
                    <h5 className="text-sm font-semibold text-purple-300 mb-3 flex items-center gap-2">
                      <div className="w-2 h-2 bg-purple-400 rounded-full"></div>
                      S2 Statistics
                    </h5>
                    <div className="space-y-2 text-xs text-slate-400">
                      <div className="flex justify-between">
                        <span>Min:</span>
                        <span className="font-mono text-white">{Math.min(...mockEventData.map(d => d.s2)).toFixed(0)}</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Max:</span>
                        <span className="font-mono text-white">{Math.max(...mockEventData.map(d => d.s2)).toFixed(0)}</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Std:</span>
                        <span className="font-mono text-white">{Math.sqrt(mockEventData.reduce((acc, d) => acc + Math.pow(d.s2 - mockEventData.reduce((a, b) => a + b.s2, 0) / mockEventData.length, 2), 0) / mockEventData.length).toFixed(0)}</span>
                      </div>
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
        </>
      )}
    </PageLayout>
  );
};

export default ResultsDashboard;
