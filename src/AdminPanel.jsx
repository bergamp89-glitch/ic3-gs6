import React, { useState, useEffect } from 'react';
import { supabase } from './supabase';

function AdminPanel({ 
  setAppState, 
  registration, 
  setRegistration, 
  requests, 
  setRequests, 
  levelsStatus, 
  setLevelsStatus, 
  adminCreds, 
  setAdminCreds 
}) {
  const [activeTab, setActiveTab] = useState('dashboard');
  const [approvedSearch, setApprovedSearch] = useState('');
  const [pendingSearch, setPendingSearch] = useState('');
  const [resultsSearch, setResultsSearch] = useState('');
  const [leaderboardResults, setLeaderboardResults] = useState([]);

  const filterRequests = (list, query) => {
    if (!query || !query.trim()) return list;
    const q = query.trim().toLowerCase();
    return list.filter(r => {
      const fullName = `${r.firstName || ''} ${r.lastName || ''}`.toLowerCase();
      const email = (r.email || '').toLowerCase();
      const level = (r.level || '').toLowerCase();
      return fullName.includes(q) || email.includes(q) || level.includes(q);
    });
  };

  const pendingRequests = requests.filter(r => r.status === 'pending');
  const filteredPendingRequests = filterRequests(pendingRequests, pendingSearch);

  const approvedRequests = requests.filter(r => r.status === 'approved');
  const filteredApprovedRequests = filterRequests(approvedRequests, approvedSearch);

  useEffect(() => {
    fetchRequests();
    fetchLeaderboard();

    // Auto-poll requests every 5 seconds so new requests pop up automatically
    const intervalId = setInterval(() => {
      fetchRequests();
      if (activeTab === 'results') fetchLeaderboard();
    }, 5000);

    return () => clearInterval(intervalId);
  }, [activeTab]);

  const fetchRequests = async () => {
    const { data, error } = await supabase
      .from('requests')
      .select('*')
      .order('created_at', { ascending: false });
    if (data) {
      setRequests(data);
    }
  };

  const fetchLeaderboard = async () => {
    const { data } = await supabase
      .from('leaderboard')
      .select('*')
      .order('created_at', { ascending: false });
    if (data) {
      setLeaderboardResults(data);
    }
  };

  const deleteLeaderboardEntry = async (id) => {
    const { error } = await supabase
      .from('leaderboard')
      .delete()
      .eq('id', id);
    if (!error) {
      fetchLeaderboard();
    } else {
      alert("Xatolik: " + (error.message || "Baza bilan aloqa yo'q"));
    }
  };

  const updateRequestStatus = async (id, newStatus) => {
    const { error } = await supabase
      .from('requests')
      .update({ status: newStatus })
      .eq('id', id);
    if (!error) {
      fetchRequests();
    } else {
      alert("Xatolik yuz berdi: " + (error.message || "Baza bilan aloqa yo'q"));
    }
  };

  const deleteRequest = async (id) => {
    const { error } = await supabase
      .from('requests')
      .delete()
      .eq('id', id);
    if (!error) {
      fetchRequests();
    } else {
      alert("O'chirishda xatolik: " + (error.message || "Baza bilan aloqa yo'q"));
    }
  };

  const filteredLeaderboard = leaderboardResults.filter(item => {
    if (!resultsSearch || !resultsSearch.trim()) return true;
    const q = resultsSearch.trim().toLowerCase();
    const name = (item.username || '').toLowerCase();
    const lvl = `level ${item.level_num || ''}`.toLowerCase();
    return name.includes(q) || lvl.includes(q);
  });

  return (
    <div className="min-h-screen bg-[#e6ebf0] p-4 md:p-6">
      <div className="max-w-6xl mx-auto bg-white rounded-sm shadow-md overflow-hidden min-h-[85vh] flex flex-col">
        <div className="bg-[#1a446b] text-white px-4 md:px-8 py-4 md:py-6 flex justify-between items-center">
          <div>
            <div className="text-[11px] font-bold text-[#8baecf] uppercase tracking-widest mb-1.5">Administration</div>
            <h1 className="text-xl md:text-[22px] font-semibold tracking-wide">Control Panel</h1>
          </div>
          <div className="flex items-center gap-3 md:gap-4">
            <button 
              onClick={() => setAppState('HOME')}
              className="text-white/80 hover:text-white flex items-center gap-1.5 text-xs md:text-sm font-medium transition-colors bg-transparent px-2 py-1.5 rounded-sm hover:bg-white/10"
              title="Bosh sahifaga qaytish"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 001 1v4a1 1 0 001 1m-6 0h6"></path></svg>
              <span className="hidden sm:inline">Home</span>
            </button>
            <button 
              onClick={() => { 
                setAppState('HOME'); 
                setRegistration({ firstName: '', lastName: '', birthDate: '', email: '', level: '' }); 
              }} 
              className="border border-white/30 hover:bg-white/10 text-white px-3 py-1.5 md:px-4 md:py-2 rounded-sm text-xs md:text-sm font-medium transition-colors"
            >
              Log Out
            </button>
          </div>
        </div>
        
        <div className="flex flex-col md:flex-row flex-1 overflow-hidden">
           {/* Admin Sidebar */}
           <div className="w-full md:w-64 bg-gray-50 border-b md:border-b-0 md:border-r border-gray-200 p-4 md:p-6 flex flex-row md:flex-col gap-2 overflow-x-auto flex-shrink-0">
              <div className="hidden md:block text-[10px] font-bold text-[#6f93b5] uppercase tracking-widest mb-2">Menu</div>
              <button 
                onClick={() => setActiveTab('dashboard')}
                className={`text-left px-4 py-3 rounded-sm font-medium transition-colors ${activeTab === 'dashboard' ? 'bg-[#1a446b] text-white shadow-sm' : 'text-gray-600 hover:bg-gray-100'}`}
              >
                Dashboard
              </button>
              <button 
                onClick={() => setActiveTab('results')}
                className={`text-left px-4 py-3 rounded-sm font-medium transition-colors whitespace-nowrap ${activeTab === 'results' ? 'bg-[#1a446b] text-white shadow-sm' : 'text-gray-600 hover:bg-gray-100'}`}
              >
                Imtihon Natijalari
              </button>
              <button 
                onClick={() => setActiveTab('passwords')}
                className={`text-left px-4 py-3 rounded-sm font-medium transition-colors whitespace-nowrap ${activeTab === 'passwords' ? 'bg-[#1a446b] text-white shadow-sm' : 'text-gray-600 hover:bg-gray-100'}`}
              >
                Parol bo'limi
              </button>
           </div>
           
           {/* Admin Content */}
           <div className="flex-1 p-4 md:p-8 overflow-y-auto">
              
              {activeTab === 'dashboard' && (
                <>
                  {/* Requests Section */}
                  <div className="mb-12">
                     <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4 border-b pb-2">
                        <h2 className="text-lg font-bold text-gray-800 flex items-center gap-2">
                          Pending Exam Requests
                          <span className="text-xs font-semibold px-2.5 py-0.5 bg-amber-100 text-amber-800 rounded-full">
                            {filteredPendingRequests.length}{pendingSearch && ` / ${pendingRequests.length}`}
                          </span>
                        </h2>
                        
                        <div className="flex flex-wrap items-center gap-2">
                           <div className="relative w-full sm:w-60">
                             <input
                               type="text"
                               placeholder="Qidiruv (ism, email)..."
                               value={pendingSearch}
                               onChange={(e) => setPendingSearch(e.target.value)}
                               className="w-full pl-9 pr-8 py-1.5 text-xs md:text-sm border border-gray-300 rounded-sm focus:outline-none focus:border-[#1a446b] focus:ring-1 focus:ring-[#1a446b]/20"
                             />
                             <svg className="w-4 h-4 text-gray-400 absolute left-2.5 top-1/2 -translate-y-1/2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                               <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                             </svg>
                             {pendingSearch && (
                               <button
                                 onClick={() => setPendingSearch('')}
                                 className="absolute right-2.5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 text-xs font-bold"
                               >
                                 ✕
                               </button>
                             )}
                           </div>
                           <button onClick={fetchRequests} className="text-xs font-semibold text-[#1a446b] border border-[#1a446b]/20 px-3 py-1.5 rounded-sm hover:bg-blue-50 transition-colors whitespace-nowrap">
                             Refresh List
                           </button>
                        </div>
                     </div>
                     {filteredPendingRequests.length === 0 ? (
                       <div className="text-gray-500 italic p-6 text-center bg-gray-50 border border-gray-100 rounded-sm">
                         {pendingSearch ? `"${pendingSearch}" bo'yicha so'rovlar topilmadi.` : 'No pending requests at the moment.'}
                       </div>
                     ) : (
                       <div className="space-y-3">
                         {filteredPendingRequests.map(req => (
                           <div key={req.id} className="flex flex-row justify-between items-center p-3 border border-gray-200 rounded-sm bg-white shadow-sm hover:border-[#1a446b]/30 transition-colors">
                              <div className="flex-1 min-w-0 pr-2">
                                 <div className="font-semibold text-gray-800 text-[13px] md:text-[15px] truncate">{req.firstName} {req.lastName} {req.birth_date ? `(${req.birth_date})` : ''}</div>
                                 <div className="text-[11px] md:text-sm text-gray-500 mt-0.5 md:mt-1 truncate">{req.email} &bull; <span className="font-semibold text-[#1a446b] bg-blue-50 px-1.5 py-0.5 rounded-sm">{req.level}</span></div>
                              </div>
                              <div className="flex flex-col sm:flex-row gap-1.5 md:gap-2 flex-shrink-0">
                                 <button 
                                   onClick={() => updateRequestStatus(req.id, 'approved')}
                                   className="bg-[#059669] hover:bg-[#047857] text-white px-3 py-1.5 md:px-5 md:py-2 rounded-sm text-[11px] md:text-sm font-semibold transition-colors shadow-sm"
                                 >Approve</button>
                                 <button 
                                   onClick={() => updateRequestStatus(req.id, 'rejected')}
                                   className="bg-white border border-[#e11d48] text-[#e11d48] hover:bg-[#fff1f2] px-3 py-1.5 md:px-5 md:py-2 rounded-sm text-[11px] md:text-sm font-semibold transition-colors"
                                 >Reject</button>
                              </div>
                           </div>
                         ))}
                       </div>
                     )}
                  </div>

                  {/* Approved Requests Section */}
                  <div className="mb-12">
                     <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4 border-b pb-2">
                        <h2 className="text-lg font-bold text-gray-800 flex items-center gap-2">
                          Approved Users
                          <span className="text-xs font-semibold px-2.5 py-0.5 bg-emerald-100 text-emerald-800 rounded-full">
                            {filteredApprovedRequests.length}{approvedSearch && ` / ${approvedRequests.length}`}
                          </span>
                        </h2>
                        
                        <div className="relative w-full sm:w-72">
                          <input
                            type="text"
                            placeholder="Qidiruv (ism, email, daraja)..."
                            value={approvedSearch}
                            onChange={(e) => setApprovedSearch(e.target.value)}
                            className="w-full pl-9 pr-8 py-1.5 text-xs md:text-sm border border-gray-300 rounded-sm focus:outline-none focus:border-[#1a446b] focus:ring-1 focus:ring-[#1a446b]/20"
                          />
                          <svg className="w-4 h-4 text-gray-400 absolute left-2.5 top-1/2 -translate-y-1/2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                          </svg>
                          {approvedSearch && (
                            <button
                              onClick={() => setApprovedSearch('')}
                              className="absolute right-2.5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 text-xs font-bold"
                            >
                              ✕
                            </button>
                          )}
                        </div>
                     </div>

                     {filteredApprovedRequests.length === 0 ? (
                       <div className="text-gray-500 italic p-6 text-center bg-gray-50 border border-gray-100 rounded-sm">
                         {approvedSearch ? `"${approvedSearch}" bo'yicha hech qanday ruxsat berilgan foydalanuvchi topilmadi.` : 'No approved users at the moment.'}
                       </div>
                     ) : (
                       <div className="space-y-3">
                         {filteredApprovedRequests.map(req => (
                           <div key={req.id} className="flex flex-row justify-between items-center p-3 border border-gray-200 rounded-sm bg-white shadow-sm hover:border-[#1a446b]/30 transition-colors">
                              <div className="flex-1 min-w-0 pr-2">
                                 <div className="font-semibold text-gray-800 text-[13px] md:text-[15px] truncate">{req.firstName} {req.lastName}</div>
                                 <div className="text-[11px] md:text-sm text-gray-500 mt-0.5 md:mt-1 truncate">{req.email} &bull; <span className="font-semibold text-[#1a446b] bg-blue-50 px-1.5 py-0.5 rounded-sm">{req.level}</span></div>
                              </div>
                              <div className="flex gap-2 flex-shrink-0">
                                  <button 
                                    onClick={() => updateRequestStatus(req.id, 'revoked')}
                                    className="bg-white border border-[#e11d48] text-[#e11d48] hover:bg-[#fff1f2] px-3 py-1.5 md:px-5 md:py-2 rounded-sm text-[11px] md:text-sm font-semibold transition-colors"
                                  >Revoke</button>
                                  <button 
                                    onClick={() => deleteRequest(req.id)}
                                    className="bg-gray-100 border border-gray-300 text-gray-600 hover:bg-gray-200 px-3 py-1.5 md:px-4 md:py-2 rounded-sm text-[11px] md:text-sm font-semibold transition-colors"
                                    title="Ro'yxatdan o'chirish"
                                  >Delete</button>
                               </div>
                           </div>
                         ))}
                       </div>
                     )}
                  </div>

                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 lg:gap-10">
                     {/* Level Management */}
                     <div>
                       <h2 className="text-lg font-bold text-gray-800 mb-4 border-b pb-2">Exam Level Status</h2>
                       <div className="space-y-3">
                          {['1-Level', '2-Level', '3-Level'].map(lvl => (
                            <div key={lvl} className="flex justify-between items-center p-3 border border-gray-200 rounded-sm bg-white shadow-sm hover:border-gray-300 transition-colors">
                               <div className="font-semibold text-gray-800 text-[13px] md:text-[15px]">{lvl}</div>
                              <button 
                                onClick={async () => {
                                  const newStatuses = {...levelsStatus, [lvl]: !levelsStatus[lvl]};
                                  setLevelsStatus(newStatuses);
                                  let { error } = await supabase.from('settings').update({ value: newStatuses }).eq('key', 'levels_status');
                                  if (error) {
                                    const res = await supabase.from('settings').upsert({ key: 'levels_status', value: newStatuses });
                                    error = res.error;
                                  }
                                  if (error) {
                                    alert("Statusni saqlashda xatolik: " + error.message);
                                  }
                                }}
                                 className={`px-3 py-1.5 md:px-5 md:py-2 rounded-sm text-[10px] md:text-xs font-bold uppercase tracking-wider border transition-all ${levelsStatus[lvl] ? 'bg-[#ecfdf5] border-[#059669] text-[#059669] hover:bg-[#d1fae5]' : 'bg-[#fff1f2] border-[#e11d48] text-[#e11d48] hover:bg-[#ffe4e6]'}`}
                              >
                                {levelsStatus[lvl] ? 'Active' : 'Inactive'}
                              </button>
                           </div>
                         ))}
                       </div>
                     </div>
                  </div>
                </>
              )}

              {activeTab === 'results' && (
                <div>
                   <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4 border-b pb-2">
                      <h2 className="text-lg font-bold text-gray-800 flex items-center gap-2">
                        Imtihon Natijalari (Leaderboard)
                        <span className="text-xs font-semibold px-2.5 py-0.5 bg-blue-100 text-[#1a446b] rounded-full">
                          Jami: {filteredLeaderboard.length}
                        </span>
                      </h2>
                      <div className="flex items-center gap-2">
                         <input 
                           type="text" 
                           placeholder="Qidiruv (ism, daraja)..." 
                           value={resultsSearch} 
                           onChange={e => setResultsSearch(e.target.value)} 
                           className="px-3 py-1.5 text-xs md:text-sm border border-gray-300 rounded-sm focus:outline-none focus:border-[#1a446b]"
                         />
                         <button onClick={fetchLeaderboard} className="text-xs font-semibold text-[#1a446b] border border-[#1a446b]/20 px-3 py-1.5 rounded-sm hover:bg-blue-50">
                           Yangilash
                         </button>
                      </div>
                   </div>

                   {filteredLeaderboard.length === 0 ? (
                     <div className="text-gray-500 italic p-6 text-center bg-gray-50 border border-gray-100 rounded-sm">
                       Hali hech qanday imtihon natijalari saqlanmagan.
                     </div>
                   ) : (
                     <div className="overflow-x-auto border border-gray-200 rounded-sm shadow-sm">
                       <table className="w-full text-left text-xs md:text-sm">
                         <thead className="bg-[#1a446b] text-white uppercase text-[10px] tracking-wider">
                           <tr>
                             <th className="p-3">#</th>
                             <th className="p-3">F.I.SH / Foydalanuvchi</th>
                             <th className="p-3">Level</th>
                             <th className="p-3">Ball (%)</th>
                             <th className="p-3">Sana</th>
                             <th className="p-3 text-right">Amal</th>
                           </tr>
                         </thead>
                         <tbody className="divide-y divide-gray-100 bg-white">
                           {filteredLeaderboard.map((item, idx) => {
                             const pct = item.score || 0;
                             const dateStr = item.created_at ? new Date(item.created_at).toLocaleString() : '-';

                             return (
                               <tr key={item.id} className="hover:bg-gray-50 transition-colors">
                                 <td className="p-3 font-semibold text-gray-500">{idx + 1}</td>
                                 <td className="p-3 font-bold text-gray-800">{item.username || 'Noma\'lum'}</td>
                                 <td className="p-3 font-semibold text-[#1a446b]">{item.level_num ? `${item.level_num}-Level` : '-'}</td>
                                 <td className="p-3 font-bold text-[#047857]">{pct}%</td>
                                 <td className="p-3 text-gray-500 text-xs">{dateStr}</td>
                                 <td className="p-3 text-right">
                                   <button 
                                     onClick={() => deleteLeaderboardEntry(item.id)} 
                                     className="text-rose-600 hover:text-rose-800 font-semibold text-xs border border-rose-200 px-2 py-1 rounded hover:bg-rose-50"
                                   >
                                     O'chirish
                                   </button>
                                 </td>
                               </tr>
                             );
                           })}
                         </tbody>
                       </table>
                     </div>
                   )}
                </div>
              )}

              {activeTab === 'passwords' && (
                 <div>
                   <h2 className="text-lg font-bold text-gray-800 mb-4 border-b pb-2">Admin Credentials</h2>
                   <div className="bg-gray-50 border border-gray-200 p-6 rounded-sm space-y-4 max-w-lg">
                      <div>
                         <label className="block text-[11px] font-bold text-gray-500 uppercase tracking-widest mb-1.5">First Name</label>
                         <input 
                           type="text" 
                           value={adminCreds.firstName} 
                           onChange={e => setAdminCreds({...adminCreds, firstName: e.target.value})} 
                           className="w-full border border-gray-300 rounded-sm px-3 py-2.5 text-sm focus:outline-none focus:border-[#1a446b] focus:ring-1 focus:ring-[#1a446b]/20" 
                         />
                      </div>
                      
                      <div>
                         <label className="block text-[11px] font-bold text-gray-500 uppercase tracking-widest mb-1.5">Email Address / Code</label>
                         <input 
                           type="text" 
                           value={adminCreds.email} 
                           onChange={e => setAdminCreds({...adminCreds, email: e.target.value})} 
                           className="w-full border border-gray-300 rounded-sm px-3 py-2.5 text-sm focus:outline-none focus:border-[#1a446b] focus:ring-1 focus:ring-[#1a446b]/20" 
                         />
                      </div>
                      <button 
                        onClick={async () => {
                           let { error } = await supabase.from('settings').update({ value: adminCreds }).eq('key', 'admin_creds');
                           if (error) {
                             const res = await supabase.from('settings').upsert({ key: 'admin_creds', value: adminCreds });
                             error = res.error;
                           }
                           if (!error) {
                             alert('Admin credentials updated successfully!');
                           } else {
                             alert('Xatolik: ' + error.message);
                           }
                        }}
                        className="bg-[#1a446b] text-white px-4 py-3 rounded-sm text-sm font-semibold hover:bg-[#153655] w-full mt-2 transition-colors shadow-sm"
                      >
                        Save Changes
                      </button>
                   </div>
                 </div>
              )}

           </div>
        </div>
      </div>
    </div>
  );
}

export default AdminPanel;
