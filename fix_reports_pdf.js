const fs = require('fs');
let content = fs.readFileSync('client/src/pages/Reports.jsx', 'utf-8');

// Replace doc.autoTable with autoTable(doc
content = content.replace(/import 'jspdf-autotable';/g, "import autoTable from 'jspdf-autotable';");
content = content.replace(/import jsPDF from 'jspdf';/g, "import { jsPDF } from 'jspdf';");
content = content.replace(/doc\.autoTable\(\{/g, "autoTable(doc, {");

fs.writeFileSync('client/src/pages/Reports.jsx', content);
