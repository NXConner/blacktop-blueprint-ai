import { supabase } from '@/integrations/supabase/client';

// GSA Auction types and interfaces
export interface GSAAuction {
  id: string;
  auction_number: string;
  title: string;
  description: string;
  category: AuctionCategory;
  subcategory: string;
  location: AuctionLocation;
  preview_dates: PreviewDate[];
  bidding_start: string;
  bidding_end: string;
  status: AuctionStatus;
  items: AuctionItem[];
  terms_conditions: string;
  inspection_required: boolean;
  removal_deadline: string;
  payment_terms: PaymentTerms;
  shipping_options: ShippingOption[];
  created_at: string;
  updated_at: string;
}

export enum AuctionCategory {
  VEHICLES = 'vehicles',
  HEAVY_EQUIPMENT = 'heavy_equipment',
  CONSTRUCTION_EQUIPMENT = 'construction_equipment',
  OFFICE_EQUIPMENT = 'office_equipment',
  ELECTRONICS = 'electronics',
  INDUSTRIAL_EQUIPMENT = 'industrial_equipment',
  AIRCRAFT = 'aircraft',
  VESSELS = 'vessels',
  REAL_ESTATE = 'real_estate',
  MISCELLANEOUS = 'miscellaneous'
}

export enum AuctionStatus {
  UPCOMING = 'upcoming',
  PREVIEW = 'preview',
  LIVE = 'live',
  CLOSED = 'closed',
  CANCELLED = 'cancelled',
  PAYMENT_PENDING = 'payment_pending',
  COMPLETED = 'completed'
}

export interface AuctionLocation {
  facility_name: string;
  address: string;
  city: string;
  state: string;
  zip_code: string;
  contact_phone: string;
  contact_email: string;
  inspection_hours: string;
  special_instructions?: string;
}

export interface PreviewDate {
  date: string;
  start_time: string;
  end_time: string;
  appointment_required: boolean;
  contact_info?: string;
}

export interface AuctionItem {
  id: string;
  auction_id: string;
  lot_number: string;
  title: string;
  description: string;
  condition: ItemCondition;
  estimated_value: number;
  starting_bid: number;
  current_bid: number;
  bid_count: number;
  reserve_met: boolean;
  specifications: ItemSpecification[];
  images: string[];
  documents: string[];
  location_notes?: string;
  inspection_notes?: string;
  my_bid?: UserBid;
  watch_listed: boolean;
}

export enum ItemCondition {
  NEW = 'new',
  EXCELLENT = 'excellent',
  GOOD = 'good',
  FAIR = 'fair',
  POOR = 'poor',
  SALVAGE = 'salvage',
  UNKNOWN = 'unknown'
}

export interface ItemSpecification {
  name: string;
  value: string;
  unit?: string;
}

export interface UserBid {
  id: string;
  item_id: string;
  user_id: string;
  bid_amount: number;
  bid_time: string;
  is_winning: boolean;
  is_proxy: boolean;
  max_bid?: number;
}

export interface PaymentTerms {
  methods: PaymentMethod[];
  deposit_required: boolean;
  deposit_percentage: number;
  payment_deadline_hours: number;
  late_fees: boolean;
  payment_instructions: string;
}

export enum PaymentMethod {
  CREDIT_CARD = 'credit_card',
  WIRE_TRANSFER = 'wire_transfer',
  CASHIERS_CHECK = 'cashiers_check',
  COMPANY_CHECK = 'company_check',
  CASH = 'cash'
}

export interface ShippingOption {
  id: string;
  name: string;
  description: string;
  cost_estimate: number;
  delivery_timeframe: string;
  restrictions: string[];
  vendor_contact?: string;
}

export interface BidHistory {
  id: string;
  item_id: string;
  bid_amount: number;
  bid_time: string;
  bidder_number: string; // Anonymous bidder identifier
  is_winning: boolean;
}

export interface WatchList {
  id: string;
  user_id: string;
  item_id: string;
  auction_id: string;
  added_at: string;
  notifications_enabled: boolean;
}

export interface AuctionAlert {
  id: string;
  user_id: string;
  alert_type: AlertType;
  criteria: AlertCriteria;
  is_active: boolean;
  created_at: string;
}

