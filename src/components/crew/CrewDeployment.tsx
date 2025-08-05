import React, { useState, useEffect } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { 
  Users, 
  UserPlus,
  MapPin, 
  Clock,
  Calendar as CalendarIcon,
  CheckCircle,
  AlertTriangle,
  XCircle,
  Wrench,
  Activity,
  Phone,
  Mail,
  Search,
  Filter,
  Plus,
  MoreVertical,
  Navigation,
  Target,
  Briefcase,
  Settings
} from 'lucide-react';
import { format } from 'date-fns';
import { api } from '@/services/api';
import { Employee, Crew, CrewMember, Project, WorkSession } from '@/types/database';

interface CrewDeploymentProps {
  companyId?: string;
  className?: string;
}

interface CrewWithMembers extends Crew {
  members: (CrewMember & { employee: Employee })[];
  current_project?: Project;
  active_session?: WorkSession;
  location?: { lat: number; lng: number; address: string };
}

interface DeploymentMetrics {
  totalCrews: number;
  activeCrews: number;
  availableWorkers: number;
  deployedWorkers: number;
  completedTasks: number;
  averageProductivity: number;
  hoursWorked: number;
  efficiency: number;
}

interface CrewTask {
  id: string;
  title: string;
  description: string;
  priority: 'low' | 'medium' | 'high' | 'critical';
  status: 'pending' | 'in_progress' | 'completed' | 'blocked';
  assigned_crew: string;
  estimated_hours: number;
  actual_hours?: number;
  location: string;
  due_date: string;
}

