import React, { useState, useEffect, useCallback } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { 
  Brain,
  Target,
  Route,
  TrendingUp,
  Zap,
  Calculator,
  MapPin,
  Clock,
  Fuel,
  Users,
  Truck,
  AlertTriangle,
  CheckCircle,
  BarChart3,
  Activity,
  Settings,
  Play,
  Pause,
  RefreshCw,
  Download,
  Upload,
  Eye,
  Layers,
  Navigation,
  Gauge
} from 'lucide-react';
import { api } from '@/services/api';
import { Project, Vehicle, Crew, Employee } from '@/types/database';

interface OptimizationEngineProps {
  projectId?: string;
  className?: string;
}

interface OptimizationScenario {
  id: string;
  name: string;
  type: 'route' | 'resource' | 'schedule' | 'cost' | 'hybrid';
  status: 'idle' | 'analyzing' | 'optimizing' | 'complete' | 'error';
  progress: number;
  parameters: Record<string, unknown>;
  results?: OptimizationResult;
  created_at: string;
  execution_time?: number;
}

interface OptimizationResult {
  efficiency_gain: number;
  cost_savings: number;
  time_reduction: number;
  fuel_savings: number;
  resource_utilization: number;
  recommended_routes: Route[];
  resource_allocation: ResourceAllocation[];
  schedule_optimization: ScheduleOptimization[];
  confidence_score: number;
  implementation_priority: 'low' | 'medium' | 'high' | 'critical';
}

interface Route {
  id: string;
  name: string;
  waypoints: { lat: number; lng: number; address: string }[];
  estimated_time: number;
  estimated_fuel: number;
  efficiency_score: number;
  traffic_impact: number;
  weather_consideration: boolean;
}

interface ResourceAllocation {
  resource_type: 'vehicle' | 'crew' | 'equipment' | 'material';
  resource_id: string;
  assignment: string;
  utilization_rate: number;
  efficiency_impact: number;
  cost_impact: number;
}

interface ScheduleOptimization {
  task_id: string;
  task_name: string;
  original_start: string;
  optimized_start: string;
  duration_reduction: number;
  dependency_impact: string[];
  priority_adjustment: number;
}

interface AIMetrics {
  model_accuracy: number;
  prediction_confidence: number;
  learning_iterations: number;
  data_quality_score: number;
  optimization_success_rate: number;
  average_efficiency_gain: number;
}

