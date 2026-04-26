'use client';

import React, { useState, useMemo } from 'react';
import { ThemeToggle } from '@/components/theme-toggle';
import inventoryData from './inventory-data.json';

// ─── TYPES ──────────────────────────────────────────────────────────────────
type Category = 'Core' | 'Shared' | 'Feature';
type Status = 'stable' | 'duplicate' | 'unused' | 'inconsistent';
type FilterType = 'All' | 'Core' | 'Most Used' | 'Duplicates' | 'Unused';

interface UIComponent {
  id: string;
  name: string;
  path: string;
  category: Category;
  status: Status;
  usedIn: string[];
  usageCount: number;
  variantsCount: number;
  notes?: string;
}

const rawInventory = inventoryData.components as UIComponent[];
const metricsRaw = inventoryData.metadata;

// ─── COMPONENT ──────────────────────────────────────────────────────────────

export default function UIInventoryPage() {
  const [activeFilter, setActiveFilter] = useState<FilterType>('All');
  const [searchQuery, setSearchQuery] = useState('');

  // Metrics
  const metrics = useMemo(() => {
    return {
      total: metricsRaw.totalComponents,
      scanned: metricsRaw.totalScanned,
      core: rawInventory.filter(c => c.category === 'Core').length,
      duplicates: rawInventory.filter(c => c.status === 'duplicate').length,
      unused: rawInventory.filter(c => c.status === 'unused').length,
      failed: metricsRaw.failedParses,
    };
  }, []);

  // Filter & Sort Logic
  const processedInventory = useMemo(() => {
    let result = [...rawInventory];

    // Search
    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      result = result.filter(c => 
        c.name.toLowerCase().includes(q) || 
        c.path.toLowerCase().includes(q)
      );
    }

    // Filter Bar
    if (activeFilter === 'Core') result = result.filter(c => c.category === 'Core');
    if (activeFilter === 'Most Used') result = result.filter(c => c.usageCount >= 3);
    if (activeFilter === 'Duplicates') result = result.filter(c => c.status === 'duplicate');
    if (activeFilter === 'Unused') result = result.filter(c => c.status === 'unused');

    // Sorting: Core first -> then most used -> then least used -> then unused
    result.sort((a, b) => {
      // Unused always last
      if (a.status === 'unused' && b.status !== 'unused') return 1;
      if (b.status === 'unused' && a.status !== 'unused') return -1;

      // Core always first
      if (a.category === 'Core' && b.category !== 'Core') return -1;
      if (b.category === 'Core' && a.category !== 'Core') return 1;

      // Then by usage count descending
      return b.usageCount - a.usageCount;
    });

    return result;
  }, [searchQuery, activeFilter]);

  const getStatusStyle = (status: Status) => {
    switch(status) {
      case 'stable': return 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400';
      case 'duplicate': return 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400 border border-amber-300 dark:border-amber-700';
      case 'unused': return 'bg-gray-100 text-gray-500 dark:bg-gray-800 dark:text-gray-400 opacity-80';
      case 'inconsistent': return 'bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400';
    }
  };

  const getCardStyle = (comp: UIComponent) => {
    if (comp.category === 'Core') return 'border-blue-300 dark:border-blue-800 shadow-[0_0_15px_rgba(59,130,246,0.1)]';
    if (comp.status === 'duplicate' || comp.status === 'inconsistent') return 'border-amber-300 dark:border-amber-800/50';
    if (comp.status === 'unused') return 'border-gray-200 dark:border-gray-800 opacity-60 hover:opacity-100 transition-opacity';
    return 'border-gray-200 dark:border-gray-800';
  };

  return (
    <div className="min-h-screen bg-[#f8f9fa] dark:bg-[#0a1628] text-gray-900 dark:text-gray-100 font-sans" dir="ltr">
      
      {/* ── HEADER ── */}
      <header className="sticky top-0 z-50 bg-white/80 dark:bg-[#0a1628]/80 backdrop-blur-md border-b border-gray-200 dark:border-gray-800 px-8 py-4 flex justify-between items-center">
        <div>
          <h1 className="text-xl font-black flex items-center gap-2">
            <span className="material-symbols-outlined text-blue-600">architecture</span>
            UI Architecture System
          </h1>
          <p className="text-xs text-gray-500 font-medium mt-0.5">Static Analysis Powered Inventory</p>
        </div>
        
        <div className="flex items-center gap-6">
          <div className="relative w-64 hidden md:block">
            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 material-symbols-outlined text-[18px]">search</span>
            <input 
              type="text" 
              placeholder="Find components..." 
              className="w-full pl-9 pr-3 py-2 bg-gray-100 dark:bg-gray-800/50 border border-gray-200 dark:border-gray-700 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 outline-none transition-all"
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
            />
          </div>
          <ThemeToggle />
        </div>
      </header>

      <div className="flex flex-col lg:flex-row h-[calc(100vh-73px)]">
        
        {/* ── SIDEBAR & METRICS ── */}
        <aside className="lg:w-72 border-r border-gray-200 dark:border-gray-800 bg-white dark:bg-[#0d1b2a] flex flex-col h-full overflow-y-auto">
          
          {/* Global Insights */}
          <div className="p-6 border-b border-gray-200 dark:border-gray-800">
            <h2 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-4 flex items-center gap-2">
              <span className="material-symbols-outlined text-[16px]">monitoring</span>
              Global Insights
            </h2>
            <div className="grid grid-cols-2 gap-3">
              <div className="bg-gray-50 dark:bg-gray-800/50 p-3 rounded-xl text-center">
                <span className="block text-2xl font-black text-blue-600 dark:text-blue-400">{metrics.total}</span>
                <span className="text-[10px] text-gray-500 font-bold uppercase tracking-wider">Total Comps</span>
              </div>
              <div className="bg-blue-50 dark:bg-blue-900/20 p-3 rounded-xl text-center">
                <span className="block text-2xl font-black text-blue-600 dark:text-blue-400">{metrics.core}</span>
                <span className="text-[10px] text-blue-600 dark:text-blue-400 font-bold uppercase tracking-wider">Core</span>
              </div>
              <div className="bg-amber-50 dark:bg-amber-900/20 p-3 rounded-xl text-center">
                <span className="block text-2xl font-black text-amber-600 dark:text-amber-500">{metrics.duplicates}</span>
                <span className="text-[10px] text-amber-600 dark:text-amber-500 font-bold uppercase tracking-wider">Duplicates</span>
              </div>
              <div className="bg-red-50 dark:bg-red-900/20 p-3 rounded-xl text-center">
                <span className="block text-2xl font-black text-red-600 dark:text-red-500">{metrics.unused}</span>
                <span className="text-[10px] text-red-600 dark:text-red-500 font-bold uppercase tracking-wider">Dead</span>
              </div>
            </div>
            
            {/* DEBUG PANEL */}
            <div className="mt-4 p-3 bg-[#0a1628] rounded-xl text-xs font-mono text-emerald-400 border border-gray-800">
              <div className="text-[10px] text-gray-500 mb-1 border-b border-gray-800 pb-1">STATIC SCAN DEBUG</div>
              <div>Scanned: {metrics.scanned} files</div>
              <div>Detected: {metrics.total} components</div>
              <div>Failed Parses: {metrics.failed}</div>
            </div>
          </div>

          {/* Filters */}
          <div className="p-6">
            <h2 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-4 flex items-center gap-2">
              <span className="material-symbols-outlined text-[16px]">filter_list</span>
              System Views
            </h2>
            <div className="flex flex-col gap-1.5">
              {(['All', 'Core', 'Most Used', 'Duplicates', 'Unused'] as FilterType[]).map(filter => (
                <button
                  key={filter}
                  onClick={() => setActiveFilter(filter)}
                  className={`flex justify-between items-center px-4 py-2.5 rounded-lg text-sm font-semibold transition-all ${
                    activeFilter === filter 
                      ? 'bg-blue-600 text-white shadow-md' 
                      : 'text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800/80'
                  }`}
                >
                  {filter}
                  {filter === 'Duplicates' && metrics.duplicates > 0 && (
                    <span className={`px-2 py-0.5 rounded-full text-[10px] ${activeFilter === filter ? 'bg-white/20 text-white' : 'bg-amber-100 text-amber-700'}`}>{metrics.duplicates}</span>
                  )}
                  {filter === 'Unused' && metrics.unused > 0 && (
                    <span className={`px-2 py-0.5 rounded-full text-[10px] ${activeFilter === filter ? 'bg-white/20 text-white' : 'bg-red-100 text-red-700'}`}>{metrics.unused}</span>
                  )}
                </button>
              ))}
            </div>
          </div>

        </aside>

        {/* ── MAIN CONTENT ── */}
        <main className="flex-1 p-6 md:p-8 overflow-y-auto bg-gray-50 dark:bg-[#0a1628]">
          <div className="max-w-6xl mx-auto flex flex-col gap-6 pb-20">
            
            {processedInventory.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-32 text-gray-400">
                <span className="material-symbols-outlined text-6xl mb-4 opacity-50">search_off</span>
                <p className="text-lg font-medium">No components found</p>
              </div>
            ) : (
              processedInventory.map(comp => (
                <div key={comp.id} className={`bg-white dark:bg-[#152336] border-2 rounded-2xl overflow-hidden shadow-sm transition-all ${getCardStyle(comp)}`}>
                  
                  <div className="flex flex-col xl:flex-row">
                    
                    {/* Details Pane */}
                    <div className="xl:w-[60%] p-6 border-b xl:border-b-0 xl:border-r border-gray-100 dark:border-gray-800/80 flex flex-col justify-between">
                      <div>
                        <div className="flex items-start justify-between mb-2">
                          <div>
                            <h3 className="text-xl font-bold flex items-center gap-2">
                              {comp.name}
                              {comp.category === 'Core' && <span className="material-symbols-outlined text-blue-500 text-[18px]" title="Core Primitive">verified</span>}
                            </h3>
                            <code className="text-[11px] text-gray-500 dark:text-gray-400 font-mono mt-1 block max-w-full truncate">
                              {comp.path}
                            </code>
                          </div>
                          <span className={`px-2.5 py-1 text-[11px] font-bold uppercase rounded-md ${getStatusStyle(comp.status)}`}>
                            {comp.status}
                          </span>
                        </div>

                        {comp.notes && (
                          <div className="mt-4 p-3 bg-amber-50 dark:bg-amber-900/10 border border-amber-100 dark:border-amber-900/30 rounded-lg text-xs text-amber-700 dark:text-amber-400 flex items-start gap-2">
                            <span className="material-symbols-outlined text-[16px] shrink-0 mt-0.5">warning</span>
                            <p>{comp.notes}</p>
                          </div>
                        )}
                      </div>

                      {/* Intelligence Metrics */}
                      <div className="mt-6 pt-4 border-t border-gray-100 dark:border-gray-800">
                        <div className="flex gap-6 mb-4">
                          <div>
                            <span className="block text-xs font-bold text-gray-400 uppercase tracking-wider mb-1">Usage Count</span>
                            <span className="text-lg font-black">{comp.usageCount}</span>
                          </div>
                          <div>
                            <span className="block text-xs font-bold text-gray-400 uppercase tracking-wider mb-1">Variants</span>
                            <span className="text-lg font-black">{comp.variantsCount}</span>
                          </div>
                          <div>
                            <span className="block text-xs font-bold text-gray-400 uppercase tracking-wider mb-1">Category</span>
                            <span className="inline-block mt-1 px-2 py-0.5 bg-gray-100 dark:bg-gray-800 text-xs font-medium rounded text-gray-600 dark:text-gray-300">{comp.category}</span>
                          </div>
                        </div>

                        <div>
                          <span className="block text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-2">Used In (Top 3)</span>
                          {comp.usedIn.length > 0 ? (
                            <div className="flex flex-wrap gap-2">
                              {comp.usedIn.slice(0, 3).map(u => (
                                <span key={u} className="px-2 py-1 rounded bg-blue-50 text-blue-600 dark:bg-blue-900/20 dark:text-blue-400 text-[10px] font-mono font-medium truncate max-w-[200px]" title={u}>
                                  {u.split('/').pop()}
                                </span>
                              ))}
                              {comp.usedIn.length > 3 && (
                                <span className="px-2 py-1 text-[10px] text-gray-400">+{comp.usedIn.length - 3} more</span>
                              )}
                            </div>
                          ) : (
                            <span className="text-[10px] text-red-500 font-bold px-2 py-1 bg-red-50 dark:bg-red-900/20 rounded">Not used anywhere in scanned files</span>
                          )}
                        </div>
                      </div>
                    </div>

                    {/* Live Preview Pane */}
                    <div className="xl:w-[40%] bg-gray-50/50 dark:bg-[#060e1e]/30 p-8 flex items-center justify-center relative min-h-[250px]">
                      <span className="absolute top-3 right-4 text-[10px] font-bold text-gray-300 dark:text-gray-600 uppercase tracking-widest flex items-center gap-1">
                        <span className="material-symbols-outlined text-[14px]">visibility</span>
                        Preview Placeholder
                      </span>
                      
                      <div className="w-full h-full flex flex-col items-center justify-center text-gray-400 border-2 border-dashed border-gray-200 dark:border-gray-800 rounded-xl p-4">
                        <span className="material-symbols-outlined text-4xl mb-2 opacity-50">widgets</span>
                        <p className="text-xs text-center">{comp.name}</p>
                        <p className="text-[9px] text-gray-500 mt-1">Render disabled for safety</p>
                      </div>
                    </div>

                  </div>
                </div>
              ))
            )}

          </div>
        </main>
      </div>
    </div>
  );
}
