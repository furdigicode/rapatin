
import { useState, useEffect } from 'react';
import { supabase } from "@/integrations/supabase/client";
import { Urls } from '@/types/supabase';

// Default URL values to use as fallback
const defaultUrls = {
  hero: {
    ctaButton: "https://rapatin.id/register",
    pricingButton: "#pricing"
  },
  cta: {
    registerButton: "https://rapatin.id/register"
  },
  navbar: {
    loginButton: "https://rapatin.id/login",
    registerButton: "https://rapatin.id/register"
  },
  pricing: {
    scheduleButton: "https://app.rapatin.id/register"
  },
  dashboard: {
    registerButton: "https://app.rapatin.id/register"
  }
};

export function useUrlData() {
  const [urls, setUrls] = useState(defaultUrls);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    const fetchUrls = async () => {
      try {
        setLoading(true);
        // Try to get data from Supabase
        const { data, error } = await supabase
          .from('urls')
          .select('*');
          
        if (error) {
          console.error('Error fetching URLs from Supabase:', error);
          setError(error);
          
          // Try to get data from localStorage as fallback
          const localData = localStorage.getItem('urlData');
          if (localData) {
            const parsedData = JSON.parse(localData);
            mapUrlsToState(parsedData);
            console.log('Using URLs from localStorage:', parsedData);
          }
          return;
        }
        
        if (data && data.length > 0) {
          console.log('URLs fetched from Supabase:', data);
          mapUrlsToState(data);
        } else {
          console.warn('No URL data found in Supabase, using defaults');
        }
      } catch (err) {
        console.error('Error in useUrlData:', err);
        setError(err instanceof Error ? err : new Error(String(err)));
      } finally {
        setLoading(false);
      }
    };
    
    fetchUrls();
  }, []);
  
  // Helper function to map data from Supabase to our state structure
  const mapUrlsToState = (data: Urls[]) => {
    const newUrls = { ...defaultUrls };
    
    // Map the data from Supabase to our structure
    data.forEach((group: Urls) => {
      if (group.id === '1' && group.items && group.items.length >= 2) {
        // Hero section
        newUrls.hero.ctaButton = group.items[0].url;
        newUrls.hero.pricingButton = group.items[1].url;
      } else if (group.id === '2' && group.items && group.items.length >= 1) {
        // CTA section
        newUrls.cta.registerButton = group.items[0].url;
      } else if (group.id === '3' && group.items && group.items.length >= 2) {
        // Navbar
        newUrls.navbar.loginButton = group.items[0].url;
        newUrls.navbar.registerButton = group.items[1].url;
      } else if (group.id === '4' && group.items && group.items.length >= 1) {
        // Pricing section
        newUrls.pricing.scheduleButton = group.items[0].url;
      } else if (group.id === '5' && group.items && group.items.length >= 1) {
        // Dashboard preview
        newUrls.dashboard.registerButton = group.items[0].url;
      }
    });
    
    setUrls(newUrls);
  };
  
  return { urls, loading, error };
}
