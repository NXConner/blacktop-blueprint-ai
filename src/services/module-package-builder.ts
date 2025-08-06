import { RealModule, ModulePackage } from './module-registry';
import JSZip from 'jszip';

// ================================
// MODULE PACKAGE BUILDER
// ================================

export interface ModuleManifest {
  id: string;
  name: string;
  version: string;
  description: string;
  author: string;
  license: string;
  homepage?: string;
  repository?: string;
  keywords: string[];
  
  // Module structure
  entryPoint: string;
  dependencies: ModuleDependency[];
  peerDependencies?: ModuleDependency[];
  
  // Configuration
  config: ModuleConfigDefinition;
  permissions: ModulePermissionDefinition[];
  
  // Metadata
  category: string;
  price?: number;
  tags: string[];
  compatibility: CompatibilityInfo;
  
  // Build info
  buildDate: string;
  buildTools: string[];
  minSystemVersion: string;
}

export interface ModuleDependency {
  name: string;
  version: string;
  type: 'required' | 'optional' | 'peer';
  source: 'npm' | 'module-registry' | 'system';
}

export interface ModuleConfigDefinition {
  schema: any; // JSON Schema
  defaultValues: Record<string, any>;
  required: string[];
}

export interface ModulePermissionDefinition {
  resource: string;
  actions: string[];
  description: string;
  required: boolean;
}

export interface CompatibilityInfo {
  platform: string[];
  nodeVersion: string;
  browserVersion: Record<string, string>;
  systemRequirements: string[];
}

export interface BuildOptions {
  outputDir: string;
  minify: boolean;
  sourceMap: boolean;
  target: 'browser' | 'node' | 'universal';
  optimization: 'development' | 'production';
  signing: SigningOptions;
}

export interface SigningOptions {
  enabled: boolean;
  algorithm: 'RSA-SHA256' | 'ECDSA-SHA256';
  privateKey?: string;
  certificate?: string;
}

export interface PackageMetadata {
  manifest: ModuleManifest;
  files: FileEntry[];
  signature?: string;
  checksum: string;
  size: number;
  createdAt: Date;
}

export interface FileEntry {
  path: string;
  content: string | Uint8Array;
  size: number;
  checksum: string;
  type: 'javascript' | 'typescript' | 'css' | 'json' | 'image' | 'data';
}

// ================================
// PACKAGE BUILDER SERVICE
// ================================

export class ModulePackageBuilder {
  private signingKey?: CryptoKey;
  private certificate?: string;

  constructor() {
    this.setupCrypto();
  }

  // ================================
  // PACKAGE BUILDING
  // ================================

  async buildPackage(
    sourceDir: string, 
    manifest: ModuleManifest, 
    options: BuildOptions
  ): Promise<ModulePackage> {
    try {
      console.log(`📦 Building package: ${manifest.name}@${manifest.version}`);

      // Validate manifest
      await this.validateManifest(manifest);

      // Process source files
      const files = await this.processSourceFiles(sourceDir, options);

      // Build and optimize
      const optimizedFiles = await this.optimizeFiles(files, options);

      // Create package
      const packageData = await this.createPackage(manifest, optimizedFiles, options);

      // Sign package if enabled
      if (options.signing.enabled) {
        packageData.signature = await this.signPackage(packageData);
      }

      console.log(`✅ Package built successfully: ${packageData.checksum}`);
      return packageData;

    } catch (error) {
      console.error(`❌ Package build failed:`, error);
      throw error;
    }
  }

  async createPackageFromModule(module: RealModule, options: BuildOptions): Promise<ModulePackage> {
    try {
      // Convert RealModule to manifest
      const manifest: ModuleManifest = {
        id: module.id,
        name: module.name,
        version: module.version,
        description: module.description,
        author: module.author,
        license: module.license,
        keywords: [],
        entryPoint: module.entryPoint,
        dependencies: module.dependencies,
        config: {
          schema: module.config.schema,
          defaultValues: module.config.defaults,
          required: module.config.schema.required || []
        },
        permissions: module.permissions.map(p => ({
          resource: p.resource,
          actions: p.actions,
          description: `Access to ${p.resource}`,
          required: true
        })),
        category: module.category,
        tags: [],
        compatibility: {
          platform: ['web', 'node'],
          nodeVersion: '>=18.0.0',
          browserVersion: {
            chrome: '>=90',
            firefox: '>=90',
            safari: '>=14'
          },
          systemRequirements: []
        },
        buildDate: new Date().toISOString(),
        buildTools: ['typescript', 'webpack'],
        minSystemVersion: '1.0.0'
      };

      // Create files from module assets
      const files = new Map<string, string | Uint8Array>();
      for (const asset of module.assets) {
        if (asset.content) {
          files.set(asset.path, asset.content);
        }
      }

      return {
        manifest,
        files,
        signature: ''
      };

    } catch (error) {
      console.error('Failed to create package from module:', error);
      throw error;
    }
  }

