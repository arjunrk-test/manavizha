"use client"

import React, { useRef } from 'react';
export interface PlanetData {
  name: string;
  tamilName: string;
  tamilAbbr: string;
  longitude: number;
  siderealLongitude: number;
  rasiIndex: number;
  navamsamIndex: number;
  isLagnam?: boolean;
}

export interface HoroscopeData {
  name?: string;
  dob?: string;
  tob?: string;
  pob?: string;
  star: string;
  rashi: string;
  lagnam: string;
  yoga: string;
  karana: string;
  sunrise: string;
  sunset: string;
  planets: PlanetData[];
  panchang: any;
  kundali: any;
  paksham?: string;
  padam?: number;
  dasaPeriods?: any[];
  papaPulligal?: any;
}

interface DetailedHoroscopeViewProps {
  data: HoroscopeData & { name?: string; dob?: string; tob?: string; pob?: string; calculationMethod?: 'thirukanitham' | 'vakkiyam' };
  onClose?: () => void;
  hideCloseButton?: boolean;
}

// 4x4 Grid mapping to Rasi Indexes (Aries = 0, Taurus = 1... Pisces = 11)
const RASI_GRID = [
  [11, 0, 1, 2],
  [10, -1, -1, 3],
  [9, -1, -1, 4],
  [8, 7, 6, 5],
];

const RASI_NAMES_TAMIL = [
  "மேஷம்", "ரிஷபம்", "மிதுனம்", "கடகம்", 
  "சிம்மம்", "கன்னி", "துலாம்", "விருச்சிகம்", 
  "தனுசு", "மகரம்", "கும்பம்", "மீனம்"
];

const DASA_MOCK_DATA = [
  { name: "கே-சனி", start: "25-04-2008 - 04-06-2009", name2: "சந்-சந்", start2: "01-06-2036 - 01-04-2037" },
  { name: "கே-பு", start: "04-06-2009 - 01-06-2010", name2: "சந்-செ", start2: "01-04-2037 - 31-10-2037" },
  { name: "சு-சு", start: "01-06-2010 - 01-10-2013", name2: "சந்-ரா", start2: "31-10-2037 - 02-05-2039" },
  { name: "சு-சூ", start: "01-10-2013 - 01-10-2014", name2: "சந்-வி", start2: "02-05-2039 - 31-08-2040" },
  { name: "சு-சந்", start: "01-10-2014 - 01-06-2016", name2: "சந்-சனி", start2: "31-08-2040 - 01-04-2042" },
  { name: "சு-செ", start: "01-06-2016 - 01-08-2017", name2: "சந்-பு", start2: "01-04-2042 - 01-09-2043" },
  { name: "சு-ரா", start: "01-08-2017 - 01-08-2020", name2: "சந்-கே", start2: "01-09-2043 - 01-04-2044" },
];

const PAPA_PULLIGAL_MOCK = [
  { p: "செவ்வாய்", v1: "4", p1: "1.0", v2: "1", p2: "1.0", v3: "12", p3: "1.0" },
  { p: "சனி", v1: "1", p1: "1.0", v2: "10", p2: "0.0", v3: "9", p3: "0.0" },
  { p: "சூரியன்", v1: "6", p1: "0.0", v2: "3", p2: "0.0", v3: "2", p3: "1.0" },
  { p: "ராகு", v1: "5", p1: "0.0", v2: "2", p2: "1.0", v3: "1", p3: "1.0" },
];

const TRADITIONAL_COLORS = {
  bg: '#ffffff',
  chartBorder: '#7e22ce',
  chartHeaderBg: 'rgba(75, 0, 130, 0.05)', 
  chartHeaderText: '#4B0082',
  tableHeaderBg: '#f8f9fc',
  tableBorder: '#e2e8f0',
  text: '#1f2937',
  heading: '#111827',
};

const PLANET_COLORS: Record<string, string> = {
  'சூ': '#4b5563',
  'சந்': '#2563eb',
  'செ': '#dc2626',
  'பு': '#2563eb',
  'வி': '#c026d3',
  'சு': '#991b1b',
  'சனி': '#7e22ce',
  'ரா': '#16a34a',
  'கே': '#16a34a',
  'ல': '#7e22ce',
  'மா': '#000000',
  'கு': '#0d9488',
};

