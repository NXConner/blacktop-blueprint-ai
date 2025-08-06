// Environmental Compliance Module
// Real EPA compliance tracking and environmental monitoring

const React = require('react');

// Module Configuration
const moduleConfig = {
  epaApiUrl: 'https://api.epa.gov/echo',
  airnowApiUrl: 'https://www.airnowapi.org',
  weatherApiUrl: 'https://api.openweathermap.org/data/2.5',
  noaaApiUrl: 'https://api.weather.gov',
  updateInterval: 300000, // 5 minutes
  alertThresholds: {
    aqi: 150, // Unhealthy for Sensitive Groups
    pm25: 35.5, // EPA 24-hour standard
    ozone: 0.075, // EPA 8-hour standard
    temperature: 95, // Heat warning threshold
    windSpeed: 25 // High wind warning
  }
};

// Environmental Data Service
class EnvironmentalService {
  constructor(config) {
    this.config = config;
    this.monitoring = false;
    this.currentData = {};
    this.alerts = [];
  }

  // Start environmental monitoring
  async startMonitoring(location) {
    try {
      this.monitoring = true;
      this.location = location;
      
      console.log('🌍 Starting environmental monitoring...');
      
      // Initial data fetch
      await this.updateAllData();
      
      // Set up periodic updates
      this.monitoringInterval = setInterval(() => {
        this.updateAllData();
      }, this.config.updateInterval);
      
      console.log('✅ Environmental monitoring started');
      return true;
    } catch (error) {
      console.error('❌ Failed to start monitoring:', error);
      throw error;
    }
  }

  // Stop monitoring
  stopMonitoring() {
    this.monitoring = false;
    if (this.monitoringInterval) {
      clearInterval(this.monitoringInterval);
    }
    console.log('⏹️ Environmental monitoring stopped');
  }

  // Update all environmental data
  async updateAllData() {
    try {
      const [airQuality, weather, compliance] = await Promise.all([
        this.getAirQualityData(),
        this.getWeatherData(),
        this.getComplianceData()
      ]);

      this.currentData = {
        airQuality,
        weather,
        compliance,
        timestamp: new Date()
      };

      // Check for alerts
      this.checkAlerts();
      
      // Emit data update event
      this.emitDataUpdate();
      
    } catch (error) {
      console.error('Error updating environmental data:', error);
    }
  }

  // Get air quality data from AirNow API
  async getAirQualityData() {
    try {
      const { lat, lon } = this.location;
      const response = await fetch(
        `${this.config.airnowApiUrl}/aq/observation/latLong/current/?format=application/json&latitude=${lat}&longitude=${lon}&distance=50&API_KEY=${this.config.airnowApiKey}`
      );
      
      if (!response.ok) {
        throw new Error(`AirNow API error: ${response.statusText}`);
      }
      
      const data = await response.json();
      
      return {
        aqi: data[0]?.AQI || 0,
        category: data[0]?.Category?.Name || 'Unknown',
        primaryPollutant: data[0]?.ParameterName || 'Unknown',
        pm25: data.find(d => d.ParameterName === 'PM2.5')?.AQI || 0,
        ozone: data.find(d => d.ParameterName === 'OZONE')?.AQI || 0,
        lastUpdated: new Date()
      };
    } catch (error) {
      console.error('Error fetching air quality data:', error);
      return { error: error.message };
    }
  }

  // Get weather data
  async getWeatherData() {
    try {
      const { lat, lon } = this.location;
      const response = await fetch(
        `${this.config.weatherApiUrl}/weather?lat=${lat}&lon=${lon}&appid=${this.config.weatherApiKey}&units=imperial`
      );
      
      if (!response.ok) {
        throw new Error(`Weather API error: ${response.statusText}`);
      }
      
      const data = await response.json();
      
      return {
        temperature: data.main.temp,
        humidity: data.main.humidity,
        pressure: data.main.pressure,
        windSpeed: data.wind.speed,
        windDirection: data.wind.deg,
        visibility: data.visibility,
        conditions: data.weather[0].description,
        lastUpdated: new Date()
      };
    } catch (error) {
      console.error('Error fetching weather data:', error);
      return { error: error.message };
    }
  }

