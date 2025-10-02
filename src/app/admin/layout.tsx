import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Admin Dashboard | Expajo',
  description: 'Admin dashboard for managing Expajo travel platform',
  robots: 'noindex, nofollow', // Prevent indexing of admin pages
};

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen bg-gray-50">
      {children}
    </div>
  );
}
