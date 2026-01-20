import { WorkflowChart } from "../ReusableComponents/Charts/ChartComponent";
import DepartmentPieChart from "../ReusableComponents/Charts/DepartmentPieChart";
import FormsBarChart from "../ReusableComponents/Charts/FormsBarChart";

const Reports = () => {
  return (
    <div className="p-6 md:p-10 w-full">

      {/* Centered Heading */}
      <div className="text-center mb-10">
        <h1 className="text-3xl font-bold tracking-tight text-gray-900 dark:text-gray-100">
          📊 Reports & Analytics Dashboard
        </h1>
        <p className="text-gray-500 dark:text-gray-400 mt-2">
          Visual insights to track performance and activities
        </p>
      </div>

      <div className="flex flex-col gap-10">

        {/* Workflow Chart */}
        {/* <div className="bg-white dark:bg-gray-900 border shadow-sm rounded-2xl p-6">
          <h2 className="text-xl text-center font-bold mb-4 text-gray-800 dark:text-gray-200">
            Workflow Status Overview
          </h2>
          <div className="overflow-x-auto">
            <WorkflowChart />
          </div>
        </div> */}

        {/* Grid Section */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-10">

          {/* Department Pie Chart */}
          <div className="bg-white dark:bg-gray-900 border shadow-sm rounded-2xl p-6">
            <h2 className="text-xl text-center font-bold mb-4 text-gray-800 dark:text-gray-200">
              Issues Assigned to Departments created between the selected dates
            </h2>
            <div className="overflow-x-auto">
              <DepartmentPieChart />
            </div>
          </div>

          {/* Forms Bar Chart */}
          <div className="bg-white dark:bg-gray-900 border shadow-sm rounded-2xl p-6">
            <h2 className="text-xl text-center font-bold mb-4 text-gray-800 dark:text-gray-200">
              Status of Forms Created Between Selected Dates
            </h2>
            <div className="overflow-x-auto">
              <FormsBarChart />
            </div>
          </div>

        </div>
      </div>

    </div>
  );
};

export default Reports;