const CrewDeployment: React.FC<CrewDeploymentProps> = ({ 
  companyId,
  className = '' 
}) => {
  const [crews, setCrews] = useState<CrewWithMembers[]>([]);
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [tasks, setTasks] = useState<CrewTask[]>([]);
  const [projects, setProjects] = useState<Project[]>([]);
  
  const [deploymentMetrics, setDeploymentMetrics] = useState<DeploymentMetrics>({
    totalCrews: 0,
    activeCrews: 0,
    availableWorkers: 0,
    deployedWorkers: 0,
    completedTasks: 0,
    averageProductivity: 0,
    hoursWorked: 0,
    efficiency: 0
  });

  const [selectedCrew, setSelectedCrew] = useState<string | null>(null);
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(new Date());
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [activeTab, setActiveTab] = useState('overview');
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadCrewData();
    const interval = setInterval(loadCrewData, 30000); // Refresh every 30 seconds
    return () => clearInterval(interval);
  }, [companyId]);

  const loadCrewData = async () => {
    try {
      setIsLoading(true);
      
      // Load crews with members
      const crewsResponse = await api.crews.getAll(companyId);
      if (crewsResponse.success) {
        const crewsWithDetails = await Promise.all(
          crewsResponse.data.map(async (crew: Crew) => {
            // Get crew members
            const membersResponse = await api.crews.getMembers(crew.id);
            const members = membersResponse.success ? membersResponse.data : [];

            // Get current project
            const projectResponse = await api.projects.getById(crew.current_project_id);
            const currentProject = projectResponse.success ? projectResponse.data : null;

            // Get active work session
            const sessionResponse = await api.workSessions.getActiveByCrew(crew.id);
            const activeSession = sessionResponse.success ? sessionResponse.data : null;

            // Simulate location data
            const location = {
              lat: 40.7128 + (Math.random() - 0.5) * 0.1,
              lng: -74.0060 + (Math.random() - 0.5) * 0.1,
              address: `${Math.floor(Math.random() * 9999)} Construction Site`
            };

            return {
              ...crew,
              members,
              current_project: currentProject,
              active_session: activeSession,
              location
            };
          })
        );
        
        setCrews(crewsWithDetails);
        calculateMetrics(crewsWithDetails);
      }

      // Load employees
      const employeesResponse = await api.employees.getAll(companyId);
      if (employeesResponse.success) {
        setEmployees(employeesResponse.data);
      }

      // Load projects
      const projectsResponse = await api.projects.getAll();
      if (projectsResponse.success) {
        setProjects(projectsResponse.data);
      }

      // Generate mock tasks
      generateMockTasks();

    } catch (error) {
      console.error('Failed to load crew data:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const calculateMetrics = (crewData: CrewWithMembers[]) => {
    const totalWorkers = crewData.reduce((sum, crew) => sum + crew.members.length, 0);
    const activeCrews = crewData.filter(crew => crew.status === 'active').length;
    const deployedWorkers = crewData
      .filter(crew => crew.status === 'active')
      .reduce((sum, crew) => sum + crew.members.length, 0);

    const metrics: DeploymentMetrics = {
      totalCrews: crewData.length,
      activeCrews,
      availableWorkers: totalWorkers - deployedWorkers,
      deployedWorkers,
      completedTasks: Math.floor(Math.random() * 50) + 20,
      averageProductivity: 85 + Math.random() * 10,
      hoursWorked: Math.floor(Math.random() * 200) + 150,
      efficiency: 78 + Math.random() * 15
    };

    setDeploymentMetrics(metrics);
  };

  const generateMockTasks = () => {
    const mockTasks: CrewTask[] = [
      {
        id: '1',
        title: 'Parking Lot Resurfacing - Phase 1',
        description: 'Remove existing asphalt and prepare base layer',
        priority: 'high',
        status: 'in_progress',
        assigned_crew: 'crew-1',
        estimated_hours: 8,
        actual_hours: 5.5,
        location: 'Downtown Shopping Center',
        due_date: new Date().toISOString()
      },
      {
        id: '2',
        title: 'Road Crack Sealing - Highway 101',
        description: 'Seal cracks along 2-mile stretch of Highway 101',
        priority: 'medium',
        status: 'pending',
        assigned_crew: 'crew-2',
        estimated_hours: 6,
        location: 'Highway 101, Mile Marker 15-17',
        due_date: new Date(Date.now() + 86400000).toISOString()
      },
      {
        id: '3',
        title: 'Pothole Repair - Industrial District',
        description: 'Emergency pothole repairs on Industrial Blvd',
        priority: 'critical',
        status: 'blocked',
        assigned_crew: 'crew-3',
        estimated_hours: 4,
        location: 'Industrial Blvd & Manufacturing Way',
        due_date: new Date(Date.now() - 3600000).toISOString()
      }
    ];

    setTasks(mockTasks);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'text-success';
      case 'inactive': return 'text-muted-foreground';
      case 'on_break': return 'text-warning';
      case 'emergency': return 'text-destructive';
      default: return 'text-muted-foreground';
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'active': return 'default';
      case 'inactive': return 'secondary';
      case 'on_break': return 'outline';
      case 'emergency': return 'destructive';
      default: return 'outline';
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'critical': return 'text-destructive';
      case 'high': return 'text-warning';
      case 'medium': return 'text-primary';
      case 'low': return 'text-muted-foreground';
      default: return 'text-muted-foreground';
    }
  };

  const getTaskStatusColor = (status: string) => {
    switch (status) {
      case 'completed': return 'text-success';
      case 'in_progress': return 'text-primary';
      case 'blocked': return 'text-destructive';
      case 'pending': return 'text-warning';
      default: return 'text-muted-foreground';
    }
  };

  const deployCrew = async (crewId: string, projectId: string) => {
    try {
      const response = await api.crews.updateStatus(crewId, 'active');
      if (response.success) {
        await api.workSessions.start({
          crew_id: crewId,
          project_id: projectId,
          start_time: new Date().toISOString(),
          status: 'active'
        });
        loadCrewData(); // Refresh data
      }
    } catch (error) {
      console.error('Failed to deploy crew:', error);
    }
  };

  const recallCrew = async (crewId: string) => {
    try {
      const response = await api.crews.updateStatus(crewId, 'inactive');
      if (response.success) {
        await api.workSessions.endActive(crewId);
        loadCrewData(); // Refresh data
      }
    } catch (error) {
      console.error('Failed to recall crew:', error);
    }
  };

  return (
    <div className={`space-y-6 ${className}`}>
      {/* Deployment Overview Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="glass-card p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-muted-foreground">Total Crews</p>
              <p className="text-3xl font-bold">{deploymentMetrics.totalCrews}</p>
            </div>
            <Users className="w-8 h-8 text-primary" />
          </div>
        </Card>

        <Card className="glass-card p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-muted-foreground">Active Now</p>
              <p className="text-3xl font-bold text-success">{deploymentMetrics.activeCrews}</p>
            </div>
            <Activity className="w-8 h-8 text-success" />
          </div>
        </Card>

        <Card className="glass-card p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-muted-foreground">Workers Deployed</p>
              <p className="text-3xl font-bold text-accent">{deploymentMetrics.deployedWorkers}</p>
            </div>
            <Target className="w-8 h-8 text-accent" />
          </div>
        </Card>

        <Card className="glass-card p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-muted-foreground">Efficiency</p>
              <p className="text-3xl font-bold text-warning">{deploymentMetrics.efficiency.toFixed(0)}%</p>
            </div>
            <Briefcase className="w-8 h-8 text-warning" />
          </div>
        </Card>
      </div>

      {/* Productivity Metrics */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card className="glass-card p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold">Workforce Utilization</h3>
            <Badge variant="outline" className="glass-card">
              {((deploymentMetrics.deployedWorkers / (deploymentMetrics.deployedWorkers + deploymentMetrics.availableWorkers)) * 100).toFixed(1)}% Deployed
            </Badge>
          </div>
          <Progress 
            value={(deploymentMetrics.deployedWorkers / (deploymentMetrics.deployedWorkers + deploymentMetrics.availableWorkers)) * 100} 
            className="h-3" 
          />
          <div className="flex justify-between text-sm text-muted-foreground mt-2">
            <span>{deploymentMetrics.deployedWorkers} deployed</span>
            <span>{deploymentMetrics.availableWorkers} available</span>
          </div>
        </Card>

        <Card className="glass-card p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold">Daily Performance</h3>
            <Badge variant="outline" className="glass-card">
              {deploymentMetrics.hoursWorked}h worked
            </Badge>
          </div>
          <div className="space-y-3">
            <div className="flex justify-between items-center">
              <span className="text-sm text-muted-foreground">Tasks Completed</span>
              <span className="font-medium">{deploymentMetrics.completedTasks}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm text-muted-foreground">Avg Productivity</span>
              <span className="font-medium">{deploymentMetrics.averageProductivity.toFixed(1)}%</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm text-muted-foreground">Efficiency Score</span>
              <span className="font-medium text-success">{deploymentMetrics.efficiency.toFixed(1)}%</span>
            </div>
          </div>
        </Card>
      </div>

      {/* Main Content Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="overview" className="flex items-center gap-2">
            <Users className="w-4 h-4" />
            Crew Overview
          </TabsTrigger>
          <TabsTrigger value="deployment" className="flex items-center gap-2">
            <Target className="w-4 h-4" />
            Active Deployment
          </TabsTrigger>
          <TabsTrigger value="tasks" className="flex items-center gap-2">
            <Briefcase className="w-4 h-4" />
            Task Management
          </TabsTrigger>
          <TabsTrigger value="schedule" className="flex items-center gap-2">
            <CalendarIcon className="w-4 h-4" />
            Schedule
          </TabsTrigger>
        </TabsList>

        {/* Crew Overview Tab */}
        <TabsContent value="overview" className="space-y-6">
          <Card className="glass-elevated p-6">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-xl font-semibold">Crew Management</h3>
              <div className="flex items-center gap-3">
                <div className="relative">
                  <Search className="w-4 h-4 absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground" />
                  <Input
                    placeholder="Search crews..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10 w-64 glass-card"
                  />
                </div>
                <Button className="glow-primary">
                  <Plus className="w-4 h-4 mr-2" />
                  Create Crew
                </Button>
              </div>
            </div>

            {!isLoading && crews.length > 0 && (
              <div className="space-y-4">
                {crews.map((crew) => (
                  <Card key={crew.id} className="glass-card p-4">
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-primary/20 rounded-lg flex items-center justify-center">
                          <Users className="w-5 h-5 text-primary" />
                        </div>
                        <div>
                          <h4 className="font-semibold">{crew.crew_name}</h4>
                          <p className="text-sm text-muted-foreground">
                            {crew.members.length} members • {crew.crew_type}
                          </p>
                        </div>
                      </div>
                      
                      <div className="flex items-center gap-2">
                        <Badge variant={getStatusBadge(crew.status) as any}>
                          {crew.status}
                        </Badge>
                        {crew.active_session && (
                          <Badge variant="outline" className="text-success">
                            <Clock className="w-3 h-3 mr-1" />
                            Active
                          </Badge>
                        )}
                      </div>
                    </div>

                    {/* Crew Members */}
                    <div className="mb-4">
                      <h5 className="text-sm font-medium mb-2">Team Members</h5>
                      <div className="flex flex-wrap gap-2">
                        {crew.members.map((member) => (
                          <div key={member.id} className="flex items-center gap-2 bg-muted/20 rounded-lg px-3 py-1">
                            <div className="w-6 h-6 bg-primary/20 rounded-full flex items-center justify-center">
                              <span className="text-xs font-medium">
                                {member.employee.first_name[0]}{member.employee.last_name[0]}
                              </span>
                            </div>
                            <span className="text-sm">
                              {member.employee.first_name} {member.employee.last_name}
                            </span>
                            <Badge variant="outline" className="text-xs">
                              {member.role}
                            </Badge>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Current Assignment */}
                    {crew.current_project && (
                      <div className="mb-4">
                        <h5 className="text-sm font-medium mb-2">Current Assignment</h5>
                        <div className="flex items-center gap-2 text-sm">
                          <MapPin className="w-4 h-4 text-muted-foreground" />
                          <span>{crew.current_project.project_name}</span>
                          {crew.location && (
                            <>
                              <span className="text-muted-foreground">•</span>
                              <span className="text-muted-foreground">{crew.location.address}</span>
                            </>
                          )}
                        </div>
                      </div>
                    )}

                    {/* Actions */}
                    <div className="flex gap-2">
                      {crew.status === 'inactive' && (
                        <Button 
                          size="sm" 
                          variant="outline"
                          onClick={() => {
                            if (projects.length > 0) {
                              deployCrew(crew.id, projects[0].id);
                            }
                          }}
                        >
                          <Target className="w-4 h-4 mr-2" />
                          Deploy
                        </Button>
                      )}
                      {crew.status === 'active' && (
                        <Button 
                          size="sm" 
                          variant="outline"
                          onClick={() => recallCrew(crew.id)}
                        >
                          <XCircle className="w-4 h-4 mr-2" />
                          Recall
                        </Button>
                      )}
                      <Button size="sm" variant="outline">
                        <MapPin className="w-4 h-4 mr-2" />
                        Track
                      </Button>
                      <Button size="sm" variant="outline">
                        <Phone className="w-4 h-4 mr-2" />
                        Contact
                      </Button>
                      <Button size="sm" variant="outline">
                        <MoreVertical className="w-4 h-4" />
                      </Button>
                    </div>
                  </Card>
                ))}
              </div>
            )}

            {!isLoading && crews.length === 0 && (
              <div className="text-center py-12">
                <Users className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
                <h3 className="text-lg font-semibold mb-2">No crews available</h3>
                <p className="text-muted-foreground">Create your first crew to start workforce management</p>
              </div>
            )}
          </Card>
        </TabsContent>

        {/* Active Deployment Tab */}
        <TabsContent value="deployment" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Live Deployment Map */}
            <Card className="glass-card p-6">
              <h3 className="text-lg font-semibold mb-4">Live Deployment Map</h3>
              <div className="aspect-video bg-muted/10 rounded-lg relative border border-glass-border overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-br from-slate-900 to-slate-800">
                  <div className="absolute inset-0 opacity-20">
                    <svg width="100%" height="100%">
                      <defs>
                        <pattern id="deployment-grid" width="20" height="20" patternUnits="userSpaceOnUse">
                          <path d="M 20 0 L 0 0 0 20" fill="none" stroke="currentColor" strokeWidth="0.3"/>
                        </pattern>
                      </defs>
                      <rect width="100%" height="100%" fill="url(#deployment-grid)" />
                    </svg>
                  </div>
                </div>
                
                {/* Crew Markers */}
                {crews.filter(crew => crew.status === 'active').map((crew, index) => (
                  <div 
                    key={crew.id}
                    className="absolute w-4 h-4 bg-success rounded-full animate-pulse border-2 border-background"
                    style={{
                      left: `${20 + index * 25}%`,
                      top: `${30 + index * 15}%`
                    }}
                  >
                    <div className="absolute -top-8 left-1/2 transform -translate-x-1/2 bg-background/90 text-xs px-2 py-1 rounded whitespace-nowrap">
                      {crew.crew_name}
                    </div>
                  </div>
                ))}
                
                <div className="absolute inset-0 flex items-center justify-center bg-background/10">
                  <div className="text-center">
                    <Navigation className="w-12 h-12 text-primary mx-auto mb-2" />
                    <p className="text-foreground font-medium">Real-Time Crew Tracking</p>
                    <p className="text-sm text-muted-foreground mt-1">
                      {crews.filter(crew => crew.status === 'active').length} crews deployed
                    </p>
                  </div>
                </div>
              </div>
            </Card>

            {/* Active Crews Status */}
            <Card className="glass-card p-6">
              <h3 className="text-lg font-semibold mb-4">Active Crews Status</h3>
              <div className="space-y-4">
                {crews.filter(crew => crew.status === 'active').map((crew) => (
                  <div key={crew.id} className="p-4 bg-muted/10 rounded-lg border border-glass-border">
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-2">
                        <div className="w-3 h-3 bg-success rounded-full animate-pulse"></div>
                        <span className="font-medium">{crew.crew_name}</span>
                      </div>
                      <Badge variant="default" className="text-xs">Active</Badge>
                    </div>
                    
                    {crew.current_project && (
                      <p className="text-sm text-muted-foreground mb-2">
                        📍 {crew.current_project.project_name}
                      </p>
                    )}
                    
                    <div className="grid grid-cols-2 gap-4 text-xs">
                      <div>
                        <span className="text-muted-foreground">Team Size:</span>
                        <span className="ml-1 font-medium">{crew.members.length}</span>
                      </div>
                      <div>
                        <span className="text-muted-foreground">Duration:</span>
                        <span className="ml-1 font-medium">
                          {crew.active_session ? 
                            Math.floor((Date.now() - new Date(crew.active_session.start_time).getTime()) / 3600000) + 'h' :
                            'N/A'
                          }
                        </span>
                      </div>
                    </div>
                    
                    <div className="flex gap-2 mt-3">
                      <Button size="sm" variant="outline" className="flex-1">
                        <Phone className="w-3 h-3 mr-1" />
                        Contact
                      </Button>
                      <Button size="sm" variant="outline" className="flex-1">
                        <MapPin className="w-3 h-3 mr-1" />
                        Track
                      </Button>
                    </div>
                  </div>
                ))}
                
                {crews.filter(crew => crew.status === 'active').length === 0 && (
                  <div className="text-center py-8">
                    <Activity className="w-12 h-12 text-muted-foreground mx-auto mb-3" />
                    <p className="text-muted-foreground">No crews currently deployed</p>
                  </div>
                )}
              </div>
            </Card>
          </div>
        </TabsContent>

        {/* Task Management Tab */}
        <TabsContent value="tasks" className="space-y-6">
          <Card className="glass-elevated p-6">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-xl font-semibold">Task Management</h3>
              <Button className="glow-primary">
                <Plus className="w-4 h-4 mr-2" />
                Create Task
              </Button>
            </div>

            <div className="space-y-4">
              {tasks.map((task) => (
                <Card key={task.id} className="glass-card p-4">
                  <div className="flex items-start justify-between mb-3">
                    <div>
                      <div className="flex items-center gap-2 mb-1">
                        <h4 className="font-semibold">{task.title}</h4>
                        <Badge 
                          variant="outline" 
                          className={`text-xs ${getPriorityColor(task.priority)}`}
                        >
                          {task.priority}
                        </Badge>
                      </div>
                      <p className="text-sm text-muted-foreground mb-2">{task.description}</p>
                      <div className="flex items-center gap-4 text-xs text-muted-foreground">
                        <span>📍 {task.location}</span>
                        <span>⏱️ {task.estimated_hours}h estimated</span>
                        <span>📅 Due: {new Date(task.due_date).toLocaleDateString()}</span>
                      </div>
                    </div>
                    
                    <Badge 
                      variant={task.status === 'completed' ? 'default' : 'outline'}
                      className={getTaskStatusColor(task.status)}
                    >
                      {task.status.replace('_', ' ')}
                    </Badge>
                  </div>
                  
                  {task.actual_hours && (
                    <div className="mb-3">
                      <div className="flex justify-between items-center mb-1">
                        <span className="text-sm text-muted-foreground">Progress</span>
                        <span className="text-sm font-medium">
                          {task.actual_hours}h / {task.estimated_hours}h
                        </span>
                      </div>
                      <Progress 
                        value={(task.actual_hours / task.estimated_hours) * 100} 
                        className="h-2" 
                      />
                    </div>
                  )}
                  
                  <div className="flex gap-2">
                    <Button size="sm" variant="outline">
                      <CheckCircle className="w-4 h-4 mr-2" />
                      Complete
                    </Button>
                    <Button size="sm" variant="outline">
                      <Users className="w-4 h-4 mr-2" />
                      Reassign
                    </Button>
                    <Button size="sm" variant="outline">
                      <MoreVertical className="w-4 h-4" />
                    </Button>
                  </div>
                </Card>
              ))}
            </div>
          </Card>
        </TabsContent>

        {/* Schedule Tab */}
        <TabsContent value="schedule" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Calendar */}
            <Card className="glass-card p-6">
              <h3 className="text-lg font-semibold mb-4">Schedule Calendar</h3>
              <Calendar
                mode="single"
                selected={selectedDate}
                onSelect={setSelectedDate}
                className="rounded-md border border-glass-border"
              />
            </Card>

            {/* Daily Schedule */}
            <Card className="glass-card p-6 lg:col-span-2">
              <h3 className="text-lg font-semibold mb-4">
                Daily Schedule - {selectedDate ? format(selectedDate, 'MMMM dd, yyyy') : 'Today'}
              </h3>
              
              <div className="space-y-4">
                <div className="p-4 bg-muted/10 rounded-lg border border-glass-border">
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <div className="w-3 h-3 bg-primary rounded-full"></div>
                      <span className="font-medium">Morning Shift - Highway Crew</span>
                    </div>
                    <span className="text-sm text-muted-foreground">6:00 AM - 2:00 PM</span>
                  </div>
                  <p className="text-sm text-muted-foreground">Highway 101 resurfacing project</p>
                </div>
                
                <div className="p-4 bg-muted/10 rounded-lg border border-glass-border">
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <div className="w-3 h-3 bg-success rounded-full"></div>
                      <span className="font-medium">Day Shift - Parking Lot Team</span>
                    </div>
                    <span className="text-sm text-muted-foreground">8:00 AM - 4:00 PM</span>
                  </div>
                  <p className="text-sm text-muted-foreground">Commercial parking lot repair</p>
                </div>
                
                <div className="p-4 bg-muted/10 rounded-lg border border-glass-border">
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <div className="w-3 h-3 bg-warning rounded-full"></div>
                      <span className="font-medium">Emergency Response</span>
                    </div>
                    <span className="text-sm text-muted-foreground">On Call</span>
                  </div>
                  <p className="text-sm text-muted-foreground">Standby for emergency repairs</p>
                </div>
              </div>
            </Card>
          </div>
        </TabsContent>
      </Tabs>

      {isLoading && (
        <div className="flex items-center justify-center py-24">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
            <p className="text-muted-foreground">Loading crew deployment data...</p>
          </div>
        </div>
      )}
    </div>
  );
};

export default CrewDeployment;