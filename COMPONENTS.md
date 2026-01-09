# Rippl Shared Components

This document describes the shared UI component library available in this project. **Always use these components before creating custom ones.**

## Installation & Setup

Components are imported from `rippl-shared-components`:

```tsx
import { Button, Card, Avatar, LoadingSpinner } from 'rippl-shared-components'
import { lightTheme, darkTheme } from 'rippl-shared-components'
```

### Theme Setup

Wrap your app with MUI's ThemeProvider:

```tsx
import { ThemeProvider } from '@mui/material/styles'
import { CssBaseline } from '@mui/material'
import { lightTheme } from 'rippl-shared-components'

function App() {
  return (
    <ThemeProvider theme={lightTheme}>
      <CssBaseline />
      {/* Your app content */}
    </ThemeProvider>
  )
}
```

---

## Design Tokens

### Colors

| Token | Value | Usage |
|-------|-------|-------|
| Primary | `#312F7A` | Main brand color, navbar, primary buttons |
| Secondary | `#F73C36` | Accent/alert color |
| Accent | `#3858E9` | Ripply AI branding |
| Success | `#42B042` | Success states |
| Error | `#E85621` | Error states |
| Disabled | `#898989` | Disabled elements |
| Background | `#F8F8F8` | Page background |

### Typography

- **Font Family**: Montserrat
- **H2**: 700 weight, 1.5rem
- **H3**: 600 weight, 1.25rem

---

## Components Reference

### Button

MUI-based button with Rippl styling (fully rounded).

```tsx
import { Button } from 'rippl-shared-components'

<Button variant="contained" onClick={handleClick}>
  Save Changes
</Button>

<Button variant="outlined" hoverUnderlined>
  Learn More
</Button>

<Button variant="text" disabled>
  Disabled
</Button>
```

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `variant` | `'text' \| 'outlined' \| 'contained'` | `'text'` | Button style variant |
| `hoverUnderlined` | `boolean` | `false` | Underline on hover |
| `disabled` | `boolean` | `false` | Disable the button |
| `onClick` | `() => void` | - | Click handler |
| `sx` | `SxProps` | - | MUI sx styling |
| `children` | `ReactNode` | - | Button content |

---

### Card

Container component with optional header.

```tsx
import { Card } from 'rippl-shared-components'

<Card header="Patient Information">
  <p>Card content goes here</p>
</Card>

<Card>
  <p>Card without header</p>
</Card>
```

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `header` | `string` | - | Optional header text |
| `children` | `ReactNode` | - | Card content |

---

### Avatar

Simple circular avatar image.

```tsx
import { Avatar } from 'rippl-shared-components'

<Avatar
  src="https://example.com/photo.jpg"
  alt="User Name"
  size={48}
/>
```

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `src` | `string` | - | Image URL |
| `alt` | `string` | - | Alt text |
| `size` | `number` | `48` | Size in pixels |
| `sx` | `SxProps` | - | MUI sx styling |

---

### UserAvatar

Avatar with optional details panel (label/value pairs).

```tsx
import { UserAvatar } from 'rippl-shared-components'

<UserAvatar
  user={{ name: "John Doe", picture: "https://..." }}
  size={64}
  details={{
    label: "Role",
    value: "Administrator"
  }}
/>
```

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `user` | `{ name: string, picture?: string }` | - | User object |
| `size` | `number` | `48` | Avatar size in pixels |
| `details` | `{ label, value, extraItem?, labelSx?, valueSx? }` | - | Optional details display |
| `sx` | `SxProps` | - | MUI sx styling |

---

### LoadingSpinner

Centered circular progress indicator.

```tsx
import { LoadingSpinner } from 'rippl-shared-components'

<LoadingSpinner />

<LoadingSpinner size={60} />
```

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `size` | `number` | - | Spinner size |
| `boxSx` | `SxProps` | - | Container styling |

---

### StatusIcon

Status indicator icon with semantic colors.

```tsx
import { StatusIcon } from 'rippl-shared-components'

<StatusIcon type="success" />
<StatusIcon type="warning" />
<StatusIcon type="error" />
<StatusIcon type="info" />
```

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `type` | `'success' \| 'warning' \| 'error' \| 'info'` | - | Status type |
| `sx` | `SxProps` | - | MUI sx styling |

---

### LabelValuePair

Display a label above a value.

```tsx
import { LabelValuePair } from 'rippl-shared-components'

<LabelValuePair
  label="Email"
  value="user@example.com"
/>
```

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `label` | `string` | - | Label text |
| `value` | `string` | - | Value text |
| `labelSx` | `SxProps` | - | Label styling |
| `valueSx` | `SxProps` | - | Value styling |

---

### HtmlContent

Renders sanitized HTML content (uses DOMPurify).

