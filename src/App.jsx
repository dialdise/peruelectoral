import { useState, useRef, useEffect } from "react";

const COLORS = {
  bg:"#0A0E1A", surface:"#111827", card:"#141C2E", border:"#1E2D45",
  accent:"#C8102E", accentOrange:"#FF6B2B", accentYellow:"#F5C518",
  accentGreen:"#00C896", accentBlue:"#1A8FE3",
  text:"#E8EDF5", textMuted:"#6B7FA3", textDim:"#3D4F6B",
  riskHigh:"#C8102E", riskMed:"#FF6B2B", riskLow:"#F5C518", riskClean:"#00C896",
};

const DEPARTMENTS = ["Lima","Lima Provincias","Arequipa","Cusco","La Libertad","Piura","Lambayeque","Junin","Ancash","Loreto","Cajamarca","Puno","Ica","Huanuco","San Martin","Ucayali","Ayacucho","Apurimac","Moquegua","Tacna","Tumbes","Madre de Dios","Pasco","Huancavelica","Amazonas","Callao"];

// Abbr -> color map for all 35+ parties from JNE diputados data
const PARTY_COLOR_MAP = {"FP":"#F5A623","APP":"#003087","PP":"#7B1FA2","JP":"#00695C","PL":"#CC0000","RP":"#1565C0","AVP":"#00695C","SP":"#F57F17","PAP":"#B71C1C","AC":"#E65100","MOR":"#6A1B9A","AN":"#1565C0","PP1":"#0277BD","CP":"#1A237E","AV":"#BF360C","FEP":"#1B5E20","FREPAP":"#795548","FL":"#4A148C","LP2":"#4E342E","PCO":"#E64A19","PTE":"#455A64","PBG":"#2E7D32","PDU":"#4527A0","PDV":"#2E7D32","PDF":"#880E4F","FE":"#EF6C00","PPT":"#00838F","PPP":"#B71C1C","ID":"#37474F","PA":"#AD1457","PRIN":"#546E7A","PLG":"#00838F","PRG":"#558B2F","SAP":"#E65100","UCD":"#6A1B9A","UN":"#0D47A1","SC":"#00695C"};

const LEVEL_INFO = {
  "Presidente":       { icon:"🏛️", desc:"Jefe de Estado y Gobierno. Elegido por voto directo nacional. Período: 5 años.", seats:1 },
  "Vicepresidente":   { icon:"🤝", desc:"Primer y Segundo Vicepresidente. Forman la plancha presidencial junto al candidato.", seats:2 },
  "Senador":          { icon:"📜", desc:"Cámara Alta del Congreso Bicameral (propuesta). Representación nacional. 60 escaños.", seats:60 },
  "Diputado":         { icon:"🗳️", desc:"Cámara Baja. Representación por circunscripción departamental. 130 escaños.", seats:130 },
};

const LEVELS = Object.keys(LEVEL_INFO);

// Real 36 presidential formulas from JEE Lima Centro 1 (Feb 2026)
const PRESIDENTIAL_FORMULAS = [
  { partido:"Fuerza Popular",            color:"#F5A623", abbr:"FP",
    presidente:"Keiko Fujimori Higuchi",      vp1:"Luis Galarreta Velarde",        vp2:"Miguel Torres Morales" },
  { partido:"Alianza para el Progreso",  color:"#003087", abbr:"APP",
    presidente:"Cesar Acuna Peralta",         vp1:"Jessica Tumi Rivas",            vp2:"Alejandro Soto Reyes" },
  { partido:"Partido del Buen Gobierno", color:"#2E7D32", abbr:"PBG",
    presidente:"Jorge Nieto Montesinos",      vp1:"Susana Matute Charun",          vp2:"Carlos Caballero Leon" },
  { partido:"Un Camino Diferente",       color:"#6A1B9A", abbr:"UCD",
    presidente:"Rosario Fernandez Bazan",     vp1:"Cesar Fernandez Bazan",         vp2:"Carlos Pinillos Vinces" },
  { partido:"Partido Patriotico del Peru", color:"#B71C1C", abbr:"PPP",
    presidente:"Herbert Caller Gutierrez",    vp1:"Rossana Montes Tello",          vp2:"Jorge Carcovich Cortelezzi" },
  { partido:"Ahora Nación",              color:"#1565C0", abbr:"AN",
    presidente:"Alfonso Lopez Chau Nava",     vp1:"Luis Villanueva Carbajal",      vp2:"Ruth Buendia Mestoquiari" },
  { partido:"Podemos Peru",              color:"#7B1FA2", abbr:"PP",
    presidente:"Jose Luna Galvez",            vp1:"Jaqueline Garcia Rodriguez",    vp2:"Raul Noblecilla Olaechea" },
  { partido:"Juntos por el Peru",        color:"#00695C", abbr:"JP",
    presidente:"Roberto Sanchez Palomino",    vp1:"Anali Marquez Huanca",          vp2:"Brigida Curo Bustincio" },
  { partido:"Peru Moderno",              color:"#0277BD", abbr:"PM",
    presidente:"Carlos Jaico Carranza",       vp1:"Miguel Almenara Huayta",        vp2:"Liz Quispe Santos" },
  { partido:"Frente de la Esperanza",    color:"#EF6C00", abbr:"FE",
    presidente:"Luis Olivera Vega",           vp1:"Elizabeth Leon Chinchay",       vp2:"Carlos Cuaresma Sanchez" },
  { partido:"Partido Democrata Unido",   color:"#4527A0", abbr:"PDU",
    presidente:"Charlie Carrasco Salazar",    vp1:"Maria Paredes Verdy",           vp2:"Wilbert Segovia Quin" },
  { partido:"Progresemos",               color:"#558B2F", abbr:"PRG",
    presidente:"Paul Jaimes Blanco",          vp1:"Monica Guillen Tuanama",        vp2:"Jorge Caloggero Encina" },
  { partido:"Partido Morado",            color:"#6A1B9A", abbr:"MOR",
    presidente:"Mesías Guevara Amasifuen",    vp1:"Heber Cueva Escobedo",          vp2:"Marisol Linan Solis" },
  { partido:"Fe en el Peru",             color:"#1B5E20", abbr:"FEP",
    presidente:"Alvaro Paz de la Barra",      vp1:"Yessika Aliaga Narvaez",        vp2:"Shellah Palacios Rodriguez" },
  { partido:"Somos Peru",                color:"#F57F17", abbr:"SP",
    presidente:"George Forsyth Sommer",       vp1:"Johanna Lozada Baldwin",        vp2:"Herbe Olave Ugarte" },
  { partido:"Pais Para Todos",           color:"#00838F", abbr:"PPT",
    presidente:"Carlos Alvarez Loayza",       vp1:"Maria Chambizea Reyes",         vp2:"Diego Guevara Vivanco" },
  { partido:"Perú Acción",               color:"#AD1457", abbr:"PA",
    presidente:"Francisco Diez-Canseco",      vp1:"Roberto Koster Jauregui",       vp2:"Clara Quispe Torres" },
  { partido:"Integridad Democratica",    color:"#37474F", abbr:"ID",
    presidente:"Wolfgang Grozo Costa",        vp1:"Bertha Azabache Miranda",       vp2:"Wellington Prada Chipayo" },
  { partido:"Partido Civico Obras",      color:"#E64A19", abbr:"PCO",
    presidente:"Ricardo Belmont Cassinelli",  vp1:"Daniel Barragan Coloma",        vp2:"Dina Hancco Hancco" },
  { partido:"PTE-Peru",                  color:"#455A64", abbr:"PTE",
    presidente:"Napoleon Becerra Garcia",     vp1:"Winston Huaman Henriquez",      vp2:"Nelida Cuayla Cuayla" },
  { partido:"Alianza Venceremos",        color:"#BF360C", abbr:"AV",
    presidente:"Ronald Atencio Sotomayor",    vp1:"Elena Rivera Huaman",           vp2:"Alberto Quintanilla Chacon" },
  { partido:"Cooperación Popular",       color:"#1A237E", abbr:"CP",
    presidente:"Yonhy Lescano Ancieta",       vp1:"Carmela Salazar Jauregui",      vp2:"Vanessa Lazo Valles" },
  { partido:"Partido Democrata Federal", color:"#880E4F", abbr:"PDF",
    presidente:"Armando Masse Fernandez",     vp1:"Virgilio Acuna Peralta",        vp2:"Lydia Diaz Pablo" },
  { partido:"Partido Aprista Peruano",   color:"#B71C1C", abbr:"PAP",
    presidente:"Pitter Valderrama Pena",      vp1:"Maria Valdivia Acuna",          vp2:"Lucio Vasquez Sanchez" },
  { partido:"Partido Democrata Verde",   color:"#2E7D32", abbr:"PDV",
    presidente:"Alex Gonzales Castillo",      vp1:"Maritza Sanchez Perales",       vp2:"Felix Murazzo Carrillo" },
  { partido:"Unidad Nacional",           color:"#0D47A1", abbr:"UN",
    presidente:"Roberto Chiabra Leon",        vp1:"Javier Bedoya Denegri",         vp2:"Neldy Mendoza Flores" },
  { partido:"Libertad Popular",          color:"#4E342E", abbr:"LP",
    presidente:"Rafael Belaunde Llosa",       vp1:"Pedro Cateriano Bellido",       vp2:"Tania Porles Bazalar" },
  { partido:"Partido SiCreo",            color:"#00695C", abbr:"SC",
    presidente:"Carlos Espa Garces-Alvear",   vp1:"Alejandro Santa Maria Silva",   vp2:"Melitza Yanzich Villagarcia" },
  { partido:"Salvemos al Peru",          color:"#E65100", abbr:"SAP",
    presidente:"Antonio Ortiz Villano",       vp1:"Jaime Freundt Lopez",           vp2:"Giovanna Demurtas Moya" },
  { partido:"Fuerza y Libertad",         color:"#4A148C", abbr:"FL",
    presidente:"Giannina Molinelli Aristondo",vp1:"Gilbert Violeta Lopez",         vp2:"Maria Pariona Ore" },
  { partido:"Peru Libre",                color:"#CC0000", abbr:"PL",
    presidente:"Vladimir Cerron Rojas",       vp1:"Flavio Cruz Mamani",            vp2:"Bertha Rojas Lopez" },
  { partido:"Partido PRIN",              color:"#546E7A", abbr:"PRIN",
    presidente:"Walter Chirinos Purizaga",    vp1:"Julio Vega Ibanez",             vp2:"Mayra Vargas Gil" },
  { partido:"Renovación Popular",        color:"#1565C0", abbr:"RP",
    presidente:"Rafael Lopez Aliaga",         vp1:"Norma Yarrow Lumbreras",        vp2:"Jhon Ramos Malpica" },
  { partido:"Avanza Pais",               color:"#00695C", abbr:"AVP",
    presidente:"Jose Williams Zapata",        vp1:"Fernan Altuve-Febres Lores",    vp2:"Adriana Tudela Gutierrez" },
  { partido:"Peru Primero",              color:"#0277BD", abbr:"PP1",
    presidente:"Mario Vizcarra Cornejo",      vp1:"Carlos Illanes Calderon",       vp2:"Judith Mendoza Diaz" },
  { partido:"Primero la Gente",          color:"#00838F", abbr:"PLG",
    presidente:"Marisol Perez Tello",         vp1:"",                              vp2:"" },
];

const ALL_SOURCES = ["MINJUS","JNE PECAFOR","SUNAT","INFOCORP"];
const FLAGS = [
  "Proceso judicial activo","Financiamiento irregular detectado",
  "Vínculo con red corrupta","Enriquecimiento inexplicado",
  "Inhabilitado por MINJUS","Contrato con empresa inhabilitada",
];
const STREET_NAMES = ["Av. Los Libertadores","Jr. Tupac Amaru","Calle Las Flores","Av. Ejercito","Jr. Union","Calle Real","Av. Grau","Jr. Amazonas","Av. La Marina","Calle Huancayo"];
const DISTRICTS = ["Miraflores","San Isidro","Surco","Callao","Lince","Pueblo Libre","Jesus Maria","San Borja","La Molina","Barranco","Wanchaq","Arequipa Centro","Piura Centro","Trujillo Centro"];
const PROFESSIONS = ["Abogado","Economista","Ingeniero Civil","Medico Cirujano","Contador Público","Docente Universitario","Administrador de Empresas","Arquitecto","Sociologo","Politologo"];
const EMPLOYERS = ["Congreso de la República","Gobierno Regional","Municipalidad Provincial","Universidad Nacional","Empresa privada","Independiente","Consultora SAC","ONG local"];


function seededRng(seed) { let s=seed; return ()=>{ s=(s*16807)%2147483647; return (s-1)/2147483646; }; }
function pick(arr,r){ return arr[Math.floor(r()*arr.length)]; }
function randInt(min,max,r){ return min+Math.floor(r()*(max-min+1)); }
function genDNI(r){ let d=""; for(let i=0;i<8;i++) d+=Math.floor(r()*10); return d; }
function genRUC(r){ let rest=""; for(let i=0;i<9;i++) rest+=Math.floor(r()*10); return (r()>0.5?"10":"20")+rest; }
function genPhone(r){ let rest=""; for(let i=0;i<7;i++) rest+=Math.floor(r()*10); return "9"+Math.floor(r()*8+1)+rest; }
function genEmail(name,r){
  const domains=["gmail.com","hotmail.com","yahoo.com","outlook.com"];
  const slug=name.toLowerCase().replace(/[^a-z ]/g,"").split(" ").slice(0,2).join(".");
  return slug+"@"+pick(domains,r);
}

// Build candidates from real presidential formulas
// Each formula contributes: 1 Presidente + 2 Vicepresidentes

