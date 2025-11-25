'use client'

import { useState, useMemo } from 'react'
import { Card } from '../../common/Card'
import { GenerateMindMapButton } from './GenerateMindMapButton'
import { Node } from './Node'
import { Relation } from './Relation'
import { useReaderStore } from '../../stores/readerStore'
import { useAI } from '../../hooks/useAI'
import type { MindmapNode } from '@/lib/ai/types'

interface DisplayNode {
  id: string
  label: string
  x: number
  y: number
}

export function MindMapPanel() {
  const blocks = useReaderStore(state => state.blocks)
  const { mindmap, generateMindmap, isLoading } = useAI()

  const handleGenerate = async () => {
    await generateMindmap(blocks)
  }

  // Convert hierarchical mindmap to flat display nodes
  const { displayNodes, relations } = useMemo(() => {
    if (!mindmap) {
      return { displayNodes: [], relations: [] }
    }

    const nodes: DisplayNode[] = []
    const rels: { from: string; to: string }[] = []
    let nodeId = 0

    const processNode = (node: MindmapNode, depth: number, x: number, y: number, parentId?: string) => {
      const id = `node-${nodeId++}`
      nodes.push({ id, label: node.title, x, y })

      if (parentId) {
        rels.push({ from: parentId, to: id })
      }

      if (node.children && node.children.length > 0) {
        const childSpacing = 150
        const totalWidth = (node.children.length - 1) * childSpacing
        const startX = x - totalWidth / 2

        node.children.forEach((child, idx) => {
          processNode(child, depth + 1, startX + idx * childSpacing, y + 120, id)
        })
      }
    }

    // Root node
    nodes.push({ id: 'root', label: mindmap.title, x: 400, y: 50 })

    // Process top-level nodes
    const topSpacing = 200
    const topWidth = (mindmap.nodes.length - 1) * topSpacing
    const topStartX = 400 - topWidth / 2

    mindmap.nodes.forEach((node, idx) => {
      const id = `top-${idx}`
      const x = topStartX + idx * topSpacing
      const y = 150
      nodes.push({ id, label: node.title, x, y })
      rels.push({ from: 'root', to: id })

      if (node.children) {
        const childSpacing = 150
        const childWidth = (node.children.length - 1) * childSpacing
        const childStartX = x - childWidth / 2

        node.children.forEach((child, childIdx) => {
          processNode(child, 2, childStartX + childIdx * childSpacing, y + 120, id)
        })
      }
    })

    return { displayNodes: nodes, relations: rels }
  }, [mindmap])

  return (
    <Card variant="bordered" className="p-6">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-xl font-semibold text-slate-900 dark:text-slate-100">Mind Map</h2>
        <GenerateMindMapButton onGenerate={handleGenerate} />
      </div>

      {isLoading && (
        <div className="flex items-center justify-center h-96">
          <p className="text-slate-600 dark:text-slate-400">Generating mind map...</p>
        </div>
      )}

      {!isLoading && displayNodes.length === 0 && (
        <div className="flex items-center justify-center h-96">
          <p className="text-slate-600 dark:text-slate-400">Click "Generate" to create a mind map</p>
        </div>
      )}

      {!isLoading && displayNodes.length > 0 && (
        <div className="relative bg-slate-50 dark:bg-slate-900 rounded-lg overflow-auto" style={{ height: '500px' }}>
          <svg className="absolute inset-0" style={{ width: '800px', height: '600px' }}>
            {relations.map((rel, i) => {
              const fromNode = displayNodes.find(n => n.id === rel.from)
              const toNode = displayNodes.find(n => n.id === rel.to)
              return fromNode && toNode ? (
                <Relation key={i} from={fromNode} to={toNode} />
              ) : null
            })}
          </svg>
          {displayNodes.map(node => (
            <Node key={node.id} node={node} />
          ))}
        </div>
      )}
    </Card>
  )
}
