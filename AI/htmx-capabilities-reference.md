# HTMX Capabilities Reference - Complete Guide

**Purpose**: Document all HTMX capabilities and how they map to page building, component interactions, and cross-component communication.

**Goal**: Determine what parts of our custom trigger system can be replaced with native HTMX patterns.

---

## 1. CORE REQUEST ATTRIBUTES

### Request Methods
- `hx-get` - Issues a GET request
- `hx-post` - Issues a POST request
- `hx-put` - Issues a PUT request
- `hx-patch` - Issues a PATCH request
- `hx-delete` - Issues a DELETE request

**Use Case**: Data operations and page interactions

**Your Needs**:
- Form submission (POST)
- Data fetching (GET)
- Updates (PUT/PATCH)
- Deletions (DELETE)

---

## 2. TRIGGERING MECHANISMS

### Default Triggers
- `input`, `textarea`, `select` → triggered on **change** event
- `form` → triggered on **submit** event
- Everything else → triggered on **click** event

### Custom Triggers with hx-trigger
```html
<div hx-post="/endpoint" hx-trigger="mouseenter">
```

### Trigger Modifiers
| Modifier | Behavior | Use Case |
|----------|----------|----------|
| `once` | Fire only once | Load-on-demand elements |
| `changed` | Only if value changed | Input validation |
| `delay:500ms` | Wait before firing | Debouncing searches |
| `throttle:1s` | Max once per interval | Frequent events |
| `from:selector` | Listen on different element | Global keyboard shortcuts |

### Special Events
| Event | Behavior |
|-------|----------|
| `load` | Fire when element first loads |
| `revealed` | Fire when element scrolls into view |
| `intersect` | Fire when element intersects viewport |
| Custom events | Define your own triggers |

### Trigger Patterns
```html
<!-- Search with debounce -->
<input hx-get="/search" hx-trigger="keyup changed delay:500ms">

<!-- Polling -->
<div hx-get="/updates" hx-trigger="every 2s"></div>

<!-- Load on page render -->
<div hx-get="/sidebar" hx-trigger="load"></div>

<!-- Multiple triggers -->
<button hx-post="/save" hx-trigger="click, keydown[ctrlKey+s]"></button>

<!-- Custom event from server -->
<div hx-get="/data" hx-trigger="myEvent from:body"></div>
```

**Your Needs**:
- Form actions (submit)
- Cross-component triggers (custom events)
- Data auto-loading (load, polling)
- User interactions (click, change)

---

## 3. TARGETING & SCOPE

### hx-target: Where to put the response
```html
<!-- Response replaces the button -->
<button hx-get="/data"> Click Me </button>

<!-- Response replaces #results -->
<button hx-get="/data" hx-target="#results"> Search </button>
```

### Extended CSS Selectors
| Selector | Meaning |
|----------|---------|
| `#id` | Element with ID |
| `.class` | Element with class |
| `this` | The element itself |
| `closest tr` | Closest ancestor table row |
| `next .card` | Next sibling with class |
| `previous div` | Previous sibling div |
| `find .item` | First child matching selector |

### Related Attributes
- `hx-sync` - Control how multiple requests from same element are handled
- `hx-indicator` - Show loading indicator on specific element

**Your Needs**:
- Target different components (grid, form, sidebar)
- Scope: replace element vs. parent vs. sibling
- Show/hide loading states

---

## 4. SWAPPING STRATEGIES

### hx-swap: How to insert the response
| Swap Method | Behavior |
|------------|----------|
| `innerHTML` (default) | Replace content inside target |
| `outerHTML` | Replace entire target element |
| `beforebegin` | Insert before target in parent |
| `afterbegin` | Insert after first child of target |
| `beforeend` | Insert before last child of target |
| `afterend` | Insert after target in parent |
| `delete` | Delete target (ignore response) |
| `none` | Don't insert (but process OOB swaps) |

### Morph Swaps (via extensions)
- `morph` - Intelligently merge new content, preserving state
- Useful for: Preserving form focus, video playback, etc.

### Swap Timing
```html
<!-- Fade out old, fade in new -->
<div hx-get="/data" hx-swap="innerHTML swap:1s">

<!-- Show new immediately, fade out old -->
<div hx-get="/data" hx-swap="innerHTML swap:0s settle:1s">
```

**Your Needs**:
- Replace form with success message
- Update grid with new rows
- Show/hide components
- Animated transitions

---

## 5. OUT OF BAND SWAPS (OOB)

**Problem**: Form submission should update table AND clear form

**Solution**: Return multiple elements, each with `hx-swap-oob`

```html
<!-- Server response: -->
<form hx-post="/contacts">
  <!-- Clear the form (OOB swap) -->
  <label> Name <input name="name" type="text"> </label>
</form>

<!-- Also update the table (OOB swap) -->
<tbody hx-swap-oob="beforeend:#contacts-table">
  <tr> <td>Jane</td> <td>jane@example.com</td> </tr>
</tbody>
```

**Use Cases**:
- Multi-element updates from single request
- Update sidebar while replacing main content
- Show success notification while hiding form

