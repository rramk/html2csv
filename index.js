const moment = require('moment');
const readline = require('readline');
const fs = require('fs');

const args = process.argv.slice(2);

if (!args.length) {
  console.log(`\n\nUsage: ${process.argv[1]} <input_html_file>`);
  exit(1);
}

const input = args[0];
const output = args[1] || `${input}.tsv`;

const istrm = fs.createReadStream(input);
const ostrm = fs.createWriteStream(output);

const rl = readline.createInterface({
  input: istrm
});

let previousSum = 0;
rl.on('line', l => {
  // first 8 digits is date in DD/MM/YY
  l = l.trim().replace(/\b\s{1}\b/g, '-');
  const columns = l.replace(/  +/g, '\t').split('\t');

  if (moment(columns[0], 'DD/MM/YY', true).isValid()) {
    // all the columns are present
    if (columns.length === 7) {
      return ostrm.write(l + '\n');
    }

    let c1, c2, c3, c4, c5, c6, c7;
    // Asuuming first two columns are always present
    c1 = columns[0];
    c2 = columns[1];
    c3 = columns[2];
    c7 = columns[columns.length-1]; // assuming last one is alway present
    const ic7 = +c7.trim().replace(/,/g, '');
    if (moment(c3, 'DD/MM/YY', true).isValid()) {
      // we've met date, so this is the 4th column and 3rd column is blank
      c3 = '';
      c4 = columns[2];
      if (columns.length === 6) {
        c6 = columns[columns.length-2];
        c5 = columns[columns.length-3];
        previousSum = ic7;
        ostrm.write(`${c1}\t${c2}\t${c3}\t${c4}\t${c5}\t${c6}\t${c7}\n`);
        return;
      } else if (columns.length === 5) {
        c7 = columns[columns.length-1]; // assuming last one is alway present
        c6 = columns[columns.length-2];
        // convert to number formats to determine column position
        const ic6 = +c6.replace(/,/g, '');
        if (ic6 + previousSum == ic7) {
          c5 = '';
        } else {
          c5 = c6;
          c6 = '';
        }
        previousSum = ic7;
        ostrm.write(`${c1}\t${c2}\t${c3}\t${c4}\t${c5}\t${c6}\t${c7}\n`);
      } else {
        console.trace(`Unable to proceed because of row ${columns}`);
        process.exit();
      }
      return;
    }
    c4 = columns[3];
    if (moment(c4, 'DD/MM/YY', true).isValid()) {
      if (columns.length === 6) {
        c6 = columns[columns.length-2];
        // convert to number formats to determine column position
        const ic6 = +c6.replace(/,/g, '');
        if (ic6 + previousSum == ic7) {
          c5 = '';
        } else {
          c5 = c6;
          c6 = '';
        }
        previousSum = ic7;
        ostrm.write(`${c1}\t${c2}\t${c3}\t${c4}\t${c5}\t${c6}\t${c7}\n`);
      } else if (columns.length === 5) {
        c6 = '';
        c5 = '';
        previousSum = ic7;
        ostrm.write(`${c1}\t${c2}\t${c3}\t${c4}\t${c5}\t${c6}\t${c7}\n`);
      } else {
        console.trace(`Unable to proceed because of row ${columns}`);
        process.exit();
      }
    }
  }
});

rl.on('close', () => {
  console.log(`\n\tOutput file: ${output}`);
  ostrm.close();
});
