import PageLayout from '@/components/PageLayout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Upload, Brain } from 'lucide-react';

const EventClassifier = () => {
  return (
    <PageLayout
      title="Event Classifier"
      description="AI-powered classification to distinguish WIMP signals from background noise"
    >
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Card className="backdrop-blur-md bg-card/50 border-white/10 lg:col-span-2">
          <CardHeader>
            <CardTitle>Upload Event Data</CardTitle>
            <CardDescription>Upload your event data for AI classification</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="border-2 border-dashed border-white/20 rounded-lg p-12 text-center hover:border-primary/50 transition-colors cursor-pointer">
              <Upload className="w-12 h-12 mx-auto mb-4 text-muted-foreground" />
              <p className="text-foreground/80 mb-2">Drop your data file here or click to browse</p>
              <p className="text-sm text-muted-foreground">Supports CSV, JSON formats</p>
            </div>
            <Button className="w-full mt-4 bg-gradient-to-r from-primary to-secondary hover:opacity-90">
              <Brain className="w-4 h-4 mr-2" />
              Start Classification
            </Button>
          </CardContent>
        </Card>

        <Card className="backdrop-blur-md bg-card/50 border-white/10">
          <CardHeader>
            <CardTitle>Model Info</CardTitle>
            <CardDescription>Current AI model specifications</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <div className="text-sm text-muted-foreground mb-1">Model Version</div>
              <div className="text-lg font-semibold text-foreground">v2.1.3</div>
            </div>
            <div>
              <div className="text-sm text-muted-foreground mb-1">Accuracy</div>
              <div className="text-lg font-semibold text-primary">87.3%</div>
            </div>
            <div>
              <div className="text-sm text-muted-foreground mb-1">Training Events</div>
              <div className="text-lg font-semibold text-foreground">10,000+</div>
            </div>
            <div>
              <div className="text-sm text-muted-foreground mb-1">Classifications</div>
              <div className="flex gap-2 flex-wrap mt-2">
                {['WIMP', 'Neutron', 'Gamma', 'Background'].map((type) => (
                  <span
                    key={type}
                    className="px-3 py-1 rounded-full text-xs bg-primary/20 text-primary border border-primary/30"
                  >
                    {type}
                  </span>
                ))}
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </PageLayout>
  );
};

export default EventClassifier;