**Your Needs**:
- Form submission → update grid + clear form
- Login → show grid + hide form
- Delete item → update table + show notification

---

## 6. RESPONSE HEADERS (Server-to-Browser Communication)

### HX-Specific Headers
| Header | Purpose |
|--------|---------|
| `HX-Trigger` | Trigger custom event on client |
| `HX-Retarget` | Change target element |
| `HX-Reswap` | Change swap strategy |
| `HX-Redirect` | Redirect to URL |
| `HX-Refresh` | Refresh entire page |
| `HX-Push-Url` | Add to browser history |
| `HX-Replace-Url` | Change URL without history |

### Using Response Headers

```javascript
// Server response:
res.setHeader('HX-Trigger', 'tableUpdated');
res.send(htmlResponse);

// Client listens:
htmx.on('htmx:load', (evt) => {
  if (evt.detail.xhr.getResponseHeader('HX-Trigger') === 'tableUpdated') {
    // Handle event
  }
});
```

### Cross-Component Communication Pattern
```html
<!-- Table listens for custom event -->
<table id="users" 
       hx-get="/users/data" 
       hx-trigger="userAdded from:body">
  ...
</table>

<!-- Form triggers event on success -->
<form hx-post="/users" hx-swap="none">
  <!-- Server responds with: HX-Trigger: userAdded -->
</form>
```

**Your Needs**:
- Form submission triggers table refresh (HX-Trigger)
- Login triggers app list show (HX-Trigger)
- Redirect on certain actions (HX-Redirect)

---

## 7. HTMX EVENTS

### Key Events
| Event | Fired When |
|-------|-----------|
| `htmx:beforeRequest` | Before request sent |
| `htmx:afterRequest` | After response received |
| `htmx:responseError` | Response error (4xx, 5xx) |
| `htmx:beforeSwap` | Before content swapped |
| `htmx:afterSwap` | After content swapped |
| `htmx:load` | Element loaded |
| Custom events | Server-triggered (HX-Trigger header) |

### Using Events
```html
<form hx-post="/save">
  <!-- Show spinner on request start -->
  <button hx-indicator="#spinner"> Save </button>
  <img id="spinner" class="htmx-indicator" src="/spinner.gif">
</form>

<!-- Script for advanced handling -->
<script>
document.addEventListener('htmx:afterRequest', (evt) => {
  if (evt.detail.successful) {
    showNotification('Saved!');
  }
});
</script>
```

**Your Needs**:
- Show/hide loading spinners
- Display success/error notifications
- Execute custom logic after requests
- Chain actions together

---

## 8. HTMX ATTRIBUTES SUMMARY

### Essential Attributes
```html
<!-- Request definition -->
<button hx-post="/api/action" 
        hx-trigger="click" 
        hx-target="#results" 
        hx-swap="innerHTML">
  Do Something
</button>

<!-- Request state -->
<button hx-disabled-elt="this" 
        hx-indicator="#spinner">
  <!-- Button disabled during request -->
</button>

<!-- Confirmation -->
<button hx-post="/delete" 
        hx-confirm="Are you sure?">
  Delete
</button>

<!-- Parameters (send along with request) -->
<button hx-post="/search" 
        hx-vals='{"filter": "active"}'>
  Search Active
</button>

<!-- Request headers -->
<button hx-post="/api" 
        hx-headers='{"X-Custom": "value"}'>
  API Call
</button>
```

---

## 9. REQUEST/RESPONSE FLOW

### Typical Flow
```
1. User interacts with element
2. hx-trigger fires (click, change, etc.)
3. HTMX collects form/element data
4. Sends request to hx-post/hx-get URL
5. Browser includes HX-Request header
6. Server processes and responds with HTML
7. HTMX swaps HTML into target using hx-swap
8. htmx:afterSwap event fires
9. Any HX-Trigger headers trigger custom events
10. Any OOB swaps update other elements
```

### Parameter Passing
```html
<!-- Automatic from form -->
<form hx-post="/submit">
  <input name="email">
  <input name="password">
  <!-- Sends: email=..., password=... -->
</form>

<!-- Manual -->
<button hx-post="/action" hx-vals='{"id": 42}'>

<!-- From request headers -->
<button hx-headers='{"X-User-ID": "42"}'>

<!-- Include other elements -->
<button hx-include="#other-form">
```

---

## 10. POLLING & AUTO-REFRESH

### Polling
```html
<!-- Poll every 2 seconds -->
<div hx-get="/status" hx-trigger="every 2s">
  Status: Loading...
</div>

<!-- Stop polling with 286 response code -->
<!-- Server: res.status(286).send() -->
```

### Load Polling
```html
<!-- Auto-refresh itself with delay -->
<div hx-get="/message" hx-trigger="load delay:2s" hx-swap="outerHTML">
  Waiting...
</div>

<!-- Server returns same div structure - keeps polling -->
```

**Your Needs**:
- Auto-refresh components
- Polling for updates
- Progress bars
- Real-time data

---

