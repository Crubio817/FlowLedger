import React from 'react';
import { 
  X,
  DollarSign,
  TrendingUp,
  Calculator,
  Info,
  Star,
  Zap,
  Award,
  BarChart3
} from 'lucide-react';
import { Dialog, DialogContent, DialogBody } from '../ui/dialog.tsx';
import { Button } from '../ui/button.tsx';

interface RateBreakdown {
  currency: string;
  base: number;
  abs_premiums: Array<{source: string; amount: number}>;
  pct_premiums: Array<{source: string; percentage: number}>;
  scarcity: number;
  total: number;
  override_source?: string;
}

interface RateBreakdownModalProps {
  rate: RateBreakdown | null;
  isOpen: boolean;
  onClose: () => void;
  personName?: string;
  roleTitle?: string;
}

export const RateBreakdownModal: React.FC<RateBreakdownModalProps> = ({
  rate,
  isOpen,
  onClose,
  personName = 'Candidate',
  roleTitle = 'Role'
}) => {
  if (!isOpen || !rate) return null;

  const getCurrencySymbol = (currency: string) => {
    switch (currency) {
      case 'USD': return '$';
      case 'EUR': return '€';
      case 'GBP': return '£';
      default: return currency;
    }
  };

  const getSourceIcon = (source: string) => {
    const lower = source.toLowerCase();
    if (lower.includes('skill') || lower.includes('expert')) return <Star className="text-amber-400" size={16} />;
    if (lower.includes('senior') || lower.includes('level')) return <Award className="text-purple-400" size={16} />;
    if (lower.includes('scarcity') || lower.includes('market')) return <TrendingUp className="text-red-400" size={16} />;
    if (lower.includes('premium') || lower.includes('bonus')) return <Zap className="text-cyan-400" size={16} />;
    return <BarChart3 className="text-blue-400" size={16} />;
  };

  // Calculate intermediate totals
  const baseWithAbsPremiums = rate.base + rate.abs_premiums.reduce((sum, p) => sum + p.amount, 0);
  const totalPctMultiplier = rate.pct_premiums.reduce((mult, p) => mult * (1 + p.percentage / 100), 1);
  const afterPctPremiums = baseWithAbsPremiums * totalPctMultiplier;
  const finalTotal = afterPctPremiums * rate.scarcity;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl bg-zinc-950 border-zinc-800">
        <div className="bg-gradient-to-r from-amber-500/10 to-yellow-500/10 border border-amber-500/20 rounded-xl p-6 mb-6">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-2xl font-bold text-white mb-2 flex items-center gap-3">
                <Calculator className="text-amber-400" size={28} />
                Rate Breakdown
              </h2>
              <p className="text-zinc-400">
                Detailed rate calculation for {personName} • {roleTitle}
              </p>
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={onClose}
              className="text-zinc-400 hover:text-white"
            >
              <X size={20} />
            </Button>
          </div>
        </div>

        <DialogBody>
          <div className="space-y-6">
            {/* Base Rate */}
            <div className="bg-zinc-900/50 backdrop-blur border border-zinc-800 rounded-xl p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-white flex items-center gap-2">
                  <DollarSign className="text-[#4997D0]" size={20} />
                  Base Rate
                </h3>
                <div className="text-2xl font-bold text-white">
                  {getCurrencySymbol(rate.currency)}{rate.base.toFixed(0)}
                </div>
              </div>
              <p className="text-zinc-400 text-sm">
                Standard hourly rate based on experience level and role requirements
              </p>
            </div>

            {/* Absolute Premiums */}
            {rate.abs_premiums.length > 0 && (
              <div className="bg-zinc-900/50 backdrop-blur border border-zinc-800 rounded-xl p-6">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-semibold text-white flex items-center gap-2">
                    <Star className="text-amber-400" size={20} />
                    Skill Premiums
                  </h3>
                  <div className="text-lg font-semibold text-emerald-400">
                    +{getCurrencySymbol(rate.currency)}{rate.abs_premiums.reduce((sum, p) => sum + p.amount, 0)}
                  </div>
                </div>
                <div className="space-y-3">
                  {rate.abs_premiums.map((premium, idx) => (
                    <div key={idx} className="flex items-center justify-between p-3 bg-zinc-800/30 rounded-lg">
                      <div className="flex items-center gap-3">
                        {getSourceIcon(premium.source)}
                        <span className="text-zinc-300">{premium.source}</span>
                      </div>
                      <span className="text-emerald-400 font-medium">
                        +{getCurrencySymbol(rate.currency)}{premium.amount}
                      </span>
                    </div>
                  ))}
                </div>
                <div className="mt-4 p-3 bg-zinc-800/50 rounded-lg border border-zinc-700/50">
                  <div className="flex justify-between text-sm">
                    <span className="text-zinc-400">Subtotal after premiums:</span>
                    <span className="text-white font-medium">
                      {getCurrencySymbol(rate.currency)}{baseWithAbsPremiums.toFixed(0)}
                    </span>
                  </div>
                </div>
              </div>
            )}

            {/* Percentage Premiums */}
            {rate.pct_premiums.length > 0 && (
              <div className="bg-zinc-900/50 backdrop-blur border border-zinc-800 rounded-xl p-6">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-semibold text-white flex items-center gap-2">
                    <TrendingUp className="text-blue-400" size={20} />
                    Market Adjustments
                  </h3>
                  <div className="text-lg font-semibold text-blue-400">
                    ×{totalPctMultiplier.toFixed(2)}
                  </div>
                </div>
                <div className="space-y-3">
                  {rate.pct_premiums.map((premium, idx) => (
                    <div key={idx} className="flex items-center justify-between p-3 bg-zinc-800/30 rounded-lg">
                      <div className="flex items-center gap-3">
                        {getSourceIcon(premium.source)}
                        <span className="text-zinc-300">{premium.source}</span>
                      </div>
                      <span className="text-blue-400 font-medium">
                        +{premium.percentage}%
                      </span>
                    </div>
                  ))}
                </div>
                <div className="mt-4 p-3 bg-zinc-800/50 rounded-lg border border-zinc-700/50">
                  <div className="flex justify-between text-sm">
                    <span className="text-zinc-400">After market adjustments:</span>
                    <span className="text-white font-medium">
                      {getCurrencySymbol(rate.currency)}{afterPctPremiums.toFixed(0)}
                    </span>
                  </div>
                </div>
              </div>
            )}

            {/* Scarcity Multiplier */}
            {rate.scarcity !== 1 && (
              <div className="bg-zinc-900/50 backdrop-blur border border-zinc-800 rounded-xl p-6">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-semibold text-white flex items-center gap-2">
                    <Zap className="text-red-400" size={20} />
                    Scarcity Factor
                  </h3>
                  <div className="text-lg font-semibold text-red-400">
                    ×{rate.scarcity.toFixed(2)}
                  </div>
                </div>
                <p className="text-zinc-400 text-sm mb-3">
                  Market demand adjustment based on skill availability and timing urgency
                </p>
                <div className="p-3 bg-zinc-800/30 rounded-lg border border-red-500/20">
                  <div className="flex items-center gap-2 mb-2">
                    <Info className="text-red-400" size={16} />
                    <span className="text-red-400 font-medium">High Demand Skills</span>
                  </div>
                  <p className="text-zinc-300 text-sm">
                    Current market conditions indicate {rate.scarcity > 1 ? 'high demand' : 'balanced supply'} for this skill set
                  </p>
                </div>
              </div>
            )}

            {/* Override Notice */}
            {rate.override_source && (
              <div className="bg-amber-500/10 border border-amber-500/20 rounded-xl p-4">
                <div className="flex items-center gap-2 mb-2">
                  <Info className="text-amber-400" size={16} />
                  <span className="text-amber-400 font-medium">Rate Override Applied</span>
                </div>
                <p className="text-zinc-300 text-sm">
                  This rate has been overridden by: <span className="font-medium">{rate.override_source}</span>
                </p>
              </div>
            )}

            {/* Final Total */}
            <div className="bg-gradient-to-r from-[#4997D0]/10 to-cyan-500/10 border border-[#4997D0]/20 rounded-xl p-6">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-xl font-bold text-white mb-2">Final Hourly Rate</h3>
                  <p className="text-zinc-400 text-sm">
                    All premiums and adjustments applied
                  </p>
                </div>
                <div className="text-right">
                  <div className="text-3xl font-bold text-[#4997D0] mb-1">
                    {getCurrencySymbol(rate.currency)}{rate.total}/hr
                  </div>
                  <div className="text-zinc-400 text-sm">
                    {rate.total !== finalTotal && (
                      <span className="text-amber-400">
                        (Calculated: {getCurrencySymbol(rate.currency)}{finalTotal.toFixed(0)})
                      </span>
                    )}
                  </div>
                </div>
              </div>
            </div>

            {/* Calculation Summary */}
            <div className="bg-zinc-900/30 border border-zinc-800/50 rounded-xl p-4">
              <h4 className="text-sm font-medium text-zinc-300 mb-3 flex items-center gap-2">
                <Calculator size={14} />
                Calculation Summary
              </h4>
              <div className="space-y-2 text-sm font-mono">
                <div className="flex justify-between">
                  <span className="text-zinc-400">Base Rate:</span>
                  <span className="text-white">{getCurrencySymbol(rate.currency)}{rate.base}</span>
                </div>
                {rate.abs_premiums.length > 0 && (
                  <div className="flex justify-between">
                    <span className="text-zinc-400">+ Skill Premiums:</span>
                    <span className="text-emerald-400">+{getCurrencySymbol(rate.currency)}{rate.abs_premiums.reduce((sum, p) => sum + p.amount, 0)}</span>
                  </div>
                )}
                {rate.pct_premiums.length > 0 && (
                  <div className="flex justify-between">
                    <span className="text-zinc-400">× Market Adjustments:</span>
                    <span className="text-blue-400">×{totalPctMultiplier.toFixed(2)}</span>
                  </div>
                )}
                {rate.scarcity !== 1 && (
                  <div className="flex justify-between">
                    <span className="text-zinc-400">× Scarcity Factor:</span>
                    <span className="text-red-400">×{rate.scarcity.toFixed(2)}</span>
                  </div>
                )}
                <div className="border-t border-zinc-700 pt-2 mt-2">
                  <div className="flex justify-between font-bold">
                    <span className="text-white">Final Rate:</span>
                    <span className="text-[#4997D0]">{getCurrencySymbol(rate.currency)}{rate.total}/hr</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Actions */}
            <div className="flex gap-3">
              <Button
                onClick={onClose}
                variant="outline"
                className="flex-1"
              >
                Close
              </Button>
              <Button
                onClick={() => {
                  // Export or save rate breakdown
                  const breakdown = {
                    person: personName,
                    role: roleTitle,
                    rate: rate,
                    timestamp: new Date().toISOString()
                  };
                  console.log('Rate breakdown:', breakdown);
                }}
                className="bg-gradient-to-r from-[#4997D0] to-cyan-500"
              >
                Export Details
              </Button>
            </div>
          </div>
        </DialogBody>
      </DialogContent>
    </Dialog>
  );
};
