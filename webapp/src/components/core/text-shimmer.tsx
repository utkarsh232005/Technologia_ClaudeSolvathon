import { CSSProperties, FC, ReactNode } from 'react';
import { cn } from '@/lib/utils';

interface TextShimmerProps {
    children: ReactNode;
    className?: string;
    duration?: number;
    spread?: number;
}

export const TextShimmer: FC<TextShimmerProps> = ({
    children,
    className,
    duration = 1.2,
    spread = 2,
}) => {
    return (
        <span
            className={cn(
                'inline-block bg-clip-text text-transparent bg-gradient-to-r animate-shimmer',
                className
            )}
            style={
                {
                    '--shimmer-duration': `${duration}s`,
                    '--shimmer-spread': spread,
                    backgroundImage:
                        'linear-gradient(90deg, var(--base-color) 0%, var(--base-gradient-color) 50%, var(--base-color) 100%)',
                    backgroundSize: '200% 100%',
                    animation: `shimmer var(--shimmer-duration) ease-in-out infinite`,
                } as CSSProperties
            }
        >
            {children}
        </span>
    );
};

// Add the shimmer animation to your global CSS or tailwind config
// @keyframes shimmer {
//   0% { background-position: 200% 0; }
//   100% { background-position: -200% 0; }
// }
