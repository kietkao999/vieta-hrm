import sqlite3 from 'sqlite3';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const dbPath = path.resolve(__dirname, 'hrm.db');

export const employeesData = [
  { "stt": 1, "maNV": "VietA 050", "hoTen": "Trần Minh Lý", "kpiT5": 1750000, "kpiT6": 1500000, "kpiT7": 2000000, "tongKPI": 5250000, "hqT1": 8482016, "hqT2": 5040859, "hqT3": 6163567, "hqT4": 3698973, "hqT5": 4027656, "hqT6": 4768738, "hqT7": 5042190, "tongHQ": 37223999, "tongCong": 42473999 },
  { "stt": 2, "maNV": "VietA 055", "hoTen": "Phan Quốc Khôi", "kpiT5": 0, "kpiT6": 900000, "kpiT7": 1000000, "tongKPI": 1900000, "hqT1": 7730511, "hqT2": 3510798, "hqT3": 4290353, "hqT4": 866052, "hqT5": 1922202, "hqT6": 3441286, "hqT7": 4067310, "tongHQ": 25828512, "tongCong": 27728512 },
  { "stt": 3, "maNV": "VietA 052", "hoTen": "Nguyễn Minh Văn", "kpiT5": 0, "kpiT6": 0, "kpiT7": 0, "tongKPI": 0, "hqT1": 4653650, "hqT2": 2589700, "hqT3": 4875000, "hqT4": 3086500, "hqT5": 168000, "hqT6": 730100, "hqT7": 0, "tongHQ": 16102950, "tongCong": 16102950 },
  { "stt": 4, "maNV": "VietA 054", "hoTen": "Võ Hoàng Tín", "kpiT5": 0, "kpiT6": 1000000, "kpiT7": 1000000, "tongKPI": 2000000, "hqT1": 2621450, "hqT2": 1856125, "hqT3": 2921175, "hqT4": 1230775, "hqT5": 2279200, "hqT6": 2339250, "hqT7": 2095900, "tongHQ": 15343875, "tongCong": 17343875 },
  { "stt": 5, "maNV": "", "hoTen": "Trần Thị Bảo Châu", "kpiT5": 0, "kpiT6": 1000000, "kpiT7": 1000000, "tongKPI": 2000000, "hqT1": 3332600, "hqT2": 2070300, "hqT3": 3531875, "hqT4": 1274250, "hqT5": 1006914, "hqT6": 1192184, "hqT7": 1260547, "tongHQ": 13668670, "tongCong": 15668670 },
  { "stt": 6, "maNV": "", "hoTen": "Nguyễn Thị Kim Hòa", "kpiT5": 0, "kpiT6": 875000, "kpiT7": 1000000, "tongKPI": 1875000, "hqT1": 3427500, "hqT2": 1984350, "hqT3": 3134800, "hqT4": 1551575, "hqT5": 2252500, "hqT6": 2018650, "hqT7": 2552400, "tongHQ": 16921775, "tongCong": 18796775 },
  { "stt": 7, "maNV": "", "hoTen": "Trịnh Dương Minh Nhựt", "kpiT5": 0, "kpiT6": 875000, "kpiT7": 1000000, "tongKPI": 1875000, "hqT1": 5502200, "hqT2": 4199400, "hqT3": 6052300, "hqT4": 2934700, "hqT5": 3188850, "hqT6": 3357250, "hqT7": 3270800, "tongHQ": 28505500, "tongCong": 30380500 },
  { "stt": 8, "maNV": "", "hoTen": "Trần Thị Kim Quyên", "kpiT5": 0, "kpiT6": 950000, "kpiT7": 1000000, "tongKPI": 1950000, "hqT1": 3160600, "hqT2": 1833950, "hqT3": 3772350, "hqT4": 1989325, "hqT5": 2147675, "hqT6": 2444525, "hqT7": 2372200, "tongHQ": 17720625, "tongCong": 19670625 },
  { "stt": 9, "maNV": "", "hoTen": "Nguyễn Thị Thùy Trang", "kpiT5": 0, "kpiT6": 1000000, "kpiT7": 1000000, "tongKPI": 2000000, "hqT1": 2120504, "hqT2": 1260215, "hqT3": 1540892, "hqT4": 1849486, "hqT5": 1006914, "hqT6": 1192184, "hqT7": 1260547, "tongHQ": 10230742, "tongCong": 12230742 },
  { "stt": 10, "maNV": "", "hoTen": "Lê Thanh Hồng", "kpiT5": 0, "kpiT6": 950000, "kpiT7": 1000000, "tongKPI": 1950000, "hqT1": 2674425, "hqT2": 1614150, "hqT3": 3313050, "hqT4": 1503100, "hqT5": 2462125, "hqT6": 1540050, "hqT7": 2146200, "tongHQ": 15253100, "tongCong": 17203100 },
  { "stt": 11, "maNV": "", "hoTen": "Lê Ngọc Tuấn", "kpiT5": 0, "kpiT6": 1000000, "kpiT7": 1000000, "tongKPI": 2000000, "hqT1": 2787750, "hqT2": 1765500, "hqT3": 3050500, "hqT4": 1258750, "hqT5": 2583500, "hqT6": 2439750, "hqT7": 2232750, "tongHQ": 16118500, "tongCong": 18118500 },
  { "stt": 12, "maNV": "", "hoTen": "Mai Văn Sang", "kpiT5": 0, "kpiT6": 950000, "kpiT7": 1000000, "tongKPI": 1950000, "hqT1": 2787750, "hqT2": 1765500, "hqT3": 3050500, "hqT4": 1258750, "hqT5": 2542550, "hqT6": 2212350, "hqT7": 2213000, "tongHQ": 15830400, "tongCong": 17780400 },
  { "stt": 13, "maNV": "", "hoTen": "Dương Minh Phụng", "kpiT5": 0, "kpiT6": 950000, "kpiT7": 1000000, "tongKPI": 1950000, "hqT1": 2988775, "hqT2": 1827450, "hqT3": 2886000, "hqT4": 1475500, "hqT5": 2341400, "hqT6": 2244200, "hqT7": 2267450, "tongHQ": 16030775, "tongCong": 17980775 },
  { "stt": 14, "maNV": "", "hoTen": "Huỳnh Minh Sang", "kpiT5": 0, "kpiT6": 900000, "kpiT7": 1000000, "tongKPI": 1900000, "hqT1": 2772000, "hqT2": 1930500, "hqT3": 3496500, "hqT4": 1493250, "hqT5": 2420000, "hqT6": 2189000, "hqT7": 2185000, "tongHQ": 16486250, "tongCong": 18386250 },
  { "stt": 15, "maNV": "", "hoTen": "Phạm Thị Thảo Nguyên", "kpiT5": 0, "kpiT6": 1000000, "kpiT7": 1000000, "tongKPI": 2000000, "hqT1": 2574000, "hqT2": 1732500, "hqT3": 3135000, "hqT4": 1339800, "hqT5": 2171400, "hqT6": 1964100, "hqT7": 1945800, "tongHQ": 14862600, "tongCong": 16862600 },
  { "stt": 16, "maNV": "", "hoTen": "Trương Thanh Tấn", "kpiT5": 0, "kpiT6": 875000, "kpiT7": 1000000, "tongKPI": 1875000, "hqT1": 2475000, "hqT2": 1930500, "hqT3": 3135000, "hqT4": 1339800, "hqT5": 2409000, "hqT6": 2099900, "hqT7": 1945600, "tongHQ": 15334800, "tongCong": 17209800 },
  { "stt": 17, "maNV": "", "hoTen": "Nguyễn Huỳnh Duy", "kpiT5": 0, "kpiT6": 875000, "kpiT7": 1000000, "tongKPI": 1875000, "hqT1": 2673000, "hqT2": 1732500, "hqT3": 3333000, "hqT4": 1424525, "hqT5": 2307800, "hqT6": 1945150, "hqT7": 2005800, "tongHQ": 15421775, "tongCong": 17296775 },
  { "stt": 18, "maNV": "", "hoTen": "Võ Hoàng Long", "kpiT5": 0, "kpiT6": 875000, "kpiT7": 1000000, "tongKPI": 1875000, "hqT1": 2772000, "hqT2": 1831500, "hqT3": 3135000, "hqT4": 1339800, "hqT5": 2226400, "hqT6": 2011350, "hqT7": 2051600, "tongHQ": 15367650, "tongCong": 17242650 },
  { "stt": 19, "maNV": "", "hoTen": "Trần Minh Thư", "kpiT5": 0, "kpiT6": 875000, "kpiT7": 1000000, "tongKPI": 1875000, "hqT1": 2574000, "hqT2": 1732500, "hqT3": 3135000, "hqT4": 1339800, "hqT5": 2171400, "hqT6": 1964100, "hqT7": 1945800, "tongHQ": 14862600, "tongCong": 16737600 },
  { "stt": 20, "maNV": "", "hoTen": "Lê Thị Bé Ba", "kpiT5": 0, "kpiT6": 1000000, "kpiT7": 1000000, "tongKPI": 2000000, "hqT1": 2574000, "hqT2": 1732500, "hqT3": 3135000, "hqT4": 1339800, "hqT5": 2171400, "hqT6": 1964100, "hqT7": 1702175, "tongHQ": 14618975, "tongCong": 16618975 },
  { "stt": 21, "maNV": "", "hoTen": "Trương Trọng Nghĩa", "kpiT5": 0, "kpiT6": 800000, "kpiT7": 1000000, "tongKPI": 1800000, "hqT1": 2376000, "hqT2": 1599000, "hqT3": 2891000, "hqT4": 1235600, "hqT5": 2002400, "hqT6": 1811300, "hqT7": 1967500, "tongHQ": 13882800, "tongCong": 15682800 },
  { "stt": 22, "maNV": "", "hoTen": "Nguyễn Thị Thúy Vân", "kpiT5": 0, "kpiT6": 1000000, "kpiT7": 1000000, "tongKPI": 2000000, "hqT1": 2178000, "hqT2": 1465500, "hqT3": 2647000, "hqT4": 1131400, "hqT5": 1833400, "hqT6": 1658500, "hqT7": 1980600, "tongHQ": 12894400, "tongCong": 14894400 },
  { "stt": 23, "maNV": "", "hoTen": "Lê Thị Mỹ Thuận", "kpiT5": 0, "kpiT6": 1000000, "kpiT7": 1000000, "tongKPI": 2000000, "hqT1": 2574000, "hqT2": 1732500, "hqT3": 3135000, "hqT4": 1339800, "hqT5": 2171400, "hqT6": 1964100, "hqT7": 1945800, "tongHQ": 14862600, "tongCong": 16862600 },
  { "stt": 24, "maNV": "", "hoTen": "Nguyễn Thị Ngọc Đào", "kpiT5": 0, "kpiT6": 1000000, "kpiT7": 1000000, "tongKPI": 2000000, "hqT1": 2574000, "hqT2": 1732500, "hqT3": 3135000, "hqT4": 1339800, "hqT5": 2171400, "hqT6": 1964100, "hqT7": 1945800, "tongHQ": 14862600, "tongCong": 16862600 },
  { "stt": 25, "maNV": "", "hoTen": "Võ Thị Ngọc Nhanh", "kpiT5": 0, "kpiT6": 900000, "kpiT7": 1000000, "tongKPI": 1900000, "hqT1": 2574000, "hqT2": 1732500, "hqT3": 3135000, "hqT4": 1339800, "hqT5": 2171400, "hqT6": 1964100, "hqT7": 1945800, "tongHQ": 14862600, "tongCong": 16762600 },
  { "stt": 26, "maNV": "", "hoTen": "Nguyễn Ngọc Anh Thư", "kpiT5": 0, "kpiT6": 1000000, "kpiT7": 1000000, "tongKPI": 2000000, "hqT1": 2574000, "hqT2": 1732500, "hqT3": 3135000, "hqT4": 1339800, "hqT5": 2171400, "hqT6": 1964100, "hqT7": 1945800, "tongHQ": 14862600, "tongCong": 16862600 },
  { "stt": 27, "maNV": "", "hoTen": "Nguyễn Thành Tài", "kpiT5": 0, "kpiT6": 1000000, "kpiT7": 1000000, "tongKPI": 2000000, "hqT1": 2574000, "hqT2": 1732500, "hqT3": 3135000, "hqT4": 1339800, "hqT5": 2171400, "hqT6": 1964100, "hqT7": 1945800, "tongHQ": 14862600, "tongCong": 16862600 },
  { "stt": 28, "maNV": "", "hoTen": "Võ Thị Huỳnh Mai", "kpiT5": 0, "kpiT6": 900000, "kpiT7": 1000000, "tongKPI": 1900000, "hqT1": 2574000, "hqT2": 1732500, "hqT3": 3135000, "hqT4": 1339800, "hqT5": 2171400, "hqT6": 1964100, "hqT7": 1945800, "tongHQ": 14862600, "tongCong": 16762600 },
  { "stt": 29, "maNV": "", "hoTen": "Trần Mỹ Linh", "kpiT5": 0, "kpiT6": 950000, "kpiT7": 1000000, "tongKPI": 1950000, "hqT1": 2574000, "hqT2": 1732500, "hqT3": 3135000, "hqT4": 1339800, "hqT5": 2171400, "hqT6": 1964100, "hqT7": 1945800, "tongHQ": 14862600, "tongCong": 16812600 },
  { "stt": 30, "maNV": "", "hoTen": "Lê Thị Thúy Kiều", "kpiT5": 0, "kpiT6": 900000, "kpiT7": 1000000, "tongKPI": 1900000, "hqT1": 2574000, "hqT2": 1732500, "hqT3": 3135000, "hqT4": 1339800, "hqT5": 2171400, "hqT6": 1964100, "hqT7": 1945800, "tongHQ": 14862600, "tongCong": 16762600 },
  { "stt": 31, "maNV": "", "hoTen": "Mai Hồng Nhung", "kpiT5": 0, "kpiT6": 950000, "kpiT7": 1000000, "tongKPI": 1950000, "hqT1": 2574000, "hqT2": 1732500, "hqT3": 3135000, "hqT4": 1339800, "hqT5": 2171400, "hqT6": 1964100, "hqT7": 1945800, "tongHQ": 14862600, "tongCong": 16812600 },
  { "stt": 32, "maNV": "", "hoTen": "Nguyễn Huỳnh Long", "kpiT5": 0, "kpiT6": 900000, "kpiT7": 1000000, "tongKPI": 1900000, "hqT1": 2574000, "hqT2": 1732500, "hqT3": 3135000, "hqT4": 1339800, "hqT5": 2171400, "hqT6": 1964100, "hqT7": 1945800, "tongHQ": 14862600, "tongCong": 16762600 },
  { "stt": 33, "maNV": "", "hoTen": "Đỗ Huỳnh Phúc", "kpiT5": 0, "kpiT6": 900000, "kpiT7": 1000000, "tongKPI": 1900000, "hqT1": 2574000, "hqT2": 1732500, "hqT3": 3135000, "hqT4": 1339800, "hqT5": 2171400, "hqT6": 1964100, "hqT7": 1945800, "tongHQ": 14862600, "tongCong": 16762600 },
  { "stt": 34, "maNV": "", "hoTen": "Lê Phương Linh", "kpiT5": 0, "kpiT6": 1000000, "kpiT7": 1000000, "tongKPI": 2000000, "hqT1": 2574000, "hqT2": 1732500, "hqT3": 3135000, "hqT4": 1339800, "hqT5": 2171400, "hqT6": 1964100, "hqT7": 1945800, "tongHQ": 14862600, "tongCong": 16862600 },
  { "stt": 35, "maNV": "", "hoTen": "Trần Thị Bé Loan", "kpiT5": 0, "kpiT6": 1000000, "kpiT7": 1000000, "tongKPI": 2000000, "hqT1": 2574000, "hqT2": 1732500, "hqT3": 3135000, "hqT4": 1339800, "hqT5": 2171400, "hqT6": 1964100, "hqT7": 1945800, "tongHQ": 14862600, "tongCong": 16862600 },
  { "stt": 36, "maNV": "", "hoTen": "Hồ Huỳnh Thơ", "kpiT5": 0, "kpiT6": 950000, "kpiT7": 1000000, "tongKPI": 1950000, "hqT1": 2574000, "hqT2": 1732500, "hqT3": 3135000, "hqT4": 1339800, "hqT5": 2171400, "hqT6": 1964100, "hqT7": 1945800, "tongHQ": 14862600, "tongCong": 16812600 },
  { "stt": 37, "maNV": "", "hoTen": "Trần Công Thành", "kpiT5": 0, "kpiT6": 950000, "kpiT7": 1000000, "tongKPI": 1950000, "hqT1": 2574000, "hqT2": 1732500, "hqT3": 3135000, "hqT4": 1339800, "hqT5": 2171400, "hqT6": 1964100, "hqT7": 1945800, "tongHQ": 14862600, "tongCong": 16812600 },
  { "stt": 38, "maNV": "", "hoTen": "Võ Thị Thủy Tiên", "kpiT5": 0, "kpiT6": 950000, "kpiT7": 1000000, "tongKPI": 1950000, "hqT1": 2574000, "hqT2": 1732500, "hqT3": 3135000, "hqT4": 1339800, "hqT5": 2171400, "hqT6": 1964100, "hqT7": 1945800, "tongHQ": 14862600, "tongCong": 16812600 },
  { "stt": 39, "maNV": "", "hoTen": "Phạm Thị Thảo Quyên", "kpiT5": 0, "kpiT6": 1000000, "kpiT7": 1000000, "tongKPI": 2000000, "hqT1": 2574000, "hqT2": 1732500, "hqT3": 3135000, "hqT4": 1339800, "hqT5": 2171400, "hqT6": 1964100, "hqT7": 1945800, "tongHQ": 14862600, "tongCong": 16862600 },
  { "stt": 40, "maNV": "", "hoTen": "Nguyễn Thị Bích Loan", "kpiT5": 0, "kpiT6": 1000000, "kpiT7": 1000000, "tongKPI": 2000000, "hqT1": 2574000, "hqT2": 1732500, "hqT3": 3135000, "hqT4": 1339800, "hqT5": 2171400, "hqT6": 1964100, "hqT7": 1945800, "tongHQ": 14862600, "tongCong": 16862600 },
  { "stt": 41, "maNV": "", "hoTen": "Lê Minh Thuận", "kpiT5": 0, "kpiT6": 950000, "kpiT7": 1000000, "tongKPI": 1950000, "hqT1": 2574000, "hqT2": 1732500, "hqT3": 3135000, "hqT4": 1339800, "hqT5": 2171400, "hqT6": 1964100, "hqT7": 1945800, "tongHQ": 14862600, "tongCong": 16812600 },
  { "stt": 42, "maNV": "", "hoTen": "Huỳnh Thị Ánh Quyên", "kpiT5": 0, "kpiT6": 950000, "kpiT7": 1000000, "tongKPI": 1950000, "hqT1": 2574000, "hqT2": 1732500, "hqT3": 3135000, "hqT4": 1339800, "hqT5": 2171400, "hqT6": 1964100, "hqT7": 1945800, "tongHQ": 14862600, "tongCong": 16812600 },
  { "stt": 43, "maNV": "", "hoTen": "Lê Thị Bé Tám", "kpiT5": 0, "kpiT6": 1000000, "kpiT7": 1000000, "tongKPI": 2000000, "hqT1": 2574000, "hqT2": 1732500, "hqT3": 3135000, "hqT4": 1339800, "hqT5": 2171400, "hqT6": 1964100, "hqT7": 1945800, "tongHQ": 14862600, "tongCong": 16862600 },
  { "stt": 44, "maNV": "", "hoTen": "Huỳnh Thị Hồng Quyên", "kpiT5": 0, "kpiT6": 1000000, "kpiT7": 1000000, "tongKPI": 2000000, "hqT1": 2574000, "hqT2": 1732500, "hqT3": 3135000, "hqT4": 1339800, "hqT5": 2171400, "hqT6": 1964100, "hqT7": 1945800, "tongHQ": 14862600, "tongCong": 16862600 },
  { "stt": 45, "maNV": "", "hoTen": "Nguyễn Văn Trí", "kpiT5": 0, "kpiT6": 1000000, "kpiT7": 1000000, "tongKPI": 2000000, "hqT1": 2574000, "hqT2": 1732500, "hqT3": 3135000, "hqT4": 1339800, "hqT5": 2171400, "hqT6": 1964100, "hqT7": 1945800, "tongHQ": 14862600, "tongCong": 16862600 },
  { "stt": 46, "maNV": "", "hoTen": "Nguyễn Quốc Bảo", "kpiT5": 0, "kpiT6": 1000000, "kpiT7": 1000000, "tongKPI": 2000000, "hqT1": 2574000, "hqT2": 1732500, "hqT3": 3135000, "hqT4": 1339800, "hqT5": 2171400, "hqT6": 1964100, "hqT7": 1945800, "tongHQ": 14862600, "tongCong": 16862600 },
  { "stt": 47, "maNV": "", "hoTen": "Nguyễn Văn Hoàng", "kpiT5": 0, "kpiT6": 1000000, "kpiT7": 1000000, "tongKPI": 2000000, "hqT1": 2574000, "hqT2": 1732500, "hqT3": 3135000, "hqT4": 1339800, "hqT5": 2171400, "hqT6": 1964100, "hqT7": 1945800, "tongHQ": 14862600, "tongCong": 16862600 },
  { "stt": 48, "maNV": "", "hoTen": "Phan Nguyễn Nhựt Đăng", "kpiT5": 0, "kpiT6": 1000000, "kpiT7": 1000000, "tongKPI": 2000000, "hqT1": 2574000, "hqT2": 1732500, "hqT3": 3135000, "hqT4": 1339800, "hqT5": 2171400, "hqT6": 1964100, "hqT7": 1945800, "tongHQ": 14862600, "tongCong": 16862600 },
  { "stt": 49, "maNV": "", "hoTen": "Lê Minh Hiếu", "kpiT5": 0, "kpiT6": 900000, "kpiT7": 1000000, "tongKPI": 1900000, "hqT1": 2574000, "hqT2": 1732500, "hqT3": 3135000, "hqT4": 1339800, "hqT5": 2171400, "hqT6": 1964100, "hqT7": 1945800, "tongHQ": 14862600, "tongCong": 16762600 },
  { "stt": 50, "maNV": "", "hoTen": "Trần Thái Hòa", "kpiT5": 0, "kpiT6": 950000, "kpiT7": 1000000, "tongKPI": 1950000, "hqT1": 2574000, "hqT2": 1732500, "hqT3": 3135000, "hqT4": 1339800, "hqT5": 2171400, "hqT6": 1964100, "hqT7": 1945800, "tongHQ": 14862600, "tongCong": 16812600 },
  { "stt": 51, "maNV": "", "hoTen": "Đặng Huỳnh Anh Thư", "kpiT5": 0, "kpiT6": 1000000, "kpiT7": 1000000, "tongKPI": 2000000, "hqT1": 2574000, "hqT2": 1732500, "hqT3": 3135000, "hqT4": 1339800, "hqT5": 2171400, "hqT6": 1964100, "hqT7": 1945800, "tongHQ": 14862600, "tongCong": 16862600 },
  { "stt": 52, "maNV": "", "hoTen": "Nguyễn Duy Thịnh", "kpiT5": 0, "kpiT6": 1000000, "kpiT7": 1000000, "tongKPI": 2000000, "hqT1": 2574000, "hqT2": 1732500, "hqT3": 3135000, "hqT4": 1339800, "hqT5": 2171400, "hqT6": 1964100, "hqT7": 1945800, "tongHQ": 14862600, "tongCong": 16862600 },
  { "stt": 53, "maNV": "", "hoTen": "Nguyễn Thị Thúy Vân", "kpiT5": 0, "kpiT6": 1000000, "kpiT7": 1000000, "tongKPI": 2000000, "hqT1": 2574000, "hqT2": 1732500, "hqT3": 3135000, "hqT4": 1339800, "hqT5": 2171400, "hqT6": 1964100, "hqT7": 1945800, "tongHQ": 14862600, "tongCong": 16862600 },
  { "stt": 54, "maNV": "", "hoTen": "Ngô Thanh Tín", "kpiT5": 0, "kpiT6": 1500000, "kpiT7": 1500000, "tongKPI": 3000000, "hqT1": 0, "hqT2": 0, "hqT3": 2521128, "hqT4": 2971615, "hqT5": 395330, "hqT6": 2903517, "hqT7": 5779988, "tongHQ": 14571578, "tongCong": 17571578 },
  { "stt": 55, "maNV": "", "hoTen": "Phan Tuấn Kiệt", "kpiT5": 0, "kpiT6": 0, "kpiT7": 0, "tongKPI": 0, "hqT1": 4945483, "hqT2": 3437844, "hqT3": 0, "hqT4": 0, "hqT5": 0, "hqT6": 0, "hqT7": 0, "tongHQ": 8383327, "tongCong": 8383327 },
  { "stt": 56, "maNV": "", "hoTen": "Phan Tuấn Kiệt", "kpiT5": 1750000, "kpiT6": 2000000, "kpiT7": 1500000, "tongKPI": 5250000, "hqT1": 2125000, "hqT2": 0, "hqT3": 1050000, "hqT4": 2125000, "hqT5": 2366667, "hqT6": 1000000, "hqT7": 0, "tongHQ": 8666667, "tongCong": 13916667 },
  { "stt": 57, "maNV": "", "hoTen": "Võ Minh Cường", "kpiT5": 2500000, "kpiT6": 2500000, "kpiT7": 2500000, "tongKPI": 7500000, "hqT1": 34323841, "hqT2": 24907296, "hqT3": 21221673, "hqT4": 13125273, "hqT5": 13981350, "hqT6": 18033056, "hqT7": 19943542, "tongHQ": 145536031, "tongCong": 153036031 },
  { "stt": 58, "maNV": "", "hoTen": "Nguyễn Thị Thúy Vy", "kpiT5": 0, "kpiT6": 1000000, "kpiT7": 1000000, "tongKPI": 2000000, "hqT1": 0, "hqT2": 0, "hqT3": 0, "hqT4": 0, "hqT5": 469501, "hqT6": 571149, "hqT7": 622385, "tongHQ": 1663035, "tongCong": 3663035 },
  { "stt": 59, "maNV": "", "hoTen": "Nguyễn Quốc Hùng", "kpiT5": 0, "kpiT6": 2000000, "kpiT7": 2000000, "tongKPI": 4000000, "hqT1": 0, "hqT2": 0, "hqT3": 0, "hqT4": 0, "hqT5": 0, "hqT6": 0, "hqT7": 0, "tongHQ": 0, "tongCong": 4000000 },
  { "stt": 60, "maNV": "", "hoTen": "Huỳnh Thị Trúc Xinh", "kpiT5": 0, "kpiT6": 1000000, "kpiT7": 1000000, "tongKPI": 2000000, "hqT1": 1387055, "hqT2": 1024954, "hqT3": 842801, "hqT4": 587402, "hqT5": 469501, "hqT6": 571149, "hqT7": 622385, "tongHQ": 5505247, "tongCong": 7505247 },
  { "stt": 61, "maNV": "", "hoTen": "Nguyễn Quốc Huy", "kpiT5": 0, "kpiT6": 750000, "kpiT7": 1000000, "tongKPI": 1750000, "hqT1": 1387055, "hqT2": 1024954, "hqT3": 842801, "hqT4": 587402, "hqT5": 469501, "hqT6": 571149, "hqT7": 622385, "tongHQ": 5505247, "tongCong": 7255247 },
  { "stt": 62, "maNV": "", "hoTen": "Lê Thị Mỹ Phúc", "kpiT5": 0, "kpiT6": 1000000, "kpiT7": 1000000, "tongKPI": 2000000, "hqT1": 1387055, "hqT2": 1024954, "hqT3": 842801, "hqT4": 587402, "hqT5": 469501, "hqT6": 571149, "hqT7": 622385, "tongHQ": 5505247, "tongCong": 7505247 },
  { "stt": 63, "maNV": "", "hoTen": "Lê Huy Hoàng", "kpiT5": 0, "kpiT6": 2000000, "kpiT7": 2000000, "tongKPI": 4000000, "hqT1": 1387055, "hqT2": 1024954, "hqT3": 842801, "hqT4": 587402, "hqT5": 469501, "hqT6": 571149, "hqT7": 622385, "tongHQ": 5505247, "tongCong": 9505247 }
];

