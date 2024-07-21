import { Link as ScrollLink } from 'react-scroll'
import { Link } from 'react-router-dom'
import '../../scss/header.scss'

const Header = () => {
  return (
    <header className="header">
      <nav className="nav">
        <ul className="nav-links">
          <li>
            <ScrollLink to="home" smooth={true} duration={100}>
              HOME
            </ScrollLink>
          </li>
          <li>
            <ScrollLink to="phases" smooth={true} duration={100}>
              ROAD-MAP
            </ScrollLink>
          </li>
          <li>
            <ScrollLink to="about-us" smooth={true} duration={500}>
              ABOUT US
            </ScrollLink>
          </li>
          <li>
            <ScrollLink to="contact-us" smooth={true} duration={500}>
              CONTACT US
            </ScrollLink>
          </li>
        </ul>
      </nav>      <Link to="/login">
       <button className="login-button">Login</button>
      </Link>
    </header>
  )
}

export default Header
