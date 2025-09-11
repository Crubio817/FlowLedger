import React, { useState, useEffect, useRef } from 'react';
import { 
  TrendingUp,
  TrendingDown,
  DollarSign,
  Bitcoin,
  Wallet,
  BarChart3,
  PieChart,
  Activity,
  Zap,
  Shield,
  Globe,
  Users,
  Clock,
  Star,
  Heart,
  Eye,
  ArrowUpRight,
  ArrowDownRight,
  Plus,
  Minus,
  Settings,
  RefreshCw,
  Download,
  Upload,
  Lock,
  Unlock,
  Target,
  Flame,
  Sparkles,
  Crown,
  Gem,
  Rocket,
  Zap as Lightning,
  Coins
} from 'lucide-react';
import { PageTitleEditorial } from '../components/PageTitles.tsx';

const Web3DashboardRoute: React.FC = () => {
  const [btcPrice, setBtcPrice] = useState(45230.67);
  const [ethPrice, setEthPrice] = useState(3120.45);
  const [portfolioValue, setPortfolioValue] = useState(124580.23);
  const [dayChange, setDayChange] = useState(2.34);
  const [stakingRewards, setStakingRewards] = useState(1.247);
  const [gasPrice, setGasPrice] = useState(45);
  const chartRef = useRef<HTMLCanvasElement>(null);

  // Mock crypto data
  const cryptos = [
    { symbol: 'BTC', name: 'Bitcoin', price: btcPrice, change: 2.34, icon: Bitcoin, color: '#f7931a' },
    { symbol: 'ETH', name: 'Ethereum', price: ethPrice, change: -1.23, icon: Gem, color: '#627eea' },
    { symbol: 'ADA', name: 'Cardano', price: 0.8945, change: 5.67, icon: Heart, color: '#0033ad' },
    { symbol: 'SOL', name: 'Solana', price: 89.12, change: 3.45, icon: Sparkles, color: '#00d4aa' },
    { symbol: 'DOT', name: 'Polkadot', price: 15.67, change: -0.89, icon: Target, color: '#e6007a' },
    { symbol: 'MATIC', name: 'Polygon', price: 1.23, change: 7.89, icon: Lightning, color: '#8247e5' }
  ];

  const nfts = [
    { name: 'CryptoPunk #1234', collection: 'CryptoPunks', price: 89.5, image: '🎭' },
    { name: 'Bored Ape #5678', collection: 'BAYC', price: 65.2, image: '🐵' },
    { name: 'Doodle #9012', collection: 'Doodles', price: 12.8, image: '✨' },
    { name: 'Cool Cat #3456', collection: 'Cool Cats', price: 8.7, image: '😎' }
  ];

  // Simulate real-time price updates
  useEffect(() => {
    const interval = setInterval(() => {
      setBtcPrice(prev => prev + (Math.random() - 0.5) * 1000);
      setEthPrice(prev => prev + (Math.random() - 0.5) * 100);
      setPortfolioValue(prev => prev + (Math.random() - 0.5) * 5000);
      setDayChange(prev => prev + (Math.random() - 0.5) * 2);
      setStakingRewards(prev => prev + Math.random() * 0.01);
      setGasPrice(prev => Math.max(10, prev + (Math.random() - 0.5) * 20));
    }, 3000);
    return () => clearInterval(interval);
  }, []);

  // Chart animation
  useEffect(() => {
    const canvas = chartRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    canvas.width = canvas.offsetWidth;
    canvas.height = canvas.offsetHeight;

    const points: number[] = [];
    for (let i = 0; i < 50; i++) {
      points.push(Math.random() * canvas.height * 0.8 + canvas.height * 0.1);
    }

    let animationFrame: number;
    let offset = 0;

    const draw = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      // Gradient background
      const gradient = ctx.createLinearGradient(0, 0, 0, canvas.height);
      gradient.addColorStop(0, 'rgba(34, 197, 94, 0.2)');
      gradient.addColorStop(1, 'rgba(34, 197, 94, 0.0)');

      // Draw line
      ctx.beginPath();
      ctx.strokeStyle = '#22c55e';
      ctx.lineWidth = 3;
      ctx.lineJoin = 'round';

      const step = canvas.width / (points.length - 1);
      
      for (let i = 0; i < points.length; i++) {
        const x = i * step;
        const y = points[i] + Math.sin((i + offset) * 0.1) * 20;
        
        if (i === 0) {
          ctx.moveTo(x, y);
        } else {
          ctx.lineTo(x, y);
        }
      }
      ctx.stroke();

      // Fill area under curve
      ctx.lineTo(canvas.width, canvas.height);
      ctx.lineTo(0, canvas.height);
      ctx.closePath();
      ctx.fillStyle = gradient;
      ctx.fill();

      offset += 0.5;
      animationFrame = requestAnimationFrame(draw);
    };

    draw();
    return () => cancelAnimationFrame(animationFrame);
  }, []);

  // Portfolio Overview
  const PortfolioOverview = () => (
    <div className="bg-gradient-to-br from-purple-900/50 to-blue-900/50 border border-purple-500/30 rounded-2xl p-6 backdrop-blur-lg">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-xl font-bold text-white">Portfolio Overview</h3>
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 bg-green-400 rounded-full animate-pulse"></div>
          <span className="text-green-400 text-sm font-medium">Live</span>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Total Value */}
        <div>
          <p className="text-zinc-400 text-sm mb-1">Total Portfolio Value</p>
          <p className="text-3xl font-bold text-white mb-2">
            ${portfolioValue.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
          </p>
          <div className={`flex items-center gap-1 ${dayChange >= 0 ? 'text-green-400' : 'text-red-400'}`}>
            {dayChange >= 0 ? <TrendingUp className="w-4 h-4" /> : <TrendingDown className="w-4 h-4" />}
            <span className="text-sm font-medium">
              {dayChange >= 0 ? '+' : ''}{dayChange.toFixed(2)}% (24h)
            </span>
          </div>
        </div>

        {/* Staking Rewards */}
        <div>
          <p className="text-zinc-400 text-sm mb-1">Staking Rewards</p>
          <p className="text-2xl font-bold text-yellow-400 mb-2">
            {stakingRewards.toFixed(3)} ETH
          </p>
          <div className="flex items-center gap-1 text-yellow-400">
            <Zap className="w-4 h-4" />
            <span className="text-sm font-medium">Auto-compound</span>
          </div>
        </div>

        {/* Gas Tracker */}
        <div>
          <p className="text-zinc-400 text-sm mb-1">Gas Price</p>
          <p className="text-2xl font-bold text-orange-400 mb-2">{gasPrice} gwei</p>
          <div className={`flex items-center gap-1 ${gasPrice < 50 ? 'text-green-400' : gasPrice < 100 ? 'text-yellow-400' : 'text-red-400'}`}>
            <Activity className="w-4 h-4" />
            <span className="text-sm font-medium">
              {gasPrice < 50 ? 'Low' : gasPrice < 100 ? 'Medium' : 'High'}
            </span>
          </div>
        </div>
      </div>

      {/* Chart */}
      <div className="mt-6">
        <canvas ref={chartRef} className="w-full h-32"></canvas>
      </div>
    </div>
  );

  // Crypto List
  const CryptoList = () => (
    <div className="bg-black/40 border border-cyan-500/30 rounded-2xl p-6 backdrop-blur-lg">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-xl font-bold text-white">Your Crypto</h3>
          <button className="px-4 py-2 bg-cyan-500/20 border border-cyan-500 text-cyan-400 rounded-xl hover:bg-cyan-500/30 transition-all duration-300">
            <Plus className="w-4 h-4" />
          </button>
      </div>

      <div className="space-y-4">
        {cryptos.map((crypto, i) => (
          <div key={i} className="flex items-center justify-between p-4 bg-zinc-900/50 rounded-xl border border-zinc-800 hover:border-zinc-700 transition-all duration-300">
            <div className="flex items-center gap-4">
              <div 
                className="p-3 rounded-xl"
                style={{ backgroundColor: `${crypto.color}20`, border: `1px solid ${crypto.color}50` }}
              >
                <crypto.icon className="w-6 h-6" style={{ color: crypto.color }} />
              </div>
              <div>
                <p className="font-bold text-white">{crypto.symbol}</p>
                <p className="text-sm text-zinc-400">{crypto.name}</p>
              </div>
            </div>

            <div className="text-right">
              <p className="font-bold text-white">
                ${crypto.price.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
              </p>
              <div className={`flex items-center gap-1 justify-end ${crypto.change >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                {crypto.change >= 0 ? <ArrowUpRight className="w-4 h-4" /> : <ArrowDownRight className="w-4 h-4" />}
                <span className="text-sm">
                  {crypto.change >= 0 ? '+' : ''}{crypto.change.toFixed(2)}%
                </span>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );

  // DeFi Protocol Cards
  const DeFiProtocols = () => (
    <div className="space-y-6">
      <h3 className="text-xl font-bold text-white">DeFi Protocols</h3>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Uniswap */}
        <div className="bg-gradient-to-br from-pink-900/50 to-purple-900/50 border border-pink-500/30 rounded-2xl p-6 backdrop-blur-lg">
          <div className="flex items-center gap-3 mb-4">
            <div className="p-3 bg-pink-500/20 border border-pink-500/50 rounded-xl">
              <Sparkles className="w-6 h-6 text-pink-400" />
            </div>
            <div>
              <h4 className="font-bold text-white">Uniswap V3</h4>
              <p className="text-sm text-zinc-400">Liquidity Pool</p>
            </div>
          </div>
          
          <div className="space-y-3">
            <div className="flex justify-between">
              <span className="text-zinc-400">Liquidity</span>
              <span className="text-white font-medium">$12,450</span>
            </div>
            <div className="flex justify-between">
              <span className="text-zinc-400">APY</span>
              <span className="text-green-400 font-medium">24.5%</span>
            </div>
            <div className="flex justify-between">
              <span className="text-zinc-400">Fees Earned</span>
              <span className="text-pink-400 font-medium">$234.67</span>
            </div>
          </div>
        </div>

        {/* Compound */}
        <div className="bg-gradient-to-br from-green-900/50 to-emerald-900/50 border border-green-500/30 rounded-2xl p-6 backdrop-blur-lg">
          <div className="flex items-center gap-3 mb-4">
            <div className="p-3 bg-green-500/20 border border-green-500/50 rounded-xl">
              <Target className="w-6 h-6 text-green-400" />
            </div>
            <div>
              <h4 className="font-bold text-white">Compound</h4>
              <p className="text-sm text-zinc-400">Lending Pool</p>
            </div>
          </div>
          
          <div className="space-y-3">
            <div className="flex justify-between">
              <span className="text-zinc-400">Supplied</span>
              <span className="text-white font-medium">$8,920</span>
            </div>
            <div className="flex justify-between">
              <span className="text-zinc-400">APY</span>
              <span className="text-green-400 font-medium">12.8%</span>
            </div>
            <div className="flex justify-between">
              <span className="text-zinc-400">Earned</span>
              <span className="text-green-400 font-medium">$89.45</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );

  // NFT Collection
  const NFTCollection = () => (
    <div className="bg-black/40 border border-purple-500/30 rounded-2xl p-6 backdrop-blur-lg">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-xl font-bold text-white">NFT Collection</h3>
        <button className="px-4 py-2 bg-purple-500/20 border border-purple-500 text-purple-400 rounded-xl hover:bg-purple-500/30 transition-all duration-300">
          <Eye className="w-4 h-4" />
        </button>
      </div>

      <div className="grid grid-cols-2 gap-4">
        {nfts.map((nft, i) => (
          <div key={i} className="group cursor-pointer">
            <div className="bg-gradient-to-br from-purple-600 to-pink-600 rounded-2xl p-6 mb-3 hover:scale-105 transition-all duration-300">
              <div className="text-4xl text-center mb-4">{nft.image}</div>
              <div className="text-center">
                <p className="text-white font-bold text-sm mb-1">{nft.name}</p>
                <p className="text-zinc-300 text-xs">{nft.collection}</p>
              </div>
            </div>
            <div className="text-center">
              <p className="text-purple-400 font-bold">{nft.price} ETH</p>
              <p className="text-zinc-400 text-sm">Floor: {(nft.price * 0.8).toFixed(1)} ETH</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );

  // Trading Widget
  const TradingWidget = () => (
    <div className="bg-gradient-to-br from-orange-900/50 to-red-900/50 border border-orange-500/30 rounded-2xl p-6 backdrop-blur-lg">
      <h3 className="text-xl font-bold text-white mb-6">Quick Trade</h3>
      
      <div className="space-y-4">
        {/* From */}
        <div>
          <label className="text-zinc-400 text-sm mb-2 block">From</label>
          <div className="flex items-center gap-3 p-3 bg-black/50 rounded-xl border border-zinc-800">
            <div className="p-2 bg-orange-500/20 rounded-lg">
              <Bitcoin className="w-5 h-5 text-orange-400" />
            </div>
            <div className="flex-1">
              <input 
                type="number" 
                placeholder="0.00"
                className="w-full bg-transparent text-white text-lg font-bold outline-none"
                defaultValue="0.5"
              />
              <p className="text-zinc-400 text-sm">BTC</p>
            </div>
          </div>
        </div>

        {/* Swap Button */}
        <div className="flex justify-center">
          <button className="p-3 bg-zinc-800 hover:bg-zinc-700 rounded-xl transition-all duration-300">
            <ArrowUpRight className="w-5 h-5 text-white rotate-90" />
          </button>
        </div>

        {/* To */}
        <div>
          <label className="text-zinc-400 text-sm mb-2 block">To</label>
          <div className="flex items-center gap-3 p-3 bg-black/50 rounded-xl border border-zinc-800">
            <div className="p-2 bg-blue-500/20 rounded-lg">
              <Gem className="w-5 h-5 text-blue-400" />
            </div>
            <div className="flex-1">
              <input 
                type="number" 
                placeholder="0.00"
                className="w-full bg-transparent text-white text-lg font-bold outline-none"
                value="14.5"
                readOnly
              />
              <p className="text-zinc-400 text-sm">ETH</p>
            </div>
          </div>
        </div>

        {/* Trade Info */}
        <div className="space-y-2 text-sm">
          <div className="flex justify-between text-zinc-400">
            <span>Rate</span>
            <span>1 BTC = 29 ETH</span>
          </div>
          <div className="flex justify-between text-zinc-400">
            <span>Slippage</span>
            <span>0.5%</span>
          </div>
          <div className="flex justify-between text-zinc-400">
            <span>Gas Fee</span>
            <span>~$12.50</span>
          </div>
        </div>

        {/* Trade Button */}
        <button className="w-full py-4 bg-gradient-to-r from-orange-500 to-red-500 text-white font-bold rounded-xl hover:from-orange-600 hover:to-red-600 transition-all duration-300">
          Swap Tokens
        </button>
      </div>
    </div>
  );

  return (
    <div className="p-6 space-y-8 bg-gradient-to-br from-black via-purple-900/20 to-black min-h-screen">
      <PageTitleEditorial
        eyebrow="Web3 Interface"
        title="Crypto Dashboard"
        subtitle="Professional cryptocurrency and DeFi portfolio management interface"
      />

      {/* Portfolio Overview */}
      <section>
        <PortfolioOverview />
      </section>

      {/* Main Grid */}
      <section>
        <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">
          <div className="xl:col-span-2">
            <CryptoList />
          </div>
          <div>
            <TradingWidget />
          </div>
        </div>
      </section>

      {/* DeFi and NFTs */}
      <section>
        <div className="grid grid-cols-1 xl:grid-cols-2 gap-8">
          <DeFiProtocols />
          <NFTCollection />
        </div>
      </section>

      {/* Status Bar */}
      <section>
        <div className="bg-black/60 border border-zinc-800 rounded-2xl p-4 backdrop-blur-lg">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-6">
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 bg-green-400 rounded-full animate-pulse"></div>
                <span className="text-green-400 font-mono">Connected to Ethereum</span>
              </div>
              <div className="flex items-center gap-2">
                <Shield className="w-4 h-4 text-blue-400" />
                <span className="text-blue-400 font-mono">Secure Wallet</span>
              </div>
              <div className="flex items-center gap-2">
                <Activity className="w-4 h-4 text-purple-400" />
                <span className="text-purple-400 font-mono">Live Prices</span>
              </div>
            </div>
            
            <div className="flex items-center gap-4">
              <Rocket className="w-5 h-5 text-cyan-400 animate-pulse" />
              <span className="text-cyan-400 font-mono font-bold">TO THE MOON 🚀</span>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Web3DashboardRoute;
