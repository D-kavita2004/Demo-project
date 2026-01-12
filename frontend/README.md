import XLSX from "xlsx-js-style";

const generateQualityFormExcel = (data) => {
  const formData = data.formData;
  const historyData = data.history || []; // array of objects

  // ================= REGULAR SECTIONS =================
  const sections = [
    {
      title: "1. ISSUING SECTION",
      data: {
        "Receiving No": formData.issuingSection.receivingNo,
        "Reference No": formData.issuingSection.referenceNo,
        "Part Name": formData.issuingSection.part.partName,
        "Subject Matter": formData.issuingSection.subjectMatter,
        "Approved By": formData.issuingSection.approved,
        "Checked By": formData.issuingSection.checked,
        "Issued BY": formData.issuingSection.issued,
      },
    },
    {
      title: "2. DEFECTIVENESS DETAILS",
      data: {
        "Supplier Name": formData.defectivenessDetail.supplier.supplierName,
        "Group Name": formData.defectivenessDetail.groupName,
        "State of Process": formData.defectivenessDetail.stateOfProcess,
        "Associated Lot No": formData.defectivenessDetail.associatedLotNo,
        "Discovered Date": formData.defectivenessDetail.discoveredDate,
        "Issue Date": formData.defectivenessDetail.issueDate,
        "Order No": formData.defectivenessDetail.orderNo,
        "Drawing No": formData.defectivenessDetail.drawingNo,
        "Process Name": formData.defectivenessDetail.process.processName,
        "Machine Name": formData.defectivenessDetail.machine.machineName,
        "Total Quantity": formData.defectivenessDetail.totalQuantity,
        "Used Quantity": formData.defectivenessDetail.usedQuantity,
        "Residual Quantity": formData.defectivenessDetail.residualQuantity,
        "Defect Rate (%)": formData.defectivenessDetail.defectRate,
        "Product Image": formData.defectivenessDetail.productImage ? "Click to View Image" : "-",
        "Manager Instructions": formData.defectivenessDetail.managerInstructions,
      },
    },
    {
      title: "3. QUALITY CHECK COMMENTS",
      data: {
        "QC Comment": formData.qualityCheckComment.qcComment,
        "QC Instructions": formData.qualityCheckComment.qcInstructions,
        "Defect Cost": `${formData.qualityCheckComment.defectCost} / ${formData.unit}`,
        "Unit": formData.qualityCheckComment.unit,
        "Importance Level": formData.qualityCheckComment.importanceLevel,
        "Report Time Limit": formData.qualityCheckComment.reportTimeLimit,
      },
    },
    {
      title: "4. MEASURES REPORT",
      data: {
        "Causes of Occurance": formData.measuresReport.causesOfOccurrence,
        "Causes Of Outflow": formData.measuresReport.causesOfOutflow,
        "Counter Measures For Causes": formData.measuresReport.counterMeasuresForCauses,
        "Counter Measures For Outflow": formData.measuresReport.counterMeasuresForOutflow,
        "Enforcement Date": formData.measuresReport.enforcementDate,
        "Standardization": formData.measuresReport.standardization,
      },
    },
    {
      title: "5. RESULTS OF MEASURES ENFORCEMENT",
      data: {
        "Enforcement Date (Result)": formData.resultsOfMeasuresEnforcement.enforcementDateResult,
        "Result": formData.resultsOfMeasuresEnforcement.enforcementResult,
        "Judgment": formData.resultsOfMeasuresEnforcement.enforcementJudgment,
        "Section In-Charge": formData.resultsOfMeasuresEnforcement.enforcementSecInCharge,
        "QC Section": formData.resultsOfMeasuresEnforcement.enforcementQCSection,
      },
    },
    {
      title: "6. RESULTS OF MEASURES EFFECT",
      data: {
        "Effect Date": formData.resultsOfMeasuresEffect.effectDate,
        "Effect Result": formData.resultsOfMeasuresEffect.effectResult,
        "Effect Judgment": formData.resultsOfMeasuresEffect.effectJudgment,
        "Effect Section In-Charge": formData.resultsOfMeasuresEffect.effectSecInCharge,
        "Effect QC Section": formData.resultsOfMeasuresEffect.effectQCSection,
      },
    },
  ];

  // ================= PREPARE SHEET DATA =================
  const sheetData = [["QUALITY CHECK REPORT", ""]];
  sheetData.push(["", ""]);
  sheetData.push(["", ""]);

  // Add main sections
  sections.forEach((section) => {
    sheetData.push([section.title, ""]);
    Object.entries(section.data).forEach(([key, value]) => {
      sheetData.push([key, value ?? "-"]);
    });
    sheetData.push(["", ""]); // spacing
  });

  // Add history
// ================= HISTORY =================
if (historyData.length > 0) {
  const historyHeaderRow = sheetData.length;
  sheetData.push(["HISTORY", ""]);
  sheetData.push(["", ""]);
  historyData.forEach((entry, index) => {
    // Revision title stays in column 1
    sheetData.push([`Revision ${index + 1}`, "MEASURES REPORT"]);

    // ---------- MEASURES REPORT ----------

    const mr = entry.data.measuresReport || {};

    Object.entries({
      "Causes of Occurance": mr.causesOfOccurrence,
      "Causes Of Outflow": mr.causesOfOutflow,
      "Counter Measures For Causes": mr.counterMeasuresForCauses,
      "Counter Measures For Outflow": mr.counterMeasuresForOutflow,
      "Enforcement Date": mr.enforcementDate,
      "Standardization": mr.standardization,
    }).forEach(([key, value]) => {
      sheetData.push(["", `${key}: ${value ?? "-"}`]);
    });

    sheetData.push(["", ""]);

    // ---------- RESULTS OF MEASURES ENFORCEMENT ----------
    sheetData.push(["", "RESULTS OF MEASURES ENFORCEMENT"]);
    const rm = entry.data.resultsOfMeasuresEnforcement || {};

    Object.entries({
      "Enforcement Date (Result)": rm.enforcementDateResult,
      "Result": rm.enforcementResult,
      "Judgment": rm.enforcementJudgment,
      "Section In-Charge": rm.enforcementSecInCharge,
      "QC Section": rm.enforcementQCSection,
    }).forEach(([key, value]) => {
      sheetData.push(["", `${key}: ${value ?? "-"}`]);
    });

    sheetData.push(["", ""]); // spacing after each revision
  });
  let merges = [];
  // Merge HISTORY heading into 2 columns
  merges.push({
  s: { r: historyHeaderRow, c: 0 },
  e: { r: historyHeaderRow, c: 1 },
});

}


  // ================= CREATE WORKSHEET =================
  const ws = XLSX.utils.aoa_to_sheet(sheetData);
  
  // Merge main title
  ws["!merges"] = [{ s: { r: 0, c: 0 }, e: { r: 0, c: 1 } }];

  // Column widths
  ws["!cols"] = [{ wch: 30 }, { wch: 50 }];

// ================= APPLY STYLING =================
sheetData.forEach((row, r) => {
  row.forEach((cellValue, c) => {
    const cellRef = XLSX.utils.encode_cell({ r, c });
    const cell = ws[cellRef];
    if (!cell) return;

    // ================= MAIN TITLE =================
    if (r === 0) {
      cell.s = {
        font: { bold: true, sz: 18, color: { rgb: "FFFFFF" } },
        fill: { fgColor: { rgb: "1F3A5F" } }, // deep navy
        alignment: { horizontal: "center", vertical: "center" },
      };
    }

    // ================= HISTORY HEADER =================
    else if (cellValue === "HISTORY") {
      cell.s = {
        font: { bold: true, sz: 14, color: { rgb: "FFFFFF" } },
        fill: { fgColor: { rgb: "404040" } }, // charcoal gray
        alignment: { horizontal: "left" },
      };
    }

    // ================= REVISION HEADER =================
    else if (/^Revision \d+$/.test(cellValue)) {
      cell.s = {
        font: { bold: true, sz: 13, color: { rgb: "FFFFFF" } },
        fill: { fgColor: { rgb: "3A6F7D" } }, // muted teal
        alignment: { horizontal: "left" },
      };
    }

    // ================= HISTORY SUB-SECTIONS =================
    else if (
      cellValue === "MEASURES REPORT" ||
      cellValue === "RESULTS OF MEASURES ENFORCEMENT"
    ) {
      cell.s = {
        font: { bold: true, sz: 12, color: { rgb: "FFFFFF" } },
        fill: { fgColor: { rgb: "6B7C93" } }, // slate blue
        alignment: { horizontal: "left" },
      };
    }

    // ================= NORMAL SECTION HEADERS =================
    else if (sections.map((s) => s.title).includes(cellValue)) {
      cell.s = {
        font: { bold: true, sz: 14, color: { rgb: "FFFFFF" } },
        fill: { fgColor: { rgb: "2F5597" } }, // steel blue
        alignment: { horizontal: "left" },
      };
    }

    // ================= KEY CELLS =================
    else if (c === 0 && cellValue !== "") {
      cell.s = {
        font: { bold: true, color: { rgb: "000000" } },
        fill: { fgColor: { rgb: "EEF2F7" } }, // light gray-blue
        border: {
          top: { style: "thin", color: { rgb: "A6A6A6" } },
          bottom: { style: "thin", color: { rgb: "A6A6A6" } },
          left: { style: "thin", color: { rgb: "A6A6A6" } },
          right: { style: "thin", color: { rgb: "A6A6A6" } },
        },
      };
    }

    // ================= VALUE CELLS =================
    else if (c === 1) {
      cell.s = {
        font: { color: { rgb: "333333" } },
        alignment: { wrapText: true },
        border: {
          top: { style: "thin", color: { rgb: "D0D0D0" } },
          bottom: { style: "thin", color: { rgb: "D0D0D0" } },
          left: { style: "thin", color: { rgb: "D0D0D0" } },
          right: { style: "thin", color: { rgb: "D0D0D0" } },
        },
      };
    }
  });
});



  // Hyperlink for Product Image
  if (formData.defectivenessDetail.productImage) {
    const row = sheetData.findIndex((r) => r[0] === "Product Image");
    if (row !== -1) {
      const ref = XLSX.utils.encode_cell({ r: row, c: 1 });
      ws[ref].l = { Target: formData.defectivenessDetail.productImage, Tooltip: "Click to open image" };
    }
  }

  // ================= CREATE WORKBOOK =================
  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, "Quality Form");

  XLSX.writeFile(wb, `${formData.issuingSection.part.partName || "Quality_Form"}_Report.xlsx`);
};

export default generateQualityFormExcel;




// purple