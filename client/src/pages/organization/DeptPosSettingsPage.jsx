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
  ArrowDown
} from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';

// Cấu hình 7 Tầng Chức Danh chuẩn Thông Báo 18 (Không hiển thị tên người, chỉ hiển thị chức danh)
const TIER_TITLE_CONFIGS = [
  {
    tier: 'Tầng 7',
    tierNumber: 7,
    title: 'TẦNG 7: BAN TỔNG GIÁM ĐỐC & TRỢ LÝ CẤP CAO',
    subtitle: 'Cấp hoạch định chiến lược vĩ mô & điều hành tối cao',
    salary: '9.500.000 đ',
    kpiQuota: 'Theo quy định BGD / Thỏa thuận',
    headerBg: 'bg-gradient-to-r from-slate-950 via-amber-950 to-slate-900',
    borderClass: 'border-amber-400',
    badgeClass: 'bg-amber-100 text-amber-900 border-amber-300',
    accentText: 'text-amber-300',
    roles: [
      { name: 'Tổng Giám Đốc', dept: 'Ban Giám Đốc', desc: 'Định hướng chiến lược, quyết định tối cao toàn công ty', level: 'Tối cao' },
      { name: 'Trợ Lý Giám Đốc', dept: 'Khối Văn Phòng', desc: 'Tham mưu chiến lược, ban cố vấn & hỗ trợ điều hành', level: 'Tham mưu cấp cao' }
    ]
  },
  {
    tier: 'Tầng 6',
    tierNumber: 6,
    title: 'TẦNG 6: BAN GIÁM ĐỐC ĐIỀU HÀNH',
    subtitle: 'Cấp điều hành trực tiếp toàn bộ chuỗi sản xuất, kinh doanh, logistics & nhân sự',
    salary: '8.000.000 đ',
    kpiQuota: '2.500.000 đ/tháng',
    headerBg: 'bg-gradient-to-r from-slate-950 via-blue-950 to-slate-900',
    borderClass: 'border-blue-500',
    badgeClass: 'bg-blue-100 text-blue-900 border-blue-300',
    accentText: 'text-blue-300',
    roles: [
      { name: 'Phó Giám Đốc Điều Hành', dept: 'Ban Giám Đốc', desc: 'Quản trị điều hành sản xuất, kinh doanh, chuỗi cung ứng & nhân sự', level: 'Điều hành' }
    ]
  },
  {
    tier: 'Tầng 5',
    tierNumber: 5,
    title: 'TẦNG 5: CẤP TRƯỞNG PHÒNG & QUẢN LÝ ĐƠN VỊ',
    subtitle: 'Quản lý, điều hành và chịu trách nhiệm KPI trực tiếp từng phòng ban, kho bãi & xưởng sản xuất',
    salary: '6.500.000 đ',
    kpiQuota: '2.000.000 đ/tháng',
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
          { name: 'Quản Lý Kho Mỹ Tho', dept: 'Kho Mỹ Tho', desc: 'Điều hành tổng kho Mỹ Tho, xuất nhập & vận tải khu vực Mỹ Tho' },
          { name: 'Phó Quản Lý Kho Mỹ Tho', dept: 'Kho Mỹ Tho', desc: 'Hỗ trợ điều phối xuất nhập kho & quản lý vận tải' }
        ]
      },
      {
        groupName: '🏭 KHỐI NHÀ MÁY SẢN XUẤT',
        roles: [
          { name: 'Quản Lý Xưởng Sản Xuất Nệm', dept: 'Xưởng Nệm', desc: 'Điều hành toàn bộ dây chuyền sản xuất nệm, năng suất & chất lượng' },
          { name: 'Phó Quản Lý Xưởng Nệm', dept: 'Xưởng Nệm', desc: 'Hỗ trợ kiểm soát tiến độ sản xuất, kỹ thuật máy & an toàn xưởng' },
          { name: 'Quản Lý Xưởng Gối / Trưởng Nhóm Thổi Gối', dept: 'Xưởng Gối', desc: 'Phụ trách dây chuyền may gối, thổi gối & đóng gói thành phẩm' }
        ]
      }
    ]
  },
  {
    tier: 'Tầng 4',
    tierNumber: 4,
    title: 'TẦNG 4: CẤP PHÓ PHÒNG / TRƯỞNG NHÓM / CHUYÊN VIÊN CHIẾN LƯỢC',
    subtitle: 'Tham mưu chuyên môn nghiệp vụ trọng yếu và phối hợp điều phối tác nghiệp',
    salary: '6.000.000 đ',
    kpiQuota: '1.500.000 đ/tháng',
    headerBg: 'bg-gradient-to-r from-teal-950 via-cyan-950 to-slate-900',
    borderClass: 'border-teal-400',
    badgeClass: 'bg-teal-100 text-teal-900 border-teal-300',
    accentText: 'text-teal-300',
    roles: [
      { name: 'Phó Trưởng Phòng Chuyên Môn', dept: 'Khối Văn Phòng', desc: 'Hỗ trợ quản lý điều phối nghiệp vụ phòng ban' },
      { name: 'Trưởng Nhóm Nghiệp Vụ Chuyên Sâu', dept: 'Khối Kỹ Thuật / Kinh Doanh', desc: 'Phụ trách nhóm dự án hoặc tuyến trọng điểm' },
      { name: 'Chuyên Viên Chiến Lược', dept: 'Khối Ban Giám Đốc', desc: 'Nghiên cứu thị trường và phân tích chiến lược' }
    ]
  },
  {
    tier: 'Tầng 3',
    tierNumber: 3,
    title: 'TẦNG 3: CHUYÊN VIÊN CAO CẤP / ĐỘI TRƯỞNG (THÂM NIÊN ≥ 3 NĂM)',
    subtitle: 'Nhân sự nòng cốt có thâm niên vững vàng, phụ trách các tuyến xe tải & kinh doanh trọng điểm',
    salary: '5.500.000 đ',
    kpiQuota: '1.000.000 đ/tháng',
    headerBg: 'bg-gradient-to-r from-emerald-950 via-teal-950 to-slate-900',
    borderClass: 'border-emerald-500',
    badgeClass: 'bg-emerald-100 text-emerald-900 border-emerald-300',
    accentText: 'text-emerald-300',
    roles: [
      { name: 'Đội Trưởng Đội Tài Xế', dept: 'Kho Vận', desc: 'Điều phối toàn bộ đội xe tải, lộ trình giao hàng và an toàn vận tải' },
      { name: 'Tài Xế Xe Tải Cấp Cao (≥ 3 năm)', dept: 'Kho Cần Thơ / Kho Mỹ Tho', desc: 'Phụ trách các tuyến đường dài, giao hàng đại lý liên tỉnh' },
      { name: 'Nhân Viên Kinh Doanh Thâm Niên', dept: 'Phòng Kinh Doanh', desc: 'Chăm sóc hệ thống khách hàng lớn và mạng lưới đại lý chủ lực' },
      { name: 'Kỹ Thuật Viên / May Viền Thâm Niên', dept: 'Xưởng Nệm / Gối', desc: 'Thợ may viền, may một kim bậc cao, kèm cặp thợ mới' },
      { name: 'Nhân Viên Giao Hàng Kỳ Cựu', dept: 'Kho Vận', desc: 'Phụ trách giao nhận các tuyến trọng điểm và quản lý biên bản' }
    ]
  },
  {
    tier: 'Tầng 2',
    tierNumber: 2,
    title: 'TẦNG 2: CHUYÊN VIÊN / KẾ TOÁN / KỸ THUẬT VIÊN (THÂM NIÊN 1 - 3 NĂM)',
    subtitle: 'Nhân sự chính thức hoàn thành công việc độc lập, đảm bảo tiến độ và định mức định kỳ',
    salary: '5.000.000 đ',
    kpiQuota: '1.000.000 đ/tháng',
    headerBg: 'bg-gradient-to-r from-sky-950 via-blue-950 to-slate-900',
    borderClass: 'border-sky-400',
    badgeClass: 'bg-sky-100 text-sky-900 border-sky-300',
    accentText: 'text-sky-300',
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
    tier: 'Tầng 1',
    tierNumber: 1,
    title: 'TẦNG 1: NHÂN VIÊN MỚI / THỬ VIỆC (THÂM NIÊN < 1 NĂM)',
    subtitle: 'Nhân sự mới tiếp nhận, học việc đang trong giai đoạn đào tạo và hòa nhập công ty',
    salary: '4.500.000 đ',
    kpiQuota: '1.000.000 đ/tháng',
    headerBg: 'bg-gradient-to-r from-slate-800 via-slate-900 to-zinc-900',
    borderClass: 'border-slate-400',
    badgeClass: 'bg-slate-100 text-slate-800 border-slate-300',
    accentText: 'text-slate-300',
    roles: [
      { name: 'Nhân Viên Mới Tuyển Dụng / Thử Việc', dept: 'Tất cả khối', desc: 'Đang trong thời gian đào tạo chuyên môn và thử việc' },
      { name: 'Nhân Viên Học Việc May & Xưởng', dept: 'Xưởng Sản Xuất', desc: 'Học việc kỹ thuật máy may, cắt vải và phụ việc xưởng' },
      { name: 'Nhân Viên Thử Việc Kinh Doanh', dept: 'Phòng Kinh Doanh', desc: 'Tiếp cận thị trường và nắm bắt quy trình bán hàng' },
      { name: 'Nhân Viên Thử Việc Kho & Giao Hàng', dept: 'Kho Vận', desc: 'Làm quen tuyến đường và quy trình xuất nhập kho' }
    ]
  }
];

