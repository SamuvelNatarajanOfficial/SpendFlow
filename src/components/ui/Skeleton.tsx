import { cn } from '../../utils/cn';

export interface SkeletonProps {
  className?: string;
}

/** A single pulsing placeholder block — compose a few to sketch a layout. */
export function Skeleton({ className }: SkeletonProps) {
  return (
    <div
      aria-hidden="true"
      className={cn('animate-pulse rounded-md bg-slate-200', className)}
    />
  );
}
