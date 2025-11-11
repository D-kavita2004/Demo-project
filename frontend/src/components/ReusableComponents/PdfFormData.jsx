import pdfMake from "pdfmake/build/pdfmake";
import pdfFonts from "pdfmake/build/vfs_fonts";

pdfMake.vfs = pdfFonts?.default?.vfs || pdfFonts.vfs;

const generateQualityFormPDF = (formData) => {
  const docDefinition = {
    pageSize: "A4",
    pageMargins: [40, 60, 40, 60],

    content: [
      // ===== Main Header =====
      { text: "QUALITY CHECK FORM REPORT", style: "mainHeader" },
      { text: "\n" },

      // ===== 1️Issuing Section =====
      { text: "1️ Issuing Section", style: "sectionHeader" ,bold: true,
      color: '#000000',
      fontSize: 16,
      margin: [0, 9, 0, 5],},
  //     { text: "Issued Details", style: "subHeader"
  // },
      {
        table: {
          widths: ["35%", "65%"],
          body: Object.entries({
            "Receiving No": formData.receivingNo,
            "Reference No": formData.referenceNo,
            "Part Name": formData.partName,
            "Subject Matter": formData.subjectMatter,
            "Approved By": formData.approved,
            "Checked By": formData.checked,
            "Issued To": formData.issued,
          }).map(([key, value]) => [
            { text: key, bold: true, fillColor: "#e6f0ff", margin: [2, 4, 2, 4] },
            { text: value || "-", margin: [2, 4, 2, 4] },
          ]),
        },
        layout: {
          fillColor: (rowIndex) => (rowIndex % 2 === 0 ? "#f9f9f9" : null),
          hLineWidth: () => 0.5,
          vLineWidth: () => 0.5,
        },
      },
      { text: "\n" },

      // ===== 2 Defectiveness Details =====
      { text: "2️ Defectiveness Details", style: "sectionHeader",bold: true, color: '#000000', fontSize: 16, margin: [0, 9, 0, 5] },
      // { text: "Defect & Process Info", style: "subHeader" },
      {
        table: {
          widths: ["35%", "65%"],
          body: Object.entries({
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
            "Product Image": formData.productImage,
            "Manager Instructions": formData.managerInstructions,
          }).map(([key, value]) => [
            { text: key, bold: true, fillColor: "#e6f0ff", margin: [2, 4, 2, 4] },
            { text: value || "-", margin: [2, 4, 2, 4] },
          ]),
        },
        layout: "lightHorizontalLines",
      },
      { text: "\n" },

      // ===== 3 Quality Check Comments =====
      { text: "3️ Quality Check Comments", style: "sectionHeader",bold: true, color: '#000000', fontSize: 16, margin: [0, 9, 0, 5] },
      // { text: "QC Details", style: "subHeader" },
      {
        table: {
          widths: ["35%", "65%"],
          body: Object.entries({
            "QC Comment": formData.qcComment,
            "Approval Status": formData.approvalStatus,
            "Checked By QC": formData.checkedByQC,
            "QC Instructions": formData.qcInstructions,
            "Defect Cost": `${formData.defectCost} / ${formData.unit}`,
            "Occurrence Section": formData.occurrenceSection,
            "Importance Level": formData.importanceLevel,
            "Report Time Limit": formData.reportTimeLimit,
          }).map(([key, value]) => [
            { text: key, bold: true, fillColor: "#e6f0ff", margin: [2, 4, 2, 4] },
            { text: value || "-", margin: [2, 4, 2, 4] },
          ]),
        },
        layout: "lightHorizontalLines",
      },
      { text: "\n" },

      // ===== 4️ Measures Report =====
      { text: "4️ Measures Report", style: "sectionHeader",bold: true, color: '#000000', fontSize: 16, margin: [0, 9, 0, 5] },
      // { text: "Corrective Actions & Measures", style: "subHeader" },
      {
        table: {
          widths: ["35%", "65%"],
          body: Object.entries({
            "Measures Report": formData.measuresReport,
            "Responsible Section": formData.responsibleSection,
            "Cause Details": formData.causeDetails,
            "Countermeasures": formData.countermeasures,
            "Enforcement Date": formData.enforcementDate,
            "Standardization": formData.standardization,
          }).map(([key, value]) => [
            { text: key, bold: true, fillColor: "#e6f0ff", margin: [2, 4, 2, 4] },
            { text: value || "-", margin: [2, 4, 2, 4] },
          ]),
        },
        layout: "lightHorizontalLines",
      },
      { text: "\n" },

      // ===== 5️ Results of Measures =====
      { text: "5️ Results of Measures", style: "sectionHeader" ,bold: true, color: '#000000', fontSize: 16, margin: [0, 9, 0, 5]},
      // { text: "Outcome & Effectiveness", style: "subHeader" },
      {
        table: {
          widths: ["35%", "65%"],
          body: Object.entries({
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
          }).map(([key, value]) => [
            { text: key, bold: true, fillColor: "#e6f0ff", margin: [2, 4, 2, 4] },
            { text: value || "-", margin: [2, 4, 2, 4] },
          ]),
        },
        layout: "lightHorizontalLines",
      },
      { text: "\n\n" },

      // ===== Signature Section =====
      // { text: "Signatures", style: "sectionHeader" },
      // {
      //   columns: [
      //     { text: "Checked By:\n\n__________________", width: "33%" },
      //     { text: "Approved By:\n\n__________________", width: "33%" },
      //     { text: "Issued By:\n\n__________________", width: "33%" },
      //   ],
      // },
    ],

    styles: {
      mainHeader: {
        fontSize: 18,
        bold: true,
        alignment: "center",
        color: "#004aad",
        margin: [0, 0, 0, 15],
      },
      sectionHeader: {
        fontSize: 14,
        bold: true,
        color: "#ffffff",
        fillColor: "#004aad",
        margin: [0, 10, 0, 6],
        alignment: "left",
        padding: [5, 5, 5, 5],
      },
      subHeader: {
        fontSize: 12,
        bold: true,
        color: "#004aad",
        margin: [0, 8, 0, 4],
      },
    },

    defaultStyle: {
      fontSize: 10,
      lineHeight: 1.3,
    },

    footer: (currentPage, pageCount) => ({
      text: `Page ${currentPage} of ${pageCount}`,
      alignment: "center",
      fontSize: 9,
      margin: [0, 0, 0, 10],
    }),
  };

  // Open PDF in new tab for live preview
  pdfMake.createPdf(docDefinition).open();
};

export default generateQualityFormPDF;
