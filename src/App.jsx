import React, { useState, useEffect, useRef, useCallback } from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, PieChart, Pie, Cell, BarChart, Bar } from 'recharts';
import { ArrowUp, ArrowDown, CheckCircle, AlertTriangle, Cpu, HardDrive, Clock, Activity, CalendarCheck, FileText, Settings, Database, Server, Minimize2, Maximize2, FileText as DocumentIcon, Filter, Download, Upload } from 'lucide-react'; // Icons for KPIs and new features


// Helper component for KPI cards
// FIXED: Added trendDirection prop to correctly determine trend color (good/bad)
const KpiCard = ({ title, value, description, icon: Icon, valueColor = "text-blue-500", detail, trendValue, yearOverYearGrowth = null, miniChart = null, trendDirection = 'up' }) => {
    const trendNum = parseFloat(trendValue);
    const isGood = !isNaN(trendNum) && (trendDirection === 'up' ? trendNum >= 0 : trendNum <= 0);
    const trendColor = isNaN(trendNum) ? 'text-gray-500' : isGood ? 'text-green-500' : 'text-red-500';
    const TrendIcon = trendNum >= 0 ? ArrowUp : ArrowDown;

    return (
        <div className="bg-white p-4 rounded-xl shadow-lg flex flex-col justify-between transition-transform transform hover:scale-105 duration-300 ease-in-out">
            <div className="flex items-center space-x-4 mb-2">
                <div className={`p-3 rounded-full ${valueColor.includes("green") ? "bg-green-100" : valueColor.includes("red") ? "bg-red-100" : "bg-blue-100"}`}>
                    {Icon && <Icon className={`${valueColor}`} size={28} />}
                </div>
                <div>
                    <h3 className="text-sm font-semibold text-gray-500">{title}</h3>
                    <p className="text-2xl font-bold text-gray-800">{value}</p>
                    {description && <p className="text-xs text-gray-400">{description}</p>}
                    {trendValue && (
                        <p className={`text-xs mt-1 flex items-center ${trendColor}`}>
                            <TrendIcon size={12} className="mr-1" />
                            {trendValue} so với tháng trước
                        </p>
                    )}
                    {yearOverYearGrowth && (
                        <p className={`text-xs mt-1 flex items-center ${parseFloat(yearOverYearGrowth) >= 0 ? 'text-green-500' : 'text-red-500'}`}>
                            {parseFloat(yearOverYearGrowth) >= 0 ? <ArrowUp size={12} className="mr-1" /> : <ArrowDown size={12} className="mr-1" />}
                            {yearOverYearGrowth} so với cùng kỳ năm trước
                        </p>
                    )}
                    {detail && <p className="text-xs text-gray-400 mt-1">{detail}</p>}
                </div>
            </div>
            {miniChart && <div className="w-full h-24 mt-2">{miniChart}</div>} {/* Mini chart area */}
        </div>
    );
};

// Helper component for Charts Card
const ChartCard = ({ title, children, className = "", isVisible = true, onMaximize }) => {
  if (!isVisible) return null;
  return (
    <div className={`bg-white p-4 rounded-xl shadow-lg ${className}`}>
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-lg font-semibold text-gray-700">{title}</h3>
        {onMaximize && (
          <button onClick={onMaximize} className="p-1 rounded-full hover:bg-gray-200 transition-colors">
            <Maximize2 size={20} className="text-gray-600" />
          </button>
        )}
      </div>
      {children}
    </div>
  );
};

// Modal for maximized charts
const ChartModal = ({ title, children, onClose }) => {
  return (
    <div className="fixed inset-0 bg-gray-800 bg-opacity-90 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl shadow-lg w-full max-w-4xl h-full max-h-[90vh] flex flex-col">
        <div className="flex justify-between items-center p-4 border-b border-gray-200">
          <h2 className="text-xl font-bold text-gray-800">{title}</h2>
          <button onClick={onClose} className="p-1 rounded-full hover:bg-gray-200 transition-colors">
            <Minimize2 size={24} className="text-gray-600" />
          </button>
        </div>
        <div className="flex-1 p-4 overflow-auto">
          {children}
        </div>
      </div>
    </div>
  );
};

const CustomTooltip = ({ active, payload, label, unit = "" }) => {
  if (active && payload && payload.length) {
    return (
      <div className="p-3 bg-gray-800 bg-opacity-90 text-white rounded-lg shadow-xl border border-gray-700">
        <p className="font-bold text-lg mb-1">{label}</p>
        {payload.map((p, index) => (
          <p key={index} style={{ color: p.color }} className="text-sm">
            {p.name}: <span className="font-semibold">{p.value?.toLocaleString() || 'N/A'}</span> {unit}
          </p>
        ))}
      </div>
    );
  }
  return null;
};


