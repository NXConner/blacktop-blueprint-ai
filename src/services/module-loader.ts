import { moduleRegistry, RealModule, ModulePackage } from './module-registry';
import React from 'react';

// ================================
// DYNAMIC MODULE LOADER
// ================================

export interface LoadedModuleInstance {
  id: string;
  module: RealModule;
  instance: any;
  components: Map<string, React.ComponentType<any>>;
  services: Map<string, any>;
  api: Map<string, Function>;
  routes: any[];
  isActive: boolean;
  loadedAt: Date;
  errorCount: number;
  lastError?: Error;
}

export interface ModuleExecutionContext {
  moduleId: string;
  require: (moduleName: string) => any;
  console: Console;
  setTimeout: typeof setTimeout;
  clearTimeout: typeof clearTimeout;
  setInterval: typeof setInterval;
  clearInterval: typeof clearInterval;
  localStorage: Storage;
  fetch: typeof fetch;
  React: typeof React;
  __dirname: string;
  __filename: string;
}

export interface ModuleLoadError {
  moduleId: string;
  error: Error;
  timestamp: Date;
  context: string;
  recoverable: boolean;
}

// ================================
// MODULE LOADER SERVICE
// ================================

export class ModuleLoader {
  private loadedModules: Map<string, LoadedModuleInstance> = new Map();
  private loadingPromises: Map<string, Promise<LoadedModuleInstance>> = new Map();
  private errorLog: ModuleLoadError[] = [];
  private securityPolicy: SecurityPolicy;

  constructor() {
    this.securityPolicy = new SecurityPolicy();
    this.setupGlobalErrorHandlers();
  }

  // ================================
  // MODULE LOADING
  // ================================

  async loadModule(moduleId: string): Promise<LoadedModuleInstance> {
    // Check if already loaded
    const existing = this.loadedModules.get(moduleId);
    if (existing && existing.isActive) {
      return existing;
    }

    // Check if currently loading
    const loadingPromise = this.loadingPromises.get(moduleId);
    if (loadingPromise) {
      return await loadingPromise;
    }

    // Start loading process
    const promise = this.performModuleLoad(moduleId);
    this.loadingPromises.set(moduleId, promise);

    try {
      const result = await promise;
      this.loadingPromises.delete(moduleId);
      return result;
    } catch (error) {
      this.loadingPromises.delete(moduleId);
      throw error;
    }
  }

  private async performModuleLoad(moduleId: string): Promise<LoadedModuleInstance> {
    try {
      // Get module from registry
      const module = moduleRegistry.getModule(moduleId);
      if (!module) {
        throw new Error(`Module ${moduleId} not found in registry`);
      }

      // Security check
      await this.securityPolicy.validateModule(module);

      // Create execution context
      const context = this.createExecutionContext(module);

      // Load and execute module
      const instance = await this.executeModule(module, context);

      // Create loaded module instance
      const loadedInstance: LoadedModuleInstance = {
        id: moduleId,
        module,
        instance,
        components: new Map(),
        services: new Map(),
        api: new Map(),
        routes: [],
        isActive: true,
        loadedAt: new Date(),
        errorCount: 0
      };

      // Extract module exports
      await this.extractModuleExports(loadedInstance, instance);

      // Store loaded instance
      this.loadedModules.set(moduleId, loadedInstance);

      console.log(`✅ Module ${moduleId} loaded successfully`);
      return loadedInstance;

    } catch (error) {
      this.logError(moduleId, error, 'module-load');
      throw error;
    }
  }

  async unloadModule(moduleId: string): Promise<void> {
    const loadedModule = this.loadedModules.get(moduleId);
    if (!loadedModule) {
      return; // Already unloaded
    }

    try {
      // Run module cleanup if available
      if (loadedModule.instance.cleanup && typeof loadedModule.instance.cleanup === 'function') {
        await loadedModule.instance.cleanup();
      }

      // Remove from active modules
      loadedModule.isActive = false;
      this.loadedModules.delete(moduleId);

      console.log(`✅ Module ${moduleId} unloaded successfully`);
    } catch (error) {
      this.logError(moduleId, error, 'module-unload');
      throw error;
    }
  }

