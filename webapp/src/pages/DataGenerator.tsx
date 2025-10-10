import { useState } from 'react';
import PageLayout from '@/components/PageLayout';
import DataTable, { EventData } from '@/components/DataTable';
import { LoadingSpinner, ProgressBar } from '@/components/LoadingComponents';
import { showToast } from '@/lib/toast';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Zap, Download, RotateCcw } from 'lucide-react';

const DataGenerator = () => {
  const [config, setConfig] = useState({
    numEvents: 100,
    energyMin: 1,
    energyMax: 50,
    wimpRatio: 0.1,
    backgroundRatio: 0.6,
    noiseLevel: 0.05
  });

  const [generatedData, setGeneratedData] = useState<EventData[]>([]);
  const [isGenerating, setIsGenerating] = useState(false);

  const generateSyntheticData = async () => {
    setIsGenerating(true);
    showToast.loading('Generating synthetic data...');
    
    try {
      // Simulate generation delay
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      const events: EventData[] = [];
    
    for (let i = 1; i <= config.numEvents; i++) {
      // Random event type based on ratios
      const rand = Math.random();
      let type: string;
      if (rand < config.wimpRatio) {
        type = 'WIMP';
      } else if (rand < config.wimpRatio + config.backgroundRatio) {
        type = 'Background';
      } else if (rand < config.wimpRatio + config.backgroundRatio + 0.15) {
        type = 'Axion';
      } else {
        type = 'Neutrino';
      }

      // Generate realistic parameters based on type
      let energy: number;
      let s1: number;
      let s2: number;
      let confidence: number;

      switch (type) {
        case 'WIMP':
          energy = Math.random() * 15 + 5; // 5-20 keV
          s1 = Math.floor(Math.random() * 60 + 30);
          s2 = Math.floor(s1 * (Math.random() * 15 + 5)); // Higher S2/S1
          confidence = Math.floor(Math.random() * 20 + 75); // 75-95%
          break;
        case 'Background':
          energy = Math.random() * (config.energyMax - config.energyMin) + config.energyMin;
          s1 = Math.floor(Math.random() * 150 + 50);
          s2 = Math.floor(s1 * (Math.random() * 3 + 1)); // Lower S2/S1
          confidence = Math.floor(Math.random() * 20 + 80); // 80-100%
          break;
        case 'Axion':
          energy = Math.random() * 20 + 10; // 10-30 keV
          s1 = Math.floor(Math.random() * 80 + 40);
          s2 = Math.floor(s1 * (Math.random() * 30 + 10)); // Variable S2/S1
          confidence = Math.floor(Math.random() * 25 + 65); // 65-90%
          break;
        case 'Neutrino':
          energy = Math.random() * 30 + 15; // 15-45 keV
          s1 = Math.floor(Math.random() * 120 + 60);
          s2 = Math.floor(s1 * (Math.random() * 80 + 20)); // Very high S2/S1
          confidence = Math.floor(Math.random() * 20 + 60); // 60-80%
          break;
        default:
          energy = Math.random() * config.energyMax;
          s1 = Math.floor(Math.random() * 100 + 50);
          s2 = Math.floor(s1 * (Math.random() * 10 + 1));
          confidence = Math.floor(Math.random() * 40 + 60);
      }

      events.push({
        id: `SYN-${String(i).padStart(3, '0')}`,
        energy: Number(energy.toFixed(1)),
        s1,
        s2,
        s2s1Ratio: Number((s2 / s1).toFixed(2)),
        type,
        confidence
      });
    }

    setGeneratedData(events);
    showToast.success(`Successfully generated ${events.length} synthetic events`);
    } catch (error) {
      showToast.error('Failed to generate synthetic data');
      console.error('Generation error:', error);
    } finally {
      setIsGenerating(false);
    }
  };

  const resetData = () => {
    setGeneratedData([]);
  };

  const handleExport = (events: EventData[]) => {
    const csvContent = [
      'Event ID,Energy (keV),S1 (PE),S2 (PE),S2/S1 Ratio,Type,Confidence (%)',
      ...events.map(e => `${e.id},${e.energy},${e.s1},${e.s2},${e.s2s1Ratio},${e.type},${e.confidence}`)
    ].join('\n');
    
    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'synthetic_events.csv';
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <PageLayout
      title="Data Generator"
      description="Generate synthetic WIMP interaction events with realistic detector responses"
    >
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
        <Card className="backdrop-blur-md bg-card/50 border-white/10">
          <CardHeader>
            <CardTitle>Event Configuration</CardTitle>
            <CardDescription>Configure the parameters for synthetic event generation</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label htmlFor="numEvents">Number of Events</Label>
              <Input
                id="numEvents"
                type="number"
                value={config.numEvents}
                onChange={(e) => setConfig(prev => ({ ...prev, numEvents: parseInt(e.target.value) || 100 }))}
                placeholder="100"
              />
            </div>
            
            <div>
              <Label>Energy Range (keV)</Label>
              <div className="grid grid-cols-2 gap-2 mt-2">
                <Input
                  type="number"
                  value={config.energyMin}
                  onChange={(e) => setConfig(prev => ({ ...prev, energyMin: parseFloat(e.target.value) || 1 }))}
                  placeholder="Min"
                />
                <Input
                  type="number"
                  value={config.energyMax}
                  onChange={(e) => setConfig(prev => ({ ...prev, energyMax: parseFloat(e.target.value) || 50 }))}
                  placeholder="Max"
                />
              </div>
            </div>

            <div>
              <Label>Event Type Distribution</Label>
              <div className="space-y-2 mt-2">
                <div className="flex items-center justify-between">
                  <span className="text-sm">WIMP Events</span>
                  <span className="text-sm font-mono">{Math.round(config.wimpRatio * 100)}%</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm">Background Events</span>
                  <span className="text-sm font-mono">{Math.round(config.backgroundRatio * 100)}%</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm">Other Events</span>
                  <span className="text-sm font-mono">{Math.round((1 - config.wimpRatio - config.backgroundRatio) * 100)}%</span>
                </div>
              </div>
            </div>

            <div className="space-y-2">
              <Button 
                onClick={generateSyntheticData}
                disabled={isGenerating}
                className="w-full bg-gradient-to-r from-primary to-secondary hover:opacity-90"
              >
                {isGenerating ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin mr-2" />
                    Generating...
                  </>
                ) : (
                  <>
                    <Zap className="w-4 h-4 mr-2" />
                    Generate Events
                  </>
                )}
              </Button>
              
              {generatedData.length > 0 && (
                <Button
                  onClick={resetData}
                  variant="outline"
                  className="w-full"
                >
                  <RotateCcw className="w-4 h-4 mr-2" />
                  Reset Data
                </Button>
              )}
            </div>
          </CardContent>
        </Card>

        <Card className="backdrop-blur-md bg-card/50 border-white/10">
          <CardHeader>
            <CardTitle>Generation Statistics</CardTitle>
            <CardDescription>Overview of generated event data</CardDescription>
          </CardHeader>
          <CardContent>
            {generatedData.length > 0 ? (
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="text-center p-3 bg-muted/10 rounded-lg">
                    <div className="text-2xl font-bold text-primary">{generatedData.length}</div>
                    <div className="text-sm text-muted-foreground">Total Events</div>
                  </div>
                  <div className="text-center p-3 bg-muted/10 rounded-lg">
                    <div className="text-2xl font-bold text-blue-400">
                      {generatedData.filter(e => e.type === 'WIMP').length}
                    </div>
                    <div className="text-sm text-muted-foreground">WIMP Candidates</div>
                  </div>
                </div>

                <div className="space-y-2">
                  <div className="text-sm font-semibold">Event Type Breakdown:</div>
                  {['WIMP', 'Background', 'Axion', 'Neutrino'].map(type => {
                    const count = generatedData.filter(e => e.type === type).length;
                    const percentage = Math.round((count / generatedData.length) * 100);
                    return (
                      <div key={type} className="flex items-center justify-between text-sm">
                        <span>{type}</span>
                        <span className="font-mono">{count} ({percentage}%)</span>
                      </div>
                    );
                  })}
                </div>

                <Button
                  onClick={() => handleExport(generatedData)}
                  variant="outline"
                  className="w-full"
                >
                  <Download className="w-4 h-4 mr-2" />
                  Export All Data
                </Button>
              </div>
            ) : (
              <div className="text-center text-muted-foreground py-8">
                <Zap className="w-12 h-12 mx-auto mb-4 opacity-50" />
                <p>Generate events to see statistics</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Generated Data Table */}
      {generatedData.length > 0 && (
        <DataTable
          data={generatedData}
          title="Generated Synthetic Events"
          onViewDetails={(event) => console.log('View details:', event)}
          onEdit={(event) => console.log('Edit event:', event)}
          onFlag={(event) => console.log('Flag event:', event)}
          onExport={handleExport}
        />
      )}
    </PageLayout>
  );
};

export default DataGenerator;
