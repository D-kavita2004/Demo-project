import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";

/* =======================
   Reusable Read-Only Field
======================= */
const Field = ({ label, value }) => {
  return (
    <div className="flex flex-col space-y-1">
      <span className="text-sm font-medium text-muted-foreground">
        {label}
      </span>
      <div className="rounded-md border bg-muted px-3 py-2 text-sm">
        {value || "—"}
      </div>
    </div>
  );
};

/* =======================
   History Tracking View
======================= */
const HistoryTracking = ({ historyTracks = [] }) => {

  return (
    <div className="space-y-4">
      <h2 className="text-2xl font-semibold border-b pb-2">History</h2>

      <Accordion type="single" collapsible className="w-full">
        {[...historyTracks].reverse().map((obj, index) => (
          <AccordionItem key={index} value={`item-${index}`}>
            <AccordionTrigger className="text-md">
              Revision : {obj.cycle}
            </AccordionTrigger>

            <AccordionContent className="space-y-8">

              {/* ================= Measures Report ================= */}
              <section className="space-y-4">
                <h3 className="text-xl font-semibold border-b pb-1">
                  Measures Report
                </h3>

                <div className="grid gap-4 md:grid-cols-2 border rounded-lg p-4">
                  <Field
                    label="Causes of Occurrence"
                    value={obj.data.measuresReport?.causesOfOccurrence}
                  />
                  <Field
                    label="Causes of Outflow"
                    value={obj.data.measuresReport?.causesOfOutflow}
                  />
                  <Field
                    label="Countermeasures for Causes"
                    value={obj.data.measuresReport?.counterMeasuresForCauses}
                  />
                  <Field
                    label="Countermeasures for Outflow"
                    value={obj.data.measuresReport?.counterMeasuresForOutflow}
                  />
                  <Field
                    label="Measures Enforcement Date"
                    value={obj.data.measuresReport?.enforcementDate}
                  />
                  <Field
                    label="Standardization / Preventive Measures"
                    value={obj.data.measuresReport?.standardization}
                  />
                </div>
              </section>

              {/* ============ Results of Measures Enforcement ============ */}
              <section className="space-y-4">
                <h3 className="text-xl font-semibold border-b pb-1">
                  Results of Measures Enforcement
                </h3>

                <div className="grid gap-4 md:grid-cols-2 border rounded-lg p-4">
                  <Field
                    label="Enforcement Date"
                    value={
                      obj.data.resultsOfMeasuresEnforcement?.enforcementDateResult
                    }
                  />
                  <Field
                    label="Result Comment"
                    value={
                      obj.data.resultsOfMeasuresEnforcement?.enforcementResult
                    }
                  />
                  <Field
                    label="Judgment"
                    value={
                      obj.data.resultsOfMeasuresEnforcement?.enforcementJudgment
                    }
                  />
                  <Field
                    label="Section In Charge"
                    value={
                      obj.data.resultsOfMeasuresEnforcement?.enforcementSecInCharge
                    }
                  />
                  <Field
                    label="QC Section"
                    value={
                      obj.data.resultsOfMeasuresEnforcement?.enforcementQCSection
                    }
                  />
                </div>
              </section>

            </AccordionContent>
          </AccordionItem>
        ))}
      </Accordion>
    </div>
  );
};

export default HistoryTracking;
