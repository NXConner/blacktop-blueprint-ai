import { supabase } from '@/integrations/supabase/client';
import React from 'react';

// ================================
// REAL MODULE SYSTEM REGISTRY
// ================================

export interface RealModule {
  id: string;
  name: string;
  version: string;
  description: string;
  author: string;
  category: ModuleCategory;
  license: string;
  
  // Module assets
  entryPoint: string;
  dependencies: ModuleDependency[];
  assets: ModuleAsset[];
  
  // Runtime configuration
  config: ModuleConfig;
  permissions: ModulePermission[];
  hooks: ModuleHook[];
  
  // Lifecycle methods
  install?: () => Promise<void>;
  uninstall?: () => Promise<void>;
  activate?: () => Promise<void>;
  deactivate?: () => Promise<void>;
  configure?: (config: any) => Promise<void>;
  
  // Module exports
  components?: Record<string, React.ComponentType<any>>;
  services?: Record<string, any>;
  api?: Record<string, Function>;
  routes?: ModuleRoute[];
  
  // Metadata
  downloadUrl: string;
  checksum: string;
  size: number;
  installCount: number;
  rating: number;
  
  // Status
  isInstalled: boolean;
  isActive: boolean;
  lastUpdated: Date;
}

export interface ModuleDependency {
  name: string;
  version: string;
  type: 'required' | 'optional' | 'peer';
  source: 'npm' | 'module-registry' | 'system';
}

export interface ModuleAsset {
  path: string;
  type: 'javascript' | 'css' | 'image' | 'data' | 'config';
  content?: string;
  url?: string;
  checksum: string;
}

export interface ModuleConfig {
  schema: ConfigSchema;
  defaults: Record<string, any>;
  current: Record<string, any>;
}

export interface ConfigSchema {
  type: 'object';
  properties: Record<string, ConfigProperty>;
  required?: string[];
}

export interface ConfigProperty {
  type: 'string' | 'number' | 'boolean' | 'array' | 'object';
  title: string;
  description: string;
  default?: any;
  enum?: any[];
  format?: string;
  pattern?: string;
  minimum?: number;
  maximum?: number;
}

export interface ModulePermission {
  resource: string;
  actions: string[];
  conditions?: Record<string, any>;
}

export interface ModuleHook {
  event: string;
  handler: string;
  priority: number;
}

export interface ModuleRoute {
  path: string;
  component: string;
  exact?: boolean;
  permissions?: string[];
}

export enum ModuleCategory {
  FINANCIAL = 'financial',
  CONSTRUCTION = 'construction',
  ENVIRONMENTAL = 'environmental',
  SECURITY = 'security',
  LOGISTICS = 'logistics',
  MOBILE = 'mobile',
  ANALYTICS = 'analytics',
  INTEGRATION = 'integration',
  WORKFLOW = 'workflow',
  REPORTING = 'reporting'
}

export interface ModulePackage {
  manifest: RealModule;
  files: Map<string, string | Uint8Array>;
  signature: string;
}

// ================================
// MODULE REGISTRY SERVICE
// ================================

export class ModuleRegistry {
  private modules: Map<string, RealModule> = new Map();
  private loadedModules: Map<string, any> = new Map();
  private moduleCache: Map<string, ModulePackage> = new Map();
  private eventListeners: Map<string, Function[]> = new Map();

  constructor() {
    this.setupEventListeners();
  }

  // ================================
  // REGISTRY OPERATIONS
  // ================================

  async registerModule(modulePackage: ModulePackage): Promise<void> {
    const { manifest } = modulePackage;
    
    // Validate module
    await this.validateModule(manifest);
    
    // Check dependencies
    await this.resolveDependencies(manifest.dependencies);
    
    // Store in registry
    this.modules.set(manifest.id, manifest);
    this.moduleCache.set(manifest.id, modulePackage);
    
    // Persist to database
    await this.persistModule(manifest);
    
    this.emit('module:registered', manifest);
  }

