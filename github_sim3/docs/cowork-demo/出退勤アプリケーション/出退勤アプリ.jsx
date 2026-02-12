import { useState, useEffect, useCallback } from "react";

const INITIAL_EMPLOYEES = [
  { id: 1, name: "田中 太郎", department: "営業部" },
  { id: 2, name: "佐藤 花子", department: "人事部" },
  { id: 3, name: "鈴木 一郎", department: "開発部" },
  { id: 4, name: "山田 美咲", department: "経理部" },
  { id: 5, name: "高橋 健太", department: "開発部" },
];

function formatTime(date) {
  return date.toLocaleTimeString("ja-JP", { hour: "2-digit", minute: "2-digit", second: "2-digit" });
}
function formatDate(date) {
  return date.toLocaleDateString("ja-JP", { year: "numeric", month: "long", day: "numeric", weekday: "long" });
}
function formatDateShort(date) {
  return `${date.getFullYear()}/${String(date.getMonth() + 1).padStart(2, "0")}/${String(date.getDate()).padStart(2, "0")}`;
}
function calcDuration(start, end) {
  const diff = end - start;
  const h = Math.floor(diff / 3600000);
  const m = Math.floor((diff % 3600000) / 60000);
  return `${h}時間${m}分`;
}
function calcDurationDecimal(start, end) {
  return ((end - start) / 3600000).toFixed(2);
}

/* ── Excel XML 生成（ライブラリ不要） ── */
function escapeXml(s) {
  return String(s).replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");
}

