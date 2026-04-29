<div align="center">
<img width="1200" height="475" alt="GHBanner" src="https://github.com/user-attachments/assets/0aa67016-6eaf-458a-adb2-6e31a0763ed6" />
</div>

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