function checkAtVatNumber(vatNumber: string): boolean {
    if (!vatNumber.match(/^ATU\d{8}$/i)) {
        return false;
    }

    vatNumber = vatNumber.substring(3);

    let total = 0;

    for (let i = 0; i < 7; ++i) {
        const temp = parseInt(vatNumber.charAt(i), 10) * (i % 2 === 0 ? 1 : 2);
        if (temp > 9) {
            total += 1 + temp % 10;
        } else {
            total += temp;
        }
    }

    total = 10 - (total + 4) % 10;

    if (total === 10) {
        total = 0;
    }

    return total === parseInt(vatNumber.substring(7), 0);
}

function checkBeVatNumber(vatNumber: string): boolean {
    if (!vatNumber.match(/^BE\d{10}$/i)) {
        return false;
    }

    vatNumber = vatNumber.substring(2);

    const number = parseInt(vatNumber.substring(0, 8), 10);
    const check = parseInt(vatNumber.substring(8), 10);
    return 97 - number % 97 === check;
}

function checkBgVatNumber(vatNumber: string): boolean {

    if (!vatNumber.match(/^BG[0-9]{9,10}$/i)) {
        return false;
    }

    vatNumber = vatNumber.substring(2);

    if (vatNumber.length === 9) {
        let total = 0;
        for (let i = 0; i < 8; ++i) {
            total += parseInt(vatNumber.charAt(i), 10) * (i + 1);
        }

        total %= 11;

        const checkSum = parseInt(vatNumber.substring(8), 10);

        if (total !== 10) {
            return total === checkSum;
        }

        total = 0;
        for (let i = 0; i < 8; ++i) {
            total += parseInt(vatNumber.charAt(i), 10) * (i + 3);
        }

        total %= 11;

        if (total === 10) {
            total = 0;
        }

        return total === checkSum;
    }

    if (vatNumber.match(/^\d\d[0-5]\d[0-3]\d{5}$/)) {
        const month = parseInt(vatNumber.substring(2, 4), 10);

        if ((month > 0 && month < 13) || (month > 20 && month < 33) || (month > 40 && month < 53)) {
            const multipliers = [2, 4, 8, 5, 10, 9, 7, 3, 6];
            let total = 0;

            for (let i = 0; i < 9; ++i) {
                total += parseInt(vatNumber.charAt(i), 10) * multipliers[i];
            }

            total %= 11;

            if (total === 10) {
                total = 0;
            }

            if (total === parseInt(vatNumber.substring(9, 10), 0)) {
                return true;
            }
        }
    }

    let multipliers = [21, 19, 17, 13, 11, 9, 7, 3, 1];

    let total = 0;

    for (let i = 0; i < 9; ++i) {
        total += parseInt(vatNumber.charAt(i), 10) * multipliers[i];
    }

    const checksum = parseInt(vatNumber.substring(9, 10), 10);

    if (total % 10 === checksum) {
        return true;
    }

    multipliers = [4, 3, 2, 7, 6, 5, 4, 3, 2];

    total = 0;
    for (let i = 0; i < 9; ++i) {
        total += parseInt(vatNumber.charAt(i), 10) * multipliers[i];
    }

    total = 11 - total % 11;

    if (total === 10) {
        return false;
    }

    if (total === 11) {
        total = 0;
    }

    return total === checksum;
}

function checkChVatNumber(vatNumber: string): boolean {
    // Swiss VAT numbers are a little bit weird, as they start with 3 letters.
    if (!vatNumber.match(/^CHE\d{9}(MWST|TVA|IVA)?$/i)) {
        return false;
    }

    vatNumber = vatNumber.substring(3, 12);

    const multipliers = [5, 4, 3, 2, 7, 6, 5, 4];
    let total = 0;

    for (let i = 0; i < 8; ++i) {
        total += parseInt(vatNumber.charAt(i), 10) * multipliers[i];
    }

    total = (11 - (total % 11)) % 11;

    if (total === 10) {
        return false;
    }

    return total === parseInt(vatNumber.substring(8, 9), 10);
}