function buildExcelXml(employees, records, history) {
  const today = formatDateShort(new Date());

  const headerStyle = `
    <Style ss:ID="header">
      <Alignment ss:Horizontal="Center" ss:Vertical="Center"/>
      <Font ss:FontName="Arial" ss:Bold="1" ss:Color="#FFFFFF" ss:Size="10"/>
      <Interior ss:Color="#2C3E50" ss:Pattern="Solid"/>
      <Borders>
        <Border ss:Position="Bottom" ss:LineStyle="Continuous" ss:Weight="1" ss:Color="#D0D0D0"/>
        <Border ss:Position="Left" ss:LineStyle="Continuous" ss:Weight="1" ss:Color="#D0D0D0"/>
        <Border ss:Position="Right" ss:LineStyle="Continuous" ss:Weight="1" ss:Color="#D0D0D0"/>
        <Border ss:Position="Top" ss:LineStyle="Continuous" ss:Weight="1" ss:Color="#D0D0D0"/>
      </Borders>
    </Style>
    <Style ss:ID="title">
      <Font ss:FontName="Arial" ss:Bold="1" ss:Size="14" ss:Color="#2C3E50"/>
      <Alignment ss:Horizontal="Center" ss:Vertical="Center"/>
    </Style>
    <Style ss:ID="cell">
      <Font ss:FontName="Arial" ss:Size="10"/>
      <Alignment ss:Horizontal="Center" ss:Vertical="Center"/>
      <Borders>
        <Border ss:Position="Bottom" ss:LineStyle="Continuous" ss:Weight="1" ss:Color="#E0E0E0"/>
        <Border ss:Position="Left" ss:LineStyle="Continuous" ss:Weight="1" ss:Color="#E0E0E0"/>
        <Border ss:Position="Right" ss:LineStyle="Continuous" ss:Weight="1" ss:Color="#E0E0E0"/>
        <Border ss:Position="Top" ss:LineStyle="Continuous" ss:Weight="1" ss:Color="#E0E0E0"/>
      </Borders>
    </Style>
    <Style ss:ID="cellAlt">
      <Font ss:FontName="Arial" ss:Size="10"/>
      <Alignment ss:Horizontal="Center" ss:Vertical="Center"/>
      <Interior ss:Color="#F5F5F5" ss:Pattern="Solid"/>
      <Borders>
        <Border ss:Position="Bottom" ss:LineStyle="Continuous" ss:Weight="1" ss:Color="#E0E0E0"/>
        <Border ss:Position="Left" ss:LineStyle="Continuous" ss:Weight="1" ss:Color="#E0E0E0"/>
        <Border ss:Position="Right" ss:LineStyle="Continuous" ss:Weight="1" ss:Color="#E0E0E0"/>
        <Border ss:Position="Top" ss:LineStyle="Continuous" ss:Weight="1" ss:Color="#E0E0E0"/>
      </Borders>
    </Style>
    <Style ss:ID="green">
      <Font ss:FontName="Arial" ss:Size="10" ss:Color="#2E7D32"/>
      <Alignment ss:Horizontal="Center" ss:Vertical="Center"/>
      <Interior ss:Color="#E8F5E9" ss:Pattern="Solid"/>
      <Borders>
        <Border ss:Position="Bottom" ss:LineStyle="Continuous" ss:Weight="1" ss:Color="#E0E0E0"/>
      </Borders>
    </Style>
    <Style ss:ID="red">
      <Font ss:FontName="Arial" ss:Size="10" ss:Color="#C62828"/>
      <Alignment ss:Horizontal="Center" ss:Vertical="Center"/>
      <Interior ss:Color="#FFEBEE" ss:Pattern="Solid"/>
      <Borders>
        <Border ss:Position="Bottom" ss:LineStyle="Continuous" ss:Weight="1" ss:Color="#E0E0E0"/>
      </Borders>
    </Style>`;

  const makeCell = (val, style = "cell") =>
    `<Cell ss:StyleID="${style}"><Data ss:Type="String">${escapeXml(val)}</Data></Cell>`;
  const makeNumCell = (val, style = "cell") =>
    `<Cell ss:StyleID="${style}"><Data ss:Type="Number">${val}</Data></Cell>`;

  // ── Sheet 1: 出退勤記録 ──
  let sheet1Rows = `
    <Row ss:Height="30"><Cell ss:StyleID="title" ss:MergeAcross="8"><Data ss:Type="String">出退勤記録</Data></Cell></Row>
    <Row><Cell><Data ss:Type="String"></Data></Cell></Row>
    <Row>
      ${["ID","従業員名","部署","日付","出勤時刻","退勤時刻","勤務時間","勤務時間(h)","ステータス"].map(h => makeCell(h, "header")).join("")}
    </Row>`;

  employees.forEach((emp, i) => {
    const rec = records[emp.id];
    const clockIn = rec?.clockIn ? formatTime(rec.clockIn) : "";
    const clockOut = rec?.clockOut ? formatTime(rec.clockOut) : "";
    const dur = rec?.clockIn && rec?.clockOut ? calcDuration(rec.clockIn, rec.clockOut) : "";
    const durH = rec?.clockIn && rec?.clockOut ? calcDurationDecimal(rec.clockIn, rec.clockOut) : "";
    const status = !rec ? "未出勤" : rec.clockOut ? "退勤済" : "勤務中";
    const s = i % 2 === 0 ? "cell" : "cellAlt";
    sheet1Rows += `<Row>
      ${makeNumCell(emp.id, s)}${makeCell(emp.name, s)}${makeCell(emp.department, s)}${makeCell(today, s)}${makeCell(clockIn, s)}${makeCell(clockOut, s)}${makeCell(dur, s)}${makeCell(durH, s)}${makeCell(status, s)}
    </Row>`;
  });

  // ── Sheet 2: 打刻ログ ──
  let sheet2Rows = `
    <Row ss:Height="30"><Cell ss:StyleID="title" ss:MergeAcross="5"><Data ss:Type="String">打刻ログ</Data></Cell></Row>
    <Row><Cell><Data ss:Type="String"></Data></Cell></Row>
    <Row>
      ${["日付","時刻","ID","従業員名","部署","種別"].map(h => makeCell(h, "header")).join("")}
    </Row>`;

  history.forEach((entry, i) => {
    const emp = employees.find(e => e.id === entry.employeeId);
    const s = i % 2 === 0 ? "cell" : "cellAlt";
    const typeStyle = entry.type === "出勤" ? "green" : "red";
    sheet2Rows += `<Row>
      ${makeCell(formatDateShort(entry.time), s)}${makeCell(formatTime(entry.time), s)}${makeNumCell(emp?.id || "", s)}${makeCell(emp?.name || "", s)}${makeCell(emp?.department || "", s)}${makeCell(entry.type, typeStyle)}
    </Row>`;
  });

  // ── Sheet 3: 従業員マスター ──
  let sheet3Rows = `
    <Row ss:Height="30"><Cell ss:StyleID="title" ss:MergeAcross="2"><Data ss:Type="String">従業員マスター</Data></Cell></Row>
    <Row><Cell><Data ss:Type="String"></Data></Cell></Row>
    <Row>
      ${["ID","従業員名","部署"].map(h => makeCell(h, "header")).join("")}
    </Row>`;

  employees.forEach((emp, i) => {
    const s = i % 2 === 0 ? "cell" : "cellAlt";
    sheet3Rows += `<Row>${makeNumCell(emp.id, s)}${makeCell(emp.name, s)}${makeCell(emp.department, s)}</Row>`;
  });

  return `<?xml version="1.0" encoding="UTF-8"?>
<?mso-application progid="Excel.Sheet"?>
<Workbook xmlns="urn:schemas-microsoft-com:office:spreadsheet"
  xmlns:o="urn:schemas-microsoft-com:office:office"
  xmlns:x="urn:schemas-microsoft-com:office:excel"
  xmlns:ss="urn:schemas-microsoft-com:office:spreadsheet">
  <Styles>${headerStyle}</Styles>
  <Worksheet ss:Name="出退勤記録">
    <Table ss:DefaultColumnWidth="90" ss:DefaultRowHeight="22">
      <Column ss:Width="40"/><Column ss:Width="120"/><Column ss:Width="90"/>
      <Column ss:Width="90"/><Column ss:Width="90"/><Column ss:Width="90"/>
      <Column ss:Width="100"/><Column ss:Width="100"/><Column ss:Width="80"/>
      ${sheet1Rows}
    </Table>
  </Worksheet>
  <Worksheet ss:Name="打刻ログ">
    <Table ss:DefaultColumnWidth="90" ss:DefaultRowHeight="22">
      <Column ss:Width="90"/><Column ss:Width="90"/><Column ss:Width="40"/>
      <Column ss:Width="120"/><Column ss:Width="90"/><Column ss:Width="60"/>
      ${sheet2Rows}
    </Table>
  </Worksheet>
  <Worksheet ss:Name="従業員マスター">
    <Table ss:DefaultColumnWidth="90" ss:DefaultRowHeight="22">
      <Column ss:Width="40"/><Column ss:Width="120"/><Column ss:Width="90"/>
      ${sheet3Rows}
    </Table>
  </Worksheet>
</Workbook>`;
}

