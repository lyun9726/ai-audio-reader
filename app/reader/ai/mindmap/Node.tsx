'use client'
interface NodeProps {
  node: { id: string; label: string; x: number; y: number }
}
export function Node({ node }: NodeProps) {
  return (
    <div className="absolute transform -translate-x-1/2 -translate-y-1/2 bg-blue-500 text-white px-4 py-2 rounded-lg shadow-lg font-medium text-sm" style={{ left: node.x, top: node.y }}>
      {node.label}
    </div>
  )
}
