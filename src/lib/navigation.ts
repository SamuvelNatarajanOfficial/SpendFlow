import {
  CalendarRange,
  LayoutDashboard,
  Repeat,
  Settings,
  Sparkles,
  WalletCards,
} from 'lucide-react';
import type { NavItem } from '../types';

export const navItems: NavItem[] = [
  { label: 'Dashboard', path: '/dashboard', icon: LayoutDashboard },
  { label: 'Months', path: '/months', icon: CalendarRange },
  { label: 'Regular', path: '/regular', icon: Repeat },
  { label: 'Extra', path: '/extra', icon: Sparkles },
  { label: 'Presets', path: '/presets', icon: WalletCards },
  { label: 'Settings', path: '/settings', icon: Settings },
];

/**
 * Everything not already on the mobile bottom bar (Dashboard, Months, Add,
 * Extra) — surfaced through its "More" sheet instead, so no functionality
 * is lost to a 4-slot bar.
 */
export const moreNavItems: NavItem[] = navItems.filter((item) =>
  ['/regular', '/presets', '/settings'].includes(item.path),
);
