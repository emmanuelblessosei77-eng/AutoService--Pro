/**
 * SWEETALERT2 CONFIGURATION
 * 
 * Centralized configuration for customizing alert behavior
 * Edit this file to change global settings for all alerts
 */

// ============================================
// COLOR SCHEME CONFIGURATION
// ============================================
export const COLORS = {
  success: {
    primary: '#16a34a',        // Green
    background: '#f0fdf4',     // Light green
    text: '#166534',           // Dark green
    light: '#dcfce7',          // Very light green
  },
  error: {
    primary: '#dc2626',        // Red
    background: '#fef2f2',     // Light red
    text: '#7f1d1d',           // Dark red
    light: '#fee2e2',          // Very light red
  },
  warning: {
    primary: '#f59e0b',        // Amber
    background: '#fffbeb',     // Light amber
    text: '#92400e',           // Dark amber
    light: '#fef3c7',          // Very light amber
  },
  info: {
    primary: '#2563eb',        // Blue
    background: '#eff6ff',     // Light blue
    text: '#1e3a8a',           // Dark blue
    light: '#dbeafe',          // Very light blue
  },
};

// ============================================
// BUTTON CONFIGURATION
// ============================================
export const BUTTONS = {
  confirm: {
    text: 'OK',
    color: COLORS.success.primary,
    textColor: '#ffffff',
  },
  delete: {
    text: 'Delete',
    color: COLORS.error.primary,
    textColor: '#ffffff',
  },
  cancel: {
    text: 'Cancel',
    color: '#6b7280',
    textColor: '#ffffff',
  },
  submit: {
    text: 'Submit',
    color: COLORS.info.primary,
    textColor: '#ffffff',
  },
};

// ============================================
// ANIMATION CONFIGURATION
// ============================================
export const ANIMATIONS = {
  showAnimation: 'fadeIn',      // Animation when showing
  hideAnimation: 'fadeOut',     // Animation when hiding
  allowOutsideClick: true,      // Click outside to close
  allowEscapeKey: true,         // ESC to close
  backdrop: 'rgba(0, 0, 0, 0.4)',  // Backdrop color
};

// ============================================
// TOAST CONFIGURATION
// ============================================
export const TOAST_CONFIG = {
  position: 'top-end',          // Position: top-start, top-end, bottom-start, bottom-end
  timer: 3000,                  // Duration in milliseconds
  timerProgressBar: true,       // Show progress bar
  showConfirmButton: false,     // Hide confirm button
};

// ============================================
// MODAL CONFIGURATION
// ============================================
export const MODAL_CONFIG = {
  width: '32rem',               // Width (400px)
  padding: '2rem',              // Padding
  borderRadius: '0.5rem',       // Border radius (8px)
};

// ============================================
// ICON CONFIGURATION
// ============================================
export const ICONS = {
  success: 'success',           // Built-in icon
  error: 'error',
  warning: 'warning',
  info: 'info',
  question: 'question',
};

// ============================================
// TEXT CONFIGURATION
// ============================================
export const TEXT = {
  cancel: 'Cancel',
  delete: 'Delete',
  confirm: 'Confirm',
  yes: 'Yes',
  no: 'No',
  ok: 'OK',
  close: 'Close',
};

// ============================================
// TIMER CONFIGURATION (in milliseconds)
// ============================================
export const TIMERS = {
  toast: 3000,                  // Toast notification
  quickNotification: 2000,      // Quick messages
  loading: 0,                   // Loading alerts (no auto-close)
};

// ============================================
// THEME CONFIGURATION
// ============================================
export const THEME = {
  isDark: false,                // Not dark mode by default
  fontFamily: 'system-ui, sans-serif',
  fontSize: '14px',
  borderColor: 'rgba(0, 0, 0, 0.1)',
};

// ============================================
// CUSTOM THEMES
// ============================================
export const THEMES = {
  light: {
    background: '#ffffff',
    color: '#000000',
    backdrop: 'rgba(0, 0, 0, 0.4)',
  },
  dark: {
    background: '#1f2937',
    color: '#f3f4f6',
    backdrop: 'rgba(0, 0, 0, 0.8)',
  },
  gradient: {
    background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
    color: '#ffffff',
    backdrop: 'rgba(0, 0, 0, 0.5)',
  },
};

// ============================================
// SIZE PRESETS
// ============================================
export const SIZES = {
  small: {
    width: '300px',
    padding: '1.5rem',
    fontSize: '14px',
  },
  medium: {
    width: '500px',
    padding: '2rem',
    fontSize: '16px',
  },
  large: {
    width: '700px',
    padding: '2.5rem',
    fontSize: '16px',
  },
  fullscreen: {
    width: '90vw',
    maxWidth: '800px',
    padding: '3rem',
    fontSize: '16px',
  },
};

// ============================================
// ALERT MESSAGE TEMPLATES
// ============================================
export const MESSAGES = {
  success: {
    default: 'Success!',
    saved: 'Saved successfully!',
    deleted: 'Deleted successfully!',
    created: 'Created successfully!',
    updated: 'Updated successfully!',
  },
  error: {
    default: 'Error!',
    network: 'Network error. Please check your connection.',
    notFound: 'Resource not found.',
    unauthorized: 'You do not have permission.',
    serverError: 'Server error. Please try again later.',
    validationError: 'Please check your input.',
  },
  warning: {
    default: 'Warning!',
    confirm: 'Are you sure?',
    unsavedChanges: 'You have unsaved changes.',
  },
  info: {
    default: 'Information',
    loading: 'Loading...',
    processing: 'Processing...',
  },
  confirmation: {
    delete: 'Are you sure you want to delete this item?',
    logout: 'Are you sure you want to log out?',
    discard: 'Are you sure you want to discard changes?',
  },
};

// ============================================
// HELPER FUNCTION TO APPLY THEME
// ============================================
export const applyTheme = (themeName) => {
  const theme = THEMES[themeName];
  if (theme) {
    document.documentElement.style.setProperty('--swal-background', theme.background);
    document.documentElement.style.setProperty('--swal-color', theme.color);
  }
};

// ============================================
// HELPER FUNCTION TO GET MESSAGE
// ============================================
export const getMessage = (category, key = 'default') => {
  return MESSAGES[category]?.[key] || MESSAGES.info.default;
};

// ============================================
// HELPER FUNCTION TO GET SIZE
// ============================================
export const getSize = (sizeName) => {
  return SIZES[sizeName] || SIZES.medium;
};

// ============================================
// HELPER FUNCTION TO GET COLOR
// ============================================
export const getColor = (colorName) => {
  return COLORS[colorName] || COLORS.info;
};

export default {
  COLORS,
  BUTTONS,
  ANIMATIONS,
  TOAST_CONFIG,
  MODAL_CONFIG,
  ICONS,
  TEXT,
  TIMERS,
  THEME,
  THEMES,
  SIZES,
  MESSAGES,
  applyTheme,
  getMessage,
  getSize,
  getColor,
};
