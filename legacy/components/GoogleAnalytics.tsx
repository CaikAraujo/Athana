import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import ReactGA from 'react-ga4';

interface GoogleAnalyticsProps {
  measurementId: string;
}

export const GoogleAnalytics = ({ measurementId }: GoogleAnalyticsProps) => {
  const location = useLocation();

  useEffect(() => {
    // Initialize Google Analytics only once
    if (!ReactGA.isInitialized) {
      ReactGA.initialize(measurementId);
    }
  }, [measurementId]);

  useEffect(() => {
    // Send pageview with a custom path
    ReactGA.send({
      hitType: 'pageview',
      page: location.pathname + location.search,
      title: document.title,
    });
  }, [location]);

  return null; // This component doesn't render anything
};
