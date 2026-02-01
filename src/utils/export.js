// Export utilities for PDF and CSV generation

// Export calculation results as CSV
export const exportToCSV = (data, filename = 'network-calculation') => {
  if (!data || typeof data !== 'object') {
    console.error('Invalid data for CSV export');
    return;
  }

  let csvContent = '';
  
  // Handle different calculation types
  if (data.type === 'subnet' || data.type === 'cidr') {
    csvContent = generateSubnetCSV(data);
  } else if (data.type === 'binary') {
    csvContent = generateBinaryCSV(data);
  } else if (data.type === 'supernet') {
    csvContent = generateSupernetCSV(data);
  } else if (data.type === 'overlap') {
    csvContent = generateOverlapCSV(data);
  } else if (data.type === 'bandwidth') {
    csvContent = generateBandwidthCSV(data);
  } else {
    csvContent = generateGenericCSV(data);
  }

  downloadCSV(csvContent, `${filename}-${new Date().toISOString().split('T')[0]}.csv`);
};

// Generate subnet calculation CSV
const generateSubnetCSV = (data) => {
  const { input, result } = data;
  let csv = 'Property,Value\n';
  
  csv += `Input Network,${input.ip || input.cidr}\n`;
  if (input.subnetMask) csv += `Subnet Mask,${input.subnetMask}\n`;
  if (input.prefix) csv += `Prefix Length,/${input.prefix}\n`;
  
  csv += `Network Address,${result.networkAddress}\n`;
  csv += `Broadcast Address,${result.broadcastAddress}\n`;
  csv += `First Host,${result.firstHost}\n`;
  csv += `Last Host,${result.lastHost}\n`;
  csv += `Total Hosts,${result.totalHosts}\n`;
  csv += `Usable Hosts,${result.usableHosts}\n`;
  csv += `Subnet Mask,${result.subnetMask}\n`;
  csv += `Wildcard Mask,${result.wildcardMask}\n`;
  
  return csv;
};

// Generate binary conversion CSV
const generateBinaryCSV = (data) => {
  const { input, result } = data;
  let csv = 'Octet,Decimal,Binary,Hexadecimal\n';
  
  result.parts.forEach((part, index) => {
    csv += `${index + 1},${part.decimal},${part.binary},0x${part.hex}\n`;
  });
  
  csv += '\nFormat,Value\n';
  csv += `Original IP,${input.ip}\n`;
  csv += `Binary (dotted),${result.fullBinary}\n`;
  csv += `Binary (32-bit),${result.fullBinaryNoDots}\n`;
  csv += `Hexadecimal,0x${result.fullHexNoDots}\n`;
  csv += `Decimal (32-bit),${result.decimalValue}\n`;
  
  return csv;
};

// Generate supernet CSV
const generateSupernetCSV = (data) => {
  const { result } = data;
  let csv = 'Property,Value\n';
  
  csv += `Supernet CIDR,${result.supernet.cidr}\n`;
  csv += `Network Address,${result.supernet.address}\n`;
  csv += `Subnet Mask,${result.supernet.mask}\n`;
  csv += `Broadcast Address,${result.supernet.broadcast}\n`;
  csv += `Total Size,${result.supernet.size}\n`;
  csv += `Efficiency,${result.efficiency}%\n`;
  
  csv += '\nOriginal Networks\n';
  csv += 'Network,Size,Range\n';
  result.originalNetworks.forEach(net => {
    csv += `${net.cidr},${net.size},"${net.networkIP} - ${net.broadcastIP}"\n`;
  });
  
  return csv;
};

// Generate overlap detection CSV
const generateOverlapCSV = (data) => {
  const { result } = data;
  let csv = 'Analysis Summary\n';
  csv += 'Property,Value\n';
  csv += `Total Networks,${result.totalNetworks}\n`;
  csv += `Overlaps Found,${result.overlaps.length}\n`;
  csv += `Total Addresses,${result.totalAddresses}\n`;
  
  if (result.overlaps.length > 0) {
    csv += '\nOverlaps Detected\n';
    csv += 'Network 1,Network 2,Relationship,Overlap Range,Conflict Size\n';
    result.overlaps.forEach(overlap => {
      csv += `${overlap.network1.cidr},${overlap.network2.cidr},${overlap.relationship},"${overlap.overlapStart} - ${overlap.overlapEnd}",${overlap.overlapSize}\n`;
    });
  }
  
  csv += '\nAll Networks\n';
  csv += 'CIDR,Network Address,Broadcast,Size,Status\n';
  result.networks.forEach(network => {
    const hasOverlap = result.overlaps.some(o => 
      o.network1.cidr === network.cidr || o.network2.cidr === network.cidr
    );
    csv += `${network.cidr},${network.networkIP},${network.broadcastIP},${network.size},${hasOverlap ? 'Conflict' : 'OK'}\n`;
  });
  
  return csv;
};