  // ================================
  // MODULE EXECUTION
  // ================================

  private async executeModule(module: RealModule, context: ModuleExecutionContext): Promise<any> {
    // Find entry point
    const entryAsset = module.assets.find(asset => asset.path === module.entryPoint);
    if (!entryAsset || !entryAsset.content) {
      throw new Error(`Entry point ${module.entryPoint} not found or empty`);
    }

    try {
      // Create module scope
      const moduleScope = this.createModuleScope(context);
      
      // Prepare module code
      const moduleCode = this.prepareModuleCode(entryAsset.content);
      
      // Execute module
      const result = await this.evaluateModuleCode(moduleCode, moduleScope);
      
      return result;
    } catch (error) {
      throw new Error(`Failed to execute module ${module.id}: ${error.message}`);
    }
  }

  private createExecutionContext(module: RealModule): ModuleExecutionContext {
    return {
      moduleId: module.id,
      require: this.createRequireFunction(module),
      console: this.createModuleConsole(module.id),
      setTimeout: (callback: Function, delay: number) => setTimeout(callback, delay),
      clearTimeout: (id: number) => clearTimeout(id),
      setInterval: (callback: Function, delay: number) => setInterval(callback, delay),
      clearInterval: (id: number) => clearInterval(id),
      localStorage: this.createModuleStorage(module.id),
      fetch: this.createSecureFetch(module),
      React,
      __dirname: `/modules/${module.id}`,
      __filename: `/modules/${module.id}/${module.entryPoint}`
    };
  }

  private createModuleScope(context: ModuleExecutionContext): any {
    return {
      // Core JavaScript
      Object, Array, String, Number, Boolean, Date, Math, JSON, RegExp, Error,
      Promise, setTimeout, clearTimeout, setInterval, clearInterval,
      
      // Module context
      require: context.require,
      console: context.console,
      localStorage: context.localStorage,
      fetch: context.fetch,
      React: context.React,
      __dirname: context.__dirname,
      __filename: context.__filename,
      
      // Restricted/undefined globals
      window: undefined,
      document: undefined,
      global: undefined,
      process: undefined,
      Buffer: undefined,
      eval: undefined,
      Function: undefined,
      
      // Module exports
      module: { exports: {} },
      exports: {}
    };
  }

  private prepareModuleCode(code: string): string {
    // Wrap module code to capture exports
    return `
      (function(module, exports, require, console, localStorage, fetch, React, __dirname, __filename) {
        'use strict';
        ${code}
        return module.exports || exports;
      })
    `;
  }

  private async evaluateModuleCode(code: string, scope: any): Promise<any> {
    try {
      // Create function from code
      const moduleFunction = eval(code);
      
      // Execute with controlled scope
      const result = moduleFunction.call(
        scope,
        scope.module,
        scope.exports,
        scope.require,
        scope.console,
        scope.localStorage,
        scope.fetch,
        scope.React,
        scope.__dirname,
        scope.__filename
      );

      // Return exports
      return result || scope.module.exports || scope.exports;
    } catch (error) {
      throw new Error(`Module execution failed: ${error.message}`);
    }
  }

  // ================================
  // SECURE FUNCTIONS
  // ================================

