import { useState } from 'react';
import PageLayout from '@/components/PageLayout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Progress } from '@/components/ui/progress';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { Upload, Brain, CheckCircle, Flag, ChevronDown, Copy, ChevronRight } from 'lucide-react';

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

const EventClassifier = () => {
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
    </PageLayout>
  );
};

export default EventClassifier;
