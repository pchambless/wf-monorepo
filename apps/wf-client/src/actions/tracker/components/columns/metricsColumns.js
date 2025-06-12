export const MetricsColumns = {
  columns: [
    {
      group: 1,
      ordr: 1,
      field: "page",
      label: "Page",
      width: 120,
      dataType: "STRING"
    },
    {
      group: 1,
      ordr: 2,
      field: "module",
      label: "Module",
      width: 120,
      dataType: "STRING"
    },
    {
      group: 1,
      ordr: 3,
      field: "function",
      label: "Function",
      width: 120,
      dataType: "STRING"
    },
    {
      group: 2,
      ordr: 4,
      field: "calls",
      label: "Calls",
      width: 40,
      dataType: "INT",
      align: "right"
    },
    {
      group: 3,
      ordr: 5,
      field: "created",
      label: "First Used",
      width: 160,
      dataType: "DATE",
      formatter: (value) => new Date(value).toLocaleString()
    },
    {
      group: 3,
      ordr: 6,
      field: "lastCall",
      label: "Last Used",
      width: 160,
      dataType: "DATE",
      formatter: (value) => new Date(value).toLocaleString()
    },
    {
      group: 4,
      ordr: 7,
      field: "acctID",
      label: "Acct",
      width: 50,
      dataType: "INT",
      align: "right"
    },
    {
      group: 4,
      ordr: 8,
      field: "userEmail",
      label: "User",
      width: 0,  // Hidden but tracked
      dataType: "STRING",
      hidden: true
    }
  ]
};

export default MetricsColumns;