function exportToExcel(employees, records, history) {
  const xml = buildExcelXml(employees, records, history);
  const blob = new Blob([xml], { type: "application/vnd.ms-excel" });
  const url = URL.createObjectURL(blob);
  const now = new Date();
  const filename = `出退勤記録_${now.getFullYear()}${String(now.getMonth() + 1).padStart(2, "0")}${String(now.getDate()).padStart(2, "0")}.xls`;
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
  return filename;
}

/* ── UI コンポーネント ── */
function StatusBadge({ status }) {
  const config = {
    notStarted: { label: "未出勤", bg: "bg-gray-100", text: "text-gray-600", dot: "bg-gray-400" },
    working: { label: "勤務中", bg: "bg-green-50", text: "text-green-700", dot: "bg-green-500" },
    finished: { label: "退勤済", bg: "bg-blue-50", text: "text-blue-700", dot: "bg-blue-500" },
  };
  const c = config[status];
  return (
    <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-sm font-medium ${c.bg} ${c.text}`}>
      <span className={`w-2 h-2 rounded-full ${c.dot} ${status === "working" ? "animate-pulse" : ""}`} />
      {c.label}
    </span>
  );
}

function Clock() {
  const [now, setNow] = useState(new Date());
  useEffect(() => {
    const id = setInterval(() => setNow(new Date()), 1000);
    return () => clearInterval(id);
  }, []);
  return (
    <div className="text-center py-6">
      <p className="text-gray-500 text-sm mb-1">{formatDate(now)}</p>
      <p className="text-5xl font-light tracking-widest text-gray-800 tabular-nums">{formatTime(now)}</p>
    </div>
  );
}

function EmployeeCard({ employee, record, onClockIn, onClockOut }) {
  const status = !record ? "notStarted" : record.clockOut ? "finished" : "working";
  const initials = employee.name.split(" ").map((n) => n[0]).join("");
  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-5 hover:shadow-md transition-shadow">
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-center gap-3">
          <div className="w-11 h-11 rounded-full bg-indigo-100 text-indigo-700 flex items-center justify-center font-bold text-sm">{initials}</div>
          <div>
            <h3 className="font-semibold text-gray-900">{employee.name}</h3>
            <p className="text-xs text-gray-500">{employee.department}</p>
          </div>
        </div>
        <StatusBadge status={status} />
      </div>
      <div className="grid grid-cols-3 gap-3 text-center text-sm mb-4 bg-gray-50 rounded-lg p-3">
        <div>
          <p className="text-gray-400 text-xs mb-1">出勤</p>
          <p className="font-medium text-gray-800">{record?.clockIn ? formatTime(record.clockIn) : "—"}</p>
        </div>
        <div>
          <p className="text-gray-400 text-xs mb-1">退勤</p>
          <p className="font-medium text-gray-800">{record?.clockOut ? formatTime(record.clockOut) : "—"}</p>
        </div>
        <div>
          <p className="text-gray-400 text-xs mb-1">勤務時間</p>
          <p className="font-medium text-gray-800">
            {record?.clockIn && record?.clockOut ? calcDuration(record.clockIn, record.clockOut) : record?.clockIn ? calcDuration(record.clockIn, new Date()) : "—"}
          </p>
        </div>
      </div>
      <div className="flex gap-2">
        <button onClick={() => onClockIn(employee.id)} disabled={status !== "notStarted"} className="flex-1 py-2.5 rounded-lg text-sm font-medium transition-colors bg-green-600 text-white hover:bg-green-700 disabled:bg-gray-100 disabled:text-gray-400 disabled:cursor-not-allowed">
          出勤
        </button>
        <button onClick={() => onClockOut(employee.id)} disabled={status !== "working"} className="flex-1 py-2.5 rounded-lg text-sm font-medium transition-colors bg-red-500 text-white hover:bg-red-600 disabled:bg-gray-100 disabled:text-gray-400 disabled:cursor-not-allowed">
          退勤
        </button>
      </div>
    </div>
  );
}

function SummaryBar({ records, total }) {
  const working = Object.values(records).filter((r) => r.clockIn && !r.clockOut).length;
  const finished = Object.values(records).filter((r) => r.clockOut).length;
  const notStarted = total - working - finished;
  return (
    <div className="grid grid-cols-3 gap-4 mb-6">
      <div className="bg-white rounded-xl border border-gray-200 p-4 text-center">
        <p className="text-3xl font-bold text-gray-400">{notStarted}</p>
        <p className="text-xs text-gray-500 mt-1">未出勤</p>
      </div>
      <div className="bg-white rounded-xl border border-green-200 p-4 text-center">
        <p className="text-3xl font-bold text-green-600">{working}</p>
        <p className="text-xs text-gray-500 mt-1">勤務中</p>
      </div>
      <div className="bg-white rounded-xl border border-blue-200 p-4 text-center">
        <p className="text-3xl font-bold text-blue-600">{finished}</p>
        <p className="text-xs text-gray-500 mt-1">退勤済</p>
      </div>
    </div>
  );
}

function HistoryTable({ employees, history }) {
  if (history.length === 0) return null;
  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
      <div className="px-5 py-4 border-b border-gray-100">
        <h2 className="font-semibold text-gray-800">本日の打刻履歴</h2>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="bg-gray-50 text-gray-500 text-xs uppercase tracking-wider">
              <th className="px-5 py-3 text-left">時刻</th>
              <th className="px-5 py-3 text-left">従業員</th>
              <th className="px-5 py-3 text-left">部署</th>
              <th className="px-5 py-3 text-left">種別</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {history.slice().reverse().map((entry, i) => {
              const emp = employees.find((e) => e.id === entry.employeeId);
              return (
                <tr key={i} className="hover:bg-gray-50 transition-colors">
                  <td className="px-5 py-3 text-gray-700 tabular-nums">{formatTime(entry.time)}</td>
                  <td className="px-5 py-3 font-medium text-gray-900">{emp?.name}</td>
                  <td className="px-5 py-3 text-gray-500">{emp?.department}</td>
                  <td className="px-5 py-3">
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${entry.type === "出勤" ? "bg-green-100 text-green-700" : "bg-red-100 text-red-700"}`}>
                      {entry.type}
                    </span>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}

