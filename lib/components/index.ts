export interface FieldProps<T> {
  id: Extract<keyof T, string>;
  label?: string;
}
