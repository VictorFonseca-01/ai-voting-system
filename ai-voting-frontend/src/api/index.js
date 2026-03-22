import { supabase } from '../supabaseClient';

// ─── AUTH ─────────────────────────────────────────────────────────────

export const authAPI = {
  register: async ({ email, password, ...rest }) => {
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: { data: { ...rest, role: 'ROLE_USER' } }
    });
    if (error) throw new Error(error.message);
    return { data: { user: { ...data.user, ...data.user.user_metadata }, token: data.session?.access_token } };
  },
  login: async ({ email, password }) => {
    const { data, error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) throw new Error("Email ou senha inválidos");
    return { data: { user: { ...data.user, ...data.user.user_metadata }, token: data.session.access_token } };
  },
  logout: async () => supabase.auth.signOut()
};

// ─── VOTES ────────────────────────────────────────────────────────────

export const votesAPI = {
  // Verifica se o usuário logado já votou
  checkStatus: async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return { data: { hasVoted: false } };

    const { data, error } = await supabase
      .from('votes')
      .select('ai_name')
      .eq('user_id', user.id);

    if (error) throw new Error(error.message);
    return { data: { hasVoted: data.length > 0, votes: data.map(v => v.ai_name) } };
  },

  getMyVotes: async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return { data: [] };
    const { data, error } = await supabase.from('votes').select('ai_name').eq('user_id', user.id);
    if (error) throw new Error(error.message);
    return { data: data.map(v => v.ai_name) };
  },
};

// ─── QUESTIONNAIRE ────────────────────────────────────────────────────

export const questionnaireAPI = {
  submit: async (responses) => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error("Não autenticado");
    
    const { data, error } = await supabase.from('question_responses').insert({
      user_id: user.id,
      work_area: responses.workArea,
      where_use_ai: responses.whereUseAi,
      why_use_ai: responses.whyUseAi,
      how_use_ai: responses.howUseAi,
      use_for_study: responses.useForStudy,
      use_for_work: responses.useForWork,
      work_area_other: responses.workAreaOther
    });
    if (error) throw new Error(error.message);
    return { data };
  },
  getStatus: async () => {
    return { data: { general: [], detailed: [] } }; // Mocked or implement later
  },
  getMyResponse: async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return { data: null };
    const { data, error } = await supabase.from('question_responses').select('*').eq('user_id', user.id).single();
    if (error && error.code !== 'PGRST116') throw new Error(error.message);
    return { data };
  },
};

// ─── DASHBOARD ────────────────────────────────────────────────────────

export const dashboardAPI = {
  getData: async () => {
    // Busca dados no Supabase para o Dashboard
    const [usersRes, votesRes, questRes] = await Promise.all([
      supabase.from('users').select('*', { count: 'exact', head: true }),
      supabase.from('votes').select('ai_name'),
      supabase.from('question_responses').select('*')
    ]);
    
    const totalUsers = usersRes.count || 0;
    const totalVotes = votesRes.data ? votesRes.data.length : 0;
    const totalResponses = questRes.data ? questRes.data.length : 0;
    
    // 1. Contagem de votos por IA
    const votesByAi = (votesRes.data || []).reduce((acc, v) => {
      acc[v.ai_name] = (acc[v.ai_name] || 0) + 1;
      return acc;
    }, {});
    
    // 2. Estatísticas do Questionário
    const useForStudy = (questRes.data || []).filter(r => r.use_for_study).length;
    const useForWork = (questRes.data || []).filter(r => r.use_for_work).length;
    
    const workAreas = (questRes.data || []).reduce((acc, r) => {
      const area = r.work_area || 'Outros';
      acc[area] = (acc[area] || 0) + 1;
      return acc;
    }, {});

    const whereUseAi = (questRes.data || []).reduce((acc, r) => {
      (r.where_use_ai || '').split(',').forEach(loc => {
        if (loc) acc[loc] = (acc[loc] || 0) + 1;
      });
      return acc;
    }, {});

    const whyUseAi = (questRes.data || []).reduce((acc, r) => {
      (r.why_use_ai || '').split(',').forEach(reason => {
        if (reason) acc[reason] = (acc[reason] || 0) + 1;
      });
      return acc;
    }, {});
    
    // 3. Votos Recentes (Join com a tabela users)
    const { data: recentRes, error: recentErr } = await supabase
      .from('votes')
      .select('id, ai_name, voted_at, user_id, users(name, course)')
      .order('voted_at', { ascending: false })
      .limit(10);
    
    const recentVotes = (recentRes || []).map(v => ({
      id: v.id,
      userName: v.users?.name || 'Votante',
      userCourse: v.users?.course || 'Não informado',
      aiName: v.ai_name,
      votedAt: v.voted_at
    }));
    
    return {
      data: {
        totalUsers,
        totalVotes,
        totalResponses,
        useForStudy,
        useForWork,
        votesByAi,
        workAreas,
        whereUseAi,
        whyUseAi,
        recentVotes
      }
    };
  },
};

// ─── PARTICIPATION ────────────────────────────────────────────────────

