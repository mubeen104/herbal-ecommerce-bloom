# Accessible Components Implementation Guide

## Overview

This guide provides comprehensive instructions for implementing accessible alternatives to common problematic UI patterns. All components follow WCAG 2.2 guidelines and implement inclusive design principles.

## 📦 Components Created

### 1. AccessibleCarousel
**Location:** `src/components/accessible/AccessibleCarousel.tsx`

**Replaces:** Auto-playing carousels that violate WCAG 2.2.2

**Features:**
- ✅ Keyboard navigation (Arrow keys, Home, End)
- ✅ Pause/Play controls
- ✅ Respects `prefers-reduced-motion`
- ✅ Screen reader announcements
- ✅ Touch/swipe support
- ✅ Grid view fallback
- ✅ Focus management
- ✅ Works without JavaScript (progressive enhancement)

**Usage:**
```tsx
import { AccessibleCarousel } from '@/components/accessible/AccessibleCarousel';

// Basic usage
<AccessibleCarousel ariaLabel="Featured Products">
  {products.map(product => (
    <ProductCard key={product.id} product={product} />
  ))}
</AccessibleCarousel>

// With auto-scroll (will pause on hover/focus and respect reduced motion)
<AccessibleCarousel
  ariaLabel="Hero Banners"
  autoScrollDelay={5000}
  showPlayPause={true}
  showNavigation={true}
  showPagination={true}
>
  {slides.map(slide => (
    <HeroSlide key={slide.id} {...slide} />
  ))}
</AccessibleCarousel>

// Multiple items per view
<AccessibleCarousel
  ariaLabel="Product Categories"
  itemsPerView={{ mobile: 1, tablet: 2, desktop: 4 }}
  enableGridFallback={true}
>
  {categories.map(category => (
    <CategoryCard key={category.id} category={category} />
  ))}
</AccessibleCarousel>
```

**Why It's Better:**
- Users can pause auto-scrolling content (WCAG 2.2.2)
- Keyboard users can navigate slides
- Screen readers announce current slide
- No motion sickness for users with vestibular disorders
- Grid fallback ensures content is always accessible

### 2. AccessiblePagination
**Location:** `src/components/accessible/AccessiblePagination.tsx`

**Replaces:** Infinite scroll patterns

**Features:**
- ✅ Shows total results
- ✅ Allows direct page access
- ✅ Deep linkable
- ✅ Browser back button works
- ✅ Footer remains accessible
- ✅ Keyboard navigation
- ✅ Screen reader friendly
- ✅ Scroll position management
- ✅ Adjustable page size

**Usage:**
```tsx
import { AccessiblePagination } from '@/components/accessible/AccessiblePagination';

function ProductList() {
  const [page, setPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(20);

  const { data, total } = useProducts({ page, itemsPerPage });

  return (
    <>
      <div id="main-content">
        {/* Product grid */}
        {data.map(product => (
          <ProductCard key={product.id} product={product} />
        ))}
      </div>

      <AccessiblePagination
        totalItems={total}
        itemsPerPage={itemsPerPage}
        currentPage={page}
        onPageChange={setPage}
        onItemsPerPageChange={setItemsPerPage}
        showTotal={true}
        showFirstLast={true}
        scrollToTop={true}
        scrollTargetId="main-content"
      />
    </>
  );
}
```

**Why It's Better:**
- Users can see total number of results
- Easy to return to specific page
- Browser navigation works correctly
- Footer is always reachable
- Better for users with cognitive disabilities
- SEO friendly

### 3. AccessibleCombobox
**Location:** `src/components/accessible/AccessibleCombobox.tsx`

**Replaces:** Complex dropdown patterns

**Features:**
- ✅ ARIA 1.2 Combobox pattern
- ✅ Full keyboard navigation
- ✅ Type-ahead search
- ✅ Screen reader support
- ✅ Grouped options
- ✅ Clear selection
- ✅ Create new options
- ✅ Error handling
- ✅ Touch-friendly

**Usage:**
```tsx
import { AccessibleCombobox } from '@/components/accessible/AccessibleCombobox';

const categoryOptions = [
  { value: 'supplements', label: 'Supplements', group: 'Products' },
  { value: 'teas', label: 'Herbal Teas', group: 'Products' },
  { value: 'oils', label: 'Essential Oils', group: 'Products' }
];

function FilterPanel() {
  const [category, setCategory] = useState<string>();

  return (
    <AccessibleCombobox
      label="Product Category"
      options={categoryOptions}
      value={category}
      onChange={setCategory}
      placeholder="Select a category..."
      searchable={true}
      clearable={true}
      showLabel={true}
      required={false}
    />
  );
}

// With creation support
<AccessibleCombobox
  label="Tags"
  options={existingTags}
  value={selectedTag}
  onChange={setSelectedTag}
  creatable={true}
  onCreate={(newTag) => {
    // Add new tag to options
    addTag(newTag);
  }}
  noResultsMessage="No tags found. Press Enter to create."
/>
```