  // Get EPA compliance data
  async getComplianceData() {
    try {
      const response = await fetch(
        `${this.config.epaApiUrl}/dfr_rest_services.get_facilities?output=JSON&p_state=${this.location.state}&p_radius=25&p_lat=${this.location.lat}&p_long=${this.location.lon}`
      );
      
      if (!response.ok) {
        throw new Error(`EPA API error: ${response.statusText}`);
      }
      
      const data = await response.json();
      
      return {
        facilities: data.Results?.Results || [],
        violations: this.countViolations(data.Results?.Results || []),
        lastUpdated: new Date()
      };
    } catch (error) {
      console.error('Error fetching compliance data:', error);
      return { error: error.message };
    }
  }

  // Count violations in area
  countViolations(facilities) {
    let totalViolations = 0;
    let activeEnforcement = 0;
    
    facilities.forEach(facility => {
      if (facility.CurrSvFlag === 'Y') totalViolations++;
      if (facility.CurrVioFlag === 'Y') activeEnforcement++;
    });
    
    return { totalViolations, activeEnforcement };
  }

  // Check for environmental alerts
  checkAlerts() {
    const alerts = [];
    const { airQuality, weather } = this.currentData;
    
    // Air quality alerts
    if (airQuality.aqi > this.config.alertThresholds.aqi) {
      alerts.push({
        type: 'air_quality',
        severity: airQuality.aqi > 200 ? 'high' : 'medium',
        message: `Air Quality Index is ${airQuality.aqi} (${airQuality.category})`,
        recommendation: 'Consider postponing outdoor work activities',
        timestamp: new Date()
      });
    }
    
    // Weather alerts
    if (weather.temperature > this.config.alertThresholds.temperature) {
      alerts.push({
        type: 'heat',
        severity: weather.temperature > 100 ? 'high' : 'medium',
        message: `High temperature: ${weather.temperature}°F`,
        recommendation: 'Implement heat safety protocols',
        timestamp: new Date()
      });
    }
    
    if (weather.windSpeed > this.config.alertThresholds.windSpeed) {
      alerts.push({
        type: 'wind',
        severity: weather.windSpeed > 35 ? 'high' : 'medium',
        message: `High winds: ${weather.windSpeed} mph`,
        recommendation: 'Secure equipment and materials',
        timestamp: new Date()
      });
    }
    
    // Add new alerts
    this.alerts = [...this.alerts, ...alerts].slice(-50); // Keep last 50 alerts
  }

  // Emit data update event
  emitDataUpdate() {
    window.dispatchEvent(new CustomEvent('environmental-data-update', {
      detail: this.currentData
    }));
  }

  // Generate compliance report
  async generateComplianceReport(projectId) {
    try {
      const project = await this.getProjectData(projectId);
      const environmentalData = this.currentData;
      
      const report = {
        projectId,
        projectName: project.name,
        location: this.location,
        reportDate: new Date(),
        airQualityCompliance: this.assessAirQualityCompliance(environmentalData.airQuality),
        weatherImpact: this.assessWeatherImpact(environmentalData.weather),
        nearbyViolations: environmentalData.compliance.violations,
        recommendations: this.generateRecommendations(),
        certificationStatus: this.determineCertificationStatus()
      };
      
      return report;
    } catch (error) {
      console.error('Error generating compliance report:', error);
      throw error;
    }
  }

  // Assess air quality compliance
  assessAirQualityCompliance(airQualityData) {
    return {
      status: airQualityData.aqi <= 100 ? 'compliant' : 'non-compliant',
      aqi: airQualityData.aqi,
      category: airQualityData.category,
      mitigationRequired: airQualityData.aqi > 150,
      recommendations: airQualityData.aqi > 100 ? [
        'Monitor worker health',
        'Provide respiratory protection',
        'Consider work schedule adjustments'
      ] : []
    };
  }

