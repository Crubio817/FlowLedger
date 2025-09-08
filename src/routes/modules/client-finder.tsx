import React from 'react';
import { PageTitleEditorial } from '../../components/PageTitles.tsx';
import { Search, Users, Sparkles, Target, Building2, MapPin, Phone, Mail, ExternalLink } from 'lucide-react';
import { Button } from '../../ui/button.tsx';
import { Input } from '../../ui/input.tsx';
import type { Module } from '../../services/api.ts';

interface ClientFinderModuleProps {
  module: Module;
}

export default function ClientFinderModule({ module }: ClientFinderModuleProps) {
  const [search, setSearch] = React.useState('');
  const [selectedIndustry, setSelectedIndustry] = React.useState('');
  const [selectedLocation, setSelectedLocation] = React.useState('');

  return (
    <div className="p-6 space-y-6">
      <PageTitleEditorial
        eyebrow={`${module.scope} Module`}
        title="Client Finder"
        subtitle="Advanced client prospecting and discovery tools to expand your business network"
      />
      
      {/* Main Content with Module-Themed Glow */}
      <div className="relative">
        {/* Glow Effect using module color */}
        <div 
          className="absolute -inset-4 opacity-10 rounded-2xl blur-xl"
          style={{ backgroundColor: module.color }}
        />
        <div 
          className="absolute -inset-2 opacity-20 rounded-xl blur-lg"
          style={{ backgroundColor: module.color }}
        />
        
        {/* Content Container */}
        <div 
          className="relative bg-[#181818] rounded-xl p-8 backdrop-blur-sm border"
          style={{ borderColor: `${module.color}20` }}
        >
          {/* Search Section */}
          <div className="space-y-6">
            <div className="flex items-center gap-3 mb-6">
              <div 
                className="p-3 rounded-lg"
                style={{ backgroundColor: `${module.color}20` }}
              >
                <Search size={24} style={{ color: module.color }} />
              </div>
              <div>
                <h3 className="text-lg font-semibold">Find Your Next Client</h3>
                <p className="text-sm text-[var(--text-2)]">Discover and connect with potential clients in your industry</p>
              </div>
            </div>

            {/* Search Form */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div className="md:col-span-2">
                <div className="relative">
                  <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--text-2)]" />
                  <Input 
                    value={search} 
                    onChange={e => setSearch(e.target.value)}
                    placeholder="Search by company name, industry, or location..."
                    className="pl-10 h-12 text-base"
                  />
                </div>
              </div>
              
              <select 
                value={selectedIndustry}
                onChange={e => setSelectedIndustry(e.target.value)}
                className="h-12 px-3 bg-[var(--bg-subtle)] border border-[var(--border-subtle)] rounded-lg text-white focus:outline-none focus:border-[var(--module-accent)]"
              >
                <option value="">All Industries</option>
                <option value="technology">Technology</option>
                <option value="finance">Finance</option>
                <option value="healthcare">Healthcare</option>
                <option value="manufacturing">Manufacturing</option>
                <option value="retail">Retail</option>
                <option value="consulting">Consulting</option>
              </select>
              
              <Button 
                variant="primary" 
                size="lg" 
                className="h-12"
                style={{ backgroundColor: module.color, borderColor: module.color }}
              >
                <Target size={16} />
                Find Clients
              </Button>
            </div>

            {/* Advanced Filters */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 p-4 bg-[var(--bg-subtle)] rounded-lg border border-[var(--border-subtle)]">
              <div>
                <label className="block text-xs text-[var(--text-2)] mb-2">Location</label>
                <select 
                  value={selectedLocation}
                  onChange={e => setSelectedLocation(e.target.value)}
                  className="w-full px-3 py-2 bg-[#181818] border border-[var(--border-subtle)] rounded text-white focus:outline-none focus:border-[var(--module-accent)]"
                >
                  <option value="">Any Location</option>
                  <option value="us">United States</option>
                  <option value="ca">Canada</option>
                  <option value="uk">United Kingdom</option>
                  <option value="au">Australia</option>
                </select>
              </div>
              
              <div>
                <label className="block text-xs text-[var(--text-2)] mb-2">Company Size</label>
                <select className="w-full px-3 py-2 bg-[#181818] border border-[var(--border-subtle)] rounded text-white focus:outline-none focus:border-[var(--module-accent)]">
                  <option value="">Any Size</option>
                  <option value="startup">Startup (1-10)</option>
                  <option value="small">Small (11-50)</option>
                  <option value="medium">Medium (51-200)</option>
                  <option value="large">Large (201+)</option>
                </select>
              </div>
              
              <div>
                <label className="block text-xs text-[var(--text-2)] mb-2">Revenue Range</label>
                <select className="w-full px-3 py-2 bg-[#181818] border border-[var(--border-subtle)] rounded text-white focus:outline-none focus:border-[var(--module-accent)]">
                  <option value="">Any Revenue</option>
                  <option value="1m">$1M - $10M</option>
                  <option value="10m">$10M - $50M</option>
                  <option value="50m">$50M - $100M</option>
                  <option value="100m">$100M+</option>
                </select>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Feature Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <FeatureCard
          icon={<Users size={20} />}
          title="Company Database"
          description="Access millions of company profiles with detailed business information"
          badge="Pro Feature"
          moduleColor={module.color}
        />
        <FeatureCard
          icon={<Target size={20} />}
          title="Lead Scoring"
          description="AI-powered lead qualification to identify your best prospects"
          badge="Coming Soon"
          moduleColor={module.color}
        />
        <FeatureCard
          icon={<Sparkles size={20} />}
          title="Smart Matching"
          description="Intelligent recommendations based on your ideal client profile"
          badge="Beta"
          moduleColor={module.color}
        />
      </div>

      {/* Sample Results */}
      <div className="space-y-4">
        <h3 className="text-lg font-semibold">Sample Results</h3>
        <div className="grid gap-4">
          <SampleCompanyCard moduleColor={module.color} />
          <SampleCompanyCard moduleColor={module.color} isHighlighted />
          <SampleCompanyCard moduleColor={module.color} />
        </div>
      </div>

      {/* Module Status */}
      <div 
        className="p-6 rounded-lg border"
        style={{ 
          backgroundColor: `${module.color}10`,
          borderColor: `${module.color}30`
        }}
      >
        <div className="flex items-center justify-between">
          <div>
            <h4 className="font-medium mb-1">Module Status</h4>
            <p className="text-sm text-[var(--text-2)]">This is a specialized client discovery module with advanced search capabilities</p>
          </div>
          <div 
            className="flex items-center gap-2 px-3 py-1 rounded-full text-xs border"
            style={{
              backgroundColor: `${module.color}20`,
              borderColor: `${module.color}40`,
              color: module.color
            }}
          >
            <div 
              className="w-2 h-2 rounded-full animate-pulse"
              style={{ backgroundColor: module.color }}
            />
            Active Module
          </div>
        </div>
      </div>
    </div>
  );
}

