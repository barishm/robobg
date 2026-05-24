import { useState, useEffect } from 'react';
import { useSelector } from 'react-redux';

const CookieConsent = () => {
  const lang = useSelector((state) => state.language.lang);
  const [showDialog, setShowDialog] = useState(false);
  const [showPreferences, setShowPreferences] = useState(false);
  const [googleAnalyticsEnabled, setGoogleAnalyticsEnabled] = useState(false);

  useEffect(() => {
    // Check if user has already given consent
    const consent = localStorage.getItem('cookieConsent');
    const gaPreference = localStorage.getItem('googleAnalyticsConsent');
    if (!consent) {
      setShowDialog(true);
    }
    if (gaPreference === 'true') {
      setGoogleAnalyticsEnabled(true);
    }
  }, []);

  const handleAccept = () => {
    localStorage.setItem('cookieConsent', 'accepted');
    localStorage.setItem('googleAnalyticsConsent', 'true');
    setShowDialog(false);
    // Load Google Analytics
    loadGoogleAnalytics();
  };

  const handleDecline = () => {
    localStorage.setItem('cookieConsent', 'declined');
    localStorage.setItem('googleAnalyticsConsent', 'false');
    setShowDialog(false);
  };

  const handleManagePreferences = () => {
    setShowPreferences(true);
  };

  const handleSavePreferences = () => {
    localStorage.setItem('cookieConsent', 'accepted');
    localStorage.setItem('googleAnalyticsConsent', googleAnalyticsEnabled ? 'true' : 'false');
    setShowPreferences(false);
    setShowDialog(false);
    
    if (googleAnalyticsEnabled) {
      loadGoogleAnalytics();
    }
  };

  const handleToggleGoogleAnalytics = () => {
    setGoogleAnalyticsEnabled(!googleAnalyticsEnabled);
  };

  const loadGoogleAnalytics = () => {
    // Initialize dataLayer and gtag function first
    window.dataLayer = window.dataLayer || [];
    function gtag() {
      window.dataLayer.push(arguments);
    }
    window.gtag = gtag;
    gtag('js', new Date());
    gtag('config', 'G-TE3VZ48F5F');

    // Load Google Analytics script
    const script = document.createElement('script');
    script.async = true;
    script.src = 'https://www.googletagmanager.com/gtag/js?id=G-TE3VZ48F5F';
    document.head.appendChild(script);
  };

  // Load GA if consent was already given
  useEffect(() => {
    const consent = localStorage.getItem('cookieConsent');
    const gaConsent = localStorage.getItem('googleAnalyticsConsent');
    if (consent === 'accepted' && gaConsent === 'true' && !window.gtag) {
      loadGoogleAnalytics();
    }
  }, []);

  if (!showDialog) {
    return null;
  }

  return (
    <>
      {showPreferences && (
        <div
          className="position-fixed top-0 start-0 w-100 h-100 d-flex align-items-center justify-content-center"
          style={{
            backgroundColor: 'rgba(0, 0, 0, 0.5)',
            zIndex: 10000,
          }}
          onClick={() => setShowPreferences(false)}
        >
          <div
            className="p-4 rounded"
            style={{ 
              maxWidth: '500px', 
              width: '90%', 
              backgroundColor: 'rgba(248, 249, 250, 0.95)',
              color: '#212529',
              boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)'
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <h5 className="mb-4">
              {lang === 'en' ? 'Cookie Preferences' : 'Управление на предпочитанията'}
            </h5>
            
            <div className="mb-4">
              <div className="d-flex justify-content-between align-items-center mb-3">
                <div>
                  <strong style={{ color: '#212529' }}>Google Analytics</strong>
                  <p className="mb-0" style={{ fontSize: '0.85rem', color: '#6c757d' }}>
                    {lang === 'en' 
                      ? 'Used to analyze website traffic and user behavior'
                      : 'Използва се за анализ на трафика на уебсайта и поведението на потребителите'}
                  </p>
                </div>
                <div className="form-check form-switch">
                  <input
                    className="form-check-input"
                    type="checkbox"
                    role="switch"
                    id="googleAnalyticsSwitch"
                    checked={googleAnalyticsEnabled}
                    onChange={handleToggleGoogleAnalytics}
                    style={{ 
                      width: '3rem', 
                      height: '1.5rem',
                      backgroundColor: googleAnalyticsEnabled ? '#adb5bd' : '#dee2e6',
                      borderColor: '#adb5bd'
                    }}
                  />
                </div>
              </div>
            </div>

            <div className="d-flex gap-2 justify-content-end">
              <button
                type="button"
                className="btn btn-outline-primary btn-sm"
                onClick={() => setShowPreferences(false)}
              >
                {lang === 'en' ? 'Cancel' : 'Отказ'}
              </button>
              <button
                type="button"
                className="btn btn-primary btn-sm"
                onClick={handleSavePreferences}
              >
                {lang === 'en' ? 'Save' : 'Запази'}
              </button>
            </div>
          </div>
        </div>
      )}
      
      <div
        className="position-fixed bottom-0 start-0 w-100"
      style={{
        backgroundColor: 'rgba(248, 249, 250, 0.95)',
        zIndex: 9999,
        padding: '20px',
        boxShadow: '0 -2px 10px rgba(0, 0, 0, 0.2)',
        borderTop: '1px solid rgba(0, 0, 0, 0.1)'
      }}
    >
      <div className="container">
        <div className="row align-items-center">
          <div className="col-12 col-md-8 mb-3 mb-md-0">
            <div style={{ color: '#212529' }}>
              {lang === 'en' ? (
                <>
                  <p className="mb-2">
                    <strong>Hello!</strong>
                  </p>
                  <p className="mb-2">
                    We aim to provide you with the best possible experience. We use cookies and similar technologies for:
                  </p>
                  <ul className="mb-2" style={{ paddingLeft: '20px' }}>
                    <li>proper functioning of the website,</li>
                    <li>performance analysis, and</li>
                    <li>personalized advertising.</li>
                  </ul>
                  <p className="mb-0" style={{ fontSize: '0.9rem' }}>
                    By clicking "Accept all", you agree that your data (such as website activity and device information) will be used by us and our partners for the above purposes. If you choose "Reject all", we will only use strictly necessary cookies for the website to function and will not show personalized ads. You can change your preferences by clicking the "Manage preferences" button.
                  </p>
                </>
              ) : (
                <>
                  <p className="mb-2">
                    <strong>Здравейте!</strong>
                  </p>
                  <p className="mb-2">
                    В RoboBG целим да Ви предоставим най-доброто възможно изживяване. Използваме бисквитки и подобни технологии за:
                  </p>
                  <ul className="mb-2" style={{ paddingLeft: '20px' }}>
                    <li>правилното функциониране на уебсайта,</li>
                    <li>анализ на представянето и</li>
                    <li>персонализирана реклама.</li>
                  </ul>
                  <p className="mb-0" style={{ fontSize: '0.9rem' }}>
                    С натискането на бутона "Приемам всички" Вие се съгласявате Вашите данни (като активност на сайта и информация за устройството) да бъдат използвани от нас и нашите партньори за гореспоменатите цели. Ако изберете "Отхвърли всички" ние ще използваме само строго необходимите бисквитки за функционирането на уебсайта и няма да показваме персонализирани реклами. Може да промените предпочитанията си като натиснете бутона "Управление на предпочитанията".
                  </p>
                </>
              )}
            </div>
          </div>
          <div className="col-12 col-md-4">
            <div className="d-flex flex-column gap-2">
              <button
                type="button"
                className="btn btn-outline-primary btn-sm"
                onClick={handleDecline}
              >
                {lang === 'en' ? 'Reject all' : 'Отхвърли всички'}
              </button>
              <button
                type="button"
                className="btn btn-outline-primary btn-sm"
                onClick={handleManagePreferences}
              >
                {lang === 'en' ? 'Manage preferences' : 'Управление на предпочитанията'}
              </button>
              <button
                type="button"
                className="btn btn-primary btn-sm"
                onClick={handleAccept}
              >
                {lang === 'en' ? 'Accept all' : 'Приемам всички'}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
    </>
  );
};

export default CookieConsent;

