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
    { text: `QUALITY CHECK REPORT (${formData.partName.toUpperCase()})`, style: "mainHeader" },
    { text: "\n" },

    // -------- 1. Issuing Section --------
    { text: "1️ Issuing Section", style: "sectionHeader", color: "#000" },
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
          "Product Image": productImageBase64
            ? { image: productImageBase64, width: 200, height: 150, alignment: "center" }
            : "-",
          "Manager Instructions": formData.managerInstructions,
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
          "Measures Report": formData.measuresReport,
          "Responsible Section": formData.responsibleSection,
          "Cause Details": formData.causeDetails,
          "Countermeasures": formData.countermeasures,
          "Enforcement Date": formData.enforcementDate,
          "Standardization": formData.standardization,
        }).map(([key, value]) => [
          { text: key, bold: true, fillColor: "#e6f0ff", margin: [2, 4, 2, 4] },
          { text: value ?? "-", margin: [2, 4, 2, 4] },
        ]),
      },
      layout: "lightHorizontalLines",
    },
    { text: "\n" },

    // -------- 5. Results of Measures --------
    { text: "5️ Results of Measures", style: "sectionHeader", color: "#000" },
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

  pdfMake.createPdf(docDefinition).download("Quality_Forms_Report.pdf");
//      pdfMake.createPdf(docDefinition).open();
};

export default DownLoadAllRecords;