interface FeatureCardProps {
  icon: React.ReactNode;
  title: string;
  description: string;
  badge?: string;
  moduleColor: string;
}

function FeatureCard({ icon, title, description, badge, moduleColor }: FeatureCardProps) {
  return (
    <div className="p-6 bg-[var(--bg-subtle)] rounded-lg border border-[var(--border-subtle)] hover:border-opacity-50 transition-all duration-200 group"
         style={{ '--hover-border': `${moduleColor}50` } as React.CSSProperties}>
      <div className="flex items-start justify-between mb-4">
        <div 
          className="p-2 rounded-lg group-hover:opacity-80 transition-opacity"
          style={{ backgroundColor: `${moduleColor}20`, color: moduleColor }}
        >
          {icon}
        </div>
        {badge && (
          <span 
            className="text-xs px-2 py-1 rounded-full border"
            style={{ 
              backgroundColor: `${moduleColor}15`,
              borderColor: `${moduleColor}30`,
              color: moduleColor
            }}
          >
            {badge}
          </span>
        )}
      </div>
      <h5 className="font-medium mb-2">{title}</h5>
      <p className="text-sm text-[var(--text-2)]">{description}</p>
    </div>
  );
}

function SampleCompanyCard({ moduleColor, isHighlighted = false }: { moduleColor: string; isHighlighted?: boolean }) {
  const companies = [
    {
      name: "TechFlow Solutions",
      industry: "Technology",
      location: "San Francisco, CA",
      employees: "150-200",
      revenue: "$25M - $50M",
      description: "Cloud infrastructure and DevOps consulting for enterprise clients"
    },
    {
      name: "Green Energy Corp",
      industry: "Energy",
      location: "Austin, TX",
      employees: "75-100",
      revenue: "$10M - $25M",
      description: "Renewable energy solutions and sustainability consulting"
    },
    {
      name: "FinServ Analytics",
      industry: "Finance",
      location: "New York, NY",
      employees: "200-500",
      revenue: "$50M - $100M",
      description: "Financial data analytics and risk management solutions"
    }
  ];

  const company = companies[Math.floor(Math.random() * companies.length)];

  return (
    <div 
      className={`p-4 rounded-lg border transition-all duration-200 ${
        isHighlighted 
          ? 'bg-[#1a1a1a] border-opacity-50' 
          : 'bg-[var(--bg-subtle)] border-[var(--border-subtle)] hover:border-opacity-50'
      }`}
      style={isHighlighted ? { borderColor: `${moduleColor}50` } : {}}
    >
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <div className="flex items-center gap-3 mb-2">
            <div 
              className="p-2 rounded"
              style={{ backgroundColor: `${moduleColor}20` }}
            >
              <Building2 size={16} style={{ color: moduleColor }} />
            </div>
            <div>
              <h4 className="font-medium">{company.name}</h4>
              <p className="text-xs text-[var(--text-2)]">{company.industry}</p>
            </div>
          </div>
          
          <p className="text-sm text-[var(--text-2)] mb-3">{company.description}</p>
          
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-xs">
            <div className="flex items-center gap-2">
              <MapPin size={12} className="text-[var(--text-2)]" />
              <span>{company.location}</span>
            </div>
            <div className="flex items-center gap-2">
              <Users size={12} className="text-[var(--text-2)]" />
              <span>{company.employees} employees</span>
            </div>
            <div className="flex items-center gap-2">
              <Target size={12} className="text-[var(--text-2)]" />
              <span>{company.revenue}</span>
            </div>
            <div className="flex items-center gap-2">
              <span 
                className="px-2 py-1 rounded text-xs"
                style={{ 
                  backgroundColor: `${moduleColor}20`,
                  color: moduleColor
                }}
              >
                {isHighlighted ? 'High Match' : 'Good Match'}
              </span>
            </div>
          </div>
        </div>
        
        <div className="flex items-center gap-2 ml-4">
          <Button variant="ghost" size="sm">
            <Mail size={14} />
          </Button>
          <Button variant="ghost" size="sm">
            <Phone size={14} />
          </Button>
          <Button variant="ghost" size="sm">
            <ExternalLink size={14} />
          </Button>
        </div>
      </div>
    </div>
  );
}
