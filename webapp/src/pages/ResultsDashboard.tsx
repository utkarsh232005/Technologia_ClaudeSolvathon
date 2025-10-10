import { useState } from 'react';
import PageLayout from '@/components/PageLayout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
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
import { Download, Eye, EyeOff, AlertTriangle } from 'lucide-react';

// Mock data for demonstrations
const mockEventData = [
  { id: 1, energy: 12.5, s2s1Ratio: 7.1, classification: 'WIMP', confidence: 87 },
  { id: 2, energy: 8.2, s2s1Ratio: 1.5, classification: 'Background', confidence: 92 },
  { id: 3, energy: 15.3, s2s1Ratio: 25.2, classification: 'Axion', confidence: 76 },
  { id: 4, energy: 22.1, s2s1Ratio: 45.8, classification: 'Neutrino', confidence: 68 },
  { id: 5, energy: 9.8, s2s1Ratio: 2.1, classification: 'Background', confidence: 89 },
  { id: 6, energy: 18.7, s2s1Ratio: 12.4, classification: 'WIMP', confidence: 82 },
  { id: 7, energy: 35.2, s2s1Ratio: 78.3, classification: 'Neutrino', confidence: 71 },
  { id: 8, energy: 14.1, s2s1Ratio: 18.9, classification: 'Axion', confidence: 79 },
  { id: 9, energy: 6.5, s2s1Ratio: 1.8, classification: 'Background', confidence: 95 },
  { id: 10, energy: 11.3, s2s1Ratio: 8.7, classification: 'WIMP', confidence: 84 },
];

const classificationColors = {
  'Background': '#10b981', // green
  'WIMP': '#3b82f6', // blue
  'Axion': '#8b5cf6', // purple
  'Neutrino': '#f59e0b', // orange
};

const ResultsDashboard = () => {
  const [visibleTypes, setVisibleTypes] = useState<{[key: string]: boolean}>({
    'Background': true,
    'WIMP': true,
    'Axion': true,
    'Neutrino': true,
  });

  // Calculate overview statistics
  const totalEvents = mockEventData.length;
  const classificationBreakdown = Object.entries(
    mockEventData.reduce((acc, event) => {
      acc[event.classification] = (acc[event.classification] || 0) + 1;
      return acc;
    }, {} as {[key: string]: number})
  ).map(([name, value]) => ({ name, value, fill: classificationColors[name as keyof typeof classificationColors] }));

  const averageConfidence = Math.round(
    mockEventData.reduce((sum, event) => sum + event.confidence, 0) / totalEvents
  );

  const anomalies = mockEventData.filter(event => event.confidence < 70).length;

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
  const scatterData = mockEventData.filter(event => visibleTypes[event.classification]);

  const toggleType = (type: string) => {
    setVisibleTypes(prev => ({ ...prev, [type]: !prev[type] }));
  };

  const exportChart = (chartName: string) => {
    // Mock export functionality
    console.log(`Exporting ${chartName} chart...`);
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
    </PageLayout>
  );
};

export default ResultsDashboard;