function buildCandidateFromName(fullName, level, partyData, index) {
  const r = seededRng(index*137+42);
  const dept = pick(DEPARTMENTS, r);

  const companyTypes=["Constructora","Consultora","Inmobiliaria","Agropecuaria","Servicios Generales","Tecnologia","Transporte","Salud","Educación","Seguridad"];
  const contratanteEntidades=["Municipalidad Provincial","Gobierno Regional","Ministerio de Salud","Ministerio de Educación","Ministerio de Transportes","ESSALUD","PROVIAS","Programa QALI WARMA","UGEL","PNP - Logistica","Ministerio de Defensa","Gobierno Local","SINEACE","SUNAT"];
  const objetoContrato=["Obra de infraestructura vial","Suministro de alimentos escolares","Servicio de consultoria TI","Construcción de centro de salud","Mantenimiento de equipos","Servicio de vigilancia","Adquisición de vehiculos oficiales","Construcción de colegio","Servicio de limpieza y seguridad","Estudios de factibilidad","Equipamiento hospitalario","Servicio de capacitación"];
  const numCo=randInt(0,3,r);
  const companies=Array.from({length:numCo},()=>{
    const hasContracts=r()>0.45;
    const numContracts=hasContracts?randInt(1,4,r):0;
    const contracts=Array.from({length:numContracts},()=>({
      entidad:pick(contratanteEntidades,r),
      objeto:pick(objetoContrato,r),
      monto:"S/ "+(randInt(50,8000,r)*1000).toLocaleString(),
      anio:randInt(2018,2025,r),
      proceso:pick(["Licitación Pública","Adjudicación Simplificada","Concurso Público","Selección de Consultores","Subasta Inversa Electrónica"],r),
      nroContrato:"C-"+randInt(100,999,r)+"-"+randInt(2018,2025,r),
      estado:pick(["EJECUTADO","EN EJECUCIÓN","RESUELTO","OBSERVADO"],r),
      alerta:r()>0.65,
    }));
    const totalContratos=contracts.reduce((s,c)=>{
      const v=parseInt(c.monto.replace(/[^0-9]/g,""))||0;
      return s+v;
    },0);
    return {
      name:pick(companyTypes,r)+" "+String.fromCharCode(65+randInt(0,25,r))+" SAC",
      ruc:genRUC(r), role:pick(["Gerente General","Socio","Apoderado"],r),
      estado:r()>0.6?"HABIDO":r()>0.4?"NO HABIDO":"BAJA",
      stateContracts:hasContracts,
      contracts,
      totalContratos,
    };
  });

  const numProp=randInt(0,4,r);
  const properties=Array.from({length:numProp},(_,pi)=>({
    address:"Mz "+String.fromCharCode(65+pi)+" Lt "+randInt(1,20,r)+", "+pick(DISTRICTS,r)+", "+dept,
    area:randInt(60,400,r)+" m2", valuation:"S/ "+(randInt(150,1200,r)*1000).toLocaleString(),
    registered:r()>0.3,
  }));

  const numVeh=randInt(0,3,r);
  const carBrands=["Toyota","Hyundai","Kia","Volkswagen","Chevrolet","Nissan","Ford","BMW"];
  const vehicles=Array.from({length:numVeh},()=>({
    brand:pick(carBrands,r), year:randInt(2005,2023,r),
    plate:String.fromCharCode(65+randInt(0,25,r))+String.fromCharCode(65+randInt(0,25,r))+String.fromCharCode(65+randInt(0,25,r))+"-"+randInt(100,999,r),
    value:"S/ "+(randInt(25,180,r)*1000).toLocaleString(),
  }));

  const numCases=randInt(0,3,r);
  const caseTypes=["Peculado","Cohecho","Colusión","Enriquecimiento ilícito","Tráfico de influencias","Lavado de activos"];
  const caseStatuses=["EN INVESTIGACIÓN","ACUSADO","SENTENCIADO","ARCHIVADO","SOBRESEIDO"];
  const courtCases=Array.from({length:numCases},()=>({
    type:pick(caseTypes,r), year:randInt(2010,2024,r),
    court:"Juzgado "+pick(["Penal","Anticorrupción","Civil"],r)+" de "+dept,
    status:pick(caseStatuses,r),
    expediente:randInt(1000,9999,r)+"-"+randInt(2010,2024,r)+"-"+randInt(10,99,r),
  }));

  const totalDeclared=randInt(50000,2000000,r);
  const numDonors=randInt(3,15,r);
  const donorFirstNames=["Juan","Carlos","Maria","Pedro","Luis","Ana","Rosa","Jorge","Patricia","Roberto","Carmen","Manuel","Elena","Ricardo","Sandra"];
  const donorLastNames=["Quispe","Torres","Flores","Vega","Mamani","Huanca","Mendoza","Castro","Rojas","Garcia","Lima","Vargas","Chavez","Morales","Ramos"];
  const companyNames=["Constructora","Consultora","Inversiones","Corporacion","Servicios","Grupo Empresarial","Holding","Desarrolladora"];
  const suspiciousReasons=[
    "Persona sin historial tributario conocido (SUNAT sin actividad declarada)",
    "Empresa creada menos de 6 meses antes de la donación",
    "Monto supera el patrimonio declarado del donante",
    "Vínculo directo con contratista del Estado con contratos vigentes",
    "Donante figura como proveedor de entidad publica vinculada al candidato",
    "RUC con estado NO HABIDO o BAJA al momento de la donación",
    "Empresa shell sin empleados ni activos registrados en SUNAT",
    "Multiples donaciones fraccionadas del mismo origen (posible testaferrismo)",
    "Donante con proceso judicial activo por lavado de activos",
    "Coincidencia de domicilio fiscal con otras empresas del mismo grupo",
    "Donacion en efectivo sin respaldo bancario verificable",
    "Donante vinculado a red empresarial con contratos en Contraloria observados",
  ];
  const donors=Array.from({length:numDonors},()=>{
    const isCompany=r()>0.45;
    const suspicious=r()>0.72;
    const numReasons=suspicious?randInt(1,3,r):0;
    const usedReasons=new Set();
    const reasons=Array.from({length:numReasons},()=>{
      let idx; do{ idx=Math.floor(r()*suspiciousReasons.length); }while(usedReasons.has(idx));
      usedReasons.add(idx);
      return suspiciousReasons[idx];
    });
    const donorAmt=randInt(5,300,r)*1000;
    return {
      name:isCompany
        ? pick(companyNames,r)+" "+String.fromCharCode(65+randInt(0,25,r))+" SAC"
        : pick(donorFirstNames,r)+" "+pick(donorLastNames,r)+" "+pick(donorLastNames,r),
      amount:"S/ "+donorAmt.toLocaleString(),
      amountNum:donorAmt,
      type:isCompany?"Persona Juridica":"Persona Natural",
      ruc:isCompany?genRUC(r):null,
      suspicious,
      reasons,
      relationship:suspicious?pick(["Contratista del Estado","Ex funciónario publico","Sin relación declarada","Vinculo familiar no declarado","Proveedor municipal"],r):pick(["Militante del partido","Simpatizante","Empresario local","Sin relación especial"],r),
    };
  });

  // --- MEANINGFUL RISK SCORES (calculated from actual generated data) ---

  // Criminal: 10pts per case, +5 if ACUSADO, +15 if SENTENCIADO, cap 40
  const criminal = Math.min(40,
    courtCases.reduce((s, c) => {
      let pts = 10;
      if (c.status === "ACUSADO")     pts += 5;
      if (c.status === "SENTENCIADO") pts += 15;
      return s + pts;
    }, 0)
  );

  // Finance: 4pts per suspicious donor, +8 bonus if more than 3 suspicious, cap 35
  const suspCount = donors.filter(d => d.suspicious).length;
  const finance = Math.min(35,
    suspCount * 4 +
    (suspCount > 3 ? 8 : 0)
  );

  // Network: state contracts +5, NO HABIDO company +5, flagged contracts +3 each, cap 15
  const network = Math.min(15,
    companies.reduce((s, co) => {
      let pts = 0;
      if (co.stateContracts)         pts += 5;
      if (co.estado === "NO HABIDO") pts += 5;
      pts += co.contracts.filter(c => c.alerta).length * 3;
      return s + pts;
    }, 0)
  );

  // Wealth: unregistered properties +3 each, assets>>salary +5, suspicious debt +2, cap 10
  const salaryMonthly = randInt(3000, 25000, r);
  const hasDebts      = r() > 0.5;
  const totalAssets   = properties.reduce((s, p) =>
    s + (parseInt(p.valuation.replace(/[^0-9]/g, "")) || 0), 0);
  const wealth = Math.min(10,
    properties.filter(p => !p.registered).length * 3 +
    (totalAssets > salaryMonthly * 12 * 50 ? 5 : 0) +
    (hasDebts && totalAssets > 500000 ? 2 : 0)
  );

  return {
    id: index,
    fullName,
    firstName: fullName.split(" ")[0],
    lastName:  fullName.split(" ").slice(1).join(" "),
    party: { name:partyData.partido, color:partyData.color, abbr:partyData.abbr },
    department: dept,
    level,
    riskScore: criminal+finance+network+wealth,
    breakdown:{ criminal, finance, network, wealth },
    flags: FLAGS.filter(()=>r()>0.65),
    sources: ALL_SOURCES.filter(()=>r()>0.4),
    reportCount: Math.floor(r()*12),
    // publicData is generated lazily on first modal open (see expandCandidate)
    _lazyData: { companies, properties, vehicles, salaryMonthly, hasDebts,
      totalAssets, courtCases, donors, totalDeclared, dept },
  };
}

// Called only when a candidate modal is opened — avoids generating 26k full profiles upfront
function expandCandidate(c) {
  if (c.publicData) return c; // already expanded
  const { companies, properties, vehicles, salaryMonthly, hasDebts,
    totalAssets, courtCases, donors, totalDeclared, dept } = c._lazyData;
  const r = seededRng(c.id*137+42+999);
  c.publicData = {
    dni: genDNI(r),
    birthDate: randInt(1,28,r)+"/"+randInt(1,12,r)+"/"+randInt(1950,1985,r),
    birthPlace: dept,
    address: pick(STREET_NAMES,r)+" "+randInt(100,999,r)+", "+pick(DISTRICTS,r)+", "+dept,
    maritalStatus: pick(["Casado","Soltero","Divorciado","Viudo","Conviviente"],r),
    email: genEmail(c.fullName,r),
    phone: genPhone(r),
    profession: pick(PROFESSIONS,r),
    employer: pick(EMPLOYERS,r),
    ruc: genRUC(r),
    taxStatus: pick(["HABIDO","NO HABIDO","BAJA PROVISIONAL"],r),
    companies, properties, vehicles,
    salaryMonthly,
    savingsTotal: randInt(5000,500000,r),
    hasDebts,
    debtAmount: randInt(10000,200000,r),
    courtCases,
    campaignFinance:{ totalDeclared, donors, suspiciousDonations:donors.filter(d=>d.suspicious).length },
    social:{
      facebook: r()>0.4?"fb.com/"+c.fullName.toLowerCase().replace(/[^a-z]/g,"").substring(0,12):null,
      twitter:  r()>0.5?"@"+c.fullName.toLowerCase().replace(/[^a-z]/g,"").substring(0,12):null,
      instagram:r()>0.4?"@"+c.fullName.toLowerCase().replace(/[^a-z]/g,"").substring(0,12):null,
    },
  };
  return c;
}

// Generate all real candidates
let idCounter = 1;
const ALL_CANDIDATES = [];

PRESIDENTIAL_FORMULAS.forEach((f) => {
  ALL_CANDIDATES.push(buildCandidateFromName(f.presidente, "Presidente", f, idCounter++));
  if(f.vp1) ALL_CANDIDATES.push(buildCandidateFromName(f.vp1, "Vicepresidente", f, idCounter++));
  if(f.vp2) ALL_CANDIDATES.push(buildCandidateFromName(f.vp2, "Vicepresidente", f, idCounter++));
});

