import { scrapePropertyListing } from './lib/scraper';

async function testH1Scraping() {
  const url = 'https://www.airbnb.com/rooms/585577384649708336';
  
  try {
    const result = await scrapePropertyListing(url);
    console.log('Extracted H1 Title:', result.title);
    
    // Verify if the extracted title matches the expected content
    const expectedTitle = 'Luxurious Orchard Villa | Double Pickleball | Spa';
    console.log('Title matches expected:', result.title === expectedTitle);
    
  } catch (error) {
    console.error('Scraping failed:', error);
  }
}

testH1Scraping();