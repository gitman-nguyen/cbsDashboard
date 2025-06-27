import React, { useState, useEffect, useRef, useCallback } from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, PieChart, Pie, Cell, AreaChart, Area } from 'recharts';
import { ArrowUp, ArrowDown, CheckCircle, AlertTriangle, Cpu, Clock, Activity, CalendarCheck, FileText, Settings, Database, Server, Minimize2, Maximize2, FileText as DocumentIcon, Filter, Download, Upload, ChevronDown, BarChart2, TrendingUp, Users } from 'lucide-react';

// Custom Hook to detect if an element is in viewport for animations
const useOnScreen = (options) => {
    const ref = useRef(null);
    const [isVisible, setIsVisible] = useState(false);

    useEffect(() => {
        const observer = new IntersectionObserver(([entry]) => {
            if (entry.isIntersecting) {
                setIsVisible(true);
                observer.unobserve(entry.target);
            }
        }, options);

        const currentRef = ref.current;
        if (currentRef) {
            observer.observe(currentRef);
        }

        return () => {
            if (currentRef) {
                observer.unobserve(currentRef);
            }
        };
    }, [ref, options]);

    return [ref, isVisible];
};

const AnimatedComponent = ({ children, className = '' }) => {
    const [ref, isVisible] = useOnScreen({ threshold: 0.1 });
    return (
        <div
            ref={ref}
            className={`${className} transition-all duration-1000 ease-out ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'}`}
        >
            {children}
        </div>
    );
};


// --- RE-STYLED COMPONENTS FOR INFOGRAPHIC LOOK ---

