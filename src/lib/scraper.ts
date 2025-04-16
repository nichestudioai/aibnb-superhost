import * as cheerio from 'cheerio';
import axios from 'axios';

export interface ScrapedProperty {
  title: string;
  subtitle: string;
  imageUrl: string;
  platform: 'airbnb' | 'vrbo' | 'bookingcom' | null;
}

const PROXY_SERVER = 'http://localhost:3000';

export async function scrapePropertyListing(url: string): Promise<ScrapedProperty> {
  try {
    const parsedUrl = new URL(url);
    const platform = detectPlatform(parsedUrl);
    
    if (!platform) {
      throw new Error('Unsupported platform. Please use a URL from Airbnb, VRBO, or Booking.com');
    }

    // Direct scraping for Airbnb and Booking.com
    if (platform === 'airbnb' || platform === 'bookingcom') {
      const response = await fetch(url);
      if (!response.ok) {
        throw new Error('Failed to fetch the property listing page');
      }

      const html = await response.text();
      const $ = cheerio.load(html);

      let title = '';
      let subtitle = '';
      let imageUrl = '';

      switch (platform) {
        case 'airbnb':
          title = $('h1').first().text().trim();
          subtitle = $('h2').first().text().trim();
          imageUrl = $('img').first().attr('src') || '';
          break;
        case 'bookingcom':
          title = $('.hp__hotel-name').text().trim();
          subtitle = $('.hp__hotel-type-badge').text().trim();
          imageUrl = $('.hotel-photos img').first().attr('src') || '';
          break;
      }

      if (!title) {
        throw new Error('Could not extract property title');
      }

      return {
        title,
        subtitle,
        imageUrl,
        platform
      };
    }

    // Use proxy server for VRBO listings
    if (platform === 'vrbo') {
      try {
        const response = await axios.post(`${PROXY_SERVER}/scrape`, { url });
        
        if (!response.data || !response.data.title) {
          throw new Error('Invalid response from scraping service');
        }
        
        return response.data;
      } catch (error) {
        if (axios.isAxiosError(error)) {
          if ((error as any).code === 'ECONNREFUSED') {
            throw new Error('Scraping service is not available. Please ensure the proxy server is running.');
          }
          throw error instanceof Error ? new Error(`Scraping service error: ${error.message}`) : new Error('An unknown error occurred');
        }
        throw error instanceof Error ? error : new Error('An unknown error occurred');
      }
    }

    throw new Error('Unsupported platform');
  } catch (error) {
    if (error instanceof Error) {
      throw error;
    }
    throw new Error('Failed to fetch property listing. Please check the URL and try again.');
  }
}

function detectPlatform(url: URL): 'airbnb' | 'vrbo' | 'bookingcom' | null {
  const hostname = url.hostname.toLowerCase();
  
  if (hostname.includes('airbnb')) return 'airbnb';
  if (hostname.includes('vrbo')) return 'vrbo';
  if (hostname.includes('booking.com')) return 'bookingcom';
  
  return null;
}

export function cleanListingUrl(url: string): string {
  try {
    const parsedUrl = new URL(url);
    
    if (parsedUrl.hostname.includes('airbnb')) {
      const pathParts = parsedUrl.pathname.split('/');
      const roomIndex = pathParts.indexOf('rooms');
      if (roomIndex !== -1 && pathParts[roomIndex + 1]) {
        return `https://www.airbnb.com/rooms/${pathParts[roomIndex + 1]}`;
      }
    }
    
    if (parsedUrl.hostname.includes('vrbo') || parsedUrl.hostname.includes('booking.com')) {
      return `${parsedUrl.origin}${parsedUrl.pathname}`;
    }
    
    return url;
  } catch (error) {
    return url;
  }
}