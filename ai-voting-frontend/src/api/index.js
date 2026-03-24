import { createClient } from '@supabase/supabase-js';
import { supabase } from '../supabaseClient';
import { hasInappropriateContent } from '../utils/moderation';

/**
 * Camada de API - Versão Supabase (Safe Mode)
 * Todas as operações são realizadas diretamente via SDK do Supabase.
 */

// ─── UTILS DE NORMALIZAÇÃO ─────────────────────────────────────────────
const AI_CANONICAL_MAP = {
  'chatgpt': 'ChatGPT',
  'gemini': 'Gemini',
  'claude': 'Claude',
  'grok': 'Grok',
  'meta': 'Meta AI',
  'copilot': 'Copilot',
  'deepseek': 'DeepSeek',
  'none': 'Não utilizo IA'
};

const normalizeAiName = (name) => {
  if (!name) return 'Indefinido';
  const clean = name.replace(/[\[\]"]/g, '').trim();
  const slug = clean.toLowerCase();
  return AI_CANONICAL_MAP[slug] || (clean.charAt(0).toUpperCase() + clean.slice(1));
};

const cleanLabel = (str) => {
  if (!str) return '';
  // Remove colchetes e aspas JSON
  return str.replace(/[\[\]"]/g, '').trim();
};

// ─── SEGURANÇA E AMBIENTE ─────────────────────────────────────────────
const ENV = process.env.NODE_ENV || 'development';
const isProduction = ENV === 'production';

/**
 * Registra ações críticas para auditoria.
 */
const logAuditAction = async (actionName, details = {}, result = 'success') => {
  try {
    const { data: { user } } = await supabase.auth.getUser();
    const logEntry = {
      user_id: user?.id || 'anonymous',
      user_email: user?.email || 'anonymous',
      action_name: actionName,
      details: JSON.stringify(details),
      environment: ENV,
      result: result,
      executed_at: new Date().toISOString()
    };

    console.log(`[AUDIT LOG] ${actionName}:`, logEntry);
    
    // Tenta persistir no Supabase (Requer tabela 'audit_logs')
    const { error } = await supabase.from('audit_logs').insert([logEntry]);
    if (error) console.warn("Aviso: Falha ao persistir log no banco (tabela pode não existir).");
    
    return true;
  } catch (err) {
    console.error("Erro ao gerar log de auditoria:", err);
    return false;
  }
};

// ─── AUTH ─────────────────────────────────────────────────────────────
export const authAPI = {
  register: async ({ email, password, name, course, institution, instagram }) => {
    // Moderação básica antes de enviar
    if (hasInappropriateContent(name) || hasInappropriateContent(course) || hasInappropriateContent(institution)) {
      throw new Error("Conteúdo inadequado detectado nos campos de cadastro.");
    }

    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: { name, course, institution, instagram, role: 'ROLE_USER' }
      }
    });
    if (error) throw error;
    return { data };
  },

  login: async ({ email, password }) => {
    const { data, error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) throw error;
    return { data: { ...data.user, ...data.user.user_metadata } };
  },

  logout: async () => {
    await supabase.auth.signOut();
  }
};

// ─── VOTES ────────────────────────────────────────────────────────────
export const votesAPI = {
  submit: async (aiNames, user = null, forceUserId = null) => {
    if (!user && !forceUserId) {
      const { data } = await supabase.auth.getUser();
      user = data?.user;
    }

    const targetId = forceUserId || user?.id;
    if (!targetId) throw new Error("ID de destino não identificado para o voto.");

    const votes = aiNames.map(ai => ({
      user_id: targetId,
      ai_name: ai,
      voted_at: new Date().toISOString()
    }));

    const { error } = await supabase.from('votes').insert(votes);
    if (error) throw error;
    return { data: { success: true } };
  },

  getMyVotes: async () => {
    const { data, error } = await supabase.from('votes').select('*');
    if (error) throw error;
    return { data };
  },

  checkStatus: async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return { data: { hasVoted: false, votes: [] } };

    const { data, error } = await supabase
      .from('votes')
      .select('ai_name')
      .eq('user_id', user.id);
      
    if (error) throw error;
    
    return { 
      data: { 
        hasVoted: data.length > 0,
        votes: data.map(v => v.ai_name)
      } 
    };
  }
};

