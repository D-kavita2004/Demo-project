 import { UsersIcon, TruckIcon, PackageIcon, ActivityIcon, CpuIcon } from "lucide-react";
 export const myData = {
    // ========== Issuing Section ==========
    issuingSection: {
      receivingNo: "RCV-2025-001",
      referenceNo: "REF-12345",
      partName: "", // ObjectId of part will go here
      subjectMatter: "Inspection Report",
      approved: "John Doe",
      checked: "Jane Smith",
      issued: undefined, // can be empty string
    },

    // ========== Defectiveness Detail ==========
    defectivenessDetail: {
      supplierName: "", // ObjectId of supplier will go here
      groupName: "Quality Group A",
      stateOfProcess: "Machining",
      associatedLotNo: "LOT-7789",
      discoveredDate: "2025-10-20", // YYYY-MM-DD
      issueDate: "2025-10-22", // YYYY-MM-DD
      orderNo: "ORD-9988",
      drawingNo: "DRW-5567",
      processName: "", // ObjectId of process
      machineName: "", // ObjectId of machine
      totalQuantity: 100,
      usedQuantity: 60,
      residualQuantity: 40,
      defectRate: 4.5,
      managerInstructions: "Isolate defective items and investigate cause.",
      productImage: "", // file path or empty string
    },

    // ========== Quality Check Comment ==========
    qualityCheckComment: {
      qcComment: "Checked and verified by QC team.",
      qcInstructions: "Proceed with 100% inspection for next batch.",
      defectCost: 250.75,
      unit: "piece",
      importanceLevel: "A", // AA, A, B, C
      reportTimeLimit: "2025-11-10",
    },

    // ========== Measures Report ==========
    measuresReport: {
      causesOfOccurrence: "Improper clamping caused vibration defects.",
      causesOfOutflow: "Improper clamping caused vibration defects.",
      counterMeasuresForCauses: "Added additional support; training conducted.",
      counterMeasuresForOutflow: "Added additional support; training conducted.",
      enforcementDate: "2025-10-25",
      standardization:
        "Updated SOP and shared learnings across all production lines.",
    },

    // ========== Results of Measures ==========
    resultsOfMeasures: {
      enforcementDateResult: "2025-10-28",
      enforcementResult: "Measures implemented successfully.",
      enforcementJudgment: "Effective",
      enforcementSecInCharge: "R&D Team",
      enforcementQCSection: "QC Section A",
      effectDate: "2025-11-01",
      effectResult: "No recurrence of issue detected.",
      effectJudgment: "Stable",
      effectSecInCharge: "Production",
      effectQCSection: "QC Section A",
    },
  }
 export const navcards = [
    {
    id: 1,
    title: "Overview",
    icon: <UsersIcon className="w-6 h-6 text-white" />,
    route: "",
    color: "from-blue-500 to-blue-600",
    message: "Manage all users, roles, and permissions.",
  },
  {
    id: 2,
    title: "Users Management",
    icon: <UsersIcon className="w-6 h-6 text-white" />,
    route: "Users",
    color: "from-blue-500 to-blue-600",
    message: "Manage all users, roles, and permissions.",
  },
  {
    id: 3,
    title: "Suppliers/Sections",
    icon: <TruckIcon className="w-6 h-6 text-white" />,
    route: "Suppliers",
    color: "from-green-500 to-green-600",
    message: "View, add, or edit supplier details.",
  },
  {
    id: 4,
    title: "Parts",
    icon: <PackageIcon className="w-6 h-6 text-white" />,
    route: "parts",
    color: "from-purple-500 to-purple-600",
    message: "Manage all part names and related information.",
  },
  {
    id: 5,
    title: "Processes",
    icon: <ActivityIcon className="w-6 h-6 text-white" />,
    route: "processes",
    color: "from-yellow-400 to-yellow-500",
    message: "Define and edit process names and workflows.",
  },
  {
    id: 6,
    title: "Machines",
    icon: <CpuIcon className="w-6 h-6 text-white" />,
    route: "machines",
    color: "from-pink-500 to-pink-600",
    message: "Manage machine details and configurations.",
  },
];
 export const cards = [

  {
    id: 1,
    title: "Users Management",
    icon: <UsersIcon className="w-6 h-6 text-white" />,
    route: "Users",
    color: "from-blue-500 to-blue-600",
    message: "Manage all users, roles, and permissions.",
  },
  {
    id: 2,
    title: "Suppliers/Sections",
    icon: <TruckIcon className="w-6 h-6 text-white" />,
    route: "Suppliers",
    color: "from-green-500 to-green-600",
    message: "View, add, or edit supplier details.",
  },
  {
    id: 3,
    title: "Parts",
    icon: <PackageIcon className="w-6 h-6 text-white" />,
    route: "parts",
    color: "from-purple-500 to-purple-600",
    message: "Manage all part names and related information.",
  },
  {
    id: 4,
    title: "Processes",
    icon: <ActivityIcon className="w-6 h-6 text-white" />,
    route: "processes",
    color: "from-yellow-400 to-yellow-500",
    message: "Define and edit process names and workflows.",
  },
  {
    id: 5,
    title: "Machines",
    icon: <CpuIcon className="w-6 h-6 text-white" />,
    route: "machines",
    color: "from-pink-500 to-pink-600",
    message: "Manage machine details and configurations.",
  },
];