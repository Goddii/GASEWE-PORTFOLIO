import React, { useEffect, useRef } from 'react';
import { renderFlow } from '../js/flow';

/**
 * SystemFlowDiagram.jsx
 * Interactive visual execution simulation of system architectures.
 * Renders nodes, SVG connection edges, traveling glowing packet, and real-time execution log.
 */
export default function SystemFlowDiagram({ flow }) {
  const mountRef = useRef(null);

  useEffect(() => {
    if (!mountRef.current || !flow) return;

    const controller = renderFlow(mountRef.current, flow);

    return () => {
      controller?.destroy?.();
    };
  }, [flow]);

  if (!flow) return null;

  return (
    <div className="w-full my-6 rounded-xl overflow-hidden border border-white/[0.08] bg-[#0c0f13]/90 p-4 sm:p-6 shadow-2xl">
      <div className="flex items-center justify-between mb-3 text-xs font-mono text-cyan-400">
        <span className="font-semibold tracking-wider uppercase flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-cyan-400 animate-pulse shadow-[0_0_8px_#00f0ff]" />
          <span>Interactive Execution Simulation</span>
        </span>
        <span className="text-slate-500 hidden sm:inline">SYS.GRAPH // LIVE COMPOSITOR</span>
      </div>

      <div ref={mountRef} className="w-full" />
    </div>
  );
}
