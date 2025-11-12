import * as XLSX from "xlsx";
import { saveAs } from "file-saver";

const generateQualityFormExcel = (data) => {
  const formData = data.formData;

  // Structure data section-wise, similar to your PDF
  const sections = [
    {
      title: "1. Issuing Section",
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
      title: "2. Defectiveness Details",
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
      title: "3. Quality Check Comments",
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
      title: "4. Measures Report",
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
      title: "5. Results of Measures",
      data: {
        "Enforcement Date (Result)": formData.enforcementDateResult,
        "Result": formData.enforcementResult,
        "Judgment": formData.enforcementJudgment,
        "Section In-Charge": formData.enforcementSecInCharge,
        "QC Section": formData.enforcementQCSection,
        "Approved": formData.enforcementApproved ? "Yes" : "No",
        "Effect Date": formData.effectDate,
        "Effect Result": formData.effectResult,
        "Effect Judgment": formData.effectJudgment,
        "Effect Section In-Charge": formData.effectSecInCharge,
        "Effect QC Section": formData.effectQCSection,
        "Effect Approved": formData.effectApproved ? "Yes" : "No",
      },
    },
  ];

  const sheetData = [["QUALITY CHECK REPORT"], []];

  // Fill data
  sections.forEach((section) => {
    sheetData.push([section.title]);
    Object.entries(section.data).forEach(([key, value]) => {
      sheetData.push([key, value ?? "-"]);
    });
    sheetData.push([]);
  });

  const worksheet = XLSX.utils.aoa_to_sheet(sheetData);
  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, worksheet, "Quality Form");

  // 🔗 Add hyperlink for Product Image
  if (formData.productImage) {
    // Find the row index for "Product Image"
    const imageRowIndex = sheetData.findIndex((row) => row[0] === "Product Image");

    if (imageRowIndex !== -1) {
      const cellRef = XLSX.utils.encode_cell({ r: imageRowIndex, c: 1 }); // Column B
      const cell = worksheet[cellRef];

      if (cell) {
        // Add hyperlink metadata
        cell.l = {
          Target: formData.productImage,
          Tooltip: "Click to open image in browser",
        };
      }
    }
  }

  // Auto-fit columns
  const maxWidths = sheetData[0].map((_, colIndex) =>
    Math.max(...sheetData.map((row) => (row[colIndex] ? row[colIndex].toString().length : 0)))
  );
  worksheet["!cols"] = maxWidths.map((w) => ({ wch: w + 4 }));

  // Export Excel file
  const excelBuffer = XLSX.write(workbook, { bookType: "xlsx", type: "array" });
  const blob = new Blob([excelBuffer], { type: "application/octet-stream" });
  saveAs(blob, `${formData.partName || "Quality_Form"}_Report.xlsx`);
};

export default generateQualityFormExcel;
