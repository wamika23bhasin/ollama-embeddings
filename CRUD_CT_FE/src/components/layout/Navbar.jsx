import { useState, useEffect } from 'react'
import './Navbar.css'

/**
 * Navbar Component
 * Responsive navigation bar with scroll-aware background
 */
function Navbar({ currentPage = 'home', onNavigate }) {
  const [scrolled, setScrolled] = useState(false)
  const [menuOpen, setMenuOpen] = useState(false)

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 20)
    window.addEventListener('scroll', handleScroll)
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  const navLinks = [
    { label: 'Case Tasks', page: 'showcase-tasks', href: null },
    { label: 'Open Case Task', page: 'report-issue', href: null, highlight: true },
  ]

  return (
    <header className={`navbar ${scrolled ? 'navbar--scrolled' : ''}`} role="banner">
      <div className="container navbar__inner">
        {/* Logo */}
        <a href="#home" className="navbar__logo" aria-label="Go to home">
          <span className="navbar__logo-icon" aria-hidden="true">⚡</span>
          <span className="navbar__logo-text">
            React<span className="text-gradient">Boost</span>
          </span>
        </a>

        {/* Desktop Nav */}
        <nav className="navbar__links" aria-label="Main navigation">
          {navLinks.map((link) => (
            link.href ? (
              <a
                key={link.label}
                href={link.href}
                className={`navbar__link ${link.highlight ? 'navbar__link--highlight' : ''} ${currentPage === link.page && link.page !== 'home' ? 'navbar__link--active' : ''}`}
                onClick={link.page !== 'home' ? (e) => { e.preventDefault(); onNavigate?.(link.page) } : undefined}
              >
                {link.label}
              </a>
            ) : (
              <button
                key={link.label}
                className={`navbar__link navbar__link--btn ${link.highlight ? 'navbar__link--highlight' : ''} ${currentPage === link.page ? 'navbar__link--active' : ''}`}
                onClick={() => onNavigate?.(link.page)}
                aria-current={currentPage === link.page ? 'page' : undefined}
              >
                {link.label}
              </button>
            )
          ))}
        </nav>

        {/* CTA */}
        <div className="navbar__actions">
          {/* Mobile Menu Toggle */}
          <button
            className="navbar__hamburger"
            onClick={() => setMenuOpen(!menuOpen)}
            aria-expanded={menuOpen}
            aria-controls="mobile-menu"
            aria-label="Toggle navigation menu"
            id="hamburger-btn"
          >
            <span className={`hamburger-line ${menuOpen ? 'open' : ''}`} />
            <span className={`hamburger-line ${menuOpen ? 'open' : ''}`} />
            <span className={`hamburger-line ${menuOpen ? 'open' : ''}`} />
          </button>
        </div>
      </div>

      {/* Mobile Menu */}
      <nav
        id="mobile-menu"
        className={`navbar__mobile-menu ${menuOpen ? 'navbar__mobile-menu--open' : ''}`}
        aria-label="Mobile navigation"
      >
        {navLinks.map((link) => (
          link.href ? (
            <a
              key={link.label}
              href={link.href}
              className={`navbar__mobile-link ${link.highlight ? 'navbar__mobile-link--highlight' : ''}`}
              onClick={(e) => {
                setMenuOpen(false)
                if (link.page !== 'home') { e.preventDefault(); onNavigate?.(link.page) }
              }}
            >
              {link.label}
            </a>
          ) : (
            <button
              key={link.label}
              className={`navbar__mobile-link navbar__link--btn ${link.highlight ? 'navbar__mobile-link--highlight' : ''}`}
              onClick={() => { setMenuOpen(false); onNavigate?.(link.page) }}
            >
              {link.label}
            </button>
          )
        ))}
      </nav>
    </header>
  )
}

export default Navbar
