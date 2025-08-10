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
    <div className="min-h-screen bg-gradient-background p-4">
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
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
          {categories.map((category) => (
            <div
              key={category.name}
              className={cn(
                "relative p-6 rounded-xl border-2 cursor-pointer transition-all duration-300",
                "hover:scale-105 hover:shadow-card-hover",
                selectedCategory?.name === category.name
                  ? "border-primary shadow-glow"
                  : "border-border",
                category.gradient
              )}
              onClick={() => handleCategoryClick(category)}
            >
              <div className="text-center">
                <div className="text-6xl mb-4">{category.icon}</div>
                <h3 className="text-2xl font-bold text-card-foreground capitalize mb-2">
                  {category.name}
                </h3>
                <div className="grid grid-cols-2 gap-2 text-sm text-card-foreground/80">
                  {category.items.slice(0, 4).map((item) => (
                    <div key={item} className="bg-card/20 rounded-lg px-2 py-1">
                      {item}
                    </div>
                  ))}
                </div>
                <p className="text-xs text-card-foreground/60 mt-2">
                  +{category.items.length - 4} more items
                </p>
              </div>
            </div>
          ))}
        </div>

      </div>
    </div>
  );
};

export default CategorySelection;