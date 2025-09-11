import React, { useState } from 'react';
import { 
  Sparkles, 
  Heart, 
  Star, 
  Zap, 
  Target,
  Users,
  Calendar,
  Coffee,
  Trophy,
  Flame,
  Shield,
  Brain,
  Rocket,
  Eye,
  Globe,
  Search,
  Mail,
  TrendingUp
} from 'lucide-react';
import { PageTitleEditorial, PageTitle, PageTitleGlow } from '../components/PageTitles.tsx';
import SweepHeader from '../components/SweepHeader.tsx';
import KpiCard from '../components/KpiCard.tsx';
import AppModal from '../components/Modal.tsx';
import * as Popover from '@radix-ui/react-popover';
import * as Tooltip from '@radix-ui/react-tooltip';
import * as Select from '@radix-ui/react-select';
import CommandPalette from '../components/CommandPalette.tsx';
import DateRangePicker from '../components/DateRangePicker.tsx';
import TransparentAuroraHeader from '../components/TransparentAuroraHeader.tsx';
import SampleSideMenu from '../components/SampleSideMenu.tsx';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';

// Button variations
const ButtonShowcase = () => (
  <div className="space-y-6">
    <div>
      <h3 className="text-lg font-semibold text-white mb-4">Primary Buttons</h3>
      <div className="flex flex-wrap gap-4">
          <button className="px-6 py-3 bg-cyan-500 text-black font-semibold rounded-lg hover:bg-cyan-400 transition-colors">
            Cyan Primary
          </button>
          <button className="px-6 py-3 bg-emerald-500 text-black font-semibold rounded-lg hover:bg-emerald-400 transition-colors">
            Emerald Primary
          </button>
          <button className="px-6 py-3 bg-purple-500 text-white font-semibold rounded-lg hover:bg-purple-400 transition-colors">
            Purple Primary
          </button>
          <button className="px-6 py-3 bg-amber-500 text-black font-semibold rounded-lg hover:bg-amber-400 transition-colors">
            Amber Primary
          </button>
        </div>
      </div>

      <div>
        <h3 className="text-lg font-semibold text-white mb-4">Outline Buttons</h3>
        <div className="flex flex-wrap gap-4">
          <button className="px-6 py-3 border-2 border-cyan-500 text-cyan-400 font-semibold rounded-lg hover:bg-cyan-500/10 transition-colors">
            Cyan Outline
          </button>
          <button className="px-6 py-3 border-2 border-emerald-500 text-emerald-400 font-semibold rounded-lg hover:bg-emerald-500/10 transition-colors">
            Emerald Outline
          </button>
          <button className="px-6 py-3 border-2 border-purple-500 text-purple-400 font-semibold rounded-lg hover:bg-purple-500/10 transition-colors">
            Purple Outline
          </button>
        </div>
      </div>

      <div>
        <h3 className="text-lg font-semibold text-white mb-4">Gradient Buttons</h3>
        <div className="flex flex-wrap gap-4">
          <button className="px-6 py-3 bg-gradient-to-r from-cyan-500 to-blue-500 text-white font-semibold rounded-lg hover:scale-105 transition-transform">
            Ocean Gradient
          </button>
          <button className="px-6 py-3 bg-gradient-to-r from-purple-500 to-pink-500 text-white font-semibold rounded-lg hover:scale-105 transition-transform">
            Sunset Gradient
          </button>
          <button className="px-6 py-3 bg-gradient-to-r from-emerald-500 to-teal-500 text-white font-semibold rounded-lg hover:scale-105 transition-transform">
            Forest Gradient
          </button>
        </div>
      </div>

      <div>
        <h3 className="text-lg font-semibold text-white mb-4">Icon Buttons</h3>
        <div className="flex flex-wrap gap-4">
          <button className="flex items-center gap-2 px-6 py-3 bg-red-500/20 border border-red-500/30 text-red-400 font-semibold rounded-lg hover:bg-red-500/30 transition-colors">
            <Rocket className="w-5 h-5" />
            Launch
          </button>
          <button className="flex items-center gap-2 px-6 py-3 bg-emerald-500/20 border border-emerald-500/30 text-emerald-400 font-semibold rounded-lg hover:bg-emerald-500/30 transition-colors">
            <Trophy className="w-5 h-5" />
            Achieve
          </button>
          <button className="flex items-center gap-2 px-6 py-3 bg-purple-500/20 border border-purple-500/30 text-purple-400 font-semibold rounded-lg hover:bg-purple-500/30 transition-colors">
            <Sparkles className="w-5 h-5" />
            Magic
          </button>
          <button className="flex items-center gap-2 px-6 py-3 bg-blue-500/20 border border-blue-500/30 text-blue-400 font-semibold rounded-lg hover:bg-blue-500/30 transition-colors">
            <Search className="w-5 h-5" />
            Search
          </button>
          <button className="flex items-center gap-2 px-6 py-3 bg-amber-500/20 border border-amber-500/30 text-amber-400 font-semibold rounded-lg hover:bg-amber-500/30 transition-colors">
            <Star className="w-5 h-5" />
            Favorite
          </button>
        </div>
      </div>

      <div>
        <h3 className="text-lg font-semibold text-white mb-4">Glass Buttons</h3>
        <div className="flex flex-wrap gap-4">
          <button className="px-6 py-3 rounded-lg backdrop-blur-sm bg-white/10 border border-white/20 text-white font-semibold hover:bg-white/20 transition-all hover:scale-105">
            Glass Effect
          </button>
          <button className="px-6 py-3 rounded-lg backdrop-blur-sm bg-cyan-500/20 border border-cyan-400/30 text-cyan-300 font-semibold hover:bg-cyan-500/30 transition-all hover:scale-105">
            Cyan Glass
          </button>
          <button className="px-6 py-3 rounded-lg backdrop-blur-sm bg-purple-500/20 border border-purple-400/30 text-purple-300 font-semibold hover:bg-purple-500/30 transition-all hover:scale-105">
            Purple Glass
          </button>
          <button className="px-6 py-3 rounded-lg backdrop-blur-sm bg-emerald-500/20 border border-emerald-400/30 text-emerald-300 font-semibold hover:bg-emerald-500/30 transition-all hover:scale-105">
            Emerald Glass
          </button>
        </div>
      </div>

      <div>
        <h3 className="text-lg font-semibold text-white mb-4">Size Variations</h3>
        <div className="flex flex-wrap items-center gap-4">
          <button className="px-3 py-1.5 text-xs bg-cyan-500 text-black font-semibold rounded-md hover:bg-cyan-400 transition-colors">
            Small
          </button>
          <button className="px-4 py-2 text-sm bg-cyan-500 text-black font-semibold rounded-lg hover:bg-cyan-400 transition-colors">
            Medium
          </button>
          <button className="px-6 py-3 bg-cyan-500 text-black font-semibold rounded-lg hover:bg-cyan-400 transition-colors">
            Large
          </button>
          <button className="px-8 py-4 text-lg bg-cyan-500 text-black font-semibold rounded-xl hover:bg-cyan-400 transition-colors">
            Extra Large
          </button>
        </div>
      </div>

      <div>
        <h3 className="text-lg font-semibold text-white mb-4">Floating Action Buttons</h3>
        <div className="flex flex-wrap gap-4">
          <button className="w-12 h-12 rounded-full bg-cyan-500 text-black hover:bg-cyan-400 transition-all hover:scale-110 shadow-lg flex items-center justify-center">
            <Target className="w-5 h-5" />
          </button>
          <button className="w-14 h-14 rounded-full bg-gradient-to-r from-purple-500 to-pink-500 text-white hover:scale-110 transition-all shadow-xl flex items-center justify-center">
            <Heart className="w-6 h-6" />
          </button>
          <button className="w-16 h-16 rounded-full bg-gradient-to-r from-emerald-500 to-teal-500 text-white hover:scale-110 transition-all shadow-2xl flex items-center justify-center">
            <Zap className="w-7 h-7" />
          </button>
        </div>
      </div>

      <div>
        <h3 className="text-lg font-semibold text-white mb-4">Loading States</h3>
        <div className="flex flex-wrap gap-4">
          <button className="flex items-center gap-2 px-6 py-3 bg-zinc-600 text-zinc-300 font-semibold rounded-lg cursor-not-allowed">
            <div className="w-4 h-4 border-2 border-zinc-400 border-t-transparent rounded-full animate-spin"></div>
            Loading...
          </button>
          <button className="flex items-center gap-2 px-6 py-3 bg-emerald-500/20 border border-emerald-500/30 text-emerald-400 font-semibold rounded-lg">
            <div className="w-2 h-2 bg-emerald-400 rounded-full animate-pulse"></div>
            Processing
          </button>
          <button className="px-6 py-3 bg-cyan-500 text-black font-semibold rounded-lg hover:bg-cyan-400 transition-colors disabled:opacity-50 disabled:cursor-not-allowed" disabled>
            Disabled
          </button>
        </div>
      </div>

      <div>
        <h3 className="text-lg font-semibold text-white mb-4">Special Effects</h3>
        <div className="flex flex-wrap gap-4">
          <button className="px-6 py-3 bg-gradient-to-r from-pink-500 via-purple-500 to-indigo-500 text-white font-semibold rounded-lg hover:scale-105 transition-all relative overflow-hidden group">
            <span className="relative z-10">Rainbow</span>
            <div className="absolute inset-0 bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 opacity-0 group-hover:opacity-100 transition-opacity"></div>
          </button>
          <button className="px-6 py-3 bg-black border-2 border-yellow-400 text-yellow-400 font-semibold rounded-lg hover:bg-yellow-400 hover:text-black transition-all hover:shadow-[0_0_20px_rgba(250,204,21,0.5)]">
            Neon Glow
          </button>
          <button className="px-6 py-3 bg-gradient-to-r from-red-600 to-orange-500 text-white font-semibold rounded-lg relative overflow-hidden group">
            <span className="relative z-10">Fire</span>
            <div className="absolute inset-0 bg-gradient-to-r from-orange-500 to-yellow-500 translate-x-full group-hover:translate-x-0 transition-transform duration-300"></div>
          </button>
          <button className="px-6 py-3 bg-gradient-to-r from-blue-600 via-cyan-500 to-teal-400 text-white font-semibold rounded-lg hover:animate-pulse">
            Ocean Wave
          </button>
        </div>
      </div>
    </div>
  );

  // Badge variations
  export const BadgeShowcase = () => (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-semibold text-white mb-4">Status Badges</h3>
        <div className="flex flex-wrap gap-3">
          <span className="px-3 py-1 bg-emerald-500/20 border border-emerald-500/30 text-emerald-400 text-sm font-medium rounded-full">
            Active
          </span>
          <span className="px-3 py-1 bg-amber-500/20 border border-amber-500/30 text-amber-400 text-sm font-medium rounded-full">
            Pending
          </span>
          <span className="px-3 py-1 bg-red-500/20 border border-red-500/30 text-red-400 text-sm font-medium rounded-full">
            Error
          </span>
          <span className="px-3 py-1 bg-blue-500/20 border border-blue-500/30 text-blue-400 text-sm font-medium rounded-full">
            Processing
          </span>
          <span className="px-3 py-1 bg-purple-500/20 border border-purple-500/30 text-purple-400 text-sm font-medium rounded-full">
            Review
          </span>
          <span className="px-3 py-1 bg-cyan-500/20 border border-cyan-500/30 text-cyan-400 text-sm font-medium rounded-full">
            Draft
          </span>
          <span className="px-3 py-1 bg-zinc-500/20 border border-zinc-500/30 text-zinc-400 text-sm font-medium rounded-full">
            Archived
          </span>
        </div>
      </div>

      <div>
        <h3 className="text-lg font-semibold text-white mb-4">Priority Badges</h3>
        <div className="flex flex-wrap gap-3">
          <span className="px-3 py-1 bg-red-500 text-white text-sm font-bold rounded-full">
            HIGH
          </span>
          <span className="px-3 py-1 bg-amber-500 text-black text-sm font-bold rounded-full">
            MEDIUM
          </span>
          <span className="px-3 py-1 bg-emerald-500 text-black text-sm font-bold rounded-full">
            LOW
          </span>
          <span className="px-3 py-1 bg-purple-500 text-white text-sm font-bold rounded-full">
            URGENT
          </span>
          <span className="px-3 py-1 bg-blue-500 text-white text-sm font-bold rounded-full">
            NORMAL
          </span>
        </div>
      </div>

      <div>
        <h3 className="text-lg font-semibold text-white mb-4">Icon Badges</h3>
        <div className="flex flex-wrap gap-3">
          <span className="flex items-center gap-1 px-3 py-1 bg-purple-500/20 border border-purple-500/30 text-purple-400 text-sm font-medium rounded-full">
            <Brain className="w-4 h-4" />
            AI
          </span>
          <span className="flex items-center gap-1 px-3 py-1 bg-cyan-500/20 border border-cyan-500/30 text-cyan-400 text-sm font-medium rounded-full">
            <Shield className="w-4 h-4" />
            Secure
          </span>
          <span className="flex items-center gap-1 px-3 py-1 bg-emerald-500/20 border border-emerald-500/30 text-emerald-400 text-sm font-medium rounded-full">
            <Zap className="w-4 h-4" />
            Fast
          </span>
          <span className="flex items-center gap-1 px-3 py-1 bg-amber-500/20 border border-amber-500/30 text-amber-400 text-sm font-medium rounded-full">
            <Star className="w-4 h-4" />
            Featured
          </span>
          <span className="flex items-center gap-1 px-3 py-1 bg-red-500/20 border border-red-500/30 text-red-400 text-sm font-medium rounded-full">
            <Flame className="w-4 h-4" />
            Hot
          </span>
          <span className="flex items-center gap-1 px-3 py-1 bg-blue-500/20 border border-blue-500/30 text-blue-400 text-sm font-medium rounded-full">
            <Globe className="w-4 h-4" />
            Global
          </span>
        </div>
      </div>

      <div>
        <h3 className="text-lg font-semibold text-white mb-4">Notification Badges</h3>
        <div className="flex flex-wrap gap-6 items-center">
          <div className="relative">
            <Mail className="w-6 h-6 text-zinc-400" />
            <span className="absolute -top-2 -right-2 w-5 h-5 bg-red-500 text-white text-xs rounded-full flex items-center justify-center">3</span>
          </div>
          <div className="relative">
            <Users className="w-6 h-6 text-zinc-400" />
            <span className="absolute -top-2 -right-2 w-5 h-5 bg-emerald-500 text-white text-xs rounded-full flex items-center justify-center">12</span>
          </div>
          <div className="relative">
            <Calendar className="w-6 h-6 text-zinc-400" />
            <span className="absolute -top-1 -right-1 w-3 h-3 bg-amber-500 rounded-full"></span>
          </div>
          <div className="relative">
            <Trophy className="w-6 h-6 text-zinc-400" />
            <span className="absolute -top-2 -right-2 px-1.5 py-0.5 bg-purple-500 text-white text-xs rounded-full">NEW</span>
          </div>
        </div>
      </div>

      <div>
        <h3 className="text-lg font-semibold text-white mb-4">Size Variations</h3>
        <div className="flex flex-wrap items-center gap-3">
          <span className="px-2 py-0.5 bg-cyan-500/20 border border-cyan-500/30 text-cyan-400 text-xs font-medium rounded-full">
            XS
          </span>
          <span className="px-2.5 py-1 bg-cyan-500/20 border border-cyan-500/30 text-cyan-400 text-sm font-medium rounded-full">
            Small
          </span>
          <span className="px-3 py-1.5 bg-cyan-500/20 border border-cyan-500/30 text-cyan-400 text-base font-medium rounded-full">
            Medium
          </span>
          <span className="px-4 py-2 bg-cyan-500/20 border border-cyan-500/30 text-cyan-400 text-lg font-medium rounded-full">
            Large
          </span>
        </div>
      </div>

      <div>
        <h3 className="text-lg font-semibold text-white mb-4">Gradient Badges</h3>
        <div className="flex flex-wrap gap-3">
          <span className="px-3 py-1 bg-gradient-to-r from-pink-500 to-purple-500 text-white text-sm font-medium rounded-full">
            Premium
          </span>
          <span className="px-3 py-1 bg-gradient-to-r from-cyan-500 to-blue-500 text-white text-sm font-medium rounded-full">
            Pro
          </span>
          <span className="px-3 py-1 bg-gradient-to-r from-emerald-500 to-teal-500 text-white text-sm font-medium rounded-full">
            Success
          </span>
          <span className="px-3 py-1 bg-gradient-to-r from-orange-500 to-red-500 text-white text-sm font-medium rounded-full">
            Alert
          </span>
          <span className="px-3 py-1 bg-gradient-to-r from-yellow-400 to-amber-500 text-black text-sm font-medium rounded-full">
            Warning
          </span>
        </div>
      </div>

      <div>
        <h3 className="text-lg font-semibold text-white mb-4">Animated Badges</h3>
        <div className="flex flex-wrap gap-3">
          <span className="flex items-center gap-1 px-3 py-1 bg-emerald-500/20 border border-emerald-500/30 text-emerald-400 text-sm font-medium rounded-full">
            <div className="w-2 h-2 bg-emerald-400 rounded-full animate-pulse"></div>
            Live
          </span>
          <span className="px-3 py-1 bg-blue-500/20 border border-blue-500/30 text-blue-400 text-sm font-medium rounded-full animate-pulse">
            Loading
          </span>
          <span className="flex items-center gap-1 px-3 py-1 bg-amber-500/20 border border-amber-500/30 text-amber-400 text-sm font-medium rounded-full">
            <div className="w-2 h-2 border border-amber-400 border-t-transparent rounded-full animate-spin"></div>
            Processing
          </span>
          <span className="px-3 py-1 bg-gradient-to-r from-purple-500 to-pink-500 text-white text-sm font-medium rounded-full hover:scale-110 transition-transform cursor-pointer">
            Interactive
          </span>
        </div>
      </div>
    </div>
  );

  // Header variations with perfect sizing and different aurora effects
  export const HeadersShowcase = () => {
    const [selectedColor, setSelectedColor] = useState('cyan');
    
    const colorOptions = [
      { id: 'cyan', name: 'Cyan', class: 'text-cyan-300 border-cyan-500/40 hover:bg-cyan-500/10' },
      { id: 'purple', name: 'Purple', class: 'text-purple-300 border-purple-500/40 hover:bg-purple-500/10' },
      { id: 'emerald', name: 'Emerald', class: 'text-emerald-300 border-emerald-500/40 hover:bg-emerald-500/10' },
      { id: 'amber', name: 'Amber', class: 'text-amber-300 border-amber-500/40 hover:bg-amber-500/10' },
      { id: 'pink', name: 'Pink', class: 'text-pink-300 border-pink-500/40 hover:bg-pink-500/10' },
      { id: 'violet', name: 'Violet', class: 'text-violet-300 border-violet-500/40 hover:bg-violet-500/10' }
    ];

    const headerVariations = {
      cyan: { 
        sweep: 'rgba(6,182,212,0.25)', 
        aurora1: 'rgba(14,165,233,0.12)', 
        aurora2: 'rgba(56,189,248,0.10)' 
      },
      purple: { 
        sweep: 'rgba(147,51,234,0.25)', 
        aurora1: 'rgba(124,58,237,0.15)', 
        aurora2: 'rgba(196,181,253,0.10)' 
      },
      emerald: { 
        sweep: 'rgba(5,150,105,0.25)', 
        aurora1: 'rgba(16,185,129,0.12)', 
        aurora2: 'rgba(110,231,183,0.08)' 
      },
      amber: { 
        sweep: 'rgba(245,158,11,0.25)', 
        aurora1: 'rgba(217,119,6,0.12)', 
        aurora2: 'rgba(252,211,77,0.08)' 
      },
      pink: { 
        sweep: 'rgba(219,39,119,0.25)', 
        aurora1: 'rgba(190,24,93,0.15)', 
        aurora2: 'rgba(251,182,206,0.08)' 
      },
      violet: { 
        sweep: 'rgba(124,58,237,0.25)', 
        aurora1: 'rgba(109,40,217,0.15)', 
        aurora2: 'rgba(221,214,254,0.08)' 
      }
    };

    const glowVariations = [
      {
        name: 'Plasma Wave',
        titleClass: 'text-2xl md:text-3xl font-bold tracking-tight text-white leading-tight',
        subtitleClass: 'text-xs md:text-sm leading-relaxed text-white/60 ml-4 mt-1',
        style: { 
          color: '#ff6b9d',
          textShadow: '0 0 15px #ff6b9d, 0 0 30px #ff6b9d, 0 0 45px #ff6b9d',
          animation: 'plasma-pulse 2.5s ease-in-out infinite'
        },
        subtitleStyle: {
          color: 'rgba(255, 107, 157, 0.7)',
          textShadow: '0 0 8px #ff6b9d'
        },
        lightingEffect: 'plasma'
      },
      {
        name: 'Electric Storm',
        titleClass: 'text-2xl md:text-3xl font-bold tracking-tight text-white leading-tight',
        subtitleClass: 'text-xs md:text-sm leading-relaxed text-white/60 ml-4 mt-1',
        style: { 
          color: '#00d4ff',
          textShadow: '0 0 10px #00d4ff, 0 0 20px #00d4ff, 0 0 40px #00d4ff',
          animation: 'electric-flicker 1.8s ease-in-out infinite'
        },
        subtitleStyle: {
          color: 'rgba(0, 212, 255, 0.8)',
          textShadow: '0 0 12px #00d4ff'
        },
        lightingEffect: 'electric'
      },
      {
        name: 'Solar Flare',
        titleClass: 'text-2xl md:text-3xl font-bold tracking-tight leading-tight',
        subtitleClass: 'text-xs md:text-sm leading-relaxed ml-4 mt-1',
        style: { 
          color: '#ffa500',
          textShadow: '0 0 20px #ffa500, 0 0 40px #ff6600, 0 0 60px #ff4500',
          animation: 'solar-burst 3.2s ease-in-out infinite'
        },
        subtitleStyle: {
          color: 'rgba(255, 165, 0, 0.7)',
          textShadow: '0 0 15px #ffa500'
        },
        lightingEffect: 'solar'
      },
      {
        name: 'Holographic',
        titleClass: 'text-2xl md:text-3xl font-bold tracking-tight leading-tight',
        subtitleClass: 'text-xs md:text-sm leading-relaxed ml-4 mt-1',
        style: { 
          background: 'linear-gradient(45deg, #ff006e, #8338ec, #3a86ff, #06ffa5, #ffbe0b)',
          backgroundSize: '400% 400%',
          WebkitBackgroundClip: 'text',
          WebkitTextFillColor: 'transparent',
          animation: 'gradient-shift 3s ease infinite'
        },
        subtitleStyle: {
          color: 'rgba(255, 255, 255, 0.7)',
          textShadow: '0 0 15px rgba(131, 56, 236, 0.4)'
        },
        lightingEffect: 'holographic'
      },
      {
        name: 'Cyberpunk',
        titleClass: 'text-2xl md:text-3xl font-bold tracking-tight leading-tight',
        subtitleClass: 'text-xs md:text-sm leading-relaxed ml-4 mt-1',
        style: { 
          color: '#00ff41',
          textShadow: '0 0 10px #00ff41, 0 0 20px #00ff41, 0 0 30px #00ff41',
          fontFamily: 'monospace',
          letterSpacing: '2px'
        },
        subtitleStyle: {
          color: '#00ff41',
          opacity: 0.7,
          textShadow: '0 0 5px #00ff41'
        },
        lightingEffect: 'cyberpunk-grid'
      },
      {
        name: 'Ethereal',
        titleClass: 'text-2xl md:text-3xl font-bold tracking-tight leading-tight',
        subtitleClass: 'text-xs md:text-sm leading-relaxed ml-4 mt-1',
        style: { 
          color: 'rgba(255, 255, 255, 0.9)',
          textShadow: '0 0 20px rgba(255, 255, 255, 0.5), 0 0 40px rgba(168, 85, 247, 0.3), 0 0 60px rgba(168, 85, 247, 0.2)',
          filter: 'blur(0.3px)'
        },
        subtitleStyle: {
          color: 'rgba(255, 255, 255, 0.6)',
          textShadow: '0 0 10px rgba(168, 85, 247, 0.3)'
        },
        lightingEffect: 'ethereal'
      }
    ];

    return (
      <div className="space-y-8">
        <div>
          <h3 className="text-lg font-semibold text-white mb-2">Aurora Headers with Glow Variations</h3>
          <p className="text-zinc-400 text-sm mb-4">Headers with perfect sizing and different glow effects</p>
          
          {/* Color Toggle */}
          <div className="flex items-center gap-2 text-xs text-zinc-400 mb-6">
            <span>Aurora Color:</span>
            {colorOptions.map((color) => (
              <button
                key={color.id}
                onClick={() => setSelectedColor(color.id)}
                className={`rounded-full px-2.5 py-1 border transition-colors ${color.class} ${
                  selectedColor === color.id ? 'bg-white/5' : ''
                }`}
              >
                {color.name}
              </button>
            ))}
          </div>
        </div>

        {glowVariations.map((glow, idx) => (
          <div key={idx} className="space-y-2">
            <h4 className="text-md font-medium text-zinc-300 mb-3">{glow.name}</h4>
            <div className={`rounded-xl overflow-hidden border border-zinc-800 glow-variant lighting-${glow.lightingEffect}`} data-glow={glow.name.toLowerCase().replace(' ', '-')}>
              <TransparentAuroraHeader 
                title="Dashboard" 
                subtitle="Real-time insights and key metrics for your organization"
                density="compact"
                fullBleed
                bleedTop={false}
                fadeBottom={false}
                contentClassName="px-6 flex items-center justify-start text-left"
                titleClassName={`glow-title-${idx} ${glow.titleClass}`}
                subtitleClassName={`glow-subtitle-${idx} ${glow.subtitleClass}`}
                colors={headerVariations[selectedColor as keyof typeof headerVariations]}
              />
              <style>{`
                .glow-title-${idx} {
                  ${glow.style ? Object.entries(glow.style).map(([key, value]) => 
                    `${key.replace(/([A-Z])/g, '-$1').toLowerCase()}: ${value} !important;`
                  ).join(' ') : ''}
                }
                .glow-subtitle-${idx} {
                  ${glow.subtitleStyle ? Object.entries(glow.subtitleStyle).map(([key, value]) => 
                    `${key.replace(/([A-Z])/g, '-$1').toLowerCase()}: ${value} !important;`
                  ).join(' ') : ''}
                }
                
                /* Lighting Effects */
                .lighting-plasma .aurora {
                  opacity: 1.8;
                  animation: plasma-wave 2.5s ease-in-out infinite;
                  background: radial-gradient(ellipse at center, 
                    rgba(255, 107, 157, 0.5), 
                    rgba(255, 20, 147, 0.3), 
                    transparent 60%
                  );
                  filter: blur(35px) saturate(1.5);
                }
                
                .lighting-electric .aurora {
                  opacity: 2.2;
                  animation: electric-storm 1.8s ease-in-out infinite;
                  background: radial-gradient(ellipse at center, 
                    rgba(0, 212, 255, 0.6), 
                    rgba(0, 100, 255, 0.4), 
                    transparent 70%
                  );
                  filter: blur(25px) brightness(1.4);
                }
                
                .lighting-solar .aurora {
                  opacity: 1.6;
                  animation: solar-flare 3.2s ease-in-out infinite;
                  background: radial-gradient(ellipse at center, 
                    rgba(255, 165, 0, 0.5), 
                    rgba(255, 69, 0, 0.4), 
                    rgba(255, 140, 0, 0.3), 
                    transparent 65%
                  );
                  filter: blur(40px) contrast(1.2);
                }
                
                .lighting-holographic .aurora {
                  opacity: 1.2;
                  animation: holographic-wave 6s linear infinite;
                  background: linear-gradient(45deg, 
                    rgba(255, 0, 110, 0.3), 
                    rgba(131, 56, 236, 0.3), 
                    rgba(58, 134, 255, 0.3), 
                    rgba(6, 255, 165, 0.3), 
                    rgba(255, 190, 11, 0.3)
                  );
                  background-size: 300% 300%;
                }
                
                .lighting-cyberpunk-grid .aurora {
                  opacity: 1.5;
                  animation: cyberpunk-grid 4s linear infinite;
                  background: 
                    linear-gradient(90deg, rgba(0, 255, 65, 0.1) 1px, transparent 1px),
                    linear-gradient(rgba(0, 255, 65, 0.1) 1px, transparent 1px),
                    radial-gradient(ellipse at center, rgba(0, 255, 65, 0.3), transparent 70%);
                  background-size: 20px 20px, 20px 20px, 100% 100%;
                  filter: blur(20px);
                }
                
                .lighting-ethereal .aurora {
                  opacity: 0.8;
                  animation: ethereal-float 10s ease-in-out infinite;
                  filter: blur(50px) brightness(0.8);
                  background: radial-gradient(ellipse at center, 
                    rgba(168, 85, 247, 0.2), 
                    rgba(255, 255, 255, 0.1), 
                    transparent 70%
                  );
                }
                
                @keyframes plasma-wave {
                  0%, 100% { transform: scale(1) rotate(0deg); filter: blur(35px) saturate(1.5) hue-rotate(0deg); }
                  50% { transform: scale(1.15) rotate(5deg); filter: blur(30px) saturate(2) hue-rotate(20deg); }
                }
                
                @keyframes electric-storm {
                  0% { opacity: 2.2; transform: scale(1); }
                  25% { opacity: 1.8; transform: scale(0.95); }
                  50% { opacity: 2.5; transform: scale(1.1); }
                  75% { opacity: 1.9; transform: scale(0.98); }
                  100% { opacity: 2.2; transform: scale(1); }
                }
                
                @keyframes solar-flare {
                  0%, 100% { transform: scale(1); filter: blur(40px) contrast(1.2) brightness(1); }
                  30% { transform: scale(1.2); filter: blur(45px) contrast(1.4) brightness(1.3); }
                  60% { transform: scale(0.9); filter: blur(35px) contrast(1.1) brightness(0.9); }
                }
                
                @keyframes plasma-pulse {
                  0%, 100% { text-shadow: 0 0 15px #ff6b9d, 0 0 30px #ff6b9d, 0 0 45px #ff6b9d; }
                  50% { text-shadow: 0 0 25px #ff6b9d, 0 0 50px #ff6b9d, 0 0 75px #ff6b9d; }
                }
                
                @keyframes electric-flicker {
                  0%, 100% { text-shadow: 0 0 10px #00d4ff, 0 0 20px #00d4ff, 0 0 40px #00d4ff; }
                  50% { text-shadow: 0 0 20px #00d4ff, 0 0 40px #00d4ff, 0 0 80px #00d4ff; }
                  75% { text-shadow: 0 0 5px #00d4ff, 0 0 15px #00d4ff, 0 0 30px #00d4ff; }
                }
                
                @keyframes solar-burst {
                  0%, 100% { text-shadow: 0 0 20px #ffa500, 0 0 40px #ff6600, 0 0 60px #ff4500; }
                  50% { text-shadow: 0 0 30px #ffa500, 0 0 60px #ff6600, 0 0 90px #ff4500; }
                }
                
                @keyframes cyberpunk-grid {
                  0% { background-position: 0 0, 0 0, center; }
                  100% { background-position: 20px 20px, 20px 20px, center; }
                }
                
                @keyframes holographic-wave {
                  0% { background-position: 0% 50%; transform: scale(1); }
                  50% { background-position: 100% 50%; transform: scale(1.05); }
                  100% { background-position: 0% 50%; transform: scale(1); }
                }
                
                @keyframes ethereal-float {
                  0%, 100% { transform: translateY(0px) scale(1); opacity: 0.8; }
                  33% { transform: translateY(-5px) scale(1.02); opacity: 1; }
                  66% { transform: translateY(3px) scale(0.98); opacity: 0.9; }
                }
              `}</style>
            </div>
          </div>
        ))}

        <div className="space-y-4">
          <h3 className="text-lg font-semibold text-white mb-4">Other Header Styles</h3>
          
          <div className="bg-zinc-900/30 border border-zinc-800 rounded-xl p-6">
            <PageTitle title="Simple Title" subtitle="Clean minimal title style" />
          </div>
          
          <div className="bg-zinc-900/30 border border-zinc-800 rounded-xl p-6">
            <PageTitleGlow title="Glow Line" subtitle="Subtle accent underline effect" />
          </div>
          
          <div className="bg-zinc-900/30 border border-zinc-800 rounded-xl p-6">
            <PageTitleEditorial eyebrow="Section" title="Editorial Header" subtitle="Structured dashboard style with eyebrow" />
          </div>
          
          <div className="rounded-xl overflow-hidden border border-zinc-800">
            <SweepHeader 
              title="Sweep Header" 
              subtitle="Animated light sweep with accent line" 
              density="compact" 
              fullBleed 
              divider={false} 
            />
          </div>
        </div>

        <div>
          <h3 className="text-lg font-semibold text-white mb-4">Header Size Variations</h3>
          <div className="space-y-4">
            {['compact', 'cozy', 'comfortable'].map((density) => (
              <div key={density} className="space-y-2">
                <h4 className="text-sm font-medium text-zinc-400 capitalize">{density} Density</h4>
                <div className="rounded-xl overflow-hidden border border-zinc-800">
                  <TransparentAuroraHeader 
                    title={`${density.charAt(0).toUpperCase() + density.slice(1)} Header`}
                    subtitle="Different vertical spacing options"
                    density={density as 'compact' | 'cozy' | 'comfortable'}
                    fullBleed
                    bleedTop={false}
                    fadeBottom={false}
                    contentClassName="px-6 flex items-center text-left"
                    titleClassName="aurora-title text-xl md:text-2xl font-bold tracking-tight text-white leading-tight"
                    subtitleClassName="text-xs md:text-sm leading-relaxed text-white/60 ml-4"
                    colors={headerVariations[selectedColor as keyof typeof headerVariations]}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>

  <style>{`
          @keyframes gradient-shift {
            0%, 100% { background-position: 0% 50%; }
            50% { background-position: 100% 50%; }
          }
          
          @keyframes pulse {
            0%, 100% { 
              filter: drop-shadow(0 0 25px rgba(120, 119, 198, 0.4)) drop-shadow(0 0 50px rgba(0, 212, 255, 0.3));
            }
            50% { 
              filter: drop-shadow(0 0 35px rgba(120, 119, 198, 0.6)) drop-shadow(0 0 70px rgba(0, 212, 255, 0.5));
            }
          }
        `}</style>
      </div>
    );
  };

  // Card variations
  export const CardShowcase = () => (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-semibold text-white mb-4">Basic Cards</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-zinc-900/50 border border-zinc-800 rounded-xl p-6">
            <h4 className="text-white font-semibold mb-2">Simple Card</h4>
            <p className="text-zinc-400 text-sm">Basic card with border and background</p>
          </div>
          <div className="bg-zinc-900/50 border border-zinc-800 rounded-xl p-6 hover:border-zinc-700 transition-colors">
            <h4 className="text-white font-semibold mb-2">Hover Card</h4>
            <p className="text-zinc-400 text-sm">Card with hover effect</p>
          </div>
          <div className="bg-gradient-to-br from-zinc-900/80 to-zinc-800/50 border border-zinc-700 rounded-xl p-6">
            <h4 className="text-white font-semibold mb-2">Gradient Card</h4>
            <p className="text-zinc-400 text-sm">Card with gradient background</p>
          </div>
        </div>
      </div>

      <div>
        <h3 className="text-lg font-semibold text-white mb-4">Colored Cards</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="bg-cyan-500/10 border border-cyan-500/30 rounded-xl p-6">
            <div className="flex items-center gap-2 mb-2">
              <Eye className="w-5 h-5 text-cyan-400" />
              <h4 className="text-cyan-400 font-semibold">Insights</h4>
            </div>
            <p className="text-zinc-300 text-sm">View analytics</p>
          </div>
          <div className="bg-purple-500/10 border border-purple-500/30 rounded-xl p-6">
            <div className="flex items-center gap-2 mb-2">
              <Brain className="w-5 h-5 text-purple-400" />
              <h4 className="text-purple-400 font-semibold">AI Tools</h4>
            </div>
            <p className="text-zinc-300 text-sm">Smart features</p>
          </div>
          <div className="bg-emerald-500/10 border border-emerald-500/30 rounded-xl p-6">
            <div className="flex items-center gap-2 mb-2">
              <Trophy className="w-5 h-5 text-emerald-400" />
              <h4 className="text-emerald-400 font-semibold">Achievements</h4>
            </div>
            <p className="text-zinc-300 text-sm">Track progress</p>
          </div>
          <div className="bg-amber-500/10 border border-amber-500/30 rounded-xl p-6">
            <div className="flex items-center gap-2 mb-2">
              <Star className="w-5 h-5 text-amber-400" />
              <h4 className="text-amber-400 font-semibold">Featured</h4>
            </div>
            <p className="text-zinc-300 text-sm">Top picks</p>
          </div>
        </div>
      </div>

      <div>
        <h3 className="text-lg font-semibold text-white mb-4">Glass Morphism Cards</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="backdrop-blur-md bg-white/10 border border-white/20 rounded-xl p-6 hover:bg-white/20 transition-all">
            <h4 className="text-white font-semibold mb-2">Glass Card</h4>
            <p className="text-zinc-300 text-sm">Frosted glass effect with backdrop blur</p>
          </div>
          <div className="backdrop-blur-md bg-cyan-500/20 border border-cyan-400/30 rounded-xl p-6 hover:bg-cyan-500/30 transition-all">
            <h4 className="text-cyan-300 font-semibold mb-2">Cyan Glass</h4>
            <p className="text-cyan-100 text-sm">Colored glass morphism</p>
          </div>
          <div className="backdrop-blur-md bg-purple-500/20 border border-purple-400/30 rounded-xl p-6 hover:bg-purple-500/30 transition-all">
            <h4 className="text-purple-300 font-semibold mb-2">Purple Glass</h4>
            <p className="text-purple-100 text-sm">Beautiful purple variant</p>
          </div>
        </div>
      </div>

      <div>
        <h3 className="text-lg font-semibold text-white mb-4">Feature Cards</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="bg-zinc-900/50 border border-zinc-800 rounded-xl p-6 group hover:border-zinc-700 transition-all">
            <div className="flex items-start justify-between mb-4">
              <div className="p-3 rounded-lg bg-emerald-500/20 border border-emerald-500/30">
                <Rocket className="w-6 h-6 text-emerald-400" />
              </div>
              <span className="px-2 py-1 bg-emerald-500/20 text-emerald-400 text-xs rounded-full">NEW</span>
            </div>
            <h4 className="text-white font-semibold mb-2">Quick Deploy</h4>
            <p className="text-zinc-400 text-sm mb-4">Deploy your applications with a single click</p>
            <button className="text-emerald-400 text-sm hover:underline group-hover:text-emerald-300">
              Learn more →
            </button>
          </div>
          <div className="bg-zinc-900/50 border border-zinc-800 rounded-xl p-6 group hover:border-zinc-700 transition-all">
            <div className="flex items-start justify-between mb-4">
              <div className="p-3 rounded-lg bg-purple-500/20 border border-purple-500/30">
                <Brain className="w-6 h-6 text-purple-400" />
              </div>
              <span className="px-2 py-1 bg-purple-500/20 text-purple-400 text-xs rounded-full">AI</span>
            </div>
            <h4 className="text-white font-semibold mb-2">Smart Analysis</h4>
            <p className="text-zinc-400 text-sm mb-4">AI-powered insights for your data</p>
            <button className="text-purple-400 text-sm hover:underline group-hover:text-purple-300">
              Try now →
            </button>
          </div>
        </div>
      </div>

      <div>
        <h3 className="text-lg font-semibold text-white mb-4">Stat Cards</h3>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="bg-zinc-900/50 border border-zinc-800 rounded-xl p-4 text-center">
            <div className="text-2xl font-bold text-cyan-400 mb-1">142</div>
            <div className="text-xs text-zinc-400">Active Users</div>
          </div>
          <div className="bg-zinc-900/50 border border-zinc-800 rounded-xl p-4 text-center">
            <div className="text-2xl font-bold text-emerald-400 mb-1">98.5%</div>
            <div className="text-xs text-zinc-400">Uptime</div>
          </div>
          <div className="bg-zinc-900/50 border border-zinc-800 rounded-xl p-4 text-center">
            <div className="text-2xl font-bold text-amber-400 mb-1">$12.4k</div>
            <div className="text-xs text-zinc-400">Revenue</div>
          </div>
          <div className="bg-zinc-900/50 border border-zinc-800 rounded-xl p-4 text-center">
            <div className="text-2xl font-bold text-purple-400 mb-1">24</div>
            <div className="text-xs text-zinc-400">Projects</div>
          </div>
        </div>
      </div>

      <div>
        <h3 className="text-lg font-semibold text-white mb-4">Profile Cards</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-zinc-900/50 border border-zinc-800 rounded-xl p-6 text-center">
            <div className="w-16 h-16 bg-gradient-to-br from-cyan-500 to-blue-500 rounded-full mx-auto mb-4 flex items-center justify-center text-white font-bold text-xl">
              JD
            </div>
            <h4 className="text-white font-semibold mb-1">John Doe</h4>
            <p className="text-zinc-400 text-sm mb-3">Senior Developer</p>
            <div className="flex justify-center gap-2">
              <span className="px-2 py-1 bg-emerald-500/20 text-emerald-400 text-xs rounded">React</span>
              <span className="px-2 py-1 bg-blue-500/20 text-blue-400 text-xs rounded">TypeScript</span>
            </div>
          </div>
          <div className="bg-zinc-900/50 border border-zinc-800 rounded-xl p-6 text-center">
            <div className="w-16 h-16 bg-gradient-to-br from-purple-500 to-pink-500 rounded-full mx-auto mb-4 flex items-center justify-center text-white font-bold text-xl">
              AS
            </div>
            <h4 className="text-white font-semibold mb-1">Alice Smith</h4>
            <p className="text-zinc-400 text-sm mb-3">UX Designer</p>
            <div className="flex justify-center gap-2">
              <span className="px-2 py-1 bg-purple-500/20 text-purple-400 text-xs rounded">Figma</span>
              <span className="px-2 py-1 bg-pink-500/20 text-pink-400 text-xs rounded">Design</span>
            </div>
          </div>
          <div className="bg-zinc-900/50 border border-zinc-800 rounded-xl p-6 text-center">
            <div className="w-16 h-16 bg-gradient-to-br from-emerald-500 to-teal-500 rounded-full mx-auto mb-4 flex items-center justify-center text-white font-bold text-xl">
              MJ
            </div>
            <h4 className="text-white font-semibold mb-1">Mike Johnson</h4>
            <p className="text-zinc-400 text-sm mb-3">Product Manager</p>
            <div className="flex justify-center gap-2">
              <span className="px-2 py-1 bg-emerald-500/20 text-emerald-400 text-xs rounded">Strategy</span>
              <span className="px-2 py-1 bg-teal-500/20 text-teal-400 text-xs rounded">Agile</span>
            </div>
          </div>
        </div>
      </div>

      <div>
        <h3 className="text-lg font-semibold text-white mb-4">Interactive Cards</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="bg-zinc-900/50 border border-zinc-800 rounded-xl p-6 hover:scale-105 transition-transform cursor-pointer">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-3 h-3 bg-emerald-400 rounded-full animate-pulse"></div>
              <span className="text-emerald-400 text-sm">Online</span>
            </div>
            <h4 className="text-white font-semibold mb-2">Server Status</h4>
            <p className="text-zinc-400 text-sm">All systems operational</p>
          </div>
          <div className="bg-zinc-900/50 border border-zinc-800 rounded-xl p-6 hover:-translate-y-2 transition-transform cursor-pointer">
            <div className="flex items-center justify-between mb-4">
              <Calendar className="w-6 h-6 text-blue-400" />
              <span className="px-2 py-1 bg-red-500 text-white text-xs rounded-full">3</span>
            </div>
            <h4 className="text-white font-semibold mb-2">Upcoming Events</h4>
            <p className="text-zinc-400 text-sm">You have 3 meetings today</p>
          </div>
        </div>
      </div>

      <div>
        <h3 className="text-lg font-semibold text-white mb-4">Progress Cards</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="bg-zinc-900/50 border border-zinc-800 rounded-xl p-6">
            <div className="flex items-center justify-between mb-3">
              <h4 className="text-white font-semibold">Project Alpha</h4>
              <span className="text-cyan-400 text-sm">75%</span>
            </div>
            <div className="w-full bg-zinc-800 rounded-full h-2 mb-3">
              <div className="bg-gradient-to-r from-cyan-500 to-blue-500 h-2 rounded-full" style={{ width: '75%' }}></div>
            </div>
            <p className="text-zinc-400 text-sm">3 days remaining</p>
          </div>
          <div className="bg-zinc-900/50 border border-zinc-800 rounded-xl p-6">
            <div className="flex items-center justify-between mb-3">
              <h4 className="text-white font-semibold">Website Redesign</h4>
              <span className="text-emerald-400 text-sm">90%</span>
            </div>
            <div className="w-full bg-zinc-800 rounded-full h-2 mb-3">
              <div className="bg-gradient-to-r from-emerald-500 to-teal-500 h-2 rounded-full" style={{ width: '90%' }}></div>
            </div>
            <p className="text-zinc-400 text-sm">Almost complete</p>
          </div>
        </div>
      </div>
    </div>
  );

  // Animation examples
  export const AnimationShowcase = () => (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-semibold text-white mb-4">Hover Animations</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="bg-zinc-900/50 border border-zinc-800 rounded-xl p-6 hover:scale-105 transition-transform cursor-pointer">
            <h4 className="text-white font-semibold mb-2">Scale</h4>
            <p className="text-zinc-400 text-sm">Hover to scale up</p>
          </div>
          <div className="bg-zinc-900/50 border border-zinc-800 rounded-xl p-6 hover:-translate-y-2 transition-transform cursor-pointer">
            <h4 className="text-white font-semibold mb-2">Lift</h4>
            <p className="text-zinc-400 text-sm">Hover to lift up</p>
          </div>
          <div className="bg-zinc-900/50 border border-zinc-800 rounded-xl p-6 hover:rotate-3 transition-transform cursor-pointer">
            <h4 className="text-white font-semibold mb-2">Rotate</h4>
            <p className="text-zinc-400 text-sm">Hover to rotate</p>
          </div>
          <div className="bg-zinc-900/50 border border-zinc-800 rounded-xl p-6 hover:bg-zinc-800/70 transition-colors cursor-pointer">
            <h4 className="text-white font-semibold mb-2">Color</h4>
            <p className="text-zinc-400 text-sm">Hover to change color</p>
          </div>
        </div>
      </div>

      <div>
        <h3 className="text-lg font-semibold text-white mb-4">Loading Animations</h3>
        <div className="flex flex-wrap gap-6 items-center">
          <div className="w-8 h-8 border-2 border-cyan-500 border-t-transparent rounded-full animate-spin"></div>
          <div className="flex gap-1">
            <div className="w-2 h-2 bg-emerald-400 rounded-full animate-pulse"></div>
            <div className="w-2 h-2 bg-emerald-400 rounded-full animate-pulse" style={{ animationDelay: '0.2s' }}></div>
            <div className="w-2 h-2 bg-emerald-400 rounded-full animate-pulse" style={{ animationDelay: '0.4s' }}></div>
          </div>
          <div className="w-8 h-8 border-2 border-purple-500/30 border-l-purple-500 rounded-full animate-spin"></div>
          <div className="flex gap-1">
            <div className="w-1 h-6 bg-blue-400 rounded-full animate-pulse"></div>
            <div className="w-1 h-6 bg-blue-400 rounded-full animate-pulse" style={{ animationDelay: '0.1s' }}></div>
            <div className="w-1 h-6 bg-blue-400 rounded-full animate-pulse" style={{ animationDelay: '0.2s' }}></div>
            <div className="w-1 h-6 bg-blue-400 rounded-full animate-pulse" style={{ animationDelay: '0.3s' }}></div>
          </div>
        </div>
      </div>

      <div>
        <h3 className="text-lg font-semibold text-white mb-4">Pulse Effects</h3>
        <div className="flex flex-wrap gap-4">
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 bg-emerald-400 rounded-full animate-pulse"></div>
            <span className="text-emerald-400 text-sm">Online</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 bg-amber-400 rounded-full animate-pulse"></div>
            <span className="text-amber-400 text-sm">Processing</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 bg-red-400 rounded-full animate-pulse"></div>
            <span className="text-red-400 text-sm">Alert</span>
          </div>
        </div>
      </div>

      <div>
        <h3 className="text-lg font-semibold text-white mb-4">Entrance Animations</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-zinc-900/50 border border-zinc-800 rounded-xl p-6 animate-[fadeIn_1s_ease-in-out]">
            <h4 className="text-white font-semibold mb-2">Fade In</h4>
            <p className="text-zinc-400 text-sm">Smooth opacity transition</p>
          </div>
          <div className="bg-zinc-900/50 border border-zinc-800 rounded-xl p-6 animate-[slideIn_0.8s_ease-out]">
            <h4 className="text-white font-semibold mb-2">Slide In</h4>
            <p className="text-zinc-400 text-sm">From left animation</p>
          </div>
          <div className="bg-zinc-900/50 border border-zinc-800 rounded-xl p-6 animate-[bounce_1s_ease-in-out]">
            <h4 className="text-white font-semibold mb-2">Bounce</h4>
            <p className="text-zinc-400 text-sm">Bouncy entrance effect</p>
          </div>
        </div>
  <style>{`
          @keyframes fadeIn {
            from { opacity: 0; }
            to { opacity: 1; }
          }
          @keyframes slideIn {
            from { transform: translateX(-100%); opacity: 0; }
            to { transform: translateX(0); opacity: 1; }
          }
        `}</style>
      </div>

      <div>
        <h3 className="text-lg font-semibold text-white mb-4">Floating Animations</h3>
        <div className="flex flex-wrap gap-6 items-center">
          <div className="w-16 h-16 bg-gradient-to-r from-cyan-500 to-blue-500 rounded-full flex items-center justify-center text-white font-bold animate-[float_3s_ease-in-out_infinite]">
            <Rocket className="w-6 h-6" />
          </div>
          <div className="w-16 h-16 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full flex items-center justify-center text-white font-bold animate-[wiggle_2s_ease-in-out_infinite]">
            <Heart className="w-6 h-6" />
          </div>
          <div className="w-16 h-16 bg-gradient-to-r from-emerald-500 to-teal-500 rounded-full flex items-center justify-center text-white font-bold animate-[glow_2s_ease-in-out_infinite_alternate]">
            <Star className="w-6 h-6" />
          </div>
        </div>
  <style>{`
          @keyframes float {
            0%, 100% { transform: translateY(0); }
            50% { transform: translateY(-10px); }
          }
          @keyframes wiggle {
            0%, 100% { transform: rotate(0deg); }
            25% { transform: rotate(-5deg); }
            75% { transform: rotate(5deg); }
          }
          @keyframes glow {
            from { box-shadow: 0 0 20px rgba(16, 185, 129, 0.5); }
            to { box-shadow: 0 0 30px rgba(16, 185, 129, 0.8), 0 0 40px rgba(16, 185, 129, 0.6); }
          }
        `}</style>
      </div>

      <div>
        <h3 className="text-lg font-semibold text-white mb-4">Progress Animations</h3>
        <div className="space-y-4">
          <div className="w-full bg-zinc-800 rounded-full h-2 overflow-hidden">
            <div className="h-full bg-gradient-to-r from-cyan-500 to-blue-500 rounded-full animate-[progress_3s_ease-in-out_infinite]"></div>
          </div>
          <div className="w-full bg-zinc-800 rounded-full h-3 overflow-hidden">
            <div className="h-full bg-gradient-to-r from-emerald-500 to-teal-500 rounded-full animate-[wave_2s_ease-in-out_infinite]"></div>
          </div>
          <div className="w-full bg-zinc-800 rounded-full h-2 overflow-hidden">
            <div className="h-full bg-gradient-to-r from-purple-500 to-pink-500 rounded-full animate-[shimmer_1.5s_ease-in-out_infinite]"></div>
          </div>
        </div>
  <style>{`
          @keyframes progress {
            0% { width: 0%; }
            50% { width: 75%; }
            100% { width: 100%; }
          }
          @keyframes wave {
            0%, 100% { transform: translateX(-100%); }
            50% { transform: translateX(100%); }
          }
          @keyframes shimmer {
            0% { transform: translateX(-100%) skewX(-15deg); }
            100% { transform: translateX(200%) skewX(-15deg); }
          }
        `}</style>
      </div>

      <div>
        <h3 className="text-lg font-semibold text-white mb-4">Interactive Hover Effects</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          <button className="p-6 bg-zinc-900/50 border border-zinc-800 rounded-xl text-left hover:shadow-[0_20px_40px_rgba(6,182,212,0.3)] hover:border-cyan-500/50 transition-all duration-300 group">
            <div className="flex items-center gap-3 mb-2">
              <div className="w-10 h-10 bg-cyan-500/20 rounded-lg flex items-center justify-center group-hover:scale-110 transition-transform">
                <Zap className="w-5 h-5 text-cyan-400" />
              </div>
              <h4 className="text-white font-semibold">Lightning Fast</h4>
            </div>
            <p className="text-zinc-400 text-sm group-hover:text-zinc-300 transition-colors">Blazing speed performance</p>
          </button>
          <button className="p-6 bg-zinc-900/50 border border-zinc-800 rounded-xl text-left hover:shadow-[0_20px_40px_rgba(168,85,247,0.3)] hover:border-purple-500/50 transition-all duration-300 group">
            <div className="flex items-center gap-3 mb-2">
              <div className="w-10 h-10 bg-purple-500/20 rounded-lg flex items-center justify-center group-hover:rotate-12 transition-transform">
                <Brain className="w-5 h-5 text-purple-400" />
              </div>
              <h4 className="text-white font-semibold">AI Powered</h4>
            </div>
            <p className="text-zinc-400 text-sm group-hover:text-zinc-300 transition-colors">Smart automation features</p>
          </button>
          <button className="p-6 bg-zinc-900/50 border border-zinc-800 rounded-xl text-left hover:shadow-[0_20px_40px_rgba(16,185,129,0.3)] hover:border-emerald-500/50 transition-all duration-300 group">
            <div className="flex items-center gap-3 mb-2">
              <div className="w-10 h-10 bg-emerald-500/20 rounded-lg flex items-center justify-center group-hover:scale-110 group-hover:rotate-6 transition-transform">
                <Shield className="w-5 h-5 text-emerald-400" />
              </div>
              <h4 className="text-white font-semibold">Secure</h4>
            </div>
            <p className="text-zinc-400 text-sm group-hover:text-zinc-300 transition-colors">Enterprise-grade security</p>
          </button>
        </div>
      </div>
    </div>
  );

  // New: Filters & Segments
  const FiltersShowcase = () => {
    const categories = ['All', 'Design', 'Data', 'Dev', 'Ops'];
    const [active, setActive] = useState<string>('All');
    const segments = ['1D', '1W', '1M', '1Y'];
    const [seg, setSeg] = useState('1W');
    return (
      <div className="space-y-8">
        <div>
          <h3 className="text-lg font-semibold text-white mb-4">Filter Chips</h3>
          <div className="flex flex-wrap gap-2">
            {categories.map(c => (
              <button
                key={c}
                onClick={() => setActive(c)}
                className={`px-3 py-1.5 rounded-full text-sm border transition-colors ${active === c ? 'bg-cyan-500/20 border-cyan-500/40 text-cyan-300' : 'bg-zinc-900/50 border-zinc-800 text-zinc-300 hover:border-zinc-700'}`}
              >
                {c}
              </button>
            ))}
          </div>
        </div>

        <div>
          <h3 className="text-lg font-semibold text-white mb-4">Segmented Control</h3>
          <div className="inline-flex p-1 rounded-xl bg-zinc-900/70 border border-zinc-800">
            {segments.map(s => (
              <button
                key={s}
                onClick={() => setSeg(s)}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${seg === s ? 'bg-white text-black shadow' : 'text-zinc-300 hover:text-white'}`}
              >
                {s}
              </button>
            ))}
          </div>
        </div>

        <div>
          <h3 className="text-lg font-semibold text-white mb-4">Range Slider</h3>
          <input type="range" min={0} max={100} className="w-full" />
        </div>
      </div>
    );
  };

  // New: KPI Cards
  const KpiShowcase = () => (
  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
      <KpiCard title="Revenue" value={128430} deltaPct={+12.4} tint="#10b981" icon={<DollarIcon />} />
      <KpiCard title="Active Users" value={8432} deltaPct={+8.2} tint="#3b82f6" icon={<Users />} />
      <KpiCard title="Error Rate" value={0.7} deltaPct={-0.3} tint="#ef4444" icon={<AlertIcon />} />
      <KpiCard title="Satisfaction" value={4.8} deltaPct={+0.2} tint="#8b5cf6" icon={<Star />} />
    </div>
  );

  // New: Overlays (Modal, Drawer, Popover, Tooltip)
  export const OverlaysShowcase = () => {
    const [open, setOpen] = useState(false);
    const [drawer, setDrawer] = useState(false);
    const [cmdOpen, setCmdOpen] = useState(false);
    const [sidebar, setSidebar] = useState(false);
    const [notification, setNotification] = useState(false);
    const [fullscreen, setFullscreen] = useState(false);
    const [bottomSheet, setBottomSheet] = useState(false);
    
    return (
      <div className="space-y-8">
        <div>
          <h3 className="text-lg font-semibold text-white mb-4">Modal & Drawer</h3>
          <div className="flex flex-wrap gap-3">
            <button onClick={() => setOpen(true)} className="px-4 py-2 rounded-lg bg-cyan-500/20 border border-cyan-500/30 text-cyan-300 hover:bg-cyan-500/30">Open Modal</button>
            <button onClick={() => setDrawer(true)} className="px-4 py-2 rounded-lg bg-purple-500/20 border border-purple-500/30 text-purple-300 hover:bg-purple-500/30">Open Drawer</button>
            <button onClick={() => setCmdOpen(true)} className="px-4 py-2 rounded-lg bg-emerald-500/20 border border-emerald-500/30 text-emerald-300 hover:bg-emerald-500/30">Command Palette (⌘K)</button>
            <button onClick={() => setSidebar(true)} className="px-4 py-2 rounded-lg bg-amber-500/20 border border-amber-500/30 text-amber-300 hover:bg-amber-500/30">Sidebar</button>
            <button onClick={() => setNotification(true)} className="px-4 py-2 rounded-lg bg-red-500/20 border border-red-500/30 text-red-300 hover:bg-red-500/30">Notification</button>
            <button onClick={() => setFullscreen(true)} className="px-4 py-2 rounded-lg bg-blue-500/20 border border-blue-500/30 text-blue-300 hover:bg-blue-500/30">Fullscreen</button>
            <button onClick={() => setBottomSheet(true)} className="px-4 py-2 rounded-lg bg-pink-500/20 border border-pink-500/30 text-pink-300 hover:bg-pink-500/30">Bottom Sheet</button>
          </div>
          
          {open && (
            <AppModal title="Example Modal" onClose={() => setOpen(false)} footer={
              <div className="flex justify-end gap-2 p-4 border-t border-white/10">
                <button onClick={() => setOpen(false)} className="px-4 py-2 rounded-lg bg-zinc-800 border border-zinc-700 text-zinc-200">Cancel</button>
                <button onClick={() => setOpen(false)} className="px-4 py-2 rounded-lg bg-emerald-500 text-black font-semibold">Confirm</button>
              </div>
            }>
              <p className="text-sm text-zinc-300">This is a reusable modal using the app's Modal component. It supports keyboard interactions and focus trapping.</p>
            </AppModal>
          )}

          {drawer && (
            <div className="fixed inset-0 z-50">
              <div className="absolute inset-0 bg-black/60" onClick={() => setDrawer(false)} />
              <div className="absolute right-0 top-0 h-full w-[380px] bg-zinc-950 border-l border-zinc-800 shadow-2xl p-6 animate-[slideInRight_.3s_ease-out]">
                <div className="flex items-center justify-between mb-4">
                  <h4 className="text-white font-semibold">Drawer Panel</h4>
                  <button onClick={() => setDrawer(false)} className="text-zinc-400 hover:text-white">✕</button>
                </div>
                <p className="text-sm text-zinc-400 mb-4">A lightweight slide-in panel from the right, great for contextual tasks.</p>
                <div className="space-y-3">
                  <div className="p-3 rounded-lg bg-zinc-900 border border-zinc-800">
                    <div className="flex items-center gap-2 mb-1">
                      <Users className="w-4 h-4 text-cyan-400" />
                      <span className="text-white text-sm font-medium">Team Members</span>
                    </div>
                    <p className="text-xs text-zinc-400">Manage team access</p>
                  </div>
                  <div className="p-3 rounded-lg bg-zinc-900 border border-zinc-800">
                    <div className="flex items-center gap-2 mb-1">
                      <Calendar className="w-4 h-4 text-purple-400" />
                      <span className="text-white text-sm font-medium">Schedule</span>
                    </div>
                    <p className="text-xs text-zinc-400">View upcoming events</p>
                  </div>
                </div>
              </div>
            </div>
          )}

          {sidebar && (
            <div className="fixed inset-0 z-50">
              <div className="absolute inset-0 bg-black/60" onClick={() => setSidebar(false)} />
              <div className="absolute left-0 top-0 h-full w-[280px] bg-zinc-950 border-r border-zinc-800 shadow-2xl p-4 animate-[slideInLeft_.3s_ease-out]">
                <div className="flex items-center justify-between mb-6">
                  <h4 className="text-white font-semibold">Navigation</h4>
                  <button onClick={() => setSidebar(false)} className="text-zinc-400 hover:text-white">✕</button>
                </div>
                <nav className="space-y-2">
                  <a href="#" className="flex items-center gap-3 px-3 py-2 rounded-lg bg-cyan-500/20 text-cyan-300">
                    <Eye className="w-4 h-4" />
                    Dashboard
                  </a>
                  <a href="#" className="flex items-center gap-3 px-3 py-2 rounded-lg text-zinc-400 hover:bg-zinc-800 hover:text-white">
                    <Users className="w-4 h-4" />
                    Team
                  </a>
                  <a href="#" className="flex items-center gap-3 px-3 py-2 rounded-lg text-zinc-400 hover:bg-zinc-800 hover:text-white">
                    <Calendar className="w-4 h-4" />
                    Events
                  </a>
                </nav>
              </div>
            </div>
          )}

          {notification && (
            <div className="fixed top-4 right-4 z-50 animate-[slideInDown_.3s_ease-out]">
              <div className="bg-zinc-900 border border-zinc-700 rounded-lg p-4 shadow-xl max-w-sm">
                <div className="flex items-start gap-3">
                  <div className="w-8 h-8 bg-emerald-500/20 rounded-full flex items-center justify-center">
                    <Trophy className="w-4 h-4 text-emerald-400" />
                  </div>
                  <div className="flex-1">
                    <h5 className="text-white font-medium text-sm">Success!</h5>
                    <p className="text-zinc-400 text-xs mt-1">Your changes have been saved successfully.</p>
                  </div>
                  <button onClick={() => setNotification(false)} className="text-zinc-400 hover:text-white">
                    ✕
                  </button>
                </div>
              </div>
            </div>
          )}

          {fullscreen && (
            <div className="fixed inset-0 z-50 bg-zinc-950 animate-[zoomIn_.2s_ease-out]">
              <div className="h-full flex flex-col">
                <div className="flex items-center justify-between p-6 border-b border-zinc-800">
                  <h3 className="text-xl font-bold text-white">Fullscreen View</h3>
                  <button onClick={() => setFullscreen(false)} className="px-4 py-2 rounded-lg bg-zinc-800 text-zinc-300 hover:bg-zinc-700">
                    Close
                  </button>
                </div>
                <div className="flex-1 p-6 flex items-center justify-center">
                  <div className="text-center">
                    <div className="w-24 h-24 bg-gradient-to-br from-purple-500 to-pink-500 rounded-full mx-auto mb-4 flex items-center justify-center">
                      <Globe className="w-12 h-12 text-white" />
                    </div>
                    <h4 className="text-2xl font-bold text-white mb-2">Immersive Experience</h4>
                    <p className="text-zinc-400">Perfect for presentations, media viewing, or focused work.</p>
                  </div>
                </div>
              </div>
            </div>
          )}

          {bottomSheet && (
            <div className="fixed inset-0 z-50">
              <div className="absolute inset-0 bg-black/60" onClick={() => setBottomSheet(false)} />
              <div className="absolute bottom-0 left-0 right-0 bg-zinc-950 border-t border-zinc-800 rounded-t-2xl p-6 animate-[slideInUp_.3s_ease-out]">
                <div className="w-12 h-1 bg-zinc-600 rounded-full mx-auto mb-4"></div>
                <div className="flex items-center justify-between mb-4">
                  <h4 className="text-white font-semibold">Quick Actions</h4>
                  <button onClick={() => setBottomSheet(false)} className="text-zinc-400 hover:text-white">✕</button>
                </div>
                <div className="grid grid-cols-3 gap-4">
                  <button className="flex flex-col items-center gap-2 p-4 rounded-lg bg-zinc-900 border border-zinc-800 hover:bg-zinc-800">
                    <Search className="w-6 h-6 text-cyan-400" />
                    <span className="text-white text-sm">Search</span>
                  </button>
                  <button className="flex flex-col items-center gap-2 p-4 rounded-lg bg-zinc-900 border border-zinc-800 hover:bg-zinc-800">
                    <Mail className="w-6 h-6 text-purple-400" />
                    <span className="text-white text-sm">Messages</span>
                  </button>
                  <button className="flex flex-col items-center gap-2 p-4 rounded-lg bg-zinc-900 border border-zinc-800 hover:bg-zinc-800">
                    <Calendar className="w-6 h-6 text-emerald-400" />
                    <span className="text-white text-sm">Calendar</span>
                  </button>
                </div>
              </div>
            </div>
          )}

          <CommandPalette
            open={cmdOpen}
            onOpenChange={setCmdOpen}
            items={[
              { id: 'new', label: 'New Document', hint: 'Create a fresh doc', onSelect: () => {} },
              { id: 'search', label: 'Search Projects', hint: 'Jump to anything', onSelect: () => {} },
              { id: 'settings', label: 'Open Settings', onSelect: () => {} },
            ]}
          />

          <style>{`
            @keyframes slideInRight {
              from { transform: translateX(100%); opacity: 0; }
              to { transform: translateX(0); opacity: 1; }
            }
            @keyframes slideInLeft {
              from { transform: translateX(-100%); opacity: 0; }
              to { transform: translateX(0); opacity: 1; }
            }
            @keyframes slideInDown {
              from { transform: translateY(-100%); opacity: 0; }
              to { transform: translateY(0); opacity: 1; }
            }
            @keyframes slideInUp {
              from { transform: translateY(100%); opacity: 0; }
              to { transform: translateY(0); opacity: 1; }
            }
            @keyframes zoomIn {
              from { transform: scale(0.9); opacity: 0; }
              to { transform: scale(1); opacity: 1; }
            }
          `}</style>
        </div>

        <div>
          <h3 className="text-lg font-semibold text-white mb-4">Popover & Tooltip</h3>
          <div className="flex flex-wrap gap-6 items-center">
            <Popover.Root>
              <Popover.Trigger asChild>
                <button className="px-4 py-2 rounded-lg bg-amber-500/20 border border-amber-500/30 text-amber-300 hover:bg-amber-500/30">Open Popover</button>
              </Popover.Trigger>
              <Popover.Portal>
                <Popover.Content sideOffset={8} className="rounded-xl border border-zinc-700 bg-zinc-900 p-4 shadow-xl text-left animate-[fadeInScale_.2s_ease-out]">
                  <div className="text-white font-semibold mb-1">Quick Actions</div>
                  <p className="text-sm text-zinc-400 mb-3">Helpful content or actions in a small surface.</p>
                  <div className="flex gap-2">
                    <button className="px-3 py-1.5 text-xs rounded bg-zinc-800 border border-zinc-700 text-white hover:bg-zinc-700">Settings</button>
                    <button className="px-3 py-1.5 text-xs rounded bg-zinc-800 border border-zinc-700 text-white hover:bg-zinc-700">Docs</button>
                  </div>
                  <Popover.Arrow className="fill-zinc-900" />
                </Popover.Content>
              </Popover.Portal>
            </Popover.Root>

            <Tooltip.Provider>
              <Tooltip.Root>
                <Tooltip.Trigger asChild>
                  <button className="px-4 py-2 rounded-lg bg-zinc-800 text-white border border-zinc-700 hover:bg-zinc-700">Hover me</button>
                </Tooltip.Trigger>
                <Tooltip.Portal>
                  <Tooltip.Content sideOffset={8} className="rounded-lg border border-zinc-700 bg-zinc-900 px-3 py-1.5 text-xs text-white shadow animate-[fadeIn_.15s_ease-out]">
                    Helpful tooltip text
                    <Tooltip.Arrow className="fill-zinc-900" />
                  </Tooltip.Content>
                </Tooltip.Portal>
              </Tooltip.Root>
            </Tooltip.Provider>

            <Popover.Root>
              <Popover.Trigger asChild>
                <button className="px-4 py-2 rounded-lg bg-emerald-500/20 border border-emerald-500/30 text-emerald-300 hover:bg-emerald-500/30">Rich Popover</button>
              </Popover.Trigger>
              <Popover.Portal>
                <Popover.Content sideOffset={8} className="rounded-xl border border-zinc-700 bg-zinc-900 p-0 shadow-xl text-left w-80 animate-[fadeInScale_.2s_ease-out]">
                  <div className="p-4 border-b border-zinc-800">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-gradient-to-br from-emerald-500 to-teal-500 rounded-full flex items-center justify-center text-white font-bold">
                        JD
                      </div>
                      <div>
                        <div className="text-white font-medium">John Doe</div>
                        <div className="text-zinc-400 text-sm">Senior Developer</div>
                      </div>
                    </div>
                  </div>
                  <div className="p-4">
                    <div className="flex items-center gap-2 text-sm text-zinc-300 mb-2">
                      <Mail className="w-4 h-4" />
                      john.doe@company.com
                    </div>
                    <div className="flex gap-2">
                      <button className="flex-1 px-3 py-1.5 text-xs rounded bg-emerald-500 text-black font-medium">Message</button>
                      <button className="flex-1 px-3 py-1.5 text-xs rounded bg-zinc-800 border border-zinc-700 text-white">Profile</button>
                    </div>
                  </div>
                  <Popover.Arrow className="fill-zinc-900" />
                </Popover.Content>
              </Popover.Portal>
            </Popover.Root>
          </div>
          <style>{`
            @keyframes fadeInScale {
              from { transform: scale(0.95); opacity: 0; }
              to { transform: scale(1); opacity: 1; }
            }
          `}</style>
        </div>
      </div>
    );
  };

  // New: Form components
  export const FormsShowcase = () => {
    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const [agree, setAgree] = useState(false);
    const [plan, setPlan] = useState('pro');
    const max = 120;
    const schema = z.object({
      fullName: z.string().min(2, 'Name must be at least 2 characters'),
      workEmail: z.string().email('Enter a valid email'),
    });
    const { register, handleSubmit, formState: { errors } } = useForm<{ fullName: string; workEmail: string }>({ resolver: zodResolver(schema) });
    const onSubmit = handleSubmit(() => {});
    return (
      <div className="space-y-8">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm text-zinc-300 mb-1">Full name</label>
            <div className="flex items-center gap-2 rounded-lg border border-zinc-700 bg-zinc-900 px-3 py-2 focus-within:border-cyan-500">
              <Search className="w-4 h-4 text-zinc-500" />
              <input value={name} onChange={e => setName(e.target.value)} placeholder="Jane Doe" className="flex-1 bg-transparent outline-none text-white placeholder-zinc-500" />
            </div>
          </div>
          <div>
            <label className="block text-sm text-zinc-300 mb-1">Email</label>
            <div className="flex items-center gap-2 rounded-lg border border-zinc-700 bg-zinc-900 px-3 py-2 focus-within:border-emerald-500">
              <Mail className="w-4 h-4 text-zinc-500" />
              <input type="email" value={email} onChange={e => setEmail(e.target.value)} placeholder="jane@company.com" className="flex-1 bg-transparent outline-none text-white placeholder-zinc-500" />
            </div>
            <p className="mt-1 text-xs text-zinc-500">We’ll never share your email.</p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm text-zinc-300 mb-1">Plan</label>
            <Select.Root value={plan} onValueChange={setPlan}>
              <Select.Trigger className="w-full inline-flex items-center justify-between rounded-lg border border-zinc-700 bg-zinc-900 px-3 py-2 text-white">
                <Select.Value />
                <Select.Icon>▾</Select.Icon>
              </Select.Trigger>
              <Select.Portal>
                <Select.Content className="rounded-lg border border-zinc-700 bg-zinc-900 text-white shadow">
                  <Select.Viewport className="p-1">
                    <Select.Item value="free" className="px-3 py-2 rounded hover:bg-zinc-800">Free</Select.Item>
                    <Select.Item value="pro" className="px-3 py-2 rounded hover:bg-zinc-800">Pro</Select.Item>
                    <Select.Item value="enterprise" className="px-3 py-2 rounded hover:bg-zinc-800">Enterprise</Select.Item>
                  </Select.Viewport>
                </Select.Content>
              </Select.Portal>
            </Select.Root>
          </div>

          <div>
            <label className="block text-sm text-zinc-300 mb-1">Message</label>
            <textarea maxLength={max} className="w-full rounded-lg border border-zinc-700 bg-zinc-900 p-3 text-white" placeholder="Tell us more..." />
            <div className="flex justify-end text-xs text-zinc-500 mt-1">{max} max</div>
          </div>
        </div>

        <div className="rounded-xl border border-zinc-800 p-4">
          <h4 className="text-white font-semibold mb-3">Validated Form (zod + RHF)</h4>
          <form onSubmit={onSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm text-zinc-300 mb-1">Full name</label>
              <input {...register('fullName')} className={`w-full rounded-lg border px-3 py-2 bg-zinc-900 text-white ${errors.fullName ? 'border-rose-500' : 'border-zinc-700'}`} placeholder="Ada Lovelace" />
              {errors.fullName && <p className="text-xs text-rose-400 mt-1">{errors.fullName.message}</p>}
            </div>
            <div>
              <label className="block text-sm text-zinc-300 mb-1">Work email</label>
              <input {...register('workEmail')} className={`w-full rounded-lg border px-3 py-2 bg-zinc-900 text-white ${errors.workEmail ? 'border-rose-500' : 'border-zinc-700'}`} placeholder="ada@company.com" />
              {errors.workEmail && <p className="text-xs text-rose-400 mt-1">{errors.workEmail.message}</p>}
            </div>
            <div className="md:col-span-2 flex justify-end">
              <button className="px-4 py-2 rounded-lg bg-emerald-500 text-black font-semibold">Submit</button>
            </div>
          </form>
        </div>

        <div>
          <h3 className="text-lg font-semibold text-white mb-4">Advanced Input Types</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {/* Star Rating */}
            <div>
              <label className="block text-sm text-zinc-300 mb-2">Rating</label>
              <div className="flex gap-1">
                {[1, 2, 3, 4, 5].map(star => (
                  <button
                    key={star}
                    onClick={() => {/* setRating(star) */}}
                    className={`w-8 h-8 transition-colors ${star <= 4 ? 'text-amber-400' : 'text-zinc-600 hover:text-zinc-400'}`}
                  >
                    <Star className="w-full h-full" fill={star <= 4 ? 'currentColor' : 'none'} />
                  </button>
                ))}
              </div>
              <p className="text-xs text-zinc-500 mt-1">4 out of 5 stars</p>
            </div>

            {/* Range Slider */}
            <div>
              <label className="block text-sm text-zinc-300 mb-2">Value: 75%</label>
              <input
                type="range"
                min="0"
                max="100"
                defaultValue="75"
                className="w-full h-2 bg-zinc-700 rounded-lg appearance-none cursor-pointer"
              />
              <div className="flex justify-between text-xs text-zinc-500 mt-1">
                <span>0%</span>
                <span>100%</span>
              </div>
            </div>

            {/* Color Picker */}
            <div>
              <label className="block text-sm text-zinc-300 mb-2">Color</label>
              <div className="flex items-center gap-3">
                <input
                  type="color"
                  defaultValue="#4997D0"
                  className="w-12 h-12 rounded-lg border border-zinc-700 bg-zinc-900 cursor-pointer"
                />
                <div>
                  <div className="text-white font-mono text-sm">#4997D0</div>
                  <div className="text-zinc-400 text-xs">Hex color</div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div>
          <h3 className="text-lg font-semibold text-white mb-4">Tag Input</h3>
          <div>
            <label className="block text-sm text-zinc-300 mb-2">Skills</label>
            <div className="flex flex-wrap gap-2 p-3 rounded-lg border border-zinc-700 bg-zinc-900 focus-within:border-cyan-500 transition-colors">
              <span className="flex items-center gap-1 px-2 py-1 bg-cyan-500/20 text-cyan-300 text-sm rounded-md">
                React
                <button className="text-cyan-400 hover:text-cyan-200">×</button>
              </span>
              <span className="flex items-center gap-1 px-2 py-1 bg-cyan-500/20 text-cyan-300 text-sm rounded-md">
                TypeScript
                <button className="text-cyan-400 hover:text-cyan-200">×</button>
              </span>
              <span className="flex items-center gap-1 px-2 py-1 bg-purple-500/20 text-purple-300 text-sm rounded-md">
                Node.js
                <button className="text-purple-400 hover:text-purple-200">×</button>
              </span>
              <input
                type="text"
                placeholder="Add a skill..."
                className="flex-1 min-w-[120px] bg-transparent outline-none text-white placeholder-zinc-500"
              />
            </div>
            <p className="text-xs text-zinc-500 mt-1">Press Enter to add tags</p>
          </div>
        </div>

        <div>
          <h3 className="text-lg font-semibold text-white mb-4">File Upload</h3>
          <div className="border-2 border-dashed border-zinc-700 rounded-xl p-8 text-center hover:border-zinc-600 transition-colors cursor-pointer group">
            <div className="w-16 h-16 bg-zinc-800 rounded-full mx-auto mb-4 flex items-center justify-center group-hover:bg-zinc-700 transition-colors">
              <Coffee className="w-8 h-8 text-zinc-400" />
            </div>
            <h4 className="text-white font-medium mb-2">Drop files here</h4>
            <p className="text-zinc-400 text-sm mb-4">or click to browse</p>
            <button className="px-4 py-2 bg-cyan-500/20 border border-cyan-500/30 text-cyan-300 rounded-lg hover:bg-cyan-500/30 transition-colors">
              Choose Files
            </button>
          </div>
        </div>

        <div>
          <h3 className="text-lg font-semibold text-white mb-4">Input States</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm text-zinc-300 mb-1">Success State</label>
              <div className="flex items-center gap-2 rounded-lg border border-emerald-500 bg-zinc-900 px-3 py-2">
                <input value="Valid input" className="flex-1 bg-transparent outline-none text-white" readOnly />
                <div className="w-5 h-5 text-emerald-400">✓</div>
              </div>
              <p className="mt-1 text-xs text-emerald-400">Looks good!</p>
            </div>
            <div>
              <label className="block text-sm text-zinc-300 mb-1">Error State</label>
              <div className="flex items-center gap-2 rounded-lg border border-red-500 bg-zinc-900 px-3 py-2">
                <input value="Invalid input" className="flex-1 bg-transparent outline-none text-white" readOnly />
                <div className="w-5 h-5 text-red-400">!</div>
              </div>
              <p className="mt-1 text-xs text-red-400">Please check this field.</p>
            </div>
            <div>
              <label className="block text-sm text-zinc-300 mb-1">Disabled State</label>
              <div className="flex items-center gap-2 rounded-lg border border-zinc-700 bg-zinc-800 px-3 py-2 opacity-50">
                <input value="Disabled input" className="flex-1 bg-transparent outline-none text-zinc-400" disabled />
              </div>
              <p className="mt-1 text-xs text-zinc-500">This field is disabled.</p>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-6">
          <label className="inline-flex items-center gap-2">
            <input type="checkbox" checked={agree} onChange={e => setAgree(e.target.checked)} className="h-4 w-4" />
            <span className="text-sm text-zinc-300">I agree to the terms</span>
          </label>
          <label className="inline-flex items-center gap-2">
            <input type="radio" name="tier" defaultChecked className="h-4 w-4" />
            <span className="text-sm text-zinc-300">Standard</span>
          </label>
          <label className="inline-flex items-center gap-2">
            <input type="radio" name="tier" className="h-4 w-4" />
            <span className="text-sm text-zinc-300">Premium</span>
          </label>
          <button disabled={!agree} className={`px-4 py-2 rounded-lg ${agree ? 'bg-emerald-500 text-black' : 'bg-zinc-800 text-zinc-500 cursor-not-allowed'}`}>Submit</button>
        </div>
      </div>
    );
  };

  const DollarIcon: React.FC = () => (
    <svg viewBox="0 0 24 24" className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M12 1v22" /><path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6" />
    </svg>
  );
  
  // New: Pickers
  const PickersShowcase = () => {
    const [range, setRange] = useState<{ start: Date | null; end: Date | null }>({ start: null, end: null });
    return (
      <div className="space-y-6">
        <h3 className="text-lg font-semibold text-white">Date Range Picker</h3>
        <div className="flex flex-wrap items-center gap-4">
          <DateRangePicker value={range} onChange={setRange} />
          <div className="text-sm text-zinc-400">
            <div>Start: <span className="text-white">{range.start ? range.start.toLocaleDateString() : '—'}</span></div>
            <div>End: <span className="text-white">{range.end ? range.end.toLocaleDateString() : '—'}</span></div>
          </div>
        </div>
      </div>
    );
  };
  const AlertIcon: React.FC = () => (
    <svg viewBox="0 0 24 24" className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M12 9v4" /><path d="M12 17h.01" /><path d="M10.29 3.86 1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0Z" />
    </svg>
  );

  // Neumorphism Showcase
  export const NeumorphismShowcase = () => (
    <div className="space-y-8">
      <div>
        <h3 className="text-lg font-semibold text-white mb-4">Neumorphism Side Menu</h3>
        <p className="text-zinc-400 text-sm mb-6">Beautiful 3D-effect side menu with inset/outset shadows</p>
        <div className="flex justify-start">
          <SampleSideMenu />
        </div>
      </div>

      <div>
        <h3 className="text-lg font-semibold text-white mb-4">Neumorphic Buttons</h3>
        <div className="flex flex-wrap gap-4">
          {['Primary', 'Secondary', 'Success', 'Warning'].map((type, idx) => {
            const colors = ['cyan', 'slate', 'emerald', 'amber'][idx];
            return (
              <button
                key={type}
                className={`px-6 py-3 rounded-xl font-medium transition-all duration-200 hover:scale-[1.02] ${
                  colors === 'cyan' ? 'text-cyan-300' :
                  colors === 'slate' ? 'text-slate-300' :
                  colors === 'emerald' ? 'text-emerald-300' :
                  'text-amber-300'
                }`}
                style={{
                  background: `linear-gradient(145deg, rgba(51, 65, 85, 0.6), rgba(30, 41, 59, 0.8))`,
                  boxShadow: `
                    8px 8px 16px rgba(15, 23, 42, 0.6),
                    -8px -8px 16px rgba(71, 85, 105, 0.1)
                  `
                }}
                onMouseDown={(e) => {
                  e.currentTarget.style.boxShadow = `
                    inset 8px 8px 16px rgba(15, 23, 42, 0.8),
                    inset -8px -8px 16px rgba(71, 85, 105, 0.3)
                  `;
                }}
                onMouseUp={(e) => {
                  e.currentTarget.style.boxShadow = `
                    8px 8px 16px rgba(15, 23, 42, 0.6),
                    -8px -8px 16px rgba(71, 85, 105, 0.1)
                  `;
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.boxShadow = `
                    8px 8px 16px rgba(15, 23, 42, 0.6),
                    -8px -8px 16px rgba(71, 85, 105, 0.1)
                  `;
                }}
              >
                {type}
              </button>
            );
          })}
        </div>
      </div>

      <div>
        <h3 className="text-lg font-semibold text-white mb-4">Neumorphic Cards</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {[
            { title: 'Total Users', value: '12,345', icon: Users, color: 'blue' },
            { title: 'Revenue', value: '$98,765', icon: Trophy, color: 'emerald' },
            { title: 'Growth', value: '+24%', icon: TrendingUp, color: 'purple' }
          ].map((card, idx) => {
            const Icon = card.icon;
            return (
              <div
                key={idx}
                className="p-6 rounded-2xl backdrop-blur-sm border border-slate-700/40"
                style={{
                  background: `linear-gradient(145deg, rgba(51, 65, 85, 0.4), rgba(30, 41, 59, 0.6))`,
                  boxShadow: `
                    12px 12px 24px rgba(15, 23, 42, 0.6),
                    -12px -12px 24px rgba(71, 85, 105, 0.1)
                  `
                }}
              >
                <div className="flex items-center justify-between mb-4">
                  <div 
                    className={`w-12 h-12 rounded-xl flex items-center justify-center ${
                      card.color === 'blue' ? 'text-blue-300 bg-blue-500/20 border-blue-400/40' :
                      card.color === 'emerald' ? 'text-emerald-300 bg-emerald-500/20 border-emerald-400/40' :
                      'text-purple-300 bg-purple-500/20 border-purple-400/40'
                    } border`}
                    style={{
                      boxShadow: `inset 4px 4px 8px rgba(15, 23, 42, 0.6), inset -4px -4px 8px rgba(71, 85, 105, 0.2)`
                    }}
                  >
                    <Icon className="w-6 h-6" />
                  </div>
                  <div className={`w-2 h-2 rounded-full ${
                    card.color === 'blue' ? 'bg-blue-400' :
                    card.color === 'emerald' ? 'bg-emerald-400' :
                    'bg-purple-400'
                  } animate-pulse`}></div>
                </div>
                <div className="text-2xl font-bold text-white mb-1">{card.value}</div>
                <div className="text-slate-400 text-sm">{card.title}</div>
              </div>
            );
          })}
        </div>
      </div>

      <div>
        <h3 className="text-lg font-semibold text-white mb-4">Neumorphic Input Fields</h3>
        <div className="space-y-4 max-w-md">
          {['Email', 'Password', 'Message'].map((field, idx) => (
            <div key={field}>
              <label className="block text-sm font-medium text-slate-300 mb-2">{field}</label>
              {field === 'Message' ? (
                <textarea
                  placeholder={`Enter your ${field.toLowerCase()}...`}
                  rows={3}
                  className="w-full p-4 rounded-xl bg-transparent border-0 text-white placeholder-slate-500 resize-none focus:outline-none"
                  style={{
                    background: `linear-gradient(145deg, rgba(30, 41, 59, 0.8), rgba(51, 65, 85, 0.6))`,
                    boxShadow: `
                      inset 8px 8px 16px rgba(15, 23, 42, 0.8),
                      inset -8px -8px 16px rgba(71, 85, 105, 0.3)
                    `
                  }}
                />
              ) : (
                <input
                  type={field === 'Password' ? 'password' : 'text'}
                  placeholder={`Enter your ${field.toLowerCase()}...`}
                  className="w-full p-4 rounded-xl bg-transparent border-0 text-white placeholder-slate-500 focus:outline-none"
                  style={{
                    background: `linear-gradient(145deg, rgba(30, 41, 59, 0.8), rgba(51, 65, 85, 0.6))`,
                    boxShadow: `
                      inset 8px 8px 16px rgba(15, 23, 42, 0.8),
                      inset -8px -8px 16px rgba(71, 85, 105, 0.3)
                    `
                  }}
                />
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );

  // BEGIN ROUTE COMPONENT WRAPPER (added)
  const ComponentGalleryRoute: React.FC = () => {
  const [activeTab, setActiveTab] = useState<string>('buttons');

  const tabs = [
    { id: 'buttons', label: 'Buttons', component: ButtonShowcase },
    { id: 'badges', label: 'Badges', component: BadgeShowcase },
    { id: 'cards', label: 'Cards', component: CardShowcase },
    { id: 'neumorphism', label: 'Neumorphism', component: NeumorphismShowcase },
    { id: 'animations', label: 'Animations', component: AnimationShowcase },
    { id: 'overlays', label: 'Overlays', component: OverlaysShowcase },
    { id: 'forms', label: 'Forms', component: FormsShowcase },
    { id: 'pickers', label: 'Pickers', component: PickersShowcase },
    { id: 'filters', label: 'Filters', component: FiltersShowcase },
    { id: 'kpis', label: 'KPIs', component: KpiShowcase }
  ];

  const ActiveComponent = tabs.find(tab => tab.id === activeTab)?.component || ButtonShowcase;

  return (
    <div className="p-6 space-y-8">
      {/* Tab Navigation */}
      <div className="flex flex-wrap gap-2">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`px-4 py-2 rounded-lg font-medium transition-colors ${
              activeTab === tab.id
                ? 'bg-cyan-500/20 border border-cyan-500/30 text-cyan-400'
                : 'bg-zinc-900/50 border border-zinc-800 text-zinc-400 hover:text-white hover:border-zinc-700'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Content */}
      <div className="bg-zinc-900/30 backdrop-blur-sm border border-zinc-800 rounded-xl p-8">
        <ActiveComponent />
      </div>

      {/* Fun Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-gradient-to-br from-pink-500/10 to-purple-500/10 border border-pink-500/30 rounded-xl p-6">
          <div className="flex items-center gap-3 mb-4">
            <Heart className="w-6 h-6 text-pink-400 animate-pulse" />
            <h3 className="text-lg font-bold text-white">Made with Love</h3>
          </div>
          <p className="text-zinc-300 text-sm">Every component is crafted with attention to detail and user experience in mind.</p>
        </div>

        <div className="bg-gradient-to-br from-cyan-500/10 to-blue-500/10 border border-cyan-500/30 rounded-xl p-6">
          <div className="flex items-center gap-3 mb-4">
            <Sparkles className="w-6 h-6 text-cyan-400" />
            <h3 className="text-lg font-bold text-white">Interactive</h3>
          </div>
          <p className="text-zinc-300 text-sm">All components include hover states, animations, and smooth transitions for better UX.</p>
        </div>

        <div className="bg-gradient-to-br from-emerald-500/10 to-teal-500/10 border border-emerald-500/30 rounded-xl p-6">
          <div className="flex items-center gap-3 mb-4">
            <Zap className="w-6 h-6 text-emerald-400" />
            <h3 className="text-lg font-bold text-white">Fast & Light</h3>
          </div>
          <p className="text-zinc-300 text-sm">Optimized for performance with minimal CSS and efficient animations.</p>
        </div>
      </div>
    </div>
  );
}; // end ComponentGalleryRoute

export default ComponentGalleryRoute;
