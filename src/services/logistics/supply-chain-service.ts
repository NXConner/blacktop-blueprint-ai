import { supabase } from '@/integrations/supabase/client';

// Supply Chain Management types
export interface SupplyChain {
  id: string;
  name: string;
  type: SupplyChainType;
  suppliers: Supplier[];
  transportation: Transportation[];
  inventory: Inventory[];
  procurement: ProcurementOrder[];
  logistics: LogisticsOperation[];
  performance_metrics: SupplyChainMetrics;
  risk_assessment: RiskAssessment;
  created_at: string;
  updated_at: string;
}

export enum SupplyChainType {
  CONSTRUCTION_MATERIALS = 'construction_materials',
  EQUIPMENT_PARTS = 'equipment_parts',
  FUEL_LUBRICANTS = 'fuel_lubricants',
  SAFETY_EQUIPMENT = 'safety_equipment',
  TOOLS_HARDWARE = 'tools_hardware',
  SERVICES = 'services'
}

export interface Supplier {
  id: string;
  company_name: string;
  contact_info: SupplierContact;
  categories: string[];
  certifications: Certification[];
  performance: SupplierPerformance;
  contracts: SupplierContract[];
  risk_profile: SupplierRisk;
  sustainability_score: number;
  status: SupplierStatus;
}

export enum SupplierStatus {
  ACTIVE = 'active',
  INACTIVE = 'inactive',
  PENDING_APPROVAL = 'pending_approval',
  SUSPENDED = 'suspended',
  BLACKLISTED = 'blacklisted'
}

export interface SupplierContact {
  primary_contact: string;
  email: string;
  phone: string;
  address: Address;
  website?: string;
  emergency_contact?: string;
}

export interface Address {
  street: string;
  city: string;
  state: string;
  zip_code: string;
  country: string;
}

export interface Certification {
  type: string;
  issuing_body: string;
  certification_number: string;
  issue_date: string;
  expiry_date: string;
  verified: boolean;
}

export interface SupplierPerformance {
  overall_rating: number;
  quality_score: number;
  delivery_score: number;
  cost_competitiveness: number;
  responsiveness: number;
  compliance_score: number;
  total_orders: number;
  on_time_delivery_rate: number;
  defect_rate: number;
  cost_savings_achieved: number;
}

export interface SupplierContract {
  id: string;
  contract_type: ContractType;
  start_date: string;
  end_date: string;
  value: number;
  terms: ContractTerms;
  sla: ServiceLevelAgreement;
  status: 'active' | 'expired' | 'terminated' | 'pending';
}

export enum ContractType {
  MASTER_SERVICE_AGREEMENT = 'master_service_agreement',
  PURCHASE_ORDER = 'purchase_order',
  FRAMEWORK_AGREEMENT = 'framework_agreement',
  LONG_TERM_CONTRACT = 'long_term_contract',
  SPOT_PURCHASE = 'spot_purchase'
}

export interface ContractTerms {
  payment_terms: string;
  delivery_terms: string;
  quality_requirements: string[];
  penalties: PenaltyClause[];
  force_majeure: boolean;
  termination_clause: string;
}

export interface PenaltyClause {
  violation_type: string;
  penalty_amount: number;
  penalty_type: 'fixed' | 'percentage';
  grace_period: number;
}

export interface ServiceLevelAgreement {
  delivery_time: number;
  quality_threshold: number;
  response_time: number;
  availability: number;
  penalties: SLAPenalty[];
}

export interface SLAPenalty {
  metric: string;
  threshold: number;
  penalty_rate: number;
}

export interface SupplierRisk {
  financial_risk: RiskLevel;
  operational_risk: RiskLevel;
  geographic_risk: RiskLevel;
  regulatory_risk: RiskLevel;
  cyber_risk: RiskLevel;
  overall_risk: RiskLevel;
  mitigation_strategies: string[];
}

export enum RiskLevel {
  LOW = 'low',
  MEDIUM = 'medium',
  HIGH = 'high',
  CRITICAL = 'critical'
}

export interface Transportation {
  id: string;
  mode: TransportMode;
  carrier: TransportCarrier;
  routes: TransportRoute[];
  fleet: Vehicle[];
  costs: TransportCosts;
  performance: TransportPerformance;
  tracking: TrackingInfo;
}

export enum TransportMode {
  TRUCK = 'truck',
  RAIL = 'rail',
  AIR = 'air',
  OCEAN = 'ocean',
  PIPELINE = 'pipeline',
  MULTIMODAL = 'multimodal'
}

