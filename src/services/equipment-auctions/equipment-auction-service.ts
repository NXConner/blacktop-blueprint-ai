import { supabase } from '@/integrations/supabase/client';

// Equipment auction types
export interface EquipmentAuction {
  id: string;
  platform: AuctionPlatform;
  auction_id: string;
  title: string;
  description: string;
  sale_date: string;
  sale_time: string;
  location: EquipmentLocation;
  auctioneer: AuctioneerInfo;
  lots: EquipmentLot[];
  terms: AuctionTerms;
  inspection_dates: InspectionDate[];
  registration_required: boolean;
  catalog_url?: string;
  live_bidding_url?: string;
  created_at: string;
  updated_at: string;
}

export enum AuctionPlatform {
  RITCHIE_BROS = 'ritchie_bros',
  IRON_PLANET = 'iron_planet',
  MACHINERY_TRADER = 'machinery_trader',
  ALEX_LYON = 'alex_lyon',
  PROXIBID = 'proxibid',
  EQUIPMENTFACTS = 'equipmentfacts',
  PURPLE_WAVE = 'purple_wave',
  GOVDEALS = 'govdeals'
}

export interface EquipmentLocation {
  venue_name: string;
  address: string;
  city: string;
  state: string;
  country: string;
  coordinates?: {
    latitude: number;
    longitude: number;
  };
  yard_contact?: string;
  special_instructions?: string;
}

export interface AuctioneerInfo {
  company_name: string;
  license_number?: string;
  contact_phone: string;
  contact_email: string;
  website?: string;
  reputation_score?: number;
}

export interface EquipmentLot {
  id: string;
  auction_id: string;
  lot_number: string;
  equipment: Equipment;
  condition_report: ConditionReport;
  estimated_value: PriceRange;
  reserve_price?: number;
  starting_bid?: number;
  current_bid?: number;
  bid_history: EquipmentBid[];
  images: EquipmentImage[];
  documents: string[];
  financing_available: boolean;
  warranty_info?: WarrantyInfo;
  my_tracking: UserTracking;
}

export interface Equipment {
  make: string;
  model: string;
  year: number;
  serial_number?: string;
  category: EquipmentCategory;
  subcategory: string;
  specifications: EquipmentSpec[];
  hours_meter?: number;
  fuel_type: FuelType;
  engine_info?: EngineInfo;
  attachments: string[];
  modifications: string[];
}

export enum EquipmentCategory {
  EXCAVATORS = 'excavators',
  BULLDOZERS = 'bulldozers',
  LOADERS = 'loaders',
  GRADERS = 'graders',
  COMPACTORS = 'compactors',
  SCRAPERS = 'scrapers',
  CRANES = 'cranes',
  DUMP_TRUCKS = 'dump_trucks',
  PAVERS = 'pavers',
  MILLING_MACHINES = 'milling_machines',
  ROLLERS = 'rollers',
  GENERATORS = 'generators',
  COMPRESSORS = 'compressors',
  ATTACHMENTS = 'attachments',
  TRAILERS = 'trailers'
}

export enum FuelType {
  DIESEL = 'diesel',
  GASOLINE = 'gasoline',
  ELECTRIC = 'electric',
  HYBRID = 'hybrid',
  NATURAL_GAS = 'natural_gas',
  PROPANE = 'propane'
}

export interface EngineInfo {
  manufacturer: string;
  model: string;
  horsepower: number;
  displacement?: number;
  tier_rating?: string;
  rebuild_info?: string;
}

export interface EquipmentSpec {
  name: string;
  value: string;
  unit?: string;
  category: 'dimensions' | 'performance' | 'capacity' | 'features';
}

export interface ConditionReport {
  overall_condition: ConditionRating;
  engine_condition: ConditionRating;
  hydraulics_condition: ConditionRating;
  transmission_condition: ConditionRating;
  undercarriage_condition?: ConditionRating;
  tire_condition?: TireCondition;
  maintenance_records: boolean;
  recent_repairs: string[];
  known_issues: string[];
  inspector_notes: string;
  inspection_date: string;
  inspector_name?: string;
}

