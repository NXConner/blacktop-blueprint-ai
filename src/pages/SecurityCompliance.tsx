import React, { useState, useEffect } from 'react';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { 
  Shield,
  Lock,
  AlertTriangle,
  CheckCircle,
  Eye,
  Settings,
  Activity,
  Users,
  Key,
  Database,
  Network,
  Clock,
  FileText,
  Scan,
  TrendingUp,
  Target,
  RefreshCw,
  Download,
  Archive,
  Globe,
  Server,
  Fingerprint
} from 'lucide-react';
import SecurityCenter from '@/components/security/SecurityCenter';

const SecurityCompliance: React.FC = () => {
  const [systemStatus, setSystemStatus] = useState({
    threat_level: 'low',
    security_posture: 'strong',
    compliance_status: 'compliant',
    incident_count: 0,
    last_scan: new Date().toISOString(),
    firewall_status: 'active',
    encryption_status: 'enabled',
    backup_integrity: 0
  });

  const [securityOverview, setSecurityOverview] = useState({
    protected_assets: 0,
    security_controls: 0,
    compliance_frameworks: 0,
    active_policies: 0,
    monitored_endpoints: 0,
    security_events: 0
  });

  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadSystemData();
  }, []);

  const loadSystemData = async () => {
    try {
      setIsLoading(true);

      // Simulate loading security overview
      setSystemStatus({
        threat_level: Math.random() > 0.9 ? 'high' : Math.random() > 0.7 ? 'medium' : 'low',
        security_posture: Math.random() > 0.8 ? 'strong' : 'moderate',
        compliance_status: Math.random() > 0.9 ? 'non_compliant' : 'compliant',
        incident_count: Math.floor(Math.random() * 3),
        last_scan: new Date(Date.now() - Math.random() * 3600000).toISOString(),
        firewall_status: 'active',
        encryption_status: 'enabled',
        backup_integrity: 95 + Math.random() * 5
      });

      // Simulate security metrics
      setSecurityOverview({
        protected_assets: 2847 + Math.floor(Math.random() * 500),
        security_controls: 127 + Math.floor(Math.random() * 50),
        compliance_frameworks: 6,
        active_policies: 89 + Math.floor(Math.random() * 20),
        monitored_endpoints: 156 + Math.floor(Math.random() * 50),
        security_events: 4728 + Math.floor(Math.random() * 1000)
      });

    } catch (error) {
      console.error('Failed to load security data:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const getThreatLevelColor = (level: string) => {
    switch (level) {
      case 'critical': return 'text-destructive';
      case 'high': return 'text-orange-500';
      case 'medium': return 'text-warning';
      case 'low': return 'text-success';
      default: return 'text-muted-foreground';
    }
  };

  const getThreatLevelBadge = (level: string) => {
    switch (level) {
      case 'critical': return 'destructive';
      case 'high': return 'secondary';
      case 'medium': return 'outline';
      case 'low': return 'default';
      default: return 'outline';
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'strong': case 'compliant': case 'active': case 'enabled': return 'text-success';
      case 'moderate': case 'partial': return 'text-warning';
      case 'weak': case 'non_compliant': case 'inactive': case 'disabled': return 'text-destructive';
      default: return 'text-muted-foreground';
    }
  };

  const formatNumber = (num: number) => {
    if (num >= 1000) {
      return (num / 1000).toFixed(1) + 'K';
    }
    return num.toString();
  };

  const securityCapabilities = [
    {
      icon: <Shield className="w-5 h-5" />,
      title: 'Advanced Threat Protection',
      description: 'Multi-layered security with real-time threat detection and response',
      metrics: { protected: '2.8K', uptime: '99.9%' }
    },
    {
      icon: <Lock className="w-5 h-5" />,
      title: 'Data Encryption',
      description: 'End-to-end encryption with AES-256 for data at rest and in transit',
      metrics: { encrypted: '100%', strength: 'AES-256' }
    },
    {
      icon: <Eye className="w-5 h-5" />,
      title: 'Security Monitoring',
      description: '24/7 monitoring with AI-powered anomaly detection',
      metrics: { events: '4.7K', response: '< 5min' }
    },
    {
      icon: <Users className="w-5 h-5" />,
      title: 'Access Control',
      description: 'Role-based access control with multi-factor authentication',
      metrics: { users: '156', policies: '89' }
    },
    {
      icon: <FileText className="w-5 h-5" />,
      title: 'Compliance Management',
      description: 'Automated compliance monitoring across 6 major frameworks',
      metrics: { frameworks: '6', compliance: '91%' }
    },
    {
      icon: <Archive className="w-5 h-5" />,
      title: 'Backup & Recovery',
      description: 'Automated backups with disaster recovery capabilities',
      metrics: { integrity: '98%', rto: '< 4hrs' }
    }
  ];

  const complianceFrameworks = [
    { name: 'ISO 27001', status: 'compliant', score: 94 },
    { name: 'SOC 2', status: 'compliant', score: 89 },
    { name: 'GDPR', status: 'compliant', score: 96 },
    { name: 'NIST', status: 'partial', score: 78 },
    { name: 'PCI DSS', status: 'compliant', score: 91 },
    { name: 'HIPAA', status: 'compliant', score: 88 }
  ];

  return (
    <div className="min-h-screen bg-background p-6">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-4xl font-bold text-glow-primary mb-2">
              SECURITY & COMPLIANCE CENTER
            </h1>
            <p className="text-muted-foreground text-lg">
              Enterprise-Grade Security & Regulatory Compliance Management // {new Date().toLocaleDateString('en-US', { 
                weekday: 'long', 
                year: 'numeric', 
                month: 'long', 
                day: 'numeric' 
              })}
            </p>
          </div>
          
          <div className="flex items-center gap-4">
            <Badge variant={getThreatLevelBadge(systemStatus.threat_level) as any} className={`glass-card ${getThreatLevelColor(systemStatus.threat_level)}`}>
              <AlertTriangle className="w-4 h-4 mr-2" />
              Threat Level: {systemStatus.threat_level.toUpperCase()}
            </Badge>
            <Badge variant="outline" className={`glass-card ${getStatusColor(systemStatus.security_posture)}`}>
              <Shield className="w-4 h-4 mr-2" />
              Security: {systemStatus.security_posture.toUpperCase()}
            </Badge>
            <Badge variant="outline" className={`glass-card ${getStatusColor(systemStatus.compliance_status)}`}>
              <CheckCircle className="w-4 h-4 mr-2" />
              Compliance: {systemStatus.compliance_status.toUpperCase()}
            </Badge>
            <Button variant="outline" className="glass-card">
              <Settings className="w-4 h-4 mr-2" />
              Security Settings
            </Button>
          </div>
        </div>

        {/* Security Overview Cards */}
        <div className="grid grid-cols-1 md:grid-cols-6 gap-4 mb-6">
          <Card className="glass-card p-4">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium text-muted-foreground">Protected Assets</span>
              <Database className="w-4 h-4 text-primary" />
            </div>
            <p className="text-2xl font-bold text-primary">{formatNumber(securityOverview.protected_assets)}</p>
            <span className="text-xs text-muted-foreground">Systems & data</span>
          </Card>

          <Card className="glass-card p-4">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium text-muted-foreground">Security Controls</span>
              <Shield className="w-4 h-4 text-success" />
            </div>
            <p className="text-2xl font-bold text-success">{securityOverview.security_controls}</p>
            <span className="text-xs text-muted-foreground">Active controls</span>
          </Card>

          <Card className="glass-card p-4">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium text-muted-foreground">Compliance</span>
              <CheckCircle className="w-4 h-4 text-accent" />
            </div>
            <p className="text-2xl font-bold text-accent">{securityOverview.compliance_frameworks}</p>
            <span className="text-xs text-muted-foreground">Frameworks</span>
          </Card>

          <Card className="glass-card p-4">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium text-muted-foreground">Active Policies</span>
              <FileText className="w-4 h-4 text-warning" />
            </div>
            <p className="text-2xl font-bold text-warning">{securityOverview.active_policies}</p>
            <span className="text-xs text-muted-foreground">Security policies</span>
          </Card>

          <Card className="glass-card p-4">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium text-muted-foreground">Endpoints</span>
              <Network className="w-4 h-4 text-primary" />
            </div>
            <p className="text-2xl font-bold text-primary">{securityOverview.monitored_endpoints}</p>
            <span className="text-xs text-muted-foreground">Monitored</span>
          </Card>

          <Card className="glass-card p-4">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium text-muted-foreground">Security Events</span>
              <Activity className="w-4 h-4 text-muted-foreground" />
            </div>
            <p className="text-2xl font-bold">{formatNumber(securityOverview.security_events)}</p>
            <span className="text-xs text-muted-foreground">Last 30 days</span>
          </Card>
        </div>

        {/* System Security Status */}
        <Card className="glass-card p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold">System Security Status</h3>
            <div className="flex items-center gap-2">
              <span className="text-sm text-muted-foreground">
                Last scan: {new Date(systemStatus.last_scan).toLocaleTimeString()}
              </span>
              <Button size="sm" variant="outline" className="glass-card">
                <RefreshCw className="w-3 h-3 mr-1" />
                Refresh
              </Button>
            </div>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            <div>
              <h4 className="font-medium mb-3">Core Security</h4>
              <div className="space-y-2 text-sm">
                <div className="flex items-center gap-2">
                  <CheckCircle className="w-3 h-3 text-success" />
                  <span>Firewall: {systemStatus.firewall_status}</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle className="w-3 h-3 text-success" />
                  <span>Encryption: {systemStatus.encryption_status}</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle className="w-3 h-3 text-success" />
                  <span>Intrusion Detection: Active</span>
                </div>
                <div className="flex items-center gap-2">
                  <Activity className="w-3 h-3 text-primary animate-pulse" />
                  <span>Threat Monitoring: Running</span>
                </div>
              </div>
            </div>

            <div>
              <h4 className="font-medium mb-3">Access Security</h4>
              <div className="space-y-2 text-sm">
                <div className="flex items-center gap-2">
                  <CheckCircle className="w-3 h-3 text-success" />
                  <span>Multi-Factor Auth: Enabled</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle className="w-3 h-3 text-success" />
                  <span>Role-Based Access: Active</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle className="w-3 h-3 text-success" />
                  <span>Session Management: Secure</span>
                </div>
                <div className="flex items-center gap-2">
                  <Eye className="w-3 h-3 text-primary" />
                  <span>Access Monitoring: Active</span>
                </div>
              </div>
            </div>

            <div>
              <h4 className="font-medium mb-3">Data Protection</h4>
              <div className="space-y-2 text-sm">
                <div className="flex items-center gap-2">
                  <CheckCircle className="w-3 h-3 text-success" />
                  <span>Data Encryption: AES-256</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle className="w-3 h-3 text-success" />
                  <span>Backup Status: Complete</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle className="w-3 h-3 text-success" />
                  <span>Data Loss Prevention: Active</span>
                </div>
                <div className="flex items-center gap-2">
                  <Archive className="w-3 h-3 text-primary" />
                  <span>Backup Integrity: {systemStatus.backup_integrity.toFixed(1)}%</span>
                </div>
              </div>
            </div>

            <div>
              <h4 className="font-medium mb-3">Compliance Status</h4>
              <div className="space-y-2 text-sm">
                <div className="flex items-center gap-2">
                  <CheckCircle className="w-3 h-3 text-success" />
                  <span>ISO 27001: Compliant</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle className="w-3 h-3 text-success" />
                  <span>GDPR: Compliant</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle className="w-3 h-3 text-success" />
                  <span>SOC 2: Compliant</span>
                </div>
                <div className="flex items-center gap-2">
                  <Clock className="w-3 h-3 text-warning" />
                  <span>Next Audit: 45 days</span>
                </div>
              </div>
            </div>
          </div>
        </Card>
      </div>

      {/* Security Capabilities Overview */}
      <Card className="glass-card p-6 mb-8">
        <h2 className="text-2xl font-semibold mb-6 flex items-center gap-3">
          <Shield className="w-6 h-6 text-primary" />
          Security Capabilities Overview
        </h2>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {securityCapabilities.map((capability, index) => (
            <Card key={index} className="glass-elevated p-4">
              <div className="flex items-center gap-3 mb-3">
                <div className="w-10 h-10 bg-primary/20 rounded-lg flex items-center justify-center">
                  {capability.icon}
                </div>
                <div>
                  <h3 className="font-semibold">{capability.title}</h3>
                </div>
              </div>
              
              <p className="text-sm text-muted-foreground mb-4">{capability.description}</p>
              
              <div className="flex justify-between text-sm">
                {Object.entries(capability.metrics).map(([key, value], i) => (
                  <div key={i} className="text-center">
                    <div className="font-medium text-primary">{value}</div>
                    <div className="text-xs text-muted-foreground capitalize">{key}</div>
                  </div>
                ))}
              </div>
            </Card>
          ))}
        </div>
      </Card>

      {/* Compliance Frameworks */}
      <Card className="glass-card p-6 mb-8">
        <h2 className="text-xl font-semibold mb-4">Compliance Frameworks</h2>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {complianceFrameworks.map((framework, index) => (
            <Card key={index} className="glass-elevated p-4">
              <div className="flex items-center justify-between mb-3">
                <h3 className="font-semibold">{framework.name}</h3>
                <Badge 
                  variant={framework.status === 'compliant' ? 'default' : 'outline'}
                  className={framework.status === 'compliant' ? 'text-success' : 'text-warning'}
                >
                  {framework.status}
                </Badge>
              </div>
              
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Compliance Score</span>
                  <span className="font-medium">{framework.score}%</span>
                </div>
                <div className="w-full bg-muted rounded-full h-2">
                  <div 
                    className={`h-2 rounded-full ${
                      framework.score >= 90 ? 'bg-success' :
                      framework.score >= 80 ? 'bg-primary' :
                      framework.score >= 70 ? 'bg-warning' :
                      'bg-destructive'
                    }`}
                    style={{ width: `${framework.score}%` }}
                  ></div>
                </div>
              </div>
            </Card>
          ))}
        </div>
      </Card>

      {/* Main Security Center */}
      <SecurityCenter />

      {/* Security Insights */}
      <Card className="glass-card p-6 mt-8">
        <h2 className="text-xl font-semibold mb-4">Security Insights & Recommendations</h2>
        
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div>
            <h3 className="font-medium mb-3 flex items-center gap-2">
              <TrendingUp className="w-4 h-4 text-success" />
              Security Strengths
            </h3>
            <div className="space-y-3">
              <div className="p-3 bg-success/10 rounded-lg border border-success/20">
                <div className="flex items-center gap-2 mb-1">
                  <CheckCircle className="w-3 h-3 text-success" />
                  <span className="font-medium text-success">Strong Encryption</span>
                </div>
                <p className="text-sm">All data encrypted with AES-256 standards across all systems</p>
              </div>
              
              <div className="p-3 bg-primary/10 rounded-lg border border-primary/20">
                <div className="flex items-center gap-2 mb-1">
                  <Shield className="w-3 h-3 text-primary" />
                  <span className="font-medium text-primary">Robust Access Control</span>
                </div>
                <p className="text-sm">Multi-factor authentication with role-based permissions</p>
              </div>
              
              <div className="p-3 bg-accent/10 rounded-lg border border-accent/20">
                <div className="flex items-center gap-2 mb-1">
                  <Activity className="w-3 h-3 text-accent" />
                  <span className="font-medium text-accent">Continuous Monitoring</span>
                </div>
                <p className="text-sm">24/7 security monitoring with AI-powered threat detection</p>
              </div>
            </div>
          </div>

          <div>
            <h3 className="font-medium mb-3 flex items-center gap-2">
              <Target className="w-4 h-4 text-warning" />
              Security Recommendations
            </h3>
            <div className="space-y-3">
              <div className="p-3 bg-warning/10 rounded-lg border border-warning/20">
                <div className="flex items-center gap-2 mb-1">
                  <AlertTriangle className="w-3 h-3 text-warning" />
                  <span className="font-medium text-warning">Certificate Renewal</span>
                </div>
                <p className="text-sm">SSL certificate expires in 45 days - schedule renewal</p>
              </div>
              
              <div className="p-3 bg-primary/10 rounded-lg border border-primary/20">
                <div className="flex items-center gap-2 mb-1">
                  <Users className="w-3 h-3 text-primary" />
                  <span className="font-medium text-primary">Access Review</span>
                </div>
                <p className="text-sm">Quarterly access review due for administrative accounts</p>
              </div>
              
              <div className="p-3 bg-accent/10 rounded-lg border border-accent/20">
                <div className="flex items-center gap-2 mb-1">
                  <Scan className="w-3 h-3 text-accent" />
                  <span className="font-medium text-accent">Vulnerability Scan</span>
                </div>
                <p className="text-sm">Schedule next penetration testing for Q2 2024</p>
              </div>
              
              <div className="p-3 bg-success/10 rounded-lg border border-success/20">
                <div className="flex items-center gap-2 mb-1">
                  <FileText className="w-3 h-3 text-success" />
                  <span className="font-medium text-success">Policy Updates</span>
                </div>
                <p className="text-sm">Update security policies to align with new compliance requirements</p>
              </div>
            </div>
          </div>
        </div>
      </Card>

      {isLoading && (
        <div className="flex items-center justify-center py-24">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
            <p className="text-muted-foreground">Initializing security and compliance systems...</p>
          </div>
        </div>
      )}
    </div>
  );
};

export default SecurityCompliance;