// Initial dummy data for May 2025 and April 2025 - Moved outside component
const initialReportData = {
  '05/2025': {
    kpiData: {
      totalFinancialTransactions: { value: "403.585.961", description: "Tổng số giao dịch tài chính trong tháng", yearOverYear: "30.72%" },
      peakDayTransactions: { value: "15 triệu", date: "12/05/2025", description: "Giao dịch ngày cao điểm nhất" },
      avgDayEndDuration: { value: "2 giờ 49 phút", rawMinutes: 169, description: "Thời gian vận hành DayEnd trung bình" },
      avgResponseTime: { value: "5.04ms", description: "Tốc độ phản hồi (Response time) trung bình" },
      peakTPS: { value: "835", date: "09/05/2025", description: "TPS lớn nhất" },
      avgCPUUtilization: { value: "4.92%", rawPercentage: 4.92, description: "%CPU trung bình máy chủ Profile" },
      currentSystemCapacity: { value: "2.1 TB", description: "Dung lượng hệ thống hiện tại" } // Removed from display
    },
    dayEndDurationData: [
      { date: '01/05', duration: 170 }, { date: '02/05', duration: 165 }, { date: '03/05', duration: 175 },
      { date: '04/05', duration: 180 }, { date: '05/05', duration: 160 }, { date: '06/05', duration: 172 },
      { date: '07/05', duration: 168 }, { date: '08/05', duration: 178 }, { date: '09/05', duration: 171 },
      { date: '10/05', duration: 163 }, { date: '11/05', duration: 174 }, { date: '12/05', duration: 166 },
      { date: '13/05', duration: 179 }, { date: '14/05', duration: 162 }, { date: '15/05', duration: 177 },
      { date: '16/05', duration: 169 }, { date: '17/05', duration: 173 }, { date: '18/05', duration: 167 },
      { date: '19/05', duration: 176 }, { date: '20/05', duration: 164 }, { date: '21/05', duration: 181 },
      { date: '22/05', duration: 170 }, { date: '23/05', duration: 165 }, { date: '24/05', duration: 175 },
      { date: '25/05', duration: 180 }, { date: '26/05', duration: 160 }, { date: '27/05', duration: 172 },
      { date: '28/05', duration: 168 }, { date: '29/05', duration: 178 }, { date: '30/05', duration: 171 },
      { date: '31/05', duration: 227, highlight: true } // 3 giờ 47 phút = 227 phút
    ].map(d => ({ ...d, avg: 169 })), // avg for May 2025
    tpsPeakData: [
      { time: '8:30', tps: 434 }, { time: '12:14', tps: 459 }, { time: '12:15', tps: 581 },
      { time: '15:48', tps: 431 }, { time: '17:39', tps: 479 }, { time: '17:40', tps: 477 },
      { time: '17:41', tps: 533 }, { time: '17:52', tps: 835 }, { time: '18:32', tps: 430 },
      { time: '18:33', tps: 453 },
    ],
    transactionByChannelData: [
      { name: 'TT Song phương (B2B)', value: 44, color: '#4A8D6E' }, // Dark green from image
      { name: 'IBFT', value: 27, color: '#E58A00' }, // Orange from image
      { name: 'TTHDOL', value: 11, color: '#B36D3A' }, // Brownish orange
      { name: 'SMB', value: 8, color: '#884D98' }, // Purple
      { name: 'ATM', value: 3, color: '#6A5ACD' }, // Slate Blue
      { name: 'Điện DRO', value: 2, color: '#20B2AA' }, // Light Sea Green
      { name: 'Thu phí tích hợp', value: 2, color: '#D2B48C' }, // Tan
      { name: 'OMNI', value: 1, color: '#4682B4' }, // Steel Blue
      { name: 'CRM', value: 1, color: '#9ACD32' }, // Yellow Green
      { name: 'Khác', value: 1, color: '#A9A9A9' }, // Dark Gray
    ],
    growthMetrics: [
      { name: "Tăng trưởng giao dịch tài chính", value: "+30.72%", icon: ArrowUp, color: "text-green-500", description: "So với cùng kỳ năm 2024" },
      { name: "Tăng trưởng số lượng khách hàng", value: "+12.4%", icon: ArrowUp, color: "text-green-500", description: "So với cùng kỳ năm 2024" },
      { name: "Số lượng tài khoản không kỳ hạn", value: "-4.61%", icon: ArrowDown, color: "text-red-500", description: "So với cùng kỳ năm 2024" },
      { name: "Số lượng tài khoản có kỳ hạn", value: "+3.24%", icon: ArrowUp, color: "text-green-500", description: "So với cùng kỳ năm 2024" },
      { name: "Số lượng tài khoản tiền vay", value: "+3.48%", icon: ArrowUp, color: "text-green-500", description: "So với cùng kỳ năm 2024" },
    ],
    errorDetails: {
      status: "Không phát sinh lỗi gây gián đoạn giao dịch trên các kênh trong tháng 05/2025.",
      webCSRError: {
        date: "Rạng sáng ngày 25/05/2025",
        description: "Không truy cập được WebCSR, ảnh hưởng tới tác nghiệp của TT CSKH.",
        resolutionTime: "Đưa hệ thống trở lại hoạt động bình thường vào 8h08 cùng ngày",
        impact: "Không gây ảnh hưởng tới hoạt động của các Chi nhánh.",
        cause: "User ứng dụng WebCSR dùng để kết nối vào Core Profile bị hết hạn.",
        prevention: "Đã thiết lập thêm các job giám sát và cảnh báo để phát hiện sớm và xử lý kịp thời đối với các tài khoản sắp hết hạn."
      }
    },
    systemUpdateData: {
      totalAppUpdates: "42 lượt",
      manualParamUpdates: "209 lượt",
      manualParamProd: "46 lượt",
      systemDataUpdates: "8 lượt",
      profileDataUpdates: "6 lượt",
      devTestEnvStatus: "Duy trì ổn định, đáp ứng các yêu cầu"
    },
    nextSteps: "Tiếp tục theo dõi chặt chẽ hoạt động của hệ thống Core banking Profile."
  },
  '04/2025': {
    kpiData: {
      totalFinancialTransactions: { value: "385.146.829", description: "Tổng số giao dịch tài chính trong tháng", yearOverYear: "33.72%" },
      peakDayTransactions: { value: "~17.2 triệu", date: "10/04/2025", description: "Giao dịch ngày cao điểm nhất" },
      avgDayEndDuration: { value: "2 giờ 53 phút", rawMinutes: 173, description: "Thời gian vận hành DayEnd trung bình" },
      avgResponseTime: { value: "5.09ms", description: "Tốc độ phản hồi (Response time) trung bình" },
      peakTPS: { value: "646", date: "12/04/2025", description: "TPS lớn nhất" },
      avgCPUUtilization: { value: "4.98%", rawPercentage: 4.98, description: "%CPU trung bình máy chủ Profile" },
      currentSystemCapacity: { value: "1.7 TB", description: "Dung lượng hệ thống hiện tại" }
    },
    dayEndDurationData: [
      // Dummy data for April, similar structure
      { date: '01/04', duration: 175 }, { date: '02/04', duration: 180 }, { date: '03/04', duration: 170 },
      { date: '04/04', duration: 165 }, { date: '05/04', duration: 172 }, { date: '06/04', duration: 168 },
      { date: '07/04', duration: 178 }, { date: '08/04', duration: 171 }, { date: '09/04', duration: 163 },
      { date: '10/04', duration: 174 }, { date: '11/04', duration: 166 }, { date: '12/04', duration: 179 },
      { date: '13/04', duration: 162 }, { date: '14/04', duration: 177 }, { date: '15/04', duration: 169 },
      { date: '16/04', duration: 173 }, { date: '17/04', duration: 167 }, { date: '18/04', duration: 176 },
      { date: '19/04', duration: 164 }, { date: '20/04', duration: 181 }, { date: '21/04', duration: 170 },
      { date: '22/04', duration: 165 }, { date: '23/04', duration: 175 }, { date: '24/04', duration: 180 },
      { date: '25/04', duration: 160 }, { date: '26/04', duration: 172 }, { date: '27/04', duration: 168 },
      { date: '28/04', duration: 178 }, { date: '29/04', duration: 171 },
      { date: '30/04', duration: 227, highlight: true } // 3 giờ 47 phút = 227 phút
    ].map(d => ({ ...d, avg: 173 })), // avg for April 2025
    tpsPeakData: [
      { time: '13:07', tps: 511 }, { time: '13:08', tps: 558 }, { time: '13:09', tps: 530 },
      { time: '13:10', tps: 531 }, { time: '17:15', tps: 267 }, { time: '17:28', tps: 302 },
      { time: '17:29', tps: 646 }, { time: '17:30', tps: 428 }, { time: '17:40', tps: 261 },
      { time: '23:39', tps: 380 },
    ],
    transactionByChannelData: [
      { name: 'TT Song phương (B2B)', value: 44, color: '#4A8D6E' }, // Dark green from image
      { name: 'IBFT', value: 27, color: '#E58A00' }, // Orange from image
      { name: 'TTHDOL', value: 11, color: '#B36D3A' }, // Brownish orange
      { name: 'SMB', value: 8, color: '#884D98' }, // Purple
      { name: 'ATM', value: 3, color: '#6A5ACD' }, // Slate Blue
      { name: 'Điện DRO', value: 2, color: '#20B2AA' }, // Light Sea Green
      { name: 'Thu phí tích hợp', value: 2, color: '#D2B48C' }, // Tan
      { name: 'OMNI', value: 1, color: '#4682B4' }, // Steel Blue
      { name: 'CRM', value: 1, color: '#9ACD32' }, // Yellow Green
      { name: 'Khác', value: 1, color: '#A9A9A9' }, // Dark Gray
    ],
    growthMetrics: [
      { name: "Tăng trưởng giao dịch tài chính", value: "+33.72%", icon: ArrowUp, color: "text-green-500", description: "So với cùng kỳ năm 2024" },
      { name: "Tăng trưởng số lượng khách hàng", value: "+13.22%", icon: ArrowUp, color: "text-green-500", description: "So với cùng kỳ năm 2024" },
      { name: "Số lượng tài khoản không kỳ hạn", value: "-4.14%", icon: ArrowDown, color: "text-red-500", description: "So với cùng kỳ năm 2024" },
      { name: "Số lượng tài khoản có kỳ hạn", value: "+3.78%", icon: ArrowUp, color: "text-green-500", description: "So với cùng kỳ năm 2024" },
      { name: "Số lượng tài khoản tiền vay", value: "+3.90%", icon: ArrowUp, color: "text-green-500", description: "So với cùng kỳ năm 2024" },
    ],
    errorDetails: {
      status: "Trong tháng 04/2025, hệ thống core banking không phát sinh lỗi gây gián đoạn giao dịch trên các kênh.",
      webCSRError: {
        date: "20h51 – 20h55 ngày Chủ nhật - 20/04/2025",
        description: "Hiện tượng phản hồi chậm trên các máy chủ report, gây lỗi chập chờn đối với giao dịch từ các kênh online.",
        resolutionTime: "Máy chủ report 1 tự khôi phục, máy chủ report 2 được build lại và hoàn thành trước 8h sáng hôm sau.",
        impact: "Không gây ảnh hưởng tới hoạt động chung của hệ thống do kịch bản dự phòng kịp thời.",
        cause: "Lỗi đọc ghi dữ liệu trên các máy chủ report.",
        prevention: "N/A" // Not explicitly mentioned in the April report snippet provided
      }
    },
    systemUpdateData: {
      totalAppUpdates: "53 lượt",
      manualParamUpdates: "183 lượt",
      manualParamProd: "49 lượt",
      systemDataUpdates: "14 lượt",
      profileDataUpdates: "7 lượt",
      devTestEnvStatus: "Duy trì ổn định, đáp ứng các yêu cầu"
    },
    nextSteps: "Tiếp tục theo dõi chặt chẽ hoạt động của hệ thống Core banking Profile."
  }
};


