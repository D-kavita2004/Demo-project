import pdfMake from "pdfmake/build/pdfmake";
import pdfFonts from "pdfmake/build/vfs_fonts";

pdfMake.vfs = pdfFonts?.default?.vfs || pdfFonts.vfs;

// ======================================================
// UNIVERSAL IMAGE → PNG BASE64 CONVERTER
// ======================================================
const getImageAsPngBase64 = async (imageUrl) => {
  if (!imageUrl) return null;

  try {
    const img = new Image();
    img.crossOrigin = "Anonymous";
    img.src = imageUrl;

    return new Promise((resolve, reject) => {
      img.onload = () => {
        try {
          const canvas = document.createElement("canvas");
          canvas.width = img.width;
          canvas.height = img.height;
          const ctx = canvas.getContext("2d");
          ctx.drawImage(img, 0, 0);
          const pngBase64 = canvas.toDataURL("image/png");
          resolve(pngBase64);
        } catch (error) {
          reject(error);
        }
      };
      img.onerror = reject;
    });
  } catch (err) {
    console.error("Image conversion error:", err);
    return null;
  }
};

// ======================================================
// BUILD SINGLE RECORD CONTENT
// ======================================================
const buildSingleRecord = (formData, productImageBase64) => {
  return [
    { text: `QUALITY CHECK REPORT (${formData.issuingSection.part.partName.toUpperCase()})`, style: "mainHeader" },
    { text: "\n" },

    // -------- 1. Issuing Section --------
    { text: "1️ Issuing Section", style: "sectionHeader", color: "#000" },
    {
      table: {
        widths: ["35%", "65%"],
        body: Object.entries({
          "Receiving No": formData.issuingSection.receivingNo,
          "Reference No": formData.issuingSection.referenceNo,
          "Part Name": formData.issuingSection.part.partName,
          "Subject Matter": formData.issuingSection.subjectMatter,
          "Approved By": formData.issuingSection.approved,
          "Checked By": formData.issuingSection.checked,
          "Issued BY": formData.issuingSection.issued,
        }).map(([key, value]) => [
          { text: key, bold: true, fillColor: "#e6f0ff", margin: [2, 4, 2, 4] },
          { text: value ?? "-", margin: [2, 4, 2, 4] },
        ]),
      },
      layout: "lightHorizontalLines",
    },
    { text: "\n" },

    // -------- 2. Defectiveness Details --------
    { text: "2️ Defectiveness Details", style: "sectionHeader", color: "#000" },
    {
      table: {
        widths: ["35%", "65%"],
        body: Object.entries({
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
        }).map(([key, value]) => [
          { text: key, bold: true, fillColor: "#e6f0ff", margin: [2, 4, 2, 4] },
          typeof value === "object" && value.image
            ? value
            : { text: value ?? "-", margin: [2, 4, 2, 4] },
        ]),
      },
      layout: "lightHorizontalLines",
    },
    { text: "\n" },

    // -------- 3. Quality Check Comments --------
    { text: "3️ Quality Check Comments", style: "sectionHeader", color: "#000" },
    {
      table: {
        widths: ["35%", "65%"],
        body: Object.entries({
          "QC Comment": formData.qualityCheckComment.qcComment,
          "QC Instructions": formData.qualityCheckComment.qcInstructions,
          "Defect Cost": `${formData.qualityCheckComment.defectCost} / ${formData.unit}`,
          "Unit": formData.qualityCheckComment.unit,
          "Importance Level": formData.qualityCheckComment.importanceLevel,
          "Report Time Limit": formData.qualityCheckComment.reportTimeLimit,
          }).map(([key, value]) => [
          { text: key, bold: true, fillColor: "#e6f0ff", margin: [2, 4, 2, 4] },
          { text: value ?? "-", margin: [2, 4, 2, 4] },
        ]),
      },
      layout: "lightHorizontalLines",
    },
    { text: "\n" },

    // -------- 4. Measures Report --------
    { text: "4️ Measures Report", style: "sectionHeader", color: "#000" },
    {
      table: {
        widths: ["35%", "65%"],
        body: Object.entries({
          "Causes of Occurance": formData.measuresReport.causesOfOccurrence,
          "Causes Of Outflow": formData.measuresReport.causesOfOutflow,
          "Counter Measures For Causes": formData.measuresReport.counterMeasuresForCauses,
          "Counter Measures For Outflow": formData.measuresReport.counterMeasuresForOutflow,
          "Enforcement Date": formData.measuresReport.enforcementDate,
          "Standardization": formData.measuresReport.standardization,
        }).map(([key, value]) => [
          { text: key, bold: true, fillColor: "#e6f0ff", margin: [2, 4, 2, 4] },
          { text: value ?? "-", margin: [2, 4, 2, 4] },
        ]),
      },
      layout: "lightHorizontalLines",
    },
    { text: "\n" },

    // -------- 5. Results of Measures --------
    { text: "5️ Results of Measures Enforcement", style: "sectionHeader", color: "#000" },
    {
      table: {
        widths: ["35%", "65%"],
        body: Object.entries({
         "Enforcement Date (Result)": formData.resultsOfMeasuresEnforcement.enforcementDateResult,
        "Result": formData.resultsOfMeasuresEnforcement.enforcementResult,
        "Judgment": formData.resultsOfMeasuresEnforcement.enforcementJudgment,
        "Section In-Charge": formData.resultsOfMeasuresEnforcement.enforcementSecInCharge,
        "QC Section": formData.resultsOfMeasuresEnforcement.enforcementQCSection,
        }).map(([key, value]) => [
          { text: key, bold: true, fillColor: "#e6f0ff", margin: [2, 4, 2, 4] },
          { text: value ?? "-", margin: [2, 4, 2, 4] },
        ]),
      },
      layout: "lightHorizontalLines",
    },

    { text: "5️ Results of Measures Effect", style: "sectionHeader", color: "#000" },
    {
      table: {
        widths: ["35%", "65%"],
        body: Object.entries({
        "Effect Date": formData.resultsOfMeasuresEffect.effectDate,
        "Effect Result": formData.resultsOfMeasuresEffect.effectResult,
        "Effect Judgment": formData.resultsOfMeasuresEffect.effectJudgment,
        "Effect Section In-Charge": formData.resultsOfMeasuresEffect.effectSecInCharge,
        "Effect QC Section": formData.resultsOfMeasuresEffect.effectQCSection,
        }).map(([key, value]) => [
          { text: key, bold: true, fillColor: "#e6f0ff", margin: [2, 4, 2, 4] },
          { text: value ?? "-", margin: [2, 4, 2, 4] },
        ]),
      },
      layout: "lightHorizontalLines",
    },


    { text: "\n\n" },
  ];
};

// ======================================================
// MAIN FUNCTION: MULTIPLE RECORDS SUPPORT
// ======================================================
const DownLoadAllRecords = async (recordsArray) => {
  let content = [];

  for (let i = 0; i < recordsArray.length; i++) {
    const formData = recordsArray[i];
    const productImageBase64 = await getImageAsPngBase64(formData.productImage);

    content.push(...buildSingleRecord(formData, productImageBase64));

    if (i !== recordsArray.length - 1) {
      content.push({ text: "", pageBreak: "after" });
    }
  }

  const docDefinition = {
    pageSize: "A4",
    pageMargins: [40, 60, 40, 60],
    content,

    styles: {
      mainHeader: {
        fontSize: 22,
        bold: true,
        color: "#004aad",
        alignment: "center",
        margin: [0, 0, 0, 20],
        decoration: "underline",
      },
      sectionHeader: {
        fontSize: 16,
        bold: true,
        color: "#fff",
        fillColor: "#004aad",
        margin: [0, 10, 0, 6],
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

  // pdfMake.createPdf(docDefinition).download("Quality_Forms_Report.pdf");
     pdfMake.createPdf(docDefinition).open();
};

export default DownLoadAllRecords;
