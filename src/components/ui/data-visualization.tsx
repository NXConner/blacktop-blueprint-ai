import * as React from "react"
import { cn } from "@/lib/utils"

// Real-time Data Stream Visualizer
export interface DataStreamProps extends React.HTMLAttributes<HTMLDivElement> {
  data: Array<{ value: number; timestamp: number; label?: string }>
  height?: number
  color?: string
  animated?: boolean
  maxPoints?: number
}

export const DataStream = React.forwardRef<HTMLDivElement, DataStreamProps>(
  ({ className, data, height = 200, color = "#3B82F6", animated = true, maxPoints = 50, ...props }, ref) => {
    const [displayData, setDisplayData] = React.useState(data.slice(-maxPoints))
    const canvasRef = React.useRef<HTMLCanvasElement>(null)

    React.useEffect(() => {
      setDisplayData(data.slice(-maxPoints))
    }, [data, maxPoints])

    React.useEffect(() => {
      if (!canvasRef.current || displayData.length === 0) return

      const canvas = canvasRef.current
      const ctx = canvas.getContext('2d')
      if (!ctx) return

      const rect = canvas.getBoundingClientRect()
      canvas.width = rect.width * 2
      canvas.height = rect.height * 2
      ctx.scale(2, 2)

      const width = rect.width
      const maxValue = Math.max(...displayData.map(d => d.value))
      const minValue = Math.min(...displayData.map(d => d.value))
      const valueRange = maxValue - minValue || 1

      // Clear canvas
      ctx.clearRect(0, 0, width, height)

      // Create gradient
      const gradient = ctx.createLinearGradient(0, 0, 0, height)
      gradient.addColorStop(0, color + '80')
      gradient.addColorStop(1, color + '20')

      // Draw data points and connections
      ctx.beginPath()
      ctx.strokeStyle = color
      ctx.lineWidth = 2
      ctx.lineCap = 'round'
      ctx.lineJoin = 'round'

      displayData.forEach((point, index) => {
        const x = (index / (displayData.length - 1)) * width
        const y = height - ((point.value - minValue) / valueRange) * height

        if (index === 0) {
          ctx.moveTo(x, y)
        } else {
          ctx.lineTo(x, y)
        }

        // Draw data point
        ctx.save()
        ctx.fillStyle = color
        ctx.beginPath()
        ctx.arc(x, y, 3, 0, Math.PI * 2)
        ctx.fill()
        ctx.restore()
      })

      ctx.stroke()

      // Fill area under curve
      ctx.lineTo(width, height)
      ctx.lineTo(0, height)
      ctx.closePath()
      ctx.fillStyle = gradient
      ctx.fill()

      // Add glow effect
      ctx.shadowBlur = 10
      ctx.shadowColor = color
      ctx.stroke()

    }, [displayData, height, color])

    return (
      <div className={cn("relative glass-card p-4", className)} ref={ref} {...props}>
        <canvas
          ref={canvasRef}
          className={cn("w-full", animated && "animate-data-wave")}
          style={{ height: `${height}px` }}
        />
        
        {/* Data overlay */}
        <div className="absolute top-4 right-4 glass-card p-2 text-xs font-mono">
          <div className="flex items-center gap-2">
            <div 
              className="w-2 h-2 rounded-full animate-pulse" 
              style={{ backgroundColor: color }}
            />
            <span>Live Data</span>
          </div>
        </div>
      </div>
    )
  }
)
DataStream.displayName = "DataStream"

// 3D Particle Cloud Visualization
export interface ParticleCloudProps extends React.HTMLAttributes<HTMLDivElement> {
  data: Array<{ x: number; y: number; z: number; value: number; label?: string }>
  width?: number
  height?: number
  rotationSpeed?: number
  interactive?: boolean
}