function checkCyVatNumber(vatNumber: string): boolean {
    if (!vatNumber.match(/^CY\d{8}[A-Z]/)) {
        return false;
    }

    vatNumber = vatNumber.substring(2);

    if (vatNumber.startsWith("12")) {
        return false;
    }

    let total = 0;
    for (let i = 0; i < 8; ++i) {
        let temp = parseInt(vatNumber.charAt(i), 10);

        if (i % 2 === 0) {
            switch (temp) {
                case 0: temp = 1; break;
                case 1: temp = 0; break;
                case 2:
                case 3:
                case 4:
                    temp = temp * 2 + 1;
                    break;
                default:
                    temp = temp * 2 + 3;
            }
        }

        total += temp;
    }

    total %= 26;
    return String.fromCharCode(total + 65) === vatNumber.charAt(8);
}

function checkCzVatNumber(vatNumber: string): boolean {
    if (!vatNumber.match(/^CZ\d{8,10}(\d{3})?$/i)) {
        return false;
    }

    vatNumber = vatNumber.substring(2);

    let total = 0;

    if (vatNumber.match(/^\d{8}$/)) {
        // Legal entities

        for (let i = 0; i < 7; ++i) {
            total += parseInt(vatNumber.charAt(i), 10) * (8 - i);
        }

        total = 11 - total % 11;

        if (total === 10) {
            total = 0;
        }

        if (total === 11) {
            total = 1;
        }

        return total === parseInt(vatNumber.charAt(7), 10);
    } else if (vatNumber.match(/^[0-5][0-9][0156][0-9][0-3][0-9]\d{3}$/)) {
        // Individuals type 1 (Standard) - 9 digits without check digit
        return true;
    } else if (vatNumber.match(/^6\d{8}$/)) {
        // Individuals type 2 (Special Cases) - 9 digits including check digit
        for (let i = 0; i < 7; ++i) {
            total += parseInt(vatNumber.charAt(i + 1), 10) * (8 - i);
        }

        let a: number;
        if (total % 11 === 0) {
            a = total + 11;
        } else {
            a = Math.ceil(total / 11) * 11;
        }

        const pointer = a - total;

        const lookup = [8, 7, 6, 5, 4, 3, 2, 1, 0, 9, 8];

        return lookup[pointer - 1] === parseInt(vatNumber.charAt(8), 10);
    } else if (vatNumber.match(/^\d{2}[0-3|5-8][0-9][0-3][0-9]\d{4}$/)) {
        // Individuals type 3 - 10 digits
        const temp =
            parseInt(vatNumber.substring(0, 2), 10) +
            parseInt(vatNumber.substring(2, 4), 10) +
            parseInt(vatNumber.substring(4, 6), 10) +
            parseInt(vatNumber.substring(6, 8), 10) +
            parseInt(vatNumber.substring(8, 10), 10);

        return temp % 11 === 0 && parseInt(vatNumber, 10) % 11 === 0;
    } else {
        return false;
    }
}

function checkDeVatNumber(vatNumber: string): boolean {
    if (!vatNumber.match(/^DE[1-9]\d{8}$/i)) {
        return false;
    }

    vatNumber = vatNumber.substring(2);

    let product = 10;
    let sum = 0;
    for (let i = 0; i < 8; ++i) {
        sum = (parseInt(vatNumber.charAt(i), 10) + product) % 10;
        if (sum === 0) {
            sum = 10;
        }
        product = (2 * sum) % 11;
    }

    let checkDigit: number;
    if (11 - product === 10) {
        checkDigit = 0;
    } else {
        checkDigit = 11 - product;
    }

    return checkDigit === parseInt(vatNumber.charAt(8), 10);
}

function checkHrVatNumber(vatNumber: string): boolean {
    if (!vatNumber.match(/^HR\d{11}$/i)) {
        return false;
    }

    vatNumber = vatNumber.substring(2);

    let product = 10;
    let sum = 0;

    for (let i = 0; i < 10; ++i) {
        sum = (parseInt(vatNumber.charAt(i), 10) + product) % 10;
        if (sum === 0) {
            sum = 10;
        }

        product = (2 * sum) % 11;
    }

    return (product + parseInt(vatNumber.charAt(10), 10)) % 10 === 1;
}

