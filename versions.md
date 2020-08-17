## v2.0.0
First commit: ba9e5ee3dff795c0060b6198f25841c8ed537ce2 (master)

- First version of sasuke prism v2
- Reworked attack helicopters and file scanning
- Now open-source
- Versions are now tracked
- Internal changes (major restructuring)
  - Now being pushed to git
  - Now using ESLint to enforce code quality
  - Switched everything to using strict mode
  - Now interface-based injectors are in injectors/module
  - Changed launch and quit scripts to interact with systemd
  - Tokens are no longer stored as separate files, but now inside tokens.json
  - Reworked index.js to have as little code as possible
    - Code moved out of index.js into injectors/lib
    - Setup npm scripts to do useful things