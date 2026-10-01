import { NavLink } from 'react-router-dom';
import { mobileNavItems } from '../../lib/navigation';
import { cn } from '../../utils/cn';

export function MobileNavigation() {
  return (
    <nav
      aria-label="Primary"
      className="fixed inset-x-0 bottom-0 z-40 flex border-t border-border bg-card pb-[env(safe-area-inset-bottom)] md:hidden"
    >
      {mobileNavItems.map((item) => (
        <NavLink
          key={item.path}
          to={item.path}
          className={({ isActive }) =>
            cn(
              'flex flex-1 flex-col items-center gap-1 py-2.5 text-xs font-medium transition-colors',
              isActive ? 'text-primary' : 'text-muted',
            )
          }
        >
          <item.icon className="size-5" aria-hidden="true" />
          {item.label}
        </NavLink>
      ))}
    </nav>
  );
}
