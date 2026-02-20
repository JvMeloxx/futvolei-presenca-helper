const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env' });

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseKey = process.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
    console.error("Missing Supabase env parameters");
    process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

const classesSeed = [
    // Segunda
    { day: 'Segunda', time: '8:30', instructor: 'João Silva', location: 'Quadra Central', max_participants: 16 },
    { day: 'Segunda', time: '17:00', instructor: 'Maria Oliveira', location: 'Quadra Central', max_participants: 16 },
    { day: 'Segunda', time: '18:30', instructor: 'Pedro Santos', location: 'Quadra Central', max_participants: 16 },
    { day: 'Segunda', time: '20:00', instructor: 'Carlos Ferreira', location: 'Quadra Lateral', max_participants: 12 },

    // Terça
    { day: 'Terça', time: '6:30', instructor: 'Ana Costa', location: 'Quadra Lateral', max_participants: 12 },
    { day: 'Terça', time: '8:00', instructor: 'João Silva', location: 'Quadra Central', max_participants: 16 },
    { day: 'Terça', time: '12:00', instructor: 'Pedro Santos', location: 'Quadra Central', max_participants: 16 },
    { day: 'Terça', time: '17:00', instructor: 'Maria Oliveira', location: 'Quadra Central', max_participants: 16 },
    { day: 'Terça', time: '18:30', instructor: 'Carlos Ferreira', location: 'Quadra Central', max_participants: 16 },
    { day: 'Terça', time: '20:00', instructor: 'Ana Costa', location: 'Quadra Lateral', max_participants: 12 },

    // Quarta
    { day: 'Quarta', time: '8:30', instructor: 'João Silva', location: 'Quadra Central', max_participants: 16 },
    { day: 'Quarta', time: '17:00', instructor: 'Maria Oliveira', location: 'Quadra Central', max_participants: 16 },
    { day: 'Quarta', time: '18:30', instructor: 'Pedro Santos', location: 'Quadra Central', max_participants: 16 },
    { day: 'Quarta', time: '20:00', instructor: 'Carlos Ferreira', location: 'Quadra Lateral', max_participants: 12 },

    // Quinta
    { day: 'Quinta', time: '6:30', instructor: 'Ana Costa', location: 'Quadra Lateral', max_participants: 12 },
    { day: 'Quinta', time: '8:00', instructor: 'João Silva', location: 'Quadra Central', max_participants: 16 },
    { day: 'Quinta', time: '12:00', instructor: 'Pedro Santos', location: 'Quadra Central', max_participants: 16 },
    { day: 'Quinta', time: '17:00', instructor: 'Maria Oliveira', location: 'Quadra Central', max_participants: 16 },
    { day: 'Quinta', time: '18:30', instructor: 'Carlos Ferreira', location: 'Quadra Central', max_participants: 16 },
    { day: 'Quinta', time: '20:00', instructor: 'Ana Costa', location: 'Quadra Lateral', max_participants: 12 }
];

async function runSeed() {
    console.log("Seeding Database...");
    // Clear classes first to avoid dupes?
    // Let's just insert
    const { data, error } = await supabase
        .from('classes')
        .insert(classesSeed);

    if (error) {
        console.error("Error inserting classes: ", error);
    } else {
        console.log("Successfully seeded", classesSeed.length, "classes.");
    }
}

runSeed();