export enum AlertType {
  NEW_AUCTIONS = 'new_auctions',
  BID_OUTBID = 'bid_outbid',
  AUCTION_ENDING = 'auction_ending',
  PAYMENT_DUE = 'payment_due',
  PICKUP_REMINDER = 'pickup_reminder'
}

export interface AlertCriteria {
  categories?: AuctionCategory[];
  keywords?: string[];
  max_price?: number;
  locations?: string[];
  conditions?: ItemCondition[];
}

class GSAAuctionClient {
  private apiKey: string;
  private baseUrl: string = 'https://api.gsaauctions.gov/api/v1';

  constructor() {
    this.apiKey = process.env.GSA_AUCTIONS_API_KEY || '';
  }

  // Auction Discovery
  async searchAuctions(filters?: {
    categories?: AuctionCategory[];
    keywords?: string;
    states?: string[];
    status?: AuctionStatus[];
    startDate?: string;
    endDate?: string;
    page?: number;
    limit?: number;
  }): Promise<{ auctions: GSAAuction[]; total: number; hasMore: boolean }> {
    try {
      // In a real implementation, this would call the actual GSA API
      // For now, we'll return mock data and sync with our database
      
      let query = supabase
        .from('gsa_auctions')
        .select('*', { count: 'exact' })
        .order('bidding_start', { ascending: false });

      if (filters?.categories?.length) {
        query = query.in('category', filters.categories);
      }

      if (filters?.keywords) {
        query = query.or(`title.ilike.%${filters.keywords}%,description.ilike.%${filters.keywords}%`);
      }

      if (filters?.status?.length) {
        query = query.in('status', filters.status);
      }

      if (filters?.startDate) {
        query = query.gte('bidding_start', filters.startDate);
      }

      if (filters?.endDate) {
        query = query.lte('bidding_end', filters.endDate);
      }

      const page = filters?.page || 1;
      const limit = filters?.limit || 20;
      const offset = (page - 1) * limit;

      query = query.range(offset, offset + limit - 1);

      const { data, error, count } = await query;
      
      if (error) throw new Error(`Failed to search auctions: ${error.message}`);

      return {
        auctions: data || [],
        total: count || 0,
        hasMore: (count || 0) > offset + limit
      };
    } catch (error) {
      console.error('Error searching auctions:', error);
      throw error;
    }
  }

  async getAuction(auctionId: string): Promise<GSAAuction | null> {
    const { data, error } = await supabase
      .from('gsa_auctions')
      .select(`
        *,
        auction_items (*)
      `)
      .eq('id', auctionId)
      .single();

    if (error && error.code !== 'PGRST116') {
      throw new Error(`Failed to fetch auction: ${error.message}`);
    }

    return data;
  }

  async getAuctionItems(auctionId: string): Promise<AuctionItem[]> {
    const { data, error } = await supabase
      .from('auction_items')
      .select('*')
      .eq('auction_id', auctionId)
      .order('lot_number');

    if (error) throw new Error(`Failed to fetch auction items: ${error.message}`);
    return data || [];
  }

  // Bidding Operations
  async placeBid(itemId: string, bidAmount: number, isProxy: boolean = false, maxBid?: number): Promise<UserBid> {
    // Validate bid amount
    const item = await this.getAuctionItem(itemId);
    if (!item) throw new Error('Auction item not found');

    if (bidAmount <= item.current_bid) {
      throw new Error('Bid must be higher than current bid');
    }

    // Check auction status
    const auction = await this.getAuction(item.auction_id);
    if (!auction || auction.status !== AuctionStatus.LIVE) {
      throw new Error('Auction is not currently accepting bids');
    }

    // Create bid record
    const bid: Omit<UserBid, 'id'> = {
      item_id: itemId,
      user_id: 'current-user-id', // Would get from auth context
      bid_amount: bidAmount,
      bid_time: new Date().toISOString(),
      is_winning: true, // Will be determined by bid processing
      is_proxy: isProxy,
      max_bid: maxBid
    };

    const { data, error } = await supabase
      .from('auction_bids')
      .insert(bid)
      .select()
      .single();

    if (error) throw new Error(`Failed to place bid: ${error.message}`);

    // Update item current bid (in real system, this would be handled by auction engine)
    await supabase
      .from('auction_items')
      .update({
        current_bid: bidAmount,
        bid_count: item.bid_count + 1
      })
      .eq('id', itemId);

    return data;
  }

