# ⚡ ReactBoost — React + Vite Boilerplate

A modern, production-ready React boilerplate with a premium design system, custom hooks, global context, and utilities.

## 🚀 Quick Start

```bash
npm install
npm run dev
```

Open [http://localhost:5173](http://localhost:5173) to see the app.

---

## 📁 Project Structure

```
src/
├── components/
│   ├── layout/         # Navbar, Footer, Layout wrappers
│   └── ui/             # Reusable UI components (Button, Card, Modal, etc.)
├── context/
│   └── AppContext.jsx  # Global state: theme, user, notifications
├── hooks/
│   ├── useDebounce.js  # Delay state updates
│   ├── useFetch.js     # Data fetching with loading/error states
│   └── useLocalStorage.js  # Persist state to localStorage
├── pages/
│   └── Home.jsx        # Landing page (replace with your pages)
├── services/
│   └── api.js          # Centralized API service (GET, POST, PUT, DELETE)
├── utils/
│   └── helpers.js      # Formatting, slugify, debounce, clamp, etc.
├── App.jsx             # Root component
├── App.css             # App shell styles
├── main.jsx            # Entry point
└── index.css           # Global CSS design tokens & utilities
```

---

## 🎨 Design System

All design tokens are in `src/index.css` as CSS custom properties:

| Token | Description |
|-------|-------------|
| `--clr-*` | Colors (background, accent, text, border) |
| `--fs-*` | Font sizes (xs → 7xl) |
| `--fw-*` | Font weights |
| `--space-*` | Spacing scale |
| `--radius-*` | Border radii |
| `--shadow-*` | Box shadows & glow effects |
| `--transition-*` | Transition speeds |

### Utility Classes
- `.container`, `.container--narrow`, `.container--wide`
- `.text-gradient` — purple-to-cyan gradient text
- `.glass-card` — glassmorphism card with hover effects
- `.btn`, `.btn-primary`, `.btn-secondary`, `.btn-lg`
- `.badge`, `.badge-primary`
- `.animate-fade-in-up`, `.animate-fade-in`

---

## 🪝 Custom Hooks

### `useFetch(url, options)`
```jsx
const { data, loading, error, fetchData } = useFetch('/api/users')
```

### `useDebounce(value, delay)`
```jsx
const debouncedSearch = useDebounce(searchTerm, 500)
```

### `useLocalStorage(key, initialValue)`
```jsx
const [theme, setTheme] = useLocalStorage('theme', 'dark')
```

---

## 🌐 Global Context

```jsx
import { useApp } from './context/AppContext'

function MyComponent() {
  const { theme, toggleTheme, addNotification, user } = useApp()
  // ...
}
```

---

## 🛠️ API Service

Configure `VITE_API_URL` in `.env`:
```env
VITE_API_URL=https://api.yourbackend.com
```

Usage:
```js
import api from './services/api'

// GET
const users = await api.get('/users')

// POST
const newUser = await api.post('/users', { name: 'Alice' })

// PUT
await api.put('/users/1', { name: 'Alice Updated' })

// DELETE
await api.delete('/users/1')
```

---

## 🔧 Available Scripts

| Script | Description |
|--------|-------------|
| `npm run dev` | Start development server |
| `npm run build` | Build for production |
| `npm run preview` | Preview production build |

---

## 📦 Tech Stack

- **React 18** — UI library
- **Vite 6** — Build tool with HMR
- **Vanilla CSS** — Design system via custom properties
- **ESLint** — Code linting

---

Built with ❤️ using React + Vite
