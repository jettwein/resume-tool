# UI Components Command

Display available shared UI components from rippl-shared-components library.

## Instructions

Read the `COMPONENTS.md` file and present a summary of available components.

## Output Format

```
## Available UI Components

### Core Components
| Component | Purpose | Key Props |
|-----------|---------|-----------|
| Button | Primary action button | variant, onClick, disabled |
| Card | Content container | header, children |
| Avatar | User image | src, alt, size |
| UserAvatar | Avatar with details | user, size, details |
| LoadingSpinner | Loading indicator | size |
| StatusIcon | Status indicator | type (success/warning/error/info) |
| LabelValuePair | Label above value | label, value |
| HtmlContent | Sanitized HTML render | html, contentEditable |

### Accordion Components
| Component | Purpose |
|-----------|---------|
| Accordion | Single expandable panel |
| AccordionGroup | Multiple panels (single expand) |
| AccordionHeader* | Pre-styled header variants |

### Layout Components
| Component | Purpose |
|-----------|---------|
| NavBar | App navigation bar |
| NavLink | Navigation icon button |

### Utility Components
| Component | Purpose |
|-----------|---------|
| CenteredContentContainer | Flexbox centering |
| ScrollableContainer | Scrollable area |
| ClickToCopy | Copy to clipboard wrapper |

### Ripply AI Components
| Component | Purpose |
|-----------|---------|
| RipplySideBar | Chat interface container |
| RipplyChatMessage | Chat message bubble |
| RipplyAvatar | AI assistant avatar |
| RipplySuggestionAction | Suggestion button |

---

**Import example:**
```tsx
import { Button, Card, Avatar } from 'rippl-shared-components'
import { lightTheme } from 'rippl-shared-components'
```

**Full documentation:** See `COMPONENTS.md` for detailed props and usage examples.

**View in Storybook:** `cd ~/rippl/rippl-shared-components && npm run storybook`
```

After presenting this summary, remind the user:
- Always use shared components before creating custom ones
- Check COMPONENTS.md for detailed props and examples
- Follow MUI `sx` prop patterns for styling