export const ParticleCloud = React.forwardRef<HTMLDivElement, ParticleCloudProps>(
  ({ className, data, width = 400, height = 300, rotationSpeed = 0.01, interactive = true, ...props }, ref) => {
    const [rotation, setRotation] = React.useState({ x: 0, y: 0 })
    const [hoveredPoint, setHoveredPoint] = React.useState<number | null>(null)
    const containerRef = React.useRef<HTMLDivElement>(null)
    const animationRef = React.useRef<number>()

    React.useEffect(() => {
      if (!interactive) return

      const animate = () => {
        setRotation(prev => ({
          x: prev.x + rotationSpeed,
          y: prev.y + rotationSpeed * 0.7
        }))
        animationRef.current = requestAnimationFrame(animate)
      }

      animationRef.current = requestAnimationFrame(animate)
      return () => {
        if (animationRef.current) {
          cancelAnimationFrame(animationRef.current)
        }
      }
    }, [rotationSpeed, interactive])

    // Project 3D coordinates to 2D
    const project3D = React.useCallback((point: { x: number; y: number; z: number }) => {
      const cos_x = Math.cos(rotation.x)
      const sin_x = Math.sin(rotation.x)
      const cos_y = Math.cos(rotation.y)
      const sin_y = Math.sin(rotation.y)

      // Rotate around X axis
      const y1 = point.y * cos_x - point.z * sin_x
      const z1 = point.y * sin_x + point.z * cos_x

      // Rotate around Y axis
      const x2 = point.x * cos_y + z1 * sin_y
      const z2 = -point.x * sin_y + z1 * cos_y

      // Project to 2D
      const scale = 200 / (200 + z2)
      return {
        x: x2 * scale + width / 2,
        y: y1 * scale + height / 2,
        scale: scale
      }
    }, [rotation, width, height])

    return (
      <div 
        className={cn("relative glass-card overflow-hidden", className)} 
        ref={containerRef}
        style={{ width, height }}
        {...props}
      >
        <div className="absolute inset-0 perspective-1000">
          {data.map((point, index) => {
            const projected = project3D(point)
            const size = Math.max(2, point.value * projected.scale * 10)
            const opacity = Math.max(0.3, projected.scale)

            return (
              <div
                key={index}
                className="absolute data-point rounded-full cursor-pointer"
                style={{
                  left: projected.x - size / 2,
                  top: projected.y - size / 2,
                  width: size,
                  height: size,
                  backgroundColor: `hsl(${(point.value * 360)}, 70%, 60%)`,
                  opacity: opacity,
                  boxShadow: hoveredPoint === index 
                    ? `0 0 20px hsl(${(point.value * 360)}, 70%, 60%)`
                    : 'none',
                  zIndex: Math.floor(projected.scale * 1000),
                }}
                onMouseEnter={() => setHoveredPoint(index)}
                onMouseLeave={() => setHoveredPoint(null)}
              >
                {hoveredPoint === index && point.label && (
                  <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 glass-card px-2 py-1 text-xs whitespace-nowrap">
                    {point.label}
                  </div>
                )}
              </div>
            )
          })}
        </div>
      </div>
    )
  }
)
ParticleCloud.displayName = "ParticleCloud"

// Holographic Data Grid
export interface HolographicGridProps extends React.HTMLAttributes<HTMLDivElement> {
  data: Array<Array<number>>
  colorScale?: (value: number) => string
  animated?: boolean
  interactive?: boolean
}

export const HolographicGrid = React.forwardRef<HTMLDivElement, HolographicGridProps>(
  ({ className, data, colorScale = (v) => `hsl(${v * 240}, 70%, 60%)`, animated = true, interactive = true, ...props }, ref) => {
    const [hoveredCell, setHoveredCell] = React.useState<{ row: number; col: number } | null>(null)

    const maxValue = React.useMemo(() => {
      return Math.max(...data.flat())
    }, [data])

    return (
      <div className={cn("glass-card p-4 perspective-1000", className)} ref={ref} {...props}>
        <div className={cn("grid gap-1 transform-3d", animated && "animate-hologram-scan")}>
          {data.map((row, rowIndex) => (
            <div key={rowIndex} className="flex gap-1">
              {row.map((value, colIndex) => {
                const normalizedValue = value / maxValue
                const isHovered = hoveredCell?.row === rowIndex && hoveredCell?.col === colIndex
                
                return (
                  <div
                    key={colIndex}
                    className={cn(
                      "w-6 h-6 transition-all duration-300 cursor-pointer relative",
                      interactive && "hover:scale-150 hover:z-10"
                    )}
                    style={{
                      backgroundColor: colorScale(normalizedValue),
                      opacity: 0.7 + normalizedValue * 0.3,
                      boxShadow: isHovered 
                        ? `0 0 20px ${colorScale(normalizedValue)}`
                        : `0 0 5px ${colorScale(normalizedValue)}`,
                      transform: `translateZ(${normalizedValue * 20}px)`,
                    }}
                    onMouseEnter={() => interactive && setHoveredCell({ row: rowIndex, col: colIndex })}
                    onMouseLeave={() => interactive && setHoveredCell(null)}
                  >
                    {isHovered && (
                      <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 glass-card px-2 py-1 text-xs whitespace-nowrap">
                        {value.toFixed(2)}
                      </div>
                    )}
                  </div>
                )
              })}
            </div>
          ))}
        </div>
      </div>
    )
  }
)
HolographicGrid.displayName = "HolographicGrid"

