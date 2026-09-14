const express = require('express');
const { Client, GatewayIntentBits, EmbedBuilder, ChannelType } = require('discord.js');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 3000;

// Discord Bot Setup
const client = new Client({
  intents: [GatewayIntentBits.Guilds, GatewayIntentBits.DirectMessages],
});

let logsChannel = null;

// Discord bot ready event
client.on('ready', () => {
  console.log(`✅ Discord bot logged in as ${client.user.tag}`);
  
  // Get the logs channel
  const channelId = process.env.DISCORD_LOGS_CHANNEL_ID;
  if (!channelId) {
    console.error('❌ DISCORD_LOGS_CHANNEL_ID not set in environment variables');
    process.exit(1);
  }
  
  client.channels.fetch(channelId).then((channel) => {
    if (channel.type === ChannelType.GuildText) {
      logsChannel = channel;
      console.log(`✅ Connected to logs channel: ${channel.name}`);
    } else {
      console.error('❌ The specified channel is not a text channel');
      process.exit(1);
    }
  }).catch((error) => {
    console.error('❌ Failed to fetch logs channel:', error.message);
    process.exit(1);
  });
});

// Express middleware
app.use(express.json());

// Verify Payhip webhook signature
function verifyWebhookSignature(payload, signature) {
  const crypto = require('crypto');
  const secret = process.env.PAYHIP_WEBHOOK_SECRET;
  
  if (!secret) {
    console.warn('⚠️  PAYHIP_WEBHOOK_SECRET not set - signature verification disabled');
    return true;
  }
  
  const hash = crypto
    .createHmac('sha256', secret)
    .update(JSON.stringify(payload))
    .digest('hex');
  
  return hash === signature;
}

// Webhook endpoint for Payhip purchases
app.post('/webhook/payhip', async (req, res) => {
  try {
    const signature = req.headers['x-payhip-signature'];
    
    // Verify signature if secret is set
    if (!verifyWebhookSignature(req.body, signature)) {
      console.warn('⚠️  Invalid webhook signature received');
      return res.status(401).json({ error: 'Invalid signature' });
    }
    
    const { event, data } = req.body;
    
    // Handle purchase event
    if (event === 'sale' && data) {
      const purchase = data;
      
      // Create Discord embed
      const embed = new EmbedBuilder()
        .setTitle('🛍️ New Payhip Purchase')
        .setColor('#00b0f4')
        .addFields(
          { name: 'Product', value: purchase.product_name || 'Unknown', inline: true },
          { name: 'Amount', value: `$${parseFloat(purchase.price || 0).toFixed(2)}`, inline: true },
          { name: 'Currency', value: purchase.currency_code || 'USD', inline: true },
          { name: 'Customer', value: purchase.customer_email || 'Anonymous', inline: false },
          { name: 'Transaction ID', value: purchase.transaction_id || 'N/A', inline: true },
          { name: 'Timestamp', value: new Date().toISOString(), inline: true }
        )
        .setFooter({ text: 'Payhip Purchase Logger' })
        .setTimestamp();
      
      // Add optional fields if they exist
      if (purchase.customer_name) {
        embed.addFields({ name: 'Name', value: purchase.customer_name, inline: false });
      }
      
      if (purchase.license_key) {
        embed.addFields({ name: 'License Key', value: `\`\`\`${purchase.license_key}\`\`\``, inline: false });
      }
      
      // Send to Discord
      if (logsChannel) {
        await logsChannel.send({ embeds: [embed] });
        console.log(`✅ Purchase logged: ${purchase.customer_email} - $${purchase.price}`);
      } else {
        console.error('❌ Logs channel not available');
        return res.status(503).json({ error: 'Logs channel unavailable' });
      }
      
      return res.json({ success: true, message: 'Purchase logged' });
    }
    
    // Acknowledge other events
    console.log(`📬 Received event: ${event}`);
    res.json({ success: true, message: `Event ${event} received` });
    
  } catch (error) {
    console.error('❌ Webhook error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({
    status: 'ok',
    bot_ready: client.isReady(),
    timestamp: new Date().toISOString()
  });
});

// Root endpoint
app.get('/', (req, res) => {
  res.json({
    name: 'Imperial Payhip Bot',
    status: client.isReady() ? 'ready' : 'initializing',
    webhook_endpoint: '/webhook/payhip'
  });
});

// Start Express server
app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
});

// Login to Discord
const token = process.env.DISCORD_BOT_TOKEN;
if (!token) {
  console.error('❌ DISCORD_BOT_TOKEN not set in environment variables');
  process.exit(1);
}

client.login(token);

// Graceful shutdown
process.on('SIGINT', () => {
  console.log('\n🛑 Shutting down gracefully...');
  client.destroy();
  process.exit(0);
});
