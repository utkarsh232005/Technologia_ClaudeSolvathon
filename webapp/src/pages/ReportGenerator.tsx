import PageLayout from '@/components/PageLayout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { FileText, Download, Send } from 'lucide-react';

const ReportGenerator = () => {
  return (
    <PageLayout
      title="Report Generator"
      description="Generate comprehensive analysis reports for your detection data"
    >
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Card className="backdrop-blur-md bg-card/50 border-white/10 lg:col-span-2">
          <CardHeader>
            <CardTitle>Report Configuration</CardTitle>
            <CardDescription>Customize your analysis report</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <label className="text-sm font-medium text-foreground/80">Report Title</label>
              <input
                type="text"
                className="w-full mt-1 px-4 py-2 rounded-lg bg-background/50 border border-white/10 text-foreground"
                placeholder="Q1 2025 WIMP Detection Analysis"
              />
            </div>
            <div>
              <label className="text-sm font-medium text-foreground/80">Date Range</label>
              <div className="flex gap-2 mt-1">
                <input
                  type="date"
                  className="w-full px-4 py-2 rounded-lg bg-background/50 border border-white/10 text-foreground"
                />
                <input
                  type="date"
                  className="w-full px-4 py-2 rounded-lg bg-background/50 border border-white/10 text-foreground"
                />
              </div>
            </div>
            <div>
              <label className="text-sm font-medium text-foreground/80">Include Sections</label>
              <div className="space-y-2 mt-2">
                {['Executive Summary', 'Energy Spectrum', 'Classification Results', 'Statistical Analysis', 'Conclusions'].map((section) => (
                  <label key={section} className="flex items-center gap-2 cursor-pointer">
                    <input type="checkbox" defaultChecked className="rounded" />
                    <span className="text-foreground/70">{section}</span>
                  </label>
                ))}
              </div>
            </div>
            <div className="flex gap-2 pt-4">
              <Button className="flex-1 bg-gradient-to-r from-primary to-secondary hover:opacity-90">
                <FileText className="w-4 h-4 mr-2" />
                Generate Report
              </Button>
              <Button variant="outline" className="border-white/10 hover:bg-white/5">
                <Download className="w-4 h-4 mr-2" />
                PDF
              </Button>
            </div>
          </CardContent>
        </Card>

        <Card className="backdrop-blur-md bg-card/50 border-white/10">
          <CardHeader>
            <CardTitle>Recent Reports</CardTitle>
            <CardDescription>Previously generated analysis reports</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            {[
              { title: 'December 2024 Analysis', date: '2024-12-31', size: '2.4 MB' },
              { title: 'November 2024 Analysis', date: '2024-11-30', size: '2.1 MB' },
              { title: 'October 2024 Analysis', date: '2024-10-31', size: '2.3 MB' },
            ].map((report, i) => (
              <div key={i} className="p-3 rounded-lg bg-background/30 border border-white/5 hover:bg-background/40 transition-colors cursor-pointer">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="font-medium text-foreground text-sm">{report.title}</div>
                    <div className="text-xs text-muted-foreground mt-1">
                      {report.date} • {report.size}
                    </div>
                  </div>
                  <Button variant="ghost" size="icon" className="h-8 w-8">
                    <Download className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            ))}
            <Button variant="outline" className="w-full border-white/10 hover:bg-white/5">
              <Send className="w-4 h-4 mr-2" />
              Share Report
            </Button>
          </CardContent>
        </Card>
      </div>
    </PageLayout>
  );
};

export default ReportGenerator;
