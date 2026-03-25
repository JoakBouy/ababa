import React from 'react';
import { 
  CreditCard, 
  Download, 
  CheckCircle2, 
  AlertCircle,
  ArrowRight,
  Receipt
} from 'lucide-react';

export default function Billing() {
  return (
    <div className="max-w-7xl mx-auto space-y-8">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-3xl font-headline font-bold text-on-surface tracking-tight">Billing & Subscriptions</h1>
          <p className="text-on-surface-variant font-body mt-1">Manage your Starlink plans and payment methods</p>
        </div>
        <button className="flex items-center gap-2 px-4 py-2 rounded-full bg-primary text-on-primary font-label font-medium hover:bg-primary/90 transition-colors shadow-sm">
          <CreditCard className="w-4 h-4" />
          Update Payment Method
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Left Column - Active Plan & Payment */}
        <div className="lg:col-span-2 space-y-6">
          
          {/* Active Plan Card */}
          <div className="bg-surface-container-lowest rounded-3xl border border-outline-variant/30 shadow-sm p-6 relative overflow-hidden">
            <div className="absolute top-0 right-0 w-64 h-64 bg-primary/5 rounded-full blur-3xl -mr-20 -mt-20"></div>
            
            <div className="flex justify-between items-start mb-6 relative z-10">
              <div>
                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium bg-tertiary-fixed/20 text-on-tertiary-fixed-variant mb-3">
                  <CheckCircle2 className="w-4 h-4" />
                  Active Subscription
                </span>
                <h2 className="text-2xl font-headline font-bold text-on-surface">Global Roam - Enterprise</h2>
                <p className="text-on-surface-variant font-body mt-1">Unlimited data, priority support, global coverage</p>
              </div>
              <div className="text-right">
                <div className="text-3xl font-headline font-bold text-on-surface">$2,500<span className="text-lg text-on-surface-variant font-normal">/mo</span></div>
                <p className="text-sm text-on-surface-variant font-body mt-1">Next billing date: Oct 15, 2023</p>
              </div>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 pt-6 border-t border-outline-variant/20 relative z-10">
              <div>
                <p className="text-xs font-label font-medium text-on-surface-variant uppercase tracking-wider">Terminals</p>
                <p className="text-lg font-headline font-bold text-on-surface mt-1">48</p>
              </div>
              <div>
                <p className="text-xs font-label font-medium text-on-surface-variant uppercase tracking-wider">Data Usage</p>
                <p className="text-lg font-headline font-bold text-on-surface mt-1">Unlimited</p>
              </div>
              <div>
                <p className="text-xs font-label font-medium text-on-surface-variant uppercase tracking-wider">Support</p>
                <p className="text-lg font-headline font-bold text-on-surface mt-1">24/7 Priority</p>
              </div>
              <div>
                <p className="text-xs font-label font-medium text-on-surface-variant uppercase tracking-wider">Status</p>
                <p className="text-lg font-headline font-bold text-tertiary-fixed-dim mt-1">Good Standing</p>
              </div>
            </div>

            <div className="mt-8 flex gap-3 relative z-10">
              <button className="px-6 py-2.5 rounded-full bg-surface-container-high text-on-surface font-label font-medium hover:bg-surface-container-highest transition-colors">
                Change Plan
              </button>
              <button className="px-6 py-2.5 rounded-full border border-error text-error font-label font-medium hover:bg-error/10 transition-colors">
                Cancel Subscription
              </button>
            </div>
          </div>

          {/* Payment Method */}
          <div className="bg-surface-container-lowest rounded-3xl border border-outline-variant/30 shadow-sm p-6">
            <h3 className="text-xl font-headline font-bold text-on-surface mb-6 flex items-center gap-2">
              <CreditCard className="w-5 h-5 text-primary" />
              Payment Method
            </h3>
            
            <div className="flex items-center justify-between p-4 border border-outline-variant/30 rounded-2xl bg-surface-container-low">
              <div className="flex items-center gap-4">
                <div className="w-12 h-8 bg-white rounded flex items-center justify-center border border-outline-variant/20 shadow-sm">
                  {/* Visa Logo Placeholder */}
                  <span className="font-bold text-blue-800 italic">VISA</span>
                </div>
                <div>
                  <p className="font-label font-medium text-on-surface">Visa ending in 4242</p>
                  <p className="text-sm text-on-surface-variant font-body">Expires 12/2025</p>
                </div>
              </div>
              <span className="text-sm font-medium text-tertiary-fixed-dim bg-tertiary-fixed/10 px-3 py-1 rounded-full">Primary</span>
            </div>

            <button className="mt-4 text-sm font-label font-medium text-primary hover:underline flex items-center gap-1">
              Add new payment method <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Right Column - Invoices & Address */}
        <div className="space-y-6">
          
          {/* Billing Address */}
          <div className="bg-surface-container-lowest rounded-3xl border border-outline-variant/30 shadow-sm p-6">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-headline font-bold text-on-surface">Billing Address</h3>
              <button className="text-sm font-label font-medium text-primary hover:underline">Edit</button>
            </div>
            <address className="not-italic text-sm text-on-surface-variant font-body leading-relaxed">
              <strong>Enjojo Foundation</strong><br />
              123 Innovation Drive<br />
              Suite 400<br />
              San Francisco, CA 94105<br />
              United States<br />
              VAT: US123456789
            </address>
          </div>

          {/* Recent Invoices */}
          <div className="bg-surface-container-lowest rounded-3xl border border-outline-variant/30 shadow-sm p-6">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-lg font-headline font-bold text-on-surface flex items-center gap-2">
                <Receipt className="w-5 h-5 text-primary" />
                Recent Invoices
              </h3>
              <button className="text-sm font-label font-medium text-primary hover:underline">View All</button>
            </div>

            <div className="space-y-4">
              {[
                { date: 'Sep 15, 2023', amount: '$2,500.00', status: 'Paid', id: 'INV-2023-09' },
                { date: 'Aug 15, 2023', amount: '$2,500.00', status: 'Paid', id: 'INV-2023-08' },
                { date: 'Jul 15, 2023', amount: '$2,500.00', status: 'Paid', id: 'INV-2023-07' },
                { date: 'Jun 15, 2023', amount: '$2,500.00', status: 'Paid', id: 'INV-2023-06' },
              ].map((invoice, i) => (
                <div key={i} className="flex items-center justify-between py-3 border-b border-outline-variant/10 last:border-0">
                  <div>
                    <p className="font-label font-medium text-on-surface text-sm">{invoice.date}</p>
                    <p className="text-xs text-on-surface-variant font-body">{invoice.id}</p>
                  </div>
                  <div className="flex items-center gap-4">
                    <span className="font-label font-medium text-on-surface text-sm">{invoice.amount}</span>
                    <button className="p-1.5 text-on-surface-variant hover:bg-surface-container rounded-full transition-colors" title="Download PDF">
                      <Download className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}