  async getMyBids(userId: string): Promise<UserBid[]> {
    const { data, error } = await supabase
      .from('auction_bids')
      .select(`
        *,
        auction_items (
          title,
          auction_id,
          gsa_auctions (title, bidding_end)
        )
      `)
      .eq('user_id', userId)
      .order('bid_time', { ascending: false });

    if (error) throw new Error(`Failed to fetch user bids: ${error.message}`);
    return data || [];
  }

  async getBidHistory(itemId: string): Promise<BidHistory[]> {
    const { data, error } = await supabase
      .from('auction_bids')
      .select('id, bid_amount, bid_time, is_winning')
      .eq('item_id', itemId)
      .order('bid_time', { ascending: false });

    if (error) throw new Error(`Failed to fetch bid history: ${error.message}`);

    // Convert to anonymous bid history
    return (data || []).map((bid, index) => ({
      id: bid.id,
      item_id: itemId,
      bid_amount: bid.bid_amount,
      bid_time: bid.bid_time,
      bidder_number: `Bidder ${index + 1}`, // Anonymous identifier
      is_winning: bid.is_winning
    }));
  }

  // Watch List Management
  async addToWatchList(itemId: string, userId: string): Promise<WatchList> {
    const watchItem: Omit<WatchList, 'id'> = {
      user_id: userId,
      item_id: itemId,
      auction_id: '', // Would be populated from item
      added_at: new Date().toISOString(),
      notifications_enabled: true
    };

    const { data, error } = await supabase
      .from('auction_watch_list')
      .insert(watchItem)
      .select()
      .single();

    if (error) throw new Error(`Failed to add to watch list: ${error.message}`);

    // Update item watch status
    await supabase
      .from('auction_items')
      .update({ watch_listed: true })
      .eq('id', itemId);

    return data;
  }

  async removeFromWatchList(itemId: string, userId: string): Promise<void> {
    const { error } = await supabase
      .from('auction_watch_list')
      .delete()
      .eq('item_id', itemId)
      .eq('user_id', userId);

    if (error) throw new Error(`Failed to remove from watch list: ${error.message}`);

    // Update item watch status
    await supabase
      .from('auction_items')
      .update({ watch_listed: false })
      .eq('id', itemId);
  }

  async getWatchList(userId: string): Promise<WatchList[]> {
    const { data, error } = await supabase
      .from('auction_watch_list')
      .select(`
        *,
        auction_items (
          title,
          current_bid,
          bidding_end,
          gsa_auctions (title, status)
        )
      `)
      .eq('user_id', userId)
      .order('added_at', { ascending: false });

    if (error) throw new Error(`Failed to fetch watch list: ${error.message}`);
    return data || [];
  }

  // Alert Management
  async createAlert(userId: string, alertType: AlertType, criteria: AlertCriteria): Promise<AuctionAlert> {
    const alert: Omit<AuctionAlert, 'id'> = {
      user_id: userId,
      alert_type: alertType,
      criteria,
      is_active: true,
      created_at: new Date().toISOString()
    };

    const { data, error } = await supabase
      .from('auction_alerts')
      .insert(alert)
      .select()
      .single();

    if (error) throw new Error(`Failed to create alert: ${error.message}`);
    return data;
  }

  async getUserAlerts(userId: string): Promise<AuctionAlert[]> {
    const { data, error } = await supabase
      .from('auction_alerts')
      .select('*')
      .eq('user_id', userId)
      .eq('is_active', true)
      .order('created_at', { ascending: false });

    if (error) throw new Error(`Failed to fetch alerts: ${error.message}`);
    return data || [];
  }