  // Assess weather impact
  assessWeatherImpact(weatherData) {
    const impacts = [];
    
    if (weatherData.temperature > 85) {
      impacts.push('Heat stress risk');
    }
    if (weatherData.windSpeed > 20) {
      impacts.push('Material handling difficulties');
    }
    if (weatherData.humidity > 80) {
      impacts.push('Extended curing times');
    }
    
    return {
      severity: impacts.length > 2 ? 'high' : impacts.length > 0 ? 'medium' : 'low',
      impacts,
      workRecommendations: this.getWorkRecommendations(weatherData)
    };
  }

  // Get work recommendations based on conditions
  getWorkRecommendations(weatherData) {
    const recommendations = [];
    
    if (weatherData.temperature > 90) {
      recommendations.push('Implement heat safety breaks every 30 minutes');
      recommendations.push('Provide electrolyte replacement drinks');
    }
    
    if (weatherData.windSpeed > 25) {
      recommendations.push('Secure all loose materials');
      recommendations.push('Avoid crane operations');
    }
    
    if (weatherData.humidity < 30) {
      recommendations.push('Increase dust suppression measures');
    }
    
    return recommendations;
  }

  // Generate general recommendations
  generateRecommendations() {
    const recommendations = [];
    const { airQuality, weather, compliance } = this.currentData;
    
    // Air quality recommendations
    if (airQuality.aqi > 100) {
      recommendations.push({
        category: 'Air Quality',
        priority: 'high',
        actions: [
          'Monitor AQI hourly',
          'Implement dust control measures',
          'Provide N95 masks to workers'
        ]
      });
    }
    
    // Compliance recommendations
    if (compliance.violations.totalViolations > 0) {
      recommendations.push({
        category: 'Compliance',
        priority: 'high',
        actions: [
          'Review nearby violation reports',
          'Ensure project permits are current',
          'Implement additional monitoring'
        ]
      });
    }
    
    return recommendations;
  }

  // Determine certification status
  determineCertificationStatus() {
    const { airQuality, compliance } = this.currentData;
    
    let status = 'green';
    let issues = [];
    
    if (airQuality.aqi > 150) {
      status = 'red';
      issues.push('Air quality exceeds safe limits');
    } else if (airQuality.aqi > 100) {
      status = 'yellow';
      issues.push('Air quality requires monitoring');
    }
    
    if (compliance.violations.totalViolations > 5) {
      status = 'red';
      issues.push('High violation count in area');
    }
    
    return { status, issues };
  }

  // Get project data (mock implementation)
  async getProjectData(projectId) {
    // In real implementation, this would fetch from your project database
    return {
      id: projectId,
      name: 'Sample Construction Project',
      location: this.location,
      startDate: new Date(),
      type: 'road_construction'
    };
  }
}

