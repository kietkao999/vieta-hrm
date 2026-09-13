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
  DollarSign,
  ArrowDown,
  Package,
  Wrench,
  Laptop
} from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';

// Cấu hình Phân Cấp Chức Danh chuẩn Thông Báo 18 (Không hiển thị tên người, chỉ hiển thị chức danh)
const LEVEL_TITLE_CONFIGS = [
  {
    level: 5,
    title: 'BAN TỔNG GIÁM ĐỐC',
    subtitle: 'Hoạch định chiến lược phát triển và điều hành tổng thể công ty',
    headerBg: 'bg-gradient-to-r from-slate-950 via-amber-950 to-slate-900',
    borderClass: 'border-amber-400',
    badgeClass: 'bg-amber-100 text-amber-900 border-amber-300',
    accentText: 'text-amber-300',
    roles: [
      { name: 'Tổng Giám Đốc', dept: 'Ban Giám Đốc', desc: 'Định hướng chiến lược phát triển, phê duyệt kế hoạch kinh doanh và ngân sách', level: 'Ban Lãnh Đạo' },
      { name: 'Trợ Lý Giám Đốc', dept: 'Khối Văn Phòng', desc: 'Tham mưu chiến lược và hỗ trợ công tác điều hành', level: 'Tham mưu' }
    ]
  },
  {
    level: 4,
    title: 'BAN GIÁM ĐỐC ĐIỀU HÀNH',
    subtitle: 'Điều hành trực tiếp các khối sản xuất, kinh doanh, logistics & nhân sự',
    headerBg: 'bg-gradient-to-r from-slate-950 via-blue-950 to-slate-900',
    borderClass: 'border-blue-500',
    badgeClass: 'bg-blue-100 text-blue-900 border-blue-300',
    accentText: 'text-blue-300',
    roles: [
      { name: 'Phó Giám Đốc Điều Hành', dept: 'Ban Giám Đốc', desc: 'Quản trị điều hành sản xuất, kinh doanh, chuỗi cung ứng & nhân sự', level: 'Điều hành' }
    ]
  },
  {
    level: 3,
    title: 'CẤP TRƯỞNG PHÒNG & QUẢN LÝ ĐƠN VỊ',
    subtitle: 'Quản lý, điều hành và chịu trách nhiệm trực tiếp từng phòng ban, kho bãi & xưởng sản xuất',
    headerBg: 'bg-gradient-to-r from-indigo-950 via-purple-950 to-slate-900',
    borderClass: 'border-indigo-400',
    badgeClass: 'bg-purple-100 text-purple-900 border-purple-300',
    accentText: 'text-purple-300',
    functionalGroups: [
      {
        groupName: '🏢 KHỐI VĂN PHÒNG & QUẢN TRỊ',
        roles: [
          { name: 'Trưởng Phòng Hành Chính Nhân Sự', dept: 'Phòng HCNS', desc: 'Quản trị nhân sự, tuyển dụng, tiền lương, chính sách & hành chính' },
          { name: 'Trưởng Phòng Kế Toán Doanh Nghiệp', dept: 'Phòng Kế Toán', desc: 'Quản trị tài chính, báo cáo thuế, ngân sách & hạch toán kế toán' },
          { name: 'Trưởng Phòng R&D', dept: 'Phòng R&D', desc: 'Nghiên cứu phát triển sản phẩm nệm gối & cải tiến quy trình' }
        ]
      },
      {
        groupName: '📈 KHỐI KINH DOANH & MARKETING',
        roles: [
          { name: 'Trưởng Phòng Kinh Doanh', dept: 'Phòng Kinh Doanh', desc: 'Chỉ đạo kinh doanh, phát triển hệ thống đại lý & phân phối' },
          { name: 'Trưởng Phòng Marketing', dept: 'Phòng Marketing', desc: 'Phát triển thương hiệu, truyền thông & chiến dịch tiếp thị' }
        ]
      },
      {
        groupName: '🚚 KHỐI KHO VẬN & LOGISTICS',
        roles: [
          { name: 'Quản Lý Kho Cần Thơ', dept: 'Kho Cần Thơ', desc: 'Điều hành tổng kho Cần Thơ, xuất nhập & giao hàng khu vực Cần Thơ' },
          { name: 'Quản Lý Kho Mỹ Tho', dept: 'Kho Mỹ Tho', desc: 'Điều hành tổng kho Mỹ Tho, xuất nhập & vận tải khu vực Mỹ Tho' }
        ]
      },
      {
        groupName: '🏭 KHỐI NHÀ MÁY SẢN XUẤT',
        roles: [
          { name: 'Quản Lý Xưởng Sản Xuất Nệm', dept: 'Xưởng Nệm', desc: 'Điều hành toàn bộ dây chuyền sản xuất nệm, năng suất & chất lượng' },
          { name: 'Quản Lý Xưởng Gối', dept: 'Xưởng Gối', desc: 'Điều hành dây chuyền may gối, thổi gòn & đóng gói thành phẩm' }
        ]
      }
    ]
  },
  {
    level: 2,
    title: 'CẤP PHÓ PHÒNG / PHÓ QUẢN LÝ / TRƯỞNG NHÓM',
    subtitle: 'Hỗ trợ quản lý điều phối tác nghiệp, kiểm soát tiến độ & an toàn bộ phận',
    headerBg: 'bg-gradient-to-r from-teal-950 via-cyan-950 to-slate-900',
    borderClass: 'border-teal-400',
    badgeClass: 'bg-teal-100 text-teal-900 border-teal-300',
    accentText: 'text-teal-300',
    roles: [
      { name: 'Phó Trưởng Phòng / Trưởng Nhóm Kinh Doanh', dept: 'Phòng Kinh Doanh', desc: 'Phụ trách nhóm kinh doanh và phát triển thị trường' },
      { name: 'Phó Trưởng Phòng / Trưởng Nhóm Marketing', dept: 'Phòng Marketing', desc: 'Phụ trách chiến dịch tiếp thị, quảng cáo & thương hiệu' },
      { name: 'Phó Quản Lý Kho Mỹ Tho', dept: 'Kho Mỹ Tho', desc: 'Phụ trách điều phối xuất nhập kho & an toàn vận tải' },
      { name: 'Phó Quản Lý Xưởng Nệm', dept: 'Xưởng Nệm', desc: 'Kiểm soát tiến độ may, dán, keo, đóng gói & an toàn xưởng' },
      { name: 'Trưởng Nhóm Thổi Gối', dept: 'Xưởng Gối', desc: 'Phụ trách trực tiếp dây chuyền thổi gòn định lượng và may hoàn thiện' }
    ]
  },
  {
    level: 1,
    title: 'CẤP CHUYÊN VIÊN, KỸ THUẬT & NHÂN VIÊN THỰC THI',
    subtitle: 'Lực lượng chuyên môn nghiệp vụ, kỹ thuật viên sản xuất, tài xế vận tải và nhân sự tác nghiệp toàn công ty',
    headerBg: 'bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900',
    borderClass: 'border-indigo-400',
    badgeClass: 'bg-indigo-100 text-indigo-900 border-indigo-300',
    accentText: 'text-indigo-300',
    groups: [
      {
        subgroupName: 'Chuyên Viên Cao Cấp / Đội Trưởng (Thâm niên ≥ 3 năm)',
        roles: [
          { name: 'Đội Trưởng Đội Tài Xế', dept: 'Kho Vận', desc: 'Điều phối toàn bộ đội xe tải, lộ trình giao hàng và an toàn vận tải' },
          { name: 'Tài Xế Giao Hàng', dept: 'Kho Cần Thơ / Kho Mỹ Tho', desc: 'Phụ trách các tuyến giao nhận hàng hóa, đại lý và showroom' },
          { name: 'Nhân Viên Kinh Doanh Thâm Niên', dept: 'Phòng Kinh Doanh', desc: 'Chăm sóc hệ thống khách hàng lớn và mạng lưới đại lý chủ lực' },
          { name: 'Kỹ Thuật May Viền Thâm Niên', dept: 'Xưởng Nệm / Gối', desc: 'Thợ may viền, may một kim bậc cao, kèm cặp thợ mới' },
          { name: 'Nhân Viên Giao Hàng Thâm Niên', dept: 'Kho Vận', desc: 'Phụ trách giao nhận các tuyến trọng điểm và quản lý biên bản' }
        ]
      },
      {
        subgroupName: 'Chuyên Viên / Kế Toán / Kỹ Thuật Viên Chính Thức (Thâm niên 1 - 3 năm)',
        roles: [
          { name: 'Chuyên Viên Hành Chính Nhân Sự', dept: 'Phòng HCNS', desc: 'Chấm công, hồ sơ lao động, bảo hiểm và hỗ trợ nhân sự' },
          { name: 'Kế Toán Thu Mua / Công Nợ / Thanh Toán', dept: 'Phòng Kế Toán', desc: 'Theo dõi đơn mua hàng, công nợ khách hàng và chứng từ thu chi' },
          { name: 'Kế Toán Kho / Kế Toán Xưởng', dept: 'Kho & Xưởng', desc: 'Theo dõi nhập xuất tồn nguyên vật liệu và thành phẩm' },
          { name: 'Nhân Viên Kinh Doanh Chính Thức', dept: 'Phòng Kinh Doanh', desc: 'Mở rộng thị trường, phát triển doanh số đại lý' },
          { name: 'Kỹ Thuật May Viền / May Một Kim', dept: 'Xưởng Nệm', desc: 'Vận hành máy may công nghiệp hoàn thiện nệm' },
          { name: 'Kỹ Thuật Phun Keo / Vô Áo / Vô Vali', dept: 'Xưởng Nệm', desc: 'Dán liên kết ruột nệm, lồng áo bảo vệ và đóng vali thành phẩm' },
          { name: 'Kỹ Thuật Cắt Vải / Dán Tem', dept: 'Xưởng Nệm', desc: 'Cắt phôi vải theo rập chuẩn và hoàn thiện nhãn mác' },
          { name: 'Nhân Viên Thổi Gối / May Gối', dept: 'Xưởng Gối', desc: 'Thổi gòn định lượng và may hoàn thiện áo gối' },
          { name: 'Nhân Viên Kho & Thủ Kho', dept: 'Kho Cần Thơ / Mỹ Tho', desc: 'Sắp xếp, bảo quản hàng hóa và bốc dỡ kho bãi' },
          { name: 'Nhân Viên Giao Hàng & Phụ Xe', dept: 'Kho Cần Thơ / Mỹ Tho', desc: 'Giao hàng đến điểm bán và thu nhận phiếu giao nhận' }
        ]
      },
      {
        subgroupName: 'Nhân Viên Mới / Thử Việc / Học Việc (Thâm niên < 1 năm)',
        roles: [
          { name: 'Nhân Viên Thử Việc Văn Phòng', dept: 'Khối Văn Phòng', desc: 'Đang trong thời gian thử việc nghiệp vụ' },
          { name: 'Nhân Viên Thử Việc Kinh Doanh', dept: 'Phòng Kinh Doanh', desc: 'Tiếp cận thị trường và nắm bắt quy trình bán hàng' },
          { name: 'Nhân Viên Học Việc May & Xưởng Nệm', dept: 'Xưởng Sản Xuất', desc: 'Học việc kỹ thuật máy may, cắt vải và phụ việc xưởng' },
          { name: 'Nhân Viên Thử Việc Kho & Giao Hàng', dept: 'Kho Vận', desc: 'Làm quen tuyến đường và quy trình xuất nhập kho' }
        ]
      }
    ]
  }
];

