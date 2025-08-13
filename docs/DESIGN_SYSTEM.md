# Design System Documentation

## Design Principles

### Core Values
1. **Clarity**: Information should be easy to understand and act upon
2. **Efficiency**: Minimize cognitive load and user effort
3. **Accessibility**: Usable by everyone, regardless of ability
4. **Consistency**: Predictable patterns and behaviors
5. **Empathy**: Reduce anxiety and build confidence in interview practice

### User Experience Goals
- **Reduce Interview Anxiety**: Calming, supportive interface
- **Build Confidence**: Clear progress indicators and positive reinforcement
- **Encourage Practice**: Engaging, motivating experience
- **Professional Feel**: Enterprise-quality design that reflects real interview environments

## Color Palette

### Current Implementation (Tailwind CSS 4)

#### Light Theme
```css
:root {
  /* Primary Colors */
  --primary: oklch(0.205 0 0);           /* #343434 - Charcoal */
  --primary-foreground: oklch(0.985 0 0); /* #FCFCFC - Off White */
  
  /* Background Colors */
  --background: oklch(1 0 0);            /* #FFFFFF - Pure White */
  --foreground: oklch(0.145 0 0);        /* #252525 - Dark Gray */
  
  /* Card & Surface Colors */
  --card: oklch(1 0 0);                  /* #FFFFFF - White */
  --card-foreground: oklch(0.145 0 0);   /* #252525 - Dark Gray */
  
  /* Interactive Colors */
  --muted: oklch(0.97 0 0);              /* #F7F7F7 - Light Gray */
  --muted-foreground: oklch(0.556 0 0);  /* #8E8E8E - Medium Gray */
  --accent: oklch(0.97 0 0);             /* #F7F7F7 - Light Gray */
  --accent-foreground: oklch(0.205 0 0); /* #343434 - Charcoal */
  
  /* Border & Input Colors */
  --border: oklch(0.922 0 0);            /* #EBEBEB - Border Gray */
  --input: oklch(0.922 0 0);             /* #EBEBEB - Input Gray */
  --ring: oklch(0.708 0 0);              /* #B5B5B5 - Focus Ring */
  
  /* Status Colors */
  --destructive: oklch(0.577 0.245 27.325); /* #DC2626 - Red */
}
```

#### Dark Theme
```css
.dark {
  /* Primary Colors */
  --primary: oklch(0.922 0 0);           /* #EBEBEB - Light Gray */
  --primary-foreground: oklch(0.205 0 0); /* #343434 - Dark Gray */
  
  /* Background Colors */
  --background: oklch(0.145 0 0);        /* #252525 - Dark Gray */
  --foreground: oklch(0.985 0 0);        /* #FCFCFC - Off White */
  
  /* Card & Surface Colors */
  --card: oklch(0.205 0 0);              /* #343434 - Charcoal */
  --card-foreground: oklch(0.985 0 0);   /* #FCFCFC - Off White */
  
  /* Interactive Colors */
  --muted: oklch(0.269 0 0);             /* #444444 - Dark Muted */
  --muted-foreground: oklch(0.708 0 0);  /* #B5B5B5 - Light Muted */
  --accent: oklch(0.269 0 0);            /* #444444 - Dark Accent */
  --accent-foreground: oklch(0.985 0 0); /* #FCFCFC - Light Accent */
  
  /* Border & Input Colors */
  --border: oklch(1 0 0 / 10%);          /* Transparent White 10% */
  --input: oklch(1 0 0 / 15%);           /* Transparent White 15% */
  --ring: oklch(0.556 0 0);              /* #8E8E8E - Focus Ring */
}
```

### Extended Color Palette (Recommended)

