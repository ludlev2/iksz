'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';
import { useAuth } from './AuthContext';

export interface Opportunity {
  id: string;
  title: string;
  description: string;
  category: string;
  categories: string[];
  location: {
    address: string;
    lat: number;
    lng: number;
  };
  date: string;
  time: string;
  duration: number;
  capacity: number;
  registered: number;
  provider: {
    name: string;
    contact: string;
    phone: string;
  };
  requirements?: string;
  status: string;
}

interface OpportunityContextType {
  opportunities: Opportunity[];
  addOpportunity: (opportunity: Omit<Opportunity, 'id' | 'registered' | 'status' | 'category'>) => void;
  updateOpportunity: (id: string, updates: Partial<Opportunity>) => void;
  deleteOpportunity: (id: string) => void;
  getProviderOpportunities: (providerName: string) => Opportunity[];
  isLoading: boolean;
}

const OpportunityContext = createContext<OpportunityContextType | undefined>(undefined);

export function OpportunityProvider({ children }: { children: React.ReactNode }) {
  const { user } = useAuth();
  const [opportunities, setOpportunities] = useState<Opportunity[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const loadOpportunities = async () => {
      try {
        // Load existing opportunities from JSON
        const response = await fetch('/data/mock-opportunities.json');
        const data = await response.json();
        
        // Load any opportunities from localStorage
        const stored = localStorage.getItem('iksz-opportunities');
        const storedOpportunities = stored ? JSON.parse(stored) : [];
        
        // Combine and deduplicate
        const allOpportunities = [...data, ...storedOpportunities];
        const uniqueOpportunities = allOpportunities.filter((opp, index, self) => 
          index === self.findIndex(o => o.id === opp.id)
        );
        
        setOpportunities(uniqueOpportunities);
      } catch (error) {
        console.error('Error loading opportunities:', error);
      } finally {
        setIsLoading(false);
      }
    };

    loadOpportunities();
  }, []);

  const saveToLocalStorage = (updatedOpportunities: Opportunity[]) => {
    // Only save opportunities that were created by users (not from mock data)
    const userCreatedOpportunities = updatedOpportunities.filter(opp => 
      parseInt(opp.id) > 1000 // Use a simple ID scheme to distinguish user-created ones
    );
    localStorage.setItem('iksz-opportunities', JSON.stringify(userCreatedOpportunities));
  };

  const addOpportunity = (opportunityData: Omit<Opportunity, 'id' | 'registered' | 'status' | 'category'>) => {
    const newOpportunity: Opportunity = {
      ...opportunityData,
      id: (Date.now() + Math.random()).toString(), // Simple ID generation
      registered: 0,
      status: 'active',
      category: opportunityData.categories[0] || 'general' // Use first category as primary
    };

    const updatedOpportunities = [...opportunities, newOpportunity];
    setOpportunities(updatedOpportunities);
    saveToLocalStorage(updatedOpportunities);
  };

  const updateOpportunity = (id: string, updates: Partial<Opportunity>) => {
    const updatedOpportunities = opportunities.map(opp => 
      opp.id === id ? { ...opp, ...updates } : opp
    );
    setOpportunities(updatedOpportunities);
    saveToLocalStorage(updatedOpportunities);
  };

  const deleteOpportunity = (id: string) => {
    const updatedOpportunities = opportunities.filter(opp => opp.id !== id);
    setOpportunities(updatedOpportunities);
    saveToLocalStorage(updatedOpportunities);
  };

  const getProviderOpportunities = (providerName: string) => {
    return opportunities.filter(opp => opp.provider.name === providerName);
  };

  return (
    <OpportunityContext.Provider value={{
      opportunities,
      addOpportunity,
      updateOpportunity,
      deleteOpportunity,
      getProviderOpportunities,
      isLoading
    }}>
      {children}
    </OpportunityContext.Provider>
  );
}

export function useOpportunities() {
  const context = useContext(OpportunityContext);
  if (context === undefined) {
    throw new Error('useOpportunities must be used within an OpportunityProvider');
  }
  return context;
}