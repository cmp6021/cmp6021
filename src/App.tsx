/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { 
  Shield, Plus, Trash2, Copy, Check, Globe, Lock, Zap, Activity, Server,
  Settings, Layout, Info, Key, Wifi, Cpu, Database, Eye, EyeOff, Save,
  RefreshCw, Network, Route, Download, Upload
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

interface Node {
  id: number;
  name: string;
  type: string;
  address: string;
  port: number;
  method?: string;
  password?: string;
  uuid?: string;
  security?: string;
  sni?: string;
  flow?: string;
}

interface Settings {
  sub_token: string;
  routing_mode: string;
  update_interval: string;
  dns_server: string;
}

const mockTrafficData = Array.from({ length: 20 }, (_, i) => ({
  time: `${i}:00`,
  download: Math.floor(Math.random() * 500) + 100,
  upload: Math.floor(Math.random() * 200) + 50,
}));

export default function App() {
  const [activeTab, setActiveTab] = useState<'dashboard' | 'activity' | 'network' | 'settings'>('dashboard');
  const [nodes, setNodes] = useState<Node[]>([]);
  const [settings, setSettings] = useState<Settings>({
    sub_token: 'default-token',
    routing_mode: 'rule',
    update_interval: '24',
    dns_server: '1.1.1.1'
  });
  
  const [isAdding, setIsAdding] = useState(false);
  const [copied, setCopied] = useState<string | null>(null);
  const [viewMode, setViewMode] = useState<'simple' | 'pro'>('simple');
  const [toast, setToast] = useState<string | null>(null);
  
  const [newNode, setNewNode] = useState({
    name: '', type: 'vless', address: '', port: 443, method: 'aes-256-gcm', 
    password: '', uuid: '', security: 'reality', sni: '', flow: 'xtls-rprx-vision',
    public_key: '', short_id: ''
  });

  const subUrl = `${window.location.origin}/sub/${settings.sub_token}`;

  useEffect(() => {
    fetchNodes();
    fetchSettings();
  }, []);

  const fetchNodes = async () => {
    const res = await fetch('/api/nodes');
    const data = await res.json();
    setNodes(data);
  };

  const fetchSettings = async () => {
    const res = await fetch('/api/settings');
    const data = await res.json();
    setSettings(data);
  };

  const saveSettings = async (newSettings: Partial<Settings>) => {
    const updated = { ...settings, ...newSettings };
    setSettings(updated);
    await fetch('/api/settings', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(newSettings)
    });
    showToast('Settings saved successfully');
  };

  const addNode = async (e: React.FormEvent) => {
    e.preventDefault();
    await fetch('/api/nodes', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(newNode)
    });
    setIsAdding(false);
    setNewNode({ 
      name: '', type: 'vless', address: '', port: 443, method: 'aes-256-gcm', 
      password: '', uuid: '', security: 'reality', sni: '', flow: 'xtls-rprx-vision',
      public_key: '', short_id: ''
    });
    fetchNodes();
    showToast('Node provisioned successfully');
  };

  const deleteNode = async (id: number) => {
    await fetch(`/api/nodes/${id}`, { method: 'DELETE' });
    fetchNodes();
    showToast('Node deleted');
  };

  const copyToClipboard = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopied(id);
    setTimeout(() => setCopied(null), 2000);
    showToast('Copied to clipboard');
  };

  const showToast = (msg: string) => {
    setToast(msg);
    setTimeout(() => setToast(null), 3000);
  };

  return (
    <div className="min-h-screen bg-[#050505] text-white font-sans selection:bg-emerald-500/30">
      {/* Sidebar */}
      <div className="fixed left-0 top-0 h-full w-20 bg-[#0a0a0a] border-r border-white/5 flex flex-col items-center py-8 gap-8 z-50">
        <div className="w-12 h-12 bg-emerald-600 rounded-2xl flex items-center justify-center shadow-lg shadow-emerald-600/20">
          <Shield className="w-6 h-6" />
        </div>
        <nav className="flex flex-col gap-6">
          <NavItem icon={<Layout className="w-5 h-5" />} active={activeTab === 'dashboard'} onClick={() => setActiveTab('dashboard')} />
          <NavItem icon={<Activity className="w-5 h-5" />} active={activeTab === 'activity'} onClick={() => setActiveTab('activity')} />
          <NavItem icon={<Globe className="w-5 h-5" />} active={activeTab === 'network'} onClick={() => setActiveTab('network')} />
          <NavItem icon={<Settings className="w-5 h-5" />} active={activeTab === 'settings'} onClick={() => setActiveTab('settings')} />
        </nav>
      </div>

      <main className="pl-20">
        {/* Header */}
        <header className="h-20 border-b border-white/5 flex items-center justify-between px-10 bg-[#050505]/80 backdrop-blur-xl sticky top-0 z-40">
          <div className="flex items-center gap-6">
            <div>
              <h1 className="text-xl font-semibold tracking-tight capitalize">{activeTab}</h1>
              <p className="text-[10px] text-zinc-500 uppercase tracking-widest mt-0.5">Nexus Control Center</p>
            </div>
            {activeTab === 'dashboard' && (
              <>
                <div className="h-8 w-px bg-white/10" />
                <div className="flex items-center gap-4 bg-white/5 p-1 rounded-xl border border-white/5">
                  <button 
                    onClick={() => setViewMode('simple')}
                    className={`px-4 py-1.5 rounded-lg text-xs font-medium transition-all ${viewMode === 'simple' ? 'bg-white text-black' : 'text-zinc-400 hover:text-white'}`}
                  >
                    Simple
                  </button>
                  <button 
                    onClick={() => setViewMode('pro')}
                    className={`px-4 py-1.5 rounded-lg text-xs font-medium transition-all ${viewMode === 'pro' ? 'bg-white text-black' : 'text-zinc-400 hover:text-white'}`}
                  >
                    Professional
                  </button>
                </div>
              </>
            )}
          </div>
          
          <div className="flex items-center gap-6">
            <div className="flex items-center gap-6 text-xs text-zinc-400">
              <div className="flex items-center gap-2">
                <Cpu className="w-3.5 h-3.5" />
                <span>CPU: 12%</span>
              </div>
              <div className="flex items-center gap-2">
                <Database className="w-3.5 h-3.5" />
                <span>MEM: 450MB</span>
              </div>
            </div>
            <button className="flex items-center gap-2 px-4 py-2 bg-emerald-600 text-white rounded-xl text-xs font-semibold shadow-lg shadow-emerald-600/20">
              <Wifi className="w-3.5 h-3.5" />
              Connected
            </button>
          </div>
        </header>

        <div className="p-10 max-w-7xl mx-auto space-y-10">
          <AnimatePresence mode="wait">
            {/* --- DASHBOARD VIEW --- */}
            {activeTab === 'dashboard' && (
              <motion.div key="dashboard" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} className="space-y-10">
                <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                  <StatCard label="Total Nodes" value={nodes.length.toString()} icon={<Server className="w-4 h-4" />} />
                  <StatCard label="Active Users" value="1,240" icon={<Activity className="w-4 h-4" />} />
                  <StatCard label="Traffic (24h)" value="4.2 TB" icon={<Zap className="w-4 h-4" />} />
                  <StatCard label="Uptime" value="99.9%" icon={<Shield className="w-4 h-4" />} />
                </div>

                <section className="bg-[#0a0a0a] border border-white/5 rounded-[2rem] p-8 relative overflow-hidden">
                  <div className="absolute top-0 right-0 w-64 h-64 bg-emerald-600/10 blur-[100px] -mr-32 -mt-32" />
                  <div className="relative flex flex-col md:flex-row items-center justify-between gap-8">
                    <div className="space-y-3">
                      <h2 className="text-lg font-medium flex items-center gap-2">
                        <Key className="w-5 h-5 text-emerald-500" />
                        Universal Subscription Link
                      </h2>
                      <p className="text-zinc-500 text-sm max-w-md">
                        Supports Shadowsocks, VMess, VLESS (Reality), and Trojan. One link for all your Windows clients.
                      </p>
                    </div>
                    <div className="flex-1 max-w-xl w-full">
                      <div className="flex items-center gap-2 bg-black p-1.5 rounded-2xl border border-white/10">
                        <div className="flex-1 px-4 py-2 font-mono text-[11px] text-emerald-400 truncate">
                          {subUrl}
                        </div>
                        <button 
                          onClick={() => copyToClipboard(subUrl, 'sub')}
                          className="flex items-center gap-2 px-6 py-2.5 bg-white text-black rounded-xl font-bold text-xs hover:bg-zinc-200 transition-all active:scale-95"
                        >
                          {copied === 'sub' ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                          {copied === 'sub' ? 'Copied' : 'Copy'}
                        </button>
                      </div>
                    </div>
                  </div>
                </section>

                <section className="space-y-6">
                  <div className="flex items-center justify-between">
                    <h3 className="text-lg font-medium">Network Nodes</h3>
                    <button 
                      onClick={() => setIsAdding(true)}
                      className="px-5 py-2.5 bg-white text-black rounded-xl text-xs font-bold hover:bg-zinc-200 transition-all flex items-center gap-2"
                    >
                      <Plus className="w-4 h-4" />
                      Add New Protocol
                    </button>
                  </div>

                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    <AnimatePresence>
                      {nodes.map((node) => (
                        <motion.div
                          key={node.id}
                          layout
                          initial={{ opacity: 0, scale: 0.95 }}
                          animate={{ opacity: 1, scale: 1 }}
                          exit={{ opacity: 0, scale: 0.95 }}
                          className="bg-[#0a0a0a] border border-white/5 rounded-3xl p-6 hover:border-white/10 transition-all group relative overflow-hidden"
                        >
                          <div className="flex items-start justify-between relative z-10">
                            <div className="flex items-center gap-4">
                              <div className={`w-12 h-12 rounded-2xl flex items-center justify-center border border-white/5 transition-colors ${node.type === 'vless' ? 'bg-emerald-500/10 text-emerald-500' : 'bg-blue-500/10 text-blue-500'}`}>
                                <Server className="w-6 h-6" />
                              </div>
                              <div>
                                <h4 className="font-medium text-zinc-100">{node.name}</h4>
                                <div className="flex items-center gap-2 mt-1">
                                  <span className="text-[9px] font-bold uppercase tracking-widest px-2 py-0.5 bg-white/5 text-zinc-400 rounded border border-white/5">
                                    {node.type}
                                  </span>
                                  <span className="text-[9px] text-zinc-500 uppercase tracking-widest">
                                    {node.address}:{node.port}
                                  </span>
                                </div>
                              </div>
                            </div>
                            <div className="flex items-center gap-2">
                              <button className="p-2 text-zinc-600 hover:text-white transition-colors">
                                <Info className="w-4 h-4" />
                              </button>
                              <button 
                                onClick={() => deleteNode(node.id)}
                                className="p-2 text-zinc-600 hover:text-red-500 transition-colors"
                              >
                                <Trash2 className="w-4 h-4" />
                              </button>
                            </div>
                          </div>

                          {viewMode === 'pro' && (
                            <motion.div 
                              initial={{ opacity: 0, height: 0 }}
                              animate={{ opacity: 1, height: 'auto' }}
                              className="mt-6 pt-6 border-t border-white/5 grid grid-cols-2 gap-4"
                            >
                              <ProField label="UUID / Password" value={node.uuid || node.password || 'N/A'} secret />
                              <ProField label="Security" value={node.security || 'None'} />
                              <ProField label="SNI" value={node.sni || 'None'} />
                              <ProField label="Flow" value={node.flow || 'None'} />
                            </motion.div>
                          )}

                          {viewMode === 'simple' && (
                            <div className="mt-6 flex items-center justify-between">
                              <div className="flex items-center gap-6">
                                <div className="flex flex-col">
                                  <span className="text-[9px] text-zinc-500 uppercase tracking-widest">Latency</span>
                                  <span className="text-xs font-medium text-emerald-500">24ms</span>
                                </div>
                                <div className="flex flex-col">
                                  <span className="text-[9px] text-zinc-500 uppercase tracking-widest">Load</span>
                                  <span className="text-xs font-medium text-zinc-300">12%</span>
                                </div>
                              </div>
                              <div className="flex -space-x-2">
                                {[1,2,3].map(i => (
                                  <div key={i} className="w-6 h-6 rounded-full border-2 border-[#0a0a0a] bg-zinc-800 flex items-center justify-center">
                                    <div className="w-1 h-1 bg-emerald-500 rounded-full" />
                                  </div>
                                ))}
                              </div>
                            </div>
                          )}
                        </motion.div>
                      ))}
                    </AnimatePresence>
                  </div>
                </section>
              </motion.div>
            )}

            {/* --- ACTIVITY VIEW --- */}
            {activeTab === 'activity' && (
              <motion.div key="activity" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} className="space-y-8">
                <div className="bg-[#0a0a0a] border border-white/5 rounded-[2rem] p-8">
                  <div className="flex items-center justify-between mb-8">
                    <div>
                      <h3 className="text-lg font-medium">Traffic Overview</h3>
                      <p className="text-xs text-zinc-500 mt-1">Real-time bandwidth consumption</p>
                    </div>
                    <div className="flex items-center gap-4">
                      <div className="flex items-center gap-2">
                        <div className="w-2 h-2 rounded-full bg-emerald-500" />
                        <span className="text-xs text-zinc-400">Download</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <div className="w-2 h-2 rounded-full bg-blue-500" />
                        <span className="text-xs text-zinc-400">Upload</span>
                      </div>
                    </div>
                  </div>
                  <div className="h-80 w-full">
                    <ResponsiveContainer width="100%" height="100%">
                      <AreaChart data={mockTrafficData} margin={{ top: 0, right: 0, left: -20, bottom: 0 }}>
                        <defs>
                          <linearGradient id="colorDown" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="5%" stopColor="#10b981" stopOpacity={0.3} />
                            <stop offset="95%" stopColor="#10b981" stopOpacity={0} />
                          </linearGradient>
                          <linearGradient id="colorUp" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.3} />
                            <stop offset="95%" stopColor="#3b82f6" stopOpacity={0} />
                          </linearGradient>
                        </defs>
                        <CartesianGrid strokeDasharray="3 3" stroke="#ffffff10" vertical={false} />
                        <XAxis dataKey="time" stroke="#ffffff30" fontSize={10} tickLine={false} axisLine={false} />
                        <YAxis stroke="#ffffff30" fontSize={10} tickLine={false} axisLine={false} />
                        <Tooltip 
                          contentStyle={{ backgroundColor: '#111', border: '1px solid #ffffff10', borderRadius: '12px' }}
                          itemStyle={{ fontSize: '12px' }}
                        />
                        <Area type="monotone" dataKey="download" stroke="#10b981" strokeWidth={2} fillOpacity={1} fill="url(#colorDown)" />
                        <Area type="monotone" dataKey="upload" stroke="#3b82f6" strokeWidth={2} fillOpacity={1} fill="url(#colorUp)" />
                      </AreaChart>
                    </ResponsiveContainer>
                  </div>
                </div>

                <div className="bg-[#0a0a0a] border border-white/5 rounded-[2rem] p-8">
                  <h3 className="text-lg font-medium mb-6">Recent Connections</h3>
                  <div className="space-y-4">
                    {[
                      { dest: 'google.com', type: 'HTTPS', size: '1.2 MB', time: 'Just now' },
                      { dest: 'github.com', type: 'SSH', size: '45 KB', time: '2 min ago' },
                      { dest: 'youtube.com', type: 'QUIC', size: '15.4 MB', time: '5 min ago' },
                      { dest: 'api.twitter.com', type: 'HTTPS', size: '120 KB', time: '12 min ago' },
                    ].map((log, i) => (
                      <div key={i} className="flex items-center justify-between p-4 rounded-2xl bg-white/5 border border-white/5">
                        <div className="flex items-center gap-4">
                          <div className="w-10 h-10 rounded-xl bg-zinc-900 flex items-center justify-center border border-white/5">
                            <Network className="w-4 h-4 text-zinc-400" />
                          </div>
                          <div>
                            <div className="text-sm font-medium">{log.dest}</div>
                            <div className="text-[10px] text-zinc-500 uppercase tracking-widest mt-0.5">{log.type}</div>
                          </div>
                        </div>
                        <div className="text-right">
                          <div className="text-sm font-mono text-zinc-300">{log.size}</div>
                          <div className="text-[10px] text-zinc-500 mt-0.5">{log.time}</div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </motion.div>
            )}

            {/* --- NETWORK VIEW --- */}
            {activeTab === 'network' && (
              <motion.div key="network" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} className="space-y-8">
                <div className="bg-[#0a0a0a] border border-white/5 rounded-[2rem] p-8">
                  <h3 className="text-lg font-medium mb-6">Routing Mode</h3>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <RoutingCard 
                      title="Rule Based" 
                      desc="Intelligently route traffic based on predefined rules. Best for daily use." 
                      active={settings.routing_mode === 'rule'}
                      onClick={() => saveSettings({ routing_mode: 'rule' })}
                    />
                    <RoutingCard 
                      title="Global Proxy" 
                      desc="Route all traffic through the proxy. Best for strict environments." 
                      active={settings.routing_mode === 'global'}
                      onClick={() => saveSettings({ routing_mode: 'global' })}
                    />
                    <RoutingCard 
                      title="Direct" 
                      desc="Bypass the proxy completely. All traffic goes directly to the destination." 
                      active={settings.routing_mode === 'direct'}
                      onClick={() => saveSettings({ routing_mode: 'direct' })}
                    />
                  </div>
                </div>

                <div className="bg-[#0a0a0a] border border-white/5 rounded-[2rem] p-8">
                  <h3 className="text-lg font-medium mb-6">DNS Configuration</h3>
                  <div className="max-w-xl space-y-6">
                    <div className="space-y-2">
                      <label className="text-[10px] font-bold uppercase tracking-widest text-zinc-500 ml-1">Primary DNS Server</label>
                      <input 
                        value={settings.dns_server}
                        onChange={e => saveSettings({ dns_server: e.target.value })}
                        className="w-full bg-white/5 border border-white/10 rounded-2xl px-5 py-3.5 text-sm focus:outline-none focus:border-emerald-500/50 transition-all"
                        placeholder="1.1.1.1"
                      />
                    </div>
                    <div className="p-4 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 flex items-start gap-4">
                      <Info className="w-5 h-5 text-emerald-500 shrink-0 mt-0.5" />
                      <p className="text-xs text-emerald-400/80 leading-relaxed">
                        Using a secure DNS server prevents DNS leaking and improves resolution speed. Changes take effect immediately.
                      </p>
                    </div>
                  </div>
                </div>
              </motion.div>
            )}

            {/* --- SETTINGS VIEW --- */}
            {activeTab === 'settings' && (
              <motion.div key="settings" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} className="space-y-8">
                <div className="bg-[#0a0a0a] border border-white/5 rounded-[2rem] p-8">
                  <h3 className="text-lg font-medium mb-6">Subscription Security</h3>
                  <div className="max-w-xl space-y-6">
                    <div className="space-y-2">
                      <label className="text-[10px] font-bold uppercase tracking-widest text-zinc-500 ml-1">Subscription Token</label>
                      <div className="flex gap-4">
                        <input 
                          value={settings.sub_token}
                          onChange={e => setSettings({...settings, sub_token: e.target.value})}
                          className="flex-1 bg-white/5 border border-white/10 rounded-2xl px-5 py-3.5 text-sm focus:outline-none focus:border-emerald-500/50 transition-all font-mono"
                        />
                        <button 
                          onClick={() => saveSettings({ sub_token: settings.sub_token })}
                          className="px-6 py-3.5 bg-white text-black rounded-2xl font-bold text-xs hover:bg-zinc-200 transition-all"
                        >
                          Update
                        </button>
                      </div>
                      <p className="text-[10px] text-zinc-500 ml-1">Change this if your subscription link is compromised.</p>
                    </div>

                    <div className="space-y-2">
                      <label className="text-[10px] font-bold uppercase tracking-widest text-zinc-500 ml-1">Auto-Update Interval (Hours)</label>
                      <select 
                        value={settings.update_interval}
                        onChange={e => saveSettings({ update_interval: e.target.value })}
                        className="w-full bg-white/5 border border-white/10 rounded-2xl px-5 py-3.5 text-sm focus:outline-none focus:border-emerald-500/50 transition-all appearance-none"
                      >
                        <option value="12">12 Hours</option>
                        <option value="24">24 Hours</option>
                        <option value="48">48 Hours</option>
                        <option value="72">72 Hours</option>
                      </select>
                    </div>
                  </div>
                </div>

                <div className="bg-[#0a0a0a] border border-white/5 rounded-[2rem] p-8">
                  <h3 className="text-lg font-medium mb-6">System Preferences</h3>
                  <div className="space-y-4">
                    <ToggleRow label="Enable Auto-Start" desc="Launch Nexus automatically on system boot" defaultChecked />
                    <ToggleRow label="Allow LAN Connections" desc="Let other devices on your network use this proxy" />
                    <ToggleRow label="Bypass Mainland China" desc="Direct connection for domestic IP addresses" defaultChecked />
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </main>

      {/* Add Node Modal */}
      <AnimatePresence>
        {isAdding && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-6">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsAdding(false)}
              className="absolute inset-0 bg-black/90 backdrop-blur-md"
            />
            <motion.div 
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="relative w-full max-w-2xl bg-[#0a0a0a] border border-white/10 rounded-[2.5rem] p-10 shadow-2xl overflow-y-auto max-h-[90vh]"
            >
              <div className="flex items-center justify-between mb-8">
                <div>
                  <h3 className="text-xl font-semibold">Add New Protocol</h3>
                  <p className="text-xs text-zinc-500 mt-1">Configure advanced encryption parameters</p>
                </div>
                <div className="px-3 py-1 bg-emerald-500/10 text-emerald-500 rounded-full text-[10px] font-bold uppercase tracking-widest border border-emerald-500/20">
                  Secure Provisioning
                </div>
              </div>

              <form onSubmit={addNode} className="space-y-8">
                <div className="grid grid-cols-2 gap-6">
                  <FormField label="Node Name" value={newNode.name} onChange={v => setNewNode({...newNode, name: v})} placeholder="US-Premium-Reality" />
                  <div className="space-y-2">
                    <label className="text-[10px] font-bold uppercase tracking-widest text-zinc-500 ml-1">Protocol Type</label>
                    <select 
                      value={newNode.type}
                      onChange={e => setNewNode({...newNode, type: e.target.value})}
                      className="w-full bg-white/5 border border-white/10 rounded-2xl px-5 py-3.5 text-sm focus:outline-none focus:border-emerald-500/50 transition-all appearance-none"
                    >
                      <option value="vless">VLESS</option>
                      <option value="vmess">VMess</option>
                      <option value="trojan">Trojan</option>
                      <option value="ss">Shadowsocks</option>
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-3 gap-6">
                  <div className="col-span-2">
                    <FormField label="Address" value={newNode.address} onChange={v => setNewNode({...newNode, address: v})} placeholder="server.example.com" />
                  </div>
                  <FormField label="Port" value={newNode.port.toString()} onChange={v => setNewNode({...newNode, port: parseInt(v)})} placeholder="443" type="number" />
                </div>

                {newNode.type === 'vless' && (
                  <div className="space-y-6 animate-in fade-in slide-in-from-top-2">
                    <div className="grid grid-cols-2 gap-6">
                      <FormField label="UUID" value={newNode.uuid} onChange={v => setNewNode({...newNode, uuid: v})} placeholder="00000000-0000-0000-0000-000000000000" />
                      <FormField label="Flow" value={newNode.flow} onChange={v => setNewNode({...newNode, flow: v})} placeholder="xtls-rprx-vision" />
                    </div>
                    <div className="grid grid-cols-2 gap-6">
                      <FormField label="Security" value={newNode.security} onChange={v => setNewNode({...newNode, security: v})} placeholder="reality" />
                      <FormField label="SNI" value={newNode.sni} onChange={v => setNewNode({...newNode, sni: v})} placeholder="google.com" />
                    </div>
                    <div className="grid grid-cols-2 gap-6">
                      <FormField label="Public Key" value={newNode.public_key} onChange={v => setNewNode({...newNode, public_key: v})} placeholder="Reality Public Key" />
                      <FormField label="Short ID" value={newNode.short_id} onChange={v => setNewNode({...newNode, short_id: v})} placeholder="Reality Short ID" />
                    </div>
                  </div>
                )}

                {(newNode.type === 'vmess' || newNode.type === 'ss' || newNode.type === 'trojan') && (
                  <div className="space-y-6">
                    <FormField label={newNode.type === 'ss' ? 'Password' : 'UUID / Password'} value={newNode.uuid || newNode.password} onChange={v => newNode.type === 'ss' ? setNewNode({...newNode, password: v}) : setNewNode({...newNode, uuid: v})} placeholder="Secret Key" />
                    {newNode.type === 'ss' && (
                      <FormField label="Method" value={newNode.method} onChange={v => setNewNode({...newNode, method: v})} placeholder="aes-256-gcm" />
                    )}
                  </div>
                )}

                <div className="flex gap-4 pt-4">
                  <button 
                    type="button"
                    onClick={() => setIsAdding(false)}
                    className="flex-1 py-4 bg-white/5 text-zinc-400 rounded-2xl font-bold text-xs hover:bg-white/10 transition-all"
                  >
                    Discard Changes
                  </button>
                  <button 
                    type="submit"
                    className="flex-1 py-4 bg-emerald-600 text-white rounded-2xl font-bold text-xs hover:bg-emerald-700 transition-all shadow-xl shadow-emerald-600/20"
                  >
                    Provision Protocol
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Toast Notification */}
      <AnimatePresence>
        {toast && (
          <motion.div 
            initial={{ opacity: 0, y: 50, x: '-50%' }}
            animate={{ opacity: 1, y: 0, x: '-50%' }}
            exit={{ opacity: 0, y: 20, x: '-50%' }}
            className="fixed bottom-8 left-1/2 z-[200] px-6 py-3 bg-white text-black rounded-full shadow-2xl font-medium text-sm flex items-center gap-3"
          >
            <Check className="w-4 h-4 text-emerald-500" />
            {toast}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

function NavItem({ icon, active = false, onClick }: { icon: React.ReactNode; active?: boolean; onClick: () => void }) {
  return (
    <button 
      onClick={onClick}
      className={`p-3.5 rounded-2xl transition-all ${active ? 'bg-emerald-600 text-white shadow-lg shadow-emerald-600/20' : 'text-zinc-600 hover:text-zinc-400 hover:bg-white/5'}`}
    >
      {icon}
    </button>
  );
}

function StatCard({ label, value, icon }: { label: string; value: string; icon: React.ReactNode }) {
  return (
    <div className="bg-[#0a0a0a] border border-white/5 rounded-3xl p-6 hover:border-white/10 transition-all">
      <div className="flex items-center justify-between mb-4">
        <span className="text-[10px] font-bold uppercase tracking-widest text-zinc-500">{label}</span>
        <div className="text-zinc-600">{icon}</div>
      </div>
      <div className="text-2xl font-semibold tracking-tight">{value}</div>
    </div>
  );
}

function FormField({ label, value, onChange, placeholder, type = "text" }: { label: string; value: string; onChange: (v: string) => void; placeholder: string; type?: string }) {
  return (
    <div className="space-y-2">
      <label className="text-[10px] font-bold uppercase tracking-widest text-zinc-500 ml-1">{label}</label>
      <input 
        required
        type={type}
        value={value}
        onChange={e => onChange(e.target.value)}
        className="w-full bg-white/5 border border-white/10 rounded-2xl px-5 py-3.5 text-sm focus:outline-none focus:border-emerald-500/50 transition-all placeholder:text-zinc-700"
        placeholder={placeholder}
      />
    </div>
  );
}

function ProField({ label, value, secret = false }: { label: string; value: string; secret?: boolean }) {
  const [show, setShow] = useState(!secret);
  return (
    <div className="space-y-1.5">
      <div className="flex items-center justify-between">
        <span className="text-[9px] font-bold uppercase tracking-widest text-zinc-600">{label}</span>
        {secret && (
          <button onClick={() => setShow(!show)} className="text-zinc-600 hover:text-white transition-colors">
            {show ? <EyeOff className="w-3 h-3" /> : <Eye className="w-3 h-3" />}
          </button>
        )}
      </div>
      <div className="text-[11px] font-mono text-zinc-400 truncate bg-white/5 px-3 py-1.5 rounded-lg border border-white/5">
        {show ? value : '••••••••••••••••'}
      </div>
    </div>
  );
}

function RoutingCard({ title, desc, active, onClick }: { title: string; desc: string; active: boolean; onClick: () => void }) {
  return (
    <button 
      onClick={onClick}
      className={`text-left p-6 rounded-3xl border transition-all ${active ? 'bg-emerald-500/10 border-emerald-500/30' : 'bg-white/5 border-white/5 hover:border-white/10'}`}
    >
      <div className="flex items-center justify-between mb-3">
        <h4 className={`font-medium ${active ? 'text-emerald-500' : 'text-zinc-200'}`}>{title}</h4>
        {active && <Check className="w-4 h-4 text-emerald-500" />}
      </div>
      <p className="text-xs text-zinc-500 leading-relaxed">{desc}</p>
    </button>
  );
}

function ToggleRow({ label, desc, defaultChecked = false }: { label: string; desc: string; defaultChecked?: boolean }) {
  const [checked, setChecked] = useState(defaultChecked);
  return (
    <div className="flex items-center justify-between p-4 rounded-2xl bg-white/5 border border-white/5">
      <div>
        <div className="text-sm font-medium">{label}</div>
        <div className="text-[10px] text-zinc-500 mt-0.5">{desc}</div>
      </div>
      <button 
        onClick={() => setChecked(!checked)}
        className={`w-10 h-6 rounded-full transition-colors relative ${checked ? 'bg-emerald-500' : 'bg-zinc-700'}`}
      >
        <div className={`absolute top-1 w-4 h-4 rounded-full bg-white transition-all ${checked ? 'left-5' : 'left-1'}`} />
      </button>
    </div>
  );
}

