import { NavLink } from 'react-router-dom';
import { Wallet } from 'lucide-react';
import { navItems } from '../../lib/navigation';
import { cn } from '../../utils/cn';

export function Sidebar() {
  return (
    <aside className="hidden h-screen w-64 shrink-0 flex-col border-r border-border bg-card px-4 py-6 md:flex">
      <div className="mb-8 flex items-center gap-2 px-2">
        <div className="flex size-9 items-center justify-center rounded-lg bg-primary/10">
          <Wallet className="size-5 text-primary" aria-hidden="true" />
        </div>
        <div className="flex flex-col leading-tight">
          <span className="font-semibold text-text">SpendFlow</span>
          <span className="text-xs text-muted">Salary &amp; Expense Planner</span>
        </div>
      </div>
      <nav aria-label="Primary" className="flex flex-col gap-1">
        {navItems.map((item) => (
          <NavLink
            key={item.path}
            to={item.path}
            className={({ isActive }) =>
              cn(
                'flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors',
                isActive
                  ? 'bg-primary/10 text-primary'
                  : 'text-muted hover:bg-slate-100 hover:text-text',
              )
            }
          >
            <item.icon className="size-5" aria-hidden="true" />
            {item.label}
          </NavLink>
        ))}
      </nav>
    </aside>
  );
}
