// Field Hooks
export { useField } from './useField';

// Stage hooks
export { useStage } from './useStage';

// Form hooks
export { useFormState } from './useFormState';
export { useFormStage } from './useFormStage';
export { useFormController } from './useFormController';

export { useFormikro } from './useFormikro';
export { useFormikroClient } from './useFormikroClient';

export function deepEqual(
  obj1: Record<string, unknown> | undefined,
  obj2: Record<string, unknown> | undefined
): boolean {
  // If both are the same reference or values, they're equal (base case)
  if (obj1 === obj2) return true;

  // If either is null or they're not objects, they're not equal
  if (!obj1 || typeof obj1 !== 'object' || !obj2 || typeof obj2 !== 'object') {
    return false;
  }

  // Get keys and compare lengths
  const keys1 = Object.keys(obj1);
  const keys2 = Object.keys(obj2);

  if (keys1.length !== keys2.length) return false;

  // Recursively compare each key in obj1 with obj2
  for (const key of keys1) {
    if (!keys2.includes(key) || obj1[key] !== obj2[key]) {
      return false;
    }
  }

  // If we made it here, objects are deeply equal
  return true;
}

export function generateUID() {
  const uid = Math.random().toString(36).substring(2, 8);
  return uid;
}
