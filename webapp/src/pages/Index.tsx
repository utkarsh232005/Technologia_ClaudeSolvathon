import { Database, Brain, BarChart3, Settings, FileText, ArrowRight, Zap, Search, Shield, TrendingUp, CheckCircle, Wifi } from 'lucide-react';
import { Link } from 'react-router-dom';
import ParticleBackground from '@/components/ParticleBackground';
import FeatureCard from '@/components/FeatureCard';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import PageLayout from "@/components/PageLayout";

const Index = () => {
  const features = [
    {
      icon: Database,
      title: 'Generate Data',
      description: 'Create synthetic particle events with realistic detector responses and nuclear recoil characteristics.',
      href: '/data-generator',
      stats: '10M+ samples'
    },
    {
      icon: Brain,
      title: 'Classify Events',
      description: 'AI-powered classification to distinguish WIMP signals from background noise with high accuracy.',
      href: '/classifier',
      stats: '99.2% accuracy'
    },
    {
      icon: BarChart3,
      title: 'Explore Results',
      description: 'Visualize and analyze detection data with interactive charts and statistical insights.',
      href: '/results',
      stats: 'Real-time analytics'
    },
  ];

  const stats = [
    { value: '2.4M+', label: 'Events Analyzed', icon: Zap },
    { value: '0.003%', label: 'Detection Rate', icon: Search },
    { value: '99.7%', label: 'Confidence Level', icon: Shield },
    { value: '847', label: 'Active Detectors', icon: TrendingUp },
  ];

  return (
    <PageLayout 
      title="Dark Matter Detection Analysis Platform"
      description="Advanced AI-powered tools for analyzing dark matter detection events and particle collision data"
      showFooter={true}
    >
      <div className="space-y-12 animate-fade-in">
        {/* Hero Section */}
        <section className="text-center space-y-8">
          <div className="max-w-4xl mx-auto">
            <div className="inline-block mb-6 px-4 py-2 rounded-full bg-primary/10 border border-primary/20 backdrop-blur-sm animate-fade-in" 
                 style={{ animationDelay: '200ms' }}>
              <span className="text-sm text-primary font-medium">Advanced Particle Physics Analysis</span>
            </div>
            
            <h1 className="text-4xl md:text-6xl lg:text-7xl title-gradient mb-6 leading-tight"
                style={{ animationDelay: '400ms' }}>
              Dark Matter Detection
            </h1>
            
            <p className="text-lg md:text-xl lg:text-2xl text-muted-foreground mb-4 animate-fade-in"
               style={{ animationDelay: '600ms' }}>
              AI-Powered Analysis
            </p>
            
            <p className="text-base md:text-lg text-muted-foreground/80 max-w-2xl mx-auto mb-8 leading-relaxed animate-fade-in"
               style={{ animationDelay: '800ms' }}>
              Harness the power of artificial intelligence to analyze WIMP interactions in liquid xenon detectors. 
              Detect, classify, and visualize dark matter signals with unprecedented precision.
            </p>

            <div className="flex flex-col sm:flex-row gap-4 justify-center animate-fade-in"
                 style={{ animationDelay: '1000ms' }}>
              <Button asChild size="lg" variant="premium" className="px-8 py-3 font-medium group">
                <Link to="/data-generator" className="flex items-center gap-2">
                  Start Analysis
                  <ArrowRight className="h-4 w-4 transition-transform duration-300 group-hover:translate-x-1" />
                </Link>
              </Button>
              <Button asChild variant="outline" size="lg" className="px-8 py-3 backdrop-blur-md bg-white/5 border-white/10 hover:bg-white/10 hover-lift transition-smooth">
                <Link to="/results">View Results</Link>
              </Button>
            </div>
          </div>
        </section>

        {/* Stats Section */}
        <section className="animate-fade-in" style={{ animationDelay: '1200ms' }}>
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-6 md:gap-8">
            {stats.map((stat, index) => (
              <div 
                key={index} 
                className="stat-card text-center"
                style={{ animationDelay: `${1400 + index * 150}ms` }}
              >
                <div className="flex items-center justify-center mb-4">
                  <stat.icon className="h-8 w-8 stat-icon" />
                </div>
                <div className="stat-number mb-2">
                  {stat.value}
                </div>
                <div className="text-sm md:text-base text-muted-foreground font-medium">
                  {stat.label}
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Feature Cards */}
        <section className="space-y-6">
          <h2 className="text-2xl md:text-3xl font-bold text-center animate-fade-in" style={{ animationDelay: '1800ms' }}>
            Comprehensive Analysis Tools
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 lg:gap-8">
            {features.map((feature, index) => (
              <div key={index} className="group" 
                   style={{ animationDelay: `${2000 + index * 200}ms` }}>
                <Card className="feature-card h-full">
                  <CardHeader>
                    <div className="feature-icon-container mb-4">
                      <feature.icon className="w-6 h-6 text-white" />
                    </div>
                    <CardTitle className="text-xl">{feature.title}</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-muted-foreground mb-4">{feature.description}</p>
                    <div className="flex items-center justify-between">
                      <Badge className="badge-premium">
                        {feature.stats}
                      </Badge>
                      <Button asChild variant="ghost" size="sm" className="feature-arrow-button opacity-0 group-hover:opacity-100 transition-all duration-300">
                        <Link to={feature.href}>
                          <ArrowRight className="h-4 w-4" />
                        </Link>
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              </div>
            ))}
          </div>
        </section>

        {/* System Status */}
        <section className="animate-fade-in" style={{ animationDelay: '2500ms' }}>
          <Card className="glass-card">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <div className="w-3 h-3 bg-green-400 rounded-full animate-pulse-slow"></div>
                System Status
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                <div className="flex items-center justify-between">
                  <span className="text-muted-foreground">API Status</span>
                  <Badge className="badge-success">
                    <CheckCircle className="w-3 h-3" />
                    Online
                  </Badge>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-muted-foreground">Data Pipeline</span>
                  <Badge className="badge-premium">
                    <Database className="w-3 h-3" />
                    Processing
                  </Badge>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-muted-foreground">ML Models</span>
                  <Badge className="badge-premium">
                    <Brain className="w-3 h-3" />
                    Ready
                  </Badge>
                </div>
              </div>
            </CardContent>
          </Card>
        </section>

        {/* Quick Actions */}
        <section className="flex flex-col sm:flex-row gap-4 justify-center animate-fade-in" style={{ animationDelay: '2800ms' }}>
          <Button asChild variant="outline" className="hover-lift transition-smooth">
            <Link to="/settings" className="flex items-center gap-2">
              <Settings className="h-4 w-4" />
              Configure Settings
            </Link>
          </Button>
          <Button asChild variant="outline" className="hover-lift transition-smooth">
            <Link to="/help" className="flex items-center gap-2">
              <FileText className="h-4 w-4" />
              Documentation
            </Link>
          </Button>
        </section>
      </div>
    </PageLayout>
  );
};

export default Index;
