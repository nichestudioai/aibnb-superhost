import express from 'express';
import cors from 'cors';
import axios from 'axios';
import * as cheerio from 'cheerio';

const app = express();
app.use(cors());
app.use(express.json());

// Proxy configuration
const PROXY_CONFIG = {
  host: 'brd.superproxy.io',
  port: 33335,
  auth: {
    username: 'brd-customer-hl_5814c6b1-zone-residential_proxy1',
    password: '3p6zwwfzflwt'
  }
};

// Test proxy connection on startup
async function testProxyConnection() {
  try {
    const response = await axios.get('https://geo.brdtest.com/welcome.txt?product=resi&method=native', {
      proxy: {
        host: PROXY_CONFIG.host,
        port: PROXY_CONFIG.port,
        auth: {
          username: PROXY_CONFIG.auth.username,
          password: PROXY_CONFIG.auth.password
        }
      },
      timeout: 30000,
      validateStatus: null
    });

    if (response.status === 200) {
      console.log('Proxy connection successful!');
      console.log('Response:', response.data);
    } else {
      console.error('Proxy test failed with status:', response.status);
      console.error('Response:', response.data);
    }
  } catch (error) {
    console.error('Proxy connection test failed:', error.message);
  }
}

app.post('/scrape', async (req, res) => {
  try {
    const { url } = req.body;
    
    if (!url) {
      return res.status(400).json({ error: 'URL is required' });
    }

    const headers = {
      'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36',
      'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8',
      'Accept-Language': 'en-US,en;q=0.5',
      'Referer': 'https://www.vrbo.com/'
    };

    const response = await axios.get(url, {
      headers,
      proxy: {
        host: PROXY_CONFIG.host,
        port: PROXY_CONFIG.port,
        auth: {
          username: PROXY_CONFIG.auth.username,
          password: PROXY_CONFIG.auth.password
        }
      },
      timeout: 30000,
      validateStatus: null
    });

    if (response.status !== 200) {
      throw new Error(`Failed to fetch page: HTTP ${response.status}`);
    }

    const $ = cheerio.load(response.data);
    
    // VRBO specific selectors
    const title = $('[data-wdio="property-headline"]').text().trim() ||
                 $('h1').first().text().trim();
    
    const subtitle = $('.property-headline__desc').text().trim() ||
                    $('.property-info__description').text().trim();
    
    const imageUrl = $('.media-gallery img').first().attr('src') ||
                    $('img[data-wdio="hero-image"]').first().attr('src') ||
                    '';

    if (!title) {
      throw new Error('Could not extract property title');
    }

    res.json({
      title,
      subtitle,
      imageUrl,
      platform: 'vrbo'
    });
  } catch (error) {
    console.error('Scraping error:', error);
    res.status(500).json({
      error: 'Failed to scrape property listing',
      details: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Scraper proxy server running on port ${PORT}`);
  testProxyConnection();
});