// React Components
const EnvironmentalDashboard = () => {
  const [data, setData] = React.useState({});
  const [monitoring, setMonitoring] = React.useState(false);
  const [alerts, setAlerts] = React.useState([]);

  React.useEffect(() => {
    const handleDataUpdate = (event) => {
      setData(event.detail);
    };

    window.addEventListener('environmental-data-update', handleDataUpdate);
    return () => window.removeEventListener('environmental-data-update', handleDataUpdate);
  }, []);

  const startMonitoring = async () => {
    try {
      setMonitoring(true);
      const location = { lat: 40.7128, lon: -74.0060, state: 'NY' }; // NYC example
      await services.environmental.startMonitoring(location);
    } catch (error) {
      console.error('Failed to start monitoring:', error);
      setMonitoring(false);
    }
  };

  const stopMonitoring = () => {
    services.environmental.stopMonitoring();
    setMonitoring(false);
  };

  return React.createElement('div', { className: 'environmental-dashboard' },
    React.createElement('h3', null, 'Environmental Compliance Dashboard'),
    
    // Control Panel
    React.createElement('div', { className: 'control-panel' },
      React.createElement('button', {
        onClick: monitoring ? stopMonitoring : startMonitoring,
        className: `btn ${monitoring ? 'btn-danger' : 'btn-success'}`
      }, monitoring ? 'Stop Monitoring' : 'Start Monitoring')
    ),

    // Air Quality Section
    data.airQuality && React.createElement('div', { className: 'air-quality-section' },
      React.createElement('h4', null, 'Air Quality'),
      React.createElement('div', { className: 'metric-grid' },
        React.createElement('div', { className: 'metric-card' },
          React.createElement('div', { className: 'metric-value' }, data.airQuality.aqi),
          React.createElement('div', { className: 'metric-label' }, 'AQI'),
          React.createElement('div', { className: 'metric-category' }, data.airQuality.category)
        ),
        React.createElement('div', { className: 'metric-card' },
          React.createElement('div', { className: 'metric-value' }, data.airQuality.pm25),
          React.createElement('div', { className: 'metric-label' }, 'PM2.5')
        ),
        React.createElement('div', { className: 'metric-card' },
          React.createElement('div', { className: 'metric-value' }, data.airQuality.ozone),
          React.createElement('div', { className: 'metric-label' }, 'Ozone')
        )
      )
    ),

    // Weather Section
    data.weather && React.createElement('div', { className: 'weather-section' },
      React.createElement('h4', null, 'Weather Conditions'),
      React.createElement('div', { className: 'metric-grid' },
        React.createElement('div', { className: 'metric-card' },
          React.createElement('div', { className: 'metric-value' }, `${Math.round(data.weather.temperature)}°F`),
          React.createElement('div', { className: 'metric-label' }, 'Temperature')
        ),
        React.createElement('div', { className: 'metric-card' },
          React.createElement('div', { className: 'metric-value' }, `${data.weather.windSpeed} mph`),
          React.createElement('div', { className: 'metric-label' }, 'Wind Speed')
        ),
        React.createElement('div', { className: 'metric-card' },
          React.createElement('div', { className: 'metric-value' }, `${data.weather.humidity}%`),
          React.createElement('div', { className: 'metric-label' }, 'Humidity')
        )
      )
    ),

    // Compliance Section
    data.compliance && React.createElement('div', { className: 'compliance-section' },
      React.createElement('h4', null, 'EPA Compliance'),
      React.createElement('div', { className: 'compliance-stats' },
        React.createElement('div', { className: 'stat' },
          React.createElement('span', { className: 'stat-value' }, data.compliance.facilities.length),
          React.createElement('span', { className: 'stat-label' }, 'Facilities Nearby')
        ),
        React.createElement('div', { className: 'stat' },
          React.createElement('span', { className: 'stat-value' }, data.compliance.violations.totalViolations),
          React.createElement('span', { className: 'stat-label' }, 'Violations')
        )
      )
    )
  );
};

const ComplianceReports = () => {
  const [reports, setReports] = React.useState([]);
  const [generating, setGenerating] = React.useState(false);

  const generateReport = async () => {
    setGenerating(true);
    try {
      const report = await services.environmental.generateComplianceReport('project-123');
      setReports([report, ...reports]);
    } catch (error) {
      console.error('Failed to generate report:', error);
    } finally {
      setGenerating(false);
    }
  };

  return React.createElement('div', { className: 'compliance-reports' },
    React.createElement('h4', null, 'Compliance Reports'),
    React.createElement('button', {
      onClick: generateReport,
      disabled: generating,
      className: 'btn btn-primary'
    }, generating ? 'Generating...' : 'Generate Report'),
    
    React.createElement('div', { className: 'reports-list' },
      reports.map((report, index) =>
        React.createElement('div', { key: index, className: 'report-card' },
          React.createElement('h5', null, `Report - ${report.reportDate.toLocaleDateString()}`),
          React.createElement('div', { className: 'report-status' },
            React.createElement('span', { 
              className: `status-badge ${report.certificationStatus.status}`
            }, report.certificationStatus.status.toUpperCase())
          ),
          React.createElement('div', { className: 'report-details' },
            React.createElement('p', null, `AQI: ${report.airQualityCompliance.aqi}`),
            React.createElement('p', null, `Weather Impact: ${report.weatherImpact.severity}`)
          )
        )
      )
    )
  );
};

