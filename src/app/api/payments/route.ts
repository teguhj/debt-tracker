import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';

const supabase = createClient(supabaseUrl, supabaseAnonKey);

export async function GET(req: NextRequest) {
  try {
    const authHeader = req.headers.get('Authorization');
    if (!authHeader) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    let userId: string | null = null;
    const token = authHeader.replace('Bearer ', '');
    const { data: userData, error: userError } = await supabase.auth.getUser(token);

    if (!userError && userData.user) {
      userId = userData.user.id;
    } else {
      userId = process.env.NEXT_PUBLIC_DEFAULT_USER_ID || null;
    }

    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Get all payments for user's debts
    const { data, error } = await supabase
      .from('payments')
      .select(`
        *,
        debt_id:debts(user_id)
      `)
      .order('created_at', { ascending: false });

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    // Filter payments for current user's debts
    const userPayments = data?.filter(
      (payment: any) => payment.debt_id?.user_id === userId
    ) || [];

    return NextResponse.json(userPayments);
  } catch (error) {
    console.error('Error fetching payments:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function POST(req: NextRequest) {
  try {
    const authHeader = req.headers.get('Authorization');
    if (!authHeader) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    let userId: string | null = null;
    const token = authHeader.replace('Bearer ', '');
    const { data: userData, error: userError } = await supabase.auth.getUser(token);

    if (!userError && userData.user) {
      userId = userData.user.id;
    } else {
      userId = process.env.NEXT_PUBLIC_DEFAULT_USER_ID || null;
    }

    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await req.json();
    const { debt_id, amount, date } = body;

    // Verify debt belongs to user
    const { data: debtData, error: debtError } = await supabase
      .from('debts')
      .select('id, balance')
      .eq('id', debt_id)
      .eq('user_id', userId)
      .single();

    if (debtError || !debtData) {
      return NextResponse.json({ error: 'Debt not found' }, { status: 404 });
    }

    // Create payment
    const { data: paymentData, error: paymentError } = await supabase
      .from('payments')
      .insert([
        {
          debt_id,
          amount,
          date,
        },
      ])
      .select();

    if (paymentError) {
      return NextResponse.json({ error: paymentError.message }, { status: 500 });
    }

    // Update debt balance
    const newBalance = Math.max(0, debtData.balance - amount);
    const { error: updateError } = await supabase
      .from('debts')
      .update({
        balance: newBalance,
        updated_at: new Date().toISOString(),
      })
      .eq('id', debt_id);

    if (updateError) {
      return NextResponse.json({ error: updateError.message }, { status: 500 });
    }

    return NextResponse.json(paymentData[0], { status: 201 });
  } catch (error) {
    console.error('Error creating payment:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
