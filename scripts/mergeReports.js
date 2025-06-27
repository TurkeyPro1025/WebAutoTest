const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

const mergeAllureReports = () => {
  const historyDir = 'allure-history';
  const reports = fs.readdirSync(historyDir)
    .filter(d => d !== 'latest')
    .map(d => path.join(historyDir, d));

  execSync(`allure generate ${reports.join(' ')} -o merged-report`);
};

mergeAllureReports(); 