export const participationAPI = {
  submit: async (payload) => {
    // Tenta pegar usuário logado (ex: admin)
    const { data: { user } } = await supabase.auth.getUser();
    
    // Se não houver usuário, gera um ID único para este voto (Visitante)
    const userId = user ? user.id : (crypto.randomUUID ? crypto.randomUUID() : `guest_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`);

    // 1. Registra o usuário (ou atualiza se logado)
    if (user) {
      const { error: userErr } = await supabase.from('users').update({
        name: payload.fullName,
        course: payload.course,
        institution: payload.institution,
        instagram: payload.instagram
      }).eq('id', user.id);
      if (userErr) throw new Error("Erro ao atualizar perfil");
    } else {
      const { error: userErr } = await supabase.from('users').insert({
        id: userId,
        name: payload.fullName,
        course: payload.course,
        institution: payload.institution,
        instagram: payload.instagram
      });
      if (userErr) throw new Error("Erro ao registrar participação anônima");
    }

    // 2. Registra os votos
    const voteInserts = payload.aiNames.map(name => ({
      user_id: userId,
      ai_name: name
    }));
    const { error: voteErr } = await supabase.from('votes').insert(voteInserts);
    if (voteErr) throw new Error("Erro ao registrar votos");

    // 3. Salva questionário
    const { error: questErr } = await supabase.from('question_responses').upsert({
      user_id: userId,
      work_area: payload.workArea,
      where_use_ai: payload.whereUseAi,
      why_use_ai: payload.whyUseAi,
      how_use_ai: payload.howUseAi,
      use_for_study: payload.useForStudy,
      use_for_work: payload.useForWork,
      work_area_other: payload.workAreaOther
    });
    if (questErr) throw new Error("Erro ao registrar questionário");

    return { data: { success: true } };
  },
};

// ─── ADMIN ────────────────────────────────────────────────────────────

export const adminAPI = {
  getUsers: async () => {
    // Busca todos os usuários e verifica se já votaram/responderam
    const { data: users, error: userErr } = await supabase.from('users').select('*');
    const { data: votes } = await supabase.from('votes').select('user_id');
    const { data: quests } = await supabase.from('question_responses').select('user_id');
    
    if (userErr) throw new Error(userErr.message);
    
    const votedIds = new Set(votes?.map(v => v.user_id));
    const questIds = new Set(quests?.map(q => q.user_id));
    
    const enrichedUsers = users.map(u => ({
      ...u,
      hasVoted: votedIds.has(u.id),
      hasAnswered: questIds.has(u.id)
    }));
    
    return { data: enrichedUsers };
  },
  
  getReport: async () => {
    // Gera o relatório completo agregando dados do Supabase
    const [usersRes, votesRes, questsRes] = await Promise.all([
      supabase.from('users').select('*'),
      supabase.from('votes').select('*'),
      supabase.from('question_responses').select('*')
    ]);
    
    const users = usersRes.data || [];
    const votes = votesRes.data || [];
    const quests = questsRes.data || [];
    
    const totalUsersVoted = new Set(votes.map(v => v.user_id)).size;
    
    // Agrupa votos por IA
    const aiNames = [...new Set(votes.map(v => v.ai_name))];
    const aiReports = aiNames.map(name => {
      const aiVotes = votes.filter(v => v.ai_name === name);
      const voterIds = new Set(aiVotes.map(v => v.user_id));
      const aiUsers = users.filter(u => voterIds.has(u.id));
      const aiQuests = quests.filter(q => voterIds.has(q.user_id));
      
      // Top áreas e motivos (simplificado)
      const areas = aiQuests.reduce((acc, q) => {
        acc[q.work_area || 'Outros'] = (acc[q.work_area || 'Outros'] || 0) + 1;
        return acc;
      }, {});
      const topWorkAreas = Object.entries(areas).sort((a,b)=>b[1]-a[1]).slice(0, 3).map(([k])=>k);
      
      return {
        aiName: name,
        totalVotes: aiVotes.length,
        topWorkAreas,
        topReasons: [], // Pode ser implementado similarmente
        users: aiUsers.map(u => ({ name: u.name, institution: u.institution, course: u.course }))
      };
    });
    
    return { data: { totalUsersVoted, aiReports } };
  },
  
  resetData: async () => {
    // Perigoso: Deleta todos os votos e respostas (RLS deve permitir apenas para admin)
    // No Supabase, isso geralmente é feito via SQL Editor ou chamadas individuais se permitido
    await supabase.from('votes').delete().neq('id', 0);
    await supabase.from('question_responses').delete().neq('id', 0);
    return { data: { success: true } };
  },
  
  deleteUser: async (id) => {
    // Nota: Deletar em public.users não deleta no Auth. 
    // Para deletar no Auth precisa da chave service_role ou Edge Function.
    const { error } = await supabase.from('users').delete().eq('id', id);
    if (error) throw new Error(error.message);
    return { data: { success: true } };
  },
  
  changePassword: async (newPassword) => {
    const { error } = await supabase.auth.updateUser({ password: newPassword });
    if (error) throw new Error(error.message);
    return { data: { success: true } };
  },
  
  resetMyAdminVotes: async () => {
    const { data: { user } } = await supabase.auth.getUser();
    await supabase.from('votes').delete().eq('user_id', user.id);
    await supabase.from('question_responses').delete().eq('user_id', user.id);
    return { data: { success: true } };
  },
  
  exportData: async () => {
    const { data } = await supabase.from('users').select('*, votes(*), question_responses(*)');
    return { data };
  },
  
  importData: async (data) => Promise.resolve({ data: {} }),
  fixStats: async () => Promise.resolve({ data: {} }),
};

export default { authAPI, votesAPI, questionnaireAPI, dashboardAPI, participationAPI, adminAPI };

