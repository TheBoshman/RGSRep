import { FaCube } from "react-icons/fa";
import { Link } from "wouter";

export default function Header() {
  return (
    <header className="bg-white shadow-md">
      <div className="container mx-auto px-4 py-4 flex flex-col sm:flex-row justify-between items-center">
        <div className="flex items-center mb-4 sm:mb-0">
          <FaCube className="text-[#0D72EF] text-3xl mr-3" />
          <h1 className="text-xl sm:text-2xl font-bold text-[#232527]">Roblox Game Stats Explorer</h1>
        </div>
        <nav>
          <ul className="flex space-x-6">
            <li>
              <Link href="/" className="text-[#0D72EF] hover:text-[#00A2FF] transition-colors font-medium">
                Home
              </Link>
            </li>
            <li>
              <a href="#" className="text-[#393B3D] hover:text-[#0D72EF] transition-colors font-medium">About</a>
            </li>
            <li>
              <a href="#" className="text-[#393B3D] hover:text-[#0D72EF] transition-colors font-medium">Help</a>
            </li>
          </ul>
        </nav>
      </div>
    </header>
  );
}