export enum ConditionRating {
  EXCELLENT = 5,
  VERY_GOOD = 4,
  GOOD = 3,
  FAIR = 2,
  POOR = 1,
  UNKNOWN = 0
}

export interface TireCondition {
  front_tires: number; // Percentage remaining
  rear_tires: number;
  tire_brand?: string;
  replacement_needed: boolean;
}

export interface PriceRange {
  low_estimate: number;
  high_estimate: number;
  currency: string;
}

export interface EquipmentBid {
  id: string;
  lot_id: string;
  bidder_id: string;
  bid_amount: number;
  bid_time: string;
  is_winning: boolean;
  bid_type: BidType;
  platform_bid_id?: string;
}

export enum BidType {
  FLOOR = 'floor',
  ONLINE = 'online',
  PHONE = 'phone',
  ABSENTEE = 'absentee',
  PROXY = 'proxy'
}

export interface EquipmentImage {
  id: string;
  url: string;
  thumbnail_url: string;
  caption?: string;
  category: ImageCategory;
  sequence: number;
}

export enum ImageCategory {
  EXTERIOR = 'exterior',
  INTERIOR = 'interior',
  ENGINE = 'engine',
  UNDERCARRIAGE = 'undercarriage',
  ATTACHMENTS = 'attachments',
  DAMAGE = 'damage',
  HOUR_METER = 'hour_meter',
  DOCUMENTS = 'documents'
}

export interface WarrantyInfo {
  manufacturer_warranty: boolean;
  warranty_expiry?: string;
  extended_warranty_available: boolean;
  coverage_details: string;
}

export interface UserTracking {
  is_watching: boolean;
  bid_alerts_enabled: boolean;
  max_bid_set?: number;
  notes: string;
  last_viewed: string;
}

export interface AuctionTerms {
  buyers_premium: number; // Percentage
  payment_methods: string[];
  payment_deadline: string;
  pickup_deadline: string;
  title_transfer_info: string;
  inspection_disclaimer: string;
  return_policy: string;
  additional_fees: AdditionalFee[];
}

export interface AdditionalFee {
  name: string;
  amount?: number;
  percentage?: number;
  description: string;
  applies_to: string[];
}

export interface InspectionDate {
  date: string;
  start_time: string;
  end_time: string;
  contact_required: boolean;
  contact_info?: string;
}

export interface PlatformCredentials {
  platform: AuctionPlatform;
  username: string;
  password?: string; // Encrypted
  api_key?: string;
  session_token?: string;
  last_login: string;
  is_active: boolean;
}

export interface BidStrategy {
  id: string;
  user_id: string;
  lot_id: string;
  strategy_type: StrategyType;
  max_bid: number;
  increment_strategy: IncrementStrategy;
  timing_strategy: TimingStrategy;
  conditions: BidCondition[];
  is_active: boolean;
}

export enum StrategyType {
  MANUAL = 'manual',
  AUTOMATIC = 'automatic',
  SNIPE = 'snipe',
  PROXY = 'proxy'
}

export interface IncrementStrategy {
  type: 'fixed' | 'percentage' | 'adaptive';
  value: number;
  max_increment?: number;
}

export interface TimingStrategy {
  bid_early: boolean;
  snipe_seconds?: number;
  max_attempts: number;
  retry_delay: number;
}

export interface BidCondition {
  condition_type: 'time' | 'price' | 'competition' | 'market';
  operator: 'greater_than' | 'less_than' | 'equals' | 'between';
  value: number | string;
  secondary_value?: number;
}