// ─── QUESTIONNAIRE ────────────────────────────────────────────────────
export const questionnaireAPI = {
  submit: async (formData, user = null, forceUserId = null) => {
    if (!user && !forceUserId) {
      const { data } = await supabase.auth.getUser();
      user = data?.user;
    }

    const targetId = forceUserId || user?.id;
    if (!targetId) throw new Error("ID de destino não identificado para o questionário.");
    
    const payload = {
      user_id: targetId,
      where_use_ai: Array.isArray(formData.whereUseAi) ? formData.whereUseAi.join(', ') : (formData.whereUseAi || ''),
      why_use_ai: Array.isArray(formData.whyUseAi) ? formData.whyUseAi.join(', ') : (formData.whyUseAi || ''),
      how_use_ai: Array.isArray(formData.howUseAi) ? formData.howUseAi.join(', ') : (formData.howUseAi || ''),
      use_for_study: formData.useAiStudy || formData.useForStudy,
      use_for_work: formData.useAiWork || formData.useForWork,
      work_area: cleanLabel(formData.workArea),
      work_area_other: formData.workAreaOther,
      answered_at: new Date().toISOString()
    };

    const { error } = await supabase
      .from('question_responses')
      .upsert(payload, { onConflict: 'user_id' });
      
    if (error) throw error;
    return { data: { success: true } };
  },

  getStatus: async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return { data: { hasResponded: false } };

    const { count, error } = await supabase
      .from('question_responses')
      .select('*', { count: 'exact', head: true })
      .eq('user_id', user.id);
    if (error) throw error;
    return { data: { hasResponded: count > 0 } };
  }
};

// ─── DASHBOARD ────────────────────────────────────────────────────────
export const dashboardAPI = {
  getData: async () => {
    // Agregação client-side robusta para o dashboard
    const [votesRes, responsesRes, usersRes] = await Promise.all([
      supabase.from('votes').select('*').order('voted_at', { ascending: false }),
      supabase.from('question_responses').select('*'),
      supabase.from('users').select('id, name')
    ]);

    if (votesRes.error) throw votesRes.error;
    if (responsesRes.error) throw responsesRes.error;
    if (usersRes.error) throw usersRes.error;

    const votes = votesRes.data || [];
    const responses = responsesRes.data || [];
    const users = usersRes.data || [];
    const userMap = users.reduce((acc, u) => ({ 
      ...acc, 
      [u.id]: { name: u.name, course: u.course } 
    }), {});

    // 1. Participantes únicos que votaram (Excluindo Admin se possível)
    // Para simplificar, contamos todos e filtramos na exibição se necessário
    const uniqueVoters = new Set(votes.map(v => v.user_id));
    
    // 2. Ranking de IAs (Normalizado para evitar duplicidade Case-Sensitive)
    const votesByAi = votes.reduce((acc, v) => {
      const name = normalizeAiName(v.ai_name);
      acc[name] = (acc[name] || 0) + 1;
      return acc;
    }, {});

    // 3. Estatísticas de Uso
    const useForStudy = responses.filter(r => r.use_for_study === true).length;
    const useForWork = responses.filter(r => r.use_for_work === true).length;

    // 4. Área de Atuação (Sanitizada)
    const workAreas = responses.reduce((acc, r) => {
      let area = cleanLabel(r.work_area) || 'Outros';
      if (area === 'undefined' || area === 'null' || !area) area = 'Outros';
      acc[area] = (acc[area] || 0) + 1;
      return acc;
    }, {});

    // 5. Onde Usam IA (Sanitizada)
    const whereUseAi = responses.reduce((acc, r) => {
      const raw = r.where_use_ai || '';
      const locations = raw.split(',')
        .map(l => cleanLabel(l))
        .filter(l => l && l !== 'undefined' && l !== 'null');
      
      locations.forEach(l => {
        acc[l] = (acc[l] || 0) + 1;
      });
      return acc;
    }, {});

    // 6. Atividade Recente (Enriquecida para a Navbar e Dashboard)
      const responseCounts = responses?.reduce((acc, r) => {
        acc.total++;
        if (r.use_for_study) acc.study++;
        if (r.use_for_work) acc.work++;
        return acc;
      }, { total: 0, study: 0, work: 0 }) || { total: 0, study: 0, work: 0 };

      // Volume bruto de votos (cada registro conta)
      const totalRawVotes = votes?.length || 0;

      // Participantes únicos
      const totalUniqueVoters = new Set(votes?.map(v => v.user_id)).size;

    const recentVotes = votes.slice(0, 10).map(v => {
      const userData = userMap[v.user_id] || { name: 'Participante', course: 'Visitante' };
      return {
        id: v.id, // Necessário para o lastSeenId da Navbar
        userName: userData.name,
        userCourse: userData.course,
        aiName: normalizeAiName(v.ai_name),
        time: v.voted_at
      };
    });

    // Normaliza dados para o frontend (camelCase)
    return {
      data: {
        totalVotes: totalRawVotes, // Volume bruto (ex: 18)
        totalUniqueVoters,       // Participantes únicos (ex: 9)
        totalResponses: responseCounts.total,
        useForStudy: responseCounts.study,
        useForWork: responseCounts.work,
        votesByAi,
        whereUseAi,
        workAreas,
        recentVotes
      }
    };
  }
};

