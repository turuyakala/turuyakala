import Logo from './Logo';
import AuthButtons from './AuthButtons';

export default function Navigation() {
  return (
    <nav className="bg-white text-black shadow-lg">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-20 md:h-24">
          <div className="flex items-center h-full overflow-hidden">
            <Logo />
          </div>
          <div className="flex items-center space-x-4">
            {/* Telefon Numarası */}
            <div className="hidden md:flex items-center px-4 py-2 bg-[#1A2A5A]/70 rounded-full">
              <span className="text-sm font-medium text-white">
                Bize ulaşın: +90 543 629 41 26
              </span>
            </div>
            <AuthButtons />
          </div>
        </div>
      </div>
    </nav>
  );
}