const KpiCard = ({ title, value, description, icon: Icon, valueColor = "text-blue-500", detail, trendValue, yearOverYearGrowth = null, trendDirection = 'up', yoyLabel = 'YoY' }) => {
    const trendNum = parseFloat(trendValue);
    const isGood = !isNaN(trendNum) && (trendDirection === 'up' ? trendNum >= 0 : trendNum <= 0);
    const trendColor = isNaN(trendNum) ? 'text-gray-400' : isGood ? 'text-green-400' : 'text-red-400';
    const TrendIcon = trendNum >= 0 ? ArrowUp : ArrowDown;

    return (
        <AnimatedComponent className="bg-[#3A6B63]/50 backdrop-blur-sm border border-white/10 p-6 rounded-2xl shadow-2xl flex flex-col justify-between transform hover:-translate-y-2 transition-transform duration-300">
            <div>
                <div className="flex justify-between items-start mb-4">
                    <div className="flex-1">
                        <h3 className="text-sm font-semibold text-gray-300 uppercase tracking-wider">{title}</h3>
                        <p className="text-4xl font-bold text-white mt-1">{value}</p>
                    </div>
                    {Icon && <Icon className={`${valueColor} flex-shrink-0`} size={40} strokeWidth={1.5} />}
                </div>
                 {description && <p className="text-xs text-gray-400">{description}</p>}
            </div>
            <div className="mt-4 pt-4 border-t border-white/10">
                 {trendValue && (
                    <p className={`text-sm flex items-center ${trendColor}`}>
                        <TrendIcon size={16} className="mr-2" />
                        {trendValue} so với tháng trước
                    </p>
                )}
                {yearOverYearGrowth && (
                    <p className={`text-sm mt-1 flex items-center ${parseFloat(yearOverYearGrowth) >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                        {parseFloat(yearOverYearGrowth) >= 0 ? <TrendingUp size={16} className="mr-2" /> : <ArrowDown size={16} className="mr-2" />}
                        {yearOverYearGrowth} {yoyLabel}
                    </p>
                )}
                {detail && <p className="text-xs text-gray-400 mt-1">{detail}</p>}
            </div>
        </AnimatedComponent>
    );
};

const GrowthMetricCard = ({ icon: Icon, color, absoluteValue, percentageValue, name, description }) => {
    return (
        <AnimatedComponent className="bg-[#3A6B63]/50 backdrop-blur-sm border border-white/10 p-4 rounded-2xl text-center flex flex-col items-center justify-center transform hover:-translate-y-2 transition-transform duration-300">
            <Icon className={color} size={32} />
            <p className="text-3xl font-bold text-white mt-2">{absoluteValue}</p>
            <p className={`text-lg font-semibold ${color}`}>{percentageValue}</p>
            <p className="text-xs text-gray-300 mt-1">{name}</p>
            <p className="text-xs text-gray-400">{description}</p>
        </AnimatedComponent>
    );
};


const ChartCard = ({ title, children, className = "", onMaximize }) => {
  return (
    <AnimatedComponent className={`bg-[#3A6B63]/50 backdrop-blur-sm border border-white/10 p-4 sm:p-6 rounded-2xl shadow-2xl ${className}`}>
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-lg font-bold text-white">{title}</h3>
        {onMaximize && (
          <button onClick={onMaximize} className="p-1.5 rounded-full text-gray-300 hover:bg-white/20 transition-colors">
            <Maximize2 size={18} />
          </button>
        )}
      </div>
      <div className="h-80">{children}</div>
    </AnimatedComponent>
  );
};

const ChartModal = ({ title, children, onClose }) => {
  return (
    <div className="fixed inset-0 bg-black bg-opacity-80 backdrop-blur-md flex items-center justify-center z-[100] p-4">
      <div className="bg-[#2D544C] border border-white/20 rounded-2xl shadow-lg w-full max-w-5xl h-full max-h-[90vh] flex flex-col">
        <div className="flex justify-between items-center p-4 border-b border-white/10">
          <h2 className="text-xl font-bold text-white">{title}</h2>
          <button onClick={onClose} className="p-1.5 rounded-full text-gray-300 hover:bg-white/20 transition-colors">
            <Minimize2 size={24} />
          </button>
        </div>
        <div className="flex-1 p-4 overflow-auto">
          {children}
        </div>
      </div>
    </div>
  );
};

const CustomTooltip = ({ active, payload, label, unit = "", valueFormatter }) => {
  if (active && payload && payload.length) {
    return (
      <div className="p-3 bg-gray-900 bg-opacity-80 text-white rounded-lg shadow-xl border border-gray-700 backdrop-blur-sm">
        <p className="font-bold text-lg mb-2">{label}</p>
        {payload.map((p, index) => (
          <p key={index} style={{ color: p.color }} className="text-sm flex items-center">
            <span className="w-3 h-3 rounded-full mr-2" style={{ backgroundColor: p.color }}></span>
            {p.name}: <span className="font-semibold ml-auto pl-4">{valueFormatter ? valueFormatter(p.value) : p.value?.toLocaleString()}</span> {unit}
          </p>
        ))}
      </div>
    );
  }
  return null;
};

const BidvLogo = ({ className }) => (
    <img src="https://sanfactory.vn/wp-content/uploads/2023/10/LOGO-BIDV-tren-nen-mau-ngoai-cua-thuong-hieu-1400x447.png" alt="BIDV Logo" className={className} />
);

const App = () => {
    // Moved all data constants and helpers inside the App component to fix scope issues.
    const formatMillions = (value) => {
        if (!value) return "N/A";
        return `${(value / 1000000).toFixed(2)}M`;
    }

    const initialReportData = {
      '05/2025': {
        kpiData: {
          totalFinancialTransactions: { value: "403,5M", rawValue: 403585961, description: "Tổng số giao dịch tài chính", yearOverYear: "30.72%" },
          peakDayTransactions: { value: "15M", rawValue: 15000000, date: "12/05/2025", description: "Giao dịch ngày cao điểm" },
          avgDayEndDuration: { value: "2h 49m", rawMinutes: 169, description: "Thời gian DayEnd trung bình" },
          avgResponseTime: { value: "5.04ms", description: "Tốc độ phản hồi trung bình" },
          peakTPS: { value: "835", date: "09/05/2025", description: "TPS cao nhất" },
          avgCPUUtilization: { value: "4.92%", rawPercentage: 4.92, description: "%CPU trung bình máy chủ" },
        },
        dayEndDurationData: [ { date: '01/05', duration: 170 }, { date: '02/05', duration: 165 }, { date: '03/05', duration: 175 }, { date: '04/05', duration: 180 }, { date: '05/05', duration: 160 }, { date: '06/05', duration: 172 }, { date: '07/05', duration: 168 }, { date: '08/05', duration: 178 }, { date: '09/05', duration: 171 }, { date: '10/05', duration: 163 }, { date: '11/05', duration: 174 }, { date: '12/05', duration: 166 }, { date: '13/05', duration: 179 }, { date: '14/05', duration: 162 }, { date: '15/05', duration: 177 }, { date: '16/05', duration: 169 }, { date: '17/05', duration: 173 }, { date: '18/05', duration: 167 }, { date: '19/05', duration: 176 }, { date: '20/05', duration: 164 }, { date: '21/05', duration: 181 }, { date: '22/05', duration: 170 }, { date: '23/05', duration: 165 }, { date: '24/05', duration: 175 }, { date: '25/05', duration: 180 }, { date: '26/05', duration: 160 }, { date: '27/05', duration: 172 }, { date: '28/05', duration: 168 }, { date: '29/05', duration: 178 }, { date: '30/05', duration: 171 }, { date: '31/05', duration: 227, highlight: true } ].map(d => ({ ...d, avg: 169 })),
        tpsPeakData: [ { time: '8:30', tps: 434 }, { time: '12:14', tps: 459 }, { time: '12:15', tps: 581 }, { time: '15:48', tps: 431 }, { time: '17:39', tps: 479 }, { time: '17:40', tps: 477 }, { time: '17:41', tps: 533 }, { time: '17:52', tps: 835 }, { time: '18:32', tps: 430 }, { time: '18:33', tps: 453 }, ],
        transactionByChannelData: [ { name: 'TT Song phương (B2B)', value: 44, color: '#4A8D6E' }, { name: 'IBFT', value: 27, color: '#E58A00' }, { name: 'TTHDOL', value: 11, color: '#B36D3A' }, { name: 'SMB', value: 8, color: '#884D98' }, { name: 'ATM', value: 3, color: '#6A5ACD' }, { name: 'Điện DRO', value: 2, color: '#20B2AA' }, { name: 'Thu phí tích hợp', value: 2, color: '#D2B48C' }, { name: 'OMNI', value: 1, color: '#4682B4' }, { name: 'CRM', value: 1, color: '#9ACD32' }, { name: 'Khác', value: 1, color: '#A9A9A9' }, ],
        growthMetrics: [ 
            { name: "Tổng giao dịch tài chính", percentageValue: "+30.72%", absoluteValue: "403,5M", icon: TrendingUp, color: "text-green-400", description: "So với cùng kỳ 2024" }, 
            { name: "Tổng số khách hàng", percentageValue: "+12.40%", absoluteValue: formatMillions(22759026), icon: Users, color: "text-green-400", description: "So với cùng kỳ 2024" }, 
            { name: "Tài khoản KKH", percentageValue: "-4.61%", absoluteValue: formatMillions(12891307), icon: ArrowDown, color: "text-red-400", description: "So với cùng kỳ 2024" }, 
            { name: "Tài khoản CKH", percentageValue: "+3.24%", absoluteValue: formatMillions(2948430), icon: ArrowUp, color: "text-green-400", description: "So với cùng kỳ 2024" }, 
            { name: "Tài khoản tiền vay", percentageValue: "+3.48%", absoluteValue: formatMillions(1183609), icon: ArrowUp, color: "text-green-400", description: "So với cùng kỳ 2024" }, 
        ],
        errorDetails: { status: "Không phát sinh lỗi gây gián đoạn giao dịch trên các kênh trong tháng 05/2025.", webCSRError: { date: "Rạng sáng ngày 25/05/2025", description: "Không truy cập được WebCSR, ảnh hưởng tới tác nghiệp của TT CSKH.", resolutionTime: "Đưa hệ thống trở lại hoạt động bình thường vào 8h08 cùng ngày", impact: "Không gây ảnh hưởng tới hoạt động của các Chi nhánh.", cause: "User ứng dụng WebCSR dùng để kết nối vào Core Profile bị hết hạn.", prevention: "Đã thiết lập thêm các job giám sát và cảnh báo để phát hiện sớm và xử lý kịp thời đối với các tài khoản sắp hết hạn." } },
        systemUpdateData: { totalAppUpdates: "42", manualParamUpdates: "209", manualParamProd: "46", systemDataUpdates: "8", profileDataUpdates: "6", devTestEnvStatus: "Duy trì ổn định, đáp ứng các yêu cầu" },
        nextSteps: "Tiếp tục theo dõi chặt chẽ hoạt động của hệ thống Core banking Profile."
      },
      '04/2025': {
         kpiData: {
          totalFinancialTransactions: { value: "385,1M", rawValue: 385146829, description: "Tổng số giao dịch tài chính", yearOverYear: "33.72%" },
          peakDayTransactions: { value: "~17.2M", rawValue: 17200000, date: "10/04/2025", description: "Giao dịch ngày cao điểm" },
          avgDayEndDuration: { value: "2h 53m", rawMinutes: 173, description: "Thời gian DayEnd trung bình" },
          avgResponseTime: { value: "5.09ms", description: "Tốc độ phản hồi trung bình" },
          peakTPS: { value: "646", date: "12/04/2025", description: "TPS cao nhất" },
          avgCPUUtilization: { value: "4.98%", rawPercentage: 4.98, description: "%CPU trung bình máy chủ" },
        },
        dayEndDurationData: [ { date: '01/04', duration: 175 }, { date: '02/04', duration: 180 }, { date: '03/04', duration: 170 }, { date: '04/04', duration: 165 }, { date: '05/04', duration: 172 }, { date: '06/04', duration: 168 }, { date: '07/04', duration: 178 }, { date: '08/04', duration: 171 }, { date: '09/04', duration: 163 }, { date: '10/04', duration: 174 }, { date: '11/04', duration: 166 }, { date: '12/04', duration: 179 }, { date: '13/04', duration: 162 }, { date: '14/04', duration: 177 }, { date: '15/04', duration: 169 }, { date: '16/04', duration: 173 }, { date: '17/04', duration: 167 }, { date: '18/04', duration: 176 }, { date: '19/04', duration: 164 }, { date: '20/04', duration: 181 }, { date: '21/04', duration: 170 }, { date: '22/04', duration: 165 }, { date: '23/04', duration: 175 }, { date: '24/04', duration: 180 }, { date: '25/04', duration: 160 }, { date: '26/04', duration: 172 }, { date: '27/04', duration: 168 }, { date: '28/04', duration: 178 }, { date: '29/04', duration: 171 }, { date: '30/04', duration: 227, highlight: true } ].map(d => ({ ...d, avg: 173 })),
        tpsPeakData: [ { time: '13:07', tps: 511 }, { time: '13:08', tps: 558 }, { time: '13:09', tps: 530 }, { time: '13:10', tps: 531 }, { time: '17:15', tps: 267 }, { time: '17:28', tps: 302 }, { time: '17:29', tps: 646 }, { time: '17:30', tps: 428 }, { time: '17:40', tps: 261 }, { time: '23:39', tps: 380 }, ],
        transactionByChannelData: [ { name: 'TT Song phương (B2B)', value: 44, color: '#4A8D6E' }, { name: 'IBFT', value: 27, color: '#E58A00' }, { name: 'TTHDOL', value: 11, color: '#B36D3A' }, { name: 'SMB', value: 8, color: '#884D98' }, { name: 'ATM', value: 3, color: '#6A5ACD' }, { name: 'Điện DRO', value: 2, color: '#20B2AA' }, { name: 'Thu phí tích hợp', value: 2, color: '#D2B48C' }, { name: 'OMNI', value: 1, color: '#4682B4' }, { name: 'CRM', value: 1, color: '#9ACD32' }, { name: 'Khác', value: 1, color: '#A9A9A9' }, ],
        growthMetrics: [ { name: "Tổng giao dịch tài chính", percentageValue: "+33.72%", absoluteValue: "385,1M", icon: TrendingUp, color: "text-green-400", description: "So với cùng kỳ 2024" }, { name: "Tổng số khách hàng", percentageValue: "+13.22%", absoluteValue: formatMillions(22571454), icon: Users, color: "text-green-400", description: "So với cùng kỳ 2024" }, { name: "Tài khoản KKH", percentageValue: "-4.14%", absoluteValue: formatMillions(12891307), icon: ArrowDown, color: "text-red-400", description: "So với cùng kỳ 2024" }, { name: "Tài khoản CKH", percentageValue: "+3.78%", absoluteValue: formatMillions(2948430), icon: ArrowUp, color: "text-green-400", description: "So với cùng kỳ 2024" }, { name: "Tài khoản tiền vay", percentageValue: "+3.90%", absoluteValue: formatMillions(1183609), icon: ArrowUp, color: "text-green-400", description: "So với cùng kỳ 2024" }, ],
        errorDetails: { status: "Trong tháng 04/2025, hệ thống core banking không phát sinh lỗi gây gián đoạn giao dịch trên các kênh.", webCSRError: { date: "20h51 – 20h55 ngày Chủ nhật - 20/04/2025", description: "Hiện tượng phản hồi chậm trên các máy chủ report, gây lỗi chập chờn đối với giao dịch từ các kênh online.", resolutionTime: "Máy chủ report 1 tự khôi phục, máy chủ report 2 được build lại và hoàn thành trước 8h sáng hôm sau.", impact: "Không gây ảnh hưởng tới hoạt động chung của hệ thống do kịch bản dự phòng kịp thời.", cause: "Lỗi đọc ghi dữ liệu trên các máy chủ report.", prevention: "N/A" } },
        systemUpdateData: { totalAppUpdates: "53", manualParamUpdates: "183", manualParamProd: "49", systemDataUpdates: "14", profileDataUpdates: "7", devTestEnvStatus: "Duy trì ổn định, đáp ứng các yêu cầu" },
        nextSteps: "Tiếp tục theo dõi chặt chẽ hoạt động của hệ thống Core banking Profile."
      }
    };
    const historicalDataYears = ['2019', '2020', '2021', '2022', '2023', '2024', '2025'];
    const totalHistoricalDataTransactions = [ { month: 'T1', '2019': null, '2020': 70398653, '2021': 102638103, '2022': 130703966, '2023': 181356164, '2024': 286287309, '2025': 384731977 }, { month: 'T2', '2019': 36279421, '2020': 57879463, '2021': 89245849, '2022': 83360056, '2023': 158938838, '2024': 236921056, '2025': 279081583 }, { month: 'T3', '2019': 51820298, '2020': 68676065, '2021': 102350186, '2022': 122619991, '2023': 199759104, '2024': 281081993, '2025': 370057722 }, { month: 'T4', '2019': 52226477, '2020': 58819178, '2021': 103837369, '2022': 128137360, '2023': 201192652, '2024': 288032713, '2025': 385146829 }, { month: 'T5', '2019': 55369694, '2020': 68579336, '2021': 103046250, '2022': 130494810, '2023': 206797842, '2024': 308745155, '2025': 403585961 }, { month: 'T6', '2019': 56695303, '2020': 73334371, '2021': 103126615, '2022': 133375455, '2023': 204752945, '2024': 295939971, '2025': null }, { month: 'T7', '2019': 57697356, '2020': 84454355, '2021': 102540561, '2022': 138090542, '2023': 214731121, '2024': 298608364, '2025': null }, { month: 'T8', '2019': 58799243, '2020': 77298869, '2021': 96668079, '2022': 148734220, '2023': 240964790, '2024': 324080355, '2025': null }, { month: 'T9', '2019': 61182154, '2020': 85248817, '2021': 104123078, '2022': 153754867, '2023': 211926840, '2024': 318656429, '2025': null }, { month: 'T10', '2019': 67396522, '2020': 86593211, '2021': 119182757, '2022': 167486378, '2023': 254211060, '2024': 355536341, '2025': null }, { month: 'T11', '2019': 64845235, '2020': 88003871, '2021': 123256901, '2022': 172958138, '2023': 256737976, '2024': 352507647, '2025': null }, { month: 'T12', '2019': 82155719, '2020': 106484240, '2021': 140437165, '2022': 193265178, '2023': 280907282, '2024': 373647363, '2025': null } ];
    const historicalDataCustomers = [ { month: 'T1', '2019': 9656487, '2020': 10786031, '2021': 12030916, '2022': 13848173, '2023': 15952993, '2024': 19355122, '2025': 22044666 }, { month: 'T2', '2019': 9721375, '2020': 10896651, '2021': 12091951, '2022': 13951141, '2023': 16122033, '2024': 19497444, '2025': 22208411 }, { month: 'T3', '2019': 9867924, '2020': 11021568, '2021': 12245414, '2022': 13836463, '2023': 16394484, '2024': 19716610, '2025': 22400157 }, { month: 'T4', '2019': 9995512, '2020': 11102005, '2021': 12428870, '2022': 14031236, '2023': 16699062, '2024': 19936667, '2025': 22571454 }, { month: 'T5', '2019': 10122903, '2020': 11215459, '2021': 12594700, '2022': 14230788, '2023': 17005047, '2024': 20247475, '2025': 22759026 }, { month: 'T6', '2019': 10230944, '2020': 11348598, '2021': 12732373, '2022': 14411889, '2023': 17396120, '2024': 20477446, '2025': null }, { month: 'T7', '2019': 10360057, '2020': 11487241, '2021': 12836365, '2022': 14564994, '2023': 17767003, '2024': 20717127, '2025': null }, { month: 'T8', '2019': 10499226, '2020': 11603118, '2021': 12927206, '2022': 14765195, '2023': 18126071, '2024': 21005215, '2025': null }, { month: 'T9', '2019': 10338024, '2020': 11480809, '2021': 13048090, '2022': 15035510, '2023': 18405803, '2024': 21298283, '2025': null }, { month: 'T10', '2019': 10492757, '2020': 11642540, '2021': 13273258, '2022': 15319916, '2023': 18734816, '2024': 21536440, '2025': null }, { month: 'T11', '2019': 10606801, '2020': 11802198, '2021': 13538154, '2022': 15628798, '2023': 18979659, '2024': 21760624, '2025': null }, { month: 'T12', '2019': 10721178, '2020': 11935334, '2021': 13751551, '2022': 15847618, '2023': 19174616, '2024': 21915101, '2025': null } ];
    const avgDailyTransactionOverviewData = [ { name: 'T10/24', NgayThuong: 11916844, CuoiTuan: 10230944, ChungCaThang: 11579583 }, { name: 'T11/24', NgayThuong: 12200000, CuoiTuan: 10700000, ChungCaThang: 11700000 }, { name: 'T12/24', NgayThuong: 12600000, CuoiTuan: 10600000, ChungCaThang: 11800000 }, { name: 'T1/25', NgayThuong: 14200000, CuoiTuan: 10000000, ChungCaThang: 12500000 }, { name: 'T2/25', NgayThuong: 10800000, CuoiTuan: 9800000, ChungCaThang: 8000000 }, { name: 'T3/25', NgayThuong: 12400000, CuoiTuan: 10400000, ChungCaThang: 12000000 }, { name: 'T4/25', NgayThuong: 13200000, CuoiTuan: 11400000, ChungCaThang: 12800000 }, { name: 'T5/25', NgayThuong: 13465361, CuoiTuan: 11916844, ChungCaThang: 12981449 }, ];

    const [filterOpen, setFilterOpen] = useState(false);
    const [selectedYears, setSelectedYears] = useState(historicalDataYears);
    const [reports, setReports] = useState(initialReportData);
    const [currentMonth, setCurrentMonth] = useState('05/2025');
    const [isExporting, setIsExporting] = useState(false);
    const [maximizedChart, setMaximizedChart] = useState(null);

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
        alert("Tính năng nhập dữ liệu có cấu trúc từ file PDF hiện không được hỗ trợ trực tiếp trong trình duyệt. Vui lòng thử tải lên file JSON có cấu trúc tương tự báo cáo mẫu.");
        } else if (file.type === 'application/json') {
        const reader = new FileReader();
        reader.onload = (e) => {
            try {
            const importedData = JSON.parse(e.target.result);
            const newMonthKey = prompt("Vui lòng nhập tháng/năm cho báo cáo này (ví dụ: 06/2025):");
            if (newMonthKey && /^\d{2}\/\d{4}$/.test(newMonthKey)) {
                setReports(prevReports => ({
                ...prevReports,
                [newMonthKey]: importedData
                }));
                setCurrentMonth(newMonthKey);
                alert(`Báo cáo cho tháng ${newMonthKey} đã được nhập thành công!`);
            } else if(newMonthKey) {
                alert("Định dạng tháng/năm không hợp lệ. Vui lòng sử dụng định dạng MM/YYYY.");
            }
            } catch (error) {
            alert("Lỗi khi đọc file JSON. Vui lòng kiểm tra định dạng file.");
            }
        };
        reader.readAsText(file);
        } else {
        alert("Định dạng file không được hỗ trợ. Vui lòng chọn file JSON.");
        }
    };

    const handleExportPdf = useCallback(() => {
        const element = document.getElementById('dashboard-content');
        if (element && typeof window.html2pdf !== 'undefined') {
        setIsExporting(true);
        const opt = {
            margin: [5, 5, 5, 5],
            filename: `bao_cao_core_banking_${currentMonth.replace('/', '_')}.pdf`,
            image: { type: 'jpeg', quality: 0.98 },
            html2canvas: { scale: 2, backgroundColor: '#2D544C', useCORS: true },
            jsPDF: { unit: 'mm', format: 'a4', orientation: 'portrait' }
        };
        window.html2pdf().from(element).set(opt).save().then(() => {
            setIsExporting(false);
        }).catch(() => {
            setIsExporting(false);
            alert("Có lỗi xảy ra khi xuất PDF.");
        });
        } else {
        alert('Thư viện xuất PDF chưa sẵn sàng. Vui lòng thử lại sau.');
        }
    }, [currentMonth]);

    const calculateTrend = (currentValue, previousValue) => {
        const parseValue = (val) => {
        if (typeof val === 'number') return val;
        if (typeof val === 'string') {
            let numStr = val.replace(/,/g, '');
            if (numStr.includes("M")) numStr = numStr.replace("M", "") * 1000000;
            if (numStr.includes("h")) {
            const parts = val.split('h');
            const hours = parseInt(parts[0]) || 0;
            const minutes = parseInt(parts[1].replace('m','')) || 0;
            return hours * 60 + minutes;
            }
            return parseFloat(numStr.replace(/[^0-9.-]+/g, ""));
        }
        return NaN;
        };
        const currentNum = parseValue(currentValue);
        const previousNum = parseValue(previousValue);
        if (!isNaN(currentNum) && !isNaN(previousNum) && previousNum !== 0) {
        const percentage = ((currentNum - previousNum) / previousNum) * 100;
        return `${percentage > 0 ? '+' : ''}${percentage.toFixed(2)}%`;
        }
        return null;
    };
    
    const currentReport = reports[currentMonth] || Object.values(reports)[0];
    const prevMonthKeys = Object.keys(reports).sort();
    const currentMonthIndex = prevMonthKeys.indexOf(currentMonth);
    const prevMonthKey = currentMonthIndex > 0 ? prevMonthKeys[currentMonthIndex - 1] : null;
    const prevReport = prevMonthKey ? reports[prevMonthKey] : null;

    const kpiTrends = {};
    if (prevReport && currentReport) {
        kpiTrends.totalFinancialTransactions = calculateTrend(currentReport.kpiData.totalFinancialTransactions.rawValue, prevReport.kpiData.totalFinancialTransactions.rawValue);
        kpiTrends.peakDayTransactions = calculateTrend(currentReport.kpiData.peakDayTransactions.rawValue, prevReport.kpiData.peakDayTransactions.rawValue);
        kpiTrends.avgDayEndDuration = calculateTrend(currentReport.kpiData.avgDayEndDuration.rawMinutes, prevReport.kpiData.avgDayEndDuration.rawMinutes);
        kpiTrends.avgResponseTime = calculateTrend(currentReport.kpiData.avgResponseTime.value, prevReport.kpiData.avgResponseTime.value);
        kpiTrends.peakTPS = calculateTrend(currentReport.kpiData.peakTPS.value, prevReport.kpiData.peakTPS.value);
        kpiTrends.avgCPUUtilization = calculateTrend(currentReport.kpiData.avgCPUUtilization.rawPercentage, prevReport.kpiData.avgCPUUtilization.rawPercentage);
    }

    const handleMaximizeChart = (chartContent, chartTitle) => {
        setMaximizedChart({ content: chartContent, title: chartTitle });
    };
    const handleCloseMaximizedChart = () => setMaximizedChart(null);
    
    const { kpiData, transactionByChannelData, growthMetrics, errorDetails, systemUpdateData, nextSteps } = currentReport;
    const lineColors = ['#FFD700', '#82ca9d', '#ff7300', '#8884d8', '#a4de6c', '#d0ed57', '#83a6ed' ];

    return (
        <div className="min-h-screen bg-[#2D544C] text-white font-inter selection:bg-[#FFD700] selection:text-[#2D544C]">
        {isExporting && (
            <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center text-white text-2xl z-[101]">
            <div className="flex flex-col items-center">
                <svg className="animate-spin h-10 w-10 text-white mb-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>
                Đang xuất báo cáo PDF...
            </div>
            </div>
        )}
        {maximizedChart && (
            <ChartModal title={maximizedChart.title} onClose={handleCloseMaximizedChart}>
            {maximizedChart.content}
            </ChartModal>
        )}

        {/* --- HEADER & CONTROLS --- */}
        <header className="sticky top-0 z-50 bg-[#2D544C]/80 backdrop-blur-lg border-b border-white/10 p-4">
            <div className="max-w-7xl mx-auto flex items-center justify-between">
                <div className="flex items-center gap-4">
                    <BidvLogo className="h-10" />
                    <h1 className="text-2xl sm:text-3xl font-extrabold hidden md:block" style={{ background: 'linear-gradient(to right, #C0B283, #FFD700, #DAA520, #B8860B)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', filter: 'drop-shadow(1px 1px 1px rgba(0,0,0,0.5))' }}>
                        Core Banking Operations Report
                    </h1>
                </div>

                <div className="flex items-center gap-2 sm:gap-4">
                    <select value={currentMonth} onChange={(e) => setCurrentMonth(e.target.value)} className="bg-transparent border border-white/20 rounded-lg py-2 px-3 text-sm text-white hover:border-[#FFD700] focus:outline-none focus:ring-2 focus:ring-[#FFD700]">
                        {Object.keys(reports).sort((a, b) => b.localeCompare(a)).map(month => ( <option key={month} value={month} className="bg-[#2D544C]">{`Tháng ${month}`}</option>))}
                    </select>
                    
                    <div className="relative">
                        <button onClick={() => setFilterOpen(!filterOpen)} className="p-2 rounded-lg bg-white/10 hover:bg-white/20 transition-colors">
                            <Filter size={20} />
                        </button>
                        {filterOpen && (
                            <div className="absolute top-full right-0 mt-2 w-64 bg-[#3A6B63] border border-white/10 rounded-lg shadow-2xl p-4">
                                <h3 className="text-md font-semibold mb-3">Lọc dữ liệu theo năm</h3>
                                <div className="grid grid-cols-2 gap-2">
                                    {historicalDataYears.map(year => (
                                    <label key={year} className="inline-flex items-center text-sm cursor-pointer">
                                        <input type="checkbox" value={year} checked={selectedYears.includes(year)} onChange={() => handleYearChange(year)} className="form-checkbox h-4 w-4 text-[#DAA520] bg-gray-600 border-gray-500 rounded focus:ring-[#DAA520]" />
                                        <span className="ml-2 text-gray-200">{year}</span>
                                    </label>
                                    ))}
                                </div>
                            </div>
                        )}
                    </div>

                    <label htmlFor="import-file" className="p-2 rounded-lg bg-white/10 hover:bg-white/20 transition-colors cursor-pointer"><Upload size={20} /><input id="import-file" type="file" accept=".json,.pdf" onChange={handleFileImport} className="hidden" /></label>
                    <button onClick={handleExportPdf} className="p-2 rounded-lg bg-white/10 hover:bg-white/20 transition-colors"><Download size={20} /></button>
                </div>
            </div>
        </header>
        
        <main id="dashboard-content" className="p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto">
            <div className="text-center mb-12">
                <AnimatedComponent>
                    <h2 className="text-4xl font-bold text-white">Báo cáo hoạt động Core Banking</h2>
                    <p className="text-xl text-[#FFD700] mt-2">{`Tháng ${currentMonth}`}</p>
                </AnimatedComponent>
            </div>

            {/* --- SECTION 1: PERFORMANCE --- */}
            <section className="mb-16">
            <AnimatedComponent className="flex items-center gap-4 mb-8">
                <BarChart2 size={32} className="text-[#FFD700]" />
                <h3 className="text-3xl font-bold">Hiệu suất & Độ ổn định</h3>
            </AnimatedComponent>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                <KpiCard title={kpiData.totalFinancialTransactions.description} value={kpiData.totalFinancialTransactions.value} icon={Activity} valueColor="text-green-400" trendValue={kpiTrends.totalFinancialTransactions} yearOverYearGrowth={kpiData.totalFinancialTransactions.yearOverYear} yoyLabel="so với cùng kỳ năm 2024" />
                <KpiCard title={kpiData.peakDayTransactions.description} value={kpiData.peakDayTransactions.value} icon={TrendingUp} valueColor="text-green-400" description={`Ngày: ${kpiData.peakDayTransactions.date}`} trendValue={kpiTrends.peakDayTransactions} />
                <KpiCard title={kpiData.peakTPS.description} value={kpiData.peakTPS.value} icon={Activity} valueColor="text-orange-400" description={`Ngày: ${kpiData.peakTPS.date}`} trendValue={kpiTrends.peakTPS} />
                <KpiCard title={kpiData.avgDayEndDuration.description} value={kpiData.avgDayEndDuration.value} icon={Clock} valueColor="text-indigo-400" trendValue={kpiTrends.avgDayEndDuration} trendDirection="down" />
                <KpiCard title={kpiData.avgResponseTime.description} value={kpiData.avgResponseTime.value} icon={Activity} valueColor="text-teal-400" trendValue={kpiTrends.avgResponseTime} trendDirection="down" />
                <KpiCard title={kpiData.avgCPUUtilization.description} value={kpiData.avgCPUUtilization.value} icon={Cpu} valueColor="text-blue-400" trendValue={kpiTrends.avgCPUUtilization} trendDirection="down" />
            </div>
            </section>

            {/* --- SECTION 2: VISUALIZATIONS --- */}
            <section className="mb-16 grid grid-cols-1 lg:grid-cols-5 gap-6">
                <div className="lg:col-span-2">
                    <ChartCard title={`Tỷ trọng giao dịch theo kênh`}>
                        <ResponsiveContainer width="100%" height="100%">
                            <PieChart>
                                <Pie data={transactionByChannelData} dataKey="value" nameKey="name" cx="50%" cy="50%" innerRadius={80} outerRadius={120} fill="#8884d8" paddingAngle={2} stroke="none">
                                    {transactionByChannelData.map((entry, index) => (<Cell key={`cell-${index}`} fill={entry.color} />))}
                                </Pie>
                                <Tooltip content={<CustomTooltip unit="%" />} />
                                <Legend iconType="circle" wrapperStyle={{fontSize: "12px"}}/>
                            </PieChart>
                        </ResponsiveContainer>
                    </ChartCard>
                </div>
                <div className="lg:col-span-3">
                    <ChartCard title="Số lượng giao dịch trung bình theo ngày">
                        <ResponsiveContainer width="100%" height="100%">
                        <AreaChart data={avgDailyTransactionOverviewData} margin={{ top: 10, right: 30, left: 20, bottom: 0 }}>
                                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255, 255, 255, 0.1)" />
                                <XAxis dataKey="name" stroke="rgba(255, 255, 255, 0.5)" tick={{ fontSize: 12 }} />
                                <YAxis stroke="rgba(255, 255, 255, 0.5)" tickFormatter={(value) => `${(value / 1000000)}M`} tick={{ fontSize: 12 }} />
                                <Tooltip content={<CustomTooltip valueFormatter={val => val.toLocaleString()}/>} />
                                <Legend />
                                <defs>
                                    <linearGradient id="colorNgayThuong" x1="0" y1="0" x2="0" y2="1"><stop offset="5%" stopColor="#8884d8" stopOpacity={0.8}/><stop offset="95%" stopColor="#8884d8" stopOpacity={0}/></linearGradient>
                                    <linearGradient id="colorCuoiTuan" x1="0" y1="0" x2="0" y2="1"><stop offset="5%" stopColor="#82ca9d" stopOpacity={0.8}/><stop offset="95%" stopColor="#82ca9d" stopOpacity={0}/></linearGradient>
                                </defs>
                                <Area type="monotone" dataKey="NgayThuong" name="Ngày thường" stackId="1" stroke="#8884d8" fill="url(#colorNgayThuong)" />
                                <Area type="monotone" dataKey="CuoiTuan" name="Cuối tuần" stackId="1" stroke="#82ca9d" fill="url(#colorCuoiTuan)" />
                            </AreaChart>
                        </ResponsiveContainer>
                    </ChartCard>
                </div>
            </section>

            {/* --- SECTION 3: ERROR HANDLING --- */}
            <section className="mb-16">
                <AnimatedComponent className="flex items-center gap-4 mb-8">
                    <AlertTriangle size={32} className="text-[#FFD700]" />
                    <h3 className="text-3xl font-bold">Tình hình khắc phục lỗi</h3>
                </AnimatedComponent>
                <AnimatedComponent className="bg-[#3A6B63]/50 backdrop-blur-sm border border-white/10 p-6 rounded-2xl shadow-2xl">
                    <div className="flex items-start gap-4 mb-6 pb-6 border-b border-white/10">
                        <CheckCircle className="text-green-400 mt-1 flex-shrink-0" size={24} />
                        <div>
                            <h4 className="font-bold text-lg">Trạng thái tổng quan</h4>
                            <p className="text-gray-300">{errorDetails.status}</p>
                        </div>
                    </div>
                    <div>
                        <h4 className="font-bold text-lg mb-4">Chi tiết sự cố (WebCSR)</h4>
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 text-sm">
                            <div className="bg-black/20 p-4 rounded-lg">
                                <p className="font-semibold text-gray-400 mb-1">Thời gian & Mô tả</p>
                                <p>{errorDetails.webCSRError.date}: {errorDetails.webCSRError.description}</p>
                            </div>
                            <div className="bg-black/20 p-4 rounded-lg">
                                <p className="font-semibold text-gray-400 mb-1">Nguyên nhân & Tác động</p>
                                <p><strong>Nguyên nhân:</strong> {errorDetails.webCSRError.cause}</p>
                                <p><strong>Tác động:</strong> {errorDetails.webCSRError.impact}</p>
                            </div>
                            <div className="bg-black/20 p-4 rounded-lg">
                                <p className="font-semibold text-gray-400 mb-1">Khắc phục & Phòng ngừa</p>
                                <p><strong>Xử lý:</strong> {errorDetails.webCSRError.resolutionTime}</p>
                                <p><strong>Phòng ngừa:</strong> {errorDetails.webCSRError.prevention}</p>
                            </div>
                        </div>
                    </div>
                </AnimatedComponent>
            </section>

            {/* --- SECTION 4: GROWTH --- */}
            <section className="mb-16">
                <AnimatedComponent className="flex items-center gap-4 mb-8">
                    <Users size={32} className="text-[#FFD700]" />
                    <h3 className="text-3xl font-bold">Tăng trưởng Khách hàng & Tài khoản</h3>
                </AnimatedComponent>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6 mb-8">
                    {growthMetrics.map((metric, index) => (
                        <GrowthMetricCard
                            key={index}
                            icon={metric.icon}
                            color={metric.color}
                            absoluteValue={metric.absoluteValue}
                            percentageValue={metric.percentageValue}
                            name={metric.name}
                            description={metric.description}
                        />
                    ))}
                </div>
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    <ChartCard title="Xu hướng số lượng giao dịch tài chính">
                        <ResponsiveContainer width="100%" height="100%">
                            <LineChart data={totalHistoricalDataTransactions} margin={{ top: 5, right: 20, left: -10, bottom: 5 }}>
                                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255, 255, 255, 0.1)"/>
                                <XAxis dataKey="month" stroke="rgba(255, 255, 255, 0.5)" tick={{ fontSize: 12 }} />
                                <YAxis tickFormatter={(value) => `${(value / 1000000)}M`} stroke="rgba(255, 255, 255, 0.5)" tick={{ fontSize: 12 }}/>
                                <Tooltip content={<CustomTooltip valueFormatter={val => `${(val/1000000).toFixed(1)}M`} />} />
                                <Legend />
                                {selectedYears.map((year, index) => (
                                    <Line key={year} type="monotone" dataKey={year} stroke={lineColors[index % lineColors.length]} name={year} dot={false} strokeWidth={2} />
                                ))}
                            </LineChart>
                        </ResponsiveContainer>
                    </ChartCard>
                    <ChartCard title="Xu hướng số lượng khách hàng">
                        <ResponsiveContainer width="100%" height="100%">
                            <LineChart data={historicalDataCustomers} margin={{ top: 5, right: 20, left: -10, bottom: 5 }}>
                                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255, 255, 255, 0.1)"/>
                                <XAxis dataKey="month" stroke="rgba(255, 255, 255, 0.5)" tick={{ fontSize: 12 }} />
                                <YAxis tickFormatter={(value) => `${(value / 1000000).toFixed(1)}M`} stroke="rgba(255, 255, 255, 0.5)" tick={{ fontSize: 12 }}/>
                                <Tooltip content={<CustomTooltip valueFormatter={val => `${(val/1000000).toFixed(1)}M`} />} />
                                <Legend />
                                {selectedYears.map((year, index) => (
                                    <Line key={year} type="monotone" dataKey={year} stroke={lineColors[index % lineColors.length]} name={year} dot={false} strokeWidth={2} />
                                ))}
                            </LineChart>
                        </ResponsiveContainer>
                    </ChartCard>
                </div>
            </section>

            {/* --- SECTION 5: SYSTEM MANAGEMENT --- */}
            <section className="mb-16">
                <AnimatedComponent className="flex items-center gap-4 mb-8">
                    <Settings size={32} className="text-[#FFD700]" />
                    <h3 className="text-3xl font-bold">Quản lý & Cập nhật hệ thống</h3>
                </AnimatedComponent>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                    <AnimatedComponent className="bg-[#3A6B63]/50 backdrop-blur-sm border border-white/10 p-6 rounded-2xl text-center">
                        <FileText size={40} className="mx-auto text-pink-400 mb-3" />
                        <p className="text-4xl font-bold">{systemUpdateData.totalAppUpdates}</p>
                        <p className="text-gray-300">lượt cập nhật ứng dụng</p>
                    </AnimatedComponent>
                    <AnimatedComponent className="bg-[#3A6B63]/50 backdrop-blur-sm border border-white/10 p-6 rounded-2xl text-center">
                        <Settings size={40} className="mx-auto text-yellow-400 mb-3" />
                        <p className="text-4xl font-bold">{systemUpdateData.manualParamUpdates}</p>
                        <p className="text-gray-300">cập nhật tham số thủ công</p>
                        <p className="text-xs text-gray-400">{`(${systemUpdateData.manualParamProd} trên Production)`}</p>
                    </AnimatedComponent>
                    <AnimatedComponent className="bg-[#3A6B63]/50 backdrop-blur-sm border border-white/10 p-6 rounded-2xl text-center">
                        <Database size={40} className="mx-auto text-lime-400 mb-3" />
                        <p className="text-4xl font-bold">{systemUpdateData.systemDataUpdates}</p>
                        <p className="text-gray-300">cập nhật dữ liệu hệ thống</p>
                        <p className="text-xs text-gray-400">{`(${systemUpdateData.profileDataUpdates} cho Profile)`}</p>
                    </AnimatedComponent>
                    <AnimatedComponent className="bg-[#3A6B63]/50 backdrop-blur-sm border border-white/10 p-6 rounded-2xl text-center">
                        <Server size={40} className="mx-auto text-blue-400 mb-3" />
                        <p className="text-lg font-bold mt-2">Môi trường Dev/Test</p>
                        <p className="text-green-400 font-semibold">{systemUpdateData.devTestEnvStatus}</p>
                    </AnimatedComponent>
                </div>
            </section>

            {/* --- SECTION 6: NEXT STEPS --- */}
            <section>
                <AnimatedComponent className="flex items-center gap-4 mb-8">
                    <CalendarCheck size={32} className="text-[#FFD700]" />
                    <h3 className="text-3xl font-bold">Công việc tiếp theo</h3>
                </AnimatedComponent>
                <AnimatedComponent>
                    <div className="bg-gradient-to-r from-[#FFD700]/80 to-[#B8860B]/80 p-1 rounded-2xl shadow-2xl">
                        <div className="bg-[#2D544C] p-8 rounded-xl">
                            <p className="text-xl text-center font-semibold text-white tracking-wide">
                                {nextSteps}
                            </p>
                        </div>
                    </div>
                </AnimatedComponent>
            </section>

            <footer className="text-center text-gray-500 text-sm mt-16">
            Báo cáo được tạo tự động từ dữ liệu của Ban QLPTCB.
            </footer>
        </main>
        </div>
    );
};

export default App;