export interface TransportCarrier {
  id: string;
  name: string;
  type: CarrierType;
  capabilities: string[];
  coverage_areas: string[];
  certifications: string[];
  insurance: InsuranceInfo;
  performance_rating: number;
}

export enum CarrierType {
  ASSET_BASED = 'asset_based',
  BROKER = 'broker',
  THIRD_PARTY_LOGISTICS = '3pl',
  FREIGHT_FORWARDER = 'freight_forwarder',
  COURIER = 'courier'
}

export interface InsuranceInfo {
  liability_coverage: number;
  cargo_coverage: number;
  policy_number: string;
  expiry_date: string;
  verified: boolean;
}

export interface TransportRoute {
  id: string;
  origin: Location;
  destination: Location;
  distance: number;
  estimated_time: number;
  cost_per_mile: number;
  restrictions: string[];
  preferred: boolean;
}

export interface Location {
  name: string;
  address: Address;
  coordinates: { latitude: number; longitude: number };
  facility_type: string;
  operating_hours: string;
  contact: string;
}

export interface Vehicle {
  id: string;
  type: VehicleType;
  make: string;
  model: string;
  year: number;
  capacity: VehicleCapacity;
  fuel_type: string;
  maintenance: MaintenanceRecord[];
  driver_info: DriverInfo;
  tracking_device: string;
  status: VehicleStatus;
}

export enum VehicleType {
  PICKUP_TRUCK = 'pickup_truck',
  BOX_TRUCK = 'box_truck',
  FLATBED = 'flatbed',
  SEMI_TRAILER = 'semi_trailer',
  DUMP_TRUCK = 'dump_truck',
  CRANE_TRUCK = 'crane_truck',
  DELIVERY_VAN = 'delivery_van'
}

export enum VehicleStatus {
  AVAILABLE = 'available',
  IN_TRANSIT = 'in_transit',
  LOADING = 'loading',
  UNLOADING = 'unloading',
  MAINTENANCE = 'maintenance',
  OUT_OF_SERVICE = 'out_of_service'
}

export interface VehicleCapacity {
  weight_capacity: number;
  volume_capacity: number;
  dimension_limits: {
    length: number;
    width: number;
    height: number;
  };
}

export interface MaintenanceRecord {
  date: string;
  type: string;
  description: string;
  cost: number;
  mileage: number;
  next_service_due: string;
}

export interface DriverInfo {
  name: string;
  license_number: string;
  license_expiry: string;
  certifications: string[];
  rating: number;
  phone: string;
}

export interface TransportCosts {
  fuel_cost: number;
  labor_cost: number;
  equipment_cost: number;
  insurance_cost: number;
  toll_fees: number;
  storage_cost: number;
  total_cost: number;
  cost_per_mile: number;
}

export interface TransportPerformance {
  on_time_delivery: number;
  damage_rate: number;
  fuel_efficiency: number;
  utilization_rate: number;
  customer_satisfaction: number;
  cost_per_delivery: number;
}

export interface TrackingInfo {
  tracking_number: string;
  current_location: Location;
  status: string;
  estimated_delivery: string;
  proof_of_delivery?: string;
  delivery_notes?: string;
}

export interface Inventory {
  id: string;
  item: InventoryItem;
  location: WarehouseLocation;
  quantity_on_hand: number;
  quantity_reserved: number;
  quantity_available: number;
  reorder_point: number;
  max_stock_level: number;
  cost_information: CostInfo;
  movement_history: InventoryMovement[];
  abc_classification: 'A' | 'B' | 'C';
}

export interface InventoryItem {
  sku: string;
  name: string;
  description: string;
  category: string;
  unit_of_measure: string;
  weight: number;
  dimensions: ItemDimensions;
  hazardous: boolean;
  shelf_life?: number;
  storage_requirements: string[];
}

export interface ItemDimensions {
  length: number;
  width: number;
  height: number;
  unit: string;
}

export interface WarehouseLocation {
  warehouse_id: string;
  zone: string;
  aisle: string;
  shelf: string;
  bin: string;
  coordinates?: { x: number; y: number; z: number };
}

export interface CostInfo {
  unit_cost: number;
  total_value: number;
  average_cost: number;
  last_purchase_price: number;
  standard_cost: number;
  carrying_cost: number;
}

