import { useState } from "react";
import { FiMapPin, FiClock, FiUser, FiInfo, FiAlertCircle } from "react-icons/fi";
import ReportIssueModal from "./ReportIssueModal";

export default function SessionCard({ session: initialSession }) {
  const [session, setSession] = useState(initialSession);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [hasReported, setHasReported] = useState(false);

  const handleAction = (action) => {
    let newStatus = session.status;
    
    switch (action) {
      case 'arrive':
        alert("Partner notified that you have arrived.");
        break;
      case 'late':
        alert("Partner notified that you are running late.");
        break;
      case 'start':
        newStatus = 'In Progress';
        break;
      case 'end':
        newStatus = 'Completed';
        break;
      default:
        break;
    }

    if (newStatus !== session.status) {
      setSession({ ...session, status: newStatus });
    }
  };

  const handleReportIssue = (data) => {
    setSession({ ...session, status: 'Disputed' });
    setHasReported(true);
  };

  return (
    <>
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden flex flex-col">
        <div className="p-5 border-b border-gray-100 flex justify-between items-start">
          <div>
            <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold mb-3 border bg-gray-50 text-gray-600 border-gray-200">
              <span className={`w-2 h-2 rounded-full ${
                session.status === 'Completed' ? 'bg-green-500' :
                session.status === 'In Progress' ? 'bg-yellow-500' :
                session.status === 'Disputed' ? 'bg-red-500' : 'bg-blue-500'
              }`}></span>
              {session.status}
            </div>
            <h3 className="text-xl font-bold text-gray-900">{session.title}</h3>
          </div>
          <div className="text-right">
            <span className="text-xs font-medium text-gray-400 uppercase tracking-wider">Session ID</span>
            <div className="font-mono text-gray-600">#{session.id}</div>
          </div>
        </div>
        
        <div className="p-5 bg-gray-50/50 flex-1">
          <div className="grid grid-cols-2 gap-y-4 gap-x-6">
            <div className="flex items-start gap-3">
              <div className="p-2 bg-blue-50 text-blue-600 rounded-lg shrink-0">
                <FiUser size={18} />
              </div>
              <div>
                <p className="text-xs text-gray-500 font-medium">Participants</p>
                <p className="text-sm font-medium text-gray-900">{session.requester} <span className="text-gray-400 font-normal">(Req)</span></p>
                <p className="text-sm font-medium text-gray-900">{session.helper} <span className="text-gray-400 font-normal">(Help)</span></p>
              </div>
            </div>
            
            <div className="flex items-start gap-3">
              <div className="p-2 bg-purple-50 text-purple-600 rounded-lg shrink-0">
                <FiMapPin size={18} />
              </div>
              <div>
                <p className="text-xs text-gray-500 font-medium">Location</p>
                <p className="text-sm font-medium text-gray-900">{session.location}</p>
                <a href="#" className="text-xs text-blue-600 hover:underline mt-0.5 inline-block">View Map</a>
              </div>
            </div>
            
            <div className="flex items-start gap-3 col-span-2">
              <div className="p-2 bg-amber-50 text-amber-600 rounded-lg shrink-0">
                <FiClock size={18} />
              </div>
              <div>
                <p className="text-xs text-gray-500 font-medium">Time Scheduled</p>
                <p className="text-sm font-medium text-gray-900">{session.time}</p>
                {session.status === 'In Progress' && (
                  <div className="mt-1.5 flex items-center gap-1.5 text-xs text-amber-700 bg-amber-100/50 px-2 py-1 rounded inline-flex">
                    <span className="relative flex h-2 w-2">
                      <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-amber-400 opacity-75"></span>
                      <span className="relative inline-flex rounded-full h-2 w-2 bg-amber-500"></span>
                    </span>
                    Session currently active
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
        
        <div className="p-4 border-t border-gray-100 bg-white flex flex-col sm:flex-row gap-3">
          {session.status === 'Accepted' && (
            <>
              <button onClick={() => handleAction('arrive')} className="flex-1 py-2 px-4 shadow-sm border border-gray-200 bg-white text-gray-700 text-sm font-medium rounded-md hover:bg-gray-50">
                I have arrived
              </button>
              <button onClick={() => handleAction('start')} className="flex-1 py-2 px-4 bg-blue-600 text-white shadow-sm text-sm font-medium rounded-md hover:bg-blue-700">
                Start Session
              </button>
            </>
          )}

          {session.status === 'In Progress' && (
            <button onClick={() => handleAction('end')} className="flex-1 py-2 px-4 bg-green-600 text-white shadow-sm text-sm font-medium rounded-md hover:bg-green-700">
              Complete Session
            </button>
          )}

          {session.status === 'Completed' && (
            <div className="flex-1 flex items-center justify-center gap-2 text-green-600 text-sm font-medium py-2">
              <FiInfo size={16} /> Session finished successfully
            </div>
          )}

          {session.status === 'Disputed' && (
            <div className="flex-1 flex items-center justify-center gap-2 text-red-600 text-sm font-medium py-2">
              <FiAlertCircle size={16} /> Session is under dispute review
            </div>
          )}

          {/* Report Issue Button - Always visible unless already completed correctly or disputed */}
          {session.status !== 'Completed' && !hasReported && session.status !== 'Disputed' && (
            <button 
              onClick={() => setIsModalOpen(true)}
              className="py-2 px-4 border border-red-200 bg-red-50 text-red-600 shadow-sm text-sm font-medium rounded-md hover:bg-red-100 sm:w-auto w-full transition-colors"
            >
              Report Issue
            </button>
          )}
        </div>
      </div>

      <ReportIssueModal 
        isOpen={isModalOpen} 
        onClose={() => setIsModalOpen(false)} 
        onSubmit={handleReportIssue}
        session={session}
      />
    </>
  );
}