function checkHuVatNumber(vatNumber: string): boolean {
    if (!vatNumber.match(/^HU\d{8}$/i)) {
        return false;
    }

    vatNumber = vatNumber.substring(2);

    let total = 0;
    const multipliers = [9, 7, 3, 1, 9, 7, 3];

    for (let i = 0; i < 7; ++i) {
        total += parseInt(vatNumber.charAt(i), 10) * multipliers[i];
    }

    total = 10 - total % 10;

    if (total === 10) {
        total = 0;
    }

    return total === parseInt(vatNumber.charAt(7), 10);
}

function checkLtVatNumber(vatNumber: string): boolean {
    if (!vatNumber.match(/^LT(\d{9}|\d{12})$/i)) {
        return false;
    }

    vatNumber = vatNumber.substring(2);

    if (vatNumber.length === 9) {
        // Legal persons
        if (vatNumber.charAt(7) !== "1") {
            return false;
        }

        let total = 0;

        for (let i = 0; i < 8; ++i) {
            total += parseInt(vatNumber.charAt(i), 10) * (i + 1);
        }

        if (total % 11 === 10) {
            total = parseInt(vatNumber.charAt(7), 10);

            for (let i = 0; i < 7; ++i) {
                total += parseInt(vatNumber.charAt(i), 10) * (i + 3);
            }
        }

        total %= 11;

        if (total === 10) {
            total = 0;
        }

        return total === parseInt(vatNumber.charAt(8), 10);
    } else {
        // temporarily registered taxpayers
        if (vatNumber.charAt(10) !== "1") {
            return false;
        }

        let total = 0;

        for (let i = 0; i < 11; ++i) {
            total += parseInt(vatNumber.charAt(i), 10) * ((i + 1 + (i >= 9 ? 1 : 0)) % 10);
        }

        if (total % 11 === 10) {
            total = 0;

            for (let i = 0; i < 11; ++i) {
                total += parseInt(vatNumber.charAt(i), 10) * ((i + 3 + (i >= 7 ? 1 : 0)) % 10);
            }
        }

        total %= 11;

        if (total === 10) {
            total = 0;
        }

        return total === parseInt(vatNumber.charAt(11), 10);
    }
}

function checkLuVatNumber(vatNumber: string): boolean {
    if (!vatNumber.match(/^LU\d{8}$/i)) {
        return false;
    }

    const number = vatNumber.substring(2);
    const siren = number.substring(0, 6);
    const checkDigit = parseInt(number.substring(6), 10) % 89;
    return parseInt(siren, 10) % 89 === checkDigit;
}

function checkLvVatNumber(vatNumber: string): boolean {
    if (!vatNumber.match(/^LV\d{11}$/i)) {
        return false;
    }


    vatNumber = vatNumber.substring(2);

    const firstChar = vatNumber.charCodeAt(0) - 48;

    do {
        // Natural bodies

        if (firstChar >= 0 && firstChar <= 3) {

            const secondChar = vatNumber.charCodeAt(1) - 48;
            if (firstChar === 3 && secondChar > 1) {
                break;
            }

            let d = firstChar * 10 + secondChar;

            const thirdChar = vatNumber.charCodeAt(2) - 48;
            if (thirdChar > 1) {
                break;
            }

            const fourthChar = vatNumber.charCodeAt(3) - 48;
            if ((thirdChar === 0 && fourthChar === 0) || (thirdChar === 1 && fourthChar > 2)) {
                break;
            }

            const m = thirdChar * 10 + fourthChar;

            switch (m) {
                case 2:
                    if (d > 29) {
                        break;
                    }
                    if (d === 29) {
                        const fifthChar = vatNumber.charCodeAt(4);
                        const sixthChar = vatNumber.charCodeAt(5);
                        const y = fifthChar * 10 + sixthChar;
                        if (y % 4 !== 0) {
                            break;
                        }
                    }
                    return true;
                case 4:
                case 6:
                case 9:
                case 11:
                    if (d < 31) {
                        return true;
                    }
                    break;
                default:
                    return true;
            }

        }
    } while (false);


    // Legal entities
    let total = 0;
    const multipliers = [9, 1, 4, 8, 3, 10, 2, 5, 7, 6];

    for (let i = 0; i < 10; ++i) {
        total += parseInt(vatNumber.charAt(i), 10) * multipliers[i];
    }

    if (total % 11 === 4 && firstChar === 9) {
        total -= 45;
    }

    const modulo = total % 11;

    if (modulo === 4) {
        total = 4 - modulo;
    } else if (modulo > 4) {
        total = 14 - modulo;
    } else if (modulo < 4) {
        total = 3 - modulo;
    }

    return total === parseInt(vatNumber.charAt(10), 10);
}

