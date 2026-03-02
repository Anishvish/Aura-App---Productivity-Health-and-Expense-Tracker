const fs = require('fs');
const path = require('path');

const srcDir = path.join(__dirname, '..', 'src');

const walkSync = (dir, filelist = []) => {
    fs.readdirSync(dir).forEach(file => {
        const filePath = path.join(dir, file);
        if (fs.statSync(filePath).isDirectory()) {
            if (!filePath.includes('database') && !filePath.includes('utils') && !filePath.includes('context')) {
                filelist = walkSync(filePath, filelist);
            }
        } else {
            if (filePath.endsWith('.js') && file !== 'theme.js' && file !== 'App.js') {
                filelist.push(filePath);
            }
        }
    });
    return filelist;
};

const processFile = (filePath) => {
    let content = fs.readFileSync(filePath, 'utf8');

    if (!content.includes('import { Colors') && !content.includes('import {Colors')) {
        return;
    }

    // Replace static import with useTheme import
    content = content.replace(/import\s+\{\s*(?:[^}]*,\s*)?Colors(?:,\s*[^}]*)?\s*\}\s*from\s+['"](?:\.\.\/)*theme\/theme['"];?/, (match) => {
        let newMatch = match.replace(/Colors,? ?/, '').replace(/,? ?\}$/, '}');
        if (newMatch.includes('import { }') || newMatch.includes('import {}')) {
            return "import { useTheme } from 'react-native-paper';\n// Colors removed";
        } else {
            return newMatch + "\nimport { useTheme } from 'react-native-paper';";
        }
    });

    if (content.includes('const styles = StyleSheet.create({')) {
        content = content.replace('const styles = StyleSheet.create({', 'const getStyles = (Colors) => StyleSheet.create({');
    }

    // Attempt to inject useTheme
    // We look for: const ComponentName = ({...}) => { or const ComponentName = () => {
    let injected = false;
    let componentMatch = content.match(/const\s+([A-Za-z0-9_]+)\s*=\s*(async\s+)?(\([^)]*\))\s*=>\s*\{/);
    if (componentMatch) {
        const funcStart = componentMatch[0];
        content = content.replace(funcStart, `${funcStart}\n    const { colors: Colors } = useTheme();\n    const styles = getStyles ? getStyles(Colors) : {};`);
        injected = true;
    }

    if (injected) {
        fs.writeFileSync(filePath, content);
        console.log(`Updated ${path.basename(filePath)}`);
    } else {
        console.log(`Could not inject useTheme inside ${path.basename(filePath)}`);
    }
}

const files = walkSync(srcDir);
files.forEach(processFile);