const db = new sqlite3.Database(dbPath);

const get = (sql, params = []) => new Promise((resolve, reject) => {
  db.get(sql, params, (err, row) => err ? reject(err) : resolve(row));
});

const all = (sql, params = []) => new Promise((resolve, reject) => {
  db.all(sql, params, (err, rows) => err ? reject(err) : resolve(rows));
});

const run = (sql, params = []) => new Promise((resolve, reject) => {
  db.run(sql, params, function(err) { err ? reject(err) : resolve(this); });
});

async function main() {
  console.log('=== BẮT ĐẦU ĐỒNG BỘ KPI & HIỆU QUẢ 7 THÁNG ===');

  // 1. Lấy tất cả nhân viên trong DB
  const dbEmps = await all(`
    SELECT e.id, e.code, e.fullname, e.kpi_bonus, d.name as department_name, p.name as position_name
    FROM employees e
    LEFT JOIN departments d ON e.department_id = d.id
    LEFT JOIN positions p ON e.position_id = p.id
  `);

  console.log(`Tìm thấy ${dbEmps.length} nhân sự trong CSDL.`);

  const nameMap = new Map();
  dbEmps.forEach(e => {
    const clean = e.fullname.trim().toLowerCase();
    nameMap.set(clean, e);
  });

  const enrichedList = [];
  const now = new Date().toISOString();

  let matchedCount = 0;
  let newCreated = 0;

  for (let item of employeesData) {
    const cleanName = item.hoTen.trim().toLowerCase();
    let matchedEmp = null;

    if (item.maNV && item.maNV.trim()) {
      matchedEmp = dbEmps.find(e => e.code.toLowerCase() === item.maNV.trim().toLowerCase());
    }

    if (!matchedEmp) {
      matchedEmp = nameMap.get(cleanName);
    }

    let empId = matchedEmp?.id;
    let finalMaNV = matchedEmp?.code || item.maNV;
    let deptName = matchedEmp?.department_name || 'Khối văn phòng';
    let posName = matchedEmp?.position_name || 'Nhân viên';

    // Nếu không tìm thấy mã NV, tự sinh mã hoặc tạo mới nhân viên nếu cần
    if (!matchedEmp) {
      // Tìm số mã cao nhất
      const maxCodeRow = await get("SELECT code FROM employees WHERE code LIKE 'VietA %' ORDER BY code DESC LIMIT 1");
      let nextNum = 90;
      if (maxCodeRow && maxCodeRow.code) {
        const numPart = parseInt(maxCodeRow.code.replace('VietA ', ''), 10);
        if (!isNaN(numPart)) nextNum = numPart + 1;
      }
      finalMaNV = `VietA ${String(nextNum).padStart(3, '0')}`;
      
      const insertEmp = await run(`
        INSERT INTO employees (code, fullname, gender, status, base_salary, kpi_bonus, join_date, created_at, updated_at)
        VALUES (?, ?, 'Nam', 'Đang làm việc', 6000000, ?, '2025-01-01', ?, ?)
      `, [finalMaNV, item.hoTen, item.kpiT7 || 1000000, now, now]);

      empId = insertEmp.lastID;
      newCreated++;
      console.log(`+ Tạo mới nhân sự thiếu: [${finalMaNV}] ${item.hoTen}`);
    } else {
      matchedCount++;
    }

    const enrichedRecord = {
      ...item,
      employeeId: empId,
      maNV: finalMaNV,
      department: deptName,
      position: posName
    };
    enrichedList.push(enrichedRecord);

    // 2. Cập nhật dữ liệu KPI & Hiệu quả tháng T1 -> T7 vào bảng employee_monthly_kpis
    const monthsData = [
      { m: '01', kpi: 0, hq: item.hqT1 },
      { m: '02', kpi: 0, hq: item.hqT2 },
      { m: '03', kpi: 0, hq: item.hqT3 },
      { m: '04', kpi: 0, hq: item.hqT4 },
      { m: '05', kpi: item.kpiT5, hq: item.hqT5 },
      { m: '06', kpi: item.kpiT6, hq: item.hqT6 },
      { m: '07', kpi: item.kpiT7, hq: item.hqT7 }
    ];

    for (const row of monthsData) {
      const respBonus = row.kpi || 0;
      const respRate = 1.0;
      const respAmount = respBonus;
      const perfBonus = row.hq || 0;

      await run(`
        INSERT INTO employee_monthly_kpis (
          employee_id, month, year,
          responsibility_bonus, responsibility_penalty, responsibility_rate, responsibility_amount,
          performance_bonus, discipline_deduction, note, created_at, updated_at
        ) VALUES (?, ?, 2026, ?, 0, ?, ?, ?, 0, 'Đồng bộ báo cáo T1-T7/2026', ?, ?)
        ON CONFLICT(employee_id, month, year) DO UPDATE SET
          responsibility_bonus = excluded.responsibility_bonus,
          responsibility_rate = excluded.responsibility_rate,
          responsibility_amount = excluded.responsibility_amount,
          performance_bonus = excluded.performance_bonus,
          updated_at = excluded.updated_at
      `, [empId, row.m, respBonus, respRate, respAmount, perfBonus, now, now]);
    }
  }

  console.log(`\nKhớp thành công: ${matchedCount} nhân sự`);
  console.log(`Tạo mới: ${newCreated} nhân sự`);
  console.log(`Tổng cộng: ${enrichedList.length} nhân sự đã đồng bộ KPI & Hiệu Quả T1 -> T7!`);

  // 3. Xuất file hằng số tiện ích cho Client
  const clientDataPath = path.resolve(__dirname, '../client/src/data/kpiPerformanceData.js');
  const clientDataDir = path.dirname(clientDataPath);
  if (!fs.existsSync(clientDataDir)) {
    fs.mkdirSync(clientDataDir, { recursive: true });
  }

  const fileContent = `/**
 * Dữ liệu Tổng hợp KPI (T5-T7) & Thưởng Hiệu Quả (T1-T7)
 * Đã chuẩn hóa và khớp đầy đủ Mã NV (maNV) & Phòng ban từ CSDL
 */

export const KPI_PERFORMANCE_DATA = ${JSON.stringify(enrichedList, null, 2)};

export const KPI_MONTHS = ['T5', 'T6', 'T7'];
export const HQ_MONTHS = ['T1', 'T2', 'T3', 'T4', 'T5', 'T6', 'T7'];

export const calculateSummaryStats = (data = KPI_PERFORMANCE_DATA) => {
  const totalEmployees = data.length;
  const totalKPI = data.reduce((sum, item) => sum + (item.tongKPI || 0), 0);
  const totalHQ = data.reduce((sum, item) => sum + (item.tongHQ || 0), 0);
  const totalPayout = totalKPI + totalHQ;
  const avgPayout = totalEmployees > 0 ? Math.round(totalPayout / totalEmployees) : 0;
  
  // Top 5 Thưởng Hiệu quả
  const topHQ = [...data].sort((a, b) => (b.tongHQ || 0) - (a.tongHQ || 0)).slice(0, 5);
  // Top 5 KPI
  const topKPI = [...data].sort((a, b) => (b.tongKPI || 0) - (a.tongKPI || 0)).slice(0, 5);
  // Top 5 Tổng cộng
  const topTotal = [...data].sort((a, b) => (b.tongCong || 0) - (a.tongCong || 0)).slice(0, 5);

  // Thống kê theo tháng HQ
  const monthlyHQStats = [
    { month: 'Tháng 1', total: data.reduce((s, i) => s + (i.hqT1 || 0), 0) },
    { month: 'Tháng 2', total: data.reduce((s, i) => s + (i.hqT2 || 0), 0) },
    { month: 'Tháng 3', total: data.reduce((s, i) => s + (i.hqT3 || 0), 0) },
    { month: 'Tháng 4', total: data.reduce((s, i) => s + (i.hqT4 || 0), 0) },
    { month: 'Tháng 5', total: data.reduce((s, i) => s + (i.hqT5 || 0), 0) },
    { month: 'Tháng 6', total: data.reduce((s, i) => s + (i.hqT6 || 0), 0) },
    { month: 'Tháng 7', total: data.reduce((s, i) => s + (i.hqT7 || 0), 0) },
  ];

  return {
    totalEmployees,
    totalKPI,
    totalHQ,
    totalPayout,
    avgPayout,
    topHQ,
    topKPI,
    topTotal,
    monthlyHQStats
  };
};

export default KPI_PERFORMANCE_DATA;
`;

  fs.writeFileSync(clientDataPath, fileContent, 'utf-8');
  console.log(`✓ Đã lưu file client data thành công tại: ${clientDataPath}`);

  db.close();
}

main().catch(err => {
  console.error('Lỗi sync:', err);
  db.close();
});
