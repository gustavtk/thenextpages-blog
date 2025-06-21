# Google Africa Blog Clone

A pixel-perfect clone of the Google Africa Blog website built with Next.js, TypeScript, and Tailwind CSS.

## Features

- ✅ Responsive design matching Google's breakpoints
- ✅ Header with Google logo, navigation, and search functionality
- ✅ Hero section with featured article and colorful geometric background
- ✅ Article grid layout with thumbnails, titles, dates, and categories
- ✅ "All the Latest" section with article listings
- ✅ Footer with social links and Google branding
- ✅ Semantic HTML5 markup
- ✅ Accessibility features (WCAG 2.1 compliant)
- ✅ SEO optimized with meta tags
- ✅ Mobile-first responsive design

## Tech Stack

- **Framework**: Next.js 15 with App Router
- **Language**: TypeScript
- **Styling**: Tailwind CSS
- **Icons**: Lucide React
- **Font**: Inter (Google Fonts)

## Getting Started

### Prerequisites

- Node.js 18+ 
- npm or yarn

### Installation

1. Clone the repository:
```bash
git clone <repository-url>
cd google-africa-blog
```

2. Install dependencies:
```bash
npm install
```

3. Run the development server:
```bash
npm run dev
```

4. Open [http://localhost:3000](http://localhost:3000) in your browser.

### Build for Production

```bash
npm run build
npm start
```

## Project Structure

```
src/
├── app/
│   ├── globals.css
│   ├── layout.tsx
│   └── page.tsx
└── components/
    ├── Header.tsx
    ├── HeroSection.tsx
    ├── ArticleGrid.tsx
    ├── AllTheLatest.tsx
    └── Footer.tsx
```

## Components

### Header
- Google logo and Africa Blog branding
- Navigation menu with responsive mobile menu
- Search functionality with input field
- Language selector and additional menu

### HeroSection
- Colorful geometric pattern background
- Featured article with AI category
- Author information and call-to-action

### ArticleGrid
- Three-column responsive grid
- Article cards with images, categories, and metadata
- Gradient backgrounds for placeholder images

### AllTheLatest
- List of latest articles with thumbnails
- Category badges and publication dates
- "Load more stories" button

### Footer
- Social media links
- Google branding and footer navigation
- Language and help options

## Responsive Design

The website is fully responsive with breakpoints:
- Mobile: 320px+
- Tablet: 768px+
- Desktop: 1024px+
- Large screens: 1280px+

## Accessibility

- Semantic HTML structure
- ARIA labels for interactive elements
- Keyboard navigation support
- Focus indicators
- Alt text for images
- Screen reader friendly

## Performance

- Optimized for Core Web Vitals
- Static generation with Next.js
- Efficient CSS with Tailwind
- Lazy loading for images
- Minimal JavaScript bundle

## Legal Notice

This is a clone created for educational purposes only. It replicates the visual design of the Google Africa Blog but:
- Uses dummy content instead of actual Google content
- Does not use Google's trademarked assets
- Is not affiliated with or endorsed by Google
- Should not be used for commercial purposes

## License

This project is for educational purposes only. Please respect Google's intellectual property and trademarks.
