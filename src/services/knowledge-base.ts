import { supabase } from '@/integrations/supabase/client';
import { offlineService } from '@/services/offline';

export type KnowledgeCategory =
  | 'materials'
  | 'pricing'
  | 'labor'
  | 'fuel'
  | 'equipment'
  | 'estimation_rules'
  | 'transport'
  | 'accounting'
  | 'taxes';

export interface KnowledgeItem<T = any> {
  id: string;
  category: KnowledgeCategory;
  key: string;
  value: T;
  updatedAt: string;
  source?: string;
  tags?: string[];
}

class KnowledgeBaseService {
  private subscribers: Set<(item: KnowledgeItem) => void> = new Set();

  async upsert<T>(item: Omit<KnowledgeItem<T>, 'id' | 'updatedAt'>): Promise<KnowledgeItem<T>> {
    const record: KnowledgeItem<T> = {
      id: crypto.randomUUID(),
      ...item,
      updatedAt: new Date().toISOString(),
    };

    await offlineService.cacheData(`kb.${record.category}.${record.key}`, record, 24 * 60);

    try {
      await supabase.from('knowledge_base').upsert({
        id: record.id,
        category: record.category,
        key: record.key,
        value: record.value,
        updated_at: record.updatedAt,
        source: record.source,
        tags: record.tags,
      });
    } catch (_) {}

    this.subscribers.forEach(cb => cb(record));
    return record;
  }

  async get<T>(category: KnowledgeCategory, key: string): Promise<KnowledgeItem<T> | null> {
    const cached = await offlineService.getCachedData(`kb.${category}.${key}`);
    if (cached) return cached as KnowledgeItem<T>;

    try {
      const { data, error } = await supabase
        .from('knowledge_base')
        .select('*')
        .eq('category', category)
        .eq('key', key)
        .maybeSingle();
      if (!error && data) {
        const item: KnowledgeItem<T> = {
          id: data.id,
          category: data.category,
          key: data.key,
          value: data.value,
          updatedAt: data.updated_at,
          source: data.source,
          tags: data.tags,
        };
        await offlineService.cacheData(`kb.${category}.${key}`, item, 24 * 60);
        return item;
      }
    } catch (_) {}

    return null;
  }

  onUpdate(cb: (item: KnowledgeItem) => void): () => void {
    this.subscribers.add(cb);
    return () => this.subscribers.delete(cb);
  }
}

export const knowledgeBase = new KnowledgeBaseService();