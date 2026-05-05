'use client';
import { cn } from '@/lib/utils';
import React from 'react';

type DottedSurfaceProps = Omit<React.ComponentProps<'div'>, 'ref'>;

export function DottedSurface({ className, ...props }: DottedSurfaceProps) {
    return (
        <div
            className={cn('pointer-events-none fixed inset-0 z-0', className)}
            style={{
                backgroundImage: 'radial-gradient(circle, currentColor 1px, transparent 1px)',
                backgroundSize: '28px 28px',
                color: 'hsl(var(--muted-foreground) / 0.25)',
            }}
            {...props}
        />
    );
}
