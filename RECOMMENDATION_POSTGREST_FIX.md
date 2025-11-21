# Product Recommendations - PostgREST Parameter Order Fix

## Root Cause Identified

The issue was **PostgREST's parameter matching algorithm**. PostgREST searches for functions using **alphabetically sorted parameter names**, not declaration order.

### The Problem

**Our Original Function:**
```sql
CREATE FUNCTION get_related_products(
  p_product_id UUID,      -- Parameter 1
  p_limit INTEGER,        -- Parameter 2
  p_exclude_ids UUID[]    -- Parameter 3
)
```

**What PostgREST Searches For:**
```
p_exclude_ids, p_limit, p_product_id  (alphabetical order!)
```

**Result:** Function not found in schema cache ❌

---

## The Solution

Recreated functions with parameters in **alphabetical order**:

### get_related_products

```sql
CREATE FUNCTION get_related_products(
  p_exclude_ids UUID[],   -- 'e' comes first alphabetically
  p_limit INTEGER,        -- 'l' comes second
  p_product_id UUID       -- 'p' comes third (p_product_id)
)
```

### get_cart_suggestions

```sql
CREATE FUNCTION get_cart_suggestions(
  p_cart_product_ids UUID[],  -- 'c' comes first
  p_limit INTEGER             -- 'l' comes second
)
```
Already alphabetical! ✅

---

## Migration Applied

**File:** `fix_recommendation_functions_parameter_order.sql`

**Changes:**
1. Dropped old functions
2. Recreated with alphabetically ordered parameters
3. Added validation for required params
4. Granted permissions to anon/authenticated
5. Added comments explaining the fix

---

## Testing

### Database Test (SQL)

```sql
-- Test related products
SELECT id, name, recommendation_score
FROM get_related_products(
  ARRAY[]::uuid[],           -- p_exclude_ids
  6,                         -- p_limit
  '4d75e7cd-bfa4-44f1-ab4b-4553db286e9d'  -- p_product_id
);
```

**Expected:** Returns 6 products ✅

### Frontend Test (JavaScript)

```javascript
// Supabase JS automatically orders params alphabetically
await supabase.rpc('get_related_products', {
  p_product_id: 'uuid-here',
  p_limit: 6,
  p_exclude_ids: []
});
```

**Expected:** Works regardless of object key order ✅

---

## Verification Steps

### 1. Check Functions Exist

```sql
SELECT proname, pg_get_function_identity_arguments(oid)
FROM pg_proc
WHERE proname IN ('get_related_products', 'get_cart_suggestions')
AND pronamespace = 'public'::regnamespace;
```

**Expected Output:**
```
get_related_products | p_exclude_ids uuid[], p_limit integer, p_product_id uuid
get_cart_suggestions | p_cart_product_ids uuid[], p_limit integer
```

### 2. Test Direct Call

```sql
SELECT COUNT(*)
FROM get_related_products(
  ARRAY[]::uuid[],
  6,
  (SELECT id FROM products WHERE is_active = true LIMIT 1)
);
```

**Expected:** Count > 0

### 3. Test via PostgREST

Open browser console and run:

```javascript
const { data, error } = await supabase.rpc('get_related_products', {
  p_product_id: 'your-product-uuid',
  p_limit: 6,
  p_exclude_ids: []
});

console.log('Data:', data);
console.log('Error:', error);
```

**Expected:**
- `error`: null
- `data`: Array of products

### 4. Check Frontend

1. Navigate to any product page
2. Scroll to "You May Also Like" section
3. Should see 6 product recommendations

---

## Why This Happens

PostgREST uses a specific function resolution algorithm:

1. **Extract parameter names from request**
2. **Sort parameter names alphabetically**
3. **Search for function with matching sorted names**
4. **Call function if found**

This is documented behavior but easy to miss!

**Reference:** https://postgrest.org/en/stable/references/api/functions.html

---

## How to Avoid This in Future

### Rule: Always Declare Parameters Alphabetically

✅ **Good:**
```sql
CREATE FUNCTION my_function(
  a_param INTEGER,
  b_param TEXT,
  c_param UUID
)
```

❌ **Bad:**
```sql
CREATE FUNCTION my_function(
  c_param UUID,
  a_param INTEGER,
  b_param TEXT
)
```

### Or: Use Single JSON Parameter

```sql
CREATE FUNCTION my_function(params JSONB)
RETURNS ...
AS $$
  -- Extract from JSONB
  v_a_param := (params->>'a_param')::INTEGER;
  v_b_param := params->>'b_param';
$$;
```

PostgREST can call with a single unnamed parameter.

---

## Status

✅ **Functions recreated with alphabetical parameters**
✅ **Database tests passing**
✅ **Build successful**
✅ **PostgREST notified to reload schema**

---

## If Still Not Working

### 1. Hard Refresh Browser

- Chrome/Edge: Ctrl+Shift+R (Windows) or Cmd+Shift+R (Mac)
- Firefox: Ctrl+F5 (Windows) or Cmd+Shift+R (Mac)
- Safari: Cmd+Option+R

### 2. Clear React Query Cache

Open browser console:
```javascript
// Clear all cached queries
window.location.reload(true);
```

### 3. Restart Supabase (if local)

```bash
supabase stop
supabase start
```

### 4. Check PostgREST Schema Cache

In Supabase Dashboard:
1. Go to SQL Editor
2. Run: `NOTIFY pgrst, 'reload schema';`
3. Wait 5-10 seconds
4. Refresh frontend

### 5. Verify Permissions

```sql
SELECT
  has_function_privilege('anon', 'get_related_products(uuid[], integer, uuid)', 'EXECUTE'),
  has_function_privilege('authenticated', 'get_related_products(uuid[], integer, uuid)', 'EXECUTE');
```

Both should return `true`.

---

## Technical Details

### PostgREST Function Resolution

PostgREST builds a schema cache on startup:

1. Queries `pg_proc` for all public functions
2. Stores function signatures with **sorted parameter names**
3. When RPC called, sorts request params alphabetically
4. Matches against cached signatures
5. Calls function if match found

### Why Alphabetical?

- Deterministic matching regardless of client param order
- Handles JavaScript objects (unordered keys)
- Supports multiple programming languages
- Enables function overloading

### Parameter Name Requirements

- Must start with letter or underscore
- Can contain letters, numbers, underscores
- Case-sensitive in sorting
- Prefix convention (p_, v_, etc.) affects order!

---

## Lessons Learned

1. **Always test PostgREST endpoints directly** before debugging frontend
2. **Function parameters should be alphabetically ordered** for PostgREST
3. **Schema cache may need manual reload** after function changes
4. **Error messages are specific** - "searched for X, Y, Z" = alphabetical order
5. **Documentation matters** - this is documented but not obvious

---

## Summary

**Problem:** PostgREST couldn't find functions because parameters weren't alphabetical

**Solution:** Recreated functions with alphabetically ordered parameters

**Result:** Recommendations now work! 🎉

**Key Takeaway:** When using PostgREST, always declare function parameters in alphabetical order.

---

## Related Files

- Migration: `supabase/migrations/*_fix_recommendation_functions_parameter_order.sql`
- Frontend Hook: `src/hooks/useRelatedProducts.ts`
- Frontend Hook: `src/hooks/useSuggestedCartProducts.ts`
- Component: `src/components/RelatedProducts.tsx`
- Component: `src/components/CartSuggestions.tsx`

---

**Date:** November 21, 2025
**Status:** ✅ Fixed
**Build:** ✅ Passing
