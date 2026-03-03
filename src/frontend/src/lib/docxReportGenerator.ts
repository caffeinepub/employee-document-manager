import type { Employee } from "@/hooks/useQueries";

function formatDate(): string {
  const today = new Date();
  const dd = String(today.getDate()).padStart(2, "0");
  const mm = String(today.getMonth() + 1).padStart(2, "0");
  const yyyy = today.getFullYear();
  return `${dd}/${mm}/${yyyy}`;
}

function field(label: string, value: string): string {
  return `
    <tr>
      <td style="padding:4px 8px;font-weight:600;color:#1F4E79;width:200px;vertical-align:top">${label}</td>
      <td style="padding:4px 8px;color:#222">${value || "—"}</td>
    </tr>`;
}

function sectionHeading(title: string): string {
  return `
    <tr>
      <td colspan="2" style="padding:12px 8px 4px;font-weight:700;font-size:13px;color:#1F4E79;
        border-top:2px solid #4A90D9;text-transform:uppercase;letter-spacing:0.04em">
        ${title}
      </td>
    </tr>`;
}

function employeeBlock(emp: Employee, index: number): string {
  return `
    <div style="page-break-after:always">
      <h2 style="font-size:18px;color:#1A3A5C;margin:0 0 12px;padding-bottom:6px;
        border-bottom:2px solid #4A90D9">
        Employee #${index + 1}: ${emp.name}
      </h2>
      <table style="width:100%;border-collapse:collapse;font-size:12px;font-family:Calibri,sans-serif">
        ${sectionHeading("Personal Details")}
        ${field("Employee Name", emp.name)}
        ${field("Father Name", emp.fatherName)}
        ${field("Date of Birth", emp.dateOfBirth)}
        ${field("Gender", emp.gender)}
        ${sectionHeading("Identity Details")}
        ${field("Aadhaar Number", emp.aadhaarNumber)}
        ${field("PAN Number", emp.panNumber)}
        ${sectionHeading("Contact Details")}
        ${field("Mobile Number", emp.mobileNumber)}
        ${field("Email", emp.email)}
        ${field("Address", emp.address)}
        ${sectionHeading("Employment Details")}
        ${field("Department", emp.department)}
        ${field("Designation", emp.designation)}
        ${field("Date of Joining", emp.dateOfJoining)}
        ${field("Salary", emp.salaryStructure)}
        ${field("Employment Status", emp.employmentStatus)}
        ${sectionHeading("Financial Details")}
        ${field("Bank Account", emp.bankAccountDetails)}
        ${field("IFSC Code", emp.ifscCode)}
      </table>
    </div>`;
}

function buildHtml(
  employees: Employee[],
  workName: string,
  workSiteDisplay: string,
  generatedDate: string,
): string {
  const employeeBlocks =
    employees.length === 0
      ? `<p style="color:#888;font-style:italic;text-align:center;margin-top:40px">
           No employees found for selected work.
         </p>`
      : employees.map((emp, i) => employeeBlock(emp, i)).join("");

  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8"/>
  <title>Work-wise Employee Full Details Report</title>
  <style>
    @media print {
      body { margin: 0; }
      .no-print { display: none; }
    }
    body {
      font-family: Calibri, Arial, sans-serif;
      font-size: 12px;
      color: #222;
      padding: 40px;
      max-width: 900px;
      margin: 0 auto;
    }
  </style>
</head>
<body>
  <div style="text-align:center;margin-bottom:24px">
    <h1 style="font-size:22px;color:#1A3A5C;margin:0 0 6px">
      Work-wise Employee Full Details Report
    </h1>
    <div style="border-bottom:2px solid #4A90D9;margin-bottom:16px"></div>
    <table style="margin:0 auto;font-size:13px">
      <tr>
        <td style="font-weight:600;padding:2px 12px">Work Name:</td>
        <td style="padding:2px 12px">${workName}</td>
      </tr>
      <tr>
        <td style="font-weight:600;padding:2px 12px">Work Site:</td>
        <td style="padding:2px 12px">${workSiteDisplay}</td>
      </tr>
      <tr>
        <td style="font-weight:600;padding:2px 12px">Generated Date:</td>
        <td style="padding:2px 12px">${generatedDate}</td>
      </tr>
    </table>
  </div>
  ${employeeBlocks}
</body>
</html>`;
}

export async function generateWorkWiseFullReport(
  employees: Employee[],
  workName: string,
  workSite: string | null,
): Promise<void> {
  const generatedDate = formatDate();
  const sanitizedWorkName = workName.toLowerCase().replace(/\s+/g, "_");
  const fileName = `${sanitizedWorkName}_full_employee_report.html`;

  // Filter employees
  let filtered = employees.filter((e) => e.workName === workName);
  if (workSite && workSite.trim() !== "") {
    filtered = filtered.filter((e) => e.workSite === workSite);
  }

  const workSiteDisplay =
    workSite && workSite.trim() !== "" ? workSite : "All Sites";

  const html = buildHtml(filtered, workName, workSiteDisplay, generatedDate);

  // Download as HTML file (opens in browser, printable as PDF)
  const blob = new Blob([html], { type: "text/html;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  const anchor = document.createElement("a");
  anchor.href = url;
  anchor.download = fileName;
  document.body.appendChild(anchor);
  anchor.click();
  document.body.removeChild(anchor);
  URL.revokeObjectURL(url);
}
