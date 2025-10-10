import React, { useState, useEffect } from 'react';
import PageLayout from '@/components/PageLayout';
import { LoadingSpinner } from '@/components/LoadingComponents';
import { showToast } from '@/lib/toast';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Slider } from '@/components/ui/slider';
import { Switch } from '@/components/ui/switch';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Settings as SettingsIcon, 
  Eye, 
  EyeOff, 
  CheckCircle, 
  XCircle, 
  Download, 
  Upload, 
  RotateCcw, 
  Save, 
  Plus, 
  Edit, 
  Trash2,
  Copy,
  Brain,
  Zap,
  FileText,
  AlertTriangle,
  Database
} from 'lucide-react';

interface ClaudeSettings {
  apiKey: string;
  model: string;
  temperature: number;
  maxTokens: number;
}

interface ClassificationParameters {
  confidenceThreshold: number;
  energyMin: number;
  energyMax: number;
  wimpS2S1Max: number;
  backgroundS2S1Min: number;
  backgroundS2S1Max: number;
  neutrinoS2S1Min: number;
  axionS2S1Max: number;
  anomalyDetectionEnabled: boolean;
}

interface PromptTemplate {
  id: string;
  name: string;
  type: 'data-generation' | 'classification' | 'reasoning';
  content: string;
  isDefault: boolean;
}

interface FewShotExample {
  id: string;
  name: string;
  inputs: {
    energy: number;
    s1: number;
    s2: number;
    position?: { x: number; y: number; z: number };
  };
  expectedOutput: {
    type: string;
    confidence: number;
  };
  reasoning: string;
}

interface AppSettings {
  claude: ClaudeSettings;
  classification: ClassificationParameters;
  promptTemplates: PromptTemplate[];
  fewShotExamples: FewShotExample[];
  lastModified: string;
}

const defaultSettings: AppSettings = {
  claude: {
    apiKey: '',
    model: 'claude-3-sonnet-20240229',
    temperature: 0.7,
    maxTokens: 4096
  },
  classification: {
    confidenceThreshold: 70,
    energyMin: 1,
    energyMax: 50,
    wimpS2S1Max: 10,
    backgroundS2S1Min: 10,
    backgroundS2S1Max: 50,
    neutrinoS2S1Min: 50,
    axionS2S1Max: 20,
    anomalyDetectionEnabled: true
  },
  promptTemplates: [
    {
      id: 'default-classification',
      name: 'Default Classification',
      type: 'classification',
      content: `You are an expert dark matter detector analyst. Classify this event based on the following parameters:

Energy: {energy} keV
S1 Signal: {s1} PE
S2 Signal: {s2} PE
S2/S1 Ratio: {s2s1Ratio}

Classification criteria:
- WIMP: Low energy (<20 keV), low S2/S1 ratio (<10)
- Background: Medium energy, moderate S2/S1 ratio (10-50)
- Neutrino: High S2/S1 ratio (>50)
- Axion: Low energy, specific S2/S1 characteristics
- Anomaly: Events that don't fit typical patterns

Provide classification with confidence score (0-100%).`,
      isDefault: true
    },
    {
      id: 'default-reasoning',
      name: 'Default Reasoning',
      type: 'reasoning',
      content: `Provide detailed reasoning for this dark matter event classification:

Event Data:
- Energy: {energy} keV
- S1: {s1} PE
- S2: {s2} PE
- S2/S1 Ratio: {s2s1Ratio}

Generate a step-by-step analysis tree showing:
1. Energy analysis and implications
2. Signal discrimination techniques
3. Statistical analysis and likelihood
4. Literature references and citations
5. Final conclusion with confidence assessment`,
      isDefault: true
    },
    {
      id: 'default-generation',
      name: 'Default Data Generation',
      type: 'data-generation',
      content: `Generate realistic dark matter detector event data with the following characteristics:

Event Type: {eventType}
Count: {count}
Energy Range: {energyMin}-{energyMax} keV

For each event, provide:
- Unique event ID
- Recoil energy (keV)
- S1 signal (photoelectrons)
- S2 signal (photoelectrons)
- Position coordinates (x, y, z in cm)
- Timestamp

Ensure physical consistency between parameters and realistic detector response.`,
      isDefault: true
    }
  ],
  fewShotExamples: [
    {
      id: 'wimp-example-1',
      name: 'Low Energy WIMP',
      inputs: {
        energy: 8.5,
        s1: 42,
        s2: 285,
        position: { x: 1.2, y: -0.8, z: 15.3 }
      },
      expectedOutput: {
        type: 'WIMP',
        confidence: 85
      },
      reasoning: 'Low recoil energy (8.5 keV) and low S2/S1 ratio (6.8) are characteristic of nuclear recoils from WIMP interactions.'
    },
    {
      id: 'background-example-1',
      name: 'Electronic Recoil Background',
      inputs: {
        energy: 25.7,
        s1: 98,
        s2: 1850
      },
      expectedOutput: {
        type: 'Background',
        confidence: 78
      },
      reasoning: 'Higher S2/S1 ratio (18.9) indicates electronic recoil, typical of gamma-ray background events.'
    },
    {
      id: 'neutrino-example-1',
      name: 'Coherent Neutrino Scattering',
      inputs: {
        energy: 12.3,
        s1: 65,
        s2: 3250
      },
      expectedOutput: {
        type: 'Neutrino',
        confidence: 82
      },
      reasoning: 'Very high S2/S1 ratio (50) with low energy suggests coherent neutrino scattering event.'
    }
  ],
  lastModified: new Date().toISOString()
};