export interface InventoryMovement {
  id: string;
  movement_type: MovementType;
  quantity: number;
  from_location?: string;
  to_location?: string;
  reason_code: string;
  reference_document: string;
  timestamp: string;
  user_id: string;
}

export enum MovementType {
  RECEIPT = 'receipt',
  ISSUE = 'issue',
  TRANSFER = 'transfer',
  ADJUSTMENT = 'adjustment',
  RETURN = 'return',
  SCRAP = 'scrap'
}

export interface ProcurementOrder {
  id: string;
  order_number: string;
  supplier_id: string;
  order_type: OrderType;
  status: OrderStatus;
  line_items: OrderLineItem[];
  total_amount: number;
  currency: string;
  order_date: string;
  requested_delivery_date: string;
  actual_delivery_date?: string;
  shipping_address: Address;
  billing_address: Address;
  terms_and_conditions: string;
  approvals: Approval[];
}

export enum OrderType {
  STANDARD = 'standard',
  BLANKET = 'blanket',
  CONTRACT = 'contract',
  EMERGENCY = 'emergency',
  SERVICES = 'services'
}

export enum OrderStatus {
  DRAFT = 'draft',
  PENDING_APPROVAL = 'pending_approval',
  APPROVED = 'approved',
  SENT_TO_SUPPLIER = 'sent_to_supplier',
  ACKNOWLEDGED = 'acknowledged',
  IN_PRODUCTION = 'in_production',
  SHIPPED = 'shipped',
  DELIVERED = 'delivered',
  INVOICED = 'invoiced',
  CLOSED = 'closed',
  CANCELLED = 'cancelled'
}

export interface OrderLineItem {
  line_number: number;
  item_code: string;
  description: string;
  quantity: number;
  unit_price: number;
  line_total: number;
  requested_date: string;
  delivery_status: string;
  receiving_notes?: string;
}

export interface Approval {
  approver: string;
  approval_date: string;
  level: number;
  status: 'pending' | 'approved' | 'rejected';
  comments?: string;
}

export interface LogisticsOperation {
  id: string;
  operation_type: OperationType;
  origin: Location;
  destination: Location;
  cargo: CargoInfo;
  schedule: OperationSchedule;
  resources: ResourceAllocation;
  costs: OperationCosts;
  performance: OperationPerformance;
  documentation: LogisticsDocument[];
}

export enum OperationType {
  PICKUP = 'pickup',
  DELIVERY = 'delivery',
  TRANSFER = 'transfer',
  CONSOLIDATION = 'consolidation',
  CROSS_DOCK = 'cross_dock',
  STORAGE = 'storage'
}

export interface CargoInfo {
  items: CargoItem[];
  total_weight: number;
  total_volume: number;
  special_handling: string[];
  insurance_value: number;
  customs_info?: CustomsInfo;
}

export interface CargoItem {
  item_id: string;
  description: string;
  quantity: number;
  weight: number;
  volume: number;
  value: number;
  hazmat_class?: string;
}

export interface CustomsInfo {
  hs_code: string;
  country_of_origin: string;
  customs_value: number;
  documentation: string[];
}

export interface OperationSchedule {
  planned_start: string;
  planned_end: string;
  actual_start?: string;
  actual_end?: string;
  milestones: Milestone[];
}

export interface Milestone {
  name: string;
  planned_time: string;
  actual_time?: string;
  status: 'pending' | 'completed' | 'delayed';
}

export interface ResourceAllocation {
  vehicles: string[];
  drivers: string[];
  equipment: string[];
  facilities: string[];
}

export interface OperationCosts {
  labor_cost: number;
  vehicle_cost: number;
  fuel_cost: number;
  handling_cost: number;
  storage_cost: number;
  other_costs: number;
  total_cost: number;
}

export interface OperationPerformance {
  on_time_performance: number;
  cost_variance: number;
  quality_score: number;
  efficiency_rating: number;
  customer_satisfaction: number;
}

export interface LogisticsDocument {
  document_type: string;
  document_number: string;
  file_url: string;
  created_date: string;
  required: boolean;
  verified: boolean;
}

export interface SupplyChainMetrics {
  overall_performance: number;
  cost_efficiency: number;
  delivery_performance: number;
  quality_metrics: QualityMetrics;
  sustainability_metrics: SustainabilityMetrics;
  risk_metrics: RiskMetrics;
}

