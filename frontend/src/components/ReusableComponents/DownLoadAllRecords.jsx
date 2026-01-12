import pdfMake from "pdfmake/build/pdfmake";
import pdfFonts from "pdfmake/build/vfs_fonts";

pdfMake.vfs = pdfFonts?.default?.vfs || pdfFonts.vfs;

// ======================================================
// UNIVERSAL IMAGE → PNG BASE64 CONVERTER
// ======================================================
const getImageAsPngBase64 = async (imageUrl) => {
  if (!imageUrl) return null;
  // const formData = form.formData
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
const buildSingleRecord = (form, productImageBase64) => {
  const formData = form.formData;
  const sections = [
    formData?.issuingSection && {
      title: "1️ Issuing Section",
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
    formData?.defectivenessDetail && {
      title: "2️ Defectiveness Details",
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
        "Product Image": productImageBase64
          ? { image: productImageBase64, width: 200, height: 150, alignment: "center" }
          : "-",
        "Manager Instructions": formData.defectivenessDetail.managerInstructions,
      },
    },
    formData?.qualityCheckComment && {
      title: "3️ Quality Check Comments",
      data: {
        "QC Comment": formData.qualityCheckComment.qcComment,
        "QC Instructions": formData.qualityCheckComment.qcInstructions,
        "Defect Cost": `${formData.qualityCheckComment.defectCost} / ${formData.unit}`,
        "Unit": formData.qualityCheckComment.unit,
        "Importance Level": formData.qualityCheckComment.importanceLevel,
        "Report Time Limit": formData.qualityCheckComment.reportTimeLimit,
      },
    },
    formData?.measuresReport && {
      title: "4️ Measures Report",
      data: {
        "Causes of Occurance": formData.measuresReport.causesOfOccurrence,
        "Causes Of Outflow": formData.measuresReport.causesOfOutflow,
        "Counter Measures For Causes": formData.measuresReport.counterMeasuresForCauses,
        "Counter Measures For Outflow": formData.measuresReport.counterMeasuresForOutflow,
        "Enforcement Date": formData.measuresReport.enforcementDate,
        "Standardization": formData.measuresReport.standardization,
      },
    },
    formData?.resultsOfMeasuresEnforcement && {
      title: "5️ Results of Measures Enforcement",
      data: {
        "Enforcement Date (Result)": formData.resultsOfMeasuresEnforcement.enforcementDateResult,
        "Result": formData.resultsOfMeasuresEnforcement.enforcementResult,
        "Judgment": formData.resultsOfMeasuresEnforcement.enforcementJudgment,
        "Section In-Charge": formData.resultsOfMeasuresEnforcement.enforcementSecInCharge,
        "QC Section": formData.resultsOfMeasuresEnforcement.enforcementQCSection,
      },
    },
    formData?.resultsOfMeasuresEffect && {
      title: "6️ Results of Measures Effect",
      data: {
        "Effect Date": formData.resultsOfMeasuresEffect.effectDate,
        "Effect Result": formData.resultsOfMeasuresEffect.effectResult,
        "Effect Judgment": formData.resultsOfMeasuresEffect.effectJudgment,
        "Effect Section In-Charge": formData.resultsOfMeasuresEffect.effectSecInCharge,
        "Effect QC Section": formData.resultsOfMeasuresEffect.effectQCSection,
      },
    },
  ].filter(Boolean);

  // ================= BUILD PDF CONTENT =================
  const content = [
    { text: `QUALITY CHECK REPORT (${formData?.issuingSection?.part?.partName.toUpperCase()})`, style: "mainHeader" },
    { text: "\n" },
  ];

  // Add main sections
  sections.forEach((section) => {
    content.push({ text: section.title, style: "sectionHeader", color: "#000" });
    content.push({
      table: {
        widths: ["35%", "65%"],
        body: Object.entries(section.data).map(([key, value]) => [
          { text: key, bold: true, fillColor: "#e6f0ff", margin: [2, 4, 2, 4] },
          typeof value === "object" && value.image ? value : { text: value ?? "-", margin: [2, 4, 2, 4] },
        ]),
      },
      layout: "lightHorizontalLines",
    });
    content.push({ text: "\n" });
  });

  // ================= HISTORY / REVISIONS =================
  if (form.history && form.history.length > 0) {
    content.push({ text: "HISTORY / REVISIONS", style: "sectionHeader", color: "#000", alignment: "center", fontSize: 18, bold: true});

    form.history.forEach((entry, index) => {

      content.push({ text: `Revision ${entry.cycle}`, style: "subHeader", margin: [0, 6, 0, 2],alignment: "center", fontSize: 14,  });
      content.push({ text: "\n" });

      // Measures Report in revision
      if (entry.data.measuresReport) {
        content.push({ text: "Measures Report", style: "sectionHeader", color: "#000" });
        content.push({
          table: {
            widths: ["35%", "65%"],
            body: Object.entries(entry.data.measuresReport).map(([key, value]) => [
              { text: key, bold: true, fillColor: "#f2f2f2", margin: [2, 3, 2, 3] },
              { text: value ?? "-", margin: [2, 3, 2, 3] },
            ]),
          },
          layout: "lightHorizontalLines",
        });
        content.push({ text: "\n" });
      }

      // Results of Measures Enforcement in revision
      if (entry.data.resultsOfMeasuresEnforcement) {
        content.push({ text: "Results of Measures Enforcement", style: "sectionHeader", color: "#000" });
        content.push({
          table: {
            widths: ["35%", "65%"],
            body: Object.entries(entry.data.resultsOfMeasuresEnforcement).map(([key, value]) => [
              { text: key, bold: true, fillColor: "#f2f2f2", margin: [2, 3, 2, 3] },
              { text: value ?? "-", margin: [2, 3, 2, 3] },
            ]),
          },
          layout: "lightHorizontalLines",
        });
        content.push({ text: "\n" });
      }
    });
  }

  content.push({ text: "\n\n" });
  return content;
};

// ======================================================
// MAIN FUNCTION: MULTIPLE RECORDS SUPPORT
// ======================================================
const DownLoadAllRecords = async (formArray) => {
  let content = [];
  for (let i = 0; i < formArray.length; i++) {
    const form = formArray[i];
    const productImageBase64 = await getImageAsPngBase64(form?.formData?.defectivenessDetail?.productImage);

    content.push(...buildSingleRecord(form, productImageBase64));

    if (i !== formArray.length - 1) {
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
      subHeader: {
        fontSize: 14,
        bold: true,
        color: "#004aad",
        margin: [0, 6, 0, 2],
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

  pdfMake.createPdf(docDefinition).open();
};

export default DownLoadAllRecords;