  private createRequireFunction(module: RealModule): (moduleName: string) => any {
    return (moduleName: string) => {
      // Built-in React ecosystem
      if (moduleName === 'react') return React;
      if (moduleName.startsWith('@/components/ui/')) {
        return this.loadUIComponent(moduleName);
      }
      if (moduleName.startsWith('@/hooks/')) {
        return this.loadHook(moduleName);
      }
      if (moduleName.startsWith('@/lib/')) {
        return this.loadLibrary(moduleName);
      }

      // Module dependencies
      const dependency = module.dependencies.find(dep => dep.name === moduleName);
      if (dependency) {
        if (dependency.source === 'module-registry') {
          const depInstance = this.loadedModules.get(dependency.name);
          if (depInstance) {
            return depInstance.instance;
          }
        }
        if (dependency.source === 'npm') {
          return this.loadNpmModule(moduleName);
        }
      }

      // Whitelist check
      if (this.securityPolicy.isModuleAllowed(moduleName)) {
        return this.loadAllowedModule(moduleName);
      }

      throw new Error(`Module '${moduleName}' is not available or not allowed`);
    };
  }

  private createModuleConsole(moduleId: string): Console {
    return {
      log: (...args: any[]) => console.log(`[${moduleId}]`, ...args),
      error: (...args: any[]) => console.error(`[${moduleId}]`, ...args),
      warn: (...args: any[]) => console.warn(`[${moduleId}]`, ...args),
      info: (...args: any[]) => console.info(`[${moduleId}]`, ...args),
      debug: (...args: any[]) => console.debug(`[${moduleId}]`, ...args),
      trace: (...args: any[]) => console.trace(`[${moduleId}]`, ...args),
      group: (...args: any[]) => console.group(`[${moduleId}]`, ...args),
      groupEnd: () => console.groupEnd(),
      time: (label: string) => console.time(`[${moduleId}] ${label}`),
      timeEnd: (label: string) => console.timeEnd(`[${moduleId}] ${label}`),
      clear: () => {}, // Disabled for security
      table: (...args: any[]) => console.table(...args)
    } as Console;
  }

  private createModuleStorage(moduleId: string): Storage {
    const prefix = `module-${moduleId}-`;
    
    return {
      getItem: (key: string) => localStorage.getItem(prefix + key),
      setItem: (key: string, value: string) => localStorage.setItem(prefix + key, value),
      removeItem: (key: string) => localStorage.removeItem(prefix + key),
      clear: () => {
        // Only clear this module's data
        for (let i = localStorage.length - 1; i >= 0; i--) {
          const key = localStorage.key(i);
          if (key && key.startsWith(prefix)) {
            localStorage.removeItem(key);
          }
        }
      },
      key: (index: number) => {
        const keys = [];
        for (let i = 0; i < localStorage.length; i++) {
          const key = localStorage.key(i);
          if (key && key.startsWith(prefix)) {
            keys.push(key.substring(prefix.length));
          }
        }
        return keys[index] || null;
      },
      get length() {
        let count = 0;
        for (let i = 0; i < localStorage.length; i++) {
          const key = localStorage.key(i);
          if (key && key.startsWith(prefix)) {
            count++;
          }
        }
        return count;
      }
    };
  }

  private createSecureFetch(module: RealModule): typeof fetch {
    return async (input: RequestInfo | URL, init?: RequestInit) => {
      // Security policy check
      const url = typeof input === 'string' ? input : input instanceof URL ? input.href : input.url;
      
      if (!this.securityPolicy.isUrlAllowed(url, module)) {
        throw new Error(`Access to URL '${url}' is not allowed for module '${module.id}'`);
      }

      // Rate limiting
      if (!this.securityPolicy.checkRateLimit(module.id)) {
        throw new Error(`Rate limit exceeded for module '${module.id}'`);
      }

      // Add module identification header
      const headers = new Headers(init?.headers);
      headers.set('X-Module-ID', module.id);
      headers.set('X-Module-Version', module.version);

      return fetch(input, { ...init, headers });
    };
  }

  // ================================
  // MODULE EXPORTS EXTRACTION
  // ================================

