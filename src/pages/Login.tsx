import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Satellite, ShieldCheck, ArrowRight } from 'lucide-react';

export default function Login() {
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    navigate('/');
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-surface relative overflow-hidden">
      {/* Background Elements */}
      <div className="absolute inset-0 z-0">
        <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1451187580459-43490279c0fa?q=80&w=2072&auto=format&fit=crop')] bg-cover bg-center opacity-40 mix-blend-luminosity"></div>
        <div className="absolute inset-0 bg-gradient-to-t from-surface via-surface/90 to-transparent"></div>
        <div className="absolute -top-40 -right-40 w-96 h-96 bg-primary/20 rounded-full blur-3xl"></div>
        <div className="absolute bottom-20 -left-20 w-72 h-72 bg-tertiary-fixed/20 rounded-full blur-3xl"></div>
      </div>

      <div className="relative z-10 w-full max-w-md p-8 sm:p-12 glass-panel rounded-3xl border border-white/20 shadow-2xl mx-4">
        <div className="text-center mb-10">
          <div className="w-16 h-16 bg-primary text-on-primary rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-lg transform -rotate-6 hover:rotate-0 transition-transform duration-300">
            <Satellite className="w-8 h-8" />
          </div>
          <h1 className="text-3xl font-headline font-bold text-on-surface mb-2 tracking-tight">Access Portal</h1>
          <p className="text-on-surface-variant font-body">Enjojo Foundation Command Centre</p>
        </div>

        <form onSubmit={handleLogin} className="space-y-6">
          <div className="space-y-2">
            <label className="text-sm font-label font-medium text-on-surface-variant ml-1">Operator ID</label>
            <div className="relative">
              <input 
                type="email" 
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full bg-surface-container-highest border border-outline-variant/50 rounded-xl px-4 py-3.5 pl-11 text-on-surface focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all font-body"
                placeholder="admin@enjojofoundation.org"
              />
              <ShieldCheck className="absolute left-4 top-1/2 -translate-y-1/2 text-on-surface-variant w-5 h-5" />
            </div>
          </div>

          <div className="space-y-2">
            <div className="flex justify-between items-center ml-1">
              <label className="text-sm font-label font-medium text-on-surface-variant">Access Code</label>
              <a href="#" className="text-xs font-medium text-primary hover:text-primary/80 transition-colors">Recover</a>
            </div>
            <div className="relative">
              <input 
                type="password" 
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full bg-surface-container-highest border border-outline-variant/50 rounded-xl px-4 py-3.5 pl-11 text-on-surface focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all font-body"
                placeholder="••••••••"
              />
              <div className="absolute left-4 top-1/2 -translate-y-1/2 text-on-surface-variant w-5 h-5 flex items-center justify-center">
                <span className="text-lg leading-none">*</span>
              </div>
            </div>
          </div>

          <button 
            type="submit"
            className="w-full bg-primary text-on-primary font-label font-semibold py-4 rounded-xl shadow-md hover:shadow-lg hover:bg-primary/90 transition-all duration-300 flex items-center justify-center gap-2 group mt-8"
          >
            Authenticate
            <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
          </button>
        </form>

        <div className="mt-8 text-center">
          <p className="text-xs text-on-surface-variant/70 font-body">
            Secure connection established. End-to-end encrypted.
          </p>
        </div>
      </div>
    </div>
  );
}
