import React, { useState, useEffect } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { 
  Shield,
  Lock,
  Eye,
  AlertTriangle,
  CheckCircle,
  XCircle,
  Clock,
  Users,
  Key,
  FileText,
  Activity,
  Settings,
  Scan,
  Database,
  Network,
  Smartphone,
  Globe,
  Server,
  Fingerprint,
  UserCheck,
  Bell,
  Download,
  Upload,
  RefreshCw,
  Search,
  Filter,
  Calendar,
  MapPin,
  Zap,
  Target,
  TrendingUp,
  BarChart3,
  Archive,
  Trash2,
  Edit,
  Copy
} from 'lucide-react';
import { api } from '@/services/api';

interface SecurityCenterProps {
  className?: string;
}

interface SecurityMetrics {
  security_score: number;
  compliance_rating: number;
  active_threats: number;
  blocked_attempts: number;
  vulnerabilities: number;
  last_audit: string;
  certificate_status: 'valid' | 'expiring' | 'expired';
  backup_status: 'complete' | 'running' | 'failed';
}

interface ThreatAlert {
  id: string;
  type: 'intrusion' | 'malware' | 'phishing' | 'data_breach' | 'dos' | 'insider';
  severity: 'critical' | 'high' | 'medium' | 'low';
  title: string;
  description: string;
  source_ip?: string;
  affected_systems: string[];
  detected_at: string;
  status: 'active' | 'investigating' | 'resolved' | 'false_positive';
  assigned_to?: string;
}

interface ComplianceItem {
  id: string;
  standard: 'ISO27001' | 'SOC2' | 'GDPR' | 'HIPAA' | 'PCI_DSS' | 'NIST';
  requirement: string;
  status: 'compliant' | 'non_compliant' | 'partial' | 'pending';
  last_checked: string;
  next_review: string;
  evidence_files: string[];
  responsible_party: string;
}

interface SecurityAudit {
  id: string;
  type: 'vulnerability' | 'penetration' | 'compliance' | 'access_review' | 'data_audit';
  title: string;
  status: 'scheduled' | 'in_progress' | 'completed' | 'cancelled';
  scheduled_date: string;
  completion_date?: string;
  auditor: string;
  findings_count: number;
  risk_level: 'critical' | 'high' | 'medium' | 'low';
}

interface AccessLog {
  id: string;
  user_id: string;
  user_name: string;
  action: 'login' | 'logout' | 'access_denied' | 'data_export' | 'admin_action';
  resource: string;
  ip_address: string;
  location: string;
  timestamp: string;
  success: boolean;
  risk_score: number;
}

