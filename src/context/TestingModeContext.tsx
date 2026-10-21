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

export type AppOperationalMode = 'production' | 'simulation';

interface TestingModeContextType {
  isCleanTesting: boolean;
  appMode: AppOperationalMode;
  uiModeConfig: UiModeConfig;
  toggleCleanTesting: () => void;
  setCleanTesting: (active: boolean) => void;
  setAppMode: (mode: AppOperationalMode) => void;
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
  // Default to TRUE (Mode Produksi Riil / Non-Dummy)
  const [isCleanTesting, setIsCleanTesting] = useState<boolean>(() => {
    if (typeof window !== 'undefined') {
      const params = new URLSearchParams(window.location.search);
      const urlUiMode = params.get('ui_mode');
      const urlMode = params.get('mode');
      const urlTesting = params.get('testing');
      const urlClean = params.get('clean');

      // Explicit simulation / standard requests
      if (urlUiMode === 'simulation' || urlUiMode === 'standard' || urlMode === 'simulation' || urlTesting === 'false' || urlClean === '0') {
        return false;
      }
      // Explicit production / clean requests
      if (urlUiMode === 'clean' || urlUiMode === 'production' || urlMode === 'production' || urlTesting === 'true' || urlClean === '1') {
        return true;
      }

      // Check localStorage for persisted choice
      const storedMode = localStorage.getItem('asrama_app_mode');
      if (storedMode === 'simulation') return false;
      if (storedMode === 'production') return true;

      const storedClean = localStorage.getItem('portal_ubt_clean_mode');
      if (storedClean !== null) {
        return storedClean === 'true';
      }
    }

    // Fallback to initial prop from Inertia or Vite env
    if (initialUiMode?.isCleanTesting !== undefined) {
      return initialUiMode.isCleanTesting;
    }

    // Default to TRUE (Mode Produksi / Real Mode)
    const viteUiMode = import.meta.env.VITE_APP_UI_MODE;
    if (viteUiMode === 'simulation' || viteUiMode === 'standard') {
      return false;
    }
    return true;
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

  const syncUrlParam = (active: boolean) => {
    if (typeof window !== 'undefined') {
      try {
        const url = new URL(window.location.href);
        if (active) {
          url.searchParams.set('ui_mode', 'clean');
        } else {
          url.searchParams.delete('ui_mode');
          url.searchParams.delete('testing');
          url.searchParams.delete('clean');
        }
        window.history.replaceState({}, '', url.toString());
      } catch {
        // Safe fallback in restricted iframes
      }
    }
  };

  const toggleCleanTesting = () => {
    setIsCleanTesting((prev) => {
      const next = !prev;
      localStorage.setItem('portal_ubt_clean_mode', String(next));
      localStorage.setItem('asrama_app_mode', next ? 'production' : 'simulation');
      syncUrlParam(next);
      return next;
    });
  };

  const setCleanTesting = (active: boolean) => {
    setIsCleanTesting(active);
    localStorage.setItem('portal_ubt_clean_mode', String(active));
    localStorage.setItem('asrama_app_mode', active ? 'production' : 'simulation');
    syncUrlParam(active);
  };

  const setAppMode = (mode: AppOperationalMode) => {
    setCleanTesting(mode === 'production');
  };

  const appMode: AppOperationalMode = isCleanTesting ? 'production' : 'simulation';

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
        appMode,
        uiModeConfig,
        toggleCleanTesting,
        setCleanTesting,
        setAppMode,
      }}
    >
      {children}
    </TestingModeContext.Provider>
  );
};

export const useTestingMode = (): TestingModeContextType => {
  const context = useContext(TestingModeContext);
  if (!context) {
    // Graceful fallback if used outside Provider: Default to Clean Production Mode
    return {
      isCleanTesting: true,
      appMode: 'production',
      uiModeConfig: {
        isCleanTesting: true,
        mode: 'clean',
        environment: 'production',
        features: DEFAULT_CLEAN_FEATURES,
      },
      toggleCleanTesting: () => {},
      setCleanTesting: () => {},
      setAppMode: () => {},
    };
  }
  return context;
};
