declare module 'jspdf' {
    interface jsPDF {
      autoTable(options: AutoTable.Options): jsPDF;
    }
  }