function checkEeVatNumber(vatNumber: string): boolean {
    if (!vatNumber.match(/^EE10\d{7}$/i)) {
        return false;
    }

    vatNumber = vatNumber.substring(4);

    let total = 3 + parseInt(vatNumber.charAt(0), 10);
    const multipliers = [3, 7, 1, 3, 7];

    for (let i = 0; i < 5; ++i) {
        total += parseInt(vatNumber.charAt(i + 1), 10) * multipliers[i];
    }

    total = 10 - total % 10;

    if (total === 10) {
        total = 0;
    }

    return total === parseInt(vatNumber.charAt(6), 10);
}

function checkElVatNumber(vatNumber: string) {
    if (!vatNumber.match(/^EL\d{8,9}$/i)) {
        return false;
    }

    vatNumber = vatNumber.substring(2);

    if (vatNumber.length === 8) {
        vatNumber = "0" + vatNumber;
    }

    let total = 0;

    for (let i = 0; i < 8; ++i) {
        total += parseInt(vatNumber.charAt(i), 10) * (1 << (8 - i));
    }

    total = total % 11;

    if (total > 9) {
        total = 0;
    }

    return total === parseInt(vatNumber.charAt(8), 10);
}

function checkEsVatNumber(vatNumber: string): boolean {
    if (!vatNumber.startsWith("ES")) {
        return false;
    }

    vatNumber = vatNumber.substring(2);

    if (vatNumber.match(/^[A-HN-SW]\d{7}[A-J]$/i)) {
        // Juridical entities other than national ones

        let total = 0;

        for (let i = 0; i < 7; ++i) {
            let temp = parseInt(vatNumber.charAt(i + 1), 10) * (i % 2 === 0 ? 2 : 1);
            if (temp > 9) {
                total += 1 + temp % 10;
            } else {
                total += temp;
            }
        }

        total = 10 - total % 10;
        const check = String.fromCharCode(total + 64);

        return check === vatNumber.substring(8);

    } else if (vatNumber.match(/^[A-Z]\d{8}$/i)) {
        // National juridical entities

        let total = 0;

        for (let i = 0; i < 7; ++i) {
            const temp = parseInt(vatNumber.charAt(i + 1), 10) * (i % 2 === 0 ? 2 : 1);
            if (temp > 9) {
                total += 1 + temp % 10;
            } else {
                total += temp;
            }
        }

        total = 10 - total % 10;

        if (total === 10) {
            total = 0;
        }

        return total === parseInt(vatNumber.substring(8), 10);
    } else if (vatNumber.match(/^[0-9YZ]\d{7}[A-Z]$/i)) {
        // Personal number (NIF) (starting with numeric of Y or Z)
        const firstChar = vatNumber.charAt(0).toUpperCase();
        if (firstChar === "Y") {
            vatNumber = "1" + vatNumber.substring(1);
        } else if (firstChar === "Z") {
            vatNumber = "2" + vatNumber.substring(1);
        }

        return vatNumber.charAt(8) === "TRWAGMYFPDXBNJZSQVHLCKE".charAt(parseInt(vatNumber.substring(0, 8), 10) % 23);
    } else if (vatNumber.match(/^[KLMX]\d{7}[A-Z]$/i)) {
        // Personal number (NIF) (starting with K, L, M, or X)

        return vatNumber.charAt(8) === "TRWAGMYFPDXBNJZSQVHLCKE".charAt(parseInt(vatNumber.substring(1, 8), 10) % 23);
    } else {
        return false;
    }
}