const OptimizationEngine: React.FC<OptimizationEngineProps> = ({ 
  projectId,
  className = '' 
}) => {
  const [optimizationScenarios, setOptimizationScenarios] = useState<OptimizationScenario[]>([]);
  const [activeScenario, setActiveScenario] = useState<string | null>(null);
  const [aiMetrics, setAIMetrics] = useState<AIMetrics>({
    model_accuracy: 0,
    prediction_confidence: 0,
    learning_iterations: 0,
    data_quality_score: 0,
    optimization_success_rate: 0,
    average_efficiency_gain: 0
  });
  
  const [projects, setProjects] = useState<Project[]>([]);
  const [vehicles, setVehicles] = useState<Vehicle[]>([]);
  const [crews, setCrews] = useState<Crew[]>([]);
  const [selectedProject, setSelectedProject] = useState<string>(projectId || '');
  const [optimizationType, setOptimizationType] = useState<string>('hybrid');
  const [isLoading, setIsLoading] = useState(true);

  const loadOptimizationData = useCallback(async () => {
    try {
      setIsLoading(true);

      // Load projects
      const projectsResponse = await api.projects.getAll();
      if (projectsResponse.success) {
        setProjects(projectsResponse.data);
        if (!selectedProject && projectsResponse.data.length > 0) {
          setSelectedProject(projectsResponse.data[0].id);
        }
      }

      // Load vehicles and crews
      const vehiclesResponse = await api.vehicles.getAll();
      if (vehiclesResponse.success) {
        setVehicles(vehiclesResponse.data);
      }

      const crewsResponse = await api.crews.getAll();
      if (crewsResponse.success) {
        setCrews(crewsResponse.data);
      }

      // Load AI metrics and scenarios
      await loadAIMetrics();
      await loadOptimizationScenarios();

    } catch (error) {
      console.error('Failed to load optimization data:', error);
    } finally {
      setIsLoading(false);
    }
  }, [selectedProject]);

  useEffect(() => {
    loadOptimizationData();
  }, [loadOptimizationData]);

  const loadAIMetrics = async () => {
    // Simulate AI model metrics
    setAIMetrics({
      model_accuracy: 92.5 + Math.random() * 5,
      prediction_confidence: 87.8 + Math.random() * 8,
      learning_iterations: 15000 + Math.floor(Math.random() * 5000),
      data_quality_score: 94.2 + Math.random() * 4,
      optimization_success_rate: 89.1 + Math.random() * 8,
      average_efficiency_gain: 23.7 + Math.random() * 12
    });
  };

  const loadOptimizationScenarios = async () => {
    // Generate mock optimization scenarios
    const scenarios: OptimizationScenario[] = [
      {
        id: '1',
        name: 'Route Optimization - Highway 101',
        type: 'route',
        status: 'complete',
        progress: 100,
        parameters: {
          traffic_weight: 0.3,
          fuel_weight: 0.4,
          time_weight: 0.3,
          weather_consideration: true
        },
        results: {
          efficiency_gain: 18.5,
          cost_savings: 3200,
          time_reduction: 45,
          fuel_savings: 12.3,
          resource_utilization: 94.2,
          recommended_routes: [],
          resource_allocation: [],
          schedule_optimization: [],
          confidence_score: 91.8,
          implementation_priority: 'high'
        },
        created_at: new Date(Date.now() - 3600000).toISOString(),
        execution_time: 127
      },
      {
        id: '2',
        name: 'Multi-Crew Resource Allocation',
        type: 'resource',
        status: 'analyzing',
        progress: 67,
        parameters: {
          crew_efficiency: 0.35,
          equipment_utilization: 0.25,
          cost_optimization: 0.4
        },
        created_at: new Date(Date.now() - 1800000).toISOString()
      },
      {
        id: '3',
        name: 'Hybrid Optimization - Full Project',
        type: 'hybrid',
        status: 'idle',
        progress: 0,
        parameters: {
          comprehensive_analysis: true,
          multi_objective: true,
          constraint_handling: true
        },
        created_at: new Date().toISOString()
      }
    ];

    setOptimizationScenarios(scenarios);
  };

  const createOptimizationScenario = async () => {
    const newScenario: OptimizationScenario = {
      id: Date.now().toString(),
      name: `${optimizationType.charAt(0).toUpperCase() + optimizationType.slice(1)} Optimization - ${new Date().toLocaleTimeString()}`,
      type: optimizationType as 'route' | 'resource' | 'schedule' | 'cost' | 'hybrid',
      status: 'idle',
      progress: 0,
      parameters: generateOptimizationParameters(optimizationType),
      created_at: new Date().toISOString()
    };

    setOptimizationScenarios(prev => [newScenario, ...prev]);
    setActiveScenario(newScenario.id);
  };

  const generateOptimizationParameters = (type: string) => {
    const baseParams = {
      data_quality_threshold: 0.85,
      confidence_threshold: 0.8,
      max_iterations: 1000,
      learning_rate: 0.01
    };

    switch (type) {
      case 'route':
        return {
          ...baseParams,
          traffic_weight: 0.3,
          fuel_weight: 0.4,
          time_weight: 0.3,
          weather_consideration: true,
          road_condition_factor: 0.15
        };
      case 'resource':
        return {
          ...baseParams,
          crew_efficiency: 0.35,
          equipment_utilization: 0.25,
          cost_optimization: 0.4,
          skill_matching: true
        };
      case 'schedule':
        return {
          ...baseParams,
          dependency_weight: 0.4,
          resource_availability: 0.3,
          deadline_priority: 0.3,
          buffer_time: 0.1
        };
      case 'cost':
        return {
          ...baseParams,
          material_cost_weight: 0.3,
          labor_cost_weight: 0.3,
          equipment_cost_weight: 0.2,
          overhead_optimization: 0.2
        };
      case 'hybrid':
        return {
          ...baseParams,
          comprehensive_analysis: true,
          multi_objective: true,
          constraint_handling: true,
          pareto_optimization: true,
          ensemble_methods: true
        };
      default:
        return baseParams;
    }
  };

  const runOptimization = async (scenarioId: string) => {
    const scenario = optimizationScenarios.find(s => s.id === scenarioId);
    if (!scenario) return;

    // Start optimization
    setOptimizationScenarios(prev =>
      prev.map(s =>
        s.id === scenarioId
          ? { ...s, status: 'analyzing', progress: 0 }
          : s
      )
    );

    // Simulate optimization process
    const totalSteps = 10;
    for (let step = 0; step < totalSteps; step++) {
      await new Promise(resolve => setTimeout(resolve, 500));
      
      const progress = ((step + 1) / totalSteps) * 100;
      const status = step < 3 ? 'analyzing' : step < totalSteps - 1 ? 'optimizing' : 'complete';
      
      setOptimizationScenarios(prev =>
        prev.map(s =>
          s.id === scenarioId
            ? { ...s, progress, status: status as 'idle' | 'analyzing' | 'optimizing' | 'complete' | 'error' }
            : s
        )
      );
    }

    // Generate results
    const results = generateOptimizationResults(scenario.type);
    const executionTime = 45 + Math.random() * 120;

    setOptimizationScenarios(prev =>
      prev.map(s =>
        s.id === scenarioId
          ? { ...s, results, execution_time: executionTime }
          : s
      )
    );

    // Update AI metrics
    await loadAIMetrics();
  };

  const generateOptimizationResults = (type: string): OptimizationResult => {
    const baseResults = {
      efficiency_gain: 15 + Math.random() * 25,
      cost_savings: 2000 + Math.random() * 8000,
      time_reduction: 20 + Math.random() * 60,
      fuel_savings: 8 + Math.random() * 15,
      resource_utilization: 85 + Math.random() * 12,
      recommended_routes: [],
      resource_allocation: [],
      schedule_optimization: [],
      confidence_score: 85 + Math.random() * 12,
      implementation_priority: Math.random() > 0.7 ? 'high' : Math.random() > 0.4 ? 'medium' : 'low'
    };

    // Add type-specific results
    if (type === 'route' || type === 'hybrid') {
      baseResults.recommended_routes = generateRouteRecommendations();
    }

    if (type === 'resource' || type === 'hybrid') {
      baseResults.resource_allocation = generateResourceAllocation();
    }

    if (type === 'schedule' || type === 'hybrid') {
      baseResults.schedule_optimization = generateScheduleOptimization();
    }

    return baseResults as OptimizationResult;
  };

  const generateRouteRecommendations = (): Route[] => {
    return [
      {
        id: '1',
        name: 'Optimized Route A',
        waypoints: [
          { lat: 40.7128, lng: -74.0060, address: 'Start Point' },
          { lat: 40.7589, lng: -73.9851, address: 'Waypoint 1' },
          { lat: 40.7614, lng: -73.9776, address: 'End Point' }
        ],
        estimated_time: 45,
        estimated_fuel: 3.2,
        efficiency_score: 92.5,
        traffic_impact: 12,
        weather_consideration: true
      },
      {
        id: '2',
        name: 'Alternative Route B',
        waypoints: [
          { lat: 40.7128, lng: -74.0060, address: 'Start Point' },
          { lat: 40.7505, lng: -73.9934, address: 'Waypoint 1' },
          { lat: 40.7614, lng: -73.9776, address: 'End Point' }
        ],
        estimated_time: 52,
        estimated_fuel: 3.7,
        efficiency_score: 87.3,
        traffic_impact: 8,
        weather_consideration: true
      }
    ];
  };

  const generateResourceAllocation = (): ResourceAllocation[] => {
    return [
      {
        resource_type: 'crew',
        resource_id: 'crew-alpha',
        assignment: 'Section A Paving',
        utilization_rate: 94.2,
        efficiency_impact: 18.5,
        cost_impact: -1200
      },
      {
        resource_type: 'vehicle',
        resource_id: 'truck-007',
        assignment: 'Material Transport',
        utilization_rate: 87.6,
        efficiency_impact: 12.3,
        cost_impact: -800
      },
      {
        resource_type: 'equipment',
        resource_id: 'paver-01',
        assignment: 'Primary Paving',
        utilization_rate: 91.8,
        efficiency_impact: 22.1,
        cost_impact: -1500
      }
    ];
  };

  const generateScheduleOptimization = (): ScheduleOptimization[] => {
    return [
      {
        task_id: 'task-001',
        task_name: 'Base Layer Preparation',
        original_start: '2024-01-15T08:00:00Z',
        optimized_start: '2024-01-15T07:30:00Z',
        duration_reduction: 30,
        dependency_impact: ['task-002', 'task-003'],
        priority_adjustment: 15
      },
      {
        task_id: 'task-002',
        task_name: 'Asphalt Application',
        original_start: '2024-01-15T10:00:00Z',
        optimized_start: '2024-01-15T09:30:00Z',
        duration_reduction: 45,
        dependency_impact: ['task-003'],
        priority_adjustment: 10
      }
    ];
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'complete': return 'text-success';
      case 'analyzing': case 'optimizing': return 'text-primary';
      case 'error': return 'text-destructive';
      case 'idle': return 'text-muted-foreground';
      default: return 'text-muted-foreground';
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'complete': return 'default';
      case 'analyzing': case 'optimizing': return 'secondary';
      case 'error': return 'destructive';
      case 'idle': return 'outline';
      default: return 'outline';
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'critical': return 'text-destructive';
      case 'high': return 'text-orange-500';
      case 'medium': return 'text-warning';
      case 'low': return 'text-muted-foreground';
      default: return 'text-muted-foreground';
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(amount);
  };

  return (
    <div className={`space-y-6 ${className}`}>
      {/* AI Engine Header */}
      <Card className="glass-elevated p-6">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <Brain className="w-6 h-6 text-primary" />
            <h2 className="text-2xl font-bold text-glow-primary">AI Optimization Engine</h2>
            <Badge variant="outline" className="glass-card text-accent">
              <Zap className="w-3 h-3 mr-1" />
              Neural Network Active
            </Badge>
          </div>
          
          <div className="flex items-center gap-3">
            <Select value={selectedProject} onValueChange={setSelectedProject}>
              <SelectTrigger className="w-64 glass-card">
                <SelectValue placeholder="Select project" />
              </SelectTrigger>
              <SelectContent>
                {projects.map((project) => (
                  <SelectItem key={project.id} value={project.id}>
                    {project.project_name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            
            <Button variant="outline" className="glass-card">
              <Settings className="w-4 h-4 mr-2" />
              Configure AI
            </Button>
          </div>
        </div>

        {/* AI Metrics Dashboard */}
        <div className="grid grid-cols-1 md:grid-cols-6 gap-4">
          <Card className="glass-card p-4">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium text-muted-foreground">Model Accuracy</span>
              <Target className="w-4 h-4 text-primary" />
            </div>
            <p className="text-2xl font-bold">{aiMetrics.model_accuracy.toFixed(1)}%</p>
            <Progress value={aiMetrics.model_accuracy} className="h-2 mt-2" />
          </Card>

          <Card className="glass-card p-4">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium text-muted-foreground">Confidence</span>
              <CheckCircle className="w-4 h-4 text-success" />
            </div>
            <p className="text-2xl font-bold text-success">{aiMetrics.prediction_confidence.toFixed(1)}%</p>
            <Progress value={aiMetrics.prediction_confidence} className="h-2 mt-2" />
          </Card>

          <Card className="glass-card p-4">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium text-muted-foreground">Iterations</span>
              <RefreshCw className="w-4 h-4 text-accent" />
            </div>
            <p className="text-2xl font-bold text-accent">{aiMetrics.learning_iterations.toLocaleString()}</p>
            <span className="text-xs text-muted-foreground">Training cycles</span>
          </Card>

          <Card className="glass-card p-4">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium text-muted-foreground">Data Quality</span>
              <Eye className="w-4 h-4 text-warning" />
            </div>
            <p className="text-2xl font-bold text-warning">{aiMetrics.data_quality_score.toFixed(1)}%</p>
            <Progress value={aiMetrics.data_quality_score} className="h-2 mt-2" />
          </Card>

          <Card className="glass-card p-4">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium text-muted-foreground">Success Rate</span>
              <TrendingUp className="w-4 h-4 text-success" />
            </div>
            <p className="text-2xl font-bold text-success">{aiMetrics.optimization_success_rate.toFixed(1)}%</p>
            <Progress value={aiMetrics.optimization_success_rate} className="h-2 mt-2" />
          </Card>

          <Card className="glass-card p-4">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium text-muted-foreground">Avg Efficiency</span>
              <Gauge className="w-4 h-4 text-primary" />
            </div>
            <p className="text-2xl font-bold text-primary">+{aiMetrics.average_efficiency_gain.toFixed(1)}%</p>
            <span className="text-xs text-muted-foreground">Improvement</span>
          </Card>
        </div>
      </Card>

      {/* Main Content Tabs */}
      <Tabs defaultValue="scenarios" className="space-y-6">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="scenarios" className="flex items-center gap-2">
            <Activity className="w-4 h-4" />
            Optimization Scenarios
          </TabsTrigger>
          <TabsTrigger value="routes" className="flex items-center gap-2">
            <Route className="w-4 h-4" />
            Route Planning
          </TabsTrigger>
          <TabsTrigger value="resources" className="flex items-center gap-2">
            <Users className="w-4 h-4" />
            Resource Allocation
          </TabsTrigger>
          <TabsTrigger value="analytics" className="flex items-center gap-2">
            <BarChart3 className="w-4 h-4" />
            AI Analytics
          </TabsTrigger>
        </TabsList>

        {/* Optimization Scenarios Tab */}
        <TabsContent value="scenarios" className="space-y-6">
          <Card className="glass-elevated p-6">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-xl font-semibold">Optimization Scenarios</h3>
              <div className="flex items-center gap-3">
                <Select value={optimizationType} onValueChange={setOptimizationType}>
                  <SelectTrigger className="w-48 glass-card">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="route">Route Optimization</SelectItem>
                    <SelectItem value="resource">Resource Allocation</SelectItem>
                    <SelectItem value="schedule">Schedule Optimization</SelectItem>
                    <SelectItem value="cost">Cost Optimization</SelectItem>
                    <SelectItem value="hybrid">Hybrid Optimization</SelectItem>
                  </SelectContent>
                </Select>
                <Button className="glow-primary" onClick={createOptimizationScenario}>
                  <Brain className="w-4 h-4 mr-2" />
                  Create Scenario
                </Button>
              </div>
            </div>

            <div className="space-y-4">
              {optimizationScenarios.map((scenario) => (
                <Card key={scenario.id} className="glass-card p-4">
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-primary/20 rounded-lg flex items-center justify-center">
                        <Brain className="w-5 h-5 text-primary" />
                      </div>
                      <div>
                        <h4 className="font-semibold">{scenario.name}</h4>
                        <p className="text-sm text-muted-foreground capitalize">
                          {scenario.type} optimization • Created {new Date(scenario.created_at).toLocaleTimeString()}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      <Badge variant={getStatusBadge(scenario.status) as "default" | "destructive" | "outline" | "secondary"} className={getStatusColor(scenario.status)}>
                        {scenario.status}
                      </Badge>
                      {scenario.status === 'idle' && (
                        <Button
                          size="sm"
                          className="glow-primary"
                          onClick={() => runOptimization(scenario.id)}
                        >
                          <Play className="w-4 h-4 mr-2" />
                          Run
                        </Button>
                      )}
                    </div>
                  </div>

                  {scenario.status !== 'idle' && (
                    <div className="mb-4">
                      <div className="flex justify-between items-center mb-2">
                        <span className="text-sm font-medium">
                          {scenario.status === 'analyzing' ? 'Analyzing Data...' :
                           scenario.status === 'optimizing' ? 'Running Optimization...' :
                           scenario.status === 'complete' ? 'Optimization Complete' : 'Processing'}
                        </span>
                        <span className="text-sm font-bold">{scenario.progress.toFixed(0)}%</span>
                      </div>
                      <Progress value={scenario.progress} className="h-2" />
                    </div>
                  )}

                  {scenario.results && (
                    <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mt-4">
                      <div className="text-center p-3 bg-success/10 rounded-lg">
                        <div className="text-lg font-bold text-success">+{scenario.results.efficiency_gain.toFixed(1)}%</div>
                        <div className="text-xs text-muted-foreground">Efficiency</div>
                      </div>
                      <div className="text-center p-3 bg-primary/10 rounded-lg">
                        <div className="text-lg font-bold text-primary">{formatCurrency(scenario.results.cost_savings)}</div>
                        <div className="text-xs text-muted-foreground">Savings</div>
                      </div>
                      <div className="text-center p-3 bg-accent/10 rounded-lg">
                        <div className="text-lg font-bold text-accent">{scenario.results.time_reduction}min</div>
                        <div className="text-xs text-muted-foreground">Time Saved</div>
                      </div>
                      <div className="text-center p-3 bg-warning/10 rounded-lg">
                        <div className="text-lg font-bold text-warning">{scenario.results.fuel_savings.toFixed(1)}%</div>
                        <div className="text-xs text-muted-foreground">Fuel Saved</div>
                      </div>
                      <div className="text-center p-3 bg-muted/10 rounded-lg">
                        <div className="text-lg font-bold">{scenario.results.confidence_score.toFixed(1)}%</div>
                        <div className="text-xs text-muted-foreground">Confidence</div>
                      </div>
                    </div>
                  )}

                  {scenario.execution_time && (
                    <div className="flex items-center justify-between mt-3 pt-3 border-t border-glass-border text-xs text-muted-foreground">
                      <span>Execution time: {scenario.execution_time.toFixed(0)}s</span>
                      {scenario.results && (
                        <span className={`font-medium ${getPriorityColor(scenario.results.implementation_priority)}`}>
                          Priority: {scenario.results.implementation_priority}
                        </span>
                      )}
                    </div>
                  )}
                </Card>
              ))}

              {optimizationScenarios.length === 0 && (
                <div className="text-center py-12">
                  <Brain className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
                  <h3 className="text-lg font-semibold mb-2">No optimization scenarios</h3>
                  <p className="text-muted-foreground">Create your first optimization scenario to get started with AI-driven improvements</p>
                </div>
              )}
            </div>
          </Card>
        </TabsContent>

        {/* Route Planning Tab */}
        <TabsContent value="routes" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Route Optimization */}
            <Card className="glass-card p-6">
              <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                <Route className="w-5 h-5" />
                Intelligent Route Planning
              </h3>
              
              <div className="space-y-4">
                <div className="p-4 bg-primary/10 rounded-lg border border-primary/20">
                  <div className="flex items-center gap-2 mb-2">
                    <Navigation className="w-4 h-4 text-primary" />
                    <span className="font-medium text-primary">AI-Optimized Route A</span>
                  </div>
                  <div className="grid grid-cols-3 gap-3 text-sm">
                    <div>
                      <span className="text-muted-foreground">Time:</span>
                      <span className="ml-1 font-medium">45 min</span>
                    </div>
                    <div>
                      <span className="text-muted-foreground">Fuel:</span>
                      <span className="ml-1 font-medium">3.2 gal</span>
                    </div>
                    <div>
                      <span className="text-muted-foreground">Score:</span>
                      <span className="ml-1 font-medium text-success">92.5%</span>
                    </div>
                  </div>
                  <div className="mt-2">
                    <Badge variant="outline" className="text-xs mr-2">Traffic Optimized</Badge>
                    <Badge variant="outline" className="text-xs">Weather Aware</Badge>
                  </div>
                </div>

                <div className="p-4 bg-muted/10 rounded-lg border border-glass-border">
                  <div className="flex items-center gap-2 mb-2">
                    <MapPin className="w-4 h-4 text-muted-foreground" />
                    <span className="font-medium">Standard Route B</span>
                  </div>
                  <div className="grid grid-cols-3 gap-3 text-sm">
                    <div>
                      <span className="text-muted-foreground">Time:</span>
                      <span className="ml-1 font-medium">52 min</span>
                    </div>
                    <div>
                      <span className="text-muted-foreground">Fuel:</span>
                      <span className="ml-1 font-medium">3.7 gal</span>
                    </div>
                    <div>
                      <span className="text-muted-foreground">Score:</span>
                      <span className="ml-1 font-medium">87.3%</span>
                    </div>
                  </div>
                </div>

                <div className="pt-3 border-t border-glass-border">
                  <h4 className="font-medium mb-2">Optimization Factors</h4>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Real-time traffic</span>
                      <span className="font-medium">High priority</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Fuel efficiency</span>
                      <span className="font-medium">Medium priority</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Weather conditions</span>
                      <span className="font-medium">Enabled</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Road conditions</span>
                      <span className="font-medium">Enabled</span>
                    </div>
                  </div>
                </div>
              </div>
            </Card>

            {/* Route Analytics */}
            <Card className="glass-card p-6">
              <h3 className="text-lg font-semibold mb-4">Route Performance Analytics</h3>
              
              <div className="space-y-4">
                <div className="p-3 bg-muted/10 rounded-lg">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-medium">Average Time Savings</span>
                    <span className="text-lg font-bold text-success">18.5%</span>
                  </div>
                  <Progress value={18.5} className="h-2" />
                </div>

                <div className="p-3 bg-muted/10 rounded-lg">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-medium">Fuel Efficiency Gain</span>
                    <span className="text-lg font-bold text-primary">12.3%</span>
                  </div>
                  <Progress value={12.3} className="h-2" />
                </div>

                <div className="p-3 bg-muted/10 rounded-lg">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-medium">Traffic Avoidance</span>
                    <span className="text-lg font-bold text-accent">94.2%</span>
                  </div>
                  <Progress value={94.2} className="h-2" />
                </div>

                <div className="grid grid-cols-2 gap-3 mt-4">
                  <div className="text-center p-3 bg-success/10 rounded-lg">
                    <div className="text-lg font-bold text-success">23</div>
                    <div className="text-xs text-muted-foreground">Routes Optimized</div>
                  </div>
                  <div className="text-center p-3 bg-primary/10 rounded-lg">
                    <div className="text-lg font-bold text-primary">$4,200</div>
                    <div className="text-xs text-muted-foreground">Cost Savings</div>
                  </div>
                </div>
              </div>
            </Card>
          </div>
        </TabsContent>

        {/* Resource Allocation Tab */}
        <TabsContent value="resources" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Crew Optimization */}
            <Card className="glass-card p-6">
              <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                <Users className="w-5 h-5" />
                Crew Allocation Optimization
              </h3>

              <div className="space-y-3">
                <div className="p-3 bg-primary/10 rounded-lg border border-primary/20">
                  <div className="flex items-center justify-between mb-2">
                    <span className="font-medium">Crew Alpha</span>
                    <Badge variant="default" className="text-xs">Optimized</Badge>
                  </div>
                  <div className="text-sm text-muted-foreground mb-2">Section A Paving</div>
                  <div className="flex justify-between text-sm">
                    <span>Utilization: <span className="font-medium text-success">94.2%</span></span>
                    <span>Efficiency: <span className="font-medium text-primary">+18.5%</span></span>
                  </div>
                </div>

                <div className="p-3 bg-muted/10 rounded-lg border border-glass-border">
                  <div className="flex items-center justify-between mb-2">
                    <span className="font-medium">Crew Beta</span>
                    <Badge variant="outline" className="text-xs">Standard</Badge>
                  </div>
                  <div className="text-sm text-muted-foreground mb-2">Section B Preparation</div>
                  <div className="flex justify-between text-sm">
                    <span>Utilization: <span className="font-medium">78.6%</span></span>
                    <span>Efficiency: <span className="font-medium">+5.2%</span></span>
                  </div>
                </div>

                <div className="p-3 bg-warning/10 rounded-lg border border-warning/20">
                  <div className="flex items-center justify-between mb-2">
                    <span className="font-medium">Crew Gamma</span>
                    <Badge variant="secondary" className="text-xs">Reallocation Suggested</Badge>
                  </div>
                  <div className="text-sm text-muted-foreground mb-2">Surface Repair</div>
                  <div className="flex justify-between text-sm">
                    <span>Utilization: <span className="font-medium text-warning">65.3%</span></span>
                    <span>Potential: <span className="font-medium text-success">+25.8%</span></span>
                  </div>
                </div>
              </div>
            </Card>

            {/* Equipment Optimization */}
            <Card className="glass-card p-6">
              <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                <Truck className="w-5 h-5" />
                Equipment Allocation
              </h3>

              <div className="space-y-3">
                <div className="p-3 bg-success/10 rounded-lg border border-success/20">
                  <div className="flex items-center justify-between mb-2">
                    <span className="font-medium">Paver CAT-01</span>
                    <Badge variant="default" className="text-xs text-success">Peak Efficiency</Badge>
                  </div>
                  <div className="text-sm text-muted-foreground mb-2">Primary Paving Operations</div>
                  <div className="flex justify-between text-sm">
                    <span>Uptime: <span className="font-medium text-success">91.8%</span></span>
                    <span>ROI: <span className="font-medium text-primary">+22.1%</span></span>
                  </div>
                </div>

                <div className="p-3 bg-primary/10 rounded-lg border border-primary/20">
                  <div className="flex items-center justify-between mb-2">
                    <span className="font-medium">Truck Fleet</span>
                    <Badge variant="default" className="text-xs">Optimized Routes</Badge>
                  </div>
                  <div className="text-sm text-muted-foreground mb-2">Material Transport</div>
                  <div className="flex justify-between text-sm">
                    <span>Efficiency: <span className="font-medium text-primary">87.6%</span></span>
                    <span>Fuel Savings: <span className="font-medium text-success">12.3%</span></span>
                  </div>
                </div>

                <div className="pt-3 border-t border-glass-border">
                  <h4 className="font-medium mb-2">AI Recommendations</h4>
                  <ul className="text-sm text-muted-foreground space-y-1">
                    <li>• Shift Paver-02 to Section C for optimal coverage</li>
                    <li>• Consolidate truck routes to reduce idle time</li>
                    <li>• Schedule preventive maintenance during low demand</li>
                  </ul>
                </div>
              </div>
            </Card>
          </div>
        </TabsContent>

        {/* AI Analytics Tab */}
        <TabsContent value="analytics" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Model Performance */}
            <Card className="glass-card p-6">
              <h3 className="text-lg font-semibold mb-4">AI Model Performance</h3>
              
              <div className="space-y-4">
                <div className="p-3 bg-muted/10 rounded-lg">
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-sm font-medium">Neural Network Accuracy</span>
                    <span className="text-lg font-bold text-success">{aiMetrics.model_accuracy.toFixed(1)}%</span>
                  </div>
                  <Progress value={aiMetrics.model_accuracy} className="h-2" />
                  <div className="text-xs text-muted-foreground mt-1">
                    Improved by 2.3% this week
                  </div>
                </div>

                <div className="p-3 bg-muted/10 rounded-lg">
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-sm font-medium">Prediction Confidence</span>
                    <span className="text-lg font-bold text-primary">{aiMetrics.prediction_confidence.toFixed(1)}%</span>
                  </div>
                  <Progress value={aiMetrics.prediction_confidence} className="h-2" />
                  <div className="text-xs text-muted-foreground mt-1">
                    Average across all optimization types
                  </div>
                </div>

                <div className="p-3 bg-muted/10 rounded-lg">
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-sm font-medium">Learning Progress</span>
                    <span className="text-lg font-bold text-accent">{aiMetrics.learning_iterations.toLocaleString()}</span>
                  </div>
                  <div className="text-xs text-muted-foreground">
                    Training iterations completed
                  </div>
                </div>
              </div>
            </Card>

            {/* Optimization Impact */}
            <Card className="glass-card p-6">
              <h3 className="text-lg font-semibold mb-4">Optimization Impact</h3>
              
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-3">
                  <div className="text-center p-3 bg-success/10 rounded-lg">
                    <div className="text-lg font-bold text-success">+{aiMetrics.average_efficiency_gain.toFixed(1)}%</div>
                    <div className="text-xs text-muted-foreground">Avg Efficiency</div>
                  </div>
                  <div className="text-center p-3 bg-primary/10 rounded-lg">
                    <div className="text-lg font-bold text-primary">$127K</div>
                    <div className="text-xs text-muted-foreground">Total Savings</div>
                  </div>
                </div>

                <div className="text-center p-3 bg-accent/10 rounded-lg">
                  <div className="text-lg font-bold text-accent">{aiMetrics.optimization_success_rate.toFixed(1)}%</div>
                  <div className="text-xs text-muted-foreground">Implementation Success Rate</div>
                </div>

                <div className="pt-3 border-t border-glass-border">
                  <h4 className="font-medium mb-2">Recent Improvements</h4>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Route optimization:</span>
                      <span className="font-medium text-success">+23% efficiency</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Resource allocation:</span>
                      <span className="font-medium text-primary">+18% utilization</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Cost reduction:</span>
                      <span className="font-medium text-accent">-15% expenses</span>
                    </div>
                  </div>
                </div>
              </div>
            </Card>
          </div>
        </TabsContent>
      </Tabs>

      {isLoading && (
        <div className="flex items-center justify-center py-12">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-2"></div>
            <p className="text-sm text-muted-foreground">Initializing AI optimization engine...</p>
          </div>
        </div>
      )}
    </div>
  );
};

export default OptimizationEngine;