const DeptPosSettingsPage = () => {
  const { user } = useAuth();
  const isAdmin = user?.roleName === 'ADMIN';

  const [activeTab, setActiveTab] = useState('org_chart');
  const [chartViewMode, setChartViewMode] = useState('tree'); // 'tree' (sơ đồ cây) or 'matrix' (dạng bảng)
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
  const [selectedTierFilter, setSelectedTierFilter] = useState('');

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
            <span>Sơ Đồ Tổ Chức & 7 Tầng Chức Danh</span>
          </h2>
          <p className="text-xs text-slate-500 mt-1 font-medium">
            Sơ đồ cây phân cấp vị trí & chức danh toàn công ty theo 7 tầng nhân sự (Thông Báo 18/2026/TB-VA)
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
            <span>Sơ Đồ Cây 7 Tầng Chức Danh</span>
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

        {/* Tab 0: Sơ Đồ Cây 7 Tầng Chức Danh (Pure Roles Org Chart) */}
        {activeTab === 'org_chart' && (
          <div className="p-4 sm:p-6 space-y-6 bg-slate-50/40">
            {/* Top Toolbar */}
            <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm flex flex-col md:flex-row items-center justify-between gap-4">
              <div className="flex items-center space-x-2">
                <div className="p-2 bg-amber-50 rounded-xl text-amber-700 border border-amber-200">
                  <Crown size={20} />
                </div>
                <div>
                  <h3 className="text-sm font-black text-slate-800 uppercase tracking-wide">
                    Sơ Đồ Phân Cấp Chức Danh & Vị Trí Công Tác (TB18)
                  </h3>
                  <p className="text-[11px] text-slate-500">
                    Phân định rõ 7 tầng trách nhiệm, mức lương tầng cơ sở và định mức KPI
                  </p>
                </div>
              </div>

              {/* View mode toggle & search */}
              <div className="flex flex-wrap items-center gap-3 w-full md:w-auto">
                <div className="flex items-center space-x-2 bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs flex-1 sm:w-60">
                  <Search size={15} className="text-slate-400 shrink-0" />
                  <input
                    type="text"
                    placeholder="Tìm chức danh, vị trí..."
                    value={roleSearch}
                    onChange={(e) => setRoleSearch(e.target.value)}
                    className="bg-transparent outline-none w-full text-slate-700 font-medium"
                  />
                  {roleSearch && (
                    <button onClick={() => setRoleSearch('')} className="text-slate-400 hover:text-slate-600">
                      <XCircle size={14} />
                    </button>
                  )}
                </div>

                <div className="inline-flex p-1 bg-slate-100 rounded-xl border border-slate-200/80">
                  <button
                    onClick={() => setChartViewMode('tree')}
                    className={`px-3.5 py-1.5 rounded-lg text-xs font-black transition-all flex items-center space-x-1.5 ${
                      chartViewMode === 'tree'
                        ? 'bg-brand-700 text-white shadow-sm'
                        : 'text-slate-600 hover:text-slate-900'
                    }`}
                  >
                    <Network size={14} />
                    <span>Sơ Đồ Cây Khối</span>
                  </button>
                  <button
                    onClick={() => setChartViewMode('matrix')}
                    className={`px-3.5 py-1.5 rounded-lg text-xs font-black transition-all flex items-center space-x-1.5 ${
                      chartViewMode === 'matrix'
                        ? 'bg-brand-700 text-white shadow-sm'
                        : 'text-slate-600 hover:text-slate-900'
                    }`}
                  >
                    <Layers size={14} />
                    <span>Ma Trận 7 Tầng</span>
                  </button>
                </div>
              </div>
            </div>

            {/* SƠ ĐỒ CÂY 7 TẦNG CHỨC DANH (TREE DIAGRAM VIEW) */}
            <div className="space-y-6">
              {/* TẦNG 7: BAN TỔNG GIÁM ĐỐC & TRỢ LÝ CẤP CAO */}
              <div className="flex flex-col items-center">
                <div className="w-full max-w-3xl bg-white rounded-2xl border-2 border-amber-400 shadow-lg overflow-hidden">
                  <div className="bg-gradient-to-r from-slate-950 via-amber-950 to-slate-900 text-white p-4 text-center">
                    <div className="inline-flex items-center space-x-1.5 bg-amber-400/20 border border-amber-400/40 px-3 py-0.5 rounded-full text-[11px] font-black uppercase tracking-wider text-amber-300 mb-1">
                      <Crown size={12} />
                      <span>TẦNG 7 • BAN ĐIỀU HÀNH & LÃNH ĐẠO TỐI CAO</span>
                    </div>
                    <h3 className="text-base sm:text-lg font-black text-amber-300">
                      BAN TỔNG GIÁM ĐỐC CÔNG TY TNHH TM SX NỆM VIỆT Á
                    </h3>
                    <div className="flex items-center justify-center space-x-4 mt-2 text-xs text-slate-300">
                      <span>Lương tầng: <strong className="text-amber-300 font-mono">9.500.000 đ</strong></span>
                      <span>•</span>
                      <span>Định mức KPI: <strong className="text-emerald-300">Quy định BGD</strong></span>
                    </div>
                  </div>

                  <div className="p-4 bg-amber-50/30 grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div className="p-3.5 bg-white rounded-xl border border-amber-200 shadow-sm text-center space-y-1">
                      <div className="inline-block p-2 rounded-xl bg-amber-100 text-amber-900 font-black mb-1">
                        <Sparkles size={20} />
                      </div>
                      <h4 className="font-black text-slate-900 text-sm">TỔNG GIÁM ĐỐC</h4>
                      <p className="text-[11px] text-slate-500">Hoạch định chiến lược tối cao, phê duyệt toàn bộ quy chế & ngân sách</p>
                    </div>

                    <div className="p-3.5 bg-white rounded-xl border border-amber-200 shadow-sm text-center space-y-1">
                      <div className="inline-block p-2 rounded-xl bg-amber-100 text-amber-900 font-black mb-1">
                        <ShieldCheck size={20} />
                      </div>
                      <h4 className="font-black text-slate-900 text-sm">TRỢ LÝ GIÁM ĐỐC</h4>
                      <p className="text-[11px] text-slate-500">Tham mưu chiến lược, ban cố vấn & hỗ trợ điều hành toàn diện</p>
                    </div>
                  </div>
                </div>

                {/* Vertical Tree Connector */}
                <div className="w-0.5 h-6 bg-slate-300"></div>
                <div className="w-2.5 h-2.5 rounded-full bg-brand-600"></div>
                <div className="w-0.5 h-6 bg-slate-300"></div>
              </div>

              {/* TẦNG 6: BAN GIÁM ĐỐC ĐIỀU HÀNH */}
              <div className="flex flex-col items-center">
                <div className="w-full max-w-2xl bg-white rounded-2xl border-2 border-blue-500 shadow-md overflow-hidden">
                  <div className="bg-gradient-to-r from-slate-950 via-blue-950 to-slate-900 text-white p-3.5 text-center">
                    <div className="inline-flex items-center space-x-1.5 bg-blue-400/20 border border-blue-400/40 px-3 py-0.5 rounded-full text-[11px] font-black uppercase tracking-wider text-blue-300 mb-1">
                      <ShieldCheck size={12} />
                      <span>TẦNG 6 • BAN GIÁM ĐỐC ĐIỀU HÀNH</span>
                    </div>
                    <div className="flex items-center justify-center space-x-4 text-xs text-slate-300 mt-1">
                      <span>Lương tầng: <strong className="text-amber-300 font-mono">8.000.000 đ</strong></span>
                      <span>•</span>
                      <span>KPI Trách nhiệm: <strong className="text-emerald-300 font-mono">2.500.000 đ/tháng</strong></span>
                    </div>
                  </div>

                  <div className="p-4 bg-blue-50/30 text-center">
                    <div className="p-3.5 bg-white rounded-xl border border-blue-200 shadow-sm max-w-md mx-auto space-y-1">
                      <div className="inline-block p-2 rounded-xl bg-blue-100 text-blue-900 font-black mb-1">
                        <Building2 size={20} />
                      </div>
                      <h4 className="font-black text-slate-900 text-sm">PHÓ GIÁM ĐỐC ĐIỀU HÀNH</h4>
                      <p className="text-[11px] text-slate-500">
                        Chỉ đạo và điều hành trực tiếp 4 Khối: Văn phòng, Kinh doanh, Kho vận & Nhà máy sản xuất
                      </p>
                    </div>
                  </div>
                </div>

                {/* Connecting lines down to 4 Functional Pillars */}
                <div className="w-0.5 h-6 bg-slate-300"></div>
                <div className="w-full max-w-6xl relative hidden md:block">
                  <div className="h-0.5 bg-slate-300 w-full"></div>
                  <div className="flex justify-between w-full">
                    <div className="w-0.5 h-6 bg-slate-300"></div>
                    <div className="w-0.5 h-6 bg-slate-300"></div>
                    <div className="w-0.5 h-6 bg-slate-300"></div>
                    <div className="w-0.5 h-6 bg-slate-300"></div>
                  </div>
                </div>
              </div>

              {/* TẦNG 5: CẤP TRƯỞNG PHÒNG & QUẢN LÝ ĐƠN VỊ (4 KHỐI CHỨC NĂNG) */}
              <div className="space-y-3">
                <div className="text-center">
                  <span className="inline-flex items-center space-x-2 bg-purple-100 text-purple-900 border border-purple-300 px-4 py-1 rounded-full text-xs font-black uppercase tracking-wider shadow-sm">
                    <Crown size={14} />
                    <span>TẦNG 5: CẤP TRƯỞNG PHÒNG & QUẢN LÝ ĐƠN VỊ • LƯƠNG: 6.500.000 Đ • KPI TN: 2.000.000 Đ</span>
                  </span>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 w-full">
                  {/* Nhánh 1: Khối Văn Phòng & Quản Trị */}
                  <div className="bg-white rounded-2xl border-2 border-blue-200 shadow-md overflow-hidden flex flex-col">
                    <div className="bg-gradient-to-r from-blue-700 to-indigo-800 text-white p-3.5 text-center">
                      <div className="flex items-center justify-center space-x-1.5 text-xs font-black text-blue-200 uppercase">
                        <Building2 size={16} />
                        <span>KHỐI VĂN PHÒNG & QUẢN TRỊ</span>
                      </div>
                    </div>
                    <div className="p-3.5 space-y-2.5 flex-1 bg-blue-50/20">
                      <div className="p-3 bg-white rounded-xl border border-blue-200 shadow-sm space-y-1">
                        <span className="text-[10px] font-bold text-blue-800 bg-blue-50 px-2 py-0.5 rounded">Tầng 5</span>
                        <h5 className="font-bold text-slate-800 text-xs">Trưởng Phòng Hành Chính Nhân Sự</h5>
                        <p className="text-[10px] text-slate-500">Quản trị nhân sự, tiền lương, chính sách & hành chính</p>
                      </div>

                      <div className="p-3 bg-white rounded-xl border border-slate-200 shadow-sm space-y-1">
                        <span className="text-[10px] font-bold text-slate-700 bg-slate-100 px-2 py-0.5 rounded">Tầng 5</span>
                        <h5 className="font-bold text-slate-800 text-xs">Trưởng Phòng Kế Toán Doanh Nghiệp</h5>
                        <p className="text-[10px] text-slate-500">Tài chính, thuế, ngân sách & hạch toán</p>
                      </div>

                      <div className="p-3 bg-white rounded-xl border border-slate-200 shadow-sm space-y-1">
                        <span className="text-[10px] font-bold text-slate-700 bg-slate-100 px-2 py-0.5 rounded">Tầng 5</span>
                        <h5 className="font-bold text-slate-800 text-xs">Trưởng Phòng R&D</h5>
                        <p className="text-[10px] text-slate-500">Nghiên cứu & phát triển sản phẩm nệm gối</p>
                      </div>
                    </div>
                  </div>

                  {/* Nhánh 2: Khối Kinh Doanh & Marketing */}
                  <div className="bg-white rounded-2xl border-2 border-amber-200 shadow-md overflow-hidden flex flex-col">
                    <div className="bg-gradient-to-r from-amber-600 to-orange-700 text-white p-3.5 text-center">
                      <div className="flex items-center justify-center space-x-1.5 text-xs font-black text-amber-200 uppercase">
                        <Award size={16} />
                        <span>KHỐI KINH DOANH & MARKETING</span>
                      </div>
                    </div>
                    <div className="p-3.5 space-y-2.5 flex-1 bg-amber-50/20">
                      <div className="p-3 bg-white rounded-xl border border-amber-200 shadow-sm space-y-1">
                        <span className="text-[10px] font-bold text-amber-800 bg-amber-50 px-2 py-0.5 rounded">Tầng 5</span>
                        <h5 className="font-bold text-slate-800 text-xs">Trưởng Phòng Kinh Doanh</h5>
                        <p className="text-[10px] text-slate-500">Quản trị mục tiêu doanh số & hệ thống đại lý</p>
                      </div>

                      <div className="p-3 bg-white rounded-xl border border-amber-200 shadow-sm space-y-1">
                        <span className="text-[10px] font-bold text-amber-800 bg-amber-50 px-2 py-0.5 rounded">Tầng 5</span>
                        <h5 className="font-bold text-slate-800 text-xs">Trưởng Phòng Marketing</h5>
                        <p className="text-[10px] text-slate-500">Phát triển thương hiệu, tiếp thị & truyền thông</p>
                      </div>

                      <div className="p-2.5 rounded-xl border border-dashed border-amber-200 bg-amber-50/50 text-[10px] text-amber-900 font-medium">
                        Phối hợp đồng bộ giữa phát triển thị trường, xúc tiến bán hàng & marketing đa kênh
                      </div>
                    </div>
                  </div>

                  {/* Nhánh 3: Khối Kho Vận & Logistics */}
                  <div className="bg-white rounded-2xl border-2 border-emerald-200 shadow-md overflow-hidden flex flex-col">
                    <div className="bg-gradient-to-r from-emerald-600 to-teal-800 text-white p-3.5 text-center">
                      <div className="flex items-center justify-center space-x-1.5 text-xs font-black text-emerald-200 uppercase">
                        <Truck size={16} />
                        <span>KHỐI KHO VẬN & LOGISTICS</span>
                      </div>
                    </div>
                    <div className="p-3.5 space-y-2.5 flex-1 bg-emerald-50/20">
                      <div className="p-3 bg-white rounded-xl border border-emerald-200 shadow-sm space-y-1">
                        <span className="text-[10px] font-bold text-emerald-800 bg-emerald-50 px-2 py-0.5 rounded">Tầng 5</span>
                        <h5 className="font-bold text-slate-800 text-xs">Quản Lý Kho Cần Thơ</h5>
                        <p className="text-[10px] text-slate-500">Điều hành tổng kho Cần Thơ & giao nhận khu vực</p>
                      </div>

                      <div className="p-3 bg-white rounded-xl border border-emerald-200 shadow-sm space-y-1">
                        <span className="text-[10px] font-bold text-emerald-800 bg-emerald-50 px-2 py-0.5 rounded">Tầng 5</span>
                        <h5 className="font-bold text-slate-800 text-xs">Quản Lý Kho Mỹ Tho</h5>
                        <p className="text-[10px] text-slate-500">Điều hành tổng kho Mỹ Tho & vận tải khu vực</p>
                      </div>

                      <div className="p-3 bg-white rounded-xl border border-emerald-200 shadow-sm space-y-1">
                        <span className="text-[10px] font-bold text-emerald-800 bg-emerald-50 px-2 py-0.5 rounded">Tầng 5</span>
                        <h5 className="font-bold text-slate-800 text-xs">Phó Quản Lý Kho Mỹ Tho</h5>
                        <p className="text-[10px] text-slate-500">Phụ trách điều phối xuất nhập & an toàn kho</p>
                      </div>
                    </div>
                  </div>

                  {/* Nhánh 4: Khối Nhà Máy Sản Xuất */}
                  <div className="bg-white rounded-2xl border-2 border-purple-200 shadow-md overflow-hidden flex flex-col">
                    <div className="bg-gradient-to-r from-purple-700 to-fuchsia-800 text-white p-3.5 text-center">
                      <div className="flex items-center justify-center space-x-1.5 text-xs font-black text-purple-200 uppercase">
                        <Factory size={16} />
                        <span>KHỐI NHÀ MÁY SẢN XUẤT</span>
                      </div>
                    </div>
                    <div className="p-3.5 space-y-2.5 flex-1 bg-purple-50/20">
                      <div className="p-3 bg-white rounded-xl border border-purple-200 shadow-sm space-y-1">
                        <span className="text-[10px] font-bold text-purple-800 bg-purple-50 px-2 py-0.5 rounded">Tầng 5</span>
                        <h5 className="font-bold text-slate-800 text-xs">Quản Lý Xưởng Sản Xuất Nệm</h5>
                        <p className="text-[10px] text-slate-500">Điều hành toàn bộ dây chuyền sản xuất nệm</p>
                      </div>

                      <div className="p-3 bg-white rounded-xl border border-purple-200 shadow-sm space-y-1">
                        <span className="text-[10px] font-bold text-purple-800 bg-purple-50 px-2 py-0.5 rounded">Tầng 5</span>
                        <h5 className="font-bold text-slate-800 text-xs">Phó Quản Lý Xưởng Nệm</h5>
                        <p className="text-[10px] text-slate-500">Kiểm soát tiến độ may, dán, keo & bao bì</p>
                      </div>

                      <div className="p-3 bg-white rounded-xl border border-purple-200 shadow-sm space-y-1">
                        <span className="text-[10px] font-bold text-purple-800 bg-purple-50 px-2 py-0.5 rounded">Tầng 5</span>
                        <h5 className="font-bold text-slate-800 text-xs">Quản Lý / Trưởng Nhóm Xưởng Gối</h5>
                        <p className="text-[10px] text-slate-500">Dây chuyền may gối, thổi gòn & đóng gói gối</p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Dải phân cách nối xuống Tầng 4, 3, 2, 1 */}
              <div className="flex flex-col items-center my-4">
                <div className="w-0.5 h-6 bg-slate-300"></div>
                <div className="px-4 py-1 rounded-full bg-slate-200 text-slate-700 text-xs font-bold flex items-center space-x-1.5">
                  <ArrowDown size={14} />
                  <span>Khối Chức Danh Tác Nghiệp & Thâm Niên (Tầng 4 ➔ Tầng 1)</span>
                </div>
                <div className="w-0.5 h-6 bg-slate-300"></div>
              </div>

              {/* TẦNG 4: CẤP PHÓ PHÒNG / TRƯỞNG NHÓM / CHUYÊN VIÊN CHIẾN LƯỢC */}
              <div className="bg-white rounded-2xl border-2 border-teal-400 shadow-md overflow-hidden">
                <div className="bg-gradient-to-r from-teal-950 via-emerald-950 to-slate-900 text-white p-3.5 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                  <div className="flex items-center space-x-2">
                    <span className="bg-teal-100 text-teal-900 font-black text-xs px-2.5 py-0.5 rounded-full">Tầng 4</span>
                    <h4 className="font-black text-teal-300 text-sm sm:text-base">
                      CẤP PHÓ PHÒNG / TRƯỞNG NHÓM / CHUYÊN VIÊN CHIẾN LƯỢC
                    </h4>
                  </div>
                  <div className="flex items-center space-x-3 text-xs text-slate-300">
                    <span>Lương tầng: <strong className="text-amber-300 font-mono">6.000.000 đ</strong></span>
                    <span>•</span>
                    <span>KPI TN: <strong className="text-emerald-300 font-mono">1.500.000 đ/tháng</strong></span>
                  </div>
                </div>

                <div className="p-4 bg-teal-50/20 grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div className="p-3 bg-white rounded-xl border border-teal-200 shadow-sm space-y-1">
                    <h5 className="font-bold text-slate-800 text-xs">Phó Trưởng Phòng Chuyên Môn</h5>
                    <p className="text-[11px] text-slate-500">Tham mưu nghiệp vụ chuyên sâu và hỗ trợ điều hành bộ phận</p>
                  </div>
                  <div className="p-3 bg-white rounded-xl border border-teal-200 shadow-sm space-y-1">
                    <h5 className="font-bold text-slate-800 text-xs">Trưởng Nhóm Nghiệp Vụ</h5>
                    <p className="text-[11px] text-slate-500">Phụ trách nhóm dự án, nhóm kỹ thuật máy hoặc địa bàn kinh doanh</p>
                  </div>
                  <div className="p-3 bg-white rounded-xl border border-teal-200 shadow-sm space-y-1">
                    <h5 className="font-bold text-slate-800 text-xs">Chuyên Viên Chiến Lược & Phát Triển</h5>
                    <p className="text-[11px] text-slate-500">Nghiên cứu thị trường và phân tích dữ liệu mở rộng thị phần</p>
                  </div>
                </div>
              </div>

              {/* TẦNG 3: CHUYÊN VIÊN CAO CẤP / ĐỘI TRƯỞNG (THÂM NIÊN ≥ 3 NĂM) */}
              <div className="bg-white rounded-2xl border-2 border-emerald-500 shadow-md overflow-hidden">
                <div className="bg-gradient-to-r from-emerald-950 via-teal-950 to-slate-900 text-white p-3.5 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                  <div className="flex items-center space-x-2">
                    <span className="bg-emerald-100 text-emerald-900 font-black text-xs px-2.5 py-0.5 rounded-full">Tầng 3</span>
                    <h4 className="font-black text-emerald-300 text-sm sm:text-base">
                      CHUYÊN VIÊN CAO CẤP / ĐỘI TRƯỞNG (THÂM NIÊN ≥ 3 NĂM)
                    </h4>
                  </div>
                  <div className="flex items-center space-x-3 text-xs text-slate-300">
                    <span>Lương tầng: <strong className="text-amber-300 font-mono">5.500.000 đ</strong></span>
                    <span>•</span>
                    <span>KPI TN: <strong className="text-emerald-300 font-mono">1.000.000 đ/tháng</strong></span>
                  </div>
                </div>

                <div className="p-4 bg-emerald-50/20 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                  <div className="p-3 bg-white rounded-xl border border-emerald-200 shadow-sm space-y-1">
                    <span className="text-[10px] font-bold text-emerald-800 bg-emerald-50 px-2 py-0.5 rounded">Đội Trưởng</span>
                    <h5 className="font-bold text-slate-800 text-xs">Đội Trưởng Đội Tài Xế</h5>
                    <p className="text-[11px] text-slate-500">Điều phối toàn bộ đội xe tải, lộ trình và an toàn giao nhận hàng hóa</p>
                  </div>
                  <div className="p-3 bg-white rounded-xl border border-emerald-200 shadow-sm space-y-1">
                    <span className="text-[10px] font-bold text-emerald-800 bg-emerald-50 px-2 py-0.5 rounded">Kho Vận</span>
                    <h5 className="font-bold text-slate-800 text-xs">Tài Xế Xe Tải Tuyến Trọng Điểm</h5>
                    <p className="text-[11px] text-slate-500">Phụ trách các chuyến vận tải đường dài và giao hàng đại lý lớn</p>
                  </div>
                  <div className="p-3 bg-white rounded-xl border border-emerald-200 shadow-sm space-y-1">
                    <span className="text-[10px] font-bold text-emerald-800 bg-emerald-50 px-2 py-0.5 rounded">Kinh Doanh</span>
                    <h5 className="font-bold text-slate-800 text-xs">Nhân Viên Kinh Doanh Thâm Niên</h5>
                    <p className="text-[11px] text-slate-500">Phát triển và duy trì mạng lưới đại lý chủ lực các tỉnh</p>
                  </div>
                  <div className="p-3 bg-white rounded-xl border border-emerald-200 shadow-sm space-y-1">
                    <span className="text-[10px] font-bold text-emerald-800 bg-emerald-50 px-2 py-0.5 rounded">Kho Vận</span>
                    <h5 className="font-bold text-slate-800 text-xs">Nhân Viên Giao Hàng Kỳ Cựu</h5>
                    <p className="text-[11px] text-slate-500">Phụ trách giao nhận độc lập các tuyến hàng trọng yếu</p>
                  </div>
                  <div className="p-3 bg-white rounded-xl border border-emerald-200 shadow-sm space-y-1">
                    <span className="text-[10px] font-bold text-emerald-800 bg-emerald-50 px-2 py-0.5 rounded">Sản Xuất</span>
                    <h5 className="font-bold text-slate-800 text-xs">Kỹ Thuật May Viền / May Một Kim Bậc Cao</h5>
                    <p className="text-[11px] text-slate-500">Thợ tay nghề cao phụ trách các mẫu nệm cao cấp và hướng dẫn thợ mới</p>
                  </div>
                </div>
              </div>

              {/* TẦNG 2: CHUYÊN VIÊN / KẾ TOÁN / KỸ THUẬT VIÊN (THÂM NIÊN 1 - 3 NĂM) */}
              <div className="bg-white rounded-2xl border-2 border-sky-400 shadow-md overflow-hidden">
                <div className="bg-gradient-to-r from-sky-950 via-blue-950 to-slate-900 text-white p-3.5 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                  <div className="flex items-center space-x-2">
                    <span className="bg-sky-100 text-sky-900 font-black text-xs px-2.5 py-0.5 rounded-full">Tầng 2</span>
                    <h4 className="font-black text-sky-300 text-sm sm:text-base">
                      CHUYÊN VIÊN / KẾ TOÁN / KỸ THUẬT VIÊN CHÍNH THỨC (1 - 3 NĂM)
                    </h4>
                  </div>
                  <div className="flex items-center space-x-3 text-xs text-slate-300">
                    <span>Lương tầng: <strong className="text-amber-300 font-mono">5.000.000 đ</strong></span>
                    <span>•</span>
                    <span>KPI TN: <strong className="text-emerald-300 font-mono">1.000.000 đ/tháng</strong></span>
                  </div>
                </div>

                <div className="p-4 bg-sky-50/20 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3">
                  <div className="p-3 bg-white rounded-xl border border-sky-200 shadow-sm space-y-1">
                    <span className="text-[10px] font-bold text-sky-800 bg-sky-50 px-2 py-0.5 rounded">Văn Phòng</span>
                    <h5 className="font-bold text-slate-800 text-xs">Chuyên Viên HCNS & Tổ Chức</h5>
                    <p className="text-[11px] text-slate-500">Chấm công, bảo hiểm, hợp đồng và chính sách nhân sự</p>
                  </div>
                  <div className="p-3 bg-white rounded-xl border border-sky-200 shadow-sm space-y-1">
                    <span className="text-[10px] font-bold text-sky-800 bg-sky-50 px-2 py-0.5 rounded">Kế Toán</span>
                    <h5 className="font-bold text-slate-800 text-xs">Kế Toán Thu Mua / Công Nợ / Thanh Toán</h5>
                    <p className="text-[11px] text-slate-500">Hạch toán chứng từ, công nợ khách hàng và vật tư</p>
                  </div>
                  <div className="p-3 bg-white rounded-xl border border-sky-200 shadow-sm space-y-1">
                    <span className="text-[10px] font-bold text-sky-800 bg-sky-50 px-2 py-0.5 rounded">Kế Toán</span>
                    <h5 className="font-bold text-slate-800 text-xs">Kế Toán Kho Cần Thơ / Mỹ Tho / Xưởng</h5>
                    <p className="text-[11px] text-slate-500">Theo dõi số lượng hàng hóa nhập xuất tồn kho thực tế</p>
                  </div>
                  <div className="p-3 bg-white rounded-xl border border-sky-200 shadow-sm space-y-1">
                    <span className="text-[10px] font-bold text-sky-800 bg-sky-50 px-2 py-0.5 rounded">Kinh Doanh</span>
                    <h5 className="font-bold text-slate-800 text-xs">Nhân Viên Kinh Doanh Chính Thức</h5>
                    <p className="text-[11px] text-slate-500">Chăm sóc đại lý và hoàn thành chỉ tiêu doanh số tháng</p>
                  </div>
                  <div className="p-3 bg-white rounded-xl border border-sky-200 shadow-sm space-y-1">
                    <span className="text-[10px] font-bold text-sky-800 bg-sky-50 px-2 py-0.5 rounded">Xưởng Nệm</span>
                    <h5 className="font-bold text-slate-800 text-xs">Nhân Viên May Viền Nệm</h5>
                    <p className="text-[11px] text-slate-500">Vận hành máy may viền hoàn thiện viền mép nệm</p>
                  </div>
                  <div className="p-3 bg-white rounded-xl border border-sky-200 shadow-sm space-y-1">
                    <span className="text-[10px] font-bold text-sky-800 bg-sky-50 px-2 py-0.5 rounded">Xưởng Nệm</span>
                    <h5 className="font-bold text-slate-800 text-xs">Nhân Viên May Một Kim & May Tay</h5>
                    <p className="text-[11px] text-slate-500">May vỏ áo nệm, may khóa kéo và may viền góc</p>
                  </div>
                  <div className="p-3 bg-white rounded-xl border border-sky-200 shadow-sm space-y-1">
                    <span className="text-[10px] font-bold text-sky-800 bg-sky-50 px-2 py-0.5 rounded">Xưởng Nệm</span>
                    <h5 className="font-bold text-slate-800 text-xs">Nhân Viên Phun Keo & Dán Nệm</h5>
                    <p className="text-[11px] text-slate-500">Phun keo định hình các lớp mút và ruột nệm</p>
                  </div>
                  <div className="p-3 bg-white rounded-xl border border-sky-200 shadow-sm space-y-1">
                    <span className="text-[10px] font-bold text-sky-800 bg-sky-50 px-2 py-0.5 rounded">Xưởng Nệm</span>
                    <h5 className="font-bold text-slate-800 text-xs">Nhân Viên Vô Áo & Vô Vali Nệm</h5>
                    <p className="text-[11px] text-slate-500">Lồng vỏ áo bọc nệm và đóng gói nệm thành phẩm</p>
                  </div>
                  <div className="p-3 bg-white rounded-xl border border-sky-200 shadow-sm space-y-1">
                    <span className="text-[10px] font-bold text-sky-800 bg-sky-50 px-2 py-0.5 rounded">Xưởng Gối</span>
                    <h5 className="font-bold text-slate-800 text-xs">Nhân Viên Thổi Gòn & May Gối</h5>
                    <p className="text-[11px] text-slate-500">Vận hành máy thổi gòn định lượng và may đóng gối</p>
                  </div>
                  <div className="p-3 bg-white rounded-xl border border-sky-200 shadow-sm space-y-1">
                    <span className="text-[10px] font-bold text-sky-800 bg-sky-50 px-2 py-0.5 rounded">Kho Vận</span>
                    <h5 className="font-bold text-slate-800 text-xs">Nhân Viên Kho & Bốc Xếp</h5>
                    <p className="text-[11px] text-slate-500">Sắp xếp kho bãi, nâng hạ hàng hóa và soạn hàng xuất</p>
                  </div>
                  <div className="p-3 bg-white rounded-xl border border-sky-200 shadow-sm space-y-1">
                    <span className="text-[10px] font-bold text-sky-800 bg-sky-50 px-2 py-0.5 rounded">Kho Vận</span>
                    <h5 className="font-bold text-slate-800 text-xs">Nhân Viên Giao Hàng & Phụ Xe</h5>
                    <p className="text-[11px] text-slate-500">Theo xe tải giao hàng đến các đại lý phân phối</p>
                  </div>
                </div>
              </div>

              {/* TẦNG 1: NHÂN VIÊN MỚI / THỬ VIỆC (THÂM NIÊN < 1 NĂM) */}
              <div className="bg-white rounded-2xl border-2 border-slate-400 shadow-md overflow-hidden">
                <div className="bg-gradient-to-r from-slate-800 via-slate-900 to-zinc-900 text-white p-3.5 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                  <div className="flex items-center space-x-2">
                    <span className="bg-slate-100 text-slate-800 font-black text-xs px-2.5 py-0.5 rounded-full">Tầng 1</span>
                    <h4 className="font-black text-slate-300 text-sm sm:text-base">
                      NHÂN VIÊN MỚI / THỬ VIỆC / HỌC VIỆC (THÂM NIÊN &lt; 1 NĂM)
                    </h4>
                  </div>
                  <div className="flex items-center space-x-3 text-xs text-slate-300">
                    <span>Lương tầng: <strong className="text-amber-300 font-mono">4.500.000 đ</strong></span>
                    <span>•</span>
                    <span>KPI TN: <strong className="text-emerald-300 font-mono">1.000.000 đ/tháng</strong></span>
                  </div>
                </div>

                <div className="p-4 bg-slate-50/40 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
                  <div className="p-3 bg-white rounded-xl border border-slate-200 shadow-sm space-y-1">
                    <span className="text-[10px] font-bold text-slate-600 bg-slate-100 px-2 py-0.5 rounded">Thử Việc</span>
                    <h5 className="font-bold text-slate-800 text-xs">Nhân Viên Thử Việc Văn Phòng</h5>
                    <p className="text-[11px] text-slate-500">Thử việc các vị trí hành chính, kế toán, nhân sự</p>
                  </div>
                  <div className="p-3 bg-white rounded-xl border border-slate-200 shadow-sm space-y-1">
                    <span className="text-[10px] font-bold text-slate-600 bg-slate-100 px-2 py-0.5 rounded">Thử Việc</span>
                    <h5 className="font-bold text-slate-800 text-xs">Nhân Viên Thử Việc Kinh Doanh</h5>
                    <p className="text-[11px] text-slate-500">Làm quen thị trường, sản phẩm và quy trình bán hàng</p>
                  </div>
                  <div className="p-3 bg-white rounded-xl border border-slate-200 shadow-sm space-y-1">
                    <span className="text-[10px] font-bold text-slate-600 bg-slate-100 px-2 py-0.5 rounded">Học Việc</span>
                    <h5 className="font-bold text-slate-800 text-xs">Nhân Viên Học Việc May & Xưởng Nệm</h5>
                    <p className="text-[11px] text-slate-500">Học việc may viền, may một kim, dán tem và phụ xưởng</p>
                  </div>
                  <div className="p-3 bg-white rounded-xl border border-slate-200 shadow-sm space-y-1">
                    <span className="text-[10px] font-bold text-slate-600 bg-slate-100 px-2 py-0.5 rounded">Thử Việc</span>
                    <h5 className="font-bold text-slate-800 text-xs">Nhân Viên Thử Việc Kho & Giao Nhận</h5>
                    <p className="text-[11px] text-slate-500">Làm quen quy trình soạn hàng và phụ xe giao nhận</p>
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