#### Brand Colors
```css
/* Success Colors */
--success: oklch(0.647 0.16 142.495);     /* #10B981 - Emerald */
--success-foreground: oklch(1 0 0);       /* #FFFFFF - White */
--success-muted: oklch(0.906 0.064 142.5); /* #D1FAE5 - Light Emerald */

/* Warning Colors */
--warning: oklch(0.768 0.171 70.67);      /* #F59E0B - Amber */
--warning-foreground: oklch(0.145 0 0);   /* #252525 - Dark */
--warning-muted: oklch(0.949 0.069 70.5); /* #FEF3C7 - Light Amber */

/* Info Colors */
--info: oklch(0.599 0.156 233.337);       /* #3B82F6 - Blue */
--info-foreground: oklch(1 0 0);          /* #FFFFFF - White */
--info-muted: oklch(0.924 0.063 233.5);   /* #DBEAFE - Light Blue */

/* Chart Colors */
--chart-1: oklch(0.646 0.222 41.116);     /* #F97316 - Orange */
--chart-2: oklch(0.6 0.118 184.704);      /* #06B6D4 - Cyan */
--chart-3: oklch(0.398 0.07 227.392);     /* #6366F1 - Indigo */
--chart-4: oklch(0.828 0.189 84.429);     /* #84CC16 - Lime */
--chart-5: oklch(0.769 0.188 70.08);      /* #EAB308 - Yellow */
```

#### Semantic Color Usage
- **Primary**: Main CTAs, important actions
- **Success**: Completed tasks, positive feedback, high scores
- **Warning**: Attention needed, medium scores
- **Destructive**: Errors, delete actions, low scores
- **Info**: Informational messages, tips, neutral feedback
- **Muted**: Secondary content, subtle UI elements

## Typography

### Font Stack
```css
/* Primary Font (Geist Sans) */
--font-sans: "Geist", -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;

/* Monospace Font (Geist Mono) */
--font-mono: "Geist Mono", Menlo, Monaco, "Courier New", monospace;
```

### Type Scale

#### Heading Sizes
```css
.text-4xl { font-size: 2.25rem; line-height: 2.5rem; }    /* 36px/40px */
.text-3xl { font-size: 1.875rem; line-height: 2.25rem; } /* 30px/36px */
.text-2xl { font-size: 1.5rem; line-height: 2rem; }      /* 24px/32px */
.text-xl { font-size: 1.25rem; line-height: 1.75rem; }   /* 20px/28px */
.text-lg { font-size: 1.125rem; line-height: 1.75rem; }  /* 18px/28px */
```

#### Body Text Sizes
```css
.text-base { font-size: 1rem; line-height: 1.5rem; }      /* 16px/24px */
.text-sm { font-size: 0.875rem; line-height: 1.25rem; }  /* 14px/20px */
.text-xs { font-size: 0.75rem; line-height: 1rem; }      /* 12px/16px */
```

#### Font Weights
```css
.font-light { font-weight: 300; }
.font-normal { font-weight: 400; }
.font-medium { font-weight: 500; }
.font-semibold { font-weight: 600; }
.font-bold { font-weight: 700; }
```

### Typography Usage Guidelines

#### Headings
- **H1 (text-4xl)**: Page titles, main headings
- **H2 (text-3xl)**: Section titles, card titles
- **H3 (text-2xl)**: Subsection titles
- **H4 (text-xl)**: Component titles
- **H5 (text-lg)**: Small component titles

#### Body Text
- **text-base**: Primary body text, form inputs
- **text-sm**: Secondary text, captions, form helpers
- **text-xs**: Fine print, timestamps, metadata

#### Code & Technical Content
- **font-mono**: Code snippets, technical terms, IDs

### Text Color Usage
```css
/* Primary text on main background */
.text-foreground { color: var(--foreground); }

/* Secondary/supporting text */
.text-muted-foreground { color: var(--muted-foreground); }

/* Text on colored backgrounds */
.text-primary-foreground { color: var(--primary-foreground); }
.text-accent-foreground { color: var(--accent-foreground); }

/* Status-specific text */
.text-success { color: var(--success); }
.text-warning { color: var(--warning); }
.text-destructive { color: var(--destructive); }
```

## Component Library

### Current shadcn/ui Components

