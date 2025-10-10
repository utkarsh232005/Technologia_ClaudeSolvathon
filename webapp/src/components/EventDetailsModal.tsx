import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { 
  X, 
  Download, 
  GitCompare, 
  RotateCcw, 
  ChevronDown, 
  ChevronRight,
  Copy,
  CheckCircle,
  AlertTriangle 
} from 'lucide-react';
import { EventData } from './DataTable';

interface EventDetailsModalProps {
  isOpen: boolean;
  onClose: () => void;
  event: EventData | null;
  onExport?: (event: EventData) => void;
  onCompare?: (event: EventData) => void;
  onReClassify?: (event: EventData) => void;
}

const typicalRanges = {
  energy: { min: 1, max: 50, unit: 'keV' },
  s1: { min: 20, max: 200, unit: 'PE' },
  s2: { min: 50, max: 5000, unit: 'PE' },
  s2s1Ratio: { min: 1, max: 100, unit: '' },
  confidence: { min: 50, max: 100, unit: '%' }
};

const typeColors = {
  'WIMP': 'bg-blue-500/20 text-blue-400 border-blue-500/50',
  'Background': 'bg-green-500/20 text-green-400 border-green-500/50',
  'Axion': 'bg-purple-500/20 text-purple-400 border-purple-500/50',
  'Neutrino': 'bg-orange-500/20 text-orange-400 border-orange-500/50',
  'Anomaly': 'bg-red-500/20 text-red-400 border-red-500/50',
};

// Mock feature importance data
const getFeatureImportance = (event: EventData) => [
  { feature: 'S2/S1 Ratio', importance: event.type === 'WIMP' ? 0.85 : 0.65, value: event.s2s1Ratio },
  { feature: 'Energy', importance: event.type === 'Background' ? 0.75 : 0.45, value: event.energy },
  { feature: 'S1 Signal', importance: 0.35, value: event.s1 },
  { feature: 'S2 Signal', importance: 0.25, value: event.s2 },
  { feature: 'Position', importance: 0.15, value: 'Fiducial' }
];

// Mock similar events data
const getSimilarEvents = (event: EventData): Array<EventData & { similarity: number }> => [
  {
    id: 'EVT-998',
    energy: event.energy + (Math.random() - 0.5) * 2,
    s1: event.s1 + Math.floor((Math.random() - 0.5) * 20),
    s2: event.s2 + Math.floor((Math.random() - 0.5) * 100),
    s2s1Ratio: 0, // Will be calculated
    type: event.type,
    confidence: event.confidence + Math.floor((Math.random() - 0.5) * 10),
    similarity: 0.94
  },
  {
    id: 'EVT-1156',
    energy: event.energy + (Math.random() - 0.5) * 3,
    s1: event.s1 + Math.floor((Math.random() - 0.5) * 25),
    s2: event.s2 + Math.floor((Math.random() - 0.5) * 150),
    s2s1Ratio: 0,
    type: event.type,
    confidence: event.confidence + Math.floor((Math.random() - 0.5) * 15),
    similarity: 0.87
  },
  {
    id: 'EVT-2341',
    energy: event.energy + (Math.random() - 0.5) * 4,
    s1: event.s1 + Math.floor((Math.random() - 0.5) * 30),
    s2: event.s2 + Math.floor((Math.random() - 0.5) * 200),
    s2s1Ratio: 0,
    type: event.type,
    confidence: event.confidence + Math.floor((Math.random() - 0.5) * 20),
    similarity: 0.82
  }
].map(e => ({ ...e, s2s1Ratio: Number((e.s2 / e.s1).toFixed(2)) }));

