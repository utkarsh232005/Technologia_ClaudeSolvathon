import PageLayout from '@/components/PageLayout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

const ResultsDashboard = () => {
  const stats = [
    { label: 'Total Events', value: '1,247', change: '+12%' },
    { label: 'WIMP Candidates', value: '34', change: '+5%' },
    { label: 'Classification Accuracy', value: '87.3%', change: '+2.1%' },
    { label: 'Processing Time', value: '2.4s', change: '-15%' },
  ];

  return (
    <PageLayout
      title="Results Dashboard"
      description="Visualize and analyze detection data with interactive insights"
    >
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
        {stats.map((stat, index) => (
          <Card key={index} className="backdrop-blur-md bg-card/50 border-white/10">
            <CardHeader className="pb-2">
              <CardDescription>{stat.label}</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-foreground mb-1">{stat.value}</div>
              <div className="text-sm text-primary">{stat.change} from last week</div>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card className="backdrop-blur-md bg-card/50 border-white/10">
          <CardHeader>
            <CardTitle>Energy Spectrum</CardTitle>
            <CardDescription>Distribution of recoil energies</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-64 flex items-end justify-around gap-2">
              {[65, 45, 80, 35, 55, 30, 25, 20, 15, 10].map((height, i) => (
                <div key={i} className="flex-1 bg-gradient-to-t from-primary to-secondary rounded-t" style={{ height: `${height}%` }} />
              ))}
            </div>
          </CardContent>
        </Card>

        <Card className="backdrop-blur-md bg-card/50 border-white/10">
          <CardHeader>
            <CardTitle>Event Classification</CardTitle>
            <CardDescription>Breakdown by particle type</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {[
                { label: 'WIMP Candidates', value: 34, total: 1247, color: 'bg-primary' },
                { label: 'Neutron Recoils', value: 156, total: 1247, color: 'bg-secondary' },
                { label: 'Gamma Events', value: 423, total: 1247, color: 'bg-accent' },
                { label: 'Background', value: 634, total: 1247, color: 'bg-muted' },
              ].map((item, i) => (
                <div key={i}>
                  <div className="flex justify-between text-sm mb-1">
                    <span className="text-foreground/80">{item.label}</span>
                    <span className="text-foreground font-medium">{item.value}</span>
                  </div>
                  <div className="h-2 bg-background/30 rounded-full overflow-hidden">
                    <div
                      className={`h-full ${item.color}`}
                      style={{ width: `${(item.value / item.total) * 100}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </PageLayout>
  );
};

export default ResultsDashboard;
