import React from 'react';
import '../../scss/contactUs.scss';
import { FaInstagram, FaFacebook, FaLinkedin } from 'react-icons/fa';

const ContactUs = () => {
  return (
    <div name="contact-us" className="contact-us-container">
      <h2>Contact<br /> Nova Dynamics</h2>
      <div className="card">
        <div className="content">
          <div className="contact-details">
            <h3>Get in Touch with Us</h3>
            <p>We would love to hear from you. Please reach out to us through any of the following methods:</p>
            <ul>
              <li>Email: <a href="mailto:info@novadynamics.com">info@novadynamics.com</a></li>
              <li>Phone: <a href="tel:+11234567890">+1 (123) 456-7890</a></li>
              <li>Address: <a href="https://www.google.com/maps/place/75+Watline+Avenue,+Mississauga+ON+L4Z+3E5" target="_blank" rel="noopener noreferrer">75 Watline Avenue, Mississauga ON L4Z 3E5</a></li>
            </ul>
            <div className="social-media">
              <a href="https://www.instagram.com" target="_blank" rel="noopener noreferrer" className="social-button">
                <FaInstagram />
              </a>
              <a href="https://www.facebook.com" target="_blank" rel="noopener noreferrer" className="social-button">
                <FaFacebook />
              </a>
              <a href="https://www.linkedin.com" target="_blank" rel="noopener noreferrer" className="social-button">
                <FaLinkedin />
              </a>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default ContactUs;
