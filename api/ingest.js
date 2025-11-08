const Parser = require('rss-parser');

const RSS_URL = 'https://www.coindesk.com/arc/outboundfeeds/rss/';

// Initialize parser with proper headers to avoid 500 errors
const parser = new Parser({
  timeout: 15000,
  headers: {
    'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
    'Accept': 'application/rss+xml, application/xml, text/xml, */*'
  }
});

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
  
  try {
    // Fetch and parse RSS feed
    const feed = await parser.parseURL(RSS_URL);
    
    if (!feed || !feed.items) {
      throw new Error('Invalid RSS feed response');
    }
    
    // Transform items to match required format
    const items = feed.items.slice(0, 20).map(item => {
      // Clean up preview text - remove HTML tags if present
      let preview = item.contentSnippet || item.content || item.description || '';
      if (preview && typeof preview === 'string') {
        // Remove HTML tags and decode entities
        preview = preview.replace(/<[^>]*>/g, '').trim();
        preview = preview.replace(/&nbsp;/g, ' ');
        preview = preview.replace(/&amp;/g, '&');
        preview = preview.replace(/&lt;/g, '<');
        preview = preview.replace(/&gt;/g, '>');
        preview = preview.replace(/&quot;/g, '"');
        preview = preview.replace(/&#39;/g, "'");
      }
      
      return {
        title: item.title || 'Untitled',
        link: item.link || '',
        pubDate: item.pubDate || item.isoDate || new Date().toISOString(),
        preview: preview || '',
        ppTitle: addPepeEmoji(item.title || 'Untitled')
      };
    });

    res.status(200).json({ items });
    
  } catch (error) {
    console.error('Error fetching RSS:', error);
    
    res.status(500).json({ 
      error: 'Failed to fetch RSS feed',
      message: error.message 
    });
  }
};

