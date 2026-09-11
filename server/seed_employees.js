import sqlite3 from 'sqlite3';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const dbPath = path.resolve(__dirname, 'hrm.db');

const rawData = [
  "VietA 002 | Võ Minh Cường | Nam | 1996-09-15 | 0379479666 | 083096001605 | 45/21 Lý Thường Kiệt – Phường Đạo Thạnh – Đồng Tháp | Ban giám đốc | Phó Giám đốc | Văn phòng Trụ sở chính | 2019-01-01 | Đang làm việc | Không xác định thời hạn | 8000000 | 0 | 2500000",
  "VietA 003 | Nguyễn Thị Thu Tâm | Nữ | 2000-12-20 | 0865384481 | 089300010599 | 30/3, Tổ 6 - Tân Huề 1 - Phường Long Xuyên - An Giang | Kho Cần Thơ | Quản lý kho Cần Thơ | Văn phòng Trụ sở chính | 2021-12-17 | Đang làm việc | Không xác định thời hạn | 8500000 | 0 | 2000000",
  "VietA 004 | Nguyễn Thị Thúy Vy | Nữ | 1998-02-14 | 0398637799 | 072198006365 | 27/14, Ấp Thiện Mỹ - Xã Vĩnh Thành - Vĩnh Long | Khối văn phòng | Kế toán thu mua | Văn phòng Trụ sở chính | 2024-04-15 | Đang làm việc | Không xác định thời hạn | 6600000 | 0 | 1000000",
  "VietA 006 | Phạm Thanh Phong | Nam | 2002-12-13 | 0799679148 | 086202008451 | Ấp Hòa An - Xã Mỹ Thuận - Vĩnh Long | Kho Cần Thơ | Kế toán kho Cần Thơ | Văn phòng Trụ sở chính | 2026-01-26 | Đang làm việc | Xác định thời hạn 1 năm | 5300000 | 0 | 1000000",
  "VietA 007 | Trần Thanh Hoài | Nam | 1990-11-11 | 0858841184 | 089090012814 | 30/3, Tổ 6 - Tân Huề 1 - Phường Long Xuyên - An Giang | Kho Cần Thơ | Tài xế Cần Thơ | Văn phòng Trụ sở chính | 2021-12-17 | Đang làm việc | Không xác định thời hạn | 6300000 | 0 | 1000000",
  "VietA 009 | Huỳnh Ngọc Dư | Nam | 1988-01-06 | 0345027879 | 083088008321 | Ấp Long Khánh , Xã Vĩnh Thành , Tỉnh Vĩnh Long | Kho Cần Thơ | Nhân viên kho Cần Thơ | Văn phòng Trụ sở chính | 2026-03-07 | Đang làm việc | Không xác định thời hạn | 4500000 | 0 | 1000000",
  "VietA 010 | Nguyễn Hải Duy | Nam | 2005-08-18 | 0775342500 | 092205002672 | An Thạnh - Cần Thơ | Kho Cần Thơ | Nhân viên giao hàng Cần Thơ | Văn phòng Trụ sở chính | 2025-08-27 | Đang làm việc | Không xác định thời hạn | 5000000 | 0 | 1000000",
  "VietA 011 | Lý Minh Trung | Nam | 2005-12-16 | 0763759714 | 092205007693 | 41/4 Võ Trường Toản - P Cái Khế - Tp Cần Thơ | Kho Cần Thơ | Nhân viên kho Cần Thơ | Văn phòng Trụ sở chính | 2026-03-02 | Đang làm việc | Không xác định thời hạn | 4900000 | 0 | 1000000",
  "VietA 012 | Võ Huỳnh Đông Nghi | Nam | 1998-12-20 | 0378378826 | 083098005420 | 27/14, Ấp Thiện Mỹ - Xã Vĩnh Thành - Vĩnh Long | Xưởng sản xuất nệm | Phó quản lý xưởng | Nhà máy Sản xuất Việt Á | 2024-04-15 | Đang làm việc | Không xác định thời hạn | 6000000 | 0 | 1500000",
  "VietA 013 | Hồ Minh Thuận | Nam | 1997-04-08 | 0778881115 | 083097004832 | 30/72, Ấp Quân Bình - Xã Vĩnh Thành - Vĩnh Long | Kho Cần Thơ | Nhân viên giao hàng Cần Thơ | Văn phòng Trụ sở chính | 2024-07-15 | Đang làm việc | Không xác định thời hạn | 4950000 | 0 | 1000000",
  "VietA 015 | Dương Thị Tuyết Hường | Nữ | 1996-03-24 | 0899047240 | 089196014882 | 30/3, Tổ 6 - Tân Huề 1 - Phường Long Xuyên - An Giang | Phòng kinh doanh | Nhân viên kinh doanh | Văn phòng Trụ sở chính | 2024-06-01 | Đang làm việc | Không xác định thời hạn | 6000000 | 0 | 1000000",
  "VietA 016 | Nguyễn Thị Huỳnh Như | Nữ | 2003-06-02 | 0702868212 | 089303001288 | 30/3, Tổ 6 - Tân Huề 1 - Phường Long Xuyên - An Giang | Phòng kinh doanh | Nhân viên kinh doanh | Văn phòng Trụ sở chính | 2022-05-15 | Đang làm việc | Không xác định thời hạn | 6000000 | 0 | 1000000",
  "VietA 017 | Trần Lương Ngọc Khánh | Nữ | 2002-09-17 | 0947690623 | 082302015629 | Ấp 1 - Xã Trung An - Mỹ Tho - Tiền Giang | Phòng kinh doanh | Nhân viên kinh doanh | Văn phòng Trụ sở chính | 2026-03-01 | Đang làm việc | | 6000000 | 0 | 1000000",
  "VietA 018 | Nguyễn Thị Ngọc Trâm | Nữ | 2002-08-16 | 0337077992 | 083302012510 | Ấp Hưng Điền - Xã Long Hưng - Châu Thành - Tiền Giang | Phòng kinh doanh | Nhân viên kinh doanh | Văn phòng Trụ sở chính | 2026-04-18 | Đang làm việc | | 6000000 | 0 | 1000000",
  "VietA 019 | Đoàn Hoài Linh | Nam | 1996-08-25 | 0352197368 | 082096004363 | Ấp Hưng Điền - Xã Long Hưng - Châu Thành - Tiền Giang | Phòng kinh doanh | Nhân viên kinh doanh | Văn phòng Trụ sở chính | 2026-06-01 | Đang làm việc | | 6000000 | 0 | 1000000",
  "VietA 020 | Đặng Hoàng Tuấn | Nam | 1994-06-25 | 0989397943 | 082094003192 | 87/15 Thủ Khoa Huân - Phường Tân Lập - Đồng Tháp | Kho Mỹ Tho | Kế toán kho Mỹ Tho | Văn phòng Trụ sở chính | 2026-03-01 | Đang làm việc | | 6000000 | 0 | 1000000",
  "VietA 022 | Nguyễn Tuấn Kiệt | Nam | 1994-11-20 | 0846505705 | 082094005378 | 175/7 Trần Hưng Đạo - Phường Trung An - Đồng Tháp | Kho Mỹ Tho | Quản lý kho Mỹ Tho | Văn phòng Trụ sở chính | 2024-04-15 | Đang làm việc | | 7000000 | 0 | 1500000",
  "VietA 023 | Nguyễn Hoàng Quân | Nam | 1985-05-18 | 0917226488 | 082085007094 | 202/2 Ấp Trung - Xã Long Định - Đồng Tháp | Kho Mỹ Tho | Tài xế Mỹ Tho | Văn phòng Trụ sở chính | 2025-06-01 | Đang làm việc | | 6000000 | 0 | 1000000",
  "VietA 024 | Nguyễn Hữu Tài | Nam | 2006-01-16 | 0929283756 | 082206001657 | 104, Ấp Tây 1 - Xã Long Định - Đồng Tháp | Kho Mỹ Tho | Nhân viên giao hàng Mỹ Tho | Văn phòng Trụ sở chính | 2022-08-01 | Đang làm việc | | 5100000 | 0 | 1000000",
  "VietA 026 | Phạm Minh Phúc | Nam | 2008-10-29 | 0926868670 | 082208008216 | 23/1 Ấp Hưng Điền - Long Hưng - Châu Thành - Tiền Giang | Kho Mỹ Tho | Nhân viên giao hàng Mỹ Tho | Văn phòng Trụ sở chính | 2025-12-22 | Đang làm việc | | 4700000 | 0 | 1000000",
  "VietA 027 | Phạm Ngọc Hiển | Nam | 1993-01-08 | 0855219412 | 074193003288 | 15/4 Ấp Phước Thuận - Xã Phước Lập - Tân Phước - Tiền Giang | Kho Mỹ Tho | Nhân viên giao hàng Mỹ Tho | Văn phòng Trụ sở chính | 2025-09-08 | Đang làm việc | | 4800000 | 0 | 1000000",
  "VietA 028 | Trần Hữu Lộc | Nam | 2003-09-08 | 0352220364 | 082203007627 | Ấp Hội Gia - Xã Mỹ Hạnh Đông - Cai Lậy - Tiền Giang | Kho Mỹ Tho | Nhân viên kho Mỹ Tho | Văn phòng Trụ sở chính | 2026-03-01 | Đang làm việc | | 5000000 | 0 | 1000000",
  "VietA 029 | Nguyễn Thị Thanh Tú | Nữ | 1996-03-08 | 0372138096 | 082196016147 | 120/19 Ấp 4 - Xã Trung An - Mỹ Tho - Tiền Giang | Khối văn phòng | Kế toán kho Mỹ Tho | Văn phòng Trụ sở chính | 2025-07-28 | Đang làm việc | | 6000000 | 0 | 1000000",
  "VietA 031 | Nguyễn Quốc Hùng | Nam | 1995-09-09 | 0948924042 | 082095014572 | Lê Thị Hồng Gấm - Phường Thới Sơn - Đồng Tháp | Khối văn phòng | Trưởng phòng kế toán | Văn phòng Trụ sở chính | 2025-08-01 | Đang làm việc | | 9000000 | 0 | 2000000",
  "VietA 032 | Huỳnh Thị Trúc Xinh | Nữ | 1989-11-20 | 0976527504 | 082189011901 | 150/1 Ấp Mỹ Thạnh - Xã Mỹ Phong - Mỹ Tho - Tiền Giang | Khối văn phòng | Kế toán công nợ | Văn phòng Trụ sở chính | 2025-08-01 | Đang làm việc | | 6000000 | 0 | 1000000",
  "VietA 033 | Nguyễn Quốc Huy | Nam | 1999-04-14 | 0846505704 | 087099006078 | Tổ 2 - Ấp Tân Hòa - Xã Tân Phú - Châu Thành - Đồng Tháp | Kho Mỹ Tho | Nhân viên giao hàng Mỹ Tho | Văn phòng Trụ sở chính | 2025-09-08 | Đang làm việc | | 4800000 | 0 | 1000000",
  "VietA 034 | Lê Thị Mỹ Phúc | Nữ | 2000-06-17 | 0793976378 | 089300015823 | Khóm Long Hưng 1- Phường Tân Châu - Tỉnh An Giang | Khối văn phòng | Kế toán viên | Văn phòng Trụ sở chính | 2025-09-08 | Đang làm việc | | 5800000 | 0 | 1000000",
  "VietA 035 | Lê Huy Hoàng | Nam | 1983-11-17 | 0975618456 | 089083017196 | Tổ 12 - Khóm Long Thạnh D - Phường Long Thạnh - Tân Châu - An Giang | Kho Mỹ Tho | Tài xế Mỹ Tho | Văn phòng Trụ sở chính | 2025-10-06 | Đang làm việc | | 6000000 | 0 | 1000000",
  "VietA 036 | Phạm Tấn Hưng | Nam | 1993-01-20 | 0774640498 | 052093004263 | Thôn Đắc Lộc - Xã Vĩnh Phương - Nha Trang - Khánh Hòa | Kho Mỹ Tho | Nhân viên kho Mỹ Tho | Văn phòng Trụ sở chính | 2025-10-06 | Đang làm việc | | 5100000 | 0 | 1000000",
  "VietA 037 | Nguyễn Thị Kim Hoàng | Nữ | 1995-10-18 | 0339598858 | 083195009137 | Ấp 1 - Xã Long Hưng - Huyện Châu Thành - Tiền Giang | Khối văn phòng | Kế toán thanh toán | Văn phòng Trụ sở chính | 2025-11-03 | Đang làm việc | | 6000000 | 0 | 1000000",
  "VietA 038 | Phạm Thị Xuân Khoa | Nữ | 2001-02-14 | 0939527581 | 091301005661 | Ấp An Nghiệp - Xã An Thạnh Thủy - Huyện Chợ Gạo - Tiền Giang | Phòng kinh doanh | Nhân viên kinh doanh | Văn phòng Trụ sở chính | 2025-11-17 | Đang làm việc | | 6000000 | 0 | 1000000",
  "VietA 040 | Võ Thanh Sơn | Nam | 1996-03-24 | 0969542034 | 087096002724 | Ấp Mỹ Thạnh - Xã Mỹ Xương - Huyện Cao Lãnh - Đồng Tháp | Kho Mỹ Tho | Nhân viên giao hàng Mỹ Tho | Văn phòng Trụ sở chính | 2026-03-01 | Đang làm việc | | 5100000 | 0 | 1000000",
  "VietA 041 | Phạm Phước Lành | Nam | 1992-06-03 | 0939023447 | 082092001757 | Ấp Phú Hưng - Xã Long Khánh - TX Cai Lậy - Tiền Giang | Kho Mỹ Tho | Nhân viên giao hàng Mỹ Tho | Văn phòng Trụ sở chính | 2026-03-01 | Đang làm việc | | 5100000 | 0 | 1000000",
  "VietA 042 | Ngô Thanh Tín | Nam | 2002-10-21 | 0964720977 | 082202014833 | Ấp Mỹ Hòa - Xã Mỹ Hạnh Trung - TX Cai Lậy - Tiền Giang | Kho Mỹ Tho | Nhân viên giao hàng Mỹ Tho | Văn phòng Trụ sở chính | 2026-03-01 | Đang làm việc | | 5000000 | 0 | 1000000",
  "VietA 043 | Phan Tuấn Kiệt | Nam | 1998-03-08 | 0961817448 | 083098005220 | Tổ 8 - Ấp Vĩnh Hưng - Xã Vĩnh Thành - Huyện Chợ Lách - Bến Tre | Phòng Marketing | Trưởng phòng Marketing | Văn phòng Trụ sở chính | 2026-03-10 | Đang làm việc | | 8000000 | 0 | 1000000",
  "VietA 046 | Nguyễn Thái Cần | Nam | 1991-03-20 | 0979434863 | 089091017399 | Khóm Tân Hòa - Phường An Hòa - Thị xã Sa Đéc - Đồng Tháp | Kho Mỹ Tho | Tài xế Mỹ Tho | Văn phòng Trụ sở chính | 2026-03-16 | Đang làm việc | | 6000000 | 0 | 1000000",
  "VietA 047 | Nguyễn Thành Lợi | Nam | 2005-12-30 | 0379479668 | 087205006463 | Ấp Hưng Điền - Xã Long Hưng - Huyện Châu Thành - Tiền Giang | Kho Mỹ Tho | Nhân viên giao hàng Mỹ Tho | Văn phòng Trụ sở chính | 2023-12-03 | Đang làm việc | | 5000000 | 0 | 1000000",
  "VietA 049 | Nguyễn Thị Ngọc | Nữ | 1971-10-20 | 0398637792 | 082171016635 | Ấp Hòa Lược - Xã Hòa Khánh - Huyện Cái Bè - Tiền Giang | Xưởng sản xuất nệm | Nhân viên may viền | Nhà máy Sản xuất Việt Á | 2024-04-15 | Đang làm việc | | 5000000 | 0 | 1000000",
  "VietA 050 | Trần Minh Lý | Nam | 1988-02-14 | 0799679142 | 089088005931 | Khóm Tân Thuận - Phường An Hòa - TP Sa Đéc - Đồng Tháp | Xưởng sản xuất nệm | Quản lý xưởng nệm | Nhà máy Sản xuất Việt Á | 2024-04-15 | Đang làm việc | | 8000000 | 0 | 2500000",
  "VietA 052 | Nguyễn Minh Văn | Nam | 2002-11-11 | 0858841182 | 082202008284 | Ấp Hưng Điền - Xã Long Hưng - Huyện Châu Thành - Tiền Giang | Xưởng sản xuất nệm | Nhân viên xưởng nệm | Nhà máy Sản xuất Việt Á | 2024-04-15 | Đang làm việc | | 6500000 | 0 | 1000000",
  "VietA 053 | Trịnh Dương Minh Nhựt | Nam | 2006-01-06 | 0345027872 | 091206010923 | Ấp Hòa Ninh - Xã An Thạnh Thủy - Huyện Chợ Gạo - Tiền Giang | Xưởng sản xuất nệm | Nhân viên xưởng nệm | Nhà máy Sản xuất Việt Á | 2024-04-15 | Đang làm việc | | 5350000 | 0 | 1000000",
  "VietA 054 | Võ Hoàng Tín | Nam | 2003-08-18 | 0775342502 | 083203013845 | Xã Lương Hòa - Huyện Giồng Trôm - Tỉnh Bến Tre | Xưởng sản xuất nệm | Nhân viên xưởng nệm | Nhà máy Sản xuất Việt Á | 2024-04-15 | Đang làm việc | | 6400000 | 0 | 1000000",
  "VietA 055 | Phan Quốc Khôi | Nam | 1986-12-16 | 0763759712 | 082086007613 | Xã Long Định - Huyện Châu Thành - Tiền Giang | Xưởng sản xuất nệm | Nhân viên dán tem | Nhà máy Sản xuất Việt Á | 2024-04-15 | Đang làm việc | | 6200000 | 0 | 1000000",
  "VietA 056 | Trần Thị Bảo Châu | Nữ | 2000-12-20 | 0378378822 | 082300005556 | Ấp Vĩnh Hòa - Xã Vĩnh Kim - Huyện Châu Thành - Tiền Giang | Xưởng sản xuất gối | Quản lý xưởng gối | Nhà máy Sản xuất Việt Á | 2024-04-15 | Đang làm việc | | 6000000 | 0 | 2500000",
  "VietA 058 | Nguyễn Thị Kim Hòa | Nữ | 1969-06-04 | 0961102922 | 083169010649 | Ấp Long Quới - Xã Chợ Lách - Tỉnh Vĩnh Long | Xưởng sản xuất nệm | Nhân viên may tay | Nhà máy Sản xuất Việt Á | 2024-05-13 | Đang làm việc | | 5000000 | 0 | 1000000",
  "VietA 060 | Trần Thị Kim Quyên | Nữ | 1978-05-14 | 0865384482 | 086178001153 | Ấp Hưng Điền - Xã Long Hưng - Huyện Châu Thành - Tiền Giang | Xưởng sản xuất gối | Nhân viên dán tem | Nhà máy Sản xuất Việt Á | 2024-05-20 | Đang làm việc | | 5050000 | 0 | 1500000",
  "VietA 061 | Lê Thanh Hồng | Nữ | 1970-07-15 | 0398637793 | 082170017036 | Ấp Hòa - Xã Nhị Bình - Huyện Châu Thành - Tiền Giang | Xưởng sản xuất nệm | Nhân viên may viền | Nhà máy Sản xuất Việt Á | 2024-06-03 | Đang làm việc | | 5450000 | 0 | 1500000",
  "VietA 063 | Lê Ngọc Tuấn | Nam | 1990-09-17 | 0799679143 | 082090015113 | Ấp Đông - Xã Kim Sơn - Huyện Châu Thành - Tiền Giang | Xưởng sản xuất nệm | Nhân viên xưởng nệm | Nhà máy Sản xuất Việt Á | 2024-06-25 | Đang làm việc | | 6500000 | 0 | 1500000",
  "VietA 066 | Nguyễn Thị Thùy Trang | Nữ | 1990-08-16 | 0858841183 | 082190005160 | Ấp Hưng Điền - Xã Long Hưng - Huyện Châu Thành - Tiền Giang | Xưởng sản xuất nệm | Nhân viên may viền | Nhà máy Sản xuất Việt Á | 2024-07-25 | Đang làm việc | | 5500000 | 0 | 1500000",
  "VietA 069 | Trương Hồng Quân | Nam | 1989-08-25 | 0345027873 | 082089004283 | Ấp Bắc A - Xã Điềm Hy - Huyện Châu Thành - Tiền Giang | Xưởng sản xuất nệm | Nhân viên xưởng nệm | Nhà máy Sản xuất Việt Á | 2024-11-20 | Đang làm việc | | 6200000 | 0 | 1000000",
  "VietA 070 | Nguyễn Thanh Hải | Nam | 2005-06-25 | 0775342503 | 079205036773 | 29/18 Đường số 2 - Phường Linh Chiểu - TP Thủ Đức - TP Hồ Chí Minh | Xưởng sản xuất nệm | Nhân viên xưởng nệm | Nhà máy Sản xuất Việt Á | 2024-11-20 | Đang làm việc | | 5200000 | 0 | 1000000",
  "VietA 071 | Nguyễn Dương Tiển | Nam | 1986-11-20 | 0763759713 | 082086008618 | Ấp Bình Tây - Xã Thạnh Phú - Huyện Châu Thành - Tiền Giang | Xưởng sản xuất nệm | Nhân viên xưởng nệm | Nhà máy Sản xuất Việt Á | 2024-11-20 | Đang làm việc | | 5200000 | 0 | 1000000",
  "VietA 074 | Nguyễn Thị Ngọc Huệ | Nữ | 1997-05-18 | 0378378823 | 083197004360 | Ấp Long Thuận - Xã Long Thới - Huyện Chợ Lách - Bến Tre | Xưởng sản xuất nệm | Nhân viên may viền | Nhà máy Sản xuất Việt Á | 2024-12-16 | Đang làm việc | | 5700000 | 0 | 1500000",
  "VietA 078 | Cổ Hoàn Lâm | Nam | 1983-01-16 | 0778881113 | 082083019173 | Ấp Hưng Điền - Xã Long Hưng - Huyện Châu Thành - Tiền Giang | Xưởng sản xuất nệm | Nhân viên xưởng nệm | Nhà máy Sản xuất Việt Á | 2025-06-03 | Đang làm việc | | 5000000 | 0 | 1000000",
  "VietA 080 | Nguyễn Minh Tấn Phát | Nam | 2009-11-26 | 0899047243 | 082209003205 | Ấp Hưng Điền - Long Hưng - Châu Thành - Tiền Giang | Xưởng sản xuất gối | Nhân viên dán tem | Nhà máy Sản xuất Việt Á | 2026-07-13 | Đang làm việc | | 5000000 | 0 | 1000000",
  "VietA 081 | Trần Gia Khải | Nam | 2004-09-08 | 0702868213 | 080204011302 | Ấp Kinh Mới - Xã Vĩnh Hòa - Huyện Ba Tri - Bến Tre | Kho Mỹ Tho | Nhân viên giao hàng Mỹ Tho | Văn phòng Trụ sở chính | 2026-08-10 | Đang làm việc | | 4800000 | 0 | 1000000",
  "VietA 082 | Nguyễn Huỳnh Trung Tín | Nam | 2005-02-12 | | 082205012978 | Ấp Long Phước - Long Định - Châu Thành - Tiền Giang | Kho Mỹ Tho | Nhân viên giao hàng Mỹ Tho | Văn phòng Trụ sở chính | 2026-08-17 | Đang làm việc | | 4900000 | 0 | 1000000"
];