  async unregisterModule(moduleId: string): Promise<void> {
    const module = this.modules.get(moduleId);
    if (!module) throw new Error(`Module ${moduleId} not found`);

    // Check if other modules depend on this one
    const dependents = this.findDependentModules(moduleId);
    if (dependents.length > 0) {
      throw new Error(`Cannot unregister ${moduleId}: required by ${dependents.join(', ')}`);
    }

    // Deactivate if active
    if (module.isActive) {
      await this.deactivateModule(moduleId);
    }

    // Remove from registry
    this.modules.delete(moduleId);
    this.loadedModules.delete(moduleId);
    this.moduleCache.delete(moduleId);
    
    // Remove from database
    await this.removeModule(moduleId);
    
    this.emit('module:unregistered', module);
  }

  // ================================
  // MODULE LIFECYCLE
  // ================================

  async installModule(moduleId: string, config?: Record<string, any>): Promise<void> {
    let module = this.modules.get(moduleId);
    
    if (!module) {
      // Download and register module
      const modulePackage = await this.downloadModule(moduleId);
      await this.registerModule(modulePackage);
      module = this.modules.get(moduleId)!;
    }

    // Apply configuration
    if (config) {
      module.config.current = { ...module.config.defaults, ...config };
    }

    // Run install script
    if (module.install) {
      await module.install();
    }

    // Load module assets
    await this.loadModuleAssets(module);

    module.isInstalled = true;
    module.lastUpdated = new Date();
    
    await this.updateModule(module);
    this.emit('module:installed', module);
  }

  async uninstallModule(moduleId: string): Promise<void> {
    const module = this.modules.get(moduleId);
    if (!module) throw new Error(`Module ${moduleId} not found`);

    // Deactivate first
    if (module.isActive) {
      await this.deactivateModule(moduleId);
    }

    // Run uninstall script
    if (module.uninstall) {
      await module.uninstall();
    }

    // Unload assets
    await this.unloadModuleAssets(module);

    module.isInstalled = false;
    module.lastUpdated = new Date();
    
    await this.updateModule(module);
    this.emit('module:uninstalled', module);
  }

  async activateModule(moduleId: string): Promise<void> {
    const module = this.modules.get(moduleId);
    if (!module) throw new Error(`Module ${moduleId} not found`);
    if (!module.isInstalled) throw new Error(`Module ${moduleId} not installed`);

    // Load module into runtime
    const loadedModule = await this.loadModule(module);
    this.loadedModules.set(moduleId, loadedModule);

    // Run activation script
    if (module.activate) {
      await module.activate();
    }

    // Register routes
    if (module.routes) {
      await this.registerRoutes(module.routes);
    }

    // Register hooks
    if (module.hooks) {
      await this.registerHooks(module.hooks);
    }

    module.isActive = true;
    module.lastUpdated = new Date();
    
    await this.updateModule(module);
    this.emit('module:activated', module);
  }

  async deactivateModule(moduleId: string): Promise<void> {
    const module = this.modules.get(moduleId);
    if (!module) throw new Error(`Module ${moduleId} not found`);

    // Run deactivation script
    if (module.deactivate) {
      await module.deactivate();
    }

    // Unregister routes
    if (module.routes) {
      await this.unregisterRoutes(module.routes);
    }

    // Unregister hooks
    if (module.hooks) {
      await this.unregisterHooks(module.hooks);
    }

    // Unload from runtime
    this.loadedModules.delete(moduleId);

    module.isActive = false;
    module.lastUpdated = new Date();
    
    await this.updateModule(module);
    this.emit('module:deactivated', module);
  }

  // ================================
  // MODULE LOADING
  // ================================

  private async loadModule(module: RealModule): Promise<any> {
    try {
      // Create module sandbox
      const sandbox = this.createModuleSandbox(module);
      
      // Load main module file
      const entryPoint = module.assets.find(asset => asset.path === module.entryPoint);
      if (!entryPoint || !entryPoint.content) {
        throw new Error(`Entry point ${module.entryPoint} not found`);
      }

      // Execute module in sandbox
      const moduleFunction = new Function('module', 'exports', 'require', '__dirname', '__filename', entryPoint.content);
      const moduleExports = {};
      const moduleObj = { exports: moduleExports };
      
      moduleFunction.call(
        sandbox,
        moduleObj,
        moduleExports,
        this.createRequireFunction(module),
        `/modules/${module.id}`,
        `/modules/${module.id}/${module.entryPoint}`
      );

      return moduleObj.exports;
    } catch (error) {
      throw new Error(`Failed to load module ${module.id}: ${error.message}`);
    }
  }