  // ================================
  // FILE PROCESSING
  // ================================

  private async processSourceFiles(sourceDir: string, options: BuildOptions): Promise<Map<string, FileEntry>> {
    const files = new Map<string, FileEntry>();

    try {
      // In a real implementation, this would read from the file system
      // For now, we'll simulate with some common file patterns
      
      const commonFiles = [
        { path: 'index.js', type: 'javascript' as const },
        { path: 'package.json', type: 'json' as const },
        { path: 'README.md', type: 'data' as const },
        { path: 'styles.css', type: 'css' as const }
      ];

      for (const fileInfo of commonFiles) {
        const content = await this.readFileContent(sourceDir, fileInfo.path);
        if (content) {
          const entry: FileEntry = {
            path: fileInfo.path,
            content,
            size: content.length,
            checksum: await this.calculateChecksum(content),
            type: fileInfo.type
          };
          files.set(fileInfo.path, entry);
        }
      }

      return files;
    } catch (error) {
      throw new Error(`Failed to process source files: ${error.message}`);
    }
  }

  private async readFileContent(sourceDir: string, filePath: string): Promise<string> {
    // Mock file content for demo purposes
    const mockFiles: Record<string, string> = {
      'index.js': `
        // Module entry point
        const React = require('react');
        
        const ExampleComponent = () => {
          return React.createElement('div', null, 'Hello from module!');
        };
        
        module.exports = {
          components: { ExampleComponent },
          services: {},
          api: {}
        };
      `,
      'package.json': JSON.stringify({
        name: 'example-module',
        version: '1.0.0',
        description: 'Example module',
        main: 'index.js'
      }, null, 2),
      'README.md': '# Example Module\n\nThis is an example module.',
      'styles.css': `
        .example-component {
          padding: 1rem;
          background: #f5f5f5;
          border-radius: 4px;
        }
      `
    };

    return mockFiles[filePath] || '';
  }

  private async optimizeFiles(files: Map<string, FileEntry>, options: BuildOptions): Promise<Map<string, FileEntry>> {
    const optimizedFiles = new Map<string, FileEntry>();

    for (const [path, file] of files) {
      let optimizedContent = file.content;

      // Minification for production
      if (options.optimization === 'production' && options.minify) {
        optimizedContent = await this.minifyFile(file);
      }

      // TypeScript compilation
      if (file.type === 'typescript') {
        optimizedContent = await this.compileTypeScript(file.content as string);
      }

      const optimizedFile: FileEntry = {
        ...file,
        content: optimizedContent,
        size: typeof optimizedContent === 'string' ? optimizedContent.length : optimizedContent.byteLength,
        checksum: await this.calculateChecksum(optimizedContent)
      };

      optimizedFiles.set(path, optimizedFile);
    }

    return optimizedFiles;
  }

