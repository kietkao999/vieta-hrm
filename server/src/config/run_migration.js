import { query } from './database.js';

export const SEED_EMPLOYEES_RAW = [
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
  "VietA 016 | Nguyễn Thị Quỳnh Như | Nữ | 2003-06-02 | 0702868212 | 089303001288 | 30/3, Tổ 6 - Tân Huề 1 - Phường Long Xuyên - An Giang | Phòng kinh doanh | Nhân viên kinh doanh | Văn phòng Trụ sở chính | 2022-05-15 | Đang làm việc | Không xác định thời hạn | 6000000 | 0 | 1000000",
  "VietA 017 | Trần Lương Ngọc Khánh | Nữ | 2002-09-17 | 0947690623 | 082302015629 | Ấp 1 - Xã Trung An - Mỹ Tho - Tiền Giang | Phòng kinh doanh | Nhân viên kinh doanh | Văn phòng Trụ sở chính | 2026-03-01 | Đang làm việc | Không xác định thời hạn | 6000000 | 0 | 1000000",
  "VietA 018 | Nguyễn Thị Ngọc Trâm | Nữ | 2002-08-16 | 0337077992 | 083302012510 | Ấp Hưng Điền - Xã Long Hưng - Châu Thành - Tiền Giang | Phòng kinh doanh | Nhân viên kinh doanh | Văn phòng Trụ sở chính | 2026-04-18 | Đang làm việc | Không xác định thời hạn | 6000000 | 0 | 1000000",
  "VietA 019 | Đoàn Hoài Linh | Nam | 1996-08-25 | 0352197368 | 082096004363 | Ấp Hưng Điền - Xã Long Hưng - Châu Thành - Tiền Giang | Phòng kinh doanh | Nhân viên kinh doanh | Văn phòng Trụ sở chính | 2026-06-01 | Đang làm việc | Không xác định thời hạn | 6000000 | 0 | 1000000",
  "VietA 020 | Đặng Hoàng Tuấn | Nam | 1994-06-25 | 0989397943 | 082094003192 | 87/15 Thủ Khoa Huân - Phường Tân Lập - Đồng Tháp | Kho Mỹ Tho | Kế toán kho Mỹ Tho | Văn phòng Trụ sở chính | 2026-03-01 | Đang làm việc | Không xác định thời hạn | 6000000 | 0 | 1000000",
  "VietA 022 | Nguyễn Tuấn Kiệt | Nam | 1994-11-20 | 0846505705 | 082094005378 | 175/7 Trần Hưng Đạo - Phường Trung An - Đồng Tháp | Kho Mỹ Tho | Quản lý kho Mỹ Tho | Văn phòng Trụ sở chính | 2024-04-15 | Đang làm việc | Không xác định thời hạn | 7000000 | 0 | 1500000",
  "VietA 023 | Nguyễn Hoàng Quân | Nam | 1985-05-18 | 0917226488 | 082085007094 | 202/2 Ấp Trung - Xã Long Định - Đồng Tháp | Kho Mỹ Tho | Tài xế Mỹ Tho | Văn phòng Trụ sở chính | 2025-06-01 | Đang làm việc | Không xác định thời hạn | 6000000 | 0 | 1000000",
  "VietA 024 | Nguyễn Hữu Tài | Nam | 2006-01-16 | 0929283756 | 082206001657 | 104, Ấp Tây 1 - Xã Long Định - Đồng Tháp | Kho Mỹ Tho | Nhân viên giao hàng Mỹ Tho | Văn phòng Trụ sở chính | 2022-08-01 | Đang làm việc | Không xác định thời hạn | 5100000 | 0 | 1000000",
  "VietA 026 | Phạm Minh Phúc | Nam | 2008-10-29 | 0926868670 | 082208008216 | 23/1 Ấp Hưng Điền - Long Hưng - Châu Thành - Tiền Giang | Kho Mỹ Tho | Nhân viên giao hàng Mỹ Tho | Văn phòng Trụ sở chính | 2025-12-22 | Đang làm việc | Không xác định thời hạn | 4700000 | 0 | 1000000",
  "VietA 027 | Phạm Ngọc Hiển | Nam | 1993-01-08 | 0855219412 | 074193003288 | 15/4 Ấp Phước Thuận - Xã Phước Lập - Tân Phước - Tiền Giang | Kho Mỹ Tho | Nhân viên giao hàng Mỹ Tho | Văn phòng Trụ sở chính | 2025-09-08 | Đang làm việc | Không xác định thời hạn | 4800000 | 0 | 1000000",
  "VietA 028 | Trần Hữu Lộc | Nam | 2003-09-08 | 0352220364 | 082203007627 | Ấp Hội Gia - Xã Mỹ Hạnh Đông - Cai Lậy - Tiền Giang | Kho Mỹ Tho | Nhân viên kho Mỹ Tho | Văn phòng Trụ sở chính | 2026-03-01 | Đang làm việc | Không xác định thời hạn | 5000000 | 0 | 1000000",
  "VietA 029 | Nguyễn Thị Thanh Tú | Nữ | 1996-03-08 | 0372138096 | 082196016147 | 120/19 Ấp 4 - Xã Trung An - Mỹ Tho - Tiền Giang | Khối văn phòng | Kế toán kho Mỹ Tho | Văn phòng Trụ sở chính | 2025-07-28 | Đang làm việc | Không xác định thời hạn | 6000000 | 0 | 1000000",
  "VietA 031 | Nguyễn Quốc Hùng | Nam | 1995-09-09 | 0948924042 | 082095014572 | Lê Thị Hồng Gấm - Phường Thới Sơn - Đồng Tháp | Khối văn phòng | Trưởng phòng kế toán | Văn phòng Trụ sở chính | 2025-08-01 | Đang làm việc | Không xác định thời hạn | 9000000 | 0 | 2000000",
  "VietA 032 | Huỳnh Thị Trúc Xinh | Nữ | 1989-11-20 | 0976527504 | 082189011901 | 150/1 Ấp Mỹ Thạnh - Xã Mỹ Phong - Mỹ Tho - Tiền Giang | Khối văn phòng | Kế toán công nợ | Văn phòng Trụ sở chính | 2025-08-01 | Đang làm việc | Không xác định thời hạn | 6000000 | 0 | 1000000",
  "VietA 033 | Nguyễn Quốc Huy | Nam | 1999-04-14 | 0846505704 | 087099006078 | Tổ 2 - Ấp Tân Hòa - Xã Tân Phú - Châu Thành - Đồng Tháp | Kho Mỹ Tho | Nhân viên giao hàng Mỹ Tho | Văn phòng Trụ sở chính | 2025-09-08 | Đang làm việc | Không xác định thời hạn | 4800000 | 0 | 1000000",
  "VietA 034 | Lê Thị Mỹ Phúc | Nữ | 2000-06-17 | 0793976378 | 089300015823 | Khóm Long Hưng 1- Phường Tân Châu - Tỉnh An Giang | Khối văn phòng | Kế toán viên | Văn phòng Trụ sở chính | 2025-09-08 | Đang làm việc | Không xác định thời hạn | 5800000 | 0 | 1000000",
  "VietA 035 | Lê Huy Hoàng | Nam | 1983-11-17 | 0975618456 | 089083017196 | Tổ 12 - Khóm Long Thạnh D - Phường Long Thạnh - Tân Châu - An Giang | Kho Mỹ Tho | Tài xế Mỹ Tho | Văn phòng Trụ sở chính | 2025-10-06 | Đang làm việc | Không xác định thời hạn | 6000000 | 0 | 1000000",
  "VietA 036 | Phạm Tấn Hưng | Nam | 1993-01-20 | 0774640498 | 052093004263 | Thôn Đắc Lộc - Xã Vĩnh Phương - Nha Trang - Khánh Hòa | Kho Mỹ Tho | Nhân viên kho Mỹ Tho | Văn phòng Trụ sở chính | 2025-10-06 | Đang làm việc | Không xác định thời hạn | 5100000 | 0 | 1000000",
  "VietA 037 | Nguyễn Thị Kim Hoàng | Nữ | 1995-10-18 | 0339598858 | 083195009137 | Ấp 1 - Xã Long Hưng - Huyện Châu Thành - Tiền Giang | Khối văn phòng | Kế toán thanh toán | Văn phòng Trụ sở chính | 2025-11-03 | Đang làm việc | Không xác định thời hạn | 6000000 | 0 | 1000000",
  "VietA 038 | Phạm Thị Xuân Khoa | Nữ | 2001-02-14 | 0939527581 | 091301005661 | Ấp An Nghiệp - Xã An Thạnh Thủy - Huyện Chợ Gạo - Tiền Giang | Phòng kinh doanh | Nhân viên kinh doanh | Văn phòng Trụ sở chính | 2025-11-17 | Đang làm việc | Không xác định thời hạn | 6000000 | 0 | 1000000",
  "VietA 040 | Võ Thanh Sơn | Nam | 1996-03-24 | 0969542034 | 087096002724 | Ấp Mỹ Thạnh - Xã Mỹ Xương - Huyện Cao Lãnh - Đồng Tháp | Kho Mỹ Tho | Nhân viên giao hàng Mỹ Tho | Văn phòng Trụ sở chính | 2026-03-01 | Đang làm việc | Không xác định thời hạn | 5100000 | 0 | 1000000",
  "VietA 041 | Phạm Phước Lành | Nam | 1992-06-03 | 0939023447 | 082092001757 | Ấp Phú Hưng - Xã Long Khánh - TX Cai Lậy - Tiền Giang | Kho Mỹ Tho | Nhân viên giao hàng Mỹ Tho | Văn phòng Trụ sở chính | 2026-03-01 | Đang làm việc | Không xác định thời hạn | 5100000 | 0 | 1000000",
  "VietA 042 | Ngô Thanh Tín | Nam | 2002-10-21 | 0964720977 | 082202014833 | Ấp Mỹ Hòa - Xã Mỹ Hạnh Trung - TX Cai Lậy - Tiền Giang | Kho Mỹ Tho | Nhân viên giao hàng Mỹ Tho | Văn phòng Trụ sở chính | 2026-03-01 | Đang làm việc | Không xác định thời hạn | 5000000 | 0 | 1000000",
  "VietA 043 | Phan Tuấn Kiệt | Nam | 1998-03-08 | 0961817448 | 083098005220 | Tổ 8 - Ấp Vĩnh Hưng - Xã Vĩnh Thành - Huyện Chợ Lách - Bến Tre | Phòng Marketing | Trưởng phòng Marketing | Văn phòng Trụ sở chính | 2026-03-10 | Đang làm việc | Không xác định thời hạn | 8000000 | 0 | 1000000",
  "VietA 046 | Nguyễn Thái Cần | Nam | 1991-03-20 | 0979434863 | 089091017399 | Khóm Tân Hòa - Phường An Hòa - Thị xã Sa Đéc - Đồng Tháp | Kho Mỹ Tho | Tài xế Mỹ Tho | Văn phòng Trụ sở chính | 2026-03-16 | Đang làm việc | Không xác định thời hạn | 6000000 | 0 | 1000000",
  "VietA 047 | Nguyễn Thành Lợi | Nam | 2005-12-30 | 0379479668 | 087205006463 | Ấp Hưng Điền - Xã Long Hưng - Huyện Châu Thành - Tiền Giang | Kho Mỹ Tho | Nhân viên giao hàng Mỹ Tho | Văn phòng Trụ sở chính | 2023-12-03 | Đang làm việc | Không xác định thời hạn | 5000000 | 0 | 1000000",
  "VietA 049 | Nguyễn Thị Ngọc | Nữ | 1971-10-20 | 0398637792 | 082171016635 | Ấp Hòa Lược - Xã Hòa Khánh - Huyện Cái Bè - Tiền Giang | Xưởng sản xuất nệm | Nhân viên may viền | Nhà máy Sản xuất Việt Á | 2024-04-15 | Đang làm việc | Không xác định thời hạn | 5000000 | 0 | 1000000",
  "VietA 050 | Trần Minh Lý | Nam | 1988-02-14 | 0799679142 | 089088005931 | Khóm Tân Thuận - Phường An Hòa - TP Sa Đéc - Đồng Tháp | Xưởng sản xuất nệm | Quản lý xưởng nệm | Nhà máy Sản xuất Việt Á | 2024-04-15 | Đang làm việc | Không xác định thời hạn | 8000000 | 0 | 2500000",
  "VietA 052 | Nguyễn Minh Văn | Nam | 2002-11-11 | 0858841182 | 082202008284 | Ấp Hưng Điền - Xã Long Hưng - Huyện Châu Thành - Tiền Giang | Xưởng sản xuất nệm | Nhân viên xưởng nệm | Nhà máy Sản xuất Việt Á | 2024-04-15 | Đang làm việc | Không xác định thời hạn | 6500000 | 0 | 1000000",
  "VietA 053 | Trịnh Dương Minh Nhựt | Nam | 2006-01-06 | 0345027872 | 091206010923 | Ấp Hòa Ninh - Xã An Thạnh Thủy - Huyện Chợ Gạo - Tiền Giang | Xưởng sản xuất nệm | Nhân viên xưởng nệm | Nhà máy Sản xuất Việt Á | 2024-04-15 | Đang làm việc | Không xác định thời hạn | 5350000 | 0 | 1000000",
  "VietA 054 | Võ Hoàng Tín | Nam | 2003-08-18 | 0775342502 | 083203013845 | Xã Lương Hòa - Huyện Giồng Trôm - Tỉnh Bến Tre | Xưởng sản xuất nệm | Nhân viên xưởng nệm | Nhà máy Sản xuất Việt Á | 2024-04-15 | Đang làm việc | Không xác định thời hạn | 6400000 | 0 | 1000000",
  "VietA 055 | Phan Quốc Khôi | Nam | 1986-12-16 | 0763759712 | 082086007613 | Xã Long Định - Huyện Châu Thành - Tiền Giang | Xưởng sản xuất nệm | Nhân viên dán tem | Nhà máy Sản xuất Việt Á | 2024-04-15 | Đang làm việc | Không xác định thời hạn | 6200000 | 0 | 1000000",
  "VietA 056 | Trần Thị Bảo Châu | Nữ | 2000-12-20 | 0378378822 | 082300005556 | Ấp Vĩnh Hòa - Xã Vĩnh Kim - Huyện Châu Thành - Tiền Giang | Xưởng sản xuất gối | Quản lý xưởng gối | Nhà máy Sản xuất Việt Á | 2024-04-15 | Đang làm việc | Không xác định thời hạn | 6000000 | 0 | 2500000",
  "VietA 058 | Nguyễn Thị Kim Hòa | Nữ | 1969-06-04 | 0961102922 | 083169010649 | Ấp Long Quới - Xã Chợ Lách - Tỉnh Vĩnh Long | Xưởng sản xuất nệm | Nhân viên may tay | Nhà máy Sản xuất Việt Á | 2024-05-13 | Đang làm việc | Không xác định thời hạn | 5000000 | 0 | 1000000",
  "VietA 060 | Trần Thị Kim Quyên | Nữ | 1978-05-14 | 0865384482 | 086178001153 | Ấp Hưng Điền - Xã Long Hưng - Huyện Châu Thành - Tiền Giang | Xưởng sản xuất gối | Nhân viên dán tem | Nhà máy Sản xuất Việt Á | 2024-05-20 | Đang làm việc | Không xác định thời hạn | 5050000 | 0 | 1500000",
  "VietA 061 | Lê Thanh Hồng | Nữ | 1970-07-15 | 0398637793 | 082170017036 | Ấp Hòa - Xã Nhị Bình - Huyện Châu Thành - Tiền Giang | Xưởng sản xuất nệm | Nhân viên may viền | Nhà máy Sản xuất Việt Á | 2024-06-03 | Đang làm việc | Không xác định thời hạn | 5450000 | 0 | 1500000",
  "VietA 063 | Lê Ngọc Tuấn | Nam | 1990-09-17 | 0799679143 | 082090015113 | Ấp Đông - Xã Kim Sơn - Huyện Châu Thành - Tiền Giang | Xưởng sản xuất nệm | Nhân viên xưởng nệm | Nhà máy Sản xuất Việt Á | 2024-06-25 | Đang làm việc | Không xác định thời hạn | 6500000 | 0 | 1500000",
  "VietA 066 | Nguyễn Thị Thùy Trang | Nữ | 1990-08-16 | 0858841183 | 082190005160 | Ấp Hưng Điền - Xã Long Hưng - Huyện Châu Thành - Tiền Giang | Xưởng sản xuất nệm | Nhân viên may viền | Nhà máy Sản xuất Việt Á | 2024-07-25 | Đang làm việc | Không xác định thời hạn | 5500000 | 0 | 1500000",
  "VietA 069 | Trương Hồng Quân | Nam | 1989-08-25 | 0345027873 | 082089004283 | Ấp Bắc A - Xã Điềm Hy - Huyện Châu Thành - Tiền Giang | Xưởng sản xuất nệm | Nhân viên xưởng nệm | Nhà máy Sản xuất Việt Á | 2024-11-20 | Đang làm việc | Không xác định thời hạn | 6200000 | 0 | 1000000",
  "VietA 070 | Nguyễn Thanh Hải | Nam | 2005-06-25 | 0775342503 | 079205036773 | 29/18 Đường số 2 - Phường Linh Chiểu - TP Thủ Đức - TP Hồ Chí Minh | Xưởng sản xuất nệm | Nhân viên xưởng nệm | Nhà máy Sản xuất Việt Á | 2024-11-20 | Đang làm việc | Không xác định thời hạn | 5200000 | 0 | 1000000",
  "VietA 071 | Nguyễn Dương Tiển | Nam | 1986-11-20 | 0763759713 | 082086008618 | Ấp Bình Tây - Xã Thạnh Phú - Huyện Châu Thành - Tiền Giang | Xưởng sản xuất nệm | Nhân viên xưởng nệm | Nhà máy Sản xuất Việt Á | 2024-11-20 | Đang làm việc | Không xác định thời hạn | 5200000 | 0 | 1000000",
  "VietA 074 | Nguyễn Thị Ngọc Huệ | Nữ | 1997-05-18 | 0378378823 | 083197004360 | Ấp Long Thuận - Xã Long Thới - Huyện Chợ Lách - Bến Tre | Xưởng sản xuất nệm | Nhân viên may viền | Nhà máy Sản xuất Việt Á | 2024-12-16 | Đang làm việc | Không xác định thời hạn | 5700000 | 0 | 1500000",
  "VietA 078 | Cổ Hoàn Lâm | Nam | 1983-01-16 | 0778881113 | 082083019173 | Ấp Hưng Điền - Xã Long Hưng - Huyện Châu Thành - Tiền Giang | Xưởng sản xuất nệm | Nhân viên xưởng nệm | Nhà máy Sản xuất Việt Á | 2025-06-03 | Đang làm việc | Không xác định thời hạn | 5000000 | 0 | 1000000",
  "VietA 080 | Nguyễn Minh Tấn Phát | Nam | 2009-11-26 | 0899047243 | 082209003205 | Ấp Hưng Điền - Long Hưng - Châu Thành - Tiền Giang | Xưởng sản xuất gối | Nhân viên dán tem | Nhà máy Sản xuất Việt Á | 2026-07-13 | Đang làm việc | Không xác định thời hạn | 5000000 | 0 | 1000000",
  "VietA 081 | Trần Gia Khải | Nam | 2004-09-08 | 0702868213 | 080204011302 | Ấp Kinh Mới - Xã Vĩnh Hòa - Huyện Ba Tri - Bến Tre | Kho Mỹ Tho | Nhân viên giao hàng Mỹ Tho | Văn phòng Trụ sở chính | 2026-08-10 | Đang làm việc | Không xác định thời hạn | 4800000 | 0 | 1000000",
  "VietA 082 | Nguyễn Huỳnh Trung Tín | Nam | 2005-02-12 | | 082205012978 | Ấp Long Phước - Long Định - Châu Thành - Tiền Giang | Kho Mỹ Tho | Nhân viên giao hàng Mỹ Tho | Văn phòng Trụ sở chính | 2026-08-17 | Đang làm việc | Không xác định thời hạn | 4900000 | 0 | 1000000"
];

