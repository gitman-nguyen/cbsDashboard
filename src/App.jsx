import React, { useState, useEffect, useRef, useCallback } from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, PieChart, Pie, Cell, AreaChart, Area } from 'recharts';
import { ArrowUp, ArrowDown, CheckCircle, AlertTriangle, Cpu, Clock, Activity, CalendarCheck, FileText, Settings, Database, Server, Minimize2, Maximize2, ChevronRight, BrainCircuit, Loader, TrendingUp, Users, Filter, Download, Upload, BarChart2, LogIn, User, Lock } from 'lucide-react';

// --- STYLING & ANIMATION COMPONENTS ---

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
        <div ref={ref} className={`${className} transition-all duration-1000 ease-out ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'}`}>
            {children}
        </div>
    );
};

const CardBackgroundPattern = () => (
    <div className="card-pattern absolute inset-0 w-full h-full opacity-5 group-hover:opacity-15 transition-opacity duration-500">
        <svg width="100%" height="100%">
            <defs>
                <pattern id="pattern-circles" x="0" y="0" width="80" height="80" patternUnits="userSpaceOnUse">
                    <circle cx="40" cy="40" r="1" fill="#FFD700" />
                </pattern>
            </defs>
            <rect x="0" y="0" width="100%" height="100%" fill="url(#pattern-circles)"></rect>
        </svg>
    </div>
);

const FireflyBackground = () => (
    <div className="firefly-container">
        {[...Array(15)].map((_, i) => <div className="firefly" key={i}></div>)}
    </div>
);


// --- UI COMPONENTS ---

const KpiCard = ({ title, value, description, icon: Icon, valueColor = "text-blue-500", detail, trendValue, yearOverYearGrowth = null, trendDirection = 'up', yoyLabel = 'YoY' }) => {
    const trendNum = parseFloat(trendValue);
    const isGood = !isNaN(trendNum) && (trendDirection === 'up' ? trendNum >= 0 : trendNum <= 0);
    const trendColor = isNaN(trendNum) ? 'text-gray-400' : isGood ? 'text-green-400' : 'text-red-400';
    const TrendIcon = trendNum >= 0 ? ArrowUp : ArrowDown;

    return (
        <AnimatedComponent className="group relative bg-white/5 backdrop-blur-md border border-white/10 p-6 rounded-2xl shadow-2xl flex flex-col justify-between transform hover:-translate-y-2 transition-transform duration-300 overflow-hidden page-break-avoider">
            <CardBackgroundPattern />
            <div className="relative z-10">
                <div className="flex justify-between items-start mb-4">
                    <div className="flex-1">
                        <h3 className="text-sm font-semibold text-gray-300 uppercase tracking-wider">{title}</h3>
                        <p className="text-4xl font-bold text-white mt-1">{value}</p>
                    </div>
                    {Icon && <Icon className={`${valueColor} flex-shrink-0`} size={40} strokeWidth={1.5} />}
                </div>
                 {description && <p className="text-xs text-gray-400">{description}</p>}
            </div>
            <div className="relative z-10 mt-4 pt-4 border-t border-white/10">
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
        <AnimatedComponent className="group relative bg-white/5 backdrop-blur-md border border-white/10 p-4 rounded-2xl text-center flex flex-col items-center justify-center transform hover:-translate-y-2 transition-transform duration-300 overflow-hidden page-break-avoider">
             <CardBackgroundPattern />
            <div className="relative z-10">
                <Icon className={color} size={32} />
                <p className="text-3xl font-bold text-white mt-2">{absoluteValue}</p>
                <p className={`text-lg font-semibold ${color}`}>{percentageValue}</p>
                <p className="text-xs text-gray-300 mt-1">{name}</p>
                <p className="text-xs text-gray-400">{description}</p>
            </div>
        </AnimatedComponent>
    );
};


