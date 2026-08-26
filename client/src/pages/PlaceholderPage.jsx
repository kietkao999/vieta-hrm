import React from 'react';
import { useAuth } from '../contexts/AuthContext';
import { Wrench, ShieldAlert } from 'lucide-react';

const PlaceholderPage = ({ title, phase }) => {
  const { user } = useAuth();

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-bold text-slate-800">{title}</h2>
        <p className="text-xs text-slate-500">Phân hệ Quản lý trong hệ thống HRM Công ty Việt Á.</p>
      </div>

      <div className="rounded-2xl border border-dashed border-slate-200 bg-white p-12 text-center max-w-2xl mx-auto shadow-sm space-y-4">
        <div className="inline-flex h-16 w-16 items-center justify-center rounded-full bg-brand-50 text-brand-600 animate-bounce">
          <Wrench size={32} />
        </div>
        
        <div className="space-y-2">
          <h3 className="text-lg font-bold text-slate-800">Tính năng đang trong lộ trình phát triển</h3>
          <p className="text-sm text-slate-500 max-w-md mx-auto">
            Chức năng <strong className="text-brand-700 font-semibold">"{title}"</strong> thuộc <strong className="text-brand-750 font-bold">{phase}</strong> của dự án HRM Việt Á.
          </p>
        </div>

        <div className="inline-flex items-center space-x-2 rounded-lg bg-blue-50 px-4 py-2 text-xs font-semibold text-blue-700">
          <ShieldAlert size={14} className="shrink-0" />
          <span>Hệ thống bảo vệ dữ liệu theo phân quyền: {user?.roleDisplayName}</span>
        </div>
      </div>
    </div>
  );
};

export default PlaceholderPage;
