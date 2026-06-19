import { useEffect, useMemo, useState } from 'react';
import { useInstitute } from '@/context/InstituteContext';
import LoadingSpinner from '@/components/shared/LoadingSpinner';
import EmptyState from '@/components/shared/EmptyState';
import {
  creditsApi,
  featuredPurchasesApi,
  creditTopUpsApi,
} from '@/api';
import type {
  InstituteCredit,
  CreditTransaction,
  FeaturedPurchase,
  CreditTopUpRequest,
} from '@/types';
import { toast } from 'sonner';
import {
  Coins,
  IndianRupee,
  ShoppingCart,
  Star,
  Clock,
  CheckCircle,
  XCircle,
  ArrowRight,
  QrCode,
} from 'lucide-react';

const RUPEE_PER_TOKEN = 10;
const FEATURED_COST = 500;

const TRANSACTION_LABELS: Record<string, string> = {
  CREDIT_TOP_UP: 'Credit top-up',
  FEATURED_PURCHASE: 'Featured badge',
  DEDUCTED_FOR_LEAD_UNLOCK: 'Lead unlock',
};

export default function CreditsPage() {
  const { institute } = useInstitute();
  const [isLoading, setIsLoading] = useState(true);
  const [credit, setCredit] = useState<InstituteCredit | null>(null);
  const [transactions, setTransactions] = useState<CreditTransaction[]>([]);
  const [featuredPurchases, setFeaturedPurchases] = useState<FeaturedPurchase[]>([]);
  const [topUps, setTopUps] = useState<CreditTopUpRequest[]>([]);
  const [activeSection, setActiveSection] = useState<'overview' | 'buy' | 'featured'>('overview');

  // Buy credits form
  const [buyAmount, setBuyAmount] = useState('');
  const [transactionId, setTransactionId] = useState('');
  const [isSubmittingTopUp, setIsSubmittingTopUp] = useState(false);

  // Buy featured form
  const [isBuyingFeatured, setIsBuyingFeatured] = useState(false);

  const instituteId = institute?.identifier;

  const loadData = async () => {
    if (!instituteId) return;
    setIsLoading(true);
    try {
      const [cred, txns, fp, tu] = await Promise.all([
        creditsApi.getBalance(instituteId).catch(() => null),
        creditsApi.getTransactions(instituteId).catch(() => []),
        featuredPurchasesApi.getByInstitute(instituteId).catch(() => []),
        creditTopUpsApi.getByInstitute(instituteId).catch(() => []),
      ]);
      setCredit(cred);
      setTransactions(txns);
      setFeaturedPurchases(fp);
      setTopUps(tu);
    } catch (err) {
      console.error('Credits load error', err);
      toast.error('Failed to load credits data');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [instituteId]);

  const balance = credit?.balance ?? 0;
  const activeFeatured = featuredPurchases.find((p) => p.status === 'ACTIVE');
  const featuredExpiry = activeFeatured ? new Date(activeFeatured.expiresAt) : null;

  const handleBuyCredits = async () => {
    const amount = parseInt(buyAmount);
    if (!amount || amount <= 0) {
      toast.error('Please enter a valid credit amount');
      return;
    }
    if (!transactionId || transactionId.length !== 6) {
      toast.error('Please enter exactly 6 characters of the transaction ID');
      return;
    }
    setIsSubmittingTopUp(true);
    try {
      await creditTopUpsApi.create({
        instituteIdentifier: instituteId!,
        requestedCredits: amount,
        transactionIdLast6: transactionId.toUpperCase(),
      });
      toast.success('Top-up request submitted! Admin will verify shortly.');
      setBuyAmount('');
      setTransactionId('');
      setActiveSection('overview');
      loadData();
    } catch (err: any) {
      toast.error(err?.response?.data?.error || 'Failed to submit top-up request');
    } finally {
      setIsSubmittingTopUp(false);
    }
  };

  const handleBuyFeatured = async () => {
    if (balance < FEATURED_COST) {
      toast.error(`Insufficient balance. You need ${FEATURED_COST} credits.`);
      return;
    }
    setIsBuyingFeatured(true);
    try {
      await featuredPurchasesApi.create({ instituteIdentifier: instituteId! });
      toast.success('Featured badge purchased successfully!');
      setActiveSection('overview');
      loadData();
    } catch (err: any) {
      toast.error(err?.response?.data?.error || 'Failed to purchase featured badge');
    } finally {
      setIsBuyingFeatured(false);
    }
  };

  const pendingTopUps = useMemo(() => topUps.filter((t) => t.status === 'PENDING'), [topUps]);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-96">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-slate-900">Credits & Tokens</h1>

      {/* Balance Card */}
      <div className="bg-gradient-to-r from-primary-600 to-primary-700 rounded-2xl shadow-lg p-6 text-white">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-primary-100 text-sm font-medium">Your Credit Balance</p>
            <p className="text-4xl font-bold mt-1">{balance.toLocaleString()}</p>
            <p className="text-primary-200 text-sm mt-1">credits available</p>
          </div>
          <div className="w-16 h-16 rounded-2xl bg-white/20 flex items-center justify-center">
            <Coins size={32} className="text-white" />
          </div>
        </div>
        <div className="flex gap-3 mt-6">
          <button
            onClick={() => setActiveSection('buy')}
            className="px-4 py-2.5 rounded-xl bg-white text-primary-700 text-sm font-semibold hover:bg-primary-50 transition-colors flex items-center gap-2"
          >
            <IndianRupee size={16} /> Buy Credits
          </button>
          <button
            onClick={() => setActiveSection('featured')}
            className="px-4 py-2.5 rounded-xl bg-white/20 text-white text-sm font-semibold hover:bg-white/30 transition-colors flex items-center gap-2"
          >
            <Star size={16} /> Buy Featured
          </button>
        </div>
      </div>

      {/* Featured Status */}
      {activeFeatured && featuredExpiry && (
        <div className="bg-amber-50 border border-amber-200 rounded-2xl p-4 flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-amber-100 flex items-center justify-center">
            <Star size={20} className="text-amber-600" />
          </div>
          <div className="flex-1">
            <p className="text-sm font-semibold text-amber-900">Featured Badge Active</p>
            <p className="text-xs text-amber-700">
              Expires on {featuredExpiry.toLocaleDateString()} ({Math.ceil((featuredExpiry.getTime() - Date.now()) / (1000 * 60 * 60 * 24))} days left)
            </p>
          </div>
          <button
            onClick={() => setActiveSection('featured')}
            className="px-3 py-1.5 rounded-lg bg-amber-200 text-amber-800 text-xs font-medium hover:bg-amber-300 transition-colors"
          >
            Extend
          </button>
        </div>
      )}

      {/* Buy Credits Section */}
      {activeSection === 'buy' && (
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 space-y-5">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-primary-50 flex items-center justify-center">
              <QrCode size={20} className="text-primary-600" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-slate-900">Buy Credits</h2>
              <p className="text-sm text-slate-500">Pay via QR code and submit transaction details</p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Number of Credits</label>
                <input
                  type="number"
                  min={1}
                  value={buyAmount}
                  onChange={(e) => setBuyAmount(e.target.value)}
                  placeholder="e.g. 500"
                  className="w-full px-3 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
                />
                {buyAmount && (
                  <p className="text-sm text-primary-600 font-medium mt-1.5">
                    ≈ ₹{(parseInt(buyAmount || '0') * RUPEE_PER_TOKEN).toLocaleString()} ({RUPEE_PER_TOKEN} ₹/credit)
                  </p>
                )}
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Last 6 digits of Transaction ID</label>
                <input
                  type="text"
                  value={transactionId}
                  onChange={(e) => setTransactionId(e.target.value.replace(/[^a-zA-Z0-9]/g, '').slice(0, 6))}
                  placeholder="e.g. A1B2C3"
                  maxLength={6}
                  className="w-full px-3 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 font-mono uppercase"
                />
                <p className="text-xs text-slate-400 mt-1">Enter exactly 6 characters from your payment receipt</p>
              </div>
              <button
                onClick={handleBuyCredits}
                disabled={isSubmittingTopUp}
                className="w-full py-2.5 rounded-xl bg-primary-600 text-white text-sm font-semibold hover:bg-primary-700 disabled:opacity-50 transition-colors"
              >
                {isSubmittingTopUp ? 'Submitting...' : 'Submit Top-Up Request'}
              </button>
            </div>

            <div className="flex flex-col items-center justify-center bg-slate-50 rounded-xl p-6 border border-dashed border-slate-300">
              <div className="w-48 h-48 bg-white rounded-xl border-2 border-slate-200 flex items-center justify-center mb-3">
                <QrCode size={80} className="text-slate-300" />
              </div>
              <p className="text-sm text-slate-500 text-center">Scan this QR code to pay via UPI</p>
              <p className="text-xs text-slate-400 text-center mt-1">Replace this with your actual QR code image</p>
            </div>
          </div>

          {/* Top-up history */}
          <div className="pt-4 border-t border-slate-100">
            <h3 className="text-sm font-semibold text-slate-900 mb-3">Your Top-Up Requests</h3>
            {topUps.length === 0 ? (
              <p className="text-sm text-slate-500">No top-up requests yet</p>
            ) : (
              <div className="space-y-2">
                {topUps.map((tu) => (
                  <div key={tu.identifier} className="flex items-center justify-between p-3 rounded-xl bg-slate-50">
                    <div>
                      <p className="text-sm font-medium text-slate-900">{tu.requestedCredits} credits</p>
                      <p className="text-xs text-slate-500">₹{tu.amountInRupees.toLocaleString()} • TXN: ...{tu.transactionIdLast6}</p>
                    </div>
                    <TopUpStatusBadge status={tu.status} />
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {/* Buy Featured Section */}
      {activeSection === 'featured' && (
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 space-y-5">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-amber-50 flex items-center justify-center">
              <Star size={20} className="text-amber-600" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-slate-900">Featured Badge</h2>
              <p className="text-sm text-slate-500">Get priority placement in search results</p>
            </div>
          </div>

          <div className="bg-gradient-to-r from-amber-50 to-orange-50 rounded-xl p-5 border border-amber-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-lg font-bold text-amber-900">30 Days Featured</p>
                <p className="text-sm text-amber-700 mt-1">Your institute will appear at the top of search results</p>
                <ul className="mt-3 space-y-1">
                  <li className="text-sm text-amber-800 flex items-center gap-2">
                    <CheckCircle size={14} /> Priority in search results
                  </li>
                  <li className="text-sm text-amber-800 flex items-center gap-2">
                    <CheckCircle size={14} /> Featured badge on your profile
                  </li>
                  <li className="text-sm text-amber-800 flex items-center gap-2">
                    <CheckCircle size={14} /> More visibility to students
                  </li>
                </ul>
              </div>
              <div className="text-right">
                <p className="text-3xl font-bold text-amber-900">{FEATURED_COST}</p>
                <p className="text-sm text-amber-700">credits</p>
              </div>
            </div>
          </div>

          {activeFeatured && featuredExpiry && (
            <div className="bg-blue-50 rounded-xl p-4 border border-blue-200">
              <p className="text-sm text-blue-800">
                You already have an active featured badge until{' '}
                <span className="font-semibold">{featuredExpiry.toLocaleDateString()}</span>.
                Purchasing again will extend it by 30 days.
              </p>
            </div>
          )}

          <div className="flex gap-3">
            <button
              onClick={() => setActiveSection('overview')}
              className="px-5 py-2.5 rounded-xl border border-slate-200 text-sm font-medium text-slate-700 hover:bg-slate-50"
            >
              Cancel
            </button>
            <button
              onClick={handleBuyFeatured}
              disabled={isBuyingFeatured}
              className="px-5 py-2.5 rounded-xl bg-amber-500 text-white text-sm font-semibold hover:bg-amber-600 disabled:opacity-50 transition-colors"
            >
              {isBuyingFeatured ? 'Processing...' : activeFeatured ? 'Extend by 30 Days' : 'Buy Featured Badge'}
            </button>
          </div>

          {/* Purchase history */}
          <div className="pt-4 border-t border-slate-100">
            <h3 className="text-sm font-semibold text-slate-900 mb-3">Your Featured Purchases</h3>
            {featuredPurchases.length === 0 ? (
              <p className="text-sm text-slate-500">No featured purchases yet</p>
            ) : (
              <div className="space-y-2">
                {featuredPurchases.map((fp) => (
                  <div key={fp.identifier} className="flex items-center justify-between p-3 rounded-xl bg-slate-50">
                    <div>
                      <p className="text-sm font-medium text-slate-900">{fp.durationDays} days</p>
                      <p className="text-xs text-slate-500">Cost: {fp.cost} credits</p>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-xs text-slate-500">
                        {fp.expiresAt ? new Date(fp.expiresAt).toLocaleDateString() : '—'}
                      </span>
                      <FeaturedStatusBadge status={fp.status} />
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {/* Overview Section */}
      {activeSection === 'overview' && (
        <>
          {/* Quick Stats */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-5">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-amber-50 flex items-center justify-center">
                  <Star size={20} className="text-amber-600" />
                </div>
                <div>
                  <p className="text-sm text-slate-500">Featured Purchases</p>
                  <p className="text-2xl font-bold text-slate-900">{featuredPurchases.length}</p>
                </div>
              </div>
            </div>
            <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-5">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-purple-50 flex items-center justify-center">
                  <ShoppingCart size={20} className="text-purple-600" />
                </div>
                <div>
                  <p className="text-sm text-slate-500">Top-Up Requests</p>
                  <p className="text-2xl font-bold text-slate-900">{topUps.length}</p>
                </div>
              </div>
            </div>
          </div>

          {/* Transaction History */}
          <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6">
            <h2 className="text-lg font-bold text-slate-900 mb-4">Transaction History</h2>
            {transactions.length === 0 ? (
              <EmptyState icon={Coins} title="No transactions yet" description="Your credit transactions will appear here" className="py-8" />
            ) : (
              <div className="space-y-2 max-h-80 overflow-y-auto">
                {transactions.map((txn) => (
                  <div key={txn.identifier} className="flex items-center justify-between p-3 rounded-xl bg-slate-50">
                    <div className="flex items-center gap-3">
                      <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${txn.amount > 0 ? 'bg-green-100' : 'bg-red-100'}`}>
                        {txn.amount > 0 ? <ArrowRight size={14} className="text-green-600 rotate-[-45deg]" /> : <ArrowRight size={14} className="text-red-600 rotate-[135deg]" />}
                      </div>
                      <div>
                        <p className="text-sm font-medium text-slate-900">{TRANSACTION_LABELS[txn.type] || txn.description || txn.type}</p>
                        <p className="text-xs text-slate-500">{new Date(txn.createdAt).toLocaleString()}</p>
                      </div>
                    </div>
                    <span className={`text-sm font-bold ${txn.amount > 0 ? 'text-green-600' : 'text-red-600'}`}>
                      {txn.amount > 0 ? '+' : ''}{txn.amount}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Pending Top-Ups */}
          {pendingTopUps.length > 0 && (
            <div className="bg-amber-50 rounded-2xl border border-amber-200 p-5">
              <h3 className="text-sm font-semibold text-amber-900 mb-3">Pending Top-Up Requests</h3>
              <div className="space-y-2">
                {pendingTopUps.map((tu) => (
                  <div key={tu.identifier} className="flex items-center justify-between p-3 rounded-xl bg-white border border-amber-100">
                    <div>
                      <p className="text-sm font-medium text-slate-900">{tu.requestedCredits} credits</p>
                      <p className="text-xs text-slate-500">₹{tu.amountInRupees.toLocaleString()} • TXN: ...{tu.transactionIdLast6}</p>
                    </div>
                    <TopUpStatusBadge status={tu.status} />
                  </div>
                ))}
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
}

function TopUpStatusBadge({ status }: { status: string }) {
  const styles: Record<string, string> = {
    PENDING: 'bg-amber-50 text-amber-700',
    APPROVED: 'bg-green-50 text-green-700',
    REJECTED: 'bg-red-50 text-red-700',
  };
  return (
    <span className={`px-2 py-1 rounded-full text-xs font-medium ${styles[status] || 'bg-slate-100 text-slate-600'}`}>
      {status}
    </span>
  );
}

function FeaturedStatusBadge({ status }: { status: string }) {
  const styles: Record<string, string> = {
    ACTIVE: 'bg-green-50 text-green-700',
    EXPIRED: 'bg-slate-100 text-slate-600',
    CANCELLED: 'bg-red-50 text-red-700',
  };
  return (
    <span className={`px-2 py-1 rounded-full text-xs font-medium ${styles[status] || 'bg-slate-100 text-slate-600'}`}>
      {status}
    </span>
  );
}