const ChartCard = ({ title, children, className = "" }) => {
  return (
    <AnimatedComponent className={`group relative bg-white/5 backdrop-blur-md border border-white/10 p-4 sm:p-6 rounded-2xl shadow-2xl ${className} page-break-avoider`}>
      <CardBackgroundPattern />
      <div className="relative z-10 flex justify-between items-center mb-4">
        <h3 className="text-lg font-bold text-white">{title}</h3>
      </div>
      <div className="relative z-10 h-80">{children}</div>
    </AnimatedComponent>
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

// --- LOGIN COMPONENT ---
const LoginScreen = ({ onLogin, loginError }) => {
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');

    const handleSubmit = (e) => {
        e.preventDefault();
        onLogin(username, password);
    };

    return (
        <div className="flex items-center justify-center min-h-screen">
            <AnimatedComponent className="w-full max-w-md">
                <form onSubmit={handleSubmit} className="group relative bg-white/5 backdrop-blur-md border border-white/10 p-8 rounded-2xl shadow-2xl overflow-hidden">
                    <CardBackgroundPattern />
                    <div className="relative z-10">
                        <div className="text-center mb-8">
                            <BidvLogo className="h-12 mx-auto mb-4" />
                            <h2 className="text-2xl font-bold text-white">Đăng nhập Hệ thống Báo cáo</h2>
                            <p className="text-gray-400">Vui lòng nhập thông tin để tiếp tục</p>
                        </div>
                        
                        {loginError && (
                            <div className="bg-red-500/20 border border-red-500 text-red-300 text-sm rounded-lg p-3 mb-4 flex items-center">
                                <AlertTriangle size={16} className="mr-2" />
                                {loginError}
                            </div>
                        )}

                        <div className="mb-4 relative">
                            <User className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
                            <input
                                type="text"
                                placeholder="Tên đăng nhập"
                                value={username}
                                onChange={(e) => setUsername(e.target.value)}
                                className="w-full bg-gray-900/50 border border-white/20 rounded-lg py-3 pl-12 pr-4 text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-yellow-400"
                            />
                        </div>
                        <div className="mb-6 relative">
                            <Lock className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
                            <input
                                type="password"
                                placeholder="Mật khẩu"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                className="w-full bg-gray-900/50 border border-white/20 rounded-lg py-3 pl-12 pr-4 text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-yellow-400"
                            />
                        </div>
                        <button type="submit" className="w-full bg-yellow-400 text-gray-900 font-bold py-3 rounded-lg hover:bg-yellow-500 transition-colors flex items-center justify-center gap-2">
                            <LogIn size={20} />
                            Đăng nhập
                        </button>
                    </div>
                </form>
            </AnimatedComponent>
        </div>
    );
};


const App = () => {
    const [isAuthenticated, setIsAuthenticated] = useState(false);
    const [loginError, setLoginError] = useState('');
    const [isErrorDetailExpanded, setIsErrorDetailExpanded] = useState(false);
    const [isAnalyzing, setIsAnalyzing] = useState(false);
    const [analysisMessage, setAnalysisMessage] = useState("AI đang phân tích báo cáo...");
    const [cooldown, setCooldown] = useState(0);
    const [confirmationData, setConfirmationData] = useState(null);

    const handleLogin = (username, password) => {
        // Hardcoded credentials as per user request
        if (username === 'cbs' && password === 'Cbs@BIDV') {
            setIsAuthenticated(true);
            setLoginError('');
        } else {
            setLoginError('Tên đăng nhập hoặc mật khẩu không chính xác.');
        }
    };

    const formatMillions = (value) => {
        if (!value) return "N/A";
        return `${(value / 1000000).toFixed(2)}M`;
    }
    
    const optimizeReportContent = (text) => {
        const sectionsToKeep = [
            "một số chỉ số hoạt động chính của hệ thống",
            "công tác khắc phục lỗi hệ thống",
            "đánh giá hoạt động của hệ thống",
            "các công việc tiếp theo",
            "thống kê số lượng giao dịch tài chính",
            "thống kê số lượng khách hàng"
        ];

        const stopSections = [
            "thống kê số lượng tài khoản tiền gửi",
            "danh sách các bản vá lỗi",
            "phụ lục 03"
        ];

        const lines = text.split('\n');
        let optimizedLines = [];
        let capturing = false;

        for (const line of lines) {
            const lowerLine = line.toLowerCase().trim();

            let isStartKeyword = sectionsToKeep.some(section => lowerLine.includes(section));
            let isStopKeyword = stopSections.some(section => lowerLine.includes(section));

            if (isStartKeyword) {
                capturing = true;
            } else if (isStopKeyword && !isStartKeyword) { 
                capturing = false;
            }
            
            if (capturing) {
                optimizedLines.push(line);
            }
        }
        
        const result = optimizedLines.join('\n').trim();
        return result.length > 50 ? result : text;
    };

    const initialReportData = {
      '01/2025': {
        kpiData: { totalFinancialTransactions: { value: "384,7M", rawValue: 384731977, description: "Tổng số giao dịch tài chính", yearOverYear: "+34.39%" }, peakDayTransactions: { value: "14,3M", rawValue: 14300000, date: "10/01/2025", description: "Giao dịch ngày cao điểm" }, avgDayEndDuration: { value: "2h 45m", rawMinutes: 165, description: "Thời gian DayEnd trung bình" }, avgResponseTime: { value: "4.89ms", description: "Tốc độ phản hồi trung bình" }, peakTPS: { value: "798", date: "10/01/2025", description: "TPS cao nhất" }, avgCPUUtilization: { value: "4.55%", rawPercentage: 4.55, description: "%CPU trung bình máy chủ" } },
        transactionByChannelData: [ { name: "TT Song phương", value: 45, color: "#4A8D6E" }, { name: "Napas 24x7", value: 26, color: "#E58A00" }, { name: "TTHDOL", value: 10, color: "#B36D3A" }, { name: "SmartBanking", value: 9, color: "#884D98" }, { name: "Khác", value: 10, color: "#9ca3af" } ],
        growthMetrics: [ { name: "Tổng số khách hàng", percentageValue: "+13.90%", absoluteValue: "22.04M", icon: Users, color: "text-green-400", description: "So với cùng kỳ 2024" }, { name: "Tài khoản KKH", percentageValue: "-3.76%", absoluteValue: "12.86M", icon: ArrowDown, color: "text-red-400", description: "So với cùng kỳ 2024" }, { name: "Tài khoản CKH", percentageValue: "+8.25%", absoluteValue: "2.90M", icon: ArrowUp, color: "text-green-400", description: "So với cùng kỳ 2024" }, { name: "Tài khoản tiền vay", percentageValue: "+4.03%", absoluteValue: "1.23M", icon: ArrowUp, color: "text-green-400", description: "So với cùng kỳ 2024" } ],
        errorDetails: { status: "Trong tháng 01/2025, hệ thống core banking không phát sinh lỗi gây gián đoạn giao dịch trên các kênh.", webCSRError: {} },
        systemUpdateData: { totalAppUpdates: "38", manualParamUpdates: "185", manualParamProd: "35", systemDataUpdates: "9", profileDataUpdates: "5", devTestEnvStatus: "Duy trì ổn định, đáp ứng các yêu cầu" },
        nextSteps: "Tiếp tục theo dõi chặt chẽ hoạt động của hệ thống Core banking Profile."
      },
      '02/2025': {
        kpiData: { totalFinancialTransactions: { value: "279,1M", rawValue: 279081583, description: "Tổng số giao dịch tài chính", yearOverYear: "+17.80%" }, peakDayTransactions: { value: "10,6M", rawValue: 10600000, date: "25/02/2025", description: "Giao dịch ngày cao điểm" }, avgDayEndDuration: { value: "2h 42m", rawMinutes: 162, description: "Thời gian DayEnd trung bình" }, avgResponseTime: { value: "4.95ms", description: "Tốc độ phản hồi trung bình" }, peakTPS: { value: "750", date: "25/02/2025", description: "TPS cao nhất" }, avgCPUUtilization: { value: "4.31%", rawPercentage: 4.31, description: "%CPU trung bình máy chủ" } },
        transactionByChannelData: [ { name: "TT Song phương", value: 42, color: "#4A8D6E" }, { name: "Napas 24x7", value: 29, color: "#E58A00" }, { name: "TTHDOL", value: 11, color: "#B36D3A" }, { name: "SmartBanking", value: 8, color: "#884D98" }, { name: "Khác", value: 10, color: "#9ca3af" } ],
        growthMetrics: [ { name: "Tổng số khách hàng", percentageValue: "+13.91%", absoluteValue: "22.21M", icon: Users, color: "text-green-400", description: "So với cùng kỳ 2024" }, { name: "Tài khoản KKH", percentageValue: "-3.91%", absoluteValue: "12.85M", icon: ArrowDown, color: "text-red-400", description: "So với cùng kỳ 2024" }, { name: "Tài khoản CKH", percentageValue: "+5.40%", absoluteValue: "2.95M", icon: ArrowUp, color: "text-green-400", description: "So với cùng kỳ 2024" }, { name: "Tài khoản tiền vay", percentageValue: "+4.44%", absoluteValue: "1.22M", icon: ArrowUp, color: "text-green-400", description: "So với cùng kỳ 2024" } ],
        errorDetails: { status: "Trong tháng 02/2025, hệ thống core banking không phát sinh lỗi gây gián đoạn giao dịch trên các kênh.", webCSRError: {} },
        systemUpdateData: { totalAppUpdates: "35", manualParamUpdates: "170", manualParamProd: "30", systemDataUpdates: "7", profileDataUpdates: "4", devTestEnvStatus: "Duy trì ổn định, đáp ứng các yêu cầu" },
        nextSteps: "Tiếp tục theo dõi chặt chẽ hoạt động của hệ thống Core banking Profile."
      },
      '03/2025': {
        kpiData: { totalFinancialTransactions: { value: "370,1M", rawValue: 370057722, description: "Tổng số giao dịch tài chính", yearOverYear: "+31.69%" }, peakDayTransactions: { value: "12,5M", rawValue: 12500000, date: "11/03/2025", description: "Giao dịch ngày cao điểm" }, avgDayEndDuration: { value: "2h 51m", rawMinutes: 171, description: "Thời gian DayEnd trung bình" }, avgResponseTime: { value: "5.01ms", description: "Tốc độ phản hồi trung bình" }, peakTPS: { value: "810", date: "11/03/2025", description: "TPS cao nhất" }, avgCPUUtilization: { value: "4.78%", rawPercentage: 4.78, description: "%CPU trung bình máy chủ" } },
        transactionByChannelData: [ { name: "TT Song phương", value: 43, color: "#4A8D6E" }, { name: "Napas 24x7", value: 28, color: "#E58A00" }, { name: "TTHDOL", value: 11, color: "#B36D3A" }, { name: "SmartBanking", value: 8, color: "#884D98" }, { name: "Khác", value: 10, color: "#9ca3af" } ],
        growthMetrics: [ { name: "Tổng số khách hàng", percentageValue: "+13.61%", absoluteValue: "22.40M", icon: Users, color: "text-green-400", description: "So với cùng kỳ 2024" }, { name: "Tài khoản KKH", percentageValue: "-3.58%", absoluteValue: "12.89M", icon: ArrowDown, color: "text-red-400", description: "So với cùng kỳ 2024" }, { name: "Tài khoản CKH", percentageValue: "+4.41%", absoluteValue: "2.95M", icon: ArrowUp, color: "text-green-400", description: "So với cùng kỳ 2024" }, { name: "Tài khoản tiền vay", percentageValue: "+3.92%", absoluteValue: "1.23M", icon: ArrowUp, color: "text-green-400", description: "So với cùng kỳ 2024" } ],
        errorDetails: { status: "Trong tháng 03/2025, hệ thống core banking không phát sinh lỗi gây gián đoạn giao dịch trên các kênh.", webCSRError: {} },
        systemUpdateData: { totalAppUpdates: "40", manualParamUpdates: "190", manualParamProd: "36", systemDataUpdates: "10", profileDataUpdates: "5", devTestEnvStatus: "Duy trì ổn định, đáp ứng các yêu cầu" },
        nextSteps: "Tiếp tục theo dõi chặt chẽ hoạt động của hệ thống Core banking Profile."
      },
      '04/2025': {
        kpiData: { totalFinancialTransactions: { value: "385,1M", rawValue: 385146829, description: "Tổng số giao dịch tài chính", yearOverYear: "+33.72%" }, peakDayTransactions: { value: "13,2M", rawValue: 13200000, date: "28/04/2025", description: "Giao dịch ngày cao điểm" }, avgDayEndDuration: { value: "2h 48m", rawMinutes: 168, description: "Thời gian DayEnd trung bình" }, avgResponseTime: { value: "5.11ms", description: "Tốc độ phản hồi trung bình" }, peakTPS: { value: "822", date: "28/04/2025", description: "TPS cao nhất" }, avgCPUUtilization: { value: "4.85%", rawPercentage: 4.85, description: "%CPU trung bình máy chủ" } },
        transactionByChannelData: [ { name: "TT Song phương", value: 44, color: "#4A8D6E" }, { name: "Napas 24x7", value: 27, color: "#E58A00" }, { name: "TTHDOL", value: 11, color: "#B36D3A" }, { name: "SmartBanking", value: 8, color: "#884D98" }, { name: "Khác", value: 10, color: "#9ca3af" } ],
        growthMetrics: [ { name: "Tổng số khách hàng", percentageValue: "+13.22%", absoluteValue: "22.57M", icon: Users, color: "text-green-400", description: "So với cùng kỳ 2024" }, { name: "Tài khoản KKH", percentageValue: "-4.14%", absoluteValue: "12.89M", icon: ArrowDown, color: "text-red-400", description: "So với cùng kỳ 2024" }, { name: "Tài khoản CKH", percentageValue: "+3.78%", absoluteValue: "2.95M", icon: ArrowUp, color: "text-green-400", description: "So với cùng kỳ 2024" }, { name: "Tài khoản tiền vay", percentageValue: "+3.89%", absoluteValue: "1.23M", icon: ArrowUp, color: "text-green-400", description: "So với cùng kỳ 2024" } ],
        errorDetails: { status: "Trong tháng 04/2025, hệ thống core banking không phát sinh lỗi gây gián đoạn giao dịch trên các kênh.", webCSRError: {} },
        systemUpdateData: { totalAppUpdates: "41", manualParamUpdates: "201", manualParamProd: "40", systemDataUpdates: "8", profileDataUpdates: "6", devTestEnvStatus: "Duy trì ổn định, đáp ứng các yêu cầu" },
        nextSteps: "Tiếp tục theo dõi chặt chẽ hoạt động của hệ thống Core banking Profile."
      },
      '05/2025': {
        kpiData: { totalFinancialTransactions: { value: "403,5M", rawValue: 403585961, description: "Tổng số giao dịch tài chính", yearOverYear: "30.72%" }, peakDayTransactions: { value: "15M", rawValue: 15000000, date: "12/05/2025", description: "Giao dịch ngày cao điểm" }, avgDayEndDuration: { value: "2h 49m", rawMinutes: 169, description: "Thời gian DayEnd trung bình" }, avgResponseTime: { value: "5.04ms", description: "Tốc độ phản hồi trung bình" }, peakTPS: { value: "835", date: "09/05/2025", description: "TPS cao nhất" }, avgCPUUtilization: { value: "4.92%", rawPercentage: 4.92, description: "%CPU trung bình máy chủ" }, },
        transactionByChannelData: [ { name: 'TT Song phương (B2B)', value: 44, color: '#4A8D6E' }, { name: 'IBFT', value: 27, color: '#E58A00' }, { name: 'TTHDOL', value: 11, color: '#B36D3A' }, { name: 'SMB', value: 8, color: '#884D98' }, { name: 'ATM', value: 3, color: '#6A5ACD' }, { name: 'Điện DRO', value: 2, color: '#20B2AA' }, { name: 'Thu phí tích hợp', value: 2, color: '#D2B48C' }, { name: 'OMNI', value: 1, color: '#4682B4' }, { name: 'CRM', value: 1, color: '#9ACD32' }, { name: 'TPTL', value: 0.8, color: '#FF6347' }, { name: 'IMAP', value: 0.7, color: '#40E0D0' }, { name: 'POS', value: 0.5, color: '#EE82EE' } ],
        growthMetrics: [ 
            { name: "Tổng giao dịch tài chính", percentageValue: "+30.72%", absoluteValue: "403,5M", icon: TrendingUp, color: "text-green-400", description: "So với cùng kỳ 2024" }, 
            { name: "Tổng số khách hàng", percentageValue: "+12.40%", absoluteValue: "22.76M", icon: Users, color: "text-green-400", description: "So với cùng kỳ 2024" }, 
            { name: "Tài khoản KKH", percentageValue: "-4.61%", absoluteValue: "12.89M", icon: ArrowDown, color: "text-red-400", description: "So với cùng kỳ 2024" }, 
            { name: "Tài khoản CKH", percentageValue: "+3.24%", absoluteValue: "2.95M", icon: ArrowUp, color: "text-green-400", description: "So với cùng kỳ 2024" }, 
            { name: "Tài khoản tiền vay", percentageValue: "+3.48%", absoluteValue: "1.18M", icon: ArrowUp, color: "text-green-400", description: "So với cùng kỳ 2024" }, 
        ],
        errorDetails: { status: "Không phát sinh lỗi gây gián đoạn giao dịch trên các kênh trong tháng 05/2025.", webCSRError: { date: "Rạng sáng ngày 25/05/2025", description: "Không truy cập được WebCSR, ảnh hưởng tới tác nghiệp của TT CSKH.", resolutionTime: "Đưa hệ thống trở lại hoạt động bình thường vào 8h08 cùng ngày", impact: "Không gây ảnh hưởng tới hoạt động của các Chi nhánh.", cause: "User ứng dụng WebCSR dùng để kết nối vào Core Profile bị hết hạn.", prevention: "Đã thiết lập thêm các job giám sát và cảnh báo để phát hiện sớm và xử lý kịp thời đối với các tài khoản sắp hết hạn." } },
        systemUpdateData: { totalAppUpdates: "42", manualParamUpdates: "209", manualParamProd: "46", systemDataUpdates: "8", profileDataUpdates: "6", devTestEnvStatus: "Duy trì ổn định, đáp ứng các yêu cầu" },
        nextSteps: "Tiếp tục theo dõi chặt chẽ hoạt động của hệ thống Core banking Profile."
      },
      '06/2025': {
        kpiData: { totalFinancialTransactions: { value: "399,6M", rawValue: 399640500, description: "Tổng số giao dịch tài chính", yearOverYear: "35.04%" }, peakDayTransactions: { value: "16,1M", rawValue: 16100000, date: "10/06/2025", description: "Giao dịch ngày cao điểm" }, avgDayEndDuration: { value: "2h 55m", rawMinutes: 175, description: "Thời gian DayEnd trung bình" }, avgResponseTime: { value: "5.16ms", description: "Tốc độ phản hồi trung bình" }, peakTPS: { value: "557", date: "10/06/2025", description: "TPS cao nhất" }, avgCPUUtilization: { value: "5.39%", rawPercentage: 5.39, description: "%CPU trung bình máy chủ" }, },
        transactionByChannelData: [
            { name: 'TT Song phương', value: 43, color: '#4A8D6E' },
            { name: 'Napas 24x7', value: 28, color: '#E58A00' },
            { name: 'Online Bill Payment', value: 11, color: '#B36D3A' },
            { name: 'SmartBanking', value: 8, color: '#884D98' },
            { name: 'BATCH', value: 2, color: '#6A5ACD' },
            { name: 'Auto Charge Collection', value: 2, color: '#20B2AA' },
            { name: 'ATM Cortex', value: 2, color: '#D2B48C' },
            { name: 'Auto Payroll', value: 1, color: '#4682B4' },
            { name: 'TouchPoint Teller', value: 1, color: '#9ACD32' },
            { name: 'IMAP', value: 1, color: '#FF6347' },
        ],
        growthMetrics: [ 
            { name: "Tổng giao dịch tài chính", percentageValue: "+35.04%", absoluteValue: "399,6M", icon: TrendingUp, color: "text-green-400", description: "So với cùng kỳ 2024" }, 
            { name: "Tổng số khách hàng", percentageValue: "+12.14%", absoluteValue: "22.96M", icon: Users, color: "text-green-400", description: "So với cùng kỳ 2024" }, 
            { name: "Tài khoản KKH", percentageValue: "-4.31%", absoluteValue: "12.92M", icon: ArrowDown, color: "text-red-400", description: "So với cùng kỳ 2024" }, 
            { name: "Tài khoản CKH", percentageValue: "+4.78%", absoluteValue: "2.97M", icon: ArrowUp, color: "text-green-400", description: "So với cùng kỳ 2024" }, 
            { name: "Tài khoản tiền vay", percentageValue: "+3.05%", absoluteValue: "1.24M", icon: ArrowUp, color: "text-green-400", description: "So với cùng kỳ 2024" }, 
        ],
        errorDetails: { status: "Trong tháng 06/2025, hệ thống core banking không phát sinh lỗi gây gián đoạn giao dịch trên các kênh.", webCSRError: { } },
        systemUpdateData: { totalAppUpdates: "46", manualParamUpdates: "193", manualParamProd: "38", systemDataUpdates: "11", profileDataUpdates: "6", devTestEnvStatus: "Duy trì ổn định, đáp ứng các yêu cầu" },
        nextSteps: "Tiếp tục theo dõi chặt chẽ hoạt động của hệ thống Core banking Profile."
      },
    };
    const historicalDataYears = ['2019', '2020', '2021', '2022', '2023', '2024', '2025'];
    const totalHistoricalDataTransactions = [ { month: 'T1', '2019': null, '2020': 70398653, '2021': 102638103, '2022': 130703966, '2023': 181356164, '2024': 286287309, '2025': 384731977 }, { month: 'T2', '2019': 36279421, '2020': 57879463, '2021': 89245849, '2022': 83360056, '2023': 158938838, '2024': 236921056, '2025': 279081583 }, { month: 'T3', '2019': 51820298, '2020': 68676065, '2021': 102350186, '2022': 122619991, '2023': 199759104, '2024': 281081993, '2025': 370057722 }, { month: 'T4', '2019': 52226477, '2020': 58819178, '2021': 103837369, '2022': 128137360, '2023': 201192652, '2024': 288032713, '2025': 385146829 }, { month: 'T5', '2019': 55369694, '2020': 68579336, '2021': 103046250, '2022': 130494810, '2023': 206797842, '2024': 308745155, '2025': 403585961 }, { month: 'T6', '2019': 56695303, '2020': 73334371, '2021': 103126615, '2022': 133375455, '2023': 204752945, '2024': 295939971, '2025': 399640500 }, { month: 'T7', '2019': 57697356, '2020': 84454355, '2021': 102540561, '2022': 138090542, '2023': 214731121, '2024': 298608364, '2025': null }, { month: 'T8', '2019': 58799243, '2020': 77298869, '2021': 96668079, '2022': 148734220, '2023': 240964790, '2024': 324080355, '2025': null }, { month: 'T9', '2019': 61182154, '2020': 85248817, '2021': 104123078, '2022': 153754867, '2023': 211926840, '2024': 318656429, '2025': null }, { month: 'T10', '2019': 67396522, '2020': 86593211, '2021': 119182757, '2022': 167486378, '2023': 254211060, '2024': 355536341, '2025': null }, { month: 'T11', '2019': 64845235, '2020': 88003871, '2021': 123256901, '2022': 172958138, '2023': 256737976, '2024': 352507647, '2025': null }, { month: 'T12', '2019': 82155719, '2020': 106484240, '2021': 140437165, '2022': 193265178, '2023': 280907282, '2024': 373647363, '2025': null } ];
    const historicalDataCustomers = [ { month: 'T1', '2019': 9656487, '2020': 10786031, '2021': 12030916, '2022': 13848173, '2023': 15952993, '2024': 19355122, '2025': 22044666 }, { month: 'T2', '2019': 9721375, '2020': 10896651, '2021': 12091951, '2022': 13951141, '2023': 16122033, '2024': 19497444, '2025': 22208411 }, { month: 'T3', '2019': 9867924, '2020': 11021568, '2021': 12245414, '2022': 13836463, '2023': 16394484, '2024': 19716610, '2025': 22400157 }, { month: 'T4', '2019': 9995512, '2020': 11102005, '2021': 12428870, '2022': 14031236, '2023': 16699062, '2024': 19936667, '2025': 22571454 }, { month: 'T5', '2019': 10122903, '2020': 11215459, '2021': 12594700, '2022': 14230788, '2023': 17005047, '2024': 20247475, '2025': 22759026 }, { month: 'T6', '2019': 10230944, '2020': 11348598, '2021': 12732373, '2022': 14411889, '2023': 17396120, '2024': 20477446, '2025': 22964050 }, { month: 'T7', '2019': 10360057, '2020': 11487241, '2021': 12836365, '2022': 14564994, '2023': 17767003, '2024': 20717127, '2025': null }, { month: 'T8', '2019': 10499226, '2020': 11603118, '2021': 12927206, '2022': 14765195, '2023': 18126071, '2024': 21005215, '2025': null }, { month: 'T9', '2019': 10338024, '2020': 11480809, '2021': 13048090, '2022': 15035510, '2023': 18405803, '2024': 21298283, '2025': null }, { month: 'T10', '2019': 10492757, '2020': 11642540, '2021': 13273258, '2022': 15319916, '2023': 18734816, '2024': 21536440, '2025': null }, { month: 'T11', '2019': 10606801, '2020': 11802198, '2021': 13538154, '2022': 15628798, '2023': 18979659, '2024': 21760624, '2025': null }, { month: 'T12', '2019': 10721178, '2020': 11935334, '2021': 13751551, '2022': 15847618, '2023': 19174616, '2024': 21915101, '2025': null } ];
    const historicalDataDemandAccounts = [ { month: 'T1', '2019': 7183048, '2020': 7649190, '2021': 8164174, '2022': 8974079, '2023': 11023252, '2024': 13359499, '2025': 12856906 }, { month: 'T2', '2019': 7157943, '2020': 7740033, '2021': 8143253, '2022': 9018363, '2023': 11160506, '2024': 13376152, '2025': 12853075 }, { month: 'T3', '2019': 7099906, '2020': 7689167, '2021': 8225013, '2022': 9118385, '2023': 11338618, '2024': 13369532, '2025': 12890850 }, { month: 'T4', '2019': 7226879, '2020': 7776205, '2021': 8351495, '2022': 9250595, '2023': 11579583, '2024': 13448178, '2025': 12891307 }, { month: 'T5', '2019': 7360231, '2020': 7886803, '2021': 8454162, '2022': 9369084, '2023': 11863649, '2024': 13520053, '2025': 12896999 }, { month: 'T6', '2019': 7387886, '2020': 7984621, '2021': 8526944, '2022': 9421921, '2023': 12102284, '2024': 13503888, '2025': 12922805 }, { month: 'T7', '2019': 7501322, '2020': 8023911, '2021': 8561357, '2022': 9545077, '2023': 12396950, '2024': 13437975, '2025': null }, { month: 'T8', '2019': 7478547, '2020': 8080134, '2021': 8596593, '2022': 9748059, '2023': 12729801, '2024': 13374142, '2025': null }, { month: 'T9', '2019': 7400006, '2020': 7826060, '2021': 8643065, '2022': 10038627, '2023': 12761543, '2024': 13183660, '2025': null }, { month: 'T10', '2019': 7526078, '2020': 7951728, '2021': 8775017, '2022': 10357187, '2023': 13084047, '2024': 13108481, '2025': null }, { month: 'T11', '2019': 7645699, '2020': 8056348, '2021': 8980661, '2022': 10690852, '2023': 13260731, '2024': 13096134, '2025': null }, { month: 'T12', '2019': 7697211, '2020': 8121817, '2021': 9174756, '2022': 10933394, '2023': 13353210, '2024': 12968113, '2025': null } ];
    const historicalDataTermAccounts = [ { month: 'T1', '2019': 1780277, '2020': 1954657, '2021': 1954313, '2022': 2082526, '2023': 2299660, '2024': 2679499, '2025': 2900595 }, { month: 'T2', '2019': 1871776, '2020': 2010474, '2021': 2041113, '2022': 2109704, '2023': 2387542, '2024': 2800147, '2025': 2951486 }, { month: 'T3', '2019': 1872320, '2020': 2004133, '2021': 2023120, '2022': 2080545, '2023': 2461112, '2024': 2826446, '2025': 2951086 }, { month: 'T4', '2019': 1877362, '2020': 2033828, '2021': 2014127, '2022': 2067199, '2023': 2528902, '2024': 2841038, '2025': 2948430 }, { month: 'T5', '2019': 1876773, '2020': 2040004, '2021': 2030938, '2022': 2057734, '2023': 2554421, '2024': 2849494, '2025': 2941712 }, { month: 'T6', '2019': 1886906, '2020': 2036451, '2021': 2044778, '2022': 2063146, '2023': 2570043, '2024': 2838768, '2025': 2974397 }, { month: 'T7', '2019': 1887505, '2020': 2031273, '2021': 2044778, '2022': 2063934, '2023': 2577039, '2024': 2840093, '2025': null }, { month: 'T8', '2019': 1899340, '2020': 2047260, '2021': 2068210, '2022': 2067214, '2023': 2591638, '2024': 2859909, '2025': null }, { month: 'T9', '2019': 1902559, '2020': 2035388, '2021': 2095201, '2022': 2060410, '2023': 2633526, '2024': 2855981, '2025': null }, { month: 'T10', '2019': 1899811, '2020': 2023737, '2021': 2096252, '2022': 2096434, '2023': 2644034, '2024': 2850641, '2025': null }, { month: 'T11', '2019': 1901116, '2020': 2008538, '2021': 2073260, '2022': 2121571, '2023': 2661759, '2024': 2836407, '2025': null }, { month: 'T12', '2019': 1890479, '2020': 1974418, '2021': 2044338, '2022': 2147266, '2023': 2692063, '2024': 2822212, '2025': null } ];
    const historicalDataLoanAccounts = [ { month: 'T1', '2019': 1001233, '2020': 1058279, '2021': 1105269, '2022': 1210686, '2023': 1073551, '2024': 1180207, '2025': 1227738 }, { month: 'T2', '2019': 986878, '2020': 1050271, '2021': 1088461, '2022': 1199671, '2023': 1070331, '2024': 1167676, '2025': 1219540 }, { month: 'T3', '2019': 1000429, '2020': 1055682, '2021': 1097328, '2022': 1212014, '2023': 1079306, '2024': 1179775, '2025': 1226003 }, { month: 'T4', '2019': 1006932, '2020': 1053826, '2021': 1099033, '2022': 1215717, '2023': 1077539, '2024': 1183609, '2025': 1229745 }, { month: 'T5', '2019': 1012102, '2020': 1058682, '2021': 1098245, '2022': 1217527, '2023': 1077097, '2024': 1190573, '2025': 1231959 }, { month: 'T6', '2019': 1021677, '2020': 1072318, '2021': 1109970, '2022': 1226044, '2023': 1085003, '2024': 1200381, '2025': 1236980 }, { month: 'T7', '2019': 1026948, '2020': 1084071, '2021': 1106771, '2022': 1230774, '2023': 1078342, '2024': 1206007, '2025': null }, { month: 'T8', '2019': 1035135, '2020': 1089639, '2021': 1125472, '2022': 1240815, '2023': 1066624, '2024': 1215482, '2025': null }, { month: 'T9', '2019': 1043495, '2020': 1089639, '2021': 1154587, '2022': 1092624, '2023': 1204830, '2024': 1221606, '2025': null }, { month: 'T10', '2019': 1049832, '2020': 1092147, '2021': 1182989, '2022': 1074325, '2023': 1184972, '2024': 1228094, '2025': null }, { month: 'T11', '2019': 1059196, '2020': 1099512, '2021': 1207721, '2022': 1083114, '2023': 1181735, '2024': 1234567, '2025': null }, { month: 'T12', '2019': 1070760, '2020': 1112158, '2021': 1208173, '2022': 1089756, '2023': 1190250, '2024': 1243395, '2025': null } ];
    const avgDailyTransactionOverviewData = [ { name: 'T10/24', NgayThuong: 11916844, CuoiTuan: 10230944, ChungCaThang: 11579583 }, { name: 'T11/24', NgayThuong: 12200000, CuoiTuan: 10700000, ChungCaThang: 11700000 }, { name: 'T12/24', NgayThuong: 12600000, CuoiTuan: 10600000, ChungCaThang: 11800000 }, { name: 'T1/25', NgayThuong: 14381208, CuoiTuan: 10017960, ChungCaThang: 12410709 }, { name: 'T2/25', NgayThuong: 10688239, CuoiTuan: 8164601, ChungCaThang: 9967199 }, { name: 'T3/25', NgayThuong: 12585981, CuoiTuan: 10575212, ChungCaThang: 11937346 }, { name: 'T4/25', NgayThuong: 13200000, CuoiTuan: 11400000, ChungCaThang: 12800000 }, { name: 'T5/25', NgayThuong: 13465361, CuoiTuan: 11916844, ChungCaThang: 12981449 }, { name: 'T6/25', NgayThuong: 13899864, CuoiTuan: 11971485, ChungCaThang: 13321350 }, ];

    const getLatestMonth = (reports) => {
        const monthKeys = Object.keys(reports);
        if (monthKeys.length === 0) return '';
        monthKeys.sort((a, b) => {
            const [monthA, yearA] = a.split('/').map(Number);
            const [monthB, yearB] = b.split('/').map(Number);
            if (yearA !== yearB) return yearB - yearA;
            return monthB - monthA;
        });
        return monthKeys[0];
    };

    const [filterOpen, setFilterOpen] = useState(false);
    const [selectedYears, setSelectedYears] = useState(() => historicalDataYears.slice(-3));
    const [reports, setReports] = useState(initialReportData);
    const [currentMonth, setCurrentMonth] = useState(() => getLatestMonth(initialReportData));
    const [isExporting, setIsExporting] = useState(false);
    const [maximizedChart, setMaximizedChart] = useState(null);

    const handleYearChange = (yearToToggle) => {
        setSelectedYears(prevSelectedYears => {
            if (prevSelectedYears.includes(yearToToggle)) {
                // Prevent unselecting the last year
                if (prevSelectedYears.length === 1) return prevSelectedYears;
                return prevSelectedYears.filter(year => year !== yearToToggle);
            } else {
                return [...prevSelectedYears, yearToToggle].sort();
            }
        });
    };

    useEffect(() => {
        if (typeof window !== 'undefined' && typeof window.html2pdf === 'undefined') {
            const script = document.createElement('script');
            script.src = "https://cdnjs.cloudflare.com/ajax/libs/html2pdf.js/0.10.1/html2pdf.bundle.min.js";
            document.body.appendChild(script);
        }
        if (typeof window !== 'undefined' && typeof window.mammoth === 'undefined') {
             const mammothScript = document.createElement('script');
             mammothScript.src = "https://cdnjs.cloudflare.com/ajax/libs/mammoth/1.6.0/mammoth.browser.min.js";
             document.body.appendChild(mammothScript);
        }
        if (typeof window !== 'undefined' && typeof window.pdfjsLib === 'undefined') {
            const pdfScript = document.createElement('script');
            pdfScript.src = "https://mozilla.github.io/pdf.js/build/pdf.mjs";
            pdfScript.type = "module";
            pdfScript.onload = () => {
                if(window.pdfjsLib) {
                    window.pdfjsLib.GlobalWorkerOptions.workerSrc = `https://mozilla.github.io/pdf.js/build/pdf.worker.mjs`;
                }
            };
            document.body.appendChild(pdfScript);
        }
    }, []);

    useEffect(() => {
        const storedTime = localStorage.getItem('lastApiCallTime');
        if (storedTime) {
            const timeSince = Date.now() - parseInt(storedTime, 10);
            if (timeSince < 60000) {
                setCooldown(Math.ceil((60000 - timeSince) / 1000));
            }
        }
    }, []);

    useEffect(() => {
        if (cooldown > 0) {
            const timer = setTimeout(() => setCooldown(cooldown - 1), 1000);
            return () => clearTimeout(timer);
        }
    }, [cooldown]);

    const handleFileAnalysis = async (event) => {
        const file = event.target.files[0];
        if (!file) return;

        const now = Date.now();
        const lastCall = parseInt(localStorage.getItem('lastApiCallTime') || '0', 10);
        const cooldownTime = 60000;

        if (now - lastCall < cooldownTime) {
            const remainingTime = Math.ceil((cooldownTime - (now - lastCall)) / 1000);
            alert(`Bạn đã gọi API quá nhanh. Vui lòng chờ ${remainingTime} giây nữa.`);
            event.target.value = null;
            return;
        }
        
        setIsAnalyzing(true);
        setAnalysisMessage("Đang đọc và tối ưu file...");
        
        try {
            let fileContent = "";
            const extension = file.name.split('.').pop().toLowerCase();
            const arrayBuffer = await file.arrayBuffer();

            if (extension === 'pdf') {
                if (window.pdfjsLib) {
                    const pdf = await window.pdfjsLib.getDocument({data: arrayBuffer}).promise;
                    let textContent = '';
                    for (let i = 1; i <= pdf.numPages; i++) {
                        const page = await pdf.getPage(i);
                        const text = await page.getTextContent();
                        textContent += text.items.map(s => s.str).join(' ');
                    }
                    fileContent = textContent;
                } else {
                     throw new Error("Thư viện xử lý file PDF (pdf.js) chưa sẵn sàng.");
                }
            } else if (extension === 'docx' || extension === 'doc') {
                if(window.mammoth) {
                    const result = await window.mammoth.extractRawText({ arrayBuffer });
                    fileContent = result.value;
                } else {
                    throw new Error("Thư viện xử lý file Word (mammoth.js) chưa sẵn sàng.");
                }
            } else {
                const textDecoder = new TextDecoder('utf-8');
                fileContent = textDecoder.decode(arrayBuffer);
            }
            
            const optimizedContent = optimizeReportContent(fileContent);
            const schema = { type: "OBJECT", properties: { kpiData: { type: "OBJECT", properties: { totalFinancialTransactions: { type: "OBJECT", properties: { value: { type: "STRING" }, rawValue: {type: "NUMBER"}, description: { type: "STRING" }, yearOverYear: { type: "STRING" } } }, peakDayTransactions: { type: "OBJECT", properties: { value: { type: "STRING" }, rawValue: {type: "NUMBER"}, date: { type: "STRING" }, description: { type: "STRING" } } }, avgDayEndDuration: { type: "OBJECT", properties: { value: { type: "STRING" }, rawMinutes: {type: "NUMBER"}, description: { type: "STRING" } } }, avgResponseTime: { type: "OBJECT", properties: { value: { type: "STRING" }, description: { type: "STRING" } } }, peakTPS: { type: "OBJECT", properties: { value: { type: "STRING" }, date: { type: "STRING" }, description: { type: "STRING" } } }, avgCPUUtilization: { type: "OBJECT", properties: { value: { type: "STRING" }, rawPercentage: {type: "NUMBER"}, description: { type: "STRING" } } }, } }, transactionByChannelData: { type: "ARRAY", items: { type: "OBJECT", properties: { name: { type: "STRING" }, value: { type: "NUMBER" }, color: { type: "STRING" } } } }, growthMetrics: { type: "ARRAY", items: { type: "OBJECT", properties: { name: { type: "STRING" }, percentageValue: { type: "STRING" }, absoluteValue: { type: "STRING" }, description: { type: "STRING" } } } }, errorDetails: { type: "OBJECT", properties: { status: { type: "STRING" }, webCSRError: { type: "OBJECT", properties: { date: { type: "STRING" }, description: { type: "STRING" }, resolutionTime: { type: "STRING" }, impact: { type: "STRING" }, cause: { type: "STRING" }, prevention: { type: "STRING" } } } } }, systemUpdateData: { type: "OBJECT", properties: { totalAppUpdates: { type: "STRING" }, manualParamUpdates: { type: "STRING" }, manualParamProd: { type: "STRING" }, systemDataUpdates: { type: "STRING" }, profileDataUpdates: { type: "STRING" }, devTestEnvStatus: { type: "STRING" } } }, nextSteps: { type: "STRING" } } };
            const prompt = `Dựa vào nội dung báo cáo sau đây, hãy trích xuất toàn bộ thông tin và trả về MỘT ĐỐI TƯỢNG JSON DUY NHẤT. Chỉ trả về đối tượng JSON, không có bất kỳ văn bản giải thích hay markdown nào khác (không có \`\`\`json).\nNội dung báo cáo:\n---\n${optimizedContent}\n---`;
            
            const tokenCount = await countTokens(prompt);
            setIsAnalyzing(false);

            setConfirmationData({
                content: optimizedContent,
                tokenCount,
                onConfirm: async () => {
                    setConfirmationData(null);
                    setIsAnalyzing(true);
                    setAnalysisMessage(`Đang gửi yêu cầu với ${tokenCount ? tokenCount.toLocaleString() : 'N/A'} tokens...`);
                    localStorage.setItem('lastApiCallTime', Date.now().toString());
                    setCooldown(60);
                    
                    try {
                        const result = await callGeminiAPI(prompt, schema);
                        if (result.candidates && result.candidates[0] && result.candidates[0].content.parts[0]) {
                            const text = result.candidates[0].content.parts[0].text;
                            const newReportData = JSON.parse(text);

                            const iconMap = { "tăng trưởng": TrendingUp, "tổng số": Users, "tài khoản kkh": ArrowDown, "tài khoản ckh": ArrowUp, "tài khoản tiền vay": ArrowUp };
                            const colorMap = { "tăng trưởng": "text-green-400", "tổng số": "text-green-400", "tài khoản kkh": "text-red-400", "tài khoản ckh": "text-green-400", "tài khoản tiền vay": "text-green-400" };
                            
                            newReportData.growthMetrics = newReportData.growthMetrics.map(metric => {
                                const key = metric.name.toLowerCase();
                                const iconKey = Object.keys(iconMap).find(k => key.includes(k));
                                return { ...metric, icon: iconMap[iconKey] || FileText, color: colorMap[iconKey] || "text-white" }
                            });

                            const newMonthKey = window.prompt("Phân tích thành công! Vui lòng nhập tháng/năm cho báo cáo này (ví dụ: 03/2025):");
                            if (newMonthKey && /^\d{2}\/\d{4}$/.test(newMonthKey)) {
                                setReports(prev => ({ ...prev, [newMonthKey]: newReportData }));
                                setCurrentMonth(newMonthKey);
                                alert(`Đã thêm báo cáo cho tháng ${newMonthKey}!`);
                            } else if (newMonthKey) {
                                alert("Định dạng tháng/năm không hợp lệ. Vui lòng sử dụng định dạng MM/YYYY.");
                            }
                        } else { throw new Error("Không nhận được dữ liệu hợp lệ từ AI."); }
                    } catch (error) {
                         console.error("Error during AI analysis:", error);
                        if (error.message && error.message.includes("429")) {
                            alert("Bạn đã gửi quá nhiều yêu cầu phân tích trong một khoảng thời gian ngắn. Vui lòng chờ khoảng 1 phút và thử lại.");
                        } else {
                             alert("Đã có lỗi xảy ra trong quá trình phân tích báo cáo. Vui lòng kiểm tra lại nội dung file hoặc thử lại sau.");
                        }
                    } finally {
                         setIsAnalyzing(false);
                    }
                },
                onCancel: () => {
                    setConfirmationData(null);
                    event.target.value = null;
                },
                onDownload: () => {
                    downloadTextFile(optimizedContent, `optimized_report_${Date.now()}.txt`);
                }
            });
            
        } catch (error) {
            console.error("Error during file processing:", error);
            alert("Đã có lỗi xảy ra trong quá trình xử lý file. Lỗi: " + error.message);
            setIsAnalyzing(false);
        } finally {
            event.target.value = null; 
        }
    };

    const callGeminiAPI = async (prompt, schema) => {
        const apiKey = "";
        const apiUrl = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${apiKey}`;
        const payload = {
            contents: [{ role: "user", parts: [{ text: prompt }] }],
            generationConfig: {
                responseMimeType: "application/json",
                responseSchema: schema
            }
        };
        const response = await fetch(apiUrl, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(payload) });
        if (!response.ok) {
            const errorBody = await response.text();
            throw new Error(`API call failed with status: ${response.status}. Body: ${errorBody}`);
        }
        return response.json();
    };

    const countTokens = async (prompt) => {
        const apiKey = "";
        const countApiUrl = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:countTokens?key=${apiKey}`;
        const countPayload = { contents: [{ role: "user", parts: [{ text: prompt }] }] };
        const response = await fetch(countApiUrl, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(countPayload) });
        if (!response.ok) return null;
        const data = await response.json();
        return data.totalTokens;
    };
    
    const downloadTextFile = (text, filename) => {
        const blob = new Blob([text], { type: 'text/plain' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = filename;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
    };

    const handleExportPdf = useCallback(() => {
        const element = document.getElementById('dashboard-content');
        if (element && typeof window.html2pdf !== 'undefined') {
            setIsExporting(true);
            
            const style = document.createElement('style');
            style.id = 'pdf-export-styles';
            style.innerHTML = `
                .pdf-export-mode {
                    background: #ffffff !important;
                }
                .pdf-export-mode * {
                    color: #1f2937 !important; /* text-gray-800 */
                    transition: none !important;
                    animation: none !important;
                    opacity: 1 !important;
                    transform: none !important;
                }
                .pdf-export-mode .firefly-container, .pdf-export-mode .card-pattern {
                    display: none !important;
                }
                .pdf-export-mode .bg-white\\/5, .pdf-export-mode .bg-white\\/10 {
                    background-color: #f9fafb !important; /* bg-gray-50 */
                    border: 1px solid #e5e7eb !important;
                }
                .pdf-export-mode .backdrop-blur-md { backdrop-filter: none !important; }
                .pdf-export-mode .text-white { color: #1f2937 !important; }
                .pdf-export-mode .text-gray-300 { color: #4b5563 !important; }
                .pdf-export-mode .text-gray-400 { color: #6b7280 !important; }
                .pdf-export-mode .border-white\\/10 { border-color: #e5e7eb !important; }
                
                .pdf-export-mode .text-green-400 { color: #16a34a !important; }
                .pdf-export-mode .text-red-400 { color: #dc2626 !important; }
                .pdf-export-mode .text-blue-500 { color: #2563eb !important; }
                .pdf-export-mode .text-indigo-400 { color: #4f46e5 !important; }
                .pdf-export-mode .text-teal-400 { color: #0d9488 !important; }
                .pdf-export-mode .text-orange-400 { color: #ea580c !important; }
                .pdf-export-mode .text-pink-400 { color: #db2777 !important; }
                .pdf-export-mode .text-lime-400 { color: #65a30d !important; }
                .pdf-export-mode .text-blue-400 { color: #3b82f6 !important; }
                .pdf-export-mode .text-yellow-400 { color: #ca8a04 !important; }

                /* Fix for "Công việc tiếp theo" section */
                .pdf-export-mode .bg-gradient-to-r { background: #eff6ff !important; } /* light blue bg */
                .pdf-export-mode .bg-\\[\\#1a2c28\\] { background: #dbeafe !important; } /* lighter blue bg */
                .pdf-export-mode .bg-gradient-to-r .text-white { color: #1e3a8a !important; } /* dark blue text */

                .pdf-export-mode .recharts-text, .pdf-export-mode .recharts-cartesian-axis-tick-value tspan {
                    fill: #1f2937 !important;
                }
                .pdf-export-mode .page-break-avoider {
                    page-break-inside: avoid !important;
                }
                .pdf-export-mode .section-title-wrapper {
                     page-break-inside: avoid !important;
                }
            `;
            document.head.appendChild(style);
            element.classList.add('pdf-export-mode');

            const opt = {
                margin: [10, 5, 10, 5],
                filename: `bao_cao_core_banking_${currentMonth.replace('/', '_')}.pdf`,
                image: { type: 'jpeg', quality: 0.98 },
                html2canvas: { 
                    scale: 2, 
                    useCORS: true,
                    backgroundColor: '#ffffff',
                    // Fix for rendering lucide-react icons (SVGs)
                    svgRendering: true, 
                },
                jsPDF: { unit: 'mm', format: 'a4', orientation: 'portrait' },
                pagebreak: { mode: ['css', 'legacy'] }
            };

            window.html2pdf().from(element).set(opt).save().finally(() => {
                setIsExporting(false);
                const styleTag = document.getElementById('pdf-export-styles');
                if (styleTag) {
                    document.head.removeChild(styleTag);
                }
                element.classList.remove('pdf-export-mode');
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
            if (numStr.includes("h")) { const parts = val.split('h'); const hours = parseInt(parts[0]) || 0; const minutes = parseInt(parts[1].replace('m','')) || 0; return hours * 60 + minutes; }
            return parseFloat(numStr.replace(/[^0-9.-]+/g, ""));
        }
        return NaN;
        };
        const currentNum = parseValue(currentValue);
        const previousNum = parseValue(previousValue);
        if (!isNaN(currentNum) && !isNaN(previousNum) && previousNum !== 0) { const percentage = ((currentNum - previousNum) / previousNum) * 100; return `${percentage > 0 ? '+' : ''}${percentage.toFixed(2)}%`; }
        return null;
    };
    
    const processPieChartData = (data, topN = 10) => {
        if (!data || data.length <= topN) {
            return data;
        }

        const sortedData = [...data].sort((a, b) => b.value - a.value);
        const topData = sortedData.slice(0, topN - 1);
        const otherData = sortedData.slice(topN - 1);
        
        if (otherData.length > 0) {
            const otherValue = otherData.reduce((sum, item) => sum + item.value, 0);
            return [
                ...topData,
                { name: 'Khác', value: otherValue, color: '#9ca3af' }
            ];
        }
        
        return topData;
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

    const { kpiData, transactionByChannelData, growthMetrics, errorDetails, systemUpdateData, nextSteps } = currentReport || {};
    const processedTransactionByChannelData = processPieChartData(transactionByChannelData);
    const lineColors = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884d8', '#82ca9d', '#ffc658'];
    
    // Main container styling and background
    const MainContainer = ({ children }) => (
         <div className="main-container min-h-screen text-white font-inter selection:bg-yellow-400 selection:text-gray-900 relative">
            <style> {`
                .main-container {
                    background: linear-gradient(to bottom, #1a3a34, #2D544C);
                    overflow-x: hidden;
                }
                .firefly-container {
                    position: fixed;
                    inset: 0;
                    z-index: 0;
                    pointer-events: none;
                }
                .firefly {
                    position: fixed;
                    left: 50%;
                    top: 50%;
                    width: 0.4vw;
                    height: 0.4vw;
                    margin: -0.2vw 0 0 9.8vw;
                    animation: ease 200s alternate infinite;
                }
                .firefly::after {
                    content: '';
                    position: absolute;
                    width: 100%;
                    height: 100%;
                    border-radius: 50%;
                    transform-origin: -10vw;
                    background: white;
                    opacity: 0;
                    box-shadow: 0 0 0vw 0vw #FFD700;
                    animation: drift ease alternate infinite, flash ease infinite;
                }

                @keyframes drift {
                    0% { transform: rotate(0deg); }
                    100% { transform: rotate(360deg); }
                }

                @keyframes flash {
                    0%, 30%, 100% { opacity: 0; box-shadow: 0 0 0vw 0vw #FFD700; }
                    5% { opacity: 1; box-shadow: 0 0 2vw 0.4vw #FFD700; }
                }
                
                .firefly:nth-child(1) { animation-name: move1; animation-duration: 10s; }
                .firefly:nth-child(1)::after { animation-duration: 10s, 6000ms; animation-delay: 0ms, 3000ms; }
                
                .firefly:nth-child(2) { animation-name: move2; animation-duration: 12s; }
                .firefly:nth-child(2)::after { animation-duration: 12s, 5000ms; animation-delay: 0ms, 2000ms; }

                .firefly:nth-child(3) { animation-name: move3; animation-duration: 15s; }
                .firefly:nth-child(3)::after { animation-duration: 15s, 7000ms; animation-delay: 0ms, 4000ms; }
                
                .firefly:nth-child(4) { animation-name: move4; animation-duration: 11s; }
                .firefly:nth-child(4)::after { animation-duration: 11s, 5500ms; animation-delay: 0ms, 1000ms; }

                .firefly:nth-child(5) { animation-name: move5; animation-duration: 14s; }
                .firefly:nth-child(5)::after { animation-duration: 14s, 6500ms; animation-delay: 0ms, 5000ms; }

                .firefly:nth-child(6) { animation-name: move6; animation-duration: 16s; }
                .firefly:nth-child(6)::after { animation-duration: 16s, 8000ms; animation-delay: 0ms, 6000ms; }

                .firefly:nth-child(7) { animation-name: move7; animation-duration: 13s; }
                .firefly:nth-child(7)::after { animation-duration: 13s, 4000ms; animation-delay: 0ms, 2500ms; }

                .firefly:nth-child(8) { animation-name: move8; animation-duration: 17s; }
                .firefly:nth-child(8)::after { animation-duration: 17s, 9000ms; animation-delay: 0ms, 7000ms; }

                .firefly:nth-child(9) { animation-name: move9; animation-duration: 10s; }
                .firefly:nth-child(9)::after { animation-duration: 10s, 5200ms; animation-delay: 0ms, 1500ms; }

                .firefly:nth-child(10) { animation-name: move10; animation-duration: 12s; }
                .firefly:nth-child(10)::after { animation-duration: 12s, 6800ms; animation-delay: 0ms, 3500ms; }
                
                .firefly:nth-child(11) { animation-name: move11; animation-duration: 15s; }
                .firefly:nth-child(11)::after { animation-duration: 15s, 7200ms; animation-delay: 0ms, 5500ms; }

                .firefly:nth-child(12) { animation-name: move12; animation-duration: 11s; }
                .firefly:nth-child(12)::after { animation-duration: 11s, 4500ms; animation-delay: 0ms, 800ms; }

                .firefly:nth-child(13) { animation-name: move13; animation-duration: 14s; }
                .firefly:nth-child(13)::after { animation-duration: 14s, 6300ms; animation-delay: 0ms, 4800ms; }

                .firefly:nth-child(14) { animation-name: move14; animation-duration: 16s; }
                .firefly:nth-child(14)::after { animation-duration: 16s, 8500ms; animation-delay: 0ms, 6500ms; }

                .firefly:nth-child(15) { animation-name: move15; animation-duration: 13s; }
                .firefly:nth-child(15)::after { animation-duration: 13s, 5800ms; animation-delay: 0ms, 2800ms; }

                @keyframes move1 { 0% { transform: translateX(20vw) translateY(40vh) scale(0.5); } 100% { transform: translateX(-30vw) translateY(-45vh) scale(0.9); } }
                @keyframes move2 { 0% { transform: translateX(-40vw) translateY(30vh) scale(0.7); } 100% { transform: translateX(45vw) translateY(-20vh) scale(0.4); } }
                @keyframes move3 { 0% { transform: translateX(10vw) translateY(-20vh) scale(0.9); } 100% { transform: translateX(-40vw) translateY(35vh) scale(0.6); } }
                @keyframes move4 { 0% { transform: translateX(-25vw) translateY(-35vh) scale(0.4); } 100% { transform: translateX(30vw) translateY(40vh) scale(0.8); } }
                @keyframes move5 { 0% { transform: translateX(35vw) translateY(-10vh) scale(0.6); } 100% { transform: translateX(-15vw) translateY(25vh) scale(1); } }
                @keyframes move6 { 0% { transform: translateX(-10vw) translateY(15vh) scale(0.8); } 100% { transform: translateX(40vw) translateY(-30vh) scale(0.5); } }
                @keyframes move7 { 0% { transform: translateX(40vw) translateY(20vh) scale(0.5); } 100% { transform: translateX(-20vw) translateY(-40vh) scale(0.9); } }
                @keyframes move8 { 0% { transform: translateX(-30vw) translateY(-15vh) scale(0.7); } 100% { transform: translateX(25vw) translateY(30vh) scale(0.4); } }
                @keyframes move9 { 0% { transform: translateX(5vw) translateY(30vh) scale(0.9); } 100% { transform: translateX(-35vw) translateY(-10vh) scale(0.6); } }
                @keyframes move10 { 0% { transform: translateX(-15vw) translateY(-40vh) scale(0.4); } 100% { transform: translateX(40vw) translateY(15vh) scale(0.8); } }
                @keyframes move11 { 0% { transform: translateX(45vw) translateY(-25vh) scale(0.6); } 100% { transform: translateX(-5vw) translateY(40vh) scale(1); } }
                @keyframes move12 { 0% { transform: translateX(-5vw) translateY(25vh) scale(0.8); } 100% { transform: translateX(35vw) translateY(-35vh) scale(0.5); } }
                @keyframes move13 { 0% { transform: translateX(25vw) translateY(-30vh) scale(0.5); } 100% { transform: translateX(-45vw) translateY(20vh) scale(0.9); } }
                @keyframes move14 { 0% { transform: translateX(-35vw) translateY(5vh) scale(0.7); } 100% { transform: translateX(15vw) translateY(-45vh) scale(0.4); } }
                @keyframes move15 { 0% { transform: translateX(15vw) translateY(45vh) scale(0.9); } 100% { transform: translateX(-25vw) translateY(-5vh) scale(0.6); } }
            `} </style>
            <FireflyBackground />
            {isExporting && (
                <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex flex-col items-center justify-center z-[200]">
                    <Loader className="text-yellow-400 animate-spin" size={64} />
                    <p className="text-xl mt-4 text-white">Đang xuất báo cáo PDF...</p>
                </div>
            )}
            <div className="relative z-10">{children}</div>
        </div>
    );

    if (!isAuthenticated) {
        return (
            <MainContainer>
                <LoginScreen onLogin={handleLogin} loginError={loginError} />
            </MainContainer>
        );
    }
    
    if (!currentReport) {
         return (
            <MainContainer>
                <div className="flex flex-col items-center justify-center min-h-screen">
                    <Loader className="text-yellow-400 animate-spin" size={48} />
                    <p className="mt-4 text-lg">Đang tải dữ liệu báo cáo...</p>
                </div>
            </MainContainer>
        );
    }

    return (
        <MainContainer>
            <header className="sticky top-0 z-50 bg-black/20 backdrop-blur-lg border-b border-white/10 p-4">
                <div className="max-w-7xl mx-auto flex items-center justify-between">
                    <div className="flex items-center gap-4"><BidvLogo className="h-10" /><h1 className="text-2xl sm:text-3xl font-extrabold hidden md:block" style={{ background: 'linear-gradient(to right, #C0B283, #FFD700, #DAA520, #B8860B)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', filter: 'drop-shadow(1px 1px 1px rgba(0,0,0,0.5))' }}>Core Banking Operations Report</h1></div>
                    <div className="flex items-center gap-2 sm:gap-4">
                        <select value={currentMonth} onChange={(e) => setCurrentMonth(e.target.value)} className="bg-transparent border border-white/20 rounded-lg py-2 px-3 text-sm text-white hover:border-yellow-400 focus:outline-none focus:ring-2 focus:ring-yellow-400">
                            {Object.keys(reports).sort((a, b) => {
                                const [monthA, yearA] = a.split('/').map(Number);
                                const [monthB, yearB] = b.split('/').map(Number);
                                if (yearA !== yearB) return yearB - yearA;
                                return monthB - monthA;
                            }).map(month => ( <option key={month} value={month} className="bg-gray-800">{`Tháng ${month}`}</option>))}
                        </select>
                        <div className="relative"><button onClick={() => setFilterOpen(!filterOpen)} className="p-2 rounded-lg bg-white/10 hover:bg-white/20 transition-colors"><Filter size={20} /></button>{filterOpen && (<div className="absolute top-full right-0 mt-2 w-64 bg-gray-800/90 border border-white/10 rounded-lg shadow-2xl p-4 z-20"><h3 className="text-md font-semibold mb-3">Lọc dữ liệu theo năm</h3><div className="grid grid-cols-2 gap-2">{historicalDataYears.map(year => (<label key={year} className="inline-flex items-center text-sm cursor-pointer"><input type="checkbox" value={year} checked={selectedYears.includes(year)} onChange={() => handleYearChange(year)} className="form-checkbox h-4 w-4 text-yellow-400 bg-gray-600 border-gray-500 rounded focus:ring-yellow-400" /><span className="ml-2 text-gray-200">{year}</span></label>))}</div></div>)}</div>
                        <label htmlFor="import-file" className={`p-2 rounded-lg bg-white/10 hover:bg-white/20 transition-colors ${cooldown > 0 ? 'cursor-not-allowed opacity-50' : 'cursor-pointer'}`}>
                            {cooldown > 0 ? (<span className="flex items-center text-xs w-12 justify-center"><Loader className="animate-spin h-4 w-4 mr-1" />{`${cooldown}s`}</span>) : (<Upload size={20} />)}
                            <input id="import-file" type="file" accept=".txt,.pdf,.md,.doc,.docx" onChange={handleFileAnalysis} className="hidden" disabled={cooldown > 0} />
                        </label>
                        <button onClick={handleExportPdf} className="p-2 rounded-lg bg-white/10 hover:bg-white/20 transition-colors"><Download size={20} /></button>
                    </div>
                </div>
            </header>
            <main id="dashboard-content" className="p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto">
                <div className="text-center mb-12 page-break-avoider"><AnimatedComponent><h2 className="text-4xl font-bold text-white">Báo cáo hoạt động Core Banking</h2><p className="text-xl text-yellow-400 mt-2">{`Tháng ${currentMonth}`}</p></AnimatedComponent></div>
                <section className="mb-16 page-break-avoider"><div className="section-title flex items-center gap-4 mb-8"><BarChart2 size={32} className="text-yellow-400" /><h3 className="text-3xl font-bold">Hiệu suất & Độ ổn định</h3></div><div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"><KpiCard title={kpiData.totalFinancialTransactions.description} value={kpiData.totalFinancialTransactions.value} icon={Activity} valueColor="text-green-400" trendValue={kpiTrends.totalFinancialTransactions} yearOverYearGrowth={kpiData.totalFinancialTransactions.yearOverYear} yoyLabel="so với cùng kỳ năm 2024" /><KpiCard title={kpiData.peakDayTransactions.description} value={kpiData.peakDayTransactions.value} icon={TrendingUp} valueColor="text-green-400" description={`Ngày: ${kpiData.peakDayTransactions.date}`} trendValue={kpiTrends.peakDayTransactions} /><KpiCard title={kpiData.peakTPS.description} value={kpiData.peakTPS.value} icon={Activity} valueColor="text-orange-400" description={`Ngày: ${kpiData.peakTPS.date}`} trendValue={kpiTrends.peakTPS} /><KpiCard title={kpiData.avgDayEndDuration.description} value={kpiData.avgDayEndDuration.value} icon={Clock} valueColor="text-indigo-400" trendValue={kpiTrends.avgDayEndDuration} trendDirection="down" /><KpiCard title={kpiData.avgResponseTime.description} value={kpiData.avgResponseTime.value} icon={Activity} valueColor="text-teal-400" trendValue={kpiTrends.avgResponseTime} trendDirection="down" /><KpiCard title={kpiData.avgCPUUtilization.description} value={kpiData.avgCPUUtilization.value} icon={Cpu} valueColor="text-blue-400" trendValue={kpiTrends.avgCPUUtilization} trendDirection="down" /></div></section>
                <section className="mb-16 grid grid-cols-1 lg:grid-cols-5 gap-6 page-break-avoider">
                    <div className="lg:col-span-2"><ChartCard title={`Tỷ trọng giao dịch theo kênh`}><ResponsiveContainer width="100%" height="100%"><PieChart><Pie data={processedTransactionByChannelData} dataKey="value" nameKey="name" cx="50%" cy="50%" innerRadius={80} outerRadius={120} fill="#8884d8" paddingAngle={2} stroke="none">{processedTransactionByChannelData.map((entry, index) => (<Cell key={`cell-${index}`} fill={entry.color} />))}</Pie><Tooltip content={<CustomTooltip unit="%" />} /><Legend iconType="circle" wrapperStyle={{fontSize: "12px", color: "#d1d5db"}}/></PieChart></ResponsiveContainer></ChartCard></div>
                    <div className="lg:col-span-3"><ChartCard title="Số lượng giao dịch trung bình theo ngày"><ResponsiveContainer width="100%" height="100%"><AreaChart data={avgDailyTransactionOverviewData} margin={{ top: 10, right: 30, left: 20, bottom: 0 }}><CartesianGrid strokeDasharray="3 3" stroke="rgba(255, 255, 255, 0.1)" /><XAxis dataKey="name" stroke="rgba(255, 255, 255, 0.5)" tick={{ fontSize: 12 }} /><YAxis stroke="rgba(255, 255, 255, 0.5)" tickFormatter={(value) => `${(value / 1000000)}M`} tick={{ fontSize: 12 }} /><Tooltip content={<CustomTooltip valueFormatter={val => val.toLocaleString()}/>} /><Legend wrapperStyle={{color: "#d1d5db"}} /><defs><linearGradient id="colorNgayThuong" x1="0" y1="0" x2="0" y2="1"><stop offset="5%" stopColor="#8884d8" stopOpacity={0.8}/><stop offset="95%" stopColor="#8884d8" stopOpacity={0}/></linearGradient><linearGradient id="colorCuoiTuan" x1="0" y1="0" x2="0" y2="1"><stop offset="5%" stopColor="#82ca9d" stopOpacity={0.8}/><stop offset="95%" stopColor="#82ca9d" stopOpacity={0}/></linearGradient></defs><Area type="monotone" dataKey="NgayThuong" name="Ngày thường" stackId="1" stroke="#8884d8" fill="url(#colorNgayThuong)" /><Area type="monotone" dataKey="CuoiTuan" name="Cuối tuần" stackId="1" stroke="#82ca9d" fill="url(#colorCuoiTuan)" /></AreaChart></ResponsiveContainer></ChartCard></div>
                </section>
                <section className="mb-16 page-break-avoider">
                    <div className="section-title-wrapper">
                        <div className="section-title flex items-center gap-4 mb-8"><Users size={32} className="text-yellow-400" /><h3 className="text-3xl font-semibold">Tăng trưởng Khách hàng & Tài khoản</h3></div>
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6 mb-8 page-break-avoider">{growthMetrics.map((metric, index) => (<GrowthMetricCard key={index} icon={metric.icon} color={metric.color} absoluteValue={metric.absoluteValue} percentageValue={metric.percentageValue} name={metric.name} description={metric.description} />))}</div>
                    </div>
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6"><ChartCard title="Xu hướng số lượng giao dịch tài chính"><ResponsiveContainer width="100%" height="100%"><LineChart data={totalHistoricalDataTransactions} margin={{ top: 5, right: 20, left: -10, bottom: 5 }}><CartesianGrid strokeDasharray="3 3" stroke="rgba(255, 255, 255, 0.1)"/><XAxis dataKey="month" stroke="rgba(255, 255, 255, 0.5)" tick={{ fontSize: 12 }} /><YAxis tickFormatter={(value) => `${(value / 1000000)}M`} stroke="rgba(255, 255, 255, 0.5)" tick={{ fontSize: 12 }}/><Tooltip content={<CustomTooltip valueFormatter={val => `${(val/1000000).toFixed(1)}M`} />} /><Legend wrapperStyle={{color: "#d1d5db"}} />{selectedYears.map((year, index) => (<Line key={year} type="monotone" dataKey={year} stroke={lineColors[index % lineColors.length]} name={year} dot={false} strokeWidth={2} />))}</LineChart></ResponsiveContainer></ChartCard><ChartCard title="Xu hướng số lượng khách hàng"><ResponsiveContainer width="100%" height="100%"><LineChart data={historicalDataCustomers} margin={{ top: 5, right: 20, left: -10, bottom: 5 }}><CartesianGrid strokeDasharray="3 3" stroke="rgba(255, 255, 255, 0.1)"/><XAxis dataKey="month" stroke="rgba(255, 255, 255, 0.5)" tick={{ fontSize: 12 }} /><YAxis tickFormatter={(value) => `${(value / 1000000)}M`} stroke="rgba(255, 255, 255, 0.5)" tick={{ fontSize: 12 }}/><Tooltip content={<CustomTooltip valueFormatter={val => `${(val/1000000).toFixed(1)}M`} />} /><Legend wrapperStyle={{color: "#d1d5db"}} />{selectedYears.map((year, index) => (<Line key={year} type="monotone" dataKey={year} stroke={lineColors[index % lineColors.length]} name={year} dot={false} strokeWidth={2} />))}</LineChart></ResponsiveContainer></ChartCard></div>
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6"><ChartCard title="Tài khoản tiền gửi không kỳ hạn"><ResponsiveContainer width="100%" height="100%"><LineChart data={historicalDataDemandAccounts} margin={{ top: 5, right: 20, left: -10, bottom: 5 }}><CartesianGrid strokeDasharray="3 3" stroke="rgba(255, 255, 255, 0.1)"/><XAxis dataKey="month" stroke="rgba(255, 255, 255, 0.5)" tick={{ fontSize: 12 }} /><YAxis tickFormatter={(value) => `${(value / 1000000).toFixed(1)}M`} stroke="rgba(255, 255, 255, 0.5)" tick={{ fontSize: 12 }}/><Tooltip content={<CustomTooltip valueFormatter={val => `${(val/1000000).toFixed(1)}M`} />} /><Legend wrapperStyle={{color: "#d1d5db"}} />{selectedYears.map((year, index) => (<Line key={year} type="monotone" dataKey={year} stroke={lineColors[index % lineColors.length]} name={year} dot={false} strokeWidth={2} />))}</LineChart></ResponsiveContainer></ChartCard><ChartCard title="Tài khoản tiền gửi có kỳ hạn"><ResponsiveContainer width="100%" height="100%"><LineChart data={historicalDataTermAccounts} margin={{ top: 5, right: 20, left: -10, bottom: 5 }}><CartesianGrid strokeDasharray="3 3" stroke="rgba(255, 255, 255, 0.1)"/><XAxis dataKey="month" stroke="rgba(255, 255, 255, 0.5)" tick={{ fontSize: 12 }} /><YAxis tickFormatter={(value) => `${(value / 1000000).toFixed(1)}M`} stroke="rgba(255, 255, 255, 0.5)" tick={{ fontSize: 12 }}/><Tooltip content={<CustomTooltip valueFormatter={val => `${(val/1000000).toFixed(1)}M`} />} /><Legend wrapperStyle={{color: "#d1d5db"}} />{selectedYears.map((year, index) => (<Line key={year} type="monotone" dataKey={year} stroke={lineColors[index % lineColors.length]} name={year} dot={false} strokeWidth={2} />))}</LineChart></ResponsiveContainer></ChartCard><ChartCard title="Tài khoản tiền vay"><ResponsiveContainer width="100%" height="100%"><LineChart data={historicalDataLoanAccounts} margin={{ top: 5, right: 20, left: -10, bottom: 5 }}><CartesianGrid strokeDasharray="3 3" stroke="rgba(255, 255, 255, 0.1)"/><XAxis dataKey="month" stroke="rgba(255, 255, 255, 0.5)" tick={{ fontSize: 12 }} /><YAxis tickFormatter={(value) => `${(value / 1000000).toFixed(1)}M`} stroke="rgba(255, 255, 255, 0.5)" tick={{ fontSize: 12 }}/><Tooltip content={<CustomTooltip valueFormatter={val => `${(val/1000000).toFixed(1)}M`} />} /><Legend wrapperStyle={{color: "#d1d5db"}} />{selectedYears.map((year, index) => (<Line key={year} type="monotone" dataKey={year} stroke={lineColors[index % lineColors.length]} name={year} dot={false} strokeWidth={2} />))}</LineChart></ResponsiveContainer></ChartCard></div>
                </section>
                <section className="mb-16 page-break-avoider"><div className="section-title flex items-center gap-4 mb-8"><AlertTriangle size={32} className="text-yellow-400" /><h3 className="text-3xl font-bold">Tình hình khắc phục lỗi</h3></div>
                    <AnimatedComponent className="group relative bg-white/5 backdrop-blur-md border border-white/10 p-6 rounded-2xl shadow-2xl overflow-hidden"><div className="relative z-10"><div className="flex items-start gap-4 pb-4"><CheckCircle className="text-green-400 mt-1 flex-shrink-0" size={24} /><div><h4 className="font-bold text-lg text-white">Trạng thái tổng quan</h4><p className="text-gray-300">{errorDetails.status}</p></div></div>{errorDetails.webCSRError && errorDetails.webCSRError.description && (<div className="border-t border-white/10 pt-4 mt-4"><h4 className="font-bold text-lg mb-2 text-white">Sự cố ghi nhận: {`${errorDetails.webCSRError.description.substring(0, 50)}...`}</h4><p className="text-sm text-gray-400 mb-4">{`Tóm tắt ảnh hưởng: ${errorDetails.webCSRError.impact}`}</p><button onClick={() => setIsErrorDetailExpanded(!isErrorDetailExpanded)} className="flex items-center text-sm font-semibold text-yellow-400 hover:text-yellow-300 transition-colors">{isErrorDetailExpanded ? 'Thu gọn' : 'Xem chi tiết'}<ChevronRight className={`w-4 h-4 ml-1 transition-transform ${isErrorDetailExpanded ? 'rotate-90' : ''}`} /></button>{isErrorDetailExpanded && (<div className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-4 text-sm bg-black/20 p-4 rounded-lg"><div><strong className="text-gray-400">Ngày/giờ:</strong> {errorDetails.webCSRError.date}</div><div><strong className="text-gray-400">Tác động:</strong> {errorDetails.webCSRError.impact}</div><div className="md:col-span-2"><strong className="text-gray-400">Mô tả:</strong> {errorDetails.webCSRError.description}</div><div className="md:col-span-2"><strong className="text-gray-400">Nguyên nhân:</strong> {errorDetails.webCSRError.cause}</div><div className="md:col-span-2"><strong className="text-gray-400">Xử lý & Phòng ngừa:</strong> {errorDetails.webCSRError.prevention}</div></div>)}</div>)}</div></AnimatedComponent>
                </section>
                <section className="mb-16 page-break-avoider"><div className="section-title flex items-center gap-4 mb-8"><Settings size={32} className="text-yellow-400" /><h3 className="text-3xl font-bold">Quản lý & Cập nhật hệ thống</h3></div>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                        <AnimatedComponent className="bg-white/5 backdrop-blur-md border border-white/10 p-6 rounded-2xl text-center relative overflow-hidden group flex flex-col justify-center items-center">
                            <div className="relative z-10">
                                <div className="flex justify-center items-center h-12 mb-2"><FileText size={40} className="text-pink-400" /></div>
                                <p className="text-4xl font-bold text-white">{systemUpdateData.totalAppUpdates}</p>
                                <p className="text-gray-300">lượt cập nhật ứng dụng</p>
                            </div>
                        </AnimatedComponent>
                        <AnimatedComponent className="bg-white/5 backdrop-blur-md border border-white/10 p-6 rounded-2xl text-center relative overflow-hidden group flex flex-col justify-center items-center">
                            <div className="relative z-10">
                                <div className="flex justify-center items-center h-12 mb-2"><Settings size={40} className="text-yellow-400" /></div>
                                <p className="text-4xl font-bold text-white">{systemUpdateData.manualParamUpdates}</p>
                                <p className="text-gray-300">cập nhật tham số thủ công</p>
                                <p className="text-xs text-gray-400">{`(${systemUpdateData.manualParamProd} trên Production)`}</p>
                            </div>
                        </AnimatedComponent>
                        <AnimatedComponent className="bg-white/5 backdrop-blur-md border border-white/10 p-6 rounded-2xl text-center relative overflow-hidden group flex flex-col justify-center items-center">
                            <div className="relative z-10">
                                <div className="flex justify-center items-center h-12 mb-2"><Database size={40} className="text-lime-400" /></div>
                                <p className="text-4xl font-bold text-white">{systemUpdateData.systemDataUpdates}</p>
                                <p className="text-gray-300">cập nhật dữ liệu hệ thống</p>
                                <p className="text-xs text-gray-400">{`(${systemUpdateData.profileDataUpdates} cho Profile)`}</p>
                            </div>
                        </AnimatedComponent>
                        <AnimatedComponent className="bg-white/5 backdrop-blur-md border border-white/10 p-6 rounded-2xl text-center relative overflow-hidden group flex flex-col justify-center items-center">
                            <div className="relative z-10">
                                <div className="flex justify-center items-center h-12 mb-2"><Server size={40} className="text-blue-400" /></div>
                                <p className="text-lg font-bold mt-2 text-white">Môi trường Dev/Test</p>
                                <p className="text-green-400 font-semibold">{systemUpdateData.devTestEnvStatus}</p>
                            </div>
                        </AnimatedComponent>
                    </div>
                </section>
                <section className="page-break-avoider"><div className="section-title flex items-center gap-4 mb-8"><CalendarCheck size={32} className="text-yellow-400" /><h3 className="text-3xl font-bold">Công việc tiếp theo</h3></div><AnimatedComponent><div className="bg-gradient-to-r from-yellow-500/80 to-yellow-600/80 p-1 rounded-2xl shadow-2xl"><div className="bg-[#1a2c28] p-8 rounded-xl"><p className="text-xl text-center font-semibold text-white tracking-wide">{nextSteps}</p></div></div></AnimatedComponent></section>
                <footer className="text-center text-gray-500 text-sm mt-16 page-break-avoider">Báo cáo hoạt động định kỳ của hệ thống Core Banking xây dựng bởi Ban QLPTCB.</footer>
            </main>
        </MainContainer>
    );
};

export default App;
