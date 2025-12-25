import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';

const supabase = createClient(supabaseUrl, supabaseAnonKey);

export async function DELETE(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const authHeader = req.headers.get('Authorization');
    if (!authHeader) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const token = authHeader.replace('Bearer ', '');
    const { data: userData, error: userError } = await supabase.auth.getUser(token);

    if (userError || !userData.user) {
      return NextResponse.json({ error: 'Invalid token' }, { status: 401 });
    }

    // Get payment details
    const { data: paymentData, error: getError } = await supabase
      .from('payments')
      .select('debt_id, amount')
      .eq('id', params.id)
      .single();

    if (getError || !paymentData) {
      return NextResponse.json({ error: 'Payment not found' }, { status: 404 });
    }

    // Verify debt belongs to user
    const { data: debtData, error: debtError } = await supabase
      .from('debts')
      .select('id, balance, principal')
      .eq('id', paymentData.debt_id)
      .eq('user_id', userData.user.id)
      .single();

    if (debtError || !debtData) {
      return NextResponse.json({ error: 'Debt not found' }, { status: 404 });
    }

    // Delete payment
    const { error: deleteError } = await supabase
      .from('payments')
      .delete()
      .eq('id', params.id);

    if (deleteError) {
      return NextResponse.json({ error: deleteError.message }, { status: 500 });
    }

    // Restore debt balance
    const newBalance = Math.min(
      debtData.principal,
      debtData.balance + paymentData.amount
    );
    const { error: updateError } = await supabase
      .from('debts')
      .update({
        balance: newBalance,
        updated_at: new Date().toISOString(),
      })
      .eq('id', paymentData.debt_id);

    if (updateError) {
      return NextResponse.json({ error: updateError.message }, { status: 500 });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error deleting payment:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
