import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { 
  Scan, 
  Brain, 
  Camera, 
  BarChart3,
  MapPin,
  Settings
} from 'lucide-react';
import PavementScanInterface from '@/components/pavement-scan/PavementScanInterface';
import { api } from '@/services/api';
import { Project } from '@/types/database';

const PavementScan: React.FC = () => {
  const [projects, setProjects] = useState<Project[]>([]);
  const [selectedProject, setSelectedProject] = useState<string>('');
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadProjects();
  }, []);

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

  return (
    <div className="min-h-screen bg-background p-6">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-4xl font-bold text-glow-primary mb-2">
              PAVEMENTSCAN PRO
            </h1>
            <p className="text-muted-foreground text-lg">
              AI-Powered Surface Analysis & Quality Assessment // {new Date().toLocaleDateString('en-US', { 
                weekday: 'long', 
                year: 'numeric', 
                month: 'long', 
                day: 'numeric' 
              })}
            </p>
          </div>
          
          <div className="flex items-center gap-4">
            <Badge variant="outline" className="glass-card text-accent">
              <Brain className="w-4 h-4 mr-2" />
              AI Analysis Ready
            </Badge>
            <Badge variant="outline" className="glass-card text-success">
              <Camera className="w-4 h-4 mr-2" />
              Camera Available
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
              <Scan className="w-4 h-4" />
              <span>Ready for Analysis</span>
            </div>
            <div className="flex items-center gap-2">
              <BarChart3 className="w-4 h-4" />
              <span>AI Confidence: 95%</span>
            </div>
          </div>
        </div>
      </div>

      {/* Main Interface */}
      {!isLoading && (
        <PavementScanInterface 
          projectId={selectedProject}
          className="w-full"
        />
      )}

      {isLoading && (
        <div className="flex items-center justify-center py-24">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
            <p className="text-muted-foreground">Loading PavementScan Pro...</p>
          </div>
        </div>
      )}
    </div>
  );
};

export default PavementScan;