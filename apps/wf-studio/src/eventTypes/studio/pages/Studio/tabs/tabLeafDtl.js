export const tabLeafDtl = {
  category: "tab",
  title: "Leaf Detail",
  cluster: "STUDIO", 
  purpose: "Properties tab for qry-based eventTypes with field generation",
  
  components: [
    {
      id: "cardBasics",
      container: "inline",
      position: { row: 1, col: 1 },
      props: {
        title: "Basic Properties"
      }
    },
    {
      id: "cardDataBinding",
      container: "inline", 
      position: { row: 2, col: 1 },
      props: {
        title: "Data Binding"
      }
    }
  ]
};