export interface QualityMetrics {
  defect_rate: number;
  return_rate: number;
  customer_complaints: number;
  quality_audits_passed: number;
}

export interface SustainabilityMetrics {
  carbon_footprint: number;
  fuel_efficiency: number;
  waste_reduction: number;
  sustainable_suppliers: number;
}

export interface RiskMetrics {
  supply_disruptions: number;
  supplier_concentration: number;
  geographic_concentration: number;
  financial_exposure: number;
}

export interface RiskAssessment {
  supply_risks: SupplyRisk[];
  demand_risks: DemandRisk[];
  operational_risks: OperationalRisk[];
  external_risks: ExternalRisk[];
  mitigation_plans: MitigationPlan[];
}

export interface SupplyRisk {
  risk_type: string;
  probability: number;
  impact: number;
  risk_score: number;
  affected_suppliers: string[];
  mitigation_status: string;
}

export interface DemandRisk {
  risk_type: string;
  probability: number;
  impact: number;
  affected_products: string[];
  seasonal_factors: boolean;
}

export interface OperationalRisk {
  risk_type: string;
  probability: number;
  impact: number;
  affected_operations: string[];
  contingency_plans: string[];
}

export interface ExternalRisk {
  risk_type: string;
  probability: number;
  impact: number;
  geographic_scope: string;
  monitoring_indicators: string[];
}

export interface MitigationPlan {
  risk_id: string;
  strategy: string;
  actions: MitigationAction[];
  responsible_party: string;
  timeline: string;
  cost: number;
  effectiveness: number;
}

export interface MitigationAction {
  action: string;
  due_date: string;
  status: 'planned' | 'in_progress' | 'completed';
  resources_required: string[];
}

class SupplyChainService {
  // Supplier Management
  async createSupplier(supplier: Omit<Supplier, 'id'>): Promise<Supplier> {
    const { data, error } = await supabase
      .from('suppliers')
      .insert(supplier)
      .select()
      .single();

    if (error) throw new Error(`Failed to create supplier: ${error.message}`);
    return data;
  }

  async updateSupplierPerformance(supplierId: string, performance: SupplierPerformance): Promise<void> {
    const { error } = await supabase
      .from('suppliers')
      .update({ performance, updated_at: new Date().toISOString() })
      .eq('id', supplierId);

    if (error) throw new Error(`Failed to update supplier performance: ${error.message}`);
  }

  async getSuppliers(filters?: {
    categories?: string[];
    status?: SupplierStatus[];
    risk_level?: RiskLevel[];
    min_rating?: number;
  }): Promise<Supplier[]> {
    let query = supabase
      .from('suppliers')
      .select('*')
      .order('performance->overall_rating', { ascending: false });

    if (filters?.status?.length) {
      query = query.in('status', filters.status);
    }

    if (filters?.min_rating) {
      query = query.gte('performance->overall_rating', filters.min_rating);
    }

    const { data, error } = await query;
    if (error) throw new Error(`Failed to fetch suppliers: ${error.message}`);
    
    return data || [];
  }

  // Procurement Management
  async createProcurementOrder(order: Omit<ProcurementOrder, 'id' | 'order_number'>): Promise<ProcurementOrder> {
    const orderNumber = await this.generateOrderNumber();
    const orderWithNumber = { ...order, order_number: orderNumber };

    const { data, error } = await supabase
      .from('procurement_orders')
      .insert(orderWithNumber)
      .select()
      .single();

    if (error) throw new Error(`Failed to create procurement order: ${error.message}`);
    return data;
  }

  async updateOrderStatus(orderId: string, status: OrderStatus, notes?: string): Promise<void> {
    const updates: unknown = { 
      status, 
      updated_at: new Date().toISOString() 
    };

    if (status === OrderStatus.DELIVERED) {
      updates.actual_delivery_date = new Date().toISOString();
    }

    const { error } = await supabase
      .from('procurement_orders')
      .update(updates)
      .eq('id', orderId);

    if (error) throw new Error(`Failed to update order status: ${error.message}`);

    // Create status history record
    await this.recordOrderStatusChange(orderId, status, notes);
  }

  // Inventory Management
  async updateInventory(itemId: string, movement: Omit<InventoryMovement, 'id'>): Promise<void> {
    // Record inventory movement
    const { error: movementError } = await supabase
      .from('inventory_movements')
      .insert(movement);

    if (movementError) throw new Error(`Failed to record inventory movement: ${movementError.message}`);

    // Update inventory quantities
    await this.recalculateInventoryQuantities(itemId);
  }

