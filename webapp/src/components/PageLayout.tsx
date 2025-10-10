import { ReactNode } from 'react';
import ParticleBackground from './ParticleBackground';

interface PageLayoutProps {
  children: ReactNode;
  title: string;
  description?: string;
}

const PageLayout = ({ children, title, description }: PageLayoutProps) => {
  return (
    <div className="min-h-screen bg-gradient-to-b from-background via-background to-card relative overflow-hidden">
      <ParticleBackground />
      
      <div className="relative z-10 p-8">
        <div className="mb-8">
          <h1 className="text-4xl font-bold mb-2 bg-gradient-to-r from-primary via-secondary to-accent bg-clip-text text-transparent">
            {title}
          </h1>
          {description && (
            <p className="text-muted-foreground text-lg">{description}</p>
          )}
        </div>
        
        {children}
      </div>
    </div>
  );
};

export default PageLayout;
