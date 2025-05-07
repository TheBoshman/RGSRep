import { FaTwitter, FaDiscord, FaGithub } from "react-icons/fa";

export default function Footer() {
  return (
    <footer className="bg-white shadow-md mt-12 py-6">
      <div className="container mx-auto px-4">
        <div className="flex flex-col md:flex-row justify-between items-center">
          <div className="mb-4 md:mb-0">
            <p className="text-[#393B3D] text-sm">Roblox Game Stats Explorer is not affiliated with Roblox Corporation</p>
            <p className="text-[#393B3D] text-sm mt-1">© {new Date().getFullYear()} Game Stats Explorer</p>
          </div>
          <div className="flex space-x-6">
            <a href="#" className="text-[#393B3D] hover:text-[#0D72EF] transition-colors">
              <FaTwitter className="text-xl" />
            </a>
            <a href="#" className="text-[#393B3D] hover:text-[#0D72EF] transition-colors">
              <FaDiscord className="text-xl" />
            </a>
            <a href="#" className="text-[#393B3D] hover:text-[#0D72EF] transition-colors">
              <FaGithub className="text-xl" />
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
}
