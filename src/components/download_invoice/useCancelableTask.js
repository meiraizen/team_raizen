import { useRef } from 'react';

export function useCancelableTask() {
  const cancelRef = useRef(false);

  const start = () => {
    cancelRef.current = false;
  };
  const cancel = () => {
    cancelRef.current = true;
  };
  const isCanceled = () => cancelRef.current;

  return { cancelRef, start, cancel, isCanceled };
}
