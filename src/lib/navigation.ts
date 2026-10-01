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

/** Subset shown in the mobile bottom nav — kept short to fit touch targets. */
export const mobileNavItems: NavItem[] = navItems.filter((item) =>
  ['/dashboard', '/months', '/regular', '/extra', '/presets'].includes(item.path),
);