// Neural Network Visualization
export interface NeuralNetworkVisualizationProps extends React.HTMLAttributes<HTMLDivElement> {
  layers: Array<number>
  activations?: Array<Array<number>>
  animated?: boolean
  interactive?: boolean
}

export const NeuralNetworkVisualization = React.forwardRef<HTMLDivElement, NeuralNetworkVisualizationProps>(
  ({ className, layers, activations = [], animated = true, interactive = true, ...props }, ref) => {
    const [activeConnections, setActiveConnections] = React.useState<Set<string>>(new Set())
    const svgRef = React.useRef<SVGSVGElement>(null)

    const layerSpacing = 150
    const nodeSpacing = 40
    const totalWidth = (layers.length - 1) * layerSpacing + 100
    const maxNodes = Math.max(...layers)
    const totalHeight = maxNodes * nodeSpacing + 100

    React.useEffect(() => {
      if (!animated) return

      const interval = setInterval(() => {
        const connections = new Set<string>()
        // Randomly activate some connections
        for (let i = 0; i < layers.length - 1; i++) {
          for (let j = 0; j < layers[i]; j++) {
            for (let k = 0; k < layers[i + 1]; k++) {
              if (Math.random() > 0.7) {
                connections.add(`${i}-${j}-${i + 1}-${k}`)
              }
            }
          }
        }
        setActiveConnections(connections)
      }, 1000)

      return () => clearInterval(interval)
    }, [layers, animated])

    return (
      <div className={cn("glass-card p-4 overflow-auto", className)} ref={ref} {...props}>
        <svg
          ref={svgRef}
          width={totalWidth}
          height={totalHeight}
          className="w-full h-full"
        >
          {/* Connections */}
          {layers.map((layerSize, layerIndex) => {
            if (layerIndex === layers.length - 1) return null

            const nextLayerSize = layers[layerIndex + 1]
            const connections = []

            for (let i = 0; i < layerSize; i++) {
              for (let j = 0; j < nextLayerSize; j++) {
                const x1 = 50 + layerIndex * layerSpacing
                const y1 = 50 + (totalHeight - layerSize * nodeSpacing) / 2 + i * nodeSpacing
                const x2 = 50 + (layerIndex + 1) * layerSpacing
                const y2 = 50 + (totalHeight - nextLayerSize * nodeSpacing) / 2 + j * nodeSpacing

                const connectionId = `${layerIndex}-${i}-${layerIndex + 1}-${j}`
                const isActive = activeConnections.has(connectionId)

                connections.push(
                  <line
                    key={connectionId}
                    x1={x1}
                    y1={y1}
                    x2={x2}
                    y2={y2}
                    stroke={isActive ? "#3B82F6" : "#64748B"}
                    strokeWidth={isActive ? "2" : "1"}
                    opacity={isActive ? "0.8" : "0.3"}
                    className={cn(
                      "transition-all duration-500",
                      animated && isActive && "animate-neural-pulse"
                    )}
                  />
                )
              }
            }

            return connections
          })}

          {/* Nodes */}
          {layers.map((layerSize, layerIndex) => {
            const nodes = []
            
            for (let i = 0; i < layerSize; i++) {
              const x = 50 + layerIndex * layerSpacing
              const y = 50 + (totalHeight - layerSize * nodeSpacing) / 2 + i * nodeSpacing
              
              const activation = activations[layerIndex]?.[i] || Math.random()
              const nodeColor = `hsl(${activation * 240}, 70%, 60%)`

              nodes.push(
                <g key={`${layerIndex}-${i}`}>
                  <circle
                    cx={x}
                    cy={y}
                    r="8"
                    fill={nodeColor}
                    stroke="#ffffff"
                    strokeWidth="2"
                    opacity="0.9"
                    className={cn(
                      "transition-all duration-300",
                      interactive && "hover:r-12 cursor-pointer",
                      animated && "animate-pulse"
                    )}
                  />
                  {animated && (
                    <circle
                      cx={x}
                      cy={y}
                      r="12"
                      fill="none"
                      stroke={nodeColor}
                      strokeWidth="1"
                      opacity="0.5"
                      className="animate-ping"
                    />
                  )}
                </g>
              )
            }

            return nodes
          })}

          {/* Layer Labels */}
          {layers.map((layerSize, layerIndex) => (
            <text
              key={`label-${layerIndex}`}
              x={50 + layerIndex * layerSpacing}
              y={30}
              textAnchor="middle"
              fill="currentColor"
              fontSize="12"
              className="font-mono"
            >
              Layer {layerIndex + 1}
            </text>
          ))}
        </svg>
      </div>
    )
  }
)
NeuralNetworkVisualization.displayName = "NeuralNetworkVisualization"