const db = new sqlite3.Database(dbPath, (err) => {
  if (err) {
    console.error('Không thể kết nối SQLite:', err);
    process.exit(1);
  }
});

const run = (sql, params = []) => new Promise((resolve, reject) => {
  db.run(sql, params, function(err) {
    if (err) reject(err);
    else resolve(this);
  });
});

const get = (sql, params = []) => new Promise((resolve, reject) => {
  db.get(sql, params, (err, row) => {
    if (err) reject(err);
    else resolve(row);
  });
});

const all = (sql, params = []) => new Promise((resolve, reject) => {
  db.all(sql, params, (err, rows) => {
    if (err) reject(err);
    else resolve(rows);
  });
});

async function getOrCreateBranch(branchName) {
  if (!branchName) return null;
  const name = branchName.trim();
  let row = await get('SELECT id FROM branches WHERE name = ?', [name]);
  if (!row) {
    const res = await run('INSERT INTO branches (name, address) VALUES (?, ?)', [name, '']);
    return res.lastID;
  }
  return row.id;
}

async function getOrCreateDepartment(deptName, branchId) {
  if (!deptName) return null;
  const name = deptName.trim();
  let row = await get('SELECT id FROM departments WHERE name = ?', [name]);
  if (!row) {
    const res = await run('INSERT INTO departments (name, branch_id, is_active) VALUES (?, ?, 1)', [name, branchId || 1]);
    return res.lastID;
  }
  return row.id;
}