function checkFiVatNumber(vatNumber: string) {
    if (!vatNumber.match(/^FI\d{8}$/i)) {
        return false;
    }

    vatNumber = vatNumber.substring(2);

    const multipliers = [7, 9, 10, 5, 8, 4, 2];

    let total = 0;

    for (let i = 0; i < 7; ++i) {
        total += parseInt(vatNumber.charAt(i), 10) * multipliers[i];
    }

    total = 11 - total % 11;

    if (total > 9) {
        total = 0;
    }

    return total === parseInt(vatNumber.charAt(7), 10);
}

function checkFrVatNumber(vatNumber: string) {
    if (!vatNumber.match(/^FR([A-Z0-9]{2})\d{9}$/i)) {
        return false;
    }

    if (vatNumber.substring(2, 4).match(/[A-Z]/)) {
        return true;
    }

    // let number = vatNumber.substr(offset);
    const number = vatNumber.substring(2);
    const siren = number.substring(2);
    const checkDigit = parseInt(number.substring(0, 2), 10) % 97;

    return ((12 + 3 * (parseInt(siren, 10) % 97)) % 97 === checkDigit);

}

function checkIEVatNumber(vatNumber: string) {
    let oldFormatMatches: RegExpMatchArray | null = null;

    if (!vatNumber.match(/^IE\d{7}[A-W][AH]?$/i) && !(oldFormatMatches = vatNumber.match(/^IE[7-9][A-Z]\d{5}[A-W]$/))) {
        return false;
    }

    vatNumber = vatNumber.substring(2);

    if (oldFormatMatches) {
        vatNumber = "0" + vatNumber.substring(2, 7) + vatNumber.substring(0, 1) + vatNumber.substring(7, 8);
    }

    let total = 0;
    for (let i = 0; i < 7; ++i) {
        total += parseInt(vatNumber.charAt(i), 10) * (8 - i);
    }

    let longChar = vatNumber[8];

    if (longChar === "H") {
        total += 72;
    } else if (longChar === "A") {
        total += 9;
    }

    total %= 23;

    let checkChar = "W";

    if (total !== 0) {
        checkChar = String.fromCharCode(total + 64);
    }

    return checkChar === vatNumber.substring(7, 8);
}

function checkItVatNumber(vatNumber: string) {
    if (!vatNumber.match(/^IT\d{11}$/i)) {
        return false;
    }

    let total = 0;

    vatNumber = vatNumber.substring(2);

    if (parseInt(vatNumber.substring(0, 7), 10) === 0) {
        return false;
    }

    const lastDigits = parseInt(vatNumber.substring(7, 10), 10);

    if ((lastDigits === 0 || lastDigits > 201) && lastDigits !== 999 && lastDigits !== 888) {
        return false;
    }

    for (let i = 0; i < 10; ++i) {
        const temp = parseInt(vatNumber.charAt(i), 10) * ((i % 2) === 0 ? 1 : 2);
        if (temp > 9) {
            total += 1 + temp % 10;
        } else {
            total += temp;
        }
    }

    total = 10 - total % 10;

    if (total > 9) {
        total = 0;
    }

    return total === parseInt(vatNumber.substring(10), 10);
}

function checkMtVatNumber(vatNumber: string): boolean {
    if (!vatNumber.match(/^MT[1-9]\d{7}$/i)) {
        return false;
    }

    vatNumber = vatNumber.substring(2);

    let total = 0;
    for (let i = 0; i < 6; ++i) {
        total += parseInt(vatNumber.charAt(i), 10) * (i + (i > 1 ? 4 : 3));
    }

    total = 37 - total % 37;

    return total === parseInt(vatNumber.substring(6), 10);
}