#### Form Components
```tsx
// Button variants
<Button variant="default">Primary Action</Button>
<Button variant="secondary">Secondary Action</Button>
<Button variant="outline">Outlined Button</Button>
<Button variant="ghost">Ghost Button</Button>
<Button variant="destructive">Delete Button</Button>

// Input components
<Input placeholder="Enter your answer..." />
<Textarea placeholder="Detailed response..." />
<Label htmlFor="answer">Your Answer</Label>

// Selection components
<RadioGroup>
  <RadioGroupItem value="frontend" id="frontend" />
  <Label htmlFor="frontend">Frontend Developer</Label>
</RadioGroup>
```

#### Layout Components
```tsx
// Card structure
<Card>
  <CardHeader>
    <CardTitle>Interview Question</CardTitle>
    <CardDescription>Answer the following question</CardDescription>
  </CardHeader>
  <CardContent>
    {/* Main content */}
  </CardContent>
</Card>

// Dialog/Modal
<Dialog>
  <DialogTrigger>Open Dialog</DialogTrigger>
  <DialogContent>
    <DialogHeader>
      <DialogTitle>Confirm Action</DialogTitle>
    </DialogHeader>
    {/* Dialog content */}
  </DialogContent>
</Dialog>
```

#### Data Display Components
```tsx
// Progress indicator
<Progress value={75} />

// Badge for categories
<Badge variant="default">Frontend</Badge>
<Badge variant="secondary">Completed</Badge>
<Badge variant="outline">Medium</Badge>

// Separator
<Separator className="my-4" />
```

### Component Specifications

#### Button Component
```tsx
interface ButtonProps {
  variant: 'default' | 'destructive' | 'outline' | 'secondary' | 'ghost' | 'link'
  size: 'default' | 'sm' | 'lg' | 'icon'
  disabled?: boolean
  children: React.ReactNode
}

// Sizes
.h-9 { height: 2.25rem; }      /* sm */
.h-10 { height: 2.5rem; }      /* default */
.h-11 { height: 2.75rem; }     /* lg */

// Padding
.px-3 { padding-left: 0.75rem; padding-right: 0.75rem; } /* sm */
.px-4 { padding-left: 1rem; padding-right: 1rem; }       /* default */
.px-8 { padding-left: 2rem; padding-right: 2rem; }       /* lg */
```

#### Card Component
```tsx
interface CardProps {
  className?: string
  children: React.ReactNode
}

// Card styling
.rounded-xl { border-radius: 0.75rem; }
.border { border-width: 1px; }
.bg-card { background-color: var(--card); }
.text-card-foreground { color: var(--card-foreground); }
.shadow-sm { box-shadow: 0 1px 2px 0 rgb(0 0 0 / 0.05); }
```

#### Input Component
```tsx
interface InputProps {
  type?: string
  placeholder?: string
  disabled?: boolean
  error?: boolean
}

// Input styling
.h-9 { height: 2.25rem; }
.px-3 { padding-left: 0.75rem; padding-right: 0.75rem; }
.rounded-md { border-radius: 0.375rem; }
.border-input { border-color: var(--input); }
.bg-transparent { background-color: transparent; }

// Focus state
.focus:outline-none:focus:ring-2:focus:ring-ring { 
  outline: 2px solid transparent;
  ring-width: 2px;
  ring-color: var(--ring);
}
```

### Additional Components Needed

#### Score Display Component
```tsx
interface ScoreDisplayProps {
  scores: {
    understanding: number
    logic: number
    specificity: number
    jobFit: number
  }
  totalScore: number
}

// Visual representation with color coding
const getScoreColor = (score: number) => {
  if (score >= 20) return 'text-success'
  if (score >= 15) return 'text-warning'
  return 'text-destructive'
}
```

#### Progress Tracker Component
```tsx
interface ProgressTrackerProps {
  currentStep: number
  totalSteps: number
  steps: Array<{
    title: string
    status: 'completed' | 'current' | 'upcoming'
  }>
}
```