  async checkReorderPoints(): Promise<InventoryItem[]> {
    const { data, error } = await supabase
      .from('inventory')
      .select('*')
      .lt('quantity_available', supabase.ref('reorder_point'));

    if (error) throw new Error(`Failed to check reorder points: ${error.message}`);
    
    return data || [];
  }

  // Transportation Management
  async scheduleDelivery(delivery: {
    origin: Location;
    destination: Location;
    cargo: CargoInfo;
    requested_date: string;
    priority: 'low' | 'medium' | 'high' | 'urgent';
  }): Promise<LogisticsOperation> {
    // Find optimal route and carrier
    const route = await this.findOptimalRoute(delivery.origin, delivery.destination);
    const carrier = await this.selectBestCarrier(delivery.cargo, route, delivery.priority);

    const operation: Omit<LogisticsOperation, 'id'> = {
      operation_type: OperationType.DELIVERY,
      origin: delivery.origin,
      destination: delivery.destination,
      cargo: delivery.cargo,
      schedule: {
        planned_start: delivery.requested_date,
        planned_end: this.calculateEstimatedDelivery(route, delivery.requested_date),
        milestones: this.generateDeliveryMilestones(route)
      },
      resources: {
        vehicles: [carrier.vehicle_id],
        drivers: [carrier.driver_id],
        equipment: [],
        facilities: []
      },
      costs: await this.calculateDeliveryCosts(delivery.cargo, route, carrier),
      performance: {
        on_time_performance: 0,
        cost_variance: 0,
        quality_score: 0,
        efficiency_rating: 0,
        customer_satisfaction: 0
      },
      documentation: []
    };

    const { data, error } = await supabase
      .from('logistics_operations')
      .insert(operation)
      .select()
      .single();

    if (error) throw new Error(`Failed to schedule delivery: ${error.message}`);
    return data;
  }

  // Performance Analytics
  async generateSupplyChainReport(period: { start: string; end: string }): Promise<{
    summary: SupplyChainSummary;
    supplier_performance: SupplierPerformanceReport[];
    cost_analysis: CostAnalysis;
    risk_assessment: RiskAssessment;
    recommendations: string[];
  }> {
    const [suppliers, orders, deliveries] = await Promise.all([
      this.getSupplierPerformanceData(period),
      this.getProcurementData(period),
      this.getDeliveryData(period)
    ]);

    const summary = this.generateSupplyChainSummary(suppliers, orders, deliveries);
    const supplierPerformance = this.analyzeSupplierPerformance(suppliers);
    const costAnalysis = this.analyzeCosts(orders, deliveries);
    const riskAssessment = await this.assessSupplyChainRisks();
    const recommendations = this.generateRecommendations(summary, supplierPerformance, riskAssessment);

    return {
      summary,
      supplier_performance: supplierPerformance,
      cost_analysis: costAnalysis,
      risk_assessment: riskAssessment,
      recommendations
    };
  }

  // Private utility methods
  private async generateOrderNumber(): Promise<string> {
    const prefix = 'PO';
    const year = new Date().getFullYear();
    const { count } = await supabase
      .from('procurement_orders')
      .select('*', { count: 'exact', head: true })
      .gte('order_date', `${year}-01-01`);

    const sequence = String((count || 0) + 1).padStart(6, '0');
    return `${prefix}${year}${sequence}`;
  }

  private async recordOrderStatusChange(orderId: string, status: OrderStatus, notes?: string): Promise<void> {
    await supabase
      .from('order_status_history')
      .insert({
        order_id: orderId,
        status,
        change_date: new Date().toISOString(),
        notes,
        user_id: 'current-user'
      });
  }

  private async recalculateInventoryQuantities(itemId: string): Promise<void> {
    // This would calculate current quantities based on all movements
    const { data: movements } = await supabase
      .from('inventory_movements')
      .select('*')
      .eq('item_id', itemId)
      .order('timestamp', { ascending: true });

    let onHand = 0;
    const reserved = 0;

    movements?.forEach(movement => {
      switch (movement.movement_type) {
        case MovementType.RECEIPT:
          onHand += movement.quantity;
          break;
        case MovementType.ISSUE:
          onHand -= movement.quantity;
          break;
        // Add other movement types
      }
    });

    await supabase
      .from('inventory')
      .update({
        quantity_on_hand: onHand,
        quantity_reserved: reserved,
        quantity_available: onHand - reserved,
        updated_at: new Date().toISOString()
      })
      .eq('item_id', itemId);
  }

