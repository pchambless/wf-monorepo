export const createCommunication = async (data) => {
  // Implementation for plan communication creation
  console.log("[createCommunication] Creating plan communication", data);

  return {
    action: "saveRecord",
    qry: "createPlanCommunication",
    data: {
      plan_id: data.plan_id || data.selectedPlanId,
      from_agent: data.from_agent || "user",
      to_agent: data.to_agent || "system",
      type: data.type || "note",
      subject: data.subject || "Plan Communication",
      message: data.message || "",
      userID: data.userID || "current_user",
      ...data,
    },
    success: true,
    message: "Communication created successfully",
  };
};