  private async extractModuleExports(loadedInstance: LoadedModuleInstance, moduleExports: any): Promise<void> {
    try {
      // Extract React components
      if (moduleExports.components) {
        for (const [name, component] of Object.entries(moduleExports.components)) {
          if (React.isValidElement(component) || typeof component === 'function') {
            loadedInstance.components.set(name, component as React.ComponentType<any>);
          }
        }
      }

      // Extract services
      if (moduleExports.services) {
        for (const [name, service] of Object.entries(moduleExports.services)) {
          loadedInstance.services.set(name, service);
        }
      }

      // Extract API functions
      if (moduleExports.api) {
        for (const [name, func] of Object.entries(moduleExports.api)) {
          if (typeof func === 'function') {
            loadedInstance.api.set(name, func as Function);
          }
        }
      }

      // Extract routes
      if (moduleExports.routes && Array.isArray(moduleExports.routes)) {
        loadedInstance.routes = moduleExports.routes;
      }

    } catch (error) {
      throw new Error(`Failed to extract module exports: ${error.message}`);
    }
  }

  // ================================
  // MODULE HELPERS
  // ================================

  private loadUIComponent(moduleName: string): any {
    // Dynamic import of UI components
    try {
      const componentName = moduleName.split('/').pop();
      // Return a placeholder or dynamically load
      return { [componentName || 'Component']: () => React.createElement('div', {}, 'Loading...') };
    } catch (error) {
      throw new Error(`UI component '${moduleName}' not found`);
    }
  }

  private loadHook(moduleName: string): any {
    // Load custom hooks
    const hookName = moduleName.split('/').pop();
    return { [hookName || 'useHook']: () => ({}) };
  }

  private loadLibrary(moduleName: string): any {
    // Load utility libraries
    const libName = moduleName.split('/').pop();
    return { [libName || 'lib']: {} };
  }

  private loadNpmModule(moduleName: string): any {
    // Handle allowed npm modules
    const allowedNpmModules: Record<string, any> = {
      'lodash': {}, // Placeholder
      'moment': {}, // Placeholder
      'axios': {}, // Placeholder
    };

    if (allowedNpmModules[moduleName]) {
      return allowedNpmModules[moduleName];
    }

    throw new Error(`NPM module '${moduleName}' is not available`);
  }

  private loadAllowedModule(moduleName: string): any {
    // Load explicitly allowed modules
    const allowedModules: Record<string, any> = {
      'crypto': crypto,
      'url': URL,
    };

    return allowedModules[moduleName];
  }

  // ================================
  // ERROR HANDLING
  // ================================

  private setupGlobalErrorHandlers(): void {
    // Handle unhandled promise rejections in modules
    window.addEventListener('unhandledrejection', (event) => {
      // Try to identify which module caused the error
      const stack = event.reason?.stack || '';
      for (const [moduleId] of this.loadedModules) {
        if (stack.includes(`[${moduleId}]`)) {
          this.logError(moduleId, event.reason, 'unhandled-promise');
          break;
        }
      }
    });

    // Handle runtime errors
    window.addEventListener('error', (event) => {
      const stack = event.error?.stack || '';
      for (const [moduleId] of this.loadedModules) {
        if (stack.includes(`[${moduleId}]`)) {
          this.logError(moduleId, event.error, 'runtime-error');
          break;
        }
      }
    });
  }

  private logError(moduleId: string, error: Error, context: string): void {
    const moduleError: ModuleLoadError = {
      moduleId,
      error,
      timestamp: new Date(),
      context,
      recoverable: this.isRecoverableError(error)
    };

    this.errorLog.push(moduleError);

    // Update loaded module error count
    const loadedModule = this.loadedModules.get(moduleId);
    if (loadedModule) {
      loadedModule.errorCount++;
      loadedModule.lastError = error;

      // Disable module if too many errors
      if (loadedModule.errorCount > 5) {
        loadedModule.isActive = false;
        console.error(`❌ Module ${moduleId} disabled due to too many errors`);
      }
    }

    console.error(`Module ${moduleId} error [${context}]:`, error);
  }

  private isRecoverableError(error: Error): boolean {
    // Determine if error is recoverable
    const recoverablePatterns = [
      /network/i,
      /timeout/i,
      /temporary/i
    ];

    return recoverablePatterns.some(pattern => pattern.test(error.message));
  }

