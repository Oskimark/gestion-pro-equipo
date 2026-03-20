import { createClient } from '@supabase/supabase-js';

const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!);

async function test() {
    const { data, error } = await supabase.from('payments').insert([{
        player_id: 'a0f28e23-7fa0-48e0-bbdc-9ad4f128d5d4', // Assuming a random UUID format will throw foreign key or missing column first
        amount: 100,
        category: 'Cuota Club', // Or 'Pago Anual'
        status: 'Pagado',
        period_month: 3,
        period_year: 2026,
        due_date: new Date().toISOString()
    }]);
    console.log("Result:", error || data);
}

test();