**Why It's Better:**
- Follows established ARIA patterns
- Works with all input methods
- Provides clear feedback
- Handles errors gracefully
- Progressive enhancement ready

## 🛠️ Progressive Enhancement Utilities

**Location:** `src/utils/progressiveEnhancement.ts`

### Feature Detection

```tsx
import {
  prefersReducedMotion,
  hasTouchSupport,
  hasIntersectionObserver,
  useProgressiveEnhancement
} from '@/utils/progressiveEnhancement';

// Check for reduced motion
if (prefersReducedMotion()) {
  // Disable animations
  disableAnimations();
}

// Check for touch support
if (hasTouchSupport()) {
  // Increase touch targets
  useLargerButtons();
}

// React hook
function MyComponent() {
  const { hasFeature, config } = useProgressiveEnhancement();

  return (
    <div>
      {config.useAnimations ? (
        <AnimatedCard />
      ) : (
        <StaticCard />
      )}
    </div>
  );
}
```

### Focus Management

```tsx
import { focusManagement } from '@/utils/progressiveEnhancement';

// Trap focus in modal
useEffect(() => {
  if (isModalOpen && modalRef.current) {
    const cleanup = focusManagement.trapFocus(modalRef.current);
    return cleanup;
  }
}, [isModalOpen]);

// Save and restore focus
const handleOpenDialog = () => {
  const restoreFocus = focusManagement.saveFocus();
  setDialogOpen(true);

  // Later, when closing dialog
  restoreFocus();
};

// Focus first error
const handleSubmit = () => {
  if (hasErrors) {
    focusManagement.focusFirstError(formRef.current);
  }
};
```

### Screen Reader Announcements

```tsx
import { announce } from '@/utils/progressiveEnhancement';

// Announce changes
const handleAddToCart = () => {
  addToCart(product);
  announce('Product added to cart', 'polite');
};

// Urgent announcements
const handleError = () => {
  announce('Error: Could not save changes', 'assertive');
};
```

### Skip Links

```tsx
import { skipLinks } from '@/utils/progressiveEnhancement';

// Add skip to main content
useEffect(() => {
  skipLinks.addSkipToMain('main-content');
}, []);
```

## 🎨 Implementation Examples

### Example 1: Replacing HeroSlider

**Before (Problematic):**
```tsx
// src/components/HeroSlider.tsx
<Carousel
  opts={{ loop: true, duration: 600 }}
  // Auto-scrolls without pause
  // No keyboard nav
  // Doesn't respect reduced motion
>
  {slides.map(slide => <Slide {...slide} />)}
</Carousel>
```

**After (Accessible):**
```tsx
// src/components/HeroSlider.tsx
import { AccessibleCarousel } from '@/components/accessible/AccessibleCarousel';
import { useProgressiveEnhancement } from '@/utils/progressiveEnhancement';

function HeroSlider() {
  const { config } = useProgressiveEnhancement();

  return (
    <AccessibleCarousel
      ariaLabel="Hero banners showcasing our products"
      autoScrollDelay={config.useAutoScroll ? 5000 : 0}
      showPlayPause={true}
      showNavigation={true}
      showPagination={true}
      enableGridFallback={true}
    >
      {slides.map(slide => (
        <HeroSlide key={slide.id} {...slide} />
      ))}
    </AccessibleCarousel>
  );
}
```

### Example 2: Replacing Product Listing with Infinite Scroll

**Before (Problematic):**
```tsx
// Infinite scroll - footer unreachable
<InfiniteScroll
  loadMore={loadMore}
  hasMore={hasMore}
>
  {products.map(product => <ProductCard {...product} />)}
</InfiniteScroll>
```

**After (Accessible):**
```tsx
import { AccessiblePagination } from '@/components/accessible/AccessiblePagination';
import { useState, useEffect } from 'react';

function ProductListing() {
  const [page, setPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(20);
  const { data: products, total } = useProducts({ page, itemsPerPage });

  // Update URL for deep linking
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    params.set('page', page.toString());
    params.set('per_page', itemsPerPage.toString());
    window.history.replaceState({}, '', `?${params}`);
  }, [page, itemsPerPage]);

  return (
    <>
      <div id="product-list" className="grid gap-4">
        {products.map(product => (
          <ProductCard key={product.id} product={product} />
        ))}
      </div>

      <AccessiblePagination
        totalItems={total}
        itemsPerPage={itemsPerPage}
        currentPage={page}
        onPageChange={setPage}
        onItemsPerPageChange={setItemsPerPage}
        allowItemsPerPageChange={true}
        showTotal={true}
        showFirstLast={true}
        scrollToTop={true}
        scrollTargetId="product-list"
        ariaLabel="Product listing pagination"
      />
    </>
  );
}
```