  // ================================
  // PUBLIC API
  // ================================

  getLoadedModule(moduleId: string): LoadedModuleInstance | undefined {
    return this.loadedModules.get(moduleId);
  }

  getAllLoadedModules(): LoadedModuleInstance[] {
    return Array.from(this.loadedModules.values());
  }

  getActiveModules(): LoadedModuleInstance[] {
    return Array.from(this.loadedModules.values()).filter(m => m.isActive);
  }

  getModuleComponent(moduleId: string, componentName: string): React.ComponentType<any> | undefined {
    const module = this.loadedModules.get(moduleId);
    return module?.components.get(componentName);
  }

  getModuleService(moduleId: string, serviceName: string): any {
    const module = this.loadedModules.get(moduleId);
    return module?.services.get(serviceName);
  }

  getModuleAPI(moduleId: string, apiName: string): Function | undefined {
    const module = this.loadedModules.get(moduleId);
    return module?.api.get(apiName);
  }

  getErrorLog(): ModuleLoadError[] {
    return [...this.errorLog];
  }

  clearErrorLog(): void {
    this.errorLog = [];
  }
}

// ================================
// SECURITY POLICY
// ================================

export class SecurityPolicy {
  private allowedUrls: RegExp[] = [
    /^https:\/\/api\.blacktop-blackout\.com\//,
    /^https:\/\/cdn\.blacktop-blackout\.com\//,
    /^https:\/\/.*\.supabase\.co\//
  ];

  private rateLimits: Map<string, { count: number; resetTime: number }> = new Map();
  private readonly rateLimit = 100; // requests per minute
  private readonly rateLimitWindow = 60000; // 1 minute

  async validateModule(module: RealModule): Promise<void> {
    // Check module permissions
    for (const permission of module.permissions) {
      if (!this.isPermissionAllowed(permission.resource, permission.actions)) {
        throw new Error(`Permission denied for resource '${permission.resource}'`);
      }
    }

    // Check dependencies
    for (const dependency of module.dependencies) {
      if (!this.isDependencyAllowed(dependency.name)) {
        throw new Error(`Dependency '${dependency.name}' is not allowed`);
      }
    }
  }

  isModuleAllowed(moduleName: string): boolean {
    const allowedModules = [
      'crypto',
      'url',
      'lodash',
      'moment',
      'axios'
    ];

    return allowedModules.includes(moduleName);
  }

  isUrlAllowed(url: string, module: RealModule): boolean {
    // Check against allowed URL patterns
    return this.allowedUrls.some(pattern => pattern.test(url));
  }

  checkRateLimit(moduleId: string): boolean {
    const now = Date.now();
    const limit = this.rateLimits.get(moduleId);

    if (!limit || now > limit.resetTime) {
      // Reset rate limit
      this.rateLimits.set(moduleId, {
        count: 1,
        resetTime: now + this.rateLimitWindow
      });
      return true;
    }

    if (limit.count >= this.rateLimit) {
      return false; // Rate limit exceeded
    }

    limit.count++;
    return true;
  }

  private isPermissionAllowed(resource: string, actions: string[]): boolean {
    // Define allowed permissions
    const allowedPermissions: Record<string, string[]> = {
      'database': ['read', 'write'],
      'api': ['call'],
      'storage': ['read', 'write'],
      'network': ['fetch']
    };

    const allowed = allowedPermissions[resource];
    if (!allowed) return false;

    return actions.every(action => allowed.includes(action));
  }

  private isDependencyAllowed(dependencyName: string): boolean {
    const allowedDependencies = [
      'react',
      'lodash',
      'moment',
      'axios',
      '@/components/ui/button',
      '@/components/ui/card',
      '@/hooks/use-toast'
    ];

    return allowedDependencies.includes(dependencyName);
  }
}

// ================================
// SINGLETON INSTANCE
// ================================

export const moduleLoader = new ModuleLoader();