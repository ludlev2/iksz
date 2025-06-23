'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Clock, CheckCircle, AlertCircle } from 'lucide-react';

interface HourCounterProps {
  completedHours: number;
  pendingHours: number;
  totalRequired?: number;
}

export default function HourCounter({ 
  completedHours, 
  pendingHours, 
  totalRequired = 50 
}: HourCounterProps) {
  const totalHours = completedHours + pendingHours;
  const remainingHours = Math.max(0, totalRequired - totalHours);
  const progressPercentage = (totalHours / totalRequired) * 100;

  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="text-lg flex items-center gap-2">
          <Clock className="w-5 h-5" />
          IKSZ órák
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <div className="flex justify-between text-sm">
            <span>Teljesített órák</span>
            <span className="font-medium">{totalHours}/{totalRequired}</span>
          </div>
          <Progress value={progressPercentage} className="h-2" />
        </div>

        <div className="space-y-3 text-sm">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <CheckCircle className="w-4 h-4 text-green-500" />
              <span>Jóváhagyott</span>
            </div>
            <span className="font-medium text-green-600">{completedHours}h</span>
          </div>

          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <AlertCircle className="w-4 h-4 text-yellow-500" />
              <span>Jóváhagyásra vár</span>
            </div>
            <span className="font-medium text-yellow-600">{pendingHours}h</span>
          </div>

          <div className="flex items-center justify-between pt-2 border-t">
            <span className="font-medium">Hátralevő órák</span>
            <span className="font-bold text-lg">
              {remainingHours}h
            </span>
          </div>
        </div>

        {remainingHours === 0 && (
          <div className="bg-green-50 border border-green-200 rounded-lg p-3 text-center">
            <CheckCircle className="w-6 h-6 text-green-500 mx-auto mb-1" />
            <p className="text-sm font-medium text-green-800">
              Gratulálunk! Teljesítetted az 50 órát!
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}