import React, { useState, useEffect } from 'react';
import api from '../../services/api';
import { 
  Layers, 
  Briefcase, 
  Plus, 
  Edit2, 
  Trash2, 
  Search, 
  Power, 
  CheckCircle, 
  AlertTriangle, 
  Users, 
  XCircle, 
  UserCheck, 
  Phone, 
  Mail, 
  Calendar,
  Network,
  Building2,
  Truck,
  Factory,
  ChevronRight,
  Eye,
  ShieldCheck,
  Sparkles,
  Award,
  Crown,
  ChevronDown,
  ChevronUp,
  Filter,
  SlidersHorizontal,
  DollarSign
} from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';

const TIER_CONFIGS = [
  {
    id: 'Tầng 7',
    tierNumber: 7,
    title: 'TẦNG 7: BAN TỔNG GIÁM ĐỐC & TRỢ LÝ CẤP CAO',
    shortTitle: 'Tầng 7 - Lãnh Đạo Tối Cao',
    salary: 9500000,
    kpiQuota: 'Theo quy định BGD / Thỏa thuận',
    description: 'Định hướng chiến lược vĩ mô, hoạch định chính sách tổng thể và điều hành tối cao toàn bộ công ty.',
    scope: 'Ban Tổng Giám đốc, Trợ lý Ban Giám đốc',
    badgeClass: 'bg-amber-100 text-amber-900 border-amber-300',
    headerBg: 'bg-gradient-to-r from-slate-950 via-amber-950 to-slate-900',
    borderClass: 'border-amber-400',
    accentText: 'text-amber-300',
    glowColor: 'shadow-amber-500/10'
  },
  {
    id: 'Tầng 6',
    tierNumber: 6,
    title: 'TẦNG 6: BAN GIÁM ĐỐC ĐIỀU HÀNH (PHÓ GIÁM ĐỐC)',
    shortTitle: 'Tầng 6 - BGĐ Điều Hành',
    salary: 8000000,
    kpiQuota: '2.500.000 đ/tháng',
    description: 'Điều hành trực tiếp toàn bộ chuỗi cung ứng, khối sản xuất, khối kinh doanh và nhân sự toàn công ty.',
    scope: 'Phó Giám đốc điều hành',
    badgeClass: 'bg-blue-100 text-blue-900 border-blue-300',
    headerBg: 'bg-gradient-to-r from-slate-950 via-blue-950 to-slate-900',
    borderClass: 'border-blue-400',
    accentText: 'text-blue-300',
    glowColor: 'shadow-blue-500/10'
  },
  {
    id: 'Tầng 5',
    tierNumber: 5,
    title: 'TẦNG 5: CẤP TRƯỞNG PHÒNG & QUẢN LÝ ĐƠN VỊ',
    shortTitle: 'Tầng 5 - Trưởng Phòng & Quản Lý',
    salary: 6500000,
    kpiQuota: '2.000.000 đ/tháng',
    description: 'Quản lý, điều hành và chịu trách nhiệm toàn diện về mục tiêu KPI phòng ban, chi nhánh và các xưởng sản xuất.',
    scope: 'Trưởng phòng HCNS, Kế toán, MKT, R&D, Kinh doanh, Quản lý Kho Cần Thơ, Quản lý Kho Mỹ Tho, Quản lý Xưởng Nệm, Xưởng Gối...',
    badgeClass: 'bg-purple-100 text-purple-900 border-purple-300',
    headerBg: 'bg-gradient-to-r from-purple-950 via-indigo-950 to-slate-900',
    borderClass: 'border-purple-400',
    accentText: 'text-purple-300',
    glowColor: 'shadow-purple-500/10'
  },
  {
    id: 'Tầng 4',
    tierNumber: 4,
    title: 'TẦNG 4: CẤP PHÓ PHÒNG / TRƯỞNG NHÓM / CHUYÊN VIÊN CHIẾN LƯỢC',
    shortTitle: 'Tầng 4 - Phó Phòng / Trưởng Nhóm',
    salary: 6000000,
    kpiQuota: '1.500.000 đ/tháng',
    description: 'Tham mưu chuyên môn cấp cao, phối hợp quản lý điều phối tác nghiệp chuyên sâu theo bộ phận.',
    scope: 'Phó phòng, Trưởng nhóm chuyên môn, Chuyên viên chiến lược',
    badgeClass: 'bg-teal-100 text-teal-900 border-teal-300',
    headerBg: 'bg-gradient-to-r from-teal-950 via-emerald-950 to-slate-900',
    borderClass: 'border-teal-400',
    accentText: 'text-teal-300',
    glowColor: 'shadow-teal-500/10'
  },
  {
    id: 'Tầng 3',
    tierNumber: 3,
    title: 'TẦNG 3: CHUYÊN VIÊN CAO CẤP / ĐỘI TRƯỞNG (THÂM NIÊN ≥ 3 NĂM)',
    shortTitle: 'Tầng 3 - Thâm Niên ≥ 3 Năm',
    salary: 5500000,
    kpiQuota: '1.000.000 đ/tháng',
    description: 'Nhân sự nòng cốt có thâm niên từ 3 năm trở lên, tay nghề vững vàng, phụ trách các tuyến xe tải trọng yếu, NVKD thâm niên...',
    scope: 'Đội trưởng xe, Tài xế kỳ cựu, NVKD thâm niên, Kỹ thuật viên thâm niên cao',
    badgeClass: 'bg-emerald-100 text-emerald-900 border-emerald-300',
    headerBg: 'bg-gradient-to-r from-emerald-950 via-teal-950 to-slate-900',
    borderClass: 'border-emerald-400',
    accentText: 'text-emerald-300',
    glowColor: 'shadow-emerald-500/10'
  },
  {
    id: 'Tầng 2',
    tierNumber: 2,
    title: 'TẦNG 2: CHUYÊN VIÊN / KẾ TOÁN / KỸ THUẬT VIÊN (THÂM NIÊN 1 - 3 NĂM)',
    shortTitle: 'Tầng 2 - Thâm Niên 1-3 Năm',
    salary: 5000000,
    kpiQuota: '1.000.000 đ/tháng',
    description: 'Nhân sự chính thức hoàn thành công việc độc lập, đảm bảo tiến độ và định mức công việc định kỳ.',
    scope: 'Chuyên viên HCNS, Kế toán viên, Nhân viên kinh doanh, Công nhân kỹ thuật tay nghề',
    badgeClass: 'bg-sky-100 text-sky-900 border-sky-300',
    headerBg: 'bg-gradient-to-r from-sky-950 via-blue-950 to-slate-900',
    borderClass: 'border-sky-400',
    accentText: 'text-sky-300',
    glowColor: 'shadow-sky-500/10'
  },
  {
    id: 'Tầng 1',
    tierNumber: 1,
    title: 'TẦNG 1: NHÂN VIÊN MỚI / THỬ VIỆC (THÂM NIÊN < 1 NĂM)',
    shortTitle: 'Tầng 1 - Thâm Niên < 1 Năm',
    salary: 4500000,
    kpiQuota: '1.000.000 đ/tháng',
    description: 'Nhân sự mới tiếp nhận công việc, đang trong giai đoạn đào tạo, học việc và hòa nhập văn hóa Nệm Việt Á.',
    scope: 'Nhân viên mới tuyển dụng, Nhân viên thử việc, Học việc',
    badgeClass: 'bg-slate-100 text-slate-800 border-slate-300',
    headerBg: 'bg-gradient-to-r from-slate-800 via-slate-900 to-zinc-900',
    borderClass: 'border-slate-400',
    accentText: 'text-slate-300',
    glowColor: 'shadow-slate-500/10'
  }
];

