# raven
 - A chess bot which predicts moves from an upgradable database.
 - NOTE: Sorry for the stupid looks of it. I was originally using lichess-bot and then I deleted all those files to upload this to github. Sooooo it looks bad!

# build
 - Just run `compile.sh` and you're done!
 - The `compile.js` script builds everything into a single file (that actually works!) and the `pkg` command builds the whole thing into a binary for your system. enjoy.

# how-to
 - It's just a uci engine. Pass the `raven` symlink to any software and they'll happily accept it! (i hope)
 - The uci part was very painful, So I will leave this here for anyone trying to make a uci engine to suffer from reading the awful docs: [http://page.mi.fu-berlin.de/block/uci.htm](http://page.mi.fu-berlin.de/block/uci.htm)