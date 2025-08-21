const Footer = () => {
  return (
    <footer className="bg-white border-t border-gray-200 mt-8">
      <div className="max-w-7xl mx-auto py-6 px-4 overflow-hidden sm:px-6 lg:px-8">
        <nav className="flex flex-wrap justify-center -mx-5 -my-2" aria-label="Footer">
          <div className="px-5 py-2">
            <span className="text-base text-gray-500">
              About
            </span>
          </div>
          <div className="px-5 py-2">
            <span className="text-base text-gray-500">
              Privacy
            </span>
          </div>
          <div className="px-5 py-2">
            <span className="text-base text-gray-500">
              Terms
            </span>
          </div>
          <div className="px-5 py-2">
            <span className="text-base text-gray-500">
              Contact
            </span>
          </div>
        </nav>
        <p className="mt-8 text-center text-base text-gray-400">
          &copy; {new Date().getFullYear()} Sanny Paul Blog App. All rights reserved.
        </p>
      </div>
    </footer>
  );
};

export default Footer;