  private async findOptimalRoute(origin: Location, destination: Location): Promise<TransportRoute> {
    // Mock route optimization - would integrate with routing APIs
    return {
      id: 'route-1',
      origin,
      destination,
      distance: 150, // miles
      estimated_time: 180, // minutes
      cost_per_mile: 2.5,
      restrictions: [],
      preferred: true
    };
  }

  private async selectBestCarrier(cargo: CargoInfo, route: TransportRoute, priority: string): Promise<any> {
    // Mock carrier selection logic
    return {
      carrier_id: 'carrier-1',
      vehicle_id: 'vehicle-1',
      driver_id: 'driver-1',
      estimated_cost: route.distance * route.cost_per_mile
    };
  }

  private calculateEstimatedDelivery(route: TransportRoute, startDate: string): string {
    const start = new Date(startDate);
    start.setMinutes(start.getMinutes() + route.estimated_time);
    return start.toISOString();
  }

  private generateDeliveryMilestones(route: TransportRoute): Milestone[] {
    return [
      {
        name: 'Pickup Scheduled',
        planned_time: new Date().toISOString(),
        status: 'pending'
      },
      {
        name: 'In Transit',
        planned_time: new Date(Date.now() + 60 * 60 * 1000).toISOString(),
        status: 'pending'
      },
      {
        name: 'Delivered',
        planned_time: new Date(Date.now() + route.estimated_time * 60 * 1000).toISOString(),
        status: 'pending'
      }
    ];
  }

  private async calculateDeliveryCosts(cargo: CargoInfo, route: TransportRoute, carrier: unknown): Promise<OperationCosts> {
    const baseCost = route.distance * route.cost_per_mile;
    const weightSurcharge = cargo.total_weight > 5000 ? baseCost * 0.1 : 0;
    const fuelCost = route.distance * 0.5; // Mock fuel cost

    return {
      labor_cost: 150,
      vehicle_cost: baseCost,
      fuel_cost: fuelCost,
      handling_cost: 50,
      storage_cost: 0,
      other_costs: weightSurcharge,
      total_cost: 150 + baseCost + fuelCost + 50 + weightSurcharge
    };
  }

  private async getSupplierPerformanceData(period: { start: string; end: string }): Promise<any[]> {
    // Mock data - would fetch actual supplier performance
    return [];
  }

  private async getProcurementData(period: { start: string; end: string }): Promise<any[]> {
    const { data } = await supabase
      .from('procurement_orders')
      .select('*')
      .gte('order_date', period.start)
      .lte('order_date', period.end);
    
    return data || [];
  }

  private async getDeliveryData(period: { start: string; end: string }): Promise<any[]> {
    const { data } = await supabase
      .from('logistics_operations')
      .select('*')
      .gte('schedule->planned_start', period.start)
      .lte('schedule->planned_start', period.end);
    
    return data || [];
  }

  private generateSupplyChainSummary(suppliers: unknown[], orders: unknown[], deliveries: unknown[]): SupplyChainSummary {
    return {
      total_suppliers: suppliers.length,
      active_orders: orders.filter(o => o.status !== OrderStatus.CLOSED).length,
      completed_deliveries: deliveries.filter(d => d.status === 'completed').length,
      total_spend: orders.reduce((sum, order) => sum + order.total_amount, 0),
      on_time_delivery_rate: 95.2,
      average_order_value: orders.length > 0 ? orders.reduce((sum, order) => sum + order.total_amount, 0) / orders.length : 0
    };
  }

  private analyzeSupplierPerformance(suppliers: unknown[]): SupplierPerformanceReport[] {
    return suppliers.map(supplier => ({
      supplier_id: supplier.id,
      supplier_name: supplier.company_name,
      overall_rating: supplier.performance?.overall_rating || 0,
      delivery_performance: supplier.performance?.delivery_score || 0,
      quality_score: supplier.performance?.quality_score || 0,
      cost_competitiveness: supplier.performance?.cost_competitiveness || 0,
      total_orders: supplier.performance?.total_orders || 0,
      total_spend: 0, // Would calculate from orders
      recommendations: []
    }));
  }

