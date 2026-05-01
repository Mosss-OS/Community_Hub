#!/usr/bin/env expect -f

spawn sudo -u postgres createuser -s chubuser
expect "Password:"
send "$argv"
expect eof

spawn sudo -u postgres psql -c "ALTER USER chubuser WITH PASSWORD 'chubpass123';"
expect "Password:"
send "$argv"
expect eof

spawn sudo -u postgres createdb community_hub -O chubuser
expect "Password:"
send "$argv"
expect eof