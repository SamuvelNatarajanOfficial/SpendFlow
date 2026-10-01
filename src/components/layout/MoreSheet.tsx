import { NavLink } from 'react-router-dom';
import { Modal } from '../ui/Modal';
import { moreNavItems } from '../../lib/navigation';
import { cn } from '../../utils/cn';

export interface MoreSheetProps {
  isOpen: boolean;
  onClose: () => void;
}

/** The mobile bottom bar only has 5 slots — everything else lives here. */
export function MoreSheet({ isOpen, onClose }: MoreSheetProps) {
  return (
    <Modal isOpen={isOpen} onClose={onClose} title="More">
      <nav aria-label="More" className="flex flex-col gap-1">
        {moreNavItems.map((item) => (
          <NavLink
            key={item.path}
            to={item.path}
            onClick={onClose}
            className={({ isActive }) =>
              cn(
                'flex min-h-11 items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors',
                isActive ? 'bg-primary/10 text-primary' : 'text-text hover:bg-slate-100',
              )
            }
          >
            <item.icon className="size-5" aria-hidden="true" />
            {item.label}
          </NavLink>
        ))}
      </nav>
    </Modal>
  );
}
