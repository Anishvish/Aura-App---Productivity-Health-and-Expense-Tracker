const fs = require('fs');

const files = [
    'src/screens/DashboardScreen.js',
    'src/screens/TasksScreen.js',
    'src/screens/WellnessScreen.js',
    'src/screens/StatsScreen.js',
    'src/screens/ExpensesScreen.js',
    'src/screens/ProfileScreen.js',
    'src/screens/LoginScreen.js',
    'src/screens/SignUpScreen.js',
];

for (const file of files) {
    let content = fs.readFileSync(file, 'utf8');

    // Replace the FIRST useTheme destructuring to also get 'dark'
    content = content.replace(
        'const { colors: Colors } = useTheme();',
        'const { colors: Colors, dark: isDarkTheme } = useTheme();'
    );

    // Replace hardcoded StatusBar barStyle
    content = content.replace(
        /barStyle="light-content"/g,
        'barStyle={isDarkTheme ? "light-content" : "dark-content"}'
    );

    fs.writeFileSync(file, content, 'utf8');
    console.log('Patched:', file);
}
console.log('Done!');
