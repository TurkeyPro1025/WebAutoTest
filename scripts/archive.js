const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

const MAX_REPORTS = 30;
const historyDir = 'allure-history';

const reports = fs.readdirSync(historyDir)
  .filter(d => d !== 'latest')
  .sort()
  .reverse();

if (reports.length > MAX_REPORTS) {
  const oldReports = reports.slice(MAX_REPORTS);
  oldReports.forEach(d => {
    fs.rmSync(path.join(historyDir, d), { recursive: true });
  });
} 