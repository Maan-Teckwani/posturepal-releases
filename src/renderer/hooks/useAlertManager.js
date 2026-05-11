import { useState, useEffect, useRef } from 'react';

export const useAlertManager = ({ score, signals, threshold = 60, alertDelay = 3, cooldown = 60 }) => {
  const [alertActive, setAlertActive] = useState(false);
  const [badSeconds, setBadSeconds] = useState(0);
  const [cooldownActive, setCooldownActive] = useState(false);
  
  const stateRef = useRef({ alertActive: false, cooldownActive: false, badSeconds: 0, goodSeconds: 0 });
  const cooldownTimerRef = useRef(null);

  useEffect(() => {
    if (score === null) return;
    
    const s = stateRef.current;

    if (score < threshold) {
      s.goodSeconds = 0;
      if (!s.cooldownActive && !s.alertActive) {
        s.badSeconds += 0.5;
        setBadSeconds(s.badSeconds);
      }

      if (s.badSeconds >= alertDelay && !s.alertActive && !s.cooldownActive) {
        s.alertActive = true;
        setAlertActive(true);
        if (window.api) window.api.showAlert({ score, signals });
        
        s.cooldownActive = true;
        setCooldownActive(true);
        cooldownTimerRef.current = setTimeout(() => {
          stateRef.current.cooldownActive = false;
          setCooldownActive(false);
        }, cooldown * 1000);
      } else if (s.alertActive) {
        if (window.api) window.api.showAlert({ score, signals });
      }
    } else {
      s.badSeconds = 0;
      setBadSeconds(0);

      if (s.alertActive) {
        s.goodSeconds += 0.5;
        if (window.api) window.api.showAlert({ score, signals });
        
        if (s.goodSeconds >= 3) {
          if (window.api) window.api.hideAlert();
          s.alertActive = false;
          setAlertActive(false);
          s.goodSeconds = 0;
        }
      }
    }
  }, [score, signals, threshold, alertDelay, cooldown]);

  useEffect(() => {
    return () => {
      if (cooldownTimerRef.current) clearTimeout(cooldownTimerRef.current);
    };
  }, []);

  return { alertActive, badSeconds, cooldownActive };
};
