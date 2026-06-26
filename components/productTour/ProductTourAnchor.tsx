import { useEffect, useRef, type ReactNode } from 'react';
import { View } from 'react-native';

import { useProductTourAnchorRegistry } from './ProductTourAnchorRegistry';

interface ProductTourAnchorProps {
  id: string;
  children: ReactNode;
}

export function ProductTourAnchor({ id, children }: ProductTourAnchorProps) {
  const ref = useRef<View>(null);
  const { register, unregister } = useProductTourAnchorRegistry();

  useEffect(() => {
    register(id, ref);
    return () => {
      unregister(id);
    };
  }, [id, register, unregister]);

  return (
    <View ref={ref} collapsable={false}>
      {children}
    </View>
  );
}
