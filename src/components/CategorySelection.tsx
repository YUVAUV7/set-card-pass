import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { ArrowLeft } from 'lucide-react';
import { cn } from '@/lib/utils';

interface Category {
  name: string;
  items: string[];
  icon: string;
  gradient: string;
}

const categories: Category[] = [
  {
    name: 'animals',
    items: ['Tiger', 'Lion', 'Cat', 'Dog', 'Elephant', 'Bear', 'Wolf', 'Fox'],
    icon: '🦁',
    gradient: 'bg-gradient-animals'
  },
  {
    name: 'colors',
    items: ['Red', 'Blue', 'Green', 'Yellow', 'Purple', 'Orange', 'Pink', 'Black'],
    icon: '🎨',
    gradient: 'bg-gradient-colors'
  },
  {
    name: 'fruits',
    items: ['Apple', 'Banana', 'Orange', 'Grape', 'Strawberry', 'Mango', 'Kiwi', 'Pineapple'],
    icon: '🍎',
    gradient: 'bg-gradient-fruits'
  },
  {
    name: 'vehicles',
    items: ['Car', 'Truck', 'Bike', 'Bus', 'Train', 'Plane', 'Boat', 'Motorcycle'],
    icon: '🚗',
    gradient: 'bg-vehicles'
  },
  {
    name: 'sports',
    items: ['Soccer', 'Basketball', 'Tennis', 'Baseball', 'Cricket', 'Rugby', 'Golf', 'Hockey'],
    icon: '🏅',
    gradient: 'bg-gradient-sports'
  },
  {
    name: 'countries',
    items: ['USA', 'Canada', 'Brazil', 'Germany', 'India', 'Japan', 'Australia', 'France'],
    icon: '🌍',
    gradient: 'bg-gradient-countries'
  },
  {
    name: 'instruments',
    items: ['Guitar', 'Piano', 'Violin', 'Drums', 'Flute', 'Saxophone', 'Trumpet', 'Cello'],
    icon: '🎵',
    gradient: 'bg-gradient-instruments'
  }
];

interface CategorySelectionProps {
  onCategorySelect: (category: Category) => void;
  onBack: () => void;
}

const CategorySelection: React.FC<CategorySelectionProps> = ({
  onCategorySelect,
  onBack
}) => {
  const [selectedCategory] = useState<Category | null>(null);

  const handleCategoryClick = (category: Category) => {
    onCategorySelect(category);
  };


  return (
    <div className="min-h-screen bg-gradient-background p-3 sm:p-4">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <Button variant="ghost" onClick={onBack}>
            <ArrowLeft className="w-5 h-5" />
            Back
          </Button>
          <h1 className="text-3xl font-bold text-foreground">Choose Category</h1>
          <div className="w-20"></div>
        </div>

        {/* Category Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-4 mb-6">
          {categories.map((category) => (
            <div
              key={category.name}
              className={cn(
                "relative p-4 sm:p-5 rounded-lg border cursor-pointer transition-all duration-200",
                "hover:scale-[1.02] hover:shadow-card-hover",
                selectedCategory?.name === category.name
                  ? "border-primary shadow-glow"
                  : "border-border",
                category.gradient
              )}
              onClick={() => handleCategoryClick(category)}
            >
              <div className="text-center">
                <div className="text-4xl sm:text-5xl mb-2">{category.icon}</div>
                <h3 className="text-lg sm:text-xl font-semibold text-card-foreground capitalize">
                  {category.name}
                </h3>
              </div>
            </div>
          ))}
        </div>

      </div>
    </div>
  );
};

export default CategorySelection;