  // Fetch data from real GSA API
  private async fetchFromGSAAPI(): Promise<Omit<GSAAuction, 'id' | 'created_at' | 'updated_at'>[]> {
    try {
      // GSA API endpoint for surplus auctions
      const apiUrl = 'https://api.gsa.gov/technology/auctions/v1/auctions';
      const apiKey = process.env.VITE_GSA_API_KEY;
      
      if (!apiKey) {
        console.warn('GSA API key not configured, falling back to database data');
        return [];
      }

      const response = await fetch(`${apiUrl}?api_key=${apiKey}&status=active,upcoming`);
      
      if (!response.ok) {
        throw new Error(`GSA API request failed: ${response.statusText}`);
      }

      const apiData = await response.json();
      
      // Transform GSA API data to our format
      return apiData.auctions?.map((auction: any) => ({
        auction_number: auction.auctionNumber,
        title: auction.title,
        description: auction.description,
        category: this.mapGSACategory(auction.category),
        subcategory: auction.subcategory,
        location: {
          facility_name: auction.location?.facilityName,
          address: auction.location?.address,
          city: auction.location?.city,
          state: auction.location?.state,
          zip_code: auction.location?.zipCode,
          contact_phone: auction.location?.contactPhone,
          contact_email: auction.location?.contactEmail,
          inspection_hours: auction.location?.inspectionHours,
          special_instructions: auction.location?.specialInstructions
        },
        preview_dates: auction.previewDates?.map((date: any) => ({
          date: date.date,
          start_time: date.startTime,
          end_time: date.endTime,
          appointment_required: date.appointmentRequired
        })) || [],
        bidding_start: auction.biddingStart,
        bidding_end: auction.biddingEnd,
        status: this.mapGSAStatus(auction.status),
        items: [],
        terms_conditions: auction.termsConditions,
        inspection_required: auction.inspectionRequired,
        removal_deadline: auction.removalDeadline,
        payment_terms: {
          methods: auction.paymentTerms?.methods || [],
          deposit_required: auction.paymentTerms?.depositRequired,
          deposit_percentage: auction.paymentTerms?.depositPercentage,
          payment_deadline_hours: auction.paymentTerms?.paymentDeadlineHours,
          late_fees: auction.paymentTerms?.lateFees,
          payment_instructions: auction.paymentTerms?.paymentInstructions
        },
        shipping_options: auction.shippingOptions || []
      })) || [];
    } catch (error) {
      console.error('Failed to fetch from GSA API:', error);
      return [];
    }
  }

  private async fetchAuctionItems(auctionNumber: string): Promise<Omit<AuctionItem, 'id'>[]> {
    try {
      const apiUrl = `https://api.gsa.gov/technology/auctions/v1/auctions/${auctionNumber}/items`;
      const apiKey = process.env.VITE_GSA_API_KEY;
      
      if (!apiKey) {
        return [];
      }

      const response = await fetch(`${apiUrl}?api_key=${apiKey}`);
      
      if (!response.ok) {
        throw new Error(`GSA API items request failed: ${response.statusText}`);
      }

      const apiData = await response.json();
      
      return apiData.items?.map((item: any) => ({
        auction_id: '', // Will be populated by caller
        lot_number: item.lotNumber,
        title: item.title,
        description: item.description,
        condition: this.mapGSACondition(item.condition),
        estimated_value: item.estimatedValue,
        starting_bid: item.startingBid,
        current_bid: item.currentBid || item.startingBid,
        bid_count: item.bidCount || 0,
        reserve_met: item.reserveMet || false,
        specifications: item.specifications || [],
        images: item.images || [],
        documents: item.documents || [],
        location_notes: item.locationNotes,
        watch_listed: false
      })) || [];
    } catch (error) {
      console.error(`Failed to fetch items for auction ${auctionNumber}:`, error);
      return [];
    }
  }

  private mapGSACategory(category: string): AuctionCategory {
    switch (category?.toLowerCase()) {
      case 'construction equipment':
      case 'heavy equipment':
        return AuctionCategory.CONSTRUCTION_EQUIPMENT;
      case 'vehicles':
      case 'automotive':
        return AuctionCategory.VEHICLES;
      case 'industrial equipment':
        return AuctionCategory.INDUSTRIAL_EQUIPMENT;
      case 'electronics':
        return AuctionCategory.ELECTRONICS;
      default:
        return AuctionCategory.OTHER;
    }
  }

