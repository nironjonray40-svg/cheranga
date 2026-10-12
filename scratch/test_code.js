// Test code to validate syntax
const code = `
function toBnDigits(n) {
    if (n === null || n === undefined) return '';
    const bnNums = ['০','১','২','৩','৪','৫','৬','৭','৮','৯'];
    return String(n).replace(/[0-9]/g, d => bnNums[d]);
}
`;
console.log("OK");
