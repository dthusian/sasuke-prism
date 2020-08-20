## v2.0.1


## v2.0.0
First commit: ba9e5ee3dff795c0060b6198f25841c8ed537ce2 (master)
Last commit: 3d49b4c5ddc0ba076b78ad7e247c18fc3eb07c97 (master)

- First version of sasuke prism v2
- Reworked attack helicopters and file scanning
- Now open-source (wait that's not true)
- Versions are now tracked
  - New trigger, if pinged, will send bot information
  - This bot info includes version
- Internal changes (major restructuring)
  - Now being pushed to git
  - Now using ESLint to enforce code quality
  - Switched everything to using strict mode
  - Now interface-based injectors are in injectors/module
  - Tokens are no longer stored as separate files, but now inside tokens.json
  - Reworked index.js to have as little code as possible
    - Code moved out of index.js into injectors/lib
    - Setup npm scripts to do useful things