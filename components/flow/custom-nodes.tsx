'use client';

import { Handle, Position, NodeProps } from '@xyflow/react';
import { CSSProperties } from 'react';

// Professional Enterprise Design System Colors
const COLORS = {
  primary: {
    gradient: 'linear-gradient(135deg, #4f46e5 0%, #6366f1 100%)', // Indigo - Authority & Trust
    solid: '#4f46e5',
    light: '#eef2ff',
  },
  decision: {
    gradient: 'linear-gradient(135deg, #0891b2 0%, #06b6d4 100%)', // Cyan - Clarity & Decision
    solid: '#0891b2',
    light: '#ecfeff',
  },
  process: {
    gradient: 'linear-gradient(135deg, #3b82f6 0%, #60a5fa 100%)', // Blue - Process Flow
    solid: '#3b82f6',
    light: '#eff6ff',
  },
  shadow: {
    sm: '0 2px 8px rgba(0, 0, 0, 0.06)',
    md: '0 4px 20px rgba(0, 0, 0, 0.08)',
    lg: '0 8px 30px rgba(0, 0, 0, 0.12)',
  },
};

// Diamond Node Component - Decision Points
export function DiamondNode({ data }: NodeProps) {
  const containerStyle: CSSProperties = {
    width: '140px',
    height: '140px',
    background: COLORS.decision.gradient,
    transform: 'rotate(45deg)',
    borderRadius: '12px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
    boxShadow: COLORS.shadow.md,
    transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
    cursor: 'pointer',
  };

  const textContainerStyle: CSSProperties = {
    transform: 'rotate(-45deg)',
    fontSize: '13px',
    fontWeight: 600,
    textAlign: 'center',
    padding: '12px',
    maxWidth: '110px',
    wordBreak: 'break-word',
    color: '#fff',
    textShadow: '0 1px 2px rgba(0, 0, 0, 0.1)',
    lineHeight: '1.4',
  };

  const handleStyle: CSSProperties = {
    background: 'linear-gradient(135deg, #fff 0%, #f0f0f0 100%)',
    border: '2px solid #06b6d4',
    width: '10px',
    height: '10px',
    boxShadow: '0 2px 4px rgba(0, 0, 0, 0.2)',
  };

  return (
    <div
      style={containerStyle}
      className="diamond-node"
      onMouseEnter={(e) => {
        e.currentTarget.style.transform = 'rotate(45deg) scale(1.05)';
        e.currentTarget.style.boxShadow = COLORS.shadow.lg;
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.transform = 'rotate(45deg) scale(1)';
        e.currentTarget.style.boxShadow = COLORS.shadow.md;
      }}
    >
      <Handle
        type="target"
        position={Position.Top}
        style={{ ...handleStyle, transform: 'rotate(-45deg)' }}
      />
      <div style={textContainerStyle}>{data.label}</div>
      <Handle
        type="source"
        position={Position.Bottom}
        style={{ ...handleStyle, transform: 'rotate(-45deg)' }}
      />
    </div>
  );
}

// Rectangle Node Component - Process Steps
export function RectNode({ data }: NodeProps) {
  const containerStyle: CSSProperties = {
    background: '#ffffff',
    border: 'none',
    borderRadius: '12px',
    padding: '14px 24px',
    fontSize: '13px',
    fontWeight: 600,
    minWidth: '120px',
    textAlign: 'center',
    boxShadow: COLORS.shadow.sm,
    position: 'relative',
    overflow: 'hidden',
    transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
    cursor: 'pointer',
    color: '#1a202c',
    lineHeight: '1.5',
  };

  const gradientBorderStyle: CSSProperties = {
    content: '""',
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    borderRadius: '12px',
    padding: '2px',
    background: COLORS.process.gradient,
    WebkitMask: 'linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0)',
    WebkitMaskComposite: 'xor',
    maskComposite: 'exclude',
    pointerEvents: 'none',
  };

  const handleStyle: CSSProperties = {
    background: COLORS.process.solid,
    border: '2px solid #fff',
    width: '10px',
    height: '10px',
    boxShadow: '0 2px 6px rgba(0, 0, 0, 0.15)',
  };

  return (
    <div
      style={containerStyle}
      className="rect-node"
      onMouseEnter={(e) => {
        e.currentTarget.style.transform = 'translateY(-2px)';
        e.currentTarget.style.boxShadow = COLORS.shadow.md;
        e.currentTarget.style.background = COLORS.process.light;
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.transform = 'translateY(0)';
        e.currentTarget.style.boxShadow = COLORS.shadow.sm;
        e.currentTarget.style.background = '#ffffff';
      }}
    >
      <div style={gradientBorderStyle} />
      <Handle type="target" position={Position.Top} style={handleStyle} />
      {data.label}
      <Handle type="source" position={Position.Bottom} style={handleStyle} />
    </div>
  );
}

// Round Node Component - Start/End Points
export function RoundNode({ data }: NodeProps) {
  const containerStyle: CSSProperties = {
    background: COLORS.primary.gradient,
    border: 'none',
    borderRadius: '50px',
    padding: '14px 28px',
    fontSize: '13px',
    fontWeight: 700,
    minWidth: '120px',
    textAlign: 'center',
    boxShadow: COLORS.shadow.md,
    transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
    cursor: 'pointer',
    color: '#fff',
    textShadow: '0 1px 2px rgba(0, 0, 0, 0.1)',
    letterSpacing: '0.3px',
  };

  const handleStyle: CSSProperties = {
    background: 'linear-gradient(135deg, #fff 0%, #f0f0f0 100%)',
    border: '2px solid #4f46e5',
    width: '10px',
    height: '10px',
    boxShadow: '0 2px 6px rgba(0, 0, 0, 0.2)',
  };

  return (
    <div
      style={containerStyle}
      className="round-node"
      onMouseEnter={(e) => {
        e.currentTarget.style.transform = 'scale(1.05)';
        e.currentTarget.style.boxShadow = COLORS.shadow.lg;
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.transform = 'scale(1)';
        e.currentTarget.style.boxShadow = COLORS.shadow.md;
      }}
    >
      <Handle type="target" position={Position.Top} style={handleStyle} />
      {data.label}
      <Handle type="source" position={Position.Bottom} style={handleStyle} />
    </div>
  );
}
