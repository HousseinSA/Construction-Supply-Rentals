// Export all stores from a central location
export { useSearchStore } from './searchStore';
export { useAuthStore } from './authStore';
export { useUIStore } from './uiStore';

// Legacy export for backward compatibility
export { useAuthStore as useAppStore } from './authStore';