# Accessibility Quick Reference Card

## 🚀 Quick Replacements

### Replace Auto-Playing Carousel
```tsx
// ❌ Before
<Carousel opts={{ loop: true }}>
  {items}
</Carousel>

// ✅ After
import { AccessibleCarousel } from '@/components/accessible/AccessibleCarousel';
<AccessibleCarousel ariaLabel="Products" autoScrollDelay={5000} showPlayPause>
  {items}
</AccessibleCarousel>
```

### Replace Infinite Scroll
```tsx
// ❌ Before
<InfiniteScroll loadMore={loadMore}>
  {items}
</InfiniteScroll>

// ✅ After
import { AccessiblePagination } from '@/components/accessible/AccessiblePagination';
<AccessiblePagination
  totalItems={1000}
  itemsPerPage={20}
  currentPage={page}
  onPageChange={setPage}
/>
```

### Replace Complex Dropdown
```tsx
// ❌ Before
<Select>
  <SelectTrigger>
    <SelectValue />
  </SelectTrigger>
  <SelectContent>
    {options.map(opt => <SelectItem>{opt}</SelectItem>)}
  </SelectContent>
</Select>

// ✅ After
import { AccessibleCombobox } from '@/components/accessible/AccessibleCombobox';
<AccessibleCombobox
  label="Category"
  options={options}
  value={value}
  onChange={setValue}
  searchable
/>
```

## ⚡ Progressive Enhancement

```tsx
import { useProgressiveEnhancement } from '@/utils/progressiveEnhancement';

function MyComponent() {
  const { config } = useProgressiveEnhancement();

  return (
    <div>
      {config.useAnimations ? <Animated /> : <Static />}
      {config.useLargerTargets && <button className="h-12 w-12" />}
    </div>
  );
}
```

## 🎯 Essential Checks

### Keyboard Navigation
- [ ] Tab reaches all interactive elements
- [ ] Enter/Space activates buttons/links
- [ ] Arrow keys navigate lists/carousels
- [ ] Escape closes modals/dropdowns
- [ ] Focus is visible
- [ ] No keyboard traps

### Screen Readers
- [ ] All images have alt text
- [ ] Buttons have labels
- [ ] Forms have labels
- [ ] Changes are announced
- [ ] ARIA roles correct
- [ ] Headings structured

### Motion
- [ ] Auto-scroll can be paused
- [ ] Respects prefers-reduced-motion
- [ ] No unexpected movement

### Color & Contrast
- [ ] Text contrast 4.5:1 minimum
- [ ] Focus indicators visible
- [ ] Color not sole indicator

### Touch Targets
- [ ] Minimum 44x44px
- [ ] Adequate spacing

## 🛠️ Utility Functions

### Check User Preferences
```tsx
import { prefersReducedMotion } from '@/utils/progressiveEnhancement';

if (prefersReducedMotion()) {
  disableAnimations();
}
```

### Announce to Screen Readers
```tsx
import { announce } from '@/utils/progressiveEnhancement';

announce('Item added to cart', 'polite');
announce('Error occurred', 'assertive');
```

### Focus Management
```tsx
import { focusManagement } from '@/utils/progressiveEnhancement';

// Trap focus in modal
const cleanup = focusManagement.trapFocus(modalElement);

// Save/restore focus
const restore = focusManagement.saveFocus();
restore(); // Later

// Focus first error
focusManagement.focusFirstError(formElement);
```

## 📋 WCAG Level A Requirements

**Must Have:**
- ✅ Keyboard access (2.1.1)
- ✅ No keyboard trap (2.1.2)
- ✅ Pause/stop auto-scroll (2.2.2)
- ✅ Bypass blocks (2.4.1)
- ✅ Page titles (2.4.2)
- ✅ Focus order (2.4.3)
- ✅ Link purpose (2.4.4)
- ✅ Correct markup (4.1.1)
- ✅ Name, role, value (4.1.2)

## 🔧 Testing Tools

### Automated
```bash
# Install axe
npm install --save-dev @axe-core/react

# Run in browser
- Right-click → Inspect → axe DevTools
```

### Manual
- Keyboard: Use only Tab, Enter, Space, Arrow keys
- Screen Reader: NVDA (Windows), VoiceOver (Mac)
- Zoom: 200% (Ctrl/Cmd +)
- Contrast: Use browser DevTools color picker

## 🚨 Common Mistakes

### ❌ Auto-Playing Without Pause
```tsx
// Wrong
<video autoPlay />

// Right
<video autoPlay>
  <button onClick={pause}>Pause</button>
</video>
```

### ❌ Missing Alt Text
```tsx
// Wrong
<img src="product.jpg" />

// Right
<img src="product.jpg" alt="Organic turmeric capsules" />
```

### ❌ Div Buttons
```tsx
// Wrong
<div onClick={handleClick}>Click me</div>

// Right
<button onClick={handleClick}>Click me</button>
```

### ❌ No Focus Indicator
```tsx
// Wrong
button:focus { outline: none; }

// Right
button:focus-visible { outline: 2px solid blue; }
```

### ❌ Missing Labels
```tsx
// Wrong
<input placeholder="Name" />

// Right
<label htmlFor="name">Name</label>
<input id="name" placeholder="Enter your name" />
```

## 📊 Priority Matrix

### Critical (Fix Immediately)
1. Keyboard traps
2. Auto-play without pause
3. Missing form labels
4. Color-only indicators
5. Insufficient contrast

### High (Fix This Week)
1. Missing alt text
2. Improper heading structure
3. Focus not visible
4. Touch targets too small
5. No error messages

### Medium (Fix This Month)
1. Complex interactions
2. Missing ARIA labels
3. Poor error recovery
4. Inconsistent navigation
5. No skip links

## 🎓 Learning Path

1. **Week 1:** Keyboard navigation basics
2. **Week 2:** Screen reader basics (NVDA/VoiceOver)
3. **Week 3:** ARIA fundamentals
4. **Week 4:** WCAG 2.2 Level A
5. **Week 5:** Testing and tools
6. **Week 6:** Advanced patterns

## 📞 Resources

- **WCAG:** https://www.w3.org/WAI/WCAG22/quickref/
- **ARIA:** https://www.w3.org/WAI/ARIA/apg/
- **WebAIM:** https://webaim.org/
- **A11y Project:** https://www.a11yproject.com/

## ✅ Daily Checklist

Start each component with:
- [ ] Can I use it with keyboard only?
- [ ] Does it work with screen reader?
- [ ] Are colors accessible?
- [ ] Do animations respect reduced motion?
- [ ] Are touch targets large enough?

---

**Remember:** If you need more time to understand something, it's okay. If you need to pause auto-scrolling, it's okay. If you need larger buttons, it's okay. Build for everyone.