// ─── ADMIN ────────────────────────────────────────────────────────────
export const adminAPI = {
  getUsers: async ({ page = 1, pageSize = 10, search = '', filters = {}, sort = { column: 'name', ascending: true } } = {}) => {
    let query = supabase.from('users').select('*', { count: 'exact' });

    // 1. Busca (Nome, Curso, Email)
    if (search) {
      query = query.or(`name.ilike.%${search}%,email.ilike.%${search}%,course.ilike.%${search}%`);
    }

    // 2. Filtros
    if (filters.role) {
      query = query.eq('role', filters.role);
    }
    
    // Filtros de Voto/Questionário exigem cruzamento ou flags na tabela users
    // Para performance SaaS, o ideal é que essas flags existam na tabela 'users'
    // Como o sistema atual as calcula dinamicamente, vamos manter a lógica de cruzamento 
    // mas limitada aos usuários da página atual.

    // 3. Ordenação
    query = query.order(sort.column, { ascending: sort.ascending });

    // 4. Paginação
    const from = (page - 1) * pageSize;
    const to = from + pageSize - 1;
    query = query.range(from, to);

    const { data: users, count, error: uErr } = await query;
    if (uErr) throw uErr;

    // Busca status de participação apenas para os usuários retornados na página
    const userIds = users.map(u => u.id);
    const [votesRes, responsesRes] = await Promise.all([
      supabase.from('votes').select('user_id').in('user_id', userIds),
      supabase.from('question_responses').select('user_id').in('user_id', userIds)
    ]);

    const votedIds = new Set((votesRes.data || []).map(v => v.user_id));
    const answeredIds = new Set((responsesRes.data || []).map(r => r.user_id));

    let finalData = users.map(u => ({
      ...u,
      hasVoted: votedIds.has(u.id),
      hasAnswered: answeredIds.has(u.id),
      role: (u.email === 'vitor@vfonseca.com' || u.email === 'admin@aivoting.com') ? 'ROLE_ADMIN' : u.role || 'ROLE_USER'
    }));

    // Filtro de participação (se aplicado)
    if (filters.status) {
      if (filters.status === 'voted') finalData = finalData.filter(u => u.hasVoted);
      if (filters.status === 'not_voted') finalData = finalData.filter(u => !u.hasVoted);
      if (filters.status === 'answered') finalData = finalData.filter(u => u.hasAnswered);
      if (filters.status === 'not_answered') finalData = finalData.filter(u => !u.hasAnswered);
    }

    return {
      data: finalData,
      totalCount: count
    };
  },

  updateUser: async (userId, updateData) => {
    // Proteção: Admin não pode ter nome/email alterado por aqui para preservar identidade
    const { data: user } = await supabase.from('users').select('email, role').eq('id', userId).single();
    
    if (user?.email === 'vitor@vfonseca.com' || user?.email === 'admin@aivoting.com' || user?.role === 'ROLE_ADMIN') {
      // Impede renomear admin, permite apenas outros campos se necessário (futuro)
      delete updateData.name;
      delete updateData.role;
    }

    const { data, error } = await supabase.from('users').update(updateData).eq('id', userId);
    if (error) throw error;
    return { data, success: true };
  },

  deleteUser: async (userId) => {
    // Proteção: Não deletar admin
    const { data: user } = await supabase.from('users').select('email, role').eq('id', userId).single();
    if (user?.email === 'vitor@vfonseca.com' || user?.email === 'admin@aivoting.com' || user?.role === 'ROLE_ADMIN') {
      throw new Error("O Administrador não pode ser excluído.");
    }

    await Promise.all([
      supabase.from('votes').delete().eq('user_id', userId),
      supabase.from('question_responses').delete().eq('user_id', userId),
      supabase.from('users').delete().eq('id', userId)
    ]);
    return { data: { success: true } };
  },

  deleteUsers: async (userIds) => {
    // Busca e filtra admins para segurança redundante
    const { data: admins } = await supabase.from('users')
      .select('id')
      .or('email.eq.vitor@vfonseca.com,email.eq.admin@aivoting.com,role.eq.ROLE_ADMIN');
    
    const adminIds = new Set(admins?.map(a => a.id) || []);
    const safeIds = userIds.filter(id => !adminIds.has(id));

    if (safeIds.length === 0) return { success: true, count: 0 };

    await Promise.all([
      supabase.from('votes').delete().in('user_id', safeIds),
      supabase.from('question_responses').delete().in('user_id', safeIds),
      supabase.from('users').delete().in('id', safeIds)
    ]);

    return { data: { success: true }, count: safeIds.length };
  },

  resetData: async () => {
    await logAuditAction('RESET_SYSTEM_ATTEMPT', { isProduction });

    // BLOQUEIO POR AMBIENTE
    if (!isProduction) {
      console.log("Simulando RESET no ambiente de desenvolvimento.");
      return { data: { success: true, simulated: true, message: "Modo de teste: ação simulada" } };
    }

    // Apaga tudo exceto o admin
    const { data: admin } = await supabase.from('users').select('id').or('email.eq.vitor@vfonseca.com,email.eq.admin@aivoting.com').single();
    
    const adminId = admin?.id;
    
    await Promise.all([
      supabase.from('votes').delete().neq('user_id', adminId || '00000000-0000-0000-0000-000000000000'),
      supabase.from('question_responses').delete().neq('user_id', adminId || '00000000-0000-0000-0000-000000000000'),
      supabase.from('users').delete().neq('email', 'vitor@vfonseca.com').neq('email', 'admin@aivoting.com')
    ]);

    await logAuditAction('RESET_SYSTEM_SUCCESS', { isProduction });
    return { data: { success: true } };
  },

  resetMyAdminVotes: async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (user) {
      await Promise.all([
        supabase.from('votes').delete().eq('user_id', user.id),
        supabase.from('question_responses').delete().eq('user_id', user.id)
      ]);
    }
    return { data: { success: true } };
  },

  changePassword: async (newPassword) => {
    await logAuditAction('CHANGE_ADMIN_PASSWORD', { isProduction });
    const { error } = await supabase.auth.updateUser({ password: newPassword });
    if (error) {
      await logAuditAction('CHANGE_ADMIN_PASSWORD_ERROR', { error: error.message });
      throw error;
    }
    return { data: { success: true } };
  },

  exportData: async () => {
    await logAuditAction('EXPORT_BACKUP', { isProduction });
    const [u, v, q] = await Promise.all([
      supabase.from('users').select('*'),
      supabase.from('votes').select('*'),
      supabase.from('question_responses').select('*')
    ]);
    return { data: { users: u.data, votes: v.data, responses: q.data } };
  },

  importData: async (backup) => {
    await logAuditAction('IMPORT_BACKUP_ATTEMPT', { isProduction });

    // BLOQUEIO POR AMBIENTE
    if (!isProduction) {
      console.log("Simulando IMPORT no ambiente de desenvolvimento.");
      return { data: { success: true, simulated: true, message: "Modo de teste: ação simulada" } };
    }

    const { users, votes, responses } = backup;
    
    // 1. Limpa tabelas (Preservando Admin se estiver no backup)
    await Promise.all([
      supabase.from('votes').delete().neq('ai_name', 'PROTECTED'),
      supabase.from('question_responses').delete().neq('work_area', 'PROTECTED'),
      supabase.from('users').delete().neq('role', 'ROLE_ADMIN')
    ]);

    // 2. Insere novos dados em blocos
    if (users?.length) await supabase.from('users').upsert(users);
    if (votes?.length) await supabase.from('votes').insert(votes);
    if (responses?.length) await supabase.from('question_responses').insert(responses);

    await logAuditAction('IMPORT_BACKUP_SUCCESS', { isProduction });
    return { data: { success: true } };
  },

  getReport: async () => {
    // Busca dados base
    const [votesRes, responsesRes, usersRes] = await Promise.all([
      supabase.from('votes').select('*'),
      supabase.from('question_responses').select('*'),
      supabase.from('users').select('*')
    ]);

    if (votesRes.error) throw votesRes.error;
    if (responsesRes.error) throw responsesRes.error;
    if (usersRes.error) throw usersRes.error;

    const votes = votesRes.data || [];
    const responses = responsesRes.data || [];
    const users = usersRes.data || [];

    const userMap = users.reduce((acc, u) => ({ ...acc, [u.id]: u }), {});
    const respMap = responses.reduce((acc, r) => ({ ...acc, [r.user_id]: r }), {});

    // Agrupamento por IA (Normalizado e Limpo)
    const aiGroups = votes.reduce((acc, v) => {
      const name = normalizeAiName(v.ai_name);
      if (!acc[name]) acc[name] = { aiName: name, votes: [] };
      acc[name].votes.push(v);
      return acc;
    }, {});

    const aiReports = Object.values(aiGroups).map(group => {
      const groupUsers = group.votes.map(v => userMap[v.user_id]).filter(Boolean);
      const groupResponses = group.votes.map(v => respMap[v.user_id]).filter(Boolean);

      // Top Áreas (Frequência Sanitizada)
      const areas = groupResponses.reduce((acc, r) => {
        const a = cleanLabel(r.work_area) || 'Outros';
        acc[a] = (acc[a] || 0) + 1;
        return acc;
      }, {});
      const topWorkAreas = Object.entries(areas).sort((a,b)=>b[1]-a[1]).slice(0, 3).map(a=>a[0]);

      // Top Motivos (Pode vir de whyUseAi ou useForStudy/Work)
      const reasons = groupResponses.reduce((acc, r) => {
        if (r.use_for_study) acc['Estudo'] = (acc['Estudo'] || 0) + 1;
        if (r.use_for_work) acc['Trabalho'] = (acc['Trabalho'] || 0) + 1;
        return acc;
      }, {});
      const topReasons = Object.entries(reasons).sort((a,b)=>b[1]-a[1]).slice(0, 2).map(a=>a[0]);

      return {
        aiName: group.aiName,
        totalVotes: group.votes.length,
        topWorkAreas,
        topReasons,
        users: groupUsers.slice(0, 50).map(u => ({
          name: u.name || 'Anônimo',
          institution: u.institution || 'N/A',
          course: u.course || 'N/A'
        }))
      };
    });

    return {
      data: {
        totalUsersVoted: new Set(votes.map(v => v.user_id)).size,
        aiReports: aiReports.sort((a,b) => b.totalVotes - a.totalVotes)
      }
    };
  }
};