const DeptPosSettingsPage = () => {
  const { user } = useAuth();
  const isAdmin = user?.roleName === 'ADMIN';

  const [activeTab, setActiveTab] = useState('org_chart');
  const [orgSubView, setOrgSubView] = useState('7_tiers'); // '7_tiers' or '4_pillars'
  const [departments, setDepartments] = useState([]);
  const [positions, setPositions] = useState([]);
  const [branches, setBranches] = useState([]);
  const [allEmployees, setAllEmployees] = useState([]);
  
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  // Modals state
  const [deptModalOpen, setDeptModalOpen] = useState(false);
  const [deptModalType, setDeptModalType] = useState('create');
  const [selectedDept, setSelectedDept] = useState(null);
  const [deptForm, setDeptForm] = useState({ name: '', branch_id: '' });

  const [posModalOpen, setPosModalOpen] = useState(false);
  const [posModalType, setPosModalType] = useState('create');
  const [selectedPos, setSelectedPos] = useState(null);
  const [posForm, setPosForm] = useState({ name: '', department_id: '' });

  // View Department Employees Modal State
  const [viewDeptEmployeesModalOpen, setViewDeptEmployeesModalOpen] = useState(false);
  const [viewDeptData, setViewDeptData] = useState({ department: null, employees: [] });
  const [viewDeptLoading, setViewDeptLoading] = useState(false);
  const [empSearch, setEmpSearch] = useState('');

  // Filters & Search
  const [deptSearch, setDeptSearch] = useState('');
  const [posSearch, setPosSearch] = useState('');
  const [posDeptFilter, setPosDeptFilter] = useState('');
  const [orgSearch, setOrgSearch] = useState('');
  const [orgDeptFilter, setOrgDeptFilter] = useState('');
  const [orgTierFilter, setOrgTierFilter] = useState('');
  
  // Collapse/Expand state for 7 tiers
  const [expandedTiers, setExpandedTiers] = useState({
    'Tầng 7': true,
    'Tầng 6': true,
    'Tầng 5': true,
    'Tầng 4': true,
    'Tầng 3': true,
    'Tầng 2': true,
    'Tầng 1': true
  });

  const toggleTierExpand = (tierId) => {
    setExpandedTiers(prev => ({
      ...prev,
      [tierId]: !prev[tierId]
    }));
  };

  const toggleAllTiers = (expand = true) => {
    const newState = {};
    TIER_CONFIGS.forEach(t => {
      newState[t.id] = expand;
    });
    setExpandedTiers(newState);
  };

  const fetchData = async () => {
    setLoading(true);
    try {
      const [deptRes, posRes, branchRes, empRes] = await Promise.all([
        api.get('/departments'),
        api.get('/positions'),
        api.get('/branches'),
        api.get('/employees?limit=1000')
      ]);
      setDepartments(Array.isArray(deptRes.data) ? deptRes.data : []);
      setPositions(Array.isArray(posRes.data) ? posRes.data : []);
      setBranches(Array.isArray(branchRes.data) ? branchRes.data : []);
      const empList = empRes.data?.data || (Array.isArray(empRes.data) ? empRes.data : []);
      setAllEmployees(empList);
    } catch (err) {
      console.error(err);
      setError('Không thể tải dữ liệu danh mục.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleViewDeptEmployees = async (dept) => {
    setViewDeptLoading(true);
    setViewDeptData({ department: dept, employees: [] });
    setEmpSearch('');
    setViewDeptEmployeesModalOpen(true);
    try {
      const res = await api.get(`/departments/${dept.id}/employees`);
      if (res.data?.employees && res.data.employees.length > 0) {
        setViewDeptData(res.data);
      } else {
        const empRes = await api.get(`/employees?limit=1000`);
        const allList = empRes.data?.data || empRes.data || [];
        const matched = allList.filter(e => 
          Number(e.department_id) === Number(dept.id) ||
          e.department_name === dept.name ||
          e.department_id === dept.name
        );
        setViewDeptData({
          department: dept,
          employees: matched
        });
      }
    } catch (err) {
      console.error('Lỗi tải nhân sự phòng ban, sử dụng fallback:', err);
      try {
        const empRes = await api.get(`/employees?limit=1000`);
        const allList = empRes.data?.data || empRes.data || [];
        const matched = allList.filter(e => 
          Number(e.department_id) === Number(dept.id) ||
          e.department_name === dept.name ||
          e.department_id === dept.name
        );
        setViewDeptData({
          department: dept,
          employees: matched
        });
      } catch (e2) {
        setViewDeptData({ department: dept, employees: [] });
      }
    } finally {
      setViewDeptLoading(false);
    }
  };

  const handleToggleDeptStatus = async (dept) => {
    try {
      const newStatus = dept.is_active === 0 ? 1 : 0;
      await api.put(`/departments/${dept.id}`, {
        name: dept.name,
        branch_id: dept.branch_id,
        is_active: newStatus
      });
      setSuccess(`Đã ${newStatus ? 'kích hoạt' : 'vô hiệu hóa'} phòng ban thành công`);
      fetchData();
      setTimeout(() => setSuccess(''), 3000);
    } catch (err) {
      setError(err.response?.data?.message || 'Lỗi thao tác trạng thái');
      setTimeout(() => setError(''), 3000);
    }
  };

  const handleTogglePosStatus = async (pos) => {
    try {
      const newStatus = pos.is_active === 0 ? 1 : 0;
      await api.put(`/positions/${pos.id}`, {
        name: pos.name,
        department_id: pos.department_id,
        is_active: newStatus
      });
      setSuccess(`Đã ${newStatus ? 'kích hoạt' : 'vô hiệu hóa'} chức vụ thành công`);
      fetchData();
      setTimeout(() => setSuccess(''), 3000);
    } catch (err) {
      setError(err.response?.data?.message || 'Lỗi thao tác trạng thái');
      setTimeout(() => setError(''), 3000);
    }
  };

  const handleOpenDeptModal = (type, dept = null) => {
    setDeptModalType(type);
    setSelectedDept(dept);
    if (type === 'create') {
      setDeptForm({ name: '', branch_id: branches.length > 0 ? branches[0].id : '' });
    } else {
      setDeptForm({ name: dept.name, branch_id: dept.branch_id || '' });
    }
    setDeptModalOpen(true);
  };

  const handleOpenPosModal = (type, pos = null) => {
    setPosModalType(type);
    setSelectedPos(pos);
    if (type === 'create') {
      setPosForm({ name: '', department_id: departments.length > 0 ? departments[0].id : '' });
    } else {
      setPosForm({ name: pos.name, department_id: pos.department_id || '' });
    }
    setPosModalOpen(true);
  };

  const handleDeptSubmit = async (e) => {
    e.preventDefault();
    try {
      if (deptModalType === 'create') {
        await api.post('/departments', deptForm);
        setSuccess('Thêm phòng ban thành công');
      } else {
        await api.put(`/departments/${selectedDept.id}`, {
          ...deptForm,
          is_active: selectedDept.is_active
        });
        setSuccess('Cập nhật phòng ban thành công');
      }
      setDeptModalOpen(false);
      fetchData();
      setTimeout(() => setSuccess(''), 3000);
    } catch (err) {
      setError(err.response?.data?.message || 'Lỗi lưu dữ liệu');
      setTimeout(() => setError(''), 3000);
    }
  };

  const handlePosSubmit = async (e) => {
    e.preventDefault();
    try {
      if (posModalType === 'create') {
        await api.post('/positions', posForm);
        setSuccess('Thêm chức vụ thành công');
      } else {
        await api.put(`/positions/${selectedPos.id}`, {
          ...posForm,
          is_active: selectedPos.is_active
        });
        setSuccess('Cập nhật chức vụ thành công');
      }
      setPosModalOpen(false);
      fetchData();
      setTimeout(() => setSuccess(''), 3000);
    } catch (err) {
      setError(err.response?.data?.message || 'Lỗi lưu dữ liệu');
      setTimeout(() => setError(''), 3000);
    }
  };

  const handleDeleteDept = async (id) => {
    if (window.confirm('Bạn có chắc chắn muốn xóa phòng ban này?')) {
      try {
        await api.delete(`/departments/${id}`);
        setSuccess('Xóa phòng ban thành công');
        fetchData();
        setTimeout(() => setSuccess(''), 3000);
      } catch (err) {
        setError(err.response?.data?.message || 'Không thể xóa phòng ban');
        setTimeout(() => setError(''), 3000);
      }
    }
  };

  const handleDeletePos = async (id) => {
    if (window.confirm('Bạn có chắc chắn muốn xóa chức vụ này?')) {
      try {
        await api.delete(`/positions/${id}`);
        setSuccess('Xóa chức vụ thành công');
        fetchData();
        setTimeout(() => setSuccess(''), 3000);
      } catch (err) {
        setError(err.response?.data?.message || 'Không thể xóa chức vụ');
        setTimeout(() => setError(''), 3000);
      }
    }
  };

  const filteredDepts = departments.filter(d => 
    d.name.toLowerCase().includes(deptSearch.toLowerCase())
  );

  const filteredPositions = positions.filter(p => {
    const matchesSearch = p.name.toLowerCase().includes(posSearch.toLowerCase());
    const matchesDept = posDeptFilter ? Number(p.department_id) === Number(posDeptFilter) : true;
    return matchesSearch && matchesDept;
  });

  const modalFilteredEmployees = (viewDeptData?.employees || []).filter(e => {
    if (!empSearch) return true;
    const term = empSearch.toLowerCase();
    return (
      (e.fullname && e.fullname.toLowerCase().includes(term)) ||
      (e.code && e.code.toLowerCase().includes(term)) ||
      (e.position_name && e.position_name.toLowerCase().includes(term)) ||
      (e.phone && e.phone.includes(term))
    );
  });

  // Filtered employees for Org Chart
  const orgFilteredEmployees = allEmployees.filter(e => {
    if (orgTierFilter && e.tier !== orgTierFilter) return false;
    if (orgDeptFilter && Number(e.department_id) !== Number(orgDeptFilter) && e.department_name !== orgDeptFilter) return false;
    if (orgSearch) {
      const term = orgSearch.toLowerCase();
      const matchName = e.fullname && e.fullname.toLowerCase().includes(term);
      const matchCode = e.code && e.code.toLowerCase().includes(term);
      const matchPos = e.position_name && e.position_name.toLowerCase().includes(term);
      const matchDept = e.department_name && e.department_name.toLowerCase().includes(term);
      const matchPhone = e.phone && e.phone.includes(term);
      if (!matchName && !matchCode && !matchPos && !matchDept && !matchPhone) return false;
    }
    return true;
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between space-y-4 md:space-y-0">
        <div>
          <h2 className="text-2xl font-black text-slate-800 tracking-tight flex items-center space-x-2.5">
            <span className="p-2 rounded-xl bg-brand-50 text-brand-700 border border-brand-200">
              <Network size={22} />
            </span>
            <span>Cơ Cấu Tổ Chức & Sơ Đồ 7 Tầng Nhân Sự</span>
          </h2>
          <p className="text-xs text-slate-500 mt-1 font-medium">
            Sơ đồ phân cấp 7 tầng nhân sự chuẩn Thông Báo 18, cơ cấu phòng ban và danh bạ chức vụ Nệm Việt Á
          </p>
        </div>
        {isAdmin && activeTab !== 'org_chart' && (
          <div className="flex space-x-2">
            {activeTab === 'departments' ? (
              <button
                onClick={() => handleOpenDeptModal('create')}
                className="inline-flex items-center space-x-2 rounded-xl bg-brand-700 hover:bg-brand-800 text-white px-4 py-2 text-sm font-semibold shadow-md transition-all"
              >
                <Plus size={16} />
                <span>Thêm Phòng ban</span>
              </button>
            ) : (
              <button
                onClick={() => handleOpenPosModal('create')}
                className="inline-flex items-center space-x-2 rounded-xl bg-brand-700 hover:bg-brand-800 text-white px-4 py-2 text-sm font-semibold shadow-md transition-all"
              >
                <Plus size={16} />
                <span>Thêm Chức vụ</span>
              </button>
            )}
          </div>
        )}
      </div>

      {/* Notifications */}
      {success && (
        <div className="flex items-center space-x-2 rounded-xl bg-emerald-50 border border-emerald-200 p-4 text-sm font-semibold text-emerald-800 animate-fadeIn">
          <CheckCircle size={18} className="text-emerald-600" />
          <span>{success}</span>
        </div>
      )}
      {error && (
        <div className="flex items-center space-x-2 rounded-xl bg-red-50 border border-red-200 p-4 text-sm font-semibold text-red-800 animate-fadeIn">
          <AlertTriangle size={18} className="text-red-600" />
          <span>{error}</span>
        </div>
      )}

      {/* Tabs Layout */}
      <div className="border border-slate-200 bg-white rounded-2xl shadow-sm overflow-hidden">
        <div className="flex flex-wrap border-b border-slate-200 bg-slate-50/50">
          <button
            onClick={() => setActiveTab('org_chart')}
            className={`flex-1 min-w-[200px] py-4 text-center font-bold text-sm border-b-2 transition-all flex justify-center items-center space-x-2 cursor-pointer ${
              activeTab === 'org_chart'
                ? 'border-brand-700 text-brand-700 bg-white shadow-sm'
                : 'border-transparent text-slate-500 hover:text-slate-700 hover:bg-slate-100/50'
            }`}
          >
            <Crown size={18} className={activeTab === 'org_chart' ? 'text-amber-500' : ''} />
            <span>Sơ Đồ 7 Tầng Nhân Sự & Tổ Chức</span>
          </button>
          <button
            onClick={() => setActiveTab('departments')}
            className={`flex-1 min-w-[180px] py-4 text-center font-bold text-sm border-b-2 transition-all flex justify-center items-center space-x-2 cursor-pointer ${
              activeTab === 'departments'
                ? 'border-brand-700 text-brand-700 bg-white shadow-sm'
                : 'border-transparent text-slate-500 hover:text-slate-700 hover:bg-slate-100/50'
            }`}
          >
            <Layers size={18} />
            <span>Danh mục Phòng ban ({departments.length})</span>
          </button>
          <button
            onClick={() => setActiveTab('positions')}
            className={`flex-1 min-w-[180px] py-4 text-center font-bold text-sm border-b-2 transition-all flex justify-center items-center space-x-2 cursor-pointer ${
              activeTab === 'positions'
                ? 'border-brand-700 text-brand-700 bg-white shadow-sm'
                : 'border-transparent text-slate-500 hover:text-slate-700 hover:bg-slate-100/50'
            }`}
          >
            <Briefcase size={18} />
            <span>Danh mục Chức vụ ({positions.length})</span>
          </button>
        </div>

        {/* Tab 0: Sơ Đồ 7 Tầng Nhân Sự (Org Chart) */}
        {activeTab === 'org_chart' && (
          <div className="p-4 sm:p-6 space-y-6 bg-slate-50/40">
            {/* Quick Metrics Bar */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm flex items-center space-x-3.5">
                <div className="w-11 h-11 rounded-xl bg-blue-50 text-blue-700 flex items-center justify-center font-black shrink-0">
                  <Users size={22} />
                </div>
                <div>
                  <p className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Tổng nhân sự</p>
                  <p className="text-xl font-black text-slate-800">{allEmployees.length} nhân sự</p>
                </div>
              </div>

              <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm flex items-center space-x-3.5">
                <div className="w-11 h-11 rounded-xl bg-purple-50 text-purple-700 flex items-center justify-center font-black shrink-0">
                  <Building2 size={22} />
                </div>
                <div>
                  <p className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Phòng ban & Đơn vị</p>
                  <p className="text-xl font-black text-slate-800">{departments.length} bộ phận</p>
                </div>
              </div>

              <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm flex items-center space-x-3.5">
                <div className="w-11 h-11 rounded-xl bg-emerald-50 text-emerald-700 flex items-center justify-center font-black shrink-0">
                  <Truck size={22} />
                </div>
                <div>
                  <p className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Kho bãi & Chi nhánh</p>
                  <p className="text-xl font-black text-slate-800">{branches.length} địa điểm</p>
                </div>
              </div>

              <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm flex items-center space-x-3.5">
                <div className="w-11 h-11 rounded-xl bg-amber-50 text-amber-700 flex items-center justify-center font-black shrink-0">
                  <Crown size={22} />
                </div>
                <div>
                  <p className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Phân cấp nhân sự</p>
                  <p className="text-xl font-black text-amber-700">7 Tầng Quản Trị</p>
                </div>
              </div>
            </div>

            {/* Filter & View Switcher Bar */}
            <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm space-y-4">
              <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                {/* Sub-view Switcher */}
                <div className="inline-flex p-1 bg-slate-100 rounded-xl border border-slate-200/80">
                  <button
                    onClick={() => setOrgSubView('7_tiers')}
                    className={`px-4 py-2 rounded-lg text-xs font-black transition-all flex items-center space-x-2 ${
                      orgSubView === '7_tiers'
                        ? 'bg-brand-700 text-white shadow-sm'
                        : 'text-slate-600 hover:text-slate-900'
                    }`}
                  >
                    <Crown size={15} />
                    <span>Sơ Đồ 7 Tầng Nhân Sự (TB18)</span>
                  </button>
                  <button
                    onClick={() => setOrgSubView('4_pillars')}
                    className={`px-4 py-2 rounded-lg text-xs font-black transition-all flex items-center space-x-2 ${
                      orgSubView === '4_pillars'
                        ? 'bg-brand-700 text-white shadow-sm'
                        : 'text-slate-600 hover:text-slate-900'
                    }`}
                  >
                    <Building2 size={15} />
                    <span>Sơ Đồ 4 Khối Phòng Ban Chức Năng</span>
                  </button>
                </div>

                {/* Search & Select Filters */}
                <div className="flex flex-wrap items-center gap-2.5">
                  {/* Search input */}
                  <div className="flex items-center space-x-2 bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs flex-1 sm:w-64">
                    <Search size={15} className="text-slate-400 shrink-0" />
                    <input
                      type="text"
                      placeholder="Tìm nhân sự, mã NV, chức vụ..."
                      value={orgSearch}
                      onChange={(e) => setOrgSearch(e.target.value)}
                      className="bg-transparent outline-none w-full text-slate-700 font-medium"
                    />
                    {orgSearch && (
                      <button onClick={() => setOrgSearch('')} className="text-slate-400 hover:text-slate-600">
                        <XCircle size={14} />
                      </button>
                    )}
                  </div>

                  {/* Filter by Department */}
                  <select
                    value={orgDeptFilter}
                    onChange={(e) => setOrgDeptFilter(e.target.value)}
                    className="border border-slate-200 rounded-xl px-3 py-2 text-xs bg-slate-50 text-slate-700 outline-none focus:border-brand-500 font-medium"
                  >
                    <option value="">Tất cả phòng ban</option>
                    {departments.map(d => (
                      <option key={d.id} value={d.id}>{d.name}</option>
                    ))}
                  </select>

                  {/* Filter by Tier */}
                  <select
                    value={orgTierFilter}
                    onChange={(e) => setOrgTierFilter(e.target.value)}
                    className="border border-slate-200 rounded-xl px-3 py-2 text-xs bg-slate-50 text-slate-700 outline-none focus:border-brand-500 font-medium"
                  >
                    <option value="">Tất cả 7 tầng</option>
                    {TIER_CONFIGS.map(t => (
                      <option key={t.id} value={t.id}>{t.shortTitle}</option>
                    ))}
                  </select>

                  {/* Expand/Collapse All */}
                  {orgSubView === '7_tiers' && (
                    <div className="flex items-center space-x-1.5 pl-1">
                      <button
                        onClick={() => toggleAllTiers(true)}
                        className="px-2.5 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 text-[11px] font-bold rounded-lg transition"
                        title="Mở rộng tất cả 7 tầng"
                      >
                        Mở rộng hết
                      </button>
                      <button
                        onClick={() => toggleAllTiers(false)}
                        className="px-2.5 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 text-[11px] font-bold rounded-lg transition"
                        title="Thu gọn tất cả"
                      >
                        Thu gọn
                      </button>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Sub-view 1: 7-TIER PERSONNEL HIERARCHY (THEO THÔNG BÁO 18) */}
            {orgSubView === '7_tiers' && (
              <div className="space-y-6">
                {TIER_CONFIGS.filter(tier => !orgTierFilter || tier.id === orgTierFilter).map((tier) => {
                  const tierEmps = orgFilteredEmployees.filter(e => e.tier === tier.id);
                  const isExpanded = expandedTiers[tier.id] ?? true;

                  return (
                    <div 
                      key={tier.id}
                      className={`bg-white rounded-2xl border-2 ${tier.borderClass} shadow-md overflow-hidden transition-all duration-200`}
                    >
                      {/* Tier Header Bar */}
                      <div className={`${tier.headerBg} text-white p-4 sm:p-5 flex flex-col md:flex-row md:items-center justify-between gap-4`}>
                        <div className="space-y-1.5 flex-1">
                          <div className="flex flex-wrap items-center gap-2">
                            <span className={`inline-flex items-center space-x-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-black uppercase tracking-wider ${tier.badgeClass}`}>
                              <Crown size={12} />
                              <span>{tier.id}</span>
                            </span>
                            <span className="text-xs bg-white/10 px-3 py-0.5 rounded-full text-slate-200 border border-white/10 font-bold">
                              Lương tầng: <strong className="text-amber-300 font-mono">{tier.salary.toLocaleString('vi-VN')} đ</strong>
                            </span>
                            <span className="text-xs bg-white/10 px-3 py-0.5 rounded-full text-slate-200 border border-white/10 font-bold">
                              KPI Trách nhiệm: <strong className="text-emerald-300 font-mono">{tier.kpiQuota}</strong>
                            </span>
                          </div>
                          
                          <h3 className={`text-base sm:text-lg font-black tracking-tight ${tier.accentText}`}>
                            {tier.title}
                          </h3>
                          <p className="text-xs text-slate-300 font-medium">
                            {tier.description}
                          </p>
                        </div>

                        {/* Right: Employee Count & Toggle */}
                        <div className="flex items-center space-x-3 shrink-0">
                          <span className="bg-white/15 backdrop-blur-md px-3.5 py-1.5 rounded-xl border border-white/20 text-xs font-black text-white flex items-center space-x-1.5 shadow-sm">
                            <Users size={14} className="text-amber-300" />
                            <span>{tierEmps.length} nhân sự</span>
                          </span>

                          <button
                            onClick={() => toggleTierExpand(tier.id)}
                            className="p-2 bg-white/10 hover:bg-white/20 rounded-xl text-white transition flex items-center justify-center cursor-pointer"
                            title={isExpanded ? 'Thu gọn tầng này' : 'Mở rộng xem chi tiết'}
                          >
                            {isExpanded ? <ChevronUp size={18} /> : <ChevronDown size={18} />}
                          </button>
                        </div>
                      </div>

                      {/* Tier Content: Employee Grid */}
                      {isExpanded && (
                        <div className="p-5 bg-slate-50/50">
                          {tierEmps.length === 0 ? (
                            <div className="text-center py-8 text-slate-400 bg-white rounded-xl border border-dashed border-slate-200">
                              <Users size={28} className="mx-auto mb-1.5 text-slate-300" />
                              <p className="text-xs font-semibold">Chưa có nhân sự nào được phân bổ vào {tier.id}.</p>
                            </div>
                          ) : (
                            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                              {tierEmps.map((emp) => {
                                const deptObj = departments.find(d => 
                                  Number(d.id) === Number(emp.department_id) || 
                                  d.name === emp.department_name
                                );

                                return (
                                  <div
                                    key={emp.id || emp.code}
                                    className="bg-white p-4 rounded-xl border border-slate-200 hover:border-brand-300 hover:shadow-md transition-all space-y-3 group relative flex flex-col justify-between"
                                  >
                                    <div>
                                      {/* Top card row: Code + Status */}
                                      <div className="flex items-center justify-between gap-2 mb-2">
                                        <span className="text-[10px] font-mono font-bold bg-brand-50 text-brand-700 px-2 py-0.5 rounded border border-brand-200">
                                          {emp.code}
                                        </span>
                                        <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                                          emp.status === 'Đang làm việc'
                                            ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                                            : emp.status === 'Thử việc'
                                            ? 'bg-blue-50 text-blue-700 border border-blue-200'
                                            : 'bg-slate-100 text-slate-500'
                                        }`}>
                                          {emp.status || 'Chính thức'}
                                        </span>
                                      </div>

                                      {/* Employee Name & Avatar */}
                                      <div className="flex items-start space-x-3">
                                        <div className="w-10 h-10 rounded-full bg-gradient-to-br from-brand-600 to-indigo-800 text-white flex items-center justify-center font-black text-sm shrink-0 shadow-sm">
                                          {emp.fullname ? emp.fullname.charAt(emp.fullname.lastIndexOf(' ') + 1) || emp.fullname.charAt(0) : 'NV'}
                                        </div>
                                        <div className="min-w-0 flex-1">
                                          <h4 className="font-bold text-slate-900 text-sm leading-snug group-hover:text-brand-700 transition line-clamp-1">
                                            {emp.fullname}
                                          </h4>
                                          <p className="text-xs font-semibold text-brand-600 mt-0.5 line-clamp-1">
                                            {emp.position_name || 'Chức vụ chuẩn'}
                                          </p>
                                        </div>
                                      </div>

                                      {/* Department Info */}
                                      <div className="mt-3 pt-2.5 border-t border-slate-100 space-y-1.5 text-xs text-slate-600">
                                        <div className="flex items-center space-x-1.5 text-slate-700 font-medium">
                                          <Building2 size={13} className="text-slate-400 shrink-0" />
                                          <span className="truncate">{emp.department_name || 'Chưa gán phòng ban'}</span>
                                        </div>
                                        {emp.branch_name && (
                                          <div className="flex items-center space-x-1.5 text-slate-500 text-[11px]">
                                            <Truck size={12} className="text-slate-400 shrink-0" />
                                            <span className="truncate">{emp.branch_name}</span>
                                          </div>
                                        )}
                                      </div>
                                    </div>

                                    {/* Action button: Xem phòng ban */}
                                    {deptObj && (
                                      <button
                                        onClick={() => handleViewDeptEmployees(deptObj)}
                                        className="w-full mt-2 py-1.5 bg-slate-50 hover:bg-brand-50 text-slate-600 hover:text-brand-700 text-[11px] font-bold rounded-lg border border-slate-200 hover:border-brand-200 transition flex items-center justify-center space-x-1 cursor-pointer"
                                      >
                                        <Eye size={12} />
                                        <span>Xem phòng ban ({deptObj.name})</span>
                                      </button>
                                    )}
                                  </div>
                                );
                              })}
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            )}

            {/* Sub-view 2: 4 FUNCTIONAL PILLARS (4 KHỐI PHÒNG BAN CHỨC NĂNG) */}
            {orgSubView === '4_pillars' && (
              <div className="space-y-8 flex flex-col items-center">
                {/* Level 1: BAN TỔNG GIÁM ĐỐC & TRỢ LÝ (TẦNG 7 & 6) */}
                <div className="w-full max-w-2xl text-center">
                  <div className="bg-gradient-to-r from-slate-950 via-brand-950 to-blue-950 text-white p-6 rounded-2xl shadow-xl border-2 border-amber-400/60 relative">
                    <div className="inline-flex items-center space-x-2 bg-amber-400/20 border border-amber-400/40 px-3 py-1 rounded-full text-xs font-black uppercase tracking-wider text-amber-300 mb-2">
                      <Sparkles size={14} />
                      <span>BAN ĐIỀU HÀNH & LÃNH ĐẠO CẤP CAO (TẦNG 7 & TẦNG 6)</span>
                    </div>
                    <h3 className="text-xl md:text-2xl font-black tracking-tight text-white">
                      CÔNG TY TNHH TM SX NỆM VIỆT Á
                    </h3>
                    
                    <div className="mt-4 pt-4 border-t border-white/10 grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                      <div className="bg-white/10 backdrop-blur-md px-4 py-2.5 rounded-xl border border-white/20 flex items-center justify-between shadow">
                        <div className="text-left">
                          <span className="text-slate-300 block text-[10px]">Tầng 6 • Phó Giám Đốc:</span>
                          <strong className="text-amber-300 font-black text-sm">Võ Minh Cường</strong>
                        </div>
                        <span className="bg-amber-400 text-slate-950 text-[10px] font-black px-2 py-0.5 rounded">
                          Lương: 8.0 Tr
                        </span>
                      </div>

                      <div className="bg-white/10 backdrop-blur-md px-4 py-2.5 rounded-xl border border-white/20 flex items-center justify-between shadow">
                        <div className="text-left">
                          <span className="text-slate-300 block text-[10px]">Tầng 7 • Trợ Lý Giám Đốc:</span>
                          <strong className="text-amber-300 font-black text-sm">Nguyễn Quốc Huy</strong>
                        </div>
                        <span className="bg-amber-400 text-slate-950 text-[10px] font-black px-2 py-0.5 rounded">
                          Lương: 9.5 Tr
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Vertical Connector Line */}
                  <div className="w-0.5 h-8 bg-slate-300 mx-auto"></div>
                </div>

                {/* Horizontal Connecting Branch Line */}
                <div className="w-full max-w-6xl relative hidden md:block">
                  <div className="h-0.5 bg-slate-300 w-full"></div>
                  <div className="flex justify-between w-full">
                    <div className="w-0.5 h-6 bg-slate-300"></div>
                    <div className="w-0.5 h-6 bg-slate-300"></div>
                    <div className="w-0.5 h-6 bg-slate-300"></div>
                    <div className="w-0.5 h-6 bg-slate-300"></div>
                  </div>
                </div>

                {/* Level 2: 4 Functional Pillars (TẦNG 5 - CẤP TRƯỞNG PHÒNG / QUẢN LÝ ĐƠN VỊ) */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 w-full max-w-7xl">
                  {/* Pillar 1: Khối Văn Phòng & Quản Trị */}
                  <div className="bg-white rounded-2xl border-2 border-blue-200/80 shadow-md overflow-hidden flex flex-col">
                    <div className="bg-gradient-to-r from-blue-700 to-indigo-800 text-white p-4">
                      <div className="flex items-center justify-between mb-1">
                        <div className="flex items-center space-x-2">
                          <Building2 size={18} className="text-blue-200" />
                          <span className="text-xs font-black uppercase tracking-wider text-blue-200">Khối 01</span>
                        </div>
                        <span className="bg-blue-900/60 text-blue-100 text-[10px] font-bold px-2 py-0.5 rounded-full border border-blue-400/30">
                          Tầng 5
                        </span>
                      </div>
                      <h4 className="font-black text-base text-white">VĂN PHÒNG & QUẢN TRỊ</h4>
                      <p className="text-[11px] text-blue-100 mt-0.5">Trụ sở chính & Vận hành chung</p>
                    </div>

                    <div className="p-4 space-y-3 flex-1">
                      {/* Phòng HCNS */}
                      <div className="p-3.5 rounded-xl border border-blue-200 bg-blue-50/40 space-y-2">
                        <div className="flex justify-between items-start">
                          <div>
                            <h5 className="text-xs font-black text-slate-800">Phòng Hành Chính Nhân Sự</h5>
                            <p className="text-[11px] text-blue-900 font-bold mt-0.5">
                              Trưởng phòng: <span className="text-brand-800 font-black">Huỳnh Thị Trúc Xinh</span>
                            </p>
                            <p className="text-[10px] text-slate-500">Cấp Tầng 5 • Lương: 6.500.000 đ</p>
                          </div>
                          <span className="bg-blue-100 text-blue-800 text-[10px] font-black px-2 py-0.5 rounded-full">
                            {allEmployees.filter(e => e.department_name?.toLowerCase().includes('văn phòng') || e.department_name?.toLowerCase().includes('hcns')).length} NS
                          </span>
                        </div>
                        {departments.find(d => d.name.toLowerCase().includes('văn phòng') || d.name.toLowerCase().includes('hcns')) && (
                          <button
                            onClick={() => handleViewDeptEmployees(departments.find(d => d.name.toLowerCase().includes('văn phòng') || d.name.toLowerCase().includes('hcns')))}
                            className="w-full text-center py-1.5 bg-white hover:bg-blue-100/60 text-blue-800 text-[11px] font-bold rounded-lg border border-blue-200 transition flex items-center justify-center space-x-1 cursor-pointer"
                          >
                            <Eye size={12} />
                            <span>Xem nhân sự Khối Văn Phòng</span>
                          </button>
                        )}
                      </div>

                      {/* Phòng Kế Toán */}
                      <div className="p-3 rounded-xl border border-slate-200/90 bg-slate-50/50 space-y-1.5">
                        <div className="flex justify-between items-start">
                          <div>
                            <h5 className="text-xs font-bold text-slate-800">Bộ phận Kế Toán Doanh Nghiệp</h5>
                            <p className="text-[11px] text-slate-700 font-bold mt-0.5">
                              Trưởng phòng: <span className="text-slate-900 font-black">Nguyễn Quốc Hùng</span>
                            </p>
                            <p className="text-[10px] text-slate-500">Cấp Tầng 5 • Lương: 6.500.000 đ</p>
                          </div>
                        </div>
                      </div>

                      {/* Phòng Marketing */}
                      {departments.filter(d => d.name.toLowerCase().includes('marketing')).map(dept => {
                        const deptEmps = allEmployees.filter(e => Number(e.department_id) === Number(dept.id) || e.department_name === dept.name);
                        return (
                          <div key={dept.id} className="p-3 rounded-xl border border-slate-200/90 bg-slate-50/50 space-y-2">
                            <div className="flex justify-between items-start">
                              <div>
                                <h5 className="text-xs font-bold text-slate-800">{dept.name}</h5>
                                <p className="text-[11px] text-slate-700 font-bold mt-0.5">
                                  Trưởng phòng: <span className="text-slate-900 font-black">Phan Tuấn Kiệt</span>
                                </p>
                                <p className="text-[10px] text-slate-500">Cấp Tầng 5 • Lương: 6.500.000 đ</p>
                              </div>
                              <span className="bg-blue-100 text-blue-800 text-[10px] font-black px-2 py-0.5 rounded-full">
                                {deptEmps.length} NS
                              </span>
                            </div>
                            <button
                              onClick={() => handleViewDeptEmployees(dept)}
                              className="w-full text-center py-1.5 bg-white hover:bg-blue-50 text-blue-700 text-[11px] font-bold rounded-lg border border-blue-200 transition flex items-center justify-center space-x-1 cursor-pointer"
                            >
                              <Eye size={12} />
                              <span>Xem danh sách nhân sự</span>
                            </button>
                          </div>
                        );
                      })}

                      {/* Phòng R&D */}
                      <div className="p-3 rounded-xl border border-slate-200/90 bg-slate-50/50 space-y-1.5">
                        <div className="flex justify-between items-start">
                          <div>
                            <h5 className="text-xs font-bold text-slate-800">Phòng Nghiên Cứu & Phát Triển (R&D)</h5>
                            <p className="text-[11px] text-slate-700 font-bold mt-0.5">
                              Trưởng phòng: <span className="text-slate-900 font-black">Lê Huy Hoàng</span>
                            </p>
                            <p className="text-[10px] text-slate-500">Cấp Tầng 5 • Lương: 6.500.000 đ</p>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Pillar 2: Khối Kinh Doanh & Phân Phối */}
                  <div className="bg-white rounded-2xl border-2 border-amber-200/80 shadow-md overflow-hidden flex flex-col">
                    <div className="bg-gradient-to-r from-amber-600 to-orange-700 text-white p-4">
                      <div className="flex items-center justify-between mb-1">
                        <div className="flex items-center space-x-2">
                          <Award size={18} className="text-amber-200" />
                          <span className="text-xs font-black uppercase tracking-wider text-amber-200">Khối 02</span>
                        </div>
                        <span className="bg-amber-900/60 text-amber-100 text-[10px] font-bold px-2 py-0.5 rounded-full border border-amber-400/30">
                          Tầng 5
                        </span>
                      </div>
                      <h4 className="font-black text-base text-white">KINH DOANH & PHÂN PHỐI</h4>
                      <p className="text-[11px] text-amber-100 mt-0.5">Phát triển đại lý & Doanh số</p>
                    </div>

                    <div className="p-4 space-y-3 flex-1">
                      {departments.filter(d => d.name.toLowerCase().includes('kinh doanh')).map(dept => {
                        const deptEmps = allEmployees.filter(e => 
                          Number(e.department_id) === Number(dept.id) ||
                          e.department_name === dept.name ||
                          e.department_id === dept.name
                        );
                        return (
                          <div 
                            key={dept.id}
                            className="p-3.5 rounded-xl border border-amber-200 bg-amber-50/40 space-y-2.5"
                          >
                            <div className="flex justify-between items-start">
                              <div>
                                <h5 className="text-xs font-black text-slate-800">{dept.name}</h5>
                                <p className="text-[11px] text-amber-950 font-bold mt-0.5">
                                  Trưởng phòng: <span className="text-amber-900 font-black">Phạm Tấn Hưng</span>
                                </p>
                                <p className="text-[10px] text-slate-500 mt-1">Cấp Tầng 5 • Đội ngũ NVKD phụ trách các tỉnh Miền Tây & Đông Nam Bộ</p>
                              </div>
                              <span className="bg-amber-100 text-amber-900 text-[10px] font-black px-2.5 py-0.5 rounded-full">
                                {deptEmps.length} NS
                              </span>
                            </div>
                            <button
                              onClick={() => handleViewDeptEmployees(dept)}
                              className="w-full text-center py-1.5 bg-white hover:bg-amber-100/60 text-amber-900 text-[11px] font-bold rounded-lg border border-amber-200 transition flex items-center justify-center space-x-1 cursor-pointer"
                            >
                              <Eye size={12} />
                              <span>Xem danh sách nhân sự ({deptEmps.length})</span>
                            </button>
                          </div>
                        );
                      })}
                    </div>
                  </div>

                  {/* Pillar 3: Khối Kho Vận & Logistics */}
                  <div className="bg-white rounded-2xl border-2 border-emerald-200/80 shadow-md overflow-hidden flex flex-col">
                    <div className="bg-gradient-to-r from-emerald-600 to-teal-800 text-white p-4">
                      <div className="flex items-center justify-between mb-1">
                        <div className="flex items-center space-x-2">
                          <Truck size={18} className="text-emerald-200" />
                          <span className="text-xs font-black uppercase tracking-wider text-emerald-200">Khối 03</span>
                        </div>
                        <span className="bg-emerald-900/60 text-emerald-100 text-[10px] font-bold px-2 py-0.5 rounded-full border border-emerald-400/30">
                          Tầng 5
                        </span>
                      </div>
                      <h4 className="font-black text-base text-white">KHO VẬN & LOGISTICS</h4>
                      <p className="text-[11px] text-emerald-100 mt-0.5">Kho Cần Thơ & Kho Mỹ Tho</p>
                    </div>

                    <div className="p-4 space-y-3 flex-1">
                      {departments.filter(d => d.name.toLowerCase().includes('kho')).map(dept => {
                        const deptEmps = allEmployees.filter(e => 
                          Number(e.department_id) === Number(dept.id) ||
                          e.department_name === dept.name ||
                          e.department_id === dept.name
                        );
                        const isCanTho = dept.name.toLowerCase().includes('cần thơ');
                        return (
                          <div 
                            key={dept.id}
                            className="p-3.5 rounded-xl border border-emerald-200 bg-emerald-50/40 space-y-2.5"
                          >
                            <div className="flex justify-between items-start">
                              <div>
                                <h5 className="text-xs font-black text-slate-800">{dept.name}</h5>
                                <p className="text-[11px] text-emerald-950 font-bold mt-0.5">
                                  Quản lý kho: <span className="text-emerald-900 font-black">{isCanTho ? 'Nguyễn Thị Thu Tâm' : 'Dương Thị Tuyết Hường'}</span>
                                </p>
                                <p className="text-[10px] text-slate-500">Cấp Tầng 5 • {isCanTho ? 'Kho trung tâm Cần Thơ' : 'Phó QL: Huỳnh Như • Đội trưởng: Hoài Linh'}</p>
                              </div>
                              <span className="bg-emerald-100 text-emerald-900 text-[10px] font-black px-2.5 py-0.5 rounded-full">
                                {deptEmps.length} NS
                              </span>
                            </div>
                            <button
                              onClick={() => handleViewDeptEmployees(dept)}
                              className="w-full text-center py-1.5 bg-white hover:bg-emerald-100/60 text-emerald-900 text-[11px] font-bold rounded-lg border border-emerald-200 transition flex items-center justify-center space-x-1 cursor-pointer"
                            >
                              <Eye size={12} />
                              <span>Xem danh sách nhân sự ({deptEmps.length})</span>
                            </button>
                          </div>
                        );
                      })}
                    </div>
                  </div>

                  {/* Pillar 4: Khối Nhà Máy Sản Xuất */}
                  <div className="bg-white rounded-2xl border-2 border-purple-200/80 shadow-md overflow-hidden flex flex-col">
                    <div className="bg-gradient-to-r from-purple-700 to-fuchsia-800 text-white p-4">
                      <div className="flex items-center justify-between mb-1">
                        <div className="flex items-center space-x-2">
                          <Factory size={18} className="text-purple-200" />
                          <span className="text-xs font-black uppercase tracking-wider text-purple-200">Khối 04</span>
                        </div>
                        <span className="bg-purple-900/60 text-purple-100 text-[10px] font-bold px-2 py-0.5 rounded-full border border-purple-400/30">
                          Tầng 5
                        </span>
                      </div>
                      <h4 className="font-black text-base text-white">NHÀ MÁY SẢN XUẤT</h4>
                      <p className="text-[11px] text-purple-100 mt-0.5">Xưởng Nệm & Xưởng Gối</p>
                    </div>

                    <div className="p-4 space-y-3 flex-1">
                      {departments.filter(d => d.name.toLowerCase().includes('xưởng')).map(dept => {
                        const deptEmps = allEmployees.filter(e => 
                          Number(e.department_id) === Number(dept.id) ||
                          e.department_name === dept.name ||
                          e.department_id === dept.name
                        );
                        const isNem = dept.name.toLowerCase().includes('nệm');
                        return (
                          <div 
                            key={dept.id}
                            className="p-3.5 rounded-xl border border-purple-200 bg-purple-50/40 space-y-2.5"
                          >
                            <div className="flex justify-between items-start">
                              <div>
                                <h5 className="text-xs font-black text-slate-800">{dept.name}</h5>
                                <p className="text-[11px] text-purple-950 font-bold mt-0.5">
                                  Quản lý: <span className="text-purple-900 font-black">{isNem ? 'Trần Minh Lý' : 'Trần Thị Bảo Châu'}</span>
                                </p>
                                <p className="text-[10px] text-slate-500">
                                  Cấp Tầng 5 • {isNem ? 'Phó QL: Võ Huỳnh Đông Nghi' : 'Trưởng nhóm thổi: Nguyễn Thái Cần'}
                                </p>
                              </div>
                              <span className="bg-purple-100 text-purple-900 text-[10px] font-black px-2.5 py-0.5 rounded-full">
                                {deptEmps.length} NS
                              </span>
                            </div>
                            <button
                              onClick={() => handleViewDeptEmployees(dept)}
                              className="w-full text-center py-1.5 bg-white hover:bg-purple-100/60 text-purple-900 text-[11px] font-bold rounded-lg border border-purple-200 transition flex items-center justify-center space-x-1 cursor-pointer"
                            >
                              <Eye size={12} />
                              <span>Xem danh sách nhân sự ({deptEmps.length})</span>
                            </button>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Tab 1: Departments */}
        {activeTab === 'departments' && (
          <div className="p-6 space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div className="flex items-center space-x-2 max-w-md w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2">
                <Search size={18} className="text-slate-400" />
                <input
                  type="text"
                  placeholder="Tìm kiếm phòng ban..."
                  value={deptSearch}
                  onChange={(e) => setDeptSearch(e.target.value)}
                  className="outline-none text-sm w-full bg-transparent border-none focus:ring-0 text-slate-700"
                />
              </div>
              <p className="text-xs text-slate-500 italic">
                💡 <span className="font-semibold text-brand-700">Mẹo:</span> Nhấp vào bất kỳ phòng ban nào để xem danh sách nhân sự trực thuộc!
              </p>
            </div>

            <div className="rounded-xl border border-slate-200 overflow-hidden">
              <div className="w-full overflow-x-auto custom-scroll-x">
                {loading ? (
                  <div className="flex justify-center p-8">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-brand-700"></div>
                  </div>
                ) : (
                  <table className="w-full text-left text-sm border-collapse min-w-[700px]">
                    <thead className="bg-slate-50 text-slate-500 font-bold uppercase tracking-wider text-[11px] border-b whitespace-nowrap">
                      <tr>
                        <th className="px-6 py-3.5">Tên Phòng ban</th>
                        <th className="px-6 py-3.5">Chi nhánh liên kết</th>
                        <th className="px-6 py-3.5 text-center">Nhân sự hiện tại</th>
                        <th className="px-6 py-3.5 text-center">Trạng thái</th>
                        {isAdmin && <th className="px-6 py-3.5 text-right">Thao tác</th>}
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 whitespace-nowrap">
                      {filteredDepts.map(d => (
                        <tr
                          key={d.id}
                          onClick={() => handleViewDeptEmployees(d)}
                          className="hover:bg-brand-50/40 transition-colors cursor-pointer group"
                          title="Nhấp để xem danh sách nhân sự thuộc phòng ban này"
                        >
                          <td className="px-6 py-4 font-bold text-slate-800">
                            <div className="flex items-center space-x-2.5">
                              <div className="p-2 rounded-lg bg-brand-50 text-brand-700 group-hover:bg-brand-600 group-hover:text-white transition">
                                <Layers size={16} />
                              </div>
                              <div>
                                <span className="group-hover:text-brand-700 transition font-bold">{d.name}</span>
                                <div className="text-[10px] text-brand-600 font-normal opacity-0 group-hover:opacity-100 transition flex items-center space-x-1">
                                  <span>👉 Nhấp xem danh sách nhân sự</span>
                                </div>
                              </div>
                            </div>
                          </td>
                          <td className="px-6 py-4 text-slate-600">
                            {d.branch_name || <span className="text-slate-400 italic">Không có</span>}
                          </td>
                          <td className="px-6 py-4 text-center">
                            <span className="inline-flex items-center space-x-1.5 bg-brand-50 text-brand-700 px-3 py-1 rounded-full text-xs font-bold border border-brand-200 group-hover:bg-brand-700 group-hover:text-white transition shadow-sm">
                              <Users size={13} />
                              <span>{d.employee_count} nhân viên</span>
                            </span>
                          </td>
                          <td className="px-6 py-4 text-center">
                            {d.is_active !== 0 ? (
                              <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
                                Đang hoạt động
                              </span>
                            ) : (
                              <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold bg-slate-100 text-slate-500 border border-slate-200">
                                Vô hiệu hóa
                              </span>
                            )}
                          </td>
                          {isAdmin && (
                            <td className="px-6 py-4 text-right space-x-2" onClick={e => e.stopPropagation()}>
                              <button
                                onClick={() => handleOpenDeptModal('edit', d)}
                                className="text-slate-500 hover:text-brand-600 p-1 rounded hover:bg-slate-100 transition-colors"
                                title="Sửa phòng ban"
                              >
                                <Edit2 size={16} />
                              </button>
                              <button
                                onClick={() => handleToggleDeptStatus(d)}
                                className={`p-1 rounded hover:bg-slate-100 transition-colors ${d.is_active !== 0 ? 'text-slate-500 hover:text-amber-600' : 'text-slate-400 hover:text-emerald-600'}`}
                                title={d.is_active !== 0 ? 'Vô hiệu hóa' : 'Kích hoạt'}
                              >
                                <Power size={16} />
                              </button>
                              <button
                                onClick={() => handleDeleteDept(d.id)}
                                className={`p-1 rounded hover:bg-slate-100 transition-colors ${d.employee_count > 0 ? 'text-slate-300 cursor-not-allowed' : 'text-slate-500 hover:text-red-600'}`}
                                disabled={d.employee_count > 0}
                                title={d.employee_count > 0 ? 'Phòng ban đang có nhân sự, không thể xóa' : 'Xóa phòng ban'}
                              >
                                <Trash2 size={16} />
                              </button>
                            </td>
                          )}
                        </tr>
                      ))}
                      {filteredDepts.length === 0 && (
                        <tr>
                          <td colSpan={isAdmin ? 5 : 4} className="text-center py-8 text-slate-400 italic">
                            Không có kết quả tìm kiếm phòng ban.
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Tab 2: Positions */}
        {activeTab === 'positions' && (
          <div className="p-6 space-y-4">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div className="flex items-center space-x-2 max-w-md w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2">
                <Search size={18} className="text-slate-400" />
                <input
                  type="text"
                  placeholder="Tìm kiếm chức vụ..."
                  value={posSearch}
                  onChange={(e) => setPosSearch(e.target.value)}
                  className="outline-none text-sm w-full bg-transparent border-none focus:ring-0 text-slate-700"
                />
              </div>
              <div className="flex items-center space-x-2">
                <span className="text-sm font-semibold text-slate-600 whitespace-nowrap">Lọc phòng ban:</span>
                <select
                  value={posDeptFilter}
                  onChange={(e) => setPosDeptFilter(e.target.value)}
                  className="border border-slate-200 rounded-xl px-3 py-2 text-sm bg-white outline-none focus:border-brand-500 font-medium"
                >
                  <option value="">Tất cả phòng ban</option>
                  {departments.map(d => (
                    <option key={d.id} value={d.id}>{d.name}</option>
                  ))}
                </select>
              </div>
            </div>

            <div className="rounded-xl border border-slate-200 overflow-hidden">
              <div className="w-full overflow-x-auto custom-scroll-x">
                {loading ? (
                  <div className="flex justify-center p-8">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-brand-700"></div>
                  </div>
                ) : (
                  <table className="w-full text-left text-sm border-collapse min-w-[700px]">
                    <thead className="bg-slate-50 text-slate-500 font-bold uppercase tracking-wider text-[11px] border-b whitespace-nowrap">
                      <tr>
                        <th className="px-6 py-3.5">Tên Chức vụ</th>
                        <th className="px-6 py-3.5">Thuộc Phòng ban</th>
                        <th className="px-6 py-3.5 text-center">Nhân sự hiện tại</th>
                        <th className="px-6 py-3.5 text-center">Trạng thái</th>
                        {isAdmin && <th className="px-6 py-3.5 text-right">Thao tác</th>}
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 whitespace-nowrap">
                      {filteredPositions.map(p => (
                        <tr key={p.id} className="hover:bg-slate-50/80 transition-colors">
                          <td className="px-6 py-4 font-bold text-slate-800 flex items-center space-x-2">
                            <Briefcase size={16} className="text-brand-500" />
                            <span>{p.name}</span>
                          </td>
                          <td className="px-6 py-4 text-slate-600 font-medium">{p.department_name || <span className="text-slate-400 italic">Chưa xác định</span>}</td>
                          <td className="px-6 py-4 text-center">
                            <span className="bg-slate-100 text-slate-700 px-2.5 py-1 rounded-full text-xs font-semibold">
                              {p.employee_count || 0} nhân sự
                            </span>
                          </td>
                          <td className="px-6 py-4 text-center">
                            {p.is_active !== 0 ? (
                              <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
                                Đang hoạt động
                              </span>
                            ) : (
                              <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold bg-slate-100 text-slate-500 border border-slate-200">
                                Vô hiệu hóa
                              </span>
                            )}
                          </td>
                          {isAdmin && (
                            <td className="px-6 py-4 text-right space-x-2">
                              <button
                                onClick={() => handleOpenPosModal('edit', p)}
                                className="text-slate-500 hover:text-brand-600 p-1 rounded hover:bg-slate-100 transition-colors"
                                title="Sửa chức vụ"
                              >
                                <Edit2 size={16} />
                              </button>
                              <button
                                onClick={() => handleTogglePosStatus(p)}
                                className={`p-1 rounded hover:bg-slate-100 transition-colors ${p.is_active !== 0 ? 'text-slate-500 hover:text-amber-600' : 'text-slate-400 hover:text-emerald-600'}`}
                                title={p.is_active !== 0 ? 'Vô hiệu hóa' : 'Kích hoạt'}
                              >
                                <Power size={16} />
                              </button>
                              <button
                                onClick={() => handleDeletePos(p.id)}
                                className={`p-1 rounded hover:bg-slate-100 transition-colors ${(p.employee_count || 0) > 0 ? 'text-slate-300 cursor-not-allowed' : 'text-slate-500 hover:text-red-600'}`}
                                disabled={(p.employee_count || 0) > 0}
                                title={(p.employee_count || 0) > 0 ? 'Chức vụ đang có nhân sự, không thể xóa' : 'Xóa chức vụ'}
                              >
                                <Trash2 size={16} />
                              </button>
                            </td>
                          )}
                        </tr>
                      ))}
                      {filteredPositions.length === 0 && (
                        <tr>
                          <td colSpan={isAdmin ? 5 : 4} className="text-center py-8 text-slate-400 italic">
                            Không có kết quả tìm kiếm chức vụ.
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                )}
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Modal: Danh sách Nhân sự thuộc Phòng ban */}
      {viewDeptEmployeesModalOpen && viewDeptData.department && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 backdrop-blur-sm p-4 overflow-y-auto">
          <div className="w-full max-w-5xl lg:max-w-6xl bg-white rounded-2xl shadow-2xl border border-slate-100 overflow-hidden my-6 max-h-[90vh] flex flex-col animate-scaleUp">
            {/* Modal Header */}
            <div className="p-5 bg-gradient-to-r from-brand-800 via-brand-700 to-slate-800 text-white flex justify-between items-center shrink-0">
              <div className="flex items-center space-x-3">
                <div className="p-2.5 bg-white/10 rounded-xl backdrop-blur-md">
                  <Layers size={22} className="text-amber-300" />
                </div>
                <div>
                  <h3 className="font-bold text-lg leading-tight flex items-center space-x-2">
                    <span>Phòng ban: {viewDeptData.department.name}</span>
                    <span className="text-xs bg-amber-400 text-slate-950 font-black px-2.5 py-0.5 rounded-full shadow-sm">
                      {viewDeptData.employees?.length || 0} nhân sự
                    </span>
                  </h3>
                  <p className="text-xs text-slate-200 mt-0.5 font-medium">
                    {viewDeptData.department.branch_name || 'Văn phòng Trụ sở chính'}
                  </p>
                </div>
              </div>
              <button
                onClick={() => setViewDeptEmployeesModalOpen(false)}
                className="text-slate-300 hover:text-white p-1 rounded-lg hover:bg-white/10 transition"
                title="Đóng modal"
              >
                <XCircle size={24} />
              </button>
            </div>

            {/* Modal Search & Filter */}
            <div className="p-4 bg-slate-50 border-b border-slate-200 flex flex-col sm:flex-row justify-between items-center gap-3 shrink-0">
              <div className="flex items-center space-x-2 max-w-md w-full bg-white border border-slate-200 rounded-xl px-3 py-2 shadow-sm">
                <Search size={16} className="text-slate-400" />
                <input
                  type="text"
                  placeholder="Tìm nhân viên trong phòng ban này (tên, mã, chức vụ, SĐT)..."
                  value={empSearch}
                  onChange={(e) => setEmpSearch(e.target.value)}
                  className="outline-none text-xs w-full bg-transparent text-slate-700"
                />
              </div>
              <span className="text-xs font-semibold text-slate-600 whitespace-nowrap">
                Hiển thị: <b className="text-brand-700 font-bold">{modalFilteredEmployees.length}</b> / {viewDeptData.employees?.length || 0} nhân sự
              </span>
            </div>

            {/* Modal Body / Table */}
            <div className="p-4 overflow-y-auto flex-1 custom-scroll">
              {viewDeptLoading ? (
                <div className="flex justify-center p-12">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-brand-700"></div>
                </div>
              ) : modalFilteredEmployees.length === 0 ? (
                <div className="text-center py-12 text-slate-400">
                  <Users size={36} className="mx-auto mb-2 text-slate-300" />
                  <p className="font-semibold text-sm">Chưa có nhân sự nào trong phòng ban này.</p>
                </div>
              ) : (
                <div className="rounded-xl border border-slate-200 overflow-x-auto custom-scroll-x shadow-sm">
                  <table className="w-full text-left text-xs border-collapse min-w-[800px] whitespace-nowrap">
                    <thead className="bg-slate-50 text-slate-600 font-bold uppercase tracking-wider text-[10px] border-b whitespace-nowrap">
                      <tr>
                        <th className="px-4 py-3.5 text-center w-12">STT</th>
                        <th className="px-5 py-3.5">Mã NV & Họ Tên</th>
                        <th className="px-5 py-3.5">Chức vụ</th>
                        <th className="px-4 py-3.5 text-center">Giới tính</th>
                        <th className="px-5 py-3.5">Liên hệ (SĐT / Email)</th>
                        <th className="px-4 py-3.5 text-center">Trạng thái</th>
                        <th className="px-5 py-3.5 text-right">Ngày vào làm</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 whitespace-nowrap">
                      {modalFilteredEmployees.map((emp, idx) => (
                        <tr key={emp.id} className="hover:bg-brand-50/30 transition">
                          <td className="px-4 py-3 text-slate-400 font-bold text-center">{idx + 1}</td>
                          <td className="px-5 py-3 whitespace-nowrap">
                            <div className="font-bold text-slate-800 text-sm">
                              {emp.fullname}
                            </div>
                            <span className="text-[10px] text-brand-700 font-mono font-bold bg-brand-50 px-1.5 py-0.5 rounded border border-brand-200/60 inline-block mt-0.5">
                              {emp.code}
                            </span>
                          </td>
                          <td className="px-5 py-3 whitespace-nowrap">
                            <span className="font-semibold text-slate-700 bg-slate-100 px-2.5 py-1 rounded-md inline-block">
                              {emp.position_name || 'Chưa phân chức vụ'}
                            </span>
                          </td>
                          <td className="px-4 py-3 text-center text-slate-600 font-medium whitespace-nowrap">
                            {emp.gender || '-'}
                          </td>
                          <td className="px-5 py-3 space-y-1 whitespace-nowrap">
                            {emp.phone ? (
                              <div className="flex items-center space-x-1.5 text-slate-700 font-medium">
                                <Phone size={12} className="text-slate-400 shrink-0" />
                                <span>{emp.phone}</span>
                              </div>
                            ) : (
                              <span className="text-slate-400 italic">-</span>
                            )}
                            {emp.email && (
                              <div className="flex items-center space-x-1.5 text-slate-500 text-[10px]">
                                <Mail size={12} className="text-slate-400 shrink-0" />
                                <span>{emp.email}</span>
                              </div>
                            )}
                          </td>
                          <td className="px-4 py-3 text-center whitespace-nowrap">
                            <span className={`px-2.5 py-1 rounded-full text-[11px] font-bold inline-block whitespace-nowrap ${
                              emp.status === 'Đang làm việc'
                                ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                                : emp.status === 'Thử việc'
                                ? 'bg-blue-50 text-blue-700 border border-blue-200'
                                : 'bg-slate-100 text-slate-500 border border-slate-200'
                            }`}>
                              {emp.status}
                            </span>
                          </td>
                          <td className="px-5 py-3 text-right text-slate-600 font-medium whitespace-nowrap">
                            {emp.join_date ? (
                              <span className="inline-flex items-center space-x-1.5">
                                <Calendar size={12} className="text-slate-400 shrink-0" />
                                <span>{emp.join_date}</span>
                              </span>
                            ) : '-'}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>

            {/* Modal Footer */}
            <div className="p-4 bg-slate-50 border-t border-slate-200 flex justify-end shrink-0">
              <button
                type="button"
                onClick={() => setViewDeptEmployeesModalOpen(false)}
                className="px-6 py-2 bg-slate-200 hover:bg-slate-300 text-slate-800 rounded-xl text-xs font-bold transition shadow-sm"
              >
                Đóng
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Department Form Modal */}
      {deptModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 backdrop-blur-sm px-4">
          <div className="w-full max-w-md bg-white rounded-2xl shadow-2xl p-6 border border-slate-100">
            <h3 className="font-bold text-lg text-slate-800 mb-4 border-b pb-2">
              {deptModalType === 'create' ? 'Thêm Phòng ban mới' : 'Cập nhật Phòng ban'}
            </h3>
            <form onSubmit={handleDeptSubmit} className="space-y-4">
              <div>
                <label className="text-xs font-bold text-slate-500">Tên phòng ban (*)</label>
                <input
                  required
                  type="text"
                  value={deptForm.name}
                  onChange={e => setDeptForm({ ...deptForm, name: e.target.value })}
                  placeholder="Ví dụ: Phòng Marketing"
                  className="w-full border border-slate-200 rounded-lg p-2.5 text-sm mt-1 outline-none focus:ring-2 focus:ring-brand-500 transition-all text-slate-800"
                />
              </div>
              <div>
                <label className="text-xs font-bold text-slate-500">Chi nhánh trực thuộc</label>
                <select
                  value={deptForm.branch_id}
                  onChange={e => setDeptForm({ ...deptForm, branch_id: e.target.value })}
                  className="w-full border border-slate-200 rounded-lg p-2.5 text-sm mt-1 bg-white outline-none focus:ring-2 focus:ring-brand-500 transition-all text-slate-800"
                >
                  <option value="">-- Chọn chi nhánh (tùy chọn) --</option>
                  {branches.map(b => (
                    <option key={b.id} value={b.id}>{b.name}</option>
                  ))}
                </select>
              </div>
              <div className="flex justify-end space-x-2 pt-4 border-t">
                <button
                  type="button"
                  onClick={() => setDeptModalOpen(false)}
                  className="px-4 py-2 border border-slate-200 rounded-lg text-sm font-semibold text-slate-600 hover:bg-slate-50"
                >
                  Hủy
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-brand-700 text-white font-semibold rounded-lg text-sm hover:bg-brand-800 shadow"
                >
                  Lưu dữ liệu
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Position Modal */}
      {posModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 backdrop-blur-sm px-4">
          <div className="w-full max-w-md bg-white rounded-2xl shadow-2xl p-6 border border-slate-100">
            <h3 className="font-bold text-lg text-slate-800 mb-4 border-b pb-2">
              {posModalType === 'create' ? 'Thêm Chức vụ mới' : 'Cập nhật Chức vụ'}
            </h3>
            <form onSubmit={handlePosSubmit} className="space-y-4">
              <div>
                <label className="text-xs font-bold text-slate-500">Tên chức vụ (*)</label>
                <input
                  required
                  type="text"
                  value={posForm.name}
                  onChange={e => setPosForm({ ...posForm, name: e.target.value })}
                  placeholder="Ví dụ: Nhân viên may viền"
                  className="w-full border border-slate-200 rounded-lg p-2.5 text-sm mt-1 outline-none focus:ring-2 focus:ring-brand-500 transition-all text-slate-800"
                />
              </div>
              <div>
                <label className="text-xs font-bold text-slate-500">Thuộc phòng ban (*)</label>
                <select
                  required
                  value={posForm.department_id}
                  onChange={e => setPosForm({ ...posForm, department_id: e.target.value })}
                  className="w-full border border-slate-200 rounded-lg p-2.5 text-sm mt-1 bg-white outline-none focus:ring-2 focus:ring-brand-500 transition-all text-slate-800"
                >
                  <option value="">-- Chọn phòng ban --</option>
                  {departments.map(d => (
                    <option key={d.id} value={d.id}>{d.name}</option>
                  ))}
                </select>
              </div>
              <div className="flex justify-end space-x-2 pt-4 border-t">
                <button
                  type="button"
                  onClick={() => setPosModalOpen(false)}
                  className="px-4 py-2 border border-slate-200 rounded-lg text-sm font-semibold text-slate-600 hover:bg-slate-50"
                >
                  Hủy
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-brand-700 text-white font-semibold rounded-lg text-sm hover:bg-brand-800 shadow"
                >
                  Lưu dữ liệu
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default DeptPosSettingsPage;