function checkNlVatNumber(vatNumber: string): boolean {
    function isStandardNlVatNumber(vatNumber: string) {
        const number = vatNumber.substring(2, 11);
        const siren = number.substring(0, 8);
        const checkDigit = parseInt(number.substring(8), 10);

        let value = 0;

        for (let i = 0; i < 8; ++i) {
            value += parseInt(siren.charAt(i), 10) * (9 - i);
        }

        return value % 11 === checkDigit;
    }

    function isSoleProprietorNumber(vatNumber: string) {
        vatNumber = vatNumber.toUpperCase();
        let numericVat = "";

        for (let i = 0 ; i < vatNumber.length; ++i) {
            let nextChar = vatNumber.charCodeAt(i);

            if (nextChar > 41 && nextChar < 44) { // * --> 36, + --> 37
                nextChar -= 6;
            } else if (nextChar > 47 && nextChar < 58) { // 0-9 --> 0-9
                nextChar -= 48;
            } else if (nextChar > 64 && nextChar < 91) { // A-Z --> 10-35
                nextChar -= 55;
            }

            numericVat = numericVat + nextChar;
        }

        while (numericVat.length > 7) {
            const part = parseInt(numericVat.substring(0, 7), 10);
            numericVat = (part % 97) + numericVat.substring(7);
        }

        const modulo = parseInt(numericVat, 10) % 97;

        return modulo === 1;
    }

    if (vatNumber.match(/^NL\d{9}B\d{2}$/i) && isStandardNlVatNumber(vatNumber)) {
        return true;
    }

    if (vatNumber.match(/^NL[A-Z0-9*+]{10}\d{2}$/i)) {
        return isSoleProprietorNumber(vatNumber);
    }

    return false;
}

function checkNoVatNumber(vatNumber: string): boolean {
    if (!vatNumber.match(/^NO\d{9}$/i)) {
        return false;
    }

    vatNumber = vatNumber.substring(2);

    const multipliers = [3, 2, 7, 6, 5, 4, 3, 2];
    let total = 0;

    for (let i = 0; i < 8; ++i) {
        total += parseInt(vatNumber.charAt(i), 10) * multipliers[i];
    }

    total = 11 - total % 11;
    if (total === 11) {
        total = 0;
    }

    if (total === 10) {
        return false;
    }

    return total === parseInt(vatNumber.charAt(8), 10);
}

function checkPlVatNumber(vatNumber: string): boolean {
    if (!vatNumber.match(/^PL\d{10}$/i)) {
        return false;
    }

    vatNumber = vatNumber.substring(2);

    const multipliers = [6, 5, 7, 2, 3, 4, 5, 6, 7];
    let total = 0;

    for (let i = 0; i < 9; ++i) {
        total += parseInt(vatNumber.charAt(i), 10) * multipliers[i];
    }

    total = total % 11;
    if (total > 9) {
        total = 0;
    }

    return total === parseInt(vatNumber.charAt(9), 10);
}

function checkGbVatNumber(vatNumber: string): boolean {
    if (!vatNumber.match(/^GB\d{9}|\d{12}|(GD|HA)\d{3}$/i)) {
        return false;
    }

    vatNumber = vatNumber.substring(2);

    const nextTwo = vatNumber.substring(0, 2);

    if (nextTwo === "GD") {
        // Government departments
        return parseInt(vatNumber.substring(2, 5), 10) < 500;
    }

    if (nextTwo === "HA") {
        // Health authorities
        return parseInt(vatNumber.substring(2, 5), 10) > 499;
    }


    if (parseInt(vatNumber, 10) === 0) {
        return false;
    }

    const no = parseInt(vatNumber.substring(0, 7), 10);

    let total = 0;

    for (let i = 0; i < 7; ++i) {
        total += parseInt(vatNumber.charAt(i), 10) * (8 - i);
    }

    while (total > 0) {
        total -= 97;
    }

    total *= -1;

    const cd = parseInt(vatNumber.substring(7, 9), 10);

    if (total === cd && no < 9990001 && (no < 100000 || no > 999999) && (no < 9490001 || no > 9700000)) {
        return true;
    }

    if (total >= 55) {
        total -= 55;
    } else {
        total += 42;
    }

    return total === cd && no > 1000000;
}