export const RAW_KPI_PERFORMANCE = [
  { "stt": 1, "maNV": "VietA 050", "hoTen": "Trần Minh Lý", "kpiT5": 1750000, "kpiT6": 1500000, "kpiT7": 2000000, "tongKPI": 5250000, "hqT1": 8482016, "hqT2": 5040859, "hqT3": 6163567, "hqT4": 3698973, "hqT5": 4027656, "hqT6": 4768738, "hqT7": 5042190, "tongHQ": 37223999, "tongCong": 42473999 },
  { "stt": 2, "maNV": "VietA 055", "hoTen": "Phan Quốc Khôi", "kpiT5": 0, "kpiT6": 900000, "kpiT7": 1000000, "tongKPI": 1900000, "hqT1": 7730511, "hqT2": 3510798, "hqT3": 4290353, "hqT4": 866052, "hqT5": 1922202, "hqT6": 3441286, "hqT7": 4067310, "tongHQ": 25828512, "tongCong": 27728512 },
  { "stt": 3, "maNV": "VietA 052", "hoTen": "Nguyễn Minh Văn", "kpiT5": 0, "kpiT6": 0, "kpiT7": 0, "tongKPI": 0, "hqT1": 4653650, "hqT2": 2589700, "hqT3": 4875000, "hqT4": 3086500, "hqT5": 168000, "hqT6": 730100, "hqT7": 0, "tongHQ": 16102950, "tongCong": 16102950 },
  { "stt": 4, "maNV": "VietA 054", "hoTen": "Võ Hoàng Tín", "kpiT5": 0, "kpiT6": 1000000, "kpiT7": 1000000, "tongKPI": 2000000, "hqT1": 2621450, "hqT2": 1856125, "hqT3": 2921175, "hqT4": 1230775, "hqT5": 2279200, "hqT6": 2339250, "hqT7": 2095900, "tongHQ": 15343875, "tongCong": 17343875 },
  { "stt": 5, "maNV": "VietA 056", "hoTen": "Trần Thị Bảo Châu", "kpiT5": 0, "kpiT6": 1000000, "kpiT7": 1000000, "tongKPI": 2000000, "hqT1": 3332600, "hqT2": 2070300, "hqT3": 3531875, "hqT4": 1274250, "hqT5": 1006914, "hqT6": 1192184, "hqT7": 1260547, "tongHQ": 13668670, "tongCong": 15668670 },
  { "stt": 6, "maNV": "VietA 058", "hoTen": "Nguyễn Thị Kim Hòa", "kpiT5": 0, "kpiT6": 875000, "kpiT7": 1000000, "tongKPI": 1875000, "hqT1": 3427500, "hqT2": 1984350, "hqT3": 3134800, "hqT4": 1551575, "hqT5": 2252500, "hqT6": 2018650, "hqT7": 2552400, "tongHQ": 16921775, "tongCong": 18796775 },
  { "stt": 7, "maNV": "VietA 053", "hoTen": "Trịnh Dương Minh Nhựt", "kpiT5": 0, "kpiT6": 875000, "kpiT7": 1000000, "tongKPI": 1875000, "hqT1": 5502200, "hqT2": 4199400, "hqT3": 6052300, "hqT4": 2934700, "hqT5": 3188850, "hqT6": 3357250, "hqT7": 3270800, "tongHQ": 28505500, "tongCong": 30380500 },
  { "stt": 8, "maNV": "VietA 060", "hoTen": "Trần Thị Kim Quyên", "kpiT5": 0, "kpiT6": 950000, "kpiT7": 1000000, "tongKPI": 1950000, "hqT1": 3160600, "hqT2": 1833950, "hqT3": 3772350, "hqT4": 1989325, "hqT5": 2147675, "hqT6": 2444525, "hqT7": 2372200, "tongHQ": 17720625, "tongCong": 19670625 },
  { "stt": 9, "maNV": "VietA 066", "hoTen": "Nguyễn Thị Thùy Trang", "kpiT5": 0, "kpiT6": 1000000, "kpiT7": 1000000, "tongKPI": 2000000, "hqT1": 2120504, "hqT2": 1260215, "hqT3": 1540892, "hqT4": 1849486, "hqT5": 1006914, "hqT6": 1192184, "hqT7": 1260547, "tongHQ": 10230742, "tongCong": 12230742 },
  { "stt": 10, "maNV": "VietA 061", "hoTen": "Lê Thanh Hồng", "kpiT5": 0, "kpiT6": 950000, "kpiT7": 1000000, "tongKPI": 1950000, "hqT1": 2674425, "hqT2": 1614150, "hqT3": 3313050, "hqT4": 1503100, "hqT5": 2462125, "hqT6": 1540050, "hqT7": 2146200, "tongHQ": 15253100, "tongCong": 17203100 },
  { "stt": 11, "maNV": "VietA 063", "hoTen": "Lê Ngọc Tuấn", "kpiT5": 0, "kpiT6": 1000000, "kpiT7": 1000000, "tongKPI": 2000000, "hqT1": 2787750, "hqT2": 1765500, "hqT3": 3050500, "hqT4": 1258750, "hqT5": 2583500, "hqT6": 2439750, "hqT7": 2232750, "tongHQ": 16118500, "tongCong": 18118500 },
  { "stt": 12, "maNV": "VietA 083", "hoTen": "Mai Văn Sang", "kpiT5": 0, "kpiT6": 950000, "kpiT7": 1000000, "tongKPI": 1950000, "hqT1": 2787750, "hqT2": 1765500, "hqT3": 3050500, "hqT4": 1258750, "hqT5": 2542550, "hqT6": 2212350, "hqT7": 2213000, "tongHQ": 15830400, "tongCong": 17780400 },
  { "stt": 13, "maNV": "VietA 084", "hoTen": "Dương Minh Phụng", "kpiT5": 0, "kpiT6": 950000, "kpiT7": 1000000, "tongKPI": 1950000, "hqT1": 2988775, "hqT2": 1827450, "hqT3": 2886000, "hqT4": 1475500, "hqT5": 2341400, "hqT6": 2244200, "hqT7": 2267450, "tongHQ": 16030775, "tongCong": 17980775 },
  { "stt": 14, "maNV": "VietA 085", "hoTen": "Huỳnh Minh Sang", "kpiT5": 0, "kpiT6": 900000, "kpiT7": 1000000, "tongKPI": 1900000, "hqT1": 2772000, "hqT2": 1930500, "hqT3": 3496500, "hqT4": 1493250, "hqT5": 2420000, "hqT6": 2189000, "hqT7": 2185000, "tongHQ": 16486250, "tongCong": 18386250 },
  { "stt": 15, "maNV": "VietA 086", "hoTen": "Phạm Thị Thảo Nguyên", "kpiT5": 0, "kpiT6": 1000000, "kpiT7": 1000000, "tongKPI": 2000000, "hqT1": 2574000, "hqT2": 1732500, "hqT3": 3135000, "hqT4": 1339800, "hqT5": 2171400, "hqT6": 1964100, "hqT7": 1945800, "tongHQ": 14862600, "tongCong": 16862600 },
  { "stt": 16, "maNV": "VietA 087", "hoTen": "Trương Thanh Tấn", "kpiT5": 0, "kpiT6": 875000, "kpiT7": 1000000, "tongKPI": 1875000, "hqT1": 2475000, "hqT2": 1930500, "hqT3": 3135000, "hqT4": 1339800, "hqT5": 2409000, "hqT6": 2099900, "hqT7": 1945600, "tongHQ": 15334800, "tongCong": 17209800 },
  { "stt": 17, "maNV": "VietA 088", "hoTen": "Nguyễn Huỳnh Duy", "kpiT5": 0, "kpiT6": 875000, "kpiT7": 1000000, "tongKPI": 1875000, "hqT1": 2673000, "hqT2": 1732500, "hqT3": 3333000, "hqT4": 1424525, "hqT5": 2307800, "hqT6": 1945150, "hqT7": 2005800, "tongHQ": 15421775, "tongCong": 17296775 },
  { "stt": 18, "maNV": "VietA 089", "hoTen": "Võ Hoàng Long", "kpiT5": 0, "kpiT6": 875000, "kpiT7": 1000000, "tongKPI": 1875000, "hqT1": 2772000, "hqT2": 1831500, "hqT3": 3135000, "hqT4": 1339800, "hqT5": 2226400, "hqT6": 2011350, "hqT7": 2051600, "tongHQ": 15367650, "tongCong": 17242650 },
  { "stt": 19, "maNV": "VietA 090", "hoTen": "Trần Minh Thư", "kpiT5": 0, "kpiT6": 875000, "kpiT7": 1000000, "tongKPI": 1875000, "hqT1": 2574000, "hqT2": 1732500, "hqT3": 3135000, "hqT4": 1339800, "hqT5": 2171400, "hqT6": 1964100, "hqT7": 1945800, "tongHQ": 14862600, "tongCong": 16737600 },
  { "stt": 20, "maNV": "VietA 091", "hoTen": "Lê Thị Bé Ba", "kpiT5": 0, "kpiT6": 1000000, "kpiT7": 1000000, "tongKPI": 2000000, "hqT1": 2574000, "hqT2": 1732500, "hqT3": 3135000, "hqT4": 1339800, "hqT5": 2171400, "hqT6": 1964100, "hqT7": 1702175, "tongHQ": 14618975, "tongCong": 16618975 },
  { "stt": 21, "maNV": "VietA 092", "hoTen": "Trương Trọng Nghĩa", "kpiT5": 0, "kpiT6": 800000, "kpiT7": 1000000, "tongKPI": 1800000, "hqT1": 2376000, "hqT2": 1599000, "hqT3": 2891000, "hqT4": 1235600, "hqT5": 2002400, "hqT6": 1811300, "hqT7": 1967500, "tongHQ": 13882800, "tongCong": 15682800 },
  { "stt": 22, "maNV": "VietA 093", "hoTen": "Nguyễn Thị Thúy Vân", "kpiT5": 0, "kpiT6": 1000000, "kpiT7": 1000000, "tongKPI": 2000000, "hqT1": 2178000, "hqT2": 1465500, "hqT3": 2647000, "hqT4": 1131400, "hqT5": 1833400, "hqT6": 1658500, "hqT7": 1980600, "tongHQ": 12894400, "tongCong": 14894400 },
  { "stt": 23, "maNV": "VietA 094", "hoTen": "Lê Thị Mỹ Thuận", "kpiT5": 0, "kpiT6": 1000000, "kpiT7": 1000000, "tongKPI": 2000000, "hqT1": 2574000, "hqT2": 1732500, "hqT3": 3135000, "hqT4": 1339800, "hqT5": 2171400, "hqT6": 1964100, "hqT7": 1945800, "tongHQ": 14862600, "tongCong": 16862600 },
  { "stt": 24, "maNV": "VietA 095", "hoTen": "Nguyễn Thị Ngọc Đào", "kpiT5": 0, "kpiT6": 1000000, "kpiT7": 1000000, "tongKPI": 2000000, "hqT1": 2574000, "hqT2": 1732500, "hqT3": 3135000, "hqT4": 1339800, "hqT5": 2171400, "hqT6": 1964100, "hqT7": 1945800, "tongHQ": 14862600, "tongCong": 16862600 },
  { "stt": 25, "maNV": "VietA 096", "hoTen": "Võ Thị Ngọc Nhanh", "kpiT5": 0, "kpiT6": 900000, "kpiT7": 1000000, "tongKPI": 1900000, "hqT1": 2574000, "hqT2": 1732500, "hqT3": 3135000, "hqT4": 1339800, "hqT5": 2171400, "hqT6": 1964100, "hqT7": 1945800, "tongHQ": 14862600, "tongCong": 16762600 },
  { "stt": 26, "maNV": "VietA 097", "hoTen": "Nguyễn Ngọc Anh Thư", "kpiT5": 0, "kpiT6": 1000000, "kpiT7": 1000000, "tongKPI": 2000000, "hqT1": 2574000, "hqT2": 1732500, "hqT3": 3135000, "hqT4": 1339800, "hqT5": 2171400, "hqT6": 1964100, "hqT7": 1945800, "tongHQ": 14862600, "tongCong": 16862600 },
  { "stt": 27, "maNV": "VietA 098", "hoTen": "Nguyễn Thành Tài", "kpiT5": 0, "kpiT6": 1000000, "kpiT7": 1000000, "tongKPI": 2000000, "hqT1": 2574000, "hqT2": 1732500, "hqT3": 3135000, "hqT4": 1339800, "hqT5": 2171400, "hqT6": 1964100, "hqT7": 1945800, "tongHQ": 14862600, "tongCong": 16862600 },
  { "stt": 28, "maNV": "VietA 099", "hoTen": "Võ Thị Huỳnh Mai", "kpiT5": 0, "kpiT6": 900000, "kpiT7": 1000000, "tongKPI": 1900000, "hqT1": 2574000, "hqT2": 1732500, "hqT3": 3135000, "hqT4": 1339800, "hqT5": 2171400, "hqT6": 1964100, "hqT7": 1945800, "tongHQ": 14862600, "tongCong": 16762600 },
  { "stt": 29, "maNV": "VietA 100", "hoTen": "Trần Mỹ Linh", "kpiT5": 0, "kpiT6": 950000, "kpiT7": 1000000, "tongKPI": 1950000, "hqT1": 2574000, "hqT2": 1732500, "hqT3": 3135000, "hqT4": 1339800, "hqT5": 2171400, "hqT6": 1964100, "hqT7": 1945800, "tongHQ": 14862600, "tongCong": 16812600 },
  { "stt": 30, "maNV": "VietA 101", "hoTen": "Lê Thị Thúy Kiều", "kpiT5": 0, "kpiT6": 900000, "kpiT7": 1000000, "tongKPI": 1900000, "hqT1": 2574000, "hqT2": 1732500, "hqT3": 3135000, "hqT4": 1339800, "hqT5": 2171400, "hqT6": 1964100, "hqT7": 1945800, "tongHQ": 14862600, "tongCong": 16762600 },
  { "stt": 31, "maNV": "VietA 102", "hoTen": "Mai Hồng Nhung", "kpiT5": 0, "kpiT6": 950000, "kpiT7": 1000000, "tongKPI": 1950000, "hqT1": 2574000, "hqT2": 1732500, "hqT3": 3135000, "hqT4": 1339800, "hqT5": 2171400, "hqT6": 1964100, "hqT7": 1945800, "tongHQ": 14862600, "tongCong": 16812600 },
  { "stt": 32, "maNV": "VietA 103", "hoTen": "Nguyễn Huỳnh Long", "kpiT5": 0, "kpiT6": 900000, "kpiT7": 1000000, "tongKPI": 1900000, "hqT1": 2574000, "hqT2": 1732500, "hqT3": 3135000, "hqT4": 1339800, "hqT5": 2171400, "hqT6": 1964100, "hqT7": 1945800, "tongHQ": 14862600, "tongCong": 16762600 },
  { "stt": 33, "maNV": "VietA 104", "hoTen": "Đỗ Huỳnh Phúc", "kpiT5": 0, "kpiT6": 900000, "kpiT7": 1000000, "tongKPI": 1900000, "hqT1": 2574000, "hqT2": 1732500, "hqT3": 3135000, "hqT4": 1339800, "hqT5": 2171400, "hqT6": 1964100, "hqT7": 1945800, "tongHQ": 14862600, "tongCong": 16762600 },
  { "stt": 34, "maNV": "VietA 105", "hoTen": "Lê Phương Linh", "kpiT5": 0, "kpiT6": 1000000, "kpiT7": 1000000, "tongKPI": 2000000, "hqT1": 2574000, "hqT2": 1732500, "hqT3": 3135000, "hqT4": 1339800, "hqT5": 2171400, "hqT6": 1964100, "hqT7": 1945800, "tongHQ": 14862600, "tongCong": 16862600 },
  { "stt": 35, "maNV": "VietA 106", "hoTen": "Trần Thị Bé Loan", "kpiT5": 0, "kpiT6": 1000000, "kpiT7": 1000000, "tongKPI": 2000000, "hqT1": 2574000, "hqT2": 1732500, "hqT3": 3135000, "hqT4": 1339800, "hqT5": 2171400, "hqT6": 1964100, "hqT7": 1945800, "tongHQ": 14862600, "tongCong": 16862600 },
  { "stt": 36, "maNV": "VietA 107", "hoTen": "Hồ Huỳnh Thơ", "kpiT5": 0, "kpiT6": 950000, "kpiT7": 1000000, "tongKPI": 1950000, "hqT1": 2574000, "hqT2": 1732500, "hqT3": 3135000, "hqT4": 1339800, "hqT5": 2171400, "hqT6": 1964100, "hqT7": 1945800, "tongHQ": 14862600, "tongCong": 16812600 },
  { "stt": 37, "maNV": "VietA 108", "hoTen": "Trần Công Thành", "kpiT5": 0, "kpiT6": 950000, "kpiT7": 1000000, "tongKPI": 1950000, "hqT1": 2574000, "hqT2": 1732500, "hqT3": 3135000, "hqT4": 1339800, "hqT5": 2171400, "hqT6": 1964100, "hqT7": 1945800, "tongHQ": 14862600, "tongCong": 16812600 },
  { "stt": 38, "maNV": "VietA 109", "hoTen": "Võ Thị Thủy Tiên", "kpiT5": 0, "kpiT6": 950000, "kpiT7": 1000000, "tongKPI": 1950000, "hqT1": 2574000, "hqT2": 1732500, "hqT3": 3135000, "hqT4": 1339800, "hqT5": 2171400, "hqT6": 1964100, "hqT7": 1945800, "tongHQ": 14862600, "tongCong": 16812600 },
  { "stt": 39, "maNV": "VietA 110", "hoTen": "Phạm Thị Thảo Quyên", "kpiT5": 0, "kpiT6": 1000000, "kpiT7": 1000000, "tongKPI": 2000000, "hqT1": 2574000, "hqT2": 1732500, "hqT3": 3135000, "hqT4": 1339800, "hqT5": 2171400, "hqT6": 1964100, "hqT7": 1945800, "tongHQ": 14862600, "tongCong": 16862600 },
  { "stt": 40, "maNV": "VietA 111", "hoTen": "Nguyễn Thị Bích Loan", "kpiT5": 0, "kpiT6": 1000000, "kpiT7": 1000000, "tongKPI": 2000000, "hqT1": 2574000, "hqT2": 1732500, "hqT3": 3135000, "hqT4": 1339800, "hqT5": 2171400, "hqT6": 1964100, "hqT7": 1945800, "tongHQ": 14862600, "tongCong": 16862600 },
  { "stt": 41, "maNV": "VietA 112", "hoTen": "Lê Minh Thuận", "kpiT5": 0, "kpiT6": 950000, "kpiT7": 1000000, "tongKPI": 1950000, "hqT1": 2574000, "hqT2": 1732500, "hqT3": 3135000, "hqT4": 1339800, "hqT5": 2171400, "hqT6": 1964100, "hqT7": 1945800, "tongHQ": 14862600, "tongCong": 16812600 },
  { "stt": 42, "maNV": "VietA 113", "hoTen": "Huỳnh Thị Ánh Quyên", "kpiT5": 0, "kpiT6": 950000, "kpiT7": 1000000, "tongKPI": 1950000, "hqT1": 2574000, "hqT2": 1732500, "hqT3": 3135000, "hqT4": 1339800, "hqT5": 2171400, "hqT6": 1964100, "hqT7": 1945800, "tongHQ": 14862600, "tongCong": 16812600 },
  { "stt": 43, "maNV": "VietA 114", "hoTen": "Lê Thị Bé Tám", "kpiT5": 0, "kpiT6": 1000000, "kpiT7": 1000000, "tongKPI": 2000000, "hqT1": 2574000, "hqT2": 1732500, "hqT3": 3135000, "hqT4": 1339800, "hqT5": 2171400, "hqT6": 1964100, "hqT7": 1945800, "tongHQ": 14862600, "tongCong": 16862600 },
  { "stt": 44, "maNV": "VietA 115", "hoTen": "Huỳnh Thị Hồng Quyên", "kpiT5": 0, "kpiT6": 1000000, "kpiT7": 1000000, "tongKPI": 2000000, "hqT1": 2574000, "hqT2": 1732500, "hqT3": 3135000, "hqT4": 1339800, "hqT5": 2171400, "hqT6": 1964100, "hqT7": 1945800, "tongHQ": 14862600, "tongCong": 16862600 },
  { "stt": 45, "maNV": "VietA 116", "hoTen": "Nguyễn Văn Trí", "kpiT5": 0, "kpiT6": 1000000, "kpiT7": 1000000, "tongKPI": 2000000, "hqT1": 2574000, "hqT2": 1732500, "hqT3": 3135000, "hqT4": 1339800, "hqT5": 2171400, "hqT6": 1964100, "hqT7": 1945800, "tongHQ": 14862600, "tongCong": 16862600 },
  { "stt": 46, "maNV": "VietA 117", "hoTen": "Nguyễn Quốc Bảo", "kpiT5": 0, "kpiT6": 1000000, "kpiT7": 1000000, "tongKPI": 2000000, "hqT1": 2574000, "hqT2": 1732500, "hqT3": 3135000, "hqT4": 1339800, "hqT5": 2171400, "hqT6": 1964100, "hqT7": 1945800, "tongHQ": 14862600, "tongCong": 16862600 },
  { "stt": 47, "maNV": "VietA 118", "hoTen": "Nguyễn Văn Hoàng", "kpiT5": 0, "kpiT6": 1000000, "kpiT7": 1000000, "tongKPI": 2000000, "hqT1": 2574000, "hqT2": 1732500, "hqT3": 3135000, "hqT4": 1339800, "hqT5": 2171400, "hqT6": 1964100, "hqT7": 1945800, "tongHQ": 14862600, "tongCong": 16862600 },
  { "stt": 48, "maNV": "VietA 119", "hoTen": "Phan Nguyễn Nhựt Đăng", "kpiT5": 0, "kpiT6": 1000000, "kpiT7": 1000000, "tongKPI": 2000000, "hqT1": 2574000, "hqT2": 1732500, "hqT3": 3135000, "hqT4": 1339800, "hqT5": 2171400, "hqT6": 1964100, "hqT7": 1945800, "tongHQ": 14862600, "tongCong": 16862600 },
  { "stt": 49, "maNV": "VietA 120", "hoTen": "Lê Minh Hiếu", "kpiT5": 0, "kpiT6": 900000, "kpiT7": 1000000, "tongKPI": 1900000, "hqT1": 2574000, "hqT2": 1732500, "hqT3": 3135000, "hqT4": 1339800, "hqT5": 2171400, "hqT6": 1964100, "hqT7": 1945800, "tongHQ": 14862600, "tongCong": 16762600 },
  { "stt": 50, "maNV": "VietA 121", "hoTen": "Trần Thái Hòa", "kpiT5": 0, "kpiT6": 950000, "kpiT7": 1000000, "tongKPI": 1950000, "hqT1": 2574000, "hqT2": 1732500, "hqT3": 3135000, "hqT4": 1339800, "hqT5": 2171400, "hqT6": 1964100, "hqT7": 1945800, "tongHQ": 14862600, "tongCong": 16812600 },
  { "stt": 51, "maNV": "VietA 122", "hoTen": "Đặng Huỳnh Anh Thư", "kpiT5": 0, "kpiT6": 1000000, "kpiT7": 1000000, "tongKPI": 2000000, "hqT1": 2574000, "hqT2": 1732500, "hqT3": 3135000, "hqT4": 1339800, "hqT5": 2171400, "hqT6": 1964100, "hqT7": 1945800, "tongHQ": 14862600, "tongCong": 16862600 },
  { "stt": 52, "maNV": "VietA 123", "hoTen": "Nguyễn Duy Thịnh", "kpiT5": 0, "kpiT6": 1000000, "kpiT7": 1000000, "tongKPI": 2000000, "hqT1": 2574000, "hqT2": 1732500, "hqT3": 3135000, "hqT4": 1339800, "hqT5": 2171400, "hqT6": 1964100, "hqT7": 1945800, "tongHQ": 14862600, "tongCong": 16862600 },
  { "stt": 53, "maNV": "VietA 124", "hoTen": "Nguyễn Thị Thúy Vân", "kpiT5": 0, "kpiT6": 1000000, "kpiT7": 1000000, "tongKPI": 2000000, "hqT1": 2574000, "hqT2": 1732500, "hqT3": 3135000, "hqT4": 1339800, "hqT5": 2171400, "hqT6": 1964100, "hqT7": 1945800, "tongHQ": 14862600, "tongCong": 16862600 },
  { "stt": 54, "maNV": "VietA 042", "hoTen": "Ngô Thanh Tín", "kpiT5": 0, "kpiT6": 1500000, "kpiT7": 1500000, "tongKPI": 3000000, "hqT1": 0, "hqT2": 0, "hqT3": 2521128, "hqT4": 2971615, "hqT5": 395330, "hqT6": 2903517, "hqT7": 5779988, "tongHQ": 14571578, "tongCong": 17571578 },
  { "stt": 55, "maNV": "VietA 043", "hoTen": "Phan Tuấn Kiệt", "kpiT5": 0, "kpiT6": 0, "kpiT7": 0, "tongKPI": 0, "hqT1": 4945483, "hqT2": 3437844, "hqT3": 0, "hqT4": 0, "hqT5": 0, "hqT6": 0, "hqT7": 0, "tongHQ": 8383327, "tongCong": 8383327 },
  { "stt": 56, "maNV": "VietA 043", "hoTen": "Phan Tuấn Kiệt", "kpiT5": 1750000, "kpiT6": 2000000, "kpiT7": 1500000, "tongKPI": 5250000, "hqT1": 2125000, "hqT2": 0, "hqT3": 1050000, "hqT4": 2125000, "hqT5": 2366667, "hqT6": 1000000, "hqT7": 0, "tongHQ": 8666667, "tongCong": 13916667 },
  { "stt": 57, "maNV": "VietA 002", "hoTen": "Võ Minh Cường", "kpiT5": 2500000, "kpiT6": 2500000, "kpiT7": 2500000, "tongKPI": 7500000, "hqT1": 34323841, "hqT2": 24907296, "hqT3": 21221673, "hqT4": 13125273, "hqT5": 13981350, "hqT6": 18033056, "hqT7": 19943542, "tongHQ": 145536031, "tongCong": 153036031 },
  { "stt": 58, "maNV": "VietA 004", "hoTen": "Nguyễn Thị Thúy Vy", "kpiT5": 0, "kpiT6": 1000000, "kpiT7": 1000000, "tongKPI": 2000000, "hqT1": 0, "hqT2": 0, "hqT3": 0, "hqT4": 0, "hqT5": 469501, "hqT6": 571149, "hqT7": 622385, "tongHQ": 1663035, "tongCong": 3663035 },
  { "stt": 59, "maNV": "VietA 031", "hoTen": "Nguyễn Quốc Hùng", "kpiT5": 0, "kpiT6": 2000000, "kpiT7": 2000000, "tongKPI": 4000000, "hqT1": 0, "hqT2": 0, "hqT3": 0, "hqT4": 0, "hqT5": 0, "hqT6": 0, "hqT7": 0, "tongHQ": 0, "tongCong": 4000000 },
  { "stt": 60, "maNV": "VietA 032", "hoTen": "Huỳnh Thị Trúc Xinh", "kpiT5": 0, "kpiT6": 1000000, "kpiT7": 1000000, "tongKPI": 2000000, "hqT1": 1387055, "hqT2": 1024954, "hqT3": 842801, "hqT4": 587402, "hqT5": 469501, "hqT6": 571149, "hqT7": 622385, "tongHQ": 5505247, "tongCong": 7505247 },
  { "stt": 61, "maNV": "VietA 033", "hoTen": "Nguyễn Quốc Huy", "kpiT5": 0, "kpiT6": 750000, "kpiT7": 1000000, "tongKPI": 1750000, "hqT1": 1387055, "hqT2": 1024954, "hqT3": 842801, "hqT4": 587402, "hqT5": 469501, "hqT6": 571149, "hqT7": 622385, "tongHQ": 5505247, "tongCong": 7255247 },
  { "stt": 62, "maNV": "VietA 034", "hoTen": "Lê Thị Mỹ Phúc", "kpiT5": 0, "kpiT6": 1000000, "kpiT7": 1000000, "tongKPI": 2000000, "hqT1": 1387055, "hqT2": 1024954, "hqT3": 842801, "hqT4": 587402, "hqT5": 469501, "hqT6": 571149, "hqT7": 622385, "tongHQ": 5505247, "tongCong": 7505247 },
  { "stt": 63, "maNV": "VietA 035", "hoTen": "Lê Huy Hoàng", "kpiT5": 0, "kpiT6": 2000000, "kpiT7": 2000000, "tongKPI": 4000000, "hqT1": 1387055, "hqT2": 1024954, "hqT3": 842801, "hqT4": 587402, "hqT5": 469501, "hqT6": 571149, "hqT7": 622385, "tongHQ": 5505247, "tongCong": 9505247 }
];