class EquipmentAuctionService {
  // Platform Integration
  async syncAuctionData(platform: AuctionPlatform): Promise<{
    success: boolean;
    auctions_synced: number;
    lots_synced: number;
    errors: string[];
  }> {
    try {
      const credentials = await this.getPlatformCredentials(platform);
      if (!credentials) {
        throw new Error(`No credentials found for platform: ${platform}`);
      }

      // Mock data for demonstration - in real implementation, would call actual APIs
      const mockAuctions = await this.getMockAuctionData(platform);
      
      let auctionsSynced = 0;
      let lotsSynced = 0;
      const errors: string[] = [];

      for (const auction of mockAuctions) {
        try {
          const { data: savedAuction, error: auctionError } = await supabase
            .from('equipment_auctions')
            .upsert(auction)
            .select()
            .single();

          if (auctionError) {
            errors.push(`Failed to sync auction ${auction.auction_id}: ${auctionError.message}`);
            continue;
          }

          auctionsSynced++;

          // Sync lots for this auction
          for (const lot of auction.lots) {
            const lotWithAuction = { ...lot, auction_id: savedAuction.id };
            
            const { error: lotError } = await supabase
              .from('equipment_lots')
              .upsert(lotWithAuction);

            if (lotError) {
              errors.push(`Failed to sync lot ${lot.lot_number}: ${lotError.message}`);
            } else {
              lotsSynced++;
            }
          }
        } catch (err) {
          errors.push(`Error processing auction: ${err}`);
        }
      }

      return {
        success: errors.length === 0,
        auctions_synced: auctionsSynced,
        lots_synced: lotsSynced,
        errors
      };
    } catch (error) {
      return {
        success: false,
        auctions_synced: 0,
        lots_synced: 0,
        errors: [error.message]
      };
    }
  }

  // Search and Discovery
  async searchEquipment(filters: {
    categories?: EquipmentCategory[];
    makes?: string[];
    models?: string[];
    yearRange?: { min: number; max: number };
    hoursRange?: { min: number; max: number };
    priceRange?: { min: number; max: number };
    location?: { state?: string; radius?: number; lat?: number; lng?: number };
    condition?: ConditionRating[];
    keywords?: string;
    platforms?: AuctionPlatform[];
    saleDate?: { start: string; end: string };
    page?: number;
    limit?: number;
  }): Promise<{
    lots: EquipmentLot[];
    total: number;
    facets: SearchFacets;
  }> {
    let query = supabase
      .from('equipment_lots')
      .select(`
        *,
        equipment_auctions (
          platform,
          sale_date,
          location
        )
      `, { count: 'exact' });

    // Apply filters
    if (filters.categories?.length) {
      query = query.in('equipment->category', filters.categories);
    }

    if (filters.makes?.length) {
      query = query.in('equipment->make', filters.makes);
    }

    if (filters.priceRange) {
      if (filters.priceRange.min) {
        query = query.gte('estimated_value->low_estimate', filters.priceRange.min);
      }
      if (filters.priceRange.max) {
        query = query.lte('estimated_value->high_estimate', filters.priceRange.max);
      }
    }

    if (filters.keywords) {
      query = query.or(`equipment->make.ilike.%${filters.keywords}%,equipment->model.ilike.%${filters.keywords}%`);
    }

    // Pagination
    const page = filters.page || 1;
    const limit = filters.limit || 20;
    const offset = (page - 1) * limit;
    query = query.range(offset, offset + limit - 1);

    const { data, error, count } = await query;
    
    if (error) throw new Error(`Failed to search equipment: ${error.message}`);

    // Generate facets for filtering
    const facets = await this.generateSearchFacets(filters);

    return {
      lots: data || [],
      total: count || 0,
      facets
    };
  }

  // Bidding Operations
  async placeBid(lotId: string, bidAmount: number, strategy?: BidStrategy): Promise<EquipmentBid> {
    const lot = await this.getLot(lotId);
    if (!lot) throw new Error('Equipment lot not found');

    // Validate bid amount
    if (lot.current_bid && bidAmount <= lot.current_bid) {
      throw new Error('Bid must be higher than current bid');
    }

    const bid: Omit<EquipmentBid, 'id'> = {
      lot_id: lotId,
      bidder_id: 'current-user-id', // Would get from auth
      bid_amount: bidAmount,
      bid_time: new Date().toISOString(),
      is_winning: true, // Will be determined by bid processing
      bid_type: strategy?.strategy_type === StrategyType.SNIPE ? BidType.ONLINE : BidType.ONLINE
    };

    const { data, error } = await supabase
      .from('equipment_bids')
      .insert(bid)
      .select()
      .single();

    if (error) throw new Error(`Failed to place bid: ${error.message}`);

    // Update lot current bid
    await supabase
      .from('equipment_lots')
      .update({ current_bid: bidAmount })
      .eq('id', lotId);

    return data;
  }