// Generate bandwidth calculation CSV
const generateBandwidthCSV = (data) => {
  const { result } = data;
  let csv = 'Bandwidth Calculation Results\n';
  
  if (result.type === 'service') {
    csv += 'Summary\n';
    csv += 'Property,Value\n';
    csv += `Total Users,${result.totalUsers}\n`;
    csv += `Theoretical Bandwidth,${result.totalBandwidth.toFixed(2)} Mbps\n`;
    csv += `With Overhead,${result.withOverhead.toFixed(2)} Mbps\n`;
    csv += `Recommended,${result.recommended.toFixed(2)} Mbps\n`;
    
    csv += '\nService Breakdown\n';
    csv += 'Service,Users,Per User (Mbps),Total (Mbps)\n';
    result.services.forEach(service => {
      csv += `"${service.name}",${service.users},${service.bandwidthPerUser},${service.totalBandwidth.toFixed(2)}\n`;
    });
  } else {
    csv += 'File Transfer Calculation\n';
    csv += 'Property,Value\n';
    csv += `File Size,${result.fileSize.toFixed(2)} MB\n`;
    csv += `Transfer Time,${result.transferTime.toFixed(2)} seconds\n`;
    csv += `Required Bandwidth,${result.requiredBandwidth.toFixed(2)} Mbps\n`;
    csv += `With Overhead,${result.withOverhead.toFixed(2)} Mbps\n`;
    csv += `Recommended,${result.recommended.toFixed(2)} Mbps\n`;
  }
  
  return csv;
};

// Generate generic CSV for other calculation types
const generateGenericCSV = (data) => {
  let csv = 'Calculation Export\n';
  csv += 'Property,Value\n';
  csv += `Type,${data.type}\n`;
  csv += `Timestamp,${new Date(data.timestamp).toLocaleString()}\n`;
  
  // Try to extract key-value pairs from result
  if (data.result && typeof data.result === 'object') {
    Object.entries(data.result).forEach(([key, value]) => {
      if (typeof value === 'string' || typeof value === 'number') {
        csv += `${key},${value}\n`;
      }
    });
  }
  
  return csv;
};