const historicalDataYears = ['2019', '2020', '2021', '2022', '2023', '2024', '2025'];

// This data is used for the "Số lượng giao dịch trung bình theo ngày" chart
const avgDailyTransactionOverviewData = [
  { name: 'T10/2024', NgayThuong: 11916844, CuoiTuan: 10230944, ChungCaThang: 11579583 },
  { name: 'T11/2024', NgayThuong: 12200000, CuoiTuan: 10700000, ChungCaThang: 11700000 },
  { name: 'T12/2024', NgayThuong: 12600000, CuoiTuan: 10600000, ChungCaThang: 11800000 },
  { name: 'T1/2025', NgayThuong: 14200000, CuoiTuan: 10000000, ChungCaThang: 12500000 },
  { name: 'T2/2025', NgayThuong: 10800000, CuoiTuan: 9800000, ChungCaThang: 8000000 }, // Data point from PDF chart seems low
  { name: 'T3/2025', NgayThuong: 12400000, CuoiTuan: 10400000, ChungCaThang: 12000000 },
  { name: 'T4/2025', NgayThuong: 13200000, CuoiTuan: 11400000, ChungCaThang: 12800000 },
  { name: 'T5/2025', NgayThuong: 13465361, CuoiTuan: 11916844, ChungCaThang: 12981449 },
];

// This data is for "Tổng số giao dịch tài chính theo tháng" chart
const totalHistoricalDataTransactions = [
  { month: 'Tháng 1', '2019': null, '2020': 70398653, '2021': 102638103, '2022': 130703966, '2023': 181356164, '2024': 286287309, '2025': 384731977 },
  { month: 'Tháng 2', '2019': 36279421, '2020': 57879463, '2021': 89245849, '2022': 83360056, '2023': 158938838, '2024': 236921056, '2025': 279081583 },
  { month: 'Tháng 3', '2019': 51820298, '2020': 68676065, '2021': 102350186, '2022': 122619991, '2023': 199759104, '2024': 281081993, '2025': 370057722 },
  { month: 'Tháng 4', '2019': 52226477, '2020': 58819178, '2021': 103837369, '2022': 128137360, '2023': 201192652, '2024': 288032713, '2025': 385146829 },
  { month: 'Tháng 5', '2019': 55369694, '2020': 68579336, '2021': 103046250, '2022': 130494810, '2023': 206797842, '2024': 308745155, '2025': 403585961 },
  { month: 'Tháng 6', '2019': 56695303, '2020': 73334371, '2021': 103126615, '2022': 133375455, '2023': 204752945, '2024': 295939971, '2025': null },
  { month: 'Tháng 7', '2019': 57697356, '2020': 84454355, '2021': 102540561, '2022': 138090542, '2023': 214731121, '2024': 298608364, '2025': null },
  { month: 'Tháng 8', '2019': 58799243, '2020': 77298869, '2021': 96668079, '2022': 148734220, '2023': 240964790, '2024': 324080355, '2025': null },
  { month: 'Tháng 9', '2019': 61182154, '2020': 85248817, '2021': 104123078, '2022': 153754867, '2023': 211926840, '2024': 318656429, '2025': null },
  { month: 'Tháng 10', '2019': 67396522, '2020': 86593211, '2021': 119182757, '2022': 167486378, '2023': 254211060, '2024': 355536341, '2025': null },
  { month: 'Tháng 11', '2019': 64845235, '2020': 88003871, '2021': 123256901, '2022': 172958138, '2023': 256737976, '2024': 352507647, '2025': null },
  { month: 'Tháng 12', '2019': 82155719, '2020': 106484240, '2021': 140437165, '2022': 193265178, '2023': 280907282, '2024': 373647363, '2025': null }
];

const historicalDataCustomers = [
  { month: 'Tháng 1', '2019': 9656487, '2020': 10786031, '2021': 12030916, '2022': 13848173, '2023': 15952993, '2024': 19355122, '2025': 22044666 },
  { month: 'Tháng 2', '2019': 9721375, '2020': 10896651, '2021': 12091951, '2022': 13951141, '2023': 16122033, '2024': 19497444, '2025': 22208411 },
  { month: 'Tháng 3', '2019': 9867924, '2020': 11021568, '2021': 12245414, '2022': 13836463, '2023': 16394484, '2024': 19716610, '2025': 22400157 },
  { month: 'Tháng 4', '2019': 9995512, '2020': 11102005, '2021': 12428870, '2022': 14031236, '2023': 16699062, '2024': 19936667, '2025': 22571454 },
  { month: 'Tháng 5', '2019': 10122903, '2020': 11215459, '2021': 12594700, '2022': 14230788, '2023': 17005047, '2024': 20247475, '2025': 22759026 },
  { month: 'Tháng 6', '2019': 10230944, '2020': 11348598, '2021': 12732373, '2022': 14411889, '2023': 17396120, '2024': 20477446, '2025': null },
  { month: 'Tháng 7', '2019': 10360057, '2020': 11487241, '2021': 12836365, '2022': 14564994, '2023': 17767003, '2024': 20717127, '2025': null },
  { month: 'Tháng 8', '2019': 10499226, '2020': 11603118, '2021': 12927206, '2022': 14765195, '2023': 18126071, '2024': 21005215, '2025': null },
  { month: 'Tháng 9', '2019': 10338024, '2020': 11480809, '2021': 13048090, '2022': 15035510, '2023': 18405803, '2024': 21298283, '2025': null },
  { month: 'Tháng 10', '2019': 10492757, '2020': 11642540, '2021': 13273258, '2022': 15319916, '2023': 18734816, '2024': 21536440, '2025': null },
  { month: 'Tháng 11', '2019': 10606801, '2020': 11802198, '2021': 13538154, '2022': 15628798, '2023': 18979659, '2024': 21760624, '2025': null },
  { month: 'Tháng 12', '2019': 10721178, '2020': 11935334, '2021': 13751551, '2022': 15847618, '2023': 19174616, '2024': 21915101, '2025': null }
];

