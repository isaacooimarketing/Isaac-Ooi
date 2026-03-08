import React, { useState } from 'react';
import { 
  Activity, 
  History, 
  Zap, 
  TableProperties, 
  Link as LinkIcon, 
  PlusCircle, 
  Clock, 
  Sparkles, 
  Star, 
  CircleDollarSign, 
  Archive, 
  ExternalLink,
  ChevronLeft,
  ChevronRight,
  AlertCircle,
  CheckCircle2,
  Loader2
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { GoogleGenAI, Type } from "@google/genai";

// --- Types ---

type TabType = 'pending' | 'new' | 'high-priority' | 'closed' | 'archive';

interface Interaction {
  id: number;
  date: string;
  group: string;
  posterName: string;
  isHighPriority: boolean;
  isClosed: boolean;
  isArchived: boolean;
  url: string;
}

// --- Mock Data ---

const MOCK_DATA: Interaction[] = [
  { id: 1, date: '7th March 2026, Saturday', group: 'Coaches Group', posterName: 'Alex Thompson', isHighPriority: false, isClosed: false, isArchived: false, url: 'https://facebook.com' },
  { id: 2, date: '7th March 2026, Saturday', group: 'Digital Marketing Pro', posterName: 'Sarah Miller', isHighPriority: false, isClosed: false, isArchived: false, url: 'https://facebook.com' },
  { id: 3, date: '7th March 2026, Saturday', group: 'Startup Networking', posterName: 'David Chen', isHighPriority: false, isClosed: false, isArchived: false, url: 'https://facebook.com' },
  { id: 4, date: '7th March 2026, Saturday', group: 'E-commerce Growth Hackers', posterName: 'Michael Chen', isHighPriority: false, isClosed: true, isArchived: false, url: 'https://facebook.com' },
  { id: 5, date: '7th March 2026, Saturday', group: 'AI Enthusiasts Lab', posterName: 'Jessica Wu', isHighPriority: false, isClosed: false, isArchived: false, url: 'https://facebook.com' },
  { id: 6, date: '7th March 2026, Saturday', group: 'Digital Nomads Hub', posterName: 'Ryan Garcia', isHighPriority: true, isClosed: false, isArchived: false, url: 'https://facebook.com' },
  { id: 7, date: '7th March 2026, Saturday', group: 'SaaS Founders Collective', posterName: 'Alex Thompson', isHighPriority: false, isClosed: false, isArchived: false, url: 'https://facebook.com' },
  { id: 8, date: '7th March 2026, Saturday', group: 'Digital Marketing Pro', posterName: 'Sarah Miller', isHighPriority: false, isClosed: false, isArchived: false, url: 'https://facebook.com' },
  { id: 9, date: '7th March 2026, Saturday', group: 'Startup Networking', posterName: 'David Chen', isHighPriority: false, isClosed: false, isArchived: false, url: 'https://facebook.com' },
  { id: 10, date: '7th March 2026, Saturday', group: 'Product Hunters Hub', posterName: 'Kevin Park', isHighPriority: false, isClosed: false, isArchived: false, url: 'https://facebook.com' },
];

// --- Components ---

const StatCard = ({ 
  icon: Icon, 
  title, 
  value, 
  subtitle, 
  progress, 
  colorClass, 
  glowClass, 
  badgeText,
  alert 
}: { 
  icon: any, 
  title: string, 
  value: string, 
  subtitle: string, 
  progress?: number, 
  colorClass: string, 
  glowClass: string,
  badgeText: string,
  alert?: string
}) => (
  <div className={`bg-slate-900/40 p-6 rounded-xl border border-white/5 ${glowClass} transition-all duration-300 hover:scale-[1.02]`}>
    <div className="flex justify-between items-start mb-4">
      <Icon className={`${colorClass} w-8 h-8`} />
      <span className={`text-[10px] font-bold ${colorClass} bg-white/5 px-2 py-1 rounded uppercase tracking-wider`}>
        {badgeText}
      </span>
    </div>
    <h3 className="text-slate-400 text-xs font-medium uppercase tracking-widest">{title}</h3>
    <div className="flex items-end gap-2 mt-2">
      <span className="text-2xl font-bold text-white">{value}</span>
      <span className="text-slate-500 text-sm mb-1">{subtitle}</span>
    </div>
    {progress !== undefined && (
      <div className="mt-4 h-1.5 w-full bg-slate-800 rounded-full overflow-hidden">
        <motion.div 
          initial={{ width: 0 }}
          animate={{ width: `${progress}%` }}
          transition={{ duration: 1, ease: "easeOut" }}
          className={`h-full ${colorClass.replace('text-', 'bg-')} ${glowClass}`}
        />
      </div>
    )}
    {alert && (
      <p className={`mt-4 text-[10px] ${colorClass} font-bold flex items-center gap-1 uppercase tracking-tighter`}>
        <AlertCircle className="w-3 h-3" />
        {alert}
      </p>
    )}
  </div>
);

export default function App() {
  const [activeTab, setActiveTab] = useState<TabType>('pending');
  const [url, setUrl] = useState('');
  const [interactions, setInteractions] = useState<Interaction[]>(MOCK_DATA);
  const [isLogging, setIsLogging] = useState(false);

  const toggleStatus = (id: number, field: 'isHighPriority' | 'isClosed' | 'isArchived') => {
    setInteractions(prev => prev.map(item => 
      item.id === id ? { ...item, [field]: !item[field] } : item
    ));
  };

  const handleLogNow = async () => {
    if (!url.trim()) return;
    setIsLogging(true);
    
    try {
      const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY! });
      const response = await ai.models.generateContent({
        model: "gemini-3-flash-preview",
        contents: `Extract the Facebook group name and the poster's name from this URL: ${url}. 
        If you can't find them, generate realistic names based on common Facebook group patterns.
        Return ONLY a JSON object with "group" and "posterName" fields.`,
        config: {
          responseMimeType: "application/json",
          responseSchema: {
            type: Type.OBJECT,
            properties: {
              group: { type: Type.STRING },
              posterName: { type: Type.STRING }
            },
            required: ["group", "posterName"]
          }
        }
      });

      const data = JSON.parse(response.text || '{"group": "Unknown Group", "posterName": "Unknown User"}');
      
      const newInteraction: Interaction = {
        id: Date.now(),
        date: new Date().toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric', weekday: 'long' }),
        group: data.group,
        posterName: data.posterName,
        isHighPriority: false,
        isClosed: false,
        isArchived: false,
        url: url
      };
      
      setInteractions(prev => [newInteraction, ...prev]);
      setUrl('');
      setActiveTab('new');
    } catch (error) {
      console.error("Error logging post:", error);
      // Fallback
      const newInteraction: Interaction = {
        id: Date.now(),
        date: new Date().toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric', weekday: 'long' }),
        group: 'Facebook Group',
        posterName: 'New Lead',
        isHighPriority: false,
        isClosed: false,
        isArchived: false,
        url: url
      };
      setInteractions(prev => [newInteraction, ...prev]);
      setUrl('');
      setActiveTab('new');
    } finally {
      setIsLogging(false);
    }
  };

  const todayStr = new Date().toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric', weekday: 'long' });
  const mockToday = '7th March 2026, Saturday';

  const stats = {
    newToday: interactions.filter(i => (i.date === todayStr || i.date === mockToday)).length,
    pending: interactions.filter(i => !i.isClosed && !i.isArchived).length,
    completion: interactions.length > 0 
      ? Math.round((interactions.filter(i => i.isClosed).length / interactions.length) * 100) 
      : 0
  };

  const filteredData = interactions.filter(item => {
    if (activeTab === 'archive') {
      // Archive class data only shows for one day (today)
      return item.isArchived && (item.date === todayStr || item.date === mockToday);
    }

    if (activeTab === 'high-priority') {
      return item.isHighPriority;
    }

    if (activeTab === 'closed') {
      return item.isClosed;
    }

    if (activeTab === 'pending' || activeTab === 'new') {
      // Landing page: show if not archived, OR if archived but is high priority/closed
      return !item.isArchived || item.isHighPriority || item.isClosed;
    }

    return true;
  });

  const getTabTitle = () => {
    switch (activeTab) {
      case 'pending': return { title: 'Pending Follow-ups', icon: Clock, color: 'text-red-500' };
      case 'new': return { title: 'New Interactions Today', icon: Sparkles, color: 'text-neon-blue' };
      case 'high-priority': return { title: 'High Priority Leads', icon: Star, color: 'text-yellow-500' };
      case 'closed': return { title: 'Closed Conversions', icon: CircleDollarSign, color: 'text-emerald-500' };
      case 'archive': return { title: 'Archived Records (Google Sheets)', icon: Archive, color: 'text-slate-400' };
    }
  };

  const { title: viewTitle, icon: ViewIcon, color: viewColor } = getTabTitle();

  return (
    <div className="min-h-screen bg-background-dark text-slate-100 selection:bg-primary/30">
      {/* Header */}
      <header className="sticky top-0 z-50 border-b border-white/10 bg-background-dark/80 backdrop-blur-md px-6 py-4">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="bg-primary p-2 rounded-lg flex items-center justify-center glow-primary">
              <Activity className="text-white w-6 h-6" />
            </div>
            <h1 className="font-bold tracking-tight text-white uppercase italic text-xl">
              <span className="text-yellow-500">Isaac Ooi</span> FB Interaction Tracker
            </h1>
          </div>
          <button className="group flex items-center gap-2 bg-white/5 hover:bg-white/10 border border-white/20 px-4 py-2 rounded-xl transition-all cursor-pointer">
            <TableProperties className="text-neon-green w-4 h-4" />
            <span className="text-xs font-semibold">Open Google Sheets</span>
          </button>
        </div>
      </header>

      <main className="max-w-7xl mx-auto p-6 pb-32">
        {/* Stats Section */}
        <section className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10">
          <StatCard 
            icon={Activity}
            title="Today's New Comments"
            value={stats.newToday.toString()}
            subtitle="/ 20 tracked"
            progress={(stats.newToday / 20) * 100}
            colorClass="text-neon-blue"
            glowClass="glow-blue"
            badgeText="ACTIVE"
          />
          <StatCard 
            icon={History}
            title="Pending Follow-ups"
            value={stats.pending.toString().padStart(2, '0')}
            subtitle="from previous days"
            colorClass="text-neon-purple"
            glowClass="glow-purple"
            badgeText="PENDING"
            alert={stats.pending > 5 ? "Immediate action required" : undefined}
          />
          <StatCard 
            icon={Zap}
            title="Completion Rate"
            value={`${stats.completion}%`}
            subtitle="efficiency score"
            progress={stats.completion}
            colorClass="text-neon-green"
            glowClass="glow-green"
            badgeText="OPTIMIZED"
          />
        </section>

        {/* Input Section */}
        <div className="bg-slate-900/20 rounded-xl border border-white/5 p-6 mb-8">
          <div className="flex flex-col md:flex-row gap-4 items-center">
            <div className="flex-1 w-full relative group">
              <LinkIcon className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-500 group-focus-within:text-neon-blue transition-colors" />
              <input 
                value={url}
                onChange={(e) => setUrl(e.target.value)}
                className="w-full bg-black/50 border border-slate-700 rounded-xl py-4 pl-12 pr-4 text-white focus:ring-1 focus:ring-neon-blue focus:border-neon-blue placeholder-slate-600 transition-all outline-none"
                placeholder="Paste new Facebook post URL here..."
                type="text"
              />
            </div>
            <button 
              onClick={handleLogNow}
              disabled={isLogging}
              className="w-full md:w-auto bg-primary hover:bg-orange-500 disabled:bg-slate-700 text-white px-10 py-4 rounded-xl font-black uppercase tracking-widest shadow-lg shadow-primary/20 transition-all flex items-center justify-center gap-2 active:scale-95"
            >
              {isLogging ? (
                <>
                  Analyzing...
                  <Loader2 className="w-5 h-5 animate-spin" />
                </>
              ) : (
                <>
                  Log Now
                  <PlusCircle className="w-5 h-5" />
                </>
              )}
            </button>
          </div>
        </div>

        {/* Filter Navigation */}
        <div className="mb-8 p-1 bg-slate-900/40 rounded-full border border-white/5 flex flex-wrap gap-2 w-fit">
          <button 
            onClick={() => setActiveTab('pending')}
            className={`flex items-center gap-2 px-6 py-2 rounded-full font-bold transition-all ${
              activeTab === 'pending' 
                ? 'bg-red-600 text-white shadow-[0_0_15px_rgba(220,38,38,0.5)]' 
                : 'border border-red-600/30 text-red-500 hover:bg-red-600/10'
            }`}
          >
            <Clock className="w-4 h-4" />
            Pending
          </button>
          <button 
            onClick={() => setActiveTab('new')}
            className={`flex items-center gap-2 px-6 py-2 rounded-full font-bold transition-all ${
              activeTab === 'new' 
                ? 'bg-neon-blue text-background-dark shadow-[0_0_15px_rgba(0,210,255,0.5)]' 
                : 'border border-neon-blue/30 text-neon-blue hover:bg-neon-blue/10'
            }`}
          >
            <Sparkles className="w-4 h-4" />
            New
          </button>
          <button 
            onClick={() => setActiveTab('high-priority')}
            className={`flex items-center gap-2 px-6 py-2 rounded-full font-bold transition-all ${
              activeTab === 'high-priority' 
                ? 'bg-yellow-500 text-background-dark shadow-[0_0_15px_rgba(234,179,8,0.5)]' 
                : 'border border-yellow-500/30 text-yellow-500 hover:bg-yellow-500/10'
            }`}
          >
            <Star className="w-4 h-4" />
            High Priority
          </button>
          <button 
            onClick={() => setActiveTab('closed')}
            className={`flex items-center gap-2 px-6 py-2 rounded-full font-bold transition-all ${
              activeTab === 'closed' 
                ? 'bg-emerald-600 text-white shadow-[0_0_15px_rgba(16,185,129,0.5)]' 
                : 'border border-emerald-500/30 text-emerald-500 hover:bg-emerald-500/10'
            }`}
          >
            <CircleDollarSign className="w-4 h-4" />
            Closed
          </button>
          <button 
            onClick={() => setActiveTab('archive')}
            className={`flex items-center gap-2 px-6 py-2 rounded-full font-bold transition-all ${
              activeTab === 'archive' 
                ? 'bg-slate-700 text-white shadow-[0_0_15px_rgba(100,116,139,0.5)]' 
                : 'border border-slate-500/30 text-slate-500 hover:bg-slate-500/10'
            }`}
          >
            <Archive className="w-4 h-4" />
            Archive
          </button>
        </div>

        {/* Content Section */}
        <section className="mb-10">
          <div className="flex items-center justify-between mb-6">
            <h2 className={`font-bold flex items-center gap-3 text-2xl`}>
              <ViewIcon className={`${viewColor} w-8 h-8`} />
              {viewTitle}
            </h2>
            <div className="flex gap-2">
              <span className="text-[10px] font-bold py-1 px-3 rounded-full border border-slate-700 text-slate-400 flex items-center gap-1 uppercase tracking-widest">
                Total {filteredData.length} {activeTab === 'archive' ? 'Records' : 'Posts'}
              </span>
            </div>
          </div>

          <AnimatePresence mode="wait">
            <motion.div 
              key={activeTab}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="bg-slate-900/20 rounded-xl border border-white/5 overflow-hidden"
            >
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead className="bg-white/5 text-slate-400 text-[10px] uppercase tracking-[0.2em] font-bold">
                    <tr>
                      <th className="px-6 py-5">No.</th>
                      <th className="px-6 py-5">Date</th>
                      <th className="px-6 py-5">Facebook Group</th>
                      <th className="px-6 py-5">Poster Name</th>
                      <th className="px-6 py-5 text-center">
                        <div className="flex justify-center"><Archive className="w-4 h-4 text-slate-400" /></div>
                      </th>
                      <th className="px-6 py-5 text-center">
                        <div className="flex justify-center"><Star className="w-4 h-4 text-yellow-500 fill-yellow-500/20" /></div>
                      </th>
                      <th className="px-6 py-5 text-center">
                        <div className="flex justify-center"><CircleDollarSign className="w-4 h-4 text-emerald-500" /></div>
                      </th>
                      <th className="px-6 py-5 text-center">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-white/5">
                    {filteredData.map((item, idx) => (
                      <tr key={item.id} className="hover:bg-white/5 transition-colors group">
                        <td className="px-6 py-5 font-bold text-slate-400">{idx + 1}</td>
                        <td className="px-6 py-5 text-sm text-slate-300">{item.date}</td>
                        <td className="px-6 py-5 text-sm font-medium text-white">{item.group}</td>
                        <td className="px-6 py-5">
                          <span className={`font-bold ${item.isHighPriority ? 'text-yellow-500' : 'text-white'}`}>
                            {item.posterName}
                          </span>
                        </td>
                        <td className="px-6 py-5">
                          <div className="flex justify-center">
                            <button 
                              onClick={() => toggleStatus(item.id, 'isArchived')}
                              className={`w-5 h-5 rounded border flex items-center justify-center transition-all cursor-pointer hover:scale-110 active:scale-90 ${
                                item.isArchived ? 'bg-slate-500 border-slate-500' : 'border-slate-700 bg-slate-800'
                              }`}
                            >
                              {item.isArchived && <CheckCircle2 className="w-3 h-3 text-background-dark" />}
                            </button>
                          </div>
                        </td>
                        <td className="px-6 py-5">
                          <div className="flex justify-center">
                            <button 
                              onClick={() => toggleStatus(item.id, 'isHighPriority')}
                              className={`w-5 h-5 rounded border flex items-center justify-center transition-all cursor-pointer hover:scale-110 active:scale-90 ${
                                item.isHighPriority ? 'bg-yellow-500 border-yellow-500' : 'border-slate-700 bg-slate-800'
                              }`}
                            >
                              {item.isHighPriority && <Star className="w-3 h-3 text-background-dark fill-background-dark" />}
                            </button>
                          </div>
                        </td>
                        <td className="px-6 py-5">
                          <div className="flex justify-center">
                            <button 
                              onClick={() => toggleStatus(item.id, 'isClosed')}
                              className={`w-5 h-5 rounded border flex items-center justify-center transition-all cursor-pointer hover:scale-110 active:scale-90 ${
                                item.isClosed ? 'bg-emerald-500 border-emerald-500' : 'border-slate-700 bg-slate-800'
                              }`}
                            >
                              {item.isClosed && <CheckCircle2 className="w-3 h-3 text-background-dark" />}
                            </button>
                          </div>
                        </td>
                        <td className="px-6 py-5 text-center">
                          <button 
                            onClick={() => window.open(item.url, '_blank')}
                            className="bg-neon-blue text-background-dark px-6 py-2 rounded-lg font-bold hover:brightness-110 transition-all flex items-center gap-2 text-sm mx-auto active:scale-95"
                          >
                            <ExternalLink className="w-4 h-4" />
                            View Post
                          </button>
                        </td>
                      </tr>
                    ))}
                    {filteredData.length === 0 && (
                      <tr>
                        <td colSpan={8} className="px-6 py-20 text-center text-slate-500 italic">
                          No records found in this category.
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>

              {/* Pagination */}
              <div className="p-6 border-t border-white/5 flex items-center justify-between">
                <button className="flex items-center gap-2 px-4 py-2 rounded-lg border border-slate-800 text-slate-600 cursor-not-allowed opacity-50 text-xs font-bold uppercase tracking-widest">
                  <ChevronLeft className="w-4 h-4" />
                  Previous
                </button>
                <div className="flex items-center gap-2">
                  {[1, 2, 3, 4, 5].map(p => (
                    <button 
                      key={p}
                      className={`w-10 h-10 rounded-lg flex items-center justify-center text-xs font-bold transition-all ${
                        p === 1 
                          ? 'bg-neon-blue text-background-dark shadow-[0_0_15px_rgba(0,210,255,0.3)]' 
                          : 'border border-slate-700 text-slate-400 hover:border-neon-blue hover:text-neon-blue'
                      }`}
                    >
                      {p}
                    </button>
                  ))}
                </div>
                <button className="group flex items-center gap-2 px-4 py-2 rounded-lg border border-slate-700 hover:border-neon-blue text-slate-300 hover:text-neon-blue text-xs font-bold uppercase tracking-widest transition-all">
                  Next
                  <ChevronRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                </button>
              </div>
            </motion.div>
          </AnimatePresence>
        </section>
      </main>
    </div>
  );
}