  private mapGSAStatus(status: string): AuctionStatus {
    switch (status?.toLowerCase()) {
      case 'upcoming':
      case 'scheduled':
        return AuctionStatus.UPCOMING;
      case 'active':
      case 'live':
        return AuctionStatus.ACTIVE;
      case 'closed':
      case 'ended':
        return AuctionStatus.CLOSED;
      case 'cancelled':
        return AuctionStatus.CANCELLED;
      default:
        return AuctionStatus.UPCOMING;
    }
  }

  private mapGSACondition(condition: string): ItemCondition {
    switch (condition?.toLowerCase()) {
      case 'excellent':
        return ItemCondition.EXCELLENT;
      case 'good':
        return ItemCondition.GOOD;
      case 'fair':
        return ItemCondition.FAIR;
      case 'poor':
        return ItemCondition.POOR;
      case 'unknown':
      case 'for parts':
        return ItemCondition.UNKNOWN;
      default:
        return ItemCondition.UNKNOWN;
    }
  }

  // Data Synchronization
  async syncAuctionData(): Promise<{ success: boolean; processed: number; errors: string[] }> {
    try {
      // Fetch real auction data from GSA API
      const apiAuctions = await this.fetchFromGSAAPI();
      
      let processed = 0;
      const errors: string[] = [];

      // Sync auctions from API
      for (const auction of apiAuctions) {
        try {
          const { data: auctionData, error: auctionError } = await supabase
            .from('gsa_auctions')
            .upsert(auction)
            .select()
            .single();

          if (auctionError) {
            errors.push(`Failed to sync auction ${auction.auction_number}: ${auctionError.message}`);
            continue;
          }

          // Fetch and sync items for this auction
          const auctionItems = await this.fetchAuctionItems(auction.auction_number);
          for (const item of auctionItems) {
            const itemWithAuction = { ...item, auction_id: auctionData.id };
            
            const { error: itemError } = await supabase
              .from('auction_items')
              .upsert(itemWithAuction);

            if (itemError) {
              errors.push(`Failed to sync item ${item.lot_number}: ${itemError.message}`);
            }
          }

          processed++;
        } catch (err) {
          errors.push(`Error processing auction ${auction.auction_number}: ${err}`);
        }
      }

      return {
        success: errors.length === 0,
        processed,
        errors
      };
    } catch (error) {
      return {
        success: false,
        processed: 0,
        errors: [error.message]
      };
    }
  }

  // Auction Analytics
  async getAuctionAnalytics(userId: string): Promise<{
    total_bids: number;
    winning_bids: number;
    total_spent: number;
    items_won: number;
    watch_list_count: number;
    categories_bid: AuctionCategory[];
    avg_bid_amount: number;
    success_rate: number;
  }> {
    const [bids, watchList] = await Promise.all([
      this.getMyBids(userId),
      this.getWatchList(userId)
    ]);

    const winningBids = bids.filter(bid => bid.is_winning);
    const totalSpent = winningBids.reduce((sum, bid) => sum + bid.bid_amount, 0);
    const categoriesBid = [...new Set(bids.map(bid => 
      // Would map from item to category
      AuctionCategory.CONSTRUCTION_EQUIPMENT
    ))];

    return {
      total_bids: bids.length,
      winning_bids: winningBids.length,
      total_spent: totalSpent,
      items_won: winningBids.length,
      watch_list_count: watchList.length,
      categories_bid: categoriesBid,
      avg_bid_amount: bids.length > 0 ? bids.reduce((sum, bid) => sum + bid.bid_amount, 0) / bids.length : 0,
      success_rate: bids.length > 0 ? (winningBids.length / bids.length) * 100 : 0
    };
  }

  // Utility methods
  private async getAuctionItem(itemId: string): Promise<AuctionItem | null> {
    const { data, error } = await supabase
      .from('auction_items')
      .select('*')
      .eq('id', itemId)
      .single();

    if (error && error.code !== 'PGRST116') {
      throw new Error(`Failed to fetch auction item: ${error.message}`);
    }

    return data;
  }

