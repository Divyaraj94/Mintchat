import { useAuth } from '../context/AuthContext';

export default function TopNav({ title }) {
  const { user } = useAuth();

  return (
    <header className="h-16 px-4 flex items-center justify-between bg-gemini-bg absolute top-0 w-full z-20">
      
      {/* Left: Branding */}
      <div className="flex items-center space-x-2">
        <span className="text-[20px] font-medium text-gemini-textMain pl-2 select-none">MindChat</span>
      </div>

      {/* Right: Profile */}
      <div className="flex items-center pr-2">
        <div className="w-9 h-9 rounded-full bg-gradient-to-tr from-gemini-primary to-[#d96570] flex items-center justify-center cursor-pointer shadow-sm">
           <span className="text-white text-sm font-semibold">{user?.name ? user.name[0].toUpperCase() : 'D'}</span>
        </div>
      </div>
    </header>
  );
}
