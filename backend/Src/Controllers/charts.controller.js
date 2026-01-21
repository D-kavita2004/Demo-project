import Form from "../Models/form.models.js";
import logger from "../../Config/logger.js";
import Supplier from "../Models/suppliers.models.js";

export const getDepartmentWiseData = async (req, res) => {
  try {
    const { startDate, endDate } = req.query;

    if (!startDate || !endDate) {
      return res.status(400).json({ message: "startDate and endDate are required" });
    }

    const start = new Date(startDate);
    const end = new Date(endDate);
    end.setHours(23, 59, 59, 999);

    if (isNaN(start) || isNaN(end)) {
      return res.status(400).json({ message: "Invalid date format" });
    }

    // Initialize counts for internal suppliers
    const departmentWiseCounts = {};
    // const suppliers = await Supplier.find({ flag: "INTERNAL" }).lean();

    // suppliers.forEach((supp) => {
    //   departmentWiseCounts[supp.supplierName] = 0;
    // });

    // Fetch forms within the date range
    const forms = await Form.find({
      createdAt: { $gte: start, $lte: end },
    })
      .populate({
        path: "formData.defectivenessDetail.supplier",
        model: "Supplier",
        foreignField: "supplierCode",
        select: "supplierCode supplierName -_id",
        justOne: true,
      })
      .lean();

    // Count forms per department
    forms.forEach((form) => {
      const department = form.formData.defectivenessDetail.supplier;
      if (!department) return;

      departmentWiseCounts[department.supplierName] =
        (departmentWiseCounts[department.supplierName] || 0) + 1;
    });

    // Transform to array for chart-friendly format
    const chartData = Object.entries(departmentWiseCounts).map(([name, value]) => ({
      name,
      value,
    }));
    const total = chartData.reduce((sum, item) => sum + item.value, 0);

    res.status(200).json({
      total,
      data: chartData,
    });
  } catch (error) {
    logger.error(`Error fetching department-wise chart data: ${error.message}`);
    res.status(500).json({ message: "Internal Server Error" });
  }
};

export const getStatusWiseData = async (req, res) => {
  try {
    const { startDate, endDate } = req.query;

    let dateFilter = {};

    // Apply date filter only if both dates are provided
    if (startDate && endDate) {
      const start = new Date(startDate);
      const end = new Date(endDate);
      end.setHours(23, 59, 59, 999);

      if (isNaN(start) || isNaN(end)) {
        return res.status(400).json({ message: "Invalid date format" });
      }

      dateFilter = {
        createdAt: { $gte: start, $lte: end },
      };
    }

    // Base status list
    const baseStatusList = [
      { category: "QA Review", count: 0 },
      { category: "Finished", count: 0 },
      { category: "Approved", count: 0 },
    ];

    // Add INTERNAL suppliers
    const suppliers = await Supplier.find({ flag: "INTERNAL" }).lean();
    suppliers.forEach((supp) => {
      baseStatusList.push({
        category: `${supp.supplierName} Review`,
        count: 0,
      });
    });

    // Fetch forms (with or without date filter)
    const forms = await Form.find(dateFilter)
      .populate({
        path: "formData.defectivenessDetail.supplier",
        model: "Supplier",
        foreignField: "supplierCode",
        select: "supplierCode supplierName -_id",
        justOne: true,
      })
      .lean();

    // Count forms per status/category
    forms.forEach((form) => {
      let categoryToUpdate;

      if (form.status === "pending_quality") {
        categoryToUpdate = "QA Review";
      } else if (form.status === "finished") {
        categoryToUpdate = "Finished";
      } else if (form.status === "approved") {
        categoryToUpdate = "Approved";
      } else if (form.status === "pending_prod") {
        categoryToUpdate =
          form.formData?.defectivenessDetail?.supplier?.supplierName + " Review";
      }

      if (!categoryToUpdate) return;

      const item = baseStatusList.find(
        (i) => i.category === categoryToUpdate
      );
      if (item) item.count += 1;
    });

    const total = baseStatusList.reduce((sum, item) => sum + item.count, 0);

    res.status(200).json({
      total,
      data: baseStatusList,
    });
  } catch (error) {
    logger.error(`Error fetching status-wise chart data: ${error.message}`);
    res.status(500).json({ message: "Internal Server Error" });
  }
};