const ChartBox = ({ index, planets, title, isCenter = false, data }: { index: number, planets: PlanetData[], title?: string, isCenter?: boolean, data?: any }) => {
  if (isCenter) {
    if (title === 'Rasi') {
        return (
          <div className="col-span-2 row-span-2 flex flex-col items-center justify-center p-1 text-center" style={{ border: `1px solid ${TRADITIONAL_COLORS.chartBorder}` }}>
            <p className="font-bold text-[10px] text-gray-500 whitespace-pre-wrap leading-tight">{data?.star || 'நட்சத்திரம்'}</p>
            <p className="text-[9px] text-gray-500 whitespace-pre-wrap leading-tight">{data?.dob || ''}</p>
            <p className="text-[9px] text-gray-500 whitespace-pre-wrap leading-tight mb-1">{data?.tob || ''}</p>
            <p className="font-bold text-[13px] text-gray-600 mb-1">ராசி</p>
            <p className="text-[9px] text-gray-500 whitespace-pre-wrap leading-tight">அக்ஷம்சம் +9.11</p>
            <p className="text-[9px] text-gray-500 whitespace-pre-wrap leading-tight">தீர்காம்சம் -77.57</p>
          </div>
        );
    }
    return (
      <div className="col-span-2 row-span-2 flex flex-col items-center justify-center p-2 text-center" style={{ border: `1px solid ${TRADITIONAL_COLORS.chartBorder}` }}>
        <p className="font-bold text-sm text-gray-500 whitespace-pre-wrap">நவாம்சம்</p>
      </div>
    );
  }

  // Find planets for this specific rasi box
  const boxPlanets = planets.filter(p => index !== -1 && (title === 'Rasi' ? p.rasiIndex === index : p.navamsamIndex === index));
  
  return (
    <div className="relative w-full aspect-square min-h-[60px] flex p-1 flex-wrap content-start gap-1 justify-between items-start" style={{ border: `1px solid ${TRADITIONAL_COLORS.chartBorder}` }}>
       {boxPlanets.map((p, i) => (
        <span 
          key={p.name} 
          className="text-[14px] font-bold"
          style={{ color: PLANET_COLORS[p.tamilAbbr] || TRADITIONAL_COLORS.text }}
        >
          {p.tamilAbbr}
        </span>
      ))}
    </div>
  );
};

const SouthIndianChart = ({ planets, type, title, data }: { planets: PlanetData[], type: 'Rasi' | 'Navamsam', title: string, data?: any }) => {
  return (
    <div className="w-full max-w-[280px]">
      <div className="text-center py-2 mb-1 font-semibold text-sm" style={{ backgroundColor: TRADITIONAL_COLORS.chartHeaderBg, color: TRADITIONAL_COLORS.chartHeaderText }}>
        {title}
      </div>
      <div className="grid grid-cols-4 grid-rows-4 bg-white" style={{ border: `2px solid ${TRADITIONAL_COLORS.chartBorder}` }}>
        {RASI_GRID.map((row, rIndex) => (
          <React.Fragment key={rIndex}>
            {row.map((boxIndex, cIndex) => {
              if (boxIndex === -1 && rIndex === 1 && cIndex === 1) {
                return <ChartBox key="center" index={-1} planets={planets} title={type} isCenter data={data}/>;
              }
              if (boxIndex === -1 && ((rIndex === 1 && cIndex === 2) || (rIndex === 2 && cIndex === 1) || (rIndex === 2 && cIndex === 2))) {
                return null;
              }
              return <ChartBox key={`${rIndex}-${cIndex}`} index={boxIndex} planets={planets} title={type} />;
            })}
          </React.Fragment>
        ))}
      </div>
    </div>
  );
};