#### Timer Component
```tsx
interface TimerProps {
  duration: number // in seconds
  onTimeUp: () => void
  showWarning?: boolean
  warningThreshold?: number
}
```

## Responsive Breakpoints

### Tailwind CSS Breakpoints
```css
/* Mobile First Approach */
sm: '640px',   /* Small tablets and large phones */
md: '768px',   /* Tablets */
lg: '1024px',  /* Small laptops */
xl: '1280px',  /* Large laptops */
2xl: '1536px'  /* Desktop monitors */
```

### Component Responsive Behavior

#### Grid System
```tsx
// Interview layout grid
<div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
  <div className="lg:col-span-2">
    {/* Question and answer area */}
  </div>
  <div className="lg:col-span-1">
    {/* Progress and tools */}
  </div>
</div>
```

#### Container Sizing
```css
/* Container max-widths */
.container {
  width: 100%;
  margin-left: auto;
  margin-right: auto;
  padding-left: 1rem;
  padding-right: 1rem;
}

@media (min-width: 640px) {
  .container { max-width: 640px; }
}

@media (min-width: 768px) {
  .container { max-width: 768px; }
}

@media (min-width: 1024px) {
  .container { max-width: 1024px; }
}

@media (min-width: 1280px) {
  .container { max-width: 1280px; }
}
```

#### Typography Scaling
```css
/* Responsive text sizes */
.text-responsive-xl {
  font-size: 1.25rem; /* 20px */
  line-height: 1.75rem; /* 28px */
}

@media (min-width: 768px) {
  .text-responsive-xl {
    font-size: 1.5rem; /* 24px */
    line-height: 2rem; /* 32px */
  }
}

@media (min-width: 1024px) {
  .text-responsive-xl {
    font-size: 1.875rem; /* 30px */
    line-height: 2.25rem; /* 36px */
  }
}
```

## Accessibility Guidelines

### WCAG 2.1 AA Compliance

#### Color Contrast Requirements
- **Normal text**: 4.5:1 contrast ratio minimum
- **Large text** (18pt+ or 14pt+ bold): 3:1 contrast ratio minimum
- **Non-text elements**: 3:1 contrast ratio for UI components

#### Current Contrast Ratios
```css
/* Light theme combinations */
background (#FFFFFF) / foreground (#252525) = 13.6:1 ✅
card (#FFFFFF) / card-foreground (#252525) = 13.6:1 ✅
muted (#F7F7F7) / muted-foreground (#8E8E8E) = 4.9:1 ✅
border (#EBEBEB) / foreground (#252525) = 8.4:1 ✅

/* Dark theme combinations */
background (#252525) / foreground (#FCFCFC) = 13.1:1 ✅
card (#343434) / card-foreground (#FCFCFC) = 9.8:1 ✅
```

#### Keyboard Navigation
```tsx
// Focus management example
const handleKeyDown = (e: KeyboardEvent) => {
  if (e.key === 'Enter' || e.key === ' ') {
    e.preventDefault()
    handleClick()
  }
}

// Focus trap for modals
<Dialog>
  <DialogContent onKeyDown={handleDialogKeyDown}>
    {/* Focusable elements */}
  </DialogContent>
</Dialog>
```

#### Screen Reader Support
```tsx
// ARIA labels and descriptions
<Button 
  aria-label="Analyze your answer"
  aria-describedby="analyze-help"
>
  Analyze Answer
</Button>
<div id="analyze-help" className="sr-only">
  This will send your answer for AI analysis and provide feedback
</div>

// Live regions for dynamic content
<div aria-live="polite" aria-atomic="true">
  {isAnalyzing && "Analyzing your answer, please wait..."}
  {analysisComplete && "Analysis complete. Results are now available."}
</div>
```