### Example 3: Accessible Filter Dropdown

**Before (Problematic):**
```tsx
// Complex custom dropdown
<Select>
  <SelectTrigger>
    <SelectValue placeholder="Filter by category" />
  </SelectTrigger>
  <SelectContent>
    {categories.map(cat => (
      <SelectItem value={cat.id}>{cat.name}</SelectItem>
    ))}
  </SelectContent>
</Select>
```

**After (Enhanced):**
```tsx
import { AccessibleCombobox } from '@/components/accessible/AccessibleCombobox';

function CategoryFilter() {
  const [selected, setSelected] = useState<string>();
  const [error, setError] = useState<string>();

  const categories = [
    { value: 'supplements', label: 'Supplements', group: 'Products' },
    { value: 'teas', label: 'Herbal Teas', group: 'Products' },
    { value: 'oils', label: 'Essential Oils', group: 'Products' }
  ];

  return (
    <AccessibleCombobox
      label="Product Category"
      options={categories}
      value={selected}
      onChange={(value) => {
        setSelected(value);
        setError(undefined);
      }}
      placeholder="Search or select a category..."
      searchable={true}
      clearable={true}
      showLabel={true}
      error={error}
      helperText="Filter products by category"
      required={false}
    />
  );
}
```

## 🔧 Migration Guide

### Step 1: Audit Current Components

Use the ACCESSIBILITY_AUDIT.md to identify problematic patterns:

```bash
# Check your components
- [ ] Carousels with auto-scroll
- [ ] Infinite scroll implementations
- [ ] Complex dropdown menus
- [ ] Modal dialogs without focus trap
- [ ] Forms without error handling
```

### Step 2: Replace Carousels

Find all carousel usage:
```bash
grep -r "Carousel" src/components/
```

Replace with AccessibleCarousel:
```tsx
// Old
import { Carousel } from '@/components/ui/carousel';

// New
import { AccessibleCarousel } from '@/components/accessible/AccessibleCarousel';
```

### Step 3: Implement Pagination

Replace infinite scroll with pagination:

1. Add state for pagination
2. Update API calls to support pagination
3. Implement AccessiblePagination component
4. Add URL parameter support for deep linking

### Step 4: Enhance Dropdowns

Replace complex dropdowns with AccessibleCombobox:

1. Identify all dropdown/select usage
2. Map options to ComboboxOption format
3. Add error handling
4. Implement AccessibleCombobox

### Step 5: Add Progressive Enhancement

1. Import utilities:
```tsx
import { useProgressiveEnhancement } from '@/utils/progressiveEnhancement';
```

2. Use feature detection:
```tsx
const { config } = useProgressiveEnhancement();

// Use config to conditionally enable features
if (config.useAnimations) {
  enableAnimations();
}
```

3. Respect user preferences:
```tsx
import { prefersReducedMotion } from '@/utils/progressiveEnhancement';

useEffect(() => {
  if (prefersReducedMotion()) {
    setAutoScroll(false);
  }
}, []);
```

## 🧪 Testing Checklist

### Keyboard Testing
- [ ] All interactive elements reachable via Tab
- [ ] Logical tab order
- [ ] No keyboard traps
- [ ] Visible focus indicators
- [ ] Arrow keys work in carousels/lists
- [ ] Enter/Space activate buttons
- [ ] Escape closes modals/dropdowns

### Screen Reader Testing
- [ ] All images have alt text
- [ ] Proper heading hierarchy
- [ ] Form labels associated with inputs
- [ ] Error messages announced
- [ ] Dynamic changes announced
- [ ] Skip links work
- [ ] ARIA labels present

### Visual Testing
- [ ] Text scalable to 200%
- [ ] Works at 320px width
- [ ] Sufficient color contrast (4.5:1)
- [ ] Focus indicators visible
- [ ] Touch targets 44x44px minimum
- [ ] Content reflows properly

### Motion Testing
- [ ] Auto-scroll can be paused
- [ ] Respects prefers-reduced-motion
- [ ] No unexpected movement
- [ ] Animations not essential for understanding

### Progressive Enhancement Testing
- [ ] Core functionality works without CSS
- [ ] Core functionality works without JavaScript
- [ ] Graceful degradation
- [ ] Progressive enhancement layers work

## 📊 Component Comparison

### Carousel Comparison

