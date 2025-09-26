import { Layout } from '@/components/layout/Layout';

export default function DestinationsPage() {
  return (
    <Layout>
      <div className="min-h-screen bg-gray-50">
        <div className="container mx-auto px-4 py-16">
          <div className="text-center mb-12">
            <h1 className="text-4xl font-playfair font-bold text-gray-900 mb-4">
              Popular Destinations
            </h1>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              Discover amazing places to stay and explore around the world
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {/* Placeholder destination cards */}
            {Array.from({ length: 6 }).map((_, index) => (
              <div key={index} className="bg-white rounded-lg shadow-md overflow-hidden">
                <div className="h-48 bg-gradient-to-br from-primary/20 to-secondary/20"></div>
                <div className="p-6">
                  <h3 className="text-xl font-semibold text-gray-900 mb-2">
                    Destination {index + 1}
                  </h3>
                  <p className="text-gray-600 mb-4">
                    Discover amazing experiences in this beautiful destination.
                  </p>
                  <button className="text-primary hover:text-secondary transition-colors duration-200 font-medium">
                    Explore →
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </Layout>
  );
}
