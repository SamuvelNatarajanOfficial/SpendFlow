import { useLocation } from 'react-router-dom';
import { Wallet } from 'lucide-react';
import { navItems } from '../../lib/navigation';

export function Header() {
  const location = useLocation();
  const activeItem = navItems.find((item) => item.path === location.pathname);

  return (
    <header className="sticky top-0 z-30 flex h-14 items-center justify-between border-b border-border bg-card px-4 md:h-16 md:px-8">
      <div className="flex items-center gap-2 md:hidden">
        <div className="flex size-8 items-center justify-center rounded-lg bg-primary/10">
          <Wallet className="size-4 text-primary" aria-hidden="true" />
        </div>
        <span className="font-semibold text-text">SpendFlow</span>
      </div>
      <h1 className="hidden text-lg font-semibold text-text md:block">
        {activeItem?.label ?? 'SpendFlow'}
      </h1>
      <div className="flex items-center gap-2 text-sm text-muted">
        <span className="hidden sm:inline">Personal workspace</span>
      </div>
    </header>
  );
}