const DeptPosSettingsPage = () => {
  const { user } = useAuth();
  const isAdmin = user?.roleName === 'ADMIN';

  const [activeTab, setActiveTab] = useState('org_chart');
  const [chartViewMode, setChartViewMode] = useState('tree'); // 'tree' or 'summary'
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
  const [roleSearch, setRoleSearch] = useState('');

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

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between space-y-4 md:space-y-0">
        <div>
          <h2 className="text-2xl font-black text-slate-800 tracking-tight flex items-center space-x-2.5">
            <span className="p-2 rounded-xl bg-brand-50 text-brand-700 border border-brand-200">
              <Network size={22} />
            </span>
            <span>Sơ Đồ Tổ Chức</span>
          </h2>
          <p className="text-xs text-slate-500 mt-1 font-medium">
            Sơ đồ cây phân cấp vị trí & chức danh toàn công ty theo hệ thống nhân sự (Thông Báo 18/2026/TB-VA)
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
        <div className="p-2 border-b border-slate-200 bg-slate-50/80 overflow-x-auto custom-scroll-x">
          <div className="flex items-center gap-1.5 min-w-max">
            <button
              type="button"
              onClick={() => setActiveTab('org_chart')}
              className={`px-3.5 sm:px-4 py-2 rounded-xl font-bold text-xs sm:text-sm transition-all flex items-center space-x-2 cursor-pointer shrink-0 ${
                activeTab === 'org_chart'
                  ? 'bg-brand-700 text-white shadow-sm ring-1 ring-brand-600'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200/60'
              }`}
            >
              <Crown size={15} className={activeTab === 'org_chart' ? 'text-amber-300' : 'text-slate-400'} />
              <span>Sơ Đồ Cây Phân Cấp</span>
            </button>
            <button
              type="button"
              onClick={() => setActiveTab('departments')}
              className={`px-3.5 sm:px-4 py-2 rounded-xl font-bold text-xs sm:text-sm transition-all flex items-center space-x-2 cursor-pointer shrink-0 ${
                activeTab === 'departments'
                  ? 'bg-brand-700 text-white shadow-sm ring-1 ring-brand-600'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200/60'
              }`}
            >
              <Layers size={15} className={activeTab === 'departments' ? 'text-white' : 'text-slate-400'} />
              <span>Phòng Ban</span>
              <span className={`text-[11px] px-1.5 py-0.5 rounded-full font-bold ${
                activeTab === 'departments' ? 'bg-white/20 text-white' : 'bg-slate-200 text-slate-700'
              }`}>
                {departments.length}
              </span>
            </button>
            <button
              type="button"
              onClick={() => setActiveTab('positions')}
              className={`px-3.5 sm:px-4 py-2 rounded-xl font-bold text-xs sm:text-sm transition-all flex items-center space-x-2 cursor-pointer shrink-0 ${
                activeTab === 'positions'
                  ? 'bg-brand-700 text-white shadow-sm ring-1 ring-brand-600'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200/60'
              }`}
            >
              <Briefcase size={15} className={activeTab === 'positions' ? 'text-white' : 'text-slate-400'} />
              <span>Chức Vụ</span>
              <span className={`text-[11px] px-1.5 py-0.5 rounded-full font-bold ${
                activeTab === 'positions' ? 'bg-white/20 text-white' : 'bg-slate-200 text-slate-700'
              }`}>
                {positions.length}
              </span>
            </button>
          </div>
        </div>

        {/* Tab 0: Sơ Đồ Cây Phân Cấp Chức Danh (Pure Roles Org Chart) */}
        {activeTab === 'org_chart' && (
          <div className="p-4 sm:p-7 space-y-6 bg-slate-50/50">
            {/* SƠ ĐỒ CÂY PHÂN CẤP CHỨC DANH */}
            <div className="space-y-4">
              {/* CẤP 1: BAN TỔNG GIÁM ĐỐC */}
              <div className="flex flex-col items-center">
                <div className="w-full max-w-lg bg-white rounded-2xl border-2 border-amber-300/80 shadow-md overflow-hidden text-center">
                  <div className="bg-gradient-to-r from-slate-950 via-amber-950 to-slate-900 text-white px-4 py-2.5 text-center flex items-center justify-center space-x-2">
                    <Crown size={18} className="text-amber-400" />
                    <span className="text-sm sm:text-base font-black text-amber-300 tracking-wider uppercase">
                      BAN TỔNG GIÁM ĐỐC
                    </span>
                  </div>
                  <div className="p-3 bg-amber-50/20">
                    <div className="py-3 px-4 bg-white rounded-xl border border-amber-200 shadow-xs hover:border-amber-400 transition">
                      <div className="font-black text-slate-900 text-sm sm:text-base">TỔNG GIÁM ĐỐC</div>
                    </div>
                  </div>
                </div>

                {/* Connector */}
                <div className="flex flex-col items-center my-1">
                  <div className="w-0.5 h-3 bg-slate-300"></div>
                  <div className="w-6 h-6 rounded-full bg-amber-50 border border-amber-300 flex items-center justify-center text-amber-600 shadow-2xs">
                    <ArrowDown size={14} className="stroke-[2.5]" />
                  </div>
                  <div className="w-0.5 h-3 bg-slate-300"></div>
                </div>
              </div>

              {/* CẤP 2: BAN GIÁM ĐỐC ĐIỀU HÀNH */}
              <div className="flex flex-col items-center">
                <div className="w-full max-w-lg bg-white rounded-2xl border-2 border-blue-400/80 shadow-md overflow-hidden text-center">
                  <div className="bg-gradient-to-r from-slate-950 via-blue-950 to-slate-900 text-white px-4 py-2 flex items-center justify-center space-x-2">
                    <ShieldCheck size={18} className="text-blue-300" />
                    <span className="text-sm sm:text-base font-black text-blue-300 uppercase tracking-wider">
                      BAN GIÁM ĐỐC ĐIỀU HÀNH
                    </span>
                  </div>
                  <div className="p-3 bg-blue-50/20">
                    <div className="py-3 px-4 bg-white rounded-xl border border-blue-200 shadow-xs hover:border-blue-400 transition">
                      <div className="font-black text-slate-900 text-sm sm:text-base">PHÓ GIÁM ĐỐC ĐIỀU HÀNH</div>
                    </div>
                  </div>
                </div>

                {/* Connector down to 4 Pillars with Arrows */}
                <div className="flex flex-col items-center w-full">
                  <div className="w-0.5 h-3 bg-slate-300"></div>
                  <div className="w-6 h-6 rounded-full bg-blue-50 border border-blue-300 flex items-center justify-center text-blue-600 shadow-2xs mb-1">
                    <ArrowDown size={14} className="stroke-[2.5]" />
                  </div>
                  <div className="w-full max-w-6xl relative hidden md:block">
                    <div className="h-0.5 bg-slate-300 w-full"></div>
                    <div className="flex justify-between w-full">
                      <div className="flex flex-col items-center -mt-0.5">
                        <div className="w-0.5 h-4 bg-slate-300"></div>
                        <ArrowDown size={14} className="text-slate-500 -mt-1 stroke-[2.5]" />
                      </div>
                      <div className="flex flex-col items-center -mt-0.5">
                        <div className="w-0.5 h-4 bg-slate-300"></div>
                        <ArrowDown size={14} className="text-slate-500 -mt-1 stroke-[2.5]" />
                      </div>
                      <div className="flex flex-col items-center -mt-0.5">
                        <div className="w-0.5 h-4 bg-slate-300"></div>
                        <ArrowDown size={14} className="text-slate-500 -mt-1 stroke-[2.5]" />
                      </div>
                      <div className="flex flex-col items-center -mt-0.5">
                        <div className="w-0.5 h-4 bg-slate-300"></div>
                        <ArrowDown size={14} className="text-slate-500 -mt-1 stroke-[2.5]" />
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* CẤP 3: CẤP TRƯỞNG PHÒNG & QUẢN LÝ ĐƠN VỊ (4 KHỐI) */}
              <div className="space-y-2.5">
                <div className="text-center">
                  <span className="inline-flex items-center space-x-2 bg-purple-50 text-purple-900 border border-purple-200 px-4 py-1 rounded-full text-xs sm:text-sm font-black uppercase shadow-xs">
                    <Crown size={15} className="text-purple-600" />
                    <span>CẤP TRƯỞNG PHÒNG & QUẢN LÝ ĐƠN VỊ</span>
                  </span>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3.5 w-full">
                  {/* Khối 1: Văn Phòng */}
                  <div className="bg-white rounded-2xl border border-blue-200 shadow-xs overflow-hidden flex flex-col hover:shadow-md transition">
                    <div className="bg-gradient-to-r from-blue-700 to-indigo-800 text-white px-3 py-2 text-center">
                      <span className="text-xs sm:text-sm font-black uppercase text-blue-100 flex items-center justify-center space-x-1.5 tracking-wide">
                        <Building2 size={16} />
                        <span>KHỐI VĂN PHÒNG</span>
                      </span>
                    </div>
                    <div className="p-3 space-y-2.5 flex-1 bg-blue-50/20">
                      <div className="p-2.5 bg-white rounded-xl border border-blue-100 shadow-2xs text-xs sm:text-sm font-bold text-slate-800 text-center hover:border-blue-300 transition">
                        Trợ Lý Giám Đốc
                      </div>
                      <div className="p-2.5 bg-white rounded-xl border border-blue-100 shadow-2xs text-xs sm:text-sm font-bold text-slate-800 text-center hover:border-blue-300 transition">
                        Trưởng Phòng Hành Chính Nhân Sự
                      </div>
                      <div className="p-2.5 bg-white rounded-xl border border-blue-100 shadow-2xs text-xs sm:text-sm font-bold text-slate-800 text-center hover:border-blue-300 transition">
                        Trưởng Phòng Kế Toán
                      </div>
                      <div className="p-2.5 bg-white rounded-xl border border-blue-100 shadow-2xs text-xs sm:text-sm font-bold text-slate-800 text-center hover:border-blue-300 transition">
                        Trưởng Phòng R&D
                      </div>
                    </div>
                  </div>

                  {/* Khối 2: Kinh Doanh & Marketing */}
                  <div className="bg-white rounded-2xl border border-amber-200 shadow-xs overflow-hidden flex flex-col hover:shadow-md transition">
                    <div className="bg-gradient-to-r from-amber-600 to-orange-700 text-white px-3 py-2 text-center">
                      <span className="text-xs sm:text-sm font-black uppercase text-amber-100 flex items-center justify-center space-x-1.5 tracking-wide">
                        <Award size={16} />
                        <span>KHỐI KINH DOANH & MARKETING</span>
                      </span>
                    </div>
                    <div className="p-3 space-y-2.5 flex-1 bg-amber-50/20">
                      <div className="p-2.5 bg-white rounded-xl border border-amber-100 shadow-2xs text-xs sm:text-sm font-bold text-slate-800 text-center hover:border-amber-300 transition">
                        Trưởng Phòng Kinh Doanh
                      </div>
                      <div className="p-2.5 bg-white rounded-xl border border-amber-100 shadow-2xs text-xs sm:text-sm font-bold text-slate-800 text-center hover:border-amber-300 transition">
                        Trưởng Phòng Marketing
                      </div>
                    </div>
                  </div>

                  {/* Khối 3: Kho Vận & Logistics */}
                  <div className="bg-white rounded-2xl border border-emerald-200 shadow-xs overflow-hidden flex flex-col hover:shadow-md transition">
                    <div className="bg-gradient-to-r from-emerald-600 to-teal-800 text-white px-3 py-2 text-center">
                      <span className="text-xs sm:text-sm font-black uppercase text-emerald-100 flex items-center justify-center space-x-1.5 tracking-wide">
                        <Truck size={16} />
                        <span>KHỐI KHO VẬN & LOGISTICS</span>
                      </span>
                    </div>
                    <div className="p-3 space-y-2.5 flex-1 bg-emerald-50/20">
                      <div className="p-2.5 bg-white rounded-xl border border-emerald-100 shadow-2xs text-xs sm:text-sm font-bold text-slate-800 text-center hover:border-emerald-300 transition">
                        Quản Lý Kho Cần Thơ
                      </div>
                      <div className="p-2.5 bg-white rounded-xl border border-emerald-100 shadow-2xs text-xs sm:text-sm font-bold text-slate-800 text-center hover:border-emerald-300 transition">
                        Quản Lý Kho Mỹ Tho
                      </div>
                    </div>
                  </div>

                  {/* Khối 4: Nhà Máy Sản Xuất */}
                  <div className="bg-white rounded-2xl border border-purple-200 shadow-xs overflow-hidden flex flex-col hover:shadow-md transition">
                    <div className="bg-gradient-to-r from-purple-700 to-fuchsia-800 text-white px-3 py-2 text-center">
                      <span className="text-xs sm:text-sm font-black uppercase text-purple-100 flex items-center justify-center space-x-1.5 tracking-wide">
                        <Factory size={16} />
                        <span>KHỐI NHÀ MÁY SẢN XUẤT</span>
                      </span>
                    </div>
                    <div className="p-3 space-y-2.5 flex-1 bg-purple-50/20">
                      <div className="p-2.5 bg-white rounded-xl border border-purple-100 shadow-2xs text-xs sm:text-sm font-bold text-slate-800 text-center hover:border-purple-300 transition">
                        Quản Lý Xưởng Sản Xuất Nệm
                      </div>
                      <div className="p-2.5 bg-white rounded-xl border border-purple-100 shadow-2xs text-xs sm:text-sm font-bold text-slate-800 text-center hover:border-purple-300 transition">
                        Quản Lý Xưởng Gối
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Dải nối xuống Cấp Phó with Arrows */}
              <div className="flex flex-col items-center my-2">
                <div className="w-0.5 h-3 bg-slate-300"></div>
                <span className="px-4 py-1 rounded-full bg-teal-50 border border-teal-200 text-teal-900 text-xs sm:text-sm font-black flex items-center space-x-1.5 shadow-2xs">
                  <ArrowDown size={14} className="stroke-[2.5] text-teal-600" />
                  <span>CẤP PHÓ PHÒNG & PHÓ QUẢN LÝ / TRƯỞNG NHÓM</span>
                </span>
                <div className="w-0.5 h-3 bg-slate-300"></div>
                <div className="w-full max-w-4xl relative hidden md:block mb-1">
                  <div className="h-0.5 bg-teal-300 w-full"></div>
                  <div className="flex justify-between w-full">
                    <div className="flex flex-col items-center -mt-0.5">
                      <div className="w-0.5 h-3 bg-teal-300"></div>
                      <ArrowDown size={13} className="text-teal-600 -mt-1 stroke-[2.5]" />
                    </div>
                    <div className="flex flex-col items-center -mt-0.5">
                      <div className="w-0.5 h-3 bg-teal-300"></div>
                      <ArrowDown size={13} className="text-teal-600 -mt-1 stroke-[2.5]" />
                    </div>
                    <div className="flex flex-col items-center -mt-0.5">
                      <div className="w-0.5 h-3 bg-teal-300"></div>
                      <ArrowDown size={13} className="text-teal-600 -mt-1 stroke-[2.5]" />
                    </div>
                  </div>
                </div>
              </div>

              {/* CẤP 4: CẤP PHÓ PHÒNG / PHÓ QUẢN LÝ / TRƯỞNG NHÓM */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-3.5 max-w-5xl mx-auto w-full">
                <div className="p-3 bg-white rounded-2xl border border-teal-200 shadow-xs text-center hover:border-teal-400 transition">
                  <span className="text-xs font-bold text-teal-700 bg-teal-50 px-2 py-0.5 rounded-md inline-block mb-1.5">KD & MKT</span>
                  <div className="font-bold text-slate-800 text-xs sm:text-sm">Phó TP / Trưởng Nhóm KD & MKT</div>
                </div>
                <div className="p-3 bg-white rounded-2xl border border-teal-200 shadow-xs text-center hover:border-teal-400 transition">
                  <span className="text-xs font-bold text-teal-700 bg-teal-50 px-2 py-0.5 rounded-md inline-block mb-1.5">Kho Vận</span>
                  <div className="font-bold text-slate-800 text-xs sm:text-sm">Phó Quản Lý Kho Mỹ Tho</div>
                </div>
                <div className="p-3 bg-white rounded-2xl border border-teal-200 shadow-xs text-center hover:border-teal-400 transition">
                  <span className="text-xs font-bold text-teal-700 bg-teal-50 px-2 py-0.5 rounded-md inline-block mb-1.5">Sản Xuất</span>
                  <div className="font-bold text-slate-800 text-xs sm:text-sm">Phó QL Xưởng Nệm / TN Gối</div>
                </div>
              </div>

              {/* Dải nối xuống Cấp Chuyên Viên & Thực Thi with Arrows */}
              <div className="flex flex-col items-center my-2">
                <div className="w-0.5 h-3 bg-slate-300"></div>
                <span className="px-4 py-1 rounded-full bg-indigo-50 border border-indigo-200 text-indigo-900 text-xs sm:text-sm font-black flex items-center space-x-1.5 shadow-2xs">
                  <ArrowDown size={14} className="stroke-[2.5] text-indigo-600" />
                  <span>CẤP CHUYÊN VIÊN, KỸ THUẬT & NHÂN VIÊN THỰC THI</span>
                </span>
                <div className="w-0.5 h-3 bg-slate-300"></div>
                <div className="w-full max-w-5xl relative hidden md:block mb-1">
                  <div className="h-0.5 bg-indigo-300 w-full"></div>
                  <div className="flex justify-between w-full">
                    <div className="flex flex-col items-center -mt-0.5">
                      <div className="w-0.5 h-3 bg-indigo-300"></div>
                      <ArrowDown size={13} className="text-indigo-600 -mt-1 stroke-[2.5]" />
                    </div>
                    <div className="flex flex-col items-center -mt-0.5">
                      <div className="w-0.5 h-3 bg-indigo-300"></div>
                      <ArrowDown size={13} className="text-indigo-600 -mt-1 stroke-[2.5]" />
                    </div>
                    <div className="flex flex-col items-center -mt-0.5">
                      <div className="w-0.5 h-3 bg-indigo-300"></div>
                      <ArrowDown size={13} className="text-indigo-600 -mt-1 stroke-[2.5]" />
                    </div>
                  </div>
                </div>
              </div>

              {/* CẤP 5: CẤP CHUYÊN VIÊN, KỸ THUẬT & NHÂN VIÊN THỰC THI */}
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
                {/* Cột 1: Chuyên Viên Cao Cấp / Đội Trưởng */}
                <div className="bg-white rounded-2xl border border-emerald-200 shadow-xs overflow-hidden flex flex-col hover:shadow-md transition">
                  <div className="bg-gradient-to-r from-emerald-800 to-teal-900 text-white px-3.5 py-2.5 flex items-center space-x-2">
                    <Award size={16} className="text-emerald-300 shrink-0" />
                    <span className="text-xs sm:text-sm font-black text-emerald-200">
                      Chuyên Viên Cao Cấp / Đội Trưởng (≥ 3 năm)
                    </span>
                  </div>
                  <div className="p-3 space-y-2 flex-1 bg-emerald-50/10">
                    <div className="p-2.5 bg-white rounded-xl border border-slate-200 text-xs sm:text-sm font-bold text-slate-800 flex justify-between items-center hover:border-emerald-300 transition">
                      <span>Đội Trưởng Đội Tài Xế</span>
                      <span className="text-xs font-semibold text-slate-400 bg-slate-50 px-2 py-0.5 rounded">Kho Vận</span>
                    </div>
                    <div className="p-2.5 bg-white rounded-xl border border-slate-200 text-xs sm:text-sm font-bold text-slate-800 flex justify-between items-center hover:border-emerald-300 transition">
                      <span>Tài Xế Giao Hàng</span>
                      <span className="text-xs font-semibold text-slate-400 bg-slate-50 px-2 py-0.5 rounded">Kho Vận</span>
                    </div>
                    <div className="p-2.5 bg-white rounded-xl border border-slate-200 text-xs sm:text-sm font-bold text-slate-800 flex justify-between items-center hover:border-emerald-300 transition">
                      <span>Nhân Viên Kinh Doanh Thâm Niên</span>
                      <span className="text-xs font-semibold text-slate-400 bg-slate-50 px-2 py-0.5 rounded">Kinh Doanh</span>
                    </div>
                    <div className="p-2.5 bg-white rounded-xl border border-slate-200 text-xs sm:text-sm font-bold text-slate-800 flex justify-between items-center hover:border-emerald-300 transition">
                      <span>Nhân Viên Giao Hàng Thâm Niên</span>
                      <span className="text-xs font-semibold text-slate-400 bg-slate-50 px-2 py-0.5 rounded">Kho Vận</span>
                    </div>
                    <div className="p-2.5 bg-white rounded-xl border border-slate-200 text-xs sm:text-sm font-bold text-slate-800 flex justify-between items-center hover:border-emerald-300 transition">
                      <span>Kỹ Thuật May Viền Thâm Niên</span>
                      <span className="text-xs font-semibold text-slate-400 bg-slate-50 px-2 py-0.5 rounded">Xưởng SX</span>
                    </div>
                  </div>
                </div>

                {/* Cột 2: Chuyên Viên & Kỹ Thuật Chính Thức */}
                <div className="bg-white rounded-2xl border border-sky-200 shadow-xs overflow-hidden flex flex-col hover:shadow-md transition">
                  <div className="bg-gradient-to-r from-sky-800 to-blue-900 text-white px-3.5 py-2.5 flex items-center space-x-2">
                    <Briefcase size={16} className="text-sky-300 shrink-0" />
                    <span className="text-xs sm:text-sm font-black text-sky-200">
                      Chuyên Viên / Kỹ Thuật Chính Thức (1 - 3 năm)
                    </span>
                  </div>
                  <div className="p-3 grid grid-cols-1 sm:grid-cols-2 gap-2 flex-1 bg-sky-50/10">
                    <div className="p-2 bg-white rounded-xl border border-slate-200 text-xs sm:text-sm font-bold text-slate-800 hover:border-sky-300 transition">
                      Chuyên Viên HCNS
                    </div>
                    <div className="p-2 bg-white rounded-xl border border-slate-200 text-xs sm:text-sm font-bold text-slate-800 hover:border-sky-300 transition">
                      Kế Toán Mua Hàng / Công Nợ
                    </div>
                    <div className="p-2 bg-white rounded-xl border border-slate-200 text-xs sm:text-sm font-bold text-slate-800 hover:border-sky-300 transition">
                      Kế Toán Kho & Kế Toán Xưởng
                    </div>
                    <div className="p-2 bg-white rounded-xl border border-slate-200 text-xs sm:text-sm font-bold text-slate-800 hover:border-sky-300 transition">
                      NV Kinh Doanh Chính Thức
                    </div>
                    <div className="p-2 bg-white rounded-xl border border-slate-200 text-xs sm:text-sm font-bold text-slate-800 hover:border-sky-300 transition">
                      Kỹ Thuật May Viền / 1 Kim
                    </div>
                    <div className="p-2 bg-white rounded-xl border border-slate-200 text-xs sm:text-sm font-bold text-slate-800 hover:border-sky-300 transition">
                      Kỹ Thuật Phun Keo / Dán Nệm
                    </div>
                    <div className="p-2 bg-white rounded-xl border border-slate-200 text-xs sm:text-sm font-bold text-slate-800 hover:border-sky-300 transition">
                      Kỹ Thuật Cắt Vải / Dán Tem
                    </div>
                    <div className="p-2 bg-white rounded-xl border border-slate-200 text-xs sm:text-sm font-bold text-slate-800 hover:border-sky-300 transition">
                      Kỹ Thuật Vô Áo / Vali Nệm
                    </div>
                    <div className="p-2 bg-white rounded-xl border border-slate-200 text-xs sm:text-sm font-bold text-slate-800 hover:border-sky-300 transition">
                      NV Thổi Gòn & May Gối
                    </div>
                    <div className="p-2 bg-white rounded-xl border border-slate-200 text-xs sm:text-sm font-bold text-slate-800 hover:border-sky-300 transition">
                      NV Kho & Bốc Xếp
                    </div>
                    <div className="p-2 bg-white rounded-xl border border-slate-200 text-xs sm:text-sm font-bold text-slate-800 sm:col-span-2 text-center hover:border-sky-300 transition">
                      Nhân Viên Giao Hàng & Phụ Xe
                    </div>
                  </div>
                </div>

                {/* Cột 3: Nhân Viên Mới / Thử Việc */}
                <div className="bg-white rounded-2xl border border-slate-300 shadow-xs overflow-hidden flex flex-col hover:shadow-md transition">
                  <div className="bg-gradient-to-r from-slate-800 to-zinc-900 text-white px-3.5 py-2.5 flex items-center space-x-2">
                    <Users size={16} className="text-slate-300 shrink-0" />
                    <span className="text-xs sm:text-sm font-black text-slate-200">
                      Nhân Viên Mới / Thử Việc (&lt; 1 năm)
                    </span>
                  </div>
                  <div className="p-3 space-y-2 flex-1 bg-slate-50/20">
                    <div className="p-2.5 bg-white rounded-xl border border-slate-200 text-xs sm:text-sm font-bold text-slate-800 hover:border-slate-400 transition">
                      Nhân Viên Thử Việc Văn Phòng
                    </div>
                    <div className="p-2.5 bg-white rounded-xl border border-slate-200 text-xs sm:text-sm font-bold text-slate-800 hover:border-slate-400 transition">
                      Nhân Viên Thử Việc Kinh Doanh
                    </div>
                    <div className="p-2.5 bg-white rounded-xl border border-slate-200 text-xs sm:text-sm font-bold text-slate-800 hover:border-slate-400 transition">
                      Nhân Viên Học Việc May & Xưởng Nệm
                    </div>
                    <div className="p-2.5 bg-white rounded-xl border border-slate-200 text-xs sm:text-sm font-bold text-slate-800 hover:border-slate-400 transition">
                      Nhân Viên Thử Việc Kho & Giao Hàng
                    </div>
                  </div>
                </div>
              </div>
            </div>
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
                className="text-slate-300 hover:text-white p-1 rounded-lg hover:bg-white/10 transition cursor-pointer"
                title="Đóng modal"
              >
                <XCircle size={24} />
              </button>
            </div>

            {/* Filter */}
            <div className="p-3.5 bg-slate-50 border-b border-slate-200 flex flex-col sm:flex-row justify-between items-center gap-3 shrink-0">
              <div className="flex items-center space-x-2 max-w-md w-full bg-white border border-slate-200 rounded-xl px-3 py-1.5 shadow-sm">
                <Search size={15} className="text-slate-400" />
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

            {/* Table */}
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
                            <div className="font-bold text-slate-800 text-sm">{emp.fullname}</div>
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
                          </td>
                          <td className="px-4 py-3 text-center whitespace-nowrap">
                            <span className={`px-2.5 py-1 rounded-full text-[11px] font-bold inline-block whitespace-nowrap ${
                              emp.status === 'Đang làm việc'
                                ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                                : 'bg-slate-100 text-slate-500 border border-slate-200'
                            }`}>
                              {emp.status}
                            </span>
                          </td>
                          <td className="px-5 py-3 text-right text-slate-600 font-medium whitespace-nowrap">
                            {emp.join_date || '-'}
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
                className="px-6 py-2 bg-slate-200 hover:bg-slate-300 text-slate-800 rounded-xl text-xs font-bold transition shadow-sm cursor-pointer"
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