const SecurityCenter: React.FC<SecurityCenterProps> = ({ 
  className = '' 
}) => {
  const [securityMetrics, setSecurityMetrics] = useState<SecurityMetrics>({
    security_score: 0,
    compliance_rating: 0,
    active_threats: 0,
    blocked_attempts: 0,
    vulnerabilities: 0,
    last_audit: '',
    certificate_status: 'valid',
    backup_status: 'complete'
  });

  const [threatAlerts, setThreatAlerts] = useState<ThreatAlert[]>([]);
  const [complianceItems, setComplianceItems] = useState<ComplianceItem[]>([]);
  const [securityAudits, setSecurityAudits] = useState<SecurityAudit[]>([]);
  const [accessLogs, setAccessLogs] = useState<AccessLog[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadSecurityData();
  }, []);

  const loadSecurityData = async () => {
    try {
      setIsLoading(true);

      // Load security metrics
      setSecurityMetrics({
        security_score: 87.5 + Math.random() * 10,
        compliance_rating: 91.2 + Math.random() * 6,
        active_threats: Math.floor(Math.random() * 3),
        blocked_attempts: 1247 + Math.floor(Math.random() * 500),
        vulnerabilities: Math.floor(Math.random() * 5),
        last_audit: new Date(Date.now() - 604800000).toISOString(),
        certificate_status: Math.random() > 0.9 ? 'expiring' : 'valid',
        backup_status: Math.random() > 0.95 ? 'failed' : 'complete'
      });

      // Load threat alerts
      await loadThreatAlerts();
      
      // Load compliance items
      await loadComplianceItems();
      
      // Load security audits
      await loadSecurityAudits();
      
      // Load access logs
      await loadAccessLogs();

    } catch (error) {
      console.error('Failed to load security data:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const loadThreatAlerts = async () => {
    const alerts: ThreatAlert[] = [
      {
        id: '1',
        type: 'intrusion',
        severity: 'high',
        title: 'Suspicious Login Attempts',
        description: 'Multiple failed login attempts detected from IP address 192.168.1.100',
        source_ip: '192.168.1.100',
        affected_systems: ['Authentication Server', 'User Database'],
        detected_at: new Date(Date.now() - 3600000).toISOString(),
        status: 'investigating',
        assigned_to: 'Security Team'
      },
      {
        id: '2',
        type: 'malware',
        severity: 'medium',
        title: 'Potential Malware Detection',
        description: 'Antivirus detected suspicious file activity on workstation WS-047',
        affected_systems: ['Workstation WS-047'],
        detected_at: new Date(Date.now() - 7200000).toISOString(),
        status: 'resolved'
      },
      {
        id: '3',
        type: 'dos',
        severity: 'low',
        title: 'Unusual Traffic Pattern',
        description: 'Elevated request rate detected on API endpoint',
        affected_systems: ['API Gateway'],
        detected_at: new Date(Date.now() - 10800000).toISOString(),
        status: 'false_positive'
      }
    ];

    setThreatAlerts(alerts);
  };

  const loadComplianceItems = async () => {
    const items: ComplianceItem[] = [
      {
        id: '1',
        standard: 'ISO27001',
        requirement: 'A.12.1.2 - Change Management',
        status: 'compliant',
        last_checked: new Date(Date.now() - 2592000000).toISOString(),
        next_review: new Date(Date.now() + 7776000000).toISOString(),
        evidence_files: ['change-mgmt-policy.pdf', 'change-log-2024.xlsx'],
        responsible_party: 'IT Operations'
      },
      {
        id: '2',
        standard: 'GDPR',
        requirement: 'Article 32 - Security of Processing',
        status: 'compliant',
        last_checked: new Date(Date.now() - 1296000000).toISOString(),
        next_review: new Date(Date.now() + 5184000000).toISOString(),
        evidence_files: ['encryption-policy.pdf', 'security-assessment.pdf'],
        responsible_party: 'Security Team'
      },
      {
        id: '3',
        standard: 'SOC2',
        requirement: 'CC6.1 - Logical and Physical Access Controls',
        status: 'partial',
        last_checked: new Date(Date.now() - 864000000).toISOString(),
        next_review: new Date(Date.now() + 2592000000).toISOString(),
        evidence_files: ['access-control-matrix.xlsx'],
        responsible_party: 'Access Management'
      },
      {
        id: '4',
        standard: 'NIST',
        requirement: 'PR.AC-4 - Access Permissions Management',
        status: 'non_compliant',
        last_checked: new Date(Date.now() - 432000000).toISOString(),
        next_review: new Date(Date.now() + 1296000000).toISOString(),
        evidence_files: [],
        responsible_party: 'IT Security'
      }
    ];

    setComplianceItems(items);
  };

  const loadSecurityAudits = async () => {
    const audits: SecurityAudit[] = [
      {
        id: '1',
        type: 'vulnerability',
        title: 'Quarterly Vulnerability Assessment',
        status: 'completed',
        scheduled_date: new Date(Date.now() - 1209600000).toISOString(),
        completion_date: new Date(Date.now() - 864000000).toISOString(),
        auditor: 'CyberSec Solutions',
        findings_count: 3,
        risk_level: 'medium'
      },
      {
        id: '2',
        type: 'compliance',
        title: 'ISO 27001 Annual Review',
        status: 'in_progress',
        scheduled_date: new Date().toISOString(),
        auditor: 'Compliance Partners LLC',
        findings_count: 0,
        risk_level: 'low'
      },
      {
        id: '3',
        type: 'penetration',
        title: 'External Penetration Testing',
        status: 'scheduled',
        scheduled_date: new Date(Date.now() + 1209600000).toISOString(),
        auditor: 'RedTeam Security',
        findings_count: 0,
        risk_level: 'high'
      }
    ];

    setSecurityAudits(audits);
  };

  const loadAccessLogs = async () => {
    const logs: AccessLog[] = [
      {
        id: '1',
        user_id: 'user_001',
        user_name: 'John Smith',
        action: 'login',
        resource: 'OverWatch Dashboard',
        ip_address: '192.168.1.45',
        location: 'New York, NY',
        timestamp: new Date(Date.now() - 1800000).toISOString(),
        success: true,
        risk_score: 2
      },
      {
        id: '2',
        user_id: 'user_002',
        user_name: 'Sarah Johnson',
        action: 'data_export',
        resource: 'Project Reports',
        ip_address: '192.168.1.67',
        location: 'Chicago, IL',
        timestamp: new Date(Date.now() - 3600000).toISOString(),
        success: true,
        risk_score: 15
      },
      {
        id: '3',
        user_id: 'unknown',
        user_name: 'Unknown User',
        action: 'access_denied',
        resource: 'Admin Panel',
        ip_address: '203.45.67.89',
        location: 'Unknown',
        timestamp: new Date(Date.now() - 5400000).toISOString(),
        success: false,
        risk_score: 85
      }
    ];

    setAccessLogs(logs);
  };

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'critical': return 'text-destructive';
      case 'high': return 'text-orange-500';
      case 'medium': return 'text-warning';
      case 'low': return 'text-success';
      default: return 'text-muted-foreground';
    }
  };

  const getSeverityBadge = (severity: string) => {
    switch (severity) {
      case 'critical': return 'destructive';
      case 'high': return 'secondary';
      case 'medium': return 'outline';
      case 'low': return 'default';
      default: return 'outline';
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'compliant': case 'resolved': case 'completed': case 'valid': case 'complete': return 'text-success';
      case 'investigating': case 'in_progress': case 'running': case 'partial': return 'text-primary';
      case 'non_compliant': case 'active': case 'failed': case 'expired': return 'text-destructive';
      case 'pending': case 'scheduled': case 'expiring': return 'text-warning';
      case 'false_positive': case 'cancelled': return 'text-muted-foreground';
      default: return 'text-muted-foreground';
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'compliant': case 'resolved': case 'completed': case 'valid': case 'complete': return 'default';
      case 'investigating': case 'in_progress': case 'running': case 'partial': return 'secondary';
      case 'non_compliant': case 'active': case 'failed': case 'expired': return 'destructive';
      case 'pending': case 'scheduled': case 'expiring': return 'outline';
      case 'false_positive': case 'cancelled': return 'outline';
      default: return 'outline';
    }
  };

  const getThreatIcon = (type: string) => {
    switch (type) {
      case 'intrusion': return <Shield className="w-4 h-4" />;
      case 'malware': return <AlertTriangle className="w-4 h-4" />;
      case 'phishing': return <Eye className="w-4 h-4" />;
      case 'data_breach': return <Database className="w-4 h-4" />;
      case 'dos': return <Network className="w-4 h-4" />;
      case 'insider': return <Users className="w-4 h-4" />;
      default: return <AlertTriangle className="w-4 h-4" />;
    }
  };

  const getComplianceIcon = (standard: string) => {
    switch (standard) {
      case 'ISO27001': return <Shield className="w-4 h-4" />;
      case 'GDPR': return <Lock className="w-4 h-4" />;
      case 'SOC2': return <CheckCircle className="w-4 h-4" />;
      case 'HIPAA': return <FileText className="w-4 h-4" />;
      case 'PCI_DSS': return <Key className="w-4 h-4" />;
      case 'NIST': return <Target className="w-4 h-4" />;
      default: return <FileText className="w-4 h-4" />;
    }
  };

  const getRiskScoreColor = (score: number) => {
    if (score >= 80) return 'text-destructive';
    if (score >= 60) return 'text-orange-500';
    if (score >= 40) return 'text-warning';
    if (score >= 20) return 'text-primary';
    return 'text-success';
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString();
  };

  const formatDateTime = (dateString: string) => {
    return new Date(dateString).toLocaleString();
  };

  return (
    <div className={`space-y-6 ${className}`}>
      {/* Security Center Header */}
      <Card className="glass-elevated p-6">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <Shield className="w-6 h-6 text-primary" />
            <h2 className="text-2xl font-bold text-glow-primary">Security & Compliance Center</h2>
            <Badge variant="outline" className="glass-card text-accent">
              <Activity className="w-3 h-3 mr-1" />
              24/7 Monitoring
            </Badge>
          </div>
          
          <div className="flex items-center gap-3">
            <Button variant="outline" className="glass-card">
              <Settings className="w-4 h-4 mr-2" />
              Security Settings
            </Button>
            <Button className="glow-primary">
              <Scan className="w-4 h-4 mr-2" />
              Run Security Scan
            </Button>
          </div>
        </div>

        {/* Security Metrics Dashboard */}
        <div className="grid grid-cols-1 md:grid-cols-6 gap-4">
          <Card className="glass-card p-4">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium text-muted-foreground">Security Score</span>
              <Shield className="w-4 h-4 text-primary" />
            </div>
            <p className="text-2xl font-bold text-primary">{securityMetrics.security_score.toFixed(1)}%</p>
            <Progress value={securityMetrics.security_score} className="h-2 mt-2" />
          </Card>

          <Card className="glass-card p-4">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium text-muted-foreground">Compliance</span>
              <CheckCircle className="w-4 h-4 text-success" />
            </div>
            <p className="text-2xl font-bold text-success">{securityMetrics.compliance_rating.toFixed(1)}%</p>
            <Progress value={securityMetrics.compliance_rating} className="h-2 mt-2" />
          </Card>

          <Card className="glass-card p-4">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium text-muted-foreground">Active Threats</span>
              <AlertTriangle className="w-4 h-4 text-destructive" />
            </div>
            <p className="text-2xl font-bold text-destructive">{securityMetrics.active_threats}</p>
            <span className="text-xs text-muted-foreground">Requires attention</span>
          </Card>

          <Card className="glass-card p-4">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium text-muted-foreground">Blocked Attempts</span>
              <XCircle className="w-4 h-4 text-warning" />
            </div>
            <p className="text-2xl font-bold text-warning">{securityMetrics.blocked_attempts.toLocaleString()}</p>
            <span className="text-xs text-muted-foreground">Last 30 days</span>
          </Card>

          <Card className="glass-card p-4">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium text-muted-foreground">Vulnerabilities</span>
              <Eye className="w-4 h-4 text-accent" />
            </div>
            <p className="text-2xl font-bold text-accent">{securityMetrics.vulnerabilities}</p>
            <span className="text-xs text-muted-foreground">Open findings</span>
          </Card>

          <Card className="glass-card p-4">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium text-muted-foreground">Last Audit</span>
              <Clock className="w-4 h-4 text-muted-foreground" />
            </div>
            <p className="text-2xl font-bold">{Math.floor((Date.now() - new Date(securityMetrics.last_audit).getTime()) / (1000 * 60 * 60 * 24))}d</p>
            <span className="text-xs text-muted-foreground">Days ago</span>
          </Card>
        </div>
      </Card>

      {/* Main Content Tabs */}
      <Tabs defaultValue="threats" className="space-y-6">
        <TabsList className="grid w-full grid-cols-5">
          <TabsTrigger value="threats" className="flex items-center gap-2">
            <AlertTriangle className="w-4 h-4" />
            Threat Detection
          </TabsTrigger>
          <TabsTrigger value="compliance" className="flex items-center gap-2">
            <CheckCircle className="w-4 h-4" />
            Compliance
          </TabsTrigger>
          <TabsTrigger value="audits" className="flex items-center gap-2">
            <Scan className="w-4 h-4" />
            Security Audits
          </TabsTrigger>
          <TabsTrigger value="access" className="flex items-center gap-2">
            <Users className="w-4 h-4" />
            Access Control
          </TabsTrigger>
          <TabsTrigger value="monitoring" className="flex items-center gap-2">
            <Activity className="w-4 h-4" />
            Monitoring
          </TabsTrigger>
        </TabsList>

        {/* Threat Detection Tab */}
        <TabsContent value="threats" className="space-y-6">
          <Card className="glass-elevated p-6">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-xl font-semibold">Threat Detection & Response</h3>
              <div className="flex items-center gap-3">
                <Select>
                  <SelectTrigger className="w-32 glass-card">
                    <SelectValue placeholder="Filter" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Threats</SelectItem>
                    <SelectItem value="critical">Critical</SelectItem>
                    <SelectItem value="high">High</SelectItem>
                    <SelectItem value="active">Active</SelectItem>
                  </SelectContent>
                </Select>
                <Button variant="outline" className="glass-card">
                  <RefreshCw className="w-4 h-4 mr-2" />
                  Refresh
                </Button>
              </div>
            </div>

            <div className="space-y-4">
              {threatAlerts.map((threat) => (
                <Card key={threat.id} className="glass-card p-4">
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex items-center gap-3">
                      <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${
                        threat.severity === 'critical' ? 'bg-destructive/20' :
                        threat.severity === 'high' ? 'bg-orange-500/20' :
                        threat.severity === 'medium' ? 'bg-warning/20' :
                        'bg-success/20'
                      }`}>
                        {getThreatIcon(threat.type)}
                      </div>
                      <div>
                        <h4 className="font-semibold">{threat.title}</h4>
                        <p className="text-sm text-muted-foreground capitalize">
                          {threat.type.replace('_', ' ')} • Detected {formatDateTime(threat.detected_at)}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                                              <Badge variant={getSeverityBadge(threat.severity) as "default" | "destructive" | "outline" | "secondary"} className={getSeverityColor(threat.severity)}>
                        {threat.severity}
                      </Badge>
                                              <Badge variant={getStatusBadge(threat.status) as "default" | "destructive" | "outline" | "secondary"} className={getStatusColor(threat.status)}>
                        {threat.status.replace('_', ' ')}
                      </Badge>
                    </div>
                  </div>

                  <p className="text-sm text-muted-foreground mb-4">{threat.description}</p>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                    {threat.source_ip && (
                      <div>
                        <span className="text-xs font-medium text-muted-foreground">Source IP</span>
                        <p className="text-sm font-mono">{threat.source_ip}</p>
                      </div>
                    )}
                    
                    <div>
                      <span className="text-xs font-medium text-muted-foreground">Affected Systems</span>
                      <div className="flex flex-wrap gap-1 mt-1">
                        {threat.affected_systems.map((system, index) => (
                          <Badge key={index} variant="outline" className="text-xs">
                            {system}
                          </Badge>
                        ))}
                      </div>
                    </div>
                    
                    {threat.assigned_to && (
                      <div>
                        <span className="text-xs font-medium text-muted-foreground">Assigned To</span>
                        <p className="text-sm">{threat.assigned_to}</p>
                      </div>
                    )}
                  </div>

                  <div className="flex items-center justify-between pt-3 border-t border-glass-border">
                    <div className="flex items-center gap-2 text-xs text-muted-foreground">
                      <Clock className="w-3 h-3" />
                      <span>{formatDateTime(threat.detected_at)}</span>
                    </div>
                    
                    <div className="flex items-center gap-2">
                      <Button size="sm" variant="outline" className="glass-card">
                        <Eye className="w-4 h-4 mr-2" />
                        Investigate
                      </Button>
                      {threat.status === 'active' && (
                        <Button size="sm" className="glow-primary">
                          <CheckCircle className="w-4 h-4 mr-2" />
                          Resolve
                        </Button>
                      )}
                    </div>
                  </div>
                </Card>
              ))}

              {threatAlerts.length === 0 && (
                <div className="text-center py-12">
                  <Shield className="w-16 h-16 text-success mx-auto mb-4" />
                  <h3 className="text-lg font-semibold mb-2 text-success">No Active Threats</h3>
                  <p className="text-muted-foreground">Your system is secure. All threats have been resolved.</p>
                </div>
              )}
            </div>
          </Card>
        </TabsContent>

        {/* Compliance Tab */}
        <TabsContent value="compliance" className="space-y-6">
          <Card className="glass-elevated p-6">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-xl font-semibold">Compliance Management</h3>
              <Button className="glow-primary">
                <FileText className="w-4 h-4 mr-2" />
                Generate Report
              </Button>
            </div>

            <div className="space-y-4">
              {complianceItems.map((item) => (
                <Card key={item.id} className="glass-card p-4">
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-primary/20 rounded-lg flex items-center justify-center">
                        {getComplianceIcon(item.standard)}
                      </div>
                      <div>
                        <h4 className="font-semibold">{item.requirement}</h4>
                        <p className="text-sm text-muted-foreground">
                          {item.standard} • Responsible: {item.responsible_party}
                        </p>
                      </div>
                    </div>

                                            <Badge variant={getStatusBadge(item.status) as "default" | "destructive" | "outline" | "secondary"} className={getStatusColor(item.status)}>
                      {item.status.replace('_', ' ')}
                    </Badge>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                    <div>
                      <span className="text-xs font-medium text-muted-foreground">Last Checked</span>
                      <p className="text-sm">{formatDate(item.last_checked)}</p>
                    </div>
                    
                    <div>
                      <span className="text-xs font-medium text-muted-foreground">Next Review</span>
                      <p className="text-sm">{formatDate(item.next_review)}</p>
                    </div>
                    
                    <div>
                      <span className="text-xs font-medium text-muted-foreground">Evidence Files</span>
                      <p className="text-sm">{item.evidence_files.length} files</p>
                    </div>
                  </div>

                  {item.evidence_files.length > 0 && (
                    <div className="mb-4">
                      <span className="text-xs font-medium text-muted-foreground">Evidence Documents</span>
                      <div className="flex flex-wrap gap-1 mt-1">
                        {item.evidence_files.map((file, index) => (
                          <Badge key={index} variant="outline" className="text-xs">
                            <FileText className="w-3 h-3 mr-1" />
                            {file}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  )}

                  <div className="flex items-center justify-between pt-3 border-t border-glass-border">
                    <div className="flex items-center gap-2 text-xs text-muted-foreground">
                      <Calendar className="w-3 h-3" />
                      <span>Next review: {formatDate(item.next_review)}</span>
                    </div>
                    
                    <div className="flex items-center gap-2">
                      <Button size="sm" variant="outline" className="glass-card">
                        <Upload className="w-4 h-4 mr-2" />
                        Upload Evidence
                      </Button>
                      <Button size="sm" variant="outline" className="glass-card">
                        <Edit className="w-4 h-4 mr-2" />
                        Update Status
                      </Button>
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          </Card>
        </TabsContent>

        {/* Security Audits Tab */}
        <TabsContent value="audits" className="space-y-6">
          <Card className="glass-elevated p-6">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-xl font-semibold">Security Audits & Assessments</h3>
              <Button className="glow-primary">
                <Calendar className="w-4 h-4 mr-2" />
                Schedule Audit
              </Button>
            </div>

            <div className="space-y-4">
              {securityAudits.map((audit) => (
                <Card key={audit.id} className="glass-card p-4">
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-accent/20 rounded-lg flex items-center justify-center">
                        <Scan className="w-5 h-5 text-accent" />
                      </div>
                      <div>
                        <h4 className="font-semibold">{audit.title}</h4>
                        <p className="text-sm text-muted-foreground capitalize">
                          {audit.type.replace('_', ' ')} • Auditor: {audit.auditor}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                                              <Badge variant={getStatusBadge(audit.status) as "default" | "destructive" | "outline" | "secondary"} className={getStatusColor(audit.status)}>
                        {audit.status.replace('_', ' ')}
                      </Badge>
                                              <Badge variant={getSeverityBadge(audit.risk_level) as "default" | "destructive" | "outline" | "secondary"} className={getSeverityColor(audit.risk_level)}>
                        {audit.risk_level} risk
                      </Badge>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                    <div>
                      <span className="text-xs font-medium text-muted-foreground">Scheduled Date</span>
                      <p className="text-sm">{formatDate(audit.scheduled_date)}</p>
                    </div>
                    
                    {audit.completion_date && (
                      <div>
                        <span className="text-xs font-medium text-muted-foreground">Completed</span>
                        <p className="text-sm">{formatDate(audit.completion_date)}</p>
                      </div>
                    )}
                    
                    <div>
                      <span className="text-xs font-medium text-muted-foreground">Findings</span>
                      <p className="text-sm font-medium">{audit.findings_count} issues</p>
                    </div>
                  </div>

                  <div className="flex items-center justify-between pt-3 border-t border-glass-border">
                    <div className="flex items-center gap-2 text-xs text-muted-foreground">
                      <UserCheck className="w-3 h-3" />
                      <span>Auditor: {audit.auditor}</span>
                    </div>
                    
                    <div className="flex items-center gap-2">
                      {audit.status === 'completed' && (
                        <Button size="sm" variant="outline" className="glass-card">
                          <Download className="w-4 h-4 mr-2" />
                          Download Report
                        </Button>
                      )}
                      <Button size="sm" variant="outline" className="glass-card">
                        <Eye className="w-4 h-4 mr-2" />
                        View Details
                      </Button>
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          </Card>
        </TabsContent>

        {/* Access Control Tab */}
        <TabsContent value="access" className="space-y-6">
          <Card className="glass-elevated p-6">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-xl font-semibold">Access Control & Monitoring</h3>
              <div className="flex items-center gap-3">
                <Select>
                  <SelectTrigger className="w-32 glass-card">
                    <SelectValue placeholder="Filter" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Activities</SelectItem>
                    <SelectItem value="high_risk">High Risk</SelectItem>
                    <SelectItem value="failed">Failed Attempts</SelectItem>
                    <SelectItem value="admin">Admin Actions</SelectItem>
                  </SelectContent>
                </Select>
                <Button variant="outline" className="glass-card">
                  <Search className="w-4 h-4 mr-2" />
                  Search Logs
                </Button>
              </div>
            </div>

            <div className="space-y-4">
              {accessLogs.map((log) => (
                <Card key={log.id} className="glass-card p-4">
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex items-center gap-3">
                      <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${
                        log.success ? 'bg-success/20' : 'bg-destructive/20'
                      }`}>
                        {log.success ? (
                          <CheckCircle className="w-5 h-5 text-success" />
                        ) : (
                          <XCircle className="w-5 h-5 text-destructive" />
                        )}
                      </div>
                      <div>
                        <h4 className="font-semibold">{log.user_name}</h4>
                        <p className="text-sm text-muted-foreground capitalize">
                          {log.action.replace('_', ' ')} • {log.resource}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      <Badge 
                        variant={log.risk_score >= 80 ? 'destructive' : log.risk_score >= 40 ? 'secondary' : 'default'}
                        className={getRiskScoreColor(log.risk_score)}
                      >
                        Risk: {log.risk_score}
                      </Badge>
                      {!log.success && (
                        <Badge variant="destructive">
                          Failed
                        </Badge>
                      )}
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-4">
                    <div>
                      <span className="text-xs font-medium text-muted-foreground">IP Address</span>
                      <p className="text-sm font-mono">{log.ip_address}</p>
                    </div>
                    
                    <div>
                      <span className="text-xs font-medium text-muted-foreground">Location</span>
                      <p className="text-sm">{log.location}</p>
                    </div>
                    
                    <div>
                      <span className="text-xs font-medium text-muted-foreground">Timestamp</span>
                      <p className="text-sm">{formatDateTime(log.timestamp)}</p>
                    </div>
                    
                    <div>
                      <span className="text-xs font-medium text-muted-foreground">Risk Score</span>
                      <p className={`text-sm font-medium ${getRiskScoreColor(log.risk_score)}`}>
                        {log.risk_score}/100
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center justify-between pt-3 border-t border-glass-border">
                    <div className="flex items-center gap-2 text-xs text-muted-foreground">
                      <MapPin className="w-3 h-3" />
                      <span>{log.location}</span>
                    </div>
                    
                    <div className="flex items-center gap-2">
                      {log.risk_score >= 80 && (
                        <Button size="sm" variant="destructive">
                          <AlertTriangle className="w-4 h-4 mr-2" />
                          Block User
                        </Button>
                      )}
                      <Button size="sm" variant="outline" className="glass-card">
                        <Eye className="w-4 h-4 mr-2" />
                        View Details
                      </Button>
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          </Card>
        </TabsContent>

        {/* Monitoring Tab */}
        <TabsContent value="monitoring" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* System Status */}
            <Card className="glass-card p-6">
              <h3 className="text-lg font-semibold mb-4">System Security Status</h3>
              
              <div className="space-y-4">
                <div className="flex items-center justify-between p-3 bg-muted/10 rounded-lg">
                  <div className="flex items-center gap-2">
                    <Shield className="w-4 h-4 text-success" />
                    <span className="font-medium">Firewall</span>
                  </div>
                  <Badge variant="default" className="text-success">Active</Badge>
                </div>

                <div className="flex items-center justify-between p-3 bg-muted/10 rounded-lg">
                  <div className="flex items-center gap-2">
                    <Eye className="w-4 h-4 text-success" />
                    <span className="font-medium">Intrusion Detection</span>
                  </div>
                  <Badge variant="default" className="text-success">Monitoring</Badge>
                </div>

                <div className="flex items-center justify-between p-3 bg-muted/10 rounded-lg">
                  <div className="flex items-center gap-2">
                    <Lock className="w-4 h-4 text-success" />
                    <span className="font-medium">Encryption</span>
                  </div>
                  <Badge variant="default" className="text-success">AES-256</Badge>
                </div>

                <div className="flex items-center justify-between p-3 bg-muted/10 rounded-lg">
                  <div className="flex items-center gap-2">
                    <Key className="w-4 h-4 text-warning" />
                    <span className="font-medium">SSL Certificate</span>
                  </div>
                                        <Badge variant={getStatusBadge(securityMetrics.certificate_status) as "default" | "destructive" | "outline" | "secondary"} className={getStatusColor(securityMetrics.certificate_status)}>
                    {securityMetrics.certificate_status}
                  </Badge>
                </div>

                <div className="flex items-center justify-between p-3 bg-muted/10 rounded-lg">
                  <div className="flex items-center gap-2">
                    <Archive className="w-4 h-4 text-primary" />
                    <span className="font-medium">Backup Status</span>
                  </div>
                                        <Badge variant={getStatusBadge(securityMetrics.backup_status) as "default" | "destructive" | "outline" | "secondary"} className={getStatusColor(securityMetrics.backup_status)}>
                    {securityMetrics.backup_status}
                  </Badge>
                </div>
              </div>
            </Card>

            {/* Security Metrics */}
            <Card className="glass-card p-6">
              <h3 className="text-lg font-semibold mb-4">Security Metrics</h3>
              
              <div className="space-y-4">
                <div>
                  <div className="flex justify-between text-sm mb-2">
                    <span className="font-medium">Overall Security Score</span>
                    <span className="text-primary font-bold">{securityMetrics.security_score.toFixed(1)}%</span>
                  </div>
                  <Progress value={securityMetrics.security_score} className="h-3" />
                </div>

                <div>
                  <div className="flex justify-between text-sm mb-2">
                    <span className="font-medium">Compliance Rating</span>
                    <span className="text-success font-bold">{securityMetrics.compliance_rating.toFixed(1)}%</span>
                  </div>
                  <Progress value={securityMetrics.compliance_rating} className="h-3" />
                </div>

                <div className="grid grid-cols-2 gap-3 mt-4">
                  <div className="text-center p-3 bg-destructive/10 rounded-lg">
                    <div className="text-lg font-bold text-destructive">{securityMetrics.active_threats}</div>
                    <div className="text-xs text-muted-foreground">Active Threats</div>
                  </div>
                  <div className="text-center p-3 bg-warning/10 rounded-lg">
                    <div className="text-lg font-bold text-warning">{securityMetrics.vulnerabilities}</div>
                    <div className="text-xs text-muted-foreground">Vulnerabilities</div>
                  </div>
                </div>

                <div className="text-center p-3 bg-success/10 rounded-lg">
                  <div className="text-lg font-bold text-success">{securityMetrics.blocked_attempts.toLocaleString()}</div>
                  <div className="text-xs text-muted-foreground">Attacks Blocked (30 days)</div>
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
            <p className="text-sm text-muted-foreground">Loading security systems...</p>
          </div>
        </div>
      )}
    </div>
  );
};

export default SecurityCenter;