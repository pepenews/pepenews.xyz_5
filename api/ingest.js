const axios = require('axios');
const Parser = require('rss-parser');

const parser = new Parser({
  timeout: 10000,
  headers: {
    'User-Agent': 'Mozilla/5.0 (compatible; NewsBot/1.0)'
  }
});

const RSS_URL = 'https://www.coindesk.com/arc/outboundfeeds/rss/';

// Simple keyword-based emoji mapping for "Pepe Frog" styling
function addPepeEmoji(title) {
  if (!title) return title;
  
  const lowerTitle = title.toLowerCase();
  let emoji = '';
  
  // Keyword-based emoji selection
  if (lowerTitle.includes('bitcoin') || lowerTitle.includes('btc')) {
    emoji = '₿';
  } else if (lowerTitle.includes('ethereum') || lowerTitle.includes('eth')) {
    emoji = 'Ξ';
  } else if (lowerTitle.includes('price') || lowerTitle.includes('market')) {
    emoji = '📈';
  } else if (lowerTitle.includes('regulation') || lowerTitle.includes('sec')) {
    emoji = '⚖️';
  } else if (lowerTitle.includes('exchange') || lowerTitle.includes('trading')) {
    emoji = '💱';
  } else if (lowerTitle.includes('nft') || lowerTitle.includes('token')) {
    emoji = '🪙';
  } else if (lowerTitle.includes('defi') || lowerTitle.includes('decentralized')) {
    emoji = '🌐';
  } else if (lowerTitle.includes('crypto') || lowerTitle.includes('cryptocurrency')) {
    emoji = '🪙';
  } else if (lowerTitle.includes('news') || lowerTitle.includes('update')) {
    emoji = '📰';
  } else {
    emoji = '🐸'; // Default Pepe emoji
  }
  
  return `${emoji} ${title}`;
}

module.exports = async (req, res) => {
  // Set CORS headers
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Content-Type', 'application/json');
  
  // Set timeout
  const timeout = setTimeout(() => {
    res.status(504).json({ error: 'Request timeout' });
  }, 25000); // 25 second timeout

  try {
    // Fetch and parse RSS feed
    const feed = await parser.parseURL(RSS_URL);
    
    // Transform items to match required format
    const items = feed.items.slice(0, 20).map(item => ({
      title: item.title || 'Untitled',
      link: item.link || '',
      pubDate: item.pubDate || item.isoDate || new Date().toISOString(),
      preview: item.contentSnippet || item.content || item.description || '',
      ppTitle: addPepeEmoji(item.title || 'Untitled')
    }));

    clearTimeout(timeout);
    res.status(200).json({ items });
    
  } catch (error) {
    clearTimeout(timeout);
    console.error('Error fetching RSS:', error);
    
    res.status(500).json({ 
      error: 'Failed to fetch RSS feed',
      message: error.message 
    });
  }
};

