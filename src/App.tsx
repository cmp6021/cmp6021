/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { 
  Shield, 
  Plus, 
  Trash2, 
  Copy, 
  Check, 
  Globe, 
  Lock, 
  Zap, 
  Activity,
  Server,
  ExternalLink,
  ChevronRight,
  Monitor,
  Key
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

interface Node {
  id: number;
  name: string;
  type: string;
  address: string;
  port: number;
  method: string;
  password?: string;
}

export default function App() {
  const [nodes, setNodes] = useState<Node[]>([]);
  const [isAdding, setIsAdding] = useState(false);
  const [copied, setCopied] = useState<string | null>(null);
  const [newNode, setNewNode] = useState({
    name: '',
    type: 'ss',
    address: '',
    port: 443,
    method: 'aes-256-gcm',
    password: ''
  });

  const subUrl = `${window.location.origin}/sub/default-token`;

  useEffect(() => {
    fetchNodes();
  }, []);

  const fetchNodes = async () => {
    const res = await fetch('/api/nodes');
    const data = await res.json();
    setNodes(data);
  };

  const addNode = async (e: React.FormEvent) => {
    e.preventDefault();
    await fetch('/api/nodes', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(newNode)
    });
    setIsAdding(false);
    setNewNode({ name: '', type: 'ss', address: '', port: 443, method: 'aes-256-gcm', password: '' });
    fetchNodes();
  };

  const deleteNode = async (id: number) => {
    await fetch(`/api/nodes/${id}`, { method: 'DELETE' });
    fetchNodes();
  };

  const copyToClipboard = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopied(id);
    setTimeout(() => setCopied(null), 2000);
  };

  return (
    <div className="min-h-screen bg-[#0a0a0a] text-white font-sans selection:bg-emerald-500/30">
      {/* Sidebar Navigation */}
      <div className="fixed left-0 top-0 h-full w-20 bg-[#111] border-r border-white/5 flex flex-col items-center py-8 gap-8 z-50">
        <div className="w-12 h-12 bg-emerald-600 rounded-2xl flex items-center justify-center shadow-lg shadow-emerald-600/20">
          <Shield className="w-6 h-6" />
        </div>
        <nav className="flex flex-col gap-6">
          <NavItem icon={<Activity className="w-5 h-5" />} active />
          <NavItem icon={<Globe className="w-5 h-5" />} />
          <NavItem icon={<Lock className="w-5 h-5" />} />
          <NavItem icon={<Monitor className="w-5 h-5" />} />
        </nav>
      </div>

      <main className="pl-20">
        {/* Header */}
        <header className="h-24 border-b border-white/5 flex items-center justify-between px-12 bg-[#0a0a0a]/80 backdrop-blur-xl sticky top-0 z-40">
          <div>
            <h1 className="text-2xl font-semibold tracking-tight">Nexus Sub Manager</h1>
            <p className="text-xs text-zinc-500 uppercase tracking-widest mt-1">Enterprise Subscription Infrastructure</p>
          </div>
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2 px-3 py-1.5 bg-zinc-900 rounded-full border border-white/5">
              <div className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse" />
              <span className="text-xs font-medium text-zinc-400">System Online</span>
            </div>
            <button className="p-2 hover:bg-white/5 rounded-xl transition-colors">
              <Key className="w-5 h-5 text-zinc-400" />
            </button>
          </div>
        </header>

        <div className="p-12 max-w-7xl mx-auto space-y-12">
          {/* Subscription Link Section */}
          <section className="relative overflow-hidden group">
            <div className="absolute inset-0 bg-gradient-to-r from-emerald-600/20 to-blue-600/20 blur-3xl opacity-50 group-hover:opacity-70 transition-opacity" />
            <div className="relative bg-[#111] border border-white/10 rounded-[2.5rem] p-10 flex flex-col md:flex-row items-center justify-between gap-8">
              <div className="space-y-4">
                <div className="flex items-center gap-3">
                  <Zap className="w-6 h-6 text-emerald-500" />
                  <h2 className="text-xl font-medium">Your Encrypted Subscription</h2>
                </div>
                <p className="text-zinc-400 max-w-md text-sm leading-relaxed">
                  Use this link in your Windows client (Clash, v2rayN, etc.) to automatically sync all secure nodes.
                </p>
              </div>
              <div className="flex-1 max-w-xl w-full">
                <div className="flex items-center gap-2 bg-black/40 p-2 rounded-2xl border border-white/5 backdrop-blur-sm">
                  <div className="flex-1 px-4 py-2 font-mono text-xs text-emerald-400 truncate">
                    {subUrl}
                  </div>
                  <button 
                    onClick={() => copyToClipboard(subUrl, 'sub')}
                    className="flex items-center gap-2 px-6 py-2.5 bg-white text-black rounded-xl font-semibold text-sm hover:bg-zinc-200 transition-all active:scale-95"
                  >
                    {copied === 'sub' ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                    {copied === 'sub' ? 'Copied' : 'Copy Link'}
                  </button>
                </div>
              </div>
            </div>
          </section>

          {/* Node Management */}
          <section className="space-y-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <h3 className="text-lg font-medium">Managed Nodes</h3>
                <span className="px-2 py-0.5 bg-zinc-900 text-zinc-500 rounded text-[10px] font-bold uppercase tracking-tighter">
                  {nodes.length} Total
                </span>
              </div>
              <button 
                onClick={() => setIsAdding(true)}
                className="flex items-center gap-2 px-5 py-2.5 bg-emerald-600/10 text-emerald-500 border border-emerald-500/20 rounded-xl hover:bg-emerald-600/20 transition-all font-medium text-sm"
              >
                <Plus className="w-4 h-4" />
                Provision New Node
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
              <AnimatePresence>
                {nodes.map((node) => (
                  <motion.div
                    key={node.id}
                    layout
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.9 }}
                    className="bg-[#111] border border-white/5 rounded-3xl p-6 hover:border-white/10 transition-all group"
                  >
                    <div className="flex items-start justify-between mb-6">
                      <div className="flex items-center gap-4">
                        <div className="w-12 h-12 bg-zinc-900 rounded-2xl flex items-center justify-center border border-white/5 group-hover:border-emerald-500/30 transition-colors">
                          <Server className="w-6 h-6 text-zinc-400 group-hover:text-emerald-500 transition-colors" />
                        </div>
                        <div>
                          <h4 className="font-medium text-zinc-200">{node.name}</h4>
                          <p className="text-[10px] text-zinc-500 uppercase tracking-widest">{node.type.toUpperCase()} • {node.method}</p>
                        </div>
                      </div>
                      <button 
                        onClick={() => deleteNode(node.id)}
                        className="p-2 text-zinc-600 hover:text-red-500 hover:bg-red-500/10 rounded-xl transition-all opacity-0 group-hover:opacity-100"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                    
                    <div className="space-y-3">
                      <div className="flex items-center justify-between text-xs">
                        <span className="text-zinc-500">Address</span>
                        <span className="text-zinc-300 font-mono">{node.address}:{node.port}</span>
                      </div>
                      <div className="h-px bg-white/5 w-full" />
                      <div className="flex items-center justify-between text-xs">
                        <span className="text-zinc-500">Status</span>
                        <div className="flex items-center gap-1.5">
                          <div className="w-1.5 h-1.5 bg-emerald-500 rounded-full" />
                          <span className="text-emerald-500 font-medium">Active</span>
                        </div>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </AnimatePresence>
            </div>
          </section>
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
              className="absolute inset-0 bg-black/80 backdrop-blur-sm"
            />
            <motion.div 
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="relative w-full max-w-lg bg-[#111] border border-white/10 rounded-[2rem] p-8 shadow-2xl"
            >
              <h3 className="text-xl font-semibold mb-6">Provision New Node</h3>
              <form onSubmit={addNode} className="space-y-6">
                <div className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <label className="text-[10px] font-bold uppercase tracking-widest text-zinc-500">Node Name</label>
                      <input 
                        required
                        value={newNode.name}
                        onChange={e => setNewNode({...newNode, name: e.target.value})}
                        className="w-full bg-zinc-900 border border-white/5 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-emerald-500/50 transition-colors"
                        placeholder="HK-Premium-01"
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="text-[10px] font-bold uppercase tracking-widest text-zinc-500">Type</label>
                      <select 
                        value={newNode.type}
                        onChange={e => setNewNode({...newNode, type: e.target.value})}
                        className="w-full bg-zinc-900 border border-white/5 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-emerald-500/50 transition-colors appearance-none"
                      >
                        <option value="ss">Shadowsocks</option>
                        <option value="vmess">VMess (Legacy)</option>
                      </select>
                    </div>
                  </div>

                  <div className="grid grid-cols-3 gap-4">
                    <div className="col-span-2 space-y-2">
                      <label className="text-[10px] font-bold uppercase tracking-widest text-zinc-500">Address</label>
                      <input 
                        required
                        value={newNode.address}
                        onChange={e => setNewNode({...newNode, address: e.target.value})}
                        className="w-full bg-zinc-900 border border-white/5 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-emerald-500/50 transition-colors"
                        placeholder="server.nexus.com"
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="text-[10px] font-bold uppercase tracking-widest text-zinc-500">Port</label>
                      <input 
                        required
                        type="number"
                        value={newNode.port}
                        onChange={e => setNewNode({...newNode, port: parseInt(e.target.value)})}
                        className="w-full bg-zinc-900 border border-white/5 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-emerald-500/50 transition-colors"
                        placeholder="443"
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <label className="text-[10px] font-bold uppercase tracking-widest text-zinc-500">Encryption Method</label>
                    <input 
                      required
                      value={newNode.method}
                      onChange={e => setNewNode({...newNode, method: e.target.value})}
                      className="w-full bg-zinc-900 border border-white/5 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-emerald-500/50 transition-colors"
                      placeholder="aes-256-gcm"
                    />
                  </div>

                  <div className="space-y-2">
                    <label className="text-[10px] font-bold uppercase tracking-widest text-zinc-500">Password / Key</label>
                    <input 
                      required
                      type="password"
                      value={newNode.password}
                      onChange={e => setNewNode({...newNode, password: e.target.value})}
                      className="w-full bg-zinc-900 border border-white/5 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-emerald-500/50 transition-colors"
                      placeholder="••••••••"
                    />
                  </div>
                </div>

                <div className="flex gap-4 pt-4">
                  <button 
                    type="button"
                    onClick={() => setIsAdding(false)}
                    className="flex-1 py-3 bg-zinc-900 text-zinc-400 rounded-xl font-medium hover:bg-zinc-800 transition-colors"
                  >
                    Cancel
                  </button>
                  <button 
                    type="submit"
                    className="flex-1 py-3 bg-emerald-600 text-white rounded-xl font-semibold hover:bg-emerald-700 transition-colors shadow-lg shadow-emerald-600/20"
                  >
                    Provision Node
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}

function NavItem({ icon, active = false }: { icon: React.ReactNode; active?: boolean }) {
  return (
    <button className={`p-3 rounded-xl transition-all ${active ? 'bg-emerald-600/10 text-emerald-500 shadow-sm' : 'text-zinc-600 hover:text-zinc-400 hover:bg-white/5'}`}>
      {icon}
    </button>
  );
}

