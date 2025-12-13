import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase/server";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

// This endpoint should be called by a cron job service (e.g., Vercel Cron, GitHub Actions, etc.)
// Schedule: 0 0 * * * (daily at midnight UTC)
export async function GET(request: Request) {
  // Verify the request is from a trusted source (e.g., cron secret)
  const authHeader = request.headers.get("authorization");
  const cronSecret = process.env.CRON_SECRET;

  if (cronSecret && authHeader !== `Bearer ${cronSecret}`) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);
    yesterday.setHours(0, 0, 0, 0);

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    // Get all messages from yesterday
    const { data: messages, error: messagesError } = await supabaseAdmin
      .from("voice_messages")
      .select(`
        id,
        wallet_address,
        reactions(count)
      `)
      .gte("created_at", yesterday.toISOString())
      .lt("created_at", today.toISOString());

    if (messagesError) throw messagesError;

    // Calculate reaction counts
    const messagesWithCounts = await Promise.all(
      (messages || []).map(async (msg: any) => {
        const { count } = await supabaseAdmin
          .from("reactions")
          .select("*", { count: "exact", head: true })
          .eq("message_id", msg.id);

        return {
          ...msg,
          reaction_count: count || 0,
        };
      })
    );

    // Sort by reaction count and get top 2
    messagesWithCounts.sort((a, b) => b.reaction_count - a.reaction_count);
    const top2 = messagesWithCounts.slice(0, 2);

    if (top2.length === 0) {
      return NextResponse.json({
        message: "No messages to reward",
        date: yesterday.toISOString().split("T")[0],
      });
    }

    // Reward amounts (can be configured)
    const rewardAmounts = [100, 50]; // 100 BLA for #1, 50 BLA for #2

    const rewardDate = yesterday.toISOString().split("T")[0];

    // Create reward records
    const rewards = top2.map((msg, index) => ({
      message_id: msg.id,
      reward_date: rewardDate,
      rank: index + 1,
      reward_amount: rewardAmounts[index] || 0,
      claimed: false,
    }));

    // Get user IDs for the wallet addresses
    const walletAddresses = top2.map((msg) => msg.wallet_address);
    const { data: users } = await supabaseAdmin
      .from("users")
      .select("id, wallet_address")
      .in("wallet_address", walletAddresses);

    const userMap = new Map(users?.map((u) => [u.wallet_address, u.id]) || []);

    // Insert rewards
    const { error: rewardsError } = await supabaseAdmin
      .from("top_message_rewards")
      .insert(rewards);

    if (rewardsError) throw rewardsError;

    return NextResponse.json({
      message: "Daily rewards processed successfully",
      date: rewardDate,
      topMessages: top2.map((msg, index) => ({
        messageId: msg.id,
        walletAddress: msg.wallet_address,
        rank: index + 1,
        reactionCount: msg.reaction_count,
        rewardAmount: rewardAmounts[index] || 0,
      })),
    });
  } catch (error: any) {
    console.error("Error processing daily rewards:", error);
    return NextResponse.json(
      { error: "Failed to process daily rewards", details: error.message },
      { status: 500 }
    );
  }
}





