import { useRouter } from 'expo-router';
import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from 'react';

import { useAuth } from '@/components/auth/AuthProvider';

import { useProductTourAnchorRegistry } from './ProductTourAnchorRegistry';
import { ProductTourOverlay } from './ProductTourOverlay';
import { PRODUCT_TOUR_STEPS, type HighlightRect } from './productTourSteps';
import {
  isProductTourCompleted,
  isProductTourQueued,
  markProductTourCompleted,
  subscribeProductTourQueued,
  takeStoredProductTourPending,
} from './productTourStorage';

interface ProductTourContextValue {
  isActive: boolean;
  currentStepId: string | null;
  startTour: () => void;
}

const ProductTourContext = createContext<ProductTourContextValue | null>(null);

const NAVIGATION_SETTLE_MS = 450;
const MEASURE_RETRY_MS = 120;
const MEASURE_MAX_RETRIES = 8;

interface ProductTourProviderProps {
  children: ReactNode;
  /** スプラッシュ終了後に true。ツアー表示・計測はこれ以降。 */
  isAppReady: boolean;
}

export function ProductTourProvider({ children, isAppReady }: ProductTourProviderProps) {
  const { session } = useAuth();
  const router = useRouter();
  const { measureAnchor } = useProductTourAnchorRegistry();

  const [isActive, setIsActive] = useState(false);
  const [stepIndex, setStepIndex] = useState(0);
  const [isReady, setIsReady] = useState(false);
  const [highlight, setHighlight] = useState<HighlightRect | null>(null);
  const coldStartCheckedRef = useRef(false);
  const pendingStartRef = useRef(false);

  const userId = session?.user.id ?? null;
  const currentStep = PRODUCT_TOUR_STEPS[stepIndex];

  const beginTour = useCallback(() => {
    if (!isAppReady) {
      pendingStartRef.current = true;
      return;
    }
    setStepIndex(0);
    setIsActive(true);
  }, [isAppReady]);

  useEffect(() => {
    if (!isAppReady || !pendingStartRef.current) {
      return;
    }
    pendingStartRef.current = false;
    setStepIndex(0);
    setIsActive(true);
  }, [isAppReady]);

  const startTour = useCallback(() => {
    if (!userId) {
      return;
    }
    void isProductTourCompleted(userId).then((completed) => {
      if (!completed) {
        beginTour();
      }
    });
  }, [beginTour, userId]);

  const tryStartFromPending = useCallback(async () => {
    if (!userId || !isAppReady) {
      return;
    }
    const completed = await isProductTourCompleted(userId);
    if (completed) {
      return;
    }
    const pending = isProductTourQueued() || (await takeStoredProductTourPending());
    if (pending) {
      beginTour();
    }
  }, [beginTour, isAppReady, userId]);

  useEffect(() => {
    if (!userId || !isAppReady || coldStartCheckedRef.current) {
      return;
    }
    coldStartCheckedRef.current = true;
    void tryStartFromPending();
  }, [isAppReady, tryStartFromPending, userId]);

  useEffect(() => {
    return subscribeProductTourQueued(() => {
      void tryStartFromPending();
    });
  }, [tryStartFromPending]);

  useEffect(() => {
    if (!userId) {
      coldStartCheckedRef.current = false;
      setIsActive(false);
      setIsReady(false);
      setHighlight(null);
    }
  }, [userId]);

  const finishTour = useCallback(
    async (navigateToOnboarding: boolean) => {
      setIsActive(false);
      setIsReady(false);
      setHighlight(null);
      if (userId) {
        await markProductTourCompleted(userId);
      }
      if (navigateToOnboarding) {
        router.replace('/(onboarding)/welcome');
      }
    },
    [router, userId]
  );

  useEffect(() => {
    if (!isActive || !currentStep || !isAppReady) {
      return;
    }

    setIsReady(false);
    setHighlight(null);
    router.push(currentStep.route);

    const navTimer = setTimeout(() => {
      setIsReady(true);
    }, NAVIGATION_SETTLE_MS);

    return () => {
      clearTimeout(navTimer);
    };
  }, [isActive, currentStep, isAppReady, router]);

  useEffect(() => {
    if (!isActive || !isReady || !currentStep) {
      return;
    }

    if (!currentStep.anchorId) {
      setHighlight(null);
      return;
    }

    let cancelled = false;
    let retries = 0;

    const measure = () => {
      void measureAnchor(currentStep.anchorId!).then((rect) => {
        if (cancelled) {
          return;
        }
        if (rect) {
          setHighlight(rect);
          return;
        }
        retries += 1;
        if (retries < MEASURE_MAX_RETRIES) {
          setTimeout(measure, MEASURE_RETRY_MS);
        } else {
          setHighlight(null);
        }
      });
    };

    const timer = setTimeout(measure, 50);

    return () => {
      cancelled = true;
      clearTimeout(timer);
    };
  }, [currentStep, isActive, isReady, measureAnchor, stepIndex]);

  const goNext = useCallback(() => {
    const isLast = stepIndex >= PRODUCT_TOUR_STEPS.length - 1;
    if (isLast) {
      void finishTour(true);
      return;
    }
    setStepIndex((prev) => prev + 1);
  }, [finishTour, stepIndex]);

  const skipTour = useCallback(() => {
    void finishTour(true);
  }, [finishTour]);

  const value = useMemo<ProductTourContextValue>(
    () => ({
      isActive,
      currentStepId: isActive ? (currentStep?.id ?? null) : null,
      startTour,
    }),
    [currentStep?.id, isActive, startTour]
  );

  const showOverlay = isActive && isReady && isAppReady && currentStep;

  return (
    <ProductTourContext.Provider value={value}>
      {children}
      {showOverlay ? (
        <ProductTourOverlay
          step={currentStep}
          stepIndex={stepIndex}
          totalSteps={PRODUCT_TOUR_STEPS.length}
          highlight={highlight}
          onNext={goNext}
          onSkip={skipTour}
        />
      ) : null}
    </ProductTourContext.Provider>
  );
}

export function useProductTour(): ProductTourContextValue {
  const context = useContext(ProductTourContext);
  if (context === null) {
    throw new Error('useProductTour は ProductTourProvider の内側で使用してください');
  }
  return context;
}