  async createBidStrategy(strategy: Omit<BidStrategy, 'id'>): Promise<BidStrategy> {
    const { data, error } = await supabase
      .from('bid_strategies')
      .insert(strategy)
      .select()
      .single();

    if (error) throw new Error(`Failed to create bid strategy: ${error.message}`);
    return data;
  }

  async executeBidStrategy(strategyId: string): Promise<void> {
    const strategy = await this.getBidStrategy(strategyId);
    if (!strategy || !strategy.is_active) return;

    const lot = await this.getLot(strategy.lot_id);
    if (!lot) return;

    // Check conditions
    const conditionsMet = await this.evaluateBidConditions(strategy.conditions, lot);
    if (!conditionsMet) return;

    // Execute bid based on strategy
    switch (strategy.strategy_type) {
      case StrategyType.SNIPE:
        await this.executeSnipeBid(strategy, lot);
        break;
      case StrategyType.PROXY:
        await this.executeProxyBid(strategy, lot);
        break;
      case StrategyType.AUTOMATIC:
        await this.executeAutomaticBid(strategy, lot);
        break;
    }
  }

  // Equipment Valuation
  async getEquipmentValuation(equipment: Equipment, condition: ConditionReport): Promise<{
    estimated_value: PriceRange;
    market_analysis: MarketAnalysis;
    depreciation_info: DepreciationInfo;
    comparable_sales: ComparableSale[];
  }> {
    // This would integrate with valuation services like Equipment Appraisal Services
    const baseValue = await this.calculateBaseValue(equipment);
    const conditionAdjustment = this.calculateConditionAdjustment(condition);
    const marketAdjustment = await this.getMarketAdjustment(equipment);

    const estimatedValue = {
      low_estimate: Math.round(baseValue * conditionAdjustment * marketAdjustment * 0.85),
      high_estimate: Math.round(baseValue * conditionAdjustment * marketAdjustment * 1.15),
      currency: 'USD'
    };

    const marketAnalysis = await this.generateMarketAnalysis(equipment);
    const depreciationInfo = this.calculateDepreciation(equipment);
    const comparableSales = await this.findComparableSales(equipment);

    return {
      estimated_value: estimatedValue,
      market_analysis: marketAnalysis,
      depreciation_info: depreciationInfo,
      comparable_sales: comparableSales
    };
  }

  // Watch List Management
  async addToWatchList(lotId: string, userId: string): Promise<void> {
    const { error } = await supabase
      .from('equipment_watch_list')
      .insert({
        user_id: userId,
        lot_id: lotId,
        added_at: new Date().toISOString(),
        alerts_enabled: true
      });

    if (error) throw new Error(`Failed to add to watch list: ${error.message}`);

    // Update lot tracking
    await supabase
      .from('equipment_lots')
      .update({
        'my_tracking->is_watching': true,
        'my_tracking->last_viewed': new Date().toISOString()
      })
      .eq('id', lotId);
  }

  async removeFromWatchList(lotId: string, userId: string): Promise<void> {
    const { error } = await supabase
      .from('equipment_watch_list')
      .delete()
      .eq('lot_id', lotId)
      .eq('user_id', userId);

    if (error) throw new Error(`Failed to remove from watch list: ${error.message}`);

    await supabase
      .from('equipment_lots')
      .update({ 'my_tracking->is_watching': false })
      .eq('id', lotId);
  }

