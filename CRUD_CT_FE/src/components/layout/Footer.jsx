import './Footer.css'

/**
 * Footer Component
 */
function Footer() {
  const currentYear = new Date().getFullYear()

  return (
    <footer className="footer" role="contentinfo">
      <div className="container">
        <div className="footer__inner">
          <div className="footer__brand">
            <span className="footer__logo">
              ⚡ React<span className="text-gradient">Boost</span>
            </span>
            <p className="footer__tagline">
              Modern React boilerplate for building amazing apps.
            </p>
          </div>

          <div className="footer__links-grid">
            <div className="footer__links-col">
              <h3 className="footer__col-title">Resources</h3>
              <ul>
                <li><a href="https://react.dev" target="_blank" rel="noopener noreferrer" className="footer__link">React Docs</a></li>
                <li><a href="https://vitejs.dev" target="_blank" rel="noopener noreferrer" className="footer__link">Vite Docs</a></li>
              </ul>
            </div>
            <div className="footer__links-col">
              <h3 className="footer__col-title">Community</h3>
              <ul>
                <li><a href="https://github.com" target="_blank" rel="noopener noreferrer" className="footer__link">GitHub</a></li>
                <li><a href="https://discord.com" target="_blank" rel="noopener noreferrer" className="footer__link">Discord</a></li>
              </ul>
            </div>
          </div>
        </div>

        <div className="footer__bottom">
          <p className="footer__copyright">
            © {currentYear} ReactBoost. Built with React + Vite.
          </p>
          <div className="footer__bottom-links">
            <a href="#" className="footer__link footer__link--sm">Privacy</a>
            <a href="#" className="footer__link footer__link--sm">Terms</a>
          </div>
        </div>
      </div>
    </footer>
  )
}

export default Footer
