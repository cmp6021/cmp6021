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
  Settings,
  Layout,
  Info,
  Key,
  Wifi,
  Cpu,
  Database,
  Eye,
  EyeOff
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

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

export default function App() {
  const [nodes, setNodes] = useState<Node[]>([]);
  const [isAdding, setIsAdding] = useState(false);
  const [copied, setCopied] = useState<string | null>(null);
  const [viewMode, setViewMode] = useState<'simple' | 'pro'>('simple');
  const [newNode, setNewNode] = useState({
    name: '',
    type: 'vless',
    address: '',
    port: 443,
    method: 'aes-256-gcm',
    password: '',
    uuid: '',
    security: 'reality',
    sni: '',
    flow: 'xtls-rprx-vision',
    public_key: '',
    short_id: ''
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
    setNewNode({ 
      name: '', type: 'vless', address: '', port: 443, method: 'aes-256-gcm', 
      password: '', uuid: '', security: 'reality', sni: '', flow: 'xtls-rprx-vision',
      public_key: '', short_id: ''
    });
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
    <div className="min-h-screen bg-[#050505] text-white font-sans selection:bg-emerald-500/30">
      {/* Sidebar */}
      <div className="fixed left-0 top-0 h-full w-20 bg-[#0a0a0a] border-r border-white/5 flex flex-col items-center py-8 gap-8 z-50">
        <div className="w-12 h-12 bg-emerald-600 rounded-2xl flex items-center justify-center shadow-lg shadow-emerald-600/20">
          <Shield className="w-6 h-6" />
        </div>
        <nav className="flex flex-col gap-6">
          <NavItem icon={<Layout className="w-5 h-5" />} active />
          <NavItem icon={<Activity className="w-5 h-5" />} />
          <NavItem icon={<Globe className="w-5 h-5" />} />
          <NavItem icon={<Settings className="w-5 h-5" />} />
        </nav>
      </div>

      <main className="pl-20">
        {/* Header */}
        <header className="h-20 border-b border-white/5 flex items-center justify-between px-10 bg-[#050505]/80 backdrop-blur-xl sticky top-0 z-40">
          <div className="flex items-center gap-6">
            <div>
              <h1 className="text-xl font-semibold tracking-tight">Dashboard</h1>
              <p className="text-[10px] text-zinc-500 uppercase tracking-widest mt-0.5">Nexus Control Center</p>
            </div>
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
            <button className="flex items-center gap-2 px-4 py-2 bg-emerald-600 text-white rounded-xl text-xs font-semibold hover:bg-emerald-700 transition-all active:scale-95 shadow-lg shadow-emerald-600/20">
              <Wifi className="w-3.5 h-3.5" />
              Connected
            </button>
          </div>
        </header>

        <div className="p-10 max-w-7xl mx-auto space-y-10">
          {/* Stats Grid */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            <StatCard label="Total Nodes" value={nodes.length.toString()} icon={<Server className="w-4 h-4" />} />
            <StatCard label="Active Users" value="1,240" icon={<Activity className="w-4 h-4" />} />
            <StatCard label="Traffic (24h)" value="4.2 TB" icon={<Zap className="w-4 h-4" />} />
            <StatCard label="Uptime" value="99.9%" icon={<Shield className="w-4 h-4" />} />
          </div>

          {/* Subscription Section */}
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

          {/* Nodes Section */}
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
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
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
    </div>
  );
}

function NavItem({ icon, active = false }: { icon: React.ReactNode; active?: boolean }) {
  return (
    <button className={`p-3.5 rounded-2xl transition-all ${active ? 'bg-emerald-600 text-white shadow-lg shadow-emerald-600/20' : 'text-zinc-600 hover:text-zinc-400 hover:bg-white/5'}`}>
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

