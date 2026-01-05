import { ReactNode } from 'react';

export interface WindowState {
  id: string;
  title: string;
  component: ReactNode;
  isOpen: boolean;
  isMinimized: boolean;
  zIndex: number;
  position: { x: number; y: number };
  width?: string;
}

export enum AppId {
  SNAKE = 'snake',
  MEME = 'meme',
  ABOUT = 'about',
  BRICK_BREAKER = 'brick_breaker',
  REMIXER = 'remixer',
  NINETY_TEN = 'ninety_ten',
  FEEDBACK = 'feedback'
}

export interface IconProps {
  id: string;
  label: string;
  icon: ReactNode;
  onClick: () => void;
}

export interface SubscriptionDetails {
  customer_id: string;
  subscription_id: string;
  status: string;
  product_id: string;
}

export interface SubscriptionCheckResponse {
  allowed: boolean;
  subscription_details?: SubscriptionDetails;
  error?: string;
}
