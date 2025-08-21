import { Outlet } from 'react-router-dom';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import { Toaster } from 'react-hot-toast';

const MainLayout = () => {
  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      <header className="sticky top-0 z-50 w-full bg-white shadow-sm">
        <Navbar />
      </header>
      
      <main className="flex-grow w-full">
        <div className="mx-auto w-full max-w-7xl px-4 sm:px-6 lg:px-8 py-6">
          <Outlet />
        </div>
      </main>
      
      <footer className="bg-white border-t border-gray-200">
        <Footer />
      </footer>
      
      <Toaster 
        position="top-center"
        toastOptions={{
          duration: 4000,
          style: {
            maxWidth: '100%',
            padding: '16px',
            margin: '8px',
            borderRadius: '8px',
          },
        }}
      />
    </div>
  );
};

export default MainLayout;
