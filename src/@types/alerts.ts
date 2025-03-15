export interface AlertProps {
    message: string;
    type: 'alert-error' | 'alert-success' | 'alert-info' | 'alert-warning' | 'simple' | 'simple-outline';
}
