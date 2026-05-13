import React, { useState, useEffect, useRef, useMemo } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useNotes } from '../context/NoteContext';
import { TransformWrapper, TransformComponent } from 'react-zoom-pan-pinch';
import { 
  Settings2, 
  Search, 
  Filter, 
  Plus, 
  CheckCircle2, 
  Circle, 
  Clock, 
  Target,
  Maximize2,
  ChevronRight,
  ChevronDown,
  X,
  Layers
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '../utils/cn';

// --- Utilities ---

const seededRandom = (seed) => {
  const x = Math.sin(seed++) * 10000;
  return x - Math.floor(x);
};

const extractTitle = (htmlContent) => {
  if (!htmlContent) return 'Untitled Idea';
  const temp = document.createElement('div');
  temp.innerHTML = htmlContent;
  const text = temp.textContent || temp.innerText || '';
  return text.length > 40 ? text.slice(0, 40) + '...' : text || 'Untitled Idea';
};

const stripHtml = (html) => {
  const tmp = document.createElement("DIV");
  tmp.innerHTML = html;
  return tmp.textContent || tmp.innerText || "";
};

// --- Main Component ---

export default function DreamMode() {
  const { chatId } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { notes, chats, updateNoteStatus, addNote, deleteNote } = useNotes();
  
  const [nodes, setNodes] = useState([]);
  const [links, setLinks] = useState([]);
  const [selectedNodeId, setSelectedNodeId] = useState(null);
  const [hoveredNodeId, setHoveredNodeId] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [showSearch, setShowSearch] = useState(false);
  const [statusFilter, setStatusFilter] = useState('all'); // all, active, pending, completed
  const [isInitializing, setIsInitializing] = useState(true);
  
  const transformComponentRef = useRef(null);
  const animationRef = useRef(null);
  const linksRef = useRef([]);
  const dragNodeRef = useRef(null);
  const isDraggingCanvasRef = useRef(false);

  const currentChat = useMemo(() => chats.find(c => c._id === chatId), [chats, chatId]);
  const selectedNode = useMemo(() => nodes.find(n => n._id === selectedNodeId), [nodes, selectedNodeId]);

  // --- Graph Initialization ---

  useEffect(() => {
    if (notes.length === 0 && !isInitializing) return;

    // 1. Create the Root Node (The Gem itself)
    const rootId = `root-${chatId}`;
    const centerX = 2000;
    const centerY = 2000;

    const rootNode = {
      _id: rootId,
      title: currentChat?.name || 'Main Gem',
      isRoot: true,
      x: centerX,
      y: centerY,
      vx: 0,
      vy: 0,
      fx: centerX, // Pin root
      fy: centerY,
      color: '#fbbf24', // Amber
      status: 'active'
    };

    // 2. Process notes into nodes
    const processedNodes = [rootNode, ...notes.map((note, i) => {
      // If we already have a position for this node from previous state, keep it
      const existing = nodes.find(n => n._id === note._id);
      
      // Initial positioning: children of root orbit root, children of notes orbit parents
      let startX = centerX;
      let startY = centerY;
      
      if (note.parentId) {
        const parent = nodes.find(n => n._id === note.parentId);
        if (parent) {
          startX = parent.x;
          startY = parent.y;
        }
      }

      const angle = (i / notes.length) * 2 * Math.PI;
      const radius = note.parentId ? 100 : 250;

      return {
        ...note,
        isRoot: false,
        title: extractTitle(note.content),
        x: existing?.x || startX + Math.cos(angle) * radius * (0.8 + seededRandom(i) * 0.4),
        y: existing?.y || startY + Math.sin(angle) * radius * (0.8 + seededRandom(i) * 0.4),
        vx: existing?.vx || 0,
        vy: existing?.vy || 0,
        color: note.status === 'completed' ? '#22c55e' : (note.status === 'pending' ? '#94a3b8' : `hsl(${(seededRandom(i) * 60 + 200).toFixed(0)}, 70%, 60%)`)
      };
    })];

    // 3. Generate links based on hierarchy
    const newLinks = [];
    notes.forEach(note => {
      if (note.parentId) {
        newLinks.push({ source: note.parentId, target: note._id, type: 'hierarchy' });
      } else {
        newLinks.push({ source: rootId, target: note._id, type: 'root' });
      }
    });

    linksRef.current = newLinks;
    setNodes(processedNodes);
    setLinks(newLinks);
    setIsInitializing(false);
  }, [notes, chatId, currentChat]);

  // --- Physics Engine ---

  useEffect(() => {
    if (nodes.length === 0) return;

    const simulation = () => {
      setNodes(prevNodes => {
        const newNodes = prevNodes.map(n => ({ ...n }));
        const alpha = 0.05;

        // 1. Repulsion (prevent overlapping)
        for (let i = 0; i < newNodes.length; i++) {
          for (let j = i + 1; j < newNodes.length; j++) {
            const nodeA = newNodes[i];
            const nodeB = newNodes[j];
            
            const dx = nodeB.x - nodeA.x;
            const dy = nodeB.y - nodeA.y;
            const distance = Math.sqrt(dx * dx + dy * dy) || 1;
            
            const minDistance = (nodeA.isRoot || nodeB.isRoot) ? 200 : 120;
            
            if (distance < minDistance) {
              const force = (minDistance - distance) / distance * alpha * 5;
              if (!nodeA.fx) { nodeA.vx -= dx * force; nodeA.vy -= dy * force; }
              if (!nodeB.fx) { nodeB.vx += dx * force; nodeB.vy += dy * force; }
            }
          }
        }

        // 2. Attraction (Hierarchy & Workflow)
        linksRef.current.forEach(link => {
          const source = newNodes.find(n => n._id === link.source);
          const target = newNodes.find(n => n._id === link.target);
          if (source && target) {
            const dx = target.x - source.x;
            const dy = target.y - source.y;
            const distance = Math.sqrt(dx * dx + dy * dy) || 1;
            
            const targetDist = link.type === 'root' ? 250 : 150;
            const strength = 0.03;
            
            const force = (distance - targetDist) * alpha * strength;
            
            if (!source.fx) { source.vx += dx * force; source.vy += dy * force; }
            if (!target.fx) { target.vx -= dx * force; target.vy -= dy * force; }
          }
        });

        // 3. Center Gravity (soft pull to center)
        newNodes.forEach(node => {
          if (!node.fx) {
            node.vx += (2000 - node.x) * alpha * 0.005;
            node.vy += (2000 - node.y) * alpha * 0.005;
          }
        });

        // 4. Position Update & Friction
        return newNodes.map(node => {
          // If node has fixed position (dragged or root), don't apply velocity
          if (node.fx !== undefined && node.fy !== undefined) {
            return { ...node, x: node.fx, y: node.fy, vx: 0, vy: 0 };
          }
          
          const friction = 0.8;
          const maxSpeed = 15;
          
          let vx = (node.vx || 0) * friction;
          let vy = (node.vy || 0) * friction;
          
          // Clamp speed
          const speed = Math.sqrt(vx * vx + vy * vy);
          if (speed > maxSpeed) {
            vx = (vx / speed) * maxSpeed;
            vy = (vy / speed) * maxSpeed;
          }

          let nx = node.x + vx;
          let ny = node.y + vy;
          
          if (!isFinite(nx)) nx = 2000 + (Math.random() - 0.5) * 100;
          if (!isFinite(ny)) ny = 2000 + (Math.random() - 0.5) * 100;

          return { ...node, x: nx, y: ny, vx, vy };
        });
      });

      animationRef.current = requestAnimationFrame(simulation);
    };

    animationRef.current = requestAnimationFrame(simulation);
    return () => cancelAnimationFrame(animationRef.current);
  }, [nodes.length]);

  // --- Interactions ---

  const handleNodeClick = (node, e) => {
    e.stopPropagation();
    if (!isDraggingCanvasRef.current) {
      setSelectedNodeId(node._id);
    }
  };

  const handleNodeDragStart = (node, e) => {
    e.stopPropagation();
    dragNodeRef.current = node._id;
    setNodes(prev => prev.map(n => n._id === node._id ? { ...n, fx: n.x, fy: n.y } : n));
  };

  const handleCanvasMouseMove = (e) => {
    if (dragNodeRef.current && transformComponentRef.current) {
      const { state } = transformComponentRef.current;
      const { scale, positionX, positionY } = state;
      
      // Calculate mouse position relative to the 4000x4000 canvas
      const canvasX = (e.clientX - positionX) / scale;
      const canvasY = (e.clientY - positionY) / scale;
      
      setNodes(prev => prev.map(n => 
        n._id === dragNodeRef.current ? { ...n, x: canvasX, y: canvasY, fx: canvasX, fy: canvasY } : n
      ));
    }
  };

  const handleCanvasMouseUp = () => {
    if (dragNodeRef.current) {
      const id = dragNodeRef.current;
      dragNodeRef.current = null;
      // Release node unless it's the root
      setNodes(prev => prev.map(n => (n._id === id && !n.isRoot) ? { ...n, fx: undefined, fy: undefined } : n));
    }
  };

  const zoomToNode = (node) => {
    if (!node || !transformComponentRef.current) return;
    const { zoomToElement } = transformComponentRef.current;
    // The library handles center finding
    const nodeEl = document.getElementById(`node-${node._id}`);
    if (nodeEl) {
      zoomToElement(nodeEl, 2, 800);
    }
  };

  const handleAddChild = async (parentId) => {
    const content = "New linked idea...";
    const newNode = await addNote(content, chatId, parentId);
    if (newNode) {
      setSelectedNodeId(newNode._id);
      setTimeout(() => zoomToNode(newNode), 100);
    }
  };

  // --- Filtering & Search ---

  const filteredNodes = useMemo(() => {
    return nodes.filter(n => {
      if (n.isRoot) return true;
      
      const matchesSearch = searchQuery === '' || 
        n.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        stripHtml(n.content).toLowerCase().includes(searchQuery.toLowerCase());
      
      const matchesStatus = statusFilter === 'all' || n.status === statusFilter;
      
      return matchesSearch && matchesStatus;
    });
  }, [nodes, searchQuery, statusFilter]);

  // --- Render Helpers ---

  const getLines = () => {
    return links.map((link, i) => {
      const source = nodes.find(n => n._id === link.source);
      const target = nodes.find(n => n._id === link.target);
      if (!source || !target) return null;

      // Check if either node is filtered out
      const sourceVisible = filteredNodes.some(n => n._id === source._id);
      const targetVisible = filteredNodes.some(n => n._id === target._id);
      if (!sourceVisible || !targetVisible) return null;

      const isHighlighted = (hoveredNodeId === source._id || hoveredNodeId === target._id || selectedNodeId === source._id || selectedNodeId === target._id);
      const isFaded = (hoveredNodeId || selectedNodeId) && !isHighlighted;

      return (
        <line
          key={`${link.source}-${link.target}`}
          x1={source.x}
          y1={source.y}
          x2={target.x}
          y2={target.y}
          stroke={isHighlighted ? '#818cf8' : '#475569'}
          strokeWidth={isHighlighted ? 2 : 1}
          strokeDasharray={source.status === 'pending' || target.status === 'pending' ? "4 4" : "0"}
          style={{ 
            opacity: isFaded ? 0.05 : (isHighlighted ? 0.8 : 0.2),
            transition: 'stroke 0.3s, opacity 0.3s'
          }}
        />
      );
    });
  };

  return (
    <div className="w-screen h-screen bg-[#020617] overflow-hidden fixed inset-0 font-sans select-none text-slate-200">
      
      {/* Background Ambience */}
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,rgba(30,41,59,0.2),transparent)] pointer-events-none" />
      
      {/* --- UI OVERLAYS --- */}

      {/* Top Left: Navigation & Stats */}
      <div className="absolute top-6 left-6 z-40 flex items-center space-x-4">
        <button 
          onClick={() => navigate(-1)} 
          className="p-2.5 bg-slate-900/80 hover:bg-slate-800 border border-slate-800 rounded-xl transition-all group shadow-xl backdrop-blur-md"
        >
          <X size={20} className="text-slate-400 group-hover:text-white" />
        </button>
        <div className="flex flex-col">
          <h1 className="text-sm font-semibold text-white tracking-tight uppercase opacity-50 text-[10px]">Graph Intelligence</h1>
          <h2 className="text-lg font-medium text-amber-400 flex items-center space-x-2">
            <span>{currentChat?.name || 'Loading Gem...'}</span>
            <span className="text-xs bg-amber-400/10 px-2 py-0.5 rounded text-amber-500 border border-amber-400/20">ROOT</span>
          </h2>
        </div>
      </div>

      {/* Right Toolbar: View Controls */}
      <div className="absolute top-6 right-6 z-40 flex flex-col space-y-3">
        <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-1.5 shadow-2xl backdrop-blur-md flex flex-col space-y-1">
          <button 
            onClick={() => setShowSearch(!showSearch)}
            className={cn("p-3 rounded-xl transition-all", showSearch ? "bg-indigo-500 text-white" : "text-slate-400 hover:bg-slate-800")}
          >
            <Search size={20} />
          </button>
          <button className="p-3 text-slate-400 hover:bg-slate-800 rounded-xl transition-all">
            <Filter size={20} />
          </button>
          <button className="p-3 text-slate-400 hover:bg-slate-800 rounded-xl transition-all">
            <Settings2 size={20} />
          </button>
          <div className="h-px bg-slate-800 mx-2 my-1" />
          <button 
            onClick={() => {
              const root = nodes.find(n => n.isRoot);
              zoomToNode(root);
            }}
            className="p-3 text-slate-400 hover:bg-slate-800 rounded-xl transition-all"
          >
            <Maximize2 size={20} />
          </button>
        </div>
      </div>

      {/* Bottom Center: Status Filter Bar */}
      <div className="absolute bottom-8 left-1/2 -translate-x-1/2 z-40 bg-slate-900/90 border border-slate-800 px-2 py-2 rounded-full shadow-2xl backdrop-blur-md flex items-center space-x-1">
        {[
          { id: 'all', label: 'All Ideas', icon: Layers },
          { id: 'active', label: 'Active', icon: Target, color: 'text-indigo-400' },
          { id: 'pending', label: 'Pending', icon: Clock, color: 'text-slate-400' },
          { id: 'completed', label: 'Done', icon: CheckCircle2, color: 'text-green-400' },
        ].map(f => (
          <button
            key={f.id}
            onClick={() => setStatusFilter(f.id)}
            className={cn(
              "flex items-center space-x-2 px-5 py-2.5 rounded-full text-xs font-medium transition-all duration-300",
              statusFilter === f.id ? "bg-slate-800 text-white shadow-inner" : "text-slate-500 hover:text-slate-300 hover:bg-slate-800/50"
            )}
          >
            <f.icon size={14} className={f.color} />
            <span>{f.label}</span>
          </button>
        ))}
      </div>

      {/* Search Overlay Panel */}
      <AnimatePresence>
        {showSearch && (
          <motion.div 
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            className="absolute top-24 left-6 z-40 w-80 bg-slate-900/95 border border-slate-800 rounded-3xl shadow-2xl backdrop-blur-xl overflow-hidden flex flex-col max-h-[60vh]"
          >
            <div className="p-4 border-b border-slate-800 flex items-center space-x-3">
              <Search size={18} className="text-slate-500" />
              <input 
                autoFocus
                placeholder="Search ideas, nodes, tags..."
                className="bg-transparent border-none outline-none text-sm w-full text-white placeholder:text-slate-600"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
            <div className="flex-1 overflow-y-auto p-2 custom-scrollbar">
              {nodes.filter(n => !n.isRoot && (n.title.toLowerCase().includes(searchQuery.toLowerCase()) || stripHtml(n.content).toLowerCase().includes(searchQuery.toLowerCase()))).map(n => (
                <button 
                  key={n._id}
                  onClick={() => {
                    setSelectedNodeId(n._id);
                    zoomToNode(n);
                  }}
                  className="w-full text-left p-3 rounded-2xl hover:bg-slate-800/50 flex flex-col space-y-1 transition-colors group"
                >
                  <span className="text-sm font-medium group-hover:text-indigo-400 transition-colors">{n.title}</span>
                  <span className="text-[10px] text-slate-500 uppercase tracking-wider">{n.status}</span>
                </button>
              ))}
              {searchQuery && nodes.filter(n => !n.isRoot && n.title.toLowerCase().includes(searchQuery.toLowerCase())).length === 0 && (
                <div className="p-8 text-center text-slate-600 text-sm italic">No matching gems found</div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* --- GRAPH CANVAS --- */}

      <TransformWrapper
        ref={transformComponentRef}
        initialScale={0.8}
        initialPositionX={window.innerWidth / 2 - 2000 * 0.8}
        initialPositionY={window.innerHeight / 2 - 2000 * 0.8}
        minScale={0.05}
        maxScale={5}
        limitToBounds={false}
        wheel={{ step: 0.05 }}
        panning={{ velocityDisabled: false }}
        onPanningStart={() => { isDraggingCanvasRef.current = true; }}
        onPanningStop={() => { setTimeout(() => { isDraggingCanvasRef.current = false; }, 100); }}
      >
        <TransformComponent wrapperStyle={{ width: '100%', height: '100%' }}>
          <div 
            className="w-[4000px] h-[4000px] relative" 
            onClick={() => setSelectedNodeId(null)}
            onMouseMove={handleCanvasMouseMove}
            onMouseUp={handleCanvasMouseUp}
          >
            
            {/* Edges Layer */}
            <svg className="absolute inset-0 w-full h-full pointer-events-none overflow-visible">
              <defs>
                <filter id="glow" x="-50%" y="-50%" width="200%" height="200%">
                  <feGaussianBlur stdDeviation="3" result="blur" />
                  <feComposite in="SourceGraphic" in2="blur" operator="over" />
                </filter>
              </defs>
              {getLines()}
            </svg>

            {/* Nodes Layer */}
            {nodes.map(node => {
              const isVisible = filteredNodes.some(fn => fn._id === node._id);
              const isHovered = hoveredNodeId === node._id;
              const isSelected = selectedNodeId === node._id;
              const isMatch = searchQuery && (node.title.toLowerCase().includes(searchQuery.toLowerCase()) || stripHtml(node.content).toLowerCase().includes(searchQuery.toLowerCase()));

              // Determine fading based on selections
              let isFaded = (hoveredNodeId || selectedNodeId) && !isHovered && !isSelected;
              if (hoveredNodeId && !isHovered) {
                const isConnected = links.some(l => 
                  (l.source === hoveredNodeId && l.target === node._id) || 
                  (l.target === hoveredNodeId && l.source === node._id)
                );
                if (!isConnected) isFaded = true;
                else isFaded = false;
              }

              if (!isVisible) return null;

              return (
                <div
                  id={`node-${node._id}`}
                  key={node._id}
                  className={cn(
                    "absolute flex flex-col items-center justify-center transform -translate-x-1/2 -translate-y-1/2 cursor-pointer",
                    isFaded ? "opacity-10 scale-90" : "opacity-100"
                  )}
                  style={{ 
                    left: node.x, 
                    top: node.y,
                    transition: isDraggingCanvasRef.current || dragNodeRef.current ? 'none' : 'opacity 0.5s, transform 0.5s'
                  }}
                  onMouseEnter={() => setHoveredNodeId(node._id)}
                  onMouseLeave={() => setHoveredNodeId(null)}
                  onClick={(e) => handleNodeClick(node, e)}
                  onMouseDown={(e) => handleNodeDragStart(node, e)}
                >
                  {/* Node Visual */}
                  <div className="relative flex items-center justify-center">
                    {/* Glow Effect */}
                    {(isSelected || isHovered || node.isRoot || node.status === 'active') && (
                      <div 
                        className={cn(
                          "absolute inset-0 rounded-full blur-xl animate-pulse-slow opacity-40",
                          node.isRoot ? "bg-amber-400 blur-2xl" : "bg-indigo-500"
                        )}
                        style={{ 
                          backgroundColor: node.isRoot ? '#fbbf24' : node.color,
                          width: node.isRoot ? '60px' : '30px',
                          height: node.isRoot ? '60px' : '30px',
                          left: '50%',
                          top: '50%',
                          transform: 'translate(-50%, -50%)'
                        }}
                      />
                    )}

                    {/* The Dot */}
                    <div 
                      className={cn(
                        "rounded-full transition-all duration-300 relative z-10",
                        node.isRoot ? "w-10 h-10 border-4 border-amber-500/50 shadow-2xl" : "w-5 h-5 border-2 border-[#020617]",
                        isSelected ? "scale-150 ring-4 ring-white/20" : "",
                        isMatch ? "ring-4 ring-white animate-bounce-slow" : "",
                        node.status === 'completed' ? "ring-2 ring-green-500/50" : "",
                        node.status === 'pending' ? "opacity-60 border-dashed" : ""
                      )}
                      style={{ 
                        backgroundColor: node.isRoot ? '#fbbf24' : node.color,
                        boxShadow: isSelected ? `0 0 20px ${node.color}` : 'none'
                      }}
                    >
                      {node.status === 'completed' && <CheckCircle2 size={10} className="absolute inset-0 m-auto text-[#020617]" />}
                    </div>
                  </div>
                  
                  {/* The label */}
                  {(isSelected || isHovered || node.isRoot || isMatch) && (
                    <div 
                      className={cn(
                        "mt-3 whitespace-nowrap px-3 py-1.5 rounded-xl border pointer-events-none backdrop-blur-md",
                        node.isRoot ? "bg-amber-500/10 border-amber-500/30 text-amber-400 font-bold text-sm" : "bg-slate-900/80 border-slate-700 text-slate-200 text-xs"
                      )}
                      style={{ animation: 'fadeInUp 0.2s ease-out' }}
                    >
                      {node.title}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </TransformComponent>
      </TransformWrapper>

      {/* --- SIDE PANEL (Node Detail) --- */}

      <AnimatePresence>
        {selectedNode && (
          <motion.div 
            initial={{ opacity: 0, x: 400 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 400 }}
            className="absolute top-0 right-0 bottom-0 w-[450px] bg-slate-900/90 border-l border-slate-800 shadow-[-20px_0_50px_rgba(0,0,0,0.5)] z-50 flex flex-col backdrop-blur-2xl"
          >
            {/* Panel Header */}
            <div className="p-6 border-b border-slate-800 flex items-center justify-between bg-slate-950/30">
              <div className="flex items-center space-x-3">
                <div 
                  className="w-3 h-3 rounded-full" 
                  style={{ backgroundColor: selectedNode.isRoot ? '#fbbf24' : selectedNode.color }}
                />
                <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-slate-500">
                  {selectedNode.isRoot ? 'Central Idea' : `Gem Node • ${selectedNode.status}`}
                </span>
              </div>
              <button 
                onClick={() => setSelectedNodeId(null)}
                className="p-2 hover:bg-slate-800 rounded-full transition-colors text-slate-500 hover:text-white"
              >
                <X size={20} />
              </button>
            </div>

            {/* Panel Content */}
            <div className="flex-1 overflow-y-auto p-8 custom-scrollbar">
              <motion.h1 
                layoutId={`title-${selectedNode._id}`}
                className="text-3xl font-bold text-white mb-8 leading-tight"
              >
                {selectedNode.title}
              </motion.h1>
              
              {!selectedNode.isRoot && (
                <div className="flex flex-wrap gap-2 mb-10">
                  {[
                    { id: 'active', label: 'In Progress', icon: Target, color: 'bg-indigo-500/10 text-indigo-400 border-indigo-500/20' },
                    { id: 'pending', label: 'Pending', icon: Clock, color: 'bg-slate-500/10 text-slate-400 border-slate-500/20' },
                    { id: 'completed', label: 'Completed', icon: CheckCircle2, color: 'bg-green-500/10 text-green-400 border-green-500/20' },
                  ].map(s => (
                    <button
                      key={s.id}
                      onClick={() => updateNoteStatus(selectedNode._id, s.id)}
                      className={cn(
                        "flex items-center space-x-2 px-4 py-2 rounded-xl text-xs border transition-all",
                        selectedNode.status === s.id ? s.color : "bg-transparent border-slate-800 text-slate-600 hover:border-slate-700"
                      )}
                    >
                      <s.icon size={14} />
                      <span>{s.label}</span>
                    </button>
                  ))}
                </div>
              )}

              <div 
                className="prose prose-invert prose-slate max-w-none prose-p:leading-relaxed prose-p:text-slate-300 text-lg"
                dangerouslySetInnerHTML={{ __html: selectedNode.content || (selectedNode.isRoot ? 'This is the core of your project. Every note you add to this gem will branch out from here.' : '') }}
              />

              {/* Child Nodes List */}
              <div className="mt-16">
                <div className="flex items-center justify-between mb-6">
                  <h3 className="text-sm font-bold text-slate-500 uppercase tracking-widest flex items-center space-x-2">
                    <Layers size={14} />
                    <span>Expansion Nodes</span>
                  </h3>
                  <button 
                    onClick={() => handleAddChild(selectedNode.isRoot ? null : selectedNode._id)}
                    className="flex items-center space-x-2 px-3 py-1.5 bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg text-xs font-bold transition-all shadow-lg shadow-indigo-600/20"
                  >
                    <Plus size={14} />
                    <span>Expand Idea</span>
                  </button>
                </div>
                
                <div className="space-y-3">
                  {nodes.filter(n => n.parentId === (selectedNode.isRoot ? null : selectedNode._id)).map(child => (
                    <button
                      key={child._id}
                      onClick={() => {
                        setSelectedNodeId(child._id);
                        zoomToNode(child);
                      }}
                      className="w-full text-left p-4 bg-slate-950/40 border border-slate-800/50 rounded-2xl hover:border-slate-700 transition-all flex items-center justify-between group"
                    >
                      <div className="flex items-center space-x-3">
                        <div className="w-2 h-2 rounded-full" style={{ backgroundColor: child.color }} />
                        <span className="text-sm font-medium text-slate-300 group-hover:text-white transition-colors">{child.title}</span>
                      </div>
                      <ChevronRight size={16} className="text-slate-600 group-hover:text-slate-400 group-hover:translate-x-1 transition-all" />
                    </button>
                  ))}
                  {nodes.filter(n => n.parentId === (selectedNode.isRoot ? null : selectedNode._id)).length === 0 && (
                    <div className="p-8 text-center bg-slate-950/20 rounded-3xl border border-dashed border-slate-800">
                      <p className="text-slate-600 text-sm">No child nodes yet. Click "Expand Idea" to branch out.</p>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Footer Actions */}
            <div className="p-6 border-t border-slate-800 bg-slate-950/30 flex items-center space-x-4">
              {!selectedNode.isRoot && (
                <button 
                  onClick={() => {
                    if (window.confirm("Delete this idea and all its branches?")) {
                      deleteNote(selectedNode._id);
                      setSelectedNodeId(null);
                    }
                  }}
                  className="flex-1 px-4 py-3 bg-red-500/10 hover:bg-red-500/20 text-red-500 border border-red-500/20 rounded-xl text-sm font-bold transition-all"
                >
                  Delete Idea
                </button>
              )}
              <button 
                className="flex-1 px-4 py-3 bg-slate-800 hover:bg-slate-700 text-white rounded-xl text-sm font-bold transition-all"
                onClick={() => setSelectedNodeId(null)}
              >
                Close View
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