const historicalDataDemandDepositAccounts = [
  { month: 'Tháng 1', '2019': 7183048, '2020': 7649190, '2021': 8164174, '2022': 8974079, '2023': 11023252, '2024': 13359499, '2025': 12856906 },
  { month: 'Tháng 2', '2019': 7157943, '2020': 7740033, '2021': 8143253, '2022': 9018363, '2023': 11160506, '2024': 13376152, '2025': 12853075 },
  { month: 'Tháng 3', '2019': 7099906, '2020': 7689167, '2021': 8225013, '2022': 9118385, '2023': 11338618, '2024': 13369532, '2025': 12890850 },
  { month: 'Tháng 4', '2019': 7226879, '2020': 7776205, '2021': 8351495, '2022': 9250595, '2023': 11579583, '2024': 13448178, '2025': 12891307 },
  { month: 'Tháng 5', '2019': 7360231, '2020': 7886803, '2021': 8454162, '2022': 9369084, '2023': 11863649, '2024': 13520053, '2025': null },
  { month: 'Tháng 6', '2019': 7387886, '2020': 7984621, '2021': 8526944, '2022': 9421921, '2023': 12102284, '2024': 13503888, '2025': null },
  { month: 'Tháng 7', '2019': 7501322, '2020': 8023911, '2021': 8561357, '2022': 9545077, '2023': 12396950, '2024': 13437975, '2025': null },
  { month: 'Tháng 8', '2019': 7478547, '2020': 8080134, '2021': 8596593, '2022': 9748059, '2023': 12729801, '2024': 13374142, '2025': null },
  { month: 'Tháng 9', '2019': 7400006, '2020': 7826060, '2021': 8643065, '2022': 10038627, '2023': 12761543, '2024': 13183660, '2025': null },
  { month: 'Tháng 10', '2019': 7526078, '2020': 7951728, '2021': 8775017, '2022': 10357187, '2023': 13084047, '2024': 13108481, '2025': null },
  { month: 'Tháng 11', '2019': 7645699, '2020': 8056348, '2021': 8980661, '2022': 10690852, '2023': 13260731, '2024': 13096134, '2025': null },
  { month: 'Tháng 12', '2019': 7697211, '2020': 8121817, '2021': 9174756, '2022': 10933394, '2023': 13353210, '2024': 12968113, '2025': null }
];

const historicalDataTermDepositAccounts = [
  { month: 'Tháng 1', '2019': 1780277, '2020': 1954657, '2021': 1954313, '2022': 2082526, '2023': 2299660, '2024': 2679499, '2025': 2900595 },
  { month: 'Tháng 2', '2019': 1871776, '2020': 2010474, '2021': 2041113, '2022': 2109704, '2023': 2387542, '2024': 2800147, '2025': 2951486 },
  { month: 'Tháng 3', '2019': 1872320, '2020': 2004133, '2021': 2023120, '2022': 2080545, '2023': 2461112, '2024': 2826446, '2025': 2951086 },
  { month: 'Tháng 4', '2019': 1877362, '2020': 2033828, '2021': 2014127, '2022': 2067199, '2023': 2528902, '2024': 2841038, '2025': 2948430 },
  { month: 'Tháng 5', '2019': 1876773, '2020': 2040004, '2021': 2030938, '2022': 2057734, '2023': 2554421, '2024': 2849494, '2025': null },
  { month: 'Tháng 6', '2019': 1886906, '2020': 2036451, '2021': 2044778, '2022': 2063146, '2023': 2570043, '2024': 2838768, '2025': null },
  { month: 'Tháng 7', '2019': 1887505, '2020': 2031273, '2021': 2044778, '2022': 2063934, '2023': 2577039, '2024': 2840093, '2025': null },
  { month: 'Tháng 8', '2019': 1899340, '2020': 2047260, '2021': 2068210, '2022': 2067214, '2023': 2591638, '2024': 2859909, '2025': null },
  { month: 'Tháng 9', '2019': 1902559, '2020': 2035388, '2021': 2095201, '2022': 2060410, '2023': 2633526, '2024': 2855981, '2025': null },
  { month: 'Tháng 10', '2019': 1899811, '2020': 2023737, '2021': 2096252, '2022': 2096434, '2023': 2644034, '2024': 2850641, '2025': null },
  { month: 'Tháng 11', '2019': 1901116, '2020': 2008538, '2021': 2073260, '2022': 2121571, '2023': 2661759, '2024': 2836407, '2025': null },
  { month: 'Tháng 12', '2019': 1890479, '2020': 1974418, '2021': 2044338, '2022': 2147266, '2023': 2692063, '2024': 2822212, '2025': null }
];

const historicalDataLoanAccounts = [
  { month: 'Tháng 1', '2019': 1001233, '2020': 1058279, '2021': 1105269, '2022': 1210686, '2023': 1073551, '2024': 1227738, '2025': 1180207 },
  { month: 'Tháng 2', '2019': 986878, '2020': 1050271, '2021': 1088461, '2022': 1199671, '2023': 1070331, '2024': 1219540, '2025': 1167676 },
  { month: 'Tháng 3', '2019': 1000429, '2020': 1055682, '2021': 1097328, '2022': 1212014, '2023': 1079306, '2024': 1226003, '2025': 1179775 },
  { month: 'Tháng 4', '2019': 1006932, '2020': 1053826, '2021': 1099033, '2022': 1215717, '2023': 1077539, '2024': 1229745, '2025': 1183609 },
  { month: 'Tháng 5', '2019': 1012102, '2020': 1058682, '2021': 1098245, '2022': 1217527, '2023': 1077097, '2024': 1190573, '2025': null },
  { month: 'Tháng 6', '2019': 1021677, '2020': 1072318, '2021': 1109970, '2022': 1226044, '2023': 1085003, '2024': 1200381, '2025': null },
  { month: 'Tháng 7', '2019': 1026948, '2020': 1084071, '2021': 1106771, '2022': 1230774, '2023': 1078342, '2024': 1206007, '2025': null },
  { month: 'Tháng 8', '2019': 1035135, '2020': 1089639, '2021': 1125472, '2022': 1240815, '2023': 1066624, '2024': 1215482, '2025': null },
  { month: 'Tháng 9', '2019': 1043495, '2020': 1089639, '2021': 1154587, '2022': 1092624, '2023': 1204830, '2024': 1221606, '2025': null },
  { month: 'Tháng 10', '2019': 1049832, '2020': 1092147, '2021': 1182989, '2022': 1074325, '2023': 1184972, '2024': 1228094, '2025': null },
  { month: 'Tháng 11', '2019': 1059196, '2020': 1099512, '2021': 1207721, '2022': 1083114, '2023': 1181735, '2024': 1234567, '2025': null },
  { month: 'Tháng 12', '2019': 1070760, '2020': 1112158, '2021': 1208173, '2022': 1089756, '2023': 1190250, '2024': 1243395, '2025': null }
  ];

const historicalDataMoneyTransferItems = [
  { month: 'Tháng 1', '2019': 4263667, '2020': 3736050, '2021': 3579592, '2022': 4304834, '2023': 3723574, '2024': 1930244, '2025': 3183767 },
  { month: 'Tháng 2', '2019': 1852065, '2020': 2612646, '2021': 2758129, '2022': 2246482, '2023': 3078639, '2024': 1736625, '2025': 1406185 },
  { month: 'Tháng 3', '2019': 3172674, '2020': 3230571, '2021': 3377689, '2022': 3539939, '2023': 3508626, '2024': 2145361, '2025': 2133467 },
  { month: 'Tháng 4', '2019': 3198521, '2020': 2594620, '2021': 3327703, '2022': 3518942, '2023': 3361238, '2024': 1878444, '2025': 3284562 },
  { month: 'Tháng 5', '2019': 3378942, '2020': 2839748, '2021': 3233747, '2022': 3477506, '2023': 3342467, '2024': 2044747, '2025': null },
  { month: 'Tháng 6', '2019': 3069584, '2020': 3110330, '2021': 3340088, '2022': 3447876, '2023': 3372223, '2024': 2112951, '2025': null },
  { month: 'Tháng 7', '2019': 3392262, '2020': 3083158, '2021': 3338029, '2022': 3332509, '2023': 3202662, '2024': 2005722, '2025': null },
  { month: 'Tháng 8', '2019': 3210235, '2020': 2913088, '2021': 2943581, '2022': 3880276, '2023': 3837923, '2024': 2268631, '2025': null },
  { month: 'Tháng 9', '2019': 3087490, '2020': 3042160, '2021': 3137739, '2022': 3337800, '2023': 1723258, '2024': 1803273, '2025': null },
  { month: 'Tháng 10', '2019': 3447899, '2020': 3137008, '2021': 5888247, '2022': 3439711, '2023': 1972162, '2024': 2094551, '2025': null },
  { month: 'Tháng 11', '2019': 3205050, '2020': 3136808, '2021': 5952744, '2022': 3562861, '2023': 2078421, '2024': 2392739, '2025': null },
  { month: 'Tháng 12', '2019': 3696478, '2020': 3897179, '2021': 4506884, '2022': 4210189, '2023': 2120548, '2024': 2632046, '2025': null }
];


