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
import { Zap, Download, RotateCcw, Sparkles } from 'lucide-react';

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
      {/* Top section with Configuration and Statistics */}
      <div className="grid grid-cols-1 lg:grid-cols-5 gap-6 mb-8">
        {/* Event Configuration - Left side (60%) */}
        <Card className="lg:col-span-3 bg-[#1a1f2e] border-slate-600 shadow-lg rounded-xl border">
          <CardHeader className="pb-6">
            <div className="space-y-4 mb-5">
              <div className="flex items-center gap-3">
                <Sparkles className="w-5 h-5 text-cyan-400" />
                <CardTitle className="text-xl font-semibold text-white" style={{ textShadow: '0 0 15px rgba(34, 211, 238, 0.15)' }}>Event Configuration</CardTitle>
              </div>
              <div className="w-12 h-0.5 bg-gradient-to-r from-purple-500 to-cyan-400 rounded-full"></div>
              <CardDescription className="text-slate-400 text-sm leading-relaxed">Configure the parameters for synthetic event generation</CardDescription>
            </div>
          </CardHeader>
          <CardContent className="space-y-8 p-7">
            <div className="space-y-3">
              <Label htmlFor="numEvents" className="text-slate-300 text-sm font-medium flex items-center gap-2">
                Number of Events
              </Label>
              <Input
                id="numEvents"
                type="number"
                value={config.numEvents}
                onChange={(e) => setConfig(prev => ({ ...prev, numEvents: parseInt(e.target.value) || 100 }))}
                placeholder="100"
                className="bg-[#0f172a] border-[1.5px] border-slate-600 text-white placeholder:text-slate-500 font-medium rounded-md px-4 py-3 focus:border-blue-500 focus:bg-slate-800 focus:ring-3 focus:ring-blue-500/10 transition-all duration-200"
              />
            </div>
            
            <div className="space-y-3">
              <Label className="text-slate-300 text-sm font-medium">Energy Range (keV)</Label>
              <div className="grid grid-cols-2 gap-4">
                <Input
                  type="number"
                  value={config.energyMin}
                  onChange={(e) => setConfig(prev => ({ ...prev, energyMin: parseFloat(e.target.value) || 1 }))}
                  placeholder="Min"
                  className="bg-[#0f172a] border-[1.5px] border-slate-600 text-white placeholder:text-slate-500 font-medium rounded-md px-4 py-3 focus:border-blue-500 focus:bg-slate-800 focus:ring-3 focus:ring-blue-500/10 transition-all duration-200"
                />
                <Input
                  type="number"
                  value={config.energyMax}
                  onChange={(e) => setConfig(prev => ({ ...prev, energyMax: parseFloat(e.target.value) || 50 }))}
                  placeholder="Max"
                  className="bg-[#0f172a] border-[1.5px] border-slate-600 text-white placeholder:text-slate-500 font-medium rounded-md px-4 py-3 focus:border-blue-500 focus:bg-slate-800 focus:ring-3 focus:ring-blue-500/10 transition-all duration-200"
                />
              </div>
            </div>

            <div className="space-y-4">
              <Label className="text-slate-300 text-sm font-medium">Event Type Distribution</Label>
              <div className="space-y-4 bg-slate-800/50 rounded-lg p-5 border border-slate-700">
                {[
                  { name: 'WIMP Events', percentage: Math.round(config.wimpRatio * 100), color: 'from-purple-600 to-purple-400' },
                  { name: 'Background Events', percentage: Math.round(config.backgroundRatio * 100), color: 'from-blue-600 to-blue-400' },
                  { name: 'Other Events', percentage: Math.round((1 - config.wimpRatio - config.backgroundRatio) * 100), color: 'from-cyan-600 to-cyan-400' }
                ].map((item, index) => (
                  <div key={index} className="space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-slate-300 text-sm">{item.name}</span>
                      <span className="text-cyan-400 text-base font-semibold" style={{ textShadow: '0 0 10px rgba(34, 211, 238, 0.3)' }}>{item.percentage}%</span>
                    </div>
                    <div className="w-full h-2 bg-slate-700 rounded-full overflow-hidden">
                      <div 
                        className={`h-full bg-gradient-to-r ${item.color} transition-all duration-700 ease-out`}
                        style={{ width: `${item.percentage}%` }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="space-y-4 pt-2">
              <Button 
                onClick={generateSyntheticData}
                disabled={isGenerating}
                className="w-full bg-gradient-to-r from-purple-600 via-purple-500 to-blue-600 hover:from-purple-700 hover:via-purple-600 hover:to-blue-700 text-white font-semibold text-base py-4 px-6 rounded-lg shadow-[0_4px_12px_rgba(139,92,246,0.25)] hover:shadow-[0_6px_20px_rgba(139,92,246,0.35)] hover:scale-[1.02] hover:brightness-105 transition-all duration-300 ease-[cubic-bezier(0.4,0,0.2,1)] group relative overflow-hidden"
                style={{
                  backgroundSize: '200% 100%',
                  backgroundPosition: isGenerating ? '100% 0' : '0% 0'
                }}
              >
                {isGenerating ? (
                  <>
                    <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin mr-3" />
                    Generating...
                  </>
                ) : (
                  <>
                    <Sparkles className="w-5 h-5 mr-3 transition-transform duration-300 group-hover:rotate-12" />
                    Generate Events
                  </>
                )}
              </Button>
              
              {generatedData.length > 0 && (
                <Button
                  onClick={resetData}
                  className="w-full bg-transparent border-[1.5px] border-slate-500 text-slate-300 hover:border-slate-400 hover:bg-slate-700/30 hover:text-slate-200 py-4 px-6 rounded-lg font-semibold transition-all duration-300 ease-out group"
                >
                  <RotateCcw className="w-5 h-5 mr-3 transition-transform duration-300 group-hover:rotate-180" />
                  Reset Data
                </Button>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Generation Statistics - Right side (40%) */}
        <Card className="lg:col-span-2 bg-[#1a1f2e] border-slate-600 shadow-lg rounded-xl border">
          <CardHeader className="pb-6">
            <div className="space-y-4 mb-5">
              <div className="flex items-center gap-3">
                <Sparkles className="w-5 h-5 text-cyan-400" />
                <CardTitle className="text-xl font-semibold text-white" style={{ textShadow: '0 0 15px rgba(34, 211, 238, 0.15)' }}>Generation Statistics</CardTitle>
              </div>
              <div className="w-12 h-0.5 bg-gradient-to-r from-purple-500 to-cyan-400 rounded-full"></div>
              <CardDescription className="text-slate-400 text-sm leading-relaxed">Overview of generated event data</CardDescription>
            </div>
          </CardHeader>
          <CardContent className="p-7">
            {generatedData.length > 0 ? (
              <div className="space-y-8">
                <div className="grid grid-cols-1 gap-6">
                  <div className="text-center p-8 bg-slate-800/50 rounded-xl border border-slate-700 shadow-inner">
                    <div 
                      className="text-6xl font-bold bg-gradient-to-r from-cyan-400 to-blue-500 bg-clip-text text-transparent mb-3"
                      style={{ textShadow: '0 0 20px rgba(34, 211, 238, 0.2)' }}
                    >
                      {generatedData.length}
                    </div>
                    <div className="text-slate-400 text-xs uppercase tracking-wider font-medium">Total Events</div>
                  </div>
                  <div className="text-center p-8 bg-slate-800/50 rounded-xl border border-slate-700 shadow-inner">
                    <div 
                      className="text-6xl font-bold bg-gradient-to-r from-cyan-400 to-blue-500 bg-clip-text text-transparent mb-3"
                      style={{ textShadow: '0 0 20px rgba(34, 211, 238, 0.2)' }}
                    >
                      {generatedData.filter(e => e.type === 'WIMP').length}
                    </div>
                    <div className="text-slate-400 text-xs uppercase tracking-wider font-medium">WIMP Candidates</div>
                  </div>
                </div>

                <div className="space-y-4">
                  <div className="text-sm font-semibold text-white mb-4">Event Type Breakdown:</div>
                  <div className="space-y-4">
                    {['WIMP', 'Background', 'Axion', 'Neutrino'].map(type => {
                      const count = generatedData.filter(e => e.type === type).length;
                      const percentage = Math.round((count / generatedData.length) * 100);
                      return (
                        <div key={type} className="flex items-center justify-between text-sm py-2 border-b border-slate-700/50 last:border-b-0" style={{ lineHeight: '1.8' }}>
                          <span className="text-slate-300 font-medium">{type}</span>
                          <div className="flex items-center gap-3">
                            <span className="text-white font-semibold">{count}</span>
                            <span className="text-gray-500">•</span>
                            <span className="text-cyan-400 font-medium">({percentage}%)</span>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>

                <Button
                  onClick={() => handleExport(generatedData)}
                  className="w-full bg-transparent border-[1.5px] border-blue-500 text-blue-400 hover:bg-blue-900/20 hover:border-blue-400 hover:text-blue-300 py-4 px-6 rounded-lg font-semibold transition-all duration-300 ease-out group"
                >
                  <Download className="w-5 h-5 mr-3 transition-transform duration-300 group-hover:translate-y-1" />
                  Export All Data
                </Button>
              </div>
            ) : (
              <div className="text-center text-slate-400 py-16">
                <Zap className="w-20 h-20 mx-auto mb-6 opacity-20" />
                <p className="text-sm font-medium">Generate events to see statistics</p>
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
