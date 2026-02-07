import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  Building2,
  MapPin,
  Briefcase,
  IndianRupee,
  Code,
  ArrowLeft,
  Search,
  Star,
  Shield,
} from 'lucide-react';
import { referralService } from '../../services/referralService';
import { SlotBookingPanel } from '../referral/SlotBookingPanel';
import type { ReferralListing } from '../../types/referral';
import type { ReferralSlotType } from '../../types/referral';

interface ReferralDetailPageProps {
  onShowAuth: (callback?: () => void) => void;
}

export const ReferralDetailPage: React.FC<ReferralDetailPageProps> = ({ onShowAuth }) => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  const [listing, setListing] = useState<ReferralListing | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<ReferralSlotType>('query');

  useEffect(() => {
    const load = async () => {
      if (!id) return;
      const listingData = await referralService.getListingById(id);
      setListing(listingData);
      setLoading(false);
    };
    load();
  }, [id]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-emerald-400 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (!listing) {
    return (
      <div className="min-h-screen flex items-center justify-center px-4">
        <p className="text-slate-400 text-lg">Referral not found.</p>
      </div>
    );
  }

  const tabs: { key: ReferralSlotType; label: string }[] = [
    { key: 'query', label: 'Referral Query' },
    { key: 'profile', label: 'Profile Monetization' },
    { key: 'consultation', label: 'Consultation Slot' },
  ];

  const tabConfig: Record<ReferralSlotType, { title: string; subtitle: string; icon: React.ReactNode; accentColor: string }> = {
    query: {
      title: 'Referral Query',
      subtitle: '15-min slots | 10:00 AM - 4:00 PM | Get referrer contact details',
      icon: <Search className="w-5 h-5 text-blue-400" />,
      accentColor: 'bg-blue-500/10',
    },
    profile: {
      title: 'Profile Monetization',
      subtitle: '1-hour sessions | 10:00 AM - 4:00 PM | Profile shared with referrer',
      icon: <Star className="w-5 h-5 text-amber-400" />,
      accentColor: 'bg-amber-500/10',
    },
    consultation: {
      title: 'Consultation Slot',
      subtitle: '15-min slots | 10:00 AM - 4:00 PM | Resume review session',
      icon: <Shield className="w-5 h-5 text-emerald-400" />,
      accentColor: 'bg-emerald-500/10',
    },
  };

  const currentConfig = tabConfig[activeTab];

  return (
    <div className="min-h-screen pb-20 md:pl-16">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 pt-8 sm:pt-12">
        <button
          onClick={() => navigate('/referrals')}
          className="flex items-center gap-2 text-slate-400 hover:text-white text-sm mb-6 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Referrals
        </button>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-gradient-to-br from-[#0d1f2d] to-[#0a1a24] border border-slate-700/50 rounded-2xl overflow-hidden mb-8"
        >
          <div className="p-6 sm:p-8">
            <div className="flex items-start gap-4 mb-6">
              {listing.company_logo_url ? (
                <img
                  src={listing.company_logo_url}
                  alt={listing.company_name}
                  className="w-16 h-16 rounded-xl object-contain bg-white/5 p-2 flex-shrink-0"
                />
              ) : (
                <div className="w-16 h-16 rounded-xl bg-emerald-500/10 flex items-center justify-center flex-shrink-0">
                  <Building2 className="w-8 h-8 text-emerald-400" />
                </div>
              )}
              <div>
                <h1 className="text-2xl sm:text-3xl font-bold text-white">{listing.company_name}</h1>
                <p className="text-slate-300 text-lg font-medium">{listing.role_title}</p>
              </div>
            </div>

            <div className="flex flex-wrap gap-3 mb-6">
              {listing.experience_range && (
                <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-800/60 text-slate-300 text-sm">
                  <Briefcase className="w-4 h-4" />
                  {listing.experience_range}
                </span>
              )}
              {listing.package_range && (
                <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-800/60 text-slate-300 text-sm">
                  <IndianRupee className="w-4 h-4" />
                  {listing.package_range}
                </span>
              )}
              {listing.location && (
                <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-800/60 text-slate-300 text-sm">
                  <MapPin className="w-4 h-4" />
                  {listing.location}
                </span>
              )}
            </div>

            {listing.tech_stack.length > 0 && (
              <div className="mb-6">
                <p className="text-slate-400 text-sm font-medium mb-2">Tech Stack</p>
                <div className="flex flex-wrap gap-2">
                  {listing.tech_stack.map((tech) => (
                    <span
                      key={tech}
                      className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md bg-emerald-500/10 text-emerald-400 text-sm font-medium"
                    >
                      <Code className="w-3.5 h-3.5" />
                      {tech}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {listing.job_description && (
              <div>
                <p className="text-slate-400 text-sm font-medium mb-2">Job Description</p>
                <div className="bg-slate-800/40 rounded-xl p-4 text-slate-300 text-sm leading-relaxed whitespace-pre-wrap max-h-64 overflow-y-auto">
                  {listing.job_description}
                </div>
              </div>
            )}

            {listing.referrer_name && (
              <div className="mt-6 pt-4 border-t border-slate-700/40 flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-emerald-500/20 flex items-center justify-center text-emerald-400 font-bold">
                  {listing.referrer_name[0]}
                </div>
                <div>
                  <p className="text-white font-medium text-sm">{listing.referrer_name}</p>
                  {listing.referrer_designation && (
                    <p className="text-slate-400 text-xs">{listing.referrer_designation}</p>
                  )}
                </div>
              </div>
            )}
          </div>
        </motion.div>

        <div className="flex flex-wrap gap-2 mb-6">
          {tabs.map((tab) => (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key)}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                activeTab === tab.key
                  ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                  : 'bg-slate-800/40 text-slate-400 border border-slate-700/40 hover:text-white'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        <motion.div
          key={activeTab}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-gradient-to-br from-[#0d1f2d] to-[#0a1a24] border border-slate-700/50 rounded-2xl p-6"
        >
          <SlotBookingPanel
            listingId={listing.id}
            slotType={activeTab}
            title={currentConfig.title}
            subtitle={currentConfig.subtitle}
            icon={currentConfig.icon}
            accentColor={currentConfig.accentColor}
            onShowAuth={() => onShowAuth(() => navigate(`/referrals/${id}`))}
          />
        </motion.div>
      </div>
    </div>
  );
};
