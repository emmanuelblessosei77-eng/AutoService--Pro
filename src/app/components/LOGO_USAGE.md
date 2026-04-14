# Logo Component Usage Guide

The `Logo` component provides a reusable, scalable SVG-based logo for "AutoService Pro" with animated gear rotation and flexible display options.

## Component Props

```typescript
interface LogoProps {
  variant?: 'full' | 'icon';  // Display mode
  className?: string;          // Additional Tailwind classes
  size?: 'sm' | 'md' | 'lg' | 'xl';  // Predefined sizes
}
```

### Size Map
- `sm`: `w-8 h-8` (32px)
- `md`: `w-12 h-12` (48px)
- `lg`: `w-16 h-16` (64px)
- `xl`: `w-24 h-24` (96px)

## Usage Examples

### 1. Full Logo in Header
```tsx
import { Logo } from './Logo';

export function Header() {
  return (
    <header>
      <Link to="/">
        <Logo variant="full" size="md" />
      </Link>
    </header>
  );
}
```

### 2. Icon Only (Dashboard/Portal)
```tsx
<Logo variant="icon" size="lg" />
```

### 3. Background Watermark in Hero Section
```tsx
<div className="relative overflow-hidden">
  {/* Background watermark */}
  <div className="absolute -right-20 -bottom-20 opacity-[0.03] pointer-events-none z-0">
    <Logo variant="icon" className="w-[800px] h-[800px] -rotate-12" />
  </div>
  
  {/* Content on top */}
  <div className="relative z-10">
    <h1>Welcome to AutoService Pro</h1>
    <p>Professional automotive care</p>
  </div>
</div>
```

### 4. Background Watermark in CTA Section
```tsx
<section className="relative overflow-hidden bg-slate-800">
  {/* Background watermark */}
  <div className="absolute -right-40 -bottom-40 opacity-[0.04] pointer-events-none z-0">
    <Logo variant="icon" className="w-[900px] h-[900px] -rotate-12" />
  </div>
  
  {/* Content on top */}
  <div className="relative z-10">
    <h2>Ready to Get Your Vehicle Serviced?</h2>
    <button>Book Your Service Today</button>
  </div>
</section>
```

### 5. Custom Size and Rotation
```tsx
<Logo 
  variant="icon" 
  className="w-[600px] h-[600px] -rotate-45 opacity-[0.05]" 
/>
```

## Design Details

### Colors
- **Gear**: `#4B70F5` (Brand Blue)
- **Wrench**: `#0B1223` (Dark Navy)

### Animations
- **Gear Rotation**: `animate-[spin_20s_linear_infinite]` (slow 20-second rotation)
- **Mechanical Feel**: Rotating gear provides a professional, mechanical aesthetic

### SVG Properties
- **ViewBox**: `0 0 100 100` (scales perfectly)
- **Scalable**: Works at any size without quality loss
- **Accessible**: Includes `pointer-events-none` for background usage

## Integration in Current App

### Files Using Logo Component
1. **Header.tsx** - Full logo in navigation
2. **Portal Layout.tsx** - Icon logo in dashboard header
3. **HeroCarousel.tsx** - Watermark background
4. **CallToAction.tsx** - Watermark background

## Best Practices

### For Headers/Navigation
```tsx
<Logo variant="full" size="md" />
```

### For Dashboards/Sidebars
```tsx
<Logo variant="icon" size="lg" />
```

### For Background Watermarks
```tsx
<div className="absolute {positioning} opacity-[0.03-0.05] pointer-events-none z-0">
  <Logo variant="icon" className="w-[{large-size}px] h-[{large-size}px] -rotate-{angle}" />
</div>
```

## Styling Guidelines

### Opacity Levels for Backgrounds
- **Subtle (Headers)**: `opacity-[0.03]`
- **Very Subtle (CTAs)**: `opacity-[0.04]`
- **Minimal (Other areas)**: `opacity-[0.02]`

### Z-Index Layering
```
z-0: Logo background (pointer-events-none)
z-10: Content (text, buttons, etc.)
z-20: Interactive elements (navigation, overlays)
```

### Positioning
- Use negative positioning to create "bleed" effect: `-right-20`, `-bottom-20`
- For larger logos: `-right-40`, `-bottom-40`
- Combine with `-rotate-{angle}` for dynamic appearance

## Performance Notes
- SVG-based (no image loading delays)
- Animated gear uses Tailwind's built-in animation
- Minimal DOM footprint
- CSS-based transforms (GPU optimized)
