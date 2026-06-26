import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useRef,
  type ReactNode,
  type RefObject,
} from 'react';
import { View } from 'react-native';

import type { HighlightRect } from './productTourSteps';

interface ProductTourAnchorRegistryValue {
  register: (id: string, ref: RefObject<View | null>) => void;
  unregister: (id: string) => void;
  measureAnchor: (id: string) => Promise<HighlightRect | null>;
}

const ProductTourAnchorRegistryContext = createContext<ProductTourAnchorRegistryValue | null>(
  null
);

export function ProductTourAnchorRegistryProvider({ children }: { children: ReactNode }) {
  const anchorsRef = useRef(new Map<string, RefObject<View | null>>());

  const register = useCallback((id: string, ref: RefObject<View | null>) => {
    anchorsRef.current.set(id, ref);
  }, []);

  const unregister = useCallback((id: string) => {
    anchorsRef.current.delete(id);
  }, []);

  const measureAnchor = useCallback((id: string) => {
    const ref = anchorsRef.current.get(id);
    if (!ref?.current) {
      return Promise.resolve(null);
    }

    return new Promise<HighlightRect | null>((resolve) => {
      ref.current?.measureInWindow((x, y, width, height) => {
        if (width <= 0 || height <= 0) {
          resolve(null);
          return;
        }
        resolve({ x, y, width, height, borderRadius: 12 });
      });
    });
  }, []);

  const value = useMemo(
    () => ({ register, unregister, measureAnchor }),
    [measureAnchor, register, unregister]
  );

  return (
    <ProductTourAnchorRegistryContext.Provider value={value}>
      {children}
    </ProductTourAnchorRegistryContext.Provider>
  );
}

export function useProductTourAnchorRegistry(): ProductTourAnchorRegistryValue {
  const context = useContext(ProductTourAnchorRegistryContext);
  if (context === null) {
    throw new Error('useProductTourAnchorRegistry は ProductTourAnchorRegistryProvider 内で使用してください');
  }
  return context;
}
