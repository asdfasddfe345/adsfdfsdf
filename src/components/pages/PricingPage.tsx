import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Check,
  Star,
  Zap,
  Crown,
  Target,
  TrendingUp,
  ArrowRight,
  Sparkles,
  Shield,
  Users,
  CheckCircle,
  Briefcase,
  Layers
} from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { useTheme } from '../../contexts/ThemeContext';
import { FloatingParticles, ChristmasSnow } from '../ui';
import { paymentService } from '../../services/paymentService';
import type { PlanCategory, SubscriptionPlan } from '../../types/payment';

interface PricingPageProps {
  onShowAuth: () => void;
  onShowSubscriptionPlans: (featureId?: string, expandAddons?: boolean) => void;
}

const CATEGORY_CONFIG: { key: PlanCategory; label: string; icon: React.ReactNode }[] = [
  { key: 'combined', label: 'Combined Premium', icon: <Crown className="w-4 h-4" /> },
  { key: 'jd_only', label: 'JD Optimizer Only', icon: <Target className="w-4 h-4" /> },
  { key: 'score_only', label: 'Score Checker Only', icon: <TrendingUp className="w-4 h-4" /> },
  { key: 'combo', label: 'JD + Score Combo', icon: <Layers className="w-4 h-4" /> },
];

const getPlanIcon = (iconType: string) => {
  switch (iconType) {
    case 'crown': return <Crown className="w-6 h-6" />;
    case 'zap': return <Zap className="w-6 h-6" />;
    case 'target': return <Target className="w-6 h-6" />;
    case 'check_circle': return <CheckCircle className="w-6 h-6" />;
    case 'briefcase': return <Briefcase className="w-6 h-6" />;
    default: return <Sparkles className="w-6 h-6" />;
  }
};

