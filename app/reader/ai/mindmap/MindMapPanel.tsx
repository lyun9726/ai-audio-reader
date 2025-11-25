'use client'

import { Card } from '../../common/Card'
import { GenerateMindMapButton } from './GenerateMindMapButton'
import { Node } from './Node'
import { Relation } from './Relation'

export function MindMapPanel() {
  const nodes = [
    { id: '1', label: 'Main Topic', x: 400, y: 200 },
    { id: '2', label: 'Subtopic 1', x: 200, y: 300 },
    { id: '3', label: 'Subtopic 2', x: 600, y: 300 },
  ]

  const relations = [
    { from: '1', to: '2' },
    { from: '1', to: '3' },
  ]

  return (
    <Card variant="bordered" className="p-6">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-xl font-semibold text-slate-900 dark:text-slate-100">Mind Map</h2>
        <GenerateMindMapButton onGenerate={() => {}} />
      </div>
      <div className="relative bg-slate-50 dark:bg-slate-900 rounded-lg" style={{ height: '500px' }}>
        <svg className="absolute inset-0 w-full h-full">
          {relations.map((rel, i) => {
            const fromNode = nodes.find(n => n.id === rel.from)
            const toNode = nodes.find(n => n.id === rel.to)
            return fromNode && toNode ? (
              <Relation key={i} from={fromNode} to={toNode} />
            ) : null
          })}
        </svg>
        {nodes.map(node => (
          <Node key={node.id} node={node} />
        ))}
      </div>
    </Card>
  )
}