async function getOrCreateBranch(branchName) {
  if (!branchName) return 1;
  const name = branchName.trim();
  let row = await query.get('SELECT id FROM branches WHERE name = ?', [name]);
  if (!row) {
    const res = await query.run('INSERT INTO branches (name, address) VALUES (?, ?)', [name, '']);
    return res.lastID;
  }
  return row.id;
}

async function getOrCreateDepartment(deptName, branchId) {
  if (!deptName) return 1;
  const name = deptName.trim();
  let row = await query.get('SELECT id FROM departments WHERE name = ?', [name]);
  if (!row) {
    const res = await query.run('INSERT INTO departments (name, branch_id, is_active) VALUES (?, ?, 1)', [name, branchId || 1]);
    return res.lastID;
  }
  return row.id;
}

async function getOrCreatePosition(posName, deptId) {
  if (!posName) return 1;
  const name = posName.trim();
  let row = await query.get('SELECT id FROM positions WHERE name = ?', [name]);
  if (!row) {
    const res = await query.run('INSERT INTO positions (name, department_id, is_active) VALUES (?, ?, 1)', [name, deptId || null]);
    return res.lastID;
  }
  return row.id;
}

export async function runMigration() {
  try {
    console.log('--- KHỞI CHẠY ĐỒNG BỘ NHÂN SỰ, KPI & BẢNG LƯƠNG T1-T7 ---');

    await query.run('PRAGMA foreign_keys = OFF');
    const now = new Date().toISOString();

    // Đảm bảo các bảng cần thiết tồn tại
    await query.exec(`
      CREATE TABLE IF NOT EXISTS employee_monthly_kpis (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        employee_id INTEGER NOT NULL,
        month TEXT NOT NULL,
        year INTEGER NOT NULL,
        responsibility_bonus REAL DEFAULT 0,
        responsibility_penalty REAL DEFAULT 0,
        responsibility_rate REAL DEFAULT 1.0,
        responsibility_amount REAL DEFAULT 0,
        performance_bonus REAL DEFAULT 0,
        discipline_deduction REAL DEFAULT 0,
        note TEXT DEFAULT '',
        created_at TEXT,
        updated_at TEXT,
        UNIQUE(employee_id, month, year),
        FOREIGN KEY (employee_id) REFERENCES employees(id) ON DELETE CASCADE
      );

      CREATE TABLE IF NOT EXISTS payrolls (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        employee_id INTEGER NOT NULL,
        month TEXT NOT NULL,
        year INTEGER NOT NULL,
        tier_salary REAL DEFAULT 0,
        grade_salary REAL DEFAULT 0,
        responsibility_quota REAL DEFAULT 0,
        responsibility_deduction_rate REAL DEFAULT 0,
        responsibility_net REAL DEFAULT 0,
        performance_bonus REAL DEFAULT 0,
        discipline_deduction REAL DEFAULT 0,
        performance_net REAL DEFAULT 0,
        other_deductions REAL DEFAULT 0,
        net_salary REAL DEFAULT 0,
        status TEXT DEFAULT 'Dự thảo',
        created_at TEXT,
        updated_at TEXT,
        UNIQUE(employee_id, month, year),
        FOREIGN KEY (employee_id) REFERENCES employees(id) ON DELETE CASCADE
      );
    `);

    // 1. Đồng bộ 57 nhân sự cơ bản
    for (const line of SEED_EMPLOYEES_RAW) {
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

      const branchId = await getOrCreateBranch(branchName);
      const departmentId = await getOrCreateDepartment(deptName, branchId);
      const positionId = await getOrCreatePosition(posName, departmentId);

      const formattedPhone = phone ? phone.trim() : '';
      const formattedCccd = cccd ? cccd.trim() : '';
      const formattedContractType = contractType ? contractType.trim() : 'Không xác định thời hạn';
      const formattedStatus = status ? status.trim() : 'Đang làm việc';

      const sql = `
        INSERT INTO employees (
          code, fullname, gender, dob, phone, cccd, address,
          branch_id, department_id, position_id, join_date,
          status, contract_type, base_salary, allowance, kpi_bonus,
          tier_salary, grade_salary,
          created_at, updated_at
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
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
          tier_salary = excluded.base_salary,
          allowance = excluded.allowance,
          kpi_bonus = excluded.kpi_bonus,
          updated_at = excluded.updated_at
      `;

      await query.run(sql, [
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
        baseSalary,
        0,
        now,
        now
      ]);
    }

    // 2. Đồng bộ toàn bộ 63 nhân sự KPI & Hiệu Quả T1 -> T7
    const allEmps = await query.all('SELECT id, code, fullname, base_salary FROM employees');
    const empMapByCode = new Map();
    const empMapByName = new Map();
    allEmps.forEach(e => {
      if (e.code) empMapByCode.set(e.code.toLowerCase(), e);
      if (e.fullname) empMapByName.set(e.fullname.trim().toLowerCase(), e);
    });

    for (const item of RAW_KPI_PERFORMANCE) {
      let matched = null;
      if (item.maNV) matched = empMapByCode.get(item.maNV.toLowerCase());
      if (!matched) matched = empMapByName.get(item.hoTen.trim().toLowerCase());

      let empId = matched?.id;
      let baseSal = matched?.base_salary || 6000000;

      if (!matched) {
        // Tạo nhân sự nếu chưa có
        const res = await query.run(`
          INSERT INTO employees (code, fullname, gender, status, base_salary, tier_salary, kpi_bonus, join_date, created_at, updated_at)
          VALUES (?, ?, 'Nam', 'Đang làm việc', 6000000, 6000000, ?, '2025-01-01', ?, ?)
        `, [item.maNV, item.hoTen, item.kpiT7 || 1000000, now, now]);
        empId = res.lastID;
      }

      if (!empId) continue;

      const monthlyData = [
        { m: '01', kpi: 0, hq: item.hqT1 || 0 },
        { m: '02', kpi: 0, hq: item.hqT2 || 0 },
        { m: '03', kpi: 0, hq: item.hqT3 || 0 },
        { m: '04', kpi: 0, hq: item.hqT4 || 0 },
        { m: '05', kpi: item.kpiT5 || 0, hq: item.hqT5 || 0 },
        { m: '06', kpi: item.kpiT6 || 0, hq: item.hqT6 || 0 },
        { m: '07', kpi: item.kpiT7 || 0, hq: item.hqT7 || 0 }
      ];

      for (const mRow of monthlyData) {
        // 2a. Upsert employee_monthly_kpis
        await query.run(`
          INSERT INTO employee_monthly_kpis (
            employee_id, month, year,
            responsibility_bonus, responsibility_penalty, responsibility_rate, responsibility_amount,
            performance_bonus, discipline_deduction, note, created_at, updated_at
          ) VALUES (?, ?, 2026, ?, 0, 1.0, ?, ?, 0, 'Đồng bộ tự động T1-T7/2026', ?, ?)
          ON CONFLICT(employee_id, month, year) DO UPDATE SET
            responsibility_bonus = excluded.responsibility_bonus,
            responsibility_rate = excluded.responsibility_rate,
            responsibility_amount = excluded.responsibility_amount,
            performance_bonus = excluded.performance_bonus,
            updated_at = excluded.updated_at
        `, [empId, mRow.m, mRow.kpi, mRow.kpi, mRow.hq, now, now]);

        // 2b. Upsert payrolls (Bảng lương tháng)
        const netSal = baseSal + mRow.kpi + mRow.hq;
        await query.run(`
          INSERT INTO payrolls (
            employee_id, month, year, tier_salary, grade_salary,
            responsibility_quota, responsibility_deduction_rate, responsibility_net,
            performance_bonus, discipline_deduction, performance_net, other_deductions,
            net_salary, status, created_at, updated_at
          ) VALUES (?, ?, 2026, ?, 0, ?, 0, ?, ?, 0, ?, 0, ?, 'Đã duyệt', ?, ?)
          ON CONFLICT(employee_id, month, year) DO UPDATE SET
            tier_salary = excluded.tier_salary,
            responsibility_quota = excluded.responsibility_quota,
            responsibility_net = excluded.responsibility_net,
            performance_bonus = excluded.performance_bonus,
            performance_net = excluded.performance_net,
            net_salary = excluded.net_salary,
            updated_at = excluded.updated_at
        `, [empId, mRow.m, baseSal, mRow.kpi, mRow.kpi, mRow.hq, mRow.hq, netSal, now, now]);
      }
    }

    // 3. Đồng bộ user mapping
    const adminEmp = await query.get("SELECT id FROM employees WHERE code = 'VietA 032'");
    if (adminEmp) {
      await query.run('UPDATE users SET employee_id = ? WHERE username = ?', [adminEmp.id, 'admin']);
      await query.run('UPDATE users SET employee_id = ? WHERE username = ?', [adminEmp.id, 'hr_manager']);
    }

    await query.run('PRAGMA foreign_keys = ON');
    console.log('--- HOÀN TẤT ĐỒNG BỘ CƠ SỞ DỮ LIỆU & BẢNG LƯƠNG T1-T7 ---');
  } catch (error) {
    console.error('Lỗi khi chạy migration:', error);
  }
}