  private createModuleSandbox(module: RealModule): any {
    // Create secure sandbox for module execution
    return {
      console: {
        log: (...args: any[]) => console.log(`[${module.id}]`, ...args),
        error: (...args: any[]) => console.error(`[${module.id}]`, ...args),
        warn: (...args: any[]) => console.warn(`[${module.id}]`, ...args)
      },
      setTimeout,
      clearTimeout,
      setInterval,
      clearInterval,
      Promise,
      Date,
      JSON,
      Math,
      Object,
      Array,
      String,
      Number,
      Boolean,
      RegExp,
      Error,
      // Restricted global access
      global: undefined,
      window: undefined,
      document: undefined,
      process: undefined
    };
  }

  private createRequireFunction(module: RealModule): Function {
    return (moduleName: string) => {
      // Handle built-in modules
      if (moduleName === 'react') return React;
      if (moduleName === '@/components/ui/button') return require('@/components/ui/button');
      // Add more built-in modules as needed
      
      // Handle module dependencies
      const dependency = module.dependencies.find(dep => dep.name === moduleName);
      if (dependency) {
        if (dependency.source === 'module-registry') {
          const depModule = this.loadedModules.get(dependency.name);
          if (depModule) return depModule;
        }
      }
      
      throw new Error(`Module ${moduleName} not found`);
    };
  }

  // ================================
  // ASSET MANAGEMENT
  // ================================

  private async loadModuleAssets(module: RealModule): Promise<void> {
    for (const asset of module.assets) {
      switch (asset.type) {
        case 'css':
          await this.loadCSSAsset(asset);
          break;
        case 'javascript':
          // Already handled in loadModule
          break;
        case 'image':
          await this.cacheImageAsset(asset);
          break;
        case 'data':
          await this.loadDataAsset(asset);
          break;
      }
    }
  }

  private async unloadModuleAssets(module: RealModule): Promise<void> {
    for (const asset of module.assets) {
      switch (asset.type) {
        case 'css':
          await this.unloadCSSAsset(asset);
          break;
        case 'image':
          await this.uncacheImageAsset(asset);
          break;
      }
    }
  }

  private async loadCSSAsset(asset: ModuleAsset): Promise<void> {
    if (!asset.content) return;
    
    const styleId = `module-style-${asset.path}`;
    let styleElement = document.getElementById(styleId) as HTMLStyleElement;
    
    if (!styleElement) {
      styleElement = document.createElement('style');
      styleElement.id = styleId;
      document.head.appendChild(styleElement);
    }
    
    styleElement.textContent = asset.content;
  }

  private async unloadCSSAsset(asset: ModuleAsset): Promise<void> {
    const styleId = `module-style-${asset.path}`;
    const styleElement = document.getElementById(styleId);
    if (styleElement) {
      styleElement.remove();
    }
  }

  private async cacheImageAsset(asset: ModuleAsset): Promise<void> {
    // Cache images for offline access
    if (asset.url && 'caches' in window) {
      const cache = await caches.open('module-assets');
      await cache.add(asset.url);
    }
  }

  private async uncacheImageAsset(asset: ModuleAsset): Promise<void> {
    if (asset.url && 'caches' in window) {
      const cache = await caches.open('module-assets');
      await cache.delete(asset.url);
    }
  }

  private async loadDataAsset(asset: ModuleAsset): Promise<void> {
    // Load configuration or data files
    if (asset.content) {
      const data = JSON.parse(asset.content);
      // Store in module-specific storage
      localStorage.setItem(`module-data-${asset.path}`, JSON.stringify(data));
    }
  }

  // ================================
  // DEPENDENCY RESOLUTION
  // ================================

