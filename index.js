const cp = require('child_process');
const debug = require('debug')('retire');
const { promisify } = require('util');

const exec = promisify(cp.exec);

class Scanner {
  constructor(options = {}) {
    this.outputformat = options.outputformat || 'json';
    this.jspath = options.path || 'public';
  }
  
  getCmd() {
    let options = '';
    Object.getOwnPropertyNames(this).forEach(key => {
      options += `--${key} ${this[key]} `;
    });
    debug('options: %s', options);
    return `retire ${options}`;
  }
  
  async scan() {
    try {
      await this._run();
    } catch (err) {
      // CLI exits with code 13 if issues found
      if (err.stderr) {
        const output = this._parse(err.stderr);
        debug('output: %O', output);
        return output;
      }
      throw err;
    }
  }
  
  _parse(json) {
    try {
      const js = JSON.parse(json);
      return js.data.map(item => {
        const { component, vulnerabilities } = item.results[0];
        const vulns = vulnerabilities.map(vuln => {
          const { severity, identifiers } = vuln;
          return { severity, summary: identifiers.summary };
        });
        return { [component]: vulns };
      });
    } catch (err) {
      throw err;
    }
  }
  
  async _run() {
    const cmd = this.getCmd();
    debug('cmd: %s', cmd);
    const { stdout, stderr } = await exec(cmd);
    return stdout;
  }
}