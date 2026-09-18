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
  const [selectedPhotoUser, setSelectedPhotoUser] = useState(null);

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
                            <div key={req.id} className="flex flex-col sm:flex-row justify-between items-start sm:items-center p-3 sm:p-4 border border-gray-200 rounded-sm bg-white shadow-sm hover:border-[#1a446b]/40 hover:shadow-md transition-all gap-3">
                               <div className="flex items-center gap-3.5 flex-1 min-w-0">
                                  {/* Face Photo Thumbnail */}
                                  <div 
                                    onClick={() => setSelectedPhotoUser(req)}
                                    className="relative group cursor-pointer flex-shrink-0"
                                    title="Rasmni to'liq ko'rish uchun bosing"
                                  >
                                    {req.photo ? (
                                      <div className="relative">
                                        <img 
                                          src={req.photo} 
                                          alt={`${req.firstName} ${req.lastName}`} 
                                          className="w-12 h-12 sm:w-14 sm:h-14 rounded-full object-cover border-2 border-emerald-500 shadow-sm group-hover:ring-2 group-hover:ring-emerald-400 transition-all"
                                        />
                                        <div className="absolute inset-0 rounded-full bg-black/30 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity">
                                          <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0zM10 7v3m0 0v3m0-3h3m-3 0H7" />
                                          </svg>
                                        </div>
                                      </div>
                                    ) : (
                                      <div className="w-12 h-12 sm:w-14 sm:h-14 rounded-full bg-slate-100 border border-slate-300 flex items-center justify-center text-slate-400">
                                        <svg className="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                                        </svg>
                                      </div>
                                    )}
                                    {req.photo && (
                                      <span className="absolute -bottom-0.5 -right-0.5 bg-emerald-600 text-white p-0.5 rounded-full ring-2 ring-white" title="Face ID o'tgan">
                                        <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M5 13l4 4L19 7" />
                                        </svg>
                                      </span>
                                    )}
                                  </div>

                                  <div className="min-w-0 flex-1">
                                     <div className="flex items-center gap-2 flex-wrap">
                                       <span className="font-bold text-gray-900 text-sm sm:text-base">{req.firstName} {req.lastName}</span>
                                       {req.birth_date && <span className="text-xs text-gray-500">({req.birth_date})</span>}
                                       {req.photo ? (
                                         <span className="text-[10px] font-bold text-emerald-700 bg-emerald-50 border border-emerald-200 px-1.5 py-0.5 rounded">
                                           Face ID ✓
                                         </span>
                                       ) : (
                                         <span className="text-[10px] font-bold text-amber-700 bg-amber-50 border border-amber-200 px-1.5 py-0.5 rounded">
                                           Rasm yo'q
                                         </span>
                                       )}
                                     </div>
                                     <div className="text-xs text-gray-600 mt-1 flex items-center gap-2 flex-wrap">
                                       <span className="font-mono text-gray-700 font-medium">{req.email}</span>
                                       <span>&bull;</span>
                                       <span className="font-bold text-[#1a446b] bg-blue-50 px-2 py-0.5 rounded-sm border border-blue-100">{req.level}</span>
                                       {req.created_at && (
                                         <>
                                           <span>&bull;</span>
                                           <span className="text-gray-400 text-[11px]">{new Date(req.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                                         </>
                                       )}
                                     </div>
                                  </div>
                               </div>

                               <div className="flex items-center gap-2 w-full sm:w-auto justify-end pt-2 sm:pt-0 border-t sm:border-t-0 border-gray-100">
                                  <button 
                                    onClick={() => setSelectedPhotoUser(req)}
                                    className="text-xs font-semibold text-blue-700 bg-blue-50 hover:bg-blue-100 border border-blue-200 px-2.5 py-2 rounded-sm transition-colors flex items-center gap-1"
                                    title="Foydalanuvchi yuz rasmini to'liq ko'rish"
                                  >
                                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                                    </svg>
                                    Rasmni ko'rish
                                  </button>
                                  <button 
                                    onClick={() => updateRequestStatus(req.id, 'approved')}
                                    className="bg-[#059669] hover:bg-[#047857] text-white px-3.5 sm:px-4 py-2 rounded-sm text-xs sm:text-sm font-bold transition-all shadow-sm hover:shadow flex items-center gap-1"
                                  >
                                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                                    </svg>
                                    Approve
                                  </button>
                                  <button 
                                    onClick={() => updateRequestStatus(req.id, 'rejected')}
                                    className="bg-white border border-[#e11d48] text-[#e11d48] hover:bg-[#fff1f2] px-3 sm:px-3.5 py-2 rounded-sm text-xs sm:text-sm font-semibold transition-colors flex items-center gap-1"
                                  >
                                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                                    </svg>
                                    Reject
                                  </button>
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
                              <div className="flex items-center gap-3 min-w-0 pr-2">
                                 <div 
                                   onClick={() => setSelectedPhotoUser(req)}
                                   className="cursor-pointer flex-shrink-0"
                                   title="Rasmni ko'rish"
                                 >
                                   {req.photo ? (
                                     <img 
                                       src={req.photo} 
                                       alt={req.firstName} 
                                       className="w-11 h-11 rounded-full object-cover border-2 border-emerald-500 shadow-sm hover:opacity-90 transition-opacity"
                                     />
                                   ) : (
                                     <div className="w-11 h-11 rounded-full bg-slate-100 border border-slate-300 flex items-center justify-center text-slate-400">
                                       <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                         <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                                       </svg>
                                     </div>
                                   )}
                                 </div>
                                 <div className="min-w-0">
                                    <div className="font-semibold text-gray-800 text-[13px] md:text-[15px] truncate">{req.firstName} {req.lastName}</div>
                                    <div className="text-[11px] md:text-sm text-gray-500 mt-0.5 md:mt-1 truncate">{req.email} &bull; <span className="font-semibold text-[#1a446b] bg-blue-50 px-1.5 py-0.5 rounded-sm">{req.level}</span></div>
                                 </div>
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

       {/* Face Photo Verification Modal */}
       {selectedPhotoUser && (
         <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/80 backdrop-blur-sm">
           <div className="bg-white rounded-lg shadow-2xl max-w-md w-full overflow-hidden border border-gray-100">
             <div className="bg-[#1a446b] px-5 py-4 text-white flex justify-between items-center">
               <h3 className="font-bold text-base flex items-center gap-2">
                 <svg className="w-5 h-5 text-emerald-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                   <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                 </svg>
                 Face ID Shaxsni Tasdiqlash
               </h3>
               <button
                 onClick={() => setSelectedPhotoUser(null)}
                 className="text-white/70 hover:text-white p-1 rounded hover:bg-white/10 transition-colors"
                 title="Yopish"
               >
                 <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                   <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                 </svg>
               </button>
             </div>

             <div className="p-6 flex flex-col items-center">
               {selectedPhotoUser.photo ? (
                 <div className="relative w-60 h-60 rounded-xl overflow-hidden shadow-lg border-4 border-emerald-500 mb-5 bg-slate-900">
                   <img
                     src={selectedPhotoUser.photo}
                     alt={`${selectedPhotoUser.firstName} ${selectedPhotoUser.lastName}`}
                     className="w-full h-full object-cover"
                   />
                   <span className="absolute bottom-2 right-2 bg-emerald-600 text-white text-[10px] font-bold px-2 py-0.5 rounded shadow">
                     Face ID Tasviri
                   </span>
                 </div>
               ) : (
                 <div className="w-60 h-60 rounded-xl bg-slate-100 border-2 border-dashed border-slate-300 flex flex-col items-center justify-center text-slate-400 mb-5">
                   <svg className="w-16 h-16 mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                     <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                   </svg>
                   <p className="text-xs font-semibold text-gray-500">Rasm mavjud emas</p>
                 </div>
               )}

               <div className="w-full bg-slate-50 border border-slate-200 rounded-lg p-3.5 space-y-2 text-xs sm:text-sm text-gray-700 mb-5">
                 <div className="flex justify-between border-b pb-1.5">
                   <span className="text-gray-500 font-medium">To'liq ismi:</span>
                   <span className="font-bold text-gray-900">{selectedPhotoUser.firstName} {selectedPhotoUser.lastName}</span>
                 </div>
                 <div className="flex justify-between border-b pb-1.5">
                   <span className="text-gray-500 font-medium">Email:</span>
                   <span className="font-semibold text-gray-800 font-mono text-xs">{selectedPhotoUser.email}</span>
                 </div>
                 <div className="flex justify-between border-b pb-1.5">
                   <span className="text-gray-500 font-medium">Imtihon darajasi:</span>
                   <span className="font-bold text-[#1a446b] bg-blue-100 px-2 py-0.5 rounded">{selectedPhotoUser.level}</span>
                 </div>
                 <div className="flex justify-between">
                   <span className="text-gray-500 font-medium">Holati:</span>
                   <span className={`font-bold uppercase text-[11px] px-2 py-0.5 rounded ${
                     selectedPhotoUser.status === 'approved' ? 'bg-emerald-100 text-emerald-800' : 
                     selectedPhotoUser.status === 'rejected' ? 'bg-rose-100 text-rose-800' : 'bg-amber-100 text-amber-800'
                   }`}>
                     {selectedPhotoUser.status}
                   </span>
                 </div>
               </div>

               {selectedPhotoUser.status === 'pending' ? (
                 <div className="flex gap-3 w-full">
                   <button
                     onClick={() => {
                       updateRequestStatus(selectedPhotoUser.id, 'approved');
                       setSelectedPhotoUser(null);
                     }}
                     className="flex-1 bg-[#059669] hover:bg-[#047857] text-white py-2.5 rounded font-bold text-xs sm:text-sm shadow transition-colors flex items-center justify-center gap-1.5"
                   >
                     <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                       <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                     </svg>
                     Tasdiqlash (Approve)
                   </button>
                   <button
                     onClick={() => {
                       updateRequestStatus(selectedPhotoUser.id, 'rejected');
                       setSelectedPhotoUser(null);
                     }}
                     className="flex-1 bg-white border border-[#e11d48] text-[#e11d48] hover:bg-[#fff1f2] py-2.5 rounded font-bold text-xs sm:text-sm transition-colors flex items-center justify-center gap-1.5"
                   >
                     <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                       <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                     </svg>
                     Rad etish (Reject)
                   </button>
                 </div>
               ) : (
                 <button
                   onClick={() => setSelectedPhotoUser(null)}
                   className="w-full bg-gray-100 hover:bg-gray-200 border border-gray-300 text-gray-700 py-2.5 rounded font-semibold text-xs sm:text-sm transition-colors"
                 >
                   Yopish
                 </button>
               )}
             </div>
           </div>
         </div>
       )}
     </div>
   );
 }

export default AdminPanel;
