import Sidebar from './Sidebar';
import Header from './Header';
import Footer from './Footer';

const Layout = ({ children }) => {
  return (
  <div className="min-h-screen bg-zinc-50 dark:bg-zinc-950 grid grid-cols-[64px_1fr]">
    {/* Sidebar */}
    <div>
      <Sidebar />
    </div>
    
    {/* Main Content Area */}
    <div className="flex flex-col">
      {/* Header */}
      <div className='h-16'>
        <Header />
      </div>
      
      {/* Page Content */}
      <div className="flex-1 p-6 bg-zinc-50 dark:bg-zinc-900">
        {children}
      </div>

      <Footer />
    </div>
  </div>
  );
};

export default Layout;