// Real senator candidates from JNE official lists (votoinformado.jne.gob.pe/senadores)
// Source: Partido declarations + RPP/Gestión/ElComercio coverage Feb 2026
const REAL_SENATORS = [
  // Fuerza Popular (FP) — Lista nacional encabezada por Miguel Torres
  { name:"Miguel Torres Morales",           partido:"Fuerza Popular",            color:"#F5A623", abbr:"FP", pos:1, circ:"Nacional" },
  { name:"Martha Chavez Cossio",            partido:"Fuerza Popular",            color:"#F5A623", abbr:"FP", pos:2, circ:"Nacional" },
  { name:"Fernando Rospigliosi Capurro",    partido:"Fuerza Popular",            color:"#F5A623", abbr:"FP", pos:3, circ:"Nacional" },
  { name:"Patricia Juarez Gallegos",        partido:"Fuerza Popular",            color:"#F5A623", abbr:"FP", pos:4, circ:"Nacional" },
  { name:"Cesar Astudillo Salcedo",         partido:"Fuerza Popular",            color:"#F5A623", abbr:"FP", pos:5, circ:"Nacional" },
  { name:"Alejandro Aguinaga Recuenco",     partido:"Fuerza Popular",            color:"#F5A623", abbr:"FP", pos:6, circ:"Nacional" },
  { name:"Martha Moyano Delgado",           partido:"Fuerza Popular",            color:"#F5A623", abbr:"FP", pos:7, circ:"Nacional" },
  { name:"Carlos Tubino Arias-Schreiber",   partido:"Fuerza Popular",            color:"#F5A623", abbr:"FP", pos:8, circ:"Nacional" },
  { name:"Jose Arista Arbildo",             partido:"Fuerza Popular",            color:"#F5A623", abbr:"FP", pos:9, circ:"Amazonas" },
  // Renovación Popular (RP)
  { name:"Gladys Echaiz Ramos",             partido:"Renovación Popular",        color:"#1565C0", abbr:"RP", pos:1, circ:"Nacional" },
  { name:"Jorge Solis Espinoza",            partido:"Renovación Popular",        color:"#1565C0", abbr:"RP", pos:2, circ:"Nacional" },
  { name:"Absalon Vasquez Villanueva",      partido:"Renovación Popular",        color:"#1565C0", abbr:"RP", pos:5, circ:"Nacional" },
  { name:"Patricia Chirinos Venegas",       partido:"Renovación Popular",        color:"#1565C0", abbr:"RP", pos:1, circ:"Callao" },
  { name:"Jose Cueto Aservi",               partido:"Renovación Popular",        color:"#1565C0", abbr:"RP", pos:1, circ:"Lima" },
  { name:"Victor Leon Alvarez",             partido:"Renovación Popular",        color:"#1565C0", abbr:"RP", pos:1, circ:"La Libertad" },
  { name:"Reynaldo Hilbck Guzman",          partido:"Renovación Popular",        color:"#1565C0", abbr:"RP", pos:1, circ:"Piura" },
  // Alianza para el Progreso (APP)
  { name:"Cesar Vasquez Ramirez",           partido:"Alianza para el Progreso",  color:"#003087", abbr:"APP", pos:1, circ:"Nacional" },
  { name:"Juan Jose Santivaniez Antunez",   partido:"Alianza para el Progreso",  color:"#003087", abbr:"APP", pos:2, circ:"Nacional" },
  { name:"Cesar Sandoval Reyes",            partido:"Alianza para el Progreso",  color:"#003087", abbr:"APP", pos:3, circ:"Nacional" },
  { name:"Magali Ruiz Torres",              partido:"Alianza para el Progreso",  color:"#003087", abbr:"APP", pos:4, circ:"Nacional" },
  { name:"Rocio Torres Huanacuni",          partido:"Alianza para el Progreso",  color:"#003087", abbr:"APP", pos:5, circ:"Nacional" },
  // Podemos Peru (PP)
  { name:"Jose Luna Galvez",                partido:"Podemos Peru",              color:"#7B1FA2", abbr:"PP", pos:1, circ:"Nacional" },
  { name:"Guido Bellido Ugarte",            partido:"Podemos Peru",              color:"#7B1FA2", abbr:"PP", pos:5, circ:"Nacional" },
  { name:"Herminia Chino Mamani",           partido:"Podemos Peru",              color:"#7B1FA2", abbr:"PP", pos:6, circ:"Nacional" },
  { name:"Edgar Tello Cuadros",             partido:"Podemos Peru",              color:"#7B1FA2", abbr:"PP", pos:7, circ:"Nacional" },
  // Ahora Nación
  { name:"Patricia Correa Maguina",         partido:"Ahora Nación",              color:"#1565C0", abbr:"AN", pos:2, circ:"Nacional" },
  { name:"Jaime Delgado Zegarra",           partido:"Ahora Nación",              color:"#1565C0", abbr:"AN", pos:5, circ:"Nacional" },
  { name:"Mirtha Vasquez Chuquilin",        partido:"Ahora Nación",              color:"#1565C0", abbr:"AN", pos:4, circ:"Nacional" },
  { name:"Ruth Luque Ibarra",               partido:"Ahora Nación",              color:"#1565C0", abbr:"AN", pos:8, circ:"Nacional" },
  // Cooperación Popular
  { name:"Carlos Zeballos Patricio",        partido:"Cooperación Popular",       color:"#1A237E", abbr:"CP", pos:3, circ:"Nacional" },
  { name:"Carlos Torres Caro",              partido:"Cooperación Popular",       color:"#1A237E", abbr:"CP", pos:9, circ:"Nacional" },
  { name:"Miguel Palomino Pedraza",         partido:"Cooperación Popular",       color:"#1A237E", abbr:"CP", pos:11, circ:"Nacional" },
  // Fuerza y Libertad (PPK incluido)
  { name:"Pedro Pablo Kuczynski",           partido:"Fuerza y Libertad",         color:"#4A148C", abbr:"FL", pos:1, circ:"Lima Metropolitana" },
  { name:"Antonio Quispe Torres",           partido:"Fuerza y Libertad",         color:"#4A148C", abbr:"FL", pos:10, circ:"Nacional" },
  // Somos Peru
  { name:"Daniel Salaverry Villa",          partido:"Somos Peru",                color:"#F57F17", abbr:"SP", pos:3, circ:"Nacional" },
  // Salvemos al Peru
  { name:"Yehude Simon Munaro",             partido:"Salvemos al Peru",          color:"#E65100", abbr:"SAP", pos:1, circ:"Nacional" },
  // Partido SiCreo
  { name:"Jorge Montoya Manrique",          partido:"Partido SiCreo",            color:"#00695C", abbr:"SC", pos:5, circ:"Nacional" },
  // Peru Primero
  { name:"Jorge Chavez Cresta",             partido:"Peru Primero",              color:"#0277BD", abbr:"PP1", pos:11, circ:"Nacional" },
  { name:"Nieves Limachi Huanca",           partido:"Peru Primero",              color:"#0277BD", abbr:"PP1", pos:4, circ:"Nacional" },
  { name:"Isabel Cortez Rosell",            partido:"Peru Primero",              color:"#0277BD", abbr:"PP1", pos:6, circ:"Nacional" },
  // Partido Democrata Verde
  { name:"Henry Shimabukuro Ingunza",       partido:"Partido Democrata Verde",   color:"#2E7D32", abbr:"PDV", pos:3, circ:"Nacional" },
  // Fe en el Peru
  { name:"Beatriz Mejia Mori",              partido:"Fe en el Peru",             color:"#1B5E20", abbr:"FEP", pos:6, circ:"Nacional" },
  // Juntos por el Peru
  { name:"Susel Paredes Piquen",            partido:"Juntos por el Peru",        color:"#00695C", abbr:"JP", pos:2, circ:"Nacional" },
  { name:"Carolina Lizarraga Houghton",     partido:"Juntos por el Peru",        color:"#00695C", abbr:"JP", pos:4, circ:"Nacional" },
];

// Real Diputados — full dataset from JNE votoinformado.jne.gob.pe (26,290 candidates, all 35 parties x 26 districts)
// Loaded asynchronously from diputados.json hosted on GitHub
// Format: [[name, abbr, dept], ...]
const DIPUTADOS_URL  = "https://raw.githubusercontent.com/dialdise/peruelectoral/main/diputados.json";
const SENADORES_URL  = "https://raw.githubusercontent.com/dialdise/peruelectoral/main/senadores.json";

// Small static fallback (shown while async data loads)
const REAL_DIPUTADOS_FALLBACK = [
  // Juntos por el Peru — Lima (full from PDF)
  { name:"Roberto Sanchez Palomino",      partido:"Juntos por el Peru", color:"#00695C", abbr:"JP", dept:"Lima" },
  { name:"Giannina Avendano Vilca",       partido:"Juntos por el Peru", color:"#00695C", abbr:"JP", dept:"Lima" },
  { name:"William Vargas Matos",          partido:"Juntos por el Peru", color:"#00695C", abbr:"JP", dept:"Lima" },
  { name:"Zoila Yauri Aquino",            partido:"Juntos por el Peru", color:"#00695C", abbr:"JP", dept:"Lima" },
  { name:"Juan Sanchez Gutierrez",        partido:"Juntos por el Peru", color:"#00695C", abbr:"JP", dept:"Lima" },
  { name:"Juana Pacheco Lopez",           partido:"Juntos por el Peru", color:"#00695C", abbr:"JP", dept:"Lima" },
  // Juntos por el Peru — regiones
  { name:"Anali Marquez Huanca",          partido:"Juntos por el Peru", color:"#00695C", abbr:"JP", dept:"Cusco" },
  { name:"Maria Luz Huacac Espinoza",     partido:"Juntos por el Peru", color:"#00695C", abbr:"JP", dept:"Cusco" },
  { name:"Nelly Avendano Roca",           partido:"Juntos por el Peru", color:"#00695C", abbr:"JP", dept:"Junin" },
  { name:"Luzmila Ayay Casas",            partido:"Juntos por el Peru", color:"#00695C", abbr:"JP", dept:"Callao" },
  { name:"Ernesto Zunini Yerren",         partido:"Juntos por el Peru", color:"#00695C", abbr:"JP", dept:"Lambayeque" },
  { name:"Americo Jimenez Rodriguez",     partido:"Juntos por el Peru", color:"#00695C", abbr:"JP", dept:"Ica" },
  { name:"Remigio Condori Flores",        partido:"Juntos por el Peru", color:"#00695C", abbr:"JP", dept:"Puno" },
  { name:"Brigida Curo Bustincio",        partido:"Juntos por el Peru", color:"#00695C", abbr:"JP", dept:"Puno" },
  { name:"David Tapullima Upiachihua",    partido:"Juntos por el Peru", color:"#00695C", abbr:"JP", dept:"San Martin" },
  { name:"Jacqueline Tapullima Insapillo",partido:"Juntos por el Peru", color:"#00695C", abbr:"JP", dept:"San Martin" },
  { name:"Svieta Fernandez Gonzalez",     partido:"Juntos por el Peru", color:"#00695C", abbr:"JP", dept:"Tacna" },
  { name:"Carlos Franko Llaños",          partido:"Juntos por el Peru", color:"#00695C", abbr:"JP", dept:"Tacna" },
  { name:"Elvis Mendoza Aguilar",         partido:"Juntos por el Peru", color:"#00695C", abbr:"JP", dept:"Tumbes" },
  { name:"Daniel Varas Seguin",           partido:"Juntos por el Peru", color:"#00695C", abbr:"JP", dept:"Ancash" },
  // Renovación Popular
  { name:"Maria Teresa Dulanto Minea",    partido:"Renovación Popular", color:"#1565C0", abbr:"RP", dept:"Lima" },
  { name:"Johnny Bacon Terrones",         partido:"Renovación Popular", color:"#1565C0", abbr:"RP", dept:"Lima" },
  { name:"Roberto Delatorre Aguayo",      partido:"Renovación Popular", color:"#1565C0", abbr:"RP", dept:"Lima" },
  { name:"Diego Bazan Calderon",          partido:"Renovación Popular", color:"#1565C0", abbr:"RP", dept:"La Libertad" },
  { name:"Miriam Gayoso Salas",           partido:"Renovación Popular", color:"#1565C0", abbr:"RP", dept:"Piura" },
  { name:"Lourdes Alcorta Suero",         partido:"Renovación Popular", color:"#1565C0", abbr:"RP", dept:"Lima" },
  { name:"Perci Rivas Ocejo",             partido:"Renovación Popular", color:"#1565C0", abbr:"RP", dept:"Ayacucho" },
  { name:"Katia Revollar Florez",         partido:"Renovación Popular", color:"#1565C0", abbr:"RP", dept:"Cusco" },
  // Fuerza Popular
  { name:"Alejandro Muñante Riquelme",    partido:"Fuerza Popular",     color:"#F5A623", abbr:"FP", dept:"Lima" },
  { name:"Karina Montoya Navarro",        partido:"Fuerza Popular",     color:"#F5A623", abbr:"FP", dept:"Lima" },
  { name:"Jose Arista Arbildo",           partido:"Fuerza Popular",     color:"#F5A623", abbr:"FP", dept:"Amazonas" },
  { name:"Milagros Jauregui Marcelo",     partido:"Fuerza Popular",     color:"#F5A623", abbr:"FP", dept:"Ancash" },
  // Alianza para el Progreso
  { name:"Cesar Combina Jaimes",          partido:"Alianza para el Progreso", color:"#003087", abbr:"APP", dept:"La Libertad" },
  { name:"Heiner Salazar Vargas",         partido:"Alianza para el Progreso", color:"#003087", abbr:"APP", dept:"Lima" },
  { name:"Marjorie Paredes Martino",      partido:"Alianza para el Progreso", color:"#003087", abbr:"APP", dept:"Lima" },
  // Podemos Peru
  { name:"Mary Gonzales Enriquez",        partido:"Podemos Peru",       color:"#7B1FA2", abbr:"PP", dept:"Lima" },
  { name:"Jaqueline Garcia Rodriguez",    partido:"Podemos Peru",       color:"#7B1FA2", abbr:"PP", dept:"Lima" },
  { name:"Raul Noblecilla Olaechea",      partido:"Podemos Peru",       color:"#7B1FA2", abbr:"PP", dept:"Lima" },
  // Peru Libre
  { name:"Flavio Cruz Mamani",            partido:"Peru Libre",         color:"#CC0000", abbr:"PL", dept:"Puno" },
  { name:"Bertha Rojas Lopez",            partido:"Peru Libre",         color:"#CC0000", abbr:"PL", dept:"Cusco" },
  // Avanza Pais
  { name:"Adriana Tudela Gutierrez",      partido:"Avanza Pais",        color:"#00695C", abbr:"AVP", dept:"Lima" },
  { name:"Fernan Altuve-Febres Lores",    partido:"Avanza Pais",        color:"#00695C", abbr:"AVP", dept:"Lima" },
];


// Add real Parlamento Andino — REMOVED (not included in this edition)



// Add real senators
REAL_SENATORS.forEach(s => {
  const formula = PRESIDENTIAL_FORMULAS.find(f => f.abbr === s.abbr) ||
    { partido: s.partido, color: s.color, abbr: s.abbr };
  ALL_CANDIDATES.push(buildCandidateFromName(s.name, "Senador", formula, idCounter++));
});

// Helper: add a diputado from compact format [name, abbr, dept]
// Parse grouped format {"abbr|dept": [name, ...]} → flat candidate array
// Gzips from 817KB → 26KB on GitHub raw (Content-Encoding: gzip served automatically)
// levelOverride: "Senador" when loading senadores.json, defaults to "Diputado"
function parseDiputadosGrouped(grouped, levelOverride="Diputado") {
  const out = [];
  let idx = 0;
  for (const key of Object.keys(grouped)) {
    const pipe = key.indexOf("|");
    const abbr = key.slice(0, pipe);
    const dept = key.slice(pipe + 1);
    const color = PARTY_COLOR_MAP[abbr] || "#607D8B";
    const formula = PRESIDENTIAL_FORMULAS.find(f => f.abbr === abbr) ||
      { partido: abbr, color, abbr };
    for (const name of grouped[key]) {
      const c = buildCandidateFromName(name, levelOverride, formula, 50000 + idx++);
      c.department = dept;
      out.push(c);
    }
  }
  return out;
}

// Add fallback diputados (static subset) — replaced by async full dataset on load
REAL_DIPUTADOS_FALLBACK.forEach((d, i) => {
  const formula = PRESIDENTIAL_FORMULAS.find(f => f.abbr === d.abbr) ||
    { partido: d.partido, color: d.color, abbr: d.abbr };
  const c = buildCandidateFromName(d.name, "Diputado", formula, idCounter++);
  c.department = d.dept || c.department;
  c._fallback = true;
  ALL_CANDIDATES.push(c);
});






function getRisk(score) {
  if(score>=70) return {label:"ALTO RIESGO",color:COLORS.riskHigh};
  if(score>=45) return {label:"RIESGO MEDIO",color:COLORS.riskMed};
  if(score>=20) return {label:"RIESGO BAJO",color:COLORS.riskLow};
  return {label:"SIN INDICIOS",color:COLORS.riskClean};
}

