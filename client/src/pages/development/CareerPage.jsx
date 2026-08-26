import React from 'react';
import { Compass, ArrowRight, Award, Target, BookOpen } from 'lucide-react';

const CareerPage = () => {
  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between space-y-4 md:space-y-0">
        <div>
          <h2 className="text-xl font-bold text-slate-800">Lộ trình Nghề nghiệp</h2>
          <p className="text-xs text-slate-500">Định hướng thăng tiến và phát triển năng lực cá nhân</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        
        {/* Hướng dẫn */}
        <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
          <div className="flex items-center space-x-3 mb-4">
            <div className="p-2 bg-brand-50 rounded-lg text-brand-600">
              <Compass size={24} />
            </div>
            <h3 className="font-bold text-lg text-slate-800">Quy hoạch Phát triển</h3>
          </div>
          <p className="text-sm text-slate-600 mb-6 leading-relaxed">
            Hệ thống lộ trình thăng tiến giúp nhân sự định hình rõ các mốc phát triển sự nghiệp tại Nệm Việt Á. 
            Dựa vào đánh giá KPI và các khóa đào tạo đã hoàn thành, quản lý sẽ đề xuất thăng cấp cho nhân sự.
          </p>
          <div className="space-y-4">
            <div className="flex items-start space-x-3">
              <Target size={18} className="text-slate-400 mt-0.5" />
              <div>
                <h4 className="font-semibold text-sm text-slate-800">Đạt mục tiêu KPI</h4>
                <p className="text-xs text-slate-500">Đạt loại xuất sắc trong 2 chu kỳ liên tiếp</p>
              </div>
            </div>
            <div className="flex items-start space-x-3">
              <BookOpen size={18} className="text-slate-400 mt-0.5" />
              <div>
                <h4 className="font-semibold text-sm text-slate-800">Hoàn thành Đào tạo</h4>
                <p className="text-xs text-slate-500">Tham gia và đỗ các bài kiểm tra nghiệp vụ</p>
              </div>
            </div>
          </div>
        </div>

        {/* Lộ trình mẫu */}
        <div className="bg-gradient-to-br from-slate-800 to-slate-900 rounded-xl shadow-sm p-6 text-white relative overflow-hidden">
          <div className="absolute -right-6 -top-6 text-slate-700/50">
            <Award size={120} />
          </div>
          <h3 className="font-bold text-lg mb-6 relative z-10">Lộ trình thăng tiến Khối Kinh doanh</h3>
          
          <div className="space-y-6 relative z-10">
            <div className="flex items-center">
              <div className="w-8 h-8 rounded-full bg-slate-700 flex items-center justify-center font-bold text-sm border-2 border-slate-600">1</div>
              <div className="ml-4">
                <h4 className="font-semibold">Nhân viên Thử việc</h4>
                <p className="text-xs text-slate-400">2 tháng</p>
              </div>
            </div>
            
            <div className="ml-4 w-0.5 h-6 bg-slate-700 -my-4"></div>
            
            <div className="flex items-center">
              <div className="w-8 h-8 rounded-full bg-brand-600 flex items-center justify-center font-bold text-sm shadow-[0_0_15px_rgba(29,78,216,0.5)]">2</div>
              <div className="ml-4">
                <h4 className="font-semibold text-brand-100">Nhân viên Chính thức</h4>
                <p className="text-xs text-slate-400">Ký hợp đồng 1 năm</p>
              </div>
            </div>
            
            <div className="ml-4 w-0.5 h-6 bg-slate-700 -my-4"></div>
            
            <div className="flex items-center">
              <div className="w-8 h-8 rounded-full bg-slate-700 flex items-center justify-center font-bold text-sm border-2 border-slate-600">3</div>
              <div className="ml-4">
                <h4 className="font-semibold text-slate-300">Chuyên viên / Trưởng nhóm</h4>
                <p className="text-xs text-slate-400">Yêu cầu hoàn thành đào tạo Quản lý cấp trung</p>
              </div>
            </div>
            
            <div className="ml-4 w-0.5 h-6 bg-slate-700 -my-4"></div>
            
            <div className="flex items-center">
              <div className="w-8 h-8 rounded-full bg-slate-700 flex items-center justify-center font-bold text-sm border-2 border-slate-600">4</div>
              <div className="ml-4">
                <h4 className="font-semibold text-slate-300">Trưởng phòng Kinh doanh</h4>
                <p className="text-xs text-slate-400">Đạt KPI xuất sắc 4 quý liên tiếp</p>
              </div>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
};

export default CareerPage;