function checkDkVatNumber(vatNumber: string) {
    if (!vatNumber.match(/^DK\d{8}$/i)) {
        return false;
    }

    vatNumber = vatNumber.substring(2);

    let total = 0;
    const multipliers = [2, 7, 6, 5, 4, 3, 2, 1];

    for (let i = 0; i < 8; ++i) {
        total += parseInt(vatNumber.charAt(i), 10) * multipliers[i];
    }

    total %= 11;

    return total === 0;
}

function checkSeVatNumber(vatNumber: string) {
    if (!vatNumber.match(/^SE\d{10}01$/i)) {
        return false;
    }

    vatNumber = vatNumber.substring(2, 12);

    let r = 0;
    for (let i = 0; i < 9; i += 2) {
        const digit = parseInt(vatNumber.charAt(i), 10);
        r += (digit < 5 ? 0 : 1) + ((digit * 2) % 10);
    }

    let s = 0;
    for (let i = 1; i < 9; i += 2) {
        s += parseInt(vatNumber.charAt(i), 10);
    }

    const checkDigit = (10 - (r + s) % 10) % 10;
    return checkDigit === parseInt(vatNumber.slice(9), 10);
}

function checkSiVatNumber(vatNumber: string): boolean {
    if (!vatNumber.match(/^SI[1-9]\d{7}$/i)) {
        return false;
    }

    vatNumber = vatNumber.substring(2);

    let total = 0;

    for (let i = 0; i < 7; ++i) {
        total += parseInt(vatNumber.charAt(i), 10) * (8 - i);
    }

    total = 11 - total % 11;
    if (total === 10) {
        total = 0;
    }

    return total !== 11 && total === parseInt(vatNumber.charAt(7), 10);
}

function checkSkVatNumber(vatNumber: string): boolean {
    if (!vatNumber.match(/^SK\d{10}$/i)) {
        return false;
    }

    const number = parseInt(vatNumber.substring(2), 10);
    return number % 11 === 0;
}

function checkPtVatNumber(vatNumber: string) {
    if (!vatNumber.match(/^PT(((([1-3]|5|6)\d)|(45)|(7([012]|[45]|[789]))|(9[0189]))(\d{7}$))$/i)) {
        return false;
    }

    let total = 0;
    const multipliers = [9, 8, 7, 6, 5, 4, 3, 2];

    for (let i = 0; i < 8; ++i) {
        total += parseInt(vatNumber.charAt(2 + i), 10) * multipliers[i];
    }

    total = 11 - total % 11;

    if (total > 9) {
        total = 0;
    }

    return total === parseInt(vatNumber.charAt(10), 10);
}

function checkRoVatNumber(vatNumber: string): boolean {
    if (!vatNumber.match(/^RO[1-9]\d{1,9}$/i)) {
        return false;
    }

    vatNumber = vatNumber.substring(2);

    let multipliers = [7, 5, 3, 2, 1, 7, 5, 3, 2];

    const length = vatNumber.length;

    multipliers = multipliers.slice(10 - length);

    let total = 0;

    for (let i = 0; i < length - 1; ++i) {
        total += parseInt(vatNumber.charAt(i), 10) * multipliers[i];
    }

    total = (10 * total) % 11;
    if (total === 10) {
        total = 0;
    }

    return total === parseInt(vatNumber.substring(length - 1, length), 10);
}

function checkRsVatNumber(vatNumber: string): boolean {
    if (!vatNumber.match(/^RS\d{9}$/i)) {
        return false;
    }

    vatNumber = vatNumber.substring(2);

    let product = 10;
    let sum = 0;

    for (let i = 0; i < 8; ++i) {
        sum = (parseInt(vatNumber.charAt(i), 10) + product) % 10;
        if (sum === 0) {
            sum = 10;
        }
        product = (2 * sum) % 11;
    }

    return (product + parseInt(vatNumber.charAt(8), 10)) % 10 === 1;
}

