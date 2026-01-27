
import { supabase } from '../lib/supabase';
import { SubscriptionTier } from '../types';

export const activateSubscription = async (tier: SubscriptionTier): Promise<boolean> => {
  try {
    // 1. Calculate the End Date based on the Tier
    const now = new Date();
    const endDate = new Date(now);

    switch (tier) {
      case 'daily':
        endDate.setHours(endDate.getHours() + 24);
        break;
      case 'monthly':
        endDate.setMonth(endDate.getMonth() + 1);
        break;
      case 'yearly':
        endDate.setFullYear(endDate.getFullYear() + 1);
        break;
      case 'free':
        return true; // No database record needed for free
      default:
        return false;
    }

    // 2. Get Current User
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      console.warn("No user logged in. Cannot activate subscription in database.");
      return false;
    }

    console.log(`Activating ${tier} plan for user ${user.id} until ${endDate.toISOString()}`);

    // 3. Insert into Supabase
    // We use upsert or insert. Since we want a log, simple insert is fine, 
    // but the app logic should query for the *latest* valid subscription.
    const { error } = await supabase
      .from('subscriptions')
      .insert({
        user_id: user.id,
        tier: tier,
        starts_at: now.toISOString(),
        ends_at: endDate.toISOString()
      });

    if (error) {
      console.error("Supabase error during activation:", error);
      // In a mock environment or if RLS fails, we might still want to return true for the UI to update
      // depending on strictness. For production, return false.
      // For this "demo" where Supabase might be mocked/limited, we'll log it.
      return false;
    }

    return true;

  } catch (e) {
    console.error("Subscription activation failed:", e);
    return false;
  }
};

export const getActiveSubscription = async (): Promise<SubscriptionTier> => {
  try {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return 'free';

    // Fetch the latest subscription where ends_at is in the future
    const { data, error } = await supabase
      .from('subscriptions')
      .select('tier, ends_at')
      .eq('user_id', user.id)
      .gt('ends_at', new Date().toISOString()) // Only future dates
      .order('ends_at', { ascending: false }) // Get the one that ends latest
      .limit(1);

    if (error) {
        // Silent fail to free if table doesn't exist yet
        console.warn("Error checking subscription:", error.message);
        return 'free';
    }

    if (data && data.length > 0) {
      console.log("Found active subscription:", data[0].tier);
      return data[0].tier as SubscriptionTier;
    }

    return 'free';
  } catch (error) {
    console.warn("Could not fetch subscription, defaulting to free:", error);
    return 'free';
  }
};
