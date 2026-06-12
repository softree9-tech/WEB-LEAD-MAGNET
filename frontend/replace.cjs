const fs = require('fs');

let content = fs.readFileSync('src/pages/PublicAnalyze.jsx', 'utf8');

// Add import
content = content.replace(
  "import Logo from '../components/Logo';", 
  "import Logo from '../components/Logo';\nimport Navigation from '../components/Navigation';"
);

// Replace 1
content = content.replace(
  /<div className="portal-navbar" style={{ borderBottom: '1px solid rgba\(10,10,26,0.08\)' }}>\s*<div className="mx-auto w-full max-w-7xl flex items-center justify-between" style={{ padding: '0 1rem' }}>\s*<Link to="\/" className="portal-logo-container" style={{ textDecoration: 'none' }}>\s*<Logo size=\{28\} \/>\s*<\/Link>\s*<button\s*onClick=\{handleReset\}[\s\S]*?<\/button>\s*<\/div>\s*<\/div>/g,
  '<Navigation />'
);

// Replace 2 (loading state)
content = content.replace(
  /<div className="portal-navbar" style={{ borderBottom: '1px solid rgba\(10,10,26,0.08\)' }}>\s*<div className="mx-auto w-full max-w-7xl flex items-center justify-between" style={{ padding: '0 1rem' }}>\s*<Link to="\/" className="portal-logo-container" style={{ textDecoration: 'none' }}>\s*<Logo size=\{28\} \/>\s*<\/Link>\s*<\/div>\s*<\/div>/g,
  '<Navigation />'
);

// Replace 3 (validating state)
content = content.replace(
  /<div className="portal-navbar">\s*<Link to="\/" className="portal-logo-container">\s*<Logo \/>\s*<\/Link>\s*<div className="portal-nav-badge" style={{ cursor: 'default' }}>\s*<ShieldCheck size=\{14\} style={{ color: 'var\(--accent-orange\)' }} \/>\s*Lead Engine Portal\s*<\/div>\s*<\/div>/g,
  '<Navigation />'
);

// Replace 4 (main render state)
content = content.replace(
  /<nav className="portal-navbar" style={{ borderBottom: '1px solid rgba\(10,10,26,0.08\)' }}>\s*<div className="mx-auto w-full max-w-7xl flex items-center justify-between" style={{ padding: '0 1rem' }}>\s*<Link to="\/" className="portal-logo-container" style={{ textDecoration: 'none' }}>\s*<Logo size=\{28\} \/>\s*<\/Link>\s*<div className="portal-nav-badge" style={{ cursor: 'default' }}>\s*<ShieldCheck size=\{14\} style={{ marginRight: '6px' }} \/>\s*Lead Engine Portal\s*<\/div>\s*<\/div>\s*<\/nav>/g,
  '<Navigation />'
);

fs.writeFileSync('src/pages/PublicAnalyze.jsx', content);
console.log('Replaced successfully');
