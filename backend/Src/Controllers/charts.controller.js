import Form from "../Models/form.models.js";
import logger from "../../Config/logger.js";
import Supplier from "../Models/suppliers.models.js";

const now = new Date();

const lastWeekStart = new Date();
lastWeekStart.setDate(now.getDate() - 7);

const lastMonthStart = new Date();
lastMonthStart.setMonth(now.getMonth() - 1);

const lastYearStart = new Date();
lastYearStart.setFullYear(now.getFullYear() - 1);
    
export const getDepartmentWiseData = async (req, res) => {
  try {

    // Initialize counts
    const departentWiseCountsWeek = {};
    const departentWiseCountsMonth = {};
    const departentWiseCountsYear = {};

    // Pre-fill internal suppliers
    const suppliers = await Supplier.find().lean();

    suppliers.forEach((supp) => {
      if (supp.flag === "INTERNAL") {
        departentWiseCountsWeek[supp.supplierName] = 0;
        departentWiseCountsMonth[supp.supplierName] = 0;
        departentWiseCountsYear[supp.supplierName] = 0;
      }
    });

    // Fetch forms
    const forms = await Form.find()
      .populate({
        path: "formData.defectivenessDetail.supplier",
        model: "Supplier",
        foreignField: "supplierCode",
        select: "supplierCode supplierName -_id",
        justOne: true,
      })
      .lean();

    // Loop through forms
    forms.forEach((form) => {
      const department = form.formData.defectivenessDetail.supplier;
      if (!department) return;

      const createdAt = new Date(form.createdAt);

      // Increment counts per time range
      if (createdAt >= lastWeekStart) {
        Object.keys(departentWiseCountsWeek).includes(department.supplierName)
          ? departentWiseCountsWeek[department.supplierName] += 1
          : departentWiseCountsWeek[department.supplierName] = 1;
      }

      if (createdAt >= lastMonthStart) {
        Object.keys(departentWiseCountsMonth).includes(department.supplierName)
          ? departentWiseCountsMonth[department.supplierName] += 1
          : departentWiseCountsMonth[department.supplierName] = 1;
      }

      if (createdAt >= lastYearStart) {
        Object.keys(departentWiseCountsYear).includes(department.supplierName)
          ? departentWiseCountsYear[department.supplierName] += 1
          : departentWiseCountsYear[department.supplierName] = 1;
      }
    });

    //     Transform to chart-friendly arrays
    const transformToArray = (obj) =>
      Object.entries(obj).map(([name, value]) => ({ name, value }));

    const chartData = {
      lastWeek: transformToArray(departentWiseCountsWeek),
      lastMonth: transformToArray(departentWiseCountsMonth),
      lastYear: transformToArray(departentWiseCountsYear),
    };

    // Send response
    res.status(200).json(chartData);
  } catch (error) {
    logger.error(`Error fetching charts data: ${error.message}`);
    res.status(500).json({ message: "Internal Server Error" });
  }
};

export const getStatusWiseData = async (req, res) => {
  try {

    // Base status list
    const baseStatusList = [
      { category: "Quality Review", count: 0 },
      { category: "Finished", count: 0 },
      { category: "Approved", count: 0 },
    ];

    // Add INTERNAL suppliers
    const suppliers = await Supplier.find().lean();
    suppliers.forEach((supp) => {
      if (supp.flag === "INTERNAL") {
        baseStatusList.push({
          category: supp.supplierName,
          count: 0,
        });
      }
    });

    // Clone for time ranges (IMPORTANT)
    const statusWiseCountsWeek = structuredClone(baseStatusList);
    const statusWiseCountsMonth = structuredClone(baseStatusList);
    const statusWiseCountsYear = structuredClone(baseStatusList);

    // Fetch forms
    const forms = await Form.find()
      .populate({
        path: "formData.defectivenessDetail.supplier",
        model: "Supplier",
        foreignField: "supplierCode",
        select: "supplierCode supplierName -_id",
        justOne: true,
      })
      .lean();

    // Loop forms
    forms.forEach((form) => {
      let categoryToUpdate;

      if (form.status === "pending_quality") {
        categoryToUpdate = "Quality Review";
      } else if (form.status === "finished") {
        categoryToUpdate = "Finished";
      } else if (form.status === "approved") {
        categoryToUpdate = "Approved";
      } else if (form.status === "pending_prod") {
        categoryToUpdate =
          form.formData?.defectivenessDetail?.supplier?.supplierName;
      }

      if (!categoryToUpdate) return;

      const createdAt = new Date(form.createdAt);

      const incrementCount = (list) => {
        const item = list.find((i) => i.category === categoryToUpdate);
        if (item) item.count += 1;
      };

      if (createdAt >= lastWeekStart) {
        incrementCount(statusWiseCountsWeek);
      }

      if (createdAt >= lastMonthStart) {
        incrementCount(statusWiseCountsMonth);
      }

      if (createdAt >= lastYearStart) {
        incrementCount(statusWiseCountsYear);
      }
    });

    // Response
    res.status(200).json({
      lastWeek: statusWiseCountsWeek,
      lastMonth: statusWiseCountsMonth,
      lastYear: statusWiseCountsYear,
    });
  } catch (error) {
    logger.error(`Error fetching status-wise data: ${error.message}`);
    res.status(500).json({ message: "Internal Server Error" });
  }
};

