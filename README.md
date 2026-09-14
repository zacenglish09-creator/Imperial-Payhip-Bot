# Imperial Payhip Bot

A secure Discord bot that logs Payhip purchases to a designated Discord channel with webhook verification.

## Features

✅ **Real-time Purchase Logging** - Automatically logs every Payhip sale to Discord  
✅ **Webhook Signature Verification** - Validates Payhip webhook signatures for security  
✅ **Rich Embeds** - Beautiful formatted purchase notifications with all details  
✅ **License Key Support** - Displays license keys for digital products  
✅ **Health Check Endpoint** - Monitor bot status with `/health`  
✅ **Error Handling** - Robust error handling and logging  

## Setup

### 1. Prerequisites
- Node.js 20 or higher
- A Discord bot token
- A Payhip account with webhook access
- A Discord server with a designated logs channel

### 2. Discord Bot Setup
1. Go to [Discord Developer Portal](https://discord.com/developers/applications)
2. Click "New Application" and name it "Imperial Payhip Bot"
3. Go to the "Bot" section and click "Add Bot"
4. Copy the token and save it (you'll need it for `.env`)
5. Enable these intents:
   - `GUILD_MESSAGES`
   - `DIRECT_MESSAGES`
6. In "OAuth2" → "URL Generator", select:
   - Scopes: `bot`
   - Permissions: `Send Messages`, `Read Messages/View Channels`, `Embed Links`
7. Use the generated URL to invite the bot to your server

### 3. Discord Channel Setup
1. Create a new text channel in your server (e.g., `#payhip-logs`)
2. Right-click the channel and copy its ID
3. Save this ID for your `.env` file

### 4. Environment Setup
1. Copy `.env.example` to `.env`:
   ```bash
   cp .env.example .env
   ```

2. Fill in your `.env` file:
   ```env
   DISCORD_BOT_TOKEN=your_bot_token_here
   DISCORD_LOGS_CHANNEL_ID=your_channel_id_here
   PAYHIP_WEBHOOK_SECRET=your_payhip_webhook_secret
   PORT=3000
   ```

### 5. Payhip Webhook Setup
1. Go to your Payhip account settings
2. Find "Webhooks" or "API" section
3. Add a new webhook with these settings:
   - **URL**: `https://your-domain.com/webhook/payhip`
   - **Events**: Select "Sale Completed"
   - **Secret Key**: Generate and copy this to your `.env` as `PAYHIP_WEBHOOK_SECRET`

### 6. Installation & Running
```bash
# Install dependencies
npm install

# Check for syntax errors
npm run check

# Start the bot
npm start
```

## API Endpoints

### `POST /webhook/payhip`
Receives Payhip purchase webhooks and logs them to Discord.

**Headers:**
```
X-Payhip-Signature: <signature>
Content-Type: application/json
```

**Request Body:**
```json
{
  "event": "sale",
  "data": {
    "product_name": "Product Name",
    "price": "19.99",
    "currency_code": "USD",
    "customer_email": "customer@example.com",
    "customer_name": "John Doe",
    "transaction_id": "TXN123456",
    "license_key": "XXXXX-XXXXX-XXXXX"
  }
}
```

### `GET /health`
Check the bot and server status.

**Response:**
```json
{
  "status": "ok",
  "bot_ready": true,
  "timestamp": "2024-01-15T10:30:00.000Z"
}
```

### `GET /`
Get server info.

**Response:**
```json
{
  "name": "Imperial Payhip Bot",
  "status": "ready",
  "webhook_endpoint": "/webhook/payhip"
}
```

## Discord Embed Format

Each purchase creates a formatted embed with:
- **Product Name** - Name of the purchased product
- **Amount** - Purchase price
- **Currency** - Currency code (USD, EUR, etc.)
- **Customer Email** - Buyer's email
- **Transaction ID** - Unique payment identifier
- **Timestamp** - When the purchase was logged
- **Customer Name** (if available) - Buyer's full name
- **License Key** (if applicable) - Digital product license

## Troubleshooting

### Bot doesn't connect to Discord
- Verify `DISCORD_BOT_TOKEN` is correct
- Check bot permissions in your Discord server
- Ensure bot is invited to the server

### Bot can't find logs channel
- Verify `DISCORD_LOGS_CHANNEL_ID` is correct
- Make sure the bot has permission to view and message in that channel
- Check channel ID format (should be numeric)

### Webhooks aren't being received
- Verify your public URL is accessible
- Check `PAYHIP_WEBHOOK_SECRET` matches Payhip settings
- Test with `curl` to verify endpoint accessibility
- Check server logs for errors

### Signature verification fails
- Make sure webhook secret matches exactly in Payhip and `.env`
- Verify the webhook URL in Payhip matches your deployment

## Deployment

### Using Heroku
```bash
# Create Heroku app
heroku create your-app-name

# Set environment variables
heroku config:set DISCORD_BOT_TOKEN=your_token
heroku config:set DISCORD_LOGS_CHANNEL_ID=your_channel
heroku config:set PAYHIP_WEBHOOK_SECRET=your_secret

# Deploy
git push heroku main
```

### Using Railway/Render/Other Platforms
Set the same environment variables in your platform's configuration, then deploy.

## Security

🔒 **Best Practices:**
- Never commit `.env` to version control
- Use strong webhook secrets
- Regularly rotate your bot token if compromised
- Restrict bot permissions to minimum needed
- Keep dependencies updated: `npm audit fix`

## Support

For issues or questions:
1. Check the troubleshooting section
2. Review server logs for error messages
3. Verify all environment variables are set correctly
4. Check Discord bot permissions

## License

MIT License - Feel free to use and modify

---

**Made for Imperial Modifications** ⚡
