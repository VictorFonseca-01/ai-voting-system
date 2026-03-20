import React, { useState, useEffect } from 'react';
import { adminAPI } from '../api';

export default function ReportPage() {
  const [reportData, setReportData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [modalConfig, setModalConfig] = useState({ title: '', message: '', onConfirm: null, type: 'confirm' });

  const fetchReport = async () => {
    try {
      const { data } = await adminAPI.getReport();
      setReportData(data);
    } catch (err) {
      setError('Erro ao carregar o relatório. Apenas administradores podem acessar esta página.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchReport();
  }, []);

  if (loading) return <div style={{ padding: '50px', textAlign: 'center', fontFamily: 'sans-serif' }}>Carregando relatório...</div>;
  if (error) return <div style={{ padding: '50px', color: 'red', fontFamily: 'sans-serif' }}>{error}</div>;

  const handlePrint = () => {
    window.print();
  };

  const confirmReset = async () => {
    setShowModal(false);
    try {
      await adminAPI.resetData();
      setModalConfig({
        title: 'Sucesso! ✨',
        message: 'Sistema reiniciado com sucesso. Os votos e os usuários de teste foram zerados!',
        type: 'alert'
      });
      setShowModal(true);
      fetchReport(); 
    } catch (err) {
      setModalConfig({
        title: 'Erro ❌',
        message: 'Ocorreu um erro ao tentar zerar os dados.',
        type: 'alert'
      });
      setShowModal(true);
    }
  };

  const handleResetData = () => {
    setModalConfig({
      title: 'CUIDADO: Zerar Sistema',
      message: 'Isso apagará TODOS os votos, contas e questionários! O admin padrão será recriado. Deseja continuar?',
      onConfirm: confirmReset,
      type: 'confirm'
    });
    setShowModal(true);
  };

  const currentDate = new Date().toLocaleString('pt-BR');

  return (
    <div className="printable-report">
      {/* Botões visíveis apenas na tela */}
      <div className="no-print" style={{ marginBottom: '20px', padding: '20px', background: 'var(--bg-card)', borderRadius: '8px', display: 'flex', justifyContent: 'space-between', border: '1px solid var(--border)' }}>
        <button onClick={() => window.history.back()} className="btn btn-ghost" style={{ padding: '8px 16px' }}>Voltar</button>
        <div style={{ display: 'flex', gap: '10px' }}>
          <button onClick={handleResetData} style={{ padding: '8px 16px', background: '#cc0000', color: '#fff', border: 'none', borderRadius: '4px', cursor: 'pointer', fontWeight: 'bold' }}>
            🗑️ Zerar Dados de Teste
          </button>
          <button onClick={handlePrint} style={{ padding: '8px 16px', background: '#0866ff', color: '#fff', border: 'none', borderRadius: '4px', cursor: 'pointer', fontWeight: 'bold' }}>
            🖨️ Imprimir Relatório
          </button>
        </div>
      </div>

      {/* Modal Customizado */}
      {showModal && (
        <div className="modal-overlay no-print" onClick={() => setShowModal(false)}>
          <div className="modal-content" onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <div className="accent-line" style={{ width: '40px', marginBottom: '8px' }} />
              <h3>{modalConfig.title}</h3>
            </div>
            <div className="modal-body">
              {modalConfig.message}
            </div>
            <div className="modal-footer">
              {modalConfig.type === 'confirm' ? (
                <>
                  <button className="btn btn-ghost" onClick={() => setShowModal(false)}>Cancelar</button>
                  <button className="btn btn-primary" onClick={modalConfig.onConfirm} style={{ background: '#cc0000' }}>Confirmar</button>
                </>
              ) : (
                <button className="btn btn-primary" onClick={() => setShowModal(false)}>Entendido</button>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Cabeçalho do Relatório */}
      <div className="report-header" style={{ borderBottom: '2px solid var(--border)', paddingBottom: '20px', marginBottom: '30px', textAlign: 'center' }}>
        <h1 style={{ fontSize: '28px', margin: '0 0 10px 0', fontFamily: 'Arial, sans-serif' }}>Relatório Geral de Votação IA</h1>
        <p style={{ margin: 0, fontSize: '14px', color: 'var(--text-dim)' }}>AIVoting 2026</p>
        
        <div style={{ marginTop: '20px', display: 'inline-block', border: '1px solid var(--border)', borderRadius: '8px', padding: '10px 30px', background: 'var(--bg-card)' }}>
          <div style={{ fontSize: '10px', textTransform: 'uppercase', color: 'var(--text-muted)', fontWeight: 'bold' }}>Total Geral de Votantes</div>
          <div style={{ fontSize: '24px', fontWeight: 'bold', color: 'var(--accent)' }}>{reportData.totalUsersVoted}</div>
        </div>
      </div>

      {/* Seções por IA */}
      {reportData.aiReports.map((ai, index) => (
        <div key={ai.aiName} className="report-section" style={{ marginBottom: '40px', pageBreakInside: 'avoid' }}>
          
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', borderBottom: '1px solid var(--border)', paddingBottom: '10px', marginBottom: '15px' }}>
            <h2 style={{ fontSize: '20px', margin: 0, color: 'var(--text)' }}>{ai.aiName}</h2>
            <div style={{ fontWeight: 'bold', fontSize: '14px', color: 'var(--text-muted)' }}>
              {ai.totalVotes} registro{ai.totalVotes !== 1 ? 's' : ''}
            </div>
          </div>

          {/* Perguntas Relevantes */}
          {(ai.topWorkAreas.length > 0 || ai.topReasons.length > 0) && (
            <div style={{ background: 'var(--bg-card)', padding: '10px', borderRadius: '4px', marginBottom: '15px', fontSize: '12px', border: '1px solid var(--border)' }}>
              <div style={{ display: 'flex', gap: '40px' }}>
                {ai.topWorkAreas.length > 0 && (
                  <div>
                    <strong>Áreas Principais:</strong>
                    <ul style={{ margin: '5px 0 0 0', paddingLeft: '20px' }}>
                      {ai.topWorkAreas.map((area, i) => <li key={i}>{area}</li>)}
                    </ul>
                  </div>
                )}
                {ai.topReasons.length > 0 && (
                  <div>
                    <strong>Principais Usos:</strong>
                    <ul style={{ margin: '5px 0 0 0', paddingLeft: '20px' }}>
                      {ai.topReasons.map((reason, i) => <li key={i}>{reason}</li>)}
                    </ul>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Tabela de Usuários */}
          {ai.users.length > 0 ? (
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '12px', fontFamily: 'Arial, sans-serif' }}>
              <thead>
                <tr style={{ background: 'var(--bg-card)', borderBottom: '2px solid var(--border)' }}>
                  <th style={{ padding: '8px', textAlign: 'left', width: '35%' }}>Nome da Pessoa</th>
                  <th style={{ padding: '8px', textAlign: 'left', width: '35%' }}>Empresa / Faculdade</th>
                  <th style={{ padding: '8px', textAlign: 'left', width: '30%' }}>Curso</th>
                </tr>
              </thead>
              <tbody>
                {ai.users.map((user, idx) => (
                  <tr key={idx} style={{ borderBottom: '1px solid var(--border)' }}>
                    <td style={{ padding: '8px', fontWeight: 'bold', color: 'var(--text)' }}>{user.name}</td>
                    <td style={{ padding: '8px', color: 'var(--text-muted)' }}>{user.institution}</td>
                    <td style={{ padding: '8px', color: 'var(--text-muted)' }}>{user.course}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          ) : (
            <p style={{ fontSize: '12px', color: 'var(--text-dim)', fontStyle: 'italic' }}>Nenhum usuário encontado com respostas visíveis.</p>
          )}

        </div>
      ))}

      {/* Rodapé do relatório (aparece no final ou em cada página via print media) */}
      <div className="report-footer" style={{ marginTop: '40px', textAlign: 'center', fontSize: '10px', color: 'var(--text-dim)', borderTop: '1px solid var(--border)', paddingTop: '10px' }}>
        Relatório Gerado em: {currentDate} • AIVoting 2026
      </div>

    </div>
  );
}
