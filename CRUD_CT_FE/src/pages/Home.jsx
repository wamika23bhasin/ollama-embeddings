import './Home.css'

const features = [
  {
    icon: '⚡',
    title: 'Lightning Fast',
    description: 'Powered by Vite with HMR for instant development feedback and blazing production builds.',
    color: '#f59e0b',
  },
  {
    icon: '🎨',
    title: 'Design System',
    description: 'Pre-built CSS design tokens, utility classes, and glassmorphism components ready to use.',
    color: '#7c3aed',
  },
  {
    icon: '🪝',
    title: 'Custom Hooks',
    description: 'useFetch, useDebounce, useLocalStorage — production-ready hooks for common patterns.',
    color: '#06b6d4',
  },
  {
    icon: '🌐',
    title: 'Global Context',
    description: 'AppContext with theme, user, and notification management out of the box.',
    color: '#10b981',
  },
  {
    icon: '🛠️',
    title: 'Utility Belt',
    description: 'Helper functions for formatting, validation, debouncing, slugifying, and more.',
    color: '#f43f5e',
  },
  {
    icon: '📁',
    title: 'Clean Structure',
    description: 'Well-organized folder structure: components, pages, hooks, utils, context, services.',
    color: '#8b5cf6',
  },
]

const stack = [
  { name: 'React 18', description: 'UI Library', emoji: '⚛️' },
  { name: 'Vite 6', description: 'Build Tool', emoji: '🔥' },
  { name: 'Vanilla CSS', description: 'Styling', emoji: '🎨' },
  { name: 'ESLint', description: 'Linting', emoji: '🔍' },
]

/**
 * Home Page Component
 * Landing page showcasing the boilerplate features
 */
function Home({ onNavigate }) {
  return (
    <main className="home" id="home">
      {/* ── Hero Section ── */}
      <section className="hero" aria-labelledby="hero-heading">
        <div className="container">
          <div className="hero__content">
            <div className="badge badge-primary hero__badge">
              <span aria-hidden="true">✨</span>
              React + Vite Boilerplate
            </div>

            <h1 id="hero-heading" className="hero__title">
              Build faster.<br />
              Ship <span className="text-gradient">better apps.</span>
            </h1>

            <p className="hero__description">
              A premium, production-ready React boilerplate with a beautiful design system,
              custom hooks, global state, and utilities — so you can focus on what matters.
            </p>

            <div className="hero__actions">
              <a href="#features" className="btn btn-primary btn-lg" id="hero-get-started">
                Explore Features →
              </a>
              <button
                className="btn btn-secondary btn-lg"
                id="hero-report-issue"
                onClick={() => onNavigate?.('report-issue')}
              >
                🐛 Report an Issue
              </button>
            </div>

            {/* Stats */}
            <div className="hero__stats" role="list" aria-label="Boilerplate stats">
              {[
                { value: '6+', label: 'Custom Hooks' },
                { value: '10+', label: 'Utilities' },
                { value: '0', label: 'Config Needed' },
              ].map((stat) => (
                <div key={stat.label} className="hero__stat" role="listitem">
                  <span className="hero__stat-value">{stat.value}</span>
                  <span className="hero__stat-label">{stat.label}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Hero Visual */}
          <div className="hero__visual" aria-hidden="true">
            <div className="code-preview">
              <div className="code-preview__header">
                <div className="code-preview__dots">
                  <span className="dot dot--red" />
                  <span className="dot dot--yellow" />
                  <span className="dot dot--green" />
                </div>
                <span className="code-preview__filename">App.jsx</span>
              </div>
              <pre className="code-preview__body">
                <code>{`import { AppProvider } from './context/AppContext'
import { useFetch } from './hooks/useFetch'

function App() {
  return (
    <AppProvider>
      <div className="app">
        {/* Your amazing app */}
      </div>
    </AppProvider>
  )
}`}</code>
              </pre>
            </div>
          </div>
        </div>
      </section>

      {/* ── Features Section ── */}
      <section className="features section" id="features" aria-labelledby="features-heading">
        <div className="container">
          <div className="section__header">
            <div className="badge badge-primary">
              <span aria-hidden="true">🚀</span> What's Included
            </div>
            <h2 id="features-heading" className="section__title">
              Everything you need to{' '}
              <span className="text-gradient">get started</span>
            </h2>
            <p className="section__subtitle">
              Skip the setup. Jump straight into building. Every common pattern is pre-built and ready to use.
            </p>
          </div>

          <div className="features__grid" role="list">
            {features.map((feature, i) => (
              <article
                key={feature.title}
                className="glass-card feature-card"
                style={{ '--feature-color': feature.color, animationDelay: `${i * 0.1}s` }}
                role="listitem"
              >
                <div className="feature-card__icon" aria-hidden="true">
                  {feature.icon}
                </div>
                <h3 className="feature-card__title">{feature.title}</h3>
                <p className="feature-card__description">{feature.description}</p>
              </article>
            ))}
          </div>
        </div>
      </section>

      {/* ── Stack Section ── */}
      <section className="stack section" id="stack" aria-labelledby="stack-heading">
        <div className="container">
          <div className="section__header">
            <div className="badge badge-primary">
              <span aria-hidden="true">🛠</span> Tech Stack
            </div>
            <h2 id="stack-heading" className="section__title">
              Powered by the <span className="text-gradient">best tools</span>
            </h2>
          </div>

          <div className="stack__grid" role="list">
            {stack.map((item) => (
              <div key={item.name} className="glass-card stack-card" role="listitem">
                <span className="stack-card__emoji" aria-hidden="true">{item.emoji}</span>
                <h3 className="stack-card__name">{item.name}</h3>
                <p className="stack-card__desc">{item.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── CTA Section ── */}
      <section className="cta section" id="about" aria-labelledby="cta-heading">
        <div className="container">
          <div className="cta__card glass-card">
            <div className="badge badge-primary" style={{ marginBottom: '1.5rem' }}>
              <span aria-hidden="true">🎯</span> Ready to build?
            </div>
            <h2 id="cta-heading" className="cta__title">
              Start building your next<br />
              <span className="text-gradient">great project today</span>
            </h2>
            <p className="cta__description">
              This boilerplate gives you a head start. Just clone, install, and build something amazing.
            </p>
            <div className="cta__actions">
              <a href="https://github.com" target="_blank" rel="noopener noreferrer" className="btn btn-primary btn-lg" id="cta-github">
                ⭐ Star on GitHub
              </a>
            </div>
          </div>
        </div>
      </section>
    </main>
  )
}

export default Home
