import { NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabaseAdmin';

export async function POST(request: Request) {
    try {
        const body = await request.json();
        const { email, password, full_name, phone, role } = body;

        if (!email || !password) {
            return NextResponse.json({ error: 'Email y contraseña son requeridos' }, { status: 400 });
        }

        // 1. Create the user in Supabase Auth using the Admin API
        const { data: authData, error: authError } = await supabaseAdmin.auth.admin.createUser({
            email,
            password,
            email_confirm: true, // Auto-confirm email so they can log in immediately
            user_metadata: { full_name }
        });

        if (authError) {
            console.error('Supabase Admin Create User Error:', authError);
            return NextResponse.json({ error: authError.message }, { status: 400 });
        }

        const userId = authData.user.id;

        // 2. Create the user's profile in the `profiles` table using Admin API
        // Upsert is safer in case a trigger already created a basic profile
        const { error: profileError } = await supabaseAdmin
            .from('profiles')
            .upsert({
                id: userId,
                full_name: full_name || '',
                phone: phone || '',
                role: role || 'ayudante',
                status: 'active',
                email: email
            });

        if (profileError) {
            console.error('Supabase Admin Profile Insert Error:', profileError);
            return NextResponse.json({ error: profileError.message }, { status: 400 });
        }

        return NextResponse.json({ message: 'Usuario creado exitosamente', user: authData.user }, { status: 201 });
    } catch (error: any) {
        console.error('API /users POST Error:', error);
        return NextResponse.json({ error: 'Error interno del servidor' }, { status: 500 });
    }
}