export const DetailedHoroscopeView = ({ data, onClose, hideCloseButton = false }: DetailedHoroscopeViewProps) => {
  const printRef = useRef<HTMLDivElement>(null);
  
  const handlePrint = () => {
    window.print();
  };

  const formatSputam = (deg: number) => {
    const d = Math.floor(deg);
    const m = Math.floor((deg - d) * 60);
    const s = Math.floor(((deg - d) * 60 - m) * 60);
    return `${d}:${m}:${s}`;
  };

  return (
    <div className="bg-gray-100 p-2 md:p-8 min-h-screen flex justify-center font-sans">
      <div className="bg-white px-4 md:px-8 py-6 w-full max-w-4xl shadow-md border-t-8 border-[#8a6d3b] print:shadow-none print:border-none print:max-w-none print:w-full print:p-0">
        
        {/* ACTION BUTTONS (Hidden in Print) */}
        <div className="flex justify-end gap-3 mb-6 print:hidden">
          <button onClick={handlePrint} className="px-4 py-2 bg-[#8a6d3b] text-white font-semibold rounded text-sm hover:bg-[#6c552e] shadow-sm">
            Print / Save PDF
          </button>
          {!hideCloseButton && onClose && (
            <button onClick={onClose} className="px-4 py-2 bg-gray-200 text-gray-800 font-semibold rounded text-sm hover:bg-gray-300">
              Back
            </button>
          )}
        </div>

        {/* PRINTABLE AREA */}
        <div ref={printRef} className="text-[#333] custom-print-container" style={{ backgroundColor: TRADITIONAL_COLORS.bg }}>
          
          <div className="text-center mb-6">
            <h1 className="text-2xl font-bold text-gray-700 mb-4">Horoscope of {data.name || 'User'}</h1>
            <p className="text-[13px] font-bold text-gray-800">
              {data.paksham || 'கிருஷ்ண பக்ஷம் (தேய்பிறை)'}, {data.star} நட்சத்திரம் ({data.padam ? `பாதம் ${data.padam}` : 'பாதம் 3'}), {data.rashi} ராசி
            </p>
          </div>

          <div className="flex flex-col md:flex-row gap-8 justify-center items-start mb-6">
            <SouthIndianChart planets={data.planets} type="Rasi" title="ராசி (பிறந்த அட்டவணை)" data={data} />
            <SouthIndianChart planets={data.planets} type="Navamsam" title="நவாம்சம்" data={data} />
          </div>

          <div className="text-center text-[13px] font-bold text-gray-800 mb-6">
            தசா இருப்பு = புதன் 4 வருடம், 8 மாதம், 13 தேதி.
          </div>

          <div className="text-[11px] leading-relaxed text-center mb-8 border-t border-b border-gray-300 py-3 text-gray-700 max-w-3xl mx-auto font-medium">
            பால்: ஆண் | பிறந்த தேதி: {data.dob || '17 செப்டம்பர் 1998, வியாழன்'} | பிறந்த நேரம்: {data.tob || '09:22:00 PM'} | 
            நேர மண்டலம்: 05:30 கிரீன்விச்சிற்கு கிழக்கே | நேரம் சரிசெய்ய: Standard Time | பிறந்த இடம்: {data.pob || 'Kovilpatti (tn)'} | 
            அயனாம்சம்: {data.calculationMethod === 'vakkiyam' ? 'வாக்கியம் (பாம்பு பஞ்சாங்கம்)' : 'லஹிரி (திருக்கணிதம்)'} | பிறந்த நட்சத்திரம்: {data.star} நட்சத்திர பாதம்: 3 | பிறந்த ராசி: {data.rashi} | 
            லக்கினம்: {data.lagnam} லக்கினாதிபதி: செவ்வாய் | திதி: திரயோதசி
          </div>

          <div className="flex flex-col gap-8 w-full">
            
            {/* STACKED FULL-WIDTH TABLES */}
              <div className="mb-6 border border-[#D1D5DB]" style={{ backgroundColor: '#fff' }}>
                <div className="px-3 py-2 text-sm font-medium border-b border-[#D1D5DB]" style={{ backgroundColor: TRADITIONAL_COLORS.tableHeaderBg, color: TRADITIONAL_COLORS.text }}>
                  பாப புள்ளிகள்
                </div>
                <div className="overflow-x-auto">
                  <table className="w-full text-center text-[10px] border-collapse bg-white">
                    <thead>
                      <tr className="border-b border-[#D1D5DB] font-medium" style={{ backgroundColor: '#F9FAFB', color: TRADITIONAL_COLORS.text }}>
                        <th className="p-1.5 whitespace-nowrap border-r border-[#D1D5DB]" rowSpan={2}>கிரகம்</th>
                        <th className="p-1.5 border-r border-[#D1D5DB] whitespace-nowrap" colSpan={2}>லக்னம்<br/>ராசியிலிருந்து</th>
                        <th className="p-1.5 border-r border-[#D1D5DB] whitespace-nowrap" colSpan={2}>சந்திர<br/>ராசியிலிருந்து</th>
                        <th className="p-1.5 whitespace-nowrap" colSpan={2}>சுக்ர ராசியிலிருந்து</th>
                      </tr>
                      <tr className="border-b border-[#D1D5DB] font-medium" style={{ backgroundColor: '#F9FAFB', color: TRADITIONAL_COLORS.text }}>
                        <th className="p-1 border-r border-[#D1D5DB] border-l border-[#D1D5DB] whitespace-nowrap">அதன்<br/>வரிசை</th>
                        <th className="p-1 border-r border-[#D1D5DB] whitespace-nowrap">புள்ளிகள்</th>
                        <th className="p-1 border-r border-[#D1D5DB] whitespace-nowrap">அதன்<br/>வரிசை</th>
                        <th className="p-1 border-r border-[#D1D5DB] whitespace-nowrap">புள்ளிகள்</th>
                        <th className="p-1 border-r border-[#D1D5DB] whitespace-nowrap">அதன்<br/>வரிசை</th>
                        <th className="p-1 whitespace-nowrap">புள்ளிகள்</th>
                      </tr>
                    </thead>
                    <tbody>
                      {(data.papaPulligal?.rows || PAPA_PULLIGAL_MOCK).map((r: any, i: number) => (
                        <tr key={i} className="border-b border-[#D1D5DB] text-gray-700">
                          <td className="p-2 font-medium whitespace-nowrap border-r border-[#D1D5DB] text-left px-3">{r.p}</td>
                          <td className="p-2 border-r border-[#D1D5DB]">{r.v1}</td>
                          <td className="p-2 border-r border-[#D1D5DB]">{r.p1}</td>
                          <td className="p-2 border-r border-[#D1D5DB]">{r.v2}</td>
                          <td className="p-2 border-r border-[#D1D5DB]">{r.p2}</td>
                          <td className="p-2 border-r border-[#D1D5DB]">{r.v3}</td>
                          <td className="p-2">{r.p3}</td>
                        </tr>
                      ))}
                      <tr className="border-b border-[#D1D5DB] font-medium" style={{ backgroundColor: '#F9FAFB', color: TRADITIONAL_COLORS.text }}>
                        <td className="p-2 whitespace-nowrap border-r border-[#D1D5DB] text-left px-3">மொத்தம்</td>
                        <td className="p-2 border-r border-[#D1D5DB]" colSpan={2}>{data.papaPulligal?.total?.p1 || '2.0'}</td>
                        <td className="p-2 border-r border-[#D1D5DB]" colSpan={2}>{data.papaPulligal?.total?.p2 || '2.0'}</td>
                        <td className="p-2" colSpan={2}>{data.papaPulligal?.total?.p3 || '3.0'}</td>
                      </tr>
                      <tr className="border-b border-[#D1D5DB] text-gray-700 bg-white">
                        <td className="p-2 border-r border-[#D1D5DB] whitespace-nowrap" colSpan={3}>செவ்வாய் தோஷம்</td>
                        <td className="p-2 whitespace-nowrap" colSpan={4}>{data.papaPulligal?.sevvaiDosham || 'தோஷம் குறைந்துள்ளது'}</td>
                      </tr>
                      <tr className="border-b border-[#D1D5DB] text-gray-700 bg-white">
                        <td className="p-2 border-r border-[#D1D5DB] whitespace-nowrap" colSpan={3}>இராகு தோஷம்</td>
                        <td className="p-2 whitespace-nowrap" colSpan={4}>{data.papaPulligal?.rahuDosham || 'தோஷம் உள்ளது'}</td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </div>

              <div className="mb-6 border border-[#D1D5DB]" style={{ backgroundColor: '#fff' }}>
                <div className="px-3 py-2 text-sm font-medium border-b border-[#D1D5DB] flex justify-between" style={{ backgroundColor: TRADITIONAL_COLORS.tableHeaderBg, color: TRADITIONAL_COLORS.text }}>
                  <span>நிராயண ஸ்புடங்கள்</span>
                  <span className="text-gray-500 font-normal">-</span>
                </div>
                <div className="p-3 text-[10px] text-gray-600 leading-relaxed border-b border-[#D1D5DB] bg-gray-50">
                  இந்திய ஜோதிடம் கிரகங்களின் நிராயண முறையை பின்பற்றுகிறது. இது மேல்நாட்டு முறைப்படி 
                  கணிக்கப்பட்ட சாயன நிலையிலிருந்து அயனாம்சத்தை கழித்து பெறப்பட்டது. அயனாம்சத்தை கணிப்பதில் பல முறைகள் உள்ளன. 
                  இந்த ஜாதகம் பின்பற்றிய அயனாம்சம் : {data.calculationMethod === 'vakkiyam' ? 'வாக்கியம் பஞ்சாங்கம்' : 'சித்ர பக்ஷ '} = 23:50:12
                </div>
                <div className="overflow-x-auto">
                    <table className="w-full text-center text-[10px] border-collapse">
                    <thead>
                        <tr className="font-medium border-b border-[#D1D5DB]" style={{ backgroundColor: '#F3F4F6', color: TRADITIONAL_COLORS.text }}>
                        <th className="p-1.5 border-r border-[#D1D5DB] whitespace-nowrap">கிரகம்</th>
                        <th className="p-1.5 border-r border-[#D1D5DB] whitespace-nowrap">தீர்காம்சம்</th>
                        <th className="p-1.5 border-r border-[#D1D5DB] whitespace-nowrap">ராசி</th>
                        <th className="p-1.5 border-r border-[#D1D5DB] whitespace-nowrap">ராசி ஸ்புடம்</th>
                        <th className="p-1.5 border-r border-[#D1D5DB] whitespace-nowrap">வக்கிரம்</th>
                        <th className="p-1.5 border-r border-[#D1D5DB] whitespace-nowrap">நட்சத்திரம்</th>
                        <th className="p-1.5 whitespace-nowrap">பாதம்</th>
                        </tr>
                    </thead>
                    <tbody>
                        {data.planets.map((p: PlanetData, idx: number) => (
                            <tr key={idx} className="border-b border-[#D1D5DB] last:border-b-0 hover:bg-gray-50 text-gray-700">
                                <td className="p-1.5 border-r border-[#D1D5DB] whitespace-nowrap text-left px-3">
                                    {({
                                        'Suriyan': 'சூரியன்', 'Chandran': 'சந்திரன்', 'Sevvai': 'செவ்வாய்', 'Budhan': 'புதன்',
                                        'Guru': 'குரு', 'Sukran': 'சுக்கிரன்', 'Sani': 'சனி', 'Rahu': 'ராகு', 'Ketu': 'கேது',
                                        'Lagnam': 'லக்கினம்', 'Maandi': 'மாந்தி / குளிகன்'
                                    }[p.tamilName] || p.tamilName)}
                                </td>
                                <td className="p-1.5 border-r border-[#D1D5DB] whitespace-nowrap">{formatSputam(p.longitude)}</td>
                                <td className="p-1.5 border-r border-[#D1D5DB] whitespace-nowrap">{RASI_NAMES_TAMIL[p.rasiIndex]}</td>
                                <td className="p-1.5 border-r border-[#D1D5DB] whitespace-nowrap">{formatSputam(p.siderealLongitude)}</td>
                                <td className="p-1.5 border-r border-[#D1D5DB] whitespace-nowrap">{['Guru', 'Sani'].includes(p.tamilName) ? 'வக்ரம்' : ''}</td>
                                <td className="p-1.5 border-r border-[#D1D5DB] whitespace-nowrap">{data.star || 'அஸ்வினி'}</td>
                                <td className="p-1.5 whitespace-nowrap">{p.navamsamIndex % 4 + 1}</td>
                            </tr>
                        ))}
                    </tbody>
                    </table>
                </div>
              </div>

              {/* DASA TABLE */}
              <div className="mb-6 border border-[#D1D5DB]" style={{ backgroundColor: '#fff' }}>
                <div className="px-3 py-2 text-sm font-medium border-b border-[#D1D5DB] flex justify-between" style={{ backgroundColor: TRADITIONAL_COLORS.tableHeaderBg, color: TRADITIONAL_COLORS.text }}>
                  <span>விம்சோத்தரி தசை</span>
                  <span className="text-gray-500 font-normal">-</span>
                </div>
                <div className="overflow-x-auto">
                  <table className="w-full text-center text-[10px] border-collapse bg-white">
                    <thead>
                      <tr className="border-b border-[#D1D5DB] font-medium" style={{ backgroundColor: '#F3F4F6', color: TRADITIONAL_COLORS.text }}>
                        <th className="p-1.5 border-r border-[#D1D5DB] whitespace-nowrap">தசை புக்தி</th>
                        <th className="p-1.5 border-r border-[#D1D5DB] whitespace-nowrap">தொடக்கம் - முடிவு</th>
                        <th className="p-1.5 border-r border-[#D1D5DB] whitespace-nowrap">தசை புக்தி</th>
                        <th className="p-1.5 whitespace-nowrap">தொடக்கம் - முடிவு</th>
                      </tr>
                    </thead>
                    <tbody>
                      {(() => {
                        const periods = data.dasaPeriods || DASA_MOCK_DATA.map(d => ({ dasa: d.name.split('-')[0], bhukti: d.name.split('-')[1], start: d.start.split(' - ')[0], end: d.start.split(' - ')[1] }));
                        const halfLen = Math.ceil(periods.length / 2);
                        const col1 = periods.slice(0, halfLen);
                        const col2 = periods.slice(halfLen);
                        
                        return col1.map((d: any, i: number) => {
                          const d2 = col2[i];
                          return (
                            <tr key={i} className="border-b border-[#D1D5DB] last:border-0 hover:bg-gray-50 text-gray-700">
                              <td className="p-1.5 border-r border-[#D1D5DB] font-medium whitespace-nowrap">{d.dasa}-{d.bhukti}</td>
                              <td className="p-1.5 border-r border-[#D1D5DB] whitespace-nowrap">{d.start} - {d.end}</td>
                              <td className="p-1.5 border-r border-[#D1D5DB] font-medium whitespace-nowrap">{d2 ? `${d2.dasa}-${d2.bhukti}` : '-'}</td>
                              <td className="p-1.5 whitespace-nowrap">{d2 ? `${d2.start} - ${d2.end}` : '-'}</td>
                            </tr>
                          );
                        });
                      })()}
                    </tbody>
                  </table>
                </div>
              </div>

              <div className="text-center text-[10px] text-gray-600 font-medium italic mt-8 p-4 bg-gray-50/50 rounded border border-gray-200">
                சூ-சூரியன், சந்-சந்திரன், செ-செவ்வாய், பு-புதன், ரா-ராகு, கே-கேது, சு-சுக்கிரன், வி-வியாழன், சனி-சனி
              </div>

          </div>
          
        </div>

        <style>{`
          @media print {
            body * {
              visibility: hidden;
            }
            .custom-print-container, .custom-print-container * {
              visibility: visible;
            }
            .custom-print-container {
              position: absolute;
              left: 0;
              top: 0;
              width: 100%;
              background-color: ${TRADITIONAL_COLORS.bg} !important;
              -webkit-print-color-adjust: exact;
              print-color-adjust: exact;
            }
          }
        `}</style>

      </div>
    </div>
  );
};
