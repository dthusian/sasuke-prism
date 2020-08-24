## v2.0.1

First commit: 6d84ef4f2f39ab0695a120ce4c43aa50682ab1ef (master)
Last commit: (master)

- Reworked dice.js
- Now actually open-source
- New static directory: assets. For those static image assets
  - Attack helicopter avatar is no longer stored in tokens.json and now in attack-heli.txt
- New trigger, sudo. Used by the super-user to perform root actions.
- Put useful information in README
- Restructure code
  - Now we have a src/

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