  private async minifyFile(file: FileEntry): Promise<string | Uint8Array> {
    // Simple minification simulation
    if (file.type === 'javascript' && typeof file.content === 'string') {
      return file.content
        .replace(/\/\*[\s\S]*?\*\//g, '') // Remove block comments
        .replace(/\/\/.*$/gm, '') // Remove line comments
        .replace(/\s+/g, ' ') // Collapse whitespace
        .trim();
    }

    if (file.type === 'css' && typeof file.content === 'string') {
      return file.content
        .replace(/\/\*[\s\S]*?\*\//g, '') // Remove comments
        .replace(/\s+/g, ' ') // Collapse whitespace
        .replace(/;\s*}/g, '}') // Remove unnecessary semicolons
        .trim();
    }

    return file.content;
  }

  private async compileTypeScript(content: string): Promise<string> {
    // Simplified TypeScript compilation simulation
    return content
      .replace(/:\s*string/g, '') // Remove type annotations
      .replace(/:\s*number/g, '')
      .replace(/:\s*boolean/g, '')
      .replace(/interface\s+\w+\s*{[^}]*}/g, '') // Remove interfaces
      .replace(/export\s+/g, 'module.exports.') // Convert exports
      .replace(/import\s+.*?from\s+['"].*?['"];?/g, ''); // Remove imports
  }

  // ================================
  // PACKAGE CREATION
  // ================================

  private async createPackage(
    manifest: ModuleManifest, 
    files: Map<string, FileEntry>, 
    options: BuildOptions
  ): Promise<ModulePackage> {
    try {
      // Create ZIP package
      const zip = new JSZip();

      // Add manifest
      zip.file('manifest.json', JSON.stringify(manifest, null, 2));

      // Add files
      for (const [path, file] of files) {
        zip.file(path, file.content);
      }

      // Generate package
      const packageData = await zip.generateAsync({
        type: 'uint8array',
        compression: 'DEFLATE',
        compressionOptions: { level: 9 }
      });

      // Calculate checksum
      const checksum = await this.calculateChecksum(packageData);

      // Convert to ModulePackage format
      const packageFiles = new Map<string, string | Uint8Array>();
      for (const [path, file] of files) {
        packageFiles.set(path, file.content);
      }

      const realModule: RealModule = {
        id: manifest.id,
        name: manifest.name,
        version: manifest.version,
        description: manifest.description,
        author: manifest.author,
        category: manifest.category as any,
        license: manifest.license,
        entryPoint: manifest.entryPoint,
        dependencies: manifest.dependencies,
        assets: Array.from(files.values()).map(file => ({
          path: file.path,
          type: file.type as any,
          content: typeof file.content === 'string' ? file.content : undefined,
          checksum: file.checksum
        })),
        config: {
          schema: manifest.config.schema,
          defaults: manifest.config.defaultValues,
          current: manifest.config.defaultValues
        },
        permissions: manifest.permissions.map(p => ({
          resource: p.resource,
          actions: p.actions
        })),
        hooks: [],
        downloadUrl: '',
        checksum,
        size: packageData.byteLength,
        installCount: 0,
        rating: 0,
        isInstalled: false,
        isActive: false,
        lastUpdated: new Date()
      };

      return {
        manifest: realModule,
        files: packageFiles,
        signature: ''
      };

    } catch (error) {
      throw new Error(`Failed to create package: ${error.message}`);
    }
  }

  // ================================
  // PACKAGE VALIDATION
  // ================================

  private async validateManifest(manifest: ModuleManifest): Promise<void> {
    const errors: string[] = [];

    // Required fields
    if (!manifest.id) errors.push('Missing required field: id');
    if (!manifest.name) errors.push('Missing required field: name');
    if (!manifest.version) errors.push('Missing required field: version');
    if (!manifest.entryPoint) errors.push('Missing required field: entryPoint');

    // Version format
    if (manifest.version && !/^\d+\.\d+\.\d+(-.*)?$/.test(manifest.version)) {
      errors.push('Invalid version format (must be semantic version)');
    }

    // ID format
    if (manifest.id && !/^[a-z0-9-]+$/.test(manifest.id)) {
      errors.push('Invalid ID format (lowercase alphanumeric and hyphens only)');
    }

    // Dependencies
    for (const dep of manifest.dependencies) {
      if (!dep.name || !dep.version) {
        errors.push(`Invalid dependency: ${JSON.stringify(dep)}`);
      }
    }

    if (errors.length > 0) {
      throw new Error(`Manifest validation failed:\n${errors.join('\n')}`);
    }
  }

  async validatePackage(packageData: ModulePackage): Promise<boolean> {
    try {
      // Validate manifest
      await this.validateManifest(packageData.manifest as any);

      // Verify entry point exists
      const entryPoint = packageData.manifest.entryPoint;
      if (!packageData.files.has(entryPoint)) {
        throw new Error(`Entry point file not found: ${entryPoint}`);
      }

      // Verify signature if present
      if (packageData.signature) {
        const isValid = await this.verifySignature(packageData);
        if (!isValid) {
          throw new Error('Package signature verification failed');
        }
      }

      return true;
    } catch (error) {
      console.error('Package validation failed:', error);
      return false;
    }
  }

  // ================================
  // SIGNING & VERIFICATION
  // ================================

  private async setupCrypto(): Promise<void> {
    try {
      // Generate signing key pair (in production, this would be loaded securely)
      const keyPair = await crypto.subtle.generateKey(
        {
          name: 'RSA-PSS',
          modulusLength: 2048,
          publicExponent: new Uint8Array([1, 0, 1]),
          hash: 'SHA-256'
        },
        true,
        ['sign', 'verify']
      );

      this.signingKey = keyPair.privateKey;
    } catch (error) {
      console.warn('Failed to setup crypto for signing:', error);
    }
  }

  private async signPackage(packageData: ModulePackage): Promise<string> {
    if (!this.signingKey) {
      throw new Error('Signing key not available');
    }

    try {
      // Create signature data
      const signatureData = JSON.stringify({
        manifest: packageData.manifest,
        files: Array.from(packageData.files.entries()).map(([path, content]) => ({
          path,
          checksum: typeof content === 'string' 
            ? this.calculateChecksum(content) 
            : this.calculateChecksum(content)
        }))
      });

      // Sign the data
      const signature = await crypto.subtle.sign(
        {
          name: 'RSA-PSS',
          saltLength: 32
        },
        this.signingKey,
        new TextEncoder().encode(signatureData)
      );

      // Convert to base64
      return btoa(String.fromCharCode(...new Uint8Array(signature)));
    } catch (error) {
      throw new Error(`Failed to sign package: ${error.message}`);
    }
  }

  private async verifySignature(packageData: ModulePackage): Promise<boolean> {
    // In a real implementation, this would use the public key
    // For now, we'll just return true if signature exists
    return !!packageData.signature;
  }

  // ================================
  // UTILITIES
  // ================================

  private async calculateChecksum(data: string | Uint8Array): Promise<string> {
    const encoder = new TextEncoder();
    const dataArray = typeof data === 'string' ? encoder.encode(data) : data;
    
    const hashBuffer = await crypto.subtle.digest('SHA-256', dataArray);
    const hashArray = Array.from(new Uint8Array(hashBuffer));
    
    return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
  }

  // ================================
  // PACKAGE DISTRIBUTION
  // ================================

  async publishPackage(packageData: ModulePackage, registry: string): Promise<string> {
    try {
      const packageId = `${packageData.manifest.id}@${packageData.manifest.version}`;
      console.log(`📤 Publishing package: ${packageId}`);

      // Convert package to binary format
      const packageBinary = await this.serializePackage(packageData);

      // Upload to registry
      const uploadUrl = await this.uploadToRegistry(packageBinary, registry);

      console.log(`✅ Package published: ${uploadUrl}`);
      return uploadUrl;

    } catch (error) {
      console.error('Failed to publish package:', error);
      throw error;
    }
  }

  private async serializePackage(packageData: ModulePackage): Promise<Uint8Array> {
    const zip = new JSZip();

    // Add manifest
    zip.file('manifest.json', JSON.stringify(packageData.manifest));

    // Add files
    for (const [path, content] of packageData.files) {
      zip.file(path, content);
    }

    // Add signature if present
    if (packageData.signature) {
      zip.file('signature.txt', packageData.signature);
    }

    return zip.generateAsync({
      type: 'uint8array',
      compression: 'DEFLATE',
      compressionOptions: { level: 9 }
    });
  }

  private async uploadToRegistry(packageData: Uint8Array, registry: string): Promise<string> {
    // Mock upload - in reality, this would upload to a package registry
    const mockUrl = `${registry}/packages/${Date.now()}.zip`;
    
    // Simulate upload delay
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    return mockUrl;
  }

  // ================================
  // PACKAGE METADATA
  // ================================

  generatePackageMetadata(packageData: ModulePackage): PackageMetadata {
    const files: FileEntry[] = [];
    
    for (const [path, content] of packageData.files) {
      files.push({
        path,
        content,
        size: typeof content === 'string' ? content.length : content.byteLength,
        checksum: '', // Would calculate in real implementation
        type: this.getFileType(path)
      });
    }

    return {
      manifest: packageData.manifest as any,
      files,
      signature: packageData.signature,
      checksum: '', // Would calculate in real implementation
      size: files.reduce((total, file) => total + file.size, 0),
      createdAt: new Date()
    };
  }

  private getFileType(filePath: string): FileEntry['type'] {
    const ext = filePath.split('.').pop()?.toLowerCase();
    
    switch (ext) {
      case 'js': return 'javascript';
      case 'ts': return 'typescript';
      case 'css': return 'css';
      case 'json': return 'json';
      case 'png':
      case 'jpg':
      case 'jpeg':
      case 'gif':
      case 'svg': return 'image';
      default: return 'data';
    }
  }

  // ================================
  // PACKAGE INSTALLATION
  // ================================

  async installPackageFromUrl(packageUrl: string): Promise<ModulePackage> {
    try {
      console.log(`⬇️ Downloading package from: ${packageUrl}`);

      // Download package
      const response = await fetch(packageUrl);
      if (!response.ok) {
        throw new Error(`Download failed: ${response.statusText}`);
      }

      const packageData = await response.arrayBuffer();
      
      // Parse package
      const modulePackage = await this.parsePackage(packageData);
      
      // Validate package
      const isValid = await this.validatePackage(modulePackage);
      if (!isValid) {
        throw new Error('Package validation failed');
      }

      console.log(`✅ Package downloaded and validated`);
      return modulePackage;

    } catch (error) {
      console.error('Failed to install package:', error);
      throw error;
    }
  }

  private async parsePackage(packageData: ArrayBuffer): Promise<ModulePackage> {
    try {
      const zip = await JSZip.loadAsync(packageData);
      const files = new Map<string, string | Uint8Array>();
      let manifest: RealModule;

      // Extract manifest
      const manifestFile = zip.file('manifest.json');
      if (!manifestFile) {
        throw new Error('Package manifest not found');
      }

      const manifestContent = await manifestFile.async('string');
      manifest = JSON.parse(manifestContent);

      // Extract files
      for (const [path, file] of Object.entries(zip.files)) {
        if (path === 'manifest.json' || path === 'signature.txt') continue;
        
        if (!file.dir) {
          const content = await file.async('string');
          files.set(path, content);
        }
      }

      // Extract signature if present
      let signature = '';
      const signatureFile = zip.file('signature.txt');
      if (signatureFile) {
        signature = await signatureFile.async('string');
      }

      return {
        manifest,
        files,
        signature
      };

    } catch (error) {
      throw new Error(`Failed to parse package: ${error.message}`);
    }
  }
}

// ================================
// BUILDER UTILITIES
// ================================

export class ModuleBuilder {
  private packageBuilder: ModulePackageBuilder;

  constructor() {
    this.packageBuilder = new ModulePackageBuilder();
  }

  async createModule(config: {
    id: string;
    name: string;
    version: string;
    description: string;
    author: string;
    category: string;
    entryPoint: string;
    files: Record<string, string>;
  }): Promise<ModulePackage> {
    
    // Create manifest
    const manifest: ModuleManifest = {
      id: config.id,
      name: config.name,
      version: config.version,
      description: config.description,
      author: config.author,
      license: 'MIT',
      keywords: [],
      entryPoint: config.entryPoint,
      dependencies: [],
      config: {
        schema: { type: 'object', properties: {} },
        defaultValues: {},
        required: []
      },
      permissions: [],
      category: config.category,
      tags: [],
      compatibility: {
        platform: ['web'],
        nodeVersion: '>=18.0.0',
        browserVersion: { chrome: '>=90' },
        systemRequirements: []
      },
      buildDate: new Date().toISOString(),
      buildTools: ['custom'],
      minSystemVersion: '1.0.0'
    };

    // Create files map
    const files = new Map<string, string | Uint8Array>();
    for (const [path, content] of Object.entries(config.files)) {
      files.set(path, content);
    }

    // Convert to RealModule
    const realModule: RealModule = {
      id: manifest.id,
      name: manifest.name,
      version: manifest.version,
      description: manifest.description,
      author: manifest.author,
      category: manifest.category as any,
      license: manifest.license,
      entryPoint: manifest.entryPoint,
      dependencies: [],
      assets: Array.from(files.entries()).map(([path, content]) => ({
        path,
        type: 'javascript' as any,
        content: typeof content === 'string' ? content : undefined,
        checksum: ''
      })),
      config: {
        schema: manifest.config.schema,
        defaults: manifest.config.defaultValues,
        current: manifest.config.defaultValues
      },
      permissions: [],
      hooks: [],
      downloadUrl: '',
      checksum: '',
      size: 0,
      installCount: 0,
      rating: 0,
      isInstalled: false,
      isActive: false,
      lastUpdated: new Date()
    };

    return {
      manifest: realModule,
      files,
      signature: ''
    };
  }
}

// ================================
// EXPORT INSTANCES
// ================================

export const modulePackageBuilder = new ModulePackageBuilder();
export const moduleBuilder = new ModuleBuilder();