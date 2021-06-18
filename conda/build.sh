#!/usr/bin/env bash

mkdir ${PREFIX}/parasorter
mkdir ${PREFIX}/bin

cp -r ${SRC_DIR}/* ${PREFIX}/parasorter/

if [[ "$OSTYPE" == "linux-gnu"* ]]; then
        ln -s ${PREFIX}/parasorter/parasorter ${PREFIX}/bin/parasorter

elif [[ "$OSTYPE" == "darwin"* ]]; then
        PARA_PATH=${PREFIX}/bin/parasorter
        echo '#!/usr/bin/env bash' > $PARA_PATH
        echo 'BASEDIR=$(dirname "$0")' >> $PARA_PATH
        echo '${BASEDIR}/../parasorter/parasorter.app/Contents/MacOS/parasorter' >> $PARA_PATH
fi
