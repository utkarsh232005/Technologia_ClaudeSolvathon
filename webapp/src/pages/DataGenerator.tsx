import PageLayout from '@/components/PageLayout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Zap, Download } from 'lucide-react';

const DataGenerator = () => {
  return (
    <PageLayout
      title="Data Generator"
      description="Generate synthetic WIMP interaction events with realistic detector responses"
    >
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card className="backdrop-blur-md bg-card/50 border-white/10">
          <CardHeader>
            <CardTitle>Event Configuration</CardTitle>
            <CardDescription>Configure the parameters for synthetic event generation</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <label className="text-sm font-medium text-foreground/80">Number of Events</label>
              <input
                type="number"
                className="w-full mt-1 px-4 py-2 rounded-lg bg-background/50 border border-white/10 text-foreground"
                placeholder="100"
                defaultValue={100}
              />
            </div>
            <div>
              <label className="text-sm font-medium text-foreground/80">Energy Range (keV)</label>
              <div className="flex gap-2 mt-1">
                <input
                  type="number"
                  className="w-full px-4 py-2 rounded-lg bg-background/50 border border-white/10 text-foreground"
                  placeholder="Min"
                  defaultValue={1}
                />
                <input
                  type="number"
                  className="w-full px-4 py-2 rounded-lg bg-background/50 border border-white/10 text-foreground"
                  placeholder="Max"
                  defaultValue={50}
                />
              </div>
            </div>
            <Button className="w-full bg-gradient-to-r from-primary to-secondary hover:opacity-90">
              <Zap className="w-4 h-4 mr-2" />
              Generate Events
            </Button>
          </CardContent>
        </Card>

        <Card className="backdrop-blur-md bg-card/50 border-white/10">
          <CardHeader>
            <CardTitle>Generated Events</CardTitle>
            <CardDescription>Preview of recently generated event data</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-2 mb-4">
              <div className="p-3 rounded-lg bg-background/30 border border-white/5">
                <div className="text-sm font-mono text-foreground/70">Event #1: 12.3 keV</div>
              </div>
              <div className="p-3 rounded-lg bg-background/30 border border-white/5">
                <div className="text-sm font-mono text-foreground/70">Event #2: 8.7 keV</div>
              </div>
              <div className="p-3 rounded-lg bg-background/30 border border-white/5">
                <div className="text-sm font-mono text-foreground/70">Event #3: 23.1 keV</div>
              </div>
            </div>
            <Button variant="outline" className="w-full border-white/10 hover:bg-white/5">
              <Download className="w-4 h-4 mr-2" />
              Export Data
            </Button>
          </CardContent>
        </Card>
      </div>
    </PageLayout>
  );
};

export default DataGenerator;