  // Real-time auction updates
  async subscribeToAuctionUpdates(auctionId: string, callback: (update: unknown) => void): Promise<() => void> {
    const subscription = supabase
      .channel(`auction-${auctionId}`)
      .on('postgres_changes', 
        { 
          event: '*', 
          schema: 'public', 
          table: 'auction_items',
          filter: `auction_id=eq.${auctionId}`
        }, 
        callback
      )
      .subscribe();

    return () => {
      supabase.removeChannel(subscription);
    };
  }

  // Automated bidding (proxy bidding)
  async setupProxyBidding(itemId: string, maxBid: number, increment: number = 100): Promise<void> {
    // Store proxy bid configuration
    const { error } = await supabase
      .from('proxy_bids')
      .insert({
        item_id: itemId,
        user_id: 'current-user-id',
        max_bid: maxBid,
        increment: increment,
        is_active: true,
        created_at: new Date().toISOString()
      });

    if (error) throw new Error(`Failed to setup proxy bidding: ${error.message}`);
  }

  async cancelProxyBidding(itemId: string, userId: string): Promise<void> {
    const { error } = await supabase
      .from('proxy_bids')
      .update({ is_active: false })
      .eq('item_id', itemId)
      .eq('user_id', userId);

    if (error) throw new Error(`Failed to cancel proxy bidding: ${error.message}`);
  }
}

// Export singleton instance
export const gsaAuctionClient = new GSAAuctionClient();

// React hook for GSA auctions
export function useGSAAuctions() {
  const [auctions, setAuctions] = React.useState<GSAAuction[]>([]);
  const [watchList, setWatchList] = React.useState<WatchList[]>([]);
  const [myBids, setMyBids] = React.useState<UserBid[]>([]);
  const [isLoading, setIsLoading] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);

  const searchAuctions = async (filters?: unknown) => {
    setIsLoading(true);
    setError(null);
    try {
      const result = await gsaAuctionClient.searchAuctions(filters);
      setAuctions(result.auctions);
      return result;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to search auctions');
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  const placeBid = async (itemId: string, bidAmount: number, isProxy?: boolean, maxBid?: number) => {
    try {
      const bid = await gsaAuctionClient.placeBid(itemId, bidAmount, isProxy, maxBid);
      // Refresh bids
      const userId = 'current-user-id'; // Would get from auth
      const updatedBids = await gsaAuctionClient.getMyBids(userId);
      setMyBids(updatedBids);
      return bid;
    } catch (err) {
      throw new Error(err instanceof Error ? err.message : 'Failed to place bid');
    }
  };

  const addToWatchList = async (itemId: string) => {
    try {
      const userId = 'current-user-id'; // Would get from auth
      const watchItem = await gsaAuctionClient.addToWatchList(itemId, userId);
      setWatchList(prev => [watchItem, ...prev]);
      return watchItem;
    } catch (err) {
      throw new Error(err instanceof Error ? err.message : 'Failed to add to watch list');
    }
  };

  const removeFromWatchList = async (itemId: string) => {
    try {
      const userId = 'current-user-id'; // Would get from auth
      await gsaAuctionClient.removeFromWatchList(itemId, userId);
      setWatchList(prev => prev.filter(item => item.item_id !== itemId));
    } catch (err) {
      throw new Error(err instanceof Error ? err.message : 'Failed to remove from watch list');
    }
  };

  const loadUserData = async (userId: string) => {
    setIsLoading(true);
    try {
      const [bids, watchListData] = await Promise.all([
        gsaAuctionClient.getMyBids(userId),
        gsaAuctionClient.getWatchList(userId)
      ]);
      setMyBids(bids);
      setWatchList(watchListData);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load user data');
    } finally {
      setIsLoading(false);
    }
  };

  const syncAuctions = async () => {
    try {
      return await gsaAuctionClient.syncAuctionData();
    } catch (err) {
      throw new Error(err instanceof Error ? err.message : 'Failed to sync auction data');
    }
  };

  return {
    auctions,
    watchList,
    myBids,
    isLoading,
    error,
    searchAuctions,
    placeBid,
    addToWatchList,
    removeFromWatchList,
    loadUserData,
    syncAuctions,
    client: gsaAuctionClient
  };
}

import React from 'react';