  // Analytics and Reporting
  async getBiddingAnalytics(userId: string): Promise<{
    total_bids: number;
    winning_bids: number;
    total_spent: number;
    average_bid: number;
    success_rate: number;
    category_performance: CategoryPerformance[];
    monthly_activity: MonthlyActivity[];
    roi_analysis: ROIAnalysis;
  }> {
    const { data: bids } = await supabase
      .from('equipment_bids')
      .select('*')
      .eq('bidder_id', userId);

    const winningBids = bids?.filter(bid => bid.is_winning) || [];
    const totalSpent = winningBids.reduce((sum, bid) => sum + bid.bid_amount, 0);

    // Generate analytics
    return {
      total_bids: bids?.length || 0,
      winning_bids: winningBids.length,
      total_spent: totalSpent,
      average_bid: bids?.length ? bids.reduce((sum, bid) => sum + bid.bid_amount, 0) / bids.length : 0,
      success_rate: bids?.length ? (winningBids.length / bids.length) * 100 : 0,
      category_performance: await this.getCategoryPerformance(userId),
      monthly_activity: await this.getMonthlyActivity(userId),
      roi_analysis: await this.getROIAnalysis(userId)
    };
  }

  // Utility methods
  private async getLot(lotId: string): Promise<EquipmentLot | null> {
    const { data, error } = await supabase
      .from('equipment_lots')
      .select('*')
      .eq('id', lotId)
      .single();

    if (error && error.code !== 'PGRST116') {
      throw new Error(`Failed to fetch lot: ${error.message}`);
    }
    return data;
  }

  private async getBidStrategy(strategyId: string): Promise<BidStrategy | null> {
    const { data, error } = await supabase
      .from('bid_strategies')
      .select('*')
      .eq('id', strategyId)
      .single();

    if (error && error.code !== 'PGRST116') {
      throw new Error(`Failed to fetch bid strategy: ${error.message}`);
    }
    return data;
  }

  private async getPlatformCredentials(platform: AuctionPlatform): Promise<PlatformCredentials | null> {
    const { data, error } = await supabase
      .from('platform_credentials')
      .select('*')
      .eq('platform', platform)
      .eq('is_active', true)
      .single();

    if (error && error.code !== 'PGRST116') {
      throw new Error(`Failed to fetch platform credentials: ${error.message}`);
    }
    return data;
  }

