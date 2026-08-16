const xlsx = require('xlsx');
const fs = require('fs');

const sanitize = (str) => {
  let s = str.normalize('NFD').replace(/[\u0300-\u036f]/g, '').toUpperCase().replace(/[^A-Z0-9]/g, '_').replace(/_+/g, '_').replace(/^_|_$/g, '');
  return s.match(/^[0-9]/) ? '_' + s : s;
};

const wb1 = xlsx.readFile('../test/Book1.xlsx');
const data1 = xlsx.utils.sheet_to_json(wb1.Sheets[wb1.SheetNames[0]], {header:1}).map(r=>r[0]).filter(Boolean);
let enum1 = 'enum NewSchoolCity {\n' + data1.map(c => '  ' + sanitize(c) + ' @map("' + c.replace(/"/g, '\\"') + '")').join('\n') + '\n}\n';

const wb2 = xlsx.readFile('../test/Book2.xlsx');
const data2 = xlsx.utils.sheet_to_json(wb2.Sheets[wb2.SheetNames[0]], {header:1}).map(r=>r[0]).filter(Boolean);
let enum2 = 'enum SchoolCountry {\n' + data2.map(c => '  ' + sanitize(c) + ' @map("' + c.replace(/"/g, '\\"') + '")').join('\n') + '\n}\n';

fs.writeFileSync('enums.prisma', enum1 + '\n' + enum2);
