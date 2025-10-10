import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import PageLayout from '@/components/PageLayout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Search, 
  BookOpen, 
  Zap, 
  Settings, 
  BarChart3, 
  AlertTriangle, 
  Code, 
  HelpCircle,
  ThumbsUp,
  ThumbsDown,
  Play,
  ExternalLink,
  ChevronRight,
  Atom,
  Target,
  TrendingUp,
  Database,
  Youtube
} from 'lucide-react';

const Help = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [activeSection, setActiveSection] = useState('getting-started');
  const [helpfulVotes, setHelpfulVotes] = useState<{[key: string]: 'yes' | 'no' | null}>({});
  const navigate = useNavigate();

  const tableOfContents = [
    { id: 'getting-started', title: 'Getting Started', icon: BookOpen },
    { id: 'particle-signatures', title: 'Understanding Particle Signatures', icon: Atom },
    { id: 'using-classifier', title: 'Using the Classifier', icon: Settings },
    { id: 'interpreting-results', title: 'Interpreting Results', icon: BarChart3 },
    { id: 'anomaly-detection', title: 'Anomaly Detection', icon: AlertTriangle },
    { id: 'api-reference', title: 'API Reference', icon: Code },
    { id: 'faqs', title: 'FAQs', icon: HelpCircle },
  ];

  const faqItems = [
    {
      question: "What is the difference between S1 and S2 signals?",
      answer: "S1 is the prompt scintillation light produced when a particle first interacts with the liquid xenon. S2 is the proportional scintillation light produced when ionization electrons are extracted to the gas phase. The ratio S2/S1 is crucial for particle identification."
    },
    {
      question: "How accurate is the WIMP detection?",
      answer: "Our classifier achieves >95% accuracy on known particle types. However, WIMP detection is inherently challenging due to their extremely rare interactions. The system is designed to minimize false positives while maintaining high sensitivity."
    },
    {
      question: "What should I do if I detect an anomaly?",
      answer: "Anomalies should be carefully reviewed in the Anomaly Hub. Check the confidence score, examine similar events, and consider environmental factors. High-confidence anomalies may warrant further investigation or expert review."
    },
    {
      question: "Can I export my analysis results?",
      answer: "Yes, all results can be exported in multiple formats including CSV, JSON, and PDF reports. Use the export buttons in the Results Dashboard or generate comprehensive reports in the Report Generator."
    },
    {
      question: "How do I improve classification accuracy?",
      answer: "Ensure proper detector calibration, use high-quality training data, and regularly update the model. The Settings page allows you to adjust classification parameters and thresholds based on your specific experimental conditions."
    },
    {
      question: "What file formats are supported for batch processing?",
      answer: "The system supports CSV, JSON, and HDF5 formats. Each file should contain the required fields: energy, s1, s2, and optionally timestamp and position data."
    }
  ];

  const scrollToSection = (sectionId: string) => {
    setActiveSection(sectionId);
    const element = document.getElementById(sectionId);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
    }
  };

  const handleHelpfulVote = (sectionId: string, vote: 'yes' | 'no') => {
    setHelpfulVotes(prev => ({ ...prev, [sectionId]: vote }));
  };

  const navigateToPage = (path: string) => {
    navigate(path);
  };

  return (
    <PageLayout
      title="Help & Documentation"
      description="Complete guide to using the Dark Matter Detection System"
    >
      <div className="flex gap-6">
        {/* Sidebar Table of Contents */}
        <div className="w-64 flex-shrink-0">
          <Card className="backdrop-blur-md bg-card/50 border-white/10 sticky top-6">
            <CardHeader>
              <CardTitle className="text-lg">Contents</CardTitle>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
                <Input
                  placeholder="Search documentation..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10"
                />
              </div>
            </CardHeader>
            <CardContent className="space-y-2">
              {tableOfContents.map((item) => {
                const Icon = item.icon;
                return (
                  <Button
                    key={item.id}
                    variant={activeSection === item.id ? "default" : "ghost"}
                    className="w-full justify-start text-left"
                    onClick={() => scrollToSection(item.id)}
                  >
                    <Icon className="h-4 w-4 mr-2" />
                    {item.title}
                  </Button>
                );
              })}
            </CardContent>
          </Card>
        </div>

        {/* Main Content Area */}
        <div className="flex-1 space-y-8">
          {/* Getting Started Section */}
          <section id="getting-started" className="scroll-mt-6">
            <Card className="backdrop-blur-md bg-card/50 border-white/10">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <BookOpen className="h-5 w-5" />
                  Getting Started
                </CardTitle>
                <CardDescription>
                  Step-by-step guide to start detecting dark matter particles
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* Tutorial Video */}
                <div className="bg-slate-900/50 rounded-lg p-6 text-center">
                  <Youtube className="h-16 w-16 mx-auto mb-4 text-red-500" />
                  <h3 className="text-lg font-semibold mb-2">Getting Started Video Tutorial</h3>
                  <p className="text-muted-foreground mb-4">
                    Watch our comprehensive 10-minute tutorial covering the basics of particle classification
                  </p>
                  <Button className="bg-red-600 hover:bg-red-700">
                    <Play className="h-4 w-4 mr-2" />
                    Watch Tutorial (10:32)
                  </Button>
                </div>

                {/* Step-by-step Guide */}
                <div className="space-y-4">
                  <h3 className="text-xl font-semibold">Quick Start Guide</h3>
                  <div className="grid gap-4">
                    <div className="flex gap-4 p-4 border border-blue-200/20 rounded-lg bg-blue-500/5">
                      <div className="flex-shrink-0 w-8 h-8 bg-blue-600 text-white rounded-full flex items-center justify-center font-bold">
                        1
                      </div>
                      <div className="flex-1">
                        <h4 className="font-semibold mb-2">Configure Your Settings</h4>
                        <p className="text-muted-foreground mb-3">
                          Set up your detection parameters and API credentials in the Settings page.
                        </p>
                        <Button 
                          variant="outline" 
                          size="sm"
                          onClick={() => navigateToPage('/settings')}
                        >
                          Go to Settings
                          <ChevronRight className="h-4 w-4 ml-1" />
                        </Button>
                      </div>
                    </div>

                    <div className="flex gap-4 p-4 border border-green-200/20 rounded-lg bg-green-500/5">
                      <div className="flex-shrink-0 w-8 h-8 bg-green-600 text-white rounded-full flex items-center justify-center font-bold">
                        2
                      </div>
                      <div className="flex-1">
                        <h4 className="font-semibold mb-2">Classify Your First Event</h4>
                        <p className="text-muted-foreground mb-3">
                          Input event data manually or upload a batch file to start classification.
                        </p>
                        <Button 
                          variant="outline" 
                          size="sm"
                          onClick={() => navigateToPage('/classifier')}
                        >
                          Try Classifier
                          <ChevronRight className="h-4 w-4 ml-1" />
                        </Button>
                      </div>
                    </div>

                    <div className="flex gap-4 p-4 border border-purple-200/20 rounded-lg bg-purple-500/5">
                      <div className="flex-shrink-0 w-8 h-8 bg-purple-600 text-white rounded-full flex items-center justify-center font-bold">
                        3
                      </div>
                      <div className="flex-1">
                        <h4 className="font-semibold mb-2">Analyze Results</h4>
                        <p className="text-muted-foreground mb-3">
                          Review your classification results with interactive visualizations and detailed analysis.
                        </p>
                        <Button 
                          variant="outline" 
                          size="sm"
                          onClick={() => navigateToPage('/results')}
                        >
                          View Results Dashboard
                          <ChevronRight className="h-4 w-4 ml-1" />
                        </Button>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Was this helpful? */}
                <div className="border-t pt-4">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-muted-foreground">Was this section helpful?</span>
                    <div className="flex gap-2">
                      <Button
                        variant={helpfulVotes['getting-started'] === 'yes' ? "default" : "outline"}
                        size="sm"
                        onClick={() => handleHelpfulVote('getting-started', 'yes')}
                      >
                        <ThumbsUp className="h-4 w-4 mr-1" />
                        Yes
                      </Button>
                      <Button
                        variant={helpfulVotes['getting-started'] === 'no' ? "default" : "outline"}
                        size="sm"
                        onClick={() => handleHelpfulVote('getting-started', 'no')}
                      >
                        <ThumbsDown className="h-4 w-4 mr-1" />
                        No
                      </Button>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </section>

          {/* Particle Signatures Section */}
          <section id="particle-signatures" className="scroll-mt-6">
            <Card className="backdrop-blur-md bg-card/50 border-white/10">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Atom className="h-5 w-5" />
                  Understanding Particle Signatures
                </CardTitle>
                <CardDescription>
                  Physics primer on particle detection and signal characteristics
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* Signal Explanation */}
                <div className="grid md:grid-cols-2 gap-6">
                  <div className="space-y-4">
                    <h3 className="text-lg font-semibold">S1 Signal (Prompt Light)</h3>
                    <div className="bg-blue-500/10 border border-blue-500/20 rounded-lg p-4">
                      <div className="w-full h-32 bg-gradient-to-r from-blue-500/20 to-blue-500/40 rounded mb-3 flex items-center justify-center">
                        <Zap className="h-8 w-8 text-blue-400" />
                      </div>
                      <p className="text-sm text-muted-foreground">
                        Initial scintillation light produced when a particle deposits energy in liquid xenon. 
                        Occurs within nanoseconds of interaction.
                      </p>
                    </div>
                  </div>
                  
                  <div className="space-y-4">
                    <h3 className="text-lg font-semibold">S2 Signal (Ionization Light)</h3>
                    <div className="bg-green-500/10 border border-green-500/20 rounded-lg p-4">
                      <div className="w-full h-32 bg-gradient-to-r from-green-500/20 to-green-500/40 rounded mb-3 flex items-center justify-center">
                        <TrendingUp className="h-8 w-8 text-green-400" />
                      </div>
                      <p className="text-sm text-muted-foreground">
                        Proportional scintillation from ionization electrons extracted to gas phase. 
                        Delayed by drift time (microseconds).
                      </p>
                    </div>
                  </div>
                </div>

                {/* S2/S1 Ratio Explanation */}
                <div className="bg-slate-900/50 rounded-lg p-6">
                  <h3 className="text-lg font-semibold mb-4">Why S2/S1 Ratio Matters</h3>
                  <p className="text-muted-foreground mb-4">
                    The S2/S1 ratio is crucial for particle identification because different particle types 
                    produce different ratios of scintillation to ionization:
                  </p>
                  <div className="grid md:grid-cols-3 gap-4">
                    <div className="bg-blue-500/10 rounded-lg p-3">
                      <h4 className="font-semibold text-blue-300">Low S2/S1</h4>
                      <p className="text-sm text-muted-foreground">Nuclear recoils (WIMPs, neutrons)</p>
                    </div>
                    <div className="bg-yellow-500/10 rounded-lg p-3">
                      <h4 className="font-semibold text-yellow-300">Medium S2/S1</h4>
                      <p className="text-sm text-muted-foreground">Mixed interactions</p>
                    </div>
                    <div className="bg-red-500/10 rounded-lg p-3">
                      <h4 className="font-semibold text-red-300">High S2/S1</h4>
                      <p className="text-sm text-muted-foreground">Electronic recoils (background)</p>
                    </div>
                  </div>
                </div>

                {/* Particle Types */}
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold">Particle Type Descriptions</h3>
                  <div className="grid gap-4">
                    <div className="border border-blue-500/20 rounded-lg p-4 bg-blue-500/5">
                      <div className="flex items-center gap-3 mb-2">
                        <Target className="h-5 w-5 text-blue-400" />
                        <h4 className="font-semibold">WIMP (Weakly Interacting Massive Particle)</h4>
                        <Badge variant="secondary">Primary Target</Badge>
                      </div>
                      <p className="text-sm text-muted-foreground">
                        Hypothetical dark matter candidate. Produces nuclear recoils with characteristic 
                        low S2/S1 ratio and exponential energy spectrum.
                      </p>
                    </div>

                    <div className="border border-purple-500/20 rounded-lg p-4 bg-purple-500/5">
                      <div className="flex items-center gap-3 mb-2">
                        <Atom className="h-5 w-5 text-purple-400" />
                        <h4 className="font-semibold">Axion</h4>
                        <Badge variant="secondary">Dark Matter Candidate</Badge>
                      </div>
                      <p className="text-sm text-muted-foreground">
                        Ultralight pseudoscalar particle. Can convert to photons in strong magnetic fields, 
                        producing characteristic electromagnetic signatures.
                      </p>
                    </div>

                    <div className="border border-orange-500/20 rounded-lg p-4 bg-orange-500/5">
                      <div className="flex items-center gap-3 mb-2">
                        <Database className="h-5 w-5 text-orange-400" />
                        <h4 className="font-semibold">Neutrino</h4>
                        <Badge variant="secondary">Standard Model</Badge>
                      </div>
                      <p className="text-sm text-muted-foreground">
                        Nearly massless neutral lepton. Extremely rare interactions but can provide 
                        calibration signals and background characterization.
                      </p>
                    </div>

                    <div className="border border-gray-500/20 rounded-lg p-4 bg-gray-500/5">
                      <div className="flex items-center gap-3 mb-2">
                        <AlertTriangle className="h-5 w-5 text-gray-400" />
                        <h4 className="font-semibold">Background</h4>
                        <Badge variant="outline">Noise</Badge>
                      </div>
                      <p className="text-sm text-muted-foreground">
                        Electronic recoils from gamma rays, beta particles, and other electromagnetic 
                        interactions. High S2/S1 ratio distinguishes from nuclear recoils.
                      </p>
                    </div>
                  </div>
                </div>

                {/* Glossary */}
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold">Glossary of Terms</h3>
                  <div className="grid md:grid-cols-2 gap-4 text-sm">
                    <div className="space-y-3">
                      <div>
                        <strong>Nuclear Recoil:</strong> Energy transfer to atomic nucleus
                      </div>
                      <div>
                        <strong>Electronic Recoil:</strong> Energy transfer to atomic electrons
                      </div>
                      <div>
                        <strong>Scintillation:</strong> Light emission from particle interaction
                      </div>
                      <div>
                        <strong>Ionization:</strong> Creation of electron-ion pairs
                      </div>
                    </div>
                    <div className="space-y-3">
                      <div>
                        <strong>Drift Time:</strong> Time for electrons to reach gas phase
                      </div>
                      <div>
                        <strong>Fiducial Volume:</strong> Active detector region for analysis
                      </div>
                      <div>
                        <strong>Quenching Factor:</strong> Ratio of light yield to electron recoil
                      </div>
                      <div>
                        <strong>DM:</strong> Dark Matter - mysterious ~85% of universe's matter
                      </div>
                    </div>
                  </div>
                </div>

                {/* Was this helpful? */}
                <div className="border-t pt-4">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-muted-foreground">Was this section helpful?</span>
                    <div className="flex gap-2">
                      <Button
                        variant={helpfulVotes['particle-signatures'] === 'yes' ? "default" : "outline"}
                        size="sm"
                        onClick={() => handleHelpfulVote('particle-signatures', 'yes')}
                      >
                        <ThumbsUp className="h-4 w-4 mr-1" />
                        Yes
                      </Button>
                      <Button
                        variant={helpfulVotes['particle-signatures'] === 'no' ? "default" : "outline"}
                        size="sm"
                        onClick={() => handleHelpfulVote('particle-signatures', 'no')}
                      >
                        <ThumbsDown className="h-4 w-4 mr-1" />
                        No
                      </Button>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </section>

          {/* Using the Classifier Section */}
          <section id="using-classifier" className="scroll-mt-6">
            <Card className="backdrop-blur-md bg-card/50 border-white/10">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Settings className="h-5 w-5" />
                  Using the Classifier
                </CardTitle>
                <CardDescription>
                  Complete guide to the Event Classifier interface and features
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <Tabs defaultValue="single" className="w-full">
                  <TabsList className="grid w-full grid-cols-2">
                    <TabsTrigger value="single">Single Event</TabsTrigger>
                    <TabsTrigger value="batch">Batch Processing</TabsTrigger>
                  </TabsList>
                  
                  <TabsContent value="single" className="space-y-4">
                    <h3 className="text-lg font-semibold">Single Event Classification</h3>
                    <div className="space-y-4">
                      <div className="bg-slate-900/50 rounded-lg p-4">
                        <h4 className="font-semibold mb-2">Required Input Fields</h4>
                        <ul className="space-y-2 text-sm text-muted-foreground">
                          <li><strong>Energy (keV):</strong> Total energy deposited in the detector</li>
                          <li><strong>S1 Signal:</strong> Prompt scintillation light (photoelectrons)</li>
                          <li><strong>S2 Signal:</strong> Proportional scintillation light (photoelectrons)</li>
                          <li><strong>Position (optional):</strong> X, Y, Z coordinates in detector</li>
                        </ul>
                      </div>
                      <Button onClick={() => navigateToPage('/classifier')}>
                        Try Single Event Classifier
                        <ExternalLink className="h-4 w-4 ml-2" />
                      </Button>
                    </div>
                  </TabsContent>
                  
                  <TabsContent value="batch" className="space-y-4">
                    <h3 className="text-lg font-semibold">Batch Processing</h3>
                    <div className="space-y-4">
                      <div className="bg-slate-900/50 rounded-lg p-4">
                        <h4 className="font-semibold mb-2">Supported File Formats</h4>
                        <ul className="space-y-2 text-sm text-muted-foreground">
                          <li><strong>CSV:</strong> Comma-separated values with headers</li>
                          <li><strong>JSON:</strong> Array of event objects</li>
                          <li><strong>HDF5:</strong> Hierarchical data format (coming soon)</li>
                        </ul>
                      </div>
                      <div className="bg-slate-900/50 rounded-lg p-4">
                        <h4 className="font-semibold mb-2">Example CSV Format</h4>
                        <pre className="text-xs bg-black/30 p-3 rounded overflow-x-auto">
{`energy,s1,s2,x,y,z
12.5,45,320,10.2,-5.7,25.3
8.2,120,180,0.0,0.0,30.1
15.3,67,1689,-8.5,12.4,15.8`}
                        </pre>
                      </div>
                    </div>
                  </TabsContent>
                </Tabs>

                {/* Was this helpful? */}
                <div className="border-t pt-4">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-muted-foreground">Was this section helpful?</span>
                    <div className="flex gap-2">
                      <Button
                        variant={helpfulVotes['using-classifier'] === 'yes' ? "default" : "outline"}
                        size="sm"
                        onClick={() => handleHelpfulVote('using-classifier', 'yes')}
                      >
                        <ThumbsUp className="h-4 w-4 mr-1" />
                        Yes
                      </Button>
                      <Button
                        variant={helpfulVotes['using-classifier'] === 'no' ? "default" : "outline"}
                        size="sm"
                        onClick={() => handleHelpfulVote('using-classifier', 'no')}
                      >
                        <ThumbsDown className="h-4 w-4 mr-1" />
                        No
                      </Button>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </section>

          {/* Interpreting Results Section */}
          <section id="interpreting-results" className="scroll-mt-6">
            <Card className="backdrop-blur-md bg-card/50 border-white/10">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <BarChart3 className="h-5 w-5" />
                  Interpreting Results
                </CardTitle>
                <CardDescription>
                  Understanding classification output and confidence scores
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid md:grid-cols-2 gap-6">
                  <div className="space-y-4">
                    <h3 className="text-lg font-semibold">Confidence Scores</h3>
                    <div className="space-y-3">
                      <div className="flex items-center gap-3 p-3 bg-green-500/10 rounded-lg">
                        <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                        <div>
                          <div className="font-semibold">90-100%</div>
                          <div className="text-xs text-muted-foreground">Very High Confidence</div>
                        </div>
                      </div>
                      <div className="flex items-center gap-3 p-3 bg-blue-500/10 rounded-lg">
                        <div className="w-3 h-3 bg-blue-500 rounded-full"></div>
                        <div>
                          <div className="font-semibold">80-89%</div>
                          <div className="text-xs text-muted-foreground">High Confidence</div>
                        </div>
                      </div>
                      <div className="flex items-center gap-3 p-3 bg-yellow-500/10 rounded-lg">
                        <div className="w-3 h-3 bg-yellow-500 rounded-full"></div>
                        <div>
                          <div className="font-semibold">70-79%</div>
                          <div className="text-xs text-muted-foreground">Medium Confidence</div>
                        </div>
                      </div>
                      <div className="flex items-center gap-3 p-3 bg-red-500/10 rounded-lg">
                        <div className="w-3 h-3 bg-red-500 rounded-full"></div>
                        <div>
                          <div className="font-semibold">&lt;70%</div>
                          <div className="text-xs text-muted-foreground">Low Confidence (Review)</div>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="space-y-4">
                    <h3 className="text-lg font-semibold">Visualization Guide</h3>
                    <div className="space-y-3 text-sm">
                      <div>
                        <strong>3D Feature Space:</strong> Explore energy vs S1 vs S2 relationships
                      </div>
                      <div>
                        <strong>Timeline View:</strong> Analyze temporal patterns and anomaly clustering
                      </div>
                      <div>
                        <strong>Distribution Histograms:</strong> Compare feature distributions across particle types
                      </div>
                      <div>
                        <strong>Scatter Plots:</strong> Identify separation boundaries between particle classes
                      </div>
                    </div>
                  </div>
                </div>

                <Button onClick={() => navigateToPage('/results')}>
                  Explore Results Dashboard
                  <ExternalLink className="h-4 w-4 ml-2" />
                </Button>

                {/* Was this helpful? */}
                <div className="border-t pt-4">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-muted-foreground">Was this section helpful?</span>
                    <div className="flex gap-2">
                      <Button
                        variant={helpfulVotes['interpreting-results'] === 'yes' ? "default" : "outline"}
                        size="sm"
                        onClick={() => handleHelpfulVote('interpreting-results', 'yes')}
                      >
                        <ThumbsUp className="h-4 w-4 mr-1" />
                        Yes
                      </Button>
                      <Button
                        variant={helpfulVotes['interpreting-results'] === 'no' ? "default" : "outline"}
                        size="sm"
                        onClick={() => handleHelpfulVote('interpreting-results', 'no')}
                      >
                        <ThumbsDown className="h-4 w-4 mr-1" />
                        No
                      </Button>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </section>

          {/* Anomaly Detection Section */}
          <section id="anomaly-detection" className="scroll-mt-6">
            <Card className="backdrop-blur-md bg-card/50 border-white/10">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <AlertTriangle className="h-5 w-5" />
                  Anomaly Detection
                </CardTitle>
                <CardDescription>
                  Understanding and managing anomalous events
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="bg-yellow-500/10 border border-yellow-500/20 rounded-lg p-4">
                  <h3 className="text-lg font-semibold mb-2 text-yellow-300">What Triggers an Anomaly?</h3>
                  <ul className="space-y-2 text-sm text-muted-foreground">
                    <li>• Confidence score below 70%</li>
                    <li>• Unusual feature combinations (energy, S1, S2)</li>
                    <li>• Events outside expected parameter ranges</li>
                    <li>• Multiple scatter signatures</li>
                    <li>• Timing anomalies or clustering</li>
                  </ul>
                </div>

                <div className="grid md:grid-cols-3 gap-4">
                  <div className="bg-red-500/10 border border-red-500/20 rounded-lg p-4">
                    <h4 className="font-semibold text-red-300 mb-2">Critical</h4>
                    <p className="text-sm text-muted-foreground">
                      Requires immediate attention. Possible detector malfunction or extraordinary event.
                    </p>
                  </div>
                  <div className="bg-yellow-500/10 border border-yellow-500/20 rounded-lg p-4">
                    <h4 className="font-semibold text-yellow-300 mb-2">Moderate</h4>
                    <p className="text-sm text-muted-foreground">
                      Unusual but explainable. Review within 24 hours for pattern analysis.
                    </p>
                  </div>
                  <div className="bg-blue-500/10 border border-blue-500/20 rounded-lg p-4">
                    <h4 className="font-semibold text-blue-300 mb-2">Minor</h4>
                    <p className="text-sm text-muted-foreground">
                      Low priority. May indicate calibration drift or environmental effects.
                    </p>
                  </div>
                </div>

                {/* Was this helpful? */}
                <div className="border-t pt-4">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-muted-foreground">Was this section helpful?</span>
                    <div className="flex gap-2">
                      <Button
                        variant={helpfulVotes['anomaly-detection'] === 'yes' ? "default" : "outline"}
                        size="sm"
                        onClick={() => handleHelpfulVote('anomaly-detection', 'yes')}
                      >
                        <ThumbsUp className="h-4 w-4 mr-1" />
                        Yes
                      </Button>
                      <Button
                        variant={helpfulVotes['anomaly-detection'] === 'no' ? "default" : "outline"}
                        size="sm"
                        onClick={() => handleHelpfulVote('anomaly-detection', 'no')}
                      >
                        <ThumbsDown className="h-4 w-4 mr-1" />
                        No
                      </Button>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </section>

          {/* API Reference Section */}
          <section id="api-reference" className="scroll-mt-6">
            <Card className="backdrop-blur-md bg-card/50 border-white/10">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Code className="h-5 w-5" />
                  API Reference
                </CardTitle>
                <CardDescription>
                  Technical documentation for developers
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold">Classification Endpoint</h3>
                  <div className="bg-black/30 rounded-lg p-4 overflow-x-auto">
                    <pre className="text-sm">
{`POST /api/classify
Content-Type: application/json

{
  "events": [
    {
      "energy": 12.5,
      "s1": 45,
      "s2": 320,
      "position": { "x": 10.2, "y": -5.7, "z": 25.3 }
    }
  ],
  "options": {
    "confidence_threshold": 0.7,
    "include_reasoning": true
  }
}`}
                    </pre>
                  </div>
                </div>

                <div className="space-y-4">
                  <h3 className="text-lg font-semibold">Response Format</h3>
                  <div className="bg-black/30 rounded-lg p-4 overflow-x-auto">
                    <pre className="text-sm">
{`{
  "results": [
    {
      "id": "evt_001",
      "prediction": "WIMP",
      "confidence": 0.87,
      "probabilities": {
        "WIMP": 0.87,
        "Background": 0.08,
        "Neutrino": 0.03,
        "Axion": 0.02
      },
      "reasoning": "Low S2/S1 ratio consistent with nuclear recoil...",
      "features": {
        "s2_s1_ratio": 7.11,
        "energy_scaled": 0.23
      }
    }
  ],
  "metadata": {
    "model_version": "v2.1.0",
    "processing_time_ms": 156
  }
}`}
                    </pre>
                  </div>
                </div>

                {/* Was this helpful? */}
                <div className="border-t pt-4">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-muted-foreground">Was this section helpful?</span>
                    <div className="flex gap-2">
                      <Button
                        variant={helpfulVotes['api-reference'] === 'yes' ? "default" : "outline"}
                        size="sm"
                        onClick={() => handleHelpfulVote('api-reference', 'yes')}
                      >
                        <ThumbsUp className="h-4 w-4 mr-1" />
                        Yes
                      </Button>
                      <Button
                        variant={helpfulVotes['api-reference'] === 'no' ? "default" : "outline"}
                        size="sm"
                        onClick={() => handleHelpfulVote('api-reference', 'no')}
                      >
                        <ThumbsDown className="h-4 w-4 mr-1" />
                        No
                      </Button>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </section>

          {/* FAQs Section */}
          <section id="faqs" className="scroll-mt-6">
            <Card className="backdrop-blur-md bg-card/50 border-white/10">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <HelpCircle className="h-5 w-5" />
                  Frequently Asked Questions
                </CardTitle>
                <CardDescription>
                  Common questions and troubleshooting tips
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Accordion type="single" collapsible className="space-y-2">
                  {faqItems.map((faq, index) => (
                    <AccordionItem key={index} value={`faq-${index}`} className="border-none">
                      <Card className="backdrop-blur-md bg-card/30 border-white/5">
                        <AccordionTrigger className="hover:no-underline p-0">
                          <CardHeader>
                            <CardTitle className="text-left text-base">{faq.question}</CardTitle>
                          </CardHeader>
                        </AccordionTrigger>
                        <AccordionContent className="p-0">
                          <CardContent className="pt-0">
                            <p className="text-muted-foreground">{faq.answer}</p>
                          </CardContent>
                        </AccordionContent>
                      </Card>
                    </AccordionItem>
                  ))}
                </Accordion>

                {/* Was this helpful? */}
                <div className="border-t pt-4 mt-6">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-muted-foreground">Was this section helpful?</span>
                    <div className="flex gap-2">
                      <Button
                        variant={helpfulVotes['faqs'] === 'yes' ? "default" : "outline"}
                        size="sm"
                        onClick={() => handleHelpfulVote('faqs', 'yes')}
                      >
                        <ThumbsUp className="h-4 w-4 mr-1" />
                        Yes
                      </Button>
                      <Button
                        variant={helpfulVotes['faqs'] === 'no' ? "default" : "outline"}
                        size="sm"
                        onClick={() => handleHelpfulVote('faqs', 'no')}
                      >
                        <ThumbsDown className="h-4 w-4 mr-1" />
                        No
                      </Button>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </section>
        </div>
      </div>
    </PageLayout>
  );
};

export default Help;