  private analyzeCosts(orders: unknown[], deliveries: unknown[]): CostAnalysis {
    const totalProcurementCost = orders.reduce((sum, order) => sum + order.total_amount, 0);
    const totalLogisticsCost = deliveries.reduce((sum, delivery) => sum + (delivery.costs?.total_cost || 0), 0);

    return {
      total_procurement_cost: totalProcurementCost,
      total_logistics_cost: totalLogisticsCost,
      cost_per_delivery: deliveries.length > 0 ? totalLogisticsCost / deliveries.length : 0,
      cost_trends: [],
      cost_optimization_opportunities: [
        'Consolidate shipments to reduce transportation costs',
        'Negotiate volume discounts with key suppliers',
        'Optimize inventory levels to reduce carrying costs'
      ]
    };
  }

  private async assessSupplyChainRisks(): Promise<RiskAssessment> {
    return {
      supply_risks: [
        {
          risk_type: 'Single source dependency',
          probability: 0.3,
          impact: 8,
          risk_score: 2.4,
          affected_suppliers: ['supplier-1'],
          mitigation_status: 'in_progress'
        }
      ],
      demand_risks: [],
      operational_risks: [],
      external_risks: [],
      mitigation_plans: []
    };
  }

  private generateRecommendations(
    summary: SupplyChainSummary,
    performance: SupplierPerformanceReport[],
    risks: RiskAssessment
  ): string[] {
    const recommendations: string[] = [];

    if (summary.on_time_delivery_rate < 95) {
      recommendations.push('Improve delivery performance by working with carriers on route optimization');
    }

    const lowPerformingSuppliers = performance.filter(p => p.overall_rating < 3);
    if (lowPerformingSuppliers.length > 0) {
      recommendations.push(`Review and potentially replace ${lowPerformingSuppliers.length} underperforming suppliers`);
    }

    recommendations.push('Implement supply chain visibility tools for better tracking');
    recommendations.push('Develop alternative supplier relationships to reduce risk');
    recommendations.push('Consider implementing just-in-time delivery for high-volume items');

    return recommendations;
  }
}

// Supporting interfaces
interface SupplyChainSummary {
  total_suppliers: number;
  active_orders: number;
  completed_deliveries: number;
  total_spend: number;
  on_time_delivery_rate: number;
  average_order_value: number;
}

interface SupplierPerformanceReport {
  supplier_id: string;
  supplier_name: string;
  overall_rating: number;
  delivery_performance: number;
  quality_score: number;
  cost_competitiveness: number;
  total_orders: number;
  total_spend: number;
  recommendations: string[];
}

interface CostAnalysis {
  total_procurement_cost: number;
  total_logistics_cost: number;
  cost_per_delivery: number;
  cost_trends: unknown[];
  cost_optimization_opportunities: string[];
}

// Export singleton instance
export const supplyChainService = new SupplyChainService();

// React hook
export function useSupplyChain() {
  const [suppliers, setSuppliers] = React.useState<Supplier[]>([]);
  const [orders, setOrders] = React.useState<ProcurementOrder[]>([]);
  const [inventory, setInventory] = React.useState<Inventory[]>([]);
  const [isLoading, setIsLoading] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);

  const loadSuppliers = async (filters?: unknown) => {
    setIsLoading(true);
    setError(null);
    try {
      const data = await supplyChainService.getSuppliers(filters);
      setSuppliers(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load suppliers');
    } finally {
      setIsLoading(false);
    }
  };

  const createOrder = async (order: Omit<ProcurementOrder, 'id' | 'order_number'>) => {
    try {
      const newOrder = await supplyChainService.createProcurementOrder(order);
      setOrders(prev => [newOrder, ...prev]);
      return newOrder;
    } catch (err) {
      throw new Error(err instanceof Error ? err.message : 'Failed to create procurement order');
    }
  };

  const scheduleDelivery = async (delivery: unknown) => {
    try {
      return await supplyChainService.scheduleDelivery(delivery);
    } catch (err) {
      throw new Error(err instanceof Error ? err.message : 'Failed to schedule delivery');
    }
  };

  const generateReport = async (period: { start: string; end: string }) => {
    try {
      return await supplyChainService.generateSupplyChainReport(period);
    } catch (err) {
      throw new Error(err instanceof Error ? err.message : 'Failed to generate supply chain report');
    }
  };

  return {
    suppliers,
    orders,
    inventory,
    isLoading,
    error,
    loadSuppliers,
    createOrder,
    scheduleDelivery,
    generateReport,
    service: supplyChainService
  };
}

import React from 'react';