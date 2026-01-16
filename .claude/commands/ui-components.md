# UI Components Command

Display available shared UI components from rippl-shared-components library.

> **Note:** This command is only relevant when your project uses the **rippl-shared-components** library (Option A in CLAUDE.md). If your project uses the **frontend-design skill** for custom UI, this command is not applicable—use `/frontend-design` instead.

## Instructions

First, check if the project is configured to use rippl-shared-components by looking at CLAUDE.md. If the project uses the frontend-design skill instead, inform the user that this command isn't applicable and suggest using `/frontend-design` for custom UI work.

If rippl-shared-components is configured, read the `COMPONENTS.md` file and present a summary of available components.

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