  private async getMockAuctionData(platform: AuctionPlatform): Promise<Omit<EquipmentAuction, 'id' | 'created_at' | 'updated_at'>[]> {
    // Mock auction data - in real implementation, this would call platform APIs
    return [
      {
        platform,
        auction_id: 'RB240315001',
        title: 'Construction Equipment Auction - Dallas',
        description: 'Large selection of construction equipment including excavators, dozers, and loaders',
        sale_date: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
        sale_time: '10:00',
        location: {
          venue_name: 'Ritchie Bros. Dallas',
          address: '1051 W Buckingham Rd',
          city: 'Garland',
          state: 'TX',
          country: 'USA',
          coordinates: { latitude: 32.9126, longitude: -96.6304 }
        },
        auctioneer: {
          company_name: 'Ritchie Bros. Auctioneers',
          contact_phone: '(972) 271-9966',
          contact_email: 'dallas@rbauction.com',
          website: 'rbauction.com',
          reputation_score: 4.8
        },
        lots: [],
        terms: {
          buyers_premium: 10,
          payment_methods: ['Wire Transfer', 'Certified Check'],
          payment_deadline: '3 business days',
          pickup_deadline: '7 business days',
          title_transfer_info: 'Title provided within 30 days',
          inspection_disclaimer: 'All items sold as-is, where-is',
          return_policy: 'No returns accepted',
          additional_fees: [
            {
              name: 'Documentation Fee',
              amount: 150,
              description: 'Administrative processing fee',
              applies_to: ['all_lots']
            }
          ]
        },
        inspection_dates: [
          {
            date: new Date(Date.now() + 10 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
            start_time: '08:00',
            end_time: '17:00',
            contact_required: false
          }
        ],
        registration_required: true
      }
    ];
  }

  private async generateSearchFacets(filters: any): Promise<SearchFacets> {
    // Generate search facets for filtering
    return {
      categories: Object.values(EquipmentCategory),
      makes: ['Caterpillar', 'Komatsu', 'John Deere', 'Case', 'Volvo'],
      price_ranges: [
        { label: 'Under $25K', min: 0, max: 25000 },
        { label: '$25K - $50K', min: 25000, max: 50000 },
        { label: '$50K - $100K', min: 50000, max: 100000 },
        { label: 'Over $100K', min: 100000, max: null }
      ],
      conditions: Object.values(ConditionRating),
      platforms: Object.values(AuctionPlatform)
    };
  }

  private async evaluateBidConditions(conditions: BidCondition[], lot: EquipmentLot): Promise<boolean> {
    // Evaluate bid strategy conditions
    for (const condition of conditions) {
      const result = await this.evaluateCondition(condition, lot);
      if (!result) return false;
    }
    return true;
  }

  private async evaluateCondition(condition: BidCondition, lot: EquipmentLot): Promise<boolean> {
    // Implement condition evaluation logic
    switch (condition.condition_type) {
      case 'price':
        return this.evaluatePriceCondition(condition, lot.current_bid || 0);
      case 'time':
        return this.evaluateTimeCondition(condition);
      case 'competition':
        return this.evaluateCompetitionCondition(condition, lot);
      default:
        return true;
    }
  }

  private evaluatePriceCondition(condition: BidCondition, currentPrice: number): boolean {
    switch (condition.operator) {
      case 'less_than':
        return currentPrice < Number(condition.value);
      case 'greater_than':
        return currentPrice > Number(condition.value);
      case 'equals':
        return currentPrice === Number(condition.value);
      default:
        return true;
    }
  }

  private evaluateTimeCondition(condition: BidCondition): boolean {
    // Implement time-based condition evaluation
    return true;
  }

  private evaluateCompetitionCondition(condition: BidCondition, lot: EquipmentLot): boolean {
    // Implement competition-based condition evaluation
    return true;
  }

  private async executeSnipeBid(strategy: BidStrategy, lot: EquipmentLot): Promise<void> {
    // Implement snipe bidding logic
    const snipeTime = strategy.timing_strategy.snipe_seconds || 10;
    // Schedule bid for final seconds
  }

  private async executeProxyBid(strategy: BidStrategy, lot: EquipmentLot): Promise<void> {
    // Implement proxy bidding logic
    if (!lot.current_bid || lot.current_bid < strategy.max_bid) {
      const bidAmount = Math.min(
        (lot.current_bid || 0) + strategy.increment_strategy.value,
        strategy.max_bid
      );
      await this.placeBid(lot.id, bidAmount);
    }
  }

  private async executeAutomaticBid(strategy: BidStrategy, lot: EquipmentLot): Promise<void> {
    // Implement automatic bidding logic
    await this.executeProxyBid(strategy, lot);
  }

  private async calculateBaseValue(equipment: Equipment): Promise<number> {
    // Mock valuation calculation
    const yearFactor = Math.max(0.5, 1 - (new Date().getFullYear() - equipment.year) * 0.05);
    const basePrices = {
      [EquipmentCategory.EXCAVATORS]: 150000,
      [EquipmentCategory.BULLDOZERS]: 200000,
      [EquipmentCategory.LOADERS]: 120000,
      // Add more categories
    };
    return (basePrices[equipment.category] || 100000) * yearFactor;
  }

  private calculateConditionAdjustment(condition: ConditionReport): number {
    const avgCondition = (
      condition.overall_condition +
      condition.engine_condition +
      condition.hydraulics_condition +
      condition.transmission_condition
    ) / 4;
    return avgCondition / 5; // Normalize to 0-1
  }

  private async getMarketAdjustment(equipment: Equipment): Promise<number> {
    // Mock market adjustment
    return 1.0;
  }

  private async generateMarketAnalysis(equipment: Equipment): Promise<MarketAnalysis> {
    return {
      market_trend: 'stable',
      demand_level: 'high',
      supply_level: 'moderate',
      price_trend: 'increasing',
      seasonal_factors: ['Spring construction season'],
      regional_variations: []
    };
  }

  private calculateDepreciation(equipment: Equipment): DepreciationInfo {
    const age = new Date().getFullYear() - equipment.year;
    const annualDepreciation = 0.15; // 15% per year
    const totalDepreciation = Math.min(0.8, age * annualDepreciation);
    
    return {
      annual_rate: annualDepreciation,
      total_depreciation: totalDepreciation,
      remaining_value_percentage: 1 - totalDepreciation,
      useful_life_remaining: Math.max(0, 20 - age)
    };
  }

  private async findComparableSales(equipment: Equipment): Promise<ComparableSale[]> {
    // Mock comparable sales
    return [];
  }

  private async getCategoryPerformance(userId: string): Promise<CategoryPerformance[]> {
    // Mock category performance data
    return [];
  }

  private async getMonthlyActivity(userId: string): Promise<MonthlyActivity[]> {
    // Mock monthly activity data
    return [];
  }

  private async getROIAnalysis(userId: string): Promise<ROIAnalysis> {
    // Mock ROI analysis
    return {
      total_investment: 0,
      current_value: 0,
      realized_gains: 0,
      unrealized_gains: 0,
      roi_percentage: 0
    };
  }
}

// Supporting interfaces
interface SearchFacets {
  categories: EquipmentCategory[];
  makes: string[];
  price_ranges: Array<{ label: string; min: number; max: number | null }>;
  conditions: ConditionRating[];
  platforms: AuctionPlatform[];
}

interface MarketAnalysis {
  market_trend: 'increasing' | 'decreasing' | 'stable';
  demand_level: 'low' | 'moderate' | 'high';
  supply_level: 'low' | 'moderate' | 'high';
  price_trend: 'increasing' | 'decreasing' | 'stable';
  seasonal_factors: string[];
  regional_variations: string[];
}

interface DepreciationInfo {
  annual_rate: number;
  total_depreciation: number;
  remaining_value_percentage: number;
  useful_life_remaining: number;
}

interface ComparableSale {
  equipment: Equipment;
  sale_price: number;
  sale_date: string;
  condition: ConditionRating;
  platform: string;
}

interface CategoryPerformance {
  category: EquipmentCategory;
  wins: number;
  losses: number;
  avg_price: number;
  roi: number;
}

interface MonthlyActivity {
  month: string;
  bids_placed: number;
  items_won: number;
  total_spent: number;
}

interface ROIAnalysis {
  total_investment: number;
  current_value: number;
  realized_gains: number;
  unrealized_gains: number;
  roi_percentage: number;
}

// Export singleton instance
export const equipmentAuctionService = new EquipmentAuctionService();

// React hook
export function useEquipmentAuctions() {
  const [lots, setLots] = React.useState<EquipmentLot[]>([]);
  const [watchList, setWatchList] = React.useState<string[]>([]);
  const [bidStrategies, setBidStrategies] = React.useState<BidStrategy[]>([]);
  const [isLoading, setIsLoading] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);

