'use client'
interface RelationProps {
  from: { x: number; y: number }
  to: { x: number; y: number }
}
export function Relation({ from, to }: RelationProps) {
  return <line x1={from.x} y1={from.y} x2={to.x} y2={to.y} stroke="currentColor" strokeWidth="2" className="text-slate-300 dark:text-slate-600" />
}