const App = () => {
  // Load html2pdf.js dynamically
  useEffect(() => {
    if (typeof window !== 'undefined' && typeof window.html2pdf === 'undefined') {
      const script = document.createElement('script');
      script.src = "https://cdnjs.cloudflare.com/ajax/libs/html2pdf.js/0.10.1/html2pdf.bundle.min.js";
      script.onload = () => console.log("html2pdf.js loaded.");
      script.onerror = () => console.error("Failed to load html2pdf.js");
      document.body.appendChild(script);
    }
  }, []); // Empty dependency array means this runs once after initial render

  const sectionRefs = {
    performance: useRef(null),
    errorHandling: useRef(null),
    growth: useRef(null),
    systemManagement: useRef(null),
    nextSteps: useRef(null),
  };

  const [activeSection, setActiveSection] = useState('all');
  const [selectedYears, setSelectedYears] = useState(historicalDataYears);
  const [reports, setReports] = useState(initialReportData);
  const [currentMonth, setCurrentMonth] = useState('05/2025'); // Currently displayed report month
  const [isExporting, setIsExporting] = useState(false); // New state for loading indicator
  const [maximizedChart, setMaximizedChart] = useState(null); // State to control maximized chart


  const scrollToSection = (sectionId) => {
    setActiveSection(sectionId);
    if (sectionId === 'all') {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } else {
      // Small delay to ensure render before scroll when switching sections
      setTimeout(() => {
        sectionRefs[sectionId].current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }, 100);
    }
  };

  const handleYearChange = (year) => {
    setSelectedYears(prev =>
      prev.includes(year)
        ? prev.filter(y => y !== year)
        : [...prev, year].sort()
    );
  };

  const handleFileImport = (event) => {
    const file = event.target.files[0];
    if (!file) return;

    if (file.type === 'application/pdf') {
      alert("Tính năng nhập dữ liệu có cấu trúc từ file PDF hiện không được hỗ trợ trực tiếp trong trình duyệt do các hạn chế về bảo mật và xử lý dữ liệu phức tạp. Để nhập báo cáo PDF, bạn cần một dịch vụ backend để phân tích và trích xuất dữ liệu thành định dạng JSON. Vui lòng thử tải lên file JSON có cấu trúc tương tự báo cáo tháng 04/2025 hoặc 05/2025.");
      console.warn("PDF import attempted. Frontend PDF parsing for structured data is complex and not implemented.");
    } else if (file.type === 'application/json') {
      const reader = new FileReader();
      reader.onload = (e) => {
        try {
          const importedData = JSON.parse(e.target.result);
          const newMonthKey = prompt("Vui lòng nhập tháng/năm cho báo cáo này (ví dụ: 04/2025):");
          if (newMonthKey) {
            setReports(prevReports => ({
              ...prevReports,
              [newMonthKey]: importedData
            }));
            setCurrentMonth(newMonthKey);
            alert(`Báo cáo cho tháng ${newMonthKey} đã được nhập thành công!`);
          }
        } catch (error) {
          alert("Lỗi khi đọc file JSON. Vui lòng kiểm tra định dạng file.");
          console.error("Error parsing JSON:", error);
        }
      };
      reader.readAsText(file);
    } else {
      alert("Định dạng file không được hỗ trợ. Vui lòng chọn file JSON hoặc PDF (PDF sẽ không được phân tích cú pháp).");
    }
  };


  const handleExportPdf = useCallback(() => {
    const element = document.getElementById('dashboard-content');
    if (element && typeof window.html2pdf !== 'undefined') {
      setIsExporting(true); // Show loading indicator

      const originalActiveSection = activeSection;
      const originalOverflow = document.body.style.overflow;
      const navPane = document.querySelector('nav');

      // Store original display styles of sections
      const sections = document.querySelectorAll('section[id$="-section"]');
      const originalSectionDisplays = {};
      sections.forEach(sec => {
        originalSectionDisplays[sec.id] = sec.style.display;
      });

      // Temporarily hide navigation and force all content visible for PDF export
      if (navPane) navPane.style.display = 'none';
      document.body.style.overflow = 'visible';
      
      sections.forEach(sec => {
          sec.style.display = 'block'; // Force visibility
      });

      // Crucial: Wait for the DOM to re-render after changing display styles
      // using requestAnimationFrame ensures the browser has painted the changes.
      requestAnimationFrame(() => {
        requestAnimationFrame(() => { // Another frame for good measure, especially for charts
          window.html2pdf().from(element).set({
            margin: [10, 10, 10, 10], // Top, Left, Bottom, Right
            filename: `bao_cao_core_banking_thang_${currentMonth.replace('/', '_')}.pdf`,
            html2canvas: { scale: 2, logging: true, dpi: 192, letterRendering: true, useCORS: true },
            jsPDF: { unit: 'mm', format: 'a4', orientation: 'portrait' }
          }).save().then(() => {
            // Restore original state and display styles
            if (navPane) navPane.style.display = ''; // Restore nav display
            document.body.style.overflow = originalOverflow; // Restore body overflow

            sections.forEach(sec => {
                sec.style.display = originalSectionDisplays[sec.id]; // Restore section displays
            });
            setActiveSection(originalActiveSection); // Restore active section
            setIsExporting(false); // Hide loading indicator
          }).catch(err => {
            console.error("PDF export error:", err);
            alert("Có lỗi xảy ra khi xuất PDF. Vui lòng thử lại.");
            // Ensure restoration even on error
            if (navPane) navPane.style.display = '';
            document.body.style.overflow = originalOverflow;
            sections.forEach(sec => {
                sec.style.display = originalSectionDisplays[sec.id];
            });
            setActiveSection(originalActiveSection);
            setIsExporting(false); // Hide loading indicator
          });
        });
      });
    } else {
      alert('Thư viện xuất PDF (html2pdf.js) không khả dụng hoặc chưa tải xong. Vui lòng thử lại sau.');
      console.error("html2pdf.js library not loaded or not ready.");
    }
  }, [activeSection, currentMonth]); // Dependencies for useCallback


  const lineColors = ['#8884d8', '#82ca9d', '#ffc658', '#ff7300', '#a4de6c', '#d0ed57', '#83a6ed', '#8dd1e1', '#c7ed8d', '#ed8da6', '#8deda6', '#a68ded'];

  // Data for the currently selected month
  const currentReport = reports[currentMonth];
  // Check if currentReport exists before destructuring to avoid errors if month is not found
  const kpiData = currentReport?.kpiData || {};
  const dayEndDurationData = currentReport?.dayEndDurationData || [];
  const tpsPeakData = currentReport?.tpsPeakData || [];
  const transactionByChannelData = currentReport?.transactionByChannelData || [];
  const growthMetrics = currentReport?.growthMetrics || [];
  const errorDetails = currentReport?.errorDetails || { status: 'N/A', webCSRError: {} };
  const systemUpdateData = currentReport?.systemUpdateData || {};
  const nextSteps = currentReport?.nextSteps || 'N/A';


  // FIXED: Removed the sign inversion. The function now returns the true mathematical percentage change.
  const calculateTrend = (currentValue, previousValue) => {
    const parseValue = (val) => {
      if (typeof val === 'string') {
        let num = parseFloat(val.replace(/[^0-9.-]+/g, ""));
        if (val.includes("triệu")) num *= 1000000;
        else if (val.includes("TB")) num *= 1000000000000;
        if (val.includes("giờ") || val.includes("phút")) {
          const hoursMatch = val.match(/(\d+)\s*giờ/);
          const minsMatch = val.match(/(\d+)\s*phút/);
          let totalMinutes = 0;
          if (hoursMatch) totalMinutes += parseInt(hoursMatch[1]) * 60;
          if (minsMatch) totalMinutes += parseInt(minsMatch[1]);
          return totalMinutes;
        }
        return num;
      }
      return val;
    };

    const currentNum = parseValue(currentValue);
    const previousNum = parseValue(previousValue);

    if (!isNaN(currentNum) && !isNaN(previousNum) && previousNum !== 0) {
      const diff = currentNum - previousNum;
      const percentage = (diff / previousNum) * 100;
      return `${percentage.toFixed(2)}%`;
    }
    return null;
  };

  const prevMonthKeys = Object.keys(reports).sort();
  const currentMonthIndex = prevMonthKeys.indexOf(currentMonth);
  const prevMonthKey = currentMonthIndex > 0 ? prevMonthKeys[currentMonthIndex - 1] : null;
  const prevReport = prevMonthKey ? reports[prevMonthKey] : null;

  const kpiTrends = {};
  if (prevReport && currentReport) { // Ensure both reports exist
    kpiTrends.totalFinancialTransactions = calculateTrend(currentReport.kpiData.totalFinancialTransactions.value, prevReport.kpiData.totalFinancialTransactions.value);
    kpiTrends.peakDayTransactions = calculateTrend(currentReport.kpiData.peakDayTransactions.value, prevReport.kpiData.peakDayTransactions.value);
    kpiTrends.avgDayEndDuration = calculateTrend(currentReport.kpiData.avgDayEndDuration.rawMinutes, prevReport.kpiData.avgDayEndDuration.rawMinutes);
    kpiTrends.avgResponseTime = calculateTrend(currentReport.kpiData.avgResponseTime.value, prevReport.kpiData.avgResponseTime.value);
    kpiTrends.peakTPS = calculateTrend(currentReport.kpiData.peakTPS.value, prevReport.kpiData.peakTPS.value);
    kpiTrends.avgCPUUtilization = calculateTrend(currentReport.kpiData.avgCPUUtilization.rawPercentage, prevReport.kpiData.avgCPUUtilization.rawPercentage);
  }

  const filteredTotalTransactionsData = totalHistoricalDataTransactions.map(data => {
    const newData = { ...data };
    const currentReportYear = parseInt(currentMonth.split('/')[1]);
    const currentReportMonth = parseInt(currentMonth.split('/')[0]);
    const chartMonthNum = parseInt(data.month.replace('Tháng ', ''));

    if (newData[String(currentReportYear)] !== null && chartMonthNum > currentReportMonth) {
        newData[String(currentReportYear)] = null;
    }
    return newData;
  });

  const filteredAvgDailyTransactionsData = avgDailyTransactionOverviewData.filter(data => {
    const monthYearParts = data.name.split('/');
    if (monthYearParts.length === 2) {
      const chartMonthNum = parseInt(monthYearParts[0].replace('T', ''));
      const chartYearNum = parseInt(monthYearParts[1]);
      const currentYearNum = parseInt(currentMonth.split('/')[1]);
      const currentMonthNum = parseInt(currentMonth.split('/')[0]);
      return (chartYearNum === currentYearNum || chartYearNum === currentYearNum - 1) && (chartYearNum !== currentYearNum || chartMonthNum <= currentMonthNum);
    }
    return true; 
  });

  const renderCustomizedLabel = useCallback(({ cx, cy, midAngle, outerRadius, percent, name }) => {
    const sortedChannels = [...transactionByChannelData].sort((a, b) => b.value - a.value);
    const top4Channels = sortedChannels.slice(0, 4).map(c => c.name);

    if (top4Channels.includes(name)) {
      const RADIAN = Math.PI / 180;
      const radius = outerRadius + 10;
      const x = cx + radius * Math.cos(-midAngle * RADIAN);
      const y = cy + radius * Math.sin(-midAngle * RADIAN);

      return (
        <text x={x} y={y} fill="black" textAnchor={x > cx ? 'start' : 'end'} dominantBaseline="central" className="text-xs font-semibold">
          {`${name} ${(percent * 100).toFixed(0)}%`}
        </text>
      );
    }
    return null;
  }, [transactionByChannelData]);

  const handleMaximizeChart = (chartContent, chartTitle) => {
    setMaximizedChart({ content: chartContent, title: chartTitle });
  };

  const handleCloseMaximizedChart = () => {
    setMaximizedChart(null);
  };


  return (
    <div className="flex flex-col lg:flex-row min-h-screen bg-gray-100 font-inter">
      {/* Global Header Panel */}
      <div className="bg-[#2D544C] p-4 text-center lg:text-left shadow-lg fixed top-0 left-0 right-0 z-20 h-16 flex items-center justify-center lg:justify-start">
        <h1 className="text-2xl lg:text-3xl font-extrabold"
          style={{
            background: 'linear-gradient(to right, #C0B283, #FFD700, #DAA520, #B8860B)', 
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            filter: 'drop-shadow(2px 2px 2px rgba(0,0,0,0.6))' 
          }}
        >
          Core Banking Operations Report
        </h1>
      </div>

      {isExporting && (
        <div className="fixed inset-0 bg-gray-800 bg-opacity-75 flex items-center justify-center text-white text-2xl font-semibold z-50">
          Đang xuất báo cáo PDF... Vui lòng chờ.
        </div>
      )}

      {maximizedChart && (
        <ChartModal title={maximizedChart.title} onClose={handleCloseMaximizedChart}>
          {maximizedChart.content}
        </ChartModal>
      )}

      {/* Navigation Pane */}
      <nav className="lg:w-64 w-full bg-[#2D544C] text-[#FFD700] p-4 fixed lg:relative z-10 shadow-lg lg:shadow-none pt-16">
        <h2 className="text-xl font-bold mb-6 hidden lg:block">Bảng điều khiển</h2>
        <ul className="flex lg:flex-col justify-around lg:justify-start gap-2 lg:gap-4 overflow-x-auto pb-2 lg:pb-0">
          <li>
            <button
              onClick={() => scrollToSection('all')}
              className={`block w-full text-left p-2 rounded-lg transition-colors duration-200 ${activeSection === 'all' ? 'bg-[#3A6B63] font-semibold' : 'hover:bg-[#3A6B63]'}`}
            >
              <DocumentIcon size={18} className="inline-block mr-2" /> Xem tất cả
            </button>
          </li>
          <li>
            <button
              onClick={() => scrollToSection('performance')}
              className={`block w-full text-left p-2 rounded-lg transition-colors duration-200 ${activeSection === 'performance' ? 'bg-[#3A6B63] font-semibold' : 'hover:bg-[#3A6B63]'}`}
            >
              <Activity size={18} className="inline-block mr-2" /> Hiệu suất & Độ ổn định
            </button>
          </li>
          <li>
            <button
              onClick={() => scrollToSection('errorHandling')}
              className={`block w-full text-left p-2 rounded-lg transition-colors duration-200 ${activeSection === 'errorHandling' ? 'bg-[#3A6B63] font-semibold' : 'hover:bg-[#3A6B63]'}`}
            >
              <AlertTriangle size={18} className="inline-block mr-2" /> Khắc phục lỗi
            </button>
          </li>
          <li>
            <button
              onClick={() => scrollToSection('growth')}
              className={`block w-full text-left p-2 rounded-lg transition-colors duration-200 ${activeSection === 'growth' ? 'bg-[#3A6B63] font-semibold' : 'hover:bg-[#3A6B63]'}`}
            >
              <ArrowUp size={18} className="inline-block mr-2" /> Tăng trưởng Khách hàng & GD
            </button>
          </li>
          <li>
            <button
              onClick={() => scrollToSection('systemManagement')}
              className={`block w-full text-left p-2 rounded-lg transition-colors duration-200 ${activeSection === 'systemManagement' ? 'bg-[#3A6B63] font-semibold' : 'hover:bg-[#3A6B63]'}`}
            >
              <Settings size={18} className="inline-block mr-2" /> Quản lý & Cập nhật
            </button>
          </li>
          <li>
            <button
              onClick={() => scrollToSection('nextSteps')}
              className={`block w-full text-left p-2 rounded-lg transition-colors duration-200 ${activeSection === 'nextSteps' ? 'bg-[#3A6B63] font-semibold' : 'hover:bg-[#3A6B63]'}`}
            >
              <CalendarCheck size={18} className="inline-block mr-2" /> Các công việc tiếp theo
            </button>
          </li>
        </ul>

        <div className="mt-8 pt-4 border-t border-[#3A6B63] hidden lg:block">
          <h3 className="text-md font-semibold mb-3 flex items-center">
            <CalendarCheck size={16} className="mr-2" /> Chọn báo cáo tháng
          </h3>
          <select
            value={currentMonth}
            onChange={(e) => setCurrentMonth(e.target.value)}
            className="w-full p-2 rounded-md bg-[#3A6B63] text-[#FFD700] border border-[#2D544C] focus:outline-none focus:ring-2 focus:ring-[#DAA520]"
          >
            {Object.keys(reports).sort().map(month => (
              <option key={month} value={month}>{`Tháng ${month}`}</option>
            ))}
          </select>
        </div>

        <div className="mt-4 pt-4 border-t border-[#3A6B63] hidden lg:block">
          <h3 className="text-md font-semibold mb-3 flex items-center">
            <Filter size={16} className="mr-2" /> Lọc dữ liệu theo năm
          </h3>
          <div className="flex flex-wrap gap-2">
            {historicalDataYears.map(year => (
              <label key={year} className="inline-flex items-center text-sm cursor-pointer">
                <input
                  type="checkbox"
                  value={year}
                  checked={selectedYears.includes(year)}
                  onChange={() => handleYearChange(year)}
                  className="form-checkbox h-4 w-4 text-[#DAA520] rounded-md"
                />
                <span className="ml-2 text-[#FFD700] hover:text-white">{year}</span>
              </label>
            ))}
          </div>
        </div>

        <div className="mt-4 pt-4 border-t border-[#3A6B63] hidden lg:block">
          <label htmlFor="import-file" className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded-xl shadow-md cursor-pointer transition-colors duration-200 flex items-center justify-center">
            <Upload size={20} className="mr-2" /> Nhập báo cáo mới
            <input
              id="import-file"
              type="file"
              accept=".json,.pdf"
              onChange={handleFileImport}
              className="hidden"
            />
          </label>
        </div>

        <div className="mt-4 pt-4 border-t border-[#3A6B63] hidden lg:block">
          <button
            onClick={handleExportPdf}
            className="w-full bg-green-600 hover:bg-green-700 text-white font-bold py-2 px-4 rounded-xl shadow-md transition-colors duration-200 flex items-center justify-center"
            disabled={isExporting}
          >
            <Download size={20} className="mr-2" /> Xuất báo cáo PDF
          </button>
        </div>
      </nav>

      <main id="dashboard-content" className="flex-1 p-4 sm:p-6 lg:p-8 pt-20 lg:pt-8">
        <section ref={sectionRefs.performance} id="performance-section" className="mb-12 scroll-mt-20" style={{ display: activeSection === 'all' || activeSection === 'performance' ? 'block' : 'none' }}>
          <h2 className="text-2xl font-bold text-gray-800 mb-6 border-b-2 border-blue-500 pb-2">
            1. Tổng quan về Hiệu suất & Độ ổn định hệ thống Core Profile
          </h2>
          {/* FIXED: Re-added miniChart props */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
            <KpiCard
              title={kpiData.totalFinancialTransactions.description}
              value={kpiData.totalFinancialTransactions.value.toLocaleString()}
              icon={Activity}
              valueColor="text-green-600"
              trendValue={kpiTrends.totalFinancialTransactions}
              yearOverYearGrowth={kpiData.totalFinancialTransactions.yearOverYear}
              miniChart={
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={filteredTotalTransactionsData} margin={{ top: 5, right: 10, left: 10, bottom: 5 }}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} />
                    <XAxis dataKey="month" hide />
                    <YAxis hide domain={['auto', 'auto']} />
                    <Tooltip content={<CustomTooltip unit="giao dịch" />} />
                    <Line type="monotone" dataKey="2024" stroke="#8884d8" dot={false} strokeWidth={1} name="2024" />
                    <Line type="monotone" dataKey="2025" stroke="#82ca9d" dot={false} strokeWidth={2} name="2025" />
                  </LineChart>
                </ResponsiveContainer>
              }
            />
            <KpiCard
              title={kpiData.peakDayTransactions.description}
              value={kpiData.peakDayTransactions.value}
              description={`Ngày: ${kpiData.peakDayTransactions.date}`}
              icon={Activity}
              valueColor="text-green-600"
              trendValue={kpiTrends.peakDayTransactions}
              miniChart={
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={tpsPeakData} margin={{ top: 5, right: 10, left: 10, bottom: 5 }}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} />
                    <XAxis dataKey="time" hide />
                    <YAxis hide domain={['auto', 'auto']} />
                    <Tooltip content={<CustomTooltip unit="TPS" />} />
                    <Line type="monotone" dataKey="tps" stroke="#EF5350" dot={false} strokeWidth={2} name="TPS cao nhất" />
                  </LineChart>
                </ResponsiveContainer>
              }
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            <KpiCard
              title={kpiData.avgDayEndDuration.description}
              value={kpiData.avgDayEndDuration.value}
              icon={Clock}
              valueColor="text-indigo-600"
              trendValue={kpiTrends.avgDayEndDuration}
              trendDirection="down"
            />
            <KpiCard
              title={kpiData.peakTPS.description}
              value={kpiData.peakTPS.value}
              description={`Ngày: ${kpiData.peakTPS.date}`}
              icon={Activity}
              valueColor="text-orange-600"
              trendValue={kpiTrends.peakTPS}
            />
            <KpiCard
              title={kpiData.avgResponseTime.description}
              value={kpiData.avgResponseTime.value}
              icon={Activity}
              valueColor="text-teal-600"
              trendValue={kpiTrends.avgResponseTime}
              trendDirection="down"
            />
            <KpiCard
              title={kpiData.avgCPUUtilization.description}
              value={kpiData.avgCPUUtilization.value}
              icon={Cpu}
              valueColor="text-blue-600"
              trendValue={kpiTrends.avgCPUUtilization}
              trendDirection="down"
            />
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
            <ChartCard 
              title={`Tỷ trọng giao dịch theo kênh (Tháng ${currentMonth})`} 
              onMaximize={() => handleMaximizeChart(
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={transactionByChannelData}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      outerRadius={180}
                      dataKey="value"
                      label={({ name, percent }) => `${name} (${(percent * 100).toFixed(0)}%)`}
                      isAnimationActive={false}
                      stroke="none"
                    >
                      {transactionByChannelData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip formatter={(value, name) => [`${value}%`, name]} />
                  </PieChart>
                </ResponsiveContainer>,
                `Tỷ trọng giao dịch theo kênh (Tháng ${currentMonth})`
              )}
            >
              <ResponsiveContainer width="100%" height={350}>
                <PieChart>
                  <Pie
                    data={transactionByChannelData}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    outerRadius={150}
                    fill="#8884d8"
                    dataKey="value"
                    label={renderCustomizedLabel}
                    isAnimationActive={false}
                    stroke="none"
                  >
                    {transactionByChannelData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip formatter={(value, name) => [`${value}%`, name]} />
                </PieChart>
              </ResponsiveContainer>
            </ChartCard>

            <ChartCard 
              title="Số lượng giao dịch trung bình theo ngày"
              onMaximize={() => handleMaximizeChart(
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={filteredAvgDailyTransactionsData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="name" />
                    <YAxis tickFormatter={(value) => `${(value / 1000000).toFixed(1)}M`} />
                    <Tooltip content={<CustomTooltip unit="giao dịch" />} />
                    <Legend />
                    <Line type="monotone" dataKey="NgayThuong" stroke="#8884d8" name="Ngày thường" />
                    <Line type="monotone" dataKey="CuoiTuan" stroke="#82ca9d" name="Cuối tuần" />
                    <Line type="monotone" dataKey="ChungCaThang" stroke="#ffc658" name="Chung cả tháng" />
                  </LineChart>
                </ResponsiveContainer>,
                "Số lượng giao dịch trung bình theo ngày"
              )}
            >
              <ResponsiveContainer width="100%" height={300}>
                <LineChart data={filteredAvgDailyTransactionsData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" hide />
                  <YAxis hide />
                  <Tooltip content={<CustomTooltip unit="giao dịch" />} />
                  <Line type="monotone" dataKey="NgayThuong" stroke="#8884d8" name="Ngày thường" dot={false} />
                  <Line type="monotone" dataKey="CuoiTuan" stroke="#82ca9d" name="Cuối tuần" dot={false} />
                  <Line type="monotone" dataKey="ChungCaThang" stroke="#ffc658" name="Chung cả tháng" dot={false} />
                </LineChart>
              </ResponsiveContainer>
            </ChartCard>
          </div>
        </section>

        <section ref={sectionRefs.errorHandling} id="error-handling-section" className="mb-12 scroll-mt-20" style={{ display: activeSection === 'all' || activeSection === 'errorHandling' ? 'block' : 'none' }}>
          <h2 className="text-2xl font-bold text-gray-800 mb-6 border-b-2 border-blue-500 pb-2">
            2. Tình hình Khắc phục lỗi hệ thống
          </h2>
          <div className="bg-white p-6 rounded-xl shadow-lg">
            <h3 className="text-lg font-semibold text-gray-700 mb-3 flex items-center">
              <CheckCircle className="text-green-500 mr-2" /> Trạng thái tổng quan:
            </h3>
            <p className="text-gray-800 mb-4 ml-8">
              {errorDetails.status}
            </p>

            <h3 className="text-lg font-semibold text-gray-700 mb-3 flex items-center">
              <AlertTriangle className="text-yellow-500 mr-2" /> Chi tiết sự cố (Nếu có):
            </h3>
            <div className="border border-gray-200 rounded-lg p-4 ml-8 bg-gray-50">
              <h4 className="font-bold text-gray-800 mb-2">Sự cố WebCSR</h4>
              <ul className="list-disc list-inside text-gray-700 space-y-1">
                <li><span className="font-semibold">Ngày/giờ:</span> {errorDetails.webCSRError.date}</li>
                <li><span className="font-semibold">Mô tả:</span> {errorDetails.webCSRError.description}</li>
                <li><span className="font-semibold">Thời gian xử lý:</span> {errorDetails.webCSRError.resolutionTime}</li>
                <li><span className="font-semibold">Tác động:</span> {errorDetails.webCSRError.impact}</li>
                <li><span className="font-semibold">Nguyên nhân:</span> {errorDetails.webCSRError.cause}</li>
                <li><span className="font-semibold">Biện pháp khắc phục/phòng ngừa:</span> {errorDetails.webCSRError.prevention}</li>
              </ul>
            </div>
          </div>
        </section>

        <section ref={sectionRefs.growth} id="growth-section" className="mb-12 scroll-mt-20" style={{ display: activeSection === 'all' || activeSection === 'growth' ? 'block' : 'none' }}>
          <h2 className="text-2xl font-bold text-gray-800 mb-6 border-b-2 border-blue-500 pb-2">
            3. Tăng trưởng Khách hàng & Giao dịch
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
            {growthMetrics.map((metric, index) => (
              <KpiCard
                key={index}
                title={metric.name}
                value={metric.value}
                description={metric.description}
                icon={metric.icon}
                valueColor={metric.color}
              />
            ))}
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <ChartCard title="Xu hướng số lượng giao dịch tài chính theo tháng">
              <ResponsiveContainer width="100%" height={300}>
                  <LineChart data={totalHistoricalDataTransactions}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="month" hide />
                    <YAxis hide />
                    <Tooltip content={<CustomTooltip unit="giao dịch" />} />
                    <Legend />
                    {selectedYears.map((year, index) => (
                      <Line key={year} type="monotone" dataKey={year} stroke={lineColors[index % lineColors.length]} name={year} dot={false} />
                    ))}
                  </LineChart>
              </ResponsiveContainer>
            </ChartCard>

            <ChartCard title="Xu hướng số lượng khách hàng theo tháng">
              <ResponsiveContainer width="100%" height={300}>
                  <LineChart data={historicalDataCustomers}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="month" hide />
                    <YAxis hide />
                    <Tooltip content={<CustomTooltip unit="khách hàng" />} />
                    <Legend />
                    {selectedYears.map((year, index) => (
                      <Line key={year} type="monotone" dataKey={year} stroke={lineColors[index % lineColors.length]} name={year} dot={false} />
                    ))}
                  </LineChart>
              </ResponsiveContainer>
            </ChartCard>
          </div>
        </section>

        <section ref={sectionRefs.systemManagement} id="system-management-section" className="mb-12 scroll-mt-20" style={{ display: activeSection === 'all' || activeSection === 'systemManagement' ? 'block' : 'none' }}>
          <h2 className="text-2xl font-bold text-gray-800 mb-6 border-b-2 border-blue-500 pb-2">
            4. Quản lý & Cập nhật hệ thống
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
            <KpiCard
              title="Tổng số lượt cập nhật ứng dụng trong tháng"
              value={systemUpdateData.totalAppUpdates}
              icon={FileText}
              valueColor="text-pink-600"
            />
            <KpiCard
              title="Số lượt cập nhật tham số thủ công"
              value={systemUpdateData.manualParamUpdates}
              description={`(Trong đó ${systemUpdateData.manualParamProd} trên môi trường Production)`}
              icon={Settings}
              valueColor="text-yellow-600"
            />
            <KpiCard
              title="Số lượt cập nhật dữ liệu hệ thống"
              value={systemUpdateData.systemDataUpdates}
              description={`(Trong đó ${systemUpdateData.profileDataUpdates} cho Profile)`}
              icon={Database}
              valueColor="text-lime-600"
            />
            <div className="bg-white p-4 rounded-xl shadow-lg flex items-center space-x-4 col-span-full">
              <div className="p-3 rounded-full bg-blue-100">
                <Server className="text-blue-600" size={28} />
              </div>
              <div>
                <h3 className="text-sm font-semibold text-gray-500">Trạng thái môi trường phát triển/kiểm thử</h3>
                <p className="text-xl font-bold text-gray-800">{systemUpdateData.devTestEnvStatus}</p>
              </div>
            </div>
          </div>
        </section>

        <section ref={sectionRefs.nextSteps} id="next-steps-section" className="mb-8 scroll-mt-20" style={{ display: activeSection === 'all' || activeSection === 'nextSteps' ? 'block' : 'none' }}>
          <h2 className="text-2xl font-bold text-gray-800 mb-6 border-b-2 border-blue-500 pb-2">
            5. Các công việc tiếp theo
          </h2>
          <div className="bg-white p-6 rounded-xl shadow-lg border border-gray-200">
            <p className="text-gray-800 text-lg">
              {nextSteps}
            </p>
          </div>
        </section>

        <footer className="text-center text-gray-500 text-sm mt-12">
          Báo cáo được tạo tự động từ dữ liệu của Ban QLPTCB.
        </footer>
      </main>
    </div>
  );
};

export default App;