function checkRuVatNumber(vatNumber: string): boolean {
    if (!vatNumber.match(/^RU(\d{10}|\d{12)$/i)) {
        return false;
    }

    vatNumber = vatNumber.substring(2);

    if (vatNumber.length === 10) {
        let total = 0;
        const multipliers = [2, 4, 10, 3, 5, 9, 4, 6, 8];

        for (let i = 0; i < 9; ++i) {
            total += parseInt(vatNumber.charAt(i), 10) * multipliers[i];
        }

        total = total % 11;

        if (total > 9) {
            total = total % 10;
        }

        return total === parseInt(vatNumber.charAt(9), 10);
    }

    let total1 = 0;
    let total2 = 0;
    const multipliers1 = [7, 2, 4, 10, 3, 5, 9, 4, 6, 8]; // 10
    const multipliers2 = [3, 7, 2, 4, 10, 3, 5, 9, 4, 6, 8]; // 11

    for (let i = 0; i < 11; ++i) {
        let digit = parseInt(vatNumber.charAt(i), 10);

        if (i !== 10) {
            total1 = digit * multipliers1[i];
        }
        total2 = digit * multipliers2[i];
    }

    if (total1 > 9) {
        total1 %= 10;
    }

    if (total2 > 9) {
        total2 %= 10;
    }

    return total1 === parseInt(vatNumber.charAt(10), 10) && total2 === parseInt(vatNumber.charAt(11), 10);
}


export function validateVatNumber(vatNumber: string): boolean {
    if (typeof vatNumber !== "string") {
        return false;
    }

    vatNumber = vatNumber.replace(/[ .,_-]/g, "");

    const countryCode = vatNumber.substring(0, 2).toUpperCase();

    switch (countryCode) {
        case "AT":
            return checkAtVatNumber(vatNumber);
        case "BE":
            return checkBeVatNumber(vatNumber);
        case "BG":
            return checkBgVatNumber(vatNumber);
        case "CH":
            return checkChVatNumber(vatNumber);
        case "CY":
            return checkCyVatNumber(vatNumber);
        case "CZ":
            return checkCzVatNumber(vatNumber);
        case "DE":
            return checkDeVatNumber(vatNumber);
        case "DK":
            return checkDkVatNumber(vatNumber);
        case "EE":
            return checkEeVatNumber(vatNumber);
        case "EL":
            return checkElVatNumber(vatNumber);
        case "ES":
            return checkEsVatNumber(vatNumber);
        case "FI":
            return checkFiVatNumber(vatNumber);
        case "HR":
            return checkHrVatNumber(vatNumber);
        case "HU":
            return checkHuVatNumber(vatNumber);
        case "FR":
            return checkFrVatNumber(vatNumber);
        case "GB":
            return checkGbVatNumber(vatNumber);
        case "IE":
            return checkIEVatNumber(vatNumber);
        case "IT":
            return checkItVatNumber(vatNumber);
        case "LT":
            return checkLtVatNumber(vatNumber);
        case "LU":
            return checkLuVatNumber(vatNumber);
        case "LV":
            return checkLvVatNumber(vatNumber);
        case "MT":
            return checkMtVatNumber(vatNumber);
        case "NL":
            return checkNlVatNumber(vatNumber);
        case "NO":
            return checkNoVatNumber(vatNumber);
        case "PL":
            return checkPlVatNumber(vatNumber);
        case "PT":
            return checkPtVatNumber(vatNumber);
        case "RO":
            return checkRoVatNumber(vatNumber);
        case "RS":
            return checkRsVatNumber(vatNumber);
        case "RU":
            return checkRuVatNumber(vatNumber);
        case "SE":
            return checkSeVatNumber(vatNumber);
        case "SK":
            return checkSkVatNumber(vatNumber);
        case "SI":
            return checkSiVatNumber(vatNumber);
        default: {
            const patterns: Record<string, RegExp> = {
                EU: /^EU\d{9}$/i,
            };

            return patterns[countryCode]?.test(vatNumber) ?? false;
        }
    }
}
