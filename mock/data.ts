export interface User {
  id: string;
  username: string;
  name: string;
  email: string;
  phone: string;
  avatar?: string;
  role: 'user' | 'cleaner';
  createdAt: string;
}

export interface Task {
  id: string;
  title: string;
  description: string;
  serviceType: string;
  location: string;
  budget: number;
  status: 'pending' | 'accepted' | 'in_progress' | 'completed' | 'cancelled';
  createdAt: string;
  userId: string;
  cleanerId?: string;
}

export interface Cleaner {
  id: string;
  username: string;
  name: string;
  email: string;
  phone: string;
  avatar?: string;
  serviceTypes: string[];
  rating: number;
  reviews: number;
  location: string;
  status: 'available' | 'busy';
  createdAt: string;
}

export interface Order {
  id: string;
  taskId: string;
  userId: string;
  cleanerId: string;
  amount: number;
  status: 'pending' | 'paid' | 'completed' | 'refunded';
  createdAt: string;
  completedAt?: string;
}

export const mockUsers: User[] = [
  {
    id: '1',
    username: 'mockUser',
    name: 'John Doe',
    email: 'john@example.com',
    phone: '+639123456789',
    avatar: 'https://randomuser.me/api/portraits/men/32.jpg',
    role: 'user',
    createdAt: '2026-03-01T00:00:00Z',
  },
  {
    id: '2',
    username: 'jane_smith',
    name: 'Jane Smith',
    email: 'jane@example.com',
    phone: '+639876543210',
    avatar: 'https://randomuser.me/api/portraits/women/44.jpg',
    role: 'user',
    createdAt: '2026-03-02T00:00:00Z',
  },
];

export const mockCleaners: Cleaner[] = [
  {
    id: '1',
    username: 'mockCleaner',
    name: 'Maria Santos',
    email: 'maria@example.com',
    phone: '+639234567890',
    avatar: 'https://randomuser.me/api/portraits/women/68.jpg',
    serviceTypes: ['cleaning', 'deep-cleaning', 'disinfection'],
    rating: 4.8,
    reviews: 125,
    location: 'Manila, Philippines',
    status: 'available',
    createdAt: '2026-02-15T00:00:00Z',
  },
  {
    id: '2',
    username: 'juan_dela_cruz',
    name: 'Juan Dela Cruz',
    email: 'juan@example.com',
    phone: '+639345678901',
    avatar: 'https://randomuser.me/api/portraits/men/45.jpg',
    serviceTypes: ['cleaning', 'window-cleaning', 'carpet-cleaning'],
    rating: 4.5,
    reviews: 89,
    location: 'Makati, Philippines',
    status: 'available',
    createdAt: '2026-02-20T00:00:00Z',
  },
];

export const mockTasks: Task[] = [
  {
    id: '1',
    title: 'Weekly House Cleaning',
    description: 'Need regular weekly cleaning for my apartment. Include living room, bedrooms, kitchen, and bathroom.',
    serviceType: 'cleaning',
    location: 'Quezon City, Philippines',
    budget: 500,
    status: 'pending',
    createdAt: '2026-03-19T10:00:00Z',
    userId: '1',
  },
  {
    id: '2',
    title: 'Deep Cleaning before Party',
    description: 'Deep cleaning required for house party. Need thorough cleaning of all areas.',
    serviceType: 'deep-cleaning',
    location: 'Makati, Philippines',
    budget: 1000,
    status: 'accepted',
    createdAt: '2026-03-18T14:30:00Z',
    userId: '2',
    cleanerId: '1',
  },
];

export const mockOrders: Order[] = [
  {
    id: '1',
    taskId: '2',
    userId: '2',
    cleanerId: '1',
    amount: 1000,
    status: 'paid',
    createdAt: '2026-03-18T15:00:00Z',
  },
];