```tsx
import { HtmlContent } from 'rippl-shared-components'

<HtmlContent html="<p>Safe <strong>HTML</strong> content</p>" />

<HtmlContent
  html={content}
  contentEditable
  onChange={handleChange}
/>
```

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `html` | `string` | - | HTML string to render |
| `className` | `string` | - | CSS class |
| `contentEditable` | `boolean` | - | Make content editable |
| `onChange` | `(e) => void` | - | Change handler |
| `onBlur` | `(e) => void` | - | Blur handler |
| `style` | `CSSProperties` | - | Inline styles |

---

### Accordion

Single expandable panel.

```tsx
import { Accordion } from 'rippl-shared-components'

<Accordion
  id="section1"
  header={<span>Section Title</span>}
  content={<div>Expandable content</div>}
  isExpanded={expanded === 'section1'}
  handleChange={handleChange}
/>
```

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `id` | `string` | - | Unique panel ID |
| `header` | `ReactNode` | - | Header content |
| `content` | `ReactNode` | - | Expandable content |
| `isExpanded` | `boolean` | - | Expansion state |
| `handleChange` | `(id: string) => void` | - | Toggle handler |

---

### AccordionGroup

Container that manages multiple accordion panels (single expand at a time).

```tsx
import { AccordionGroup } from 'rippl-shared-components'

<AccordionGroup
  panels={[
    { id: 'panel1', header: 'First Section', component: <Content1 /> },
    { id: 'panel2', header: 'Second Section', component: <Content2 /> },
  ]}
/>
```

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `panels` | `Array<{ id, header, component }>` | - | Panel definitions |

---

### AccordionHeader Variants

Pre-styled header components for accordions.

```tsx
import {
  AccordionHeader,
  AccordionHeaderWithIcon,
  AccordionHeaderWithFieldCount
} from 'rippl-shared-components'

// Basic header
<AccordionHeader>
  <span>Title</span>
</AccordionHeader>

// Header with icon
<AccordionHeaderWithIcon
  icon={<PersonIcon />}
  title="Personal Info"
  description="Basic details"
/>

// Header with field count indicator
<AccordionHeaderWithFieldCount
  icon={<ListIcon />}
  title="Form Section"
  formData={formValues}
  fieldCount={5}
/>
```

---

### NavBar

Application navigation bar with optional user avatar.

```tsx
import { NavBar } from 'rippl-shared-components'

<NavBar user={{ name: "John", picture: "..." }}>
  <NavLink onClick={goHome} isActive title="Home" />
  <NavLink onClick={goSettings} title="Settings" />
</NavBar>
```

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `user` | `{ name, picture? }` | - | Current user |
| `children` | `ReactNode` | - | Navigation items |
| `sx` | `SxProps` | - | MUI sx styling |

---

### NavLink

Navigation icon button with tooltip.

```tsx
import { NavLink } from 'rippl-shared-components'

<NavLink
  onClick={handleClick}
  isActive={currentPage === 'home'}
  title="Home"
/>
```

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `onClick` | `() => void` | - | Click handler |
| `isActive` | `boolean` | - | Active state |
| `title` | `string` | - | Tooltip text |
| `sx` | `SxProps` | - | MUI sx styling |

---

## Utility Components

### CenteredContentContainer

Flexbox container that centers content.

```tsx
import { CenteredContentContainer } from 'rippl-shared-components'

<CenteredContentContainer>
  <LoadingSpinner />
</CenteredContentContainer>
```

---

### ScrollableContainer

Container with vertical scrolling.

```tsx
import { ScrollableContainer } from 'rippl-shared-components'

<ScrollableContainer height="400px">
  {longContent}
</ScrollableContainer>
```

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `height` | `string` | `'100%'` | Container height |
| `children` | `ReactNode` | - | Scrollable content |
| `sx` | `SxProps` | - | MUI sx styling |

---

### ClickToCopy

Wraps content with click-to-copy functionality.

```tsx
import { ClickToCopy } from 'rippl-shared-components'

<ClickToCopy text="Text to copy">
  <span>Click to copy this</span>
</ClickToCopy>
```

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `text` | `string` | - | Text to copy to clipboard |
| `children` | `ReactNode` | - | Clickable content |

---

## Ripply AI Components

Components for the Ripply AI assistant interface.

### RipplySideBar

Full chat interface container.

### RipplyChatMessage

Individual chat message bubble.

```tsx
import { RipplyChatMessage } from 'rippl-shared-components'

<RipplyChatMessage source="user" message="Hello!" />
<RipplyChatMessage source="ripply" message="Hi there!" />
```

### RipplyAvatar

Ripply AI avatar with optional label.

```tsx
import { RipplyAvatar } from 'rippl-shared-components'

<RipplyAvatar withLabel />
```

### RipplySuggestionAction

Suggestion button for AI prompts.

```tsx
import { RipplySuggestionAction } from 'rippl-shared-components'

<RipplySuggestionAction
  text="Show me patient history"
  handleClick={handleSuggestion}
/>
```

---

## Viewing Components in Storybook

To explore components visually, run Storybook in the shared components repo:

```bash
cd ~/rippl/rippl-shared-components
npm run storybook
```

This opens an interactive component catalog at http://localhost:6006
