import { supabase } from '../supabaseClient';

// ─── UTILS ────────────────────────────────────────────────────────────

const generateUUID = () => {
  if (typeof crypto !== 'undefined' && crypto.randomUUID) return crypto.randomUUID();
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (c) => {
    const r = Math.random() * 16 | 0;
    const v = c === 'x' ? r : (r & 0x3 | 0x8);
    return v.toString(16);
  });
};

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
    const userId = user ? user.id : generateUUID();
    
    const { data, error } = await supabase.from('question_responses').upsert({
      user_id: userId,
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
    // Otimizado: Busca apenas contagens para os cards de topo
    const [usersCount, votesCount, questCount] = await Promise.all([
      supabase.from('users').select('*', { count: 'exact', head: true }),
      supabase.from('votes').select('*', { count: 'exact', head: true }),
      supabase.from('question_responses').select('*', { count: 'exact', head: true })
    ]);
    
    // Busca dados agrupados (ainda em memória por limitações do Client JS sem RPC, mas com select parcial)
    const [votesRes, questRes] = await Promise.all([
      supabase.from('votes').select('ai_name'),
      supabase.from('question_responses').select('use_for_study, use_for_work, work_area, where_use_ai, why_use_ai')
    ]);
    
    const totalUsers = usersCount.count || 0;
    const totalVotes = votesCount.count || 0;
    const totalResponses = questCount.count || 0;
    
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
        const trimLoc = loc.trim();
        if (trimLoc) acc[trimLoc] = (acc[trimLoc] || 0) + 1;
      });
      return acc;
    }, {});

    const whyUseAi = (questRes.data || []).reduce((acc, r) => {
      (r.why_use_ai || '').split(',').forEach(reason => {
        const trimReason = reason.trim();
        if (trimReason) acc[trimReason] = (acc[trimReason] || 0) + 1;
      });
      return acc;
    }, {});
    
    // 3. Votos Recentes
    const { data: recentRes } = await supabase
      .from('votes')
      .select('ai_name, voted_at, users(name)')
      .order('voted_at', { ascending: false })
      .limit(6);
    
    const recentVotes = (recentRes || []).map(v => ({
      userName: v.users?.name || 'Votante',
      aiName: v.ai_name,
      votedAt: v.voted_at
    }));
    
    return {
      data: {
        totalUsers, totalVotes, totalResponses,
        useForStudy, useForWork, votesByAi,
        workAreas, whereUseAi, whyUseAi, recentVotes
      }
    };
  },
};

// ─── PARTICIPATION ────────────────────────────────────────────────────

export const participationAPI = {
  submit: async (payload) => {
    console.log("🚀 Iniciando submissão de participação...", payload);
    const { data: { user } } = await supabase.auth.getUser();
    
    // Fallback robusto para gerar UUID v4 válido se crypto.randomUUID não existir
    const generateUUID = () => {
      if (typeof crypto !== 'undefined' && crypto.randomUUID) return crypto.randomUUID();
      return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (c) => {
        const r = Math.random() * 16 | 0;
        const v = c === 'x' ? r : (r & 0x3 | 0x8);
        return v.toString(16);
      });
    };

    const userId = user ? user.id : generateUUID();

    // 1. Registra ou Atualiza o perfil do usuário (Logado ou Anônimo)
    // Garantimos o e-mail para satisfazer restrições NOT NULL do banco
    const userEmail = user?.email || `${userId.substring(0, 8)}@anon.aivote.com`;
    
    const { error: userErr } = await supabase.from('users').upsert({
      id: userId,
      name: payload.fullName,
      email: userEmail,
      course: payload.course,
      institution: payload.institution,
      instagram: payload.instagram,
      role: user ? (user.app_metadata?.role || 'voter') : 'voter'
    }, { onConflict: 'id' });
    
    if (userErr) {
      console.warn("⚠️ Perfil não pôde ser sincronizado:", userErr.message);
      // Se for um erro crítico de RLS/Constraint que impeça o FK em 'votes', 
      // o erro será capturado no passo seguinte (votos).
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
    // Otimizado: Busca usuários com contagens relacionadas via Supabase
    const { data: users, error: userErr } = await supabase
      .from('users')
      .select('*, votes(count), question_responses(count)')
      .order('name');
    
    if (userErr) throw new Error(userErr.message);
    
    const enrichedUsers = users.map(u => ({
      ...u,
      hasVoted: (u.votes?.[0]?.count || 0) > 0,
      hasAnswered: (u.question_responses?.[0]?.count || 0) > 0
    }));
    
    return { data: enrichedUsers };
  },
  
  getReport: async () => {
    // Otimizado: Busca apenas colunas necessárias e usa agregação
    const [usersRes, votesRes, questsRes] = await Promise.all([
      supabase.from('users').select('id, name, course, institution'),
      supabase.from('votes').select('user_id, ai_name'),
      supabase.from('question_responses').select('user_id, work_area, why_use_ai')
    ]);
    
    const users = usersRes.data || [];
    const votes = votesRes.data || [];
    const quests = questsRes.data || [];
    
    const voterIds = new Set(votes.map(v => v.user_id));
    const totalUsersVoted = voterIds.size;
    
    const aiNames = [...new Set(votes.map(v => v.ai_name))];
    const aiReports = aiNames.map(name => {
      const aiVotes = votes.filter(v => v.ai_name === name);
      const aiVoterIds = new Set(aiVotes.map(v => v.user_id));
      const aiUsers = users.filter(u => aiVoterIds.has(u.id));
      const aiQuests = quests.filter(q => aiVoterIds.has(q.user_id));
      
      const areas = aiQuests.reduce((acc, q) => {
        acc[q.work_area || 'Outros'] = (acc[q.work_area || 'Outros'] || 0) + 1;
        return acc;
      }, {});
      const topWorkAreas = Object.entries(areas).sort((a,b)=>b[1]-a[1]).slice(0, 3).map(([k])=>k);

      const reasons = aiQuests.reduce((acc, q) => {
        (q.why_use_ai || '').split(',').forEach(r => {
          const trimR = r.trim();
          if (trimR) acc[trimR] = (acc[trimR] || 0) + 1;
        });
        return acc;
      }, {});
      const topReasons = Object.entries(reasons).sort((a,b)=>b[1]-a[1]).slice(0, 3).map(([k])=>k);
      
      return {
        aiName: name,
        totalVotes: aiVotes.length,
        topWorkAreas,
        topReasons,
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

