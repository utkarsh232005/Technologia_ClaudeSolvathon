import { Home, Beaker, Search, BarChart, FileText, Settings, HelpCircle, AlertTriangle } from 'lucide-react';
import { NavLink } from 'react-router-dom';
import { AnimatedSidebarLink, useAnimatedSidebar } from '@/components/ui/animated-sidebar';
import { motion } from 'motion/react';
import { IconAtom } from '@tabler/icons-react';

const menuItems = [
  { label: 'Home', href: '/', icon: Home },
  { label: 'Data Generator', href: '/data-generator', icon: Beaker },
  { label: 'Event Classifier', href: '/classifier', icon: Search },
  { label: 'Anomaly Detection', href: '/anomaly-detection', icon: AlertTriangle },
  { label: 'Results Dashboard', href: '/results', icon: BarChart },
  { label: 'Report Generator', href: '/reports', icon: FileText },
  { label: 'Settings', href: '/settings', icon: Settings },
  { label: 'Help', href: '/help', icon: HelpCircle },
];

export function AppSidebar() {
  const { open } = useAnimatedSidebar();

  return (
    <>
      <div className="flex flex-1 flex-col overflow-x-hidden overflow-y-auto">
        {open ? <Logo /> : <LogoIcon />}
        <div className="mt-8 flex flex-col gap-2">
          {menuItems.map((item, idx) => (
            <NavLink key={idx} to={item.href} className="no-underline">
              {({ isActive }) => (
                <AnimatedSidebarLink
                  link={{
                    label: item.label,
                    href: item.href,
                    icon: <item.icon className={`h-5 w-5 shrink-0 ${isActive ? 'text-blue-400' : 'text-white'}`} />,
                  }}
                  className={isActive ? 'bg-white/10 rounded-md' : ''}
                />
              )}
            </NavLink>
          ))}
        </div>
      </div>
    </>
  );
}

const Logo = () => {
  return (
    <a
      href="/"
      className="relative z-20 flex items-center space-x-2 py-1 text-sm font-normal text-white"
    >
      <div className="h-6 w-6 shrink-0 rounded-full bg-gradient-to-r from-blue-500 to-purple-600 flex items-center justify-center">
        <IconAtom className="h-4 w-4 text-white" />
      </div>
      <motion.span
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="font-bold whitespace-pre text-white"
      >
        Dark Signal AI
      </motion.span>
    </a>
  );
};

const LogoIcon = () => {
  return (
    <a
      href="/"
      className="relative z-20 flex items-center space-x-2 py-1 text-sm font-normal text-white"
    >
      <div className="h-6 w-6 shrink-0 rounded-full bg-gradient-to-r from-blue-500 to-purple-600 flex items-center justify-center">
        <IconAtom className="h-4 w-4 text-white" />
      </div>
    </a>
  );
};