export const PricingPage: React.FC<PricingPageProps> = ({
  onShowAuth,
  onShowSubscriptionPlans
}) => {
  const { isAuthenticated } = useAuth();
  const { isChristmasMode } = useTheme();
  const [activeCategory, setActiveCategory] = useState<PlanCategory>('combined');

  const categoryPlans = paymentService.getPlansByCategory(activeCategory);

  return (
    <div className={`min-h-screen relative overflow-hidden ${
      isChristmasMode
        ? 'bg-gradient-to-b from-[#1a0a0f] via-[#0f1a0f] to-[#070b14]'
        : 'bg-gradient-to-b from-[#0a1e1e] via-[#0d1a1a] to-[#070b14]'
    }`}>
      <div className={`pointer-events-none absolute inset-0 ${
        isChristmasMode
          ? 'bg-[radial-gradient(ellipse_at_top,rgba(220,38,38,0.15),transparent_50%),radial-gradient(ellipse_at_bottom_right,rgba(34,197,94,0.15),transparent_50%)]'
          : 'bg-[radial-gradient(ellipse_at_top,rgba(16,185,129,0.15),transparent_50%),radial-gradient(ellipse_at_bottom_right,rgba(6,182,212,0.15),transparent_50%)]'
      }`} />

      <FloatingParticles count={15} />
      {isChristmasMode && <ChristmasSnow count={40} />}

      {/* Hero */}
      <div className="relative z-10 overflow-hidden">
        <div className="container mx-auto px-4 py-16 sm:py-24">
          <div className="text-center max-w-3xl mx-auto">
            <div className={`w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-xl ${
              isChristmasMode
                ? 'bg-gradient-to-br from-red-500 via-yellow-400 to-green-600 shadow-green-500/30'
                : 'bg-gradient-to-br from-emerald-500 to-cyan-500 shadow-emerald-500/30'
            }`}>
              <Crown className="w-8 h-8 text-white" />
            </div>
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold mb-4 leading-tight text-white tracking-tight">
              Choose Your{' '}
              <span className={`bg-gradient-to-r bg-clip-text text-transparent ${
                isChristmasMode
                  ? 'from-red-400 via-yellow-400 to-green-400'
                  : 'from-emerald-400 via-cyan-400 to-teal-400'
              }`}>
                Success Plan
              </span>
            </h1>
            <p className="text-lg sm:text-xl text-slate-300 mb-6 leading-relaxed">
              Flexible pricing for every career stage. Pick a category and find the right fit.
            </p>
          </div>
        </div>
      </div>

      {/* Category Tabs */}
      <div className="relative z-10">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto">
            <div className="flex flex-wrap justify-center gap-2 mb-10">
              {CATEGORY_CONFIG.map((cat) => (
                <button
                  key={cat.key}
                  onClick={() => setActiveCategory(cat.key)}
                  className={`flex items-center gap-2 px-5 py-2.5 rounded-full text-sm font-medium transition-all duration-300 ${
                    activeCategory === cat.key
                      ? 'bg-gradient-to-r from-emerald-500 to-cyan-500 text-white shadow-lg shadow-emerald-500/25'
                      : 'bg-slate-800/60 text-slate-400 hover:bg-slate-700/60 hover:text-slate-200 border border-slate-700/50'
                  }`}
                >
                  {cat.icon}
                  <span>{cat.label}</span>
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Plans */}
      <div className="relative z-10 pb-16">
        <div className="container mx-auto px-4">
          <div className="max-w-6xl mx-auto">
            <AnimatePresence mode="wait">
              <motion.div
                key={activeCategory}
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -16 }}
                transition={{ duration: 0.25 }}
                className={`grid gap-6 ${
                  categoryPlans.length <= 2
                    ? 'grid-cols-1 md:grid-cols-2 max-w-3xl mx-auto'
                    : categoryPlans.length === 3
                      ? 'grid-cols-1 md:grid-cols-3'
                      : 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-4'
                }`}
              >
                {categoryPlans.map((plan, index) => (
                  <motion.div
                    key={plan.id}
                    initial={{ opacity: 0, y: 24 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.4, delay: index * 0.08 }}
                    className={`relative rounded-2xl border backdrop-blur-sm transition-all duration-300 hover:scale-[1.02] ${
                      plan.popular
                        ? 'border-emerald-400/50 bg-gradient-to-b from-emerald-500/10 to-cyan-500/5 shadow-xl shadow-emerald-500/10'
                        : 'border-slate-700/50 bg-slate-900/60 hover:border-slate-600/50'
                    }`}
                  >
                    {plan.popular && (
                      <div className="absolute -top-3.5 left-1/2 transform -translate-x-1/2 z-10">
                        <span className={`px-5 py-1.5 rounded-full text-xs font-bold shadow-lg ${
                          isChristmasMode
                            ? 'bg-gradient-to-r from-red-500 to-green-500'
                            : 'bg-gradient-to-r from-emerald-500 to-cyan-500'
                        } text-white`}>
                          Most Popular
                        </span>
                      </div>
                    )}

                    <div className="p-6 sm:p-8">
                      <div className="text-center mb-6">
                        <div className={`bg-gradient-to-r ${plan.gradient} w-14 h-14 rounded-2xl flex items-center justify-center mx-auto mb-4 text-white shadow-lg`}>
                          {getPlanIcon(plan.icon)}
                        </div>
                        <h3 className="text-xl font-bold text-white mb-1">{plan.name}</h3>
                      </div>

                      <div className="text-center mb-6">
                        <div className="flex items-center justify-center gap-2 mb-1">
                          <span className="text-sm text-red-400 line-through">&#8377;{plan.mrp}</span>
                          <span className={`px-2 py-0.5 rounded-full text-xs font-bold ${
                            isChristmasMode
                              ? 'bg-green-500/20 text-green-300 border border-green-500/50'
                              : 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/50'
                          }`}>
                            {plan.discountPercentage}% OFF
                          </span>
                        </div>
                        <div className="text-4xl font-bold text-white">&#8377;{plan.price}</div>
                        <p className="text-slate-400 text-sm mt-1">One-time payment</p>
                      </div>

                      <ul className="space-y-3 mb-6">
                        {plan.features.map((feature, idx) => (
                          <li key={idx} className="flex items-start">
                            <Check className={`w-5 h-5 mr-2.5 mt-0.5 flex-shrink-0 ${
                              isChristmasMode ? 'text-green-400' : 'text-emerald-400'
                            }`} />
                            <span className="text-slate-300 text-sm">{feature}</span>
                          </li>
                        ))}
                      </ul>

                      <button
                        onClick={() => {
                          if (isAuthenticated) {
                            onShowSubscriptionPlans(plan.id, false);
                          } else {
                            onShowAuth();
                          }
                        }}
                        className={`w-full py-3 rounded-xl font-semibold text-sm transition-all duration-300 flex items-center justify-center gap-2 ${
                          plan.popular
                            ? 'bg-gradient-to-r from-emerald-500 to-cyan-500 text-white hover:from-emerald-400 hover:to-cyan-400 shadow-lg shadow-emerald-500/20'
                            : 'bg-slate-800 text-slate-200 hover:bg-slate-700 border border-slate-700'
                        }`}
                      >
                        {isAuthenticated ? 'Select Plan' : 'Sign Up & Select'}
                        <ArrowRight className="w-4 h-4" />
                      </button>
                    </div>
                  </motion.div>
                ))}
              </motion.div>
            </AnimatePresence>

            <p className="text-center text-sm text-slate-500 mt-8">
              Inclusive of GST where applicable. All plans are one-time purchases.
            </p>
          </div>
        </div>
      </div>

      {/* Trust Strip */}
      <div className="relative z-10 py-8">
        <div className="container mx-auto px-4">
          <div className="flex flex-col sm:flex-row justify-center items-center space-y-4 sm:space-y-0 sm:space-x-8 text-center">
            <div className="flex items-center space-x-2 text-slate-300">
              <Users className={`w-5 h-5 ${isChristmasMode ? 'text-green-400' : 'text-emerald-400'}`} />
              <span>Loved by 10,000+ job seekers</span>
            </div>
            <div className="flex items-center space-x-2 text-slate-300">
              <Star className="w-5 h-5 text-yellow-400 fill-current" />
              <span>Avg. rating 4.8/5</span>
            </div>
            <div className="flex items-center space-x-2 text-slate-300">
              <Shield className={`w-5 h-5 ${isChristmasMode ? 'text-green-400' : 'text-emerald-400'}`} />
              <span>Secure Razorpay Payments</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
