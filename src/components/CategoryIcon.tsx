import React from 'react';
import {
  Briefcase,
  Laptop,
  Gift,
  TrendingUp,
  Coins,
  Utensils,
  Car,
  Gamepad2,
  Shirt,
  GraduationCap,
  Home,
  HeartPulse,
  Package,
  Smartphone,
  Plane,
  Watch,
  PiggyBank,
  Shield,
  CreditCard,
  Building,
  Fuel,
  Coffee,
  ShoppingBag,
  Tv,
  Film,
  Music,
  Dumbbell,
  BookOpen,
  DollarSign,
  Tag,
  CircleDollarSign,
  type LucideProps
} from 'lucide-react';

const ICON_MAP: Record<string, React.FC<LucideProps>> = {
  Briefcase,
  Laptop,
  Gift,
  TrendingUp,
  Coins,
  Utensils,
  Car,
  Gamepad2,
  Shirt,
  GraduationCap,
  Home,
  HeartPulse,
  Package,
  Smartphone,
  Plane,
  Watch,
  PiggyBank,
  Shield,
  CreditCard,
  Building,
  Fuel,
  Coffee,
  ShoppingBag,
  Tv,
  Film,
  Music,
  Dumbbell,
  BookOpen,
  DollarSign,
  Tag,
  CircleDollarSign,
};

export const AVAILABLE_ICONS = Object.keys(ICON_MAP);

interface CategoryIconProps extends LucideProps {
  name: string;
}

export const CategoryIcon: React.FC<CategoryIconProps> = ({ name, ...props }) => {
  const IconComponent = ICON_MAP[name] || CircleDollarSign;
  return <IconComponent {...props} />;
};
