'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ArrowLeft, MapPin } from 'lucide-react';
import { toast } from 'sonner';

const categories = [
  { id: 'environment', label: 'Környezetvédelem', color: 'bg-green-100 text-green-800' },
  { id: 'elderly', label: 'Idősek segítése', color: 'bg-purple-100 text-purple-800' },
  { id: 'animals', label: 'Állatvédelem', color: 'bg-orange-100 text-orange-800' },
  { id: 'children', label: 'Gyermekek', color: 'bg-pink-100 text-pink-800' },
  { id: 'social', label: 'Szociális', color: 'bg-blue-100 text-blue-800' },
  { id: 'education', label: 'Oktatás', color: 'bg-indigo-100 text-indigo-800' }
];

export default function NewOpportunityPage() {
  const router = useRouter();
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    categories: [] as string[],
    address: '',
    capacity: '',
    date: '',
    time: '',
    duration: '',
    requirements: ''
  });

  const [selectedLocation, setSelectedLocation] = useState<{lat: number, lng: number} | null>(null);

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const toggleCategory = (categoryId: string) => {
    setFormData(prev => ({
      ...prev,
      categories: prev.categories.includes(categoryId)
        ? prev.categories.filter(c => c !== categoryId)
        : [...prev.categories, categoryId]
    }));
  };

  const handleLocationClick = () => {
    // Mock location picker - in real app this would open a map modal
    setSelectedLocation({ lat: 47.4979, lng: 19.0402 });
    toast.success('Helyszín kiválasztva!');
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Basic validation
    if (!formData.title || !formData.description || formData.categories.length === 0) {
      toast.error('Kérjük töltse ki az összes kötelező mezőt!');
      return;
    }

    // Mock submission
    console.log('Submitting opportunity:', formData);
    toast.success('Lehetőség sikeresen létrehozva!');
    router.push('/provider/dashboard');
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b">
        <div className="container mx-auto px-4 py-4">
          <Button variant="ghost" onClick={() => router.back()}>
            <ArrowLeft className="w-4 h-4 mr-2" />
            Vissza
          </Button>
        </div>
      </header>

      <div className="container mx-auto px-4 py-6 max-w-2xl">
        <Card>
          <CardHeader>
            <CardTitle className="text-2xl">Új önkéntes lehetőség</CardTitle>
            <p className="text-gray-600">Hozz létre egy új közösségi szolgálat lehetőséget diákok számára.</p>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Title */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Cím *
                </label>
                <Input
                  value={formData.title}
                  onChange={(e) => handleInputChange('title', e.target.value)}
                  placeholder="pl. Környezetvédelmi akció a parkban"
                  required
                />
              </div>

              {/* Description */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Leírás *
                </label>
                <Textarea
                  value={formData.description}
                  onChange={(e) => handleInputChange('description', e.target.value)}
                  placeholder="Részletes leírás a tevékenységről, elvárásokról..."
                  rows={4}
                  required
                />
              </div>

              {/* Categories */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-3">
                  Kategóriák *
                </label>
                <div className="flex flex-wrap gap-2">
                  {categories.map((category) => (
                    <Badge
                      key={category.id}
                      variant={formData.categories.includes(category.id) ? "default" : "outline"}
                      className={`cursor-pointer ${
                        formData.categories.includes(category.id) 
                          ? category.color 
                          : 'hover:bg-gray-100'
                      }`}
                      onClick={() => toggleCategory(category.id)}
                    >
                      {category.label}
                    </Badge>
                  ))}
                </div>
              </div>

              {/* Location */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Helyszín *
                </label>
                <div className="space-y-2">
                  <Input
                    value={formData.address}
                    onChange={(e) => handleInputChange('address', e.target.value)}
                    placeholder="Cím (pl. Budapest, Váci út 1.)"
                    required
                  />
                  <Button
                    type="button"
                    variant="outline"
                    onClick={handleLocationClick}
                    className="w-full"
                  >
                    <MapPin className="w-4 h-4 mr-2" />
                    {selectedLocation ? 'Helyszín kiválasztva' : 'Helyszín kiválasztása térképen'}
                  </Button>
                </div>
              </div>

              {/* Date and Time */}
              <div className="grid sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Dátum *
                  </label>
                  <Input
                    type="date"
                    value={formData.date}
                    onChange={(e) => handleInputChange('date', e.target.value)}
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Kezdés időpontja *
                  </label>
                  <Input
                    type="time"
                    value={formData.time}
                    onChange={(e) => handleInputChange('time', e.target.value)}
                    required
                  />
                </div>
              </div>

              {/* Duration and Capacity */}
              <div className="grid sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Időtartam (órában) *
                  </label>
                  <Input
                    type="number"
                    min="1"
                    max="12"
                    value={formData.duration}
                    onChange={(e) => handleInputChange('duration', e.target.value)}
                    placeholder="pl. 4"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Kapacitás (fő) *
                  </label>
                  <Input
                    type="number"
                    min="1"
                    max="100"
                    value={formData.capacity}
                    onChange={(e) => handleInputChange('capacity', e.target.value)}
                    placeholder="pl. 20"
                    required
                  />
                </div>
              </div>

              {/* Requirements */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Követelmények / Megjegyzések
                </label>
                <Textarea
                  value={formData.requirements}
                  onChange={(e) => handleInputChange('requirements', e.target.value)}
                  placeholder="pl. Kényelmes ruházat, munkakesztyű ajánlott"
                  rows={3}
                />
              </div>

              {/* Submit */}
              <div className="flex gap-4 pt-4">
                <Button type="button" variant="outline" onClick={() => router.back()} className="flex-1">
                  Mégse
                </Button>
                <Button type="submit" className="flex-1">
                  Lehetőség létrehozása
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}