// Real-time Metrics Dashboard
export interface MetricsDashboardProps extends React.HTMLAttributes<HTMLDivElement> {
  metrics: Array<{
    name: string
    value: number
    target?: number
    unit?: string
    trend?: "up" | "down" | "stable"
    color?: string
  }>
  animated?: boolean
  layout?: "grid" | "circular"
}

export const MetricsDashboard = React.forwardRef<HTMLDivElement, MetricsDashboardProps>(
  ({ className, metrics, animated = true, layout = "grid", ...props }, ref) => {
    return (
      <div className={cn("glass-card p-6", className)} ref={ref} {...props}>
        {layout === "circular" ? (
          <div className="relative w-80 h-80 mx-auto">
            {metrics.map((metric, index) => {
              const angle = (index / metrics.length) * 2 * Math.PI - Math.PI / 2
              const radius = 120
              const x = Math.cos(angle) * radius + 160
              const y = Math.sin(angle) * radius + 160

              return (
                <div
                  key={metric.name}
                  className="absolute transform -translate-x-1/2 -translate-y-1/2"
                  style={{ left: x, top: y }}
                >
                  <div className={cn(
                    "glass-card p-4 text-center min-w-24",
                    animated && "animate-scale-in"
                  )}>
                    <div 
                      className="text-2xl font-bold"
                      style={{ color: metric.color || "#3B82F6" }}
                    >
                      {metric.value}
                      {metric.unit && <span className="text-sm ml-1">{metric.unit}</span>}
                    </div>
                    <div className="text-xs text-muted-foreground mt-1">
                      {metric.name}
                    </div>
                    {metric.trend && (
                      <div className={cn(
                        "text-xs mt-1",
                        metric.trend === "up" && "text-success",
                        metric.trend === "down" && "text-destructive", 
                        metric.trend === "stable" && "text-muted-foreground"
                      )}>
                        {metric.trend === "up" ? "↗" : metric.trend === "down" ? "↘" : "→"}
                      </div>
                    )}
                  </div>
                </div>
              )
            })}
            
            {/* Center info */}
            <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 glass-card p-4 text-center">
              <div className="text-sm font-medium">System Status</div>
              <div className="text-xs text-muted-foreground">Real-time</div>
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {metrics.map((metric, index) => (
              <div
                key={metric.name}
                className={cn(
                  "glass-card p-4 text-center",
                  animated && "animate-scale-in"
                )}
                style={{ animationDelay: `${index * 100}ms` }}
              >
                <div className="flex items-center justify-center gap-2 mb-2">
                  <div 
                    className="w-3 h-3 rounded-full animate-pulse"
                    style={{ backgroundColor: metric.color || "#3B82F6" }}
                  />
                  <span className="text-sm font-medium">{metric.name}</span>
                </div>
                
                <div 
                  className="text-3xl font-bold mb-1"
                  style={{ color: metric.color || "#3B82F6" }}
                >
                  {metric.value}
                  {metric.unit && <span className="text-lg ml-1">{metric.unit}</span>}
                </div>

                {metric.target && (
                  <div className="relative h-2 bg-muted rounded-full overflow-hidden">
                    <div 
                      className="h-full rounded-full transition-all duration-1000"
                      style={{ 
                        width: `${Math.min((metric.value / metric.target) * 100, 100)}%`,
                        backgroundColor: metric.color || "#3B82F6"
                      }}
                    />
                  </div>
                )}

                {metric.trend && (
                  <div className={cn(
                    "text-sm mt-2 flex items-center justify-center gap-1",
                    metric.trend === "up" && "text-success",
                    metric.trend === "down" && "text-destructive",
                    metric.trend === "stable" && "text-muted-foreground"
                  )}>
                    <span>
                      {metric.trend === "up" ? "↗" : metric.trend === "down" ? "↘" : "→"}
                    </span>
                    <span className="capitalize">{metric.trend}</span>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    )
  }
)
MetricsDashboard.displayName = "MetricsDashboard"