// src/superadmin/hooks/useDebounce.js
// Delays a fast-changing value (search inputs) so filtering doesn't run on every
// keystroke. Cleans up its timeout on unmount. No endpoint mapping.

import { useEffect, useState } from "react";

/**
 * useDebounce(value, delay)
 * @param {*} value value to debounce
 * @param {number} delay debounce window in ms
 * @returns {*} the debounced value
 */
export default function useDebounce(value, delay = 300) {
  const [debounced, setDebounced] = useState(value);

  useEffect(() => {
    const id = setTimeout(() => setDebounced(value), delay);
    return () => clearTimeout(id);
  }, [value, delay]);

  return debounced;
}
