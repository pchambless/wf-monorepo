export const ActionColumns = {
  columns: [
    {
      group: 1,
      ordr: 1,
      field: "timestamp",
      label: "Time",
      width: 100,
      dataType: "DATE",
      formatter: (value) => new Date(value).toLocaleTimeString()
    },
    {
      group: 1,
      ordr: 2,
      field: "page",
      label: "Page",
      width: 120,
      dataType: "STRING"
    },
    {
      group: 2,
      ordr: 3,
      field: "module",
      label: "Module",
      width: 120,
      dataType: "STRING"
    },
    {
      group: 2,
      ordr: 4,
      field: "function",
      label: "Function",
      width: 120,
      dataType: "STRING"
    },
    {
      group: 3,
      ordr: 5,
      field: "acctID",
      label: "Acct",
      width: 50,
      dataType: "INT",
      align: "right"
    },
    {
      group: 4,
      ordr: 6,
      field: "context",
      label: "Context",
      width: 300,
      dataType: "OBJECT",
      formatter: (value) => JSON.stringify(value?.args || value, null, 2),
      multiline: true
    }
  ]
};