  const searchEquipment = async (filters: any) => {
    setIsLoading(true);
    setError(null);
    try {
      const result = await equipmentAuctionService.searchEquipment(filters);
      setLots(result.lots);
      return result;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to search equipment');
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  const placeBid = async (lotId: string, bidAmount: number, strategy?: BidStrategy) => {
    try {
      return await equipmentAuctionService.placeBid(lotId, bidAmount, strategy);
    } catch (err) {
      throw new Error(err instanceof Error ? err.message : 'Failed to place bid');
    }
  };

  const addToWatchList = async (lotId: string) => {
    try {
      const userId = 'current-user-id'; // Would get from auth
      await equipmentAuctionService.addToWatchList(lotId, userId);
      setWatchList(prev => [...prev, lotId]);
    } catch (err) {
      throw new Error(err instanceof Error ? err.message : 'Failed to add to watch list');
    }
  };

  const syncPlatform = async (platform: AuctionPlatform) => {
    try {
      return await equipmentAuctionService.syncAuctionData(platform);
    } catch (err) {
      throw new Error(err instanceof Error ? err.message : 'Failed to sync platform data');
    }
  };

  return {
    lots,
    watchList,
    bidStrategies,
    isLoading,
    error,
    searchEquipment,
    placeBid,
    addToWatchList,
    syncPlatform,
    service: equipmentAuctionService
  };
}

import React from 'react';