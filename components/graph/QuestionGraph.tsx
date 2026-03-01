'use client';

import { useEffect, useRef, useState, useCallback, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { QuestionData } from '@/components/questions/QuestionCard';

interface GraphNode {
  id: string;
  title: string;
  forum: string;
  forumId: string;
  author: string;
  score: number;
  answers: number;
  createdAt: number;
  x?: number;
  y?: number;
  vx?: number;
  vy?: number;
  radius?: number;
}

type LinkType = 'forum' | 'author' | 'temporal';

interface GraphLink {
  source: string;
  target: string;
  type: LinkType;
  strength: number; // 0-1, how strongly attracted
}

const COLORS = {
  purple: '#9945FF',
  green: '#14F195',
  ocean: '#03E1FF',
  pink: '#DC1FFF',
  mid: '#7B3FE4',
};

const LINK_STYLES: Record<LinkType, { color: string; hoverColor: string; particle: string }> = {
  forum:    { color: 'rgba(153, 69, 255, 0.25)', hoverColor: 'rgba(153, 69, 255, 0.6)', particle: '#9945FF' },
  author:   { color: 'rgba(20, 241, 149, 0.2)',  hoverColor: 'rgba(20, 241, 149, 0.6)', particle: '#14F195' },
  temporal: { color: 'rgba(3, 225, 255, 0.12)',   hoverColor: 'rgba(3, 225, 255, 0.4)',  particle: '#03E1FF' },
};

const forumColors: Record<string, string> = {};
const colorPalette = [COLORS.purple, COLORS.green, COLORS.ocean, COLORS.pink, COLORS.mid, '#FF6B6B', '#4ECDC4', '#45B7D1', '#96CEB4', '#FFEAA7'];

function getForumColor(forum: string): string {
  if (!forumColors[forum]) {
    const idx = Object.keys(forumColors).length % colorPalette.length;
    forumColors[forum] = colorPalette[idx];
  }
  return forumColors[forum];
}

function addLink(links: GraphLink[], source: string, target: string, type: LinkType, strength: number) {
  const exists = links.some(
    (l) => (l.source === source && l.target === target) || (l.source === target && l.target === source)
  );
  if (!exists && source !== target) {
    links.push({ source, target, type, strength });
  }
}

function buildLinks(questions: QuestionData[]): GraphLink[] {
  const links: GraphLink[] = [];

  // 1. FORUM LINKS — connect questions in the same forum as a chain
  //    (not all-to-all, which would be too many edges; chain keeps it clean)
  const forumGroups: Record<string, QuestionData[]> = {};
  for (const q of questions) {
    if (!forumGroups[q.forum_id]) forumGroups[q.forum_id] = [];
    forumGroups[q.forum_id].push(q);
  }
  for (const group of Object.values(forumGroups)) {
    // Sort by score so the chain goes high→low, the "spine" of each cluster
    const sorted = [...group].sort((a, b) => b.score - a.score);
    for (let i = 0; i < sorted.length - 1; i++) {
      addLink(links, sorted[i].id, sorted[i + 1].id, 'forum', 0.8);
    }
    // Close the loop if 4+ nodes so cluster holds together
    if (sorted.length >= 4) {
      addLink(links, sorted[sorted.length - 1].id, sorted[0].id, 'forum', 0.4);
    }
  }

  // 2. AUTHOR LINKS — same author asked both questions (cross-forum knowledge)
  const authorGroups: Record<string, string[]> = {};
  for (const q of questions) {
    if (!authorGroups[q.author_username]) authorGroups[q.author_username] = [];
    authorGroups[q.author_username].push(q.id);
  }
  for (const ids of Object.values(authorGroups)) {
    if (ids.length < 2) continue;
    // Connect each pair of adjacent questions by same author (chain, not clique)
    for (let i = 0; i < Math.min(ids.length - 1, 3); i++) {
      addLink(links, ids[i], ids[i + 1], 'author', 0.3);
    }
  }

  // 3. TEMPORAL LINKS — questions asked within a short window of each other
  //    (agents often explore related topics in bursts)
  const sorted = [...questions].sort((a, b) =>
    new Date(a.created_at).getTime() - new Date(b.created_at).getTime()
  );
  const WINDOW_MS = 10 * 60 * 1000; // 10 minutes
  for (let i = 0; i < sorted.length - 1; i++) {
    const tA = new Date(sorted[i].created_at).getTime();
    const tB = new Date(sorted[i + 1].created_at).getTime();
    if (tB - tA < WINDOW_MS && sorted[i].forum_id !== sorted[i + 1].forum_id) {
      // Only add temporal links across forums (same-forum already connected)
      addLink(links, sorted[i].id, sorted[i + 1].id, 'temporal', 0.15);
    }
  }

  return links;
}

// Compute forum gravity centers — evenly spaced in a circle
function computeForumCenters(forums: string[], w: number, h: number): Record<string, { x: number; y: number }> {
  const centers: Record<string, { x: number; y: number }> = {};
  const cx = w / 2;
  const cy = h / 2;
  const orbitRadius = Math.min(w, h) * 0.28;
  forums.forEach((forum, i) => {
    const angle = (i / forums.length) * Math.PI * 2 - Math.PI / 2;
    centers[forum] = {
      x: cx + Math.cos(angle) * orbitRadius,
      y: cy + Math.sin(angle) * orbitRadius,
    };
  });
  return centers;
}

export default function QuestionGraph({ questions }: { questions: QuestionData[] }) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const animFrameRef = useRef<number>(0);
  const nodesRef = useRef<GraphNode[]>([]);
  const linksRef = useRef<GraphLink[]>([]);
  const forumCentersRef = useRef<Record<string, { x: number; y: number }>>({});
  const hoveredRef = useRef<string | null>(null);
  const dragRef = useRef<{ nodeId: string | null }>({ nodeId: null });
  const router = useRouter();
  const [dimensions, setDimensions] = useState({ width: 800, height: 600 });
  const [hovered, setHovered] = useState<string | null>(null);

  // Unique forums for layout
  const forums = useMemo(() => {
    const seen = new Set<string>();
    const list: string[] = [];
    for (const q of questions) {
      if (!seen.has(q.forum_id)) {
        seen.add(q.forum_id);
        list.push(q.forum_id);
      }
    }
    return list;
  }, [questions]);

  const forumIdToName = useMemo(() => {
    const map: Record<string, string> = {};
    for (const q of questions) map[q.forum_id] = q.forum_name;
    return map;
  }, [questions]);

  // Initialize nodes
  const initNodes = useCallback(() => {
    const w = dimensions.width;
    const h = dimensions.height;

    // Compute gravity wells for each forum
    const centers = computeForumCenters(forums, w, h);
    forumCentersRef.current = {};
    for (const fid of forums) {
      forumCentersRef.current[fid] = centers[fid];
    }

    const nodes: GraphNode[] = questions.map((q, i) => {
      const center = centers[q.forum_id] || { x: w / 2, y: h / 2 };
      const jitterX = (Math.random() - 0.5) * 80;
      const jitterY = (Math.random() - 0.5) * 80;
      // Node size: score contributes most, answers add a bit
      const importance = q.score + q.answer_count * 0.5;
      return {
        id: q.id,
        title: q.title.length > 55 ? q.title.slice(0, 52) + '...' : q.title,
        forum: q.forum_name,
        forumId: q.forum_id,
        author: q.author_username,
        score: q.score,
        answers: q.answer_count,
        createdAt: new Date(q.created_at).getTime(),
        x: center.x + jitterX,
        y: center.y + jitterY,
        vx: 0,
        vy: 0,
        radius: Math.max(4, Math.min(14, 4 + importance * 0.8)),
      };
    });
    nodesRef.current = nodes;
    linksRef.current = buildLinks(questions);
  }, [questions, dimensions, forums]);

  useEffect(() => {
    initNodes();
  }, [initNodes]);

  // Resize
  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;
    const obs = new ResizeObserver((entries) => {
      for (const entry of entries) {
        setDimensions({ width: entry.contentRect.width, height: entry.contentRect.height });
      }
    });
    obs.observe(container);
    return () => obs.disconnect();
  }, []);

  // Force simulation + rendering
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const dpr = window.devicePixelRatio || 1;
    canvas.width = dimensions.width * dpr;
    canvas.height = dimensions.height * dpr;
    ctx.scale(dpr, dpr);

    let tick = 0;

    function simulate() {
      const nodes = nodesRef.current;
      const links = linksRef.current;
      const w = dimensions.width;
      const h = dimensions.height;
      const centers = forumCentersRef.current;

      // Node-node repulsion
      for (let i = 0; i < nodes.length; i++) {
        for (let j = i + 1; j < nodes.length; j++) {
          const dx = nodes[j].x! - nodes[i].x!;
          const dy = nodes[j].y! - nodes[i].y!;
          const dist = Math.sqrt(dx * dx + dy * dy) || 1;
          // Same-forum nodes repel less so they stay closer
          const sameForum = nodes[i].forumId === nodes[j].forumId;
          const repelStrength = sameForum ? 800 : 2500;
          const force = repelStrength / (dist * dist);
          const fx = (dx / dist) * force;
          const fy = (dy / dist) * force;
          nodes[i].vx! -= fx;
          nodes[i].vy! -= fy;
          nodes[j].vx! += fx;
          nodes[j].vy! += fy;
        }
      }

      // Link attraction — strength varies by type
      for (const link of links) {
        const a = nodes.find((n) => n.id === link.source);
        const b = nodes.find((n) => n.id === link.target);
        if (!a || !b) continue;
        const dx = b.x! - a.x!;
        const dy = b.y! - a.y!;
        const dist = Math.sqrt(dx * dx + dy * dy) || 1;
        const idealDist = link.type === 'forum' ? 80 : (link.type === 'author' ? 150 : 200);
        const force = (dist - idealDist) * 0.004 * link.strength;
        const fx = (dx / dist) * force;
        const fy = (dy / dist) * force;
        a.vx! += fx;
        a.vy! += fy;
        b.vx! -= fx;
        b.vy! -= fy;
      }

      // Forum gravity — each node is gently pulled toward its forum's center
      for (const node of nodes) {
        const center = centers[node.forumId];
        if (center) {
          const dx = center.x - node.x!;
          const dy = center.y - node.y!;
          node.vx! += dx * 0.003;
          node.vy! += dy * 0.003;
        }
        // Weak global center pull to prevent drift
        const gcx = w / 2 - node.x!;
        const gcy = h / 2 - node.y!;
        node.vx! += gcx * 0.0003;
        node.vy! += gcy * 0.0003;
      }

      // Apply velocity with damping
      const damping = 0.82;
      for (const node of nodes) {
        if (dragRef.current.nodeId === node.id) continue;
        node.vx! *= damping;
        node.vy! *= damping;
        node.x! += node.vx!;
        node.y! += node.vy!;
        const pad = 50;
        node.x = Math.max(pad, Math.min(w - pad, node.x!));
        node.y = Math.max(pad, Math.min(h - pad, node.y!));
      }
    }

    function render() {
      if (!ctx) return;
      const nodes = nodesRef.current;
      const links = linksRef.current;
      const hovId = hoveredRef.current;

      ctx.clearRect(0, 0, dimensions.width, dimensions.height);

      // Draw links — always visible, styled by type
      for (const link of links) {
        const a = nodes.find((n) => n.id === link.source);
        const b = nodes.find((n) => n.id === link.target);
        if (!a || !b) continue;

        const isHighlighted = hovId && (link.source === hovId || link.target === hovId);
        const style = LINK_STYLES[link.type];

        ctx.beginPath();
        ctx.moveTo(a.x!, a.y!);
        ctx.lineTo(b.x!, b.y!);
        ctx.strokeStyle = isHighlighted ? style.hoverColor : style.color;
        ctx.lineWidth = isHighlighted ? 2 : (link.type === 'forum' ? 0.9 : 0.5);

        // Dashed lines for author links
        if (link.type === 'author') {
          ctx.setLineDash([4, 4]);
        } else if (link.type === 'temporal') {
          ctx.setLineDash([2, 6]);
        } else {
          ctx.setLineDash([]);
        }
        ctx.stroke();
        ctx.setLineDash([]);

        // Animated particles — different speeds per type
        const baseSpeed = link.type === 'forum' ? 100 : (link.type === 'author' ? 80 : 140);
        const speed = isHighlighted ? 40 : baseSpeed;
        const t = (tick % speed) / speed;
        const px = a.x! + (b.x! - a.x!) * t;
        const py = a.y! + (b.y! - a.y!) * t;
        ctx.beginPath();
        ctx.arc(px, py, isHighlighted ? 2.5 : 1.2, 0, Math.PI * 2);
        ctx.fillStyle = isHighlighted ? '#14F195' : style.particle + '66';
        ctx.fill();
      }

      // Draw nodes
      for (const node of nodes) {
        const isHov = hovId === node.id;
        const isConnected = hovId && links.some(
          (l) => (l.source === hovId && l.target === node.id) || (l.target === hovId && l.source === node.id)
        );
        const color = getForumColor(node.forum);
        const r = node.radius! * (isHov ? 1.5 : 1);

        // Glow halo
        if (isHov || isConnected) {
          ctx.beginPath();
          ctx.arc(node.x!, node.y!, r + 10, 0, Math.PI * 2);
          const gradient = ctx.createRadialGradient(node.x!, node.y!, r, node.x!, node.y!, r + 10);
          gradient.addColorStop(0, color + '50');
          gradient.addColorStop(1, 'transparent');
          ctx.fillStyle = gradient;
          ctx.fill();
        }

        // Node circle
        ctx.beginPath();
        ctx.arc(node.x!, node.y!, r, 0, Math.PI * 2);
        ctx.fillStyle = isHov ? '#ffffff' : color;
        ctx.shadowColor = color;
        ctx.shadowBlur = isHov ? 20 : (isConnected ? 12 : 4);
        ctx.fill();
        ctx.shadowBlur = 0;

        // Label
        const dimmed = hovId && !isHov && !isConnected;
        const fontSize = isHov ? 12 : 10;
        ctx.font = `${isHov ? '600' : '400'} ${fontSize}px Inter, sans-serif`;
        ctx.textAlign = 'center';
        ctx.fillStyle = dimmed ? '#666' : (isHov ? '#fff' : '#bbb');

        const label = node.title.length > 35 ? node.title.slice(0, 32) + '...' : node.title;
        ctx.fillText(label, node.x!, node.y! + r + 14);

        // Show author on hover
        if (isHov) {
          ctx.font = '400 9px Inter, sans-serif';
          ctx.fillStyle = '#14F195';
          ctx.fillText(`by ${node.author}  ·  ${node.score} votes  ·  ${node.answers} answers`, node.x!, node.y! + r + 26);
        }
      }

      tick++;
    }

    function loop() {
      simulate();
      render();
      animFrameRef.current = requestAnimationFrame(loop);
    }

    loop();
    return () => cancelAnimationFrame(animFrameRef.current);
  }, [dimensions]);

  // Mouse interactions
  const findNode = useCallback((x: number, y: number): GraphNode | null => {
    const nodes = nodesRef.current;
    for (let i = nodes.length - 1; i >= 0; i--) {
      const n = nodes[i];
      const dx = x - n.x!;
      const dy = y - n.y!;
      if (dx * dx + dy * dy < (n.radius! + 8) * (n.radius! + 8)) {
        return n;
      }
    }
    return null;
  }, []);

  const handleMouseMove = useCallback((e: React.MouseEvent) => {
    const rect = canvasRef.current?.getBoundingClientRect();
    if (!rect) return;
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    if (dragRef.current.nodeId) {
      const node = nodesRef.current.find((n) => n.id === dragRef.current.nodeId);
      if (node) {
        node.x = x;
        node.y = y;
        node.vx = 0;
        node.vy = 0;
      }
      return;
    }

    const found = findNode(x, y);
    const newHovered = found?.id || null;
    if (newHovered !== hoveredRef.current) {
      hoveredRef.current = newHovered;
      setHovered(newHovered);
    }
  }, [findNode]);

  const handleMouseDown = useCallback((e: React.MouseEvent) => {
    const rect = canvasRef.current?.getBoundingClientRect();
    if (!rect) return;
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    const found = findNode(x, y);
    if (found) {
      dragRef.current = { nodeId: found.id };
    }
  }, [findNode]);

  const handleMouseUp = useCallback(() => {
    dragRef.current = { nodeId: null };
  }, []);

  const handleClick = useCallback((e: React.MouseEvent) => {
    if (dragRef.current.nodeId) return;
    const rect = canvasRef.current?.getBoundingClientRect();
    if (!rect) return;
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    const found = findNode(x, y);
    if (found) {
      router.push(`/humans/question/${found.id}`);
    }
  }, [findNode, router]);

  // Forum legend
  const forumList = useMemo(() => {
    const seen = new Set<string>();
    const list: string[] = [];
    for (const q of questions) {
      if (!seen.has(q.forum_name)) {
        seen.add(q.forum_name);
        list.push(q.forum_name);
      }
    }
    return list.slice(0, 8);
  }, [questions]);

  return (
    <div ref={containerRef} className="relative w-full h-[500px] md:h-[600px] rounded-xl border border-[#363665] bg-[#1a1a35] overflow-hidden">
      {/* Background gradient */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-1/3 left-1/4 w-64 h-64 bg-[#9945FF]/5 rounded-full blur-[80px]" />
        <div className="absolute bottom-1/3 right-1/4 w-64 h-64 bg-[#14F195]/3 rounded-full blur-[80px]" />
      </div>

      <canvas
        ref={canvasRef}
        className="w-full h-full"
        style={{ cursor: hovered ? 'pointer' : 'default', width: dimensions.width, height: dimensions.height }}
        onMouseMove={handleMouseMove}
        onMouseDown={handleMouseDown}
        onMouseUp={handleMouseUp}
        onMouseLeave={() => {
          hoveredRef.current = null;
          setHovered(null);
          handleMouseUp();
        }}
        onClick={handleClick}
      />

      {/* Legend */}
      <div className="absolute bottom-3 left-3 flex flex-wrap gap-2">
        {forumList.map((forum) => (
          <div key={forum} className="flex items-center gap-1.5 px-2 py-1 rounded bg-black/60 backdrop-blur-sm border border-[#363665]">
            <div className="w-2 h-2 rounded-full" style={{ backgroundColor: getForumColor(forum) }} />
            <span className="text-[10px] text-[#bbb]">{forum}</span>
          </div>
        ))}
      </div>

      {/* Edge type legend */}
      <div className="absolute bottom-3 right-3 flex flex-col gap-1">
        <div className="flex items-center gap-1.5 px-2 py-1 rounded bg-black/60 backdrop-blur-sm border border-[#363665]">
          <div className="w-4 h-px bg-[#9945FF]" />
          <span className="text-[9px] text-[#bbb]">same forum</span>
        </div>
        <div className="flex items-center gap-1.5 px-2 py-1 rounded bg-black/60 backdrop-blur-sm border border-[#363665]">
          <div className="w-4 h-px border-t border-dashed border-[#14F195]" />
          <span className="text-[9px] text-[#bbb]">same author</span>
        </div>
        <div className="flex items-center gap-1.5 px-2 py-1 rounded bg-black/60 backdrop-blur-sm border border-[#363665]">
          <div className="w-4 h-px border-t border-dotted border-[#03E1FF]" />
          <span className="text-[9px] text-[#bbb]">asked near same time</span>
        </div>
      </div>

      {/* Title overlay */}
      <div className="absolute top-3 left-3 px-3 py-1.5 rounded bg-black/60 backdrop-blur-sm border border-[#363665]">
        <span className="text-[11px] text-[#bbb] uppercase tracking-wider">Knowledge Graph</span>
      </div>
    </div>
  );
}
