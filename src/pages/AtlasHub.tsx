import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card } from '@/components/ui/card';
import { 
  Mountain, 
  Database, 
  BarChart3,
  MapPin,
  Settings,
  Upload,
  Download,
  Activity,
  Layers,
  Calculator
} from 'lucide-react';
import TerrainMapper from '@/components/atlas-hub/TerrainMapper';
import { api } from '@/services/api';
import { Project, AtlasPointCloud } from '@/types/database';

const AtlasHub: React.FC = () => {
  const [projects, setProjects] = useState<Project[]>([]);
  const [selectedProject, setSelectedProject] = useState<string>('');
  const [pointClouds, setPointClouds] = useState<AtlasPointCloud[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('mapper');

  useEffect(() => {
    loadProjects();
  }, []);

  useEffect(() => {
    if (selectedProject) {
      loadProjectPointClouds();
    }
  }, [selectedProject]);

  const loadProjects = async () => {
    try {
      setIsLoading(true);
      const response = await api.projects.getAll();
      if (response.success) {
        setProjects(response.data);
        if (response.data.length > 0) {
          setSelectedProject(response.data[0].id);
        }
      }
    } catch (error) {
      console.error('Failed to load projects:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const loadProjectPointClouds = async () => {
    if (!selectedProject) return;
    
    try {
      const response = await api.atlas.getProjectPointClouds(selectedProject);
      if (response.success) {
        setPointClouds(response.data);
      }
    } catch (error) {
      console.error('Failed to load point clouds:', error);
    }
  };

  const getProcessingStatusColor = (status: string) => {
    switch (status) {
      case 'completed': return 'text-success';
      case 'processing': return 'text-warning';
      case 'failed': return 'text-destructive';
      default: return 'text-muted-foreground';
    }
  };

  const getProcessingStatusBadge = (status: string) => {
    switch (status) {
      case 'completed': return 'default';
      case 'processing': return 'secondary';
      case 'failed': return 'destructive';
      default: return 'outline';
    }
  };

  return (
    <div className="min-h-screen bg-background p-6">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-4xl font-bold text-glow-primary mb-2">
              ATLAS HUB
            </h1>
            <p className="text-muted-foreground text-lg">
              Advanced Terrain Mapping & Point Cloud Analysis // {new Date().toLocaleDateString('en-US', { 
                weekday: 'long', 
                year: 'numeric', 
                month: 'long', 
                day: 'numeric' 
              })}
            </p>
          </div>
          
          <div className="flex items-center gap-4">
            <Badge variant="outline" className="glass-card text-accent">
              <Database className="w-4 h-4 mr-2" />
              Cloud Processing
            </Badge>
            <Badge variant="outline" className="glass-card text-success">
              <Mountain className="w-4 h-4 mr-2" />
              3D Analysis Ready
            </Badge>
            <Button
              variant="outline"
              className="glass-card"
            >
              <Settings className="w-4 h-4 mr-2" />
              Settings
            </Button>
          </div>
        </div>

        {/* Project Selection */}
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2">
            <MapPin className="w-4 h-4 text-muted-foreground" />
            <span className="text-sm font-medium">Project:</span>
          </div>
          <Select value={selectedProject} onValueChange={setSelectedProject}>
            <SelectTrigger className="w-80 glass-card">
              <SelectValue placeholder="Select a project" />
            </SelectTrigger>
            <SelectContent>
              {projects.map((project) => (
                <SelectItem key={project.id} value={project.id}>
                  <div className="flex items-center gap-2">
                    <span>{project.project_name}</span>
                    <Badge variant="outline" className="text-xs">
                      {project.project_type}
                    </Badge>
                  </div>
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          
          <div className="ml-auto flex items-center gap-4 text-sm text-muted-foreground">
            <div className="flex items-center gap-2">
              <Layers className="w-4 h-4" />
              <span>{pointClouds.length} Point Clouds</span>
            </div>
            <div className="flex items-center gap-2">
              <BarChart3 className="w-4 h-4" />
              <span>Processing Ready</span>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      {!isLoading && (
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="mapper" className="flex items-center gap-2">
              <Mountain className="w-4 h-4" />
              Terrain Mapper
            </TabsTrigger>
            <TabsTrigger value="data" className="flex items-center gap-2">
              <Database className="w-4 h-4" />
              Point Cloud Data
            </TabsTrigger>
            <TabsTrigger value="analysis" className="flex items-center gap-2">
              <Calculator className="w-4 h-4" />
              Analysis Results
            </TabsTrigger>
          </TabsList>

          {/* Terrain Mapper Tab */}
          <TabsContent value="mapper" className="space-y-6">
            <TerrainMapper 
              projectId={selectedProject}
              className="w-full"
            />
          </TabsContent>

          {/* Point Cloud Data Tab */}
          <TabsContent value="data" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Upload Section */}
              <Card className="glass-card p-6">
                <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                  <Upload className="w-5 h-5" />
                  Upload Point Cloud Data
                </h3>
                
                <div className="space-y-4">
                  <div className="border-2 border-dashed border-glass-border rounded-lg p-8 text-center">
                    <Database className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                    <p className="text-muted-foreground mb-2">Drop files here or click to browse</p>
                    <p className="text-sm text-muted-foreground">
                      Supports: .LAS, .LAZ, .XYZ, .PLY, .PCD files
                    </p>
                    <Button className="mt-4">
                      <Upload className="w-4 h-4 mr-2" />
                      Choose Files
                    </Button>
                  </div>
                  
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <span className="text-muted-foreground">Max file size:</span>
                      <span className="ml-1 font-medium">500 MB</span>
                    </div>
                    <div>
                      <span className="text-muted-foreground">Processing time:</span>
                      <span className="ml-1 font-medium">2-10 minutes</span>
                    </div>
                  </div>
                </div>
              </Card>

              {/* Processing Queue */}
              <Card className="glass-card p-6">
                <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                  <Activity className="w-5 h-5" />
                  Processing Queue
                </h3>
                
                <div className="space-y-3">
                  <div className="p-3 bg-muted/10 rounded-lg border border-glass-border">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm font-medium">site_survey_001.las</span>
                      <Badge variant="secondary" className="text-xs">Processing</Badge>
                    </div>
                    <div className="w-full bg-muted rounded-full h-2">
                      <div className="bg-primary h-2 rounded-full" style={{ width: '65%' }}></div>
                    </div>
                    <p className="text-xs text-muted-foreground mt-1">Generating elevation model...</p>
                  </div>
                  
                  <div className="p-3 bg-muted/10 rounded-lg border border-glass-border">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm font-medium">terrain_scan_002.xyz</span>
                      <Badge variant="outline" className="text-xs">Queued</Badge>
                    </div>
                    <p className="text-xs text-muted-foreground">Waiting for processing...</p>
                  </div>
                </div>
              </Card>

              {/* Point Cloud Library */}
              <Card className="glass-card p-6 lg:col-span-2">
                <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                  <Database className="w-5 h-5" />
                  Point Cloud Library
                </h3>
                
                {pointClouds.length > 0 ? (
                  <div className="space-y-3">
                    {pointClouds.map((cloud) => (
                      <div key={cloud.id} className="p-4 border border-glass-border rounded-lg">
                        <div className="flex items-start justify-between mb-2">
                          <div>
                            <div className="font-medium">
                              {cloud.point_cloud_file_url.split('/').pop()}
                            </div>
                            <div className="text-sm text-muted-foreground">
                              Captured: {new Date(cloud.capture_timestamp).toLocaleString()}
                            </div>
                          </div>
                          <Badge variant={getProcessingStatusBadge(cloud.processing_status) as any}>
                            {cloud.processing_status}
                          </Badge>
                        </div>
                        
                        {cloud.elevation_data && (
                          <div className="grid grid-cols-3 gap-4 text-sm mt-3">
                            <div>
                              <span className="text-muted-foreground">Min Elevation:</span>
                              <span className="ml-1 font-medium">
                                {typeof cloud.elevation_data === 'object' && 'min' in cloud.elevation_data
                                  ? `${cloud.elevation_data.min}ft`
                                  : 'N/A'
                                }
                              </span>
                            </div>
                            <div>
                              <span className="text-muted-foreground">Max Elevation:</span>
                              <span className="ml-1 font-medium">
                                {typeof cloud.elevation_data === 'object' && 'max' in cloud.elevation_data
                                  ? `${cloud.elevation_data.max}ft`
                                  : 'N/A'
                                }
                              </span>
                            </div>
                            <div>
                              <span className="text-muted-foreground">Avg Elevation:</span>
                              <span className="ml-1 font-medium">
                                {typeof cloud.elevation_data === 'object' && 'average' in cloud.elevation_data
                                  ? `${cloud.elevation_data.average}ft`
                                  : 'N/A'
                                }
                              </span>
                            </div>
                          </div>
                        )}
                        
                        <div className="flex gap-2 mt-3">
                          <Button size="sm" variant="outline">
                            <Mountain className="w-4 h-4 mr-2" />
                            View 3D
                          </Button>
                          <Button size="sm" variant="outline">
                            <Download className="w-4 h-4 mr-2" />
                            Download
                          </Button>
                          <Button size="sm" variant="outline">
                            <Calculator className="w-4 h-4 mr-2" />
                            Analyze
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <Database className="w-12 h-12 text-muted-foreground mx-auto mb-3" />
                    <p className="text-muted-foreground">No point cloud data available</p>
                    <p className="text-sm text-muted-foreground mt-1">Upload files to get started</p>
                  </div>
                )}
              </Card>
            </div>
          </TabsContent>

          {/* Analysis Results Tab */}
          <TabsContent value="analysis" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Terrain Statistics */}
              <Card className="glass-card p-6">
                <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                  <BarChart3 className="w-5 h-5" />
                  Terrain Statistics
                </h3>
                
                <div className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="text-center p-3 bg-muted/10 rounded-lg">
                      <div className="text-2xl font-bold text-primary">187.8ft</div>
                      <div className="text-sm text-muted-foreground">Max Elevation</div>
                    </div>
                    <div className="text-center p-3 bg-muted/10 rounded-lg">
                      <div className="text-2xl font-bold text-accent">145.2ft</div>
                      <div className="text-sm text-muted-foreground">Min Elevation</div>
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-2 gap-4">
                    <div className="text-center p-3 bg-muted/10 rounded-lg">
                      <div className="text-2xl font-bold text-success">12,847ft²</div>
                      <div className="text-sm text-muted-foreground">Total Area</div>
                    </div>
                    <div className="text-center p-3 bg-muted/10 rounded-lg">
                      <div className="text-2xl font-bold text-warning">4.2%</div>
                      <div className="text-sm text-muted-foreground">Avg Slope</div>
                    </div>
                  </div>
                </div>
              </Card>

              {/* Volume Analysis */}
              <Card className="glass-card p-6">
                <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                  <Calculator className="w-5 h-5" />
                  Volume Analysis
                </h3>
                
                <div className="space-y-4">
                  <div className="flex justify-between items-center p-3 bg-destructive/10 rounded-lg">
                    <span className="text-sm font-medium">Cut Volume</span>
                    <span className="text-lg font-bold text-destructive">2,847.6 ft³</span>
                  </div>
                  
                  <div className="flex justify-between items-center p-3 bg-success/10 rounded-lg">
                    <span className="text-sm font-medium">Fill Volume</span>
                    <span className="text-lg font-bold text-success">3,156.2 ft³</span>
                  </div>
                  
                  <div className="flex justify-between items-center p-3 bg-muted/10 rounded-lg">
                    <span className="text-sm font-medium">Net Volume</span>
                    <span className="text-lg font-bold text-success">+308.6 ft³</span>
                  </div>
                  
                  <div className="pt-3 border-t border-glass-border">
                    <div className="text-sm text-muted-foreground">
                      Positive net volume indicates excess fill material
                    </div>
                  </div>
                </div>
              </Card>

              {/* Historical Analysis */}
              <Card className="glass-card p-6 lg:col-span-2">
                <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                  <Activity className="w-5 h-5" />
                  Analysis History
                </h3>
                
                <div className="space-y-3">
                  <div className="p-4 border border-glass-border rounded-lg">
                    <div className="flex items-start justify-between mb-2">
                      <div>
                        <div className="font-medium">Pre-Construction Survey</div>
                        <div className="text-sm text-muted-foreground">
                          January 15, 2024 • Baseline terrain analysis
                        </div>
                      </div>
                      <Badge variant="default">Complete</Badge>
                    </div>
                    <div className="grid grid-cols-4 gap-4 text-sm mt-3">
                      <div>
                        <span className="text-muted-foreground">Area:</span>
                        <span className="ml-1 font-medium">12,847 ft²</span>
                      </div>
                      <div>
                        <span className="text-muted-foreground">Avg Elevation:</span>
                        <span className="ml-1 font-medium">166.5 ft</span>
                      </div>
                      <div>
                        <span className="text-muted-foreground">Volume:</span>
                        <span className="ml-1 font-medium">0 ft³</span>
                      </div>
                      <div>
                        <span className="text-muted-foreground">Points:</span>
                        <span className="ml-1 font-medium">2.3M</span>
                      </div>
                    </div>
                  </div>
                  
                  <div className="p-4 border border-glass-border rounded-lg">
                    <div className="flex items-start justify-between mb-2">
                      <div>
                        <div className="font-medium">Progress Survey #1</div>
                        <div className="text-sm text-muted-foreground">
                          February 28, 2024 • Mid-construction progress
                        </div>
                      </div>
                      <Badge variant="default">Complete</Badge>
                    </div>
                    <div className="grid grid-cols-4 gap-4 text-sm mt-3">
                      <div>
                        <span className="text-muted-foreground">Area:</span>
                        <span className="ml-1 font-medium">12,847 ft²</span>
                      </div>
                      <div>
                        <span className="text-muted-foreground">Avg Elevation:</span>
                        <span className="ml-1 font-medium">168.2 ft</span>
                      </div>
                      <div>
                        <span className="text-muted-foreground">Volume:</span>
                        <span className="ml-1 font-medium text-success">+1,247 ft³</span>
                      </div>
                      <div>
                        <span className="text-muted-foreground">Points:</span>
                        <span className="ml-1 font-medium">2.1M</span>
                      </div>
                    </div>
                  </div>
                </div>
              </Card>
            </div>
          </TabsContent>
        </Tabs>
      )}

      {isLoading && (
        <div className="flex items-center justify-center py-24">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
            <p className="text-muted-foreground">Loading Atlas Hub...</p>
          </div>
        </div>
      )}
    </div>
  );
};

export default AtlasHub;