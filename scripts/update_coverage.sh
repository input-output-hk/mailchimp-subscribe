#!/bin/bash

RED='\033[0;31m'
NC='\033[0m'
if [ "$CI" == "true" ]; then
  echo "On CI, continuing with updating coverage"
  export COVERALLS_SERVICE_JOB_ID=$CIRCLE_SHA1
  npm test -- --coverage --coverageReporters=text-lcov | ./node_modules/.bin/coveralls
else
  echo -e "${RED}---------------------------------"
  echo "------------  ERROR  ------------"
  echo "---------------------------------"
  echo ""
  echo "Can only update coverage on CI"
  echo ""
  echo -e "---------------------------------${NC}"
  exit 1
fi