async function getOrCreatePosition(posName, deptId) {
  if (!posName) return null;
  const name = posName.trim();
  let row = await get('SELECT id FROM positions WHERE name = ?', [name]);
  if (!row) {
    const res = await run('INSERT INTO positions (name, department_id, is_active) VALUES (?, ?, 1)', [name, deptId || null]);
    return res.lastID;
  }
  return row.id;
}

async function seed() {
  console.log('=== BẮT ĐẦU CẬP NHẬT 57 NHÂN SỰ VÀO SQLite (hrm.db) ===\n');

  let upsertCount = 0;
  const now = new Date().toISOString();

  for (const line of rawData) {
    const parts = line.split('|').map(s => s.trim());
    if (parts.length < 14) continue;

    const [
      code,
      fullname,
      gender,
      dob,
      phone,
      cccd,
      address,
      deptName,
      posName,
      branchName,
      joinDate,
      status,
      contractType,
      baseSalaryStr,
      allowanceStr = '0',
      kpiBonusStr = '0'
    ] = parts;

    const baseSalary = parseFloat(baseSalaryStr) || 0;
    const allowance = parseFloat(allowanceStr) || 0;
    const kpiBonus = parseFloat(kpiBonusStr) || 0;

    // Resolve Branch, Department, Position
    const branchId = await getOrCreateBranch(branchName);
    const departmentId = await getOrCreateDepartment(deptName, branchId);
    const positionId = await getOrCreatePosition(posName, departmentId);

    // Format phone and cccd strings cleanly
    const formattedPhone = phone ? phone.trim() : '';
    const formattedCccd = cccd ? cccd.trim() : '';
    const formattedContractType = contractType ? contractType.trim() : 'Không xác định thời hạn';
    const formattedStatus = status ? status.trim() : 'Đang làm việc';

    // Upsert Employee (ON CONFLICT(code) DO UPDATE)
    const sql = `
      INSERT INTO employees (
        code, fullname, gender, dob, phone, cccd, address,
        branch_id, department_id, position_id, join_date,
        status, contract_type, base_salary, allowance, kpi_bonus,
        created_at, updated_at
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      ON CONFLICT(code) DO UPDATE SET
        fullname = excluded.fullname,
        gender = excluded.gender,
        dob = excluded.dob,
        phone = excluded.phone,
        cccd = excluded.cccd,
        address = excluded.address,
        branch_id = excluded.branch_id,
        department_id = excluded.department_id,
        position_id = excluded.position_id,
        join_date = excluded.join_date,
        status = excluded.status,
        contract_type = excluded.contract_type,
        base_salary = excluded.base_salary,
        allowance = excluded.allowance,
        kpi_bonus = excluded.kpi_bonus,
        updated_at = excluded.updated_at
    `;

    await run(sql, [
      code,
      fullname,
      gender,
      dob,
      formattedPhone,
      formattedCccd,
      address,
      branchId,
      departmentId,
      positionId,
      joinDate,
      formattedStatus,
      formattedContractType,
      baseSalary,
      allowance,
      kpiBonus,
      now,
      now
    ]);

    // Lấy employee_id vừa insert/update để đồng bộ KPI tháng 09/2026
    const emp = await get('SELECT id FROM employees WHERE code = ?', [code]);
    if (emp) {
      // Upsert vào bảng employee_monthly_kpis cho tháng 09/2026
      await run(`
        INSERT INTO employee_monthly_kpis (
          employee_id, month, year,
          responsibility_bonus, responsibility_penalty, responsibility_rate, responsibility_amount,
          performance_bonus, discipline_deduction, note, created_at, updated_at
        ) VALUES (?, '09', 2026, ?, 0, 1.0, ?, ?, 0, 'Nạp tự động tháng 09/2026', ?, ?)
        ON CONFLICT(employee_id, month, year) DO UPDATE SET
          responsibility_bonus = excluded.responsibility_bonus,
          responsibility_amount = excluded.responsibility_amount,
          performance_bonus = excluded.performance_bonus,
          updated_at = excluded.updated_at
      `, [emp.id, kpiBonus, kpiBonus, kpiBonus, now, now]);
    }

    upsertCount++;
    console.log(`✓ Đã nạp/cập nhật [${code}] - ${fullname} (Lương CB: ${baseSalary.toLocaleString('vi-VN')} đ, KPI: ${kpiBonus.toLocaleString('vi-VN')} đ)`);
  }

  console.log(`\n======================================================`);
  console.log(`HOÀN TẤT: Đã nạp thành công ${upsertCount}/57 nhân sự vào SQLite hrm.db!`);
  console.log(`======================================================\n`);

  db.close();
}

seed().catch(err => {
  console.error('Lỗi khi nạp dữ liệu:', err);
  db.close();
  process.exit(1);
});
