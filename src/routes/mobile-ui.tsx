import React, { useState, useEffect } from 'react';
import { 
  Phone,
  Battery,
  Wifi,
  Signal,
  Bluetooth,
  VolumeX,
  Volume2,
  Sun,
  Moon,
  Camera,
  MessageCircle,
  Mail,
  Calendar,
  Music,
  Map,
  Settings,
  User,
  Heart,
  Star,
  Share,
  Download,
  Play,
  Pause,
  SkipBack,
  SkipForward,
  Home,
  Search,
  ShoppingBag,
  CreditCard,
  Bell,
  Filter,
  Grid3X3,
  List,
  Plus,
  Minus,
  Edit,
  Trash2,
  MoreHorizontal,
  ChevronLeft,
  ChevronRight,
  ChevronDown,
  Check,
  X,
  Lock,
  Unlock,
  Eye,
  EyeOff,
  Zap,
  Target,
  Sparkles
} from 'lucide-react';
import { PageTitleEditorial } from '../components/PageTitles.tsx';

const MobileUIRoute: React.FC = () => {
  const [currentTime, setCurrentTime] = useState(new Date());
  const [battery, setBattery] = useState(87);
  const [isDarkMode, setIsDarkMode] = useState(true);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentSong, setCurrentSong] = useState(0);
  const [volume, setVolume] = useState(65);
  const [notifications, setNotifications] = useState(3);

  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  // Mock data
  const songs = [
    { title: "Neon Dreams", artist: "Synthwave Collective", duration: "3:42" },
    { title: "Digital Horizon", artist: "Cyber Beats", duration: "4:15" },
    { title: "Virtual Reality", artist: "Future Bass", duration: "3:28" }
  ];

  const notifications_data = [
    { app: "Messages", text: "Hey! How's the project going?", time: "2m ago", color: "bg-blue-500" },
    { app: "Calendar", text: "Meeting in 30 minutes", time: "5m ago", color: "bg-red-500" },
    { app: "Email", text: "New message from team", time: "1h ago", color: "bg-green-500" }
  ];

  // iPhone Frame Component
  const PhoneFrame = ({ children, title }: { children: React.ReactNode; title: string }) => (
    <div className="relative mx-auto">
      {/* Phone outer frame */}
      <div className="relative bg-zinc-900 p-2 rounded-[2.5rem] shadow-2xl border-4 border-zinc-800">
        {/* Screen */}
        <div className="bg-black rounded-[2rem] overflow-hidden h-[600px] w-[320px]">
          {/* Status bar */}
          <div className="bg-black px-6 py-2 flex items-center justify-between text-white text-sm">
            <span className="font-medium">{currentTime.toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}</span>
            <div className="flex items-center gap-1">
              <Signal className="w-4 h-4" />
              <Wifi className="w-4 h-4" />
              <Battery className="w-4 h-4" />
              <span className="text-xs">{battery}%</span>
            </div>
          </div>
          
          {/* Content */}
          <div className={`flex-1 h-[550px] overflow-hidden ${isDarkMode ? 'bg-zinc-900' : 'bg-white'}`}>
            {children}
          </div>
        </div>
        
        {/* Home indicator */}
        <div className="absolute bottom-2 left-1/2 transform -translate-x-1/2 w-32 h-1 bg-zinc-600 rounded-full"></div>
      </div>
      
      {/* Title */}
      <div className="text-center mt-4">
        <h3 className="text-lg font-bold text-white">{title}</h3>
      </div>
    </div>
  );

  // Home Screen
  const HomeScreen = () => (
    <div className="p-6 h-full" style={{ 
      background: isDarkMode 
        ? 'linear-gradient(135deg, #1a1a2e 0%, #16213e 50%, #0f3460 100%)'
        : 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)'
    }}>
      {/* Greeting */}
      <div className="mb-8">
        <h1 className={`text-2xl font-bold ${isDarkMode ? 'text-white' : 'text-white'}`}>
          Good Evening
        </h1>
        <p className={`${isDarkMode ? 'text-zinc-400' : 'text-white/80'}`}>
          Welcome back, Alex
        </p>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-2 gap-4 mb-8">
        <div className={`p-4 rounded-2xl ${isDarkMode ? 'bg-white/10' : 'bg-white/20'} backdrop-blur-lg`}>
          <div className="flex items-center gap-3">
            <div className="p-2 bg-cyan-500 rounded-xl">
              <Zap className="w-5 h-5 text-white" />
            </div>
            <div>
              <p className={`text-sm ${isDarkMode ? 'text-zinc-400' : 'text-white/80'}`}>Tasks</p>
              <p className={`text-lg font-bold ${isDarkMode ? 'text-white' : 'text-white'}`}>12</p>
            </div>
          </div>
        </div>

        <div className={`p-4 rounded-2xl ${isDarkMode ? 'bg-white/10' : 'bg-white/20'} backdrop-blur-lg`}>
          <div className="flex items-center gap-3">
            <div className="p-2 bg-purple-500 rounded-xl">
              <Target className="w-5 h-5 text-white" />
            </div>
            <div>
              <p className={`text-sm ${isDarkMode ? 'text-zinc-400' : 'text-white/80'}`}>Goals</p>
              <p className={`text-lg font-bold ${isDarkMode ? 'text-white' : 'text-white'}`}>8/10</p>
            </div>
          </div>
        </div>
      </div>

      {/* App Grid */}
      <div className="grid grid-cols-4 gap-6">
        {[
          { icon: MessageCircle, name: "Messages", color: "bg-blue-500" },
          { icon: Camera, name: "Camera", color: "bg-zinc-700" },
          { icon: Music, name: "Music", color: "bg-pink-500" },
          { icon: Map, name: "Maps", color: "bg-green-500" },
          { icon: Mail, name: "Mail", color: "bg-blue-600" },
          { icon: Calendar, name: "Calendar", color: "bg-red-500" },
          { icon: ShoppingBag, name: "Shop", color: "bg-orange-500" },
          { icon: Settings, name: "Settings", color: "bg-zinc-600" }
        ].map((app, i) => (
          <div key={i} className="flex flex-col items-center gap-2">
            <div className={`p-3 ${app.color} rounded-2xl shadow-lg`}>
              <app.icon className="w-6 h-6 text-white" />
            </div>
            <span className={`text-xs ${isDarkMode ? 'text-white' : 'text-white'}`}>
              {app.name}
            </span>
          </div>
        ))}
      </div>
    </div>
  );

  // Music Player
  const MusicPlayer = () => (
    <div className={`p-6 h-full ${isDarkMode ? 'bg-gradient-to-b from-purple-900 to-black' : 'bg-gradient-to-b from-purple-400 to-pink-400'}`}>
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <ChevronLeft className={`w-6 h-6 ${isDarkMode ? 'text-white' : 'text-white'}`} />
        <h2 className={`text-lg font-semibold ${isDarkMode ? 'text-white' : 'text-white'}`}>Now Playing</h2>
        <MoreHorizontal className={`w-6 h-6 ${isDarkMode ? 'text-white' : 'text-white'}`} />
      </div>

      {/* Album Art */}
      <div className="flex justify-center mb-8">
        <div className="w-48 h-48 bg-gradient-to-br from-cyan-400 to-purple-600 rounded-3xl shadow-2xl flex items-center justify-center">
          <Music className="w-24 h-24 text-white/80" />
        </div>
      </div>

      {/* Song Info */}
      <div className="text-center mb-8">
        <h3 className={`text-xl font-bold ${isDarkMode ? 'text-white' : 'text-white'} mb-2`}>
          {songs[currentSong].title}
        </h3>
        <p className={`${isDarkMode ? 'text-zinc-400' : 'text-white/80'}`}>
          {songs[currentSong].artist}
        </p>
      </div>

      {/* Progress Bar */}
      <div className="mb-8">
        <div className="flex justify-between text-sm text-zinc-400 mb-2">
          <span>1:23</span>
          <span>{songs[currentSong].duration}</span>
        </div>
        <div className={`h-1 ${isDarkMode ? 'bg-zinc-700' : 'bg-white/30'} rounded-full overflow-hidden`}>
          <div className="h-full w-1/3 bg-white rounded-full"></div>
        </div>
      </div>

      {/* Controls */}
      <div className="flex items-center justify-center gap-8">
        <SkipBack className={`w-8 h-8 ${isDarkMode ? 'text-white' : 'text-white'}`} />
        <button 
          onClick={() => setIsPlaying(!isPlaying)}
          className="p-4 bg-white rounded-full shadow-lg"
        >
          {isPlaying ? 
            <Pause className="w-8 h-8 text-black" /> : 
            <Play className="w-8 h-8 text-black" />
          }
        </button>
        <SkipForward className={`w-8 h-8 ${isDarkMode ? 'text-white' : 'text-white'}`} />
      </div>

      {/* Volume */}
      <div className="mt-8 flex items-center gap-4">
        <VolumeX className={`w-5 h-5 ${isDarkMode ? 'text-zinc-400' : 'text-white/80'}`} />
        <div className="flex-1 h-1 bg-zinc-700 rounded-full overflow-hidden">
          <div 
            className="h-full bg-white rounded-full transition-all duration-300"
            style={{ width: `${volume}%` }}
          ></div>
        </div>
        <Volume2 className={`w-5 h-5 ${isDarkMode ? 'text-zinc-400' : 'text-white/80'}`} />
      </div>
    </div>
  );

  // Notifications
  const NotificationCenter = () => (
    <div className={`p-6 h-full ${isDarkMode ? 'bg-zinc-900' : 'bg-zinc-100'}`}>
      <div className="flex items-center justify-between mb-6">
        <h2 className={`text-xl font-bold ${isDarkMode ? 'text-white' : 'text-black'}`}>
          Notifications
        </h2>
        <span className={`text-sm ${isDarkMode ? 'text-zinc-400' : 'text-zinc-600'}`}>
          Clear All
        </span>
      </div>

      <div className="space-y-4">
        {notifications_data.map((notif, i) => (
          <div 
            key={i} 
            className={`p-4 rounded-2xl ${isDarkMode ? 'bg-zinc-800' : 'bg-white'} shadow-sm`}
          >
            <div className="flex items-start gap-3">
              <div className={`w-3 h-3 ${notif.color} rounded-full mt-2`}></div>
              <div className="flex-1">
                <div className="flex items-center justify-between mb-1">
                  <span className={`font-semibold ${isDarkMode ? 'text-white' : 'text-black'}`}>
                    {notif.app}
                  </span>
                  <span className={`text-xs ${isDarkMode ? 'text-zinc-400' : 'text-zinc-600'}`}>
                    {notif.time}
                  </span>
                </div>
                <p className={`text-sm ${isDarkMode ? 'text-zinc-300' : 'text-zinc-700'}`}>
                  {notif.text}
                </p>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Quick Actions */}
      <div className="mt-8">
        <h3 className={`text-lg font-semibold ${isDarkMode ? 'text-white' : 'text-black'} mb-4`}>
          Quick Actions
        </h3>
        <div className="grid grid-cols-2 gap-4">
          <button className={`p-4 rounded-2xl ${isDarkMode ? 'bg-zinc-800' : 'bg-white'} shadow-sm flex items-center gap-3`}>
            <div className="p-2 bg-blue-500 rounded-xl">
              <Wifi className="w-5 h-5 text-white" />
            </div>
            <span className={`font-medium ${isDarkMode ? 'text-white' : 'text-black'}`}>WiFi</span>
          </button>
          
          <button 
            onClick={() => setIsDarkMode(!isDarkMode)}
            className={`p-4 rounded-2xl ${isDarkMode ? 'bg-zinc-800' : 'bg-white'} shadow-sm flex items-center gap-3`}
          >
            <div className="p-2 bg-yellow-500 rounded-xl">
              {isDarkMode ? <Sun className="w-5 h-5 text-white" /> : <Moon className="w-5 h-5 text-white" />}
            </div>
            <span className={`font-medium ${isDarkMode ? 'text-white' : 'text-black'}`}>
              {isDarkMode ? 'Light' : 'Dark'}
            </span>
          </button>
        </div>
      </div>
    </div>
  );

  // Chat Interface
  const ChatInterface = () => {
    const messages = [
      { text: "Hey! How's the new project going?", sent: false, time: "2:30 PM" },
      { text: "Going great! Just finished the UI mockups", sent: true, time: "2:32 PM" },
      { text: "That's awesome! Can't wait to see them", sent: false, time: "2:33 PM" },
      { text: "I'll send them over in a bit 🚀", sent: true, time: "2:35 PM" }
    ];

    return (
      <div className={`h-full flex flex-col ${isDarkMode ? 'bg-zinc-900' : 'bg-white'}`}>
        {/* Chat Header */}
        <div className={`p-4 border-b ${isDarkMode ? 'border-zinc-800 bg-zinc-800' : 'border-zinc-200 bg-white'} flex items-center gap-3`}>
          <ChevronLeft className={`w-6 h-6 ${isDarkMode ? 'text-white' : 'text-black'}`} />
          <div className="w-10 h-10 bg-gradient-to-br from-purple-500 to-pink-500 rounded-full flex items-center justify-center">
            <User className="w-6 h-6 text-white" />
          </div>
          <div className="flex-1">
            <h3 className={`font-semibold ${isDarkMode ? 'text-white' : 'text-black'}`}>Sarah Wilson</h3>
            <p className={`text-sm ${isDarkMode ? 'text-green-400' : 'text-green-600'}`}>Online</p>
          </div>
        </div>

        {/* Messages */}
        <div className="flex-1 p-4 space-y-4 overflow-y-auto">
          {messages.map((msg, i) => (
            <div key={i} className={`flex ${msg.sent ? 'justify-end' : 'justify-start'}`}>
              <div className={`max-w-xs p-3 rounded-2xl ${
                msg.sent 
                  ? 'bg-blue-500 text-white' 
                  : isDarkMode ? 'bg-zinc-800 text-white' : 'bg-zinc-200 text-black'
              }`}>
                <p className="text-sm">{msg.text}</p>
                <p className={`text-xs mt-1 ${
                  msg.sent ? 'text-blue-200' : isDarkMode ? 'text-zinc-400' : 'text-zinc-600'
                }`}>
                  {msg.time}
                </p>
              </div>
            </div>
          ))}
        </div>

        {/* Input */}
        <div className={`p-4 border-t ${isDarkMode ? 'border-zinc-800 bg-zinc-800' : 'border-zinc-200 bg-white'}`}>
          <div className="flex items-center gap-3">
            <div className={`flex-1 p-3 rounded-full ${isDarkMode ? 'bg-zinc-700' : 'bg-zinc-100'}`}>
              <input 
                type="text" 
                placeholder="Type a message..."
                className={`w-full bg-transparent ${isDarkMode ? 'text-white placeholder-zinc-400' : 'text-black placeholder-zinc-600'} outline-none`}
              />
            </div>
            <button className="p-3 bg-blue-500 rounded-full">
              <MessageCircle className="w-5 h-5 text-white" />
            </button>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="p-6 space-y-8 bg-gradient-to-br from-zinc-900 via-black to-zinc-900 min-h-screen">
      <PageTitleEditorial
        eyebrow="Mobile Interface"
        title="Mobile App UI Showcase"
        subtitle="Modern mobile interfaces with smooth animations and interactions"
      />

      {/* Phone Showcases */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-8">
        <PhoneFrame title="Home Screen">
          <HomeScreen />
        </PhoneFrame>

        <PhoneFrame title="Music Player">
          <MusicPlayer />
        </PhoneFrame>

        <PhoneFrame title="Notifications">
          <NotificationCenter />
        </PhoneFrame>

        <PhoneFrame title="Chat Interface">
          <ChatInterface />
        </PhoneFrame>
      </div>

      {/* Controls */}
      <div className="flex justify-center gap-4">
        <button
          onClick={() => setIsDarkMode(!isDarkMode)}
          className={`px-6 py-3 rounded-xl border-2 transition-all duration-300 ${
            isDarkMode
              ? 'border-yellow-500 bg-yellow-500/20 text-yellow-400 hover:bg-yellow-500/30'
              : 'border-purple-500 bg-purple-500/20 text-purple-400 hover:bg-purple-500/30'
          }`}
        >
          {isDarkMode ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
        </button>
        
        <button
          onClick={() => setBattery(Math.floor(Math.random() * 100))}
          className="px-6 py-3 rounded-xl border-2 border-green-500 bg-green-500/20 text-green-400 hover:bg-green-500/30 transition-all duration-300"
        >
          Randomize Battery
        </button>
      </div>
    </div>
  );
};

export default MobileUIRoute;
