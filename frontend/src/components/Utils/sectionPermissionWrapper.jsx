import { useContext } from "react";
import { UserContext } from "./userContext";
import { NewFormSchema, ProdResponseSchema, QAResponseSchema, FinalResponseSchema, EmptySchema } from "../ValidateSchema/formDataValidationSchema";   

const sectionAccessMatrix = {

  issuingSection: {
    "QA":  { new: "edit", pending_quality: "read", pending_prod: "read", approved: "read", finished: "read" },
    "INTERNAL": { new: "hidden", pending_quality: "read", pending_prod: "read", approved: "read", finished: "read" },
    "IT" : { new:"hidden", "*":"read"}
  },

  defectivenessDetail: {
    "QA":  { new: "edit", pending_quality: "read", pending_prod: "read", approved: "read", finished: "read" },
    "INTERNAL": { new: "hidden", pending_quality: "read", pending_prod: "read", approved: "read", finished: "read" },
    "IT" : { new:"hidden","*":"read"},
  },

  qualityCheckComment: {
    "QA":  { new: "edit", pending_quality: "read", pending_prod: "read", approved: "read", finished: "read" },
    "INTERNAL": { new: "hidden", pending_quality: "read", pending_prod: "read", approved: "read", finished: "read" },
    "IT" : { new:"hidden", "*":"read"}
  },

  measuresReport: {
    "QA": { new: "hidden", pending_prod:"hidden", pending_quality: "read", approved: "read", finished: "read" },
    "INTERNAL":  { new: "hidden", pending_prod: "edit", pending_quality: "read", approved: "read", finished: "read" },
    "IT" : { new:"hidden",pending_prod: "hidden" }
  },

  resultsOfMeasuresEnforcement: {
    "QA":        { new: "hidden", pending_prod:"hidden", pending_quality: "edit", approved: "read", finished: "read" },
    "INTERNAL":  { new: "hidden", pending_prod:"hidden", pending_quality: "hidden", approved:"read", finished: "read" },
    "IT" : { new:"hidden", pending_quality: "hidden", pending_prod: "hidden" }
  },

   resultsOfMeasuresEffect: {
    "QA": { new: "hidden", approved: "edit", pending_prod:"hidden", pending_quality: "hidden", finished: "read" },
    "INTERNAL":  { finished:"read","*": "hidden", },
    "IT" : { new:"hidden", approved: "hidden", pending_prod: "hidden",pending_quality:"hidden" }
  },
};


function getSectionAccess(sectionKey, flag, status, isNewForm) {

  const section = sectionAccessMatrix[sectionKey];
  
  if (!section) return "hidden";

  const roleAccess = section[flag];
  if (!roleAccess[status] && flag === "IT") return "read"
  if (!roleAccess) return "hidden";

  // When creating new form — use role's "new" rule
  if (isNewForm) {
    return roleAccess["new"] || "hidden";
  }

  return (
    roleAccess[status] ||
    roleAccess["*"] ||
    "hidden"
  );
}

export const GetRelatedSchema = (formStatus, isNewForm) => {
      if (isNewForm){
            return NewFormSchema;
      }
      if (formStatus === "pending_prod") {
            return ProdResponseSchema;
      }
      if (formStatus === "pending_quality") {
            return QAResponseSchema;
      }
      if (formStatus === "approved") {
            return FinalResponseSchema;
      }
      return EmptySchema;
}


export const PermissionedSection = ({ sectionKey, isNewForm, formStatus, children }) => {
  const {user} = useContext(UserContext);
// console.log(isNewForm, formStatus);
  const access = getSectionAccess(sectionKey, user.team.flag, formStatus, isNewForm);
  // console.log(`Section: ${sectionKey}, Access: ${access}`);
  if (access === "hidden") return null;

   return children(access);
};


// export const PermissionedSection = ({
//   sectionKey,
//   isNewForm,
//   formStatus,
//   children,
// }) => {
//   const { user } = useContext(UserContext);

//   const access = getSectionAccess(
//     sectionKey,
//     user.team.flag,
//     formStatus,
//     isNewForm
//   );

//   if (access === "hidden") return null;

//   // Pass access down via render prop
//   return children(access);
// };