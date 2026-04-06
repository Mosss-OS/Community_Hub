#!/bin/bash
export NODE_TLS_REJECT_UNAUTHORIZED=0
export NODE_ENV=development
cd /home/moses/Desktop/Community_Hub
node --import tsx server/index.ts > /tmp/server.log 2>&1