export const EventDetailsModal = ({
  isOpen,
  onClose,
  event,
  onExport,
  onCompare,
  onReClassify
}: EventDetailsModalProps) => {
  const [expandedSections, setExpandedSections] = useState<{[key: string]: boolean}>({});

  if (!event) return null;

  const isUnusualValue = (value: number, field: keyof typeof typicalRanges) => {
    const range = typicalRanges[field];
    return value < range.min || value > range.max;
  };

  const toggleSection = (section: string) => {
    setExpandedSections(prev => ({
      ...prev,
      [section]: !prev[section]
    }));
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
  };

  const featureImportance = getFeatureImportance(event);
  const similarEvents = getSimilarEvents(event);

  const generateReasoningTree = () => {
    return `Event Classification Analysis for ${event.id}:
├─ Step 1: Energy Analysis
│  ├─ Recoil energy: ${event.energy} keV (${event.energy < 20 ? 'low-energy regime' : 'high-energy regime'})
│  └─ Within ${event.type} expected range
├─ Step 2: Signal Discrimination
│  ├─ S2/S1 ratio: ${event.s2s1Ratio} (${event.s2s1Ratio < 10 ? 'nuclear recoil band' : 'electronic recoil region'})
│  └─ S1: ${event.s1} PE, S2: ${event.s2} PE
├─ Step 3: Statistical Analysis
│  ├─ Feature vector within ${event.type} distribution
│  └─ Likelihood ratio: ${(event.confidence / 100).toFixed(3)}
└─ Conclusion: ${event.type} classification (${event.confidence}% confidence)`;
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-6xl max-h-[90vh] overflow-hidden backdrop-blur-md bg-background/95 border-white/20">
        <DialogHeader className="pb-4">
          <DialogTitle className="text-xl font-bold">Event #{event.id} Details</DialogTitle>
        </DialogHeader>

        <div className="grid grid-cols-5 gap-6 h-[70vh]">
          {/* Left Column - Event Parameters (60%) */}
          <div className="col-span-3 space-y-4 overflow-y-auto">
            <Card className="bg-card/50 border-white/10">
              <CardHeader>
                <CardTitle className="text-sm">Event Parameters</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 gap-4">
                  {/* Energy */}
                  <div className={`p-3 rounded-lg border ${
                    isUnusualValue(event.energy, 'energy') 
                      ? 'bg-yellow-500/10 border-yellow-500/50' 
                      : 'bg-muted/20 border-white/10'
                  }`}>
                    <div className="text-xs text-muted-foreground">Recoil Energy</div>
                    <div className="text-lg font-mono font-bold">{event.energy}</div>
                    <div className="text-xs text-muted-foreground">keV</div>
                    <div className="text-xs mt-1">
                      Typical: {typicalRanges.energy.min}-{typicalRanges.energy.max} keV
                    </div>
                  </div>

                  {/* S1 Signal */}
                  <div className={`p-3 rounded-lg border ${
                    isUnusualValue(event.s1, 's1') 
                      ? 'bg-yellow-500/10 border-yellow-500/50' 
                      : 'bg-muted/20 border-white/10'
                  }`}>
                    <div className="text-xs text-muted-foreground">S1 Signal</div>
                    <div className="text-lg font-mono font-bold">{event.s1}</div>
                    <div className="text-xs text-muted-foreground">PE</div>
                    <div className="text-xs mt-1">
                      Typical: {typicalRanges.s1.min}-{typicalRanges.s1.max} PE
                    </div>
                  </div>

                  {/* S2 Signal */}
                  <div className={`p-3 rounded-lg border ${
                    isUnusualValue(event.s2, 's2') 
                      ? 'bg-yellow-500/10 border-yellow-500/50' 
                      : 'bg-muted/20 border-white/10'
                  }`}>
                    <div className="text-xs text-muted-foreground">S2 Signal</div>
                    <div className="text-lg font-mono font-bold">{event.s2}</div>
                    <div className="text-xs text-muted-foreground">PE</div>
                    <div className="text-xs mt-1">
                      Typical: {typicalRanges.s2.min}-{typicalRanges.s2.max} PE
                    </div>
                  </div>

                  {/* S2/S1 Ratio */}
                  <div className={`p-3 rounded-lg border ${
                    isUnusualValue(event.s2s1Ratio, 's2s1Ratio') 
                      ? 'bg-yellow-500/10 border-yellow-500/50' 
                      : 'bg-muted/20 border-white/10'
                  }`}>
                    <div className="text-xs text-muted-foreground">S2/S1 Ratio</div>
                    <div className="text-lg font-mono font-bold">{event.s2s1Ratio}</div>
                    <div className="text-xs text-muted-foreground">ratio</div>
                    <div className="text-xs mt-1">
                      Typical: {typicalRanges.s2s1Ratio.min}-{typicalRanges.s2s1Ratio.max}
                    </div>
                  </div>

                  {/* Additional Parameters */}
                  <div className="p-3 rounded-lg bg-muted/20 border border-white/10">
                    <div className="text-xs text-muted-foreground">Position X</div>
                    <div className="text-lg font-mono font-bold">2.1</div>
                    <div className="text-xs text-muted-foreground">cm</div>
                    <div className="text-xs mt-1">Fiducial volume</div>
                  </div>

                  <div className="p-3 rounded-lg bg-muted/20 border border-white/10">
                    <div className="text-xs text-muted-foreground">Position Y</div>
                    <div className="text-lg font-mono font-bold">-1.3</div>
                    <div className="text-xs text-muted-foreground">cm</div>
                    <div className="text-xs mt-1">Fiducial volume</div>
                  </div>

                  <div className="p-3 rounded-lg bg-muted/20 border border-white/10">
                    <div className="text-xs text-muted-foreground">Position Z</div>
                    <div className="text-lg font-mono font-bold">15.7</div>
                    <div className="text-xs text-muted-foreground">cm</div>
                    <div className="text-xs mt-1">Active region</div>
                  </div>

                  <div className="p-3 rounded-lg bg-muted/20 border border-white/10">
                    <div className="text-xs text-muted-foreground">Pulse Shape</div>
                    <div className="text-lg font-mono font-bold">0.85</div>
                    <div className="text-xs text-muted-foreground">F90</div>
                    <div className="text-xs mt-1">Nuclear recoil</div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Right Column - Classification & Features (40%) */}
          <div className="col-span-2 space-y-4 overflow-y-auto">
            {/* Classification Result */}
            <Card className="bg-card/50 border-white/10">
              <CardContent className="pt-6">
                <div className="text-center space-y-4">
                  <Badge 
                    variant="outline" 
                    className={`text-lg px-4 py-2 ${typeColors[event.type as keyof typeof typeColors]}`}
                  >
                    {event.type}
                  </Badge>
                  
                  {/* Confidence Gauge */}
                  <div>
                    <div className="text-sm text-muted-foreground mb-2">Confidence</div>
                    <div className="relative w-24 h-24 mx-auto">
                      <svg className="w-24 h-24 transform -rotate-90" viewBox="0 0 100 100">
                        <circle
                          cx="50"
                          cy="50"
                          r="35"
                          stroke="currentColor"
                          strokeWidth="8"
                          fill="transparent"
                          className="text-muted/20"
                        />
                        <circle
                          cx="50"
                          cy="50"
                          r="35"
                          stroke="currentColor"
                          strokeWidth="8"
                          fill="transparent"
                          strokeDasharray={`${event.confidence * 2.2} ${100 * 2.2}`}
                          className="text-primary"
                        />
                      </svg>
                      <div className="absolute inset-0 flex items-center justify-center">
                        <span className="text-lg font-bold">{event.confidence}%</span>
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Feature Importance Chart */}
            <Card className="bg-card/50 border-white/10">
              <CardHeader>
                <CardTitle className="text-sm">Feature Importance</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {featureImportance.map((item, index) => (
                    <div key={index}>
                      <div className="flex justify-between text-xs mb-1">
                        <span>{item.feature}</span>
                        <span className="font-mono">{(item.importance * 100).toFixed(0)}%</span>
                      </div>
                      <div className="w-full bg-muted/20 rounded-full h-2">
                        <div
                          className="bg-gradient-to-r from-primary to-secondary h-2 rounded-full transition-all"
                          style={{ width: `${item.importance * 100}%` }}
                        />
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Bottom Section - Tabbed Interface */}
        <div className="mt-4">
          <Tabs defaultValue="reasoning" className="w-full">
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="reasoning">Full Reasoning</TabsTrigger>
              <TabsTrigger value="similar">Similar Events</TabsTrigger>
              <TabsTrigger value="raw">Raw JSON</TabsTrigger>
            </TabsList>
            
            <TabsContent value="reasoning" className="mt-4 max-h-48 overflow-y-auto">
              <Card className="bg-card/50 border-white/10">
                <CardContent className="pt-4">
                  <div className="flex items-center justify-between mb-3">
                    <h4 className="font-semibold">Analysis Tree</h4>
                    <Button 
                      size="sm" 
                      variant="ghost" 
                      onClick={() => copyToClipboard(generateReasoningTree())}
                    >
                      <Copy className="w-3 h-3" />
                    </Button>
                  </div>
                  <pre className="font-mono text-sm text-green-400 whitespace-pre-wrap">
                    {generateReasoningTree()}
                  </pre>
                </CardContent>
              </Card>
            </TabsContent>
            
            <TabsContent value="similar" className="mt-4 max-h-48 overflow-y-auto">
              <Card className="bg-card/50 border-white/10">
                <CardContent className="pt-4">
                  <div className="space-y-3">
                    {similarEvents.map((similarEvent, index) => (
                      <div key={index} className="flex items-center justify-between p-3 bg-muted/10 rounded-lg">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-1">
                            <span className="font-mono text-sm">{similarEvent.id}</span>
                            <Badge variant="outline" className="text-xs">
                              {similarEvent.type}
                            </Badge>
                          </div>
                          <div className="text-xs text-muted-foreground">
                            Energy: {similarEvent.energy.toFixed(1)} keV | 
                            S2/S1: {similarEvent.s2s1Ratio} | 
                            Confidence: {similarEvent.confidence}%
                          </div>
                        </div>
                        <div className="text-right">
                          <div className="text-sm font-bold text-primary">
                            {(similarEvent.similarity * 100).toFixed(0)}%
                          </div>
                          <div className="text-xs text-muted-foreground">similarity</div>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
            
            <TabsContent value="raw" className="mt-4 max-h-48 overflow-y-auto">
              <Card className="bg-card/50 border-white/10">
                <CardContent className="pt-4">
                  <div className="flex items-center justify-between mb-3">
                    <h4 className="font-semibold">Event Data</h4>
                    <Button 
                      size="sm" 
                      variant="ghost" 
                      onClick={() => copyToClipboard(JSON.stringify(event, null, 2))}
                    >
                      <Copy className="w-3 h-3" />
                    </Button>
                  </div>
                  <pre className="bg-muted/20 p-3 rounded-lg font-mono text-xs overflow-x-auto">
                    {JSON.stringify(event, null, 2)}
                  </pre>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>

        {/* Footer Buttons */}
        <div className="flex items-center justify-between pt-4 border-t border-white/10">
          <Button variant="outline" onClick={onClose}>
            <X className="w-4 h-4 mr-2" />
            Close
          </Button>
          
          <div className="flex items-center gap-2">
            <Button size="sm" variant="outline" onClick={() => onExport?.(event)}>
              <Download className="w-4 h-4 mr-2" />
              Export Event
            </Button>
            <Button size="sm" variant="outline" onClick={() => onCompare?.(event)}>
              <GitCompare className="w-4 h-4 mr-2" />
              Compare
            </Button>
            <Button size="sm" variant="outline" onClick={() => onReClassify?.(event)}>
              <RotateCcw className="w-4 h-4 mr-2" />
              Re-classify
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default EventDetailsModal;