const EnvironmentalAlerts = () => {
  const [alerts, setAlerts] = React.useState([]);

  React.useEffect(() => {
    // Get alerts from service
    const serviceAlerts = services.environmental.alerts || [];
    setAlerts(serviceAlerts);
    
    // Poll for new alerts
    const interval = setInterval(() => {
      const newAlerts = services.environmental.alerts || [];
      setAlerts(newAlerts);
    }, 30000); // Check every 30 seconds
    
    return () => clearInterval(interval);
  }, []);

  return React.createElement('div', { className: 'environmental-alerts' },
    React.createElement('h4', null, 'Environmental Alerts'),
    alerts.length === 0 && React.createElement('p', null, 'No active alerts'),
    alerts.map((alert, index) =>
      React.createElement('div', { 
        key: index, 
        className: `alert alert-${alert.severity}`
      },
        React.createElement('div', { className: 'alert-header' },
          React.createElement('span', { className: 'alert-type' }, alert.type.replace('_', ' ').toUpperCase()),
          React.createElement('span', { className: 'alert-time' }, alert.timestamp.toLocaleTimeString())
        ),
        React.createElement('div', { className: 'alert-message' }, alert.message),
        alert.recommendation && React.createElement('div', { className: 'alert-recommendation' },
          React.createElement('strong', null, 'Recommendation: '),
          alert.recommendation
        )
      )
    )
  );
};

// Module API
const api = {
  startMonitoring: async (location) => {
    return services.environmental.startMonitoring(location);
  },
  
  stopMonitoring: () => {
    return services.environmental.stopMonitoring();
  },
  
  getCurrentData: () => {
    return services.environmental.currentData;
  },
  
  generateReport: async (projectId) => {
    return services.environmental.generateComplianceReport(projectId);
  },
  
  getAlerts: () => {
    return services.environmental.alerts;
  }
};

// Module Services
const services = {
  environmental: new EnvironmentalService(moduleConfig)
};

// Module Routes
const routes = [
  {
    path: '/environmental',
    component: 'EnvironmentalDashboard',
    exact: true
  },
  {
    path: '/environmental/reports',
    component: 'ComplianceReports',
    exact: true
  },
  {
    path: '/environmental/alerts',
    component: 'EnvironmentalAlerts',
    exact: true
  }
];

// Module Lifecycle
const install = async () => {
  console.log('📦 Installing Environmental Compliance module...');
  
  // Load configuration
  const config = JSON.parse(localStorage.getItem('env_config') || '{}');
  Object.assign(moduleConfig, config);
  
  console.log('✅ Environmental Compliance module installed');
};

const uninstall = async () => {
  console.log('🗑️ Uninstalling Environmental Compliance module...');
  
  // Stop monitoring if active
  services.environmental.stopMonitoring();
  
  // Clear stored data
  localStorage.removeItem('env_config');
  localStorage.removeItem('env_monitoring_data');
  
  console.log('✅ Environmental Compliance module uninstalled');
};

const activate = async () => {
  console.log('🚀 Activating Environmental Compliance module...');
  
  // Register for project events
  window.addEventListener('project-location-changed', async (event) => {
    if (services.environmental.monitoring) {
      await services.environmental.startMonitoring(event.detail.location);
    }
  });
  
  console.log('✅ Environmental Compliance module activated');
};

const deactivate = async () => {
  console.log('⏸️ Deactivating Environmental Compliance module...');
  
  // Stop monitoring
  services.environmental.stopMonitoring();
  
  console.log('✅ Environmental Compliance module deactivated');
};

const configure = async (config) => {
  console.log('⚙️ Configuring Environmental Compliance module...');
  
  Object.assign(moduleConfig, config);
  localStorage.setItem('env_config', JSON.stringify(moduleConfig));
  
  console.log('✅ Environmental Compliance module configured');
};

// Module Exports
module.exports = {
  // Components
  components: {
    EnvironmentalDashboard,
    ComplianceReports,
    EnvironmentalAlerts
  },
  
  // Services
  services,
  
  // API
  api,
  
  // Routes
  routes,
  
  // Lifecycle methods
  install,
  uninstall,
  activate,
  deactivate,
  configure,
  
  // Module metadata
  name: 'Environmental Compliance',
  version: '1.0.0',
  description: 'EPA compliance tracking and environmental monitoring for construction projects',
  author: 'Blacktop Blackout Systems'
};