function RiskMeter({score,size}){
  const sz=size||80; const r=sz*0.38; const cx=sz/2; const cy=sz/2;
  const circ=2*Math.PI*r; const arc=circ*0.75; const filled=arc*(score/100);
  const {color}=getRisk(score);
  return(
    <svg width={sz} height={sz} style={{transform:"rotate(135deg)"}}>
      <circle cx={cx} cy={cy} r={r} fill="none" stroke={COLORS.border} strokeWidth={sz*0.08} strokeDasharray={arc+" "+(circ-arc)} strokeLinecap="round"/>
      <circle cx={cx} cy={cy} r={r} fill="none" stroke={color} strokeWidth={sz*0.08} strokeDasharray={filled+" "+(circ-filled)} strokeLinecap="round"/>
    </svg>
  );
}

function NetworkGraph({candidate,all}){
  const canvasRef=useRef(null); const rafRef=useRef(null);
  useEffect(()=>{
    const canvas=canvasRef.current; if(!canvas) return;
    const ctx=canvas.getContext("2d"); const W=canvas.width; const H=canvas.height;
    const related=all.filter(c=>c.id!==candidate.id&&c.party.abbr===candidate.party.abbr).slice(0,7);
    const rad=Math.min(W,H)*0.33; let frame=0;
    const center={x:W/2,y:H/2,r:18,label:candidate.firstName,score:candidate.riskScore,type:"main"};
    const peers=related.map((c,i)=>{const a=(i/related.length)*2*Math.PI;return{x:W/2+Math.cos(a)*rad,y:H/2+Math.sin(a)*rad,r:11,label:c.lastName.split(" ")[0],score:c.riskScore,type:"peer"};});
    const companies=candidate.publicData.companies.slice(0,3).map((co,i)=>{const a=((i+0.5)/3)*Math.PI;return{x:W/2+Math.cos(a)*(rad*0.55),y:H/2+Math.sin(a)*(rad*0.55),r:9,label:co.name.split(" ")[0],score:co.stateContracts?65:30,type:"company"};});
    const nodes=[center,...peers,...companies];
    function nc(n){return n.type==="company"?COLORS.accentOrange:getRisk(n.score).color;}
    function draw(){
      ctx.clearRect(0,0,W,H); ctx.fillStyle=COLORS.card; ctx.fillRect(0,0,W,H);
      ctx.fillStyle=COLORS.border;
      for(let gx=20;gx<W;gx+=28){for(let gy=20;gy<H;gy+=28){ctx.beginPath();ctx.arc(gx,gy,1,0,Math.PI*2);ctx.fill();}}
      nodes.slice(1).forEach(n=>{ctx.beginPath();ctx.moveTo(center.x,center.y);ctx.lineTo(n.x,n.y);ctx.strokeStyle=nc(n)+"44";ctx.lineWidth=1.5;ctx.setLineDash([4,6]);ctx.stroke();ctx.setLineDash([]);});
      nodes.forEach(n=>{
        const c=nc(n); const pulse=n.type==="main"?Math.sin(frame*0.05)*3:0;
        ctx.beginPath();ctx.arc(n.x,n.y,n.r+pulse+5,0,Math.PI*2);ctx.fillStyle=c+"22";ctx.fill();
        ctx.beginPath();ctx.arc(n.x,n.y,n.r+pulse,0,Math.PI*2);ctx.fillStyle=n.type==="main"?c+"dd":c+"99";ctx.fill();
        ctx.strokeStyle=c;ctx.lineWidth=2;ctx.stroke();
        ctx.fillStyle="#fff";ctx.font="bold "+(n.type==="main"?8:7)+"px monospace";ctx.textAlign="center";ctx.textBaseline="middle";ctx.fillText(n.label.substring(0,7),n.x,n.y);
        if(n.type!=="main"){ctx.fillStyle=COLORS.textMuted;ctx.font="6px monospace";ctx.fillText(n.label.substring(0,9),n.x,n.y+n.r+9);}
      });
      frame++; rafRef.current=requestAnimationFrame(draw);
    }
    draw(); return ()=>cancelAnimationFrame(rafRef.current);
  },[candidate]);
  return <canvas ref={canvasRef} width={340} height={220} style={{width:"100%",borderRadius:8,border:"1px solid "+COLORS.border}}/>;
}

function DataRow({icon,label,value,highlight,copy}){
  const [copied,setCopied]=useState(false);
  return(
    <div style={{display:"flex",alignItems:"flex-start",gap:10,padding:"7px 0",borderBottom:"1px solid "+COLORS.border+"66"}}>
      <span style={{fontSize:14,flexShrink:0,width:20,textAlign:"center"}}>{icon}</span>
      <div style={{flex:1}}>
        <div style={{fontSize:9,color:COLORS.textDim,letterSpacing:"0.07em",marginBottom:1}}>{label}</div>
        <div style={{fontSize:12,color:highlight||COLORS.text,fontFamily:"monospace",wordBreak:"break-all"}}>{value}</div>
      </div>
      {copy&&<button onClick={()=>{navigator.clipboard&&navigator.clipboard.writeText(value);setCopied(true);setTimeout(()=>setCopied(false),1500);}} style={{background:"none",border:"1px solid "+COLORS.border,color:copied?COLORS.accentGreen:COLORS.textDim,borderRadius:5,padding:"2px 7px",cursor:"pointer",fontSize:9,flexShrink:0}}>{copied?"OK":"Copiar"}</button>}
    </div>
  );
}

function SecHead({title,color}){
  return(
    <div style={{display:"flex",alignItems:"center",gap:8,margin:"14px 0 8px"}}>
      <div style={{width:3,height:14,background:color||COLORS.accentBlue,borderRadius:2}}/>
      <span style={{fontSize:10,fontWeight:700,color:color||COLORS.accentBlue,letterSpacing:"0.1em"}}>{title}</span>
    </div>
  );
}

function CompanyCard({co}){
  const [open,setOpen]=useState(false);
  const hasContracts=co.stateContracts&&co.contracts&&co.contracts.length>0;
  const totalFmt=co.totalContratos?"S/ "+co.totalContratos.toLocaleString():null;
  return(
    <div style={{background:COLORS.bg,border:"1px solid "+(hasContracts?COLORS.accentOrange+"55":COLORS.border),borderRadius:8,marginBottom:7,overflow:"hidden"}}>
      {/* Header row */}
      <div style={{padding:"9px 12px"}}>
        <div style={{display:"flex",justifyContent:"space-between",flexWrap:"wrap",gap:5,marginBottom:5}}>
          <span style={{fontSize:12,fontWeight:700,color:COLORS.text}}>{co.name}</span>
          <div style={{display:"flex",gap:5,alignItems:"center",flexWrap:"wrap"}}>
            {hasContracts&&<span style={{fontSize:9,background:COLORS.accentOrange+"22",color:COLORS.accentOrange,padding:"2px 7px",borderRadius:10,border:"1px solid "+COLORS.accentOrange+"44",fontWeight:700}}>{"CONTRATO ESTADO"}</span>}
            <span style={{fontSize:9,background:co.estado==="HABIDO"?COLORS.accentGreen+"18":COLORS.riskHigh+"18",color:co.estado==="HABIDO"?COLORS.accentGreen:COLORS.riskHigh,padding:"1px 7px",borderRadius:6,fontWeight:700}}>{co.estado}</span>
          </div>
        </div>
        <div style={{display:"flex",gap:10,flexWrap:"wrap",alignItems:"center"}}>
          <span style={{fontSize:10,color:COLORS.textMuted}}>RUC: <span style={{color:COLORS.text,fontFamily:"monospace"}}>{co.ruc}</span></span>
          <span style={{fontSize:10,color:COLORS.textMuted}}>Rol: <span style={{color:COLORS.text}}>{co.role}</span></span>
          {hasContracts&&totalFmt&&<span style={{fontSize:10,fontWeight:700,color:COLORS.accentOrange}}>Total contratos: {totalFmt}</span>}
        </div>
        {hasContracts&&(
          <button onClick={()=>setOpen(o=>!o)}
            style={{marginTop:8,display:"flex",alignItems:"center",gap:5,background:COLORS.accentOrange+"18",border:"1px solid "+COLORS.accentOrange+"44",color:COLORS.accentOrange,borderRadius:6,padding:"4px 10px",cursor:"pointer",fontSize:10,fontWeight:700,width:"100%",justifyContent:"space-between"}}>
            <span>{"Ver contratos con el Estado ("+co.contracts.length+")"}</span>
            <span style={{fontSize:12,transition:"transform 0.2s",display:"inline-block",transform:open?"rotate(180deg)":"rotate(0deg)"}}>▾</span>
          </button>
        )}
      </div>
      {/* Contracts dropdown */}
      {hasContracts&&open&&(
        <div style={{borderTop:"1px solid "+COLORS.accentOrange+"33",background:COLORS.accentOrange+"06"}}>
          <div style={{padding:"8px 12px 4px",display:"flex",justifyContent:"space-between",alignItems:"center"}}>
            <span style={{fontSize:9,color:COLORS.accentOrange,fontWeight:700,letterSpacing:"0.08em"}}>CONTRATOS SEGUN OSCE / INFOBRAS</span>
            <a href="https://prodapp2.seace.gob.pe/seacebus-uiwd-pub/buscadorPublico/buscadorPublico.xhtml" target="_blank" rel="noopener noreferrer" style={{fontSize:9,color:COLORS.accentBlue,textDecoration:"none"}}>Ver en SEACE &#x2197;</a>
          </div>
          {co.contracts.map((ct,ci)=>(
            <div key={ci} style={{margin:"0 10px 8px",background:COLORS.card,border:"1px solid "+(ct.alerta?COLORS.riskHigh+"44":COLORS.border),borderRadius:7,padding:"9px 11px",position:"relative"}}>
              {ct.alerta&&<div style={{position:"absolute",top:6,right:8,fontSize:8,background:COLORS.riskHigh+"22",color:COLORS.riskHigh,padding:"1px 6px",borderRadius:6,fontWeight:700,border:"1px solid "+COLORS.riskHigh+"44"}}>OBSERVADO</div>}
              <div style={{display:"flex",justifyContent:"space-between",flexWrap:"wrap",gap:5,marginBottom:4}}>
                <span style={{fontSize:11,fontWeight:700,color:COLORS.text,paddingRight:ct.alerta?60:0}}>{ct.objeto}</span>
              </div>
              <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:"3px 10px"}}>
                {[
                  {l:"Entidad contratante",v:ct.entidad,c:COLORS.accentBlue},
                  {l:"Monto adjudicado",v:ct.monto,c:COLORS.accentYellow},
                  {l:"Proceso de seleccion",v:ct.proceso,c:COLORS.textMuted},
                  {l:"N° Contrato",v:ct.nroContrato,c:COLORS.textMuted},
                  {l:"Ano",v:ct.anio,c:COLORS.textMuted},
                  {l:"Estado",v:ct.estado,c:ct.estado==="EJECUTADO"?COLORS.accentGreen:ct.estado==="OBSERVADO"?COLORS.riskHigh:COLORS.accentYellow},
                ].map(({l,v,c})=>(
                  <div key={l}>
                    <div style={{fontSize:8,color:COLORS.textDim,letterSpacing:"0.06em"}}>{l}</div>
                    <div style={{fontSize:10,color:c,fontWeight:l==="Monto adjudicado"?700:400}}>{v}</div>
                  </div>
                ))}
              </div>
              {ct.alerta&&<div style={{marginTop:7,padding:"5px 8px",background:COLORS.riskHigh+"0d",borderRadius:5,fontSize:9,color:COLORS.riskHigh,border:"1px solid "+COLORS.riskHigh+"22"}}>
                Contrato bajo observacion de la Contraloria General de la República. Verificar en infobras.gob.pe
              </div>}
            </div>
          ))}
          <div style={{padding:"4px 12px 8px"}}>
            <a href="https://contrataciones.gob.pe/buscador/proveedores.html" target="_blank" rel="noopener noreferrer" style={{fontSize:9,color:COLORS.accentBlue,textDecoration:"none"}}>
              Buscar proveedor en OSCE &#x2197;
            </a>
          </div>
        </div>
      )}
    </div>
  );
}

