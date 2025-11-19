# Jamie Levinson - Portfolio Website

A modern, responsive portfolio website built with Next.js, TypeScript, and Tailwind CSS. Features a draggable theme toggle with smooth View Transitions API animations, dark mode support, and a clean minimalist design.

## 🚀 Features

- **Draggable Theme Toggle**: Interactive sun/moon icon that can be dragged anywhere on the screen (desktop only). The theme transition animation starts from the icon's current position.
- **View Transitions API**: Smooth circle-blur animations when switching between light and dark modes, with CSS fallback for Safari.
- **Responsive Design**: Fully responsive layout that works seamlessly on desktop, tablet, and mobile devices.
- **Dark Mode**: System-aware dark mode with smooth transitions and proper hydration handling.
- **Project Showcase**: Interactive carousel displaying projects with GIF previews and technology badges.
- **Work Experience**: Timeline view of professional experience with company logos and technology stacks.
- **Modern Tech Stack**: Built with Next.js 15, React 19, TypeScript, and Tailwind CSS.

## 🛠️ Tech Stack

- **Framework**: Next.js 15 (App Router)
- **Language**: TypeScript
- **Styling**: Tailwind CSS
- **UI Components**: shadcn/ui
- **Theme Management**: next-themes
- **Icons**: Lucide React
- **Animations**: View Transitions API (with CSS fallback)

## 🌐 Live Site

Visit **[jamielevinson.com](https://jamielevinson.com)** to see the site in action.

## 📦 Development

To run this project locally:

1. **Clone the repository**:
   ```bash
   git clone https://github.com/Jamie-Levinson/jamielevinson.com.git
   cd jamielevinson.com
   ```

2. **Install dependencies**:
   ```bash
   npm install
   ```

3. **Run the development server**:
   ```bash
   npm run dev
   ```

4. **Open your browser**: Navigate to [http://localhost:3000](http://localhost:3000)

## 🏗️ Project Structure

```
my-portfolio/
├── src/
│   ├── app/                    # Next.js App Router pages
│   │   ├── layout.tsx         # Root layout with ThemeProvider
│   │   ├── page.tsx           # Home page
│   │   └── globals.css        # Global styles and theme variables
│   └── components/            # React components
│       ├── Header.tsx         # Navigation header
│       ├── Hero.tsx           # Hero section with bio and profile picture
│       ├── Experience.tsx    # Work experience timeline
│       ├── Projects.tsx       # Projects carousel
│       ├── Contact.tsx        # Contact information
│       ├── ThemeToggle.tsx    # Draggable theme toggle
│       ├── DragHint.tsx       # Drag hint indicator
│       ├── theme-provider.tsx # Theme provider wrapper
│       └── ui/                # UI components
│           └── theme-toggle-button.tsx # Theme toggle button with animations
├── public/                    # Static assets
│   ├── project_gifs/          # Project preview GIFs
│   ├── company_logos/         # Company logos
│   ├── profile_pic.jpg         # Profile picture
│   ├── drag-hint.svg          # Drag hint graphic
│   └── JamieLevinsonResume.pdf # Resume PDF
└── package.json
```

## 🌐 Deployment

This site is deployed on Vercel. The build process is automatically handled by Vercel's Next.js integration.

### Build Commands

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run start` - Start production server
- `npm run lint` - Run ESLint

## 📝 Notes

- The theme toggle uses the View Transitions API for smooth animations. Safari users will see a CSS-based fallback animation.
- The draggable theme toggle is disabled on mobile devices to prevent scrolling conflicts.

## 📄 License

MIT