  private async resolveDependencies(dependencies: ModuleDependency[]): Promise<void> {
    for (const dep of dependencies) {
      if (dep.type === 'required') {
        const depModule = this.modules.get(dep.name);
        if (!depModule) {
          // Try to auto-install dependency
          await this.installModule(dep.name);
        } else if (!this.isVersionCompatible(depModule.version, dep.version)) {
          throw new Error(`Incompatible version of ${dep.name}: required ${dep.version}, found ${depModule.version}`);
        }
      }
    }
  }

  private isVersionCompatible(installed: string, required: string): boolean {
    // Simple semantic version checking
    const [installedMajor, installedMinor] = installed.split('.').map(Number);
    const [requiredMajor, requiredMinor] = required.split('.').map(Number);
    
    return installedMajor === requiredMajor && installedMinor >= requiredMinor;
  }

  private findDependentModules(moduleId: string): string[] {
    const dependents: string[] = [];
    
    for (const [id, module] of this.modules) {
      if (module.dependencies.some(dep => dep.name === moduleId)) {
        dependents.push(id);
      }
    }
    
    return dependents;
  }

  // ================================
  // ROUTE MANAGEMENT
  // ================================

  private async registerRoutes(routes: ModuleRoute[]): Promise<void> {
    // Integration with React Router
    for (const route of routes) {
      this.emit('route:register', route);
    }
  }

  private async unregisterRoutes(routes: ModuleRoute[]): Promise<void> {
    for (const route of routes) {
      this.emit('route:unregister', route);
    }
  }

  // ================================
  // HOOK MANAGEMENT
  // ================================

  private async registerHooks(hooks: ModuleHook[]): Promise<void> {
    for (const hook of hooks) {
      if (!this.eventListeners.has(hook.event)) {
        this.eventListeners.set(hook.event, []);
      }
      
      const listeners = this.eventListeners.get(hook.event)!;
      listeners.push({ handler: hook.handler, priority: hook.priority });
      listeners.sort((a, b) => b.priority - a.priority);
    }
  }

  private async unregisterHooks(hooks: ModuleHook[]): Promise<void> {
    for (const hook of hooks) {
      const listeners = this.eventListeners.get(hook.event);
      if (listeners) {
        const index = listeners.findIndex(l => l.handler === hook.handler);
        if (index !== -1) {
          listeners.splice(index, 1);
        }
      }
    }
  }

  // ================================
  // MODULE DOWNLOAD
  // ================================

  async downloadModule(moduleId: string): Promise<ModulePackage> {
    try {
      // Get module metadata from catalog
      const { data: catalogEntry } = await supabase
        .from('module_catalog')
        .select('*')
        .eq('module_id', moduleId)
        .single();
      
      if (!catalogEntry) {
        throw new Error(`Module ${moduleId} not found in catalog`);
      }

      // Download module package
      const response = await fetch(catalogEntry.download_url);
      if (!response.ok) {
        throw new Error(`Failed to download module: ${response.statusText}`);
      }

      const packageData = await response.arrayBuffer();
      
      // Verify checksum
      const checksum = await this.calculateChecksum(packageData);
      if (checksum !== catalogEntry.checksum_sha256) {
        throw new Error('Module package verification failed');
      }

      // Parse package
      const modulePackage = await this.parseModulePackage(packageData);
      
      // Log download
      await supabase.from('module_downloads').insert({
        module_id: moduleId,
        version: modulePackage.manifest.version,
        success: true
      });

      return modulePackage;
    } catch (error) {
      // Log failed download
      await supabase.from('module_downloads').insert({
        module_id: moduleId,
        success: false,
        error_message: error.message
      });
      
      throw error;
    }
  }

  private async parseModulePackage(packageData: ArrayBuffer): Promise<ModulePackage> {
    // Simple package format: JSON manifest + files
    const decoder = new TextDecoder();
    const packageText = decoder.decode(packageData);
    const packageJson = JSON.parse(packageText);
    
    const manifest: RealModule = packageJson.manifest;
    const files = new Map<string, string | Uint8Array>();
    
    // Load files from package
    for (const [path, content] of Object.entries(packageJson.files)) {
      files.set(path, content as string);
    }
    
    return {
      manifest,
      files,
      signature: packageJson.signature || ''
    };
  }

