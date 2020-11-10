## v2.2.0

First commit: 0f8f56c5a16598d6208cd7955d097bd7b34aa6c6 (typescript)
Last commit: TBD

- Everything rewritten in typescript
- The bot actually has a prefix now (required for top.gg integration)
- I screwed up my backend so now sasuke prism is dead until this version rolls out
- Dronestrikes are now harsher (they last longer)
  - Dronestrikes are now AVX-512 accelerated
- New commands
  - x86 - Instruction reference
  - sudo - Super User Do
  - prefix - Adjustable prefixes

## v2.1.0

First commit: b5570153f69420a3c516b9919da462b1c7a1d37a (master)
Last commit: never finished

- Changed activity
- Added charms, mana
  - Use prism cast to use a charm
- Now all players and guilds have MongoDB database entries
- You can now config prefix
- Added prism level to show level and prism mana to show mana

## v2.0.1

First commit: 6d84ef4f2f39ab0695a120ce4c43aa50682ab1ef (master)
Last commit: ce94bc4a5574915b99560672e90c057acf1c171c (master)

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