## 11. COMMON PATTERNS FOR YOUR NEEDS

### Pattern 1: Form Submit + Grid Update
```html
<!-- Form -->
<form hx-post="/items/create" hx-swap="none">
  <input name="name" required>
  <button type="submit">Add</button>
</form>

<!-- Grid -->
<table id="items-table" 
       hx-get="/items/table" 
       hx-trigger="itemAdded from:body">
  ...
</table>

<!-- Server response (from /items/create): -->
<!-- HX-Trigger: itemAdded -->
<!-- (Form data validated, item created) -->
```

### Pattern 2: Login → Show Apps Grid
```html
<!-- Login form -->
<form hx-post="/auth/login" hx-swap="none">
  <input type="email" name="email">
  <input type="password" name="password">
  <button>Login</button>
</form>

<!-- Apps grid (hidden initially) -->
<div id="apps-grid" 
     hx-trigger="loginSuccess from:body" 
     hx-get="/apps/list"
     hx-swap="innerHTML"
     style="display: none;">
</div>

<!-- Server response (from /auth/login): -->
<!-- HX-Trigger: loginSuccess -->
```

### Pattern 3: Nested Components
```html
<!-- Parent container (updates via OOB) -->
<div id="dashboard" hx-swap-oob="innerHTML">
  <!-- New content for dashboard -->
</div>

<!-- Child component (primary update) -->
<div id="main">
  New content here
</div>

<!-- Sidebar (also updates via OOB) -->
<aside id="sidebar" hx-swap-oob="innerHTML">
  Updated sidebar content
</aside>
```

### Pattern 4: Lazy Loading
```html
<!-- Tab content loads only when revealed -->
<div id="tab-content" 
     hx-get="/tab/content" 
     hx-trigger="revealed"
     hx-swap="innerHTML">
  Loading...
</div>
```

---

## 12. EXTENSIONS & ADVANCED

### Available Extensions
- **Morphing**: `idiomorph`, `morphdom`, `alpine-morph` - Smart DOM updates
- **Validation**: `client-side-templates` - Custom validation
- **Response processing**: `path-deps`, `json-enc`
- **Security**: CORS, CSP headers

### HX-On Scripting
```html
<!-- Inline event handling -->
<button hx-on="htmx:afterRequest: console.log('Done!')">
  Click
</button>
```

---

## 13. YOUR ARCHITECTURE MAPPING

### Current System → HTMX Native

| Current | HTMX Native | Benefit |
|---------|------------|---------|
| triggerBuilt (complex JSON) | hx-trigger + response headers | Simpler, declarative |
| Custom trigger classes | HX-Trigger header | Server-driven |
| setVals action | Hidden form fields + hx-vals | Native HTML |
| execEvent action | hx-get/hx-post to endpoint | Simple request |
| visible toggle | hx-swap with CSS | Visual state |
| Composite cross-references | hx-trigger from:body | Loose coupling |

### Database Schema Implications

**Current**:
- composites table: contains triggers, trigClass, trigAction, eventSQL
- pageConfig: contains triggerBuilt (JSON array of actions)
- Complexity: 3-level nesting with custom event types

**HTMX Native**:
- composites table: simplified to name, css_style, composite_props
- pageConfig: adds hx_method, hx_endpoint, hx_target, hx_trigger
- triggers table: maps old trigger names to HX-Trigger event names
- Simplification: Direct HTML attributes + server response headers

---

## 14. DECISION POINTS

### Questions for Your Architecture

1. **Cross-component communication**: Should it be:
   - Server-driven (HX-Trigger headers)? ✅ Recommended
   - Client-driven (custom JavaScript)? ❌ Defeats HTMX purpose

2. **Complex multi-step actions**:
   - Chain on server (single endpoint handles setVals + execEvent)?
   - Chain on client (multiple HTMX requests with triggers)?
   - Hybrid (server does work, responds with events)?

3. **Form field generation (genFields)**:
   - Stay with existing approach (sp_genFields)?
   - Or use HTMX form rendering directly?

4. **Polling/auto-refresh**:
   - Use hx-trigger="every 2s"? ✅ Built-in
   - Or endpoint-driven (286 response to stop)?

5. **Animations**:
   - Use hx-swap timing? ✅ CSS transitions
   - Or htmx events with JavaScript? ❌ More complex

---

## 15. NEXT STEPS

1. **Review your page interactions** - Map each to patterns above
2. **Identify trigger chains** - Which can become single requests?
3. **Redesign pageConfig schema** - Add HTMX columns
4. **Update composites table** - Simplify to HTMX attributes
5. **Modify studio-validate-build-triggers** - Generate HTMX HTML attributes instead of triggerBuilt JSON
6. **Update controllers** - Return HX-Trigger headers for events
7. **Test rendering** - Verify page renders with native HTMX attributes

---

## References
- Main docs: https://htmx.org/docs
- Cross-component pattern: https://htmx.org/examples/update-other-content/
- CSS transitions: https://htmx.org/docs/#css_transitions
- Response headers: https://htmx.org/reference/#response_headers