// Download CSV file
const downloadCSV = (csvContent, filename) => {
  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const link = document.createElement('a');
  
  if (link.download !== undefined) {
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', filename);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  }
};

// Export as PDF (simplified HTML to PDF)
export const exportToPDF = (data, filename = 'network-calculation') => {
  const htmlContent = generatePDFHTML(data);
  
  // Create a new window for printing
  const printWindow = window.open('', '_blank');
  printWindow.document.write(htmlContent);
  printWindow.document.close();
  
  // Wait for content to load then print
  printWindow.onload = () => {
    printWindow.print();
    setTimeout(() => printWindow.close(), 1000);
  };
};

// Generate HTML content for PDF
const generatePDFHTML = (data) => {
  const { input, result, type, timestamp } = data;
  
  return `
    <!DOCTYPE html>
    <html>
    <head>
      <title>Network Calculation Report</title>
      <style>
        body { font-family: Arial, sans-serif; margin: 20px; color: #333; }
        .header { border-bottom: 2px solid #2563eb; padding-bottom: 10px; margin-bottom: 20px; }
        .header h1 { color: #2563eb; margin: 0; }
        .header p { margin: 5px 0; color: #666; }
        .section { margin-bottom: 20px; }
        .section h2 { color: #1a1a2e; border-bottom: 1px solid #e2e8f0; padding-bottom: 5px; }
        table { width: 100%; border-collapse: collapse; margin-top: 10px; }
        th, td { padding: 8px 12px; text-align: left; border-bottom: 1px solid #e2e8f0; }
        th { background-color: #f8fafc; font-weight: 600; }
        .highlight { background-color: #eff6ff; }
        .footer { margin-top: 30px; padding-top: 20px; border-top: 1px solid #e2e8f0; font-size: 12px; color: #666; }
        @media print {
          body { margin: 0; }
          .no-print { display: none; }
        }
      </style>
    </head>
    <body>
      <div class="header">
        <h1>Network Calculation Report</h1>
        <p>Type: ${type.toUpperCase()}</p>
        <p>Generated: ${new Date(timestamp).toLocaleString()}</p>
      </div>
      
      ${generatePDFContent(type, input, result)}
      
      <div class="footer">
        <p>Generated by IPv4 Calculator - ${window.location.origin}</p>
      </div>
    </body>
    </html>
  `;
};

// Generate specific PDF content based on calculation type
const generatePDFContent = (type, input, result) => {
  switch (type) {
    case 'subnet':
    case 'cidr':
      return generateSubnetPDF(input, result);
    case 'binary':
      return generateBinaryPDF(input, result);
    case 'supernet':
      return generateSupernetPDF(input, result);
    case 'overlap':
      return generateOverlapPDF(input, result);
    case 'bandwidth':
      return generateBandwidthPDF(input, result);
    default:
      return generateGenericPDF(input, result);
  }
};

// Generate subnet PDF content
const generateSubnetPDF = (input, result) => {
  return `
    <div class="section">
      <h2>Input Parameters</h2>
      <table>
        <tr><td><strong>Network:</strong></td><td>${input.ip || input.cidr}</td></tr>
        ${input.subnetMask ? `<tr><td><strong>Subnet Mask:</strong></td><td>${input.subnetMask}</td></tr>` : ''}
        ${input.prefix ? `<tr><td><strong>Prefix Length:</strong></td><td>/${input.prefix}</td></tr>` : ''}
      </table>
    </div>
    
    <div class="section">
      <h2>Calculation Results</h2>
      <table>
        <tr class="highlight"><td><strong>Network Address:</strong></td><td>${result.networkAddress}</td></tr>
        <tr><td><strong>Broadcast Address:</strong></td><td>${result.broadcastAddress}</td></tr>
        <tr><td><strong>First Host:</strong></td><td>${result.firstHost}</td></tr>
        <tr><td><strong>Last Host:</strong></td><td>${result.lastHost}</td></tr>
        <tr><td><strong>Total Hosts:</strong></td><td>${result.totalHosts?.toLocaleString()}</td></tr>
        <tr><td><strong>Usable Hosts:</strong></td><td>${result.usableHosts?.toLocaleString()}</td></tr>
        <tr><td><strong>Subnet Mask:</strong></td><td>${result.subnetMask}</td></tr>
        <tr><td><strong>Wildcard Mask:</strong></td><td>${result.wildcardMask}</td></tr>
      </table>
    </div>
  `;
};

// Generate binary PDF content
const generateBinaryPDF = (input, result) => {
  let octetTable = '<table><tr><th>Octet</th><th>Decimal</th><th>Binary</th><th>Hexadecimal</th></tr>';
  result.parts.forEach((part, index) => {
    octetTable += `<tr><td>${index + 1}</td><td>${part.decimal}</td><td>${part.binary}</td><td>0x${part.hex}</td></tr>`;
  });
  octetTable += '</table>';

  return `
    <div class="section">
      <h2>IP Address: ${input.ip}</h2>
      <h3>Octet Breakdown</h3>
      ${octetTable}
    </div>
    
    <div class="section">
      <h2>Format Conversions</h2>
      <table>
        <tr><td><strong>Original (Decimal):</strong></td><td>${input.ip}</td></tr>
        <tr><td><strong>Binary (dotted):</strong></td><td>${result.fullBinary}</td></tr>
        <tr><td><strong>Binary (32-bit):</strong></td><td>${result.fullBinaryNoDots}</td></tr>
        <tr><td><strong>Hexadecimal:</strong></td><td>0x${result.fullHexNoDots}</td></tr>
        <tr><td><strong>Decimal (32-bit):</strong></td><td>${result.decimalValue?.toLocaleString()}</td></tr>
      </table>
    </div>
  `;
};

// Generate generic PDF content
const generateGenericPDF = (input, result) => {
  let content = '<div class="section"><h2>Calculation Results</h2><table>';
  
  if (result && typeof result === 'object') {
    Object.entries(result).forEach(([key, value]) => {
      if (typeof value === 'string' || typeof value === 'number') {
        content += `<tr><td><strong>${key}:</strong></td><td>${value}</td></tr>`;
      }
    });
  }
  
  content += '</table></div>';
  return content;
};