# Dark Mode Pattern Reference

## Color Mappings

### Text Colors
- Primary: `text-[#111827]` → `dark:text-[#F2F2F7]`
- Secondary: `text-[#6B7280]` → `dark:text-[#8E8E93]`
- Tertiary: `text-[#374151]` → `dark:text-[#8E8E93]`
- Placeholder: `placeholder-[#6B7280]` → `dark:placeholder-[#48484A]`

### Backgrounds
- Page: `bg-[#FAFAFA]` → `dark:bg-[#0A0A0F]`
- Card/Surface: `bg-white/80` → `dark:bg-[#16161E]` (with inline style)
- Input: `bg-warm-gray-200` → `dark:bg-white/[0.06]`
- Hover: `hover:bg-black/[0.02]` → `dark:hover:bg-white/[0.03]`
- Avatar: `bg-warm-gray-200` → `dark:bg-white/[0.06]`

### Borders
- Default: `border-black/6` → `dark:border-white/[0.07]`
- Strong: `border-warm-gray-400` → `dark:border-white/[0.12]`
- Divider: `divide-warm-gray-300` → `dark:divide-white/[0.06]`

### Status Badges
```jsx
actif: {
  bgColor: 'bg-status-green/10 dark:bg-[rgba(52,199,89,0.15)] border border-transparent dark:border-[rgba(52,199,89,0.2)]',
  textColor: 'text-status-green dark:text-[#34C759]',
  dotColor: 'bg-status-green dark:bg-[#34C759]'
}

risque: {
  bgColor: 'bg-status-amber/10 dark:bg-[rgba(255,159,10,0.15)] border border-transparent dark:border-[rgba(255,159,10,0.2)]',
  textColor: 'text-status-amber dark:text-[#FF9F0A]',
  dotColor: 'bg-status-amber dark:bg-[#FF9F0A]'
}

bloqué: {
  bgColor: 'bg-status-red/10 dark:bg-[rgba(192,57,43,0.2)] border border-transparent dark:border-[rgba(255,59,48,0.2)]',
  textColor: 'text-status-red dark:text-[#FF6B6B]',
  dotColor: 'bg-status-red dark:bg-[#FF6B6B]'
}
```

### Buttons
```jsx
// Primary Navy Button
className="bg-navy dark:bg-transparent"
style={isDark ? {
  background: 'linear-gradient(145deg, #2C4A6F, #1A2F4F)',
  boxShadow: '0 1px 0 rgba(255,255,255,0.1) inset, 0 4px 12px rgba(0,0,0,0.4)'
} : {}}
```

### Cards with Glass Effect
```jsx
className="bg-white/80 backdrop-blur-xl dark:border-white/[0.07]"
style={isDark ? {
  backgroundColor: '#16161E',
  boxShadow: '0 0 0 1px rgba(255,255,255,0.06), 0 4px 16px rgba(0,0,0,0.4), 0 1px 0 rgba(255,255,255,0.04) inset'
} : {
  boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)'
}}
```

### Input Fields
```jsx
className="bg-warm-gray-200 dark:bg-white/[0.06] text-[#111827] dark:text-[#F2F2F7] placeholder-[#6B7280] dark:placeholder-[#48484A]"
style={isDark ? {
  boxShadow: 'inset 0 1px 3px rgba(0,0,0,0.3), inset 0 0 0 1px rgba(255,255,255,0.06)'
} : {}}
onFocus={(e) => {
  if (isDark) {
    e.target.style.boxShadow = '0 0 0 2px #2C4A6F, inset 0 1px 3px rgba(0,0,0,0.2)'
    e.target.style.background = 'rgba(255,255,255,0.08)'
  }
}}
onBlur={(e) => {
  if (isDark) {
    e.target.style.boxShadow = 'inset 0 1px 3px rgba(0,0,0,0.3), inset 0 0 0 1px rgba(255,255,255,0.06)'
    e.target.style.background = 'rgba(255,255,255,0.06)'
  }
}}
```

### Modal Backgrounds
```jsx
style={isDark ? {
  backgroundColor: '#16161E',
  boxShadow: '0 0 0 1px rgba(255,255,255,0.08), 0 24px 64px rgba(0,0,0,0.6)'
} : {}}
```

## Component-Specific Patterns

### Add `isDark` detection to component
```jsx
const isDark = document.documentElement.classList.contains('dark')
```

### Loading Spinner
```jsx
<Loader2 className="w-8 h-8 text-navy dark:text-[#2C4A6F] animate-spin" />
```

### Table Headers
```jsx
<thead className="bg-warm-gray-200 dark:bg-white/[0.04] border-b border-warm-gray-400 dark:border-white/[0.06]">
  <th className="text-[#374151] dark:text-[#8E8E93] hover:bg-warm-gray-300 dark:hover:bg-white/[0.06]">
```

### Table Rows
```jsx
<tr className="hover:bg-black/[0.02] dark:hover:bg-white/[0.03]">
  <td className="text-[#111827] dark:text-[#F2F2F7]">
```

## Required Imports
- Add to component if using inline styles: `const isDark = document.documentElement.classList.contains('dark')`