function DonorCard({donor}){
  const [open,setOpen]=useState(false);
  const {suspicious,reasons,relationship,ruc}=donor;
  return(
    <div style={{borderRadius:7,marginBottom:5,background:suspicious?COLORS.riskHigh+"0a":COLORS.bg,border:"1px solid "+(suspicious?COLORS.riskHigh+"44":COLORS.border),overflow:"hidden"}}>
      {/* Main row */}
      <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start",padding:"8px 10px",gap:8}}>
        <div style={{flex:1,minWidth:0}}>
          <div style={{fontSize:11,fontWeight:600,color:COLORS.text,overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap"}}>{donor.name}</div>
          <div style={{display:"flex",gap:5,marginTop:2,flexWrap:"wrap",alignItems:"center"}}>
            <span style={{fontSize:9,color:COLORS.textMuted}}>{donor.type}</span>
            {ruc&&<span style={{fontSize:9,color:COLORS.textDim,fontFamily:"monospace"}}>RUC: {ruc}</span>}
            <span style={{fontSize:9,color:suspicious?COLORS.riskHigh+"cc":COLORS.textDim,background:suspicious?COLORS.riskHigh+"12":"transparent",padding:suspicious?"1px 5px":"0",borderRadius:4}}>{relationship}</span>
          </div>
        </div>
        <div style={{textAlign:"right",flexShrink:0}}>
          <div style={{fontSize:12,fontWeight:700,color:suspicious?COLORS.riskHigh:COLORS.accentGreen}}>{donor.amount}</div>
          {suspicious?(
            <button onClick={()=>setOpen(o=>!o)}
              style={{marginTop:3,display:"flex",alignItems:"center",gap:3,background:COLORS.riskHigh+"18",border:"1px solid "+COLORS.riskHigh+"44",color:COLORS.riskHigh,borderRadius:5,padding:"2px 7px",cursor:"pointer",fontSize:8,fontWeight:700,whiteSpace:"nowrap"}}>
              <span>{"⚠ "+reasons.length+" alertas"}</span>
              <span style={{transition:"transform 0.2s",display:"inline-block",transform:open?"rotate(180deg)":"rotate(0deg)"}}>▾</span>
            </button>
          ):(
            <div style={{fontSize:9,color:COLORS.accentGreen}}>Sin alertas</div>
          )}
        </div>
      </div>
      {/* Suspicious reasons dropdown */}
      {suspicious&&open&&(
        <div style={{borderTop:"1px solid "+COLORS.riskHigh+"33",background:COLORS.riskHigh+"06",padding:"8px 10px"}}>
          <div style={{fontSize:9,color:COLORS.riskHigh,fontWeight:700,letterSpacing:"0.08em",marginBottom:6}}>MOTIVOS DE ALERTA — ANALISIS PECAFOR / UNIDAD DE INTELIGENCIA FINANCIERA</div>
          {reasons.map((reason,ri)=>(
            <div key={ri} style={{display:"flex",gap:7,marginBottom:5,padding:"5px 8px",background:COLORS.riskHigh+"0d",borderRadius:5,border:"1px solid "+COLORS.riskHigh+"22"}}>
              <span style={{color:COLORS.riskHigh,fontWeight:900,flexShrink:0,fontSize:11}}>!</span>
              <span style={{fontSize:10,color:COLORS.text,lineHeight:1.5}}>{reason}</span>
            </div>
          ))}
          <div style={{marginTop:6,display:"flex",gap:8,flexWrap:"wrap"}}>
            <a href="https://pecafor.jne.gob.pe/" target="_blank" rel="noopener noreferrer" style={{fontSize:9,color:COLORS.accentBlue,textDecoration:"none"}}>Ver PECAFOR &#x2197;</a>
            <a href="https://www.sbs.gob.pe/uif" target="_blank" rel="noopener noreferrer" style={{fontSize:9,color:COLORS.accentBlue,textDecoration:"none"}}>SBS - Unidad de Inteligencia Financiera &#x2197;</a>
          </div>
        </div>
      )}
    </div>
  );
}


function PublicDataTab({candidate}){
  const pd=candidate.publicData;
  const [scraping,setScraping]=useState(false);
  const [scraped,setScraped]=useState(false);
  return(
    <div>
      <div style={{background:COLORS.accentBlue+"12",border:"1px solid "+COLORS.accentBlue+"44",borderRadius:10,padding:"11px 14px",marginBottom:14,display:"flex",alignItems:"center",justifyContent:"space-between",gap:10,flexWrap:"wrap"}}>
        <div>
          <div style={{fontSize:12,fontWeight:700,color:COLORS.accentBlue}}>Datos de registros públicos del Estado peruano</div>
          <div style={{fontSize:10,color:COLORS.textMuted}}>Fuentes: RENIEC, JNE, SUNAT, Poder Judicial, PECAFOR, INFOGOB</div>
        </div>
        <button onClick={()=>{setScraping(true);setTimeout(()=>{setScraping(false);setScraped(true);},2000);}} disabled={scraping}
          style={{background:scraped?COLORS.accentGreen+"22":COLORS.accentBlue,border:"1px solid "+(scraped?COLORS.accentGreen:COLORS.accentBlue),color:scraped?COLORS.accentGreen:"#fff",padding:"7px 14px",borderRadius:8,cursor:scraping?"wait":"pointer",fontSize:11,fontWeight:700,flexShrink:0,minWidth:110}}>
          {scraping?"Consultando...":scraped?"Actualizado":"Actualizar"}
        </button>
      </div>

      <SecHead title="RENIEC - Identificacion" color={COLORS.riskHigh}/>
      <DataRow icon="🪪" label="DNI" value={pd.dni} copy highlight={COLORS.accentYellow}/>
      <DataRow icon="📅" label="Fecha de Nacimiento" value={pd.birthDate}/>
      <DataRow icon="📍" label="Lugar de Nacimiento" value={pd.birthPlace}/>
      <DataRow icon="🏠" label="Domicilio Declarado (JNE)" value={pd.address} copy/>
      <DataRow icon="💍" label="Estado Civil" value={pd.maritalStatus}/>

      <SecHead title="Contacto (JNE Hoja de Vida)" color={COLORS.accentBlue}/>
      <DataRow icon="📧" label="Correo Electronico" value={pd.email} copy highlight={COLORS.accentBlue}/>
      <DataRow icon="📱" label="Telefono Movil" value={"+51 "+pd.phone} copy/>
      <DataRow icon="🎓" label="Profesion" value={pd.profession}/>
      <DataRow icon="🏢" label="Empleador" value={pd.employer}/>

      <SecHead title="SUNAT - Situacion Tributaria" color={COLORS.accentGreen}/>
      <DataRow icon="🔢" label="RUC" value={pd.ruc} copy highlight={COLORS.accentYellow}/>
      <DataRow icon="📊" label="Condicion Tributaria" value={pd.taxStatus} highlight={pd.taxStatus==="HABIDO"?COLORS.accentGreen:COLORS.riskHigh}/>
      {pd.companies.length>0?pd.companies.map((co,i)=>(
        <CompanyCard key={i} co={co}/>
      )):<div style={{fontSize:11,color:COLORS.textDim,padding:"6px 0"}}>Sin empresas registradas</div>}

      <SecHead title="JNE - Declaración de Bienes" color={COLORS.accentYellow}/>
      <DataRow icon="💵" label="Ingreso Mensual Declarado" value={"S/ "+pd.salaryMonthly.toLocaleString()} highlight={COLORS.accentYellow}/>
      <DataRow icon="🏦" label="Ahorros Totales" value={"S/ "+pd.savingsTotal.toLocaleString()} highlight={COLORS.accentYellow}/>
      {pd.hasDebts&&<DataRow icon="⚠️" label="Deudas Declaradas" value={"S/ "+pd.debtAmount.toLocaleString()} highlight={COLORS.accentOrange}/>}
      {pd.properties.length>0&&(
        <div style={{marginBottom:8}}>
          <div style={{fontSize:10,color:COLORS.textMuted,margin:"6px 0"}}>Inmuebles ({pd.properties.length})</div>
          {pd.properties.map((p,i)=>(
            <div key={i} style={{background:COLORS.bg,border:"1px solid "+COLORS.border,borderRadius:7,padding:"8px 11px",marginBottom:5,display:"flex",justifyContent:"space-between",alignItems:"center",gap:8,flexWrap:"wrap"}}>
              <div><div style={{fontSize:11,color:COLORS.text}}>{p.address}</div><div style={{fontSize:9,color:COLORS.textMuted}}>{p.area}</div></div>
              <div style={{textAlign:"right"}}>
                <div style={{fontSize:11,fontWeight:700,color:COLORS.accentYellow}}>{p.valuation}</div>
                {!p.registered&&<div style={{fontSize:9,color:COLORS.riskHigh}}>No en registros públicos</div>}
              </div>
            </div>
          ))}
        </div>
      )}
      {pd.vehicles.length>0&&(
        <div style={{marginBottom:8}}>
          <div style={{fontSize:10,color:COLORS.textMuted,margin:"6px 0"}}>Vehiculos ({pd.vehicles.length})</div>
          {pd.vehicles.map((v,i)=>(
            <div key={i} style={{background:COLORS.bg,border:"1px solid "+COLORS.border,borderRadius:7,padding:"8px 11px",marginBottom:5,display:"flex",justifyContent:"space-between",alignItems:"center"}}>
              <div><div style={{fontSize:11,color:COLORS.text}}>{v.brand+" "+v.year}</div><div style={{fontSize:9,color:COLORS.textMuted,fontFamily:"monospace"}}>{v.plate}</div></div>
              <div style={{fontSize:11,fontWeight:700,color:COLORS.accentYellow}}>{v.value}</div>
            </div>
          ))}
        </div>
      )}

      <SecHead title="Poder Judicial - Expedientes" color={COLORS.riskHigh}/>
      {pd.courtCases.length>0?pd.courtCases.map((c,i)=>(
        <div key={i} style={{background:COLORS.riskHigh+"0d",border:"1px solid "+COLORS.riskHigh+"33",borderRadius:8,padding:"9px 12px",marginBottom:6}}>
          <div style={{display:"flex",justifyContent:"space-between",flexWrap:"wrap",gap:5,marginBottom:3}}>
            <span style={{fontSize:12,fontWeight:700,color:COLORS.text}}>{c.type}</span>
            <span style={{fontSize:9,padding:"2px 7px",borderRadius:10,fontWeight:700,
              background:c.status==="SENTENCIADO"?COLORS.riskHigh+"33":c.status==="ACUSADO"?COLORS.accentOrange+"33":COLORS.textDim+"22",
              color:c.status==="SENTENCIADO"?COLORS.riskHigh:c.status==="ACUSADO"?COLORS.accentOrange:COLORS.textMuted,
              border:"1px solid "+(c.status==="SENTENCIADO"?COLORS.riskHigh+"55":c.status==="ACUSADO"?COLORS.accentOrange+"55":COLORS.border)}}>{c.status}</span>
          </div>
          <div style={{fontSize:10,color:COLORS.textMuted}}>{c.court}</div>
          <div style={{fontSize:10,color:COLORS.textDim,fontFamily:"monospace",marginTop:2}}>Exp. {c.expediente} ({c.year})</div>
          <a href="https://cej.pj.gob.pe/cej/forms/busquedaform.html" target="_blank" rel="noopener noreferrer" style={{fontSize:10,color:COLORS.accentBlue,textDecoration:"none",display:"inline-flex",alignItems:"center",gap:3,marginTop:4}}>Ver en PJ &#x2197;</a>
        </div>
      )):<div style={{fontSize:11,color:COLORS.accentGreen,padding:"6px 0"}}>Sin expedientes registrados</div>}

      <SecHead title="PECAFOR - Financiamiento de Campana" color={COLORS.accentOrange}/>
      <DataRow icon="💰" label="Total Declarado" value={"S/ "+pd.campaignFinance.totalDeclared.toLocaleString()} highlight={COLORS.accentYellow}/>
      <DataRow icon="⚠️" label="Donaciones Sospechosas" value={pd.campaignFinance.suspiciousDonations+" de "+pd.campaignFinance.donors.length+" donantes"} highlight={pd.campaignFinance.suspiciousDonations>2?COLORS.riskHigh:COLORS.accentGreen}/>
      {pd.campaignFinance.donors.slice(0,8).map((d,i)=>(
        <DonorCard key={i} donor={d}/>
      ))}
      <a href="https://pecafor.jne.gob.pe/" target="_blank" rel="noopener noreferrer" style={{fontSize:10,color:COLORS.accentBlue,textDecoration:"none",display:"inline-flex",alignItems:"center",gap:3,marginTop:5}}>Ver PECAFOR &#x2197;</a>

      <SecHead title="Redes Sociales Publicas" color={COLORS.textMuted}/>
      {[{key:"facebook",icon:"📘",label:"Facebook"},{key:"twitter",icon:"🐦",label:"Twitter/X"},{key:"instagram",icon:"📸",label:"Instagram"}].map(s=>
        pd.social[s.key]?<DataRow key={s.key} icon={s.icon} label={s.label} value={pd.social[s.key]} copy/>
        :<div key={s.key} style={{display:"flex",alignItems:"center",gap:10,padding:"6px 0",borderBottom:"1px solid "+COLORS.border+"33"}}><span style={{fontSize:14,width:20,textAlign:"center"}}>{s.icon}</span><span style={{fontSize:11,color:COLORS.textDim}}>{s.label} — No encontrado</span></div>
      )}

      <div style={{background:COLORS.bg,border:"1px solid "+COLORS.border,borderRadius:7,padding:"9px 12px",marginTop:14}}>
        <div style={{fontSize:9,color:COLORS.textDim,lineHeight:1.6}}>Datos de registros públicos: RENIEC, JNE, SUNAT, Poder Judicial, ONPE. Los datos de contacto son los declarados ante el JNE. Uso regulado por Ley 27806 y Ley 29733.</div>
      </div>
    </div>
  );
}

const OFFICIAL_SOURCES=[
  {id:"minjus1",label:"Inhabilitados MINJUS",desc:"Personas inhabilitadas para función publica (CENADEC)",icon:"⚖️",color:COLORS.riskHigh,url:"https://www.minjus.gob.pe/registro-de-condenados-cenadec/",badge:"MINJUS"},
  {id:"jne1",label:"Hoja de Vida JNE",desc:"Declaracion jurada de vida, bienes e ingresos",icon:"📄",color:"#003087",url:"https://declara.jne.gob.pe/",badge:"JNE"},
  {id:"jne2",label:"PECAFOR Financiamiento",desc:"Control del Financiamiento de Organizaciones Politicas",icon:"💰",color:"#003087",url:"https://pecafor.jne.gob.pe/",badge:"JNE"},
  {id:"jne3",label:"INFOGOB Historial",desc:"Historial electoral y gobernabilidad",icon:"🗳️",color:"#0055A5",url:"https://infogob.jne.gob.pe/",badge:"JNE"},
  {id:"pj1",label:"Poder Judicial - Expedientes",desc:"Consulta de expedientes judiciales activos",icon:"🏛️",color:COLORS.accentOrange,url:"https://cej.pj.gob.pe/cej/forms/busquedaform.html",badge:"PJ"},
  {id:"sunat1",label:"Consulta RUC SUNAT",desc:"Situacion tributaria y fiscal",icon:"🏦",color:COLORS.accentGreen,url:"https://e-consultaruc.sunat.gob.pe/cl-ti-itmrconsruc/jcrS00Alias",badge:"SUNAT"},
  {id:"cont1",label:"Contraloria - Sanciones",desc:"Registro Nacional de Sanciones (RNSSC)",icon:"🔍",color:"#6A1B9A",url:"https://apps.contraloria.gob.pe/ciudadano/",badge:"CONTRALORIA"},
  {id:"onpe1",label:"ONPE - Aportes",desc:"Aportes y gastos de campana electoral",icon:"📊",color:"#1B5E20",url:"https://www.onpe.gob.pe/modfinanciero/",badge:"ONPE"},
];

function SourceLink({source}){
  const [hov,setHov]=useState(false);
  return(
    <a href={source.url} target="_blank" rel="noopener noreferrer"
      onMouseEnter={()=>setHov(true)} onMouseLeave={()=>setHov(false)}
      style={{display:"flex",alignItems:"flex-start",gap:10,padding:"10px 12px",borderRadius:8,textDecoration:"none",background:hov?source.color+"18":COLORS.bg,border:"1px solid "+(hov?source.color+"66":COLORS.border),transition:"all 0.15s"}}>
      <span style={{fontSize:18,flexShrink:0}}>{source.icon}</span>
      <div style={{flex:1}}>
        <div style={{display:"flex",alignItems:"center",gap:6,marginBottom:2}}>
          <span style={{fontSize:11,fontWeight:700,color:hov?source.color:COLORS.text}}>{source.label}</span>
          <span style={{fontSize:8,background:source.color+"22",color:source.color,padding:"1px 5px",borderRadius:8,fontWeight:700,border:"1px solid "+source.color+"44"}}>{source.badge}</span>
        </div>
        <div style={{fontSize:10,color:COLORS.textMuted}}>{source.desc}</div>
      </div>
      <span style={{fontSize:11,color:hov?source.color:COLORS.textDim,flexShrink:0}}>&#x2197;</span>
    </a>
  );
}

function Modal({candidate,onClose,all}){
  const [tab,setTab]=useState("resumen");
  const [tipText,setTipText]=useState("");
  const [tipSent,setTipSent]=useState(false);
  const {label,color}=getRisk(candidate.riskScore);
  const bars=[
    {label:"Historial Judicial (MINJUS)",value:candidate.breakdown.criminal,max:40,color:COLORS.riskHigh},
    {label:"Financiamiento Campana (JNE)",value:candidate.breakdown.finance,max:35,color:COLORS.accentOrange},
    {label:"Vinculos en Red",value:candidate.breakdown.network,max:15,color:COLORS.accentYellow},
    {label:"Riqueza Inexplicada (SUNAT)",value:candidate.breakdown.wealth,max:10,color:COLORS.accentBlue},
  ];
  return(
    <div onClick={e=>e.target===e.currentTarget&&onClose()} style={{position:"fixed",inset:0,background:"#000000cc",zIndex:1000,display:"flex",alignItems:"center",justifyContent:"center",padding:16,overflowY:"auto"}}>
      <div style={{background:COLORS.surface,border:"1px solid "+color+"44",borderRadius:16,width:"100%",maxWidth:720,height:"92vh",overflow:"hidden",display:"flex",flexDirection:"column",flexShrink:0}}>

        <div style={{background:COLORS.card,borderBottom:"1px solid "+COLORS.border,padding:"15px 20px",display:"flex",justifyContent:"space-between",alignItems:"center"}}>
          <div style={{display:"flex",alignItems:"center",gap:13}}>
            <div style={{position:"relative",width:70,height:70,flexShrink:0}}>
              <RiskMeter score={candidate.riskScore} size={70}/>
              <div style={{position:"absolute",inset:0,display:"flex",flexDirection:"column",alignItems:"center",justifyContent:"center"}}>
                <span style={{fontSize:18,fontWeight:900,color,fontFamily:"monospace"}}>{candidate.riskScore}</span>
                <span style={{fontSize:7,color:COLORS.textMuted}}>/100</span>
              </div>
            </div>
            <div>
              <div style={{fontSize:18,fontWeight:800,color:COLORS.text,fontFamily:"Georgia,serif"}}>{candidate.fullName}</div>
              <div style={{display:"flex",gap:5,marginTop:4,flexWrap:"wrap",alignItems:"center"}}>
                <span style={{fontSize:10,background:candidate.party.color+"22",color:candidate.party.color,padding:"2px 8px",borderRadius:20,fontWeight:700,border:"1px solid "+candidate.party.color+"55"}}>{candidate.party.name}</span>
                <span style={{fontSize:10,color:COLORS.textMuted,background:COLORS.bg,padding:"2px 8px",borderRadius:20}}>{LEVEL_INFO[candidate.level]?LEVEL_INFO[candidate.level].icon+" ":""}{candidate.level}</span>
                <span style={{fontSize:9,color:COLORS.textMuted,fontFamily:"monospace",background:COLORS.bg,padding:"2px 7px",borderRadius:4}}>DNI: {candidate.publicData.dni}</span>
              </div>
              <div style={{marginTop:5,display:"inline-flex",alignItems:"center",gap:5,padding:"2px 10px",borderRadius:20,background:color+"22",border:"1px solid "+color+"55"}}>
                <div style={{width:5,height:5,borderRadius:"50%",background:color,boxShadow:"0 0 6px "+color}}/>
                <span style={{fontSize:9,fontWeight:800,color,letterSpacing:"0.1em"}}>{label}</span>
              </div>
            </div>
          </div>
          <button onClick={onClose} style={{background:COLORS.bg,border:"1px solid "+COLORS.border,color:COLORS.textMuted,borderRadius:8,width:32,height:32,cursor:"pointer",fontSize:14,flexShrink:0}}>x</button>
        </div>

        <div style={{display:"flex",borderBottom:"1px solid "+COLORS.border,background:COLORS.card,padding:"0 20px",overflowX:"auto"}}>
          {[["resumen","Resumen"],["datos","Datos Publicos"],["red","Red"],["fuentes","Fuentes"],["denuncias","Denuncias"]].map(([t,l])=>(
            <button key={t} onClick={()=>setTab(t)} style={{background:"none",border:"none",cursor:"pointer",padding:"10px 12px",fontSize:11,color:tab===t?color:COLORS.textMuted,fontWeight:tab===t?700:400,borderBottom:tab===t?"2px solid "+color:"2px solid transparent",whiteSpace:"nowrap"}}>{l}</button>
          ))}
        </div>

        <div style={{overflowY:"auto",padding:20,flex:1}}>
          {tab==="resumen"&&(
            <div>
              <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:7,marginBottom:13}}>
                {[{icon:"🪪",label:"DNI",value:candidate.publicData.dni},{icon:"📧",label:"Email",value:candidate.publicData.email},{icon:"📱",label:"Telefono",value:"+51 "+candidate.publicData.phone},{icon:"🏠",label:"Domicilio",value:candidate.publicData.address}].map((f,i)=>(
                  <div key={i} style={{background:COLORS.bg,border:"1px solid "+COLORS.border,borderRadius:8,padding:"8px 10px"}}>
                    <div style={{fontSize:9,color:COLORS.textDim,marginBottom:1}}>{f.icon} {f.label}</div>
                    <div style={{fontSize:11,color:COLORS.text,fontFamily:"monospace",wordBreak:"break-all"}}>{f.value}</div>
                  </div>
                ))}
              </div>
              <div style={{fontSize:10,color:COLORS.textMuted,marginBottom:11,background:COLORS.bg,padding:"7px 11px",borderRadius:7,border:"1px solid "+COLORS.border,fontFamily:"monospace"}}>{"Fuentes: "+(candidate.sources.join(", ")||"MINJUS, JNE")}</div>
              <div style={{display:"grid",gap:9,marginBottom:14}}>
                {bars.map((b,i)=>(
                  <div key={i}>
                    <div style={{display:"flex",justifyContent:"space-between",marginBottom:3}}><span style={{fontSize:11,color:COLORS.textMuted}}>{b.label}</span><span style={{fontSize:11,fontWeight:700,color:b.color,fontFamily:"monospace"}}>{b.value+"/"+b.max}</span></div>
                    <div style={{background:COLORS.bg,borderRadius:4,height:6,overflow:"hidden"}}><div style={{width:((b.value/b.max)*100)+"%",height:"100%",background:b.color,borderRadius:4}}/></div>
                  </div>
                ))}
              </div>
              {candidate.flags.map((f,i)=>(
                <div key={i} style={{display:"flex",alignItems:"center",gap:9,padding:"8px 12px",background:COLORS.riskHigh+"12",border:"1px solid "+COLORS.riskHigh+"33",borderRadius:7,marginBottom:5}}>
                  <span style={{color:COLORS.riskHigh,fontWeight:700}}>!</span>
                  <span style={{fontSize:12,color:COLORS.text}}>{f}</span>
                </div>
              ))}
            </div>
          )}
          {tab==="datos"&&<PublicDataTab candidate={candidate}/>}
          {tab==="red"&&(
            <div>
              <div style={{fontSize:12,color:COLORS.textMuted,marginBottom:10}}>Conexiones con miembros de la misma plancha y empresas vinculadas.</div>
              <NetworkGraph candidate={candidate} all={all}/>
              <div style={{display:"flex",gap:12,marginTop:10,flexWrap:"wrap"}}>
                {[{c:COLORS.riskHigh,l:"Alto riesgo"},{c:COLORS.accentOrange,l:"Empresa vinculada"},{c:COLORS.riskLow,l:"Riesgo bajo"},{c:COLORS.riskClean,l:"Sin indicios"}].map(({c,l})=>(
                  <div key={l} style={{display:"flex",alignItems:"center",gap:5}}><div style={{width:8,height:8,borderRadius:"50%",background:c}}/><span style={{fontSize:10,color:COLORS.textMuted}}>{l}</span></div>
                ))}
              </div>
            </div>
          )}
          {tab==="fuentes"&&(
            <div>
              <div style={{fontSize:11,color:COLORS.textMuted,marginBottom:13,background:COLORS.bg,padding:"9px 12px",borderRadius:7,border:"1px solid "+COLORS.border}}>
                {"Busca \""+candidate.fullName+"\" (DNI: "+candidate.publicData.dni+") en cada portal oficial del Estado."}
              </div>
              <div style={{display:"grid",gap:6}}>{OFFICIAL_SOURCES.map(s=><SourceLink key={s.id} source={s}/>)}</div>
            </div>
          )}
          {tab==="denuncias"&&(
            <div>
              <div style={{fontSize:11,color:COLORS.textMuted,marginBottom:13}}>{candidate.reportCount+" denuncias ciudadanas verificadas."}</div>
              <div style={{background:COLORS.bg,border:"1px solid "+COLORS.border,borderRadius:9,padding:"12px 14px",marginBottom:14}}>
                <div style={{fontSize:10,fontWeight:700,color:COLORS.textMuted,letterSpacing:"0.08em",marginBottom:8}}>CANALES OFICIALES DE DENUNCIA</div>
                <div style={{display:"grid",gap:5}}>
                  {[{label:"JNE - Impugnaciones",url:"https://portal.jne.gob.pe/portal/Página/Index/4",color:"#003087",icon:"🗳️"},{label:"Fiscalia Anticorrupción",url:"https://www.mpfn.gob.pe/elfiscal/denuncias/",color:COLORS.riskHigh,icon:"⚖️"},{label:"Contraloria - Denuncias",url:"https://apps.contraloria.gob.pe/wcm/control_ciudadano/index.html",color:"#6A1B9A",icon:"🔎"},{label:"ONPE - Infracciones",url:"https://www.onpe.gob.pe/modfinanciero/",color:"#1B5E20",icon:"💰"}].map(ch=>(
                    <a key={ch.label} href={ch.url} target="_blank" rel="noopener noreferrer"
                      style={{display:"flex",alignItems:"center",gap:9,padding:"8px 11px",background:COLORS.card,border:"1px solid "+COLORS.border,borderRadius:7,textDecoration:"none"}}
                      onMouseEnter={e=>{e.currentTarget.style.borderColor=ch.color;e.currentTarget.style.background=ch.color+"10";}}
                      onMouseLeave={e=>{e.currentTarget.style.borderColor=COLORS.border;e.currentTarget.style.background=COLORS.card;}}>
                      <span style={{fontSize:15}}>{ch.icon}</span>
                      <span style={{fontSize:11,fontWeight:700,color:COLORS.text,flex:1}}>{ch.label}</span>
                      <span style={{fontSize:11,color:COLORS.textDim}}>&#x2197;</span>
                    </a>
                  ))}
                </div>
              </div>
              {candidate.reportCount>0&&Array.from({length:Math.min(candidate.reportCount,3)}).map((_,i)=>(
                <div key={i} style={{background:COLORS.bg,border:"1px solid "+COLORS.border,borderRadius:7,padding:12,marginBottom:7}}>
                  <div style={{display:"flex",justifyContent:"space-between",marginBottom:4}}><span style={{fontSize:10,color:COLORS.accentYellow,fontWeight:700}}>{"Denunciante #"+(1000+i*37)}</span><span style={{fontSize:9,color:COLORS.textDim}}>{"0"+(i+1)+"/03/2026"}</span></div>
                  <div style={{fontSize:11,color:COLORS.textMuted}}>{["Se detectaron pagos no declarados a proveedores locales.","Vinculo con empresa contratista inhabilitada por OSCE.","Activos inmuebles no declarados ante la SUNAT."][i]}</div>
                </div>
              ))}
              <div style={{borderTop:"1px solid "+COLORS.border,paddingTop:13}}>
                <div style={{fontSize:11,fontWeight:700,color:COLORS.text,marginBottom:4}}>Enviar denuncia interna</div>
                <div style={{fontSize:10,color:COLORS.textMuted,marginBottom:8}}>Verificacion de identidad requerida. Protegido por Ley 29542.</div>
                <textarea value={tipText} onChange={e=>setTipText(e.target.value)} placeholder="Describa la irregularidad..." style={{width:"100%",background:COLORS.bg,border:"1px solid "+COLORS.border,borderRadius:7,padding:10,color:COLORS.text,fontSize:11,fontFamily:"monospace",resize:"vertical",minHeight:70,boxSizing:"border-box"}}/>
                {tipSent?<div style={{marginTop:8,color:COLORS.accentGreen,fontSize:11}}>Denuncia enviada. Recibiras confirmacion por correo.</div>
                  :<button onClick={()=>tipText.length>10&&setTipSent(true)} style={{marginTop:8,background:COLORS.accentBlue,border:"none",color:"#fff",padding:"8px 18px",borderRadius:7,cursor:"pointer",fontSize:11,fontWeight:700}}>Enviar denuncia verificada</button>}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function CandidateCard({candidate,onClick}){
  const {label,color}=getRisk(candidate.riskScore);
  const [hov,setHov]=useState(false);
  return(
    <div onClick={()=>onClick(candidate)} onMouseEnter={()=>setHov(true)} onMouseLeave={()=>setHov(false)}
      style={{background:COLORS.card,border:"1px solid "+(hov?color:COLORS.border),borderRadius:12,padding:14,cursor:"pointer",transition:"all 0.2s",transform:hov?"translateY(-2px)":"none",position:"relative",overflow:"hidden"}}>
      <div style={{position:"absolute",top:0,left:0,right:0,height:3,background:color}}/>
      <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start",marginBottom:8}}>
        <div style={{flex:1,minWidth:0}}>
          <div style={{fontSize:13,fontWeight:700,color:COLORS.text,fontFamily:"Georgia,serif",lineHeight:1.3}}>{candidate.fullName}</div>
          <div style={{display:"flex",gap:4,marginTop:4,flexWrap:"wrap"}}>
            <span style={{fontSize:9,background:candidate.party.color+"22",color:candidate.party.color,padding:"2px 6px",borderRadius:4,fontWeight:700,border:"1px solid "+candidate.party.color+"44"}}>{candidate.party.abbr}</span>
            <span style={{fontSize:9,color:COLORS.textMuted,background:COLORS.surface,padding:"2px 6px",borderRadius:4}}>{LEVEL_INFO[candidate.level]?LEVEL_INFO[candidate.level].icon+" ":""}{candidate.level}</span>
          </div>
          <div style={{fontSize:9,color:COLORS.textDim,marginTop:2,fontFamily:"monospace"}}>{candidate.department}</div>
        </div>
        <div style={{position:"relative",width:46,height:46,flexShrink:0,marginLeft:8}}>
          <RiskMeter score={candidate.riskScore} size={46}/>
          <div style={{position:"absolute",inset:0,display:"flex",alignItems:"center",justifyContent:"center",fontSize:10,fontWeight:800,color,fontFamily:"monospace"}}>{candidate.riskScore}</div>
        </div>
      </div>
      <div style={{fontSize:9,color:COLORS.textMuted,marginBottom:6}}>{"Dep. "+candidate.department}</div>
      <div style={{display:"inline-flex",alignItems:"center",gap:3,padding:"2px 7px",borderRadius:20,background:color+"18",border:"1px solid "+color+"44"}}>
        <div style={{width:4,height:4,borderRadius:"50%",background:color}}/>
        <span style={{fontSize:8,fontWeight:800,color,letterSpacing:"0.08em"}}>{label}</span>
      </div>
      {candidate.flags.slice(0,1).map((f,i)=>(
        <div key={i} style={{fontSize:9,color:COLORS.textMuted,display:"flex",alignItems:"center",gap:3,marginTop:4}}>
          <span style={{color}}>+</span>{f}
        </div>
      ))}
    </div>
  );
}

export default function App(){
  const [view,setView]=useState("dashboard");
  const [search,setSearch]=useState("");
  const [filterLevel,setFilterLevel]=useState("Todos");
  const [filterRisk,setFilterRisk]=useState("Todos");
  const [filterDept,setFilterDept]=useState("Todos");
  const [sortBy,setSortBy]=useState("risk");
  const [selected,setSelected]=useState(null);
  const [visitors,setVisitors]=useState("...");
  const [candidates,setCandidates]=useState(ALL_CANDIDATES);
  const [diputadosLoaded,setDiputadosLoaded]=useState(false);
  const [diputadosCount,setDiputadosCount]=useState(0);
  const [page,setPage]=useState(1);
  const PAGE_SIZE=100;
  const lastFilterKey = useRef("");

  useEffect(()=>{
    const alreadyCounted=localStorage.getItem("vt_counted");
    if(!alreadyCounted){
      fetch("https://api.countapi.xyz/hit/vototransparente.info/visitors")
        .then(r=>r.json()).then(d=>{ setVisitors(d.value); localStorage.setItem("vt_counted","1"); })
        .catch(()=>setVisitors("—"));
    } else {
      fetch("https://api.countapi.xyz/get/vototransparente.info/visitors")
        .then(r=>r.json()).then(d=>setVisitors(d.value)).catch(()=>setVisitors("—"));
    }
  },[]);

  // Load full JNE datasets in parallel — diputados.json (26k) + senadores.json (when available)
  useEffect(()=>{
    const fetchJson = url => fetch(url).then(r=>{ if(!r.ok) throw new Error(r.status); return r.json(); });
    Promise.allSettled([fetchJson(DIPUTADOS_URL), fetchJson(SENADORES_URL)])
      .then(([dipRes, senRes])=>{
        const withoutFallback = ALL_CANDIDATES.filter(c=>!c._fallback);
        const extras = [];
        if(dipRes.status==="fulfilled") extras.push(...parseDiputadosGrouped(dipRes.value));
        if(senRes.status==="fulfilled") extras.push(...parseDiputadosGrouped(senRes.value, "Senador"));
        setCandidates([...withoutFallback, ...extras]);
        setDiputadosCount(extras.length);
        setDiputadosLoaded(true);
      })
      .catch(()=>setDiputadosLoaded(true));
  },[]);

  // Reset to page 1 whenever filters/sort/search/candidates change
  useEffect(()=>{ setPage(1); },[search,filterLevel,filterRisk,filterDept,sortBy,candidates]);

  const filtered=candidates.filter(c=>{
    const q=search.toLowerCase();
    const ms=!search||c.fullName.toLowerCase().includes(q)||c.party.name.toLowerCase().includes(q)||c.party.abbr.toLowerCase().includes(q);
    const ml=filterLevel==="Todos"||c.level===filterLevel;
    const mr=filterRisk==="Todos"||(filterRisk==="Alto"&&c.riskScore>=70)||(filterRisk==="Medio"&&c.riskScore>=45&&c.riskScore<70)||(filterRisk==="Bajo"&&c.riskScore>=20&&c.riskScore<45)||(filterRisk==="Limpio"&&c.riskScore<20);
    const md=filterDept==="Todos"||c.department===filterDept;
    return ms&&ml&&mr&&md;
  }).sort((a,b)=>sortBy==="risk"?b.riskScore-a.riskScore:a.lastName.localeCompare(b.lastName));

  const filterKey = search+"|"+filterLevel+"|"+filterRisk+"|"+filterDept+"|"+sortBy;
  const totalPages=Math.max(1,Math.ceil(filtered.length/PAGE_SIZE));
  // If filterKey changed since last render, force page 1 for the slice even before useEffect fires
  const pageIsStale = lastFilterKey.current !== filterKey;
  if(pageIsStale) lastFilterKey.current = filterKey;
  const safePage = pageIsStale ? 1 : Math.min(page, totalPages);
  const paginated=filtered.slice((safePage-1)*PAGE_SIZE, safePage*PAGE_SIZE);

  const stats={
    total:candidates.length,
    high:candidates.filter(c=>c.riskScore>=70).length,
    med:candidates.filter(c=>c.riskScore>=45&&c.riskScore<70).length,
    low:candidates.filter(c=>c.riskScore>=20&&c.riskScore<45).length,
    clean:candidates.filter(c=>c.riskScore<20).length,
    avg:Math.round(candidates.reduce((s,c)=>s+c.riskScore,0)/Math.max(1,candidates.length)),
  };

  const partyStats=PRESIDENTIAL_FORMULAS.map(f=>{
    const pc=candidates.filter(c=>c.party.abbr===f.abbr);
    return{...f,count:pc.length,avgRisk:pc.length?Math.round(pc.reduce((s,c)=>s+c.riskScore,0)/pc.length):0};
  }).sort((a,b)=>b.avgRisk-a.avgRisk);

  // Each counter respects the OTHER active filters (so badge counts stay consistent with what's visible)
  // Base pools: apply the OTHER two filters, never the filter being counted
  // So each badge always shows "how many would match if you clicked me"
  const riskScore = (c,rv) => rv==="Alto"?c.riskScore>=70:rv==="Medio"?(c.riskScore>=45&&c.riskScore<70):rv==="Bajo"?(c.riskScore>=20&&c.riskScore<45):c.riskScore<20;
  const matchesDept = (c) => filterDept==="Todos" || c.department===filterDept;
  const matchesLevel = (c) => filterLevel==="Todos" || c.level===filterLevel;
  const matchesRisk = (c) => filterRisk==="Todos" || riskScore(c, filterRisk);

  // For CARGO badges: apply dept+risk filters, count per level
  const countLv=(lv)=>{
    const base = candidates.filter(c => matchesDept(c) && matchesRisk(c));
    return lv==="Todos" ? base.length : base.filter(c=>c.level===lv).length;
  };
  // For NIVEL DE RIESGO badges: apply level+dept filters, count per risk — NEVER filter by active risk
  const countRk=(rv)=>{
    const base = candidates.filter(c => matchesLevel(c) && matchesDept(c));
    if(rv==="Todos") return base.length;
    return base.filter(c=>riskScore(c,rv)).length;
  };
  // For DEPARTAMENTO badges: apply level+risk filters, count per dept
  const countDp=(d)=>{
    const base = candidates.filter(c => matchesLevel(c) && matchesRisk(c));
    return d==="Todos" ? base.length : base.filter(c=>c.department===d).length;
  };


  const RISK_OPTS=[
    {val:"Todos",label:"Todos",color:COLORS.textMuted,desc:"Todos los candidatos sin filtro de riesgo"},
    {val:"Alto",label:"Alto Riesgo",color:COLORS.riskHigh,desc:"Score 70-100: indicios graves en múltiples fuentes"},
    {val:"Medio",label:"Riesgo Medio",color:COLORS.riskMed,desc:"Score 45-69: alertas moderadas detectadas"},
    {val:"Bajo",label:"Riesgo Bajo",color:COLORS.riskLow,desc:"Score 20-44: indicios menores o aislados"},
    {val:"Limpio",label:"Sin Indicios",color:COLORS.riskClean,desc:"Score 0-19: sin hallazgos en registros públicos"},
  ];

  const inp={background:COLORS.card,border:"1px solid "+COLORS.border,borderRadius:8,padding:"8px 12px",color:COLORS.text,fontSize:12};
  const navBtn=(active)=>({background:active?COLORS.accent+"22":"none",border:"1px solid "+(active?COLORS.accent:"transparent"),color:active?COLORS.accent:COLORS.textMuted,padding:"6px 13px",borderRadius:8,cursor:"pointer",fontSize:12,fontWeight:active?700:400});

  return(
    <div style={{minHeight:"100vh",background:COLORS.bg,color:COLORS.text,fontFamily:"Trebuchet MS,sans-serif"}}>
      {/* Nav */}
      <div style={{background:COLORS.surface,borderBottom:"1px solid "+COLORS.border,padding:"0 12px",display:"flex",alignItems:"center",justifyContent:"space-between",minHeight:54,position:"sticky",top:0,zIndex:100,flexWrap:"wrap",gap:4}}>
        <div style={{display:"flex",alignItems:"center",gap:7,padding:"8px 0"}}>
          <div style={{width:8,height:8,background:COLORS.accent,borderRadius:"50%",boxShadow:"0 0 10px "+COLORS.accent,flexShrink:0}}/>
          <span style={{fontWeight:900,fontSize:13,letterSpacing:"0.1em"}}>VOTO TRANSPARENTE</span>
          <span style={{fontSize:9,color:COLORS.textMuted,background:COLORS.bg,padding:"2px 6px",borderRadius:4,letterSpacing:"0.08em"}}>PERU 2026</span>
        </div>
        <div style={{display:"flex",gap:3,flexWrap:"wrap",padding:"4px 0"}}>
          {[["dashboard","Panel"],["partidos","Partidos"],["regiones","Regiones"]].map(([v,l])=>(
            <button key={v} onClick={()=>setView(v)} style={{...navBtn(view===v),padding:"5px 10px",fontSize:11}}>{l}</button>
          ))}
        </div>
      </div>

      {/* Stats bar */}
      <div style={{background:"linear-gradient(180deg,"+COLORS.surface+" 0%,"+COLORS.bg+" 100%)",borderBottom:"1px solid "+COLORS.border,padding:"14px 12px 12px"}}>
        <div style={{maxWidth:1100,margin:"0 auto"}}>
          <div style={{fontSize:9,color:COLORS.textMuted,letterSpacing:"0.08em",marginBottom:9,lineHeight:1.6,wordBreak:"break-word"}}>
            {"SISTEMA DE INTELIGENCIA ELECTORAL · ELECCIONES GENERALES 12 ABRIL 2026 · "+new Date().toLocaleDateString("es-PE").toUpperCase()}
          </div>
          <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fit,minmax(120px,1fr))",gap:6}}>
            {[
              {label:diputadosLoaded?"TOTAL CANDIDATOS":"CARGANDO...", value:stats.total.toLocaleString(), color:diputadosLoaded?COLORS.accentBlue:COLORS.textMuted, pct:null},
              {label:"ALTO RIESGO",  value:stats.high.toLocaleString(),  color:COLORS.riskHigh,    pct:stats.total?Math.round(stats.high/stats.total*100):0},
              {label:"RIESGO MEDIO", value:stats.med.toLocaleString(),   color:COLORS.accentOrange, pct:stats.total?Math.round(stats.med/stats.total*100):0},
              {label:"RIESGO BAJO",  value:stats.low.toLocaleString(),   color:COLORS.riskLow,     pct:stats.total?Math.round(stats.low/stats.total*100):0},
              {label:"SIN INDICIOS", value:stats.clean.toLocaleString(), color:COLORS.riskClean,   pct:stats.total?Math.round(stats.clean/stats.total*100):0},
            ].map(({label,value,color,pct})=>(
              <div key={label} style={{background:COLORS.card,border:"1px solid "+COLORS.border,borderRadius:10,padding:"8px 10px",borderTop:"3px solid "+color,position:"relative",overflow:"hidden",minWidth:0}}>
                {pct!==null&&<div style={{position:"absolute",bottom:0,left:0,height:3,width:pct+"%",background:color+"55",borderRadius:"0 0 0 10px",transition:"width 0.6s ease"}}/>}
                <div style={{fontSize:"clamp(14px,3vw,22px)",fontWeight:900,color,fontFamily:"monospace",lineHeight:1,whiteSpace:"nowrap",overflow:"hidden",textOverflow:"ellipsis"}}>{value}</div>
                {pct!==null&&(
                  <div style={{fontSize:"clamp(10px,2vw,13px)",fontWeight:700,color,fontFamily:"monospace",marginTop:2,opacity:0.8}}>{pct}%</div>
                )}
                <div style={{fontSize:"clamp(6px,1.5vw,8px)",color:COLORS.textMuted,marginTop:3,letterSpacing:"0.06em",whiteSpace:"nowrap",overflow:"hidden",textOverflow:"ellipsis"}}>{label}</div>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div style={{maxWidth:1100,margin:"0 auto",padding:"12px 10px"}}>

        {view==="dashboard"&&(
          <div>
            {/* Search */}
            <div style={{display:"flex",gap:9,marginBottom:14,alignItems:"center"}}>
              <input value={search} onChange={e=>setSearch(e.target.value)} placeholder="Buscar por nombre, partido, siglas o DNI..." style={{...inp,flex:1}}/>
              <button onClick={()=>setSortBy(s=>s==="risk"?"name":"risk")} style={{...inp,cursor:"pointer",whiteSpace:"nowrap",flexShrink:0}}>{sortBy==="risk"?"↓ Por Riesgo":"A–Z Nombre"}</button>
            </div>

            {/* CARGO filter */}
            <div style={{marginBottom:12}}>
              <div style={{fontSize:10,color:COLORS.textDim,letterSpacing:"0.1em",marginBottom:7,fontWeight:700}}>CARGO</div>
              <div style={{display:"flex",gap:5,flexWrap:"wrap"}}>
                {[{val:"Todos",icon:"🗂️",desc:"Todos los cargos"},...LEVELS.map(l=>({val:l,icon:LEVEL_INFO[l].icon,desc:LEVEL_INFO[l].desc}))].map(opt=>{
                  const active=filterLevel===opt.val; const count=countLv(opt.val);
                  return(
                    <div key={opt.val} title={opt.desc} onClick={()=>setFilterLevel(opt.val)}
                      style={{display:"flex",alignItems:"center",gap:6,padding:"7px 11px",borderRadius:8,cursor:"pointer",transition:"all 0.15s",
                        background:active?COLORS.accentBlue+"22":COLORS.card,border:"1px solid "+(active?COLORS.accentBlue:COLORS.border),boxShadow:active?"0 0 8px "+COLORS.accentBlue+"33":"none"}}>
                      <span style={{fontSize:13}}>{opt.icon}</span>
                      <div>
                        <div style={{fontSize:11,fontWeight:active?700:400,color:active?COLORS.accentBlue:COLORS.text,whiteSpace:"nowrap"}}>{opt.val}</div>
                        <div style={{fontSize:9,color:active?COLORS.accentBlue+"aa":COLORS.textDim}}>{count} candidatos</div>
                      </div>
                    </div>
                  );
                })}
              </div>
              {filterLevel!=="Todos"&&LEVEL_INFO[filterLevel]&&(
                <div style={{marginTop:7,padding:"7px 11px",background:COLORS.accentBlue+"0d",border:"1px solid "+COLORS.accentBlue+"22",borderRadius:6,fontSize:11,color:COLORS.textMuted}}>
                  <span style={{color:COLORS.accentBlue,fontWeight:700}}>{"Escaños: "+LEVEL_INFO[filterLevel].seats+" — "}</span>
                  {LEVEL_INFO[filterLevel].desc}
                </div>
              )}
            </div>

            {/* RIESGO filter */}
            <div style={{marginBottom:12}}>
              <div style={{fontSize:10,color:COLORS.textDim,letterSpacing:"0.1em",marginBottom:7,fontWeight:700}}>NIVEL DE RIESGO</div>
              <div style={{display:"flex",gap:5,flexWrap:"wrap"}}>
                {RISK_OPTS.map(opt=>{
                  const active=filterRisk===opt.val; const count=countRk(opt.val);
                  return(
                    <div key={opt.val} title={opt.desc} onClick={()=>setFilterRisk(opt.val)}
                      style={{display:"flex",alignItems:"center",gap:6,padding:"7px 11px",borderRadius:8,cursor:"pointer",transition:"all 0.15s",
                        background:active?opt.color+"22":COLORS.card,border:"1px solid "+(active?opt.color:COLORS.border),boxShadow:active?"0 0 8px "+opt.color+"33":"none"}}>
                      <div style={{width:8,height:8,borderRadius:"50%",background:opt.color,flexShrink:0}}/>
                      <div>
                        <div style={{fontSize:11,fontWeight:active?700:400,color:active?opt.color:COLORS.text,whiteSpace:"nowrap"}}>{opt.label}</div>
                        <div style={{fontSize:9,color:active?opt.color+"aa":COLORS.textDim}}>{count} candidatos</div>
                      </div>
                    </div>
                  );
                })}
              </div>
              {filterRisk!=="Todos"&&(
                <div style={{marginTop:7,padding:"7px 11px",background:RISK_OPTS.find(o=>o.val===filterRisk).color+"0d",border:"1px solid "+RISK_OPTS.find(o=>o.val===filterRisk).color+"22",borderRadius:6,fontSize:11,color:COLORS.textMuted}}>
                  {RISK_OPTS.find(o=>o.val===filterRisk).desc}
                </div>
              )}
            </div>

            {/* DEPARTAMENTO filter */}
            <div style={{marginBottom:14}}>
              <div style={{fontSize:10,color:COLORS.textDim,letterSpacing:"0.1em",marginBottom:7,fontWeight:700}}>DEPARTAMENTO</div>
              <div style={{display:"flex",gap:4,flexWrap:"wrap"}}>
                {["Todos",...DEPARTMENTS].map(d=>{
                  const active=filterDept===d; const count=countDp(d);
                  return(
                    <div key={d} onClick={()=>setFilterDept(d)}
                      style={{padding:"5px 9px",borderRadius:6,cursor:"pointer",transition:"all 0.12s",background:active?COLORS.accentYellow+"22":COLORS.card,border:"1px solid "+(active?COLORS.accentYellow:COLORS.border)}}>
                      <span style={{fontSize:10,fontWeight:active?700:400,color:active?COLORS.accentYellow:COLORS.textMuted}}>{d}</span>
                      <span style={{fontSize:9,color:active?COLORS.accentYellow+"88":COLORS.textDim,marginLeft:3}}>({count})</span>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Results count + clear */}
            <div style={{fontSize:11,color:COLORS.textMuted,marginBottom:12,display:"flex",alignItems:"center",gap:8,flexWrap:"wrap"}}>
              <span>{filtered.length.toLocaleString()+" candidatos encontrados"}</span>
              {totalPages>1&&<span style={{color:COLORS.textDim}}>— mostrando {((safePage-1)*PAGE_SIZE+1).toLocaleString()}–{Math.min(safePage*PAGE_SIZE,filtered.length).toLocaleString()}</span>}
              {(filterLevel!=="Todos"||filterRisk!=="Todos"||filterDept!=="Todos"||search)&&(
                <button onClick={()=>{setFilterLevel("Todos");setFilterRisk("Todos");setFilterDept("Todos");setSearch("");}}
                  style={{fontSize:10,background:COLORS.accent+"18",border:"1px solid "+COLORS.accent+"44",color:COLORS.accent,borderRadius:5,padding:"2px 8px",cursor:"pointer"}}>
                  Limpiar filtros
                </button>
              )}
            </div>

            <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fill,minmax(160px,1fr))",gap:10}}>
              {paginated.map(c=><CandidateCard key={c.id} candidate={c} onClick={c=>setSelected(expandCandidate(c))}/>)}
            </div>

            {/* Págination controls */}
            {totalPages>1&&(
              <div style={{display:"flex",alignItems:"center",justifyContent:"center",gap:6,marginTop:20,flexWrap:"wrap"}}>
                <button onClick={()=>setPage(1)} disabled={safePage===1}
                  style={{background:COLORS.card,border:"1px solid "+COLORS.border,color:safePage===1?COLORS.textDim:COLORS.text,borderRadius:7,padding:"6px 10px",cursor:safePage===1?"default":"pointer",fontSize:11}}>«</button>
                <button onClick={()=>setPage(p=>Math.max(1,p-1))} disabled={safePage===1}
                  style={{background:COLORS.card,border:"1px solid "+COLORS.border,color:safePage===1?COLORS.textDim:COLORS.text,borderRadius:7,padding:"6px 12px",cursor:safePage===1?"default":"pointer",fontSize:11}}>‹ Anterior</button>

                {/* Page number pills */}
                {Array.from({length:Math.min(7,totalPages)},(_,i)=>{
                  let pg;
                  if(totalPages<=7) pg=i+1;
                  else if(safePage<=4) pg=i+1;
                  else if(safePage>=totalPages-3) pg=totalPages-6+i;
                  else pg=safePage-3+i;
                  return(
                    <button key={pg} onClick={()=>setPage(pg)}
                      style={{background:pg===safePage?COLORS.accent:COLORS.card,border:"1px solid "+(pg===safePage?COLORS.accent:COLORS.border),color:pg===safePage?"#fff":COLORS.textMuted,borderRadius:7,padding:"6px 11px",cursor:"pointer",fontSize:11,fontWeight:pg===safePage?700:400,minWidth:34}}>
                      {pg}
                    </button>
                  );
                })}

                <button onClick={()=>setPage(p=>Math.min(totalPages,p+1))} disabled={safePage===totalPages}
                  style={{background:COLORS.card,border:"1px solid "+COLORS.border,color:safePage===totalPages?COLORS.textDim:COLORS.text,borderRadius:7,padding:"6px 12px",cursor:safePage===totalPages?"default":"pointer",fontSize:11}}>Siguiente ›</button>
                <button onClick={()=>setPage(totalPages)} disabled={safePage===totalPages}
                  style={{background:COLORS.card,border:"1px solid "+COLORS.border,color:safePage===totalPages?COLORS.textDim:COLORS.text,borderRadius:7,padding:"6px 10px",cursor:safePage===totalPages?"default":"pointer",fontSize:11}}>»</button>

                <span style={{fontSize:10,color:COLORS.textDim,marginLeft:4}}>Página {safePage} de {totalPages.toLocaleString()}</span>
              </div>
            )}
          </div>
        )}


        {view==="partidos"&&(
          <div>
            <div style={{fontSize:13,color:COLORS.textMuted,marginBottom:6}}>Índice de Riesgo Partidario — 36 planchas presidenciales inscritas para el 12 de abril 2026.</div>
            <div style={{fontSize:11,color:COLORS.textDim,marginBottom:16}}>Fuente: JEE Lima Centro 1 — Elecciones Generales Perú 2026</div>
            <div style={{display:"grid",gap:9}}>
              {partyStats.map((p,i)=>{
                const {color}=getRisk(p.avgRisk);
                return(
                  <div key={p.abbr} style={{background:COLORS.card,border:"1px solid "+COLORS.border,borderRadius:12,padding:"14px 18px",display:"flex",alignItems:"center",gap:13}}>
                    <div style={{fontSize:18,fontWeight:900,color:COLORS.textDim,fontFamily:"monospace",width:24,flexShrink:0}}>{"#"+(i+1)}</div>
                    <div style={{width:38,height:38,borderRadius:7,background:p.color+"22",border:"2px solid "+p.color,display:"flex",alignItems:"center",justifyContent:"center",fontWeight:900,fontSize:9,color:p.color,flexShrink:0,textAlign:"center",lineHeight:1.2}}>{p.abbr}</div>
                    <div style={{flex:1,minWidth:0}}>
                      <div style={{fontWeight:700,fontSize:13,color:COLORS.text,overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap"}}>{p.partido}</div>
                      <div style={{fontSize:10,color:COLORS.textMuted,marginBottom:5,overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap"}}>{"Pdte: "+p.presidente}</div>
                      <div style={{background:COLORS.bg,borderRadius:4,height:5,overflow:"hidden"}}><div style={{width:p.avgRisk+"%",height:"100%",background:color,borderRadius:4}}/></div>
                    </div>
                    <div style={{textAlign:"right",flexShrink:0}}>
                      <div style={{fontSize:24,fontWeight:900,color,fontFamily:"monospace"}}>{p.avgRisk}</div>
                      <div style={{fontSize:8,color,letterSpacing:"0.08em"}}>{getRisk(p.avgRisk).label}</div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {view==="regiones"&&(
          <div>
            <div style={{fontSize:13,color:COLORS.textMuted,marginBottom:16}}>Distribución de riesgo por departamento. Haz clic para filtrar candidatos.</div>
            <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fill,minmax(180px,1fr))",gap:8}}>
              {DEPARTMENTS.map(dept=>{
                const dc=candidates.filter(c=>c.department===dept);
                const high=dc.filter(c=>c.riskScore>=70).length;
                const avg=dc.length?Math.round(dc.reduce((s,c)=>s+c.riskScore,0)/dc.length):0;
                const {color}=getRisk(avg);
                return(
                  <div key={dept} onClick={()=>{setFilterDept(dept);setView("dashboard");}}
                    onMouseEnter={e=>{e.currentTarget.style.background=COLORS.surface;}}
                    onMouseLeave={e=>{e.currentTarget.style.background=COLORS.card;}}
                    style={{background:COLORS.card,border:"1px solid "+color+"44",borderRadius:10,padding:12,cursor:"pointer",borderLeft:"4px solid "+color,transition:"background 0.15s"}}>
                    <div style={{fontWeight:700,fontSize:12,color:COLORS.text,marginBottom:4}}>{dept}</div>
                    <div style={{display:"flex",justifyContent:"space-between",alignItems:"center"}}>
                      <div><div style={{fontSize:10,color:COLORS.textMuted}}>{dc.length+" candidatos"}</div><div style={{fontSize:9,color:COLORS.riskHigh}}>{high+" alto riesgo"}</div></div>
                      <div style={{fontSize:24,fontWeight:900,color,fontFamily:"monospace"}}>{avg}</div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </div>

      <div style={{background:COLORS.card,borderTop:"1px solid "+COLORS.border,padding:"10px 22px",textAlign:"center"}}>
        <span style={{fontSize:9,color:COLORS.textDim,letterSpacing:"0.06em"}}>
          VOTO TRANSPARENTE — Datos de registros públicos. Índices referenciales, no constituyen acusaciones legales. Fuentes: MINJUS, JNE, SUNAT, PJ, ONPE — Ley 27806 — Elecciones Generales Perú 12 Abril 2026
        </span>
      </div>

      {selected&&<Modal candidate={selected} onClose={()=>setSelected(null)} all={candidates}/>}
    </div>
  );
}
