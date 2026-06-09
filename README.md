

# MapLink - AI Landing Page Generator

MapLink is an AI-powered tool that analyzes any business website and automatically generates stunning, high-converting marketing landing pages. It extracts business information and creates professional copy, FAQs, testimonials, and value propositions.

## Features

- **URL Analysis** - Paste any business URL and MapLink extracts the business details
- **AI-Powered Copy** - Generates hero headlines, subheadlines, value propositions, FAQs, and testimonials
- **Multiple Design Styles** - Choose from three distinct architypes:
  - **Structural** - Clean, architectural design with strong grid layouts
  - **Minimalist** - Editorial-style with typography focus
  - **Brutalist** - Bold, raw design with industrial aesthetics
- **Preview Mode** - Toggle between the generated landing page and the analysis view
- **Local History** - Your generated pages are saved locally for easy access
- **Export Website** - Download your generated site as standalone HTML

## How to Use

1. Paste a Google Maps business URL
2. Wait for AI to generate your landing page
3. Switch between 3 design archetypes
4. Click **Export** to download the HTML file
5. Upload to any hosting (Netlify Drop, .host, or your own server)

## Export Your Website

When you click **Export**, you get a standalone `.html` file that:

- Uses Tailwind CDN for styling (needs internet to load)
- Includes all business info: hero, about, FAQ, contact
- Links to WhatsApp for direct messaging
- Uses safe fallback images when Google Places photos cannot be exported securely

**Upload options:**
- **Netlify Drop** - Drag and drop the HTML file
- **.host** - Upload directly in browser
- **Your own hosting** - Upload via FTP/SFTP

**Note:** Exported files are static HTML. Google Places photo URLs are not embedded because they include private API credentials.

## Run Locally

**Prerequisites:** Node.js

1. Install dependencies:
   ```bash
   npm install
   ```
2. Set your API key in `.env`:
   ```
   GEMINI_API_KEY=your_api_key_here
   ```
3. Run the app:
   ```bash
   npm run dev
   ```

## Tech Stack

- React 19
- Vite
- TailwindCSS v4
- Gemini API for AI generation
- Motion for animations

## License

MIT
