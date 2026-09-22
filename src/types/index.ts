export interface Bookmark {
  id: string;
  url: string;
  title: string;
  description: string;
  folderId?: string; // empty string or undefined means 'uncategorized'
  tags: string[];
  isFavorite: boolean;
  faviconUrl?: string;
  createdAt: string;
  updatedAt: string;
  userId?: string;
}

export interface Folder {
  id: string;
  name: string;
  icon?: string; // Lucide icon name
  color?: string; // hex or tailwind color
  createdAt: string;
  userId?: string;
}

export type ViewMode = 'grid' | 'list';

export type SortOption = 'newest' | 'oldest' | 'alpha';

export type ThemeMode = 'dark' | 'light';

export type NavigationFilterType = 'all' | 'favorites' | 'uncategorized' | 'folder' | 'tag';

export interface ActiveFilter {
  type: NavigationFilterType;
  value?: string; // folder ID or tag name
  label: string;
}

export interface Toast {
  id: string;
  title: string;
  description?: string;
  type: 'success' | 'info' | 'warning' | 'error';
}