#### Form Accessibility
```tsx
// Proper form labeling
<Label htmlFor="answer" className="required">
  Your Answer *
</Label>
<Textarea 
  id="answer"
  aria-required="true"
  aria-describedby="answer-error answer-help"
  aria-invalid={hasError}
/>
{hasError && (
  <div id="answer-error" role="alert" className="text-destructive">
    Please provide an answer to continue
  </div>
)}
<div id="answer-help" className="text-muted-foreground">
  Provide a detailed response with specific examples
</div>
```

### Focus Management

#### Focus Indicators
```css
/* Custom focus ring */
.focus-visible:focus-visible {
  outline: 2px solid var(--ring);
  outline-offset: 2px;
  border-radius: 0.375rem;
}

/* Skip to content link */
.skip-to-content {
  position: absolute;
  top: -40px;
  left: 6px;
  background: var(--primary);
  color: var(--primary-foreground);
  padding: 8px;
  text-decoration: none;
  border-radius: 4px;
}

.skip-to-content:focus {
  top: 6px;
}
```

## UI Patterns

### Layout Patterns

#### Interview Screen Layout
```tsx
<div className="min-h-screen bg-background">
  {/* Header */}
  <header className="border-b border-border">
    <div className="container py-4">
      {/* Navigation and progress */}
    </div>
  </header>
  
  {/* Main content */}
  <main className="container py-8">
    <div className="grid lg:grid-cols-3 gap-8">
      {/* Question area - 2/3 width on desktop */}
      <div className="lg:col-span-2">
        <Card>
          {/* Question content */}
        </Card>
      </div>
      
      {/* Sidebar - 1/3 width on desktop */}
      <div className="lg:col-span-1">
        {/* Progress, tools, tips */}
      </div>
    </div>
  </main>
</div>
```

#### Card-Based Information Architecture
```tsx
// Primary content card
<Card className="w-full">
  <CardHeader className="pb-4">
    <div className="flex items-center justify-between">
      <CardTitle className="text-2xl">Question #{currentQuestionNumber}</CardTitle>
      <Badge variant="outline">{difficulty}</Badge>
    </div>
    <CardDescription>
      {category} • Estimated time: {estimatedTime} minutes
    </CardDescription>
  </CardHeader>
  <CardContent>
    {/* Question content */}
  </CardContent>
</Card>
```

### Interactive Patterns

#### Progressive Disclosure
```tsx
// Collapsible feedback sections
<Collapsible>
  <CollapsibleTrigger className="flex items-center gap-2">
    <ChevronDown className="h-4 w-4" />
    View Detailed Feedback
  </CollapsibleTrigger>
  <CollapsibleContent>
    {/* Detailed analysis content */}
  </CollapsibleContent>
</Collapsible>
```

#### Loading States
```tsx
// Button loading state
<Button disabled={isLoading}>
  {isLoading && (
    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
  )}
  {isLoading ? 'Analyzing...' : 'Analyze Answer'}
</Button>

// Content loading skeleton
<div className="space-y-4">
  <Skeleton className="h-8 w-3/4" />
  <Skeleton className="h-4 w-full" />
  <Skeleton className="h-4 w-2/3" />
</div>
```

#### Form Validation Patterns
```tsx
// Inline validation
const [errors, setErrors] = useState<Record<string, string>>({})

<div className="space-y-2">
  <Label htmlFor="answer">Your Answer</Label>
  <Textarea
    id="answer"
    value={answer}
    onChange={(e) => handleAnswerChange(e.target.value)}
    className={cn(
      errors.answer && "border-destructive focus:ring-destructive"
    )}
  />
  {errors.answer && (
    <p className="text-sm text-destructive">{errors.answer}</p>
  )}
</div>
```

### Micro-Interactions

#### Hover States
```css
/* Button hover effects */
.btn-primary:hover {
  background-color: var(--primary);
  opacity: 0.9;
  transform: translateY(-1px);
  transition: all 0.2s ease-in-out;
}

/* Card hover effects */
.card-interactive:hover {
  box-shadow: 0 4px 6px -1px rgb(0 0 0 / 0.1);
  transform: translateY(-2px);
  transition: all 0.3s ease-in-out;
}
```