/* ── メインアプリ ── */
export default function App() {
  const [employees] = useState(INITIAL_EMPLOYEES);
  const [records, setRecords] = useState({});
  const [history, setHistory] = useState([]);
  const [toast, setToast] = useState(null);
  const [saveCount, setSaveCount] = useState(0);

  const showToast = useCallback((msg) => {
    setToast(msg);
    setTimeout(() => setToast(null), 3000);
  }, []);

  const handleClockIn = useCallback((id) => {
    const now = new Date();
    setRecords((prev) => ({ ...prev, [id]: { clockIn: now, clockOut: null } }));
    setHistory((prev) => [...prev, { employeeId: id, type: "出勤", time: now }]);
    const emp = employees.find((e) => e.id === id);
    showToast(`${emp.name} さんが出勤しました`);
  }, [employees, showToast]);

  const handleClockOut = useCallback((id) => {
    const now = new Date();
    setRecords((prev) => ({ ...prev, [id]: { ...prev[id], clockOut: now } }));
    setHistory((prev) => [...prev, { employeeId: id, type: "退勤", time: now }]);
    const emp = employees.find((e) => e.id === id);
    showToast(`${emp.name} さんが退勤しました`);
  }, [employees, showToast]);

  const handleExport = useCallback(() => {
    if (history.length === 0) {
      showToast("保存する記録がありません");
      return;
    }
    try {
      const filename = exportToExcel(employees, records, history);
      setSaveCount((c) => c + 1);
      showToast(`Excelに保存しました: ${filename}`);
    } catch (err) {
      showToast("保存に失敗しました");
    }
  }, [employees, records, history, showToast]);

  return (
    <div className="min-h-screen bg-gray-50">
      {toast && (
        <div className="fixed top-4 left-1/2 -translate-x-1/2 z-50 bg-gray-900 text-white px-5 py-3 rounded-lg shadow-lg text-sm animate-bounce">
          {toast}
        </div>
      )}

      <header className="bg-white border-b border-gray-200 sticky top-0 z-40">
        <div className="max-w-5xl mx-auto px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 bg-indigo-600 rounded-lg flex items-center justify-center">
              <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <h1 className="text-lg font-bold text-gray-900">出退勤管理</h1>
          </div>
          <div className="flex items-center gap-3">
            <span className="text-xs text-gray-400">従業員数: {employees.length}名</span>
            <button
              onClick={handleExport}
              className="inline-flex items-center gap-2 px-4 py-2 bg-emerald-600 text-white text-sm font-medium rounded-lg hover:bg-emerald-700 transition-colors shadow-sm"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
              Excelに保存
              {saveCount > 0 && (
                <span className="bg-emerald-500 text-white text-xs px-1.5 py-0.5 rounded-full">{saveCount}</span>
              )}
            </button>
          </div>
        </div>
      </header>

      <main className="max-w-5xl mx-auto px-4 py-6">
        <Clock />
        <SummaryBar records={records} total={employees.length} />

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mb-8">
          {employees.map((emp) => (
            <EmployeeCard key={emp.id} employee={emp} record={records[emp.id]} onClockIn={handleClockIn} onClockOut={handleClockOut} />
          ))}
        </div>

        <HistoryTable employees={employees} history={history} />

        {history.length > 0 && (
          <div className="mt-6 text-center">
            <button
              onClick={handleExport}
              className="inline-flex items-center gap-2 px-6 py-3 bg-emerald-600 text-white font-medium rounded-xl hover:bg-emerald-700 transition-colors shadow-md"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
              記録をExcelファイルに保存
            </button>
            <p className="text-xs text-gray-400 mt-2">3シート構成: 出退勤記録 / 打刻ログ / 従業員マスター</p>
          </div>
        )}
      </main>
    </div>
  );
}