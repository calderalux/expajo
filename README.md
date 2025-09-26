# Expajo - Short-Term Rental Platform

A modern, responsive web application for discovering and booking short-term rental properties. Built with Next.js, TypeScript, and Supabase.

## 🚀 Features

- **Property Search & Discovery**: Advanced search with filters for location, dates, guests, and price range
- **User Authentication**: Secure login and registration with Supabase Auth
- **Booking Management**: Complete booking flow with date selection and payment integration
- **Responsive Design**: Mobile-first design with Tailwind CSS and custom design tokens
- **Type Safety**: Full TypeScript implementation with strict typing
- **Form Validation**: Robust form handling with TanStack Form and Zod validation
- **Modern UI**: Beautiful components built with HeroUI and Mantine

## 🛠️ Tech Stack

### Frontend
- **Next.js 15** with App Router
- **TypeScript** (strict mode)
- **Tailwind CSS** with custom design tokens
- **HeroUI** for base components
- **Mantine** for date pickers and advanced components
- **Framer Motion** for animations
- **Lucide React** for icons

### Backend & Database
- **Supabase** for authentication and database
- **PostgreSQL** for data storage
- **Row Level Security** for data protection

### Form Handling & Validation
- **TanStack Form** for form state management
- **Zod** for schema validation
- **@tanstack/zod-form-adapter** for integration

### Development Tools
- **ESLint** for code linting
- **Prettier** for code formatting
- **TypeScript** for type checking

## 🎨 Design System

### Colors
- **Primary**: #4362FF
- **Secondary**: #7530FF
- **Accent**: #039855
- **Background**: #FFFFFF

### Typography
- **Headings**: Playfair Display
- **Body**: Lato
- **Scale**: 8px spacing system

### Components
- Custom button variants (primary, secondary, accent, outline, ghost)
- Responsive card components
- Modal system with accessibility
- Form field components with validation
- Date range picker integration

## 📁 Project Structure

```
src/
├── app/                    # Next.js App Router pages
│   ├── auth/              # Authentication pages
│   ├── search/            # Property search
│   ├── listing/           # Property details
│   ├── booking/           # Booking flow
│   └── account/           # User account pages
├── components/            # Reusable components
│   ├── ui/               # Base UI components
│   ├── forms/            # Form components
│   └── sections/         # Page sections
├── lib/                  # Utilities and configurations
│   ├── supabase.ts       # Supabase client
│   ├── providers.tsx     # React providers
│   ├── validations.ts    # Zod schemas
│   └── mantine-provider.tsx
├── styles/               # Global styles
├── types/                # TypeScript type definitions
└── utils/                # Utility functions
```

## 🚀 Getting Started

### Prerequisites
- Node.js 18+ 
- npm or yarn
- Supabase account

### Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd expajo
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Set up environment variables**
   Create a `.env.local` file in the root directory:
   ```env
   NEXT_PUBLIC_SUPABASE_URL=your_supabase_url_here
   NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key_here
   ```

4. **Set up Supabase**
   - Create a new Supabase project
   - Run the database migrations (see Database Setup section)
   - Copy your project URL and anon key to the environment variables

5. **Run the development server**
   ```bash
   npm run dev
   ```

6. **Open your browser**
   Navigate to [http://localhost:3000](http://localhost:3000)

## 🗄️ Database Setup

### Required Tables

1. **users** - User profiles
2. **listings** - Property listings
3. **bookings** - User bookings
4. **reviews** - Property reviews

### Supabase SQL


## 🧪 Testing

### Running Tests
```bash
# Run all tests
npm test

# Run tests in watch mode
npm run test:watch

# Run type checking
npm run type-check

# Run linting
npm run lint
```

## 📱 Pages & Features

### Public Pages
- **Home** (`/`) - Landing page with hero, categories, featured listings
- **Search** (`/search`) - Property search with filters
- **Listing Detail** (`/listing/[id]`) - Individual property details
- **Login** (`/auth/login`) - User authentication
- **Register** (`/auth/register`) - User registration

### Protected Pages
- **Account** (`/account`) - User dashboard
- **Bookings** (`/account/bookings`) - User's booking history
- **Profile** (`/account/profile`) - User profile management

## 🎯 Key Features Implementation

### Search & Filtering
- Location-based search
- Date range selection
- Guest count filtering
- Price range filtering
- Real-time results

### Booking Flow
- Date selection with availability
- Guest count validation
- Price calculation
- Booking confirmation
- Email notifications

### User Management
- Secure authentication
- Profile management
- Booking history
- Review system

## 🚀 Deployment

### Vercel (Recommended)
1. Connect your GitHub repository to Vercel
2. Set environment variables in Vercel dashboard
3. Deploy automatically on push to main branch

### Other Platforms
- **Netlify**: Use `npm run build` and deploy the `out` folder
- **Railway**: Connect GitHub and deploy with automatic builds
- **DigitalOcean**: Use App Platform for easy deployment

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- [Next.js](https://nextjs.org/) for the amazing React framework
- [Supabase](https://supabase.com/) for the backend infrastructure
- [Tailwind CSS](https://tailwindcss.com/) for the utility-first CSS framework
- [HeroUI](https://heroui.com/) for the component library
- [Mantine](https://mantine.dev/) for additional components
- [Framer Motion](https://www.framer.com/motion/) for animations

## 📞 Support

If you have any questions or need help, please:
- Open an issue on GitHub
- Check the documentation
- Contact the development team

---

Built with ❤️ by the Expajo Team