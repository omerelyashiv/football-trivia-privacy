import { supabase, FAMILY_TABLE } from './supabase';
import { AppData } from './types';
import { DEFAULT_DATA } from './storage';

export async function fetchOrCreateFamilyData(familyCode: string): Promise<AppData> {
  const { data, error } = await supabase
    .from(FAMILY_TABLE)
    .select('data')
    .eq('family_code', familyCode)
    .maybeSingle();
  if (error) throw error;
  if (data) return { ...DEFAULT_DATA, ...(data.data as Partial<AppData>) };

  const { error: insertError } = await supabase
    .from(FAMILY_TABLE)
    .insert({ family_code: familyCode, data: DEFAULT_DATA });
  if (insertError) throw insertError;
  return DEFAULT_DATA;
}

export async function pushFamilyData(familyCode: string, appData: AppData): Promise<void> {
  const { error } = await supabase
    .from(FAMILY_TABLE)
    .upsert({ family_code: familyCode, data: appData, updated_at: new Date().toISOString() }, { onConflict: 'family_code' });
  if (error) throw error;
}

export function subscribeFamilyData(familyCode: string, onChange: (data: AppData) => void): () => void {
  const channel = supabase
    .channel(`family-${familyCode}`)
    .on(
      'postgres_changes',
      { event: '*', schema: 'public', table: FAMILY_TABLE, filter: `family_code=eq.${familyCode}` },
      (payload) => {
        const newRow = payload.new as { data?: AppData } | undefined;
        if (newRow?.data) onChange({ ...DEFAULT_DATA, ...newRow.data });
      }
    )
    .subscribe();

  return () => {
    supabase.removeChannel(channel);
  };
}