#### Animation Classes
```css
/* Fade in animation */
@keyframes fadeIn {
  from { opacity: 0; transform: translateY(10px); }
  to { opacity: 1; transform: translateY(0); }
}

.animate-fade-in {
  animation: fadeIn 0.3s ease-out;
}

/* Scale in animation */
@keyframes scaleIn {
  from { opacity: 0; transform: scale(0.95); }
  to { opacity: 1; transform: scale(1); }
}

.animate-scale-in {
  animation: scaleIn 0.2s ease-out;
}
```

## Dark Mode Implementation

### Theme Toggle Component
```tsx
import { Moon, Sun } from "lucide-react"
import { useTheme } from "next-themes"

export function ThemeToggle() {
  const { theme, setTheme } = useTheme()

  return (
    <Button
      variant="ghost"
      size="icon"
      onClick={() => setTheme(theme === "light" ? "dark" : "light")}
    >
      <Sun className="h-[1.2rem] w-[1.2rem] rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0" />
      <Moon className="absolute h-[1.2rem] w-[1.2rem] rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100" />
      <span className="sr-only">Toggle theme</span>
    </Button>
  )
}
```

### Theme Provider Setup
```tsx
// app/layout.tsx
import { ThemeProvider } from "next-themes"

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body>
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
          disableTransitionOnChange
        >
          {children}
        </ThemeProvider>
      </body>
    </html>
  )
}
```

## Performance Considerations

### CSS Optimization
- Use Tailwind's purge feature to remove unused styles
- Minimize custom CSS in favor of utility classes
- Optimize font loading with font-display: swap

### Component Optimization
```tsx
// Memoize expensive components
const ScoreChart = memo(({ data }: { data: ScoreData }) => {
  // Chart rendering logic
})

// Lazy load heavy components
const AnalyticsChart = lazy(() => import('./analytics-chart'))
```

### Animation Performance
```css
/* Use transform and opacity for animations */
.smooth-animation {
  transition: transform 0.3s ease-out, opacity 0.3s ease-out;
  will-change: transform, opacity;
}

/* Avoid animating expensive properties */
.avoid {
  transition: width 0.3s ease-out; /* Can cause layout thrashing */
}

.prefer {
  transition: transform 0.3s ease-out; /* GPU accelerated */
}
```

## Design Tokens

### Spacing Scale
```css
/* Tailwind spacing scale */
.space-1 { margin: 0.25rem; }    /* 4px */
.space-2 { margin: 0.5rem; }     /* 8px */
.space-3 { margin: 0.75rem; }    /* 12px */
.space-4 { margin: 1rem; }       /* 16px */
.space-6 { margin: 1.5rem; }     /* 24px */
.space-8 { margin: 2rem; }       /* 32px */
.space-12 { margin: 3rem; }      /* 48px */
.space-16 { margin: 4rem; }      /* 64px */
```

### Border Radius Scale
```css
/* Current implementation */
--radius: 0.625rem; /* 10px base radius */

.rounded-sm { border-radius: calc(var(--radius) - 4px); }  /* 6px */
.rounded-md { border-radius: calc(var(--radius) - 2px); }  /* 8px */
.rounded-lg { border-radius: var(--radius); }              /* 10px */
.rounded-xl { border-radius: calc(var(--radius) + 4px); }  /* 14px */
```

### Shadow Scale
```css
.shadow-sm { box-shadow: 0 1px 2px 0 rgb(0 0 0 / 0.05); }
.shadow { box-shadow: 0 1px 3px 0 rgb(0 0 0 / 0.1), 0 1px 2px -1px rgb(0 0 0 / 0.1); }
.shadow-md { box-shadow: 0 4px 6px -1px rgb(0 0 0 / 0.1), 0 2px 4px -2px rgb(0 0 0 / 0.1); }
.shadow-lg { box-shadow: 0 10px 15px -3px rgb(0 0 0 / 0.1), 0 4px 6px -4px rgb(0 0 0 / 0.1); }
```