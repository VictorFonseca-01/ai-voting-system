
const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = 'https://nkutcrkiqfjuerzeazcc.supabase.co';
const supabaseAnonKey = 'sb_publishable_XZxqzDP_c3AprBYk6j4yRA_Wg9ixawv'; 
const supabase = createClient(supabaseUrl, supabaseAnonKey);

async function fix() {
  console.log("Iniciando correção do nome do Administrador...");
  
  // Atualiza na tabela pública 'users' que o frontend usa para exibir a lista
  const { data, error } = await supabase
    .from('users')
    .update({ name: 'Administrador' })
    .or('email.eq.admin@aivoting.com,email.eq.vitor@vfonseca.com');

  if (error) {
    console.log("Erro ao atualizar:", error.message);
  } else {
    console.log("Sucesso! Nome alterado para 'Administrador' no banco de dados.");
  }
}

fix();