// ─── PARTICIPATION ───────────────────────────────────────────────────
export const participationAPI = {
  submit: async (payload) => {
    const { aiNames, fullName, course, institution, instagram, ...questData } = payload;
    try {
      const { data: { user } } = await supabase.auth.getUser();
      const isAdmin = user?.email === 'admin@aivoting.com' || 
                      user?.email === 'vitor@vfonseca.com' ||
                      user?.user_metadata?.role === 'ROLE_ADMIN';
      
      let targetUserId = user?.id;

      // SEPARAÇÃO CRÍTICA DO ADMIN
      // Se for Admin, criamos um NOVO USUÁRIO GUEST (real no auth) para não quebrar FK e não sobrescrever admin.
      if (isAdmin) {
        console.log(`[ADMIN TEST] Criando participante separado para: ${fullName}`);
        const tempId = Math.random().toString(36).substring(7);
        const tempEmail = `test_${Date.now()}_${tempId}@aivoting.teste`;
        
        // Criamos um cliente secundário para não deslogar o admin atual
        const supabaseUrl = process.env.REACT_APP_SUPABASE_URL || 'https://nkutcrkiqfjuerzeazcc.supabase.co';
        const supabaseAnonKey = process.env.REACT_APP_SUPABASE_ANON_KEY || 'sb_publishable_XZxqzDP_c3AprBYk6j4yRA_Wg9ixawv';
        const tempClient = createClient(supabaseUrl, supabaseAnonKey);
        
        const { data: signUpData, error: signUpError } = await tempClient.auth.signUp({
          email: tempEmail,
          password: 'Test_Participation_Password_123!',
          options: {
            data: { name: fullName, course, institution, instagram, role: 'ROLE_USER' }
          }
        });
        
        if (signUpError) {
          console.warn("Falha ao criar guest via Auth, tentando direto em users (pode falhar FK):", signUpError.message);
          // Fallback para UUID se FK estiver desativada ou for opcional
          targetUserId = '00000000-0000-4000-a000-' + Math.floor(Math.random() * 1000000000).toString(16).padStart(12, '0');
        } else {
          targetUserId = signUpData.user.id;
        }
      }

      // Se for votação anônima (sem user e sem ser teste de admin)
      if (!targetUserId && !isAdmin && fullName) {
          const guestId = Math.random().toString(36).substring(7);
          const guestEmail = `guest_${Date.now()}_${guestId}@aivote.com`;
          const { data: guestData } = await supabase.auth.signUp({
            email: guestEmail,
            password: 'Guest_Participation_123!',
            options: { data: { name: fullName, course, institution, instagram } }
          });
          targetUserId = guestData.user?.id;
      }

      // Moderação de Conteúdo
      const allTexts = [...aiNames, fullName, course, institution, instagram, questData.workAreaOther];
      for (const t of allTexts) {
        if (t && typeof t === 'string' && hasInappropriateContent(t)) {
          throw new Error("Conteúdo inadequado detectado.");
        }
      }

      // Persistência na tabela pública (Participantes)
      // Se for ADMIN, fazemos INSERT em vez de UPSERT se possível para garantir novo registro
      // mas o targetUserId sendo novo já cuida disso.
      const { error: userError } = await supabase.from('users').upsert({
        id: targetUserId,
        name: isAdmin ? fullName : (fullName || user?.user_metadata?.name),
        course: course || user?.user_metadata?.course,
        institution: institution || user?.user_metadata?.institution,
        instagram: instagram || user?.user_metadata?.instagram,
        email: isAdmin ? `test_vote_${targetUserId}@aivote.com` : (user?.email || `anon_${targetUserId}@aivote.com`),
        role: 'ROLE_USER'
      });

      if (userError) throw new Error("Erro ao registrar participante: " + userError.message);

      // Votos e Questionário vinculados ao targetUserId
      await Promise.all([
        votesAPI.submit(aiNames, null, targetUserId),
        questionnaireAPI.submit(questData, null, targetUserId)
      ]);
      
      return { data: { success: true } };
    } catch (err) {
      console.error("ERRO CRÍTICO NA SUBMISSÃO:", err);
      throw new Error(err.message || "Falha técnica ao salvar participação.");
    }
  }
};

export { supabase };

const mainApi = {
  authAPI,
  dashboardAPI,
  adminAPI,
  votesAPI,
  questionnaireAPI,
  participationAPI,
  supabase
};

export default mainApi;