| Feature | Old Carousel | AccessibleCarousel |
|---------|-------------|-------------------|
| Auto-scroll pause | ❌ | ✅ |
| Keyboard navigation | ❌ | ✅ |
| Screen reader support | Partial | ✅ |
| Reduced motion | ❌ | ✅ |
| Grid fallback | ❌ | ✅ |
| Focus management | ❌ | ✅ |
| Touch support | ✅ | ✅ |
| WCAG 2.2 compliant | ❌ | ✅ |

### Pagination vs Infinite Scroll

| Feature | Infinite Scroll | AccessiblePagination |
|---------|----------------|---------------------|
| Footer accessible | ❌ | ✅ |
| Return to item | ❌ | ✅ |
| Deep linkable | ❌ | ✅ |
| Back button works | ❌ | ✅ |
| Total count visible | ❌ | ✅ |
| Screen reader friendly | ❌ | ✅ |
| SEO friendly | ❌ | ✅ |
| Keyboard navigation | Partial | ✅ |

## 🎯 Best Practices

### 1. Always Provide Alternatives
```tsx
// Good: Provide both carousel and grid view
<AccessibleCarousel enableGridFallback={true}>
  {items}
</AccessibleCarousel>

// Bad: Force users to use carousel
<Carousel>
  {items}
</Carousel>
```

### 2. Respect User Preferences
```tsx
// Good: Check preferences
const { config } = useProgressiveEnhancement();
const autoScroll = config.useAutoScroll ? 5000 : 0;

// Bad: Ignore preferences
const autoScroll = 5000; // Always auto-scroll
```

### 3. Provide Clear Labels
```tsx
// Good: Clear, descriptive labels
<AccessibleCombobox
  label="Select product category"
  ariaLabel="Filter products by category"
/>

// Bad: Generic labels
<select>
  <option>Select...</option>
</select>
```

### 4. Handle Errors Properly
```tsx
// Good: Announce errors
<AccessibleCombobox
  error={errorMessage}
  onChange={(value) => {
    setError(undefined);
    announce('Selection changed', 'polite');
  }}
/>

// Bad: Silent errors
<select onChange={handleChange} />
```

### 5. Manage Focus
```tsx
// Good: Return focus after closing
const handleClose = () => {
  setOpen(false);
  restoreFocus();
};

// Bad: Focus gets lost
const handleClose = () => {
  setOpen(false);
};
```

## 📚 Resources

### WCAG Guidelines
- [WCAG 2.2 Quick Reference](https://www.w3.org/WAI/WCAG22/quickref/)
- [Understanding WCAG 2.2](https://www.w3.org/WAI/WCAG22/Understanding/)

### ARIA Patterns
- [ARIA Authoring Practices Guide](https://www.w3.org/WAI/ARIA/apg/)
- [Carousel Pattern](https://www.w3.org/WAI/ARIA/apg/patterns/carousel/)
- [Combobox Pattern](https://www.w3.org/WAI/ARIA/apg/patterns/combobox/)

### Testing Tools
- [axe DevTools](https://www.deque.com/axe/devtools/)
- [WAVE Browser Extension](https://wave.webaim.org/extension/)
- [Screen Readers](https://www.nvaccess.org/) (NVDA - Free)

### Learning Resources
- [WebAIM](https://webaim.org/)
- [A11y Project](https://www.a11yproject.com/)
- [Inclusive Components](https://inclusive-components.design/)

## 🆘 Troubleshooting

### Issue: Carousel Not Pausing
**Solution:** Check if `autoScrollDelay` is set and `showPlayPause` is true

### Issue: Keyboard Navigation Not Working
**Solution:** Ensure element is focusable and has proper event handlers

### Issue: Screen Reader Not Announcing
**Solution:** Check aria-live regions and role attributes

### Issue: Focus Getting Lost
**Solution:** Implement focus management utilities

### Issue: High Motion Causing Issues
**Solution:** Respect prefers-reduced-motion and provide pause controls

## ✅ Final Checklist

Before deploying accessible components:

- [ ] All carousels can be paused
- [ ] All carousels have keyboard navigation
- [ ] Reduced motion preference is respected
- [ ] Pagination implemented for long lists
- [ ] All dropdowns are keyboard accessible
- [ ] Focus management implemented
- [ ] Screen reader testing completed
- [ ] Color contrast meets WCAG AA
- [ ] Touch targets are 44x44px minimum
- [ ] Skip links added
- [ ] Error messages are announced
- [ ] Loading states have indicators
- [ ] Forms have proper labels
- [ ] Headings are properly structured
- [ ] Alt text provided for images

---

**Remember:** Accessibility is not a feature, it's a fundamental requirement. Build inclusive experiences that work for everyone.
