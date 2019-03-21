const cp = require('child_process');
const debug = require('debug')('retire');
const fs = require('fs');
const path = require('path');
const { promisify } = require('util');

const exec = promisify(cp.exec);
const exists = promisify(fs.exists);

class Scanner {
  constructor(options = {}) {
    this.outputformat = options.outputformat || 'json';
    this.path = options.path || 'public';
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
      const filepath = path.join(process.cwd(), this.path);
      const pathExists = await exists(filepath);
      if (!pathExists) {
        throw new Error(`${this.path} does not exist!`);
      }
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
      debug('parse: %O', json);
      const js = JSON.parse(json);
      
      const issues = {};
      for (const item of js.data) {
        const { component, vulnerabilities } = item.results[0];
        const vulns = vulnerabilities.map(vuln => {
          const { severity, identifiers } = vuln;
          return { severity, summary: identifiers.summary };
        });
        issues[component] = vulns;
      }
      return issues;
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

module.exports = Scanner;