  // ================================
  // VALIDATION
  // ================================

  private async validateModule(module: RealModule): Promise<void> {
    // Validate required fields
    if (!module.id || !module.name || !module.version) {
      throw new Error('Module missing required fields');
    }

    // Validate version format
    if (!/^\d+\.\d+\.\d+$/.test(module.version)) {
      throw new Error('Invalid version format');
    }

    // Validate entry point exists
    if (!module.assets.some(asset => asset.path === module.entryPoint)) {
      throw new Error('Entry point file not found');
    }

    // Validate configuration schema
    if (module.config.schema) {
      this.validateConfigSchema(module.config.schema);
    }
  }

  private validateConfigSchema(schema: ConfigSchema): void {
    if (schema.type !== 'object') {
      throw new Error('Root schema must be of type object');
    }
    
    for (const [key, property] of Object.entries(schema.properties)) {
      if (!['string', 'number', 'boolean', 'array', 'object'].includes(property.type)) {
        throw new Error(`Invalid property type: ${property.type}`);
      }
    }
  }

  // ================================
  // DATABASE OPERATIONS
  // ================================

  private async persistModule(module: RealModule): Promise<void> {
    await supabase.from('installed_modules').upsert({
      module_id: module.id,
      name: module.name,
      version: module.version,
      category: module.category,
      status: module.isActive ? 'active' : 'inactive',
      configuration: module.config.current,
      installed_by: (await supabase.auth.getUser()).data.user?.id
    });
  }

  private async updateModule(module: RealModule): Promise<void> {
    await supabase.from('installed_modules')
      .update({
        status: module.isActive ? 'active' : 'inactive',
        configuration: module.config.current,
        updated_at: new Date().toISOString()
      })
      .eq('module_id', module.id);
  }

  private async removeModule(moduleId: string): Promise<void> {
    await supabase.from('installed_modules')
      .delete()
      .eq('module_id', moduleId);
  }

  // ================================
  // UTILITY METHODS
  // ================================

  private async calculateChecksum(data: ArrayBuffer): Promise<string> {
    const hashBuffer = await crypto.subtle.digest('SHA-256', data);
    const hashArray = Array.from(new Uint8Array(hashBuffer));
    return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
  }

  private setupEventListeners(): void {
    // Setup global event handling for modules
  }

  private emit(event: string, data?: any): void {
    const listeners = this.eventListeners.get(event) || [];
    listeners.forEach(listener => {
      try {
        listener.handler(data);
      } catch (error) {
        console.error(`Error in event listener for ${event}:`, error);
      }
    });
  }

  // ================================
  // PUBLIC API
  // ================================

  getModule(moduleId: string): RealModule | undefined {
    return this.modules.get(moduleId);
  }

  getLoadedModule(moduleId: string): any {
    return this.loadedModules.get(moduleId);
  }

  getAllModules(): RealModule[] {
    return Array.from(this.modules.values());
  }

  getActiveModules(): RealModule[] {
    return Array.from(this.modules.values()).filter(m => m.isActive);
  }

  isModuleInstalled(moduleId: string): boolean {
    const module = this.modules.get(moduleId);
    return module?.isInstalled || false;
  }

  isModuleActive(moduleId: string): boolean {
    const module = this.modules.get(moduleId);
    return module?.isActive || false;
  }

  on(event: string, listener: Function): void {
    if (!this.eventListeners.has(event)) {
      this.eventListeners.set(event, []);
    }
    this.eventListeners.get(event)!.push({ handler: listener, priority: 0 });
  }

  off(event: string, listener: Function): void {
    const listeners = this.eventListeners.get(event);
    if (listeners) {
      const index = listeners.findIndex(l => l.handler === listener);
      if (index !== -1) {
        listeners.splice(index, 1);
      }
    }
  }
}

// ================================
// SINGLETON INSTANCE
// ================================

export const moduleRegistry = new ModuleRegistry();