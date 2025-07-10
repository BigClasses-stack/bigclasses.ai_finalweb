import ReactGA from 'react-ga4';

const TRACKING_ID = process.env.REACT_APP_GA_TRACKING_ID;
const GTM_ID = process.env.REACT_APP_GTM_ID;

export const initGA = () => {
  // Initialize GA4
  if (TRACKING_ID) {
    ReactGA.initialize(TRACKING_ID);
  }

  // Initialize GTM via script
  if (GTM_ID) {
    const script = document.createElement('script');
    script.innerHTML = `
      (function(w,d,s,l,i){w[l]=w[l]||[];w[l].push({'gtm.start':
      new Date().getTime(),event:'gtm.js'});var f=d.getElementsByTagName(s)[0],
      j=d.createElement(s),dl=l!='dataLayer'?'&l='+l:'';j.async=true;j.src=
      'https://www.googletagmanager.com/gtm.js?id='+i+dl;f.parentNode.insertBefore(j,f);
      })(window,document,'script','dataLayer','${GTM_ID}');
    `;
    document.head.appendChild(script);

    // Create and insert <noscript> iframe
    const noscript = document.createElement('noscript');
    const iframe = document.createElement('iframe');
    iframe.src = `https://www.googletagmanager.com/ns.html?id=${GTM_ID}`;
    iframe.height = '0';
    iframe.width = '0';
    iframe.style.display = 'none';
    iframe.style.visibility = 'hidden';
    noscript.appendChild(iframe);
    document.body.insertBefore(noscript, document.body.firstChild);
  }
};

// Track page views
export const trackPageView = (path) => {
  ReactGA.send({ hitType: 'pageview', page: path });
};

// Track custom events
export const trackEvent = (action, category, label, value) => {
  ReactGA.event({
    action,
    category,
    label,
    value,
  });
};
