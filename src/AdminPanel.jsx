import React, { useState } from 'react';

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

  return (
    <div className="min-h-screen bg-[#e6ebf0] p-6">
      <div className="max-w-6xl mx-auto bg-white rounded-sm shadow-md overflow-hidden min-h-[80vh] flex flex-col">
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
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6"></path></svg>
              <span className="hidden sm:inline">Home</span>
            </button>
            <button 
              onClick={() => { 
                setAppState('HOME'); 
                setRegistration({...registration, firstName: '', lastName: '', email: '', level: ''}); 
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
                     <h2 className="text-lg font-bold text-gray-800 mb-4 border-b pb-2 flex items-center justify-between">
                       Pending Exam Requests
                       <button onClick={() => {
                         const saved = localStorage.getItem('ic3_exam_requests');
                         if (saved) setRequests(JSON.parse(saved));
                       }} className="text-xs font-semibold text-[#1a446b] border border-[#1a446b]/20 px-3 py-1 rounded-sm hover:bg-blue-50 transition-colors">
                         Refresh List
                       </button>
                     </h2>
                     {requests.filter(r => r.status === 'pending').length === 0 ? (
                       <div className="text-gray-500 italic p-6 text-center bg-gray-50 border border-gray-100 rounded-sm">No pending requests at the moment.</div>
                     ) : (
                       <div className="space-y-3">
                         {requests.filter(r => r.status === 'pending').map(req => (
                           <div key={req.id} className="flex flex-row justify-between items-center p-3 border border-gray-200 rounded-sm bg-white shadow-sm hover:border-[#1a446b]/30 transition-colors">
                              <div className="flex-1 min-w-0 pr-2">
                                 <div className="font-semibold text-gray-800 text-[13px] md:text-[15px] truncate">{req.firstName} {req.lastName}</div>
                                 <div className="text-[11px] md:text-sm text-gray-500 mt-0.5 md:mt-1 truncate">{req.email} &bull; <span className="font-semibold text-[#1a446b] bg-blue-50 px-1.5 py-0.5 rounded-sm">{req.level}</span></div>
                              </div>
                              <div className="flex flex-col sm:flex-row gap-1.5 md:gap-2 flex-shrink-0">
                                 <button 
                                   onClick={() => {
                                     const newReqs = requests.map(r => r.id === req.id ? {...r, status: 'approved'} : r);
                                     setRequests(newReqs);
                                     localStorage.setItem('ic3_exam_requests', JSON.stringify(newReqs));
                                   }}
                                   className="bg-[#059669] hover:bg-[#047857] text-white px-3 py-1.5 md:px-5 md:py-2 rounded-sm text-[11px] md:text-sm font-semibold transition-colors shadow-sm"
                                 >Approve</button>
                                 <button 
                                   onClick={() => {
                                     const newReqs = requests.map(r => r.id === req.id ? {...r, status: 'rejected'} : r);
                                     setRequests(newReqs);
                                     localStorage.setItem('ic3_exam_requests', JSON.stringify(newReqs));
                                   }}
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
                     <h2 className="text-lg font-bold text-gray-800 mb-4 border-b pb-2 flex items-center justify-between">
                       Approved Users
                     </h2>
                     {requests.filter(r => r.status === 'approved').length === 0 ? (
                       <div className="text-gray-500 italic p-6 text-center bg-gray-50 border border-gray-100 rounded-sm">No approved users at the moment.</div>
                     ) : (
                       <div className="space-y-3">
                         {requests.filter(r => r.status === 'approved').map(req => (
                           <div key={req.id} className="flex flex-row justify-between items-center p-3 border border-gray-200 rounded-sm bg-white shadow-sm hover:border-[#1a446b]/30 transition-colors">
                              <div className="flex-1 min-w-0 pr-2">
                                 <div className="font-semibold text-gray-800 text-[13px] md:text-[15px] truncate">{req.firstName} {req.lastName}</div>
                                 <div className="text-[11px] md:text-sm text-gray-500 mt-0.5 md:mt-1 truncate">{req.email} &bull; <span className="font-semibold text-[#1a446b] bg-blue-50 px-1.5 py-0.5 rounded-sm">{req.level}</span></div>
                              </div>
                              <div className="flex gap-2 flex-shrink-0">
                                 <button 
                                   onClick={() => {
                                     const newReqs = requests.map(r => r.id === req.id ? {...r, status: 'revoked'} : r);
                                     setRequests(newReqs);
                                     localStorage.setItem('ic3_exam_requests', JSON.stringify(newReqs));
                                   }}
                                   className="bg-white border border-[#e11d48] text-[#e11d48] hover:bg-[#fff1f2] px-3 py-1.5 md:px-5 md:py-2 rounded-sm text-[11px] md:text-sm font-semibold transition-colors"
                                 >Revoke</button>
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
                                onClick={() => {
                                  const newStatuses = {...levelsStatus, [lvl]: !levelsStatus[lvl]};
                                  setLevelsStatus(newStatuses);
                                  localStorage.setItem('ic3_levels_status', JSON.stringify(newStatuses));
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
                        onClick={() => {
                          localStorage.setItem('ic3_admin_creds', JSON.stringify(adminCreds));
                          alert('Admin credentials updated successfully!');
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
