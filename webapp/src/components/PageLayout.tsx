import { ReactNode } from 'react';
import ParticleBackground from './ParticleBackground';
import { Footer } from './Footer';

interface PageLayoutProps {
  children: ReactNode;
  title: string;
  description?: string;
  showFooter?: boolean;
}

const PageLayout = ({ children, title, description, showFooter = true }: PageLayoutProps) => {
  return (
    <div className="min-h-screen bg-gradient-to-b from-background via-background to-card relative overflow-hidden flex flex-col">
      <ParticleBackground />
      
      <div className="relative z-10 flex-1 flex flex-col">
        <div className="p-4 sm:p-6 lg:p-8 flex-1">
          <div className="mb-6 sm:mb-8">
            <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold mb-2 bg-gradient-to-r from-primary via-secondary to-accent bg-clip-text text-transparent page-transition">
              {title}
            </h1>
            {description && (
              <p className="text-muted-foreground text-base sm:text-lg page-transition">{description}</p>
            )}
          </div>
          
          <div className="page-transition">
            {children}
          </div>
        </div>
        
        {showFooter && <Footer />}
      </div>
    </div>
  );
};

export default PageLayout;