const Settings = () => {
  const [settings, setSettings] = useState<AppSettings>(defaultSettings);
  const [showApiKey, setShowApiKey] = useState(false);
  const [connectionStatus, setConnectionStatus] = useState<'idle' | 'testing' | 'success' | 'error'>('idle');
  const [selectedPromptType, setSelectedPromptType] = useState<string>('classification');
  const [selectedPromptId, setSelectedPromptId] = useState<string>('default-classification');
  const [editingPrompt, setEditingPrompt] = useState<string>('');
  const [editingExample, setEditingExample] = useState<FewShotExample | null>(null);
  const [showExampleForm, setShowExampleForm] = useState(false);
  const [saveStatus, setSaveStatus] = useState<'idle' | 'saving' | 'saved' | 'error'>('idle');

  // Load settings from localStorage on component mount
  useEffect(() => {
    const savedSettings = localStorage.getItem('dark-matter-settings');
    if (savedSettings) {
      try {
        const parsedSettings = JSON.parse(savedSettings);
        setSettings({ ...defaultSettings, ...parsedSettings });
      } catch (error) {
        console.error('Failed to parse saved settings:', error);
      }
    }
  }, []);

  // Save settings to localStorage
  const saveSettings = () => {
    setSaveStatus('saving');
    try {
      const settingsToSave = {
        ...settings,
        lastModified: new Date().toISOString()
      };
      localStorage.setItem('dark-matter-settings', JSON.stringify(settingsToSave));
      setSettings(settingsToSave);
      setSaveStatus('saved');
      setTimeout(() => setSaveStatus('idle'), 2000);
    } catch (error) {
      console.error('Failed to save settings:', error);
      setSaveStatus('error');
      setTimeout(() => setSaveStatus('idle'), 2000);
    }
  };

  // Update Claude settings
  const updateClaudeSettings = (field: keyof ClaudeSettings, value: any) => {
    setSettings(prev => ({
      ...prev,
      claude: { ...prev.claude, [field]: value }
    }));
  };

  // Update classification parameters
  const updateClassificationParams = (field: keyof ClassificationParameters, value: any) => {
    setSettings(prev => ({
      ...prev,
      classification: { ...prev.classification, [field]: value }
    }));
  };

  // Test Claude API connection
  const testConnection = async () => {
    if (!settings.claude.apiKey) {
      setConnectionStatus('error');
      return;
    }

    setConnectionStatus('testing');
    
    // Simulate API test
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    // In a real implementation, you would make an actual API call here
    const success = settings.claude.apiKey.startsWith('sk-') && settings.claude.apiKey.length > 20;
    setConnectionStatus(success ? 'success' : 'error');
    
    setTimeout(() => setConnectionStatus('idle'), 3000);
  };

  // Prompt template management
  const getSelectedPrompt = () => {
    return settings.promptTemplates.find(p => p.id === selectedPromptId) || settings.promptTemplates[0];
  };

  const updatePromptContent = (content: string) => {
    setSettings(prev => ({
      ...prev,
      promptTemplates: prev.promptTemplates.map(template =>
        template.id === selectedPromptId
          ? { ...template, content }
          : template
      )
    }));
  };

  const resetPromptToDefault = () => {
    const defaultTemplate = defaultSettings.promptTemplates.find(p => p.id === selectedPromptId);
    if (defaultTemplate) {
      updatePromptContent(defaultTemplate.content);
    }
  };

  const saveCustomPrompt = () => {
    if (!editingPrompt.trim()) return;

    const newPrompt: PromptTemplate = {
      id: `custom-${Date.now()}`,
      name: `Custom ${selectedPromptType} Template`,
      type: selectedPromptType as any,
      content: editingPrompt,
      isDefault: false
    };

    setSettings(prev => ({
      ...prev,
      promptTemplates: [...prev.promptTemplates, newPrompt]
    }));

    setEditingPrompt('');
  };

  // Few-shot example management
  const addExample = (example: Omit<FewShotExample, 'id'>) => {
    const newExample: FewShotExample = {
      ...example,
      id: `example-${Date.now()}`
    };

    setSettings(prev => ({
      ...prev,
      fewShotExamples: [...prev.fewShotExamples, newExample]
    }));

    setShowExampleForm(false);
    setEditingExample(null);
  };

  const updateExample = (id: string, updatedExample: Omit<FewShotExample, 'id'>) => {
    setSettings(prev => ({
      ...prev,
      fewShotExamples: prev.fewShotExamples.map(example =>
        example.id === id ? { ...updatedExample, id } : example
      )
    }));

    setEditingExample(null);
  };

  const deleteExample = (id: string) => {
    setSettings(prev => ({
      ...prev,
      fewShotExamples: prev.fewShotExamples.filter(example => example.id !== id)
    }));
  };

  // Export/Import settings
  const exportSettings = () => {
    const dataStr = JSON.stringify(settings, null, 2);
    const dataBlob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(dataBlob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `dark-matter-settings-${new Date().toISOString().split('T')[0]}.json`;
    link.click();
    URL.revokeObjectURL(url);
  };

  const importSettings = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const importedSettings = JSON.parse(e.target?.result as string);
        setSettings({ ...defaultSettings, ...importedSettings });
      } catch (error) {
        console.error('Failed to import settings:', error);
      }
    };
    reader.readAsText(file);
  };

  const filteredPrompts = settings.promptTemplates.filter(p => p.type === selectedPromptType);
  const selectedPrompt = getSelectedPrompt();

  return (
    <PageLayout
      title="Settings"
      description="Advanced configuration for dark matter analysis system"
    >
      <div className="space-y-6">
        {/* Save/Export/Import Header */}
        <Card className="backdrop-blur-md bg-card/50 border-white/10">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <Button 
                  onClick={saveSettings} 
                  disabled={saveStatus === 'saving'}
                  variant="premium"
                  className="group"
                >
                  <Save className="w-4 h-4 mr-2 transition-transform duration-300 group-hover:translate-x-1" />
                  {saveStatus === 'saving' ? 'Saving...' : 'Save Settings'}
                </Button>
                {saveStatus === 'saved' && (
                  <Badge className="badge-success">
                    <CheckCircle className="w-3 h-3" />
                    Saved
                  </Badge>
                )}
              </div>
              
              <div className="flex items-center gap-2">
                <Button variant="outline" onClick={exportSettings}>
                  <Download className="w-4 h-4 mr-2" />
                  Export
                </Button>
                <Button variant="outline" onClick={() => document.getElementById('import-settings')?.click()}>
                  <Upload className="w-4 h-4 mr-2" />
                  Import
                </Button>
                <input
                  id="import-settings"
                  type="file"
                  accept=".json"
                  onChange={importSettings}
                  className="hidden"
                />
              </div>
            </div>
            
            {settings.lastModified && (
              <p className="text-xs text-muted-foreground mt-2">
                Last modified: {new Date(settings.lastModified).toLocaleString()}
              </p>
            )}
          </CardContent>
        </Card>

        <Tabs defaultValue="claude" className="w-full">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="claude">Claude API</TabsTrigger>
            <TabsTrigger value="classification">Classification</TabsTrigger>
            <TabsTrigger value="prompts">Prompts</TabsTrigger>
            <TabsTrigger value="examples">Examples</TabsTrigger>
          </TabsList>

          {/* Claude API Configuration */}
          <TabsContent value="claude">
            <Card className="backdrop-blur-md bg-card/50 border-white/10">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 heading-gradient">
                  <Brain className="w-5 h-5" />
                  Claude API Configuration
                </CardTitle>
                <CardDescription>
                  Configure your Claude API settings for AI-powered analysis
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* API Key */}
                <div className="space-y-2">
                  <Label htmlFor="api-key">API Key</Label>
                  <div className="flex gap-2">
                    <Input
                      id="api-key"
                      type={showApiKey ? 'text' : 'password'}
                      value={settings.claude.apiKey}
                      onChange={(e) => updateClaudeSettings('apiKey', e.target.value)}
                      placeholder="sk-ant-api03-..."
                      className="flex-1"
                    />
                    <Button
                      variant="outline"
                      size="icon"
                      onClick={() => setShowApiKey(!showApiKey)}
                    >
                      {showApiKey ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </Button>
                  </div>
                </div>

                {/* Model Selection */}
                <div className="space-y-2">
                  <Label htmlFor="model">Model</Label>
                  <Select value={settings.claude.model} onValueChange={(value) => updateClaudeSettings('model', value)}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="claude-3-sonnet-20240229">Claude 3 Sonnet</SelectItem>
                      <SelectItem value="claude-3-opus-20240229">Claude 3 Opus</SelectItem>
                      <SelectItem value="claude-3-haiku-20240307">Claude 3 Haiku</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {/* Temperature */}
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <Label>Temperature</Label>
                    <span className="text-sm text-muted-foreground">{settings.claude.temperature}</span>
                  </div>
                  <Slider
                    value={[settings.claude.temperature]}
                    onValueChange={([value]) => updateClaudeSettings('temperature', value)}
                    max={1}
                    min={0}
                    step={0.1}
                    className="w-full"
                  />
                  <p className="text-xs text-muted-foreground">
                    Lower values make responses more focused and deterministic
                  </p>
                </div>

                {/* Max Tokens */}
                <div className="space-y-2">
                  <Label htmlFor="max-tokens">Max Tokens</Label>
                  <Input
                    id="max-tokens"
                    type="number"
                    value={settings.claude.maxTokens}
                    onChange={(e) => updateClaudeSettings('maxTokens', parseInt(e.target.value))}
                    min={1}
                    max={8192}
                  />
                </div>

                {/* Test Connection */}
                <div className="pt-4 border-t border-white/10">
                  <Button 
                    onClick={testConnection} 
                    disabled={connectionStatus === 'testing' || !settings.claude.apiKey}
                    className="w-full"
                  >
                    {connectionStatus === 'testing' && <div className="w-4 h-4 mr-2 animate-spin border-2 border-white/20 border-t-white rounded-full" />}
                    {connectionStatus === 'success' && <CheckCircle className="w-4 h-4 mr-2 text-green-500" />}
                    {connectionStatus === 'error' && <XCircle className="w-4 h-4 mr-2 text-red-500" />}
                    {connectionStatus === 'testing' ? 'Testing Connection...' : 'Test Connection'}
                  </Button>
                  
                  {connectionStatus === 'success' && (
                    <Alert className="mt-3 border-green-500/50 bg-green-500/10">
                      <CheckCircle className="h-4 w-4" />
                      <AlertDescription>Connection successful! Claude API is ready.</AlertDescription>
                    </Alert>
                  )}
                  
                  {connectionStatus === 'error' && (
                    <Alert className="mt-3 border-red-500/50 bg-red-500/10">
                      <XCircle className="h-4 w-4" />
                      <AlertDescription>Connection failed. Please check your API key.</AlertDescription>
                    </Alert>
                  )}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Classification Parameters */}
          <TabsContent value="classification">
            <Card className="backdrop-blur-md bg-card/50 border-white/10">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Zap className="w-5 h-5" />
                  Classification Parameters
                </CardTitle>
                <CardDescription>
                  Fine-tune the classification algorithm settings
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* Confidence Threshold */}
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <Label>Confidence Threshold</Label>
                    <span className="text-sm text-muted-foreground">{settings.classification.confidenceThreshold}%</span>
                  </div>
                  <Slider
                    value={[settings.classification.confidenceThreshold]}
                    onValueChange={([value]) => updateClassificationParams('confidenceThreshold', value)}
                    max={100}
                    min={0}
                    step={5}
                    className="w-full"
                  />
                </div>

                {/* Energy Range */}
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="energy-min">Min Energy (keV)</Label>
                    <Input
                      id="energy-min"
                      type="number"
                      value={settings.classification.energyMin}
                      onChange={(e) => updateClassificationParams('energyMin', parseFloat(e.target.value))}
                      step={0.1}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="energy-max">Max Energy (keV)</Label>
                    <Input
                      id="energy-max"
                      type="number"
                      value={settings.classification.energyMax}
                      onChange={(e) => updateClassificationParams('energyMax', parseFloat(e.target.value))}
                      step={0.1}
                    />
                  </div>
                </div>

                {/* S2/S1 Ratio Thresholds */}
                <div className="space-y-4">
                  <h4 className="font-medium">S2/S1 Ratio Thresholds</h4>
                  
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="wimp-s2s1">WIMP Max S2/S1</Label>
                      <Input
                        id="wimp-s2s1"
                        type="number"
                        value={settings.classification.wimpS2S1Max}
                        onChange={(e) => updateClassificationParams('wimpS2S1Max', parseFloat(e.target.value))}
                        step={0.1}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="axion-s2s1">Axion Max S2/S1</Label>
                      <Input
                        id="axion-s2s1"
                        type="number"
                        value={settings.classification.axionS2S1Max}
                        onChange={(e) => updateClassificationParams('axionS2S1Max', parseFloat(e.target.value))}
                        step={0.1}
                      />
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="background-s2s1-min">Background Min S2/S1</Label>
                      <Input
                        id="background-s2s1-min"
                        type="number"
                        value={settings.classification.backgroundS2S1Min}
                        onChange={(e) => updateClassificationParams('backgroundS2S1Min', parseFloat(e.target.value))}
                        step={0.1}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="background-s2s1-max">Background Max S2/S1</Label>
                      <Input
                        id="background-s2s1-max"
                        type="number"
                        value={settings.classification.backgroundS2S1Max}
                        onChange={(e) => updateClassificationParams('backgroundS2S1Max', parseFloat(e.target.value))}
                        step={0.1}
                      />
                    </div>
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="neutrino-s2s1">Neutrino Min S2/S1</Label>
                    <Input
                      id="neutrino-s2s1"
                      type="number"
                      value={settings.classification.neutrinoS2S1Min}
                      onChange={(e) => updateClassificationParams('neutrinoS2S1Min', parseFloat(e.target.value))}
                      step={0.1}
                      className="w-full"
                    />
                  </div>
                </div>

                {/* Anomaly Detection */}
                <div className="flex items-center justify-between p-4 bg-muted/20 rounded-lg">
                  <div>
                    <Label htmlFor="anomaly-detection">Anomaly Detection</Label>
                    <p className="text-sm text-muted-foreground">
                      Enable automatic detection of anomalous events
                    </p>
                  </div>
                  <Switch
                    id="anomaly-detection"
                    checked={settings.classification.anomalyDetectionEnabled}
                    onCheckedChange={(checked) => updateClassificationParams('anomalyDetectionEnabled', checked)}
                  />
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Prompt Templates */}
          <TabsContent value="prompts">
            <Card className="backdrop-blur-md bg-card/50 border-white/10">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <FileText className="w-5 h-5" />
                  Prompt Templates
                </CardTitle>
                <CardDescription>
                  Customize AI prompts for different analysis tasks
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* Prompt Type Selection */}
                <div className="space-y-2">
                  <Label>Prompt Type</Label>
                  <Select value={selectedPromptType} onValueChange={setSelectedPromptType}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="classification">Classification</SelectItem>
                      <SelectItem value="reasoning">Reasoning</SelectItem>
                      <SelectItem value="data-generation">Data Generation</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {/* Template Selection */}
                <div className="space-y-2">
                  <Label>Template</Label>
                  <Select value={selectedPromptId} onValueChange={setSelectedPromptId}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {filteredPrompts.map(template => (
                        <SelectItem key={template.id} value={template.id}>
                          {template.name} {template.isDefault && '(Default)'}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                {/* Current Prompt Content */}
                <div className="space-y-2">
                  <div className="flex justify-between items-center">
                    <Label>Prompt Content</Label>
                    <div className="flex gap-2">
                      <Button size="sm" variant="outline" onClick={resetPromptToDefault}>
                        <RotateCcw className="w-4 h-4 mr-2" />
                        Reset to Default
                      </Button>
                      <Button size="sm" variant="outline" onClick={() => navigator.clipboard.writeText(selectedPrompt.content)}>
                        <Copy className="w-4 h-4 mr-2" />
                        Copy
                      </Button>
                    </div>
                  </div>
                  <Textarea
                    value={selectedPrompt.content}
                    onChange={(e) => updatePromptContent(e.target.value)}
                    rows={12}
                    className="font-mono text-sm"
                    placeholder="Enter your custom prompt template..."
                  />
                  <p className="text-xs text-muted-foreground">
                    Use placeholders like {'{energy}'}, {'{s1}'}, {'{s2}'}, {'{s2s1Ratio}'} for dynamic values
                  </p>
                </div>

                {/* Custom Prompt Creation */}
                <div className="pt-4 border-t border-white/10">
                  <div className="space-y-4">
                    <h4 className="font-medium">Create Custom Template</h4>
                    <Textarea
                      value={editingPrompt}
                      onChange={(e) => setEditingPrompt(e.target.value)}
                      rows={6}
                      placeholder="Write your custom prompt template..."
                      className="font-mono text-sm"
                    />
                    <Button onClick={saveCustomPrompt} disabled={!editingPrompt.trim()}>
                      <Save className="w-4 h-4 mr-2" />
                      Save Custom Template
                    </Button>
                  </div>
                </div>

                {/* Saved Templates Library */}
                <div className="pt-4 border-t border-white/10">
                  <h4 className="font-medium mb-3">Template Library</h4>
                  <div className="space-y-2">
                    {settings.promptTemplates
                      .filter(template => !template.isDefault)
                      .map(template => (
                        <div key={template.id} className="flex items-center justify-between p-3 bg-muted/20 rounded-lg">
                          <div>
                            <div className="font-medium">{template.name}</div>
                            <div className="text-sm text-muted-foreground capitalize">{template.type.replace('-', ' ')}</div>
                          </div>
                          <div className="flex gap-2">
                            <Button size="sm" variant="outline" onClick={() => setSelectedPromptId(template.id)}>
                              <Edit className="w-4 h-4" />
                            </Button>
                            <Button 
                              size="sm" 
                              variant="outline"
                              onClick={() => {
                                setSettings(prev => ({
                                  ...prev,
                                  promptTemplates: prev.promptTemplates.filter(p => p.id !== template.id)
                                }));
                              }}
                            >
                              <Trash2 className="w-4 h-4" />
                            </Button>
                          </div>
                        </div>
                      ))}
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Few-Shot Examples */}
          <TabsContent value="examples">
            <Card className="backdrop-blur-md bg-card/50 border-white/10">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Database className="w-5 h-5" />
                  Few-Shot Examples
                </CardTitle>
                <CardDescription>
                  Manage example events used in AI prompts for better classification
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* Add New Example Button */}
                <Button onClick={() => setShowExampleForm(true)} className="w-full">
                  <Plus className="w-4 h-4 mr-2" />
                  Add New Example
                </Button>

                {/* Example List */}
                <div className="space-y-4">
                  {settings.fewShotExamples.map(example => (
                    <div key={example.id} className="p-4 bg-muted/20 rounded-lg">
                      <div className="flex items-start justify-between mb-3">
                        <div>
                          <h4 className="font-medium">{example.name}</h4>
                          <Badge className="badge-outline-premium">
                            {example.expectedOutput.type}
                          </Badge>
                        </div>
                        <div className="flex gap-2">
                          <Button size="sm" variant="outline" onClick={() => setEditingExample(example)}>
                            <Edit className="w-4 h-4" />
                          </Button>
                          <Button size="sm" variant="outline" onClick={() => deleteExample(example.id)}>
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </div>
                      </div>
                      
                      <div className="grid grid-cols-2 gap-4 text-sm">
                        <div>
                          <strong>Inputs:</strong>
                          <div className="mt-1 font-mono text-xs">
                            <div>Energy: {example.inputs.energy} keV</div>
                            <div>S1: {example.inputs.s1} PE</div>
                            <div>S2: {example.inputs.s2} PE</div>
                            <div>S2/S1: {(example.inputs.s2 / example.inputs.s1).toFixed(2)}</div>
                          </div>
                        </div>
                        <div>
                          <strong>Expected Output:</strong>
                          <div className="mt-1 font-mono text-xs">
                            <div>Type: {example.expectedOutput.type}</div>
                            <div>Confidence: {example.expectedOutput.confidence}%</div>
                          </div>
                        </div>
                      </div>
                      
                      <div className="mt-3">
                        <strong>Reasoning:</strong>
                        <p className="text-sm text-muted-foreground mt-1">{example.reasoning}</p>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Example Form Modal-like Section */}
                {(showExampleForm || editingExample) && (
                  <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50">
                    <div className="bg-card p-6 rounded-lg border border-white/10 w-full max-w-2xl mx-4 max-h-[90vh] overflow-y-auto">
                      <h3 className="text-lg font-semibold mb-4">
                        {editingExample ? 'Edit Example' : 'Add New Example'}
                      </h3>
                      
                      <ExampleForm
                        example={editingExample}
                        onSave={(example) => {
                          if (editingExample) {
                            updateExample(editingExample.id, example);
                          } else {
                            addExample(example);
                          }
                        }}
                        onCancel={() => {
                          setShowExampleForm(false);
                          setEditingExample(null);
                        }}
                      />
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </PageLayout>
  );
};

// Example Form Component
interface ExampleFormProps {
  example?: FewShotExample | null;
  onSave: (example: Omit<FewShotExample, 'id'>) => void;
  onCancel: () => void;
}

const ExampleForm: React.FC<ExampleFormProps> = ({ example, onSave, onCancel }) => {
  const [formData, setFormData] = useState({
    name: example?.name || '',
    energy: example?.inputs.energy || 0,
    s1: example?.inputs.s1 || 0,
    s2: example?.inputs.s2 || 0,
    positionX: example?.inputs.position?.x || 0,
    positionY: example?.inputs.position?.y || 0,
    positionZ: example?.inputs.position?.z || 0,
    expectedType: example?.expectedOutput.type || 'WIMP',
    expectedConfidence: example?.expectedOutput.confidence || 80,
    reasoning: example?.reasoning || ''
  });

  const handleSave = () => {
    if (!formData.name.trim() || !formData.reasoning.trim()) return;

    onSave({
      name: formData.name,
      inputs: {
        energy: formData.energy,
        s1: formData.s1,
        s2: formData.s2,
        position: {
          x: formData.positionX,
          y: formData.positionY,
          z: formData.positionZ
        }
      },
      expectedOutput: {
        type: formData.expectedType,
        confidence: formData.expectedConfidence
      },
      reasoning: formData.reasoning
    });
  };

  return (
    <div className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="example-name">Example Name</Label>
        <Input
          id="example-name"
          value={formData.name}
          onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
          placeholder="e.g., Low Energy WIMP Example"
        />
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="example-energy">Energy (keV)</Label>
          <Input
            id="example-energy"
            type="number"
            value={formData.energy}
            onChange={(e) => setFormData(prev => ({ ...prev, energy: parseFloat(e.target.value) || 0 }))}
            step={0.1}
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="example-s1">S1 Signal (PE)</Label>
          <Input
            id="example-s1"
            type="number"
            value={formData.s1}
            onChange={(e) => setFormData(prev => ({ ...prev, s1: parseInt(e.target.value) || 0 }))}
          />
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="example-s2">S2 Signal (PE)</Label>
          <Input
            id="example-s2"
            type="number"
            value={formData.s2}
            onChange={(e) => setFormData(prev => ({ ...prev, s2: parseInt(e.target.value) || 0 }))}
          />
        </div>
        <div className="space-y-2">
          <Label>S2/S1 Ratio</Label>
          <Input
            value={(formData.s2 / formData.s1 || 0).toFixed(2)}
            disabled
            className="bg-muted/20"
          />
        </div>
      </div>

      <div className="grid grid-cols-3 gap-4">
        <div className="space-y-2">
          <Label htmlFor="example-x">Position X (cm)</Label>
          <Input
            id="example-x"
            type="number"
            value={formData.positionX}
            onChange={(e) => setFormData(prev => ({ ...prev, positionX: parseFloat(e.target.value) || 0 }))}
            step={0.1}
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="example-y">Position Y (cm)</Label>
          <Input
            id="example-y"
            type="number"
            value={formData.positionY}
            onChange={(e) => setFormData(prev => ({ ...prev, positionY: parseFloat(e.target.value) || 0 }))}
            step={0.1}
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="example-z">Position Z (cm)</Label>
          <Input
            id="example-z"
            type="number"
            value={formData.positionZ}
            onChange={(e) => setFormData(prev => ({ ...prev, positionZ: parseFloat(e.target.value) || 0 }))}
            step={0.1}
          />
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="example-type">Expected Type</Label>
          <Select value={formData.expectedType} onValueChange={(value) => setFormData(prev => ({ ...prev, expectedType: value }))}>
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="WIMP">WIMP</SelectItem>
              <SelectItem value="Background">Background</SelectItem>
              <SelectItem value="Neutrino">Neutrino</SelectItem>
              <SelectItem value="Axion">Axion</SelectItem>
              <SelectItem value="Anomaly">Anomaly</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div className="space-y-2">
          <Label htmlFor="example-confidence">Expected Confidence (%)</Label>
          <Input
            id="example-confidence"
            type="number"
            value={formData.expectedConfidence}
            onChange={(e) => setFormData(prev => ({ ...prev, expectedConfidence: parseInt(e.target.value) || 0 }))}
            min={0}
            max={100}
          />
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="example-reasoning">Reasoning</Label>
        <Textarea
          id="example-reasoning"
          value={formData.reasoning}
          onChange={(e) => setFormData(prev => ({ ...prev, reasoning: e.target.value }))}
          rows={4}
          placeholder="Explain why this event should be classified as the expected type..."
        />
      </div>

      <div className="flex gap-3 pt-4">
        <Button onClick={handleSave} disabled={!formData.name.trim() || !formData.reasoning.trim()}>
          <Save className="w-4 h-4 mr-2" />
          Save Example
        </Button>
        <Button variant="outline" onClick={onCancel}>
          Cancel
        </Button>
      </div>
    </div>
  );
};

export default Settings;