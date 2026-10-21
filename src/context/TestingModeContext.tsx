import React, { createContext, useContext, useState, useEffect, useMemo } from 'react';

export interface UiModeFeatures {
  hideMarketingBanners: boolean;
  hideDevToolsSidebar: boolean;
  hideDemoPresets: boolean;
  hideStatisticsCards: boolean;
  hideOnboardingModals: boolean;
  focusRegistrationFlow: boolean;
}

export interface UiModeConfig {
  isCleanTesting: boolean;
  mode: 'standard' | 'clean';
  environment: string;
  features: UiModeFeatures;
}

interface TestingModeContextType {
  isCleanTesting: boolean;
  uiModeConfig: UiModeConfig;
  toggleCleanTesting: () => void;
  setCleanTesting: (active: boolean) => void;
}

const DEFAULT_CLEAN_FEATURES: UiModeFeatures = {
  hideMarketingBanners: true,
  hideDevToolsSidebar: true,
  hideDemoPresets: true,
  hideStatisticsCards: true,
  hideOnboardingModals: true,
  focusRegistrationFlow: true,
};

const DEFAULT_STANDARD_FEATURES: UiModeFeatures = {
  hideMarketingBanners: false,
  hideDevToolsSidebar: false,
  hideDemoPresets: false,
  hideStatisticsCards: false,
  hideOnboardingModals: false,
  focusRegistrationFlow: false,
};

const TestingModeContext = createContext<TestingModeContextType | undefined>(undefined);

export const TestingModeProvider: React.FC<{
  children: React.ReactNode;
  initialUiMode?: Partial<UiModeConfig>;
}> = ({ children, initialUiMode }) => {
  // 1. Initial evaluation from URL search params, props, or localStorage
  const [isCleanTesting, setIsCleanTesting] = useState<boolean>(() => {
    // Check URL parameters first (?ui_mode=clean, ?testing=true, ?clean=1)
    if (typeof window !== 'undefined') {
      const params = new URLSearchParams(window.location.search);
      const urlUiMode = params.get('ui_mode');
      const urlTesting = params.get('testing');
      const urlClean = params.get('clean');

      if (urlUiMode === 'clean' || urlTesting === 'true' || urlClean === '1') {
        return true;
      }
      if (urlUiMode === 'standard' || urlTesting === 'false' || urlClean === '0') {
        return false;
      }

      // Check localStorage for persisted testing state in dev/staging
      const stored = localStorage.getItem('portal_ubt_clean_mode');
      if (stored !== null) {
        return stored === 'true';
      }
    }

    // Fallback to initial prop from Inertia or Vite env
    if (initialUiMode?.isCleanTesting !== undefined) {
      return initialUiMode.isCleanTesting;
    }

    // Fallback to Vite environment flag (VITE_APP_UI_MODE or VITE_TEST_MODE)
    const viteUiMode = import.meta.env.VITE_APP_UI_MODE;
    const viteTestMode = import.meta.env.VITE_TEST_MODE;
    return viteUiMode === 'clean' || viteTestMode === 'true';
  });

  // Listen to URL changes if user navigates with pushState
  useEffect(() => {
    const handlePopState = () => {
      const params = new URLSearchParams(window.location.search);
      const urlUiMode = params.get('ui_mode');
      const urlTesting = params.get('testing');
      if (urlUiMode === 'clean' || urlTesting === 'true') {
        setIsCleanTesting(true);
      } else if (urlUiMode === 'standard' || urlTesting === 'false') {
        setIsCleanTesting(false);
      }
    };

    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, []);

  const toggleCleanTesting = () => {
    setIsCleanTesting((prev) => {
      const next = !prev;
      localStorage.setItem('portal_ubt_clean_mode', String(next));
      return next;
    });
  };

  const setCleanTesting = (active: boolean) => {
    setIsCleanTesting(active);
    localStorage.setItem('portal_ubt_clean_mode', String(active));
  };

  const uiModeConfig = useMemo<UiModeConfig>(() => {
    return {
      isCleanTesting,
      mode: isCleanTesting ? 'clean' : 'standard',
      environment: initialUiMode?.environment || (import.meta.env.DEV ? 'development' : 'staging'),
      features: isCleanTesting ? DEFAULT_CLEAN_FEATURES : DEFAULT_STANDARD_FEATURES,
    };
  }, [isCleanTesting, initialUiMode]);

  return (
    <TestingModeContext.Provider
      value={{
        isCleanTesting,
        uiModeConfig,
        toggleCleanTesting,
        setCleanTesting,
      }}
    >
      {children}
    </TestingModeContext.Provider>
  );
};

export const useTestingMode = (): TestingModeContextType => {
  const context = useContext(TestingModeContext);
  if (!context) {
    // Graceful fallback if used outside Provider
    return {
      isCleanTesting: false,
      uiModeConfig: {
        isCleanTesting: false,
        mode: 'standard',
        environment: 'production',
        features: DEFAULT_STANDARD_FEATURES,
      },
      toggleCleanTesting: () => {},
      setCleanTesting: () => {},
    };
  }
  return context;
};
