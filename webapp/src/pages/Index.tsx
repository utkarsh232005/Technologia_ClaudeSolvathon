import { Database, Brain, BarChart3 } from 'lucide-react';
import { Link } from 'react-router-dom';
import ParticleBackground from '@/components/ParticleBackground';
import FeatureCard from '@/components/FeatureCard';
import { Button } from '@/components/ui/button';

const Index = () => {
  const features = [
    {
      icon: Database,
      title: 'Generate Data',
      description: 'Create synthetic particle events with realistic detector responses and nuclear recoil characteristics.',
    },
    {
      icon: Brain,
      title: 'Classify Events',
      description: 'AI-powered classification to distinguish WIMP signals from background noise with high accuracy.',
    },
    {
      icon: BarChart3,
      title: 'Explore Results',
      description: 'Visualize and analyze detection data with interactive charts and statistical insights.',
    },
  ];

  const stats = [
    { value: '1000+', label: 'Events Analyzed' },
    { value: '87%', label: 'Accuracy' },
    { value: '4', label: 'Particle Types' },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-b from-background via-background to-card relative overflow-hidden">
      <ParticleBackground />

      <main className="relative z-10 py-16">
        {/* Hero Section */}
        <section className="container mx-auto px-4 py-20 text-center">
          <div className="max-w-4xl mx-auto">
            <div className="inline-block mb-4 px-4 py-2 rounded-full bg-primary/10 border border-primary/20 backdrop-blur-sm">
              <span className="text-sm text-primary font-medium">Advanced Particle Physics Analysis</span>
            </div>
            
            <h1 className="text-5xl md:text-7xl font-bold mb-6 bg-gradient-to-r from-primary via-secondary to-accent bg-clip-text text-transparent leading-tight">
              Dark Matter Detection
            </h1>
            
            <p className="text-xl md:text-2xl text-muted-foreground mb-4">
              AI-Powered Analysis
            </p>
            
            <p className="text-lg text-muted-foreground/80 max-w-2xl mx-auto mb-8">
              Harness the power of artificial intelligence to analyze WIMP interactions in liquid xenon detectors. 
              Detect, classify, and visualize dark matter signals with unprecedented precision.
            </p>

            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button asChild className="px-8 py-3 bg-gradient-to-r from-primary to-secondary text-primary-foreground font-medium hover:opacity-90">
                <Link to="/data-generator">Start Analysis</Link>
              </Button>
              <Button asChild variant="outline" className="px-8 py-3 backdrop-blur-md bg-white/5 border-white/10 hover:bg-white/10">
                <Link to="/results">View Results</Link>
              </Button>
            </div>
          </div>
        </section>

        {/* Stats Bar */}
        <section className="container mx-auto px-4 py-8 mb-20">
          <div className="backdrop-blur-md bg-card/30 border border-white/10 rounded-2xl p-8">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {stats.map((stat, index) => (
                <div key={index} className="text-center">
                  <div className="text-4xl font-bold bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent mb-2">
                    {stat.value}
                  </div>
                  <div className="text-muted-foreground">{stat.label}</div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Feature Cards */}
        <section className="container mx-auto px-4 py-12">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {features.map((feature, index) => (
              <FeatureCard
                key={index}
                icon={feature.icon}
                title={feature.title}
                description={feature.description}
              />
            ))}
          </div>
        </section>
      </main>
    </div>
  );
};

export default Index;
