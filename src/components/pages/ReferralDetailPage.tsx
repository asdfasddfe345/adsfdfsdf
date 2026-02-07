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
  Lock,
  Unlock,
  Star,
  Calendar,
  Clock,
  CheckCircle,
  User,
  Mail,
  Phone,
  ChevronLeft,
  ChevronRight,
  AlertCircle,
} from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { referralService } from '../../services/referralService';
import type {
  ReferralListing,
  ReferralPricing,
  ReferralSlotDisplayInfo,
} from '../../types/referral';

interface ReferralDetailPageProps {
  onShowAuth: (callback?: () => void) => void;
}

export const ReferralDetailPage: React.FC<ReferralDetailPageProps> = ({ onShowAuth }) => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { isAuthenticated, user } = useAuth();

  const [listing, setListing] = useState<ReferralListing | null>(null);
  const [pricing, setPricing] = useState<ReferralPricing | null>(null);
  const [loading, setLoading] = useState(true);
  const [hasQueryAccess, setHasQueryAccess] = useState(false);
  const [hasProfileAccess, setHasProfileAccess] = useState(false);

  const [activeTab, setActiveTab] = useState<'details' | 'slot'>('details');
  const [selectedDate, setSelectedDate] = useState<string | null>(null);
  const [slots, setSlots] = useState<ReferralSlotDisplayInfo[]>([]);
  const [slotsLoading, setSlotsLoading] = useState(false);
  const [selectedSlot, setSelectedSlot] = useState<string | null>(null);
  const [currentMonth, setCurrentMonth] = useState(new Date());

  const [bookingForm, setBookingForm] = useState({ name: '', email: '', phone: '' });
  const [bookingStatus, setBookingStatus] = useState<'idle' | 'processing' | 'success' | 'error'>('idle');
  const [purchaseStatus, setPurchaseStatus] = useState<'idle' | 'processing'>('idle');
  const [errorMessage, setErrorMessage] = useState('');

  useEffect(() => {
    const load = async () => {
      if (!id) return;
      const [listingData, pricingData] = await Promise.all([
        referralService.getListingById(id),
        referralService.getPricing(),
      ]);
      setListing(listingData);
      setPricing(pricingData);
      setLoading(false);

      if (user?.id && listingData) {
        const [query, profile] = await Promise.all([
          referralService.hasUserPurchased(user.id, listingData.id, 'query'),
          referralService.hasUserPurchased(user.id, listingData.id, 'profile'),
        ]);
        setHasQueryAccess(query);
        setHasProfileAccess(profile);
      }
    };
    load();
  }, [id, user?.id]);

  useEffect(() => {
    if (user) {
      setBookingForm({
        name: user.name || '',
        email: user.email || '',
        phone: '',
      });
    }
  }, [user]);

  const loadSlots = async (date: string) => {
    if (!id) return;
    setSlotsLoading(true);
    const slotsData = await referralService.getSlotsForDate(id, date);
    setSlots(slotsData);
    setSlotsLoading(false);
  };

  const handleDateSelect = (dateStr: string) => {
    setSelectedDate(dateStr);
    setSelectedSlot(null);
    loadSlots(dateStr);
  };

  const handlePurchase = async (type: 'query' | 'profile') => {
    if (!isAuthenticated) {
      onShowAuth(() => navigate(`/referrals/${id}`));
      return;
    }
    if (!user?.id || !listing || !pricing) return;

    setPurchaseStatus('processing');
    const amount = type === 'query' ? pricing.query_price : pricing.profile_price;
    const purchaseId = await referralService.createPurchase(user.id, listing.id, type, amount);

    if (!purchaseId) {
      setPurchaseStatus('idle');
      setErrorMessage('Failed to initiate purchase.');
      return;
    }

    await referralService.updatePurchaseStatus(purchaseId, `sim_${Date.now()}`, `ord_${Date.now()}`, 'success');

    if (type === 'query') setHasQueryAccess(true);
    else setHasProfileAccess(true);

    setPurchaseStatus('idle');
  };

  const handleBookSlot = async () => {
    if (!isAuthenticated) {
      onShowAuth(() => navigate(`/referrals/${id}`));
      return;
    }
    if (!user?.id || !listing || !selectedDate || !selectedSlot) return;
    if (!bookingForm.name || !bookingForm.email) {
      setErrorMessage('Name and email are required.');
      return;
    }

    setBookingStatus('processing');
    setErrorMessage('');

    const result = await referralService.bookConsultationSlot(
      user.id,
      listing.id,
      selectedDate,
      selectedSlot,
      `pay_${Date.now()}`,
      bookingForm.name,
      bookingForm.email,
      bookingForm.phone
    );

    if (result.success) {
      setBookingStatus('success');
      loadSlots(selectedDate);
    } else {
      setBookingStatus('error');
      setErrorMessage(result.error || 'Booking failed.');
    }
  };

  const getDaysInMonth = (date: Date) => {
    const year = date.getFullYear();
    const month = date.getMonth();
    const firstDay = new Date(year, month, 1).getDay();
    const daysInMonth = new Date(year, month + 1, 0).getDate();
    return { firstDay, daysInMonth, year, month };
  };

  const { firstDay, daysInMonth, year, month } = getDaysInMonth(currentMonth);
  const today = new Date();
  today.setHours(0, 0, 0, 0);

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

        <div className="flex gap-2 mb-6">
          <button
            onClick={() => setActiveTab('details')}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
              activeTab === 'details'
                ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                : 'bg-slate-800/40 text-slate-400 border border-slate-700/40 hover:text-white'
            }`}
          >
            Referral Access
          </button>
          <button
            onClick={() => setActiveTab('slot')}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
              activeTab === 'slot'
                ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                : 'bg-slate-800/40 text-slate-400 border border-slate-700/40 hover:text-white'
            }`}
          >
            Book Consultation Slot
          </button>
        </div>

        {activeTab === 'details' && pricing && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="grid grid-cols-1 md:grid-cols-2 gap-5"
          >
            <div className="bg-gradient-to-br from-[#0d1f2d] to-[#0a1a24] border border-slate-700/50 rounded-2xl p-6">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 rounded-lg bg-blue-500/10 flex items-center justify-center text-blue-400">
                  {hasQueryAccess ? <Unlock className="w-5 h-5" /> : <Lock className="w-5 h-5" />}
                </div>
                <div>
                  <h3 className="text-white font-bold">Referral Query</h3>
                  <p className="text-slate-400 text-xs">Get referrer contact details</p>
                </div>
              </div>
              <p className="text-slate-300 text-sm mb-4 leading-relaxed">
                Pay once to unlock the referrer's contact information. Connect directly to get your referral for this role.
              </p>
              {hasQueryAccess ? (
                <div className="flex items-center gap-2 text-emerald-400 text-sm font-medium bg-emerald-500/10 rounded-lg px-4 py-3">
                  <CheckCircle className="w-4 h-4" />
                  Access Unlocked
                </div>
              ) : (
                <button
                  onClick={() => handlePurchase('query')}
                  disabled={purchaseStatus === 'processing'}
                  className="w-full px-4 py-3 bg-gradient-to-r from-blue-500 to-blue-600 text-white font-semibold rounded-xl text-sm hover:opacity-90 transition-opacity disabled:opacity-50 flex items-center justify-center gap-2"
                >
                  {purchaseStatus === 'processing' ? (
                    <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  ) : (
                    <>
                      <IndianRupee className="w-4 h-4" />
                      Pay {'\u20B9'}{pricing.query_price / 100}
                    </>
                  )}
                </button>
              )}
            </div>

            <div className="bg-gradient-to-br from-[#0d1f2d] to-[#0a1a24] border border-amber-500/20 rounded-2xl p-6">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 rounded-lg bg-amber-500/10 flex items-center justify-center text-amber-400">
                  {hasProfileAccess ? <Unlock className="w-5 h-5" /> : <Star className="w-5 h-5" />}
                </div>
                <div>
                  <h3 className="text-white font-bold">Profile Monetization</h3>
                  <p className="text-slate-400 text-xs">Premium referral service</p>
                </div>
              </div>
              <p className="text-slate-300 text-sm mb-4 leading-relaxed">
                We share your profile directly with the referrer. Get a higher chance of landing the interview with personalized advocacy.
              </p>
              {hasProfileAccess ? (
                <div className="flex items-center gap-2 text-emerald-400 text-sm font-medium bg-emerald-500/10 rounded-lg px-4 py-3">
                  <CheckCircle className="w-4 h-4" />
                  Profile Shared
                </div>
              ) : (
                <button
                  onClick={() => handlePurchase('profile')}
                  disabled={purchaseStatus === 'processing'}
                  className="w-full px-4 py-3 bg-gradient-to-r from-amber-500 to-amber-600 text-white font-semibold rounded-xl text-sm hover:opacity-90 transition-opacity disabled:opacity-50 flex items-center justify-center gap-2"
                >
                  {purchaseStatus === 'processing' ? (
                    <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  ) : (
                    <>
                      <IndianRupee className="w-4 h-4" />
                      Pay {'\u20B9'}{pricing.profile_price / 100}
                    </>
                  )}
                </button>
              )}
            </div>
          </motion.div>
        )}

        {activeTab === 'slot' && pricing && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-gradient-to-br from-[#0d1f2d] to-[#0a1a24] border border-slate-700/50 rounded-2xl p-6"
          >
            <div className="flex items-center gap-3 mb-6">
              <div className="w-10 h-10 rounded-lg bg-emerald-500/10 flex items-center justify-center text-emerald-400">
                <Calendar className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-white font-bold">Book a Consultation Slot</h3>
                <p className="text-slate-400 text-xs">
                  {pricing.slot_duration_minutes}-min resume review session | Slots available until 4:00 PM
                </p>
              </div>
            </div>

            {bookingStatus === 'success' ? (
              <div className="text-center py-8">
                <div className="w-16 h-16 rounded-full bg-emerald-500/20 flex items-center justify-center mx-auto mb-4">
                  <CheckCircle className="w-8 h-8 text-emerald-400" />
                </div>
                <h3 className="text-white font-bold text-xl mb-2">Slot Booked!</h3>
                <p className="text-slate-400 text-sm mb-4">
                  Your {pricing.slot_duration_minutes}-minute consultation has been confirmed.
                </p>
                <button
                  onClick={() => {
                    setBookingStatus('idle');
                    setSelectedSlot(null);
                  }}
                  className="px-6 py-2.5 bg-slate-800/60 border border-slate-700/40 text-white rounded-xl text-sm hover:bg-slate-700/60 transition-colors"
                >
                  Book Another Slot
                </button>
              </div>
            ) : (
              <div className="grid lg:grid-cols-2 gap-6">
                <div>
                  <div className="flex items-center justify-between mb-4">
                    <button
                      onClick={() => setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() - 1))}
                      className="p-1.5 rounded-lg hover:bg-slate-700/50 text-slate-400 hover:text-white transition-colors"
                    >
                      <ChevronLeft className="w-4 h-4" />
                    </button>
                    <span className="text-white font-medium text-sm">
                      {currentMonth.toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}
                    </span>
                    <button
                      onClick={() => setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1))}
                      className="p-1.5 rounded-lg hover:bg-slate-700/50 text-slate-400 hover:text-white transition-colors"
                    >
                      <ChevronRight className="w-4 h-4" />
                    </button>
                  </div>

                  <div className="grid grid-cols-7 gap-1 mb-2">
                    {['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'].map((d) => (
                      <div key={d} className="text-center text-slate-500 text-xs py-1">{d}</div>
                    ))}
                  </div>

                  <div className="grid grid-cols-7 gap-1">
                    {Array.from({ length: firstDay }).map((_, i) => (
                      <div key={`empty-${i}`} />
                    ))}
                    {Array.from({ length: daysInMonth }).map((_, i) => {
                      const day = i + 1;
                      const dateObj = new Date(year, month, day);
                      const dateStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
                      const isPast = dateObj < today;
                      const isSelected = selectedDate === dateStr;
                      const isToday = dateObj.getTime() === today.getTime();

                      return (
                        <button
                          key={day}
                          disabled={isPast}
                          onClick={() => handleDateSelect(dateStr)}
                          className={`py-2 rounded-lg text-xs font-medium transition-colors ${
                            isPast
                              ? 'text-slate-700 cursor-not-allowed'
                              : isSelected
                              ? 'bg-emerald-500 text-white'
                              : isToday
                              ? 'bg-emerald-500/20 text-emerald-400 hover:bg-emerald-500/30'
                              : 'text-slate-300 hover:bg-slate-700/50'
                          }`}
                        >
                          {day}
                        </button>
                      );
                    })}
                  </div>
                </div>

                <div>
                  {!selectedDate ? (
                    <div className="flex items-center justify-center h-full text-slate-500 text-sm">
                      Select a date to view available slots
                    </div>
                  ) : slotsLoading ? (
                    <div className="flex items-center justify-center h-full">
                      <div className="w-6 h-6 border-2 border-emerald-400 border-t-transparent rounded-full animate-spin" />
                    </div>
                  ) : (
                    <div>
                      <p className="text-slate-400 text-sm mb-3">
                        Available slots for{' '}
                        <span className="text-white font-medium">
                          {new Date(selectedDate + 'T00:00:00').toLocaleDateString('en-US', {
                            weekday: 'short',
                            month: 'short',
                            day: 'numeric',
                          })}
                        </span>
                      </p>
                      <div className="space-y-2 mb-5">
                        {slots.map((slot) => (
                          <button
                            key={slot.time_slot}
                            disabled={slot.status === 'booked' || slot.status === 'blocked'}
                            onClick={() => setSelectedSlot(slot.time_slot)}
                            className={`w-full flex items-center justify-between px-4 py-3 rounded-xl text-sm font-medium transition-all ${
                              slot.status === 'booked'
                                ? 'bg-red-500/10 text-red-400 border border-red-500/20 cursor-not-allowed'
                                : slot.status === 'blocked'
                                ? 'bg-slate-800/60 text-slate-600 cursor-not-allowed'
                                : selectedSlot === slot.time_slot
                                ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/40'
                                : 'bg-slate-800/40 text-slate-300 border border-slate-700/40 hover:border-emerald-500/30'
                            }`}
                          >
                            <span className="flex items-center gap-2">
                              <Clock className="w-4 h-4" />
                              {slot.label}
                            </span>
                            <span className="text-xs">
                              {slot.status === 'booked' ? 'Booked' : slot.status === 'blocked' ? 'Unavailable' : 'Available'}
                            </span>
                          </button>
                        ))}
                      </div>

                      {selectedSlot && (
                        <div className="space-y-3 border-t border-slate-700/40 pt-4">
                          <div className="relative">
                            <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                            <input
                              type="text"
                              placeholder="Your Name"
                              value={bookingForm.name}
                              onChange={(e) => setBookingForm((p) => ({ ...p, name: e.target.value }))}
                              className="w-full pl-10 pr-4 py-2.5 bg-slate-800/60 border border-slate-700/50 rounded-xl text-white text-sm placeholder-slate-500 focus:outline-none focus:border-emerald-500/50"
                            />
                          </div>
                          <div className="relative">
                            <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                            <input
                              type="email"
                              placeholder="Your Email"
                              value={bookingForm.email}
                              onChange={(e) => setBookingForm((p) => ({ ...p, email: e.target.value }))}
                              className="w-full pl-10 pr-4 py-2.5 bg-slate-800/60 border border-slate-700/50 rounded-xl text-white text-sm placeholder-slate-500 focus:outline-none focus:border-emerald-500/50"
                            />
                          </div>
                          <div className="relative">
                            <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                            <input
                              type="tel"
                              placeholder="Phone (optional)"
                              value={bookingForm.phone}
                              onChange={(e) => setBookingForm((p) => ({ ...p, phone: e.target.value }))}
                              className="w-full pl-10 pr-4 py-2.5 bg-slate-800/60 border border-slate-700/50 rounded-xl text-white text-sm placeholder-slate-500 focus:outline-none focus:border-emerald-500/50"
                            />
                          </div>

                          {errorMessage && (
                            <div className="flex items-center gap-2 text-red-400 text-xs bg-red-500/10 px-3 py-2 rounded-lg">
                              <AlertCircle className="w-3.5 h-3.5 flex-shrink-0" />
                              {errorMessage}
                            </div>
                          )}

                          <button
                            onClick={handleBookSlot}
                            disabled={bookingStatus === 'processing'}
                            className="w-full px-4 py-3 bg-gradient-to-r from-emerald-500 to-teal-500 text-white font-semibold rounded-xl text-sm hover:opacity-90 transition-opacity disabled:opacity-50 flex items-center justify-center gap-2"
                          >
                            {bookingStatus === 'processing' ? (
                              <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                            ) : (
                              <>
                                <Calendar className="w-4 h-4" />
                                Confirm Slot
                              </>
                            )}
                          </button>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              </div>
            )}
          </motion.div>
        )}
      </div>
    </div>
  );
};
