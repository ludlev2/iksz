'use client';

import { useState } from 'react';
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from '@/components/ui/sheet';
import { Button } from '@/components/ui/button';
import { Slider } from '@/components/ui/slider';
import { Badge } from '@/components/ui/badge';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Filter, Calendar as CalendarIcon } from 'lucide-react';
import { format } from 'date-fns';
import { hu } from 'date-fns/locale';

interface FilterState {
  distance: number;
  categories: string[];
  date: Date | undefined;
  sort: string;
}

interface FilterDrawerProps {
  filters: FilterState;
  onFiltersChange: (filters: FilterState) => void;
  onResetFilters: () => void;
  categories: {
    id: string;
    slug: string;
    label: string;
  }[];
  isLoadingCategories?: boolean;
  categoriesError?: string | null;
  defaultDistance: number;
  isDefaultSort: boolean;
}

const categoryColors: Record<string, string> = {
  environment: 'bg-green-100 text-green-800',
  elderly: 'bg-purple-100 text-purple-800',
  animals: 'bg-orange-100 text-orange-800',
  children: 'bg-pink-100 text-pink-800',
  social: 'bg-blue-100 text-blue-800',
  education: 'bg-indigo-100 text-indigo-800',
};

export default function FilterDrawer({
  filters,
  onFiltersChange,
  onResetFilters,
  categories,
  isLoadingCategories = false,
  categoriesError = null,
  defaultDistance,
  isDefaultSort,
}: FilterDrawerProps) {
  const [open, setOpen] = useState(false);

  const toggleCategory = (categoryId: string) => {
    const newCategories = filters.categories.includes(categoryId)
      ? filters.categories.filter(c => c !== categoryId)
      : [...filters.categories, categoryId];

    onFiltersChange({ ...filters, categories: newCategories });
  };

  const activeFiltersCount = 
    (filters.distance < defaultDistance ? 1 : 0) +
    filters.categories.length +
    (filters.date ? 1 : 0) +
    (isDefaultSort ? 0 : 1);

  const renderCategoryBadges = () => {
    if (isLoadingCategories) {
      return (
        <div className="flex flex-wrap gap-2">
          {Array.from({ length: 6 }).map((_, index) => (
            <div
              key={index}
              className="h-8 w-24 animate-pulse rounded-full bg-muted"
            />
          ))}
        </div>
      );
    }

    if (categoriesError) {
      return (
        <p className="text-sm text-red-600">
          {categoriesError}
        </p>
      );
    }

    if (categories.length === 0) {
      return (
        <p className="text-sm text-muted-foreground">
          Nincs elérhető kategória.
        </p>
      );
    }

    return (
      <div className="flex flex-wrap gap-2">
        {categories.map((category) => {
          const isActive = filters.categories.includes(category.slug);
          const colorClass = categoryColors[category.slug] ?? 'bg-gray-100 text-gray-800';

          return (
            <Badge
              key={category.id}
              variant={isActive ? 'default' : 'outline'}
              className={`cursor-pointer ${
                isActive ? colorClass : 'hover:bg-gray-100'
              }`}
              onClick={() => toggleCategory(category.slug)}
            >
              {category.label}
            </Badge>
          );
        })}
      </div>
    );
  };

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger asChild>
        <Button variant="outline" className="relative">
          <Filter className="w-4 h-4 mr-2" />
          Szűrők
          {activeFiltersCount > 0 && (
            <Badge className="ml-2 h-5 w-5 p-0 text-xs">
              {activeFiltersCount}
            </Badge>
          )}
        </Button>
      </SheetTrigger>
      <SheetContent>
        <SheetHeader>
          <SheetTitle>Szűrők</SheetTitle>
        </SheetHeader>
        
        <div className="space-y-6 mt-6">
          {/* Distance Filter */}
          <div>
            <label className="text-sm font-medium mb-3 block">
              Távolság: {filters.distance} km
            </label>
            <Slider
              value={[filters.distance]}
              onValueChange={(value) => 
                onFiltersChange({ ...filters, distance: value[0] })
              }
              max={50}
              min={1}
              step={1}
              className="w-full"
            />
          </div>

          {/* Category Filter */}
          <div>
            <label className="text-sm font-medium mb-3 block">Kategóriák</label>
            {renderCategoryBadges()}
          </div>

          {/* Date Filter */}
          <div>
            <label className="text-sm font-medium mb-3 block">Dátum</label>
            <Popover>
              <PopoverTrigger asChild>
                <Button variant="outline" className="w-full justify-start text-left font-normal">
                  <CalendarIcon className="mr-2 h-4 w-4" />
                  {filters.date ? (
                    format(filters.date, "PPP", { locale: hu })
                  ) : (
                    <span>Válassz dátumot</span>
                  )}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0">
                <Calendar
                  mode="single"
                  selected={filters.date}
                  onSelect={(date) => onFiltersChange({ ...filters, date })}
                  initialFocus
                />
              </PopoverContent>
            </Popover>
          </div>

          {/* Clear Filters */}
          <Button
            variant="outline"
            onClick={onResetFilters}
            className="w-full"
          >
            Szűrők törlése
          </Button>
        </div>
      </SheetContent>
    </Sheet>
  );
}
