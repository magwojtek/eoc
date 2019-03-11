import React from 'react';
import { Link } from 'react-router-dom';

import { COMPANY_NAME, COMPANY_PAGE_URL } from 'common/constants/variables';

const Footer = () => (
  <div className="footer">
    <div className="wrapper footer__wrapper">
      <Link className="footer__text footer__link" to="/about">
        About
      </Link>
      <span className="footer__text">&copy; Copyrights 2019</span>
      <a
        className="footer__text footer__link"
        href={COMPANY_PAGE_URL}
        rel="noopener noreferrer"
        target="_blank"
      >
        {COMPANY_NAME}
      </a>
    </div>
  </div>
);

export default Footer;
