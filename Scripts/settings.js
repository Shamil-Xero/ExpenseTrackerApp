const fontSelect = document.getElementById('font-select');
const currencySelect = document.getElementById('currency-select');
const saveButton = document.getElementById('save-settings');

// Load saved settings
const savedFont = localStorage.getItem('font') || 'Roboto, Arial, sans-serif';
const savedCurrency = localStorage.getItem('currency') || '₹';

fontSelect.value = savedFont;
currencySelect.value = savedCurrency;

// Apply current font to the page
document.body.style.fontFamily = savedFont;

saveButton.addEventListener('click', function() {
    const selectedFont = fontSelect.value;
    const selectedCurrency = currencySelect.value;

    localStorage.setItem('font', selectedFont);
    localStorage.setItem('currency', selectedCurrency);

    // Apply new font to the page
    document.body.style.fontFamily = selectedFont;

    alert('Settings saved successfully!');
});

// Theme toggle functionality
const themeToggle = document.getElementById('theme-toggle');
const themeIcon = themeToggle.querySelector('i');

// Check for saved theme preference or default to light theme
const currentTheme = localStorage.getItem('theme') || 'light';
document.body.classList.toggle('dark-theme', currentTheme === 'dark');

// Set initial icon based on the current theme
if (currentTheme === 'dark') {
  themeIcon.classList.remove('fa-moon');
  themeIcon.classList.add('fa-sun');
} else {
  themeIcon.classList.remove('fa-sun');
  themeIcon.classList.add('fa-moon');
}

themeToggle.addEventListener('click', function() {
    document.body.classList.toggle('dark-theme');
    const theme = document.body.classList.contains('dark-theme') ? 'dark' : 'light';
    localStorage.setItem('theme', theme);

    // Toggle the icon
    if (theme === 'dark') {
        themeIcon.classList.remove('fa-moon');
        themeIcon.classList.add('fa-sun');
    } else {
        themeIcon.classList.remove('fa-sun');
        themeIcon.classList.add('fa-moon');
    }
});