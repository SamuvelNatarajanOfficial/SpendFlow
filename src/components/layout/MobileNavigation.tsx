import { useState } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import {
  LayoutDashboard,
  CalendarRange,
  Plus,
  Sparkles,
  MoreHorizontal,
} from 'lucide-react';
import { MoreSheet } from './MoreSheet';
import { cn } from '../../utils/cn';

const linkClassName = ({ isActive }: { isActive: boolean }) =>
  cn(
    'flex flex-1 flex-col items-center gap-1 py-2.5 text-xs font-medium transition-colors',
    isActive ? 'text-primary' : 'text-muted',
  );

export function MobileNavigation() {
  const navigate = useNavigate();
  const [isMoreOpen, setIsMoreOpen] = useState(false);

  return (
    <>
      <nav
        aria-label="Primary"
        className="fixed inset-x-0 bottom-0 z-40 flex border-t border-border bg-card pb-[env(safe-area-inset-bottom)] md:hidden"
      >
        <NavLink to="/dashboard" className={linkClassName}>
          <LayoutDashboard className="size-5" aria-hidden="true" />
          Dashboard
        </NavLink>
        <NavLink to="/months" className={linkClassName}>
          <CalendarRange className="size-5" aria-hidden="true" />
          Months
        </NavLink>

        <div className="flex flex-1 items-center justify-center">
          <button
            type="button"
            aria-label="Add Extra item"
            onClick={() => navigate('/extra', { state: { openAddModal: true } })}
            className={cn(
              'flex size-11 -translate-y-2 items-center justify-center rounded-full bg-primary text-white shadow-md',
              'transition-transform hover:scale-105 active:scale-95',
              'focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary',
            )}
          >
            <Plus className="size-6" aria-hidden="true" />
          </button>
        </div>

        <NavLink to="/extra" className={linkClassName}>
          <Sparkles className="size-5" aria-hidden="true" />
          Extra
        </NavLink>
        <button
          type="button"
          onClick={() => setIsMoreOpen(true)}
          aria-label="More navigation options"
          className="flex flex-1 flex-col items-center gap-1 py-2.5 text-xs font-medium text-muted transition-colors"
        >
          <MoreHorizontal className="size-5" aria-hidden="true" />
          More
        </button>
      </nav>

      <MoreSheet isOpen={isMoreOpen} onClose={() => setIsMoreOpen(false)} />
    </>
  );
}
