import XLSX from "xlsx-js-style";

const generateQualityFormExcel = (data) => {
  const formData = data.formData;

  // Section structure
  const sections = [
    {
      title: "1. ISSUING SECTION",
      data: {
        "Receiving No": formData.receivingNo,
        "Reference No": formData.referenceNo,
        "Part Name": formData.partName,
        "Subject Matter": formData.subjectMatter,
        "Approved By": formData.approved,
        "Checked By": formData.checked,
        "Issued To": formData.issued,
      },
    },
    {
      title: "2. DEFECTIVENESS DETAILS",
      data: {
        "Supplier Name": formData.supplierName,
        "Group Name": formData.groupName,
        "State of Process": formData.stateOfProcess,
        "Associated Lot No": formData.associatedLotNo,
        "Discovered Date": formData.discoveredDate,
        "Issue Date": formData.issueDate,
        "Order No": formData.orderNo,
        "Drawing No": formData.drawingNo,
        "Process Name": formData.processName,
        "Machine Name": formData.machineName,
        "Total Quantity": formData.totalQuantity,
        "Used Quantity": formData.usedQuantity,
        "Residual Quantity": formData.residualQuantity,
        "Defect Rate (%)": formData.defectRate,
        "Product Image": formData.productImage ? "Click to View Image" : "-",
        "Manager Instructions": formData.managerInstructions,
      },
    },
    {
      title: "3. QUALITY CHECK COMMENTS",
      data: {
        "QC Comment": formData.qcComment,
        "Approval Status": formData.approvalStatus,
        "Checked By QC": formData.checkedByQC,
        "QC Instructions": formData.qcInstructions,
        "Defect Cost": `${formData.defectCost} / ${formData.unit}`,
        "Occurrence Section": formData.occurrenceSection,
        "Importance Level": formData.importanceLevel,
        "Report Time Limit": formData.reportTimeLimit,
      },
    },
    {
      title: "4. MEASURES REPORT",
      data: {
        "Measures Report": formData.measuresReport,
        "Responsible Section": formData.responsibleSection,
        "Cause Details": formData.causeDetails,
        "Countermeasures": formData.countermeasures,
        "Enforcement Date": formData.enforcementDate,
        "Standardization": formData.standardization,
      },
    },
    {
      title: "5. RESULTS OF MEASURES",
      data: {
        "Enforcement Date (Result)": formData.enforcementDateResult,
        "Result": formData.enforcementResult,
        "Judgment": formData.enforcementJudgment,
        "Section In-Charge": formData.enforcementSecInCharge,
        "QC Section": formData.enforcementQCSection,
        Approved: formData.enforcementApproved ? "Yes" : "No",
        "Effect Date": formData.effectDate,
        "Effect Result": formData.effectResult,
        "Effect Judgment": formData.effectJudgment,
        "Effect Section In-Charge": formData.effectSecInCharge,
        "Effect QC Section": formData.effectQCSection,
        "Effect Approved": formData.effectApproved ? "Yes" : "No",
      },
    },
  ];

  // Prepare sheet data
  const sheetData = [["QUALITY CHECK REPORT", ""]];
  sections.forEach((section) => {
    sheetData.push([section.title, ""]);
    Object.entries(section.data).forEach(([key, value]) => {
      sheetData.push([key, value ?? "-"]);
    });
    sheetData.push(["", ""]); // spacing row
  });

  const ws = XLSX.utils.aoa_to_sheet(sheetData);

  // Merge main title
  ws["!merges"] = [{ s: { r: 0, c: 0 }, e: { r: 0, c: 1 } }];

  // Column widths
  ws["!cols"] = [{ wch: 30 }, { wch: 50 }];

  // Styling
  sheetData.forEach((row, r) => {
    row.forEach((cellValue, c) => {
      const cellRef = XLSX.utils.encode_cell({ r, c });
      const cell = ws[cellRef];
      if (!cell) return;

      // Main Title
      if (r === 0) {
        cell.s = {
          font: { bold: true, sz: 18, color: { rgb: "004AAD" } },
          alignment: { horizontal: "center" },
        };
      }
      // Section Headers
      else if (cellValue && Object.keys(sections.reduce((a, s) => ({ ...a, [s.title]: 1 }), {})).includes(cellValue)) {
        cell.s = {
          font: { bold: true, sz: 14, color: { rgb: "FFFFFF" } },
          fill: { fgColor: { rgb: "004AAD" } },
          alignment: { horizontal: "left" },
        };
      }
      // Keys
      else if (c === 0 && cellValue !== "") {
        cell.s = {
          font: { bold: true },
          fill: { fgColor: { rgb: "D9E1F2" } },
          border: {
            top: { style: "thin", color: { rgb: "000000" } },
            bottom: { style: "thin", color: { rgb: "000000" } },
            left: { style: "thin", color: { rgb: "000000" } },
            right: { style: "thin", color: { rgb: "000000" } },
          },
        };
      }
      // Values
      else if (c === 1) {
        cell.s = {
          border: {
            top: { style: "thin", color: { rgb: "999999" } },
            bottom: { style: "thin", color: { rgb: "999999" } },
            left: { style: "thin", color: { rgb: "999999" } },
            right: { style: "thin", color: { rgb: "999999" } },
          },
        };
      }
    });
  });

  // Hyperlink for Product Image
  if (formData.productImage) {
    const row = sheetData.findIndex((r) => r[0] === "Product Image");
    if (row !== -1) {
      const ref = XLSX.utils.encode_cell({ r: row, c: 1 });
      ws[ref].l = { Target: formData.productImage, Tooltip: "Click to open image" };
    }
  }

  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, "Quality Form");

  XLSX.writeFile(wb, `${formData.partName || "Quality_Form"}_Report.xlsx`);
};

export default generateQualityFormExcel;
